const authenticationPaths = new Set(["/ingresar", "/registro"]);

export function getAuthRedirect(
  pathname: string,
  isAuthenticated: boolean,
) {
  if (!isAuthenticated && pathname.startsWith("/app")) {
    return "/ingresar";
  }

  if (isAuthenticated && authenticationPaths.has(pathname)) {
    return "/app";
  }

  return null;
}

export function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/app";
  }

  return value;
}
