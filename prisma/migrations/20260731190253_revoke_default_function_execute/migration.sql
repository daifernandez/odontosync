-- PostgreSQL grants EXECUTE on new functions to PUBLIC globally by default.
-- A schema-scoped REVOKE cannot remove that built-in global default.
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres"
REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
