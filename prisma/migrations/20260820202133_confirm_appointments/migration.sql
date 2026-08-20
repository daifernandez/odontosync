BEGIN;

DROP POLICY "appointments_update_own_pending"
ON "public"."appointments";

CREATE POLICY "appointments_update_own_pending"
    ON "public"."appointments"
    FOR UPDATE TO "authenticated"
    USING (
        (SELECT auth.uid()) = "user_id"
        AND "status" = 'pending_confirmation'
    )
    WITH CHECK (
        (SELECT auth.uid()) = "user_id"
        AND "status" IN (
            'pending_confirmation',
            'confirmed',
            'cancelled'
        )
    );

NOTIFY pgrst, 'reload schema';

COMMIT;
