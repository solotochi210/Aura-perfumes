function envValue(name: string) {
  let value = process.env[name]?.trim() ?? "";
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }
  return value;
}

export function configuredAdminEmail() {
  return envValue("ADMIN_EMAIL").toLowerCase();
}

export function isConfiguredAdmin(email: string | null | undefined) {
  const allowed = configuredAdminEmail();
  return Boolean(allowed && email && email.trim().toLowerCase() === allowed);
}
