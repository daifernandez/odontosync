import { randomUUID } from "node:crypto";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

const avatarBucket = "profile-avatars";

type AvatarRow = { avatar_path: string | null };

export const getProfileAvatarPath = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_path")
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return (data as AvatarRow).avatar_path;
});

async function readAvatarPath(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("Could not read the profile avatar");
  }

  return (data as AvatarRow).avatar_path;
}

export async function getProfileAvatarUrl(avatarPath: string | null) {
  if (!avatarPath) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(avatarBucket)
    .createSignedUrl(avatarPath, 60 * 60);

  return error ? null : data.signedUrl;
}

export async function replaceProfileAvatar({
  extension,
  file,
  userId,
}: {
  extension: "jpg" | "png" | "webp";
  file: File;
  userId: string;
}) {
  const supabase = await createClient();
  const previousPath = await readAvatarPath(userId);
  const avatarPath = `${userId}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(avatarBucket)
    .upload(avatarPath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Could not upload the profile avatar");
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: avatarPath })
    .eq("id", userId)
    .select("avatar_path")
    .single();

  if (updateError) {
    await supabase.storage.from(avatarBucket).remove([avatarPath]);
    throw new Error("Could not save the profile avatar");
  }

  if (previousPath) {
    await supabase.storage.from(avatarBucket).remove([previousPath]);
  }
}

export async function deleteProfileAvatar(userId: string) {
  const supabase = await createClient();
  const previousPath = await readAvatarPath(userId);

  if (!previousPath) {
    return;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", userId)
    .select("avatar_path")
    .single();

  if (updateError) {
    throw new Error("Could not remove the profile avatar");
  }

  const { error: removeError } = await supabase.storage
    .from(avatarBucket)
    .remove([previousPath]);

  if (removeError) {
    await supabase
      .from("profiles")
      .update({ avatar_path: previousPath })
      .eq("id", userId);
    throw new Error("Could not remove the profile avatar");
  }
}
