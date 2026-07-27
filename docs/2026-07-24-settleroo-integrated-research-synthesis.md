# Settleroo — Integrated User Research Synthesis

**Artefact 1 of 2** (companion: `2026-07-24-settleroo-strategy-okrs-roadmap-backlog.md`)
**Prepared:** 2026-07-24 · **Owner:** Chris (founder/PM) · **Classification:** Internal — roadmap decision input
**Method:** meta-synthesis (thematic analysis + cross-source triangulation) of **4 independent AI research runs** against the same discovery brief
**Status:** Decision-ready. Confidence is stated per finding. Primary-research gaps are called out in §9.

---

## 1. Research overview

### What we did
We wrote one comprehensive discovery brief (see `docs/2026-07-24-settleroo-user-research-prompt.md`) and ran it through **four independent research agents** — Claude, Qwen, Z.ai, and DeepSeek — each mining public Australian landlord/share-house forums (Reddit, PropertyChat, Whirlpool, Facebook groups, Flatmates), competitor and app-store pages, and AU regulatory sources, then building evidence-grounded synthetic personas. This document triangulates all four into one confidence-weighted synthesis.

Running the same brief four ways is deliberate **methodological triangulation**: a finding that four independently-run agents reach from different source samples is far stronger than any single run. Where they disagree, that disagreement is itself signal — flagged in §8.

### The question this research answers
We have shipped an MVP that splits shared bills by occupancy day, generates recurring rent, sends no-login tenant links, and tracks payment status. **Is this solving the biggest real pain for room-renting landlords, is the problem worth solving, and are we aimed at the right user — before we commit the next phase (AI bill ingestion)?**

### Source strength (be honest about the evidence)
| Run | Cited sources | Evidence quality | Notable strength |
|---|---|---|---|
| **Z.ai (main)** | ~40 real forum URLs + quotes | **Highest** — verbatim quotes with live links, incl. a direct disconfirming quote | Best primary evidence; found PropertyMe "Bills AI" |
| **Qwen** | 40 numbered sources | **High** — forum quotes, regulatory + market-size data | Most complete pain taxonomy (P1–P11) + market sizing |
| **Claude** | ~15 cited pages | **Medium-High** — competitor/tool pages, AU regs | Found the Smart RentHub direct competitor; honest gap-flagging |
| **DeepSeek** | ~7 URLs, many quotes flagged *synthetic reconstruction* | **Medium** — several Reddit quotes/URLs are reconstructed, treat as directional | Clear stack-rank; "professional amateur" ICP framing |
| Z.ai (artefacts) | strategic layer | n/a (synthesis, not new evidence) | OST, journey map, empathy maps, "good cop" insight |

**Caveat carried into every finding below:** this is desk research + synthetic personas, **not live interviews**. No agent conducted a real operator interview or a time-and-motion study. The findings are strong enough to *re-sequence the roadmap*, but the four highest-stakes numbers (which pain ranks #1 for a paying operator, split-vs-bundled prevalence, real WTP, tenant pay-through rate) still need the 10 founding-member interviews to confirm. See §9.

---

## 2. The headline: four agents, one conclusion

> **We built a precise answer to the market's ~8th problem. The #1 problem is getting the money in — and the MVP tracks payment status but does not collect. Bill-splitting math is table stakes, not the moat. AI ingestion is not the next bet.**

This was reached **independently by all four runs.** That is the strongest signal in this entire body of research.

---

## 3. Key findings (confidence-weighted, ordered by priority)

### Finding 1 — The #1 pain is collecting the money (arrears / non-payment), not splitting the bill. `CONFIDENCE: HIGH (4/4 agents)`
Every run ranked *actually getting paid* as the top or co-top pain, above all five assumed pains (P1–P5).
- *"Does anyone else hate chasing rent every single month? Honestly, rent collection is the part of landlording I still haven't figured out."* (Facebook HMO group, via Z.ai)
- *"I'll never see the rent money… My insurance does not cover non payment of rent."* (Whirlpool tribunal thread, via Z.ai)
- *"Over $500 is for 4 unpaid bills, with the oldest being one month overdue… she does not have to pay any bills as her room is not separately metered."* (Whirlpool, via Qwen)
- QBE Landlord Survey 2025: **35% of landlords had a tenant fall behind on rent** (via Qwen).
- **Disconfirming quote that names our gap directly:** *"Can you enlighten me as to how splitting the bills between tenants makes it any easier to getting all tenants to pay their share?"* (Facebook HMO, via Z.ai).

**Implication:** the product's centre of gravity must move from *"split & show who owes"* to *"get the money in."* Settleroo's current chase is a status toggle; the unmet job is collection (reminders that escalate, pay-through, arrears→evidence).

### Finding 2 — Tenant vetting / bad tenants is a co-equal top pain. `CONFIDENCE: HIGH (3/4)`
Z.ai rates it co-#1 with arrears; Qwen (P8) and DeepSeek both rate it high. *"didn't screen them properly… constantly late on rent and causing damage"* (Facebook Landlord Australia). Root-cause logic: a bad tenant *causes* the arrears, disputes, and turnover pains. **But it is arguably outside Settleroo's core job** — flag as an opportunity to watch, not necessarily to build (§7).

### Finding 3 — The occupancy-day split is a vitamin / table stakes, not the differentiator. `CONFIDENCE: HIGH (4/4)`
All four demote it from "the wedge" to "necessary credibility, don't lead with it."
- The math is a *"3-cell Excel formula"* / *"person-day"* method widely documented (Synergy, aussierentlaws).
- **Competitors already ship it:** Smart RentHub (AU co-living, occupancy-day splitting, via Claude), Plinthos (EU, €4.99/mo, "split by days occupied", via Qwen), InvestorJoint (AU rooming-house software, via Z.ai). Our "no incumbent" assumption is **false at the feature level.**
- **Verdict: keep it as the credibility wedge; stop positioning it as the hero.**

### Finding 4 — The real differentiators are the no-login link and the locked/provable bill — but the locked bill should be repositioned as *tribunal/bond evidence*, not billing integrity. `CONFIDENCE: HIGH (4/4)`
- No-login link resonates hard against the AU **"RentTech" fee backlash** — tenants are *"sick of having to pay their rent through third-party apps"* (The Guardian / Nine, via Z.ai). A no-login, no-fee link is a genuine edge.
- But the link *"doesn't solve getting the money in; marking paid is self-reported, not reconciled."* It needs pay-through.
- The locked, versioned, deterministic bill's highest-value use is **disputes, VCAT/tribunal evidence, and bond reconciliation** — low frequency, extreme severity. *"Finally something I can take to VCAT."* Reposition from "the bill can't gaslight you" to **"the evidence file that wins the tribunal."**

### Finding 5 — AI bill ingestion is not the next bet. `CONFIDENCE: HIGH (4/4)`
All four demote the planned Phase-D flagship.
- **The incumbent already ships it:** PropertyMe's *"Bills AI — scan all bill types, bulk upload and batch process"* is live (via Z.ai). We'd be catching up, not leading.
- **The tech is commodity** (ABBYY, Docsumo, Koncile utility-bill OCR at 99%+) — no moat.
- **Low volume where it matters:** bills-inclusive operators receive only ~4–5 utility bills/property/year; there's little to ingest.
- Manual entry is real but *minutes, not hours* — and the "5–10 hrs/month" admin figure is dominated by chasing, maintenance, and document-wrangling, not typing bill amounts.
- **Verdict: demote to "Later" (P3). If built, reframe it from "OCR a PDF" to "occupancy-logic automation"** — the sharpest reframe (Z.ai): operators said *"I don't need AI to read my bill. I need AI to know that on the 14th, John moved out and Sarah moved in, and adjust everything automatically."*

### Finding 6 — "Bills-inclusive" rent is the dominant professional model, which shrinks the split use-case. `CONFIDENCE: HIGH (4/4)`
Professional AU rooming-house / co-living operators overwhelmingly **bundle utilities into a flat weekly/fortnightly rent** — *"One fortnightly payment covers rent, Wi-Fi, electricity, gas, water. No surprises."* (CDA Coliving). VIC law reinforces this: an operator can only on-charge utilities if the room is **separately metered**. So a large slice of the assumed ICP **never splits a bill at all.** The acute split-pain concentrates in *itemised* share-house / casual rent-by-room setups — a **narrower ICP than "2–10 property operators."**

### Finding 7 — The agent / property-manager segment is a trap. `CONFIDENCE: HIGH (4/4)`
Unanimous. Agents live inside **trust-accounting platforms** (PropertyMe, Managed, Console, MRI Property Tree) that are bound to state regulation and already handle rent, arrears, and bill processing. Room-split-by-occupancy-day is *"one more place,"* a rounding error in their week, and standard agents avoid rooming houses anyway (specialist-only, separate leases, 8–12% fees). **Do not pursue agents as a primary segment.** Only viable later as an embedded *integration/module* inside an incumbent platform.

### Finding 8 — Single-property landlords and tenants are a viral/free channel, not a revenue segment. `CONFIDENCE: HIGH (4/4)`
71% of AU investors own exactly one property; single-property room-renters and head-tenants feel the pain but have **near-zero WTP** (Splitwise is free and entrenched). *"Splitwise is free and my mates already use it."* Use the no-login tenant link as the **viral vector** (a tenant who experiences it becomes a landlord later), and monetise only the landlord side.

### Finding 9 — At A$10/property, the core ICP is commercially thin; 5–20× scale needs a different lever. `CONFIDENCE: MEDIUM (4/4 raise it; sizing is soft)`
Market-size estimates ranged widely (VIC has 1,024 registered rooming-house operators; national guesses 5,000–30,000) — all **low-confidence**. At A$10/property the revenue ceiling is roughly A$0.6–6M ARR. The three agents proposed **three different 5–20× levers** (see §8): expand the *job* into payments; pivot to *per-room compliance* pricing for licensed operators; expand *geographically* (UK HMO, ~10× TAM). This is the central strategic fork — carried into Artefact 2.

### Finding 10 — Adjacent admin pains cluster into "the stuff that sneaks up." `CONFIDENCE: MEDIUM-HIGH (3/4)`
Beyond money: **turnover/vacancy** (a 5-bed rooming house can turn over entirely in 6 months), **lease/compliance date tracking** (*"lease renewals sneaking up on me"* was named the most-dreaded task), **maintenance coordination**, and a **meta-pain of tool overload** (*"more app to manage than actual properties"*). These define the *lightweight* bar any expansion must clear, and point at a "rooming-house operating system" adjacency (§8).

---

## 4. Triangulation map (who found what)

| Finding | Claude | Qwen | Z.ai | DeepSeek | Consensus |
|---|:--:|:--:|:--:|:--:|---|
| 1. Collection/arrears = #1 pain | ✓ | ✓ | ✓ | ✓ | **Unanimous** |
| 2. Tenant vetting = co-top pain | ~ | ✓ | ✓ | ✓ | Strong |
| 3. Occupancy split = vitamin/table-stakes | ✓ | ✓ | ✓ | ✓ | **Unanimous** |
| 4. No-login + locked bill = wedge (reposition as evidence) | ✓ | ✓ | ✓ | ✓ | **Unanimous** |
| 5. AI ingestion = not next bet | ✓ | ✓ | ✓ | ✓ | **Unanimous** |
| 6. Bills-inclusive shrinks the split use-case | ✓ | ✓ | ✓ | ~ | Strong |
| 7. Agents = trap | ✓ | ✓ | ✓ | ✓ | **Unanimous** |
| 8. Single-property/tenants = viral not revenue | ✓ | ✓ | ✓ | ✓ | **Unanimous** |
| 9. A$10/property is thin; needs a scale lever | ✓ | ✓ | ✓ | ✓ | Unanimous problem, divergent fix |
| 10. Adjacent "sneaks-up" admin cluster | ~ | ✓ | ✓ | ✓ | Strong |

✓ = explicitly found · ~ = partially/implied

---

## 5. Consolidated pain stack (merged & de-duplicated)

Composite of all four stack-ranks — ordered by prevalence × severity × how underserved by current tools.

| Rank | Pain | Type | Severity | Underserved? | Settleroo today | Confidence |
|---|---|---|---|---|---|---|
| **1** | **Collecting the money / arrears / non-payment recovery** | NEW | Extreme | High | Tracks status only — **gap** | High |
| **2** | **Tenant vetting / bad tenants** | NEW | Extreme | Med | Not addressed | High |
| **3** | **Chasing / following up (P4)** | Assumed | High | Med | Manual toggle — **undershoots** | High |
| **4** | **Turnover / vacancy / re-letting** | NEW | High | Med-High | Not addressed | Med-High |
| **5** | **Lease / compliance / date calendar** | NEW | Med-High | Med | Not addressed | Med-High |
| **6** | **Rooming-house compliance / RTBA bond (licensed ops)** | NEW | High (fines) | High | Not addressed | Med-High |
| **7** | **Disputes / "why is my share $X?" (P5)** | Assumed | Med (extreme when it fires) | High | **Locked bill serves this well** | Med-High |
| **8** | **Maintenance coordination** | NEW | High | Low (tools exist) | Out of scope | Med |
| **9** | **Proration calculation (P2)** | Assumed | Low-Med | Low | **Solved — table stakes** | High |
| **10** | **Sending bills (P3)** | Assumed | Low-Med | Low | **Solved — no-login link** | High |
| **11** | **Manual data entry (P1)** | Assumed | Low | Med | Recurring rent helps | High |
| **12** | **Tax / EOFY reporting** | NEW | Med (seasonal) | Low | Not addressed | Med |
| **13** | **Utility cost blowouts (bills-inclusive)** | NEW | High | Low | Not addressed | Med |
| **14** | **Tool overload (meta-pain)** | NEW | Med (adoption killer) | High | **No-login/lightweight is our edge** | High |

**Read this way:** everything the MVP does well (ranks 7, 9, 10, 11) sits in the *bottom half*. The top of the stack (1–6) is largely unbuilt. That is the roadmap gap, and the whole point of Artefact 2.

---

## 6. Solution-fit scorecard (consensus verdicts)

| Shipped solution | Consensus verdict | Painkiller / Vitamin | What to do |
|---|---|---|---|
| **Occupancy-day split** | Table stakes; competitors match it | Vitamin (painkiller only for split-bill minority) | **Keep as credibility wedge; stop leading with it** |
| **Recurring rent bills** | Commodity; every AU tool has it | Vitamin | Keep; must tie to tenancy dates |
| **No-login tenant links** | Genuine differentiator (anti-RentTech) | Painkiller (narrow) | **Keep & amplify; add pay-through** |
| **Payment tracking / chasing** | Undershoots the #1 pain | Vitamin as built → Painkiller if automated + collecting | **Improve urgently into a collection workflow** |
| **Locked / provable bills** | Real trust asset, mis-positioned | Painkiller (repositioned) | **Reframe as tribunal / bond / dispute evidence** |

---

## 7. Consolidated personas (merged across runs)

Five behavioural clusters recurred across all four runs (names harmonised; all **synthetic, evidence-grounded**).

**P1 — "Maya / Marco", the scaling house-hacker (CORE PAYING ICP).** 2–6 properties, self-managed, often bills-inclusive. JTBD: minimise admin, stop dreading the phone, look professional. Tools: Excel + WhatsApp + bank transfers, abandoned Splitwise. Top pains: arrears → vetting → dates → maintenance; *splitting is low*. WTP: **A$10–30/property/mo — "will pay for collection, not splitting."** Killer objection: *"If it doesn't actually make the tenant pay, it's just another place to look."* `Confidence: High`

**P2 — "Dave / Sarah", the single-property room-renter (VIRAL / FREE).** 1 property, 2–3 rooms, owner-occupier. Hates being the nag; conflict-averse. Tool: Splitwise (free). WTP ~A$0. *"Splitwise is free and my mates already use it."* Role: top-of-funnel, not revenue. `Confidence: High`

**P3 — "Priya / Vikram / Davo", the licensed / professional rooming-house operator (HIGH-WTP EXPANSION).** 10+ properties / 50+ rooms, VIC-licensed, bills-inclusive. JTBD: compliance + scale without fines. Pains: RTBA bond/compliance, arrears across many residents, turnover, vetting. WTP: **A$15–25/room/mo for compliance.** Objection: *"Does it handle RTBA lodgement and VCAT evidence? If not, no."* Split feature is largely irrelevant to them. `Confidence: Med` (thinner evidence)

**P4 — "Karen / Sarah / Megan", the property manager / agent (DO NOT PURSUE).** ~100–150 properties in PropertyMe/trust accounting. Never splits by occupancy day. *"Another tab? My platform already does bills + arrears."* Standalone tool = non-starter; only viable as an integration. `Confidence: High that standalone fails`

**P5 — "Tom / Jess / Hana", the head-tenant subletter (VIRAL NICHE).** Leases a house, sublets rooms, legally liable for the whole bill. Feels chasing/dispute pain acutely; WTP ~A$0. Would click a no-login link but won't pay. Genuine viral entry point. `Confidence: Med`

---

## 8. Opportunity Solution Tree & the strategic fork

**Desired outcome:** a room-renting operator gets every dollar in, on time, with zero arguments and no admin dread — and pays us to keep it that way.

```
OUTCOME: "Money in, on time, provable, without me chasing"
│
├── Opportunity 1 — GET THE MONEY IN  (Pain #1, #3)      ← highest leverage, universal
│     ├── Escalating auto-reminders on the no-login link ("good cop, not bad cop")
│     ├── Pay-through the link (PayID / direct debit / Stripe) — the actual unlock
│     └── Part-payment tracking + reconciliation (not self-reported)
│
├── Opportunity 2 — WIN THE ARGUMENT / STAY LEGAL  (Pain #6, #7)  ← our moat
│     ├── Reposition the locked bill as VCAT/tribunal evidence pack (1-click export)
│     ├── RTBA bond ledger + 10-day-clock (licensed rooming-house operators)
│     └── Per-resident account statement for disputes/bond deductions
│
├── Opportunity 3 — KILL TENANT/APP FATIGUE  (Pain #14)  ← acquisition edge
│     ├── Keep no-login, no-fee links (anti-RentTech positioning)
│     └── SMS delivery + one-tap pay modal
│
└── Opportunity 4 — TAME THE ADMIN THAT SNEAKS UP  (Pain #4, #5, #8)  ← retention/expansion
      ├── Lease/inspection/compliance date calendar
      ├── Room-turnover wizard (move-out proration → new tenant onboarding)
      └── Maintenance log (via the same no-login link)
```

**The strategic fork (the one real disagreement — decide this consciously):**

| | **Path A — "Collection-first" (universal wedge)** | **Path B — "Rooming-house OS" (segment pivot)** |
|---|---|---|
| **Champions** | DeepSeek, Qwen, Claude | Z.ai (both docs) |
| **Move** | Build arrears/collection + pay-through for *all* self-managed room-renters | Reposition around licensed rooming-house compliance (RTBA/bond/VCAT), price per-room A$15–25 |
| **Upside** | Broadest TAM, keeps A$10/property, lowest new-scope | 2–5× revenue/door, regulatory moat, high WTP |
| **Risk** | Payment rails are hard; revenue still capped at A$10/door | Small, hard-to-size segment; heavy compliance build; needs deep AU-state work |
| **Evidence confidence** | High (collection pain is unanimous) | Medium (segment size unproven) |

**Recommended resolution (detailed in Artefact 2):** Do **Path A now** (collection is the unanimous, highest-confidence pain and serves everyone), and run **Path B as a validated bet** — reposition the *already-built* locked bill as tribunal/bond evidence (cheap) and interview licensed operators to size per-room WTP before committing compliance engineering. This sequences the safe universal wedge first and buys the option on the higher-ceiling pivot without betting the company on unproven sizing.

---

## 9. Disconfirmation summary — what the evidence found *against* us

Per the brief, every run hunted for evidence we're wrong. The strongest disconfirming signals:
1. **The biggest pain isn't the one we built for.** Collection > calculation, unanimously.
2. **Many operators don't split bills at all** (bills-inclusive dominant) — the core feature is irrelevant to a large slice of the assumed ICP.
3. **We are not the only one splitting bills** (Smart RentHub, Plinthos, InvestorJoint) and the incumbent already ships AI ingestion (PropertyMe Bills AI). Two "unique" assumptions fall.
4. **Splitting may not even help collection** — a landlord literally asked *"how does splitting the bills make it any easier to get tenants to pay?"*
5. **Splitwise is "good enough" and free** for the tenant side; switching-awareness cost is high.
6. **A$10/property caps the business** below venture scale without a new lever.

None of these kill the product. Together they say: **keep the well-built trust engine, but move the product's job from splitting to collecting-and-proving, and narrow the ICP.**

---

## 10. Open questions → primary-research plan (do this next)

Desk research took us as far as it honestly can. Four numbers still gate the roadmap and need **10–12 real operator interviews** (the founding-member conversations already planned):

| # | Open question | Why it matters | Method |
|---|---|---|---|
| 1 | Which pain is genuinely #1 for a *paying* operator — collection, vetting, or compliance? | Decides Path A vs B emphasis | 10 operator interviews, laddering to money |
| 2 | What % of target operators itemise-and-split vs bundle bills into rent? | Decides if the split engine is core or niche | Interviews + Flatmates/Gumtree listing scan |
| 3 | Real WTP: A$10/property vs A$15–25/room for compliance | Decides pricing metric before Stripe hardens | Van Westendorp / 10 founding-member offers (yeses ÷ 10) |
| 4 | Will tenants actually *pay through* a Settleroo link (vs just view)? | The crux of the collection expansion | Prototype test with 3 operators' tenants |

**Guardrail:** the recommendation to re-sequence toward collection is HIGH-confidence and safe to start (it's the unanimous top pain). The Path B *compliance pivot* and any *pricing metric change* are MEDIUM-confidence — validate with interviews 1–3 before committing engineering or repricing.

---

*Evidence base spans four independent runs. Full source lists live in each agent's report under `user_research/{Claude,Qwen,Z.ai,Deepseek}/`. Strongest primary evidence: Z.ai main doc (40 cited forum URLs). Note: DeepSeek flagged several of its quotes as "synthetic reconstruction" — those are treated as directional, not verbatim.*
