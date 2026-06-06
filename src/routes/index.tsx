import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { useState } from 'react'

// --- Feature 1: a typed server function --------------------------------
// This runs ONLY on the server, so a token (if you add one) never reaches
// the client. We call it straight from the route loader below: no /api
// route, no `use client` / `use server` directives. The GithubUser return
// type flows all the way to the component with zero manual wiring.
// -----------------------------------------------------------------------

interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  bio: string | null
  public_repos: number
  followers: number
  following: number
}

const getGithubUser = createServerFn({ method: 'GET' })
  .inputValidator((username: string) => username)
  .handler(async ({ data: username }): Promise<GithubUser> => {
    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          // Add a token here if you hit rate limits. It stays on the server:
          // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      },
    )

    if (!res.ok) {
      if (res.status === 404) throw new Error(`User "${username}" not found`)
      if (res.status === 403)
        throw new Error('GitHub API rate limit exceeded. Try again later.')
      throw new Error(`GitHub API error: ${res.status}`)
    }

    return (await res.json()) as GithubUser
  })

// --- Feature 2: search params are validated, typed route state ----------
// The ?user= param is parsed and typed here. `Route.useSearch()` returns
// { user: string }, fully typed. The loader reads it and runs the server
// function, so the page is shareable and refresh-safe by URL alone.
// something.com?user=ErikCH

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): { user: string } => ({
    user: typeof search.user === 'string' ? search.user : '',
  }),
  loaderDeps: ({ search: { user } }) => ({ user }),
  loader: async ({ deps: { user } }) => {
    if (!user) return { user: null as GithubUser | null, error: null }
    try {
      return { user: await getGithubUser({ data: user }), error: null }
    } catch (err) {
      return {
        user: null as GithubUser | null,
        error: err instanceof Error ? err.message : 'Something went wrong',
      }
    }
  },
  component: Home,
})


function Home() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { user: query } = Route.useSearch()
  const { user, error } = Route.useLoaderData()
  const [input, setInput] = useState(query)
  


  function lookup(e: React.FormEvent) {
    e.preventDefault()
    navigate({ search: (prev) => ({ ...prev, user: input.trim() }) })
  }

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-bold">GitHub User Lookup</h1>
      <p className="mt-2 text-gray-600">
        A TanStack Start server function plus typed search params. Try it, then
        check the URL.
      </p>

      <form onSubmit={lookup} className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. ErikCH"
          className="flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Look up
        </button>
      </form>

      {error && <p className="mt-4 text-red-600">{error}</p>}

      {user && (
        <div className="mt-6 flex gap-4 rounded-lg border border-gray-200 p-4">
          <img
            src={user.avatar_url}
            alt={user.login}
            className="h-20 w-20 rounded-full"
          />
          <div>
            <a
              href={user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold hover:underline"
            >
              {user.name ?? user.login}
            </a>
            <p className="text-gray-500">@{user.login}</p>
            {user.bio && <p className="mt-1">{user.bio}</p>}
            <div className="mt-2 flex gap-4 text-sm text-gray-600">
              <span>{user.public_repos} repos</span>
              <span>{user.followers} followers</span>
              <span>{user.following} following</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
