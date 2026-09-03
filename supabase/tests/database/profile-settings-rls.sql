BEGIN;

CREATE TEMP TABLE rls_test_context ON COMMIT DROP AS
SELECT
    id AS owner_id,
    gen_random_uuid() AS other_id,
    gen_random_uuid() AS forged_id
FROM auth.users
LIMIT 1;

GRANT SELECT ON rls_test_context TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM rls_test_context) THEN
        RAISE EXCEPTION 'RLS verification requires one Supabase Auth user';
    END IF;
END;
$$;

-- Security invariants must remain true even when later migrations add objects.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM pg_class AS tables
        INNER JOIN pg_namespace AS schemas ON schemas.oid = tables.relnamespace
        WHERE schemas.nspname = 'public'
          AND tables.relname IN (
              '_prisma_migrations',
              'profiles',
              'agenda_settings',
              'weekly_availability_blocks'
          )
          AND (NOT tables.relrowsecurity OR NOT tables.relforcerowsecurity)
    ) THEN
        RAISE EXCEPTION 'An application table is not protected by forced RLS';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_policy
        WHERE polrelid = 'public._prisma_migrations'::regclass
          AND polname = '_prisma_migrations_deny_all'
    ) THEN
        RAISE EXCEPTION 'Prisma migration metadata lacks an explicit deny policy';
    END IF;

    IF has_schema_privilege('authenticated', 'private', 'USAGE')
       OR has_schema_privilege('anon', 'private', 'USAGE') THEN
        RAISE EXCEPTION 'The private schema is exposed to API roles';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'agenda_settings'
          AND column_name = 'last_agenda_view'
          AND udt_name = 'agenda_view'
          AND is_nullable = 'NO'
          AND column_default = '''week''::agenda_view'
    ) THEN
        RAISE EXCEPTION 'Agenda view preference schema is incomplete';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'profiles'
          AND column_name = 'show_professional_data_on_instructions'
    ) THEN
        RAISE EXCEPTION 'Print-only preference must not be persisted in profiles';
    END IF;

    IF has_function_privilege(
        'authenticated',
        'private.handle_new_auth_user()',
        'EXECUTE'
    ) OR has_function_privilege(
        'anon',
        'private.handle_new_auth_user()',
        'EXECUTE'
    ) THEN
        RAISE EXCEPTION 'The signup trigger function is callable by API roles';
    END IF;

    IF NOT has_function_privilege(
        'authenticated',
        'public.save_initial_configuration(text,text,text,text,text,text,text,text,integer,integer,integer,jsonb)',
        'EXECUTE'
    ) OR has_function_privilege(
        'anon',
        'public.save_initial_configuration(text,text,text,text,text,text,text,text,integer,integer,integer,jsonb)',
        'EXECUTE'
    ) OR has_function_privilege(
        'service_role',
        'public.save_initial_configuration(text,text,text,text,text,text,text,text,integer,integer,integer,jsonb)',
        'EXECUTE'
    ) THEN
        RAISE EXCEPTION 'Initial configuration RPC privileges are too broad or incomplete';
    END IF;

    IF has_table_privilege('anon', 'public.profiles', 'SELECT')
       OR has_table_privilege('anon', 'public.agenda_settings', 'SELECT')
       OR has_table_privilege('anon', 'public.weekly_availability_blocks', 'SELECT')
       OR has_table_privilege('service_role', 'public.profiles', 'SELECT')
       OR has_table_privilege('service_role', 'public.agenda_settings', 'SELECT')
       OR has_table_privilege('service_role', 'public.weekly_availability_blocks', 'SELECT') THEN
        RAISE EXCEPTION 'A non-application role has direct table privileges';
    END IF;

    IF NOT has_table_privilege('authenticated', 'public.profiles', 'SELECT')
       OR NOT has_table_privilege('authenticated', 'public.profiles', 'INSERT')
       OR NOT has_table_privilege('authenticated', 'public.profiles', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.profiles', 'DELETE')
       OR NOT has_table_privilege('authenticated', 'public.agenda_settings', 'SELECT')
       OR NOT has_table_privilege('authenticated', 'public.agenda_settings', 'INSERT')
       OR NOT has_table_privilege('authenticated', 'public.agenda_settings', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.agenda_settings', 'DELETE')
       OR NOT has_table_privilege('authenticated', 'public.weekly_availability_blocks', 'SELECT')
       OR NOT has_table_privilege('authenticated', 'public.weekly_availability_blocks', 'INSERT')
       OR NOT has_table_privilege('authenticated', 'public.weekly_availability_blocks', 'UPDATE')
       OR NOT has_table_privilege('authenticated', 'public.weekly_availability_blocks', 'DELETE') THEN
        RAISE EXCEPTION 'Application table privileges do not follow least privilege';
    END IF;
END;
$$;

-- Probe future-object defaults inside this transaction. These objects are rolled back.
CREATE FUNCTION public.rls_default_privilege_probe()
RETURNS boolean
LANGUAGE sql
SET search_path = ''
AS 'SELECT true';

CREATE SEQUENCE public.rls_default_sequence_probe;

DO $$
BEGIN
    IF has_function_privilege(
        'authenticated',
        'public.rls_default_privilege_probe()',
        'EXECUTE'
    ) OR has_function_privilege(
        'anon',
        'public.rls_default_privilege_probe()',
        'EXECUTE'
    ) OR has_function_privilege(
        'service_role',
        'public.rls_default_privilege_probe()',
        'EXECUTE'
    ) THEN
        RAISE EXCEPTION 'New public functions are executable by API roles by default';
    END IF;

    IF has_sequence_privilege(
        'authenticated',
        'public.rls_default_sequence_probe',
        'USAGE'
    ) OR has_sequence_privilege(
        'anon',
        'public.rls_default_sequence_probe',
        'USAGE'
    ) OR has_sequence_privilege(
        'service_role',
        'public.rls_default_sequence_probe',
        'USAGE'
    ) THEN
        RAISE EXCEPTION 'New public sequences are usable by API roles by default';
    END IF;
END;
$$;

INSERT INTO public.profiles (id, full_name)
SELECT owner_id, 'RLS verification'
FROM rls_test_context
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

INSERT INTO public.agenda_settings (user_id)
SELECT owner_id
FROM rls_test_context
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.weekly_availability_blocks (user_id, day_of_week, start_time, end_time)
SELECT owner_id, 7, TIME '23:58', TIME '23:59'
FROM rls_test_context
ON CONFLICT (user_id, day_of_week, start_time) DO UPDATE SET end_time = EXCLUDED.end_time;

-- Unauthenticated requests must fail at the grant boundary, before RLS.
DO $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;
SET LOCAL ROLE anon;

DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM public.profiles;
        RAISE EXCEPTION 'Anonymous access reached profiles';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        INSERT INTO public.profiles (id, full_name)
        VALUES (gen_random_uuid(), 'Anonymous attacker');
        RAISE EXCEPTION 'Anonymous access inserted a profile';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        PERFORM public.save_initial_configuration(
            'Anonymous attacker',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            15,
            30,
            5,
            '[{"day_of_week": 1, "start_time": "09:00", "end_time": "13:00"}]'::jsonb
        );
        RAISE EXCEPTION 'Anonymous access executed the configuration RPC';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;

-- An authenticated attacker must not see or mutate another user's rows.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT other_id::text FROM rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
    affected_rows integer;
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles)
       OR EXISTS (SELECT 1 FROM public.agenda_settings)
       OR EXISTS (SELECT 1 FROM public.weekly_availability_blocks) THEN
        RAISE EXCEPTION 'RLS exposed another user data';
    END IF;

    UPDATE public.profiles SET full_name = 'Cross-user update';
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 0 THEN
        RAISE EXCEPTION 'RLS allowed a cross-user profile update';
    END IF;

    UPDATE public.agenda_settings SET grid_interval_minutes = 10;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 0 THEN
        RAISE EXCEPTION 'RLS allowed a cross-user settings update';
    END IF;

    UPDATE public.agenda_settings SET last_agenda_view = 'month';
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 0 THEN
        RAISE EXCEPTION 'RLS allowed a cross-user agenda view update';
    END IF;

    DELETE FROM public.weekly_availability_blocks;
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    IF affected_rows <> 0 THEN
        RAISE EXCEPTION 'RLS allowed a cross-user availability deletion';
    END IF;

    BEGIN
        INSERT INTO public.profiles (id, full_name)
        SELECT forged_id, 'Forged profile' FROM rls_test_context;
        RAISE EXCEPTION 'RLS accepted a forged profile owner';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        INSERT INTO public.agenda_settings (user_id)
        SELECT forged_id FROM rls_test_context;
        RAISE EXCEPTION 'RLS accepted forged agenda settings';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        INSERT INTO public.weekly_availability_blocks (
            user_id,
            day_of_week,
            start_time,
            end_time
        )
        SELECT owner_id, 6, TIME '23:57', TIME '23:58'
        FROM rls_test_context;
        RAISE EXCEPTION 'RLS accepted availability for another user';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        PERFORM public.save_initial_configuration(
            'Forged configuration',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            15,
            30,
            5,
            '[{"day_of_week": 1, "start_time": "09:00", "end_time": "13:00"}]'::jsonb
        );
        RAISE EXCEPTION 'An unknown authenticated identity created a configuration';
    EXCEPTION
        WHEN foreign_key_violation THEN NULL;
    END;
END;
$$;

RESET ROLE;

-- The owner can perform the intended operations, but cannot escape ownership.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
BEGIN
    IF (SELECT count(*) FROM public.profiles) <> 1
       OR (SELECT count(*) FROM public.agenda_settings) <> 1
       OR NOT EXISTS (SELECT 1 FROM public.weekly_availability_blocks) THEN
        RAISE EXCEPTION 'The owner cannot read their complete configuration';
    END IF;

    PERFORM public.save_initial_configuration(
        'RLS owner RPC verification',
        'MP 1234',
        'Buenos Aires',
        'Clínica de prueba',
        'Calle 123',
        '11 4444 5555',
        'turnos@example.com',
        'Atención con turno previo',
        15,
        30,
        5,
        '[
            {"day_of_week": 1, "start_time": "09:00", "end_time": "13:00"},
            {"day_of_week": 1, "start_time": "14:00", "end_time": "18:00"}
        ]'::jsonb
    );

    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE full_name = 'RLS owner RPC verification'
          AND license_number = 'MP 1234'
          AND license_jurisdiction = 'Buenos Aires'
          AND clinic_name = 'Clínica de prueba'
          AND office_address = 'Calle 123'
          AND contact_phone = '11 4444 5555'
          AND contact_email = 'turnos@example.com'
          AND additional_information = 'Atención con turno previo'
    ) OR (SELECT count(*) FROM public.weekly_availability_blocks) <> 2 THEN
        RAISE EXCEPTION 'The owner configuration RPC did not save every section';
    END IF;

    BEGIN
        PERFORM public.save_initial_configuration(
            'This update must roll back',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            15,
            30,
            5,
            '[
                {"day_of_week": 2, "start_time": "09:00", "end_time": "13:00"},
                {"day_of_week": 2, "start_time": "12:00", "end_time": "18:00"}
            ]'::jsonb
        );
        RAISE EXCEPTION 'The RPC accepted overlapping availability';
    EXCEPTION
        WHEN exclusion_violation THEN NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE full_name = 'RLS owner RPC verification'
    ) OR (SELECT count(*) FROM public.weekly_availability_blocks) <> 2 THEN
        RAISE EXCEPTION 'A failed RPC did not roll back atomically';
    END IF;

    UPDATE public.profiles SET full_name = 'RLS owner verification';
    UPDATE public.agenda_settings
    SET grid_interval_minutes = 20,
        last_agenda_view = 'month';

    IF NOT EXISTS (
        SELECT 1
        FROM public.agenda_settings
        WHERE grid_interval_minutes = 20
          AND last_agenda_view = 'month'
    ) THEN
        RAISE EXCEPTION 'The owner cannot update their settings and agenda view';
    END IF;

    INSERT INTO public.weekly_availability_blocks (
        user_id,
        day_of_week,
        start_time,
        end_time
    )
    SELECT owner_id, 6, TIME '23:56', TIME '23:57'
    FROM rls_test_context;

    DELETE FROM public.weekly_availability_blocks
    WHERE day_of_week = 6 AND start_time = TIME '23:56';

    BEGIN
        UPDATE public.agenda_settings
        SET user_id = (SELECT other_id FROM rls_test_context);
        RAISE EXCEPTION 'The owner reassigned settings to another user';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        DELETE FROM public.profiles;
        RAISE EXCEPTION 'Profile deletion should not be available to users';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        DELETE FROM public.agenda_settings;
        RAISE EXCEPTION 'Settings deletion should not be available to users';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.agenda_settings SET grid_interval_minutes = 17;
        RAISE EXCEPTION 'Unsupported grid interval was accepted';
    EXCEPTION
        WHEN check_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO public.weekly_availability_blocks (
            user_id,
            day_of_week,
            start_time,
            end_time
        )
        SELECT owner_id, 5, TIME '12:00', TIME '11:00'
        FROM rls_test_context;
        RAISE EXCEPTION 'An invalid availability range was accepted';
    EXCEPTION
        WHEN check_violation THEN NULL;
    END;
END;
$$;

RESET ROLE;
ROLLBACK;
