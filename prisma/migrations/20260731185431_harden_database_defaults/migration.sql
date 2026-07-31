-- Keep future Data API objects private until a migration grants access explicitly.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
REVOKE ALL ON FUNCTIONS FROM PUBLIC, "anon", "authenticated", "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
REVOKE ALL ON SEQUENCES FROM PUBLIC, "anon", "authenticated", "service_role";

-- API roles may use the public schema, but they must never create objects in it.
REVOKE CREATE ON SCHEMA "public"
FROM PUBLIC, "anon", "authenticated", "service_role";

-- Keep privileged trigger code unreachable outside its trigger.
REVOKE ALL ON SCHEMA "private"
FROM PUBLIC, "anon", "authenticated", "service_role";

REVOKE ALL ON FUNCTION "private"."handle_new_auth_user"()
FROM PUBLIC, "anon", "authenticated", "service_role";

-- Prisma owns this metadata. Application roles are denied even if a grant drifts later.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "_prisma_migrations" FORCE ROW LEVEL SECURITY;

CREATE POLICY "_prisma_migrations_deny_all" ON "_prisma_migrations"
    AS RESTRICTIVE
    FOR ALL
    TO PUBLIC
    USING (false)
    WITH CHECK (false);
