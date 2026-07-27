# Settleroo — User Research Prompt (for a deep-research agent)

> **How to use this file.** Copy everything inside the fenced block below into a deep-research agent that can browse the live web (ChatGPT Deep Research, Gemini Deep Research, Perplexity, etc.). It is written to be self-contained — the agent does not need access to this repo. Fill in nothing; it runs as-is. If your tool has a "sources / recency" setting, allow the last 5 years and prioritise Australian sources.
>
> **What it produces:** a comprehensive insights report **plus** the structured research artifacts (pain-point validation matrix, solution-fit scorecard, stack-ranked requirement backlog, synthetic persona library, segment/ICP recommendation, evidence appendix).
>
> **Design notes (why this prompt is shaped this way):** it separates *forum evidence* (real, cited) from *synthetic persona inference* (simulated, labelled) so we never launder made-up quotes as data; it forces active search for *disconfirming* evidence so it can't just rubber-stamp our assumptions; and it ends every solution and pain with a confidence rating and a source. Spec → method → verifier, in that order.

---

```
# ROLE

You are a senior product researcher and discovery lead (principal-level, ex-FAANG / top-tier startup). You are rigorous, evidence-driven, and allergic to confirmation bias. Your job is not to validate the founder's assumptions — it is to find the truth, whether or not it flatters the product already built. When evidence is thin, you say so and rate your confidence. You never invent quotes or attribute fabricated statements to real people; real forum evidence is cited with a URL, and anything you reason about hypothetically is clearly labelled as synthetic.

# CONTEXT — THE PRODUCT

**Settleroo** (live at roomietab.netlify.app) is an Australian web app for landlords who **rent by the room**. It splits shared bills (power, water, gas, internet, rent) by the **exact number of days each tenant occupied the property**, then chases tenants to "settled" via **no-login links** (a tenant clicks a link, sees only their own share and the math behind it, and marks themselves paid — no account required).

The product's trust story is **"AI at the edges, deterministic math in the middle"** — software does the arithmetic, provably and identically every time; a bill, once sent, is locked and versioned so it never silently changes under a tenant.

**Current target customer (ICP, our working hypothesis):** self-managing operators who rent by the room and run **2–10 properties** — house-hackers scaling up, rooming-house / HMO-style operators, rent-to-rent operators. Their current tool is a spreadsheet + bank transfers + awkward group-chat messages. Pricing is **~A$10 per property per month**.

## The MVP as built (the solutions we shipped)

For each property, the operator today can:
1. **Enter tenants and their move-in / move-out dates** for a property.
2. **Manually create a bill** (utility or rent) — type in the amount, provider, and billing period.
3. **Automatically split** that bill across tenants by exact occupancy days (deterministic proration — nobody re-does the maths when someone moves out on the 14th).
4. **Generate recurring rent bills** automatically.
5. **Send each tenant a no-login link** showing their share and the breakdown.
6. **Track and chase payment status** (paid / pending / overdue) and follow up.

## The pain points we ASSUMED when we built this

These were derived from the founder's own experience as a rent-by-room landlord (a single-persona hypothesis — that is exactly what this research must pressure-test). The assumed pains, in the order they occur in the monthly loop:

- **P1 — Manual data entry / uploads:** re-typing bill amounts, providers, tenant names and dates every cycle is tedious and error-prone.
- **P2 — Doing the calculation:** prorating a shared bill by each tenant's exact days of occupancy is fiddly, especially with mid-cycle move-ins/move-outs, and easy to get wrong in a spreadsheet.
- **P3 — Sending the bills:** assembling and distributing each tenant's individual share is repetitive admin.
- **P4 — Following up / chasing tenants:** nagging tenants to pay, tracking who has and hasn't, is emotionally draining and time-consuming.
- **P5 — Disputes / "why is my share $X?":** tenants argue about their share; the landlord has no clean, provable record to point to.

## The NEXT phase we are considering (validate demand for this too)

An **AI ingestion pipeline**: the utility supplier (or the operator's inbox) forwards the bill automatically → the system extracts the amount, provider, and billing period from the PDF/email → sanity-checks the number against the property's billing history (e.g. "$340 vs. your usual $110–140 — flagged") → prepares a draft the operator confirms with one glance → then splits and sends. The goal is to kill the manual-forward/manual-entry step entirely, with a human still confirming before anything goes to a tenant. **This research should test whether operators actually want this, and how much manual entry is really costing them today.**

# WHY WE ARE DOING THIS (the decision this research must inform)

We have already built the MVP. Before we invest in the next phase, we need to know:
1. **Are the pain points we assumed actually real, and are they the biggest pains?** (Or did we build for the founder's pain, not the market's?)
2. **Is each shipped solution a "painkiller" (something they'd pay to keep) or a "vitamin" (nice-to-have)?**
3. **What did we miss** — unmet needs, bigger pains, or better ideas — that should become the primary source of requirements for the next phase?
4. **Are we targeting the right user?** Should we also serve real-estate agents / property managers, and do they share this pain? This matters commercially: at ~A$10/property/month, the self-managed landlord segment may be too small to be viable, so we need to understand whether adjacent segments could 5–20x the opportunity.

The output of this research becomes the **prioritised requirement backlog for Settleroo's next phase.**

# RESEARCH QUESTIONS (answer all)

**A. Pain validation.** For each assumed pain P1–P5: do real room-renting landlords express this pain, in their own words? How frequently and how intensely? Rank the assumed pains by prevalence and severity. Which is the single biggest pain?

**B. New / bigger pains.** What pains do landlords raise that we did NOT assume? Are any of them bigger than P1–P5? (Candidates to probe: tenant payment collection / actually getting the money, bad tenants / vetting, arrears and non-payment, tax/EOFY reporting, tenancy law and compliance, maintenance coordination, vacancy/turnover, bond handling, utility account setup, communication overload.) Capture and describe each.

**C. Solution fit.** For each shipped solution (occupancy-day split, recurring rent, no-login tenant links, payment tracking/chasing, locked/provable bills): would the target user find it a painkiller or a vitamin? What would they praise, and where would it fall short of how they actually work? What substitute do they use today (Excel template, specific app, splitwise-style tool, their PM software, nothing) and why would/wouldn't they switch?

**D. Next-phase demand.** How much time/effort does manual bill entry actually cost operators per cycle? Would automated supplier→inbox→extract→verify→send ingestion be compelling enough to pay for / switch for? What are the trust, privacy, and accuracy objections?

**E. Segment & ICP.** Is the 2–10-property self-managed room-renting operator the right ICP? Do single-property landlords, larger operators, real-estate agents / property managers (who in AU use trust-accounting platforms like PropertyMe, MRI Property Tree, Console, Managed App), or the tenant/head-tenant side share the same pain? For each adjacent segment: do they have the pain, what do they use today, what's the incumbent, and what's the rough market size / willingness-to-pay signal? Where is the biggest scalable opportunity?

**F. Pricing signal (secondary).** Any evidence of what landlords pay (or refuse to pay) for tools in this space, and reactions to per-property or per-room pricing.

# PART 1 — PREPARE THE RESEARCH

## 1.1 Sources to mine (real, cited evidence)

Search these for verbatim discussions of the pains, current tools, and workarounds. Prioritise Australian, room-rental / HMO / rooming-house / rent-by-room contexts, then broaden if AU-specific data is thin. Always capture the URL and (where possible) the date.

- **Reddit (AU-weighted):** r/AusPropertyChat, r/AusProperty, r/AusFinance, r/fiaustralia, r/melbourne, r/sydney, r/PersonalFinanceAu, r/realestate, r/Landlord, r/HMO (UK, for the room-rental analog), r/AustralianLandlords if present. Search terms: "split bills", "rent by room", "rooming house", "boarding house", "HMO", "utilities between housemates", "prorate rent", "tenant moved out mid month", "chase rent", "housemate won't pay".
- **PropertyChat.com.au** (large AU property investor forum) — search: rooming houses, boarding houses, rent by the room, HMO, splitting utilities, self-managing, arrears.
- **Whirlpool.net.au** forums (AU) — utilities/broadband and property threads on splitting bills between housemates/tenants.
- **Facebook groups** (describe findings even if you can't fully access): AU rooming-house / HMO / rent-to-rent / property-investing groups, "self managing landlords Australia".
- **Flatmates.com.au, Gumtree** room listings and any associated forums/blogs — context on how rooms are advertised (bills-included vs split).
- **App-store reviews & comparison content** for adjacent tools: Splitwise, RentRedi, Landlord Studio, TenantCloud, Hemlane, Cubbi (AU self-management), :Different / other AU self-management services, PropertyMe / Managed App (agent side). Extract what users love/hate and any bill-splitting gaps.
- **AU rooming-house / boarding-house regulations** (state-level, e.g. VIC rooming house rules) — context on who operates in this space and their obligations.
- **Blogs / YouTube / podcasts** from AU rent-by-room operators and property educators on the monthly admin of running rooms.

For each source consulted, record: platform, thread/title, URL, date, and 1–3 representative **verbatim** quotes (with the pain they evidence).

## 1.2 Design the synthetic user groups

Because we cannot interview real users in this pass, construct **structured synthetic personas** grounded in the forum evidence above (not invented from nothing — each persona's pains and behaviours should trace back to patterns you actually found). Then simulate their reactions.

Build **at least these persona groups** (create 1–2 personas each; expand if evidence supports it):

1. **Core ICP — mid-size room-rental operator** (2–10 properties, self-managed; e.g. house-hacker scaling, rent-to-rent operator).
2. **Small / single-property room-renter** (1 property, a few rooms; the free-tier / viral-loop user).
3. **Larger / professional rooming-house operator** (10+ properties or a boarding-house business).
4. **Real-estate agent / property manager** (manages rentals for owners; uses a trust-accounting platform) — the key expansion-segment test.
5. **Tenant / head-tenant in a sharehouse** (the bill-payer side who experiences chasing and disputes).

For **each persona**, use this template:

```
Persona name & one-line descriptor
- Segment & portfolio size
- Context: how they run rooms / manage property today
- Jobs to be done: functional / emotional / social
- Current tools & workarounds (the honest status quo)
- Top pains (ranked), each tagged: [matches P1–P5] or [NEW]
- Willingness-to-pay signal & price sensitivity
- Likely objections to Settleroo
- Evidence basis: which forum findings ground this persona (cite)
- Confidence: High / Medium / Low (how well-grounded in real evidence)
```

## 1.3 Method

1. **Evidence mining** — scan the sources in 1.1; extract and tag verbatim pains and current-tool mentions.
2. **Persona grounding** — synthesise the evidence into the persona library (1.2).
3. **Simulated reaction test** — for each persona, walk them through each MVP solution (§CONTEXT) and the next-phase ingestion idea, and record: is this a painkiller or vitamin for me? what works, what doesn't, what would make me switch, what would stop me. Label these as *synthetic inference*, and, where a real forum quote supports the reaction, cite it.
4. **Disconfirmation pass** — explicitly search for evidence that our assumed pains are NOT real, or that the biggest pain is something else entirely (e.g. "getting paid at all" > "splitting the bill"). Report what you found against us.
5. **Synthesis, scoring, and stack-ranking** (see deliverables).

# PART 2 — CONDUCT THE RESEARCH & DELIVER

Produce a single structured report with these sections:

## D1. Executive summary
The 5–7 findings that change the roadmap, each one sentence. Lead with the answer to: *is this problem worth solving, is the shipped MVP hitting the biggest pain, and are we aimed at the right user?*

## D2. Pain-point validation matrix
Table, one row per pain (P1–P5 **and** every NEW pain discovered):

| Pain | Assumed or New | Evidence (verbatim + source URL) | Prevalence (how often it comes up) | Severity (how much it hurts) | Verdict: Confirmed / Weak / Refuted | Confidence |

## D3. Stack-ranked pain list → next-phase requirements
Rank ALL pains (assumed + new) by **priority × size** (frequency × severity × how underserved by current tools). For the top pains, translate each into a concrete product requirement / feature hypothesis for the next phase. This is the primary output — treat it as the draft requirement backlog.

## D4. Solution-fit scorecard
Table, one row per shipped solution:

| Solution | Painkiller or Vitamin? | Which pain it addresses | What users would praise | Where it falls short / risks | Substitute they use today | Switching likelihood | Confidence |

Then a short verdict per solution: keep / improve / reconsider.

## D5. Next-phase (AI ingestion) demand read
Evidence on the real cost of manual entry, appetite for automated supplier-ingestion, and the trust/privacy/accuracy objections. Verdict: is this the right next bet, or should something higher on the D3 stack come first?

## D6. Segment & ICP recommendation
For each segment (core ICP, single-property, large operator, agent/PM, tenant): do they have the pain, what do they use, what's the incumbent, market-size and WTP signal, and fit with Settleroo's deterministic-split wedge. Explicit recommendation on: (a) keep/adjust the 2–10-property ICP, (b) whether agents/PMs are worth pursuing and why/why not, (c) where the biggest scalable ($ ) opportunity is if we want to 5–20x. Note the incumbent risk for the agent segment (they live inside trust-accounting platforms bound to state regulation, so a point tool may be "one more place," not "everything in one place" — test this, don't assume it).

## D7. Synthetic persona library
The full personas from §1.2.

## D8. Evidence appendix
Every source: platform, title, URL, date, and the quotes pulled from it. Separate a clearly-labelled list of **real cited evidence** from **synthetic inference**.

# QUALITY BAR (verify before you finish)

- [ ] Every claim about a real user pain is backed by a **cited source with a URL**, or explicitly flagged as synthetic inference. No un-sourced assertions dressed as fact.
- [ ] You actively searched for **disconfirming** evidence and reported it (D2/D5/D6), not just evidence that flatters the product.
- [ ] Every pain and every solution carries a **confidence rating** (High/Med/Low) tied to how much real evidence backs it.
- [ ] No invented quotes attributed to real, named people. Synthetic personas are labelled as synthetic.
- [ ] The stack-ranked list (D3) is genuinely prioritised (priority × size), not just a restatement of our assumptions in our order.
- [ ] The segment analysis (D6) gives a clear, defensible recommendation, including the commercial/scalability angle, not a hedge.
- [ ] Australian context is prioritised; where you rely on overseas (UK HMO, US) analogs, you say so and note the transfer risk.
- [ ] If evidence is thin on any question, you say "insufficient evidence" rather than guessing — and note what primary research (e.g. real operator interviews) would close the gap.
```

---

### After you get the results back

The report's **D3 stack-ranked list** and **D5 next-phase read** are the inputs for the next roadmap decision — bring them back here and we'll pressure-test them against the current build order (B → C → M → D → E) before committing. Watch specifically for the case where a pain *above* AI ingestion in the stack (e.g. actually collecting the money, or tenant vetting) outranks the ingestion bet we're leaning toward.
