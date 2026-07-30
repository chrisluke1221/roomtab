# 2026-07-30 — Collection-first roadmap pivot (Rev 3)

Chris asked to discuss the product roadmap and what comes next. This doc records the sequencing decision that came out of that discussion — formally adopted, not just noted as a proposal this time. The full revised build order lives in `docs/2026-07-19-settleroo-v2-roadmap.md` (Rev 3); this doc is the reasoning behind it.

## The decision

**Build order changes from B → C → M → D → E to B → C → collection/arrears deepening → D (delayed) → E (re-scoped).** M is already shipped. Phase D (AI ingestion) is **delayed, not cancelled** — it remains the single biggest, highest-uncertainty bet on the roadmap; it's deprioritized because the evidence now points elsewhere, not because the idea got worse.

This reverses the original roadmap's own assumption A1: *"AI ingestion is the effort-killer that makes it worth per-property pricing."* The new bet is that **collecting the money — arrears, chasing tenants, proving who owes what — is the actual effort-killer**, not ingestion.

## Why — two independent signals, not one

1. **The 4-agent user research** (`docs/2026-07-24-settleroo-integrated-research-synthesis.md`, run 2026-07-24, previously flagged as "a proposal, not adopted"): unanimous across all 4 independently-run agents that "collecting the money" ranks above bill-splitting itself as the real pain for room-renting landlords, with "part-payment tracking" named a P1 backlog item and "escalating reminders" a P0.
2. **This session's own reactive build history**, arrived at completely independently of that research: Chris hit real collection pain hands-on (a tenant partially paying a bill, no way to track it or carry the remainder forward) and asked for it fixed *before* ever reading the research synthesis. Round 2 (partial payment + carry-forward, `docs/2026-07-27-partial-payment-carry-forward.md`) and the overdue-reminder cron fix both got pulled forward and shipped ahead of any formal phase for them — not because a roadmap said so, but because the pain was real and immediate.

Two signals converging from opposite directions (a structured research exercise vs. one founder's own hands-on use) is stronger evidence than either alone. That's what makes this a decision now rather than a proposal to keep sitting unresolved.

## What actually changes

- **Phase D (AI ingestion)** moves later in the build order. Nothing about it is cancelled — the golden-set eval design, the plausibility-verification approach, the confidence-gating rules all stay exactly as scoped in the canonical roadmap. It just isn't next.
- **A new "Phase Collection"** is inserted between Phase C and Phase D: CHR-21 (occupancy exceptions — a negotiated absence adjustment) and the multi-property "who owes you" scaling design (self-QA item c.2), both real gaps already identified but not yet built.
- **Phase E gets re-scoped, not simply pushed back wholesale.** Two of its five items — arrears autopilot and the "explain my bill" tenant assistant — are collection-flavored and don't actually depend on Phase D shipping first. They're explicit candidates to pull forward ahead of D once Phase Collection's core items ship, mirroring exactly what already happened once this session with partial payment. The other three (auto-send, EOFY pack, anomaly nudge) genuinely need Phase D's extraction/calibration work first and stay gated on it.

## What doesn't change

- Phase B (operator plane) and Phase C (Stripe) stay exactly where they were in the build order — this pivot is about what comes *after* C, not a re-litigation of B/C.
- The AI USP guardrail ("AI at the edges, deterministic math in the middle") is unaffected — this is a sequencing call, not a change to how any AI feature is allowed to touch money.
- Phase D isn't abandoned. If Phase Collection's tooling ships and doesn't move retention or conversion the way the research predicts, Phase D is still there as the fallback wedge — see A1's updated row in the assumptions table.
