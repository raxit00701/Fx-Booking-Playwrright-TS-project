# Fx-Booking-Playwrright-TS-project
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0D0D0D,30:2D0000,65:8B0000,100:FF4444&height=250&section=header&text=FX%20BOOKING%20PLAYWRIGHT%20TS&fontSize=48&fontColor=FFFFFF&fontAlignY=38&fontAlign=50&desc=★%20%20End-to-End%20Booking%20Automation%20%7C%20Playwright%20%7C%20TypeScript%20%20★&descAlignY=62&descSize=16&descColor=FFD7D7&animation=fadeIn" width="100%"/>

<br/>

![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=for-the-badge&logo=playwright&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![dotenv](https://img.shields.io/badge/dotenv-ECD53F?style=for-the-badge&logo=dotenv&logoColor=black)
![Status](https://img.shields.io/badge/Status-BATTLE__TESTED-DC143C?style=for-the-badge)
![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-8B0000?style=for-the-badge)

<br/>

![Tests](https://img.shields.io/badge/Tests-PASSING-brightgreen?style=flat-square)
![Quality](https://img.shields.io/badge/Code%20Quality-IMMACULATE-gold?style=flat-square)
![Bugs](https://img.shields.io/badge/Bugs-ANNIHILATED-DC143C?style=flat-square)
![Assertions](https://img.shields.io/badge/Assertions-MERCILESS-8B0000?style=flat-square)
![CSV](https://img.shields.io/badge/CSV%20Report-GENERATED-crimson?style=flat-square)

<br/><br/>

### ✦ &nbsp; The Most Ruthlessly Efficient Booking Automation Framework Ever Conceived &nbsp; ✦

<br/>

> *"While lesser frameworks tremble at dynamic calendars and multi-stage price comparisons,*
> *this framework **laughs in TypeScript.**"*

<br/>

**★ ★ ★ ★ ★**

<br/>

</div>

---

<div align="center">

## 🌑 &nbsp; TABLE OF CONTENTS &nbsp; 🌑

</div>

<div align="center">

| ✦ | Section |
|:---:|---------|
| ⚡ | [The Legend — What Is This?](#-the-legend) |
| 🏗️ | [Architecture of Supremacy](#️-architecture-of-supremacy) |
| 🔥 | [Stage-by-Stage Domination](#-stage-by-stage-domination) |
| 💎 | [Features That Will Change Your Life](#-features-that-will-change-your-life) |
| 🚀 | [Quick Start — Mere Mortals Welcome](#-quick-start) |
| ⚙️ | [Configuration](#️-configuration) |
| 📁 | [Project Structure](#-project-structure) |
| 📊 | [The Sacred CSV Report](#-the-sacred-csv-report) |
| 📜 | [License](#-license) |

</div>

---

## ⚡ THE LEGEND

This is not just another Playwright test suite quietly rotting in a GitHub graveyard.

This is a **precision-engineered, end-to-end booking automation behemoth** — a framework so thorough, so exacting, so *unreasonably committed to correctness*, that every price discrepancy between the listing page and the checkout page is hunted down, catalogued, and reported in a structured CSV file with the finality of a court verdict.

**FX-Booking-Playwright-TS** was built to answer one question that haunts every ticketing platform in the dead of night:

> *Does the user actually pay what they were shown?*

It answers that question across **six ruthless stages**, with **zero hardcoded values**, against **any attraction URL you dare to supply** — and it does so while producing **one immaculate CSV report** as irrefutable evidence of every truth it uncovers.

You don't configure this framework around an attraction. The attraction conforms to the framework.

---

## 🏗️ ARCHITECTURE OF SUPREMACY

```
                    ╔═════════════════════════════════════════╗
                    ║     FX-BOOKING-PLAYWRIGHT-TS            ║
                    ║   ★  The Booking Automation Engine  ★   ║
                    ╚══════════════════╦══════════════════════╝
                                       ║
              ╔════════════════════════╬════════════════════════╗
              ▼                        ▼                        ▼
     ┌─────────────────┐   ┌───────────────────┐   ┌───────────────────┐
     │  test1.spec.ts  │   │   Page Objects    │   │  Utility Modules  │
     │  (Orchestrator) │   │    (e2e.ts)       │   │    (utils/)       │
     └────────┬────────┘   └─────────┬─────────┘   └─────────┬─────────┘
              │                      │                        │
     ╔════════▼══════════════════════▼════════════════════════▼════════╗
     ║                        STAGE PIPELINE                          ║
     ║                                                                ║
     ║  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌───────────┐   ║
     ║  │ STAGE 0  │──▶│ STAGE 1  │──▶│ STAGE 2  │──▶│  STAGE 3  │   ║
     ║  │          │   │          │   │          │   │           │   ║
     ║  │  Login   │   │ Listing  │   │  Ticket  │   │ Date/Time │   ║
     ║  │  ★ Auth  │   │ ★ Extract│   │ ★ Verify │   │ ★ CartAdd │   ║
     ║  └──────────┘   └──────────┘   └──────────┘   └─────┬─────┘   ║
     ║                                                       │        ║
     ║  ┌─────────────────────────┐   ┌─────────────────────▼──────┐  ║
     ║  │        STAGE 5          │◀──│          STAGE 4            │  ║
     ║  │                         │   │                             │  ║
     ║  │  Verification Reckoning │   │   Cart & Checkout Capture   │  ║
     ║  │  ★ Assert Everything    │   │   ★ Extract All The Things  │  ║
     ║  └────────────┬────────────┘   └─────────────────────────────┘  ║
     ╚═══════════════║══════════════════════════════════════════════════╝
                     ║
                     ▼
            ┌─────────────────┐
            │   report.csv    │
            │                 │
            │   The Truth.    │
            │   Unfiltered.   │
            │   Permanent.    │
            └─────────────────┘
```

---

## 🔥 STAGE-BY-STAGE DOMINATION

### ✦ STAGE 0 — The Authentication Gauntlet

Before a single ticket name is read, a single price is captured, or a single calendar date is clicked — **identity must be established and verified**.

The framework logs in through the UI exactly as a real user would. No API shortcuts. No token injection. No bypassing the login form because it "feels redundant." The login page is visited. The credentials are entered. The submission is made.

And then — unlike the naïve automation that simply assumes success and charges forward — this framework **asserts that login actually worked**. It looks for a concrete signal: the account menu appearing, the redirect completing, the unmistakable evidence of authenticated access. If that signal is absent, the test halts immediately with a clear, unambiguous message. It does not stumble forward and produce mystifying downstream failures that waste everyone's afternoon.

The password is never, under any circumstances, printed to the console, captured in a screenshot, or written to the report.

> 💡 **Bonus capability:** session state is cached after the first login and reused on subsequent runs — because re-authenticating every single time is a choice made by people who haven't considered the alternative.

---

### ✦ STAGE 1 — The Listing Page Extraction

The supplied URL is opened. Then, with the cold methodical efficiency of an auditor who has seen far too many discrepancies to take anything on faith, the framework extracts **every single ticket option** visible on the page.

| Field | What It Captures |
|-------|-----------------|
| 🎫 **Ticket Name** | Exactly as displayed — not guessed, not inferred, not approximated |
| 💰 **Displayed Price** | The live, current selling price |
| 🔴 **Regular Price** | The struck-through original, when one is shown |
| 🔗 **Ticket URL** | The precise link the card resolves to |
| 🔢 **Total Count** | Every option, accounted for, verified against DOM reality |

Every captured price is parsed into a **real numeric value** before any comparison is made. `$1,234.50`, `USD 1234.50`, and `1234.50` are understood to be the same amount. Raw string comparison is not tolerated here.

Assertions fire immediately:

- At least one ticket must exist on the page — if not, we investigate, not guess
- The count must match what's actually rendered
- Every ticket must have a name — empty names are not acceptable
- Every price must parse as a positive currency amount
- No ticket may show a price of `0.00` — something is always wrong when that happens
- Where a regular (original) price is present, it must exceed the displayed price — otherwise the "discount" is fraudulent and we will say so

---

### ✦ STAGE 2 — The Ticket Page Confrontation

Armed with the complete Stage 1 baseline, the framework selects a ticket — configurable by index, by name, or defaulting to the first available — and **clicks** to its dedicated page.

Note the word "clicks." Not `page.goto()`. Not URL construction. Not a clever routing trick. A **click** — because the requirement is to exercise the real user path, and we honour that requirement without negotiation.

Upon arrival, three questions are asked with the directness of a seasoned investigator:

- Did the URL actually change to the ticket page?
- Does the name displayed here match what was captured in Stage 1?
- Does the price displayed here match the Stage 1 price for this ticket?

If the answer to any of these is "no" — it is recorded with the precision of a forensic accountant.

---

### ✦ STAGE 3 — The Calendar, The Clock, The Cart

This is where most automation frameworks quietly fall apart. Calendar interactions. Dynamic date availability. Time slots that may or may not exist. Sold-out options. Month boundaries.

Not here.

**The calendar is opened.** An available date is identified dynamically — because hardcoding `2026-12-15` and hoping for the best is not a testing strategy, it is wishful thinking in disguise. The framework scans for the first available date. If the current month offers none, the calendar advances. This continues within a sensible retry bound, after which — if still nothing is found — the test fails with an explicit, readable message:

```
No available dates found within the search window. Ticket may have no current availability.
```

Not:
```
TimeoutError: locator.click: Timeout 30000ms exceeded
```

**Time slots are handled with equal grace.** If a ticket offers time selection, one is chosen. If it doesn't — because some tickets are date-only — the framework detects this, records it, and moves forward without raising an alarm.

**Quantity is set.** Defaults to 1. Configurable to anything you need.

**The post-selection price is captured.** Because dated tickets can have different prices than listed prices, and when they do, the framework notes the difference rather than silently accepting it.

**The cart button is clicked.** The framework confirms the action succeeded — cart count incremented, confirmation appeared, redirect occurred — whichever signal the site provides.

---

### ✦ STAGE 4 — The Cart and Checkout Interrogation

The cart page is read with the attention to detail of someone who has been overcharged before and refuses to let it happen again.

**From the cart:**

- Line item name
- Unit price
- Quantity
- Line total
- Selected date and time, exactly as the cart displays them
- Cart subtotal and grand total

The checkout page is then reached, and subjected to the same forensic examination:

- Line item name
- Unit price
- Quantity
- Order total
- Every fee, tax, and discount listed separately — because they count

> ⛔ **The framework stops at checkout. No payment information is entered. No orders are placed. No credit cards are harmed in the running of this test suite.**

---

### ✦ STAGE 5 — The Verification Reckoning

The final stage. Every data point collected across every previous stage is now compared against every other relevant data point. This is the moment of truth. This is what the whole framework was built for.

| Comparison | Scope |
|------------|-------|
| 🎫 **Ticket Name** | Listing = Ticket Page = Cart = Checkout |
| 💰 **Unit Price** | Ticket Page = Cart = Checkout |
| 🔢 **Quantity** | What was selected = Cart = Checkout |
| 🧮 **Line Total** | Unit Price × Quantity = Cart Line Total |
| 📅 **Date & Time** | What was selected = Cart = Checkout (compared as dates, not strings) |
| 💳 **Order Total** | Cart Total = Checkout Total (with fees and discounts explicitly accounted for) |

**All mismatches are collected before reporting** — not aborted on the first failure. Because discovering that three things disagree across stages is significantly more useful than discovering one and stopping there.

Every failure message is human-readable and actionable:

```
Unit price mismatch: ticket page $89.00, cart $95.00 (ticket: Example Standard Ticket)
Date mismatch: selected 2026-09-20, cart shows "20 September 2026", checkout shows "Sep 20" — parsed match: PASS
Order total mismatch: cart $89.00, checkout $97.35 — unaccounted difference: $8.35
```

Never this:
```
AssertionError: expected true to be false
    at Object.<anonymous> (tests/test1.spec.ts:247:18)
```

---

## 💎 FEATURES THAT WILL CHANGE YOUR LIFE

<table>
<tr>
<td width="50%">

**🔐 Zero Hardcoded Values**
URL, credentials, ticket selection strategy, quantity — every configurable thing is configurable. The framework adapts to any attraction URL without a single line change.

**📅 Dynamic Calendar Intelligence**
Finds the first available date automatically. Advances through months when the current one is empty. Fails explicitly, never silently, when no availability exists.

**💱 Currency-Aware Price Comparison**
`$1,234.50` and `USD 1234.50` and `1234.50` are the same number. Every price is normalised before any comparison is made. Raw string matching is a trap this framework refuses to walk into.

**📋 Mandatory CSV Report**
Every captured value. Every assertion. Every PASS. Every FAIL. Written to `report.csv` regardless of outcome — because the report is most valuable precisely when something breaks.

</td>
<td width="50%">

**🕐 Time Slot Awareness**
Detects whether a ticket requires time selection. Chooses a slot when one exists. Moves forward without incident when the ticket is date-only. No false failures.

**📣 Surgical Failure Messages**
Every mismatch identifies which stage disagreed, what was expected, what was found, and which ticket it concerns. No ambiguity. No archaeology required.

**🔄 Session State Caching (Bonus)**
Stores authenticated session state after the first login and reuses it on subsequent runs. Because logging in fresh every time is for frameworks that haven't earned the optimisation.

**📊 Aggregate Mismatch Reporting**
All verification failures are collected and reported together. You receive the complete picture — not a premature exit after the first broken assertion.

</td>
</tr>
</table>

---

## 🚀 QUICK START

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v18 or higher (the framework deserves a runtime that respects it)
- **npm** (comes with Node, no excuses)
- Valid credentials for the target booking site
- The target attraction URL
- A willingness to see your assumptions tested

### Installation

```bash
# Clone the repository
git clone https://github.com/RaxitSharma/Fx-Booking-Playwright-TS-project.git
cd Fx-Booking-Playwright-TS-project

# Install all dependencies
npm install

# Install Playwright browsers (Chromium by default — the chosen browser)
npx playwright install chromium

# Set up your environment
cp .env.example .env
# Open .env and fill in your real values
```

### Execution

```bash
# Run the full test suite
npx playwright test

# Run with a visible browser (for the curious)
npx playwright test --headed

# Run with Playwright's UI mode (for the thorough)
npx playwright test --ui

# View the generated report after a run
cat data/report.csv
```

---

## ⚙️ CONFIGURATION

All configuration lives in `.env`. The real `.env` is in `.gitignore`. The `.env.example` is in the repository. This arrangement is non-negotiable.

```env
# ─────────────────────────────────────────────────────────────
# .env.example
# Copy this file to .env and fill in real values.
# Never commit .env. The .gitignore already knows.
# ─────────────────────────────────────────────────────────────

# The attraction listing URL to test against
ATTRACTION_URL=https://example.com/tickets/your-attraction-here

# Login credentials
USERNAME=your_username_here
PASSWORD=your_password_here

# ─── Optional configuration ──────────────────────────────────

# Which ticket to select from the listing page
# Accepts: 0-based index (e.g. 0), or a ticket name string
# Default: 0 (first ticket)
TICKET_INDEX=0

# How many tickets to add to the cart
# Default: 1
TICKET_QUANTITY=1

# Date selection strategy: "first" | "last" | "random"
# Default: first
DATE_STRATEGY=first
```

---

## 📁 PROJECT STRUCTURE

```
FX-Booking-Playwright-TS/
│
├── 📄 .env                      ← Your secrets. Guard them.
├── 📄 .env.example              ← The template. Commit this.
├── 📄 .gitignore                ← The sentinel. Never delete it.
├── 📄 playwright.config.ts      ← Browser, timeout, and reporter configuration
├── 📄 package.json              ← Dependencies and scripts
├── 📄 README.md                 ← You are here ★
│
├── 📂 api/
│   └── login.ts                 ← Authentication helpers and session utilities
│
├── 📂 data/
│   ├── report.csv               ← Generated on every run. The permanent record.
│   └── stage1-baseline.json    ← Stage 1 capture. The source of truth for all comparisons.
│
├── 📂 page/
│   └── e2e.ts                   ← Page Object Model — selectors and page-level interactions
│
├── 📂 tests/
│   └── test1.spec.ts            ← The main orchestration test. Where the stages convene.
│
└── 📂 utils/
    ├── csvReport.ts             ← CSV generation engine. Writes truth to disk.
    ├── stage1Listing.ts         ← Listing page extraction and initial assertions
    ├── stage2TicketPage.ts      ← Ticket page navigation and cross-stage verification
    ├── stage3DateTimeCart.ts    ← Calendar navigation, time selection, cart addition
    ├── stage4CartCheckout.ts    ← Cart and checkout data extraction
    └── stage5Verification.ts   ← The final reckoning. Every comparison. Every verdict.
```

---

## 📊 THE SACRED CSV REPORT

Every run produces `report.csv`. This file is not a bonus. It is not optional. It is not a "nice-to-have." It is a **required deliverable** — generated at the start of the run, populated throughout every stage, and finalised regardless of whether the test passed or failed.

Especially when it failed. The report is most useful precisely when something went wrong.

### Column Contract

The following columns appear in this exact order. Do not reorder them. Do not rename them. They are a contract.

| Column | Meaning |
|--------|---------|
| `run_timestamp` | ISO 8601 timestamp of when the run began |
| `attraction_url` | The URL under test |
| `stage` | One of: `login`, `listing`, `ticket_page`, `cart`, `checkout`, `verification` |
| `ticket_name` | The ticket this row concerns; blank for order-level rows |
| `field` | What is being recorded: `ticket_count`, `displayed_price`, `unit_price`, `quantity`, `line_total`, `selected_date`, `selected_time`, `order_total`, `login_success`, etc. |
| `expected` | The baseline value. Blank on `INFO` rows where nothing to compare yet. |
| `actual` | The value observed during this run |
| `status` | `PASS`, `FAIL`, or `INFO` |
| `notes` | Mismatch detail, currency info, skip reasons, anything worth knowing |

### Row Rules

- `INFO` rows carry captured data with no comparison yet — `expected` is blank
- `PASS` / `FAIL` rows carry both `expected` and `actual`
- One row per ticket option from the listing page, plus one `ticket_count` row
- Prices are written as plain numbers (`89.00`, not `$89.00`) — currency goes in `notes`
- A failing run writes a **complete** CSV — it does not abort mid-file

### Sample Output

```csv
run_timestamp,attraction_url,stage,ticket_name,field,expected,actual,status,notes
2026-08-24T14:15:30Z,https://example.com/tickets/your-attraction,login,,login_success,true,true,PASS,
2026-08-24T14:15:35Z,https://example.com/tickets/your-attraction,listing,,ticket_count,,3,INFO,
2026-08-24T14:15:36Z,https://example.com/tickets/your-attraction,listing,Example Standard Ticket,displayed_price,,89.00,INFO,Currency: USD
2026-08-24T14:15:36Z,https://example.com/tickets/your-attraction,listing,Example Standard Ticket,regular_price,,109.00,INFO,Struck-through price; Currency: USD
2026-08-24T14:15:36Z,https://example.com/tickets/your-attraction,listing,Example Premium Ticket,displayed_price,,149.00,INFO,Currency: USD
2026-08-24T14:15:50Z,https://example.com/tickets/your-attraction,ticket_page,Example Standard Ticket,ticket_name,Example Standard Ticket,Example Standard Ticket,PASS,
2026-08-24T14:15:51Z,https://example.com/tickets/your-attraction,ticket_page,Example Standard Ticket,displayed_price,89.00,89.00,PASS,
2026-08-24T14:15:58Z,https://example.com/tickets/your-attraction,ticket_page,Example Standard Ticket,selected_date,,2026-09-20,INFO,Dynamic selection; first available
2026-08-24T14:15:59Z,https://example.com/tickets/your-attraction,ticket_page,Example Standard Ticket,selected_time,,14:30,INFO,
2026-08-24T14:16:04Z,https://example.com/tickets/your-attraction,cart,Example Standard Ticket,unit_price,89.00,89.00,PASS,
2026-08-24T14:16:04Z,https://example.com/tickets/your-attraction,cart,Example Standard Ticket,quantity,1,1,PASS,
2026-08-24T14:16:04Z,https://example.com/tickets/your-attraction,cart,Example Standard Ticket,line_total,89.00,89.00,PASS,
2026-08-24T14:16:12Z,https://example.com/tickets/your-attraction,checkout,Example Standard Ticket,unit_price,89.00,95.00,FAIL,differs from ticket page; Stage 2: 89.00 vs Stage 4: 95.00
2026-08-24T14:16:13Z,https://example.com/tickets/your-attraction,checkout,,order_total,89.00,97.35,FAIL,unaccounted difference of 8.35; check for hidden fees
2026-08-24T14:16:14Z,https://example.com/tickets/your-attraction,verification,Example Standard Ticket,price_consistency,,FAIL,FAIL,2 mismatches collected; see rows above
```

---

## 📜 LICENSE

```
All Rights Reserved

Copyright (c) 2026 Raxit Sharma

This test automation framework, including all source code, scripts,
configurations, documentation, test cases, libraries, and associated files
(the "Framework"), is the exclusive property of Raxit Sharma.

No permission is granted to any individual, company, organization, or other
entity to use, copy, modify, distribute, publish, sublicense, sell, share,
or create derivative works from the Framework, in whole or in part, for any
purpose, including personal, educational, research, internal business, or
commercial use, without prior written permission from the copyright holder.

The Framework is provided for viewing and reference purposes only.

Any unauthorized use, reproduction, modification, distribution, or
incorporation of this Framework into other projects is strictly prohibited.

All rights not expressly granted are reserved.

Copyright © 2026 Raxit Sharma
```

---

<div align="center">

<br/>

✦ &nbsp; ✧ &nbsp; ★ &nbsp; ✦ &nbsp; ✧ &nbsp; ★ &nbsp; ✦ &nbsp; ✧ &nbsp; ★ &nbsp; ✦ &nbsp; ✧ &nbsp; ★ &nbsp; ✦ &nbsp; ✧ &nbsp; ★ &nbsp; ✦ &nbsp; ✧ &nbsp; ★ &nbsp; ✦ &nbsp; ✧ &nbsp; ★

<br/>

*Built with obsessive attention to detail.*
*Maintained with the conviction that correctness is not optional.*
*Documented with perhaps more enthusiasm than strictly necessary.*

<br/>

**© 2026 Raxit Sharma &nbsp;—&nbsp; All Rights Reserved**

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FF4444,50:8B0000,100:0D0D0D&height=130&section=footer&animation=fadeIn" width="100%"/>

</div>
