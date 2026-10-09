/**
 * Return `value` if it is a safe in-app path to redirect to after sign-in, otherwise "/".
 *
 * Only absolute paths on this site are accepted. Protocol-relative ("//host") and
 * backslash variants are rejected so the login page cannot be used as an open redirect.
 */
export function safeCallbackUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "/";
  }
  return value;
}
