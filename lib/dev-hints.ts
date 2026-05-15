/** Whether to show seeded demo logins on the marketing page and auth screens. */
export function showSeedCredentialHints(): boolean {
  if (process.env.NODE_ENV !== "production") return true
  if (process.env.SHOW_TEST_CREDENTIALS === "true") return true
  if (process.env.NEXT_PUBLIC_SHOW_TEST_CREDENTIALS === "true") return true
  return false
}
