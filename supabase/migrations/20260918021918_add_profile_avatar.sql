BEGIN;

ALTER TABLE public.profiles
    ADD COLUMN avatar_path text;

ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_avatar_path_check CHECK (
        avatar_path IS NULL
        OR (
            avatar_path = btrim(avatar_path)
            AND avatar_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$'
        )
    );

INSERT INTO storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
VALUES (
    'profile-avatars',
    'profile-avatars',
    false,
    2097152,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY profile_avatars_select_own
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'profile-avatars'
    AND owner_id = (SELECT auth.uid()::text)
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

CREATE POLICY profile_avatars_insert_own
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'profile-avatars'
    AND owner_id = (SELECT auth.uid()::text)
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
    AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'png', 'webp'])
);

CREATE POLICY profile_avatars_delete_own
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'profile-avatars'
    AND owner_id = (SELECT auth.uid()::text)
    AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
);

COMMIT;
