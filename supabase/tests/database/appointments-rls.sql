BEGIN;

CREATE TEMP TABLE appointments_rls_test_context ON COMMIT DROP AS
SELECT
    id AS owner_id,
    gen_random_uuid() AS other_id,
    gen_random_uuid() AS active_patient_id,
    gen_random_uuid() AS inactive_patient_id,
    gen_random_uuid() AS appointment_id
FROM auth.users
LIMIT 1;

GRANT SELECT ON appointments_rls_test_context TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM appointments_rls_test_context) THEN
        RAISE EXCEPTION 'Appointment RLS verification requires one Supabase Auth user';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_class AS tables
        INNER JOIN pg_namespace AS schemas ON schemas.oid = tables.relnamespace
        WHERE schemas.nspname = 'public'
          AND tables.relname = 'appointments'
          AND tables.relrowsecurity
          AND tables.relforcerowsecurity
    ) THEN
        RAISE EXCEPTION 'Appointments is not protected by forced RLS';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.appointments'::regclass
          AND polname = 'appointments_select_own'
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.appointments'::regclass
          AND polname = 'appointments_insert_own_active_patient'
          AND polwithcheck IS NOT NULL
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.appointments'::regclass
          AND polname = 'appointments_update_own_pending'
          AND polqual IS NOT NULL
          AND polwithcheck IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Appointment ownership policies are incomplete';
    END IF;

    IF has_table_privilege('anon', 'public.appointments', 'SELECT')
       OR has_table_privilege('anon', 'public.appointments', 'INSERT')
       OR has_table_privilege('service_role', 'public.appointments', 'SELECT')
       OR has_table_privilege('service_role', 'public.appointments', 'INSERT')
       OR NOT has_table_privilege('authenticated', 'public.appointments', 'SELECT')
       OR has_table_privilege('authenticated', 'public.appointments', 'UPDATE')
       OR has_table_privilege('authenticated', 'public.appointments', 'DELETE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'user_id', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'patient_id', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'starts_at', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'occupied_until', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'duration_minutes', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'cleanup_minutes', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'specialty', 'INSERT')
       OR has_column_privilege('authenticated', 'public.appointments', 'id', 'INSERT')
       OR has_column_privilege('authenticated', 'public.appointments', 'status', 'INSERT')
       OR has_column_privilege('authenticated', 'public.appointments', 'overlap_confirmed', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'starts_at', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'occupied_until', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'duration_minutes', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'cleanup_minutes', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'specialty', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'status', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.appointments', 'user_id', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.appointments', 'patient_id', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.appointments', 'overlap_confirmed', 'UPDATE') THEN
        RAISE EXCEPTION 'Appointment table privileges do not follow least privilege';
    END IF;
END;
$$;

INSERT INTO public.patients (id, user_id, first_name, last_name, is_active)
SELECT active_patient_id, owner_id, 'Turno', 'Activo', true
FROM appointments_rls_test_context;

INSERT INTO public.patients (id, user_id, first_name, last_name, is_active)
SELECT inactive_patient_id, owner_id, 'Turno', 'Inactivo', false
FROM appointments_rls_test_context;

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
        PERFORM 1 FROM public.appointments;
        RAISE EXCEPTION 'Anonymous access reached appointments';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
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
            active_patient_id,
            '2026-08-10 12:00:00+00',
            '2026-08-10 12:35:00+00',
            30,
            5,
            'general'
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'Anonymous access inserted an appointment';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.appointments SET status = 'cancelled';
        RAISE EXCEPTION 'Anonymous access updated an appointment';
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
        (SELECT other_id::text FROM appointments_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.appointments) THEN
        RAISE EXCEPTION 'Appointment RLS exposed another user data';
    END IF;

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
            active_patient_id,
            '2026-08-10 12:00:00+00',
            '2026-08-10 12:35:00+00',
            30,
            5,
            'general'
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'Appointment RLS accepted another user owner id';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    UPDATE public.appointments
    SET status = 'cancelled';

    IF FOUND THEN
        RAISE EXCEPTION 'Appointment RLS updated another user data';
    END IF;
END;
$$;

RESET ROLE;

-- The owner can create and read a non-overlapping pending turn.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM appointments_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
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
        active_patient_id,
        '2026-08-10 12:00:00+00',
        '2026-08-10 12:35:00+00',
        30,
        5,
        'general'
    FROM appointments_rls_test_context;

    IF NOT EXISTS (
        SELECT 1
        FROM public.appointments
        WHERE patient_id = (
            SELECT active_patient_id FROM appointments_rls_test_context
        )
          AND status = 'pending_confirmation'
          AND NOT overlap_confirmed
    ) THEN
        RAISE EXCEPTION 'The owner could not create and read their appointment';
    END IF;

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
            inactive_patient_id,
            '2026-08-11 12:00:00+00',
            '2026-08-11 12:35:00+00',
            30,
            5,
            'general'
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'An inactive patient received an appointment';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
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
            active_patient_id,
            '2026-08-10 12:20:00+00',
            '2026-08-10 12:55:00+00',
            30,
            5,
            'orthodontics'
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'An unconfirmed overlap was accepted';
    EXCEPTION
        WHEN exclusion_violation THEN NULL;
    END;

    BEGIN
        INSERT INTO public.appointments (
            user_id,
            patient_id,
            starts_at,
            occupied_until,
            duration_minutes,
            cleanup_minutes,
            specialty,
            overlap_confirmed
        )
        SELECT
            owner_id,
            active_patient_id,
            '2026-08-10 12:20:00+00',
            '2026-08-10 12:55:00+00',
            30,
            5,
            'orthodontics',
            true
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'The overlap confirmation flag was client-writable';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    UPDATE public.appointments
    SET starts_at = '2026-08-10 13:00:00+00',
        occupied_until = '2026-08-10 13:50:00+00',
        duration_minutes = 40,
        cleanup_minutes = 10,
        specialty = 'implantology'
    WHERE patient_id = (
        SELECT active_patient_id FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE starts_at = '2026-08-10 13:00:00+00'
          AND occupied_until = '2026-08-10 13:50:00+00'
          AND specialty = 'implantology'
    ) THEN
        RAISE EXCEPTION 'The owner could not reprogram their appointment';
    END IF;

    BEGIN
        UPDATE public.appointments SET status = 'confirmed';
        RAISE EXCEPTION 'The owner promoted an appointment to confirmed';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    UPDATE public.appointments
    SET status = 'cancelled'
    WHERE patient_id = (
        SELECT active_patient_id FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE status = 'cancelled'
    ) THEN
        RAISE EXCEPTION 'The owner could not cancel their appointment';
    END IF;

    UPDATE public.appointments
    SET status = 'pending_confirmation'
    WHERE status = 'cancelled';

    IF FOUND THEN
        RAISE EXCEPTION 'A cancelled appointment was modified';
    END IF;

    BEGIN
        DELETE FROM public.appointments;
        RAISE EXCEPTION 'Appointment deletion should not be available';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;
ROLLBACK;
