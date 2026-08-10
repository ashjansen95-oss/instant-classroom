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
- **Real analytics provider.** `src/lib/analytics/` has the sink interface. Swapping the local
  ring buffer for Plausible/Umami is one file. Do it when there are enough users for the numbers
  to mean anything.
- **Billing.** `src/lib/entitlements.ts` and `/upgrade` model the free/pro split, but nothing is
  locked. A paywall during the hypothesis test would contaminate the retention signal that is
  the entire point of the MVP.

## Student mode

Teacher creates a session → unique room code → students join on their own devices → real-time
activity → teacher controls it → student responses → teacher sees results.

Likely: Supabase Realtime or WebSockets, QR codes for joining, anonymous session IDs (never
student accounts, never student names). The current architecture doesn't block this — activities
are already plain data and the selection engine is already pure — but nothing should be
complicated *now* in anticipation of it.

## AI

Eventually: *"Year 8 English, 3 minutes, seated, quiet, persuasive writing"* → a generated
activity. Explicitly not in the MVP, and the curated library should stay the default path — an
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
