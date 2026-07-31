-- Prisma-created tables must opt into Data API privileges explicitly.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
REVOKE ALL ON TABLES FROM "anon", "authenticated", "service_role";

-- Remove inherited broad defaults and restore only the MVP operations.
REVOKE ALL ON TABLE "profiles", "agenda_settings", "weekly_availability_blocks"
FROM "anon", "authenticated", "service_role";

GRANT SELECT, INSERT, UPDATE ON TABLE "profiles" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON TABLE "agenda_settings" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "weekly_availability_blocks" TO "authenticated";

-- Migration metadata is internal and must not be reachable by API roles.
REVOKE ALL ON TABLE "_prisma_migrations"
FROM "anon", "authenticated", "service_role";

-- The event trigger can call this function without exposing it as an RPC.
REVOKE ALL ON FUNCTION "public"."rls_auto_enable"()
FROM PUBLIC, "anon", "authenticated", "service_role";
