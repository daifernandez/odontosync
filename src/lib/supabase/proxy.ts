import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getAppOrigin } from "@/lib/app-url";
import { buildContentSecurityPolicy } from "@/lib/security/content-security-policy";
import { getAuthRedirect } from "@/modules/auth/domain/auth-routing";

import { getSupabaseConfig } from "./config";

function applyProtectedResponseHeaders(
  response: NextResponse,
  contentSecurityPolicy: string,
) {
  response.headers.set("Content-Security-Policy", contentSecurityPolicy);
  response.headers.set("Cache-Control", "private, no-store");

  return response;
}

function createNextResponse(
  request: NextRequest,
  contentSecurityPolicy: string,
) {
  return applyProtectedResponseHeaders(
    NextResponse.next({
      request,
    }),
    contentSecurityPolicy,
  );
}

function redirectWithCookies(
  response: NextResponse,
  pathname: string,
  contentSecurityPolicy: string,
) {
  const url = new URL(pathname, `${getAppOrigin()}/`);

  const redirectResponse = NextResponse.redirect(url);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  return applyProtectedResponseHeaders(
    redirectResponse,
    contentSecurityPolicy,
  );
}

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseConfig();
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const contentSecurityPolicy = buildContentSecurityPolicy({
    nonce,
    supabaseUrl: url,
    isDevelopment: process.env.NODE_ENV === "development",
  });
  request.headers.set("x-nonce", nonce);
  request.headers.set("Content-Security-Policy", contentSecurityPolicy);

  let response = createNextResponse(request, contentSecurityPolicy);

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = createNextResponse(request, contentSecurityPolicy);

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });

        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const pathname = request.nextUrl.pathname;
  const redirectPath = getAuthRedirect(pathname, Boolean(claims));

  if (redirectPath) {
    return redirectWithCookies(
      response,
      redirectPath,
      contentSecurityPolicy,
    );
  }

  return response;
}
