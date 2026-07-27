# 2026-07-27 — Manus sync-up, ticket audit, and two confirmed product gaps

A week of Manus.ai development happened between the last Claude Code session and this one. This doc records what was verified (not assumed) about that work, plus two real product gaps Chris found by using the live product, root-caused in code before any fix was scoped.

## Ticket sync (Linear + git, cross-checked)

CHR-10 through CHR-28 all show `Done` in Linear, matching real merged PRs (#23-28, all opened and merged under Chris's own GitHub account — no autonomy-boundary violation found in the merge history). Ticket hygiene held.

Two things worth flagging, not urgent fixes on their own:

- **Two commits shipped with no Linear ticket**: a Node 20 pin for Netlify (`.nvmrc`/`netlify.toml` — narrow, unrelated to anything else, legitimate) and a GTM commercial/product-walkthrough video embed on `Home.js`/`Dashboard.js` (contained, marketing-only, no core app logic touched).
- **Per-ticket branches aren't actually isolated** — diffing supposedly-independent branches (e.g. the CHR-23 branch vs. the CHR-26 branch) shows they already contain each other's changes. The work was very likely done serially in one working tree and split into differently-labeled branches after the fact. Runtime code isn't corrupted by this (the merged blobs converge consistently), but the git history doesn't accurately reflect what each ticket's diff actually contains — worth keeping in mind if a future session needs to `git revert` or review a single ticket's change in isolation.

## CHR-22 doesn't do what it claims

**CHR-22 ("merge tenant + rent-rate entry into one form") is marked Done, but the actual shipped code doesn't match the ticket's own description.** Verified directly against the diff and current `src/pages/PropertyDetail.js`:

- No rate pre-population when editing an existing tenant (`handleEditTenant` resets rent fields to blank, doesn't read `currentRateFor(tenant.id)`).
- `emptyTenant.rentFrequency` defaults to `'monthly'`, not `'weekly'` as the ticket specified.
- No warning about the implications of overriding an existing rate — the edit path doesn't touch rate logic at all.
- The commit message claims new-tenant rent/frequency fields as new work; that UI already existed before this commit (traced back to PR #21, predates Manus's involvement).

This is fixed for real in this round (see below) — it's directly relevant to Chris's frequency-setup confusion, since the tool that was supposed to make rate/frequency setup clearer for a landlord never actually shipped that clarity.

## Recovered: an uncommitted week of user research (would have been lost)

A full 4-agent research exercise (Claude, Qwen, Z.ai, DeepSeek — each independently mining AU landlord forums, competitor pages, and regulatory sources against the same discovery brief), a cross-agent synthesis, and a proposed strategy/OKR/roadmap revision were sitting **uncommitted and unpushed** in the local working copy. Recovered via `git stash` before touching anything else in this session; now committed in this same PR:

- `docs/2026-07-24-settleroo-user-research-prompt.md` — the shared discovery brief
- `docs/2026-07-24-settleroo-integrated-research-synthesis.md` — the cross-agent synthesis (Artefact 1)
- `docs/2026-07-24-settleroo-strategy-okrs-roadmap-backlog.md` — the proposed strategy/OKR/roadmap revision (Artefact 2)
- `user_research/{Claude,Qwen,Z.ai,Deepseek}/` — each agent's raw individual findings

**Headline finding, unanimous across all 4 independent runs: "collecting the money" (arrears/non-payment recovery) is the #1 real pain for room-renting landlords — ranked above bill-splitting itself, which the research demotes to "table stakes."** The proposed backlog names **"part-payment tracking" as a P1 item** and **escalating reminders as P0**. This directly validates both scenarios Chris raised independently this session, in the live product, before ever reading this research.

**Status: this strategic re-sequencing is a proposal, not adopted.** The broader pivot (repositioning Settleroo around "collect and prove" rather than "split") is a separate, bigger decision for Chris to review on his own time — possibly with the advisory board — and does not block the two fixes below, which are correct regardless of how that larger decision lands.

## The two gaps Chris found, root-caused

**1. Payment frequency doesn't drive overdue detection or reminders.** A tenant's rent-rate `frequency` (weekly/fortnightly/monthly) is used *only* to compute the rent amount (`dailyRateCents` in `src/lib/rentCalc.js`) — never read by `effectiveStatus` (`src/lib/paymentStatus.js`, purely `due_date < today`) or the reminder cron (`send-overdue-reminders`, one global frequency-blind query, flat 3-day cooldown). Compounding this: every auto-generated rent bill is inserted with `due_date: null`, and `effectiveStatus` can never return `overdue` when `due_date` is null — so most auto-generated rent bills can never become overdue or trigger a reminder at all until a landlord manually adds a due date to that specific bill. This is the real bug behind "reminders don't seem to be calculating correctly." Fixed in this round's follow-up PR (due-date auto-assignment) — the frequency-blind reminder *cadence* itself (should a fortnightly tenant get bills every two weeks instead of monthly?) is flagged as a separate, deliberately out-of-scope product decision, not silently bundled in.

**2. Partial payment doesn't exist at all.** `bill_splits` has no amount-paid column — `status` is strictly `pending`/`viewed`/`paid`, and `owed_amount` is fixed at bill creation. This is genuinely unbuilt, not a bug. Scoped as its own migration + feature in a follow-up round (automatic carry-forward of an unpaid remainder into the next bill, with an explicit breakdown — matches Chris's exact water-bill test scenario).

## Where this leaves things

Per the plan approved this session: Round 1 fixes CHR-22 for real plus the null-due-date bug (small, no schema change beyond a data backfill). Round 2 builds partial payment + carry-forward (new migration, bigger). The 4-agent research's proposed strategic pivot remains a separate, unresolved decision — flagged here so it's visible, not silently adopted or silently dropped.
