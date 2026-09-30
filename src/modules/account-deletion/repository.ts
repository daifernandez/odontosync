import { createClient } from "@supabase/supabase-js";

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error("Account deletion is not configured");
  }

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function removeAccountAvatars(userId: string) {
  const avatars = adminClient().storage.from("profile-avatars");
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await avatars.list(userId, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error || !data) throw new Error("Could not list account avatars");
    paths.push(...data.map(({ name }) => `${userId}/${name}`));
    if (data.length < 100) break;
    offset += 100;
  }

  for (let index = 0; index < paths.length; index += 100) {
    const { error } = await avatars.remove(paths.slice(index, index + 100));
    if (error) throw new Error("Could not remove account avatars");
  }
}

export async function deleteAuthUser(userId: string) {
  const { error } = await adminClient().auth.admin.deleteUser(userId);
  if (error) throw new Error("Could not delete Auth user");
}
