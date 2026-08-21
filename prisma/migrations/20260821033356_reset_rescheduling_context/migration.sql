BEGIN;

CREATE OR REPLACE FUNCTION "public"."reschedule_appointment"(
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

    PERFORM set_config(
        'odontosync.rescheduling_transition',
        'off',
        true
    );
    PERFORM set_config(
        'odontosync.rescheduling_overlap',
        'off',
        true
    );

    RETURN "successor_id";
END;
$$;

COMMIT;
