(function () {
  "use strict";
  const E = MeasurementEngine,
    D = MeasurementData;
  const state = {
    cases: D.cases,
    caseId: "airbnb",
    stage: 0,
    page: "overview",
  };
  const $ = (s) => document.querySelector(s);
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (ch) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[ch],
    );
  const money = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(n);
  const ccase = () => state.cases.find((c) => c.id === state.caseId);
  const titles = {
    supported: "Requirements supported in this snapshot",
    below: "Below at least one business requirement",
    uncertain: "Inconclusive relative to requirements",
    pending: "Required evidence is pending",
    invalid: "Causal conclusion blocked",
    guardrail: "Safety pause required",
  };
  const labels = {
    orders: "Conversion-rate difference",
    netRevenue: "Incremental net revenue",
    contribution: "Incremental contribution",
    iroas: "Incremental ROAS",
  };
  function metricName(c, key) {
    return key === "orders" && c.kind === "scenario"
      ? "Relative order lift"
      : labels[key];
  }
  function format(c, key, value) {
    if (value === null || value === undefined) return "Not provided";
    return key === "orders"
      ? (value * 100).toFixed(2) + (c.kind === "scenario" ? "%" : " pp")
      : key === "iroas"
        ? value.toFixed(2) + "×"
        : c.kind === "scenario"
          ? money(value)
          : "$" + value.toFixed(3) + " / user";
  }
  function result(c) {
    if (c.kind === "computed")
      return { ...E.estimateUsers(c.rawRows), guardrail: true };
    if (c.kind !== "scenario") return null;
    const s = D.scenarios[c.scenario],
      transform = (m, fn) => ({
        estimate: fn(m.estimate),
        interval: m.interval ? m.interval.map(fn) : null,
        provenance: "derived-scenario",
      });
    return {
      metrics: {
        orders: { ...s.orders, provenance: "scenario" },
        iroas: { ...s.iroas, provenance: "scenario" },
        netRevenue: transform(s.iroas, (x) => x * 108000),
        contribution: transform(s.iroas, (x) => x * 108000 * 0.4 - 108000),
      },
      quality: {
        valid: c.scenario !== "invalid",
        issues:
          c.scenario === "invalid"
            ? [
                "Assignment log is incomplete and cross-period contamination is unresolved in this fictional scenario.",
              ]
            : [],
      },
      guardrail: true,
      method: "Prewritten scenario, not a switchback analysis.",
    };
  }
  function snapshot() {
    const c = ccase(),
      r = result(c),
      decision = E.decide(c, r);
    const allowed =
      decision.status === "supported" ||
      (!!c.riskChoice &&
        ["uncertain", "below", "pending"].includes(decision.status) &&
        c.kind === "scenario");
    return {
      caseId: c.id,
      result: r,
      decision,
      allocation: E.allocation(c, c.total, c.allocationMode, allowed),
      riskChoice: !!c.riskChoice,
      method: c.method,
      plan: structuredClone(c.plan),
    };
  }
  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 3500);
  }
  function download(name, data, mime = "application/json") {
    const blob = new Blob([data], { type: mime }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function go(page) {
    state.page = page;
    document
      .querySelectorAll(".page")
      .forEach((el) => el.classList.toggle("active", el.id === page));
    document.querySelectorAll(".nav button").forEach((el) => {
      if (el.dataset.page === page) el.setAttribute("aria-current", "page");
      else el.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
  }
  function evidenceCard(e) {
    $("#evidenceTitle").textContent = e.label;
    $("#evidenceDetails").innerHTML =
      `<p><b>${esc(e.value)}</b></p><p><b>Source type:</b> ${esc(e.type)}</p><p><b>Source/analysis date:</b> ${esc(e.date)}</p><p><b>Definition:</b> ${esc(e.definition)}</p><p><b>Cannot establish:</b> ${esc(e.limitation)}</p>${e.url ? `<p><a href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">Open direct source</a></p>` : ""}<p class="definition">Reviewed 2026-09-30. Imported packages preserve metadata but do not independently verify it.</p>`;
    $("#evidenceDialog").showModal();
  }
  function metricEvidence(c, key, m) {
    return {
      label: metricName(c, key),
      value: format(c, key, m.estimate),
      type:
        m.provenance === "computed-synthetic"
          ? "Computed from synthetic observed assignment units"
          : "Scenario assumption / derived scenario",
      date: "2026-09-30",
      definition:
        c.kind === "computed"
          ? E.estimateUsers(c.rawRows).method
          : key === "contribution"
            ? "0.40 × scenario incremental revenue − $108,000 scenario spend."
            : key === "netRevenue"
              ? "Scenario iROAS × $108,000 positive spend contrast."
              : "Prewritten snapshot and uncertainty, not re-estimated raw switchback outcomes.",
      limitation:
        c.kind === "computed"
          ? "Independent units, complete outcomes and large-sample normal approximation assumed; no real deployment evidence."
          : "No fitted switchback model, power calculation or marginal-spend response. Each displayed interval is a scenario assumption.",
    };
  }
  function renderControls(c) {
    const el = $("#resultControls");
    if (!["computed", "scenario"].includes(c.kind)) {
      el.innerHTML = "";
      return;
    }
    const options = E.GOALS.map(
      (k) =>
        `<option value="${k}" ${c.goal === k ? "selected" : ""}>${esc(metricName(c, k))}</option>`,
    ).join("");
    const shared = `<label>Decision objective<select id="goalSelect">${options}</select></label>`;
    if (c.kind === "scenario")
      el.innerHTML = `<div class="scenario-controls"><label>Fictional result snapshot<select id="scenarioSelect"><option value="supported">Meets requirements</option><option value="below">Below requirements</option><option value="uncertain">Uncertain / missing interval</option><option value="invalid">Invalid data/design</option></select></label>${shared}</div><p class="definition">Order decisions require relative lift ≥ 6% and iROAS ≥ 1.50. Revenue requires ≥ $162,000 incremental net revenue; contribution requires ≥ $0 after the assumed costs. These are predeclared teaching thresholds. At the assumed 40% margin, contribution break-even requires iROAS 2.50. Meeting the order/1.50× return goals can still lose contribution. Individual intervals are not a simultaneous confidence guarantee.</p>`;
    else {
      const g = c.generator || {
        seed: 42,
        n: 5000,
        baseline: 0.1,
        effect: 0.025,
      };
      el.innerHTML = `<article class="card"><h2>Reproducible synthetic experiment</h2><form id="generatorForm"><div class="form-grid"><div class="field"><label for="seed">Random seed</label><input id="seed" type="number" min="1" max="4294967295" step="1" value="${esc(g.seed)}" required></div><div class="field"><label for="sampleSize">Users per arm</label><input id="sampleSize" type="number" min="100" max="50000" step="1" value="${esc(g.n)}" required></div><div class="field"><label for="baseRate">Baseline conversion probability</label><input id="baseRate" type="number" min="0.001" max="0.999" step="any" value="${esc(g.baseline)}" required></div><div class="field"><label for="trueEffect">Generator-only effect (probability difference)</label><input id="trueEffect" type="number" step="any" value="${esc(g.effect)}" required></div></div><p class="definition">The generator knows this effect. Estimation reads assigned users and observed outcomes only. Synthetic money uses $80 net revenue, $48 variable cost per conversion and $0.30 per treatment-assigned user.</p><div class="horizontal"><button class="btn primary" type="submit">Generate and analyze</button><button class="btn" id="downloadRaw" type="button">Download raw CSV</button>${shared}</div><p class="error" id="generatorError" role="alert"></p></form></article>`;
    }
    if (c.kind === "scenario") {
      $("#scenarioSelect").value = c.scenario;
      $("#scenarioSelect").onchange = (e) => {
        c.scenario = e.target.value;
        c.riskChoice = false;
        c.allocationMode = "baseline";
        render();
      };
    }
    $("#goalSelect").onchange = (e) => {
      c.goal = e.target.value;
      c.threshold =
        c.kind === "scenario"
          ? { orders: 0.06, netRevenue: 162000, contribution: 0 }[c.goal]
          : { orders: 0.01, netRevenue: 0.8, contribution: 0 }[c.goal];
      c.returnGate = c.kind === "scenario" && c.goal === "orders" ? 1.5 : null;
      c.riskChoice = false;
      c.allocationMode = "baseline";
      render();
    };
    if (c.kind === "computed") {
      $("#generatorForm").onsubmit = (e) => {
        e.preventDefault();
        try {
          const g = {
            seed: Number($("#seed").value),
            n: Number($("#sampleSize").value),
            baseline: Number($("#baseRate").value),
            effect: Number($("#trueEffect").value),
          };
          const rows = E.generateUsers(g.seed, g.n, g.baseline, g.effect);
          c.generator = g;
          c.rawRows = rows;
          c.evidence[0].value =
            rows.length.toLocaleString() + " synthetic units";
          render();
          toast("New observed rows analyzed.");
        } catch (error) {
          $("#generatorError").textContent = error.message;
        }
      };
      $("#downloadRaw").onclick = () =>
        download(
          "synthetic-user-outcomes.csv",
          E.csv([
            [
              "unit_id",
              "assignment",
              "converted",
              "net_revenue",
              "variable_cost",
              "marketing_cost",
            ],
            ...c.rawRows.map((r) => [
              r.unit_id,
              r.assignment,
              r.converted,
              r.net_revenue,
              r.variable_cost,
              r.marketing_cost,
            ]),
          ]),
          "text/csv;charset=utf-8",
        );
    }
  }
  function renderOverview(c, s) {
    $("#overviewTitle").textContent = c.name;
    $("#overviewLead").textContent = c.question;
    $("#caseQuestion").textContent = "The decision";
    $("#caseDescription").textContent =
      c.description ||
      "A locally configured plan; no real data or result has been supplied.";
    $("#caseBadge").textContent = c.imported
      ? "Imported · source claims unverified"
      : {
          public: "Public evidence",
          scenario: "Fictional scenarios",
          custom: "Local draft · pending",
          computed: "Computed · synthetic",
        }[c.kind];
    renderControls(c);
    $("#decision").className = "status-line section-space " + s.decision.status;
    $("#decision").innerHTML =
      `<h2>${esc(titles[s.decision.status])}</h2><p>${esc(s.decision.reason)}</p><p class="definition">${c.kind === "public" ? "Historical source evidence is not re-analyzed and is not a causal allocation rule." : `Primary requirement: ${esc(format(c, c.goal, c.threshold))}${c.returnGate !== null && c.returnGate !== undefined ? "; return requirement: " + c.returnGate.toFixed(2) + "×" : ""}. Planned safety guardrail (not monitored here): ${esc(c.guardrail)}`}</p>`;
    if (s.result) {
      $("#metrics").innerHTML = Object.entries(s.result.metrics)
        .map(
          ([key, m]) =>
            `<article class="metric"><div class="label">${esc(metricName(c, key))}</div><div class="value">${esc(format(c, key, m.estimate))}</div><div class="delta neutral">${!s.result.quality.valid ? "Not interpretable: diagnostics failed" : m.interval ? "95% interval: " + esc(format(c, key, m.interval[0])) + " to " + esc(format(c, key, m.interval[1])) : "Interval not provided"}</div><button class="metric-source" data-metric="${key}">${c.kind === "computed" ? "Computed from synthetic rows" : "Scenario assumption"} · inspect evidence</button></article>`,
        )
        .join("");
      const m = s.result.metrics[c.goal];
      $("#analysisChart").innerHTML =
        (s.result.quality.valid
          ? intervalChart(c, m)
          : "<h2>Analysis blocked by failed diagnostics</h2><p>Numeric values remain in the audit package. They do not support an interpretable interval or causal conclusion.</p>") +
        `<p class="definition">${esc(s.result.method)} ${c.kind === "computed" ? "No p-value, power estimate, relative lift, cluster or sequential inference is computed." : "No daily trend or claimed causal confidence is fabricated."}</p>`;
      const issues = s.result.quality.issues;
      if (issues.length)
        $("#analysisChart").innerHTML +=
          `<p class="error">${esc(issues.join(" "))}</p>`;
      if (s.result.counts)
        $("#analysisChart").innerHTML +=
          `<p class="small-stat">Treatment: ${s.result.counts[0].n} assigned, ${s.result.counts[0].conversions} conversions. Control: ${s.result.counts[1].n} assigned, ${s.result.counts[1].conversions} conversions. Analysis stays at user level.</p>`;
    } else {
      $("#metrics").innerHTML = "";
      $("#analysisChart").innerHTML =
        `<h2>${c.kind === "public" ? "Inspect evidence, not an invented effect chart" : "Preparation checklist"}</h2><ul class="checklist"><li>Business question: recorded</li><li>Identification assumptions: ${c.kind === "public" ? "source-specific; local validation required" : "awaiting review"}</li><li>Assignment and outcome data: not connected</li><li>Power analysis: not executed</li><li>Local causal estimate: pending</li><li>Evidence-backed budget action: pending</li></ul>${c.kind === "public" ? '<div class="evidence-grid">' + evidenceHTML(c.evidence) + "</div>" : ""}`;
    }
    renderStages(c, s);
    $("#presentation").hidden = !$("#presentationMode").checked;
  }
  function evidenceHTML(list) {
    return list
      .map(
        (e, i) =>
          `<button class="evidence-button" data-evidence="${i}"><span>${esc(e.label)}</span><strong>${esc(e.value)}</strong><small>${esc(e.type)} · ${esc(e.date)}</small><small>Inspect definition and evidence boundary</small></button>`,
      )
      .join("");
  }
  function intervalChart(c, m) {
    if (!m.interval)
      return "<h2>Uncertainty not provided</h2><p>Complete the interval and design review before classifying this requirement.</p>";
    const lo = Math.min(m.interval[0], c.threshold, 0),
      hi = Math.max(m.interval[1], c.threshold, 0),
      span = hi - lo || 1,
      pad = span * 0.15;
    const x = (v) => 50 + ((v - lo + pad) / (span + pad * 2)) * 660;
    const description = `Estimate ${format(c, c.goal, m.estimate)}; 95% interval ${format(c, c.goal, m.interval[0])} to ${format(c, c.goal, m.interval[1])}; requirement ${format(c, c.goal, c.threshold)}.`;
    return `<h2>${esc(metricName(c, c.goal))}: interval versus requirement</h2><p class="definition">Requirement: <b>${esc(format(c, c.goal, c.threshold))}</b> · estimate: <b>${esc(format(c, c.goal, m.estimate))}</b></p><figure><svg viewBox="0 0 760 90" role="img" aria-label="${esc(description)}"><line x1="50" x2="710" y1="45" y2="45" stroke="var(--line)"/><line x1="${x(c.threshold)}" x2="${x(c.threshold)}" y1="15" y2="75" stroke="var(--warning)" stroke-dasharray="5 4"/><line x1="${x(m.interval[0])}" x2="${x(m.interval[1])}" y1="45" y2="45" stroke="var(--brand)" stroke-width="6"/><circle cx="${x(m.estimate)}" cy="45" r="8" fill="var(--brand)"/></svg><figcaption class="definition">95% interval: ${esc(format(c, c.goal, m.interval[0]))} to ${esc(format(c, c.goal, m.interval[1]))}. Teal: interval and point estimate. Amber dashed line: requirement.</figcaption></figure>`;
  }
  function stages(c, s) {
    return [
      [
        "Business question",
        c.question,
        [
          "Define the eligible population, horizon and action versus no action.",
          "Record the rule/human baseline and the business owner.",
        ],
      ],
      [
        "Data contract",
        "Assignment, exposure, consent, spend and mature business outcomes must agree.",
        [
          "Separate observed records from inferred identity or propensity.",
          "Retain assignment even when delivery fails; reconcile refunds and costs.",
        ],
      ],
      [
        "Design",
        `Evidence method: ${c.method}. Follow-up planning method: ${c.plan.method}.`,
        [
          "Review controllable assignment, interference, outcome delay and carryover.",
          "Predeclare thresholds, observation window, exclusions and guardrails; power is not computed here.",
        ],
      ],
      [
        "Monitoring",
        "Monitor data integrity and customer safety during a fixed observation window.",
        [
          "Safety pauses do not establish efficacy.",
          "Do not stop on an ordinary p-value or silently discard inconvenient periods.",
        ],
      ],
      [
        "Evidence",
        s.result
          ? s.result.method
          : "No local causal analysis is available; inspect the source-specific evidence.",
        [titles[s.decision.status], s.decision.reason],
      ],
      [
        "Decision",
        "Preserve the baseline, review a bounded candidate, or repair evidence.",
        [
          "Additional spend needs a local contrast or supported response curve.",
          "Document approval, idempotency, spend limits, rollback and retest; no real action is taken.",
        ],
      ],
    ];
  }
  function renderStages(c, s) {
    const list = stages(c, s),
      stage = list[state.stage];
    $("#stageNav").innerHTML = list
      .map(
        (x, i) =>
          `<button class="btn" data-stage="${i}" ${state.stage === i ? 'aria-current="step"' : ""}>${i + 1}. ${esc(x[0])}</button>`,
      )
      .join("");
    $("#stageMain").innerHTML =
      `<h2>${esc(stage[0])}</h2><p>${esc(stage[1])}</p>`;
    $("#stageSide").innerHTML =
      `<ul>${stage[2].map((x) => "<li>" + esc(x) + "</li>").join("")}</ul>`;
    $("#prevStage").disabled = state.stage === 0;
    $("#nextStage").textContent =
      state.stage === 5 ? "Open budget comparison" : "Next stage";
  }
  function renderExperiments(c, s) {
    $("#experimentContent").innerHTML =
      `<article class="card"><h2>${esc(c.channel)} — ${esc(c.method)}</h2><span class="pill">${c.kind === "public" ? "Historical evidence, not a local executed experiment" : c.kind === "computed" ? "Synthetic analysis completed" : c.kind === "scenario" ? "Prewritten scenario" : "Not started"}</span><p><b>Analysis/decision state:</b> ${esc(titles[s.decision.status])}</p><p><b>Quality status:</b> ${s.result ? (s.result.quality.valid ? "Valid only under this teaching case’s declared assumptions" : "Failed diagnostics") : "Not locally validated"}</p><p><b>Outcome window:</b> ${c.weeks} weeks planned; real maturity is not established by this interface.</p><p><b>Safety:</b> ${esc(c.guardrail)}</p><div class="horizontal"><button class="btn" id="experimentDetailsButton">Open current experiment details</button><button class="btn primary open-planner">Review draft feasibility</button></div></article>`;
  }
  function openExperiment() {
    const c = ccase(),
      s = snapshot();
    $("#experimentDialogTitle").textContent = c.name + " — experiment";
    $("#experimentDetails").innerHTML =
      `<p><b>Current case ID:</b> ${esc(c.id)}</p><p><b>Evidence method:</b> ${esc(c.method)}</p><p><b>Follow-up plan:</b> ${esc(c.plan.method)} · ${c.plan.weeks} weeks · ${esc(c.plan.channel)}</p><p><b>Analysis status:</b> ${esc(titles[s.decision.status])}</p><p>${esc(s.decision.reason)}</p><p><b>Data quality:</b> ${s.result ? (s.result.quality.valid ? "Teaching assumptions apply; not a live quality certification" : esc(s.result.quality.issues.join(" "))) : "Not validated locally"}</p><p><b>Stopping rule:</b> Fixed planned observation plus mature outcomes. Monitor safety and integrity during operation; no confidence-percentage stopping rule.</p><p><b>Power:</b> Not calculated.</p>`;
    $("#experimentDialog").showModal();
  }
  function renderBudget(c, s) {
    const range = $("#budgetRange");
    range.min = Math.ceil(c.budget * 0.6);
    range.max = Math.floor(c.budget * 1.5);
    range.step = 1;
    range.value = c.total;
    $("#budgetTotal").textContent = money(c.total);
    $("#allocationMode").value = c.allocationMode;
    $("#riskChoice").checked = !!c.riskChoice;
    const riskAllowed =
      c.kind === "scenario" &&
      ["uncertain", "below", "pending"].includes(s.decision.status);
    $("#riskChoice").disabled = !riskAllowed;
    const changed = s.allocation.some((a) => Math.abs(a.delta) > 0.51),
      risk = changed && s.decision.status !== "supported";
    $("#budgetDecision").textContent = changed
      ? risk
        ? "Risk-limited business choice recorded; evidence has not established the proposed allocation."
        : "Manual teaching proposal permitted for review. The result supports its declared requirements, not these reallocation proportions."
      : "Status quo preserved. " + s.decision.reason;
    $("#budgetRows").innerHTML = s.allocation
      .map(
        (a) =>
          `<tr><td>${esc(a.channel)}</td><td>${money(a.baseline)}</td><td>${money(a.candidate)}</td><td>${money(a.delta)}</td></tr>`,
      )
      .join("");
    $("#budgetFoot").innerHTML =
      `<tr><th>Total available funds</th><th>${money(c.total)}</th><th>${money(s.allocation.reduce((v, a) => v + a.candidate, 0))}</th><th>$0</th></tr>`;
    $("#budgetRationale").textContent = changed
      ? "At $800,000 total funds, the fictional candidate releases $72,000 from brand search: $48,000 to prospecting, $16,000 to validation and $8,000 unspent reserve. This manual brand-to-prospecting proposal illustrates bookkeeping; it is not derived from the effect estimate and does not establish prospecting returns. Scaling changes amounts, not evidence. No revenue forecast is available."
      : "All channel lines, test funds and reserves reconcile. Public cases, drafts and the user experiment have no estimated multi-channel response curve; this demo does not infer a reallocation for them.";
  }
  function renderLibrary() {
    $("#caseLibrary").innerHTML = state.cases
      .map(
        (c) =>
          `<article class="source-card"><span class="pill">${esc(c.kind)}</span><h2>${esc(c.name)}</h2><p>${esc(c.question)}</p><p class="definition">${esc(c.method)} · ${c.kind === "custom" ? "No data, power or results yet" : "Inspect evidence boundaries"}</p><button class="btn" data-open-case="${esc(c.id)}">Open case</button></article>`,
      )
      .join("");
  }
  function render() {
    const c = ccase(),
      s = snapshot();
    $("#caseSelect").innerHTML = state.cases
      .map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`)
      .join("");
    $("#caseSelect").value = c.id;
    renderOverview(c, s);
    renderExperiments(c, s);
    renderBudget(c, s);
    renderLibrary();
    $("#evidenceGrid").innerHTML = evidenceHTML(c.evidence);
  }
  function switchCase(id) {
    if (!state.cases.some((c) => c.id === id)) return;
    document.querySelectorAll("dialog[open]").forEach((d) => d.close());
    state.caseId = id;
    state.stage = 0;
    render();
    go("overview");
  }
  function planFromForm() {
    return {
      channel: $("#planChannel").value.trim(),
      method: $("#planMethod").value,
      weeks: Number($("#planWeeks").value),
      budget: Number($("#planBudget").value),
      delayHours: Number($("#planDelay").value),
      blockHours: Number($("#planBlock").value),
      washoutHours: Number($("#planWashout").value),
      dataReady: $("#planReady").checked,
      randomizable: $("#planRandom").checked,
      interference: $("#planInterference").checked,
    };
  }
  function planPreview() {
    const p = planFromForm(),
      f = E.feasibility(p);
    $("#planPreview").innerHTML =
      `<b>${f.readyForReview ? "Ready for design review; not launch approval" : "Not ready to launch"}</b><ul>${f.issues.map((x) => "<li>" + esc(x) + "</li>").join("")}</ul><p>${esc(f.power)}</p><p>${esc(f.stoppingRule)}</p><p>Delayed outcomes must be linked to original assignment. For switchback, predeclare washout, residual carryover and time correlation.</p>`;
  }
  function openPlanner() {
    const p = ccase().plan;
    $("#planChannel").value = p.channel;
    $("#planMethod").value = p.method;
    $("#planWeeks").value = p.weeks;
    $("#planBudget").value = p.budget;
    $("#planDelay").value = p.delayHours;
    $("#planBlock").value = p.blockHours;
    $("#planWashout").value = p.washoutHours;
    $("#planReady").checked = p.dataReady;
    $("#planRandom").checked = p.randomizable;
    $("#planInterference").checked = p.interference;
    $("#planError").textContent = "";
    planPreview();
    $("#plannerDialog").showModal();
  }
  function exportPackage() {
    const c = ccase();
    E.validateCase(c);
    const s = snapshot();
    return {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      case: structuredClone(c),
      analysis: s.result,
      decision: s.decision,
      allocation: s.allocation,
      boundary:
        "Educational package; source metadata is preserved, not independently authenticated. Computed results are recomputed on import.",
    };
  }
  document
    .querySelectorAll(".nav button")
    .forEach((b) => (b.onclick = () => go(b.dataset.page)));
  $("#caseSelect").onchange = (e) => switchCase(e.target.value);
  $("#presentationMode").onchange = () => {
    $("#presentation").hidden = !$("#presentationMode").checked;
    $("#journey").open = $("#presentationMode").checked;
  };
  $("#prevStage").onclick = () => {
    state.stage = Math.max(0, state.stage - 1);
    renderStages(ccase(), snapshot());
  };
  $("#nextStage").onclick = () => {
    if (state.stage === 5) go("budget");
    else {
      state.stage++;
      renderStages(ccase(), snapshot());
    }
  };
  $("#openCurrentExperiment").onclick = openExperiment;
  document.addEventListener("click", (e) => {
    const t = e.target.closest("button");
    if (!t) return;
    if (t.classList.contains("close-dialog")) t.closest("dialog").close();
    if (t.classList.contains("open-planner")) openPlanner();
    if (t.dataset.stage !== undefined) {
      state.stage = Number(t.dataset.stage);
      renderStages(ccase(), snapshot());
    }
    if (t.dataset.evidence !== undefined)
      evidenceCard(ccase().evidence[Number(t.dataset.evidence)]);
    if (t.dataset.metric) {
      const s = snapshot();
      evidenceCard(
        metricEvidence(
          ccase(),
          t.dataset.metric,
          s.result.metrics[t.dataset.metric],
        ),
      );
    }
    if (t.dataset.openCase) switchCase(t.dataset.openCase);
    if (t.id === "experimentDetailsButton") openExperiment();
  });
  $("#plannerForm").oninput = planPreview;
  $("#plannerForm").onsubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const p = planFromForm();
    if (!p.channel || p.weeks <= 0 || p.budget <= 0) {
      $("#planError").textContent =
        "Complete valid channel, duration and budget fields.";
      return;
    }
    ccase().plan = p;
    download(
      "experiment-draft.json",
      JSON.stringify(
        {
          caseId: ccase().id,
          plan: p,
          feasibility: E.feasibility(p),
          status: "draft",
          execution: "not implemented",
        },
        null,
        2,
      ),
    );
    render();
    toast("Draft plan saved; no experiment was launched.");
  };
  $("#budgetRange").oninput = (e) => {
    ccase().total = Number(e.target.value);
    renderBudget(ccase(), snapshot());
  };
  $("#allocationMode").onchange = (e) => {
    ccase().allocationMode = e.target.value;
    renderBudget(ccase(), snapshot());
  };
  $("#riskChoice").onchange = (e) => {
    ccase().riskChoice = e.target.checked;
    renderBudget(ccase(), snapshot());
  };
  $("#downloadBudget").onclick = () => {
    const c = ccase(),
      s = snapshot(),
      rows = [
        [
          "case_id",
          "objective",
          "threshold",
          "evidence_status",
          "risk_choice",
          "channel",
          "status_quo_usd",
          "candidate_usd",
          "difference_usd",
          "rationale",
        ],
        ...s.allocation.map((a) => [
          c.id,
          c.goal,
          c.threshold,
          s.decision.status,
          s.riskChoice,
          a.channel,
          a.baseline,
          a.candidate,
          a.delta,
          a.rationale,
        ]),
      ];
    download("budget-scenario.csv", E.csv(rows), "text/csv;charset=utf-8");
  };
  $("#exportCase").onclick = () => {
    try {
      download(
        "incrementality-case.json",
        JSON.stringify(exportPackage(), null, 2),
      );
      toast("Current case, raw data and decision exported.");
    } catch (error) {
      toast(error.message);
    }
  };
  $("#importCase").onclick = () => $("#importFile").click();
  $("#importFile").onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (file.size > 20000000) throw new Error("Case package exceeds 20 MB.");
      const pkg = JSON.parse(await file.text());
      if (pkg.version !== "2.0")
        throw new Error("Unsupported package version.");
      E.validateCase(pkg.case);
      const c = structuredClone(pkg.case);
      c.imported = true;
      if (state.cases.some((x) => x.id === c.id))
        c.id = "imported-" + Date.now();
      state.cases.push(c);
      switchCase(c.id);
      toast(
        "Case restored. Computed results recomputed; imported claims remain unverified.",
      );
    } catch (error) {
      toast("Import rejected: " + error.message);
    } finally {
      e.target.value = "";
    }
  };
  $("#openBuilder").onclick = () => {
    $("#builderError").textContent = "";
    $("#builderDialog").showModal();
  };
  $("#builderGoal").onchange = () => {
    const k = $("#builderGoal").value;
    $("#builderThresholdLabel").textContent =
      k === "orders"
        ? "Business requirement (percentage points)"
        : "Business requirement (USD / eligible user)";
    $("#builderThreshold").value = k === "orders" ? 1 : 0;
  };
  $("#builderForm").onsubmit = (e) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    try {
      const name = $("#builderCompany").value.trim(),
        channel = $("#builderChannel").value.trim(),
        method = $("#builderMethod").value,
        weeks = Number($("#builderWeeks").value),
        budget = Number($("#builderBudget").value),
        goal = $("#builderGoal").value;
      const c = {
        id: "draft-" + Date.now(),
        name,
        kind: "custom",
        question: $("#builderQuestion").value.trim(),
        channel,
        method,
        weeks,
        goal,
        threshold:
          Number($("#builderThreshold").value) / (goal === "orders" ? 100 : 1),
        returnGate: null,
        budget,
        total: budget,
        allocationMode: "baseline",
        guardrail: $("#builderGuardrail").value.trim(),
        evidence: [],
        plan: {
          channel,
          method,
          weeks,
          budget: Math.max(1, Math.round(budget * 0.08)),
          delayHours: 24,
          blockHours: 72,
          washoutHours: 24,
          dataReady: false,
          randomizable: false,
          interference: false,
        },
        allocations: [
          { channel, share: 0.9 },
          { channel: "Validation budget", share: 0.08 },
          { channel: "Unspent reserve", share: 0.02 },
        ],
      };
      E.validateCase(c);
      state.cases.push(c);
      switchCase(c.id);
      toast("Draft created; data, power and results remain pending.");
    } catch (error) {
      $("#builderError").textContent = error.message;
    }
  };
  $("#downloadTemplate").onclick = () => {
    const c = structuredClone(
      state.cases.find((c) => c.kind === "custom") ||
        state.cases.find((c) => c.id === "users"),
    );
    c.id = "draft-template";
    c.name = "Example company";
    c.question =
      "Does the proposed action improve contribution versus the baseline?";
    c.kind = "custom";
    delete c.rawRows;
    delete c.generator;
    c.evidence = [];
    c.goal = "contribution";
    c.threshold = 0;
    c.returnGate = null;
    c.allocationMode = "baseline";
    c.riskChoice = false;
    download(
      "blank-case-template.json",
      JSON.stringify({ version: "2.0", case: c }, null, 2),
    );
  };
  for (const id of ["planMethod", "builderMethod"])
    $("#" + id).innerHTML = E.METHODS.map(
      (m) => `<option>${esc(m)}</option>`,
    ).join("");
  window.MeasurementApp = { getSnapshot: snapshot, exportPackage };
  render();
})();
