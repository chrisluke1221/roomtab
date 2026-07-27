# Settleroo — Strategy, OKRs, Roadmap & Prioritised Backlog

**Artefact 2 of 2** (companion: `2026-07-24-settleroo-integrated-research-synthesis.md`)
**Prepared:** 2026-07-24 · **Owner:** Chris (founder/PM) · **Classification:** Internal — delivery-ready roadmap decision
**Input:** the integrated synthesis of 4 independent research runs (Claude, Qwen, Z.ai, DeepSeek)
**Horizon:** Q3 2026 → Q1 2027 · **Status:** Recommendation for approval; two decisions flagged 🔶

> This document turns the research into action. It is organised by two explicit lenses the whole plan is sorted on — **Business Objective priority** and **User Value priority** — so every item earns its place against both. It also **reconciles against the current canonical roadmap** (`docs/2026-07-19-settleroo-v2-roadmap.md`, build order B→C→M→D→E) and states exactly what changes.

---

## 1. The recommendation in one page

**What the research says (4/4 agents agree):** Settleroo cleanly solves the market's ~8th-ranked problem (splitting the bill) while under-serving its #1 (getting the money in). The split engine is table stakes — competitors match it and many operators bundle bills and never split at all. The AI-ingestion flagship is not the next bet: the incumbent (PropertyMe) already ships it and the tech is commodity. The durable assets we've built — the **no-login link** and the **locked, provable bill** — are real, but the link needs *pay-through* and the locked bill should be repositioned as **tribunal/bond evidence**, not billing integrity.

**The strategic move:** reposition Settleroo from a **bill splitter** to the **"get-paid-and-prove-it" settlement layer for room-by-room rentals.** Keep the deterministic split as the credibility wedge; make **collection + provable-record** the product's centre of gravity.

**What changes vs the canonical roadmap:**
- **Pull forward** the collection loop (arrears autopilot + pay-through) — currently scattered across Phase C (Stripe) and Phase E (arrears autopilot). Make it the **next build**, not the last.
- **Reframe & keep** Phase B (Operator plane) — it's the enabler: `bill_events` is the audit spine the collection + evidence features need.
- **Demote** Phase D (AI ingestion) from flagship to "Later," and **reframe** it from "OCR a PDF" to "occupancy-logic automation."
- **Hold** Phase M (marketing) — but retarget copy from "split your bills" to "get paid, on time, provably."

**Two decisions to make consciously (🔶 §7):** (1) the strategic fork — Collection-first now vs Rooming-house-OS pivot; recommended: **do A now, validate B**. (2) the pricing metric — keep A$10/property vs move to per-room; recommended: **hold, test in interviews before Stripe hardens.**

**Confidence:** the re-sequencing toward collection is **HIGH-confidence and safe to start today** (unanimous top pain). The compliance pivot and any reprice are **MEDIUM** — gated on the 10 founding-member interviews.

---

## 2. Positioning (rewritten from the research)

> **For** rent-by-the-room operators (2–10 properties) who lose money and weekends chasing tenants, **Settleroo** is the **settlement layer that gets every shared cost paid, on time, and proves every dollar** — splitting each bill to the exact occupancy day, chasing it to settled on a no-login link, and locking a tribunal-ready record. **Unlike** spreadsheets, Splitwise, or generic landlord software, **the money actually arrives and every number is deterministic, locked, and provable to the tenant.**

Shift in emphasis: *split → prove → **collect***. The old line led with the split (table stakes). The new line leads with the two things nobody else does for this segment: **collect** and **prove**.

---

## 3. Strategy: three pillars

**Pillar 1 — Own "money in."** Move from tracking payment status to collecting payment: escalating auto-reminders, pay-through the link, reconciliation. This is the #1 pain and the reason an operator pays to *keep* Settleroo. *(Business moat: workflow + money movement.)*

**Pillar 2 — Own "provable."** Reposition the locked/deterministic bill as the evidence layer — disputes, VCAT/tribunal, bond deductions. This is the one thing ChatGPT, Splitwise, and even Smart RentHub can't credibly claim. *(Business moat: trust + system-of-record.)*

**Pillar 3 — Stay lightweight & viral.** Guard the no-login, no-fee link against the RentTech backlash; let tenants who experience it become tomorrow's landlords. Never become "more app to manage than actual properties." *(Business moat: acquisition cost + anti-incumbent positioning.)*

Everything below ladders to one of these three.

---

## 4. OKRs (Q3 2026 → Q4 2026)

North-Star context (from canonical roadmap): ~15 paying operators averaging ~3 properties (~A$450 MRR) by 2026-10-31, free→paid ≥5%, week-4 activation ≥40%. The research says **reorient activation and retention around collection, not splitting.**

### Objective 1 — Prove the collection loop is the wedge that makes operators pay `Pillar 1`
- **KR1.1** Ship escalating auto-reminders + pay-through on the no-login link to 100% of active operators by end Q3.
- **KR1.2** ≥60% of bills issued via Settleroo reach "settled" **within the tool** (not self-reported) within 14 days.
- **KR1.3** ≥40% of Pro operators use the collection loop ≥2× in their first month (new activation definition = *issued a bill AND collected through it*).
- **KR1.4** Median days-to-paid drops by ≥30% for bills sent with auto-reminders vs without (instrumented A/B).

### Objective 2 — Validate willingness-to-pay on the correct value `Pillar 1/2`
- **KR2.1** Complete 10 founding-member interviews with 2–10-property operators; **yeses ÷ 10 ≥ 0.4** on a paid offer.
- **KR2.2** Resolve the pricing-metric decision (A$10/property vs per-room) with evidence before Stripe self-serve hardens.
- **KR2.3** Reach 10 paying operators (~A$300+ MRR) by end Q4 — quality of activation over vanity signups.

### Objective 3 — Make "provable" a felt, marketed benefit `Pillar 2`
- **KR3.1** Ship 1-click VCAT/tribunal-ready evidence export (locked bill + payment history) for every bill.
- **KR3.2** The USP ("get paid, on time, provably") is live on the marketing site hero; ≥1 in-product moment surfaces the provable record.
- **KR3.3** ≥3 design-partner operators cite the provable record as a reason they'd recommend Settleroo (qual).

### Objective 4 — Protect acquisition & keep it lightweight `Pillar 3`
- **KR4.1** No-login link open→action rate ≥50%; keep it no-account, no-fee.
- **KR4.2** Landing→signup conversion instrumented and improved vs baseline (Phase M).
- **KR4.3** Onboarding to first *collected* bill ≤ 15 minutes.

---

## 5. Roadmap — Now / Next / Later (reconciled with canonical B→C→M→D→E)

### NOW — Q3 2026 · "Money in + the spine that proves it" `Pillars 1 & 2`
1. **Finish Phase B (Operator plane + `bill_events` audit spine).** *Keep as-is* — it's the enabler for collection and evidence. Unblocks everything below.
2. **Collection loop v1** *(pulled forward from Phase E/C)* — escalating auto-reminders ("good cop, not bad cop") on the no-login link + part-payment tracking. Deterministic-math guardrail holds (AI drafts message tone; never touches the split/amount).
3. **Pay-through the link** *(pulled forward from Phase C)* — PayID/Stripe so tenants pay in one tap; reconciliation replaces self-reported "mark as paid." *(Stripe only — no hand-rolled billing, per guardrails.)*
4. **VCAT/tribunal evidence export v1** — 1-click PDF of the locked bill + payment history (reuses the locked-bill you already built; cheapest high-value win).

### NEXT — Q4 2026 · "Prove it deeper + tame the admin that sneaks up" `Pillars 2 & 3`
5. **Phase M marketing retarget** — hero USP → "get paid, on time, provably"; ship the public no-login demo bill; anti-RentTech framing.
6. **Bills-inclusive mode** — a toggle so bundled-rent operators (the majority) aren't excluded; recurring flat charge without a split.
7. **Room-turnover wizard** — move-out proration → new-tenant onboarding in one flow (addresses turnover pain #4).
8. **Lease/compliance date calendar** — the "stuff that sneaks up" (leases, inspections, certs). Lightweight, retention-driving.

### LATER — Q1 2027+ · "Higher-ceiling bets, only after validation" `Pillar 2 / expansion`
9. **🔶 Licensed rooming-house compliance module** (RTBA bond ledger + 10-day clock + licence reminders) — **gated on interviews confirming per-room WTP** (Path B).
10. **AI occupancy-logic automation** *(reframed Phase D)* — not OCR-a-PDF, but "know John left on the 14th and adjust." Human-confirmed. Demoted to retention/upsell.
11. **EOFY tax export** (seasonal; time for May–June).
12. **Expansion decision** — per-room pricing pilot and/or geo (UK HMO ~10× TAM) — **evidence-gated.**

**Explicitly still parked** (unchanged from canonical): tenant money-movement beyond pay-through, native apps, WhatsApp, full maintenance ticketing, tenant-screening build (partner instead), MCP write tools, B2B/agency multi-seat.

---

## 6. Prioritised backlog — split by Business Objective × User Value

### The two sort lenses

**Business Objectives (ranked):**
`BO1` Prove WTP & retain (revenue) · `BO2` Build the moat (collection + provable) · `BO3` Acquire efficiently (viral/lightweight) · `BO4` Unlock scale (expansion)

**User Values (ranked, from research):**
`UV1` Get me the money · `UV2` Never lose the argument / stay legal · `UV3` Don't make me the bad guy · `UV4` Save me time on admin that sneaks up · `UV5` Fair, transparent split *(table stakes)* · `UV6` Don't force heavy apps on me/tenants

### Backlog (P0 → P3)

| # | Item | Business Obj | User Value | Pain rank | Impact | Effort | Conf. | Priority |
|---|---|---|---|---|---|---|---|---|
| 1 | **Escalating auto-reminders on no-login link** | BO2 | UV1, UV3 | #1, #3 | Very High | Med | High | **P0** |
| 2 | **Pay-through the link (PayID/Stripe) + reconciliation** | BO1, BO2 | UV1 | #1 | Very High | High | High | **P0** |
| 3 | **Operator plane + `bill_events` audit spine (finish Phase B)** | BO2 | UV2 | enabler | High | Med | High | **P0** |
| 4 | **VCAT/tribunal evidence export (locked bill + history)** | BO2 | UV2 | #6, #7 | High | Low | High | **P0** |
| 5 | **Part-payment tracking** | BO2 | UV1 | #1 | High | Med | High | **P1** |
| 6 | **Marketing retarget: "get paid, provably" + public demo bill** | BO3 | UV1, UV6 | #14 | High | Low-Med | High | **P1** |
| 7 | **Bills-inclusive mode (toggle, no split)** | BO1 | UV6 | #6/#13 | Med-High | Med | Med-High | **P1** |
| 8 | **Room-turnover wizard (move-out proration → onboarding)** | BO2 | UV4, UV5 | #4 | Med-High | Med | Med | **P1** |
| 9 | **Lease/compliance date calendar** | BO2 | UV4 | #5 | Med-High | Med | Med-High | **P2** |
| 10 | **SMS delivery + one-tap pay modal** | BO3 | UV1, UV6 | #14 | Med | Low | Med | **P2** |
| 11 | **🔶 RTBA bond ledger + compliance clock (licensed ops)** | BO4 | UV2 | #6 | High (niche) | High | Med | **P2 — gated** |
| 12 | **AI occupancy-logic automation (reframed ingestion)** | BO4 | UV4, UV5 | #11 | Med | High | Med | **P3** |
| 13 | **EOFY tax export** | BO1 | UV4 | #12 | Med (seasonal) | Low | Med | **P3** |
| 14 | **Tenant-screening partnership hook (not build)** | BO4 | UV2 | #2 | Med | Low (partner) | Low-Med | **P3 — explore** |

**How to read priority:** P0 items all serve the top business objective (moat via collection) and the top user value (get me the money), sit at the top of the pain stack, and are mostly low-to-medium effort because they build on assets you already shipped (the no-login link and the locked bill). That is the definition of high leverage — and it is exactly where all four research runs pointed.

### What NOT to build (and why)
- **AI ingestion as a flagship** — incumbent ships it, commodity tech, wrong pain. → reframed & demoted to P3.
- **Anything for agents/PMs** — trust-accounting incumbents; standalone = "one more place." → parked.
- **Full maintenance/vetting systems** — real pains but different products; dilute the wedge. → partner or defer.
- **More split-engine features** — table stakes; further investment has low marginal return.

---

## 7. The two decisions to make 🔶

### Decision 1 — The strategic fork: Collection-first vs Rooming-house-OS pivot
**Recommendation: do Path A now, validate Path B.**
- **Now (Path A):** collection + pay-through + evidence export. Unanimous #1 pain, HIGH confidence, serves *every* segment, builds on existing assets. This is P0.
- **Validate (Path B):** reposition the *already-built* locked bill as tribunal/bond evidence (cheap, done in P0 item #4), and use the 10 interviews to size licensed-operator per-room WTP. Only greenlight the compliance *engineering* (item #11) if interviews confirm the WTP and segment size. This buys the higher-ceiling option without betting on unproven sizing.

### Decision 2 — Pricing metric: hold A$10/property vs move to per-room
**Recommendation: hold A$10/property; decide before Stripe self-serve hardens (Phase C).**
- The Fable critique already moved you to per-property; the research adds a *per-room* option (A$15–25/room) tied to the compliance pivot.
- **Do not reprice on synthetic evidence.** Test both metrics in the 10 founding-member offers (KR2.1/2.2). Repricing after self-serve checkout exists is 10× the pain — so resolve it in the interview round, this quarter.

---

## 8. Risks & guardrails

| Risk | Mitigation |
|---|---|
| Re-sequencing on desk research (no live interviews yet) | Collection is unanimous & HIGH-confidence → safe to start. Gate the *pivot* and *reprice* on interviews (§10). |
| Pay-through pulls us into money movement / compliance | Stripe only, never hand-roll billing; deterministic engine stays the sole splitter; AI never touches money state (existing `CLAUDE.md` guardrails hold). |
| Compliance module is a rabbit hole (Path B) | Gate on WTP evidence; start with the *evidence export* (reuses locked bill), not full RTBA integration. |
| Scope creep into vetting/maintenance | Partner, don't build; protect the lightweight positioning (Pillar 3). |
| Small TAM at A$10/property | The scale levers (per-room, payments, UK HMO) are LATER + evidence-gated, not now. |
| Tenant won't pay *through* the link | Prototype-test with 3 operators before building item #2 at scale (§10, Q4). |

---

## 9. Reconciliation with the canonical roadmap (`docs/2026-07-19-settleroo-v2-roadmap.md`)

| Canonical phase | Canonical order | Research-adjusted call |
|---|---|---|
| **B — Operator plane + `bill_events`** | Next | **Keep — do now** (enabler for collection + evidence) |
| **C — Stripe self-serve** | After B | **Split & pull forward the pay-through piece into NOW**; keep full self-serve billing in Q3/Q4 |
| **M — Marketing** | Parallel | **Keep, retarget copy** to "get paid, provably" |
| **D — AI ingestion** | After M | **Demote to LATER + reframe** to occupancy-logic automation |
| **E — Arrears autopilot + auto-send** | Last | **Pull the arrears/collection loop forward into NOW** (it's the wedge); keep confidence-gated auto-send in Later |

**Net change:** build order shifts from **B → C → M → D → E** to **B → (collection loop + pay-through + evidence export) → M → bills-inclusive/turnover/calendar → [gated: compliance, reframed-AI, expansion].** Document this as a rev to the canonical roadmap in the PR that implements the first collection item (per repo doc-sync convention).

---

## 10. Next actions

1. **Approve** the repositioning and the NOW slice (P0 items 1–4). *(Owner: Chris)*
2. **Run the 10 founding-member interviews** (KR2.1) — resolves Decision 1 & 2 and the four open questions in Artefact 1 §10. *(This quarter, before Stripe hardens.)*
3. **Cut the first collection-loop branch** off `main` once Phase B merges; write the roadmap rev into the same PR.
4. **Prototype-test pay-through** with 3 operators' tenants before scaling item #2.
5. **Re-run this synthesis** after interviews to convert MEDIUM-confidence calls (pivot, pricing) to decisions.

---

*Sorted throughout by Business Objective priority (BO1→BO4) and User Value priority (UV1→UV6). Built from the integrated synthesis of four independent research runs; MEDIUM-confidence items (compliance pivot, pricing metric, market sizing) are explicitly gated on primary interviews. Companion evidence: `2026-07-24-settleroo-integrated-research-synthesis.md`.*
