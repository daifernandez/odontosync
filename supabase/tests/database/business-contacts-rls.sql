BEGIN;

CREATE TEMP TABLE business_contacts_test_context ON COMMIT DROP AS
SELECT id AS owner_id, gen_random_uuid() AS other_id, gen_random_uuid() AS contact_id
FROM auth.users LIMIT 1;
GRANT SELECT ON business_contacts_test_context TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM business_contacts_test_context) THEN
        RAISE EXCEPTION 'Business contact RLS test needs one Auth user';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_class WHERE oid = 'public.business_contacts'::regclass
          AND relrowsecurity AND relforcerowsecurity
    ) THEN RAISE EXCEPTION 'Business contacts must have forced RLS'; END IF;
    IF has_table_privilege('anon', 'public.business_contacts', 'SELECT')
       OR has_table_privilege('anon', 'public.business_contacts', 'INSERT')
       OR has_table_privilege('authenticated', 'public.business_contacts', 'DELETE')
       OR has_column_privilege('authenticated', 'public.business_contacts', 'user_id', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.business_contacts', 'id', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.business_contacts', 'is_active', 'UPDATE') THEN
        RAISE EXCEPTION 'Business contact grants are too broad or incomplete';
    END IF;
END;
$$;

INSERT INTO public.business_contacts (id, user_id, name, type)
SELECT contact_id, owner_id, 'Dental Sur', 'both' FROM business_contacts_test_context;

SET LOCAL ROLE anon;
DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM public.business_contacts;
        RAISE EXCEPTION 'Anonymous read reached contacts';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
RESET ROLE;

DO $$ BEGIN
    PERFORM set_config('request.jwt.claim.sub', (SELECT other_id::text FROM business_contacts_test_context), true);
END; $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE changed_rows integer;
BEGIN
    IF EXISTS (SELECT 1 FROM public.business_contacts) THEN
        RAISE EXCEPTION 'Other user can read contacts';
    END IF;
    UPDATE public.business_contacts SET name = 'Ataque';
    GET DIAGNOSTICS changed_rows = ROW_COUNT;
    IF changed_rows <> 0 THEN RAISE EXCEPTION 'Other user changed a contact'; END IF;
    BEGIN
        INSERT INTO public.business_contacts (user_id, name, type)
        SELECT owner_id, 'Ataque', 'supplier' FROM business_contacts_test_context;
        RAISE EXCEPTION 'Other user inserted a contact for the owner';
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;
RESET ROLE;

DO $$ BEGIN
    PERFORM set_config('request.jwt.claim.sub', (SELECT owner_id::text FROM business_contacts_test_context), true);
END; $$;
SET LOCAL ROLE authenticated;
DO $$
DECLARE changed_rows integer;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.business_contacts WHERE name = 'Dental Sur') THEN
        RAISE EXCEPTION 'Owner cannot read contact';
    END IF;
    UPDATE public.business_contacts SET is_active = false WHERE name = 'Dental Sur';
    GET DIAGNOSTICS changed_rows = ROW_COUNT;
    IF changed_rows <> 1 THEN RAISE EXCEPTION 'Owner cannot deactivate contact'; END IF;
    UPDATE public.business_contacts SET is_active = true, name = 'Dental Norte' WHERE name = 'Dental Sur';
    GET DIAGNOSTICS changed_rows = ROW_COUNT;
    IF changed_rows <> 1 THEN RAISE EXCEPTION 'Owner cannot edit and reactivate contact'; END IF;
END;
$$;
RESET ROLE;

ROLLBACK;
