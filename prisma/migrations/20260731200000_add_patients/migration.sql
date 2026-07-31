-- Create the minimal administrative patient record.
CREATE TABLE "public"."patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "patients_first_name_length" CHECK (
        char_length(btrim("first_name")) BETWEEN 1 AND 80
    ),
    CONSTRAINT "patients_last_name_length" CHECK (
        char_length(btrim("last_name")) BETWEEN 1 AND 80
    ),
    CONSTRAINT "patients_phone_valid" CHECK (
        "phone" IS NULL
        OR char_length(btrim("phone")) BETWEEN 1 AND 30
    ),
    CONSTRAINT "patients_email_valid" CHECK (
        "email" IS NULL
        OR (
            char_length(btrim("email")) BETWEEN 1 AND 254
            AND "email" ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
        )
    )
);

-- Support ownership checks and the default alphabetical listing.
CREATE INDEX "patients_user_id_last_name_first_name_idx"
ON "public"."patients"("user_id", "last_name", "first_name");

-- Opt into only the Data API operations required by this increment.
REVOKE ALL ON TABLE "public"."patients"
FROM PUBLIC, "anon", "authenticated", "service_role";

GRANT SELECT, INSERT ON TABLE "public"."patients" TO "authenticated";

-- Enforce ownership at the database boundary.
ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."patients" FORCE ROW LEVEL SECURITY;

CREATE POLICY "patients_select_own" ON "public"."patients"
    FOR SELECT TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id");

CREATE POLICY "patients_insert_own" ON "public"."patients"
    FOR INSERT TO "authenticated"
    WITH CHECK ((SELECT auth.uid()) = "user_id");

NOTIFY pgrst, 'reload schema';
