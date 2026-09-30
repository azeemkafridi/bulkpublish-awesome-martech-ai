# Conversational Sales and Service

Instructional implementation guide; not a vendor deployment claim. Reviewed 2026-09-30.

## Decision and scope

Choose what information to provide, which approved business action to perform and when to hand off. For proactive contact, also decide whether contact is permitted. Define customer state, valid product/offer terms, qualified lead, completed transaction and resolved issue with business owners. Service quality and growth overlap without being identical.

## Data and baseline

Use versioned product knowledge, identity/authorization, account state, contact consent, inventory, pricing, transaction status and escalation rules. Retain tool inputs/outputs and the approved action ledger with appropriate data-access controls. Compare with the existing scripted flow and human process on the same task distribution.

## Method choice

Use a fixed workflow for predictable tasks with clear branches. Test an LLM agent when dynamic planning or context interpretation adds measurable value. Retrieval does not guarantee factual correctness. Capability evidence and vendor announcements do not establish incremental sales or retention; [Sierra Horizon](https://sierra.ai/blog/horizon) is an example of documented proactive scope.

## Action contract

Define read versus write tools, spending/refund caps, authorized incentives, identity checks, inventory reservation, idempotency, reversal and human approval. An agent must not promise stock, price or service terms without authoritative state. After a timeout, query transaction status before retrying a payment or refund.

Trigger handoff for account disputes, uncertain eligibility, unsupported obligations, repeated failure and customer requests. A conversation ending is not proof of resolution.

## Two evaluation tracks

| System evaluation | Business evaluation |
|---|---|
| Grounded factual correctness | Incremental qualified sales or retained customers |
| Policy and permission compliance | Contribution after incentives and service costs |
| Tool correctness and duplicate prevention | Refunds, cancellations, complaints and later churn |
| Handoff quality and latency | Comparison with the prior process or no contact |

Start with offline, representative tasks and adversarial permission tests; then use shadow operation and limited approved actions. For business evaluation, randomize customers/accounts or operational units with contamination and capacity effects considered. Preserve human fallback so the comparison measures a deployable policy, not arbitrary denial of service.

## Decision and failure criteria

Set operational release gates before the pilot. Analyze mature customer outcomes in a declared window, including failed delivery and transferred cases. Interpret intervals relative to business requirements. Noninferior task performance does not establish incremental revenue; revenue growth can conceal subsidy or later cancellations.

Rollback for unauthorized writes, duplicate transactions, incorrect promises or harm beyond agreed thresholds. Record agent/model/policy versions and the evidence supporting subsequent rollout.

References: [workflows and agents](https://www.anthropic.com/engineering/building-effective-agents), [Sierra's product scope announcement](https://sierra.ai/blog/horizon), [decision and evidence responsibilities](../think/five-layers-cognitive-cycle.md).
