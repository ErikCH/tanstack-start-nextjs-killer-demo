# TanStack Start — Is Kind of a Big Deal (demo)

A tiny **GitHub user lookup** built with [TanStack Start](https://tanstack.com/start) to show off three things it does that Next.js and Nuxt don't make this easy:

1. **One server function for reads and writes** — `createServerFn` fetches from the GitHub API server-side, called directly from the route loader. No `/api` route, no `use client` / `use server` directives.
2. **Typed, validated search params** — `?user=ErikCH` is parsed into a typed `{ user: string }`. The page is shareable and refresh-safe by URL alone.
3. **End-to-end type safety, on by default** — the `GithubUser` return type flows from the server function through the loader to the component. Rename a field and every call site goes red.

This is the companion app for the video **"TanStack Start Is Kind of a Big Deal"** and the accompanying blog post.

> 🎥 Video: _link in description_ · ✍️ Blog post: _link in description_

---

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 and search for a GitHub username (try `ErikCH`). Watch the URL — the `?user=` param updates and the page is fully shareable.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 (sub-second Vite startup) |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` — enforces the type-safety guarantees |
| `npm run preview` | Preview the production build |
| `npm run test` | Run tests with [Vitest](https://vitest.dev/) |

> Note: `vite build` transpiles TypeScript without type checking, so the typed search-param and navigation guarantees are enforced by `npm run typecheck`, not the build. Run it in CI.

## The interesting file

Everything that matters lives in [`src/routes/index.tsx`](src/routes/index.tsx). It's heavily commented to map each block back to the three features above.

### Feature 1 — a typed server function

```tsx
const getGithubUser = createServerFn({ method: 'GET' })
  .inputValidator((username: string) => username)
  .handler(async ({ data: username }): Promise<GithubUser> => {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    })
    if (!res.ok) {
      if (res.status === 404) throw new Error(`User "${username}" not found`)
      if (res.status === 403) throw new Error('GitHub API rate limit exceeded. Try again later.')
      throw new Error(`GitHub API error: ${res.status}`)
    }
    return (await res.json()) as GithubUser
  })
```

This runs **only** on the server, so a token (if you add one) never reaches the client.

### Feature 2 — validated, typed search params

```tsx
export const Route = createFileRoute('/')({
  validateSearch: (search): { user: string } => ({
    user: typeof search.user === 'string' ? search.user : '',
  }),
  loaderDeps: ({ search: { user } }) => ({ user }),
  loader: async ({ deps: { user } }) => {
    // reads the typed param, runs the server fn
  },
  component: Home,
})
```

`Route.useSearch()` returns `{ user: string }`, fully typed. The loader reads it and runs the server function.

### Feature 3 — end-to-end types

`navigate({ search: { user } })` is typed, and the loader's return value flows into `Route.useLoaderData()`. One connected chain: route params → search params → loader data → links → server-fn return.

## Optional: avoid GitHub rate limits

Unauthenticated GitHub API requests are rate-limited (60/hr per IP). If you hit limits, add a token. It stays on the server — uncomment the `Authorization` header in `src/routes/index.tsx`:

```tsx
Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
```

Then set `GITHUB_TOKEN` in a `.env` file (already gitignored):

```bash
GITHUB_TOKEN=your_token_here
```

## Tech stack

- [TanStack Start](https://tanstack.com/start) + [TanStack Router](https://tanstack.com/router) (file-based routing)
- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)

## Project structure

```
src/
  routes/
    __root.tsx        # root layout + devtools
    index.tsx         # the demo: server fn + typed search params
  router.tsx          # router setup
  routeTree.gen.ts    # auto-generated (gitignored)
  styles.css          # Tailwind entry
```

Scaffolded with `npx @tanstack/cli create` (React, npm, no examples).

## Built with the help of an AI agent

Parts of this were built in [Kiro](https://kiro.dev). TanStack Start is new, so models sometimes reach for an older server-function API — the end-to-end types broke the build the moment the AI guessed wrong, which made the mistake obvious immediately. When AI writes more of the code, frameworks that verify the AI's work are worth more.

## License

MIT
