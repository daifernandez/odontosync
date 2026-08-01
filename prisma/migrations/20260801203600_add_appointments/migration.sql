BEGIN;

-- Define the fixed administrative catalogs agreed for the MVP.
CREATE TYPE "public"."appointment_status" AS ENUM (
    'pending_confirmation',
    'confirmed',
    'completed',
    'cancelled',
    'no_show',
    'rescheduled'
);

CREATE TYPE "public"."appointment_specialty" AS ENUM (
    'general',
    'pediatric_dentistry',
    'orthodontics',
    'surgery',
    'implantology',
    'endodontics',
    'periodontics',
    'restorative',
    'prosthodontics'
);

-- The composite key guarantees that a turn can only reference a patient
-- belonging to the same user.
ALTER TABLE "public"."patients"
ADD CONSTRAINT "patients_id_user_id_key" UNIQUE ("id", "user_id");

CREATE TABLE "public"."appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ(0) NOT NULL,
    "occupied_until" TIMESTAMPTZ(0) NOT NULL,
    "duration_minutes" SMALLINT NOT NULL,
    "cleanup_minutes" SMALLINT NOT NULL,
    "status" "public"."appointment_status" NOT NULL DEFAULT 'pending_confirmation',
    "specialty" "public"."appointment_specialty" NOT NULL,
    "overlap_confirmed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "appointments_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "appointments_patient_id_user_id_fkey"
        FOREIGN KEY ("patient_id", "user_id")
        REFERENCES "public"."patients"("id", "user_id")
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "appointments_duration_within_day"
        CHECK ("duration_minutes" BETWEEN 1 AND 1440),
    CONSTRAINT "appointments_cleanup_within_day"
        CHECK ("cleanup_minutes" BETWEEN 0 AND 1440),
    CONSTRAINT "appointments_occupied_until_consistent" CHECK (
        "occupied_until" = "starts_at"
            + (("duration_minutes" + "cleanup_minutes") * INTERVAL '1 minute')
    )
);

CREATE INDEX "appointments_user_id_starts_at_idx"
ON "public"."appointments"("user_id", "starts_at");

CREATE INDEX "appointments_patient_id_starts_at_idx"
ON "public"."appointments"("patient_id", "starts_at");

-- Pending and confirmed turns block the complete occupied interval. The
-- internal flag remains unavailable to API users until explicit confirmation
-- of overlaps is implemented.
ALTER TABLE "public"."appointments"
ADD CONSTRAINT "appointments_no_unconfirmed_overlap"
EXCLUDE USING gist (
    "user_id" WITH =,
    tstzrange("starts_at", "occupied_until", '[)') WITH &&
)
WHERE (
    "status" IN ('pending_confirmation', 'confirmed')
    AND NOT "overlap_confirmed"
);

-- Opt into only the Data API operations required by this increment.
REVOKE ALL ON TABLE "public"."appointments"
FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT ON TABLE "public"."appointments" TO "authenticated";
GRANT INSERT (
    "user_id",
    "patient_id",
    "starts_at",
    "occupied_until",
    "duration_minutes",
    "cleanup_minutes",
    "specialty"
) ON TABLE "public"."appointments" TO "authenticated";

ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."appointments" FORCE ROW LEVEL SECURITY;

CREATE POLICY "appointments_select_own" ON "public"."appointments"
    FOR SELECT TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "appointments_insert_own_active_patient"
    ON "public"."appointments"
    FOR INSERT TO "authenticated"
    WITH CHECK (
        (SELECT auth.uid()) = "user_id"
        AND EXISTS (
            SELECT 1
            FROM "public"."patients" AS "patient"
            WHERE "patient"."id" = "appointments"."patient_id"
              AND "patient"."user_id" = "appointments"."user_id"
              AND "patient"."is_active"
        )
    );

NOTIFY pgrst, 'reload schema';

COMMIT;
