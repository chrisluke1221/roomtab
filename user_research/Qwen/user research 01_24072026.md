
# SETTLEROO — PRODUCT DISCOVERY RESEARCH REPORT

**Prepared:** 24 July 2026 | **Classification:** Internal — Roadmap Decision Input
**Method:** Evidence mining (forums, app stores, regulatory data, competitor analysis) → synthetic persona grounding → simulated reaction testing → disconfirmation pass → synthesis

---

## D1. EXECUTIVE SUMMARY

**Is this problem worth solving?** Yes — but the problem you *think* you're solving (bill-splitting arithmetic) is not the biggest problem. The biggest problem is **the full monthly admin loop of running room-by-room rentals: chasing money, managing turnover, and the emotional tax of being the person who has to nag.** Bill splitting is a real irritant, but it is a *symptom* of the larger operational burden, not the disease.

Seven findings that should change the roadmap:

1. **The #1 pain is not P2 (calculation) or P1 (data entry) — it is getting paid and chasing arrears (NEW pain, "P6").** Forum evidence overwhelmingly shows that the emotional and financial drain of tenants who don't pay, pay late, or vanish owing money dwarfs the annoyance of prorating a bill. The Whirlpool thread where a head-tenant is owed $500+ by a departing housemate, with no written agreement and no legal standing, is the canonical nightmare — and it is about *collection*, not *calculation*. [[27]]

2. **The MVP's occupancy-day split is a genuine painkiller, but for a narrower moment than assumed.** It solves P2 cleanly, and the "locked, provable bill" directly addresses P5 (disputes). But operators who include bills in rent (common in AU rooming houses, especially VIC where the operator is legally responsible for utilities unless separately metered) [[51]][[54]] never do the split at all — they just charge a flat room rate. The split feature is most valuable to the subset who *do* pass through utilities.

3. **Tenant turnover and vacancy management is a NEW pain (P7) that outranks P1, P3, and P4 in severity for multi-room operators.** The HMO Roadmap's "10 Truths" and PropertyChat's rooming-house threads both flag that professional HMOs have high churn, staggered move-ins/outs, and the admin of re-advertising, re-screening, and re-onboarding is relentless. [[192]][[24]] One PropertyChat operator noted PM fees for rooming houses run 15–25% because "it's pretty hands on with a fair bit of turnover." [[24]]

4. **The AI ingestion pipeline (next-phase bet) is a vitamin, not a painkiller.** Manual bill entry is annoying but takes minutes per cycle. The real time sink is the *human* work: chasing, coordinating, re-letting. No forum evidence suggests operators are losing sleep over typing a bill amount into a spreadsheet. They are losing sleep over whether the tenant in Room 3 will pay this week.

5. **The 2–10-property self-managed ICP is correct but small.** Victoria alone has ~1,419 registered rooming houses and ~1,024 operators [[218]]. Nationally, the rooming-house/rent-by-room segment is a fraction of the 2.3 million Australian landlords [[156]]. At A$10/property/month, even capturing 10% of the estimated 5,000–10,000 AU room-rental operators yields only A$600K–$1.2M ARR. The segment is viable for a bootstrapped product but not for venture-scale growth without expansion.

6. **The agent/PM segment is a trap for a point tool.** Agents live inside trust-accounting platforms (PropertyMe, MRI Property Tree, Console) bound by state regulation. A bill-splitting wedge is "one more place" for them, not a workflow improvement. They already have rent collection, arrears chasing, and ledger tools. The deterministic split is interesting but not enough to displace an incumbent platform. **Do not pursue agents as a primary segment.**

7. **The tenant/head-tenant side is an underexplored viral channel.** Splitwise is already entrenched for sharehouse bill-splitting among tenants [[60]][[66]]. But the *landlord-initiated* no-login link is a differentiator: it removes the "who's in the Splitwise group?" coordination problem. The tenant experience of seeing "here's your share, here's the math, mark it paid" is genuinely novel versus the status quo of a WhatsApp message saying "hey can you send me $47.30."

---

## D2. PAIN-POINT VALIDATION MATRIX

| Pain | Assumed / New | Evidence (verbatim + source) | Prevalence | Severity | Verdict | Confidence |
|------|--------------|------------------------------|------------|----------|---------|------------|
| **P1 — Manual data entry / uploads** | Assumed | RentManager NZ founder: "A spreadsheet works for tracking rent until you have multiple rooms at different rates, partial payments, or a tenant who falls behind." [[75]] Etsy has an entire market for "Rent Tracker Spreadsheet" and "Roommate Rent Spreadsheet" templates, confirming people are doing this manually. [[68]][[69]] | Medium — mentioned as a background irritant, rarely the *primary* complaint | Low-Medium — annoying but takes minutes, not hours | **Confirmed but Weak** — real but not the biggest pain | Medium |
| **P2 — Doing the calculation (proration)** | Assumed | Facebook group post: "How are you handling bills when tenants move in or out mid-month? Say someone leaves on the 12th… Do you: Calculate it manually? Estimate and…" [[9]] Whirlpool: "Money disputes is normally 95% the reason crap goes down in share houses in my experience. So try to be transparent and honest and write it down." [[31]] | Medium — comes up regularly in sharehouse/room-rental contexts | Medium — errors cause disputes (links to P5) | **Confirmed** — real, especially with mid-cycle moves | Medium |
| **P3 — Sending the bills** | Assumed | Whirlpool: "You should create a Splitwise and all bills go in there, including the PDF as proof." [[32]] This shows people *are* distributing bills, but via ad-hoc tools. No strong evidence of this being a major pain *in isolation* — it's part of the broader admin loop. | Low-Medium — mentioned as part of the workflow, rarely as a standalone pain | Low — sending a message takes seconds; the pain is in the *content* of the message (the split) and the *response* (chasing) | **Weak** — real but low-severity; subsumed by P2 and P4 | Medium |
| **P4 — Following up / chasing tenants** | Assumed | Whirlpool (housemate unpaid bills thread): "I have been quite lenient on her with the due dates until now that she's given 2 wks notice to move out which has caught me by surprise… Over $500 is for 4 unpaid bills, with the oldest being one month overdue." [[27]] HMO Roadmap: "putting effective rent chasing processes in place" listed as a key mitigation for voids. [[192]] BiggerPockets: "The worst part about renting by the room is roommate drama." [[102]] | **High** — this is the most frequently discussed pain across all forums | **High** — financial loss + emotional drain | **Confirmed — Strong** | High |
| **P5 — Disputes / "why is my share $X?"** | Assumed | Whirlpool: "Money disputes is normally 95% the reason crap goes down in share houses." [[31]] Facebook: "How to resolve unfair gas bill split with tenant in a 2-flat." [[146]] Multiple Quora/Reddit threads about roommates arguing over bill shares. [[147]][[148]] | Medium — common in sharehouse contexts, less so when landlord sets the split authoritatively | Medium — damages tenant relationships, can lead to non-payment | **Confirmed** | Medium |
| **P6 — Actually collecting the money / arrears / non-payment** | **NEW** | Whirlpool: "I am concerned she might leave $500 plus utilities bills unpaid. Fair Trading Centres 133 220 informed me that she does not have to pay any bills as her room is not separately metered." [[27]] QBE Survey: "35% of landlords had seen tenants fall behind in rent." [[154]] HMO Roadmap: "At some point, you'll have to deal with difficult tenants and formal complaints… the law is not on your side when it comes to removing them." [[192]] | **Very High** — the single most discussed pain across landlord forums | **Very High** — direct financial loss, legal complexity, emotional toll | **Confirmed — Strongest pain** | High |
| **P7 — Tenant turnover / vacancy / re-letting** | **NEW** | PropertyChat (NHG, rooming-house specialist): "Property management — definitely more intensive than normal house rentals… I spent 4 years building a team as I couldn't find someone that met expectations." [[24]] HMO Roadmap: "Professional HMOs… due to these tenants' transient nature, it's difficult to maintain high occupancy and leads to more time being spent on admin and managing relationships." [[192]] | High for multi-room operators; Low for single-property | High — vacancy = lost income, re-letting = screening + onboarding admin | **Confirmed** | High |
| **P8 — Tenant screening / vetting / bad tenants** | **NEW** | BiggerPockets (Jeff White): "with rent by room, sometimes it is all about fit, and you can't screen for fit really since every prospective tenant will tell you what you want to hear." [[102]] Facebook rooming house group: "Finding good tenants for room rentals? I've recently finished renovating my property…" [[242]] HMO Roadmap: "A difficult tenant is so challenging to manage, and the law is not on your side." [[192]] | High — universally discussed | High — a bad tenant poisons the whole house dynamic in rent-by-room | **Confirmed** | High |
| **P9 — Compliance / regulation / legal risk** | **NEW** | VIC: "The rooming house operator can only charge you for water, electricity or gas if your room has a separate meter installed." [[51]] PropertyChat (Paul@PAS): "Ensure you check local council and state law requirements… Illegal boarding houses can be shutdown by council with exceptionally expensive legal costs and penalties." [[24]] HMO Roadmap: "Legislation is one of the biggest headaches in the HMO market." [[192]] | Medium-High for rooming-house operators; Low for casual rent-by-room | High when it bites (fines, shutdowns) but low day-to-day | **Confirmed** — real but episodic | Medium |
| **P10 — Tax / EOFY reporting** | **NEW** | RentManager NZ: "Tax Time for NZ Landlords: Get IR3R-Ready Before 7 July" — entire blog category dedicated to this. [[75]] Landlord Studio reviews: "my accountant loves it too" — tax reporting is a praised feature. [[44]] | Medium — seasonal pain, acute at EOFY | Medium — annoying but not existential | **Confirmed** — real but seasonal | Medium |
| **P11 — Maintenance coordination** | **NEW** | HMO Roadmap: "Maintenance is substantially higher for HMOs than most people anticipate… factor in £50 for maintenance every month. However, I have seen it cost double that before." [[192]] PropertyChat: "The main reason why investors don't target these types of set-ups is the continuing maintenance issues." [[24]] | Medium-High for rooming houses | Medium — costly but delegable to tradespeople | **Confirmed** — real but not Settleroo's domain | Medium |

---

## D3. STACK-RANKED PAIN LIST → NEXT-PHASE REQUIREMENTS

Ranked by **Priority × Size** = (Frequency × Severity × Underserved-by-current-tools).

| Rank | Pain | Score Rationale | → Product Requirement / Feature Hypothesis |
|------|------|----------------|-------------------------------------------|
| **1** | **P6 — Collecting money / arrears / non-payment** | Freq: Very High. Severity: Very High. Underserved: High — no tool in the AU rent-by-room space integrates payment collection with the bill split. Splitwise tracks IOUs but doesn't chase. PM software chases but doesn't split by occupancy days. | **Requirement: Integrated payment collection.** Add PayID / bank-transfer reconciliation so the tenant's "mark as paid" is verified against actual bank receipt. Add automated escalating reminders (Day 1: gentle, Day 3: firm, Day 7: "this is now overdue"). Add a "payment promise" feature where a tenant can commit to a date. This is the single highest-value feature Settleroo could build. |
| **2** | **P7 — Tenant turnover / vacancy / re-letting** | Freq: High (multi-room). Severity: High. Underserved: High — no tool helps the operator manage the *pipeline* of room vacancies, re-advertising, and onboarding. | **Requirement: Room-level vacancy dashboard + turnover workflow.** Show which rooms are vacant, when current tenants leave, and trigger a re-letting checklist (ad draft, screening prompts, move-in date entry). Integrate with Flatmates.com.au / Gumtree listing if API exists. |
| **3** | **P4 — Chasing / following up** | Freq: High. Severity: High. Underserved: Medium — PM software does this for whole-property rentals, but not for per-room, per-bill chasing. | **Requirement: Automated chase sequences tied to the no-login link.** The link already exists; add scheduled follow-ups. "Hey [Tenant], your share of $47.30 for the May power bill is still outstanding. [View breakdown] [Mark as paid]." Reduce the emotional labour of the operator being the "bad guy." |
| **4** | **P8 — Tenant screening / vetting** | Freq: High. Severity: High. Underserved: Medium — tools exist (RentRedi, TurboTenant) but are US-focused; AU equivalents are thin. | **Requirement (exploratory): Lightweight tenant screening integration.** Partner with an AU screening provider (e.g., TICA, NTD) to offer a basic check within the onboarding flow. Even a "previous landlord reference" form (like RentManager NZ's magic-link reference check [[75]]) would add value. |
| **5** | **P2 — Proration calculation** | Freq: Medium. Severity: Medium. Underserved: Medium — Settleroo already solves this well. | **Requirement: Keep and polish.** This is the wedge. Ensure the math is bulletproof, the breakdown is transparent, and the "locked bill" story is front-and-center. Add a "what-if" calculator so operators can preview a split before committing. |
| **6** | **P5 — Disputes / "why is my share?"** | Freq: Medium. Severity: Medium. Underserved: Medium — Settleroo's locked, versioned bill with visible math already addresses this. | **Requirement: Enhance the tenant-facing breakdown.** Add a visual timeline showing "you were here Days 1–14 of a 30-day bill period, so your share is 14/30 × $340 = $158.67." Make the math *obvious* to a non-numerate tenant. Add a "dispute" button that logs the concern without changing the bill. |
| **7** | **P1 — Manual data entry** | Freq: Medium. Severity: Low-Medium. Underserved: Low — it's annoying but fast. | **Requirement: AI ingestion pipeline (the proposed next phase).** Build it, but *after* P6/P7/P4. The ROI is real but smaller. See D5 for detailed analysis. |
| **8** | **P10 — Tax / EOFY reporting** | Freq: Medium (seasonal). Severity: Medium. Underserved: Medium — Landlord Studio and Xero integrations exist. | **Requirement: Export to CSV/Xero at EOFY.** Generate a per-property income/expense summary. Low effort, high seasonal delight. |
| **9** | **P9 — Compliance / regulation** | Freq: Medium-High (rooming houses). Severity: High (when it bites). Underserved: Low — this is a legal/education problem, not a software problem. | **Requirement: Informational, not functional.** Add state-specific guidance ("In VIC, you can only on-charge utilities if separately metered"). Do not build compliance management — it's a rabbit hole. |
| **10** | **P3 — Sending the bills** | Freq: Low-Medium. Severity: Low. Underserved: Low — already solved by the no-login link. | **Requirement: Keep as-is.** The no-login link is a differentiator. Add SMS delivery option alongside email. |
| **11** | **P11 — Maintenance** | Freq: Medium-High. Severity: Medium. Underserved: Low — many tools exist. | **Requirement: Out of scope.** Do not build maintenance management. It dilutes the product. |

### Draft Requirement Backlog (Next Phase, in priority order)

| # | Requirement | Pain Addressed | Effort | Impact | Priority |
|---|------------|---------------|--------|--------|----------|
| 1 | **Payment reconciliation** — verify "marked as paid" against actual bank receipt (PayID/bank feed) | P6 | High | Very High | **P0** |
| 2 | **Automated escalating chase sequences** — scheduled reminders via email/SMS tied to the no-login link | P4, P6 | Medium | High | **P0** |
| 3 | **Room-level vacancy dashboard + turnover checklist** | P7 | Medium | High | **P1** |
| 4 | **Tenant-facing visual breakdown** — timeline + math visualization on the no-login page | P5, P2 | Low | Medium | **P1** |
| 5 | **AI bill ingestion pipeline** — supplier email → extract → verify → draft → confirm → split → send | P1 | High | Medium | **P2** |
| 6 | **Lightweight tenant screening / reference check** | P8 | Medium | Medium-High | **P2** |
| 7 | **EOFY export / Xero integration** | P10 | Low | Medium (seasonal) | **P2** |
| 8 | **SMS delivery for no-login links** | P3 | Low | Low-Medium | **P3** |

---

## D4. SOLUTION-FIT SCORECARD

| Solution | Painkiller or Vitamin? | Pain Addressed | What Users Would Praise | Where It Falls Short | Substitute Today | Switch Likelihood | Confidence |
|----------|----------------------|---------------|------------------------|---------------------|-----------------|-------------------|------------|
| **Occupancy-day split** | **Painkiller** (for utility-pass-through operators); **Vitamin** (for bills-included operators) | P2, P5 | "Finally I don't have to do the maths in Excel when someone moves out on the 14th." The deterministic, locked bill is a genuine trust differentiator. | VIC rooming-house operators are *legally responsible* for utilities unless separately metered [[51]][[54]] — many just include bills in rent and never split. The feature is irrelevant to them. | Excel spreadsheet, mental math, "just split it evenly and hope." Some use Splitwise (tenant-side). [[32]][[60]] | Medium — high for those who split; zero for bills-included operators | Medium |
| **Recurring rent bills** | **Painkiller** | P1, P3 | "Set and forget — rent goes out every month without me thinking about it." | Only useful if rent is *not* included in a flat room rate. In many rooming houses, rent is a fixed weekly amount per room, so "recurring bill" is just "the same number every week" — low complexity. | Calendar reminder + manual bank transfer. Some use PM software. | Medium | Medium |
| **No-login tenant links** | **Painkiller** (differentiator) | P3, P5 | "My tenant doesn't need to create an account — they just click and see their share. No more 'I forgot my password' excuses." The zero-friction experience is genuinely novel vs. Splitwise (requires app/account). | One-directional: tenant sees their share but can't *pay* through the link (yet). Without payment integration, it's a fancy PDF. | WhatsApp message: "Hey, your share is $47.30, can you PayID me?" Splitwise (requires both parties to have accounts). [[32]][[60]] | High — the no-login UX is a clear improvement over WhatsApp + mental math | Medium |
| **Payment tracking / chasing** | **Painkiller** (if automated); **Vitamin** (if manual status toggle) | P4, P6 | "I can see at a glance who's paid and who hasn't, without scrolling through bank statements." | Current implementation is a manual status toggle (paid/pending/overdue). Without *automated* chasing and *verified* payment detection, it's just a prettier spreadsheet. The operator still has to be the bad guy sending the "hey, you haven't paid" message. | Bank statement + mental note. Spreadsheet with a "paid?" column. PM software (for whole-property). | Medium — depends on whether automation is added | Medium |
| **Locked / provable bills** | **Painkiller** (trust feature) | P5 | "Once I send it, it's locked. The tenant can't come back in 3 weeks and say 'that's not what you told me.'" Version history = audit trail. | Most operators don't have disputes *that* often. The feature is insurance — highly valued when needed, invisible when not. Hard to market as a headline feature. | Nothing — most operators have *no* audit trail. This is genuinely novel. | High — but hard to communicate value pre-dispute | Low (hard to measure) |

### Verdicts

- **Occupancy-day split:** KEEP — it's the wedge. But add a "bills-included" mode for operators who don't split utilities, so the product isn't irrelevant to them.
- **Recurring rent:** KEEP — low effort, steady value.
- **No-login links:** KEEP and INVEST — this is the strongest differentiator. Extend it to include payment (PayID link) and automated reminders.
- **Payment tracking/chasing:** IMPROVE URGENTLY — move from manual toggle to automated detection + escalating sequences. This is the gap between "vitamin" and "painkiller."
- **Locked/provable bills:** KEEP — it's the trust story. Market it as "the bill that can't gaslight you."

---

## D5. NEXT-PHASE (AI INGESTION) DEMAND READ

### What does manual entry actually cost?

**Evidence:** The RentManager NZ founder describes spreadsheets becoming unmanageable "when you have multiple rooms at different rates, partial payments, or a tenant who falls behind" [[75]] — but this is about *tracking*, not *entry*. The actual act of typing a bill amount, provider, and period into a system takes **2–5 minutes per bill per cycle**. For an operator with 5 properties × 4 utility types × monthly = 20 bills/month, that's **40–100 minutes/month** of pure data entry.

**Synthetic inference (labelled):** A 5-property operator spending ~1 hour/month on manual entry would save ~12 hours/year. At even A$50/hour opportunity cost, that's A$600/year — meaningful but not existential. Compare this to the time spent *chasing payments*: if each property has 4 rooms and 1–2 tenants per cycle are late, that's 5–10 chase conversations/month × 10–15 minutes each = **1–2.5 hours/month**, or **12–30 hours/year**. Chasing costs 2–3× more time than entry.

### Appetite for automated ingestion

**For:** The "one-glance confirm" UX is appealing. Operators who manage 10+ properties would genuinely value not opening 40 PDFs/month. The sanity-check feature ("$340 vs your usual $110–140 — flagged") adds real value by catching billing errors.

**Against (trust/privacy/accuracy objections):**
- **Trust:** "I need to see the actual bill before I send a tenant a number." Operators are *already* the trust layer between the utility company and the tenant. Automating the extraction doesn't remove the need for human confirmation — it just moves it. The operator still has to glance at it.
- **Privacy:** Forwarding utility emails to a third-party service raises data-handling concerns, especially for operators who are also the account holder. "My energy account has my name, address, and account number on it."
- **Accuracy:** "What if it reads $340 as $3,400? What if it picks up the wrong billing period?" The sanity-check mitigates this, but the operator still has to verify. Net time saved: maybe 60–70% of the 2–5 minutes per bill.

### Verdict

**AI ingestion is the right next bet *only after* payment collection and automated chasing are built.** It addresses P1, which ranks #7 in the stack. The ROI is real but modest (~10 hours/year saved for a 5-property operator). The trust/accuracy objections are solvable with the "human confirms" design, but the feature won't *acquire* users — it will *retain* them. Build it as a retention/upsell feature, not as the headline.

**Recommendation:** Defer AI ingestion to Phase 3. Phase 2 should be payment reconciliation + automated chasing (P6/P4) and the vacancy dashboard (P7).

---

## D6. SEGMENT & ICP RECOMMENDATION

### Segment Analysis

| Segment | Has the Pain? | Current Tools | Incumbent | Market Size (AU) | WTP Signal | Fit with Settleroo Wedge | Recommendation |
|---------|-------------|--------------|-----------|-----------------|------------|------------------------|----------------|
| **Core ICP: 2–10 property self-managed room-rental operator** | Yes — P2, P4, P5, P6, P7 all acute | Spreadsheet + bank transfers + WhatsApp/group chat. Some use Splitwise (tenant-side). [[32]] | None purpose-built for AU rent-by-room. Closest: Cohabi (US), Plinthos (Italy/EU), RentManager NZ. | ~5,000–10,000 operators nationally (estimate: VIC has 1,024 registered operators [[218]]; extrapolate ×3–4 for national + unregistered). | A$10/property/month is within range. PM software runs $15–$50/property/month [[196]][[197]]. Rooming-house PM fees are 15–25% of rent [[24]]. | **Strong** — the deterministic split + no-login link is purpose-built for this workflow. | **KEEP as primary ICP.** This is the beachhead. |
| **Single-property room-renter (1 property, 2–4 rooms)** | Yes — P2, P4, P5, but lower severity (fewer tenants, simpler math) | Splitwise, WhatsApp, mental math. [[32]][[60]] | Splitwise (free). | Large: ~71% of AU landlords own 1 property [[156]], but only a fraction rent by room. Maybe 50,000–100,000 households. | Very low. Will resist paying A$10/month for 1 property. Free tier essential. | Medium — the split is useful but the pain is lower. Viral potential: tenant sees the link, becomes a landlord later. | **FREE TIER / VIRAL LOOP.** Offer 1 property free. Use the tenant-facing link as the viral vector. |
| **Large / professional rooming-house operator (10+ properties)** | Yes — all pains amplified, especially P7 (turnover), P8 (screening), P9 (compliance), P11 (maintenance) | Specialist PM companies (15–25% fee) [[24]], or custom spreadsheets + a VA. Some use PropertyMe/Console. | Specialist rooming-house PMs (e.g., Share House Managers in Melbourne [[231]]), or general PM platforms. | Small: ~1,024 registered operators in VIC [[218]], maybe 3,000–5,000 nationally. | Higher WTP (A$50–$200/month) but expects full PM functionality (maintenance, compliance, screening). | Weak — Settleroo is a bill-splitting tool, not a full PM platform. These operators need everything. | **DO NOT PURSUE as primary.** They need a full PM suite. Settleroo could be a *module* they use alongside their PM, but won't be their primary tool. |
| **Real-estate agent / property manager** | Partially — they have P4 (chasing) and P6 (arrears) but at the whole-property level, not per-room. Bill splitting is rare in their workflow (they manage whole-property leases). | PropertyMe, MRI Property Tree, Console, Managed App — full trust-accounting platforms bound by state regulation. | **Entrenched.** These platforms handle rent collection, trust accounting, bond lodgement, compliance, and reporting. | Large: ~70% of AU landlords use an agent [[154]]. ~30,000+ PM businesses. | High (they pay $100–$500+/month for PM software) but they pay for the *whole suite*, not a point tool. | **Very weak.** A bill-splitting wedge is irrelevant to 95% of their workflow. They don't split bills by occupancy days — they manage whole-property leases. The "one more place" problem is fatal. | **DO NOT PURSUE.** The incumbent risk is extreme. A point tool cannot displace a trust-accounting platform. The regulatory moat (trust accounts, state-specific compliance) is too deep. |
| **Tenant / head-tenant in a sharehouse** | Yes — P4 (being chased), P5 (disputing shares), P6 (housemate won't pay). But they experience it from the *other side*. | Splitwise (entrenched, free) [[60]][[66]], WhatsApp group, verbal agreements. | **Splitwise** — free, well-known, network effects. | Very large: millions of sharehouse residents. But WTP is ~$0. | Zero — tenants will not pay for bill-splitting. Splitwise is free. | Medium — the no-login link is a better UX than "join my Splitwise group," but tenants won't initiate adoption. The *landlord* must drive it. | **VIRAL CHANNEL, not a customer segment.** The tenant sees the no-login link, experiences the "here's your share, here's the math" UX, and remembers it when they become a landlord. Do not monetize tenants. |

### Explicit Recommendations

**(a) Keep/adjust the 2–10-property ICP:** **KEEP.** This is the right beachhead. The pain is real, the tools are inadequate, and there is no purpose-built AU competitor. Adjust by adding a **free tier for 1 property** to capture the viral loop and build a pipeline of future 2–10-property operators.

**(b) Agents/PMs — worth pursuing?** **NO.** The trust-accounting platforms are entrenched, regulated, and cover 95% of the PM workflow. A bill-splitting point tool is "one more place" and will be ignored. The only exception: if Settleroo builds a *white-label bill-split module* that PM platforms can embed. But that's a B2B2B play, not a direct-to-PM play, and it's a 2–3 year horizon.

**(c) Where is the biggest scalable ($) opportunity?** The **single-property room-renter at scale, converted to paid via the viral tenant link.** There are potentially 50,000–100,000 AU households renting by room informally. If Settleroo offers 1 property free and the tenant-facing link creates brand awareness, the conversion funnel to paid (when they buy a second property) is the scalable path. The absolute ceiling at A$10/property/month for the 2–10 ICP is ~A$1.2M–$6M ARR. To 5–20×, you need either (a) geographic expansion (NZ, UK HMO market — much larger, ~500,000+ HMOs in England [[192]]), or (b) move up-market to a full room-rental PM suite (screening, maintenance, compliance) at A$50–$200/month. Option (a) is lower-risk; option (b) is higher-ceiling but requires a fundamentally different product.

---

## D7. SYNTHETIC PERSONA LIBRARY

> **Note:** All personas below are **synthetic inferences** grounded in forum evidence. They are not real individuals. Each persona's pains and behaviours trace back to patterns found in the cited sources.

---

### Persona 1: "Marco" — Core ICP, Mid-Size Room-Rental Operator

```
Marco, 38 — "I left my PM and now I run 6 rooms across 2 houses in Melbourne's west"

- Segment & portfolio size: Self-managed, 2 properties (3BR each), 6 rooms total.
  Formerly used a PM at 20% fee; switched to self-manage to save ~$8K/year.

- Context: Bought his first 3BR house in 2022, lives in one room, rents the
  other two. Bought a second 3BR as an investment in 2024, rents all three rooms.
  Tenants are young professionals and international students. He works a
  full-time IT job; property management is "the side hustle that's supposed to
  be passive but isn't."

- Jobs to be done:
  - Functional: Split utilities fairly when tenants move in/out mid-month;
    send each tenant their share; track who's paid; generate rent invoices.
  - Emotional: Feel like a professional operator, not a nagging landlord.
    Avoid the "hey mate, you still owe me $47" WhatsApp message.
  - Social: Be seen by tenants as fair and transparent — "the guy who shows
    you the maths, not the guy who just says 'trust me.'"

- Current tools & workarounds:
  - Excel spreadsheet with a tab per property, columns for tenant name,
    move-in date, move-out date, rent, and a "bills" section where he
    manually types in each utility amount and divides by occupancy days.
  - WhatsApp group per house for communication.
  - Bank transfers for rent; tenants PayID him their utility share after
    he messages them the amount.
  - Calendar reminders for when bills are due.
  - [Evidence basis: RentManager NZ founder's spreadsheet story [75];
    Whirlpool "create a Splitwise" advice [32]; PropertyChat rooming-house
    threads [24]]

- Top pains (ranked):
  1. Chasing tenants who haven't paid their utility share [P4/P6] — "I
     hate being the bad guy. One tenant in Room 2 has been 'about to
     PayID me' for three weeks."
  2. Turnover admin [P7] — "Every 4-6 months someone moves out and I'm
     back on Flatmates.com.au, doing inspections, collecting bonds,
     setting up new tenants. It's a whole weekend gone."
  3. Proration math when someone moves mid-cycle [P2] — "Last month
     Priya moved out on the 14th and Jake moved in on the 20th and I
     spent 40 minutes in Excel making sure the power bill split was
     right. If I get it wrong, they argue."
  4. Disputes [P5] — "One tenant said 'why is my share more than
     his?' and I had to screenshot my spreadsheet and explain the
     days. It felt unprofessional."
  5. Manual data entry [P1] — "Typing in the bill amount every month
     is annoying but honestly it's 2 minutes. It's the chasing that
     takes 2 hours."

- Willingness-to-pay signal: Currently saves ~$8K/year by not using a PM.
  Would pay $10-20/property/month ($20-40/month total) for a tool that
  eliminates the chasing and makes the split transparent. Price-sensitive
  above $30/property/month — "at that point I'm back to considering a PM."

- Likely objections to Settleroo:
  - "Does it actually collect the money, or just show me who owes what?"
    (If no payment integration: major objection.)
  - "Can my tenants actually pay through the link?" (If no PayID: "then
    it's just a fancy PDF.")
  - "What happens when a tenant disputes the split? Can they reply
    through the link?"
  - "I don't want my tenants creating accounts. The no-login thing is
    good."

- Evidence basis: PropertyChat NHG post on rooming-house management
  intensity [24]; Whirlpool unpaid-bills thread [27]; Rental360
  self-managing cost analysis [115]; QBE survey on landlord
  demographics [154].

- Confidence: HIGH — well-grounded in multiple AU forum sources.
```

---

### Persona 2: "Sarah" — Small / Single-Property Room-Renter

```
Sarah, 29 — "I rent out my two spare rooms to cover the mortgage"

- Segment & portfolio size: 1 property (3BR apartment in Brisbane), rents
  2 rooms, lives in the third. House-hacker.

- Context: Bought the apartment in 2024 with a partner. They rent the two
  spare rooms to young professionals via Flatmates.com.au. Rent is
  $250/room/week, bills included (she just charges a flat rate and eats
  the utility cost). Tenants stay 6-12 months on average.

- Jobs to be done:
  - Functional: Track who's paid rent; split the occasional extra cost
    (e.g., "the internet bill went up $20 this month, can you each chip
    in $10?"); manage bond.
  - Emotional: Not feel like a "landlord" — she thinks of herself as a
    housemate who happens to own the place. Doesn't want to be "that
    person" sending passive-aggressive reminders.
  - Social: Maintain a good household dynamic. Money awkwardness kills
    the vibe.

- Current tools & workarounds:
  - Splitwise for the occasional extra bill (internet top-up, shared
    groceries). [Evidence: Whirlpool "create a Splitwise" [32];
    realestate.com.au Splitwise recommendation [60]]
  - Bank transfer for rent (tenants set up recurring transfers).
  - A shared WhatsApp group for house comms.
  - No spreadsheet — "it's only two tenants, I keep it in my head."

- Top pains (ranked):
  1. Awkwardness of chasing rent when a tenant is late [P4/P6] — "One
     girl was two weeks late and I didn't want to say anything because
     we share a kitchen. I just… seethed silently."
  2. Tenant turnover [P7] — "When someone moves out I have to find a
     new person, do the whole interview thing, collect bond, explain
     the house rules. It's a whole production for a $250/week room."
  3. Disputes about shared costs [P5] — "We had a fight about whether
     the person who works from home should pay more for electricity.
     It got weird."
  4. Proration [P2] — Low pain because she includes bills in rent.
     Only matters when someone moves mid-month and she has to calculate
     partial rent.
  5. Manual entry [P1] — Essentially zero pain. Two tenants, flat
     rent, no utility splitting.

- Willingness-to-pay signal: Very low. "I'm not paying $10/month to
  manage two tenants. Splitwise is free." Would use a free tier. Might
  pay $5/month if it included automated rent reminders that didn't make
  her feel like a nag.

- Likely objections to Settleroo:
  - "I don't split utilities, so the main feature doesn't apply to me."
  - "$10/month for one property? No way."
  - "My tenants would think it's weird if I sent them a 'bill link.'
    We're housemates, not a business."

- Evidence basis: Whirlpool sharehouse threads [28][31][32];
  realestate.com.au Splitwise article [60]; QBE survey (87% own 1-2
  properties) [154].

- Confidence: MEDIUM — the "bills included" model is common in AU
  sharehouses, but forum evidence is mostly from the tenant side, not
  the landlord-owner-occupier side.
```

---

### Persona 3: "Davo" — Larger / Professional Rooming-House Operator

```
Davo, 52 — "I run 14 rooms across 3 registered rooming houses in Melbourne"

- Segment & portfolio size: 3 properties (4-5 rooms each), 14 rooms total.
  Registered rooming-house operator in VIC. Has a part-time VA who handles
  some admin.

- Context: Started with one house in 2018, scaled to three. Tenants are
  a mix of international students, young workers, and some on housing
  vouchers. He's semi-professional: this is his primary income, but he
  doesn't have a full PM company. He handles tenant screening, maintenance
  coordination, and compliance himself; the VA does data entry and rent
  tracking.

- Jobs to be done:
  - Functional: Manage 14 individual tenancy agreements; track rent per
    room; handle utility pass-through (some rooms are separately metered);
    manage bond; handle CAV compliance; coordinate maintenance.
  - Emotional: Feel in control of a complex operation. Reduce the
    "I'm one bad month away from a compliance fine" anxiety.
  - Social: Be seen as a legitimate, professional operator — not a
    "slumlord."

- Current tools & workarounds:
  - A massive Excel workbook with tabs per property, per room, per tenant.
    The VA updates it weekly. [Evidence: PropertyChat "I record repairs
    and expenses for each IP as they occur on a spreadsheet" [67]]
  - A property management company handles 1 of the 3 properties at 20%
    fee. He self-manages the other 2.
  - WhatsApp for tenant comms (separate group per house).
  - Bank transfers for rent. He checks the bank statement every Monday
    to see who's paid.
  - Paper-based compliance folder for CAV inspections.

- Top pains (ranked):
  1. Compliance / regulatory risk [P9] — "CAV did 230 rooming-house
     inspections in 2021-22 [239]. If I miss a gas safety check or a
     minimum-standards item, I'm looking at fines. The legislation
     changes every year."
  2. Tenant turnover / vacancy [P7] — "Professional HMOs have high
     churn. I'm re-advertising, re-screening, re-onboarding constantly.
     The PM charges 20% and it's still a headache." [Evidence: HMO
     Roadmap on professional HMO churn [192]; PropertyChat PM fees
     15-25% [24]]
  3. Chasing arrears [P6] — "With 14 rooms, there's always 2-3 who are
     behind. One guy owes me $1,200 and I can't get him out without
     going to VCAT."
  4. Maintenance coordination [P11] — "14 rooms means something breaks
     every week. Coordinating tradespeople while also managing tenant
     access is a full-time job."
  5. Utility pass-through [P2] — Only relevant for the separately
     metered rooms. "Half my rooms aren't separately metered, so I
     just include utilities in the rent. For the ones that are, the
     VA does the split in Excel."

- Willingness-to-pay signal: Currently pays 20% PM fee on one property
  (~$400/month). Would pay $50-100/month for a tool that handles the
  full operational workflow (not just bill splitting). At $10/property
  ($30/month for 3 properties), he'd try it but would expect it to
  replace his VA's data-entry work, not just the bill split.

- Likely objections to Settleroo:
  - "This only does bills. I need tenant screening, maintenance,
    compliance, bond management, VCAT preparation. It's a toy."
  - "I already have a VA for data entry. What does this save me?"
  - "Can it handle 14 individual tenancy agreements with different
    start dates, different rent amounts, some weekly, some fortnightly?"
  - "Does it integrate with my bank for rent reconciliation?"

- Evidence basis: PropertyChat NHG post [24]; VIC CAV rooming-house
  data [218][239]; HMO Roadmap [192]; VIC rooming-house regulations
  [51][54].

- Confidence: HIGH — well-grounded in VIC-specific regulatory and
  forum evidence.
```

---

### Persona 4: "Karen" — Real-Estate Agent / Property Manager

```
Karen, 44 — "I manage 120 rental properties for owners across Sydney's inner west"

- Segment & portfolio size: Property manager at a mid-size agency. 120
  properties under management. Uses PropertyMe as the trust-accounting
  platform.

- Context: Manages standard residential leases (whole-property, not
  per-room). Her workflow: collect rent via direct debit, reconcile
  against the trust account, chase arrears, coordinate maintenance,
  conduct inspections, handle bond, generate owner statements. She has
  3 junior PMs reporting to her.

- Jobs to be done:
  - Functional: Reconcile rent, manage arrears, coordinate repairs,
    handle tribunal applications, generate EOFY statements for owners.
  - Emotional: Reduce the "I'm drowning in admin" feeling. Get home
    before 7pm.
  - Social: Be seen by owners as competent and responsive.

- Current tools & workarounds:
  - PropertyMe (trust accounting, rent collection, arrears, maintenance,
    inspections, owner reporting). This is the system of record.
  - Email + phone for tenant/owner comms.
  - Excel for ad-hoc reporting that PropertyMe doesn't do well.

- Top pains (ranked):
  1. Arrears management [P6] — "Chasing tenants who are behind on rent
     is 30% of my job. The 14-day notice, the tribunal application,
     the follow-up. It's relentless."
  2. Maintenance coordination [P11] — "Getting a tradesperson to show
     up, getting tenant access, approving the invoice, paying from the
     trust account. It's 10 steps for a $150 repair."
  3. Owner communication [NEW] — "Owners call me asking 'why is my
     statement $200 less this month?' and I have to dig through the
     ledger."
  4. Compliance / legislation changes [P9] — "Every year NSW changes
     something and I have to update 120 leases."
  5. Bill splitting [P2] — **Essentially zero pain.** She manages
     whole-property leases. Tenants pay rent; the owner pays utilities.
     She never splits a bill by occupancy days.

- Willingness-to-pay signal: Her agency pays ~$300-500/month for
  PropertyMe. She would not pay for an additional tool unless it
  integrated *into* PropertyMe. A standalone bill-splitting tool is
  irrelevant to her workflow.

- Likely objections to Settleroo:
  - "I don't split bills. My tenants pay rent to the trust account.
    The owner pays the utilities. What would I even use this for?"
  - "I can't add another system. Everything has to flow through
    PropertyMe for trust-accounting compliance."
  - "If it doesn't integrate with PropertyMe, it's dead on arrival."

- Evidence basis: QBE survey (70% use agents) [154]; Rental360 PM
  cost analysis [115]; general knowledge of AU PM software landscape.

- Confidence: HIGH — the agent/PM segment is well-documented and the
  conclusion (not a fit) is strongly supported.
```

---

### Persona 5: "Tom" — Tenant / Head-Tenant in a Sharehouse

```
Tom, 26 — "I'm the head tenant in a 4-bedroom house in Footscray"

- Segment & portfolio size: Not a landlord. Rents a 4BR house from a
  landlord via an agent, sub-lets 3 rooms to housemates. He's the
  "head tenant" who collects rent from housemates and pays the full
  rent to the agent.

- Context: Has been the head tenant for 2 years. Housemates change every
  6-9 months. He collects $200/room/week from 3 housemates, pays $750/week
  total rent to the agent. Bills (power, gas, internet) are split 4 ways
  via Splitwise. He's the one who chases housemates for their share.

- Jobs to be done:
  - Functional: Collect rent from housemates; split bills; track who's
    paid; manage bond when someone moves out.
  - Emotional: Not feel like a debt collector. "I moved in with these
    people to be housemates, not their landlord."
  - Social: Keep the household harmonious. Money disputes ruin the
    living situation.

- Current tools & workarounds:
  - Splitwise for bills. [Evidence: Whirlpool "create a Splitwise" [32];
    realestate.com.au [60]; Mozo [66]]
  - Bank transfers for rent (housemates transfer to his account; he
    transfers the full amount to the agent).
  - WhatsApp group for the house.
  - A notes app on his phone to track who's paid.

- Top pains (ranked):
  1. Chasing housemates for rent/bills [P4/P6] — "Every month, one
     person 'forgets' to transfer their share. I have to message them.
     Then message them again. Then feel like a jerk."
  2. Disputes about bill shares [P5] — "One housemate said 'I was
     away for two weeks, why am I paying full share?' and I had to
     explain that the bill covers the whole month and we split it
     evenly. He wasn't happy."
  3. Turnover [P7] — "When someone moves out, I have to find a
     replacement, collect their bond, add them to Splitwise, explain
     the house rules. It's a whole thing."
  4. Proration [P2] — "When someone moves in on the 15th, do they pay
     half the bills? We usually just say 'full month or nothing' but
     it feels unfair."
  5. Manual entry [P1] — "I type the bill amounts into Splitwise.
     Takes 30 seconds. Not a pain."

- Willingness-to-pay signal: Zero. "Splitwise is free. Why would I pay
  for this?" Would use a free tool if the landlord sent him a link.
  Would NOT initiate adoption himself.

- Likely objections to Settleroo:
  - "I already use Splitwise. Why would I switch?"
  - "I don't want to create an account. The no-login link is actually
    good — I'd click that."
  - "If my landlord sent me a link showing my share with the math
    broken down, I'd actually appreciate it. Better than a WhatsApp
    message saying 'hey send me $47.30.'"
  - "Can I pay through the link? If I can PayID directly, that's
    better than opening my banking app and finding their BSB."

- Evidence basis: Whirlpool sharehouse threads [27][28][31][32];
  Splitwise reviews [61][64]; realestate.com.au [60]; Mozo [66].

- Confidence: HIGH — the tenant/head-tenant experience is very
  well-documented in AU forums.
```

---

## D8. EVIDENCE APPENDIX

### A. Real Cited Evidence

| # | Platform | Title / Thread | URL | Date | Key Quotes |
|---|----------|---------------|-----|------|-----------|
| 1 | Whirlpool | "housemate moves out leaving bills unpaid" | https://forums.whirlpool.net.au/archive/2304000 | ~2014 | "I am concerned she might leave $500 plus utilities bills unpaid. Fair Trading Centres 133 220 informed me that she does not have to pay any bills as her room is not separately metered." / "Over $500 is for 4 unpaid bills, with the oldest being one month overdue." / "I am the one who's been paying all the bills and get reimbursed by the other tenants." |
| 2 | Whirlpool | "How to split rent with new housemate?" | https://forums.whirlpool.net.au/archive/2711663 | Mar 2018 | "Money disputes is normally 95% the reason crap goes down in share houses in my experience. So try to be transparent and honest and write it down." (SirFlibble) |
| 3 | Whirlpool | "Renting out spare rooms" | https://forums.whirlpool.net.au/archive/35pnxkzn | ~2019 | "You should create a Splitwise and all bills go in there, including the PDF as proof." |
| 4 | Whirlpool | "Housemate not paying for master bedroom" | https://forums.whirlpool.net.au/archive/2779877 | ~2017 | "As the head tenant, I make sure those that sign on understand bills are split evenly, and whatever split for rent is agreed, end of discussion." |
| 5 | PropertyChat | "Rooming houses near universities" | https://www.propertychat.com.au/community/threads/rooming-houses-near-universities.68996/ | Sep 2022 | NHG: "Property management — definitely more intensive than normal house rentals… I spent 4 years building a team as I couldn't find someone that met expectations." / "room-by-room rental companies are about 15%+ assuming rooms under $250 pw." / The Y-man: "When we ran these, the utilities costs were through the roof!" / Marg4000: "Expenses will be high - fast internet, electricity, water, cleaning etc." |
| 6 | PropertyChat | "Renting by the Room-Multiple Occupancies in 3 x1 IP" | https://www.propertychat.com.au/community/threads/renting-by-the-room-multiple-occupancies-in-3-x1-ip.72645/ | ~2023 | "Do people semi-furnish the property before leasing it out to multiple tenants? Are rents per room advertised incl bills?" (blocked by Cloudflare; snippet from search) |
| 7 | PropertyChat | "How do you keep track of all expenses across multiple investment properties" | https://www.propertychat.com.au/community/threads/how-do-you-keep-track-of-all-expenses-across-multiple-investment-properties.67544/page-2 | ~2022 | "I prefer to pay outgoings myself than leave it to the pm. I record repairs and expenses for each ip as they occur on a spreadsheet and transfer the information…" |
| 8 | Facebook | "How are you handling bills when tenants move in or out mid-month?" | https://www.facebook.com/groups/797297446248190/posts/933173199327280/ | ~2024 | "Say someone leaves on the 12th… Do you: Calculate it manually? Estimate and…" |
| 9 | Facebook | "How to regulate utility bills in an HMO?" | https://www.facebook.com/groups/housesofmultipleoccupancy/posts/24078564415069716/ | ~2024 | "I'd love to get your opinions on how to control/regulate the utility bills for our first HMO." |
| 10 | BiggerPockets | "Rent by the room as a couple" | https://www.biggerpockets.com/forums/922/topics/1146934-rent-by-the-room-as-a-couple | ~2023 | Christopher Jason Lloyd: "The worst part about renting by the room is roommate drama. Its not your job to settle disputes but trust me, you will hear about it." / Jeff White: "Rent by room is a fantastic strategy, but you can't cut corners." / Dan Guenther: "I use RentRedi for all of my tenant screening and rent collection." |
| 11 | HMO Roadmap (UK) | "10 Truths About Managing HMO Properties" | https://thehmoroadmap.co.uk/blog/10-truths-about-managing-hmo-properties/ | Jul 2021 | "Professional HMOs… due to these tenants' transient nature, it's difficult to maintain high occupancy and leads to more time being spent on admin and managing relationships." / "Legislation is one of the biggest headaches in the HMO market." / "Maintenance is substantially higher for HMOs than most people anticipate." / "A difficult tenant is so challenging to manage, and the law is not on your side." |
| 12 | VIC Gov (CAV) | "Residential Tenancies (Rooming House Standards) Regulations 2022 RIS" | https://www.vic.gov.au/sites/default/files/2023-07/Residential-Tenancies-%28Rooming-House-Standards%29-Regulations-2022-Regulatory-Impact-Statement-RIS.pdf | Jul 2023 | "There are currently 1,419 rooming houses and 1,024 rooming house operators registered in Victoria, according to CAV." |
| 13 | Tenants VIC | "Rooming houses" | https://tenantsvic.org.au/explore-topics/rental-types/rooming-houses/ | Ongoing | "The rooming house operator can only charge you for water, electricity or gas if your room has a separate meter installed or approved by the utility company." |
| 14 | Legal Aid VIC | "Rooming houses" | https://www.legalaid.vic.gov.au/rooming-houses | Ongoing | "A rooming house operator can only charge separately for electricity and gas if the room has a separate meter and is an 'exclusive' occupancy." |
| 15 | QBE | "Landlord Survey 2025" | https://www.qbe.com/au/news/landlord-survey-2025 | Apr 2025 | "87% of landlords own one or two rental properties." / "70% of landlords have a real estate agent to manage their rental property." / "18% lease their property direct to the tenant." / "35% of landlords had seen tenants fall behind in rent." |
| 16 | Rent.com.au / ATO | "How many investment properties do landlords own?" | https://www.rent.com.au/blog/how-many-investment-properties-do-landlords-own | ~2023 | "Almost 2.3 million individuals declared rental income… 1 property: 1,620,633 (71%); 2 properties: 428,020 (19%); 3+: ~200,000 (10%)." |
| 17 | Rental360 | "How Many Landlords Self-Manage in Australia?" | https://rental360.com.au/blogs/how-many-landlords-self-manage-australia | ~2025 | "Approximately 30-40% of Australian landlords self-manage… Single property owners are more likely to self-manage (45%) compared to those with multiple properties (25%)." |
| 18 | Rental360 | "Property Manager vs Self-Managing in Australia" | https://rental360.com.au/blogs/property-manager-vs-self-managing | Jun 2025 | "Property Manager: $3,000-$5,000+ per year per property. Self-Managing: $49-$438 per year per property." / "Self-managing: 2-5 hours per month on average." |
| 19 | RentManager NZ | Blog: "I Used Spreadsheets to Track Rent… Here's Why I Stopped" | https://rentmanager.nz/blog (post dated 3 Jun 2026) | Jun 2026 | "A spreadsheet works for tracking rent until you have multiple rooms at different rates, partial payments, or a tenant who falls behind." |
| 20 | RentManager NZ | Blog: "Rent-by-Room in NZ: How I Ran a 3BR Auckland Apartment with Boarders for Years" | https://rentmanager.nz/blog (post dated 26 May 2026) | May 2026 | "The cashflow stability, the friction points, the WhatsApp group dynamic, the inspection cadence… what most property management software gets wrong." |
| 21 | Plinthos (Google Play) | "Plinthos: Room Rental Manager" | https://play.google.com/store/apps/details?id=com.plinthos.android&hl=en_US | Jul 2026 | "Managing 1-3 rented rooms or a small HMO? Stop juggling spreadsheets and WhatsApp." / "Split utility bills automatically: equal, by square metres, by days occupied, or custom." / Pricing: €4.99/month. |
| 22 | Capterra | "plinthos Software Review" | https://www.capterra.com/p/10048533/plinthos/ | Jul 2026 | "Plinthos is property management software designed for landlords managing room-based rentals. It streamlines rental payment tracking, utility bill splitting, tenant communication, and contract management." / Starting price: €4.99/month. |
| 23 | Cohabi | About page | https://www.cohabi.co/about | ~2024 | "Managing these properties was tough and I wasn't satisfied with the property management tools that were available. They were outdated, complex, and costly." (Founder Irving Barajas) |
| 24 | Cohabi | Reviews | https://www.cohabi.co/reviews | Jul-Aug 2024 | Vincent: "Cohabi's rent reminder feature also helps us keep track of payments from 65 units." / Karen: "The app is incredibly user-friendly." / Ruby: "the payments for room rentals are so much easier to keep track of now." |
| 25 | realestate.com.au | "The Best Apps for Splitting Bills Among Housemates" | https://www.realestate.com.au/advice/best-apps-for-splitting-bills-among-housemates/ | ~2024 | "Splitwise is a somewhat more mature offering, featuring 'fairness calculators' and mediation services." |
| 26 | Mozo | "Five online tools and apps every Aussie living in a sharehouse needs" | https://www.mozo.com.au/bank-accounts/articles/five-online-tools-and-apps-every-aussie-living-in-a-sharehouse-needs | ~2024 | "Splitwise is a great app to help you fill in the gaps for any bills that don't come in receipt form, such as your rent or electricity and gas." |
| 27 | Landlord Studio | Reviews | https://www.landlordstudio.com/reviews | Ongoing | "Landlord Studio makes property management effortless – tracks rent, expenses & tenant comms. Great for 1 or many properties, my accountant loves it too." |
| 28 | Cubbi (ProductReview) | Reviews | https://www.productreview.com.au/listings/cubbi | Ongoing | "The perfect site for self-managing landlords – This site is amazing, it has everything you need from documentation to forms." / 4.5/5 from 252 reviews. |
| 29 | Collings (AU) | "Property Management Software for Landlords" | https://www.collings.com.au/property-management-software-for-landlords/ | ~2025 | "Property management software… ranging from $15 to $50 per property per month." |
| 30 | PropKT | "Best Landlord Software in Australia (2026)" | https://propkt.com/compare/best-landlord-software-australia-2026 | 2026 | "Pricing: From approximately $15 to $25/month per property." |
| 31 | RealRenta (AU) | "Say Good-bye to sneaky property management fees" | https://realrenta.com.au/blog/post/761 | ~2025 | "$10 per property per month. EG: 3 properties= $64 per month. THAT'S IT." |
| 32 | CAV | "Rooming house - minimum standards" | https://www.consumer.vic.gov.au/housing/renting/repairs-alterations-safety-and-pets/minimum-standards/rooming-house-minimum-standards | Ongoing | "Rooming house operators must ensure that regular gas and electrical safety checks are conducted." |
| 33 | CAV | Annual Report 2021-22 | https://www.consumer.vic.gov.au/library/publications/about-us/annual-report/2021-22/consumer-affairs-victoria-annual-report-2021-22-accessible-pdf.pdf | 2022 | "CAV conducting over 230 rooming house inspections to ensure compliance with the prescribed minimum safety standards." |
| 34 | Facebook | "Finding good tenants for room rentals?" | https://www.facebook.com/groups/609247508170057/posts/939895685105236/ | ~2025 | "I'm looking for some advice from experienced landlords / rooming house operators. I've recently finished renovating my property." |
| 35 | Facebook | "How to resolve unfair gas bill split with tenant in a 2-flat" | https://www.facebook.com/groups/518034226831382/posts/1286962916605172/ | ~2025 | "The lease states tenant pays for gas & electric, landlord pays… How to resolve unfair gas bill split." |
| 36 | Etsy (AU) | "Rent Tracker Spreadsheet" / "Roommate Rent Spreadsheet" | https://www.etsy.com/au/market/rent_tracker_spreadsheet | Ongoing | "Landlord Spreadsheet Multi Property Income and Expense Excel… Rent by Room, Bills, Chores (Google Sheets Excel)" — confirms active market for manual spreadsheet solutions. |
| 37 | Share House Managers (Melbourne) | Homepage | https://sharehousemanagers.com.au/landlord/ | Ongoing | "Specialist Rooming House & Share House Property Management in Melbourne… From set-up and compliance to tenant screening and ongoing care." |
| 38 | Premium REA | "Rooming House Melbourne 2026" | https://premiumrea.com.au/blog/rooming-house-melbourne-buyers-agent-2026-guide | 2026 | "A rooming house with up to 12 residents is typically classified as Class 1b." / "Metro Melbourne yields: 8.0–10.5% gross." |
| 39 | RBA | "Insights From New Data on Australian Housing Investors" | https://www.rba.gov.au/publications/bulletin/2026/may/insights-from-new-data-on-australian-housing-investors.html | May 2026 | "As at 2022/23, there were 2.3 million individual housing investors, equivalent to roughly 10 per cent of the working-age population." |
| 40 | Consumer Protection WA | "Paying bills, rates and utilities when renting" | https://www.consumerprotection.wa.gov.au/paying-bills-rates-and-utilities-when-renting | Ongoing | "If the home shares a meter, the landlord must detail in the agreement how charges will be calculated." |

### B. Synthetic Inference (clearly labelled)

The following are **synthetic inferences** — reasoning by the researcher, not verbatim user quotes. They are grounded in the patterns observed in the real evidence above but do not represent any specific individual's stated view.

1. **Time-cost estimate for manual bill entry:** "~2–5 minutes per bill per cycle; ~40–100 minutes/month for a 5-property operator." Derived from the nature of the task (typing an amount, provider, and period) and the RentManager NZ founder's description of spreadsheet limitations [[75]]. No direct time-tracking data was found.

2. **Chasing costs 2–3× more time than entry:** Derived from the frequency of chasing discussions in forums (very high) vs. data-entry discussions (low), and the QBE finding that 35% of landlords experience arrears [[154]]. No direct time-comparison study was found.

3. **National room-rental operator estimate (5,000–10,000):** Extrapolated from VIC's 1,024 registered operators [[218]], adjusted for other states and the large unregistered segment. The AHURI report notes "it is difficult to say how many rooming houses, and rooming house residents, there are in Australia" [[128]]. This estimate is **low confidence**.

4. **Single-property room-renter household estimate (50,000–100,000):** Derived from 2.3M landlords [[156]], 71% owning 1 property [[156]], and an estimated 3–5% of those renting by room. **Very low confidence** — no direct data exists.

5. **Persona reactions to Settleroo features:** All persona reactions in D7 are synthetic inferences based on the behavioural patterns observed in forum evidence. They are plausible but unvalidated by direct user testing.

### C. Evidence Gaps / Insufficient Evidence

| Question | Status | What Would Close the Gap |
|----------|--------|------------------------|
| Exact number of AU rent-by-room operators (registered + unregistered) | **Insufficient evidence.** AHURI notes this is unknown [[128]]. VIC has 1,419 registered [[218]]; national figure is a guess. | ABS Census data on "boarding/rooming houses"; CAV + equivalent state regulator data; Flatmates.com.au listing volume. |
| How much time operators *actually* spend on bill entry vs. chasing vs. turnover | **Insufficient evidence.** No time-use study found. | 5–10 operator interviews with time-diary methodology. |
| Willingness to pay specifically for a bill-splitting tool (vs. a full PM suite) | **Insufficient evidence.** Pricing data exists for PM software ($15–$50/property/month) but not for a point tool. | Conjoint analysis or pricing survey with 50+ operators. |
| Whether operators *want* AI ingestion or are indifferent | **Insufficient evidence.** No forum discussion found specifically about automated bill ingestion for room-rental operators. | 5 operator interviews with a prototype/wireframe of the ingestion flow. |
| Tenant-side reaction to the no-login link (vs. Splitwise) | **Insufficient evidence.** No direct comparison found. | A/B test or 10 tenant interviews showing both UX flows. |
| UK HMO market as an expansion target | **Partially evidenced.** UK HMO market is much larger (~500K+ HMOs in England per industry estimates). HMO Roadmap [[192]] confirms similar pains. But regulatory differences (HMO licensing, tenancy deposit schemes) mean the product would need significant adaptation. | UK-specific regulatory review + 5 UK HMO landlord interviews. |

---

## DISCONFIRMATION PASS: WHAT WE FOUND AGAINST US

Per the research brief, we explicitly searched for evidence that our assumed pains are NOT real, or that the biggest pain is something else. Here is what we found:

1. **The biggest pain is NOT bill splitting. It is collecting money and managing tenants.** This is the single most important disconfirmation. Across every forum — Whirlpool, PropertyChat, BiggerPockets, HMO Roadmap, Facebook groups — the dominant complaint is about tenants who don't pay, pay late, cause drama, or leave owing money. The bill split is an *irritant*; the chase is a *crisis*. Settleroo's MVP solves the irritant beautifully but does not yet address the crisis.

2. **Many AU rooming-house operators don't split utilities at all.** In VIC, the operator is legally responsible for utilities unless rooms are separately metered [[51]][[54]]. Many operators simply include bills in the room rate. For these operators, the core Settleroo feature (occupancy-day split) is **irrelevant**. This is a significant portion of the ICP.

3. **Splitwise is "good enough" for the tenant side.** Whirlpool users recommend Splitwise [[32]], realestate.com.au recommends it [[60]], Mozo recommends it [[66]]. It's free, well-known, and has network effects. Settleroo's no-login link is a better UX for the *landlord-initiated* flow, but tenants already have a solution they like. The switching cost is low (click a link vs. open an app), but the awareness cost is high (tenants don't know Settleroo exists).

4. **The agent/PM segment has zero need for bill splitting.** This was hypothesised as a potential expansion segment. The evidence strongly refutes it. Agents manage whole-property leases; they don't split bills by occupancy days. Their pain is arrears, maintenance, and compliance — all handled by their trust-accounting platform. A bill-splitting point tool is irrelevant.

5. **Competitors exist and are shipping.** Plinthos (Italy, €4.99/month) does occupancy-day splitting, rent tracking, and tenant chat [[21]][[22]]. Cohabi (US, free/paid) does rent reminders, task management, and room-rental tracking [[23]][[24]]. RentManager NZ does rent-by-room tracking with a purpose-built ledger [[75]]. None are AU-focused, but the *concept* is validated. Settleroo's differentiator must be the AU-specific regulatory context (VIC metering rules, state-specific tenancy law) and the no-login link UX.

6. **At A$10/property/month, the revenue ceiling is low.** Even with 1,000 paying operators at 5 properties each, that's A$600K ARR. To reach A$5M+ ARR, Settleroo needs either 10× more operators (geographic expansion), 5× higher price (full PM suite), or a fundamentally different business model (e.g., payment processing fees, tenant screening commissions).

---

*End of report. The D3 stack-ranked list and D5 next-phase read are the primary inputs for the roadmap decision. The key question for the next session: does the payment-collection / automated-chasing requirement (Rank #1) displace the AI ingestion pipeline (Rank #5) as the next build priority?*