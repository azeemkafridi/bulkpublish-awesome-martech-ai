"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const E = require("../engine.js");
const metric = (estimate, lo, hi) => ({ estimate, interval: [lo, hi] });
function draft(method = "Interrupted Time Series") {
  return {
    id: "draft",
    name: "Email recall",
    question: "Does the policy improve contribution?",
    channel: "Email",
    guardrail: "Pause for harm",
    kind: "custom",
    method,
    goal: "contribution",
    threshold: 0,
    returnGate: null,
    budget: 500000,
    total: 500000,
    weeks: 6,
    allocationMode: "baseline",
    allocations: [
      { channel: "Email", share: 0.9 },
      { channel: "Validation", share: 0.08 },
      { channel: "Reserve", share: 0.02 },
    ],
    evidence: [],
    plan: {
      method,
      channel: "Email",
      weeks: 6,
      budget: 16000,
      delayHours: 24,
      blockHours: 72,
      washoutHours: 24,
      dataReady: false,
      randomizable: false,
      interference: false,
    },
  };
}
test("interval decisions include missing, crossing, negative, invalid and safety states", () => {
  assert.equal(E.classify(metric(0.08, 0.07, 0.09), 0.06), "supported");
  assert.equal(E.classify(metric(0.04, 0.01, 0.083), 0.06), "uncertain");
  assert.equal(E.classify(metric(0.02, 0.01, 0.03), 0.06), "below");
  assert.equal(E.classify(metric(-0.02, -0.03, -0.01), 0), "below");
  assert.equal(E.classify({ estimate: 1.42, interval: null }, 1.5), "pending");
  assert.equal(E.classify(metric(0.08, 0.09, 0.07), 0.06), "pending");
  assert.equal(E.classify(metric(0.08, 0.07, 0.09), 0.06, false), "invalid");
  assert.equal(
    E.classify(metric(0.08, 0.07, 0.09), 0.06, true, false),
    "guardrail",
  );
});
test("positive order result cannot replace a missing return interval", () => {
  const c = { goal: "orders", threshold: 0.06, returnGate: 1.5 };
  const r = {
    quality: { valid: true },
    guardrail: true,
    metrics: {
      orders: metric(0.048, 0.012, 0.083),
      iroas: { estimate: 1.42, interval: null },
    },
  };
  assert.equal(E.decide(c, r).status, "pending");
  r.metrics.iroas = metric(1.8, 1.6, 2);
  assert.equal(E.decide(c, r).status, "uncertain");
  r.metrics.orders = metric(0.09, 0.07, 0.11);
  assert.equal(E.decide(c, r).status, "supported");
  r.quality.valid = false;
  assert.equal(E.decide(c, r).status, "invalid");
});
test("estimates use raw observations and correctly deduct costs", () => {
  const rows = [];
  for (const arm of ["treatment", "control"])
    for (let i = 0; i < 100; i++) {
      const converted = i < (arm === "treatment" ? 20 : 10) ? 1 : 0;
      rows.push({
        unit_id: arm + i,
        assignment: arm,
        converted,
        net_revenue: 80 * converted,
        variable_cost: 48 * converted,
        marketing_cost: arm === "treatment" ? 0.3 : 0,
      });
    }
  const r = E.estimateUsers(rows);
  assert.ok(Math.abs(r.metrics.orders.estimate - 0.1) < 1e-12);
  assert.ok(Math.abs(r.metrics.netRevenue.estimate - 8) < 1e-12);
  assert.ok(Math.abs(r.metrics.contribution.estimate - 2.9) < 1e-12);
  assert.ok(
    Math.abs(
      r.metrics.orders.standardError - Math.sqrt((0.2 * 0.8 + 0.1 * 0.9) / 99),
    ) < 1e-12,
  );
  assert.equal(r.quality.valid, true);
  rows[0].converted = 0;
  rows[0].net_revenue = 0;
  rows[0].variable_cost = 0;
  assert.notEqual(
    E.estimateUsers(rows).metrics.orders.estimate,
    r.metrics.orders.estimate,
  );
});
test("generator is deterministic, balanced, validated and distinct from estimator", () => {
  const a = E.generateUsers(42, 1000, 0.1, 0.02),
    b = E.generateUsers(42, 1000, 0.1, 0.02);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a, E.generateUsers(43, 1000, 0.1, 0.02));
  assert.equal(a.filter((r) => r.assignment === "treatment").length, 1000);
  assert.notEqual(E.estimateUsers(a).metrics.orders.estimate, 0.02);
  assert.throws(() => E.generateUsers(1, 0, 0.1, 0.02));
  assert.throws(() => E.generateUsers(1, 100, 0.9, 0.2));
  assert.throws(() => E.generateUsers(NaN, 100, 0.1, 0.02));
});
test("invalid data and sparse outcomes cannot be released as a quality pass", () => {
  const rows = E.generateUsers(42, 100, 0.01, 0);
  assert.equal(E.estimateUsers(rows).quality.valid, false);
  const duplicate = structuredClone(rows);
  duplicate[1].unit_id = duplicate[0].unit_id;
  assert.throws(() => E.estimateUsers(duplicate));
  const invalid = structuredClone(rows);
  invalid[1].net_revenue = NaN;
  assert.throws(() => E.estimateUsers(invalid));
});
test("candidate bookkeeping exactly reconciles baseline, validation and reserve", () => {
  const c = draft();
  c.kind = "scenario";
  c.allocations = [
    { channel: "Brand", share: 0.29 },
    { channel: "Prospecting", share: 0.36 },
    { channel: "Video", share: 0.26 },
    { channel: "Other", share: 0.09 },
    { channel: "Validation", share: 0 },
    { channel: "Reserve", share: 0 },
  ];
  c.budget = 800000;
  const a = E.allocation(c, 800000, "candidate", true);
  assert.equal(a[0].delta, -72000);
  assert.equal(a[1].delta, 48000);
  assert.equal(a[4].candidate, 16000);
  assert.equal(a[5].candidate, 8000);
  for (const total of [500003, 800000, 1200000])
    for (const allow of [false, true]) {
      const rows = E.allocation(c, total, "candidate", allow);
      assert.equal(
        rows.reduce((s, r) => s + r.baseline, 0),
        total,
      );
      assert.equal(
        rows.reduce((s, r) => s + r.candidate, 0),
        total,
      );
      assert.equal(
        rows.reduce((s, r) => s + r.delta, 0),
        0,
      );
      assert.ok(
        rows.every(
          (r) => Number.isInteger(r.baseline) && Number.isInteger(r.candidate),
        ),
      );
      if (!allow) assert.ok(rows.every((r) => r.delta === 0));
    }
  assert.throws(() => E.allocation(c, 800000.1, "candidate", true));
  const nearOne = {
    ...draft(),
    budget: 1e9,
    allocations: [
      { channel: "A", share: 0.5 },
      { channel: "B", share: 0.5000000009 },
    ],
  };
  assert.equal(
    E.allocation(nearOne, 1500000000, "baseline", false).reduce(
      (s, r) => s + r.candidate,
      0,
    ),
    1500000000,
  );
  assert.throws(() =>
    E.allocation(
      { ...c, allocations: [{ channel: "Only one line", share: 1 }] },
      800000,
      "candidate",
      true,
    ),
  );
});
test("feasibility respects carryover, duration, randomization and pending power", () => {
  const p = {
    ...draft("Switchback").plan,
    dataReady: true,
    randomizable: true,
  };
  assert.equal(E.feasibility(p).readyForReview, true);
  p.washoutHours = 0;
  assert.equal(E.feasibility(p).readyForReview, false);
  p.weeks = 0;
  assert.ok(E.feasibility(p).issues.some((x) => x.includes("Duration")));
  assert.equal(E.feasibility(draft().plan).readyForReview, false);
  assert.match(E.feasibility(p).power, /Not calculated/);
});
test("package validation preserves ITS and blocks malformed, missing and incompatible data", () => {
  const c = draft();
  assert.equal(E.validateCase(c), true);
  assert.equal(c.plan.method, "Interrupted Time Series");
  assert.throws(() => E.validateCase({ ...c, weeks: 0 }));
  assert.throws(() => E.validateCase({ ...c, total: NaN }));
  assert.throws(() =>
    E.validateCase({ ...c, allocations: [{ channel: "Email", share: 0.5 }] }),
  );
  assert.throws(() =>
    E.validateCase({
      ...c,
      kind: "computed",
      rawRows: E.generateUsers(42, 1000, 0.1, 0.02),
    }),
  );
  assert.throws(() =>
    E.validateCase({ ...c, evidence: [{ label: "Missing metadata" }] }),
  );
  assert.throws(() =>
    E.validateCase({ ...c, plan: { ...c.plan, delayHours: 9000 } }),
  );
  const oneArm = E.generateUsers(42, 100, 0.1, 0.02).map((r) => ({
    ...r,
    assignment: "treatment",
  }));
  assert.throws(() =>
    E.validateCase({
      ...c,
      kind: "computed",
      method: "User Randomized Holdout",
      rawRows: oneArm,
    }),
  );
});
test("CSV preserves quotes/newlines and neutralizes string spreadsheet formulas", () => {
  assert.equal(E.csv([[" =SUM(A1)"]]), '"\' =SUM(A1)"');
  assert.equal(
    E.csv([["A, B", 'Say "yes"', "x\ny", "=SUM(A1)", -2]]),
    '"A, B","Say ""yes""","x\ny","\'=SUM(A1)","-2"',
  );
});
