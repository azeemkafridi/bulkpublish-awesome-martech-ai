"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");
const Ajv = require("ajv");
const schema = require("../case-schema.json");
const validate = new Ajv({ strict: false, allErrors: true }).compile(schema);
let dom, w, d;
const downloads = [],
  errors = [];
before(async () => {
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (e) => errors.push(e.message));
  dom = await JSDOM.fromFile(path.join(__dirname, "../index.html"), {
    resources: "usable",
    runScripts: "dangerously",
    pretendToBeVisual: true,
    virtualConsole,
    beforeParse(window) {
      window.structuredClone = structuredClone;
      window.scrollTo = () => {};
      window.HTMLDialogElement.prototype.showModal = function () {
        this.open = true;
      };
      window.HTMLDialogElement.prototype.close = function () {
        this.open = false;
      };
      const blobs = new Map();
      window.Blob = Blob;
      window.URL.createObjectURL = (blob) => {
        const id = "blob:test-" + blobs.size;
        blobs.set(id, blob);
        return id;
      };
      window.URL.revokeObjectURL = () => {};
      window.HTMLAnchorElement.prototype.click = function () {
        downloads.push({ name: this.download, blob: blobs.get(this.href) });
      };
    },
  });
  w = dom.window;
  d = w.document;
  await new Promise((resolve) => {
    if (d.readyState === "complete") resolve();
    else w.addEventListener("load", resolve, { once: true });
  });
  assert.ok(w.MeasurementApp, errors.join("\n"));
});
after(() => {
  dom?.window.close();
});
const $ = (selector) => d.querySelector(selector);
const change = (selector, value) => {
  const el = $(selector);
  el.value = value;
  el.dispatchEvent(new w.Event("change", { bubbles: true }));
};
const click = (selector) => $(selector).click();
const snapshot = () => w.MeasurementApp.getSnapshot();
const packageNow = () => w.MeasurementApp.exportPackage();
function checkSchema(pkg) {
  assert.equal(
    validate(JSON.parse(JSON.stringify(pkg))),
    true,
    JSON.stringify(validate.errors),
  );
}

test("public cases expose cited facts, no locally calculated interval, and valid packages", () => {
  for (const id of ["airbnb", "ebay", "pg"]) {
    change("#caseSelect", id);
    assert.equal(snapshot().decision.status, "pending");
    assert.equal($("#analysisChart svg"), null);
    assert.ok($(".evidence-button"));
    checkSchema(packageNow());
    click("#openCurrentExperiment");
    assert.match($("#experimentDetails").textContent, new RegExp(id));
    click("#experimentDialog .close-dialog");
  }
  change("#caseSelect", "airbnb");
  const card = [...d.querySelectorAll(".evidence-button")].find((el) =>
    el.textContent.includes("478.608"),
  );
  card.click();
  assert.match($("#evidenceDetails").textContent, /Filed financial disclosure/);
  assert.match($("#evidenceDetails a").href, /sec.gov/);
  click("#evidenceDialog .close-dialog");
});
test("all NOVA states gate action; CSV, display and JSON use the same complete allocation", async () => {
  change("#caseSelect", "nova");
  for (const [scenario, status] of [
    ["supported", "supported"],
    ["below", "below"],
    ["uncertain", "pending"],
    ["invalid", "invalid"],
  ]) {
    change("#scenarioSelect", scenario);
    assert.equal(snapshot().decision.status, status);
    checkSchema(packageNow());
    change("#allocationMode", "candidate");
    assert.equal(
      snapshot().allocation.some((a) => a.delta !== 0),
      status === "supported",
    );
  }
  change("#scenarioSelect", "supported");
  change("#allocationMode", "candidate");
  assert.equal(snapshot().allocation[0].delta, -72000);
  assert.equal(snapshot().allocation[4].candidate, 16000);
  assert.equal(snapshot().allocation[5].candidate, 8000);
  assert.match($("#budgetRows").textContent, /\$16,000/);
  click("#downloadBudget");
  const csv = await downloads.at(-1).blob.text();
  for (const a of snapshot().allocation)
    assert.ok(
      csv.includes(
        `"${a.channel}","${a.baseline}","${a.candidate}","${a.delta}"`,
      ),
    );
  $("#budgetRange").value = 1200000;
  $("#budgetRange").dispatchEvent(new w.Event("input", { bubbles: true }));
  assert.equal(
    snapshot().allocation.reduce((s, a) => s + a.candidate, 0),
    1200000,
  );
  assert.equal(snapshot().allocation[4].candidate, 24000);
  checkSchema(packageNow());
  change("#scenarioSelect", "uncertain");
  change("#allocationMode", "candidate");
  $("#riskChoice").checked = true;
  $("#riskChoice").dispatchEvent(new w.Event("change", { bubbles: true }));
  assert.equal(snapshot().riskChoice, true);
  assert.ok(snapshot().allocation.some((a) => a.delta !== 0));
  assert.match($("#budgetDecision").textContent, /Risk-limited/);
  change("#scenarioSelect", "invalid");
  change("#allocationMode", "candidate");
  assert.equal($("#analysisChart svg"), null);
  assert.equal($("#riskChoice").disabled, true);
  assert.ok(snapshot().allocation.every((a) => a.delta === 0));
});
test("typed objectives alter thresholds, units and applicable return requirements", () => {
  change("#caseSelect", "nova");
  change("#scenarioSelect", "supported");
  change("#goalSelect", "netRevenue");
  assert.equal(packageNow().case.threshold, 162000);
  assert.equal(packageNow().case.returnGate, null);
  assert.match($("#decision").textContent, /\$162,000/);
  change("#goalSelect", "contribution");
  assert.equal(packageNow().case.threshold, 0);
  assert.equal(packageNow().case.returnGate, null);
  change("#goalSelect", "orders");
  assert.equal(packageNow().case.threshold, 0.06);
  assert.equal(packageNow().case.returnGate, 1.5);
});
test("custom ITS case and follow-up method/channel survive details, planning and export", () => {
  click(".nav button[data-page=library]");
  click("#openBuilder");
  $("#builderCompany").value = "Email Recall";
  $("#builderChannel").value = "Retention email";
  change("#builderMethod", "Interrupted Time Series");
  change("#builderGoal", "contribution");
  $("#builderWeeks").value = 6;
  $("#builderForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(packageNow().case.kind, "custom");
  assert.equal(snapshot().method, "Interrupted Time Series");
  click("#openCurrentExperiment");
  assert.match($("#experimentDetails").textContent, /Retention email/);
  assert.doesNotMatch($("#experimentDetails").textContent, /NOVA/);
  click("#experimentDialog .close-dialog");
  click(".nav button[data-page=experiments]");
  click(".open-planner");
  assert.equal($("#planMethod").value, "Interrupted Time Series");
  const before = downloads.length;
  $("#planWeeks").value = 0;
  $("#plannerForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(downloads.length, before);
  $("#planWeeks").value = 6;
  $("#planChannel").value = "Follow-up email";
  $("#plannerForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.equal(downloads.length, before + 1);
  assert.equal(snapshot().plan.channel, "Follow-up email");
  assert.equal(snapshot().plan.method, "Interrupted Time Series");
  assert.equal(snapshot().decision.status, "pending");
  checkSchema(packageNow());
  click("#plannerDialog .close-dialog");
});
test("raw-data regeneration and import recompute estimates and ignore exported analysis", async () => {
  change("#caseSelect", "users");
  const original = snapshot().result.metrics.orders.estimate;
  $("#seed").value = 43;
  $("#generatorForm").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );
  assert.notEqual(snapshot().result.metrics.orders.estimate, original);
  change("#goalSelect", "contribution");
  assert.equal(packageNow().case.threshold, 0);
  checkSchema(packageNow());
  const pkg = JSON.parse(JSON.stringify(packageNow()));
  const expected = snapshot().result.metrics.contribution.estimate;
  pkg.analysis.metrics.contribution.estimate = 999999;
  pkg.analysis.metrics.contribution.interval = [999998, 1000000];
  pkg.decision.status = "supported";
  pkg.case.generator.effect = 0.5;
  const text = JSON.stringify(pkg);
  Object.defineProperty($("#importFile"), "files", {
    configurable: true,
    value: [{ size: text.length, text: async () => text }],
  });
  await $("#importFile").onchange({ target: $("#importFile") });
  assert.equal(snapshot().result.metrics.contribution.estimate, expected);
  assert.match($("#caseBadge").textContent, /unverified/);
  checkSchema(packageNow());
  click("#exportCase");
  const exported = JSON.parse(await downloads.at(-1).blob.text());
  assert.equal(exported.analysis.metrics.contribution.estimate, expected);
  click("#downloadRaw");
  const csv = await downloads.at(-1).blob.text();
  assert.equal(csv.split("\r\n").length, 10001);
  click("#downloadTemplate");
  checkSchema(JSON.parse(await downloads.at(-1).blob.text()));
});
test("presentation is optional; runtime initializes without DOM errors", () => {
  $("#presentationMode").checked = true;
  $("#presentationMode").dispatchEvent(
    new w.Event("change", { bubbles: true }),
  );
  assert.equal($("#presentation").hidden, false);
  assert.equal($("#journey").open, true);
  $("#presentationMode").checked = false;
  $("#presentationMode").dispatchEvent(
    new w.Event("change", { bubbles: true }),
  );
  assert.equal($("#presentation").hidden, true);
  assert.deepEqual(errors, []);
});
