import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

function readFullName(
  claims: Record<string, unknown>,
  fallbackEmail: string,
) {
  const metadata = claims.user_metadata;

  if (metadata && typeof metadata === "object") {
    const fullName = Reflect.get(metadata, "full_name");

    if (typeof fullName === "string" && fullName.trim()) {
      return fullName.trim();
    }
  }

  return fallbackEmail.split("@")[0] || "Cuenta OdontoSync";
}

export default async function PrivateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (!claims) {
    redirect("/ingresar");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "Cuenta individual";

  return (
    <AppShell user={{ fullName: readFullName(claims, email), email }}>
      {children}
    </AppShell>
  );
}
