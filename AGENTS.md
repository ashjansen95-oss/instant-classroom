<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Instant Classroom

A teacher has 30 seconds to 10 minutes to fill and no idea what to do. The entire product is
one interaction: **open → shake → get something good → run it.** The value proposition is
*"I don't have to think of something."*

## Rules that matter

1. **Speed beats everything.** The activity is resolved synchronously from data already in the
   bundle. Animations are theatre over a result we already have — never a wait for one.
2. **No network in the core loop.** Activities, favourites, history and preferences are all
   local. The app must keep working when school wifi drops.
3. **`lib/selection/` is pure.** No React, no browser APIs, `rng` is injected. This is what
   makes randomisation testable, and it is the part most likely to be done badly.
4. **Motion is never required.** The shake pad is always a tappable button doing the identical
   thing. `prefers-reduced-motion` is respected everywhere.
5. **Voice: playful, teacher-aware, slightly cheeky, concise.** Never corporate EdTech jargon.
   No "empower educators", no "transform learning outcomes", no unsupported efficacy claims.
6. **Scope discipline.** Anything not needed for the MVP goes in `FUTURE.md` and is not built.

## Conventions

- `duration` on an activity is in **seconds**, not minutes. `formatDuration()` renders it.
- Path alias `@/*` → `./src/*`.
- Activities live in `src/data/activities/*.ts`, one themed file per group, re-exported as a
  single `ACTIVITIES` array. `activities.test.ts` enforces the data contract — run it after
  touching any activity.
- Run `npm run check` (lint + typecheck + tests) before considering a change done.

## Activity safety constraints

Non-negotiable. Every activity must avoid: purchased materials, complicated prep, large outdoor
spaces, unsafe physical activity, singling out or embarrassing individual students, forced
physical contact, and personal disclosure. If a teacher can't read it in 10 seconds and run it
immediately in a normal classroom, rewrite it.
