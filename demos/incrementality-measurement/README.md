# Incrementality Measurement Demo

An English educational product prototype adapted from the supplied incrementality SaaS demo and its review discussion. It belongs primarily to **Measurement**, connects to **Decision**, and depends on **Data** contracts. It is not an agent product or a production causal platform.

## Run

Open `index.html` directly in a modern browser, or serve the repository:

```sh
python3 -m http.server 8000
```

Then visit `http://localhost:8000/demos/incrementality-measurement/`. No build, package install, backend or network dependency is required by the demo. GitHub's file view does not execute HTML; download locally or use a static host. GitHub Pages deployment is not configured by this change.

## Explore

1. Inspect Airbnb, eBay and P&G: click evidence cards to see source type, date, metric definition and limits. They contain disclosures and historical research, not re-estimated company results.
2. Open NOVA and switch among supported, below-requirement, uncertain and invalid scenarios. The original 4.8% order-lift interval crosses the 6% threshold, and the 1.42 iROAS has no interval. Default action therefore stays pending.
3. Review experiment feasibility: assignment control, data validity, interference, observation duration, delay, switchback blocks and washout. Duration zero cannot be saved. Plans can remain explicit drafts when prerequisites fail.
4. Compare status quo and candidate budgets. Candidate proportions are fictional, even when requirements are supported. Under uncertainty, a candidate requires an explicit reversible business-choice record. Invalid data blocks it. Public cases/drafts/user experiments retain baseline allocations because no channel response curve was fitted.
5. Open the randomized-user lab, vary seed/sample size and generate observed rows. Inspect computed estimates and download the raw CSV.
6. Create a local draft with a chosen method, channel and typed objective. Export the current case, then import the JSON to restore its configuration and raw data. Import recomputes synthetic estimates instead of trusting exported analysis.

Presentation mode expands the six-stage workflow and reveals a short narration. Normal mode emphasizes the current question, available evidence and next decision. Drafts last for the page session; exported packages provide explicit persistence. This is not an authenticated private workspace.

## What is calculated

Only the **randomized-user lab** estimates effects from raw data. `engine.js` is separate from the case generator:

- Balanced complete random assignment to contact/no contact; independent synthetic binary outcomes, complete observation and no interference assumed.
- Intention-to-treat difference in arm means, at the assigned-user level.
- Sample-variance standard error: `sqrt(s²_T / n_T + s²_C / n_C)`.
- A two-sided approximate interval: `difference ± 1.96 × standard error`.
- Outcomes: conversion-rate difference in percentage points, incremental net revenue per assigned user, and incremental contribution per assigned user.
- Synthetic economics: $80 net revenue and $48 variable cost per conversion; $0.30 marketing cost per treatment-assigned user. These fields enter the observed raw rows, not an estimated response curve.
- The generator's effect parameter is **not read by the estimator**. Changing raw observations changes the estimate, even with the same generator settings.

The normal approximation is blocked when either arm has fewer than 100 units, 10 conversions or 10 nonconversions. These checks do not validate a real design. No clustered, sequential, switchback, geo, covariate-adjusted, missing-data or off-policy inference is implemented. No p-value or power analysis is reported. The estimator is an instructional approximation, not a production analysis recommendation.

NOVA's results, individual intervals, budget proportions, spend and margin are explicit assumptions. It uses relative order lift, unlike the randomized lab's absolute conversion-rate difference. At the assumed 40% margin, contribution breaks even at iROAS 2.50; meeting the order and 1.50× return requirements is not proof of profitability. The candidate reallocation is a manual bookkeeping proposal, not a recommendation derived from brand-search effects or prospecting returns. Revenue and contribution scenario cards transform the assumed iROAS; they are not additional independently measured evidence. The original CNY scenario has been replaced with a fictional USD planning scenario; no currency conversion or historical monetary claim is implied.

## Decision and export rules

An interval entirely at/above a requirement supports review of a bounded candidate; entirely below supports review of economics/contraction/redesign; crossing it is inconclusive. Missing intervals remain pending. This is an educational interval-screening rule, not a joint hypothesis test or proof of marginal budget response. Safety violations and invalid evidence are separate states.

Fixed observation and outcome maturity govern efficacy analysis; safety/data monitoring can pause operations separately. All displayed allocations use one rounded allocation function shared by CSV/JSON exports. Channel amounts, validation and reserve sum exactly to the selected funds. Export includes objective, thresholds, evidence state, risk-choice flag and rationale.

`case-schema.json` documents the v2 package. The runtime validator checks required fields, methods, objectives, finite budgets, normalized shares and raw observations. Imported evidence remains visibly unverified. Use synthetic or non-sensitive data; no personal-data workflow or access control is provided.

## Files and verification

- `index.html`, `styles.css`: interface; layout/CSS adapted from the supplied source.
- `engine.js`: pure validation, estimation, decision, allocation and CSV functions.
- `data.js`: cited public evidence and explicitly labeled synthetic cases.
- `app.js`: one current-case state drives navigation, evidence, planning, decisions and exports.
- [sources.md](sources.md): evidence ledger, historical corrections and assumptions.
- [tests/engine.test.js](tests/engine.test.js): statistical arithmetic and material decision/export regressions.
- [tests/dom.test.js](tests/dom.test.js): case switching, planning, input validation, rendered/exported allocations, raw-data regeneration, import recomputation and JSON Schema consistency. DOM simulation does not verify browser rendering.

Run the dependency-free checks with:

```sh
node --test demos/incrementality-measurement/tests/engine.test.js
```

Optional DOM and schema checks use Node 24 or newer and test-only dependencies:

```sh
cd demos/incrementality-measurement/tests
npm ci
npm test
```

The demo does not load those dependencies. This revision passed all 15 checks. Actual-browser rendering and mobile/assistive-technology behavior still need visual verification.

The repository [review ledger](../../docs/evidence-review.md) records the discussion's changes. There are no live connectors, experiment execution, ad writes, automatic optimization, LLM integrations or revenue forecasts.
