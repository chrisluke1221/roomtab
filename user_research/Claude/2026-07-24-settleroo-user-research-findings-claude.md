# Settleroo — User Research Findings (Claude / Cowork run)

**Run date:** 2026-07-24 · **Method:** live-web evidence mining (AU forums, competitor/tool pages, regulatory + industry sources) + evidence-grounded synthetic personas · **Analyst lens:** senior product researcher, anti-confirmation-bias
**Companion prompt:** `2026-07-24-settleroo-user-research-prompt.md` · **This is one of several parallel runs** (Chris kicked off other AI agents) — treat as a triangulation input, not the single source of truth.

> **Evidence honesty note.** This pass ran against public web sources, not live interviews. Reddit and Facebook are not fully crawlable by this tool, so **direct operator quotes are thin** — the strongest signal here comes from (a) how competitors and AU landlord-tool vendors describe the pain, (b) the AU rooming-house/co-living industry literature, and (c) Splitwise's own user-feedback forum. Every factual claim is cited. Persona reactions are labelled **[synthetic inference]**. Confidence is rated per item. The single biggest gap — real operator voice on *which* pain is #1 — is called out in D5/D9 as the thing your 10 interviews must close.

---

## D1. Executive summary (the 7 findings that move the roadmap)

1. **The pains you assumed are real — but you may have built for the wrong one first.** "Hours in a spreadsheet," "tenant moves out mid-cycle," and "every tenant thinks the bill is unfair" are echoed almost verbatim by an Australian competitor's own marketing and by share-house billing guides. The *calculation* pain (P2) and the *dispute* pain (P5) are the best-evidenced. **Confidence: High.**
2. **You are NOT the only one solving this.** [Smart RentHub](https://smartrenthub.com/en/solutions/co-living-utility-billing) already ships occupancy-day co-living bill splitting with vacancy handling, landlord caps, and transparent breakdowns, explicitly targeting Melbourne/Sydney/Brisbane. Your "no incumbent" assumption is **partly false** at the feature level — the gap is the *tenant-facing no-login chase loop*, not the split maths. **Confidence: High.**
3. **The split maths alone is closer to a vitamin than a painkiller — the painkiller is the chase-to-settled loop + provable record.** Splitwise (free) already does "who owes what" for share houses. What Splitwise *can't* do well is exactly your wedge: recurring variable bills, and getting people to actually pay. Lean the positioning there. **Confidence: Med-High.**
4. **A genuine disconfirming signal on the ICP: professional AU rooming houses usually BUNDLE utilities into a flat weekly room rate** ($100–200/wk of utilities absorbed by the operator), so they have *no per-tenant bill to split*. The acute split-pain lives in **share-house / rent-by-room setups where bills are itemised and recovered from tenants** — a narrower ICP than "2–10 property rooming-house operators." **Confidence: Med — this is the most important thing to test in interviews.**
5. **"Getting the money" may outrank "splitting the bill."** Arrears/late-payment is a legally-serious, emotionally-heavy pain across all landlord segments, and your MVP only *tracks* status — it doesn't move money (payment rails are parked). A pain above ingestion on the stack. **Confidence: Med-High.**
6. **The agent/PM expansion is weak, as the Fable critique predicted — the evidence backs that.** Standard AU agents avoid room-by-room/rooming houses (needs specialist managers, separate leases, 8–12% fees); agents who do this live inside trust-accounting platforms (PropertyMe, Managed App). Room-split-by-day is a rounding error in their week. **Confidence: High.**
7. **The next-phase AI ingestion bet is credible but should be sequenced behind the chase/collection loop.** Manual entry is a real "hours in spreadsheets" cost, but no evidence says it's the *biggest* pain. Ingestion compresses time-to-value; getting-paid closes the loop that actually recovers money. **Confidence: Med.**

---

## D2. Pain-point validation matrix

| Pain | Assumed/New | Evidence (source) | Prevalence | Severity | Verdict | Conf. |
|---|---|---|---|---|---|---|
| **P1 — Manual entry/uploads** | Assumed | Competitor: *"I spend hours calculating bills in spreadsheets… manually working out rent dates, coverage ratios and caps takes time you don't have"* ([Smart RentHub](https://smartrenthub.com/en/solutions/co-living-utility-billing)) | Med | Med | **Confirmed (moderate)** — real but framed as tedium, not agony | Med-High |
| **P2 — Doing the calculation (occupancy-day proration)** | Assumed | Multiple AU share-house guides describe the "person-day" method as the fair-but-fiddly approach ([Synergy](https://www.synergy.net.au/Blog/2019/08/Your-no-stress-guide-to-a-share-house-electricity-bill), [aussierentlaws](https://aussierentlaws.com/new-south-wales/splitting-electricity-bills-among-housemates-nsw)); competitor sells "effective occupancy days" as a feature ([Smart RentHub](https://smartrenthub.com/en/solutions/co-living-utility-billing)) | High | Med | **Confirmed** — the mid-cycle move-out case is the recurring trigger | High |
| **P3 — Sending the bills** | Assumed | Implied in "manual guesswork"/spreadsheet workflows; no source frames *distribution* itself as a top pain | Low-Med | Low-Med | **Weak** — bundled into the general admin load, not a standalone pain | Med |
| **P4 — Following up / chasing** | Assumed | AU landlord tools compete heavily on "arrears alerts," "missed-payment notifications," reminders ([Landlord Wise comparison](https://landlordwise.com.au/compare/best-rent-collection-apps-australia/)); state bodies document the reminder→notice→VCAT chase ([Tenants Victoria](https://tenantsvic.org.au/advice/during-your-tenancy/rent-arrears/)) | High | High | **Confirmed (strong)** — and it shades into P-NEW-1 below | High |
| **P5 — Disputes / "why is my share $X?"** | Assumed | Competitor: *"Every tenant thinks the bill is unfair… conflict is inevitable"*; solves via *"crystal-clear records… tenants see exactly how their share was calculated"* ([Smart RentHub](https://smartrenthub.com/en/solutions/co-living-utility-billing)) | High | Med-High | **Confirmed** — and this is your differentiated wedge (provable/locked) | High |
| **P-NEW-1 — Actually getting paid / arrears recovery** | **NEW** | Whole AU tool category orients around rent collection, ledgers, arrears workflows, BPAY/direct debit ([Landlord Wise](https://landlordwise.com.au/compare/best-rent-collection-apps-australia/)); legal escalation path is heavy ([Tenants Victoria](https://tenantsvic.org.au/advice/during-your-tenancy/rent-arrears/)) | High | High | **Confirmed — plausibly bigger than P1–P3** | Med-High |
| **P-NEW-2 — Utilities bundled into rent (no split needed)** | **NEW (disconfirming)** | Rooming-house economics: utilities typically *included* in rent, $100–200/wk operator cost ([Dot Capital](https://www.dotcapital.com.au/rooming-house-management-guide/), [PremiumREA](https://premiumrea.com.au/blog/rooming-house-melbourne-buyers-agent-2026-guide)) | Med-High (in pro rooming houses) | n/a | **Shrinks the ICP** — pro operators may not need the split at all | Med |
| **P-NEW-3 — Vacancy / turnover & tenant vetting** | **NEW** | Rooming houses run 90–95% occupancy, higher turnover, 8–12% mgmt fees ([Dot Capital](https://www.dotcapital.com.au/rooming-house-management-guide/)) | High | High | **Confirmed — real, but outside Settleroo's job** | Med-High |
| **P-NEW-4 — Recurring variable bills are painful in existing tools** | **NEW (opportunity)** | Splitwise users beg for: variable recurring amounts, one-month cancel, 28-day cycles, end dates ([Splitwise feedback](https://feedback.splitwise.com/forums/162446-general/suggestions/2864500-recurring-expenses-with-varying-costs)) | Med | Med | **Confirmed — direct wedge vs the free incumbent** | High |

---

## D3. Stack-ranked pains → next-phase requirement backlog

Ranked by **prevalence × severity × how underserved by current tools**. This is the primary output.

**Tier 1 — build/deepen next (highest leverage):**
1. **Get the money, not just the status (P-NEW-1 + P4).** Highest combined severity and the biggest gap between "Settleroo tracks paid/overdue" and what operators actually want ("it's settled"). *Requirement hypothesis:* payment-nudge automation now (escalating reminders on the no-login link), payment-rail integration (PayID/BPAY/Stripe) as the real unlock. Note: this is currently *parked* in your roadmap — the evidence says un-park it, or at minimum ship the arrears autopilot before broad ingestion.
2. **Own "provable & fair" harder (P5).** Your locked/deterministic/audit-trail record is the one thing Splitwise and even Smart RentHub's marketing can't out-claim on trust. *Requirement:* make the tenant-facing "here's exactly how your $212 was calculated, verified" view the hero of the product, not a detail.
3. **Recurring variable-bill handling that beats Splitwise (P-NEW-4).** Cheap to win because the free incumbent is explicitly bad at it. *Requirement:* frictionless month-to-month variable amounts, per-cycle edits, 28-day/quarterly cadences.

**Tier 2 — the current build/next bet:**
4. **AI ingestion (P1).** Real tedium-killer and time-to-value compressor, but sequence behind Tier 1. *Gate it* on the evidence that manual entry — not collection — is the operator's #1 complaint (unproven today).
5. **Occupancy-day split polish (P2).** Already your core and well-built; keep it, but recognise it as table stakes (a competitor and a manual method both exist), not the moat.

**Tier 3 — acknowledge but don't build (outside the job):**
6. Vacancy/turnover, tenant vetting, maintenance, compliance (P-NEW-3) — real and heavy, but a different product. Resist scope creep; possibly partner/integrate later.

---

## D4. Solution-fit scorecard

| Solution (as built) | Painkiller / Vitamin | Pain addressed | Users would praise | Where it falls short / risk | Substitute today | Switch likelihood | Conf. |
|---|---|---|---|---|---|---|---|
| **Occupancy-day split engine** | **Vitamin-leaning** | P2 | Accuracy on mid-cycle moves | A competitor ([Smart RentHub](https://smartrenthub.com/en/solutions/co-living-utility-billing)) + a known manual method both exist; not unique | Excel person-day formula; Splitwise | Med | High |
| **Recurring rent bills** | Painkiller (mild) | P1/P3 | Set-and-forget | Every AU rent tool does rent; commodity | RealRenta/RentBetter etc. | Low-Med | Med |
| **No-login tenant links** | **Painkiller** | P3/P5 | Zero friction for tenants; looks professional | Only as strong as the chase attached to it | Group chat + bank details | Med-High | Med-High |
| **Payment tracking / chase** | **Painkiller (but incomplete)** | P4 | Visibility of who's paid | Tracks, doesn't *collect* — the money still moves off-platform | Mental notes, spreadsheet, bank app | Med | Med-High |
| **Locked / provable / audit-trail bills** | **Painkiller — your true wedge** | P5 | "I point at the link and the argument's over" | Under-marketed; invisible until a dispute happens | Nothing equivalent | High (once felt) | Med-High |

**Verdict per solution:** keep and *reframe* the split engine as table stakes; **promote** the provable-record and chase-loop to hero; treat recurring-rent as commodity hygiene; make the no-login link the delivery vehicle for collection, not just viewing.

---

## D5. Next-phase (AI ingestion) demand read

**For it:** "hours in spreadsheets" is a genuine, independently-corroborated tedium ([Smart RentHub](https://smartrenthub.com/en/solutions/co-living-utility-billing)); email-in/auto-extract removes the most manual step and compresses time-to-value; it's on-brand for "AI at the edges."

**Against / caution:** (a) No evidence that *manual entry* is the operator's #1 pain — collection and disputes rate higher. (b) In the professional rooming-house segment, utilities are often bundled into rent, so there may be *no bill to ingest per tenant* — ingestion value concentrates in the itemised share-house/rent-by-room case. (c) Trust/accuracy objections are real and you've already speced the plausibility-check answer; keep it human-reviewed.

**Verdict:** ingestion is a **good second bet, not the first.** Sequence the arrears/collection loop (Tier 1) ahead of it, unless your other parallel research runs show manual entry ranking #1 — in which case, revisit. **This is the key cross-run disagreement to resolve when we review.**

---

## D6. Segment & ICP recommendation

| Segment | Has the pain? | Uses today | Incumbent risk | Size / WTP signal | Fit with Settleroo wedge |
|---|---|---|---|---|---|
| **Core: 2–10-property rent-by-room, itemised bills** | **Yes (acute)** | Excel + Splitwise + bank transfers | None doing no-login chase loop | Small-but-real; money-motivated; per-property pricing works | **Best fit** — narrow to *itemised-bill* operators |
| **Professional rooming-house operators (bundled utilities)** | **Often no** (bundled into rent) | Specialist managers / own systems | — | Higher $ per door but wrong job | **Weak** — split engine may be irrelevant; collection still relevant |
| **Single-property room-renter** | Yes (mild) | Spreadsheet / Splitwise | — | ~$0 WTP (free tier serves them) | Viral loop, not revenue (as designed) |
| **Real-estate agents / property managers** | **Mostly no** | PropertyMe, Managed App, trust accounting ([Landlord Wise](https://landlordwise.com.au/compare/best-rent-collection-apps-australia/)) | **Armored** — trust-accounting + state regulation | Large but inaccessible; procurement-gated | **Poor** — confirms Fable critique |
| **Tenant / head-tenant (bill-payer)** | Yes (chasing housemates) | Splitwise | Splitwise = free incumbent | Huge but ~$0 WTP | Possible viral/freemium wedge, not a payer |

**Recommendations:**
- **(a) Narrow the ICP, don't widen it:** from "2–10-property operators" to "**2–10-property operators who itemise and recover shared bills from tenants**" (share-house / rent-by-room, not bundled rooming houses). This is a sharper, more honest ICP than the current doc.
- **(b) Do not pursue agents/PMs** as a growth segment now — the evidence (specialist-only management, trust-accounting incumbents, room-split-as-rounding-error) confirms the Fable verdict. Keep the tripwire: revisit only if ≥3 interviewees say "my agent would buy this."
- **(c) Where the scalable $ actually is:** not a new *segment* but a **bigger job in the same segment — collection/payments.** Moving from "$10/property to split a bill" to "the settlement layer that recovers the money" is the 5–20x path, because it attaches to money movement (interchange/subscription on higher-value workflows) rather than admin convenience. That's a value-metric expansion, not a customer-segment leap.

---

## D7. Synthetic persona library

*All personas are evidence-grounded but simulated; reactions are **[synthetic inference]**.*

**1. "Scaling Sam" — core ICP (4 properties, rent-by-room, itemised bills).** *Grounded in:* AU rent-by-room investor content + Smart RentHub's stated customer.
- JTBD: functional = recover every shared dollar without a Sunday of maths; emotional = never lose the argument; social = look professional to tenants.
- Tools today: Excel person-day formula + Splitwise + bank transfers + group chat.
- Top pains: P-NEW-1 getting paid [NEW], P5 disputes, P2 calculation, P1 entry.
- WTP: ~A$10/property/mo is legible ("ten bucks a house") *if it also chases the money*. **[synthetic inference]** would balk at paying just to do maths he already does in Excel.
- Objection: "Splitwise is free and my tenants already use it." **Confidence: Med.**

**2. "Bundled Bianca" — professional rooming-house operator (8 rooms, utilities included in rent).** *Grounded in:* [Dot Capital](https://www.dotcapital.com.au/rooming-house-management-guide/), [PremiumREA](https://premiumrea.com.au/blog/rooming-house-melbourne-buyers-agent-2026-guide).
- JTBD: keep rooms full, keep costs predictable, stay compliant.
- Pains: P-NEW-3 vacancy/turnover, compliance, arrears — **not** bill-splitting (bundled).
- Reaction: **[synthetic inference]** "I don't split bills — utilities are in the rent. What I need is fewer empty rooms and on-time rent." **This persona partly invalidates the split-first pitch.** **Confidence: Med.**

**3. "Single-property Priya" — 1 house, 3 rooms.** Free-tier/viral user; ~$0 WTP by design. Reaction: happy to use free, upgrades only when she buys property #2. **Confidence: Med.**

**4. "Agency Amir" — property manager, uses PropertyMe.** *Grounded in:* [Landlord Wise comparison](https://landlordwise.com.au/compare/best-rent-collection-apps-australia/), rooming-house-management sources.
- Reaction: **[synthetic inference]** "Room-splitting is <1% of my week and it'd have to live inside my trust-accounting platform or it's just one more login." **Confirms poor fit.** **Confidence: Med-High.**

**5. "Head-tenant Hana" — runs a 5-person share house on Splitwise.** Feels the chasing pain acutely but won't pay (Splitwise free). Potential bottom-of-funnel/viral entry, not a payer. **Confidence: Med.**

---

## D8. Evidence appendix

**Real, cited web evidence:**
- Co-living split competitor + pain quotes — [Smart RentHub, Co-living & Shared Utility Billing](https://smartrenthub.com/en/solutions/co-living-utility-billing)
- AU landlord/rent-collection tool landscape (none do room-split; agents = trust-accounting) — [Landlord Wise, Best Rent Collection Apps 2026](https://landlordwise.com.au/compare/best-rent-collection-apps-australia/)
- Splitwise recurring/variable-bill limitations — [Splitwise feedback: recurring expenses with varying costs](https://feedback.splitwise.com/forums/162446-general/suggestions/2864500-recurring-expenses-with-varying-costs), [end date for recurring](https://feedback.splitwise.com/forums/162446-general/suggestions/11372592-allow-an-end-date-for-recurring-payments-or-build)
- Person-day / share-house split methods — [Synergy share-house guide](https://www.synergy.net.au/Blog/2019/08/Your-no-stress-guide-to-a-share-house-electricity-bill), [aussierentlaws NSW](https://aussierentlaws.com/new-south-wales/splitting-electricity-bills-among-housemates-nsw), [SmartRentHub water-split guide](https://smartrenthub.com/en/blog/split-water-bill-shared-house-australia)
- Rooming-house economics (bundled utilities, turnover, fees) — [Dot Capital Rooming House Management Guide](https://www.dotcapital.com.au/rooming-house-management-guide/), [PremiumREA Rooming House Melbourne 2026](https://premiumrea.com.au/blog/rooming-house-melbourne-buyers-agent-2026-guide)
- Agents avoid HMO/rooming (specialist-only) — [HMO Unity](https://hmounity.com.au/), [Rooming House Manager](https://roominghousemanager.com.au/)
- Arrears / chase legal process — [Tenants Victoria, rent arrears](https://tenantsvic.org.au/advice/during-your-tenancy/rent-arrears/), [NSW frequently-late tenants](https://www.nsw.gov.au/housing-and-construction/rules/tenants-who-are-frequently-late-paying-rent-or-utility-charges)
- PropertyChat forum exists (rooming-house / arrears tags) but pages are JS-rendered / not extractable by this tool — [rooming house tag](https://www.propertychat.com.au/community/tags/rooming-house/), [rent arrears tag](https://www.propertychat.com.au/community/tags/rent-arrears/)

**Synthetic inference (not evidence):** all persona reactions in D7; the priority *ranking* in D3 (evidence-informed judgement, not measured).

---

## D9. What this run could NOT establish (close these in interviews / cross-run review)

1. **Which single pain ranks #1 for a real operator** — entry vs calculation vs collection vs disputes. My read is collection/disputes > entry, but that inverts your current "ingestion-first" bet, so **verify before committing**.
2. **How many target operators itemise bills vs bundle them into rent** — decides whether the split engine is core or niche.
3. **Real willingness-to-pay at A$10/property** and reaction to per-property pricing — no forum quotes surfaced; needs the 10 founding-member offers.
4. **Whether tenants will actually pay *through* a Settleroo link** vs just view it — the crux of the collection expansion.

Bring the other agents' runs and this one together and we'll reconcile the stack-rank — the disagreement worth watching is **ingestion-first (your roadmap) vs collection-first (this run's read).**

---

*Sources: [Smart RentHub co-living billing](https://smartrenthub.com/en/solutions/co-living-utility-billing) · [Landlord Wise rent-collection comparison](https://landlordwise.com.au/compare/best-rent-collection-apps-australia/) · [Splitwise feedback forum](https://feedback.splitwise.com/forums/162446-general/suggestions/2864500-recurring-expenses-with-varying-costs) · [Dot Capital rooming-house guide](https://www.dotcapital.com.au/rooming-house-management-guide/) · [PremiumREA rooming-house 2026](https://premiumrea.com.au/blog/rooming-house-melbourne-buyers-agent-2026-guide) · [Tenants Victoria rent arrears](https://tenantsvic.org.au/advice/during-your-tenancy/rent-arrears/) · [Synergy share-house guide](https://www.synergy.net.au/Blog/2019/08/Your-no-stress-guide-to-a-share-house-electricity-bill)*
