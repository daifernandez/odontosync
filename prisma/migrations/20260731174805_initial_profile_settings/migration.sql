-- CreateEnum
CREATE TYPE "agenda_view" AS ENUM ('day', 'week', 'month');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "license_number" TEXT,
    "license_jurisdiction" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_settings" (
    "user_id" UUID NOT NULL,
    "grid_interval_minutes" SMALLINT NOT NULL DEFAULT 15,
    "default_appointment_duration_minutes" SMALLINT NOT NULL DEFAULT 30,
    "default_cleanup_minutes" SMALLINT NOT NULL DEFAULT 5,
    "last_agenda_view" "agenda_view" NOT NULL DEFAULT 'week',

    CONSTRAINT "agenda_settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "weekly_availability_blocks" (
    "user_id" UUID NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "end_time" TIME(0) NOT NULL,

    CONSTRAINT "weekly_availability_blocks_pkey" PRIMARY KEY ("user_id","day_of_week","start_time")
);

-- AddForeignKey
ALTER TABLE "agenda_settings" ADD CONSTRAINT "agenda_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_availability_blocks" ADD CONSTRAINT "weekly_availability_blocks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "agenda_settings"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Link application profiles to Supabase Auth.
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;

-- Keep configuration values inside the supported MVP domain.
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_full_name_not_blank" CHECK (btrim("full_name") <> '');
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_license_number_not_blank" CHECK ("license_number" IS NULL OR btrim("license_number") <> '');
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_license_jurisdiction_not_blank" CHECK ("license_jurisdiction" IS NULL OR btrim("license_jurisdiction") <> '');
ALTER TABLE "agenda_settings" ADD CONSTRAINT "agenda_settings_grid_interval_supported" CHECK ("grid_interval_minutes" IN (10, 15, 20, 30, 60));
ALTER TABLE "agenda_settings" ADD CONSTRAINT "agenda_settings_default_duration_positive" CHECK ("default_appointment_duration_minutes" > 0);
ALTER TABLE "agenda_settings" ADD CONSTRAINT "agenda_settings_cleanup_nonnegative" CHECK ("default_cleanup_minutes" >= 0);
ALTER TABLE "weekly_availability_blocks" ADD CONSTRAINT "weekly_availability_blocks_day_valid" CHECK ("day_of_week" BETWEEN 1 AND 7);
ALTER TABLE "weekly_availability_blocks" ADD CONSTRAINT "weekly_availability_blocks_time_ordered" CHECK ("start_time" < "end_time");

-- Expose only the operations needed by an authenticated owner.
GRANT SELECT, INSERT, UPDATE ON TABLE "profiles" TO "authenticated";
GRANT SELECT, INSERT, UPDATE ON TABLE "agenda_settings" TO "authenticated";
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE "weekly_availability_blocks" TO "authenticated";

-- Enforce ownership at the database boundary.
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "profiles" FORCE ROW LEVEL SECURITY;
ALTER TABLE "agenda_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "agenda_settings" FORCE ROW LEVEL SECURITY;
ALTER TABLE "weekly_availability_blocks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "weekly_availability_blocks" FORCE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON "profiles"
    FOR SELECT TO "authenticated"
    USING ((SELECT auth.uid()) = "id");

CREATE POLICY "profiles_insert_own" ON "profiles"
    FOR INSERT TO "authenticated"
    WITH CHECK ((SELECT auth.uid()) = "id");

CREATE POLICY "profiles_update_own" ON "profiles"
    FOR UPDATE TO "authenticated"
    USING ((SELECT auth.uid()) = "id")
    WITH CHECK ((SELECT auth.uid()) = "id");

CREATE POLICY "agenda_settings_select_own" ON "agenda_settings"
    FOR SELECT TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "agenda_settings_insert_own" ON "agenda_settings"
    FOR INSERT TO "authenticated"
    WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "agenda_settings_update_own" ON "agenda_settings"
    FOR UPDATE TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id")
    WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "weekly_availability_blocks_select_own" ON "weekly_availability_blocks"
    FOR SELECT TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "weekly_availability_blocks_insert_own" ON "weekly_availability_blocks"
    FOR INSERT TO "authenticated"
    WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "weekly_availability_blocks_update_own" ON "weekly_availability_blocks"
    FOR UPDATE TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id")
    WITH CHECK ((SELECT auth.uid()) = "user_id");

CREATE POLICY "weekly_availability_blocks_delete_own" ON "weekly_availability_blocks"
    FOR DELETE TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id");

-- New verified sign-ups receive their initial profile and agenda defaults.
CREATE SCHEMA IF NOT EXISTS "private";
REVOKE ALL ON SCHEMA "private" FROM PUBLIC;

CREATE FUNCTION "private"."handle_new_auth_user"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    full_name_value text;
BEGIN
    full_name_value := NULLIF(
        btrim(COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')),
        ''
    );

    IF full_name_value IS NULL THEN
        RETURN NEW;
    END IF;

    INSERT INTO "public"."profiles" ("id", "full_name")
    VALUES (NEW.id, full_name_value)
    ON CONFLICT ("id") DO NOTHING;

    INSERT INTO "public"."agenda_settings" ("user_id")
    VALUES (NEW.id)
    ON CONFLICT ("user_id") DO NOTHING;

    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION "private"."handle_new_auth_user"() FROM PUBLIC, "anon", "authenticated";

CREATE TRIGGER "on_auth_user_created"
    AFTER INSERT ON "auth"."users"
    FOR EACH ROW EXECUTE FUNCTION "private"."handle_new_auth_user"();

-- Backfill only users whose existing metadata already contains a real name.
WITH named_users AS (
    SELECT
        "id",
        NULLIF(
            btrim(COALESCE("raw_user_meta_data" ->> 'full_name', "raw_user_meta_data" ->> 'name', '')),
            ''
        ) AS "full_name"
    FROM "auth"."users"
)
INSERT INTO "profiles" ("id", "full_name")
SELECT "id", "full_name"
FROM named_users
WHERE "full_name" IS NOT NULL
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "agenda_settings" ("user_id")
SELECT "id"
FROM "profiles"
ON CONFLICT ("user_id") DO NOTHING;
