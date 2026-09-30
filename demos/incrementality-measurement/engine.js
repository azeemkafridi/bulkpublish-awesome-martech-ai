/* Pure analysis and decision functions. No generator settings enter estimation. */
(function (root) {
  "use strict";
  const METHODS = [
    "User Randomized Holdout",
    "Geo Holdout",
    "Switchback",
    "Interrupted Time Series",
    "Operational Review",
  ];
  const GOALS = ["orders", "netRevenue", "contribution"];
  const finite = (x) => typeof x === "number" && Number.isFinite(x);
  const scenarioChannels = [
    "Brand search",
    "Prospecting",
    "Video",
    "Other media",
    "Validation budget",
    "Unspent reserve",
  ];
  function knownFields(value, keys) {
    if (
      !value ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.keys(value).some((k) => !keys.includes(k))
    )
      throw new Error("Unrecognized fields in the case package.");
  }
  function generateUsers(seed, n, baseline, effect) {
    if (
      !Number.isInteger(seed) ||
      seed < 1 ||
      seed > 4294967295 ||
      !Number.isInteger(n) ||
      n < 100 ||
      n > 50000 ||
      !finite(baseline) ||
      !finite(effect) ||
      baseline <= 0 ||
      baseline >= 1 ||
      baseline + effect <= 0 ||
      baseline + effect >= 1
    )
      throw new Error(
        "Use a valid seed, 100–50,000 users per arm and probabilities strictly between 0 and 1.",
      );
    let x = seed >>> 0;
    const random = () => {
      x = (Math.imul(1664525, x) + 1013904223) >>> 0;
      return x / 4294967296;
    };
    const rows = [];
    for (let i = 0; i < n * 2; i++) {
      // Balanced complete assignment, randomly shuffled before outcomes are generated.
      rows.push({
        unit_id: "user-" + (i + 1),
        assignment: i < n ? "treatment" : "control",
      });
    }
    for (let i = rows.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [rows[i].assignment, rows[j].assignment] = [
        rows[j].assignment,
        rows[i].assignment,
      ];
    }
    return rows.map((row) => {
      const converted =
        random() < baseline + (row.assignment === "treatment" ? effect : 0)
          ? 1
          : 0;
      return {
        ...row,
        converted,
        net_revenue: converted * 80,
        variable_cost: converted * 48,
        marketing_cost: row.assignment === "treatment" ? 0.3 : 0,
      };
    });
  }
  function validateRows(rows) {
    if (!Array.isArray(rows) || rows.length < 4 || rows.length > 100000)
      throw new Error("Raw data must contain 4–100,000 user records.");
    const ids = new Set();
    for (const row of rows) {
      knownFields(row, [
        "unit_id",
        "assignment",
        "converted",
        "net_revenue",
        "variable_cost",
        "marketing_cost",
      ]);
      if (
        !row ||
        typeof row.unit_id !== "string" ||
        !row.unit_id ||
        row.unit_id.length > 80 ||
        ids.has(row.unit_id)
      )
        throw new Error("Each assignment unit needs a unique ID.");
      ids.add(row.unit_id);
      if (
        !["treatment", "control"].includes(row.assignment) ||
        ![0, 1].includes(row.converted)
      )
        throw new Error("Invalid assignment or binary outcome.");
      for (const key of ["net_revenue", "variable_cost", "marketing_cost"])
        if (!finite(row[key]) || row[key] < 0)
          throw new Error("Money fields must be finite and nonnegative.");
    }
  }
  function estimateUsers(rows) {
    validateRows(rows);
    const groups = ["treatment", "control"].map((arm) =>
      rows.filter((row) => row.assignment === arm),
    );
    if (groups.some((g) => g.length < 2))
      throw new Error("Both arms need at least two assignment units.");
    const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
    const variance = (a) => {
      const m = mean(a);
      return a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1);
    };
    const summary = {};
    const values = {
      orders: (r) => r.converted,
      netRevenue: (r) => r.net_revenue,
      contribution: (r) => r.net_revenue - r.variable_cost - r.marketing_cost,
    };
    for (const [key, fn] of Object.entries(values)) {
      const [t, c] = groups.map((g) => g.map(fn));
      const point = mean(t) - mean(c),
        se = Math.sqrt(variance(t) / t.length + variance(c) / c.length);
      summary[key] = {
        estimate: point,
        interval: [point - 1.96 * se, point + 1.96 * se],
        standardError: se,
        treatmentMean: mean(t),
        controlMean: mean(c),
        provenance: "computed-synthetic",
      };
    }
    const counts = groups.map((g) => ({
      n: g.length,
      conversions: g.reduce((s, r) => s + r.converted, 0),
    }));
    const issues = [];
    if (
      counts.some(
        (g) => g.n < 100 || g.conversions < 10 || g.n - g.conversions < 10,
      )
    )
      issues.push(
        "Demo release check failed: require at least 100 units, 10 conversions and 10 nonconversions in each arm. These checks do not guarantee interval coverage.",
      );
    return {
      metrics: summary,
      counts,
      quality: { valid: !issues.length, issues },
      method:
        "Unadjusted intention-to-treat difference in means; 95% normal approximation interval; independent user units.",
    };
  }
  function classify(metric, threshold, valid = true, guardrail = true) {
    if (!valid) return "invalid";
    if (!guardrail) return "guardrail";
    if (
      !metric ||
      !finite(metric.estimate) ||
      !Array.isArray(metric.interval) ||
      metric.interval.length !== 2 ||
      !metric.interval.every(finite) ||
      metric.interval[0] > metric.estimate ||
      metric.interval[1] < metric.estimate ||
      !finite(threshold)
    )
      return "pending";
    if (metric.interval[0] >= threshold) return "supported";
    if (metric.interval[1] < threshold) return "below";
    return "uncertain";
  }
  function decide(c, result) {
    if (!result)
      return {
        status: "pending",
        reason:
          "No analyzed result is available. Complete design review and data validation first.",
      };
    const primary = classify(
      result.metrics[c.goal],
      c.threshold,
      result.quality.valid,
      result.guardrail !== false,
    );
    let status = primary;
    if (
      c.returnGate !== null &&
      c.returnGate !== undefined &&
      !["invalid", "guardrail"].includes(status)
    ) {
      const gate = classify(
        result.metrics.iroas,
        c.returnGate,
        result.quality.valid,
        result.guardrail !== false,
      );
      if (primary === "pending" || gate === "pending") status = "pending";
      else if (primary === "below" || gate === "below") status = "below";
      else if (primary !== "supported" || gate !== "supported")
        status = "uncertain";
    }
    const reasons = {
      supported:
        "The intervals meet the declared requirements in this population and window. A bounded candidate rollout may be reviewed; additional-spend response remains unknown.",
      below:
        "At least one interval lies below its requirement. Review contraction, economics or redesign; this is not a universal instruction to stop the channel.",
      uncertain:
        "At least one interval crosses its business threshold. Retain the baseline or document a reversible business choice with explicit risk.",
      pending:
        "Required uncertainty is missing. A point estimate alone cannot establish that the business requirement is met or missed.",
      invalid:
        "Data/design diagnostics failed. No causal conclusion or evidence-backed allocation is released.",
      guardrail:
        "A safety guardrail failed. Pause or roll back for safety; this is separate from efficacy evidence.",
    };
    return { status, reason: reasons[status] };
  }
  function feasibility(p) {
    const issues = [];
    if (!METHODS.includes(p.method))
      issues.push("Choose a supported planning method.");
    if (!Number.isInteger(p.weeks) || p.weeks < 1 || p.weeks > 52)
      issues.push("Duration must be an integer from 1 to 52 weeks.");
    if (!finite(p.budget) || p.budget <= 0 || p.budget > 1e9)
      issues.push(
        "Planning budget must be positive and at most 1 billion USD.",
      );
    for (const key of ["delayHours", "blockHours", "washoutHours"])
      if (!finite(p[key]) || p[key] < 0 || p[key] > 8760)
        issues.push(
          "Timing fields must be finite, nonnegative hours within one year.",
        );
    if (p.delayHours > p.weeks * 168)
      issues.push(
        "Outcome delay exceeds the observation window; add a maturity window.",
      );
    if (!p.dataReady)
      issues.push(
        "Assignment, exposure and mature business outcomes have not been validated.",
      );
    if (
      ["User Randomized Holdout", "Geo Holdout", "Switchback"].includes(
        p.method,
      ) &&
      !p.randomizable
    )
      issues.push(
        "A controllable randomized assignment has not been confirmed.",
      );
    if (p.interference)
      issues.push("Interference needs a unit/design review before launch.");
    if (p.method === "Switchback") {
      if (p.blockHours <= 0)
        issues.push("Switchback block length must be positive.");
      if (p.washoutHours < p.delayHours || p.blockHours <= p.washoutHours)
        issues.push(
          "Review carryover: washout must cover the assumed delay and leave observation time in the block.",
        );
    }
    if (["Interrupted Time Series", "Operational Review"].includes(p.method))
      issues.push(
        "Observational planning does not supply randomized identification; document confounding and counterfactual assumptions.",
      );
    return {
      readyForReview: issues.length === 0,
      issues,
      power: "Not calculated. No sample-size or power claim is made.",
      stoppingRule:
        "Fixed observation window plus outcome maturity; monitor safety and data quality during operation.",
    };
  }
  function allocation(c, total, mode, eligible) {
    if (
      !Number.isInteger(total) ||
      total < c.budget * 0.6 ||
      total > c.budget * 1.5
    )
      throw new Error(
        "Budget must be within the declared 60–150% scenario range.",
      );
    const baseline = c.allocations;
    const canChange = c.kind === "scenario" && eligible && mode === "candidate";
    if (canChange && baseline.length !== 6)
      throw new Error(
        "The fictional candidate requires its six declared budget lines.",
      );
    const shares = canChange
      ? [0.2, 0.42, 0.26, 0.09, 0.02, 0.01]
      : baseline.map((a) => a.share);
    const apportion = (proportions) => {
      const sum = proportions.reduce((s, share) => s + share, 0);
      if (
        !finite(sum) ||
        Math.abs(sum - 1) > 1e-9 ||
        proportions.some((share) => !finite(share) || share < 0 || share > 1)
      )
        throw new Error("Invalid allocation shares.");
      // Normalize accepted floating-point tolerance before integer apportionment.
      const normalized = proportions.map((share) => share / sum);
      const amounts = normalized.map((share) => Math.floor(total * share));
      const remainder =
        total - amounts.reduce((sum, amount) => sum + amount, 0);
      const order = normalized
        .map((share, i) => ({ i, fraction: total * share - amounts[i] }))
        .sort((a, b) => b.fraction - a.fraction);
      for (let i = 0; i < remainder; i++) amounts[order[i % order.length].i]++;
      return amounts;
    };
    const amounts = apportion(shares),
      before = apportion(baseline.map((a) => a.share));
    return baseline.map((a, i) => ({
      channel: a.channel,
      baseline: before[i],
      candidate: amounts[i],
      delta: amounts[i] - before[i],
      rationale: canChange
        ? "Predeclared illustrative scenario; no measured marginal response."
        : "Baseline preserved; no evidence-backed reallocation.",
    }));
  }
  function csv(rows) {
    return rows
      .map((row) =>
        row
          .map((value) => {
            let text = String(value ?? "");
            if (typeof value === "string" && /^[\t\r\n]|^\s*[=+\-@]/.test(text))
              text = "'" + text;
            return '"' + text.replace(/"/g, '""') + '"';
          })
          .join(","),
      )
      .join("\r\n");
  }
  function validateCase(c) {
    if (!c || typeof c !== "object") throw new Error("Missing case object.");
    knownFields(c, [
      "id",
      "name",
      "question",
      "channel",
      "guardrail",
      "description",
      "kind",
      "method",
      "goal",
      "threshold",
      "returnGate",
      "budget",
      "total",
      "weeks",
      "allocationMode",
      "allocations",
      "evidence",
      "plan",
      "rawRows",
      "generator",
      "scenario",
      "riskChoice",
      "imported",
    ]);
    if (
      c.description !== undefined &&
      (typeof c.description !== "string" || c.description.length > 10000)
    )
      throw new Error("Invalid case description.");
    if (c.imported !== undefined && typeof c.imported !== "boolean")
      throw new Error("Invalid import marker.");
    for (const key of ["id", "name", "question", "channel", "guardrail"])
      if (typeof c[key] !== "string" || !c[key].trim() || c[key].length > 300)
        throw new Error("Required case text is missing or too long.");
    if (
      !["public", "scenario", "custom", "computed"].includes(c.kind) ||
      !METHODS.includes(c.method) ||
      !GOALS.includes(c.goal) ||
      !finite(c.threshold) ||
      !Number.isInteger(c.budget) ||
      c.budget < 1 ||
      c.budget > 1e9
    )
      throw new Error(
        "Invalid case kind, method, objective, threshold or budget.",
      );
    if (!Number.isInteger(c.weeks) || c.weeks < 1 || c.weeks > 52)
      throw new Error("Invalid duration.");
    if (c.kind === "computed" && c.method !== "User Randomized Holdout")
      throw new Error(
        "This estimator only supports independent randomized users.",
      );
    if (
      c.returnGate !== null &&
      c.returnGate !== undefined &&
      (!finite(c.returnGate) || c.returnGate < 0)
    )
      throw new Error("Invalid return requirement.");
    if (
      !Array.isArray(c.allocations) ||
      !c.allocations.length ||
      c.allocations.length > 12 ||
      c.allocations.some(
        (a) =>
          !a ||
          typeof a.channel !== "string" ||
          !a.channel.trim() ||
          a.channel.length > 100 ||
          !finite(a.share) ||
          a.share < 0 ||
          a.share > 1,
      ) ||
      Math.abs(c.allocations.reduce((s, a) => s + a.share, 0) - 1) > 1e-9
    )
      throw new Error("Budget shares must be nonnegative and sum to one.");
    c.allocations.forEach((a) => knownFields(a, ["channel", "share"]));
    if (
      !Array.isArray(c.evidence) ||
      c.evidence.length > 30 ||
      c.evidence.some(
        (e) =>
          !e ||
          ["label", "value", "type", "date", "definition", "limitation"].some(
            (k) => typeof e[k] !== "string" || e[k].length > 2000,
          ) ||
          (e.url !== undefined &&
            (typeof e.url !== "string" ||
              e.url.length > 2000 ||
              (e.url && !/^https:\/\//.test(e.url)))),
      )
    )
      throw new Error("Evidence metadata is invalid.");
    c.evidence.forEach((e) =>
      knownFields(e, [
        "label",
        "value",
        "type",
        "date",
        "definition",
        "limitation",
        "url",
      ]),
    );
    if (
      !c.plan ||
      !METHODS.includes(c.plan.method) ||
      !Number.isInteger(c.plan.weeks) ||
      c.plan.weeks < 1 ||
      c.plan.weeks > 52
    )
      throw new Error(
        "Plan must preserve the selected method and valid duration.",
      );
    knownFields(c.plan, [
      "method",
      "channel",
      "weeks",
      "budget",
      "delayHours",
      "blockHours",
      "washoutHours",
      "dataReady",
      "randomizable",
      "interference",
    ]);
    for (const key of ["budget", "delayHours", "blockHours", "washoutHours"])
      if (
        !finite(c.plan[key]) ||
        c.plan[key] < 0 ||
        (key !== "budget" && c.plan[key] > 8760)
      )
        throw new Error("Invalid plan numeric field.");
    if (
      c.plan.budget <= 0 ||
      c.plan.budget > 1e9 ||
      ["dataReady", "randomizable", "interference"].some(
        (k) => typeof c.plan[k] !== "boolean",
      ) ||
      typeof c.plan.channel !== "string" ||
      !c.plan.channel.trim() ||
      c.plan.channel.length > 300
    )
      throw new Error("Invalid plan configuration.");
    if (
      !Number.isInteger(c.total) ||
      c.total < c.budget * 0.6 ||
      c.total > c.budget * 1.5 ||
      !["baseline", "candidate"].includes(c.allocationMode)
    )
      throw new Error("Invalid budget scenario state.");
    if (c.riskChoice !== undefined && typeof c.riskChoice !== "boolean")
      throw new Error("Invalid risk-choice state.");
    if (c.generator !== undefined) {
      const g = c.generator;
      knownFields(g, ["seed", "n", "baseline", "effect"]);
      if (
        !Number.isInteger(g.seed) ||
        g.seed < 1 ||
        g.seed > 4294967295 ||
        !Number.isInteger(g.n) ||
        g.n < 100 ||
        g.n > 50000 ||
        !finite(g.baseline) ||
        !finite(g.effect) ||
        g.baseline <= 0 ||
        g.baseline >= 1 ||
        g.baseline + g.effect <= 0 ||
        g.baseline + g.effect >= 1
      )
        throw new Error("Invalid generator metadata.");
    }
    if (c.rawRows !== undefined) validateRows(c.rawRows);
    if (
      c.scenario !== undefined &&
      !["supported", "below", "uncertain", "invalid"].includes(c.scenario)
    )
      throw new Error("Invalid scenario metadata.");
    if (c.kind === "computed") estimateUsers(c.rawRows);
    if (
      c.kind === "scenario" &&
      (!["supported", "below", "uncertain", "invalid"].includes(c.scenario) ||
        c.method !== "Switchback" ||
        c.allocations.length !== 6 ||
        c.allocations.some((a, i) => a.channel !== scenarioChannels[i]))
    )
      throw new Error(
        "Invalid scenario or missing declared scenario budget lines.",
      );
    return true;
  }
  const api = {
    METHODS,
    GOALS,
    generateUsers,
    estimateUsers,
    classify,
    decide,
    feasibility,
    allocation,
    csv,
    validateCase,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.MeasurementEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
