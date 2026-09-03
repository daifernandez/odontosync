BEGIN;

GRANT DELETE ON TABLE public.instruction_templates TO authenticated;

CREATE POLICY instruction_templates_delete_own
    ON public.instruction_templates
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) = user_id);

NOTIFY pgrst, 'reload schema';

COMMIT;
