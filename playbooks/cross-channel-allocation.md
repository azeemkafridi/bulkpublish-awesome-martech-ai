# Cross-Channel Marketing Resource Allocation

Instructional implementation guide. Reviewed 2026-09-30. Related [interactive demo](../demos/incrementality-measurement/) separates public observations, simulated scenarios and computed synthetic-user results.

## Business question

Where should the next unit of budget go, including not spending it? Define the horizon and business objective. Incremental contribution equals incremental net revenue minus incremental product/fulfillment costs and incremental marketing costs. Deduct discounts and returns once in a consistent net-revenue definition.

## Required inputs and baseline

Reconcile spend by channel/time/geo, experimental assignment, total business outcomes, refunds, margins, inventory and promotions. Define actual spend versus budget and positive spend contrasts for iROAS. Include seasonality, price, distribution and organic-demand controls where justified.

Show a complete status-quo plan, candidate plan and differences. Include test budget and unspent reserve as explicit lines. Hold total available funds fixed for a comparable reallocation; if the total changes, show that as a separate decision.

## Experiments and MMM answer different questions

- Randomized user tests: only where treatment eligibility, suppression and spillover permit independent assignments.
- Randomized geo holdouts: require enough comparable markets, controllable delivery and limited cross-market interference; match/stratify before randomization and analyze at assignment level.
- Switchbacks: require time-level control and defensible delay/carryover handling. Predeclare block length, washout, attribution to assignment and period correlations. Alternation without randomization is not equivalent.
- Observational ITS or synthetic controls: require explicit counterfactual assumptions, stable measurement and sensitivity/placebo checks. A simultaneous pandemic shock cannot identify marketing effects by itself.
- MMM: useful for aggregate lag/saturation and planning, subject to assumptions, informative variation and confounding. Calibrate with compatible experiments; predictive fit alone does not validate causal response.

See [switchback research](https://arxiv.org/abs/2009.00148) and [Meridian documentation](https://developers.google.com/meridian/docs/basics/meridian-introduction).

## Analysis and decision

Predeclare estimand, minimum worthwhile effect, window, maturity and guardrails. A fixed-window test monitors safety while running and analyzes efficacy at the planned end. Target power needs an actual design calculation. Do not report `1 − p` as confidence.

Historical average iROAS does not measure the next dollar's return. Budget expansion needs a local spend contrast or a response curve within observed support, with uncertainty. Consider saturation, competitor response, learning phases and inventory constraints. [eBay's field experiments](https://faculty.haas.berkeley.edu/stadelis/BNT_ECMA_rev.pdf) illustrate context-dependent effects and heterogeneity, not a universal rule to stop search advertising.

If intervals cross requirements, preserve the baseline or record a reversible risk-limited operating choice. If assignment or measurement fails, block causal claims. Public expenditure cuts can motivate an experiment without specifying a correct allocation.

## Execution and rollback

Require channel owner approval, versioned allocations, spend caps, daily pacing, idempotent changes and explicit rollback. Stage deployment, retain comparison units and reassess mature outcomes. Include customer-experience harm, refunds, direct-demand changes and contribution in the monitoring plan.

Do not extrapolate an experiment to a new budget, audience or season silently. Reconcile exported plans with rendered amounts, including rounding; repeated allocation must not create money or omit reserves.
