export function isEmailAuthEnabled() {
  return process.env.EMAIL_AUTH_ENABLED === "true";
}
