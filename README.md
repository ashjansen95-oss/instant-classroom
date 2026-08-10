# Instant Classroom

**Got 3 minutes to kill?** Shake your phone. Get a classroom activity. Run it.

A tool for teachers who suddenly have 30 seconds to 10 minutes to fill, need to reset a class,
wake students up, or calm them down. No prep, no planning, no account.

## Running it

```bash
npm run dev
```

Then open http://localhost:3000. Mobile is the primary experience — use device emulation at
390px, or open it on your phone over the local network.

```bash
npm run check   # lint + typecheck + tests
npm test        # tests only
npm run build   # production build
```

## Trying it on a phone

```bash
npm run dev
```

The terminal prints a Network address like `http://192.168.x.x:3000`. Open that on a phone
connected to the same wifi.

One caveat: **shake only works over HTTPS**, so on the local dev address you'll get the button
but not the motion sensor. To test shaking for real, deploy it (Vercel, free) and open the
HTTPS link — then add it to your home screen and it behaves like an app.

## How it's put together

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4. No backend, no database, no
accounts. Every activity ships inside the JS bundle, so the core loop keeps working when the
school wifi doesn't.

```
src/
├─ app/            routes — / is the generator, not a landing page
├─ components/     ui/ primitives, plus one folder per feature
├─ data/           the activity library, six themed files
├─ hooks/          useShake, useTimer, useFavourites, usePreferences, useHistory
└─ lib/
   ├─ selection/   pure functions — filter → score → penalise → pick
   ├─ storage/     StorageAdapter interface + localStorage implementation
   └─ analytics/   typed track() with a swappable sink
```

### The selection engine

The interesting part. It is not `activities[Math.floor(Math.random() * n)]` — if a teacher asks
for *calm*, they get calm.

1. **Hard filter** — Explore's filters are absolute.
2. **Score** — each need maps to a target profile (energy, noise, movement, duration, category);
   distance from that profile gives a 0–1 relevance score.
3. **Penalise** — recently seen activities drop out; Surprise Me additionally penalises
   repeating the last few categories, energy levels and durations, so you don't get five
   high-energy activities in a row.
4. **Pick** — weighted-random within the top-scoring band.

It's pure, with an injectable `rng`, so all of that is actually tested rather than hoped for.

### Seven countries, one activity library

Australia, the UK, the US, Canada, New Zealand, Ireland and South Africa all describe the same
school year differently. Rather than duplicating the library, activities store a **canonical
numeric level range** and the words are chosen at render time.

The scale is anchored so a level always means the same cohort of students:

| Level | 🇦🇺 🇳🇿 | 🇬🇧 | 🇺🇸 🇨🇦 🇿🇦 | 🇮🇪 |
|---|---|---|---|---|
| 0 | Prep / — | Reception | Kindergarten / Grade R | Senior Infants |
| 8 | Year 8 | Year 8 | Grade 8 | 2nd Year |
| 13 | — | Year 13 | — | — |

Countries only declare the levels they actually have, so New Zealand starts at Year 1, Australia
stops at Year 12, and Ireland gets the one level below the shared anchor (Junior Infants). Ranges
clamp to whatever the country has, which is why one activity reads "Year 3–Year 12" in Sydney and
"Grade 3–Grade 12" in Seattle.

Even the word for the concept is localised — Australia says "year level", the UK "year group",
the US "grade".

Country is picked up from the browser locale on first run and can be changed in Settings; the
choice is stored on the device. **Country is not language**: the interface is English in all
seven markets, and adding a translation later means adding a message catalogue, not touching any
of this. Adding an eighth market is one entry in `src/lib/i18n/education.ts` — no component
knows any of these words.

### The reveal

Shake or tap and a slot-machine reel spins through activity titles before landing on yours.
Worth being clear about what that is: **the winner is chosen before the reel mounts.** The
animation is showmanship over a decision already made, so it can never be waiting on anything
and can never fail to land. The candidate routes are prefetched too, which is what lets the reel
land on a page that's already on the device — including when the wifi has dropped.

Anyone with `prefers-reduced-motion` set skips the reel entirely and goes straight to the
activity.

### What we store

Only on the device, only in `localStorage`: favourites, the last few activities seen (so you
don't get repeats), thumbs up/down, and settings. No student data of any kind — no names, no
emails, no behavioural profiles. No camera, microphone, location or contacts. Settings has a
"clear everything" button that means it.

## Conventions

See `AGENTS.md`. The short version: `duration` is in seconds, `lib/selection/` stays pure, and
motion is never required for anything.

Ideas that aren't in the MVP live in `FUTURE.md`.
