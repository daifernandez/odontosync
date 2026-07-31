-- Prevent overlapping habitual availability for the same user and day.
CREATE EXTENSION IF NOT EXISTS "btree_gist" WITH SCHEMA "extensions";

ALTER TABLE "public"."profiles"
ADD CONSTRAINT "profiles_full_name_length"
CHECK (char_length(btrim("full_name")) BETWEEN 3 AND 120);

ALTER TABLE "public"."profiles"
ADD CONSTRAINT "profiles_license_number_length"
CHECK ("license_number" IS NULL OR char_length(btrim("license_number")) <= 50);

ALTER TABLE "public"."profiles"
ADD CONSTRAINT "profiles_license_jurisdiction_length"
CHECK (
    "license_jurisdiction" IS NULL
    OR char_length(btrim("license_jurisdiction")) <= 100
);

ALTER TABLE "public"."agenda_settings"
ADD CONSTRAINT "agenda_settings_default_duration_within_day"
CHECK ("default_appointment_duration_minutes" <= 1440);

ALTER TABLE "public"."agenda_settings"
ADD CONSTRAINT "agenda_settings_cleanup_within_day"
CHECK ("default_cleanup_minutes" <= 1440);

ALTER TABLE "public"."weekly_availability_blocks"
ADD CONSTRAINT "weekly_availability_blocks_no_overlap"
EXCLUDE USING gist (
    "user_id" WITH =,
    "day_of_week" WITH =,
    tsrange(
        DATE '2000-01-01' + "start_time",
        DATE '2000-01-01' + "end_time",
        '[)'
    ) WITH &&
);

-- Save the complete initial configuration in one short transaction.
CREATE FUNCTION "public"."save_initial_configuration"(
    "p_full_name" text,
    "p_license_number" text,
    "p_license_jurisdiction" text,
    "p_grid_interval_minutes" integer,
    "p_default_appointment_duration_minutes" integer,
    "p_default_cleanup_minutes" integer,
    "p_availability" jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    "current_user_id" uuid := (SELECT auth.uid());
BEGIN
    IF "current_user_id" IS NULL THEN
        RAISE insufficient_privilege USING MESSAGE = 'Authentication required';
    END IF;

    IF jsonb_typeof("p_availability") IS DISTINCT FROM 'array'
       OR jsonb_array_length("p_availability") = 0 THEN
        RAISE check_violation USING MESSAGE = 'At least one availability block is required';
    END IF;

    INSERT INTO "public"."profiles" (
        "id",
        "full_name",
        "license_number",
        "license_jurisdiction"
    )
    VALUES (
        "current_user_id",
        btrim("p_full_name"),
        NULLIF(btrim("p_license_number"), ''),
        NULLIF(btrim("p_license_jurisdiction"), '')
    )
    ON CONFLICT ("id") DO UPDATE
    SET
        "full_name" = EXCLUDED."full_name",
        "license_number" = EXCLUDED."license_number",
        "license_jurisdiction" = EXCLUDED."license_jurisdiction";

    INSERT INTO "public"."agenda_settings" (
        "user_id",
        "grid_interval_minutes",
        "default_appointment_duration_minutes",
        "default_cleanup_minutes"
    )
    VALUES (
        "current_user_id",
        "p_grid_interval_minutes",
        "p_default_appointment_duration_minutes",
        "p_default_cleanup_minutes"
    )
    ON CONFLICT ("user_id") DO UPDATE
    SET
        "grid_interval_minutes" = EXCLUDED."grid_interval_minutes",
        "default_appointment_duration_minutes" = EXCLUDED."default_appointment_duration_minutes",
        "default_cleanup_minutes" = EXCLUDED."default_cleanup_minutes";

    DELETE FROM "public"."weekly_availability_blocks"
    WHERE "user_id" = "current_user_id";

    INSERT INTO "public"."weekly_availability_blocks" (
        "user_id",
        "day_of_week",
        "start_time",
        "end_time"
    )
    SELECT
        "current_user_id",
        "availability"."day_of_week",
        "availability"."start_time",
        "availability"."end_time"
    FROM jsonb_to_recordset("p_availability") AS "availability" (
        "day_of_week" smallint,
        "start_time" time,
        "end_time" time
    );
END;
$$;

REVOKE ALL ON FUNCTION "public"."save_initial_configuration"(
    text,
    text,
    text,
    integer,
    integer,
    integer,
    jsonb
) FROM PUBLIC, "anon", "service_role";

GRANT EXECUTE ON FUNCTION "public"."save_initial_configuration"(
    text,
    text,
    text,
    integer,
    integer,
    integer,
    jsonb
) TO "authenticated";

NOTIFY pgrst, 'reload schema';
