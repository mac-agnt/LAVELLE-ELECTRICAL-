import * as L from "../lavelle";

/* Claims & Finance. Quote -> package structure -> claim -> invoice -> Xero -> payment.
   Every figure comes from lavelle.js or is derived from it here. The few support
   figures that do not exist there are defined (and labelled) in LOCAL below. */

/* ── local support data (not in lavelle.js) ─────────────────────────────── */
const LOCAL = {
  lastSync: "14:21",
  syncAfterPush: "14:36",
  /* expected forecast margin bands by sector (Lavelle targets, mock) */
  bands: {Residential: [13, 16], Commercial: [19, 24], Industrial: [15, 19], "Small Works": [22, 28]},
  /* forecast August claim, paid on 30 days in October (trend of L.CLAIM_TREND) */
  augClaimForecast: 634000,
  /* Clonskeagh final fix allowance; 3.4% creep from L.ISSUES i5 */
  clonskeaghFinalFix: 41000
};

/* ── helpers ───────────────────────────────────────────────────────────── */
const STAGES = L.CLAIM_STAGES;
const stageIdx = (s) => STAGES.indexOf(s);
const synced = (c) => !!(c.s.xeroSynced || {}).castlepark;
const julyOf = (c, p) => (p.id === "castlepark"
  ? {amount: c.d.castleClaim, status: c.d.castleStage}
  : p.july);
const julyRows = (c) => L.PROJECTS.map((p) => Object.assign({p}, julyOf(c, p)));
const julyTotal = (c) => L.sum(julyRows(c), (r) => r.amount);
const byStage = (c) => STAGES.map((st) => {
  const rows = julyRows(c).filter((r) => r.status === st);
  return {stage: st, count: rows.length, value: L.sum(rows, (r) => r.amount), rows};
});
/* claims waiting on a sign-off before they can go to the client */
const awaitingApproval = (c) => julyRows(c).filter((r) => r.status === "PM Review" || r.status === "Ready for Approval");
const drafts = (c) => julyRows(c).filter((r) => r.status === "Draft");

const invIssued = (c, inv) => inv.no !== "INV-1084" || synced(c);
const invoicedToDate = (c) => L.TOTALS.invoiced + (synced(c) ? L.CASTLE_CLAIM : 0);
const outstanding = (c) => L.OUTSTANDING(synced(c));
const overdue = () => L.INVOICES.filter((i) => /overdue/i.test(i.status));
const openInvoices = (c) => L.INVOICES.filter((i) => i.status !== "Paid" && invIssued(c, i));
const projName = (id) => L.PROJECT(id).name;
const xeroCell = (c, inv) => {
  if (!invIssued(c, inv)) return {v: "Draft, not in Xero", tone: "warn"};
  return {v: inv.status === "Paid" ? "Synced, paid in Xero" : "Synced", tone: "ok"};
};
const sectorStats = () => L.SECTORS.map((s) => {
  const ps = L.PROJECTS.filter((p) => p.sector === s);
  const contract = L.sum(ps, (p) => p.contract);
  const gp = L.sum(ps, (p) => p.forecastGP);
  const fc = L.sum(ps, (p) => p.forecastCost);
  return {sector: s, count: ps.length, contract, gp, forecastCost: fc, margin: gp / contract * 100, band: LOCAL.bands[s]};
});
const inBand = (m, band) => m >= band[0] && m <= band[1];

/* Xero sync status, shared by Overview, Invoices and Receivables */
const syncLine = (c) => ({t: "sync", text: synced(c)
  ? "Xero: two-way, healthy, last sync " + LOCAL.syncAfterPush + ". INV-1084 posted to Xero, balances updated."
  : "Xero: two-way, healthy, last sync " + LOCAL.lastSync + ". " + (L.INVOICES.length - 1) + " of " + L.INVOICES.length + " invoices in Xero, INV-1084 held as draft."});

const xeroTable = (c) => {
  const issued = L.INVOICES.filter((i) => invIssued(c, i));
  const clients = Array.from(new Set(L.INVOICES.map((i) => i.client)));
  return {t: "table", title: "Xero integration", sub: "Pulse is the source for claims and invoices. Xero is the source for payments and balances.",
    cols: [{k: "flow", label: "Flow", kind: "name"}, {k: "dir", label: "Direction"}, {k: "last", label: "Last event", wrap: true}, {k: "st", label: "Status", kind: "status"}],
    rows: [
      {flow: {v: "Invoices", sub: issued.length + " of " + L.INVOICES.length + " in Xero"}, dir: "Pulse to Xero",
        last: synced(c) ? "INV-1084 Kellett Construction " + L.eur(L.CASTLE_CLAIM) + " posted " + LOCAL.syncAfterPush : "INV-1084 waiting on claim approval",
        st: synced(c) ? "Synced" : {v: "1 draft", tone: "warn"}},
      {flow: {v: "Payments", sub: "Bank feed reconciled in Xero"}, dir: "Xero to Pulse", last: "Apex Fit-Out paid INV-1061 " + L.eur(82440) + " at " + LOCAL.lastSync, st: "Synced"},
      {flow: {v: "Customer balances", sub: clients.length + " customers"}, dir: "Xero to Pulse", last: "Outstanding " + L.eur(outstanding(c)) + " matches Xero aged receivables", st: "Synced"},
      {flow: {v: "Tracking categories", sub: "One per project"}, dir: "Pulse to Xero", last: L.PROJECTS.length + " projects mapped, cost and revenue coded by project", st: "Synced"}
    ]};
};

/* ── tabs ──────────────────────────────────────────────────────────────── */
const overview = {
  id: "overview", label: "Overview", title: "Claims & Finance",
  sub: "One live picture from quote to cash. Package progress feeds the claim, the claim becomes the invoice, Xero sends the payment back.",
  build: (c) => {
    const stages = byStage(c);
    const wait = awaitingApproval(c);
    const castle = L.PROJECT("castlepark");
    const st = c.d.castleStage;
    const phrase = {Draft: "in draft", "PM Review": "with Kevin Byrne for PM review", Submitted: "submitted to Kellett Construction",
      Certified: "certified by Kellett Construction", "Invoice Generated": "invoiced", Paid: "paid"}[st] || st.toLowerCase();
    const castleAlert = st === "Ready for Approval"
      ? {tone: "accent", title: "CastlePark July claim ready for approval. ",
        body: L.eur(c.d.castleClaim) + " across 8 work packages for Kellett Construction. The Claims Agent built it from package progress, so nobody had to rebuild the spreadsheet.",
        action: {label: "Review claim", primary: true, run: () => c.openProject("castlepark", "claims")}}
      : st === "Invoice Generated" && !synced(c)
        ? {tone: "warn", title: "INV-1084 generated, not yet in Xero. ", body: L.eur(c.d.castleClaim) + " for Kellett Construction. Push it to Xero so it counts in receivables.",
          action: {label: "Review claim", primary: true, run: () => c.openProject("castlepark", "claims")}}
        : {tone: stageIdx(st) < stageIdx("Ready for Approval") ? "warn" : "ok", title: "CastlePark July claim is " + phrase + ". ",
          body: L.eur(c.d.castleClaim) + (synced(c) ? " invoiced as INV-1084 and live in Xero, due 28 Aug." : " with Kellett Construction."),
          action: {label: "Review claim", run: () => c.openProject("castlepark", "claims")}};
    const events = [
      synced(c) && {time: LOCAL.syncAfterPush, title: "Xero", text: "INV-1084 posted for Kellett Construction, " + L.eur(L.CASTLE_CLAIM) + ", due 28 Aug.", tone: "ok", tag: "Synced"},
      stageIdx(st) > stageIdx("Ready for Approval") && {time: "Now", title: "Martin Lavelle", text: "moved the CastlePark July claim to " + st + ".", tone: "accent", go: () => c.openProject("castlepark", "claims")},
      {time: "14:21", title: "Xero", text: "confirmed payment of " + L.eur(82440) + " from Apex Fit-Out against INV-1061, Harbour Exchange.", tone: "ok", tag: "Paid"},
      {time: "11:06", title: "Claims Agent", text: "recalculated the CastlePark July claim to " + L.eur(L.CASTLE_CLAIM) + " from updated package percentages.", tone: "accent", go: () => c.openProject("castlepark", "claims")},
      {time: "10:12", title: "Finance Agent", text: "flagged INV-1072, Northbank Developments, " + L.eur(73210) + ", 12 days overdue.", tone: "bad", tag: "Overdue", go: () => c.go("Claims", "receivables")},
      {time: "09:30", title: "Ringsend Upgrade", text: "July claim of " + L.eur(L.PROJECT("ringsend").july.amount) + " certified by Eastpoint Engineering.", tone: "ok", tag: "Certified"},
      {time: "08:45", title: "Harbour Exchange", text: "July claim of " + L.eur(L.PROJECT("harbour").july.amount) + " submitted to Apex Fit-Out.", tone: "accent"}
    ].filter(Boolean);
    return [
      {t: "kpis", items: [
        {label: "Claimed this month", value: L.eurK(julyTotal(c)), sub: "July, " + L.PROJECTS.length + " projects", hero: true, go: () => c.go("Claims", "claims")},
        {label: "Invoiced to date", value: L.eurK(invoicedToDate(c)), sub: "of " + L.eurK(L.TOTALS.claimed + c.d.castleClaim - L.CASTLE_CLAIM) + " claimed", go: () => c.go("Claims", "invoices")},
        {label: "Paid to date", value: L.eurK(L.TOTALS.paid), sub: "confirmed by Xero", tone: "ok"},
        {label: "Outstanding", value: L.eur(outstanding(c)), delta: L.eurK(L.sum(overdue(), (i) => i.amount)), sub: "overdue", tone: "warn", go: () => c.go("Claims", "receivables")},
        {label: "Forecast margin", value: L.pct(L.TOTALS.margin), sub: L.eurK(L.TOTALS.forecastGP) + " gross profit", go: () => c.go("Claims", "margins")},
        {label: "Claims awaiting approval", value: String(wait.length), sub: L.eur(L.sum(wait, (r) => r.amount)) + ", plus " + drafts(c).length + " in draft", tone: wait.length ? "accent" : "ok", go: () => c.go("Claims", "claims")}
      ]},
      {t: "cards", title: "July claims by stage", min: 132, items: stages.map((g) => ({
        title: g.stage, big: String(g.count), pill: g.rows.some((r) => r.p.id === "castlepark") ? "CastlePark" : undefined, pillTone: "accent",
        lines: [["Value", L.eurK(g.value)]], go: () => c.go("Claims", "claims")}))},
      {t: "split", ratio: "3fr 2fr",
        left: [{t: "alerts", items: [castleAlert]},
          {t: "feed", title: "Recent finance events", sub: "Pulse, Claims Agent and Xero in one stream", items: events}],
        right: [syncLine(c),
          {t: "bars", title: "Quote to cash, portfolio", sub: "Where the " + L.eurK(L.TOTALS.contract) + " of contracts sits today", items: [
            {label: "Contract value", value: L.TOTALS.contract, display: L.eurK(L.TOTALS.contract)},
            {label: "Claimed", value: L.TOTALS.claimed + c.d.castleClaim - L.CASTLE_CLAIM, display: L.eurK(L.TOTALS.claimed + c.d.castleClaim - L.CASTLE_CLAIM)},
            {label: "Invoiced", value: invoicedToDate(c), display: L.eurK(invoicedToDate(c))},
            {label: "Paid", value: L.TOTALS.paid, display: L.eurK(L.TOTALS.paid), tone: "ok"}]},
          {t: "note", title: "How the claim is built.", text: "The accepted quote set 8 work packages for each project. Site progress moves package percentages, and the claim is value times percent complete, less what was claimed before."}]}
    ];
  }
};

const claims = {
  id: "claims", label: "Claims", title: "July claims",
  sub: "Every claim starts from the quote's work packages. Move a package percentage and the claim, the document and the invoice follow.",
  build: (c) => {
    const rows = julyRows(c);
    const stages = byStage(c);
    const st = c.d.castleStage;
    const ci = stageIdx(st);
    const certified = rows.filter((r) => stageIdx(r.status) >= stageIdx("Certified"));
    return [
      {t: "kpis", items: [
        {label: "July claims", value: L.eur(julyTotal(c)), sub: rows.length + " projects", hero: true},
        {label: "CastlePark Manor", value: L.eur(c.d.castleClaim), sub: st, tone: "accent", go: () => c.openProject("castlepark", "claims")},
        {label: "Awaiting approval", value: String(awaitingApproval(c).length), sub: L.eur(L.sum(awaitingApproval(c), (r) => r.amount))},
        {label: "Certified or later", value: L.eurK(L.sum(certified, (r) => r.amount)), sub: certified.length + " claims", tone: "ok"},
        {label: "Still in draft", value: String(drafts(c).length), sub: L.eur(L.sum(drafts(c), (r) => r.amount)), tone: "warn"}
      ]},
      {t: "custom", name: "claimBuilder", props: {projectId: "castlepark"}},
      {t: "section", title: "CastlePark claim stage, with July portfolio counts"},
      {t: "steps", items: stages.map((g, i) => ({label: g.stage, sub: g.count + (g.count === 1 ? " claim, " : " claims, ") + L.eurK(g.value),
        state: i < ci ? "done" : i === ci ? "now" : "todo"}))},
      {t: "table", title: "July claims register", sub: "Click a project to open its claim",
        cols: [{k: "proj", label: "Project", kind: "name"}, {k: "client", label: "Client"}, {k: "pm", label: "PM", kind: "person"},
          {k: "amt", label: "July claim", kind: "money"}, {k: "pct", label: "Complete", kind: "bar"}, {k: "stage", label: "Stage", kind: "status"}],
        rows: rows.slice().sort((a, b) => b.amount - a.amount).map((r) => ({
          proj: {v: r.p.name, sub: r.p.sector}, client: r.p.client, pm: r.p.pm, amt: L.eur(r.amount), pct: r.p.complete, stage: r.status,
          _hl: r.p.id === "castlepark", _go: () => c.openProject(r.p.id, "claims")})),
        foot: {proj: "Total, " + rows.length + " claims", amt: L.eur(julyTotal(c))}}
    ];
  }
};

const invoices = {
  id: "invoices", label: "Invoices", title: "Invoice register",
  sub: "Invoices are raised in Pulse from approved claims and posted to Xero. Payment status comes back from Xero.",
  build: (c) => {
    const inv = L.INVOICES;
    const paid = inv.filter((i) => i.status === "Paid");
    const inXero = inv.filter((i) => invIssued(c, i));
    return [
      {t: "kpis", items: [
        {label: "Invoices this cycle", value: String(inv.length), sub: L.eur(L.sum(inv, (i) => i.amount)) + " total value", hero: true},
        {label: "Paid", value: L.eur(L.sum(paid, (i) => i.amount)), sub: paid.length + " invoices", tone: "ok"},
        {label: "Outstanding in Xero", value: L.eur(outstanding(c)), sub: openInvoices(c).length + " invoices", tone: "warn", go: () => c.go("Claims", "receivables")},
        {label: "In Xero", value: inXero.length + " of " + inv.length, sub: synced(c) ? "all synced" : "INV-1084 held as draft", tone: synced(c) ? "ok" : "warn"}
      ]},
      {t: "table", title: "Invoices", sub: "Pulse invoice number is the Xero invoice number",
        cols: [{k: "no", label: "Invoice", kind: "mono"}, {k: "client", label: "Client"}, {k: "proj", label: "Project", kind: "name"},
          {k: "amt", label: "Amount", kind: "money"}, {k: "due", label: "Due"}, {k: "st", label: "Status", kind: "status"}, {k: "x", label: "Xero", kind: "status"}],
        rows: inv.map((i) => ({no: i.no, client: i.client, proj: {v: projName(i.project), sub: i.note}, amt: L.eur(i.amount), due: i.due,
          st: i.status, x: xeroCell(c, i), _hl: i.no === "INV-1084", _go: () => c.openProject(i.project, "claims")})),
        foot: {no: inv.length + " invoices", amt: L.eur(L.sum(inv, (i) => i.amount)), st: L.eur(outstanding(c)) + " open"}},
      {t: "split", ratio: "1fr 1fr",
        left: [syncLine(c), xeroTable(c)],
        right: [{t: "alerts", items: [synced(c)
          ? {tone: "ok", title: "INV-1084 is live in Xero. ", body: "Kellett Construction, " + L.eur(L.CASTLE_CLAIM) + ", due 28 Aug. When the payment lands in Xero it comes back here and closes the claim.",
            action: {label: "Open CastlePark", run: () => c.openProject("castlepark", "claims")}}
          : {tone: "warn", title: "INV-1084 is a draft. ", body: "It posts to Xero once the CastlePark July claim is approved and the invoice is generated in the Claim Builder.",
            action: {label: "Review claim", primary: true, run: () => c.openProject("castlepark", "claims")}}]},
          {t: "note", title: "Reconciles with Overview.", text: "Open invoices in Xero total " + L.eur(outstanding(c)) + ", the same Outstanding figure on Overview and Receivables. Invoiced to date across all projects is " + L.eur(invoicedToDate(c)) + "."}]}
    ];
  }
};

const receivables = {
  id: "receivables", label: "Receivables", title: "Receivables",
  sub: "Who owes what, how old it is and what Xero says. Balances update both ways.",
  build: (c) => {
    const inv = L.INVOICES;
    const open = openInvoices(c);
    const od = overdue();
    const current = open.filter((i) => !/overdue/i.test(i.status));
    const clients = Array.from(new Set(inv.map((i) => i.client))).map((cl) => {
      const mine = inv.filter((i) => i.client === cl);
      const bal = L.sum(mine.filter((i) => i.status !== "Paid" && invIssued(c, i)), (i) => i.amount);
      const odv = L.sum(mine.filter((i) => /overdue/i.test(i.status)), (i) => i.amount);
      return {cl, bal, odv, n: mine.length, paid: L.sum(mine.filter((i) => i.status === "Paid"), (i) => i.amount)};
    }).sort((a, b) => b.bal - a.bal);
    /* the three story rows first, then the rest of the register */
    const lead = ["INV-1084", "INV-1072", "INV-1061"];
    const ordered = lead.map((n) => inv.find((i) => i.no === n)).concat(inv.filter((i) => lead.indexOf(i.no) < 0));
    return [
      {t: "kpis", items: [
        {label: "Outstanding", value: L.eur(outstanding(c)), sub: open.length + " open invoices", hero: true},
        {label: "Overdue", value: L.eur(L.sum(od, (i) => i.amount)), sub: od.length + " invoice, INV-1072", tone: "bad"},
        {label: "Collected today", value: L.eur(82440), sub: "Apex Fit-Out, via Xero " + LOCAL.lastSync, tone: "ok"},
        {label: "Cash collected YTD", value: L.eurK(L.CASH_YTD), sub: "Jan to Jul"}
      ]},
      {t: "alerts", items: [{tone: "bad", title: "Finance Agent: Kimmage INV-1072 is 12 days overdue. ",
        body: "Northbank Developments owes " + L.eur(73210) + " on the June claim, due 12 Aug. They have acknowledged it and expect a payment run Friday.",
        action: {label: "Chase INV-1072", primary: true, run: () => c.ask("Chase INV-1072 for Northbank Developments")},
        action2: {label: "Open Kimmage", run: () => c.openProject("kimmage", "claims")}}]},
      {t: "table", title: "Receivables", sub: "Status and balances come from Xero",
        cols: [{k: "client", label: "Customer", kind: "name"}, {k: "no", label: "Invoice", kind: "mono"}, {k: "proj", label: "Project"},
          {k: "amt", label: "Amount", kind: "money"}, {k: "due", label: "Due"}, {k: "st", label: "Status", kind: "status"}, {k: "x", label: "Xero", kind: "status"}],
        rows: ordered.map((i) => ({client: {v: i.client, sub: i.note}, no: i.no, proj: projName(i.project), amt: L.eur(i.amount), due: i.due,
          st: i.status, x: xeroCell(c, i), _hl: i.no === "INV-1072", _go: () => c.openProject(i.project, "claims")})),
        foot: {client: "Outstanding", amt: L.eur(outstanding(c))}},
      {t: "split", ratio: "1fr 1fr",
        left: [{t: "bars", title: "Ageing", sub: "Open invoices in Xero by days overdue", max: Math.max(1, L.sum(current, (i) => i.amount), L.sum(od, (i) => i.amount)), items: [
          {label: "Current", value: L.sum(current, (i) => i.amount), display: L.eur(L.sum(current, (i) => i.amount)), sub: current.length + " invoices, not yet due", tone: "ok"},
          {label: "1 to 30 days", value: L.sum(od, (i) => i.amount), display: L.eur(L.sum(od, (i) => i.amount)), sub: "INV-1072, Northbank Developments", tone: "bad"},
          {label: "31 to 60 days", value: 0, display: L.eur(0)},
          {label: "Over 60 days", value: 0, display: L.eur(0)}]},
          syncLine(c)],
        right: [{t: "table", title: "Customer balances", sub: "Grouped by customer, matches Xero contacts",
          cols: [{k: "cl", label: "Customer"}, {k: "n", label: "Invoices", align: "r"}, {k: "paid", label: "Paid this cycle", kind: "money"}, {k: "bal", label: "Balance", kind: "money"}],
          rows: clients.map((x) => ({cl: x.cl, n: String(x.n), paid: L.eur(x.paid),
            bal: x.odv ? {v: L.eur(x.bal), tone: "bad", sub: L.eur(x.odv) + " overdue"} : L.eur(x.bal)})),
          foot: {cl: "Total", paid: L.eur(L.sum(clients, (x) => x.paid)), bal: L.eur(L.sum(clients, (x) => x.bal))}}]}
    ];
  }
};

const margins = {
  id: "margins", label: "Project Margins", title: "Project margins",
  sub: "Forecast margin per project, using cost from LiveCosts and value from the claim. Read it against the sector band, not one company target.",
  build: (c) => {
    const ps = L.PROJECTS.slice().sort((a, b) => b.margin - a.margin);
    const secs = sectorStats();
    return [
      {t: "kpis", items: secs.map((s) => ({label: s.sector, value: L.pct(s.margin), sub: "band " + s.band[0] + " to " + s.band[1] + "%, " + L.eurK(s.contract),
        tone: inBand(s.margin, s.band) ? "ok" : s.margin < s.band[0] ? "warn" : "accent"})).concat([
        {label: "Portfolio", value: L.pct(L.TOTALS.margin), sub: "weighted by contract, " + L.eurK(L.TOTALS.contract), hero: true}])},
      {t: "table", title: "Margin by project", sub: "Sorted by forecast margin. Click to open the project",
        cols: [{k: "proj", label: "Project", kind: "name"}, {k: "type", label: "Type"}, {k: "contract", label: "Contract", kind: "money"},
          {k: "complete", label: "Complete", kind: "bar"}, {k: "cost", label: "Cost to date", kind: "money"}, {k: "claimed", label: "Claimed", kind: "money"},
          {k: "margin", label: "Forecast margin", kind: "pct"}, {k: "band", label: "Sector band", kind: "status"}, {k: "health", label: "Health", kind: "status"}],
        rows: ps.map((p) => {
          const band = LOCAL.bands[p.sector];
          return {proj: {v: p.name, sub: p.pm}, type: p.sector, contract: L.eur(p.contract), complete: p.complete, cost: L.eur(p.cost), claimed: L.eur(p.claimed),
            margin: +p.margin.toFixed(1),
            band: p.margin < band[0] ? {v: "Below band", tone: "warn"} : p.margin > band[1] ? {v: "Above band", tone: "ok"} : {v: "In band", tone: "ok"},
            health: p.health, _hl: p.id === "castlepark", _go: () => c.openProject(p.id)};
        }),
        foot: {proj: L.PROJECTS.length + " projects", contract: L.eur(L.TOTALS.contract), cost: L.eur(L.TOTALS.cost), claimed: L.eur(L.TOTALS.claimed), margin: L.pct(L.TOTALS.margin)}},
      {t: "split", ratio: "3fr 2fr",
        left: [{t: "bars", title: "Forecast margin by project", sub: "Amber falls below its sector band", max: 30, items: ps.map((p) => ({
          label: p.short, value: p.margin, display: L.pct(p.margin), tone: p.margin < LOCAL.bands[p.sector][0] ? "warn" : undefined,
          sub: p.sector + ", band " + LOCAL.bands[p.sector].join(" to ") + "%"}))}],
        right: [{t: "note", title: "Expected margin bands.", text: "Offices and commercial fit-out run higher, large residential runs lower because the packages are competitive and long. Small works carries the highest margin on the smallest value. Bands: " +
            secs.map((s) => s.sector + " " + s.band[0] + " to " + s.band[1] + "%").join(", ") + "."},
          {t: "table", title: "Sector weighted margin", sub: "Forecast gross profit over contract value",
            cols: [{k: "s", label: "Sector"}, {k: "n", label: "Projects", align: "r"}, {k: "gp", label: "Forecast GP", kind: "money"}, {k: "m", label: "Margin", kind: "pct"}],
            rows: secs.map((s) => ({s: s.sector, n: String(s.count), gp: L.eur(s.gp), m: +s.margin.toFixed(1)})),
            foot: {s: "Portfolio", n: String(L.PROJECTS.length), gp: L.eur(L.TOTALS.forecastGP), m: L.pct(L.TOTALS.margin)}}]}
    ];
  }
};

const forecast = {
  id: "forecast", label: "Forecast", title: "Forecast",
  sub: "Forecast final cost, profit and cash for the next three months. Built from live cost, open claims and open invoices.",
  build: (c) => {
    const secs = sectorStats();
    const toComplete = L.TOTALS.forecastCost - L.TOTALS.cost;
    const openCommit = L.TOTALS.committed - L.TOTALS.cost;
    /* cash forecast: Aug = every open invoice incl. INV-1084, Sep = the rest of the July
       claims invoiced in August on 30 days, Oct = forecast August claim on 30 days */
    const aug = L.OUTSTANDING(true);
    const sepRows = L.PROJECTS.filter((p) => p.id !== "castlepark" && p.july.status !== "Paid");
    const sep = L.sum(sepRows, (p) => p.july.amount);
    const oct = LOCAL.augClaimForecast;
    const ring = L.RINGSEND_LABOUR;
    const clonExposure = Math.round(LOCAL.clonskeaghFinalFix * 0.034);
    return [
      {t: "kpis", items: [
        {label: "Forecast final cost", value: L.eurK(L.TOTALS.forecastCost), sub: L.eurK(toComplete) + " still to spend", hero: true},
        {label: "Forecast gross profit", value: L.eurK(L.TOTALS.forecastGP), sub: "on " + L.eurK(L.TOTALS.contract) + " contracts", tone: "ok"},
        {label: "Forecast margin", value: L.pct(L.TOTALS.margin), sub: "weighted by contract"},
        {label: "Open commitments", value: L.eurK(openCommit), sub: "POs placed, not yet costed"},
        {label: "Cash forecast, 3 months", value: L.eurK(aug + sep + oct), sub: "Aug to Oct, forecast", tone: "accent"}
      ]},
      {t: "split", ratio: "1fr 1fr",
        left: [{t: "cols", title: "Expected receipts, forecast", sub: "Euro, by month received", data: [["Aug", aug, L.eurK(aug)], ["Sep", sep, L.eurK(sep)], ["Oct", oct, L.eurK(oct)]]},
          {t: "table", title: "Where the cash comes from", sub: "Forecast, assumes 30 day terms",
            cols: [{k: "m", label: "Month"}, {k: "v", label: "Receipts", kind: "money"}, {k: "src", label: "Made up of", wrap: true}, {k: "conf", label: "Confidence", kind: "status"}],
            rows: [
              {m: "August", v: L.eur(aug), src: "All open invoices, including INV-1084 " + L.eur(L.CASTLE_CLAIM) + " and overdue INV-1072 " + L.eur(73210), conf: {v: "High", tone: "ok"}},
              {m: "September", v: L.eur(sep), src: "The other " + sepRows.length + " July claims, invoiced in August", conf: {v: "Medium", tone: "warn"}},
              {m: "October", v: L.eur(oct), src: "August claim, forecast from the claim trend", conf: {v: "Forecast", tone: "accent"}}],
            foot: {m: "Total", v: L.eur(aug + sep + oct)}}],
        right: [{t: "bars", title: "Forecast margin by sector", sub: "Weighted by contract value", max: 30, items: secs.map((s) => ({
            label: s.sector, value: s.margin, display: L.pct(s.margin), sub: L.eurK(s.forecastCost) + " forecast cost, " + L.eurK(s.gp) + " profit",
            tone: inBand(s.margin, s.band) ? "ok" : "warn"}))},
          {t: "table", title: "Forecast cost by sector",
            cols: [{k: "s", label: "Sector"}, {k: "c", label: "Contract", kind: "money"}, {k: "f", label: "Final cost", kind: "money"}, {k: "g", label: "Profit", kind: "money"}],
            rows: secs.map((s) => ({s: s.sector, c: L.eur(s.contract), f: L.eur(s.forecastCost), g: L.eur(s.gp)})),
            foot: {s: "Total", c: L.eur(L.TOTALS.contract), f: L.eur(L.TOTALS.forecastCost), g: L.eur(L.TOTALS.forecastGP)}}]},
      {t: "table", title: "Forecast risks", sub: "Items that could move margin or cash. Click to open the project",
        cols: [{k: "r", label: "Risk", kind: "name"}, {k: "p", label: "Project"}, {k: "e", label: "Exposure", kind: "money"}, {k: "i", label: "Effect", wrap: true}, {k: "o", label: "Owner", kind: "person"}, {k: "go", label: ""}],
        rows: [
          {r: {v: "Labour above allowance", sub: "Switch room rework"}, p: "Ringsend Upgrade", e: {v: "+" + L.eur(ring.variance), tone: "bad"},
            i: "Labour " + L.eur(ring.actual) + " against " + L.eur(ring.allowance) + ". Margin holds at " + L.pct(L.PROJECT("ringsend").margin) + " if rework stops this month.",
            o: L.PROJECT("ringsend").pm, go: {btn: "Open", run: () => c.openProject("ringsend")}, _go: () => c.openProject("ringsend")},
          {r: {v: "INV-1072 overdue 12 days", sub: "Northbank Developments"}, p: "Kimmage Phase II", e: {v: L.eur(73210), tone: "bad"},
            i: "Cash, not margin. August receipts drop by this amount if Friday's payment run slips.",
            o: "Emma Doyle", go: {btn: "Chase", run: () => c.ask("Chase INV-1072 for Northbank Developments")}, _go: () => c.openProject("kimmage", "claims")},
          {r: {v: "Cost creep on final fix", sub: "Devices 3.4% above allowance"}, p: "Clonskeagh Medical Centre", e: {v: L.eur(clonExposure), tone: "warn"},
            i: "Forecast margin " + L.pct(L.PROJECT("clonskeagh").margin) + ", still inside the commercial band. Watching.",
            o: L.PROJECT("clonskeagh").pm, go: {btn: "Open", run: () => c.openProject("clonskeagh")}, _go: () => c.openProject("clonskeagh")},
          {r: {v: "Block B containment behind", sub: "Late access to level 2"}, p: "CastlePark Manor", e: {v: "Programme", tone: "warn"},
            i: L.PROJECT("castlepark").complete + "% complete against " + L.PROJECT("castlepark").programme + "% programme. Two gangs moved to Block A.",
            o: L.PROJECT("castlepark").pm, go: {btn: "Open", run: () => c.openProject("castlepark")}, _go: () => c.openProject("castlepark")}
        ]}
    ];
  }
};

export default {id: "Claims", tabs: [overview, claims, invoices, receivables, margins, forecast]};
