BEGIN;

CREATE TEMP TABLE appointments_rls_test_context ON COMMIT DROP AS
SELECT
    gen_random_uuid() AS owner_id,
    gen_random_uuid() AS other_id,
    gen_random_uuid() AS active_patient_id,
    gen_random_uuid() AS inactive_patient_id,
    gen_random_uuid() AS completed_appointment_id,
    gen_random_uuid() AS no_show_appointment_id,
    gen_random_uuid() AS past_pending_appointment_id,
    gen_random_uuid() AS past_pending_no_show_id,
    gen_random_uuid() AS past_pending_cancelled_id,
    gen_random_uuid() AS ongoing_confirmed_appointment_id,
    gen_random_uuid() AS reschedule_original_id,
    gen_random_uuid() AS overlap_original_id,
    gen_random_uuid() AS overlap_blocker_id;

GRANT SELECT ON appointments_rls_test_context TO authenticated;

INSERT INTO auth.users (id, raw_user_meta_data)
SELECT owner_id, '{"fixture":"appointments_rls"}'::jsonb
FROM appointments_rls_test_context;

INSERT INTO public.profiles (id, full_name)
SELECT owner_id, 'Appointment RLS fixture'
FROM appointments_rls_test_context;

DO $$
BEGIN
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
          AND polname = 'appointments_update_own_manageable'
          AND polqual IS NOT NULL
          AND polwithcheck IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Appointment ownership policies are incomplete';
    END IF;

    IF to_regprocedure(
        'private.enforce_appointment_status_transition()'
    ) IS NULL OR NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgrelid = 'public.appointments'::regclass
          AND tgname = 'appointments_enforce_status_transition'
          AND NOT tgisinternal
          AND tgenabled <> 'D'
    ) THEN
        RAISE EXCEPTION 'Appointment status transition guard is incomplete';
    END IF;

    IF to_regprocedure(
        'private.enforce_appointment_overlap()'
    ) IS NULL OR NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgrelid = 'public.appointments'::regclass
          AND tgname = 'appointments_enforce_overlap'
          AND NOT tgisinternal
          AND tgenabled <> 'D'
    ) THEN
        RAISE EXCEPTION 'Appointment overlap guard is incomplete';
    END IF;

    IF to_regprocedure(
        'public.reschedule_appointment(uuid,timestamp with time zone,boolean)'
    ) IS NULL
       OR NOT has_function_privilege(
           'authenticated',
           'public.reschedule_appointment(uuid,timestamp with time zone,boolean)',
           'EXECUTE'
       )
       OR has_function_privilege(
           'anon',
           'public.reschedule_appointment(uuid,timestamp with time zone,boolean)',
           'EXECUTE'
       ) THEN
        RAISE EXCEPTION 'Atomic rescheduling privileges are incomplete';
    END IF;

    IF has_function_privilege(
        'authenticated',
        'private.enforce_appointment_status_transition()',
        'EXECUTE'
    ) OR has_function_privilege(
        'authenticated',
        'private.enforce_appointment_overlap()',
        'EXECUTE'
    ) OR has_function_privilege(
        'anon',
        'private.enforce_appointment_status_transition()',
        'EXECUTE'
    ) THEN
        RAISE EXCEPTION 'Appointment status guard is callable by API roles';
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
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'rescheduled_from_id', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'overlap_confirmed', 'INSERT')
       OR has_column_privilege('authenticated', 'public.appointments', 'id', 'INSERT')
       OR has_column_privilege('authenticated', 'public.appointments', 'status', 'INSERT')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'starts_at', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'occupied_until', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'duration_minutes', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'cleanup_minutes', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'specialty', 'UPDATE')
       OR NOT has_column_privilege('authenticated', 'public.appointments', 'status', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.appointments', 'user_id', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.appointments', 'patient_id', 'UPDATE')
       OR has_column_privilege('authenticated', 'public.appointments', 'rescheduled_from_id', 'UPDATE')
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
    completed_appointment_id,
    owner_id,
    active_patient_id,
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    CURRENT_TIMESTAMP - INTERVAL '2 hours 25 minutes',
    30,
    5,
    'general',
    'confirmed'
FROM appointments_rls_test_context;

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
    past_pending_no_show_id,
    owner_id,
    active_patient_id,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '35 minutes',
    30,
    5,
    'general'
FROM appointments_rls_test_context;

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
    past_pending_cancelled_id,
    owner_id,
    active_patient_id,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '35 minutes',
    30,
    5,
    'general'
FROM appointments_rls_test_context;

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
    no_show_appointment_id,
    owner_id,
    active_patient_id,
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    CURRENT_TIMESTAMP - INTERVAL '1 hour 25 minutes',
    30,
    5,
    'general',
    'confirmed'
FROM appointments_rls_test_context;

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
    past_pending_appointment_id,
    owner_id,
    active_patient_id,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day' + INTERVAL '35 minutes',
    30,
    5,
    'general'
FROM appointments_rls_test_context;

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
    ongoing_confirmed_appointment_id,
    owner_id,
    active_patient_id,
    CURRENT_TIMESTAMP - INTERVAL '10 minutes',
    CURRENT_TIMESTAMP + INTERVAL '20 minutes',
    25,
    5,
    'general',
    'confirmed'
FROM appointments_rls_test_context;

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
    reschedule_original_id,
    owner_id,
    active_patient_id,
    '2099-09-10 12:00:00+00',
    '2099-09-10 12:35:00+00',
    30,
    5,
    'general'
FROM appointments_rls_test_context;

UPDATE public.appointments
SET status = 'confirmed'
WHERE id = (
    SELECT reschedule_original_id FROM appointments_rls_test_context
);

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
    overlap_original_id,
    owner_id,
    active_patient_id,
    '2099-10-10 12:00:00+00',
    '2099-10-10 12:35:00+00',
    30,
    5,
    'general'
FROM appointments_rls_test_context;

UPDATE public.appointments
SET status = 'confirmed'
WHERE id = (
    SELECT overlap_original_id FROM appointments_rls_test_context
);

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
    overlap_blocker_id,
    owner_id,
    active_patient_id,
    '2099-10-11 12:00:00+00',
    '2099-10-11 12:35:00+00',
    30,
    5,
    'orthodontics'
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

    BEGIN
        PERFORM public.reschedule_appointment(
            (SELECT reschedule_original_id FROM appointments_rls_test_context),
            '2099-09-11 12:00:00+00',
            false
        );
        RAISE EXCEPTION 'Anonymous access reprogrammed an appointment';
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

    BEGIN
        PERFORM public.reschedule_appointment(
            (SELECT reschedule_original_id FROM appointments_rls_test_context),
            '2099-09-11 12:00:00+00',
            false
        );
        RAISE EXCEPTION 'Another user reprogrammed the owner appointment';
    EXCEPTION
        WHEN no_data_found THEN NULL;
    END;
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
            CURRENT_TIMESTAMP - INTERVAL '1 hour',
            CURRENT_TIMESTAMP - INTERVAL '25 minutes',
            30,
            5,
            'general'
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'The owner created a pending appointment in the past';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.appointments
        SET status = 'confirmed'
        WHERE id = (
            SELECT past_pending_appointment_id
            FROM appointments_rls_test_context
        );

        IF FOUND THEN
            RAISE EXCEPTION 'A started pending appointment was confirmed';
        END IF;
    EXCEPTION
        WHEN check_violation OR insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.appointments
        SET starts_at = CURRENT_TIMESTAMP + INTERVAL '1 day',
            occupied_until = CURRENT_TIMESTAMP + INTERVAL '1 day 35 minutes'
        WHERE id = (
            SELECT past_pending_appointment_id
            FROM appointments_rls_test_context
        );

        IF FOUND THEN
            RAISE EXCEPTION 'A started pending appointment was rescheduled';
        END IF;
    EXCEPTION
        WHEN check_violation OR insufficient_privilege THEN NULL;
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
            rescheduled_from_id
        )
        SELECT
            owner_id,
            active_patient_id,
            '2197-08-10 12:00:00+00',
            '2197-08-10 12:35:00+00',
            30,
            5,
            'general',
            reschedule_original_id
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'The rescheduling link was client-writable';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;

    BEGIN
        UPDATE public.appointments
        SET status = 'rescheduled'
        WHERE id = (
            SELECT reschedule_original_id
            FROM appointments_rls_test_context
        );
        RAISE EXCEPTION 'A confirmed appointment was directly reprogrammed';
    EXCEPTION
        WHEN check_violation THEN NULL;
    END;

    PERFORM public.reschedule_appointment(
        (SELECT reschedule_original_id FROM appointments_rls_test_context),
        '2099-09-11 12:00:00+00',
        false
    );

    IF NOT EXISTS (
        SELECT 1
        FROM public.appointments AS successor
        INNER JOIN public.appointments AS original
            ON original.id = successor.rescheduled_from_id
        WHERE original.id = (
            SELECT reschedule_original_id
            FROM appointments_rls_test_context
        )
          AND original.status = 'rescheduled'
          AND successor.status = 'pending_confirmation'
          AND successor.starts_at = '2099-09-11 12:00:00+00'
          AND successor.patient_id = original.patient_id
          AND successor.specialty = original.specialty
          AND successor.duration_minutes = original.duration_minutes
          AND successor.cleanup_minutes = original.cleanup_minutes
    ) THEN
        RAISE EXCEPTION 'Atomic rescheduling did not preserve its trace';
    END IF;

    BEGIN
        PERFORM public.reschedule_appointment(
            (SELECT reschedule_original_id FROM appointments_rls_test_context),
            '2099-09-12 12:00:00+00',
            false
        );
        RAISE EXCEPTION 'A reprogrammed original created two successors';
    EXCEPTION
        WHEN no_data_found THEN NULL;
    END;

    IF (
        SELECT count(*)
        FROM public.appointments
        WHERE rescheduled_from_id = (
            SELECT reschedule_original_id
            FROM appointments_rls_test_context
        )
    ) <> 1 THEN
        RAISE EXCEPTION 'Repeated rescheduling changed the trace';
    END IF;

    BEGIN
        PERFORM public.reschedule_appointment(
            (SELECT overlap_original_id FROM appointments_rls_test_context),
            '2099-10-11 12:15:00+00',
            false
        );
        RAISE EXCEPTION 'An overlap was reprogrammed without confirmation';
    EXCEPTION
        WHEN exclusion_violation THEN NULL;
    END;

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT overlap_original_id FROM appointments_rls_test_context
        )
          AND status = 'confirmed'
    ) THEN
        RAISE EXCEPTION 'A failed rescheduling changed the original appointment';
    END IF;

    PERFORM public.reschedule_appointment(
        (SELECT overlap_original_id FROM appointments_rls_test_context),
        '2099-10-11 12:15:00+00',
        true
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE rescheduled_from_id = (
            SELECT overlap_original_id FROM appointments_rls_test_context
        )
          AND status = 'pending_confirmation'
          AND overlap_confirmed
    ) THEN
        RAISE EXCEPTION 'A confirmed overlap was not recorded';
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
            '2099-10-11 12:20:00+00',
            '2099-10-11 12:55:00+00',
            30,
            5,
            'general'
        FROM appointments_rls_test_context;
        RAISE EXCEPTION 'A confirmed overlap stopped blocking later writes';
    EXCEPTION
        WHEN exclusion_violation THEN NULL;
    END;

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
        '2098-08-10 12:00:00+00',
        '2098-08-10 12:35:00+00',
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
          AND starts_at = '2098-08-10 12:00:00+00'
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
            '2198-08-11 12:00:00+00',
            '2198-08-11 12:35:00+00',
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
            '2098-08-10 12:20:00+00',
            '2098-08-10 12:55:00+00',
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
            '2098-08-10 12:20:00+00',
            '2098-08-10 12:55:00+00',
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
    SET starts_at = '2098-08-10 13:00:00+00',
        occupied_until = '2098-08-10 13:50:00+00',
        duration_minutes = 40,
        cleanup_minutes = 10,
        specialty = 'implantology'
    WHERE patient_id = (
        SELECT active_patient_id FROM appointments_rls_test_context
    )
      AND starts_at = '2098-08-10 12:00:00+00';

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE starts_at = '2098-08-10 13:00:00+00'
          AND occupied_until = '2098-08-10 13:50:00+00'
          AND specialty = 'implantology'
    ) THEN
        RAISE EXCEPTION 'The owner could not reprogram their appointment';
    END IF;

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
        '2098-08-10 15:00:00+00',
        '2098-08-10 15:35:00+00',
        30,
        5,
        'general'
    FROM appointments_rls_test_context;

    UPDATE public.appointments
    SET status = 'cancelled'
    WHERE starts_at = '2098-08-10 15:00:00+00';

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE status = 'cancelled'
    ) THEN
        RAISE EXCEPTION 'The owner could not cancel their appointment';
    END IF;

    UPDATE public.appointments
    SET status = 'confirmed'
    WHERE starts_at = '2098-08-10 13:00:00+00';

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE starts_at = '2098-08-10 13:00:00+00'
          AND status = 'confirmed'
    ) THEN
        RAISE EXCEPTION 'The owner could not confirm their appointment';
    END IF;

    UPDATE public.appointments
    SET status = 'completed'
    WHERE id = (
        SELECT completed_appointment_id
        FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT completed_appointment_id
            FROM appointments_rls_test_context
        )
          AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'The owner could not complete a finished appointment';
    END IF;

    UPDATE public.appointments
    SET status = 'no_show'
    WHERE id = (
        SELECT completed_appointment_id
        FROM appointments_rls_test_context
    );

    IF FOUND THEN
        RAISE EXCEPTION 'A completed appointment changed historical status';
    END IF;

    UPDATE public.appointments
    SET status = 'no_show'
    WHERE id = (
        SELECT no_show_appointment_id
        FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT no_show_appointment_id
            FROM appointments_rls_test_context
        )
          AND status = 'no_show'
    ) THEN
        RAISE EXCEPTION 'The owner could not mark a finished appointment absent';
    END IF;

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
        '2099-08-10 16:00:00+00',
        '2099-08-10 16:35:00+00',
        30,
        5,
        'general'
    FROM appointments_rls_test_context;

    UPDATE public.appointments
    SET status = 'confirmed'
    WHERE starts_at = '2099-08-10 16:00:00+00';

    BEGIN
        UPDATE public.appointments
        SET status = 'completed'
        WHERE starts_at = '2099-08-10 16:00:00+00';

        IF FOUND THEN
            RAISE EXCEPTION 'A future appointment was completed';
        END IF;
    EXCEPTION
        WHEN check_violation OR insufficient_privilege THEN NULL;
    END;

    UPDATE public.appointments
    SET status = 'cancelled'
    WHERE starts_at = '2099-08-10 16:00:00+00';

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE starts_at = '2099-08-10 16:00:00+00'
          AND status = 'cancelled'
    ) THEN
        RAISE EXCEPTION 'The owner could not cancel a future confirmed appointment';
    END IF;

    BEGIN
        PERFORM public.reschedule_appointment(
            (
                SELECT ongoing_confirmed_appointment_id
                FROM appointments_rls_test_context
            ),
            CURRENT_TIMESTAMP + INTERVAL '1 day',
            false
        );
        RAISE EXCEPTION 'An ongoing appointment was reprogrammed';
    EXCEPTION
        WHEN no_data_found THEN NULL;
    END;

    UPDATE public.appointments
    SET status = 'cancelled'
    WHERE id = (
        SELECT ongoing_confirmed_appointment_id
        FROM appointments_rls_test_context
    );

    IF FOUND OR EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT ongoing_confirmed_appointment_id
            FROM appointments_rls_test_context
        )
          AND status <> 'confirmed'
    ) THEN
        RAISE EXCEPTION 'An ongoing confirmed appointment was cancelled';
    END IF;

    UPDATE public.appointments
    SET status = 'completed'
    WHERE id = (
        SELECT past_pending_appointment_id
        FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT past_pending_appointment_id
            FROM appointments_rls_test_context
        )
          AND status = 'completed'
    ) THEN
        RAISE EXCEPTION 'A finished pending appointment could not be completed';
    END IF;

    UPDATE public.appointments
    SET status = 'no_show'
    WHERE id = (
        SELECT past_pending_no_show_id
        FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT past_pending_no_show_id
            FROM appointments_rls_test_context
        )
          AND status = 'no_show'
    ) THEN
        RAISE EXCEPTION 'A finished pending appointment could not be marked absent';
    END IF;

    UPDATE public.appointments
    SET status = 'cancelled'
    WHERE id = (
        SELECT past_pending_cancelled_id
        FROM appointments_rls_test_context
    );

    IF NOT EXISTS (
        SELECT 1 FROM public.appointments
        WHERE id = (
            SELECT past_pending_cancelled_id
            FROM appointments_rls_test_context
        )
          AND status = 'cancelled'
    ) THEN
        RAISE EXCEPTION 'A finished pending appointment could not be cancelled';
    END IF;

    BEGIN
        UPDATE public.appointments
        SET status = 'pending_confirmation'
        WHERE status IN ('cancelled', 'confirmed', 'completed', 'no_show');

        IF FOUND THEN
            RAISE EXCEPTION 'A completed status transition was modified';
        END IF;
    EXCEPTION
        WHEN check_violation OR insufficient_privilege THEN NULL;
    END;

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
