// Small pure helpers used by the GitHub user lookup demo.
// Pure functions keep them trivially unit-testable.

/**
 * Normalize a username entered by the user before sending it to the API:
 * trim whitespace and strip a leading `@` if present.
 */
export function sanitizeUsername(input: string): string {
  return input.trim().replace(/^@+/, '')
}

/**
 * Format the small stats line shown under a GitHub user, e.g.
 * "12 repos · 34 followers · 5 following".
 */
export function formatStatsLine(stats: {
  public_repos: number
  followers: number
  following: number
}): string {
  return [
    `${stats.public_repos} repos`,
    `${stats.followers} followers`,
    `${stats.following} following`,
  ].join(' \u00b7 ')
}
