BEGIN;

ALTER TABLE "public"."appointments"
ADD COLUMN "rescheduled_from_id" UUID,
ADD CONSTRAINT "appointments_rescheduled_from_id_key"
    UNIQUE ("rescheduled_from_id"),
ADD CONSTRAINT "appointments_rescheduled_from_id_fkey"
    FOREIGN KEY ("rescheduled_from_id")
    REFERENCES "public"."appointments"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- The successor link and the overlap decision are writable only through the
-- guarded rescheduling function below. Direct writes are rejected by trigger.
GRANT INSERT ("rescheduled_from_id", "overlap_confirmed")
ON TABLE "public"."appointments" TO "authenticated";

CREATE FUNCTION "private"."enforce_appointment_overlap"()
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

REVOKE ALL ON FUNCTION "private"."enforce_appointment_overlap"()
FROM PUBLIC, "anon", "authenticated", "service_role";

CREATE TRIGGER "appointments_enforce_overlap"
    BEFORE INSERT OR UPDATE OF
        "starts_at",
        "occupied_until",
        "duration_minutes",
        "cleanup_minutes",
        "status",
        "overlap_confirmed"
    ON "public"."appointments"
    FOR EACH ROW
    EXECUTE FUNCTION "private"."enforce_appointment_overlap"();

CREATE OR REPLACE FUNCTION "private"."enforce_appointment_status_transition"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF NEW."status" = OLD."status" THEN
        IF OLD."status" = 'pending_confirmation' THEN
            RETURN NEW;
        END IF;

        RAISE EXCEPTION 'Appointment status is immutable after confirmation'
            USING ERRCODE = '23514';
    END IF;

    IF (to_jsonb(NEW) - 'status') IS DISTINCT FROM
       (to_jsonb(OLD) - 'status') THEN
        RAISE EXCEPTION 'Appointment data cannot change with its status'
            USING ERRCODE = '23514';
    END IF;

    IF OLD."status" = 'pending_confirmation'
       AND NEW."status" IN ('confirmed', 'cancelled') THEN
        RETURN NEW;
    END IF;

    IF OLD."status" = 'confirmed'
       AND NEW."status" = 'cancelled'
       AND OLD."starts_at" > CURRENT_TIMESTAMP THEN
        RETURN NEW;
    END IF;

    IF OLD."status" = 'confirmed'
       AND NEW."status" = 'rescheduled'
       AND OLD."starts_at" > CURRENT_TIMESTAMP
       AND current_setting(
           'odontosync.rescheduling_transition',
           true
       ) = 'on' THEN
        RETURN NEW;
    END IF;

    IF OLD."status" = 'confirmed'
       AND NEW."status" IN ('completed', 'no_show')
       AND OLD."occupied_until" <= CURRENT_TIMESTAMP THEN
        RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Invalid appointment status transition'
        USING ERRCODE = '23514';
END;
$$;

ALTER POLICY "appointments_update_own_manageable"
ON "public"."appointments"
USING (
    (SELECT auth.uid()) = "user_id"
    AND (
        "status" = 'pending_confirmation'
        OR (
            "status" = 'confirmed'
            AND (
                "starts_at" > CURRENT_TIMESTAMP
                OR "occupied_until" <= CURRENT_TIMESTAMP
            )
        )
    )
)
WITH CHECK (
    (SELECT auth.uid()) = "user_id"
    AND "status" IN (
        'pending_confirmation',
        'confirmed',
        'completed',
        'cancelled',
        'no_show',
        'rescheduled'
    )
);

CREATE FUNCTION "public"."reschedule_appointment"(
    "appointment_id" UUID,
    "new_starts_at" TIMESTAMPTZ,
    "confirm_overlap" BOOLEAN DEFAULT false
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    "request_user_id" UUID := (SELECT auth.uid());
    "original" "public"."appointments"%ROWTYPE;
    "successor_id" UUID;
BEGIN
    IF "request_user_id" IS NULL THEN
        RAISE EXCEPTION 'Authentication required'
            USING ERRCODE = '42501';
    END IF;

    SELECT *
    INTO "original"
    FROM "public"."appointments"
    WHERE "id" = "appointment_id"
      AND "user_id" = "request_user_id"
    FOR UPDATE;

    IF NOT FOUND
       OR "original"."status" <> 'confirmed'
       OR "original"."starts_at" <= CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'Appointment unavailable for rescheduling'
            USING ERRCODE = 'P0002';
    END IF;

    IF "new_starts_at" IS NULL
       OR "new_starts_at" <= CURRENT_TIMESTAMP
       OR "new_starts_at" = "original"."starts_at" THEN
        RAISE EXCEPTION 'Invalid rescheduling time'
            USING ERRCODE = '23514';
    END IF;

    PERFORM set_config(
        'odontosync.rescheduling_transition',
        'on',
        true
    );
    PERFORM set_config(
        'odontosync.rescheduling_overlap',
        CASE WHEN COALESCE("confirm_overlap", false) THEN 'on' ELSE 'off' END,
        true
    );

    UPDATE "public"."appointments"
    SET "status" = 'rescheduled'
    WHERE "id" = "original"."id";

    INSERT INTO "public"."appointments" (
        "user_id",
        "patient_id",
        "starts_at",
        "occupied_until",
        "duration_minutes",
        "cleanup_minutes",
        "specialty",
        "overlap_confirmed",
        "rescheduled_from_id"
    ) VALUES (
        "original"."user_id",
        "original"."patient_id",
        "new_starts_at",
        "new_starts_at" + (
            (
                "original"."duration_minutes"
                + "original"."cleanup_minutes"
            ) * INTERVAL '1 minute'
        ),
        "original"."duration_minutes",
        "original"."cleanup_minutes",
        "original"."specialty",
        COALESCE("confirm_overlap", false),
        "original"."id"
    )
    RETURNING "id" INTO "successor_id";

    RETURN "successor_id";
END;
$$;

REVOKE ALL ON FUNCTION "public"."reschedule_appointment"(
    UUID,
    TIMESTAMPTZ,
    BOOLEAN
) FROM PUBLIC, "anon", "service_role";

GRANT EXECUTE ON FUNCTION "public"."reschedule_appointment"(
    UUID,
    TIMESTAMPTZ,
    BOOLEAN
) TO "authenticated";

NOTIFY pgrst, 'reload schema';

COMMIT;
