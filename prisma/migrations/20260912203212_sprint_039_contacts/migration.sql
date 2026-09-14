-- Directorio privado de proveedores y laboratorios; no modifica tablas existentes.
CREATE TABLE "public"."business_contacts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contact_name" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "hours" TEXT,
    "specialty" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "business_contacts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "business_contacts_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "public"."profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "business_contacts_name_length" CHECK (char_length(btrim("name")) BETWEEN 1 AND 120),
    CONSTRAINT "business_contacts_type_valid" CHECK ("type" IN ('supplier', 'laboratory', 'both')),
    CONSTRAINT "business_contacts_contact_name_length" CHECK ("contact_name" IS NULL OR char_length(btrim("contact_name")) BETWEEN 1 AND 120),
    CONSTRAINT "business_contacts_phone_length" CHECK ("phone" IS NULL OR char_length(btrim("phone")) BETWEEN 1 AND 30),
    CONSTRAINT "business_contacts_email_valid" CHECK (
        "email" IS NULL OR (
            char_length(btrim("email")) BETWEEN 1 AND 254
            AND "email" ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
        )
    ),
    CONSTRAINT "business_contacts_address_length" CHECK ("address" IS NULL OR char_length(btrim("address")) BETWEEN 1 AND 200),
    CONSTRAINT "business_contacts_hours_length" CHECK ("hours" IS NULL OR char_length(btrim("hours")) BETWEEN 1 AND 200),
    CONSTRAINT "business_contacts_specialty_length" CHECK ("specialty" IS NULL OR char_length(btrim("specialty")) BETWEEN 1 AND 120),
    CONSTRAINT "business_contacts_notes_length" CHECK ("notes" IS NULL OR char_length(btrim("notes")) BETWEEN 1 AND 1000)
);

CREATE INDEX "business_contacts_user_id_is_active_name_idx"
    ON "public"."business_contacts"("user_id", "is_active", "name");

REVOKE ALL ON TABLE "public"."business_contacts"
    FROM PUBLIC, "anon", "authenticated", "service_role";
GRANT SELECT, INSERT ON TABLE "public"."business_contacts" TO "authenticated";
GRANT UPDATE ("name", "type", "contact_name", "phone", "email", "address", "hours", "specialty", "notes", "is_active")
    ON TABLE "public"."business_contacts" TO "authenticated";

ALTER TABLE "public"."business_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."business_contacts" FORCE ROW LEVEL SECURITY;

CREATE POLICY "business_contacts_select_own" ON "public"."business_contacts"
    FOR SELECT TO "authenticated" USING ((SELECT auth.uid()) = "user_id");
CREATE POLICY "business_contacts_insert_own" ON "public"."business_contacts"
    FOR INSERT TO "authenticated" WITH CHECK ((SELECT auth.uid()) = "user_id");
CREATE POLICY "business_contacts_update_own" ON "public"."business_contacts"
    FOR UPDATE TO "authenticated"
    USING ((SELECT auth.uid()) = "user_id")
    WITH CHECK ((SELECT auth.uid()) = "user_id");

NOTIFY pgrst, 'reload schema';
