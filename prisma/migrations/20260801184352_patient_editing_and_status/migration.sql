-- Add a reversible status without deleting patient records.
ALTER TABLE "public"."patients"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- Support the active/inactive alphabetical lists and ownership checks.
DROP INDEX "public"."patients_user_id_last_name_first_name_idx";

CREATE INDEX "patients_user_id_is_active_last_name_first_name_idx"
ON "public"."patients"("user_id", "is_active", "last_name", "first_name");

-- Keep Data API access at column-level least privilege.
REVOKE ALL ON TABLE "public"."patients"
FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT, INSERT ON TABLE "public"."patients" TO "authenticated";
GRANT UPDATE ("first_name", "last_name", "phone", "email", "is_active")
ON TABLE "public"."patients" TO "authenticated";

CREATE POLICY "patients_update_own" ON "public"."patients"
    FOR UPDATE TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id")
    WITH CHECK ((SELECT auth.uid()) = "user_id");

NOTIFY pgrst, 'reload schema';
