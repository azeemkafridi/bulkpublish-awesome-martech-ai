# Contributing to Awesome Martech AI

This is a curated technical knowledge framework. Add resources that help practitioners understand a decision, its implementation conditions or its evidence. Catalog breadth is secondary to accuracy.

## Inclusion and evidence

A contribution should contain substantive published research, useful product/engineering documentation, disclosed deployment experience, or an original analysis that clarifies practice. Vendor materials can establish public positioning and described capabilities. Label them as such; they do not independently establish causal efficacy. Early products may be included as references when scope and unknowns are explicit.

| Claim | Required evidence |
|---|---|
| Capability | Direct official documentation, code or runnable artifact |
| Implementation | Paper, source code or specific engineering disclosure |
| Commercial scale | Dated disclosure with metric definition and reporting party |
| Business improvement | Baseline, population/sample, observation window, design and uncertainty |
| Hypothesis | Explicit hypothesis label, reasoning and a way to test it |

Do not use spend managed as revenue, ARR as proof of technical causation, attributed ROAS as incremental return, or task completion as business lift. A reachable homepage does not support a specific architecture or effect claim. Record unknown implementation details as unknown. Remove or qualify unsupported precise numbers and superlatives.

## Entry format

```text
- [Name](direct-source-url) — Problem and relevant contribution; evidence type, limitation and review date when material.
```

For material product or effect claims include the source date, last checked date, metric definition, limitations and whether disclosure is vendor/customer/researcher reported. Keep the README concise; add detailed evidence in `docs/` or a relevant `sources.md`. Review dates apply only to the stated claims, not an implied audit of every linked product.

## Process

- One PR per resource or tightly related batch.
- Use the most relevant section; discuss substantial new taxonomy proposals in the issue or PR.
- Disclose affiliation with the resource.
- Explain what changed and how claims or artifacts were checked.
- Update English/Chinese essays and diagrams together when their concepts change.

## Artifact placement

- `think/`: original conceptual analysis; English with Chinese versions encouraged.
- `playbooks/`: business question, data, simple baseline, method conditions, action constraints, evaluation and failure criteria. Label instructional examples separately from deployments.
- `demos/`: runnable learning artifacts with a README, source ledger, explicit synthetic/pending states and reproducible instructions. No fabricated integrations, causal results or maturity ratings.
- `docs/`: evidence policy and claim-review notes.

For a quantitative demo, document the estimator and its assumptions, keep the generator's truth separate from estimation, validate inputs and ensure exports match displayed state. Test meaningful decision, import/export and statistical behaviors. If a method is only planned, do not silently substitute a computed method.

## Style

English catalog entries; bilingual essays/playbooks are welcome. Use concrete, bounded claims and direct sources. No emojis in headers. Avoid listicles, redundant tutorials, unsupported profitability rankings and precision unsupported by data.
