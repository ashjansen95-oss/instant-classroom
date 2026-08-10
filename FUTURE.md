# Future

Ideas deliberately **not** built in the MVP. The MVP exists to test one hypothesis — *will
teachers repeatedly open an app to get an instant classroom activity?* — and anything that
doesn't serve that test is noise.

If you think of something while working, add it here and carry on.

## Cut from the brief on purpose

- **Marketing landing page** (`/`). Originally spec'd, cut at the user's request: *"I just want
  an app. I don't need a landing page yet."* `/` is the generator. The first-launch onboarding
  sheet carries the "what is this" job instead. Revisit when there's something to drive traffic
  to.
- **Supabase backend.** The `StorageAdapter` interface in `src/lib/storage/adapter.ts` exists so
  a Supabase implementation can be dropped in without touching a single component. Worth doing
  when cross-device favourite sync is actually requested, or when aggregate feedback data
  becomes more valuable than the simplicity of shipping nothing.

  Teaching preferences (`country`, `teachingLevels`, `defaultTeachingLevel`) are the strongest
  candidate to sync first — a teacher setting up a second device shouldn't answer the same two
  questions again. They already go through the adapter, so syncing them is a backend change, not
  a UI one. Note the active teaching level deliberately stays session-scoped and should *not*
  sync: it means "the class in front of me right now".
- **Real analytics provider.** `src/lib/analytics/` has the sink interface. Swapping the local
  ring buffer for Plausible/Umami is one file. Do it when there are enough users for the numbers
  to mean anything.
- **Billing.** `src/lib/entitlements.ts` and `/upgrade` model the free/pro split, but nothing is
  locked. A paywall during the hypothesis test would contaminate the retention signal that is
  the entire point of the MVP.

## More languages

The country layer (`src/lib/i18n/`) handles *education terminology* and is done. What doesn't
exist yet is a second *interface language* — every UI string is still written inline in English.

When that's wanted: add a message catalogue and a `useLanguage()` binding alongside the existing
country config. The two axes are deliberately independent, so translating the interface must not
require touching a single level name, and adding an eighth country must not require a translator.

## Student mode

Teacher creates a session → unique room code → students join on their own devices → real-time
activity → teacher controls it → student responses → teacher sees results.

Likely: Supabase Realtime or WebSockets, QR codes for joining, anonymous session IDs (never
student accounts, never student names). Anything it displays about year levels must go through
`src/lib/i18n/` like the rest of the app — a room code shared between a teacher and a class
should read "Grade 8" or "2nd Year" depending on where they are. The current architecture doesn't block this — activities
are already plain data and the selection engine is already pure — but nothing should be
complicated *now* in anticipation of it.

## AI

Eventually: *"Year 8 English, 3 minutes, seated, quiet, persuasive writing"* → a generated
activity. Note that the prompt is in the teacher's own terms: parse it into a canonical level,
then into an age, before it reaches a model, and render the result back through `src/lib/i18n/`.
Generated activities must carry an honest `ageRange` like every other activity — never a
country's words, and never "suitable for everyone" as a way of avoiding the judgement. Explicitly not in the MVP, and the curated library should stay the default path — an
LLM call per random activity would destroy the thing the product is actually selling, which is
speed.

## Everything else

- Curriculum-specific activity packs
- Teacher-created activities and an activity marketplace
- Teacher / class / school profiles and accounts
- Push notifications ("last period on a Friday?")
- Social sharing
- Smarter recommendations than the lightweight affinity scoring in `lib/selection/`
- Multiplayer / whole-staff mode
- Activity variants by year level
- "I ran this" streaks or history view for teachers
