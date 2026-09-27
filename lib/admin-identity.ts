export function configuredAdminEmail() {
  return process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
}

export function isConfiguredAdmin(email: string | null | undefined) {
  const allowed = configuredAdminEmail();
  return Boolean(allowed && email && email.trim().toLowerCase() === allowed);
}
