import { describe, it, expect } from 'vitest'
import { sanitizeUsername, formatUserStats } from './format'

describe('sanitizeUsername', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeUsername('  ErikCH  ')).toBe('ErikCH')
  })

  it('strips a leading @ from a handle', () => {
    expect(sanitizeUsername('@ErikCH')).toBe('ErikCH')
    expect(sanitizeUsername(' @ErikCH ')).toBe('ErikCH')
  })

  it('returns an empty string for blank input', () => {
    expect(sanitizeUsername('   ')).toBe('')
  })
})

describe('formatUserStats', () => {
  it('renders the three stats joined by a middle dot', () => {
    const line = formatUserStats({
      public_repos: 12,
      followers: 34,
      following: 5,
    })
    expect(line).toBe('12 repos \u00b7 34 followers \u00b7 5 following')
  })

  it('handles zero values', () => {
    const line = formatUserStats({
      public_repos: 0,
      followers: 0,
      following: 0,
    })
    expect(line).toContain('0 repos')
    expect(line).toContain('0 followers')
    expect(line).toContain('0 following')
  })
})
