BEGIN;

CREATE TYPE "public"."exceptional_block_category" AS ENUM (
    'vacation',
    'holiday',
    'personal',
    'other'
);

CREATE TABLE "public"."exceptional_availability_blocks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(0) NOT NULL,
    "ends_at" TIMESTAMPTZ(0) NOT NULL,
    "category" "public"."exceptional_block_category" NOT NULL,

    CONSTRAINT "exceptional_availability_blocks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "exceptional_availability_blocks_user_id_fkey"
        FOREIGN KEY ("user_id")
        REFERENCES "public"."profiles"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "exceptional_availability_blocks_valid_range"
        CHECK ("ends_at" > "starts_at")
);

CREATE INDEX "exceptional_availability_blocks_user_id_starts_at_idx"
ON "public"."exceptional_availability_blocks"("user_id", "starts_at");

ALTER TABLE "public"."exceptional_availability_blocks"
ADD CONSTRAINT "exceptional_availability_blocks_no_overlap"
EXCLUDE USING gist (
    "user_id" WITH =,
    tstzrange("starts_at", "ends_at", '[)') WITH &&
);

CREATE FUNCTION "private"."enforce_exceptional_availability_block"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF NEW."user_id" IS DISTINCT FROM (SELECT auth.uid()) THEN
        RAISE EXCEPTION 'Exceptional block ownership mismatch'
            USING ERRCODE = '42501';
    END IF;

    IF NEW."ends_at" <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Exceptional block already finished'
            USING ERRCODE = '23514';
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(NEW."user_id"::text, 0)
    );

    IF EXISTS (
        SELECT 1
        FROM "public"."appointments" AS "appointment"
        WHERE "appointment"."user_id" = NEW."user_id"
          AND "appointment"."status" IN (
              'pending_confirmation',
              'confirmed'
          )
          AND tstzrange(
              "appointment"."starts_at",
              "appointment"."occupied_until",
              '[)'
          ) && tstzrange(
              NEW."starts_at",
              NEW."ends_at",
              '[)'
          )
    ) THEN
        RAISE EXCEPTION 'Exceptional block overlaps an active appointment'
            USING ERRCODE = '23P01',
                  CONSTRAINT = 'exceptional_blocks_no_active_appointments';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION
    "private"."enforce_exceptional_availability_block"()
FROM PUBLIC, "anon", "authenticated", "service_role";

CREATE TRIGGER "exceptional_availability_blocks_enforce_insert"
    BEFORE INSERT
    ON "public"."exceptional_availability_blocks"
    FOR EACH ROW
    EXECUTE FUNCTION "private"."enforce_exceptional_availability_block"();

CREATE OR REPLACE FUNCTION "private"."enforce_appointment_overlap"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'UPDATE'
       AND (
           NEW."starts_at",
           NEW."occupied_until",
           NEW."duration_minutes",
           NEW."cleanup_minutes"
       ) IS DISTINCT FROM (
           OLD."starts_at",
           OLD."occupied_until",
           OLD."duration_minutes",
           OLD."cleanup_minutes"
       ) THEN
        NEW."overlap_confirmed" := false;
    END IF;

    IF TG_OP = 'INSERT'
       AND NEW."rescheduled_from_id" IS NOT NULL
       AND current_setting(
           'odontosync.rescheduling_transition',
           true
       ) IS DISTINCT FROM 'on' THEN
        RAISE EXCEPTION 'Rescheduling link is not directly writable'
            USING ERRCODE = '42501';
    END IF;

    IF NEW."status" NOT IN ('pending_confirmation', 'confirmed') THEN
        RETURN NEW;
    END IF;

    PERFORM pg_catalog.pg_advisory_xact_lock(
        pg_catalog.hashtextextended(NEW."user_id"::text, 0)
    );

    IF EXISTS (
        SELECT 1
        FROM "public"."exceptional_availability_blocks" AS "blocked"
        WHERE "blocked"."user_id" = NEW."user_id"
          AND tstzrange(
              "blocked"."starts_at",
              "blocked"."ends_at",
              '[)'
          ) && tstzrange(
              NEW."starts_at",
              NEW."occupied_until",
              '[)'
          )
    ) THEN
        RAISE EXCEPTION 'Appointment overlaps an exceptional block'
            USING ERRCODE = 'P1001';
    END IF;

    IF NEW."overlap_confirmed" THEN
        IF TG_OP = 'INSERT'
           AND current_setting(
               'odontosync.rescheduling_overlap',
               true
           ) IS DISTINCT FROM 'on' THEN
            RAISE EXCEPTION 'Overlap confirmation is not directly writable'
                USING ERRCODE = '42501';
        END IF;

        RETURN NEW;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM "public"."appointments" AS "existing"
        WHERE "existing"."user_id" = NEW."user_id"
          AND "existing"."id" <> NEW."id"
          AND "existing"."status" IN (
              'pending_confirmation',
              'confirmed'
          )
          AND tstzrange(
              "existing"."starts_at",
              "existing"."occupied_until",
              '[)'
          ) && tstzrange(
              NEW."starts_at",
              NEW."occupied_until",
              '[)'
          )
    ) THEN
        RAISE EXCEPTION 'Appointment overlaps another active appointment'
            USING ERRCODE = '23P01',
                  CONSTRAINT = 'appointments_no_unconfirmed_overlap';
    END IF;

    RETURN NEW;
END;
$$;

REVOKE ALL ON TABLE "public"."exceptional_availability_blocks"
FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT, DELETE
ON TABLE "public"."exceptional_availability_blocks"
TO "authenticated";

GRANT INSERT (
    "user_id",
    "starts_at",
    "ends_at",
    "category"
) ON TABLE "public"."exceptional_availability_blocks"
TO "authenticated";

ALTER TABLE "public"."exceptional_availability_blocks"
ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."exceptional_availability_blocks"
FORCE ROW LEVEL SECURITY;

CREATE POLICY "exceptional_availability_blocks_select_own"
ON "public"."exceptional_availability_blocks"
FOR SELECT TO "authenticated"
USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "exceptional_availability_blocks_insert_own"
ON "public"."exceptional_availability_blocks"
FOR INSERT TO "authenticated"
WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "exceptional_availability_blocks_delete_own"
ON "public"."exceptional_availability_blocks"
FOR DELETE TO "authenticated"
USING ((SELECT auth.uid()) = "user_id");

NOTIFY pgrst, 'reload schema';

COMMIT;
