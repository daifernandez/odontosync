BEGIN;

-- Allow authenticated users to change only scheduling fields and status.
-- Ownership and patient assignment remain immutable through the Data API.
REVOKE UPDATE ON TABLE "public"."appointments"
FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT UPDATE (
    "starts_at",
    "occupied_until",
    "duration_minutes",
    "cleanup_minutes",
    "specialty",
    "status"
) ON TABLE "public"."appointments" TO "authenticated";

CREATE POLICY "appointments_update_own_pending"
    ON "public"."appointments"
    FOR UPDATE TO "authenticated"
    USING (
        (SELECT auth.uid()) = "user_id"
        AND "status" = 'pending_confirmation'
    )
    WITH CHECK (
        (SELECT auth.uid()) = "user_id"
        AND "status" IN ('pending_confirmation', 'cancelled')
    );

NOTIFY pgrst, 'reload schema';

COMMIT;
