const localAppOrigin = "http://localhost:3000";

export function getAppOrigin(
  configuredUrl = process.env.APP_URL,
  environment = process.env.NODE_ENV,
) {
  const value =
    configuredUrl || (environment === "production" ? undefined : localAppOrigin);

  if (!value) {
    throw new Error("Falta APP_URL para construir enlaces de autenticación.");
  }

  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error("APP_URL debe ser una URL absoluta válida.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("APP_URL debe usar el protocolo http o https.");
  }

  if (url.username || url.password) {
    throw new Error("APP_URL no puede incluir credenciales.");
  }

  return url.origin;
}

export function getAuthCallbackUrl(
  configuredUrl = process.env.APP_URL,
  environment = process.env.NODE_ENV,
) {
  return new URL(
    "/auth/callback",
    `${getAppOrigin(configuredUrl, environment)}/`,
  ).toString();
}
