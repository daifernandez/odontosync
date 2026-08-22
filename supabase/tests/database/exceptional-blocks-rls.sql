BEGIN;

CREATE TEMP TABLE exceptional_blocks_rls_test_context ON COMMIT DROP AS
SELECT
    id AS owner_id,
    gen_random_uuid() AS other_id,
    gen_random_uuid() AS patient_id,
    gen_random_uuid() AS appointment_id,
    gen_random_uuid() AS reschedule_id
FROM auth.users
LIMIT 1;

GRANT SELECT ON exceptional_blocks_rls_test_context TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM exceptional_blocks_rls_test_context) THEN
        RAISE EXCEPTION 'Exceptional block verification requires one Auth user';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_class AS tables
        INNER JOIN pg_namespace AS schemas
            ON schemas.oid = tables.relnamespace
        WHERE schemas.nspname = 'public'
          AND tables.relname = 'exceptional_availability_blocks'
          AND tables.relrowsecurity
          AND tables.relforcerowsecurity
    ) THEN
        RAISE EXCEPTION 'Exceptional blocks are not protected by forced RLS';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.exceptional_availability_blocks'::regclass
          AND polname = 'exceptional_availability_blocks_select_own'
          AND polcmd = 'r'
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.exceptional_availability_blocks'::regclass
          AND polname = 'exceptional_availability_blocks_insert_own'
          AND polcmd = 'a'
          AND polwithcheck IS NOT NULL
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.exceptional_availability_blocks'::regclass
          AND polname = 'exceptional_availability_blocks_delete_own'
          AND polcmd = 'd'
          AND polqual IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Exceptional block ownership policies are incomplete';
    END IF;

    IF has_table_privilege(
           'anon',
           'public.exceptional_availability_blocks',
           'SELECT'
       )
       OR has_table_privilege(
           'service_role',
           'public.exceptional_availability_blocks',
           'SELECT'
       )
       OR NOT has_table_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'SELECT'
       )
       OR NOT has_table_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'DELETE'
       )
       OR has_table_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'UPDATE'
       )
       OR NOT has_column_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'user_id',
           'INSERT'
       )
       OR NOT has_column_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'starts_at',
           'INSERT'
       )
       OR NOT has_column_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'ends_at',
           'INSERT'
       )
       OR NOT has_column_privilege(
           'authenticated',
           'public.exceptional_availability_blocks',
           'category',
           'INSERT'
       ) THEN
        RAISE EXCEPTION 'Exceptional block privileges are not minimal';
    END IF;

    IF has_function_privilege(
        'authenticated',
        'private.enforce_exceptional_availability_block()',
        'EXECUTE'
    ) OR has_function_privilege(
        'anon',
        'private.enforce_exceptional_availability_block()',
        'EXECUTE'
    ) THEN
        RAISE EXCEPTION 'Exceptional block trigger function is callable';
    END IF;
END;
$$;

INSERT INTO public.patients (
    id,
    user_id,
    first_name,
    last_name
)
SELECT
    patient_id,
    owner_id,
    'Paciente',
    'Bloqueos'
FROM exceptional_blocks_rls_test_context;

INSERT INTO public.appointments (
    id,
    user_id,
    patient_id,
    starts_at,
    occupied_until,
    duration_minutes,
    cleanup_minutes,
    specialty,
    status
)
SELECT
    reschedule_id,
    owner_id,
    patient_id,
    '2199-11-10 12:00:00+00',
    '2199-11-10 12:35:00+00',
    30,
    5,
    'general',
    'confirmed'
FROM exceptional_blocks_rls_test_context;

INSERT INTO public.appointments (
    id,
    user_id,
    patient_id,
    starts_at,
    occupied_until,
    duration_minutes,
    cleanup_minutes,
    specialty
)
SELECT
    appointment_id,
    owner_id,
    patient_id,
    '2199-10-10 12:00:00+00',
    '2199-10-10 12:35:00+00',
    30,
    5,
    'general'
FROM exceptional_blocks_rls_test_context;

-- Anonymous and service roles stop at the grant boundary.
DO $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;
SET LOCAL ROLE anon;

DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM public.exceptional_availability_blocks;
        RAISE EXCEPTION 'Anonymous access read exceptional blocks';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        INSERT INTO public.exceptional_availability_blocks (
            user_id,
            starts_at,
            ends_at,
            category
        )
        SELECT
            owner_id,
            '2199-09-10 12:00:00+00',
            '2199-09-10 14:00:00+00',
            'vacation'
        FROM exceptional_blocks_rls_test_context;
        RAISE EXCEPTION 'Anonymous access inserted an exceptional block';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        DELETE FROM public.exceptional_availability_blocks;
        RAISE EXCEPTION 'Anonymous access deleted exceptional blocks';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;
SET LOCAL ROLE service_role;

DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM public.exceptional_availability_blocks;
        RAISE EXCEPTION 'Service role read exceptional blocks';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;

DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM exceptional_blocks_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

INSERT INTO public.exceptional_availability_blocks (
    user_id,
    starts_at,
    ends_at,
    category
)
SELECT
    owner_id,
    '2199-09-10 12:00:00+00',
    '2199-09-10 14:00:00+00',
    'vacation'
FROM exceptional_blocks_rls_test_context;

RESET ROLE;

-- Another identity cannot use the owner's identifier or rows.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT other_id::text FROM exceptional_blocks_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
    deleted_rows integer;
BEGIN
    IF EXISTS (SELECT 1 FROM public.exceptional_availability_blocks) THEN
        RAISE EXCEPTION 'Exceptional block RLS exposed another user data';
    END IF;

    BEGIN
        INSERT INTO public.exceptional_availability_blocks (
            user_id,
            starts_at,
            ends_at,
            category
        )
        SELECT
            owner_id,
            '2199-09-10 12:00:00+00',
            '2199-09-10 14:00:00+00',
            'vacation'
        FROM exceptional_blocks_rls_test_context;
        RAISE EXCEPTION 'Another user inserted an owner exceptional block';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    DELETE FROM public.exceptional_availability_blocks;
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;

    IF deleted_rows <> 0 THEN
        RAISE EXCEPTION 'Another user deleted an owner exceptional block';
    END IF;
END;
$$;

RESET ROLE;

-- The owner can create non-overlapping future or ongoing blocks.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM exceptional_blocks_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

INSERT INTO public.exceptional_availability_blocks (
    user_id,
    starts_at,
    ends_at,
    category
)
SELECT
    owner_id,
    '2199-09-10 14:00:00+00',
    '2199-09-10 15:00:00+00',
    'holiday'
FROM exceptional_blocks_rls_test_context;

DO $$
BEGIN
    IF (
        SELECT count(*)
        FROM public.exceptional_availability_blocks
    ) <> 2 THEN
        RAISE EXCEPTION 'Owner could not read their exceptional blocks';
    END IF;

    BEGIN
        INSERT INTO public.exceptional_availability_blocks (
            user_id,
            starts_at,
            ends_at,
            category
        )
        SELECT
            owner_id,
            '2199-09-10 13:00:00+00',
            '2199-09-10 16:00:00+00',
            'personal'
        FROM exceptional_blocks_rls_test_context;
        RAISE EXCEPTION 'Overlapping exceptional blocks were accepted';
    EXCEPTION
        WHEN exclusion_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO public.exceptional_availability_blocks (
            user_id,
            starts_at,
            ends_at,
            category
        )
        SELECT
            owner_id,
            '2199-10-10 12:15:00+00',
            '2199-10-10 13:00:00+00',
            'other'
        FROM exceptional_blocks_rls_test_context;
        RAISE EXCEPTION 'A block overlapping an active appointment was accepted';
    EXCEPTION
        WHEN exclusion_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO public.exceptional_availability_blocks (
            user_id,
            starts_at,
            ends_at,
            category
        )
        SELECT
            owner_id,
            CURRENT_TIMESTAMP - INTERVAL '2 hours',
            CURRENT_TIMESTAMP - INTERVAL '1 hour',
            'other'
        FROM exceptional_blocks_rls_test_context;
        RAISE EXCEPTION 'A finished exceptional block was accepted';
    EXCEPTION
        WHEN check_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO public.appointments (
            user_id,
            patient_id,
            starts_at,
            occupied_until,
            duration_minutes,
            cleanup_minutes,
            specialty
        )
        SELECT
            owner_id,
            patient_id,
            '2199-09-10 12:30:00+00',
            '2199-09-10 13:05:00+00',
            30,
            5,
            'general'
        FROM exceptional_blocks_rls_test_context;
        RAISE EXCEPTION 'An appointment inside an exceptional block was accepted';
    EXCEPTION
        WHEN SQLSTATE 'P1001' THEN NULL;
    END;

    BEGIN
        UPDATE public.appointments
        SET
            starts_at = '2199-09-10 12:30:00+00',
            occupied_until = '2199-09-10 13:05:00+00'
        WHERE id = (
            SELECT appointment_id
            FROM exceptional_blocks_rls_test_context
        );
        RAISE EXCEPTION 'An appointment was moved inside an exceptional block';
    EXCEPTION
        WHEN SQLSTATE 'P1001' THEN NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM public.appointments
        WHERE id = (
            SELECT appointment_id
            FROM exceptional_blocks_rls_test_context
        )
          AND starts_at = '2199-10-10 12:00:00+00'
    ) THEN
        RAISE EXCEPTION 'A rejected update changed the original appointment';
    END IF;

    BEGIN
        PERFORM public.reschedule_appointment(
            (
                SELECT reschedule_id
                FROM exceptional_blocks_rls_test_context
            ),
            '2199-09-10 12:30:00+00',
            true
        );
        RAISE EXCEPTION 'Confirmed overlap bypassed an exceptional block';
    EXCEPTION
        WHEN SQLSTATE 'P1001' THEN NULL;
    END;

    IF NOT EXISTS (
        SELECT 1
        FROM public.appointments
        WHERE id = (
            SELECT reschedule_id
            FROM exceptional_blocks_rls_test_context
        )
          AND status = 'confirmed'
    ) THEN
        RAISE EXCEPTION 'A rejected reschedule changed the original appointment';
    END IF;
END;
$$;

INSERT INTO public.exceptional_availability_blocks (
    user_id,
    starts_at,
    ends_at,
    category
)
SELECT
    owner_id,
    CURRENT_TIMESTAMP - INTERVAL '1 hour',
    CURRENT_TIMESTAMP + INTERVAL '1 hour',
    'personal'
FROM exceptional_blocks_rls_test_context;

DELETE FROM public.exceptional_availability_blocks
WHERE starts_at = '2199-09-10 12:00:00+00';

INSERT INTO public.appointments (
    user_id,
    patient_id,
    starts_at,
    occupied_until,
    duration_minutes,
    cleanup_minutes,
    specialty
)
SELECT
    owner_id,
    patient_id,
    '2199-09-10 12:30:00+00',
    '2199-09-10 13:05:00+00',
    30,
    5,
    'general'
FROM exceptional_blocks_rls_test_context;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.appointments
        WHERE starts_at = '2199-09-10 12:30:00+00'
    ) THEN
        RAISE EXCEPTION 'Deleting a block did not restore availability';
    END IF;
END;
$$;

RESET ROLE;

ROLLBACK;
