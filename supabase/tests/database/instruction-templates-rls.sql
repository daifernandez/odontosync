BEGIN;

CREATE TEMP TABLE instruction_templates_rls_test_context ON COMMIT DROP AS
SELECT
    id AS owner_id,
    gen_random_uuid() AS other_id,
    'RLS template ' || gen_random_uuid()::text AS template_title
FROM auth.users
LIMIT 1;

GRANT SELECT ON instruction_templates_rls_test_context TO authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM instruction_templates_rls_test_context) THEN
        RAISE EXCEPTION 'Instruction template verification requires one Auth user';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_class AS tables
        INNER JOIN pg_namespace AS schemas
            ON schemas.oid = tables.relnamespace
        WHERE schemas.nspname = 'public'
          AND tables.relname = 'instruction_templates'
          AND tables.relrowsecurity
          AND tables.relforcerowsecurity
    ) THEN
        RAISE EXCEPTION 'Instruction templates are not protected by forced RLS';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.instruction_templates'::regclass
          AND polname = 'instruction_templates_select_own'
          AND polcmd = 'r'
          AND polqual IS NOT NULL
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.instruction_templates'::regclass
          AND polname = 'instruction_templates_insert_own'
          AND polcmd = 'a'
          AND polwithcheck IS NOT NULL
    ) OR NOT EXISTS (
        SELECT 1 FROM pg_policy
        WHERE polrelid = 'public.instruction_templates'::regclass
          AND polname = 'instruction_templates_update_own'
          AND polcmd = 'w'
          AND polqual IS NOT NULL
          AND polwithcheck IS NOT NULL
    ) THEN
        RAISE EXCEPTION 'Instruction template ownership policies are incomplete';
    END IF;

    IF has_table_privilege('anon', 'public.instruction_templates', 'SELECT')
       OR has_table_privilege(
           'service_role',
           'public.instruction_templates',
           'SELECT'
       )
       OR NOT has_table_privilege(
           'authenticated',
           'public.instruction_templates',
           'SELECT'
       )
       OR has_table_privilege(
           'authenticated',
           'public.instruction_templates',
           'DELETE'
       )
       OR NOT has_column_privilege(
           'authenticated',
           'public.instruction_templates',
           'user_id',
           'INSERT'
       )
       OR has_column_privilege(
           'authenticated',
           'public.instruction_templates',
           'user_id',
           'UPDATE'
       ) THEN
        RAISE EXCEPTION 'Instruction template privileges are not minimal';
    END IF;
END;
$$;

-- Anonymous users stop at the grant boundary.
DO $$
BEGIN
    PERFORM set_config('request.jwt.claim.sub', '', true);
END;
$$;
SET LOCAL ROLE anon;

DO $$
BEGIN
    BEGIN
        PERFORM 1 FROM public.instruction_templates;
        RAISE EXCEPTION 'Anonymous access read instruction templates';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;

-- The authenticated owner can create and read a reusable template.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM instruction_templates_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

INSERT INTO public.instruction_templates (
    user_id,
    title,
    specialty,
    introduction,
    list_style,
    points
)
SELECT
    owner_id,
    template_title,
    'surgery',
    'Indicaciones generales',
    'numbered',
    ARRAY['Descansá durante las primeras horas.']
FROM instruction_templates_rls_test_context;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.instruction_templates
        WHERE title = (
            SELECT template_title FROM instruction_templates_rls_test_context
        )
    ) THEN
        RAISE EXCEPTION 'Owner could not read their instruction template';
    END IF;
END;
$$;

RESET ROLE;

-- Another identity cannot read, update, or insert rows for the owner.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT other_id::text FROM instruction_templates_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

DO $$
DECLARE
    updated_rows integer;
BEGIN
    IF EXISTS (SELECT 1 FROM public.instruction_templates) THEN
        RAISE EXCEPTION 'Instruction template RLS exposed another user data';
    END IF;

    UPDATE public.instruction_templates SET title = 'Intrusión';
    GET DIAGNOSTICS updated_rows = ROW_COUNT;

    IF updated_rows <> 0 THEN
        RAISE EXCEPTION 'Another user updated an owner instruction template';
    END IF;

    BEGIN
        INSERT INTO public.instruction_templates (
            user_id,
            title,
            specialty,
            list_style,
            points
        )
        SELECT
            owner_id,
            'Intrusión',
            'general',
            'bullets',
            ARRAY['No debería guardarse.']
        FROM instruction_templates_rls_test_context;
        RAISE EXCEPTION 'Another user inserted an owner instruction template';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

RESET ROLE;

-- The owner can edit content but cannot delete templates in this sprint.
DO $$
BEGIN
    PERFORM set_config(
        'request.jwt.claim.sub',
        (SELECT owner_id::text FROM instruction_templates_rls_test_context),
        true
    );
END;
$$;
SET LOCAL ROLE authenticated;

UPDATE public.instruction_templates
SET
    title = (
        SELECT template_title || ' updated'
        FROM instruction_templates_rls_test_context
    ),
    list_style = 'checks',
    updated_at = current_timestamp
WHERE title = (
    SELECT template_title FROM instruction_templates_rls_test_context
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM public.instruction_templates
        WHERE title = (
            SELECT template_title || ' updated'
            FROM instruction_templates_rls_test_context
        )
          AND list_style = 'checks'
    ) THEN
        RAISE EXCEPTION 'Owner could not update their instruction template';
    END IF;

    BEGIN
        DELETE FROM public.instruction_templates;
        RAISE EXCEPTION 'Owner deleted an instruction template without grant';
    EXCEPTION
        WHEN insufficient_privilege THEN NULL;
    END;
END;
$$;

ROLLBACK;
