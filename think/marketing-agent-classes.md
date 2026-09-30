# Four Forms of Marketing Agents

*[中文版 / Chinese version](marketing-agent-classes.zh.md)*

Reviewed: 2026-09-30. The original four categories are retained as four **typical operational forms**. They describe where a system operates, its customer relationship and the actions it can control; the forms can overlap. Platform ownership, operating scope, interaction mode and discovery channel are different dimensions. A lifecycle product can be independent, conversational and proactive at the same time. None of these positions determines technical architecture, maturity or profitability.

## The operational logic

| Form | Where it acts | Typical customer | Action control / workflow | Commercial model to verify |
|---|---|---|---|---|
| 1 — Platform-owned | Within an ad buying surface | Advertiser | Signals → bids/audiences/creative → delivery and feedback | Ad-spend-linked platform revenue; inventory relationships vary |
| 2 — Independent cross-surface | Across external accounts and channels | Brand or agency | Business objective → cross-channel plan → API actions and approvals → evaluation | SaaS, services or spend-linked fees |
| 3 — Conversational / service | Customer conversations and follow-up | CX, sales or lifecycle team | Intent/context → dialogue and tool actions → resolution, handoff or follow-up | Seats, usage, resolutions or enterprise contracts |
| 4 — Agent-mediated discovery | AI answers, interfaces or commerce pathways | Brand or commerce team | Visibility/content or authorized commerce actions → channel-specific evaluation | Product-specific subscriptions, services or other models |

These are practical entry points, rather than quadrants of a single two-axis taxonomy. A DSP can combine buying-surface control with independent orchestration. A customer agent can combine conversations with cross-channel lifecycle actions. The term “agent” is used broadly in this ecosystem; built-in optimization is not automatically an LLM agent.

## Describe systems on independent dimensions

| Dimension | Questions to record |
|---|---|
| Customer | Who pays, who operates it, and whose interests does it optimize? |
| Task | Acquisition, creative, activation, retention, service, sales or discovery? |
| Data access | Platform signals, first-party customer records, public content or combinations? |
| Action control | Inventory, bids, messages, incentives, transactions; on which surfaces? |
| Technical mechanism | Rules, predictive ML, causal models, optimization, fixed workflows, LLM agents or hybrid? |
| Autonomy | Suggest, draft, execute approved actions, or operate within delegated bounds? |
| Evidence and maturity | What is disclosed, when, and with which baseline and limitations? |

Use the specific product and workflow as the unit of analysis. Do not classify an entire conglomerate from one business line. Unknown implementation details should remain unknown. [Anthropic's engineering account](https://www.anthropic.com/engineering/building-effective-agents) distinguishes predefined workflows from agents whose models dynamically direct tools and process; autonomous optimization alone does not establish LLM agency.

## Form 1 — Platform-Owned Automation

A platform may choose bids, pacing, audiences or creative using its own buying interface. Distinguish **owned attention** from **aggregated third-party supply**, then record hybrids.

- Google Ads, Meta Ads, Amazon Ads and TikTok Ads include platform automation.
- Tencent's own WeChat and other app inventory, and Alibaba's own commerce inventory, belong to the owned-attention subtype. Their external-network businesses need separate records.
- AppLovin, Mintegral and Criteo illustrate network or inventory-aggregation positions; specify the product and supply relationship.
- Moloco provides ML-based buying and retail-media infrastructure. The Trade Desk is an independent DSP with buying control, not an owner of publisher attention; it can also be described under Form 2.

Control of inventory, auction signals and delivery may create advantages. It does not establish a universal profitability ranking. Different accounting treatments of gross spend, net revenue, publisher payments and acquisition costs make casual comparisons unreliable.

## Form 2 — Independent Cross-Surface Agents

External products can connect media accounts, first-party outcomes, creative workflows and operational approvals. Examples include Albert.ai, Ryze AI, Jellyfish, Muze AI and Uplane. Their public positioning does not prove a particular model architecture or general incremental lift.

[Lapis's YC profile](https://www.ycombinator.com/companies/lapis) currently describes campaign creation and operation; its earlier launch text describes AI-search analytics. Those are dated positioning signals, not evidence of native ChatGPT ad placement. Product scope can change.

The practical competition question is: **what decision, data or execution capability does this product add beyond the channel's built-in automation?** Candidates include profit-aware objectives, cross-channel frequency, refunds, fulfillment constraints and experimentation. Treat these as hypotheses to validate against a simple baseline.

## Form 3 — Conversational & Service Agents

Support, sales, renewal and reactivation combine conversations with decisions over time. They can be inbound, outbound, or both; "post-click" is too narrow.

[Sierra Horizon](https://sierra.ai/blog/horizon), announced 2026-07-16, describes proactive interactions over days or months. This is vendor evidence of product scope, not independent evidence of incremental retention or revenue. Decagon, Intercom Fin, Cresta, Ada, Cognigy and Parloa offer additional interaction-system references.

Service resolution and marketing value overlap, but are not identical. Evaluate factual accuracy, task completion, permissions and handoff alongside incremental qualified sales, retention or contribution, including complaints, opt-outs and refunds. Price per resolution is a commercial unit, not a causal outcome metric.

## Form 4 — Agent-Mediated Discovery

Keep four mechanisms separate:

| Mechanism | What is being evaluated | What it does not establish |
|---|---|---|
| GEO / AEO | Visibility and citation in generated answers | Incremental purchases or stable rankings |
| Advertising in AI interfaces | Paid placements, often shown to humans | The agent itself is the advertising audience |
| Agent-assisted purchasing | Authorized shopping or transaction actions | Buyer/seller agent negotiation |
| Agent-to-agent interaction | Structured exchanges between agents | Permission, economic value or causal effectiveness |

Profound, Daydream and Scrunch offer discovery-oriented references. [Sitefire's YC profile](https://www.ycombinator.com/companies/sitefire) describes visibility analysis and content/CMS actions; place it here, not under paid placement. Visibility measurement requires a defined query distribution, repeated sampling, model/version tracking and downstream business validation.

Changes to discovery and commerce may alter marketing work. The extent, timing and displacement of existing search remain hypotheses. Do not infer that the category has no commercial scale from missing disclosures in this list.

## Cross-cutting: first-party lifecycle decisioning

Lifecycle decisions concern activation, retention, renewal and reactivation, whether delivered through a conversation, a message, an offer or no contact. They are not confined to conversational service.

[BrazeAI Decisioning Studio](https://www.braze.com/product/brazeai-decisioning-studio) publicly describes first-party data, custom KPIs, channel, incentive and frequency decisions with constraints. This spans Intelligence, Decision, Activation and Measurement and can intersect Forms 2 and 3. Evaluate eligibility → action selection → permissioned delivery → mature outcomes → incremental learning, including a no-contact baseline and negative feedback.

[Hightouch AI Decisioning documentation](https://hightouch.com/docs/ai-decisioning/overview) likewise describes reinforcement-learning-based message, channel and timing decisions with connected delivery. Its agent terminology is evidence of positioning, not proof of LLM-directed planning or causal lift. Reviewed 2026-09-30.

## Economic analysis without a category ranking

Inventory margins, SaaS subscriptions, service charges, outcome prices and spend-linked fees can coexist. Compare revenue recognition, gross margin, operating margin, contribution after service costs, customer concentration and retention over a specified period. Ad spend managed is not revenue. ARR does not isolate the value of LLM reasoning. A customer case without a counterfactual does not prove lift.

Network effects and co-located signals are possible advantages, balanced against publisher dependence, platform access changes, auction competition, customer acquisition and compliance costs. The useful question is which control point creates durable value and whether evidence supports it.

## Chinese and US ecosystem comparison

Compare individual supply surfaces, account access, first-party data, integration costs and customer demand. Tencent, Alibaba and ByteDance operate major owned surfaces; Mintegral aggregates external supply. The proposition that independent orchestration has less room in China needs market and customer evidence; dominance of large platforms alone does not prove it.

## Where to test LLM value

Context-heavy strategy, creative iteration, tool-mediated customer work and information interpretation are plausible opportunities. Compare a model-driven agent with a fixed workflow and a human baseline on correctness, cost, latency, permissions and incremental business outcomes. For high-frequency bidding, measure the proposed system against existing optimizers instead of assuming either technology must win.

First-party access and execution permissions are product-specific. They already occur in lifecycle systems; convergence is not a future event that can be declared absent across the industry. Build an explicit system profile, validate its contribution and revisit it when product scope changes.
