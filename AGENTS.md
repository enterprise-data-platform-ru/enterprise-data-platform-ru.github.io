# Enterprise Data Platform

## Project

Corporate website: https://enterprisedataplatform.ru

Stack: Next.js App Router, React, JavaScript ESM, CSS, MDX, Node.js 22+, GitHub Actions, GitHub Pages.

Use `package.json` and the lockfile as the source of truth for dependency versions.

Respond in Russian. Write code identifiers, technical comments, and commit messages in English. Website content must be in Russian.

## Architecture

- Preserve static export (`output: 'export'`).
- Use Server Components by default.
- Use Client Components only when necessary.
- No SSR, Server Actions, runtime APIs, or dynamic ISR.
- No new dependencies or frameworks without approval.
- Reuse existing components and utilities.
- Keep changes minimal and within task scope.
- Never fabricate customers, metrics, certifications, partnerships, or contact information.
- Never copy third-party proprietary content.

## Context Management

Optimize for local LLMs with a 32K context window.

- Read only files relevant to the current task.
- Use `rg`, `find`, and targeted file reads.
- Do not scan the entire repository.
- Avoid rereading unchanged files.
- Exclude `.git`, `node_modules`, `.next`, `out`, `preview`, binary files, and generated artifacts from broad searches.
- Split complex tasks into small, independently verifiable steps.
- Keep tool output and final reports concise.

## Skills

Project skills are located in `.pi/skills/`.

Select skills based on the task:

| Skill | Scope |
|---|---|
| nextjs-core | Components and architecture |
| nextjs-routing | Navigation and routes |
| nextjs-styling | CSS and UI |
| nextjs-metadata | SEO |
| nextjs-mdx | Documentation |
| nextjs-security | Security |
| nextjs-deployment | Build and deployment |
| nextjs-performance | Performance |
| nextjs-testing | Testing |

Load only relevant skills, normally one or two per task.

Project constraints override external skill recommendations. Verify compatibility before applying examples.

## Project Documentation

Read relevant documents on demand:

- `docs/ROADMAP.md` — roadmap.
- `docs/IMPLEMENTATION-PLAN.md` — implementation plan.
- `docs/IMPLEMENTATION-STATE.md` — implementation status.
- `docs/VALIDATION.md` — validation requirements.
- `docs/GITHUB-PAGES.md` — deployment constraints.
- `docs/adr/` — architecture decisions.

Update implementation status only when relevant work has been completed and verified.

## Source Layout

- `src/app/` — pages and layouts.
- `src/components/` — reusable components.
- `src/content/site.mjs` — structured content.
- `src/app/globals.css` — styles and design tokens.
- `src/lib/` — shared utilities.
- `public/` — static assets.
- `tests/` — tests.
- `scripts/` — build and validation scripts.

Inspect existing implementation before creating new files.

## Design

Preserve the existing visual identity:

- Graphite background and lime accent.
- Light content sections.
- System sans-serif and monospace accents.
- Existing CSS design tokens.
- Consistent typography, spacing, and components.
- Responsive layouts from 360px to 1440px.
- Semantic HTML and keyboard accessibility.

Documentation must share the website design system.

Do not introduce external fonts, scripts, or trackers without approval.

## Deployment

- GitHub Pages has no server runtime.
- Publish only `out/`.
- Preserve `.github/workflows/ci.yml`.
- Preserve `NEXT_PUBLIC_BASE_PATH` handling.
- Use `assetPath()` for public assets.
- Use Next Link for internal navigation.
- Preserve canonical domain and SEO metadata.
- Never expose secrets in client-side code.
- Preserve approved analytics and cookie consent behavior.

## Workflow

1. Check `git status`.
2. Identify task scope and relevant files.
3. Read relevant documentation and skills.
4. Make a short implementation plan.
5. Apply minimal changes.
6. Run relevant validation.
7. Review `git diff`.
8. Update implementation status when applicable.
9. Report results and stop.

## Validation

Run relevant checks:

```
npm test
npm run build
npm run check:export
git diff --check
git status --short
```

For UI changes, verify desktop/mobile layouts, navigation, accessibility, and visual consistency.

Never claim that an unexecuted check passed. Do not disable tests to bypass failures.

## Git

- Preserve existing user changes.
- Never use destructive Git commands.
- Do not commit or push without explicit approval.
- Do not modify DNS, Cloudflare, or repository settings without approval.
- Use Conventional Commits in English.

## Final Report

Report briefly:

- Changes implemented.
- Files modified.
- Skills used.
- Validation results.
- Remaining issues or blockers.
