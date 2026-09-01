BEGIN;

CREATE TYPE public.instruction_list_style AS ENUM (
    'numbered',
    'dashes',
    'bullets',
    'checks',
    'odontosync'
);

CREATE TABLE public.instruction_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    specialty public.appointment_specialty NOT NULL,
    introduction text,
    list_style public.instruction_list_style NOT NULL DEFAULT 'numbered',
    points text[] NOT NULL,
    created_at timestamp(0) with time zone NOT NULL DEFAULT current_timestamp,
    updated_at timestamp(0) with time zone NOT NULL DEFAULT current_timestamp,
    CONSTRAINT instruction_templates_title_check CHECK (
        char_length(title) BETWEEN 1 AND 120
        AND title = btrim(title)
    ),
    CONSTRAINT instruction_templates_introduction_check CHECK (
        introduction IS NULL
        OR (
            char_length(introduction) BETWEEN 1 AND 2000
            AND introduction = btrim(introduction)
        )
    ),
    CONSTRAINT instruction_templates_points_count_check CHECK (
        cardinality(points) BETWEEN 1 AND 20
    ),
    CONSTRAINT instruction_templates_points_content_check CHECK (
        array_position(points, NULL) IS NULL
        AND array_position(points, '') IS NULL
        AND char_length(array_to_string(points, '')) <= 20000
    )
);

CREATE INDEX instruction_templates_user_specialty_updated_idx
    ON public.instruction_templates (user_id, specialty, updated_at DESC);

REVOKE ALL ON TABLE public.instruction_templates
    FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT ON TABLE public.instruction_templates TO authenticated;
GRANT INSERT (
    user_id,
    title,
    specialty,
    introduction,
    list_style,
    points
) ON TABLE public.instruction_templates TO authenticated;
GRANT UPDATE (
    title,
    specialty,
    introduction,
    list_style,
    points,
    updated_at
) ON TABLE public.instruction_templates TO authenticated;

ALTER TABLE public.instruction_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instruction_templates FORCE ROW LEVEL SECURITY;

CREATE POLICY instruction_templates_select_own
    ON public.instruction_templates
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

CREATE POLICY instruction_templates_insert_own
    ON public.instruction_templates
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY instruction_templates_update_own
    ON public.instruction_templates
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id)
    WITH CHECK ((SELECT auth.uid()) = user_id);

NOTIFY pgrst, 'reload schema';

COMMIT;
