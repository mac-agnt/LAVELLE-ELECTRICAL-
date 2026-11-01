import * as L from "../lavelle";

/* Dashboard. The pinned KPI band above already shows contract value, claimed this
   month, forecast margin, people on site and open issues; these tabs go a level deeper.
   Figures come from lavelle.js; support figures that are not there live in LOCAL. */

/* ── local support data (not in lavelle.js) ─────────────────────────────── */
const LOCAL = {
  winRate: 31,            /* rolling 12 months, by number of tenders */
  turnaround: 6.4,        /* average days from invite to quote */
  dueThisWeek: ["o1", "o3", "o7", "o10"],
  vehiclesActive: 14,     /* of L.VEHICLES.length, from tracker today */
  /* site updates today for the five major sites (Pulse app and WhatsApp) */
  siteUpdates: [
    {id: "castlepark", time: "15:18", by: "Kevin Byrne", via: "Pulse app", text: "Block A second fix moving, Block B containment resequenced"},
    {id: "harbour", time: "14:46", by: "Sean Murphy", via: "Pulse app", text: "Level 3 Cat B lighting complete, snagging level 2"},
    {id: "ringsend", time: "14:02", by: "Liam Doyle", via: "WhatsApp", text: "Switch room rework finished, testing Thursday"},
    {id: "smallworks", time: "13:30", by: "Tadhg Walsh", via: "ServiceM8", text: "5 call-outs closed, 2 EICRs issued"},
    {id: "kimmage", time: null, by: "Cian Dolan", via: null, text: "No update yet, due by 17:00"}
  ],
  /* two missing timesheets: picked from the on-site list so names match Workforce */
  missingFrom: [["kimmage", 1], ["galway", 0]],
  lastSync: "14:21"
};

/* ── helpers ───────────────────────────────────────────────────────────── */
const STAGES = L.CLAIM_STAGES;
const stageIdx = (s) => STAGES.indexOf(s);
const synced = (c) => !!(c.s.xeroSynced || {}).castlepark;
const julyOf = (c, p) => (p.id === "castlepark" ? {amount: c.d.castleClaim, status: c.d.castleStage} : p.july);
const julyTotal = (c) => L.sum(L.PROJECTS, (p) => julyOf(c, p).amount);
const upcoming = (c) => L.PROJECTS.filter((p) => stageIdx(julyOf(c, p).status) < stageIdx("Submitted"));
const avgUtil = L.sum(L.UTILISATION, (u) => u[1]) / L.UTILISATION.length;
const bySector = L.SECTORS.map((s) => {
  const ps = L.PROJECTS.filter((p) => p.sector === s);
  const contract = L.sum(ps, (p) => p.contract);
  return {sector: s, ps, contract, gp: L.sum(ps, (p) => p.forecastGP), margin: L.sum(ps, (p) => p.forecastGP) / contract * 100};
});
const wMargin = (ps) => {
  const c = L.sum(ps, (p) => p.contract);
  return c ? L.sum(ps, (p) => p.forecastGP) / c * 100 : 0;
};
const invoicedNow = (c) => L.TOTALS.invoiced + (synced(c) ? L.CASTLE_CLAIM : 0);
const claimedNow = (c) => L.TOTALS.claimed - L.CASTLE_CLAIM + c.d.castleClaim;
const short = (id) => L.PROJECT(id).short;

/* ── tabs ──────────────────────────────────────────────────────────────── */
const executive = {
  id: "executive", label: "Executive", title: "Executive",
  sub: "The whole business on one page. Contracts, claims, cash, margin and people, live from the tools Lavelle already runs.",
  build: (c) => {
    const health = ["Green", "Amber", "Red"].map((h) => ({h, ps: L.PROJECTS.filter((p) => p.health === h)}));
    const up = upcoming(c);
    const ranked = L.PROJECTS.slice().sort((a, b) => b.margin - a.margin);
    const po = L.POS.find((p) => p.no === "PO-4821");
    const poOpen = c.d.awaiting.some((p) => p.no === "PO-4821");
    return [
      {t: "kpis", items: [
        {label: "Active contract value", value: L.eurK(L.TOTALS.contract), sub: L.TOTALS.count + " live projects", hero: true, go: () => c.go("Dashboard", "projects")},
        {label: "Revenue YTD", value: L.eurK(L.REVENUE_YTD), sub: "claimed Jan to Jul"},
        {label: "Claimed this month", value: L.eurK(julyTotal(c)), sub: "July", go: () => c.go("Claims", "claims")},
        {label: "Cash collected YTD", value: L.eurK(L.CASH_YTD), sub: L.pct(L.CASH_YTD / L.REVENUE_YTD * 100, 0) + " of revenue", tone: "ok"},
        {label: "Forecast margin", value: L.pct(L.TOTALS.margin), sub: L.eurK(L.TOTALS.forecastGP) + " gross profit", go: () => c.go("Claims", "margins")},
        {label: "Staff utilisation", value: L.pct(avgUtil), sub: "this week, Mon to Fri", tone: "ok"},
        {label: "Open issues", value: String(L.ISSUES.length), sub: L.ISSUES.filter((i) => i.sev === "Medium").length + " medium", tone: "warn", go: () => c.go("Dashboard", "operations")},
        {label: "Upcoming claims", value: String(up.length), sub: L.eur(L.sum(up, (p) => julyOf(c, p).amount)) + " not yet submitted", tone: "accent", go: () => c.go("Claims", "claims")}
      ]},
      {t: "alerts", items: [
        c.d.castleStage === "Ready for Approval"
          ? {tone: "accent", title: "CastlePark July claim waiting on you. ", body: L.eur(c.d.castleClaim) + " for Kellett Construction, built from package progress.",
            action: {label: "Review claim", primary: true, run: () => c.openProject("castlepark", "claims")}}
          : {tone: "ok", title: "CastlePark July claim " + ({Submitted: "submitted", Certified: "certified", "Invoice Generated": "invoiced", Paid: "paid"}[c.d.castleStage] || c.d.castleStage.toLowerCase()) + ". ", body: L.eur(c.d.castleClaim) + (synced(c) ? ", INV-1084 live in Xero." : "."),
            action: {label: "Open claim", run: () => c.openProject("castlepark", "claims")}},
        {tone: "bad", title: "INV-1072 is 12 days overdue. ", body: "Northbank Developments, Kimmage Phase II, " + L.eur(73210) + ".",
          action: {label: "Chase", run: () => c.ask("Chase INV-1072 for Northbank Developments")}},
        poOpen && {tone: "warn", title: po.no + " needs approval. ", body: po.supplier + ", " + po.item.toLowerCase() + " for CastlePark, " + L.eur(po.value) + ".",
          action: {label: "Approve", run: () => c.mark("poApproved", po.no)}}
      ].filter(Boolean)},
      {t: "grid", cols: 2, items: [
        {t: "donut", title: "Contract value by sector", sub: L.eurK(L.TOTALS.contract) + " across " + L.TOTALS.count + " projects",
          items: bySector.map((s) => ({label: s.sector, value: s.contract, display: L.eurK(s.contract)}))},
        {t: "line", title: "Claims and cash collected", sub: "€k per month, " + L.MONTHS[0] + " to " + L.MONTHS[L.MONTHS.length - 1], labels: L.MONTHS,
          series: [{name: "Claimed", data: L.CLAIM_TREND}, {name: "Cash collected", data: L.CASH_TREND}]}]},
      {t: "split", ratio: "3fr 2fr",
        left: [{t: "bars", title: "Forecast margin by project", sub: "Portfolio " + L.pct(L.TOTALS.margin) + ", weighted by contract", max: 30,
          items: ranked.map((p) => ({label: p.short, value: p.margin, display: L.pct(p.margin), tone: p.health === "Amber" ? "warn" : undefined}))}],
        right: [{t: "cols", title: "Labour utilisation", sub: "% of paid hours booked to projects", data: L.UTILISATION.map((u) => [u[0], u[1], u[1] + "%"])},
          {t: "bars", title: "Project health", sub: "From cost, programme and cash", max: L.TOTALS.count, items: health.map((g) => ({
            label: g.h, value: g.ps.length, display: g.ps.length + (g.ps.length === 1 ? " project" : " projects"),
            sub: g.ps.length && g.h !== "Green" ? g.ps.map((p) => p.short).join(", ") : undefined, tone: g.h === "Green" ? "ok" : g.h === "Amber" ? "warn" : "bad"}))}]}
    ];
  }
};

const projects = {
  id: "projects", label: "Projects", title: "Projects",
  sub: "Every live project with cost, claim and forecast margin side by side. Filter by sector or project manager.",
  build: (c) => {
    const sec = c.s.dashFilter || "All";
    const pm = c.s.dashPm || "All";
    const pms = Array.from(new Set(L.PROJECTS.map((p) => p.pm)));
    const ps = L.PROJECTS.filter((p) => (sec === "All" || p.sector === sec) && (pm === "All" || p.pm === pm));
    const contract = L.sum(ps, (p) => p.contract);
    const cost = L.sum(ps, (p) => p.cost);
    const claimed = L.sum(ps, (p) => p.claimed);
    const filtered = sec !== "All" || pm !== "All";
    return [
      {t: "tabs", items: ["All"].concat(L.SECTORS).map((s) => ({label: s, on: sec === s, run: () => c.set({dashFilter: s})}))},
      {t: "tabs", items: ["All"].concat(pms).map((m) => ({label: m === "All" ? "All PMs" : m, on: pm === m, run: () => c.set({dashPm: m})}))},
      {t: "kpis", items: [
        {label: "Projects", value: String(ps.length), sub: filtered ? "of " + L.TOTALS.count + " live" : "all live projects", hero: true},
        {label: "Contract value", value: L.eurK(contract), sub: filtered ? L.pct(contract / L.TOTALS.contract * 100) + " of portfolio" : "matches Executive"},
        {label: "Claimed to date", value: L.eurK(claimed), sub: contract ? L.pct(claimed / contract * 100) + " of contract" : "none"},
        {label: "Cost to date", value: L.eurK(cost), sub: "from LiveCosts"},
        {label: "Forecast margin", value: ps.length ? L.pct(wMargin(ps)) : "None", sub: "weighted by contract"},
        {label: "Amber", value: String(ps.filter((p) => p.health === "Amber").length), sub: ps.filter((p) => p.health === "Amber").map((p) => p.short).join(", ") || "none", tone: "warn"}
      ]},
      ps.length ? {t: "table", title: "Active projects", sub: "Click a row to open the project",
        cols: [{k: "proj", label: "Project", kind: "name"}, {k: "type", label: "Type"}, {k: "pm", label: "PM", kind: "person"}, {k: "contract", label: "Contract", kind: "money"},
          {k: "complete", label: "Complete", kind: "bar"}, {k: "cost", label: "Cost", kind: "money"}, {k: "claimed", label: "Claimed", kind: "money"},
          {k: "margin", label: "Forecast margin", kind: "pct"}, {k: "health", label: "Health", kind: "status"}],
        rows: ps.slice().sort((a, b) => b.contract - a.contract).map((p) => ({proj: {v: p.name, sub: p.client}, type: p.sector, pm: p.pm,
          contract: L.eur(p.contract), complete: p.complete, cost: L.eur(p.cost), claimed: L.eur(p.claimed), margin: +p.margin.toFixed(1), health: p.health,
          _hl: p.id === "castlepark", _go: () => c.openProject(p.id)})),
        foot: {proj: ps.length + " projects", contract: L.eur(contract), cost: L.eur(cost), claimed: L.eur(claimed), margin: L.pct(wMargin(ps))}}
        : {t: "note", title: "No projects match.", text: pm + " has no " + sec.toLowerCase() + " projects. Clear a filter to see more."},
      ps.length ? {t: "bars", title: "Progress against programme", sub: "Percent complete, with programme position", max: 100, items: ps.map((p) => ({
        label: p.short, value: p.complete, display: p.complete + "% of " + p.programme + "%", tone: p.complete < p.programme - 2 ? "warn" : undefined,
        sub: p.complete < p.programme ? (p.programme - p.complete) + " points behind programme" : p.complete > p.programme ? (p.complete - p.programme) + " points ahead" : "on programme"}))} : null
    ].filter(Boolean);
  }
};

const commercial = {
  id: "commercial", label: "Commercial", title: "Commercial",
  sub: "Tenders and quotes from Countfire take-off to issued quote. Won work becomes a project with its packages already set.",
  build: (c) => {
    const order = ["Qualifying", "Take-off", "Estimating", "Quote Issued"];
    const stages = order.map((st) => {
      const os = L.OPPS.filter((o) => o.stage === st);
      return {st, os, value: L.sum(os, (o) => o.value)};
    });
    const issued = L.OPPS.filter((o) => o.stage === "Quote Issued");
    const due = L.OPPS.filter((o) => LOCAL.dueThisWeek.indexOf(o.id) > -1);
    const pipe = L.sum(L.OPPS, (o) => o.value);
    return [
      {t: "kpis", items: [
        {label: "Tender pipeline", value: L.eurK(pipe), sub: L.OPPS.length + " opportunities", hero: true, go: () => c.go("Estimating")},
        {label: "Quotes outstanding", value: String(issued.length), sub: "issued, awaiting decision"},
        {label: "Quote value", value: L.eurK(L.sum(issued, (o) => o.value)), sub: "with clients now", tone: "accent"},
        {label: "Win rate", value: LOCAL.winRate + "%", sub: "rolling 12 months"},
        {label: "Tender turnaround", value: LOCAL.turnaround + " days", sub: "average, invite to quote"},
        {label: "Quotes due this week", value: String(due.length), sub: L.eurK(L.sum(due, (o) => o.value)) + " to price", tone: "warn"}
      ]},
      {t: "split", ratio: "3fr 2fr",
        left: [{t: "bars", title: "Pipeline by stage", sub: "Value and number of tenders", items: stages.map((s) => ({label: s.st, value: s.value, display: L.eurK(s.value),
          sub: s.os.length + " tenders", tone: s.st === "Quote Issued" ? "accent" : undefined}))}],
        right: [{t: "donut", title: "Pipeline by sector", items: L.SECTORS.map((s) => ({label: s, value: L.sum(L.OPPS.filter((o) => o.sector === s), (o) => o.value)}))
          .filter((x) => x.value > 0).map((x) => Object.assign(x, {display: L.eurK(x.value)}))}]},
      {t: "table", title: "Open tenders", sub: "Due this week highlighted. Estimating holds the take-off and the quote",
        cols: [{k: "n", label: "Opportunity", kind: "name"}, {k: "sector", label: "Sector"}, {k: "v", label: "Value", kind: "money"},
          {k: "stage", label: "Stage", kind: "status"}, {k: "due", label: "Due"}, {k: "est", label: "Estimator", kind: "person"}],
        rows: L.OPPS.slice().sort((a, b) => order.indexOf(b.stage) - order.indexOf(a.stage) || b.value - a.value).map((o) => ({
          n: {v: o.name, sub: o.client}, sector: o.sector, v: L.eur(o.value), stage: o.stage, due: o.due, est: o.est,
          _hl: LOCAL.dueThisWeek.indexOf(o.id) > -1, _go: () => c.go("Estimating")})),
        foot: {n: L.OPPS.length + " tenders", v: L.eur(pipe)}},
      {t: "table", title: "Recent results",
        cols: [{k: "n", label: "Tender", kind: "name"}, {k: "v", label: "Value", kind: "money"}, {k: "r", label: "Result", kind: "status"}, {k: "why", label: "Why", wrap: true}, {k: "d", label: "When"}],
        rows: L.WON_LOST.map((w) => ({n: {v: w.name, sub: w.client}, v: L.eur(w.value), r: w.result, why: w.reason, d: w.date}))}
    ];
  }
};

const operations = {
  id: "operations", label: "Operations", title: "Operations",
  sub: "Who is on site, what was logged, what is arriving and where labour is running over.",
  build: (c) => {
    const people = L.ON_SITE.length;
    const hrsToday = L.sum(L.ON_SITE, (e) => e.hours);
    const live = L.LABOUR_BY_PROJECT.filter((x) => x.hours > 0);
    const wkHrs = L.sum(live, (x) => x.hours);
    const wkBudget = L.sum(live, (x) => x.budget);
    const ups = LOCAL.siteUpdates;
    const done = ups.filter((u) => u.time);
    const missing = LOCAL.missingFrom.map(([proj, k]) => L.ON_SITE.filter((e) => e.project === proj)[k]).filter(Boolean);
    const recvd = L.DELIVERIES.filter((d) => d.status === "Received");
    const ring = L.RINGSEND_LABOUR;
    return [
      {t: "kpis", items: [
        {label: "People on site", value: String(people), sub: L.TODAY_SITES.length + " site groups today", hero: true, go: () => c.go("Workforce")},
        {label: "Labour hours", value: L.num(wkHrs), delta: (wkHrs - wkBudget > 0 ? "+" : "") + (wkHrs - wkBudget), sub: "vs " + L.num(wkBudget) + " budget this week", tone: wkHrs > wkBudget ? "warn" : "ok"},
        {label: "Site updates", value: done.length + " of " + ups.length, sub: "major sites, latest " + done[0].time, tone: done.length < ups.length ? "warn" : "ok"},
        {label: "Missing timesheets", value: String(missing.length), sub: missing.map((e) => e.name).join(", "), tone: "bad", go: () => c.go("Workforce")},
        {label: "Deliveries", value: String(L.DELIVERIES.length), sub: recvd.length + " received today, " + L.DELIVERIES.filter((d) => d.when === "Tomorrow").length + " tomorrow", go: () => c.go("Procurement")},
        {label: "Vehicles active", value: LOCAL.vehiclesActive + " of " + L.VEHICLES.length, sub: "on the road today", go: () => c.go("Fleet")}
      ]},
      {t: "split", ratio: "3fr 2fr",
        left: [{t: "table", title: "Site updates today", sub: "From the Pulse app, WhatsApp and ServiceM8, one place",
          cols: [{k: "s", label: "Site", kind: "name"}, {k: "n", label: "On site", align: "r"}, {k: "by", label: "By", kind: "person"}, {k: "t", label: "Time", kind: "mono"}, {k: "st", label: "Status", kind: "status"}],
          rows: ups.map((u) => {
            const ts = L.TODAY_SITES.find((x) => x[2] === u.id);
            return {s: {v: L.PROJECT(u.id).name, sub: u.text}, n: String(ts ? ts[1] : 0), by: u.by, t: u.time || "None",
              st: u.time ? {v: "Submitted, " + u.via, tone: "ok"} : {v: "Missing", tone: "bad"}, _hl: !u.time, _go: () => c.openProject(u.id)};
          }),
          foot: {s: "Total on site", n: String(people) + " incl. " + L.TODAY_SITES[L.TODAY_SITES.length - 1][1] + " elsewhere"}}],
        right: [{t: "bars", title: "Labour variance by project", sub: "Hours this week against budget", items: live.map((x) => ({
          label: x.name, value: x.hours, display: x.hours + " of " + x.budget + " hrs", tone: x.variance > 0 ? "warn" : "ok",
          sub: x.variance > 0 ? "+" + x.variance + " hrs" + (x.id === "ringsend" ? ", " + L.eur(ring.variance) + " over the month allowance" : "") : x.variance < 0 ? x.variance + " hrs" : "on budget"}))}]},
      {t: "grid", cols: 2, items: [
        {t: "table", title: "Open issues", sub: L.ISSUES.length + " raised by site teams and agents",
          cols: [{k: "i", label: "Issue", kind: "name"}, {k: "p", label: "Project"}, {k: "sev", label: "Severity", kind: "status"}, {k: "st", label: "Status", kind: "status"}],
          rows: L.ISSUES.map((i) => ({i: {v: i.title, sub: i.raised}, p: short(i.project), sev: i.sev, st: i.status, _go: () => c.openProject(i.project)}))},
        {t: "table", title: "Deliveries", sub: "Tracked against POs in LiveCosts",
          cols: [{k: "po", label: "PO", kind: "mono"}, {k: "it", label: "Item", kind: "name"}, {k: "w", label: "When"}, {k: "st", label: "Status", kind: "status"}],
          rows: L.DELIVERIES.map((d) => ({po: d.po, it: {v: d.item, sub: d.supplier + ", " + short(d.project)}, w: d.when, st: d.status, _go: () => c.go("Procurement")}))}]},
      {t: "alerts", items: [{tone: "warn", title: "Kimmage site update and 2 timesheets outstanding. ",
        body: "Cian Dolan has not logged today's update. Missing timesheets: " + missing.map((e) => e.name + ", " + short(e.project)).join(" and ") + ".",
        action: {label: "Send reminders", run: () => c.ask("Remind Cian Dolan to submit the Kimmage site update and chase the 2 missing timesheets")}}]}
    ];
  }
};

const finance = {
  id: "finance", label: "Finance", title: "Finance",
  sub: "Quote to cash for the whole portfolio. Cost from LiveCosts, invoices and payments synced with Xero.",
  build: (c) => {
    const T = L.TOTALS;
    const claimed = claimedNow(c);
    const invoiced = invoicedNow(c);
    const out = L.OUTSTANDING(synced(c));
    return [
      {t: "kpis", items: [
        {label: "Contract value", value: L.eurK(T.contract), sub: T.count + " projects", hero: true},
        {label: "Claimed", value: L.eurK(claimed), sub: L.pct(claimed / T.contract * 100) + " of contract"},
        {label: "Invoiced", value: L.eurK(invoiced), sub: L.eurK(claimed - invoiced) + " claimed, not invoiced", go: () => c.go("Claims", "invoices")},
        {label: "Paid", value: L.eurK(T.paid), sub: "confirmed in Xero", tone: "ok"},
        {label: "Outstanding", value: L.eur(out), sub: L.eur(73210) + " overdue", tone: "warn", go: () => c.go("Claims", "receivables")},
        {label: "Cost committed", value: L.eurK(T.committed), sub: L.eurK(T.committed - T.cost) + " open POs"},
        {label: "Cost incurred", value: L.eurK(T.cost), sub: L.pct(T.cost / T.forecastCost * 100) + " of forecast"},
        {label: "Forecast final cost", value: L.eurK(T.forecastCost), sub: L.eurK(T.forecastCost - T.cost) + " to complete"},
        {label: "Forecast margin", value: L.pct(T.margin), sub: L.eurK(T.forecastGP) + " gross profit", go: () => c.go("Claims", "margins")}
      ]},
      {t: "sync", text: "Xero: two-way, healthy, last sync " + LOCAL.lastSync + ". " + (synced(c) ? "INV-1084 posted, balances current." : "INV-1084 held as draft until the CastlePark claim is approved.")},
      {t: "grid", cols: 2, items: [
        {t: "bars", title: "Contract to cash", sub: "How much of the contract value has turned into money", max: T.contract, items: [
          {label: "Contract", value: T.contract, display: L.eurK(T.contract)},
          {label: "Claimed", value: claimed, display: L.eurK(claimed), sub: L.eurK(T.contract - claimed) + " still to claim"},
          {label: "Invoiced", value: invoiced, display: L.eurK(invoiced), sub: L.eurK(claimed - invoiced) + " awaiting invoice"},
          {label: "Paid", value: T.paid, display: L.eurK(T.paid), sub: L.eurK(out) + " outstanding", tone: "ok"}]},
        {t: "line", title: "Cash collected against claims", sub: "€k per month", labels: L.MONTHS,
          series: [{name: "Cash collected", data: L.CASH_TREND}, {name: "Claimed", data: L.CLAIM_TREND}]}]},
      {t: "table", title: "Cash position by project", sub: "Claimed, invoiced and paid to date. Click to open the project",
        cols: [{k: "p", label: "Project", kind: "name"}, {k: "claimed", label: "Claimed", kind: "money"}, {k: "inv", label: "Invoiced", kind: "money"},
          {k: "paid", label: "Paid", kind: "money"}, {k: "unb", label: "Not invoiced", kind: "money"}, {k: "out", label: "Outstanding", kind: "money"}],
        rows: L.PROJECTS.slice().sort((a, b) => b.contract - a.contract).map((p) => {
          const cl = p.id === "castlepark" ? p.claimed - L.CASTLE_CLAIM + c.d.castleClaim : p.claimed;
          const inv = p.invoiced + (p.id === "castlepark" && synced(c) ? L.CASTLE_CLAIM : 0);
          const o = inv - p.paid;
          return {p: {v: p.name, sub: p.client}, claimed: L.eur(cl), inv: L.eur(inv), paid: L.eur(p.paid), unb: L.eur(cl - inv),
            out: p.id === "kimmage" ? {v: L.eur(o), tone: "bad", sub: "overdue"} : L.eur(o), _hl: p.id === "castlepark", _go: () => c.openProject(p.id)};
        }),
        foot: {p: "Portfolio", claimed: L.eur(claimed), inv: L.eur(invoiced), paid: L.eur(T.paid), unb: L.eur(claimed - invoiced), out: L.eur(out)}}
    ];
  }
};

export default {id: "Dashboard", tabs: [executive, projects, commercial, operations, finance]};
