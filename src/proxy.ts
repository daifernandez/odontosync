import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

const localDemoHostPattern = /^(?:localhost|127\.0\.0\.1)(?::\d+)?$/i;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDemoRoute = pathname === "/demo" || pathname.startsWith("/demo/");
  const requestHost = request.headers.get("host") ?? request.nextUrl.host;

  if (isDemoRoute && !localDemoHostPattern.test(requestHost)) {
    return new NextResponse(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
