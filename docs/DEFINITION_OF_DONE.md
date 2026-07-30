# Definition of Done — the actual gate before anything is called "done"

This exists because every item below is a real thing that happened on this
repo (Manus's work and Claude Code's own), not a hypothetical best practice.
See `docs/2026-07-29-phase-b-migration-fixes.md` for the incident that
prompted writing this down. Applies to **any agent** working on this repo —
Manus, Claude Code, or a human.

## Checklist

### Schema & migrations
- [ ] Every column/table referenced in new SQL is checked against
  `docs/SCHEMA_REFERENCE.md` (or grepped from `supabase/migrations/*.sql` if
  not yet documented there) — never assumed from naming convention or
  memory. *(PR #35 invented `total_cents`/`amount_cents`/`token` and a
  `private` schema that was never created — none of it verified against the
  real schema.)*
- [ ] New migration files are named with a `PROPOSED_` prefix, no
  exceptions, until reviewed and applied by a human or Claude Code. Once
  applied and verified live, rename to drop the prefix in the same PR that
  applies it. *(Missing on two separate PRs this week.)*
- [ ] If this change touches a value another feature already depends on (a
  running total, an invariant, a "must always be zero" check), that other
  feature's logic is re-checked, not just the new code path. *(The Phase B
  split-sum invariant would have false-positived on every bill that used
  Round 2's carry-forward — two features built by different agents at
  different times, and nobody re-checked the interaction until this pass.)*

### Claims vs. reality
- [ ] A ticket/PR is only marked "Done" once the actual diff has been read
  and matches what the commit message / PR description claims — not once
  the description "sounds right." *(CHR-22's commit claimed tenant/rate UI
  work that had already shipped in an earlier PR; CHR-23 was marked Done in
  Linear with zero real implementation.)*
- [ ] "Tests pass, build is clean" is backed by literally re-running them
  and reading the output in this session — not repeated from the PR
  description or a prior run.
- [ ] A migration that's part of a "Done" ticket has actually been applied
  to the linked project, verified with a live query — not just present as a
  file in the repo. *(CHR-24's migration sat unapplied for a week while its
  frontend code was already live, silently breaking every "other" utility
  bill.)*
- [ ] Any "done" claim that reports verification (schema checks, test runs,
  live queries) states what was actually checked, so it can be spot-verified
  without re-deriving it from scratch.

### Git & branch hygiene
- [ ] `git status` before any command that could discard uncommitted work;
  unexpected files/branches get investigated, not deleted or silently used.
  *(An untracked 701-line migration turned up unexplained mid-session —
  flagged rather than assumed.)*
- [ ] A branch claimed to be independent per-ticket is spot-checked to
  actually be independent (diff it against its claimed base) if isolation
  matters for that work. *(Manus's per-ticket branches one week weren't
  actually isolated — built serially in one working tree, split after the
  fact.)*

### Scope grounding
- [ ] A ticket that's schema-heavy or architecturally open-ended, with only
  a one-paragraph description and no file/column-level detail, gets a short
  technical design written and reviewed *before* full implementation starts
  — not hundreds of lines of invented schema from one paragraph of scope.
  *(The gap between the self-QA batch, which shipped clean off a fully
  grounded plan, and the Phase B batch, which had only a short Linear ticket
  and shipped four schema bugs.)*

## The gate itself
A ticket or PR isn't done until every relevant line below is true:

1. The diff has been read in full by whoever is marking it done — not just
   the description or commit message.
2. Every new/changed SQL statement's table and column names are verified
   against `docs/SCHEMA_REFERENCE.md` or the real migration history.
3. Any new migration file uses the `PROPOSED_` prefix if not yet applied;
   once applied and verified live, it's renamed to drop the prefix in the
   same PR that applies it.
4. `CI=true npx react-scripts test` and `CI=true npm run build` have
   actually been run in this session, not assumed from a prior run.
5. Any new invariant, running total, or "must be zero" check has been
   re-verified against real production data after the change, not just
   against the new code's own unit tests.
6. Any new requirement, decision, or scope change has its own dated
   `docs/YYYY-MM-DD-*.md` file in the same PR.
7. The Linear ticket status matches reality exactly — `Done` only after a
   human has actually merged the PR, never set by the agent that wrote it.
8. If anything above couldn't be verified (no access, blocked, unclear),
   that gap is stated explicitly — never silently assumed clean.
