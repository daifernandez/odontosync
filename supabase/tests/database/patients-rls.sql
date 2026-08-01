BEGIN;

CREATE TEMP TABLE patients_rls_test_context ON COMMIT DROP AS
SELECT
    id AS owner_id,
    gen_random_uuid() AS other_id,
    gen_random_uuid() AS seeded_patient_id,
    gen_random_uuid() AS created_patient_id
FROM auth.users
LIMIT 1;

GRANT SELECT ON patients_rls_test_context TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM patients_rls_test_context) THEN
        RAISE EXCEPTION 'Patient RLS verification requires one Supabase Auth user';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_class AS tables
        INNER JOIN pg_namespace AS schemas ON schemas.oid = tables.relnamespace
        WHERE schemas.nspname = 'public'
          AND tables.relname = 'patients'
          AND tables.relrowsecurity
          AND tables.relforcerowsecurity
    ) THEN
        RAISE EXCEPTION 'Patients is not protected by forced RLS';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.patients'::regclass
          AND polname = 'patients_select_own'
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.patients'::regclass
          AND polname = 'patients_insert_own'
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.patients'::regclass
          AND polname = 'patients_update_own'
          AND polcmd = 'w'
          AND polqual IS NOT NULL
          AND polwithcheck IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Patients ownership policies are incomplete';
    END IF;

    IF has_table_privilege('anon', 'public.patients', 'SELECT')
       OR has_table_privilege('anon', 'public.patients', 'INSERT')
       OR has_table_privilege('service_role', 'public.patients', 'SELECT')
       OR has_table_privilege('service_role', 'public.patients', 'INSERT')
       OR NOT has_table_privilege('authenticated', 'public.patients', 'SELECT')
       OR NOT has_table_privilege('authenticated', 'public.patients', 'INSERT')
       OR has_table_privilege('authenticated', 'public.patients', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.patients', 'DELETE')
       OR NOT has_column_privilege('authenticated', 'public.patients', 'first_name', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.patients', 'last_name', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.patients', 'phone', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.patients', 'email', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.patients', 'is_active', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.patients', 'id', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.patients', 'user_id', 'UPDATE') THEN
        RAISE EXCEPTION 'Patient table privileges do not follow least privilege';
    END IF;
END;
$$;

INSERT INTO public.patients (
    id,
    user_id,
    first_name,
    last_name,
    phone,
    email
)
SELECT
    seeded_patient_id,
    owner_id,
    'Paciente',
    'Semilla',
    NULL,
    'semilla@example.com'
FROM patients_rls_test_context;

-- Anonymous requests must fail at the grant boundary.
DO $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;
SET LOCAL ROLE anon;

DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM public.patients;
        RAISE EXCEPTION 'Anonymous access reached patients';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        INSERT INTO public.patients (user_id, first_name, last_name)
        SELECT owner_id, 'Ataque', 'Anónimo'
        FROM patients_rls_test_context;
        RAISE EXCEPTION 'Anonymous access inserted a patient';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.patients SET is_active = false;
        RAISE EXCEPTION 'Anonymous access updated a patient';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;

-- Another authenticated identity cannot see or create rows for the owner.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT other_id::text FROM patients_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
    changed_rows integer;
BEGIN
    IF EXISTS (
        SELECT 1
        FROM public.patients
        WHERE id = (SELECT seeded_patient_id FROM patients_rls_test_context)
    ) THEN
        RAISE EXCEPTION 'Patient RLS exposed another user data';
    END IF;

    BEGIN
        INSERT INTO public.patients (user_id, first_name, last_name)
        SELECT owner_id, 'Ataque', 'Cruzado'
        FROM patients_rls_test_context;
        RAISE EXCEPTION 'Patient RLS accepted another user owner id';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    UPDATE public.patients
    SET first_name = 'Ataque'
    WHERE id = (SELECT seeded_patient_id FROM patients_rls_test_context);

    GET DIAGNOSTICS changed_rows = ROW_COUNT;

    IF changed_rows <> 0 THEN
        RAISE EXCEPTION 'Patient RLS allowed another user to update owner data';
    END IF;
END;
$$;

RESET ROLE;

-- The owner can read, create, edit, deactivate and reactivate without deleting.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM patients_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.patients
        WHERE id = (SELECT seeded_patient_id FROM patients_rls_test_context)
    ) THEN
        RAISE EXCEPTION 'The owner cannot read their patient';
    END IF;

    INSERT INTO public.patients (
        id,
        user_id,
        first_name,
        last_name,
        phone,
        email
    )
    SELECT
        created_patient_id,
        owner_id,
        'Paciente',
        'Creado',
        '11 5555-1234',
        'creado@example.com'
    FROM patients_rls_test_context;

    IF NOT EXISTS (
        SELECT 1
        FROM public.patients
        WHERE id = (SELECT created_patient_id FROM patients_rls_test_context)
          AND phone = '11 5555-1234'
          AND email = 'creado@example.com'
    ) THEN
        RAISE EXCEPTION 'The owner could not create a complete patient';
    END IF;

    UPDATE public.patients
    SET
        first_name = 'Paciente editado',
        last_name = 'Actualizado',
        phone = NULL,
        email = 'actualizado@example.com',
        is_active = false
    WHERE id = (SELECT created_patient_id FROM patients_rls_test_context);

    IF NOT EXISTS (
        SELECT 1
        FROM public.patients
        WHERE id = (SELECT created_patient_id FROM patients_rls_test_context)
          AND first_name = 'Paciente editado'
          AND last_name = 'Actualizado'
          AND phone IS NULL
          AND email = 'actualizado@example.com'
          AND NOT is_active
    ) THEN
        RAISE EXCEPTION 'The owner could not edit and deactivate their patient';
    END IF;

    UPDATE public.patients
    SET is_active = true
    WHERE id = (SELECT created_patient_id FROM patients_rls_test_context);

    IF NOT EXISTS (
        SELECT 1
        FROM public.patients
        WHERE id = (SELECT created_patient_id FROM patients_rls_test_context)
          AND is_active
    ) THEN
        RAISE EXCEPTION 'The owner could not reactivate their patient';
    END IF;

    BEGIN
        UPDATE public.patients
        SET user_id = (SELECT other_id FROM patients_rls_test_context)
        WHERE id = (SELECT created_patient_id FROM patients_rls_test_context);
        RAISE EXCEPTION 'The patient owner column was updateable';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.patients
        SET id = gen_random_uuid()
        WHERE id = (SELECT created_patient_id FROM patients_rls_test_context);
        RAISE EXCEPTION 'The patient identifier was updateable';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        DELETE FROM public.patients;
        RAISE EXCEPTION 'Patient deletion should not be available';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        INSERT INTO public.patients (user_id, first_name, last_name, email)
        SELECT owner_id, 'Correo', 'Inválido', 'sin-arroba'
        FROM patients_rls_test_context;
        RAISE EXCEPTION 'An invalid patient email was accepted';
    EXCEPTION
        WHEN check_violation THEN NULL;
    END;
END;
$$;

RESET ROLE;
ROLLBACK;
