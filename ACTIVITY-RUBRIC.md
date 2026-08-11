# Activity rubric

Every activity in this app is something a teacher will run in front of thirty students with no
notice. That's the standard. This document is the bar; `activities.test.ts` enforces the parts a
machine can check.

## The four gates

An activity ships only if it passes all four. These are pass/fail, not scored.

### 1. The cold-read test

> Could a teacher read this card for ten seconds and run it immediately — inventing nothing?

This is the one most likely to be failed by an activity that otherwise looks fine. "Would You
Rather" with no would-you-rathers in it fails: the teacher still has to think of ten questions
while thirty students watch. If an activity needs content, it ships a prompt bank in
`src/data/prompts/`.

The exception is **curriculum frames** — Exit Question, Quiz Your Partner, Muddiest Point. There
the teacher supplying the content *is* the activity, because it's their lesson. Giving them
generic prompts would make it worse, not better.

### 2. The classroom-reality test

> Does this work in a normal room, with normal furniture, and no preparation?

No purchased materials. No booking a space. No printing. No "you'll need to have prepared…".
If it needs equipment, that equipment is a whiteboard, paper, or something already in the room.

### 3. The safety and dignity test

Non-negotiable. An activity must never:

- single out or embarrass an individual student
- require physical contact between students
- invite personal disclosure (family, money, home life, body, beliefs)
- involve unsafe physical activity, or need more space than a classroom
- rely on students having money, possessions, or particular experiences

Elimination games are fine *if* being out is brief and low-stakes. "You're out for this round"
is fine; "you're out and everyone watches you sit down alone for five minutes" is not.

### 4. The appropriateness test

> Is this genuinely right for the ages it claims — not merely possible?

Classified on cognitive load, reading and vocabulary demands, attention span, social maturity,
abstraction, irony, competitiveness and independence. See `AGENTS.md`.

A written debate is 13–18 even though you *could* attempt it with six-year-olds. "Move like an
animal" stops at 8 even though teenagers might enjoy it. Both directions matter: a Year 11 class
handed something obviously designed for infants is just as bad a result as the reverse.

## Dud, fine, banger

Once it passes the gates, the question is whether it's worth keeping.

| | What it looks like |
|---|---|
| **Dud** | Technically runs, but the teacher has to work to make it land. Vague instructions, or the fun depends entirely on the teacher's energy. Cut it. |
| **Fine** | Does the job. Fills the time, resets the room, nobody complains. Most of the library, and that's correct. |
| **Banger** | Students ask to do it again. Usually because it has a twist, a rule that creates tension, or a payoff moment. |

What tends to make a banger, in this library:

- **A constraint that creates tension** — Count to Twenty restarting from one; Silent Line-Up
  banning speech
- **A visible payoff** — Fold-Over Creature opening all the drawings at once
- **A reversal** — Wrong Answers Only, Opposite Day, Design the Worst
- **The teacher as the opponent** — Beat the Teacher

What tends to make a dud:

- It's really just a worksheet read aloud
- The instructions need a diagram
- The fun is front-loaded into the first ten seconds
- It only works if students are already engaged, which defeats the point

## How we'll actually know

The rubric is judgement. The 👍/👎 on every activity card is evidence. Right now that data stays
on each device — see `FUTURE.md`. Once it aggregates, cut anything with a consistently poor
ratio rather than defending it because it looked good on paper.

## Timer or no timer

Most activities are time-boxed — the clock is the constraint, or it's what tells an open
discussion to stop. For those, keep the default: `Start timer` leads, `Give me another` is
secondary.

A small set end on their own condition instead — a champion, a correct guess, five points —
and a countdown hitting zero mid-elimination fights the mechanic rather than supporting it.
Mark these `selfEnding: true`. It doesn't remove the timer (a teacher may still want a rough
cap), it just stops the app insisting a clock is the point when it isn't.

## Adding an activity

1. Write it, then apply the four gates honestly.
2. Classify its `ageRange` on what's appropriate, not what's possible.
3. If it needs content, add a prompt bank — 20 items for something a teacher will use weekly,
   10 otherwise.
4. Run `npm run check`. The tests enforce structure, coverage, age spread and prompt banks;
   they cannot enforce whether it's any good. That part is on you.
