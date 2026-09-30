# Evidence Standards and Review Ledger

Review date: 2026-09-30. Starting revision: `299c377`. This revision responds to the repository assessment and incrementality-demo discussion supplied by the maintainer, plus the repository consistency review. The private discussion transcript and its conversation URL are not published.

## How claims are handled

| Claim | Suitable evidence | Interpretation limit |
|---|---|---|
| Public capability | Direct official documentation, code, runnable artifact | Availability/positioning, not general efficacy |
| Implementation | Paper, source code, specific engineering disclosure | Described system/version, not every product |
| Scale | Dated, defined revenue/customer/spend disclosure | Adoption, not causal effect or technical cause |
| Business impact | Defined counterfactual, sample/population, window, uncertainty | Scope depends on design and transportability |
| Opportunity / moat | Explicit hypothesis and evaluation criteria | No category-level profitability proof |

Vendor materials and hosted management transcripts are labeled by reporting party. Research publication is not a guarantee of present-day product availability. A homepage may remain a navigation entry but must not support a specific deployment claim. Last-checked dates apply to the claims examined; this is not an independent audit of all commercial products or a complete factual audit of every linked resource.

## Repository changes

| Issue raised | Resolution | Evidence / location |
|---|---|---|
| Martech scope and clean historical eras | Clarified technical scope; removed rigid pre-2015/ML/agent eras | [Google KDD 2013 engineering paper](https://research.google/pubs/ad-click-prediction-a-view-from-the-trenches/) |
| Five logical layers versus vendor/team boundaries | Five responsibilities plus substrate; multi-responsibility products allowed | README and both cognitive-cycle essays |
| Measurement labeled Truth | Replaced with evidence, assumptions and uncertainty | [ASA statement](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf), [Meridian](https://developers.google.com/meridian/docs/basics/meridian-introduction) |
| Data called certain facts | Observation/inference provenance, method/version, confidence, effective time and consent | Both cognitive-cycle essays |
| Logged feedback mistaken for causal learning | Added selection, assignment, interference and counterfactual requirements | README and essays |
| Four categories mix classification axes | Retained four operational forms, explained overlaps and added independent descriptors | Both marketing-system essays and regenerated diagram |
| Tencent/Alibaba contradictory 1a/1b positions | Classified own inventory as owned attention; external-network businesses separately | README and both essays; grouping is an analytical interpretation of specific surfaces |
| Lifecycle systems treated only as delivery | Added first-party lifecycle decisioning and no-contact baseline | [Braze documentation](https://www.braze.com/product/brazeai-decisioning-studio) |
| Customer agents restricted to post-click | Included proactive, long-horizon interactions without asserting lift | [Sierra announcement](https://sierra.ai/blog/horizon), 2026-07-16 |
| Optimization conflated with LLM agency | Technical mechanism, workflow and autonomy separate | [Anthropic engineering](https://www.anthropic.com/engineering/building-effective-agents) |
| Most-profitable-category and regional-market conclusions | Removed ranking and unsupported regional generalization; specified economic comparison conditions | Both marketing-system essays |
| Traction numbers used as efficacy or technical proof | Removed unsupported precise traction/ROAS/autonomy percentages from catalog and essays | Claim-matched evidence policy in CONTRIBUTING |
| GEO, AI-interface ads, purchases and A2A conflated | Defined four distinct mechanisms; hypotheses separated from observations | README and both essays |
| Sitefire classified as paid placement | Moved to visibility/content optimization | [YC profile](https://www.ycombinator.com/companies/sitefire), checked 2026-09-30 |
| Lapis described as native ChatGPT placement | Current campaign-operation scope and earlier search-analytics positioning labeled; unsupported placement removed | [YC profile](https://www.ycombinator.com/companies/lapis), checked 2026-09-30 |
| RTB paper attributed to Alibaba | Corrected affiliations to SJTU/UCL/MediaGamma/Vlion | [Original paper](https://arxiv.org/html/1701.02490v2) |
| Multiple-treatment uplift attributed to CMU | Corrected Uber authorship, cost optimization and X/R extensions | [Original paper](https://arxiv.org/html/1908.05372v3) |
| Unsupported LightweightMMM current recommendation | Added Meridian; retained unsupported legacy status | [Official repository notice](https://github.com/google/lightweight_mmm), transition 2025-01-29 |
| Assistants as current entry point | Responses/Conversations entry and sunset date | [Official migration guide](https://developers.openai.com/api/docs/assistants/migration), sunset 2026-08-26 |
| Industry claims supported by company homepages | Removed Beike/NIO/Tencent assertions; specific studies and clearly labeled discovery portals replace them | README production-research section |
| Additional catalog maintenance | Marked Lifetimes archived, updated Census to Fivetran Activations, added Hightouch lifecycle decisioning and replaced generic Netflix/bid-shading attribution with specific sources | Official repositories/docs and original paper links in README |
| Missing applied guidance | Added three instructional playbooks with data, baseline, methods, constraints, evaluation and failure criteria | `playbooks/` |
| Missing method prerequisites and action contracts | Added method-suitability table and operational contracts | README, essays and playbooks |
| Agent success metric mixes tasks and growth | Separate system evaluation and incremental business evaluation | README and conversational playbook |
| Illustration and conceptual boundaries | Retained the original detailed stack illustration at the maintainer’s request; clarified feedback in its caption and essays. Updated the agent diagram with four operational forms, overlaps and corrected claims | README diagrams and both essays |

## Demo changes

| Issue raised | Implemented behavior |
|---|---|
| Misleading SaaS/agent capability | English educational artifact under `demos/incrementality-measurement/`; no fake connectors or execution |
| One predetermined budget-cut story | Four NOVA scenarios; supported/below/uncertain/invalid handling plus explicit missing-evidence and safety states |
| `1 − p` confidence and 90% stopping | Removed; intervals/requirements replace confidence percentages; fixed-window efficacy and separate safety monitoring |
| 4.8% effect used to meet 6% requirement | Crossing interval retained; default iROAS interval missing, so decision remains pending |
| Average return called marginal | Removed invented budget forecast and marginal claim; response-curve evidence required |
| Rendered/exported shares diverge | One rounded allocation function feeds display, CSV and JSON; totals reconcile exactly |
| No status-quo comparison or reserve lines | Status quo/candidate/delta with validation and unspent reserve; $72K split reconciles |
| Scenario actions treated as proven | Candidate shares remain assumptions; explicit risk-choice record needed under uncertainty; invalid evidence blocks |
| 90-day stale result/recommendation | Removed unsupported rolling snapshots; result, recommendation and export use one current scenario |
| Custom case opened NOVA experiment | Current case IDs drive details and planning |
| ITS/channel silently replaced | All planning methods preserve configuration; observational limitations displayed |
| Zero duration exported | Native form and runtime validation; zero/invalid duration rejected |
| Goal selector did nothing / universal iROAS gate | Typed objectives with objective-specific units/requirements; only NOVA's default order decision has an additional return gate |
| Completion implied quality pass | Quality and analysis status explicit; public/draft cases never claim local checks passed |
| Missing carryover/feasibility | Delay, blocks, washout, assignment, interference and data checks; no fake power calculation |
| Schema download lost current case | Separate blank template, JSON Schema and complete current-case package; import/recompute supported |
| Quantitative invented public-case curves / readiness | Removed false public time series, evidence grades, priority bars and readiness percentages |
| Provenance only at case level | Clickable metric evidence cards; source type/date/definition/limitations |
| Presentation crowded work interface | Optional narration and expandable six-stage workflow |
| No real calculation chain | Added independent-user randomized synthetic raw rows, difference-in-means, uncertainty, conditional decision and full export |
| Airbnb amount incorrectly sourced | Filed $478.608M replaces $482M; 58.03% arithmetic labeled separately; observation is not a clean natural experiment |

The source ledger explains each public case and synthetic assumption. The original prototype's CNY amounts are replaced with explicitly fictional USD scenarios, not a currency conversion.

## Verification and limitations

- Nine pure-engine checks cover statistical arithmetic, missing/crossing intervals, invalid/sparse outcomes, deterministic assignment, exact budget reconciliation, method preservation and CSV escaping.
- Six DOM integration checks cover case switching, all NOVA states, current-case details, planner validation, typed objectives, current-state exports/imports and raw-data regeneration.
- Local Markdown/HTML references and anchors are checked. An HTTP scan examined 129 distinct external URLs: 123 responded successfully; six encountered server blocking or local TLS limitations. No 404 was observed. eBay, SEC, Netflix and Lyft source content was separately retrieved through the research tool; reachability alone is not factual validation. Reviewed external claims use direct sources above.
- The revised agent diagram was visually inspected for text and relationship consistency. The original stack diagram was restored unchanged; its conceptual feedback is qualified in the README and explained in accessible Markdown.
- Native Chrome launch failed in the restricted environment. Computer Use automatically rejected Google Chrome with the reason that the application was not approved. The demo has DOM regression coverage, but actual-browser rendering, mobile layout and assistive-technology behavior are **not visually certified** by this session.

This improves the evidence and implementation baseline. It does not certify the entire MarTech field, audit commercial disclosures or make the demo a production causal system.
