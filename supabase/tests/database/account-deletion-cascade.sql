BEGIN;

DO $$
DECLARE
    deleted_id uuid := gen_random_uuid();
    other_id uuid := gen_random_uuid();
    patient_id uuid := gen_random_uuid();
    first_appointment_id uuid := gen_random_uuid();
BEGIN
    INSERT INTO auth.users (id, raw_user_meta_data)
    VALUES (deleted_id, '{"fixture":"account_deletion"}'::jsonb),
           (other_id, '{"fixture":"account_deletion"}'::jsonb);

    INSERT INTO public.profiles (id, full_name)
    VALUES (deleted_id, 'Deletion fixture'), (other_id, 'Other fixture');
    INSERT INTO public.agenda_settings (user_id) VALUES (deleted_id);
    INSERT INTO public.weekly_availability_blocks (user_id, day_of_week, start_time, end_time)
    VALUES (deleted_id, 1, '09:00', '13:00');
    INSERT INTO public.patients (id, user_id, first_name, last_name)
    VALUES (patient_id, deleted_id, 'Test', 'Patient');
    INSERT INTO public.business_contacts (user_id, name, type)
    VALUES (deleted_id, 'Test contact', 'laboratory');
    INSERT INTO public.instruction_templates (user_id, title, specialty, points)
    VALUES (deleted_id, 'Test instructions', 'general', ARRAY['Test point']);
    PERFORM set_config('request.jwt.claim.sub', deleted_id::text, true);
    INSERT INTO public.exceptional_availability_blocks (user_id, starts_at, ends_at, category)
    VALUES (deleted_id, now() + interval '10 days', now() + interval '11 days', 'vacation');
    INSERT INTO public.appointments (
        id, user_id, patient_id, starts_at, occupied_until,
        duration_minutes, cleanup_minutes, status, specialty
    ) VALUES (
        first_appointment_id, deleted_id, patient_id,
        now() + interval '20 days', now() + interval '20 days 35 minutes',
        30, 5, 'rescheduled', 'general'
    );
    PERFORM set_config('odontosync.rescheduling_transition', 'on', true);
    INSERT INTO public.appointments (
        user_id, patient_id, starts_at, occupied_until,
        duration_minutes, cleanup_minutes, specialty, rescheduled_from_id
    ) VALUES (
        deleted_id, patient_id,
        now() + interval '21 days', now() + interval '21 days 35 minutes',
        30, 5, 'general', first_appointment_id
    );
    PERFORM set_config('odontosync.rescheduling_transition', 'off', true);

    DELETE FROM auth.users WHERE id = deleted_id;

    IF EXISTS (SELECT 1 FROM auth.users WHERE id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.profiles WHERE id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.agenda_settings WHERE user_id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.weekly_availability_blocks WHERE user_id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.patients WHERE user_id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.appointments WHERE user_id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.business_contacts WHERE user_id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.instruction_templates WHERE user_id = deleted_id)
       OR EXISTS (SELECT 1 FROM public.exceptional_availability_blocks WHERE user_id = deleted_id)
    THEN
        RAISE EXCEPTION 'Account data was not fully deleted';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = other_id)
       OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = other_id)
    THEN
        RAISE EXCEPTION 'Unrelated account was affected';
    END IF;
END;
$$;

ROLLBACK;
