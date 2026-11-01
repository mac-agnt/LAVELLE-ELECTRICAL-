import * as L from "../lavelle";

const {eur, eurK, pct, num} = L;
const tone = (h) => (h === "Green" ? "ok" : h === "Amber" ? "warn" : "bad");
const marginTone = (p) => (p.health === "Green" ? "ok" : "warn");

/* One project, one record: every project tab is generated from the same L.PROJECT data. */
export const PROJECT_TABS = [
  ["overview", "Overview"], ["commercial", "Commercial"], ["progress", "Progress"], ["labour", "Labour"], ["materials", "Materials"],
  ["pos", "Purchase Orders"], ["claims", "Claims"], ["documents", "Documents"], ["issues", "Issues"], ["activity", "Activity"]
];

const isCastle = (p) => p.id === "castlepark";
const committedOf = (p, c) => (isCastle(p) ? c.d.castleCommitted : p.committed);
const stageOf = (p, c) => (isCastle(p) ? c.d.castleStage : p.july.status);
const claimOf = (p, c) => (isCastle(p) ? c.d.castleClaim : p.july.amount);

const varianceNote = (p) => {
  const v = p.complete - p.programme;
  return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v) + "%";
};

function overview(p, c) {
  const committed = committedOf(p, c);
  const claim = claimOf(p, c);
  const stage = stageOf(p, c);
  const staff = L.ON_SITE.filter((e) => e.project === p.id);
  const issues = L.ISSUES.filter((i) => i.project === p.id);
  const decisions = [];
  if (isCastle(p)) {
    if (stage === "Ready for Approval") decisions.push({tone: "accent", title: "July claim ready, " + eur(claim), body: "Percentages are populated from site progress. Approve to submit.", action: {label: "Review claim", primary: true, run: () => c.openProject(p.id, "claims")}});
    if (!c.s.poApproved["PO-4821"]) decisions.push({tone: "warn", title: "PO-4821 awaiting approval, " + eur(12840), body: "CEF, containment materials. Approving adds " + eur(12840) + " to committed cost.", action: {label: "Approve PO-4821", primary: true, run: () => c.mark("poApproved", "PO-4821")}});
  } else if (p.id === "ringsend") {
    decisions.push({tone: "warn", title: "Labour " + eur(L.RINGSEND_LABOUR.variance) + " above monthly allowance", body: "Requires PM review. Project remains forecast profitable at " + pct(p.margin) + ".", action: {label: "Open labour", run: () => c.openProject(p.id, "labour")}});
  } else if (p.id === "kimmage") {
    decisions.push({tone: "bad", title: "INV-1072 " + eur(73210) + " is 12 days overdue", body: "Northbank Developments. Finance Agent has a reminder drafted.", action: {label: "Chase invoice", run: () => c.ask("Chase INV-1072 for Northbank Developments")}});
  }
  const blocks = [];
  if (decisions.length) blocks.push({t: "alerts", items: decisions});
  blocks.push({t: "section", title: "Financial"});
  blocks.push({t: "kpis", items: [
    {label: "Contract", value: eur(p.contract), sub: p.sector + ", " + p.scope},
    {label: "Cost to date", value: eur(p.cost), sub: pct(p.cost / p.contract * 100) + " of contract"},
    {label: "Committed", value: eur(committed), sub: eur(committed - p.cost) + " open on POs", tone: isCastle(p) && c.s.poApproved["PO-4821"] ? "accent" : undefined},
    {label: "Claimed", value: eur(p.claimed), sub: pct(p.claimed / p.contract * 100) + " of contract"},
    {label: "Paid", value: eur(p.paid), sub: eur(p.claimed - p.paid) + " not yet paid"},
    {label: "Forecast final cost", value: eur(p.forecastCost), sub: "Budget " + eur(p.contract)},
    {label: "Forecast gross profit", value: eur(p.forecastGP), sub: "At completion"},
    {label: "Forecast margin", value: pct(p.margin), tone: marginTone(p), hero: true, sub: p.sector + " contract"}
  ]});
  blocks.push({t: "grid", cols: 3, items: [
    {t: "kpis", cols: 1, items: [
      {label: "Programme", value: p.programme + "%", sub: "Planned to date"},
      {label: "Actual", value: p.complete + "%", sub: "From site progress", tone: "accent"},
      {label: "Variance", value: varianceNote(p), sub: p.complete < p.programme ? "Behind programme" : "On programme", tone: p.complete < p.programme ? "warn" : "ok"}
    ]},
    {t: "kpis", cols: 1, items: [
      {label: "Labour this week", value: p.weekHrs + " hrs", sub: p.budgetHrs ? "Budget " + p.budgetHrs + " hrs" : "No site gang this week"},
      {label: "Budget", value: p.budgetHrs + " hrs", sub: "Weekly allowance"},
      {label: "Variance", value: (p.weekHrs - p.budgetHrs >= 0 ? "+" : "−") + Math.abs(p.weekHrs - p.budgetHrs) + " hrs", sub: p.weekHrs > p.budgetHrs ? "Above allowance" : "Within allowance", tone: p.weekHrs > p.budgetHrs ? "warn" : "ok"}
    ]},
    {t: "kpis", cols: 1, items: [
      {label: "July claim", value: eur(claim), sub: stage, tone: stage === "Ready for Approval" ? "accent" : undefined, go: () => c.openProject(p.id, "claims")},
      {label: "On site today", value: String(p.staff), sub: p.foreman ? "Foreman " + p.foreman : ""},
      {label: "Open issues", value: String(issues.length), sub: issues.length ? issues[0].title : "None open", tone: issues.length ? "warn" : "ok"}
    ]}
  ]});
  blocks.push({t: "grid", cols: 2, items: [
    {t: "table", title: "Staff on site today", sub: staff.length + " of " + p.staff + " allocated, from Sync",
      cols: [{k: "n", label: "Name", kind: "person"}, {k: "r", label: "Role"}, {k: "h", label: "Hours", align: "r"}, {k: "c", label: "Cost", kind: "money"}],
      rows: staff.slice(0, 6).map((e) => ({n: e.name, r: e.role, h: e.hours.toFixed(1), c: eur(L.dayCost(e))})),
      foot: staff.length > 6 ? {n: "+" + (staff.length - 6) + " more on site"} : undefined},
    {t: "feed", title: "Recent site activity", items: projectActivity(p).slice(0, 5)}
  ]});
  return blocks;
}

function projectActivity(p) {
  if (isCastle(p)) return [
    {time: "15:18", text: "Kevin Byrne submitted site progress. Overall 42%, Block A containment 92%.", tone: "ok"},
    {time: "15:32", title: "Ops Watchdog", text: "detected a 24-hour labour variance (412 vs 388 hrs).", tone: "warn"},
    {time: "14:56", text: "PO-4821 submitted for Martin's approval.", tone: "warn"},
    {time: "11:06", title: "Claims Agent", text: "recalculated the July claim to " + eur(L.CASTLE_CLAIM) + ".", tone: "ok"},
    {time: "08:02", text: "Sync imported 11 clock records for CastlePark Manor.", tone: "ok"}
  ];
  return [
    {time: "15:48", text: "Sync imported " + Math.max(p.staff, 1) + " clock records for " + p.short + ".", tone: "ok"},
    {time: "13:10", text: "Site update submitted by " + p.pm + ".", tone: "ok"},
    {time: "11:30", title: "Finance Agent", text: "refreshed claim position (" + eur(p.july.amount) + ", " + p.july.status + ").", tone: "ok"},
    {time: "09:15", text: "LiveCosts cost sync completed, " + eur(p.cost) + " to date.", tone: "ok"}
  ];
}

function commercial(p, c) {
  const pk = L.packagesFor(p.id);
  const pcts = isCastle(p) ? c.d.pcts : {};
  const rows = pk.map((k) => {
    const pc = isCastle(p) ? pcts[k.id] : k.pct;
    const earned = Math.round(k.value * pc / 100);
    return {n: {v: k.name, sub: ""}, v: eur(k.value), pct: +pc.toFixed(1), bar: pc, e: eur(earned), prev: eur(k.prev), cur: eur(earned - k.prev)};
  });
  const tot = pk.reduce((n, k) => n + k.value, 0);
  return [
    {t: "steps", items: [
      {label: "Countfire take-off", sub: "Imported", state: "done"}, {label: "Pulse estimate", sub: "Estimator signed off", state: "done"},
      {label: "Quote " + (isCastle(p) ? "Q-2291" : "accepted"), sub: p.client, state: "done"}, {label: "Project", sub: p.start, state: "done"},
      {label: "Monthly claim", sub: stageOf(p, c), state: "now"}, {label: "Invoice and Xero", sub: "Two-way sync", state: "todo"}
    ]},
    {t: "kpis", items: [
      {label: "Contract value", value: eur(p.contract), sub: pk.length + " work packages"},
      {label: "Earned to date", value: eur(p.claimed), sub: pct(p.claimed / p.contract * 100) + " of contract"},
      {label: "Remaining", value: eur(p.contract - p.claimed), sub: "To claim"},
      {label: "Forecast margin", value: pct(p.margin), tone: marginTone(p)}
    ]},
    {t: "table", title: "Quoted work packages", sub: "The quote is the commercial structure of the project",
      cols: [{k: "n", label: "Package", kind: "name"}, {k: "v", label: "Contract value", kind: "money"}, {k: "bar", label: "Complete", kind: "bar"}, {k: "e", label: "Earned", kind: "money"}, {k: "prev", label: "Previous claims", kind: "money"}, {k: "cur", label: "July claim", kind: "money"}],
      rows, foot: {n: "Total", v: eur(tot), e: eur(p.claimed), prev: eur(p.claimed - claimOf(p, c)), cur: eur(claimOf(p, c))}},
    {t: "actions", items: [{label: "Open claim builder", primary: true, run: () => c.openProject(p.id, "claims")}]}
  ];
}

function progress(p, c) {
  const blocks = [
    {t: "kpis", items: [
      {label: "Overall", value: p.complete + "%", sub: "Actual, from site progress", hero: true},
      {label: "Programme", value: p.programme + "%", sub: "Planned to date"},
      {label: "Variance", value: varianceNote(p), tone: p.complete < p.programme ? "warn" : "ok", sub: p.complete < p.programme ? "Behind programme" : "On programme"},
      {label: "Target completion", value: p.end, sub: "Started " + p.start}
    ]},
    {t: "sync", text: isCastle(p) ? "Last site update: 15:18 today, Kevin Byrne, Project Manager" : "Last site update: 13:10 today, " + p.pm + ", Project Manager"}
  ];
  if (isCastle(p)) {
    blocks.push({t: "grid", cols: 3, items: L.CASTLE_BLOCKS.map((b) => b.work
      ? {t: "bars", title: b.block, items: b.work.map((w) => ({label: w[0], value: w[1], display: w[1] + "%", tone: w[1] < 20 ? "warn" : undefined}))}
      : {t: "bars", title: b.block, sub: "Not started", items: [{label: "Containment", value: 0, display: "0%"}, {label: "First fix", value: 0, display: "0%"}, {label: "Second fix", value: 0, display: "0%"}]})});
    blocks.push({t: "alerts", items: [{tone: "warn", title: "Block B containment running behind programme", body: "Late access to level 2 puts overall progress at 42% against 44% planned. Two gangs resequenced to Block A.", action: {label: "Raise with PM", run: () => c.ask("What's happening at CastlePark?")}}]});
  }
  const pk = L.packagesFor(p.id);
  blocks.push({t: "bars", title: "Work package completion", sub: "Feeds the monthly claim", items: pk.map((k) => ({label: k.name, value: isCastle(p) ? c.d.pcts[k.id] : k.pct, display: pct(isCastle(p) ? c.d.pcts[k.id] : k.pct, 1)}))});
  blocks.push({t: "table", title: "What the foreman submits",
    cols: [{k: "a", label: "Field"}, {k: "b", label: "This update", wrap: true}],
    rows: [{a: "Overall completion", b: p.complete + "%"}, {a: "Package percentages", b: pk.length + " packages updated"}, {a: "Units completed", b: isCastle(p) ? "Block A: 18 of 22 first fix units" : "Per site programme"}, {a: "Photographs", b: isCastle(p) ? "14 attached" : "6 attached"}, {a: "Blockers", b: isCastle(p) ? "Level 2 access, Block B" : "None"}, {a: "Next work", b: isCastle(p) ? "Block B second fix, Block A fire alarm" : "As programmed"}, {a: "Labour and materials needed", b: isCastle(p) ? "2 gangs; Prysmian cable, Rexel boards tomorrow" : "No change"}]}
  );
  return blocks;
}

function labour(p, c) {
  const blocks = [];
  if (p.id === "ringsend") blocks.push({t: "alerts", items: [{tone: "warn", title: "Labour " + eur(L.RINGSEND_LABOUR.variance) + " above this month's allowance", body: "Allowance " + eur(L.RINGSEND_LABOUR.allowance) + ", actual " + eur(L.RINGSEND_LABOUR.actual) + ". Switch room rework. Requires PM review; forecast margin holds at " + pct(p.margin) + ".", action: {label: "Open work item", run: () => c.go("Work", "tasks")}}]});
  blocks.push({t: "kpis", items: [
    {label: "This week", value: p.weekHrs + " hrs", sub: "Actual from Sync"},
    {label: "Budget", value: p.budgetHrs + " hrs", sub: "Weekly allowance"},
    {label: "Variance", value: (p.weekHrs - p.budgetHrs >= 0 ? "+" : "−") + Math.abs(p.weekHrs - p.budgetHrs) + " hrs", tone: p.weekHrs > p.budgetHrs ? "warn" : "ok", sub: pct(p.budgetHrs ? (p.weekHrs - p.budgetHrs) / p.budgetHrs * 100 : 0) + " vs budget"},
    {label: "On site today", value: String(p.staff), sub: p.foreman ? "Foreman " + p.foreman : "No gang today"}
  ]});
  if (isCastle(p)) {
    blocks.push({t: "table", title: "Hours by work package", sub: "This week, 412 against 388 budgeted",
      cols: [{k: "n", label: "Package"}, {k: "h", label: "Hours", align: "r"}, {k: "b", label: "Budget", align: "r"}, {k: "v", label: "Variance", align: "r"}],
      rows: L.CASTLE_LABOUR.map((k) => ({n: k.name, h: k.hours, b: k.budget, v: {v: (k.hours - k.budget >= 0 ? "+" : "−") + Math.abs(k.hours - k.budget), tone: k.hours > k.budget ? "warn" : undefined}})),
      foot: {n: "Total", h: 412, b: 388, v: "+24"}});
  }
  const staff = L.ON_SITE.filter((e) => e.project === p.id);
  blocks.push({t: "table", title: "Labour today", sub: "Sync attendance against project allocation",
    cols: [{k: "n", label: "Employee", kind: "person"}, {k: "h", label: "Hours", align: "r"}, {k: "s", label: "Source"}, {k: "c", label: "Cost", kind: "money"}, {k: "st", label: "Status", kind: "status"}],
    rows: staff.slice(0, 8).map((e) => {
      const fix = isCastle(p) && e.name === L.LABOUR_FIX.employee && !c.s.labourAssigned;
      return {n: e.name, h: e.hours.toFixed(1), s: "Sync", c: eur(L.dayCost(e)), st: fix ? "Needs assignment" : "Confirmed"};
    }),
    foot: staff.length > 8 ? {n: "+" + (staff.length - 8) + " more"} : undefined});
  return blocks;
}

function materials(p, c) {
  if (!isCastle(p)) {
    const m = Math.round(p.cost * 0.48);
    return [
      {t: "kpis", items: [{label: "Materials to date", value: eur(m), sub: "From LiveCosts"}, {label: "Open on POs", value: eur(p.committed - p.cost), sub: "Committed, not yet invoiced"}, {label: "Purchase orders", value: String(L.POS.filter((o) => o.project === p.id).length || 3), sub: "Raised on this project"}]},
      {t: "bars", title: "Materials by category", items: [["Containment", 0.26], ["Cable", 0.24], ["Luminaires", 0.2], ["Distribution", 0.15], ["Devices", 0.1], ["Sundries", 0.05]].map((x) => ({label: x[0], value: Math.round(m * x[1]), display: eur(m * x[1])}))}
    ];
  }
  const total = L.CASTLE_MATERIALS.reduce((n, x) => n + x[1], 0);
  return [
    {t: "kpis", items: [
      {label: "Materials to date", value: eur(total), sub: "Of " + eur(p.cost) + " cost to date"},
      {label: "Labour to date", value: eur(L.CASTLE_COST_SPLIT.labour), sub: "From Sync and rates"},
      {label: "Other costs", value: eur(L.CASTLE_COST_SPLIT.other), sub: "Plant and sundries"},
      {label: "Open commitments", value: eur(c.d.castleOpenCommit), sub: "Ordered, not yet invoiced", tone: c.s.poApproved["PO-4821"] ? "accent" : undefined}
    ]},
    {t: "bars", title: "Materials by category", sub: "Cost to date from LiveCosts", items: L.CASTLE_MATERIALS.map((m) => ({label: m[0], value: m[1], display: eur(m[1])}))},
    {t: "feed", title: "Deliveries", items: L.DELIVERIES.filter((d) => d.project === "castlepark").map((d) => ({time: "", text: d.item + " from " + d.supplier + ", " + d.when, tone: d.status === "Chase" ? "warn" : "ok", tag: d.status}))}
  ];
}

function pos(p, c) {
  const list = L.POS.filter((o) => o.project === p.id);
  const rows = list.map((o) => {
    const done = c.s.poApproved[o.no];
    return {no: o.no, sup: o.supplier, item: o.item, v: eur(o.value), st: done ? "Ordered" : o.status,
      a: o.status === "Awaiting Approval" && !done ? {btn: "Approve", primary: true, run: () => c.mark("poApproved", o.no)} : ""};
  });
  return [
    {t: "kpis", items: [
      {label: "Purchase orders", value: isCastle(p) ? String(L.CASTLE_PO_COUNT) : String(Math.max(list.length, 3)), sub: isCastle(p) ? "On this project, " + list.length + " shown" : "On this project"},
      {label: "Committed", value: eur(committedOf(p, c)), sub: "Incl. open POs"},
      {label: "Open on POs", value: eur(committedOf(p, c) - p.cost), sub: "Not yet invoiced"},
      {label: "Awaiting approval", value: String(list.filter((o) => o.status === "Awaiting Approval" && !c.s.poApproved[o.no]).length), tone: "warn", sub: "Synced to LiveCosts on approval"}
    ]},
    {t: "table", title: "Purchase orders", sub: "Most recent first",
      cols: [{k: "no", label: "PO", kind: "mono"}, {k: "sup", label: "Supplier"}, {k: "item", label: "Description"}, {k: "v", label: "Value", kind: "money"}, {k: "st", label: "Status", kind: "status"}, {k: "a", label: ""}],
      rows}
  ];
}

function claims(p, c) {
  const blocks = [
    {t: "kpis", items: [
      {label: "July claim", value: eur(claimOf(p, c)), sub: stageOf(p, c), tone: "accent", hero: true},
      {label: "Claimed to date", value: eur(p.claimed), sub: pct(p.claimed / p.contract * 100) + " of contract"},
      {label: "Paid", value: eur(p.paid), sub: eur(p.invoiced + (isCastle(p) && ["Invoice Generated", "Paid"].indexOf(c.d.castleStage) > -1 ? claimOf(p, c) : 0) - p.paid) + " invoiced, unpaid"},
      {label: "Remaining", value: eur(p.contract - p.claimed)}
    ]},
    {t: "custom", name: "claimBuilder", props: {projectId: p.id}}
  ];
  if (isCastle(p)) {
    blocks.push({t: "table", title: "Claim history",
      cols: [{k: "n", label: "Claim"}, {k: "p", label: "Period"}, {k: "a", label: "Amount", kind: "money"}, {k: "s", label: "Status", kind: "status"}],
      rows: L.CASTLE_CLAIMS.map((x) => ({n: x.no, p: x.period, a: eur(x.amount), s: x.stage})).concat([{n: "Claim 4", p: "July", a: eur(c.d.castleClaim), s: c.d.castleStage}]),
      foot: {n: "Total", a: eur(773000)}});
  }
  return blocks;
}

function documents(p) {
  return {t: "table", title: "Project documents", sub: "Filed against the project record, indexed for the AI",
    cols: [{k: "n", label: "Document", kind: "name"}, {k: "t", label: "Type"}, {k: "u", label: "Updated"}, {k: "o", label: "Owner"}],
    rows: [
      {n: "Quote and contract", t: "PDF", u: p.start, o: "Daniel Walsh"}, {n: "Electrical drawings, rev C", t: "DWG", u: "3 weeks ago", o: p.pm},
      {n: "Countfire take-off", t: "CF", u: "Imported at quote", o: "Daniel Walsh"}, {n: "Programme", t: "XLSX", u: "Last week", o: p.pm},
      {n: "Test and inspection certificates", t: "PDF", u: "Block A, 12 certs", o: p.foreman || p.pm}, {n: "July claim valuation", t: "PDF", u: "Today", o: "Claims Agent"},
      {n: "Risk assessment and method statements", t: "PDF", u: "2 months ago", o: "Rachel Byrne"}
    ]};
}

function issues(p) {
  const list = L.ISSUES.filter((i) => i.project === p.id);
  return [{t: "table", title: list.length + " open on " + p.name,
    cols: [{k: "i", label: "Issue", kind: "name"}, {k: "r", label: "Raised by"}, {k: "s", label: "Severity", kind: "status"}, {k: "st", label: "Status", kind: "status"}],
    rows: list.map((i) => ({i: {v: i.title, sub: i.note}, r: i.raised, s: i.sev, st: i.status}))},
    list.length ? null : {t: "note", text: "Nothing open on this project."}];
}

function activity(p) {
  return [{t: "feed", title: "Activity on " + p.name, items: projectActivity(p).concat([
    {time: "Yesterday", text: "Foreman posted labour in the Lavelle Projects WhatsApp group. Pulse structured it into " + Math.max(p.staff, 1) + " allocations.", tone: "ok"},
    {time: "Yesterday", text: "LiveCosts synced " + eur(p.cost) + " cost to date.", tone: "ok"}
  ])}];
}

export function projectBlocks(p, tab, c) {
  const fn = {overview, commercial, progress, labour, materials, pos, claims}[tab];
  if (fn) return fn(p, c);
  if (tab === "documents") return [documents(p)];
  if (tab === "issues") return issues(p);
  return activity(p);
}

const projectRows = (c, list) => list.map((p) => ({
  n: {v: p.name, sub: p.client}, type: p.sector, pm: p.pm, contract: eurK(p.contract), complete: p.complete, cost: eurK(p.cost),
  claimed: eurK(p.claimed), margin: {v: pct(p.margin), tone: marginTone(p)}, health: p.health, _go: () => c.openProject(p.id, "overview")
}));
const PCOLS = [
  {k: "n", label: "Project", kind: "name"}, {k: "type", label: "Type"}, {k: "pm", label: "PM"}, {k: "contract", label: "Contract", kind: "money"},
  {k: "complete", label: "Complete", kind: "bar"}, {k: "cost", label: "Cost", kind: "money"}, {k: "claimed", label: "Claimed", kind: "money"},
  {k: "margin", label: "Forecast margin", kind: "money"}, {k: "health", label: "Health", kind: "status"}
];

export default {
  id: "Projects",
  tabs: [
    {id: "portfolio", label: "Portfolio", title: "Portfolio", sub: "Every live project, one view. Margin expectations differ by sector.",
      build: (c) => [
        {t: "kpis", items: [
          {label: "Active projects", value: String(L.TOTALS.count), sub: "4 sectors"},
          {label: "Live contract value", value: eurK(L.TOTALS.contract), sub: "Across 12 projects"},
          {label: "Claimed this month", value: eurK(L.TOTALS.julyClaimed), sub: "July, all stages", tone: "accent"},
          {label: "Forecast gross margin", value: pct(L.TOTALS.margin), sub: eurK(L.TOTALS.forecastGP) + " at completion", hero: true},
          {label: "Health", value: L.PROJECTS.filter((p) => p.health === "Green").length + " green", sub: L.PROJECTS.filter((p) => p.health === "Amber").length + " amber"}
        ]},
        {t: "table", title: "All projects", sub: "Tap a project for the full record", cols: PCOLS, rows: projectRows(c, L.PROJECTS),
          foot: {n: "Total", contract: eurK(L.TOTALS.contract), cost: eurK(L.TOTALS.cost), claimed: eurK(L.TOTALS.claimed), margin: pct(L.TOTALS.margin)}},
        {t: "grid", cols: 2, items: [
          {t: "donut", title: "Contract value by sector", items: L.SECTORS.map((s) => {const v = L.PROJECTS.filter((p) => p.sector === s).reduce((n, p) => n + p.contract, 0); return {label: s, value: v, display: eurK(v)};})},
          {t: "bars", title: "Forecast margin by project", items: L.PROJECTS.slice().sort((a, b) => b.margin - a.margin).map((p) => ({label: p.short, value: p.margin, display: pct(p.margin), tone: p.health === "Amber" ? "warn" : undefined})), max: 26}
        ]}
      ]},
    {id: "projects", label: "Projects", title: "Projects", sub: "Open a project for contract, cost, people, materials and claims in one place.",
      build: (c) => {
        if (c.s.projectId) return [{t: "custom", name: "projectDetail", props: {projectId: c.s.projectId}}];
        const f = c.s.projSector || "All";
        const list = f === "All" ? L.PROJECTS : L.PROJECTS.filter((p) => p.sector === f);
        return [
          {t: "tabs", items: ["All"].concat(L.SECTORS).map((s) => ({label: s, on: f === s, run: () => c.set({projSector: s})}))},
          {t: "cards", min: 290, items: list.map((p) => ({title: p.name, pill: p.health, pillTone: tone(p.health), sub: p.client + ", " + p.sector, big: eurK(p.contract),
            lines: [["Complete", p.complete + "%"], ["Cost to date", eurK(p.cost)], ["Forecast margin", pct(p.margin)], ["July claim", eurK(p.july.amount) + ", " + p.july.status]], progress: p.complete, go: () => c.openProject(p.id, "overview")}))}
        ];
      }},
    {id: "progress", label: "Progress", title: "Site progress", sub: "Completion submitted by foremen and PMs, against programme.",
      build: (c) => [
        {t: "kpis", items: [
          {label: "Site updates today", value: "5 of 5", sub: "Major sites submitted", tone: "ok"},
          {label: "Behind programme", value: String(L.PROJECTS.filter((p) => p.complete < p.programme).length), sub: "Projects", tone: "warn"},
          {label: "CastlePark overall", value: "42%", sub: "Programme 44%, variance −2%", tone: "accent"},
          {label: "Last CastlePark update", value: "15:18", sub: "Kevin Byrne, Project Manager"}
        ]},
        {t: "table", title: "Programme against actual", cols: [{k: "n", label: "Project", kind: "name"}, {k: "pm", label: "PM"}, {k: "prog", label: "Programme", kind: "pct"}, {k: "act", label: "Actual", kind: "bar"}, {k: "v", label: "Variance", align: "r"}, {k: "u", label: "Last update"}],
          rows: L.PROJECTS.map((p, i) => ({n: p.name, pm: p.pm, prog: p.programme, act: p.complete, v: {v: varianceNote(p), tone: p.complete < p.programme ? "warn" : undefined}, u: p.id === "castlepark" ? "15:18 today" : i < 4 ? "Today" : "Yesterday", _go: () => c.openProject(p.id, "progress")}))},
        {t: "grid", cols: 3, items: L.CASTLE_BLOCKS.map((b) => b.work ? {t: "bars", title: "CastlePark " + b.block, items: b.work.map((w) => ({label: w[0], value: w[1], display: w[1] + "%"}))} : {t: "note", title: "CastlePark Block C", text: "Not started."})}
      ]},
    {id: "labour", label: "Labour", title: "Project labour", sub: "Hours and labour cost by project, from Sync and project allocation.",
      build: (c) => [
        {t: "alerts", items: [{tone: "warn", title: "Ringsend labour running above plan, +" + eur(L.RINGSEND_LABOUR.variance) + " this month", body: "Requires PM review. Forecast margin remains " + pct(L.PROJECT("ringsend").margin) + ".", action: {label: "Open Ringsend", run: () => c.openProject("ringsend", "labour")}}]},
        {t: "table", title: "This week by project", cols: [{k: "n", label: "Project"}, {k: "h", label: "Hours", align: "r"}, {k: "b", label: "Budget", align: "r"}, {k: "v", label: "Variance", align: "r"}, {k: "s", label: "On site today", align: "r"}],
          rows: L.LABOUR_BY_PROJECT.filter((x) => x.budget > 0).map((x) => ({n: x.name, h: x.hours, b: x.budget, v: {v: (x.variance >= 0 ? "+" : "−") + Math.abs(x.variance), tone: x.variance > 0 ? "warn" : undefined}, s: L.PROJECT(x.id).staff, _go: () => c.openProject(x.id, "labour")})),
          foot: {n: "Total", h: L.LABOUR_BY_PROJECT.reduce((n, x) => n + x.hours, 0), b: L.LABOUR_BY_PROJECT.reduce((n, x) => n + x.budget, 0)}}
      ]},
    {id: "costs", label: "Costs", title: "Project costs", sub: "Cost to date, commitments and forecast. LiveCosts stays the system of record; Pulse shows it on any screen.",
      build: (c) => [
        {t: "sync", text: "LiveCosts connected, project cost sync healthy"},
        {t: "kpis", items: [
          {label: "Cost to date", value: eurK(L.TOTALS.cost), sub: "All projects"},
          {label: "Committed", value: eurK(L.TOTALS.committed + c.d.approvedValue), sub: "Incl. open POs"},
          {label: "Forecast final cost", value: eurK(L.TOTALS.forecastCost)},
          {label: "Forecast gross profit", value: eurK(L.TOTALS.forecastGP), sub: pct(L.TOTALS.margin), tone: "accent"}
        ]},
        {t: "table", title: "By project", cols: [{k: "n", label: "Project"}, {k: "c", label: "Contract", kind: "money"}, {k: "cost", label: "Cost to date", kind: "money"}, {k: "com", label: "Committed", kind: "money"}, {k: "f", label: "Forecast final", kind: "money"}, {k: "m", label: "Margin", kind: "money"}],
          rows: L.PROJECTS.map((p) => ({n: p.name, c: eurK(p.contract), cost: eurK(p.cost), com: p.id === "castlepark" ? eur(c.d.castleCommitted) : eurK(p.committed), f: eurK(p.forecastCost), m: {v: pct(p.margin), tone: marginTone(p)}, _go: () => c.openProject(p.id, "overview")}))}
      ]},
    {id: "claims", label: "Claims", title: "Project claims", sub: "Monthly valuations by project. Open a project to build its claim.",
      build: (c) => [{t: "table", title: "July claims", cols: [{k: "n", label: "Project", kind: "name"}, {k: "a", label: "Claim", kind: "money"}, {k: "s", label: "Stage", kind: "status"}],
        rows: L.PROJECTS.map((p) => ({n: {v: p.name, sub: p.client}, a: eur(claimOf(p, c)), s: stageOf(p, c), _go: () => c.openProject(p.id, "claims")})),
        foot: {n: "Total", a: eur(L.PROJECTS.reduce((n, p) => n + claimOf(p, c), 0))}}]},
    {id: "issues", label: "Issues", title: "Issues", sub: "Open issues raised by site, PMs and the Pulse agents.",
      build: (c) => [{t: "table", cols: [{k: "p", label: "Project"}, {k: "i", label: "Issue", kind: "name"}, {k: "r", label: "Raised by"}, {k: "s", label: "Severity", kind: "status"}, {k: "st", label: "Status", kind: "status"}],
        rows: L.ISSUES.map((i) => ({p: L.PROJECT(i.project).short, i: {v: i.title, sub: i.note}, r: i.raised, s: i.sev, st: i.status, _go: () => c.openProject(i.project, "issues")}))}]}
  ]
};
