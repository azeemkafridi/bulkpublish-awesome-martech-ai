(function () {
  "use strict";
  const source = (
    label,
    value,
    type,
    date,
    definition,
    limitation,
    url = "",
  ) => ({ label, value, type, date, definition, limitation, url });
  const sec =
    "https://www.sec.gov/Archives/edgar/data/1559720/000155972021000010/airbnb-10k.htm";
  const ebay = "https://faculty.haas.berkeley.edu/stadelis/BNT_ECMA_rev.pdf";
  const pg =
    "https://stockanalysis.com/stocks/pg/transcripts/79860-investor-day-2018/";
  const plan = (method, channel, weeks = 6) => ({
    method,
    channel,
    weeks,
    budget: 16000,
    delayHours: 24,
    blockHours: 72,
    washoutHours: 24,
    dataReady: false,
    randomizable: false,
    interference: false,
  });
  const base = (id, name, kind, method, channel) => ({
    id,
    name,
    kind,
    method,
    channel,
    goal: "orders",
    threshold: 0.01,
    returnGate: null,
    weeks: 6,
    budget: 800000,
    total: 800000,
    allocationMode: "baseline",
    guardrail:
      "Pause on material customer harm, consent failures or invalid delivery.",
    plan: plan(method, channel),
    allocations: [
      { channel, share: 0.9 },
      { channel: "Validation budget", share: 0.08 },
      { channel: "Unspent reserve", share: 0.02 },
    ],
    evidence: [],
  });
  const cases = [
    {
      ...base(
        "airbnb",
        "Airbnb: expenditure and evidence",
        "public",
        "Operational Review",
        "Brand and performance marketing",
      ),
      question:
        "What can a spending reduction during a pandemic tell us about incremental marketing value?",
      description:
        "Filed expenditure and reported traffic motivated a strategic question. Simultaneous demand, travel restrictions, product and competition changes prevent a channel-level causal estimate from these observations alone.",
      plan: plan("Interrupted Time Series", "Brand and performance marketing"),
      evidence: [
        source(
          "2019 marketing expense",
          "$1,140.366M",
          "Filed financial disclosure",
          "2021-02-26",
          "2019 brand and performance marketing, not total sales and marketing.",
          "An expenditure amount does not estimate causal return.",
          sec,
        ),
        source(
          "2020 marketing expense",
          "$478.608M",
          "Filed financial disclosure",
          "2021-02-26",
          "Same category in fiscal 2020; the supplied prototype used $482M.",
          "No causal inference from the year-to-year change.",
          sec,
        ),
        source(
          "Reduction",
          "58.03%",
          "Demo calculation from filed values",
          "2026-09-30",
          "(1 − 478.608 / 1,140.366) × 100; rounded.",
          "Not an estimate of waste, lift or incremental profit.",
          sec,
        ),
        source(
          "Traffic recovery",
          "95%",
          "Management statement; hosted transcript",
          "2021-02-25",
          "Management described recovery versus prior-year traffic before resuming marketing.",
          "Traffic is not bookings; pandemic and demand changes are confounded.",
          "https://www.fool.com/earnings/call-transcripts/2021/02/25/airbnb-inc-abnb-q4-2020-earnings-call-transcript/",
        ),
      ],
    },
    {
      ...base(
        "ebay",
        "eBay: paid-search field experiments",
        "public",
        "Geo Holdout",
        "Paid search",
      ),
      question:
        "Do attributed search conversions identify the effect of advertising?",
      description:
        "Historical field experiments found substantial organic substitution for brand search and heterogeneous non-brand effects. Their result motivates testing a local policy; it does not prescribe a present-day allocation.",
      evidence: [
        source(
          "Short-run paid-search ROI",
          "−63%",
          "Published field-experiment estimate",
          "2014-08-12 manuscript / 2015 publication",
          "Table 1, columns 4–5: implied revenue return per incremental ad dollar minus one; uses experimental variation and public revenue/spend calibration, not profit margin.",
          "Context-specific; no direct transfer to another advertiser.",
          ebay,
        ),
        source(
          "95% ROI interval",
          "−124% to −3%",
          "Published uncertainty",
          "2014-08-12 manuscript / 2015 publication",
          "Table 1: interval for the implied short-run ROI, using non-brand geo-experiment variation and the paper’s calibration.",
          "Not an interval for brand-search lift or LLM performance.",
          ebay,
        ),
        source(
          "Heterogeneity",
          "New and infrequent users responded",
          "Published field-experiment analysis",
          "2015",
          "Subgroup responses differed from the aggregate effect.",
          "Subgroup effects are not a marginal spend response curve.",
          ebay,
        ),
      ],
    },
    {
      ...base(
        "pg",
        "P&G: media quality and reach",
        "public",
        "Operational Review",
        "Media supply quality",
      ),
      question:
        "Does removing low-quality inventory establish incremental sales?",
      description:
        "Management described less nonproductive spending and better reach. This is an operational disclosure without a randomized sales counterfactual. No sales-effect chart or iROAS is inferred.",
      evidence: [
        source(
          "Nonproductive digital spend",
          "Up to $200M reduced",
          "Management speech; hosted transcript",
          "2018-11-08",
          "Investor Day statement about nonproductive digital spending and reinvestment.",
          "Not independently audited; not an incremental sales estimate.",
          pg,
        ),
        source(
          "Media waste and reach",
          "Waste −20%; reach +10%",
          "Management speech; hosted transcript",
          "2018-11-08",
          "Management described media waste and reach together.",
          "Different metrics; no numerical index or sales-effect series can be constructed.",
          pg,
        ),
      ],
    },
    {
      ...base(
        "nova",
        "NOVA: brand-search scenario lab",
        "scenario",
        "Switchback",
        "Brand search",
      ),
      question:
        "Does evidence support a 6% relative order lift and an iROAS of at least 1.50?",
      description:
        "NOVA is fictional. Four prewritten evidence scenarios teach conditional decisions; no switchback estimator or power calculation runs here. The uncertain scenario preserves the original 4.8% order lift and missing iROAS interval.",
      threshold: 0.06,
      returnGate: 1.5,
      weeks: 4,
      scenario: "uncertain",
      plan: plan("Switchback", "Brand search", 4),
      allocations: [
        { channel: "Brand search", share: 0.29 },
        { channel: "Prospecting", share: 0.36 },
        { channel: "Video", share: 0.26 },
        { channel: "Other media", share: 0.09 },
        { channel: "Validation budget", share: 0 },
        { channel: "Unspent reserve", share: 0 },
      ],
      evidence: [
        source(
          "Platform-attributed ROAS",
          "6.40×",
          "Scenario assumption",
          "2026-09-30",
          "Prewritten fictional attribution value; no platform connection.",
          "Cannot establish incrementality, waste or cannibalization.",
        ),
        source(
          "Experiment spend contrast",
          "$108,000",
          "Scenario assumption",
          "2026-09-30",
          "Positive treatment-minus-control spend; used to derive revenue scenarios.",
          "Not observed spend; no causal estimator for this switchback scenario.",
        ),
        source(
          "Contribution margin",
          "40%",
          "Scenario assumption",
          "2026-09-30",
          "Incremental net revenue less incremental product/fulfillment cost; marketing cost deducted separately.",
          "Assumed constant margin; not observed profitability.",
        ),
      ],
    },
    {
      ...base(
        "users",
        "Randomized users: compute from raw data",
        "computed",
        "User Randomized Holdout",
        "Lifecycle message",
      ),
      question:
        "Does an eligible-user message improve mature outcomes versus no contact?",
      description:
        "An elementary randomized-user teaching experiment. The generator produces raw assigned users; the estimator reads only observed rows. Independent units, full outcomes and fixed observation are assumed. All data and unit economics are synthetic.",
      budget: 10000,
      total: 10000,
      allocations: [
        { channel: "Lifecycle policy", share: 0.9 },
        { channel: "Validation budget", share: 0.08 },
        { channel: "Unspent reserve", share: 0.02 },
      ],
      generator: { seed: 42, n: 5000, baseline: 0.1, effect: 0.025 },
      evidence: [
        source(
          "Raw assigned users",
          "10,000 synthetic units",
          "Synthetic generator",
          "2026-09-30",
          "Complete 50/50 random assignment; independent Bernoulli conversion outcomes.",
          "No carryover, missing outcomes or customer interference is simulated.",
        ),
        source(
          "Economics",
          "$80 net revenue; $48 variable cost; $0.30 contact cost",
          "Scenario assumptions",
          "2026-09-30",
          "Per converted user revenue/cost, and per treatment-assigned user contact cost.",
          "Constant toy economics; not a revenue or LTV model.",
        ),
      ],
    },
  ];
  cases.find((c) => c.id === "users").rawRows = MeasurementEngine.generateUsers(
    42,
    5000,
    0.1,
    0.025,
  );
  const scenarios = {
    supported: {
      orders: { estimate: 0.1, interval: [0.08, 0.12] },
      iroas: { estimate: 2.2, interval: [1.8, 2.6] },
    },
    below: {
      orders: { estimate: 0.02, interval: [0.005, 0.035] },
      iroas: { estimate: 0.9, interval: [0.7, 1.1] },
    },
    uncertain: {
      orders: { estimate: 0.048, interval: [0.012, 0.083] },
      iroas: { estimate: 1.42, interval: null },
    },
    invalid: {
      orders: { estimate: 0.1, interval: [0.08, 0.12] },
      iroas: { estimate: 2.2, interval: [1.8, 2.6] },
    },
  };
  window.MeasurementData = { cases, scenarios };
})();
