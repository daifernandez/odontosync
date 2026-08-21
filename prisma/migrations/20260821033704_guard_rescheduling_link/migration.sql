BEGIN;

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

COMMIT;
