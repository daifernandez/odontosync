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
  requestHeaders: Headers,
  contentSecurityPolicy: string,
) {
  return applyProtectedResponseHeaders(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
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
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", contentSecurityPolicy);

  let response = createNextResponse(requestHeaders, contentSecurityPolicy);

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = createNextResponse(
          requestHeaders,
          contentSecurityPolicy,
        );

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
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
