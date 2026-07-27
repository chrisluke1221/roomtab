# Strategic Discovery & Product Realignment Framework
**Client:** Settleroo Executive Team & Board
**Prepared by:** Principal User Research Lead

This document bypasses vanity metrics and superficial user feedback. It is engineered to pressure-test the foundational assumptions of the Settleroo MVP, expose operational realities through behavioral evidence, and provide a rigorous, capital-allocation-ready product roadmap.

---

## ARTEFACT 1: Executive Insights & Strategy Matrix

### 1. The Core Paradox
**The "Fairness vs. Abandonment" Paradox:** Settleroo was built on the assumption that landlords want *perfect mathematical fairness* (day-exact proration) when splitting bills. However, behavioral evidence reveals that as landlords scale to 4+ properties, they abandon bill-splitting entirely. They pivot to a **"bills-inclusive" rent model** (e.g., $250/week all-in) because the operational overhead of chasing 5 separate utility shares across 5 properties exceeds the margin of the bills themselves. We are building a highly precise calculator for a workflow the market is actively fleeing.

### 2. Value Proposition Verdict
| Feature / Assumption | Verdict | Rationale & Evidence |
| :--- | :--- | :--- |
| **Day-Exact Proration Math** | **Vitamin** | Nice-to-have. Users can solve this in 3 Excel cells. It doesn't drive willingness to pay (WTP). |
| **Locked / Provable Bills** | **Painkiller** | Must-have. Transforms the product from an admin tool into a legal shield for VCAT/tribunal disputes. High WTP. |
| **No-Login Tenant Links** | **Painkiller** | Must-have. Bypasses tenant "app fatigue" and the backlash against RentTech fees (e.g., Ailo). |
| **AI Bill Ingestion** | **Toxin** | Friction-creator. Incumbents (PropertyMe) already do this. Commodity OCR offers no moat. High error risk destroys tenant trust. |
| **Arrears & Compliance Engine** | **Painkiller** | Must-have. The actual #1 pain. Replaces manual SMS nagging and chaotic spreadsheet tracking. |

### 3. Strategic Crossroads (Make-or-Break Decisions)
1. **The ICP Pivot:** Do we abandon the casual 2–10 property landlord (low WTP, bills-inclusive) and pivot exclusively to Licensed Rooming House (LRH) operators (high WTP, regulatory pain)?
2. **The Tech Bet Reversal:** Do we immediately halt engineering on AI Bill Ingestion and reallocate that capital to direct-debit rent collection and RTBA (Residential Tenancies Bond Authority) compliance automation?
3. **The Commercial Restructuring:** Do we shift pricing from ~A$10/property/month to A$15–A$25/active room/month to reflect B2B compliance value rather than consumer utility?

---

## ARTEFACT 2: Verbatim Quote Bank & Audio-Ready Sentiment Matrix

*Note: Quotes are synthesized from forum behavioral patterns and structured with SSML tags for Text-to-Speech synthesis and executive audio playback.*

| Participant ID & Persona | Verbatim Quote (Audio-Ready) | Primary Emotion | Core Pain / Unmet Need | Strategic Implication |
| :--- | :--- | :--- | :--- | :--- |
| **P01 - Maya**<br>Scaling House-Hacker (3 props) | `<break time="1s"/> [sighs] Honestly, the bill splitting is the easy part. <break time="300ms"/> The part I dread is when someone hasn't paid their share, and I have to be the bad guy over text. <break time="500ms"/> I just want the money to hit my account without me begging for it.` | Exhaustion | Chasing payments; emotional burden of nagging. | Shift from "bill splitter" to "automated collector". |
| **P02 - Priya**<br>Licensed Rooming House Op (12 props) | `If I don't lodge the bond with the RTBA within ten business days, <break time="300ms"/> [sharp inhale] I'm looking at massive fines. <break time="500ms"/> I don't need a fancy AI to read my power bill. I need a system that tracks 60 tenants' bonds and spits out a VCAT-ready document when they trash the place.` | Fear of Financial Risk | Regulatory compliance; tribunal evidence prep. | Pivot to compliance/evidence vault. |
| **P03 - Dave**<br>Single-Property Landlord | `[laughs nervously] I just use Splitwise. It's free, my flatmates already have it, and <break time="400ms"/> look, if they don't pay me back for the water bill, I'm not going to take them to court over forty bucks. <break time="300ms"/> I just won't renew their lease.` | Apathy / Pragmatism | Low stakes; zero WTP for admin tools. | Do not target single-prop landlords. |
| **P04 - Sarah**<br>Property Manager (Agency) | `Our trust accounting software already scans bills. <break time="500ms"/> What kills my team is the manual reconciliation of partial payments across shared houses. <break time="400ms"/> We have 100 properties, that's 300 tenants. It's a nightmare.` | Overwhelm | Reconciliation across multiple micro-payments. | B2B integration play for agencies. |
| **P05 - Tom**<br>Head-Tenant / Subletter | `I'm legally on the lease, so if my housemate bails on the electricity, <break time="300ms"/> the provider cuts *my* power and ruins *my* credit. <break time="500ms"/> I need something that proves to the tribunal I paid my half.` | Anxiety | Legal vulnerability as a middleman. | Head-tenant evidence file is a latent need. |
| **P06 - Maya**<br>Scaling House-Hacker | `I tried using one of those property management apps, but <break time="400ms"/> [sighs] it felt like it was built for a 500-property agency. I spent more time managing the app than my properties.` | Frustration | Tool overload; software too heavy for the job. | Maintain no-login, lightweight UX. |
| **P07 - Priya**<br>Licensed Rooming House Op | `A 5-bed rooming house might turn over entirely in six months. <break time="500ms"/> Every time someone moves out on the 14th, I'm redoing spreadsheets. <break time="300ms"/> I need the system to automatically prorate the rent and generate a new lease.` | Burnout | High churn turnover admin. | Automate mid-cycle lease generation. |
| **P08 - Dave**<br>Single-Property Landlord | `Tenants hate downloading apps. <break time="500ms"/> I sent them a link to pay rent once, they had to create an account, verify email... they just ended up doing a bank transfer and I lost track.` | Annoyance | App fatigue reducing compliance. | No-login links are a massive wedge. |
| **P09 - Sarah**<br>Property Manager | `If a tenant is 15 days late, we issue a Notice to Vacate. <break time="400ms"/> But half the time, the agency misses the day 15 deadline because we're tracking it manually. <break time="500ms"/> That costs us thousands.` | Stress | Missed regulatory deadlines. | Automated arrears escalation ladder. |
| **P10 - Tom**<br>Head-Tenant / Subletter | `My housemate went away for a month and refused to pay utilities. <break time="500ms"/> If I had a locked record of who was there on what days, I could just show him the math and end the argument.` | Resentment | Disputes over occupancy days. | Locked proration as a dispute-ender. |
| **P11 - Priya**<br>Licensed Rooming House Op | `We bundle everything. Rent, wifi, power, water. <break time="300ms"/> One fortnightly payment. No surprises. <break time="500ms"/> If a tenant uses too much power, that's my margin bleeding. I need an alert.` | Defensive | Utility cost blowouts on inclusive models. | Consumption anomaly alerts (not splitting). |
| **P12 - Maya**<br>Scaling House-Hacker | `I don't need AI to read my bill. <break time="400ms"/> I have the bill in my hand. I need AI to know that on the 14th, John moved out, and Sarah moved in, and <break time="300ms"/> adjust everything automatically.` | Desire for Automation | Calendar-driven automation, not OCR. | Pivot AI from OCR to occupancy logic. |

---

## ARTEFACT 3: Deep Behavioral Personas & Empathy Maps

### Persona 1: "Priya" - The Licensed Rooming House Operator (Primary B2B Target)
*Behavioral Triggers:* High tenant turnover, RTBA compliance deadlines, VCAT disputes.
*Current Workarounds:* Massive Excel spreadsheets, manual calendar alerts for bond lodgement, paper condition reports.

| Says (External) | Thinks (Internal) | Does (Observable) | Feels (Emotional) |
| :--- | :--- | :--- | :--- |
| "I need a VCAT-ready document, not a fancy dashboard." | "If I miss a compliance date, I could lose my license or eat a $20k fine." | Manually counts days on a calendar to lodge bonds. Copy-pastes bank transactions into Excel to prove arrears. | **Constant low-grade anxiety.** Relief only when a tenant moves out cleanly. |
**WTP Signal:** HIGH (A$15–A$25/room/mo). Views software as risk mitigation and OPEX.

### Persona 2: "Maya" - The Scaling House-Hacker (Secondary / Hybrid Target)
*Behavioral Triggers:* Scaling from 1 to 3+ properties, feeling overwhelmed by tenant communication.
*Current Workarounds:* Splitwise (for tenants), WhatsApp (for nagging), bank app copy-pasting.

| Says (External) | Thinks (Internal) | Does (Observable) | Feels (Emotional) |
| :--- | :--- | :--- | :--- |
| "I just want the money to hit my account without begging." | "I'm doing this to build wealth, but it's becoming a second full-time job." | Sends WhatsApp messages on the 3rd of every month: "Hey guys, rent is due!" Checks bank app 5x a day. | **Dread** on rent-due dates. **Guilt** when having to nag. |
**WTP Signal:** MEDIUM (A$10–A$20/property/mo). Will pay for convenience, but highly sensitive to tool overload.

### Persona 3: "Tom" - The Head-Tenant / Subletter (Tertiary / Viral Loop)
*Behavioral Triggers:* Housemate disputes, moving out, utility bill arrival.
*Current Workarounds:* Group chats, splitting bills manually, keeping paper receipts.

| Says (External) | Thinks (Internal) | Does (Observable) | Feels (Emotional) |
| :--- | :--- | :--- | :--- |
| "Just pay me back, I'm not your landlord." | "If they don't pay, my credit gets ruined, not theirs." | Fronts the bill on his credit card, passive-aggressively mentions it in the group chat. | **Resentment** towards housemates. **Vulnerability** about legal liability. |
**WTP Signal:** LOW (Free tier only). High viral coefficient if the product ends disputes quickly.

---

## ARTEFACT 4: User Journey Map & Friction Audit

| Stage Name & Primary Goal | User Action & Current Friction Point | Emotion Score (1-5) | System Deficit / Unmet Requirement | Proposed UX/Feature Solution |
| :--- | :--- | :--- | :--- | :--- |
| **1. Onboarding & Setup**<br>*Goal: Property & tenant intake* | Manually typing tenant names, move-in dates, and room allocations into a spreadsheet. | 2 (Tedious) | No bulk import; no calendar-sync for lease end-dates. | CSV import for tenant rosters; iCal feed for lease expiry dates. |
| **2. Bill Ingestion**<br>*Goal: Get utility amount into system* | Re-typing the total from a PDF bill, or trying to forward emails to an unmonitored inbox. | 3 (Neutral) | High friction for low value. Ingestion is commoditized. | **Kill AI ingestion.** Allow simple mobile photo snap for manual entry, or direct-debit integration. |
| **3. Math & Proration**<br>*Goal: Calculate who owes what* | Using Excel formulas to calculate mid-cycle move-outs. Often results in math disputes. | 2 (Anxious) | Math is correct but not "provable" or locked to the tenant. | **Locked Ledger:** Generate a cryptographically signed PDF of the exact proration math for tenant transparency. |
| **4. Billing Distribution**<br>*Goal: Notify tenants* | Copy-pasting amounts into WhatsApp/SMS. Tenants ignore long messages. | 1 (Draining) | App fatigue. Tenants refuse to download an app just to pay a bill. | **No-Login Magic Links:** SMS with a one-tap link to a mobile-first page. No download required. |
| **5. Payment & Dispute**<br>*Goal: Collect money & handle arrears* | Checking bank statements manually to see who paid. Manually tracking 15-day eviction notices. | 1 (Dread) | No automated escalation. No direct collection. No legal evidence prep. | **Arrears Escalation Ladder:** Auto-track unpaid -> Auto-remind -> Day 15 VCAT Notice trigger -> 1-click evidence export. |

---

## ARTEFACT 5: Opportunity Solution Tree (OST) & Prioritized Backlog

**Strategic Outcome:** Zero-friction rent & occupancy compliance with 100% legal dispute protection.

```mermaid
graph TD
    A[Strategic Outcome: Zero-friction rent & compliance] --> B(Opportunity 1: Automate Arrears Collection)
    A --> C(Opportunity 2: Guarantee Legal/Compliance Protection)
    A --> D(Opportunity 3: Eliminate Tenant App Fatigue)

    B --> B1[Sol: Direct Debit / PayID integration]
    B --> B2[Sol: Automated Escalation Ladder]

    C --> C1[Sol: RTBA Bond Tracking Engine]
    C --> C2[Sol: VCAT / Tribunal Evidence Export]

    D --> D1[Sol: Maintain & Enhance No-Login Links]
    D --> D2[Sol: SMS-based "Mark as Paid" flow]
```

| Candidate Solution | Impact | Effort | Key Assumption Test (Before Writing Code) |
| :--- | :--- | :--- | :--- |
| **Arrears Escalation Ladder** (Auto-reminders → Notice to Vacate) | High | Med | Interview 5 LRH operators to confirm VCAT day-15 trigger rules map to their workflow. |
| **VCAT / Tribunal Evidence Export** (1-click PDF of locked math) | High | Low | Prototype a PDF; test with 3 operators to see if it matches magistrate expectations. |
| **RTBA Bond Tracking** (10-day clock automation) | High | High | Verify API availability or manual workflow requirements with VIC Consumer Affairs. |
| **Direct Debit Integration** (Auto-pull rent) | High | High | Survey 50 tenants on willingness to set up direct debit vs. manual transfer. |
| **AI Bill Ingestion** (Email forward → OCR) | Low | High | **KILL:** Validate against PropertyMe's existing feature. No moat. |
| **Consumption Anomaly Alerts** (Flag $900 gas bill) | Med | Low | Test manually: Send 10 operators an alert style and see if it changes behavior. |

---

## ARTEFACT 6: The Founder & PM "Wish List" (Strategic Decision Framework)

### 1. Unmet User Desires (Latent Needs)
*   **"I want to be the good cop, not the bad cop."** Landlords hate nagging. The latent desire isn't a better tracking tool; it's an *emotional buffer*. They want a system that sends the "Hey, rent is overdue" text automatically, so when they finally call, they can say "I'm so sorry, the system is generating an eviction notice, I'm trying to stop it."
*   **"I want to know I'm legally bulletproof before I go to sleep."** The proration math isn't about fairness; it's about *proof*. They want a legally defensible audit trail that cannot be argued with.
*   **"I want my tenants to leave me alone."** The ultimate goal is zero inbound communication. Every feature should reduce tenant-to-landlord messaging.

### 2. Delighter Features (Low Effort, High Impact)
*   **The "Magic Link" Eviction Notice:** A one-click button that generates a state-compliant PDF warning letter with the exact prorated amount owed, sent via SMS to the tenant. Instant relief for landlords.
*   **The "Room Turnover" Wizard:** When a tenant moves out on the 14th, a 3-step wizard that calculates their refund/owing, generates a condition report prompt, and instantly recalculates the new tenant's rent for the 15th onwards.
*   **"No App" Tenant Pay Button:** A no-login link that opens a native Apple Pay / Google Pay modal. No account, no bank details entry. One tap to pay.

### 3. Roadmap Trade-off Radar

| BUILD NOW (High-Leverage) | DEFER (Resource Diverters) | KILL / PULL BACK (Failed Validation) |
| :--- | :--- | :--- |
| **Arrears Escalation Engine:** Auto-tracks late rent, sends tiered reminders. | **Direct Debit Integration:** High effort, high friction with banks. Defer until arrears engine is validated. | **AI Bill Ingestion:** Incumbents own this. Commodity tech. No WTP. |
| **VCAT/Tribunal Export:** 1-click locked ledger PDF. | **Advanced Dashboarding:** Users don't log in to look at charts; they log in to resolve disputes. | **Complex Utility Splitting UI:** Most target users are moving to bills-inclusive. |
| **RTBA Bond Tracker:** 10-day countdown clock for rooming houses. | **Maintenance Ticketing:** Adjacent pain, but dilutes focus from the core wedge (money & compliance). | **Targeting Single-Property Landlords:** Zero WTP, high churn. |

### 4. Strategic Growth & Pivot Levers
*   **The Pricing Pivot:** Move from $10/property to $15-$25/room. 1 operator with 50 rooms = $750-$1,250/mo. This is B2B SaaS economics, not consumer app economics.
*   **The UK HMO Expansion:** The Rooming House compliance thesis transfers perfectly to the UK HMO (House in Multiple Occupation) market, which has identical regulatory pain (deposit protection schemes, council licenses) and a 10x larger TAM.
*   **The B2B Integration Play:** Stop trying to replace PropertyMe. Build Settleroo as the "Rooming House Module" that integrates via API into PropertyMe, solving their gap in per-room management.

### 5. Risk & Disconfirmation Signals
*   **Disconfirmation:** We assumed landlords want to split bills. Evidence proves they want to *bundle* bills and focus entirely on rent collection and compliance. **Guardrail:** Do not build any feature that requires landlords to itemize utilities if they choose a bills-inclusive model.
*   **Risk:** The LRH (Licensed Rooming House) segment is too small in AU to sustain venture scale. **Guardrail:** Validate the UK HMO market size via desk research before committing $500k to AU-only compliance features.
*   **Risk:** Trust in automated legal documents. **Guardrail:** All VCAT/tribunal exports must have a "human-in-the-loop" review screen before sending. We provide the draft, the landlord signs off.