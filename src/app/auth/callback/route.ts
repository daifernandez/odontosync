import { NextResponse, type NextRequest } from "next/server";

import { getAppOrigin } from "@/lib/app-url";
import { createClient } from "@/lib/supabase/server";
import { getSafeNextPath } from "@/modules/auth/domain/auth-routing";

export async function GET(request: NextRequest) {
  const appOrigin = getAppOrigin();
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeNextPath(
    request.nextUrl.searchParams.get("next"),
  );

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(nextPath, `${appOrigin}/`));
    }
  }

  return NextResponse.redirect(
    new URL("/ingresar?error=confirmacion", `${appOrigin}/`),
  );
}
