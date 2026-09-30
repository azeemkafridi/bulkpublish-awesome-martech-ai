# Evidence and Assumption Ledger

Reviewed 2026-09-30. Source availability, relevance and support for a specific claim are separate checks. The application also attaches provenance to individual metrics. Imported package metadata is not independently authenticated.

## Airbnb

| Claim | Source and date | Definition and limit |
|---|---|---|
| 2019 brand/performance marketing: $1,140.366M; 2020: $478.608M | [2020 Form 10-K](https://www.sec.gov/Archives/edgar/data/1559720/000155972021000010/airbnb-10k.htm), filed 2021-02-26; Sales and Marketing table | Same expense category. Not total sales and marketing, advertising expense, or an effect estimate. |
| Decrease: 58.03% | Demo arithmetic from those filed values | `(1 − 478.608 / 1,140.366) × 100`, rounded; not waste or incremental effect. |
| Traffic recovered to 95% before marketing resumed | [Q4 2020 earnings-call transcript](https://www.fool.com/earnings/call-transcripts/2021/02/25/airbnb-inc-abnb-q4-2020-earnings-call-transcript/), 2021-02-25 | Management statement reproduced by a third-party host, not audited traffic data or a bookings counterfactual. |

The supplied HTML used $482M and a prospectus link that could not establish full-year 2020 expenditure. The revision uses the filed $478.608M. Pandemic demand, travel restrictions, competition, product changes and cost actions prevent a causal channel attribution from this before/after narrative. It is **confounded public observation**, not a locally fitted interrupted time series or a clean natural experiment. Follow-up geo/MMM work is a proposal, not evidence already obtained. Later profitability is omitted because it cannot identify the marketing effect.

## eBay

[Blake, Nosko and Tadelis manuscript](https://faculty.haas.berkeley.edu/stadelis/BNT_ECMA_rev.pdf), dated 2014-08-12, subsequently published in *Econometrica* (2015). Inspect the non-brand geo experiment and Table 1, columns 4–5.

- Historical short-run experimental ROI: −63%, with the reported 95% interval −124% to −3%.
- Brand-search tests found no measurable short-run benefit in that context; non-brand response differed by customer familiarity/frequency.
- The paper defines ROI as incremental revenue / incremental spend minus one, calibrated using public revenue and spending values. It deducts ad spend but does not model product margin; it is not a profit-based ROI or the demo’s iROAS. No present-day budget recommendation or marginal response follows directly.

The application quotes the paper; it does not load or reproduce the original experiment's raw data. The original hand-written `[100, 99]` series has been removed. Lack of a measurable benefit is not exact proof of a zero effect.

## P&G

[Investor Day speech transcript](https://stockanalysis.com/stocks/pg/transcripts/79860-investor-day-2018/), 2018-11-08, Marc Pritchard's discussion of the media supply chain. This is a third-party-hosted reproduction of management speech; the original recording and underlying metric data have not been independently audited here.

The speech describes up to $200M less nonproductive digital spending, reinvestment, media waste reduced by 20% and reach increased by 10%. These are different management-reported metrics. They do not specify a randomized sales counterfactual, a channel iROAS or incrementally profitable reallocation. The synthetic `[100, 80, 90]` index and arbitrary evidence grade have been removed.

## NOVA

NOVA is fictional. No public source, advertiser account or raw switchback data supplies its results. Four presets are **scenario assumptions**:

| Scenario | Relative order lift and assumed 95% interval | iROAS and assumed interval | Teaching decision for the default two requirements |
|---|---|---|---|
| Meets requirements | 10%; [8%, 12%] | 2.20; [1.80, 2.60] | Review a bounded candidate; no marginal response proven. |
| Below requirements | 2%; [0.5%, 3.5%] | 0.90; [0.70, 1.10] | Review contraction/economics/redesign. |
| Uncertain | 4.8%; [1.2%, 8.3%] | 1.42; interval missing | Pending: required return uncertainty is absent, and lift crosses 6%. |
| Invalid | Same numeric preset as supported, but invalid assignment/contamination diagnostics | Not releasable | Block causal claims and evidence-based allocation. |

Default requirements are 6% relative lift and iROAS 1.50. Alternative teaching objectives are incremental net revenue ≥ $162,000 and contribution ≥ $0. Scenario revenue equals iROAS times the $108,000 positive spend contrast; contribution equals 40% of that revenue minus $108,000. A constant margin is assumed; contribution break-even is iROAS 2.50. Thus the supported order/return scenario does not demonstrate profitable contribution. Intervals are monotone transformations of assumed intervals, not new analyses.

Planning funds use fictional USD values. The supplied CNY story has not been converted using an exchange rate. At $800,000, the optional candidate moves $72,000 from brand search: $48,000 prospecting, $16,000 validation and $8,000 reserve. These allocations explain bookkeeping and risk review, not an optimum. No extrapolated income forecast is shown. Scenario switching is not interim analysis of one running experiment.

## Computed synthetic-user case

The implementation generates and exports assigned-user rows and estimates only from those observations. Assumptions: balanced randomized assignment, independent eligible users, fixed mature observation, no interference, no missingness, constant synthetic economics. See [README](README.md) for formulas and approximation checks.

The generator-only effect is a probability difference, not the reported estimate. It is excluded from the estimator inputs. Per-unit revenue/cost fields are synthetic assumptions; difference-in-means and intervals are computations from those fields. Case import recomputes analysis and decisions. Exported analysis is an audit snapshot, not an input to the estimator.

## Methodological references

- [ASA statement on p-values](https://www.amstat.org/asa/files/pdfs/P-ValueStatement.pdf), 2016: p-values do not measure hypothesis truth or effect size.
- [Design and Analysis of Switchback Experiments](https://arxiv.org/abs/2009.00148): carryover and design assumptions matter; this demo does not implement its estimator.
- [Meridian introduction](https://developers.google.com/meridian/docs/basics/meridian-introduction): aggregate response curves and uncertainty depend on model/causal assumptions; no MMM runs here.

Source dates describe publications/disclosures. Review dates describe this repository's examination, not ongoing verification or access to company data.
