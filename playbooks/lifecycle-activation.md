# Lifecycle Activation and Retention

Instructional implementation guide; not a report of a deployed system. Reviewed 2026-09-30.

## Decision and objective

For an eligible customer, choose no contact, email or push, with an approved message/offer and timing. Optimize incremental contribution over a predeclared horizon; monitor opt-outs, complaints, refunds and later retention. Conversion propensity is not the effect of contact.

## Data contract

Require customer/account ID, eligibility timestamp, consent/channel state, prior contacts, order/refund history, offer costs and availability. Log assignment before execution, assignment probability, action version, delivery and mature outcomes. Retain people whose message fails in the assigned group for intention-to-treat analysis; do not compare only openers with non-openers.

## Baseline and method

Start with the current rule policy versus no contact. Randomize at the customer or account/household level where interference requires it. Keep assignment stable across concurrent campaigns. Define the eligible population before assignment; include a suppression mechanism for the no-contact group.

After collecting randomized evidence, compare uplift targeting with the rule policy in a new randomized policy test. A predictive model alone does not justify preferential treatment. Bandits need safe exploration and mature rewards; delayed retention cannot be replaced by opens.

## Design and execution

Predeclare primary metric, minimum worthwhile effect, sample-size assumptions, duration, refund maturity, exclusion criteria and guardrails. Check power using expected variance and assignment units before launch; target power is a design property, not an observed pass/fail confidence score. Follow a fixed analysis window or a separately specified sequential design.

The action contract checks current consent, channel frequency, offer stock, redemption terms and limits. Use an idempotency key per approved action. Retry only known safe failures; escalate disputed promises and inconsistent consent. Pausing for harm is different from declaring success.

## Evaluation and decision

Estimate the intention-to-treat difference at the assignment unit, with an interval. Compare to the business threshold and net costs. Keep selected customers, assignments, failures and outcomes in the audit trail. Check heterogeneous effects using a predeclared plan; label exploratory slices and validate later.

- Supported value: try a bounded rollout and retain a long-term holdout.
- Below the requirement: inspect offer economics, eligibility and negative feedback before redesign.
- Interval crosses the requirement: report uncertainty; hold policy or record a limited-risk choice.
- Broken assignment, missing outcomes or contamination: block a causal claim and repair the design.

## Failure and rollback

Stop contact on revoked consent, duplicate actions, unexpected complaint/opt-out harm or nonredeemable offers. Do not reinterpret missing purchase data as zero conversion. Reconcile channel and business logs, then rerun the planned analysis after mature outcomes.

References: [Braze's documented decisioning dimensions](https://www.braze.com/product/brazeai-decisioning-studio), [multiple-treatment uplift with costs](https://arxiv.org/abs/1908.05372), [ASA statistical interpretation](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf). The [interactive demo](../demos/incrementality-measurement/) includes an elementary synthetic randomized-user analysis; it does not execute messaging.
