type AuthIdentity = {
  app_metadata?: unknown;
  user_metadata?: unknown;
};

export function needsAcademicUseAcceptance(identity: AuthIdentity) {
  const appMetadata = identity.app_metadata;

  if (!appMetadata || typeof appMetadata !== "object" ||
      Reflect.get(appMetadata, "provider") !== "google") {
    return false;
  }

  const userMetadata = identity.user_metadata;
  const acceptedAt = userMetadata && typeof userMetadata === "object"
    ? Reflect.get(userMetadata, "academic_use_accepted_at")
    : null;

  return typeof acceptedAt !== "string" || !acceptedAt.trim();
}
