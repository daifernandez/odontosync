BEGIN;

ALTER TABLE "public"."appointments"
    DROP CONSTRAINT "appointments_patient_id_user_id_fkey",
    ADD CONSTRAINT "appointments_patient_id_user_id_fkey"
        FOREIGN KEY ("patient_id", "user_id")
        REFERENCES "public"."patients"("id", "user_id")
        ON DELETE CASCADE ON UPDATE CASCADE,
    DROP CONSTRAINT "appointments_rescheduled_from_id_fkey",
    ADD CONSTRAINT "appointments_rescheduled_from_id_fkey"
        FOREIGN KEY ("rescheduled_from_id")
        REFERENCES "public"."appointments"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
