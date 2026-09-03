BEGIN;

DROP FUNCTION public.save_initial_configuration(
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    boolean,
    integer,
    integer,
    integer,
    jsonb
);

ALTER TABLE public.profiles
    DROP COLUMN show_professional_data_on_instructions;

CREATE FUNCTION public.save_initial_configuration(
    p_full_name text,
    p_license_number text,
    p_license_jurisdiction text,
    p_clinic_name text,
    p_office_address text,
    p_contact_phone text,
    p_contact_email text,
    p_additional_information text,
    p_grid_interval_minutes integer,
    p_default_appointment_duration_minutes integer,
    p_default_cleanup_minutes integer,
    p_availability jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
    current_user_id uuid := (SELECT auth.uid());
BEGIN
    IF current_user_id IS NULL THEN
        RAISE insufficient_privilege USING MESSAGE = 'Authentication required';
    END IF;

    IF jsonb_typeof(p_availability) IS DISTINCT FROM 'array'
       OR jsonb_array_length(p_availability) = 0 THEN
        RAISE check_violation USING MESSAGE = 'At least one availability block is required';
    END IF;

    INSERT INTO public.profiles (
        id,
        full_name,
        license_number,
        license_jurisdiction,
        clinic_name,
        office_address,
        contact_phone,
        contact_email,
        additional_information
    )
    VALUES (
        current_user_id,
        btrim(p_full_name),
        NULLIF(btrim(p_license_number), ''),
        NULLIF(btrim(p_license_jurisdiction), ''),
        NULLIF(btrim(p_clinic_name), ''),
        NULLIF(btrim(p_office_address), ''),
        NULLIF(btrim(p_contact_phone), ''),
        NULLIF(lower(btrim(p_contact_email)), ''),
        NULLIF(btrim(p_additional_information), '')
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        license_number = EXCLUDED.license_number,
        license_jurisdiction = EXCLUDED.license_jurisdiction,
        clinic_name = EXCLUDED.clinic_name,
        office_address = EXCLUDED.office_address,
        contact_phone = EXCLUDED.contact_phone,
        contact_email = EXCLUDED.contact_email,
        additional_information = EXCLUDED.additional_information;

    INSERT INTO public.agenda_settings (
        user_id,
        grid_interval_minutes,
        default_appointment_duration_minutes,
        default_cleanup_minutes
    )
    VALUES (
        current_user_id,
        p_grid_interval_minutes,
        p_default_appointment_duration_minutes,
        p_default_cleanup_minutes
    )
    ON CONFLICT (user_id) DO UPDATE
    SET
        grid_interval_minutes = EXCLUDED.grid_interval_minutes,
        default_appointment_duration_minutes = EXCLUDED.default_appointment_duration_minutes,
        default_cleanup_minutes = EXCLUDED.default_cleanup_minutes;

    DELETE FROM public.weekly_availability_blocks
    WHERE user_id = current_user_id;

    INSERT INTO public.weekly_availability_blocks (
        user_id,
        day_of_week,
        start_time,
        end_time
    )
    SELECT
        current_user_id,
        availability.day_of_week,
        availability.start_time,
        availability.end_time
    FROM jsonb_to_recordset(p_availability) AS availability (
        day_of_week smallint,
        start_time time,
        end_time time
    );
END;
$$;

REVOKE ALL ON FUNCTION public.save_initial_configuration(
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    integer,
    integer,
    integer,
    jsonb
) FROM PUBLIC, anon, service_role;

GRANT EXECUTE ON FUNCTION public.save_initial_configuration(
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    text,
    integer,
    integer,
    integer,
    jsonb
) TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
