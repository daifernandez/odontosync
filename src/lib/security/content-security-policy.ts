type ContentSecurityPolicyOptions = {
  nonce: string;
  supabaseUrl: string;
  isDevelopment: boolean;
};

function toWebSocketOrigin(origin: string) {
  return origin.replace(/^http/, "ws");
}

export function buildContentSecurityPolicy({
  nonce,
  supabaseUrl,
  isDevelopment,
}: ContentSecurityPolicyOptions) {
  const supabaseOrigin = new URL(supabaseUrl).origin;
  const developmentConnections = isDevelopment
    ? " ws://localhost:* http://localhost:*"
    : "";
  const developmentScriptPolicy = isDevelopment ? " 'unsafe-eval'" : "";

  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScriptPolicy}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' blob: data:",
    "font-src 'self'",
    `connect-src 'self' ${supabaseOrigin} ${toWebSocketOrigin(supabaseOrigin)}${developmentConnections}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}
