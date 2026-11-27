# Enterprise Data Platform

## Project

Corporate website: https://enterprisedataplatform.ru

Stack: Next.js App Router, React, JavaScript ESM, CSS, MDX, Node.js 22+, GitHub Actions, GitHub Pages.

Use `package.json` and the lockfile as the source of truth for dependency versions.

Respond in Russian. Write code identifiers, technical comments, and commit messages in English. Website content must be in Russian.

## Architecture

- Preserve static export (`output: 'export'`).
- Use Server Components by default, rendered at build time.
- Use Client Components only when necessary.
- No request-time SSR, Server Actions, runtime APIs, or ISR.
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
- `src/app/globals.css` — website styles and CSS design tokens.
- `src/lib/` — shared utilities.
- `design/` — local copies of brand guidelines and design tokens.
- `public/` — static assets.
- `tests/` — tests.
- `scripts/` — build and validation scripts.

Inspect existing implementation before creating new files.

## Brand and Design System

Follow the EDP brand standards:

- `design/BRAND.md` — brand guidelines and visual identity.
- `design/brand-tokens.json` — canonical design values in machine-readable form.
- `src/app/globals.css` — website implementation of design tokens.
- Intended upstream source: https://github.com/enterprise-data-platform-ru/edp-brand.

Read the local brand files before changing UI, CSS, typography, colors, logos, visual assets, or document styling. Do not load them for unrelated tasks.

Preserve the existing visual identity:

- Graphite background, lime accent, and light content sections.
- Approved brand colors, typography, and logo variants.
- System sans-serif and monospace accents.
- Existing CSS custom properties and reusable components.
- Consistent typography, spacing, and components.
- Responsive layouts from 360px to 1440px.
- Semantic HTML and keyboard accessibility.

Website documentation must share the website design system. Presentations and exported documents, when explicitly requested, must follow the applicable brand guidelines.

Reuse existing CSS tokens instead of hardcoding brand colors and other shared values. Preserve logo proportions and approved variants. Do not introduce new colors, fonts, visual patterns, external scripts, or trackers without approval.

Treat `design/` as a read-only brand reference unless the task explicitly authorizes a brand update. Do not automatically fetch or synchronize upstream files. If a brand file is missing or conflicts with the website implementation, report the issue; do not invent standards or silently redesign the website. Continue unrelated work if possible.

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
3. Read relevant documentation, skills, and brand references when applicable.
4. Make a short implementation plan.
5. Apply minimal changes.
6. Run relevant validation.
7. Review `git diff`.
8. Update implementation status when applicable.
9. Report results and stop.

## Validation

Run relevant checks:

```sh
npm test
npm run build
npm run check:export
git diff --check
git status --short
```

For UI changes, verify desktop/mobile layouts, navigation, accessibility, visual consistency, and compliance with the local brand standards.

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

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
