BEGIN;

CREATE OR REPLACE FUNCTION "private"."enforce_appointment_status_transition"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    IF NEW."status" = OLD."status" THEN
        IF OLD."status" = 'pending_confirmation'
           AND OLD."starts_at" > CURRENT_TIMESTAMP
           AND NEW."starts_at" > CURRENT_TIMESTAMP THEN
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
       AND OLD."starts_at" > CURRENT_TIMESTAMP
       AND NEW."status" IN ('confirmed', 'cancelled') THEN
        RETURN NEW;
    END IF;

    IF OLD."status" = 'pending_confirmation'
       AND OLD."occupied_until" <= CURRENT_TIMESTAMP
       AND NEW."status" IN ('completed', 'no_show', 'cancelled') THEN
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
        (
            "status" = 'pending_confirmation'
            AND (
                "starts_at" > CURRENT_TIMESTAMP
                OR "occupied_until" <= CURRENT_TIMESTAMP
            )
        )
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
    AND (
        (
            "status" = 'pending_confirmation'
            AND "starts_at" > CURRENT_TIMESTAMP
        )
        OR "status" IN (
            'confirmed',
            'completed',
            'cancelled',
            'no_show',
            'rescheduled'
        )
    )
);

NOTIFY pgrst, 'reload schema';

COMMIT;
