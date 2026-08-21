BEGIN;

CREATE FUNCTION "private"."enforce_appointment_status_transition"()
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
       AND NEW."status" IN ('completed', 'no_show')
       AND OLD."occupied_until" <= CURRENT_TIMESTAMP THEN
        RETURN NEW;
    END IF;

    RAISE EXCEPTION 'Invalid appointment status transition'
        USING ERRCODE = '23514';
END;
$$;

REVOKE ALL ON FUNCTION
    "private"."enforce_appointment_status_transition"()
FROM PUBLIC, "anon", "authenticated", "service_role";

CREATE TRIGGER "appointments_enforce_status_transition"
    BEFORE UPDATE ON "public"."appointments"
    FOR EACH ROW
    EXECUTE FUNCTION "private"."enforce_appointment_status_transition"();

DROP POLICY "appointments_update_own_pending"
ON "public"."appointments";

CREATE POLICY "appointments_update_own_manageable"
    ON "public"."appointments"
    FOR UPDATE TO "authenticated"
    USING (
        (SELECT auth.uid()) = "user_id"
        AND (
            "status" = 'pending_confirmation'
            OR (
                "status" = 'confirmed'
                AND "occupied_until" <= CURRENT_TIMESTAMP
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
            'no_show'
        )
    );

NOTIFY pgrst, 'reload schema';

COMMIT;
