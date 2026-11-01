import * as L from "../lavelle";

/* Estimating: opportunities, Countfire take-offs, the Pulse estimate, quotes and results.
   Countfire stays the take-off tool. Pulse imports its quantities, prices the packages,
   issues the quote and carries the package structure into Projects and Claims. */

const OPPS = L.OPPS;
const OPP = (id) => OPPS.find((o) => o.id === id);
const SANDY = OPP(L.COUNTFIRE.opp);

/* Quotes due this week are the opportunities with a plain weekday due date (Mon to Fri). */
const THIS_WEEK = /^(Mon|Tue|Wed|Thu|Fri)$/;
const DUE_WEEK = OPPS.filter((o) => THIS_WEEK.test(o.due));
const OPEN_VALUE = L.sum(OPPS, (o) => o.value);

const STAGES = ["Qualifying", "Take-off", "Estimating", "Quote Issued"];
const BY_STAGE = STAGES.map((st) => {
  const list = OPPS.filter((o) => o.stage === st);
  return {stage: st, count: list.length, value: L.sum(list, (o) => o.value)};
});
const ESTIMATORS = ["Daniel Walsh", "Sarah Keane"].map((n) => {
  const list = OPPS.filter((o) => o.est === n);
  return {name: n, count: list.length, value: L.sum(list, (o) => o.value), due: list.filter((o) => THIS_WEEK.test(o.due)).length};
});

/* Sandyford estimate: package values from the Countfire take-off, balanced to the opportunity value. */
const PKG_TOTAL = L.sum(L.SANDYFORD_PACKAGES, (k) => k.value);
const PRELIMS = SANDY.value - PKG_TOTAL;

/* Countfire take-off register (mock). Sandyford comes from L.COUNTFIRE; the others imported earlier. */
const sandyQty = L.SANDYFORD_PACKAGES.slice(0, 4).map((k) => k.qty + " " + k.name.toLowerCase()).join(", ");
const TAKEOFFS = [
  {opp: "o3", file: L.COUNTFIRE.file, qty: sandyQty, when: "Today " + L.COUNTFIRE.updated, by: L.COUNTFIRE.estimator, status: "Imported", tone: "ok", sheets: 46},
  {opp: "o1", file: "Data Centre Electrical Package.cf", qty: "6,820 m containment, 2,960 fittings, 214 boards", when: "Yesterday 16:20", by: "Daniel Walsh", status: "Imported", tone: "ok", sheets: 88},
  {opp: "o7", file: "Swords Pharma Cleanroom.cf", qty: "1,140 m containment, 486 fittings, 620 points", when: "Yesterday 11:05", by: "Daniel Walsh", status: "Imported", tone: "ok", sheets: 22},
  {opp: "o10", file: "Cherrywood School Extension.cf", qty: "880 m containment, 412 fittings, 540 points", when: "Mon 14:30", by: "Daniel Walsh", status: "Imported", tone: "ok", sheets: 18},
  {opp: "o4", file: "Citywest Warehouse Fit-out.cf", qty: "1,960 m containment, 744 fittings, ground floor only", when: "Fri 15:10", by: "Sarah Keane", status: "Partial, 1 of 2 floors", tone: "warn", sheets: 14},
  {opp: "o6", file: "Lucan Housing Phase I.cf", qty: "48 of 96 units counted, 2,304 points", when: "Thu 09:40", by: "Daniel Walsh", status: "Partial, 48 of 96 units", tone: "warn", sheets: 31}
];

/* Quote register (mock numbers, issue and expiry dates). Drafts are the four due this week. */
const QUOTES = [
  {q: "Q-2614", opp: "o3", status: "Draft", expiry: "Due Wed", owner: "Daniel Walsh"},
  {q: "Q-2613", opp: "o7", status: "Draft", expiry: "Due Thu", owner: "Daniel Walsh"},
  {q: "Q-2611", opp: "o1", status: "Draft", expiry: "Due Fri", owner: "Daniel Walsh"},
  {q: "Q-2612", opp: "o10", status: "Draft", expiry: "Due Fri", owner: "Daniel Walsh"},
  {q: "Q-2608", opp: "o2", status: "Under review", expiry: "Valid 30 days, issued Mon", owner: "Sarah Keane"},
  {q: "Q-2605", opp: "o5", status: "Issued", expiry: "Valid 30 days, issued last Thu", owner: "Sarah Keane"},
  {q: "Q-2603", opp: "o8", status: "Under review", expiry: "Valid 30 days, issued last Tue", owner: "Sarah Keane"},
  {q: "Q-2604", opp: "o11", status: "Issued", expiry: "Valid 30 days, issued last Fri", owner: "Daniel Walsh"}
];
const QUOTE_TONE = {Draft: "warn", "Quote generated": "ok", Issued: "accent", "Under review": "warn", Accepted: "ok"};

/* Tender results over the last 30 days. L.WON_LOST holds the six larger decisions; the
   smaller decisions below complete the 30-day tally (mock) so the 31% win rate reconciles. */
const SMALL_RESULTS = [
  {name: "Clontarf Townhouses, 6 units", client: "Kellett Construction", value: 94000, result: "Won", date: "Last week", reason: "Programme"},
  {name: "Rathfarnham Dental Practice", client: "Apex Fit-Out", value: 68000, result: "Lost", date: "Last Wed", reason: "Price"},
  {name: "Naas Industrial Unit 7", client: "Eastpoint Engineering", value: 112000, result: "Lost", date: "Last week", reason: "Price, 6.1% above winner"},
  {name: "Mullingar Retail Unit", client: "Harbour Developments", value: 57000, result: "Lost", date: "2 weeks ago", reason: "Client used framework contractor"},
  {name: "Bray Seafront Cafe Fit-out", client: "Apex Fit-Out", value: 46000, result: "Lost", date: "2 weeks ago", reason: "Price"},
  {name: "Kilcock Creche", client: "Northbank Developments", value: 138000, result: "Lost", date: "3 weeks ago", reason: "Start date clash"},
  {name: "Drogheda Warehouse Lighting", client: "Eastpoint Engineering", value: 151000, result: "Lost", date: "4 weeks ago", reason: "Price"}
];
const RESULTS = L.WON_LOST.concat(SMALL_RESULTS);
const WON = RESULTS.filter((r) => r.result === "Won");
const WIN_RATE = Math.round(WON.length / RESULTS.length * 100);
const WON_VALUE = L.sum(WON, (r) => r.value);
const DECIDED_VALUE = L.sum(RESULTS, (r) => r.value);
/* Monthly win rate history (mock), the current month is the live 30-day figure. */
const WIN_HISTORY = [27, 34, 29, 24, 36];
const TURNAROUND = 6.4; /* average working days, tenders over €250k, last 90 days (mock) */

const sectorOf = (s) => s.estSector || "All";
const toEst = (c) => () => c.go("Estimating", "estimates");
const toTakeoffs = (c) => () => c.go("Estimating", "takeoffs");

const pipelineSteps = (s) => {
  const quoted = !!(s.quoteDone || {})[SANDY.id];
  const converted = !!(s.converted || {})[SANDY.id];
  return {t: "steps", items: [
    {label: "Countfire", sub: "Take-off imported " + L.COUNTFIRE.updated, state: "done"},
    {label: "Pulse Estimate", sub: quoted ? "Quote generated, " + L.eurK(SANDY.value) : "Packages priced, " + L.eurK(SANDY.value), state: quoted ? "done" : "now"},
    {label: "Project", sub: converted ? "Packages carried into Projects" : "On award, Convert to Project", state: converted ? "done" : quoted ? "now" : "todo"},
    {label: "Claim", sub: "Monthly valuation by package", state: converted ? "now" : "todo"}
  ]};
};

const oppRow = (c, o) => ({
  name: {v: o.name, sub: o.client}, client: o.client, sector: o.sector, value: L.eur(o.value), stage: o.stage,
  due: THIS_WEEK.test(o.due) ? {v: o.due, tone: "warn", sub: "This week"} : o.due, est: o.est,
  _hl: o.id === SANDY.id, _go: o.id === SANDY.id ? toEst(c) : undefined
});

export default {
  id: "Estimating",
  tabs: [
    {
      id: "overview", label: "Overview", title: "Estimating",
      sub: "Pipeline, quotes due and results for Daniel Walsh and Sarah Keane. Take-offs come from Countfire.",
      build: (c) => [
        {t: "kpis", cols: 5, items: [
          {label: "Open opportunities", value: L.num(OPPS.length), sub: ESTIMATORS.map((e) => e.name.split(" ")[0] + " " + e.count).join(", "), go: () => c.go("Estimating", "opportunities")},
          {label: "Open tender value", value: L.eurK(OPEN_VALUE), sub: "Across " + OPPS.length + " opportunities", hero: true, tone: "accent"},
          {label: "Quotes due this week", value: L.num(DUE_WEEK.length), sub: L.eurK(L.sum(DUE_WEEK, (o) => o.value)) + " to price", tone: "warn", go: () => c.go("Estimating", "quotes")},
          {label: "30-day win rate", value: L.pct(WIN_RATE, 0), sub: WON.length + " won of " + RESULTS.length + " decided", go: () => c.go("Estimating", "wonlost")},
          {label: "Large tender turnaround", value: TURNAROUND + " days", sub: "Average, tenders over €250k"}
        ]},
        pipelineSteps(c.s),
        {t: "split", ratio: "3fr 2fr", left: [
          {t: "table", title: "Due this week", sub: "Four quotes to issue, all priced from Countfire take-offs",
            action: {label: "All quotes", run: () => c.go("Estimating", "quotes")},
            cols: [{k: "name", label: "Opportunity", kind: "name"}, {k: "value", label: "Value", kind: "money"}, {k: "due", label: "Due"}, {k: "stage", label: "Stage", kind: "status"}, {k: "est", label: "Estimator", kind: "person"}],
            rows: DUE_WEEK.map((o) => ({name: {v: o.name, sub: o.client}, value: L.eur(o.value), due: o.due, stage: o.stage, est: o.est, _hl: o.id === SANDY.id, _go: o.id === SANDY.id ? toEst(c) : undefined})),
            foot: {name: DUE_WEEK.length + " quotes", value: L.eur(L.sum(DUE_WEEK, (o) => o.value))}}
        ], right: [
          {t: "bars", title: "Pipeline by stage", sub: L.eurK(OPEN_VALUE) + " open",
            items: BY_STAGE.map((b) => ({label: b.stage, value: b.value, display: L.eurK(b.value), sub: b.count + (b.count === 1 ? " opportunity" : " opportunities"), tone: b.stage === "Quote Issued" ? "ok" : b.stage === "Estimating" ? "accent" : undefined}))}
        ]},
        {t: "feed", title: "Latest", items: [
          {time: L.COUNTFIRE.updated, title: "Countfire import.", text: SANDY.name + " take-off imported by " + L.COUNTFIRE.estimator + ", " + L.SANDYFORD_PACKAGES.length + " packages updated.", tone: "accent", go: toEst(c)},
          {time: "Mon", title: "Quote issued.", text: OPP("o2").name + ", " + L.eurK(OPP("o2").value) + " to " + OPP("o2").client + ".", tone: "ok"},
          {time: L.WON_LOST[0].date, title: "Won.", text: L.WON_LOST[0].name + ", " + L.eurK(L.WON_LOST[0].value) + ". " + L.WON_LOST[0].reason + ".", tone: "ok"},
          {time: L.WON_LOST[1].date, title: "Lost.", text: L.WON_LOST[1].name + ", " + L.eurK(L.WON_LOST[1].value) + ". " + L.WON_LOST[1].reason + ".", tone: "bad"}
        ]}
      ]
    },
    {
      id: "opportunities", label: "Opportunities", title: "Opportunities",
      sub: "Every live tender from qualifying through to quote issued.",
      build: (c) => {
        const sec = sectorOf(c.s);
        const list = sec === "All" ? OPPS : OPPS.filter((o) => o.sector === sec);
        return [
          {t: "tabs", items: ["All"].concat(L.SECTORS.filter((x) => OPPS.some((o) => o.sector === x))).map((x) => ({
            label: x === "All" ? "All sectors" : x, on: sec === x, run: () => c.set({estSector: x})}))},
          {t: "kpis", cols: 4, items: [
            {label: sec === "All" ? "Opportunities" : sec + " opportunities", value: L.num(list.length), sub: "of " + OPPS.length + " open"},
            {label: "Value", value: L.eurK(L.sum(list, (o) => o.value)), sub: "of " + L.eurK(OPEN_VALUE) + " open", tone: "accent"},
            {label: "Due this week", value: L.num(list.filter((o) => THIS_WEEK.test(o.due)).length), sub: "Quotes to issue", tone: "warn"},
            {label: "Quote issued", value: L.num(list.filter((o) => o.stage === "Quote Issued").length), sub: L.eurK(L.sum(list.filter((o) => o.stage === "Quote Issued"), (o) => o.value)) + " awaiting decision"}
          ]},
          {t: "table", title: "Opportunity register", sub: "Sorted by value. Sandyford opens the live estimate.",
            cols: [{k: "name", label: "Opportunity", kind: "name"}, {k: "sector", label: "Sector"}, {k: "value", label: "Value", kind: "money"},
              {k: "stage", label: "Stage", kind: "status"}, {k: "due", label: "Due"}, {k: "est", label: "Estimator", kind: "person"}],
            rows: list.map((o) => oppRow(c, o)),
            foot: {name: list.length + " opportunities", value: L.eur(L.sum(list, (o) => o.value))}},
          {t: "bars", title: "Estimator workload", sub: "Open value and quotes due this week",
            items: ESTIMATORS.map((e) => ({label: e.name, value: e.value, display: L.eurK(e.value), sub: e.count + " opportunities, " + e.due + " due this week"}))}
        ];
      }
    },
    {
      id: "estimates", label: "Estimates", title: SANDY.name,
      sub: "Estimate for " + SANDY.client + ", priced from the Countfire take-off. Estimator " + SANDY.est + ".",
      build: (c) => {
        const quoted = !!(c.s.quoteDone || {})[SANDY.id];
        const converted = !!(c.s.converted || {})[SANDY.id];
        const rows = L.SANDYFORD_PACKAGES.map((k) => ({pkg: k.name, src: "Countfire", qty: k.qty, value: L.eur(k.value), share: k.value / SANDY.value * 100}));
        if (PRELIMS !== 0) rows.push({pkg: "Preliminaries and margin", src: "Pulse", qty: "", value: L.eur(PRELIMS), share: PRELIMS / SANDY.value * 100});
        const status = converted
          ? {t: "alerts", items: [{tone: "ok", title: "Package structure carried into Projects. ",
              body: L.SANDYFORD_PACKAGES.length + " packages set up as the project budget and claim lines, " + L.eur(SANDY.value) + " contract value.",
              action: {label: "Open in Projects", primary: true, run: () => c.go("Projects", "portfolio")}}]}
          : quoted
            ? {t: "alerts", items: [{tone: "ok", title: "Quote generated. ",
                body: "Q-2614, " + L.eur(SANDY.value) + " to " + SANDY.client + ". On award, convert it and the package structure becomes the project budget.",
                action: {label: "Convert to Project", primary: true, run: () => c.mark("converted", SANDY.id)}}]}
            : {t: "actions", items: [
                {label: "Generate Quote", primary: true, run: () => c.mark("quoteDone", SANDY.id)},
                {label: "Ask Pulse to check the estimate", ghost: true, run: () => c.ask("Check the Sandyford Office Campus estimate against similar commercial jobs")}
              ]};
        return [
          {t: "alerts", items: [{tone: "accent", title: "Take-off imported from Countfire. ",
            body: "Updated " + L.COUNTFIRE.updated + " by " + L.COUNTFIRE.estimator + ", file " + L.COUNTFIRE.file + ". Quantities are read only in Pulse; re-measure in Countfire and they re-import.",
            action2: {label: "Take-off register", run: toTakeoffs(c)}}]},
          {t: "kpis", cols: 4, items: [
            {label: "Estimate value", value: L.eur(SANDY.value), sub: "Reconciles to the opportunity", hero: true, tone: "accent"},
            {label: "Packages", value: L.num(L.SANDYFORD_PACKAGES.length), sub: "From the Countfire take-off"},
            {label: "Quote due", value: SANDY.due, sub: quoted ? "Quote generated" : "Not yet issued", tone: quoted ? "ok" : "warn"},
            {label: "Status", value: converted ? "Converted" : quoted ? "Quote generated" : "Priced", sub: converted ? "Live in Projects" : "Estimator " + SANDY.est, tone: quoted ? "ok" : undefined}
          ]},
          pipelineSteps(c.s),
          {t: "table", title: "Package breakdown", sub: "Quantities from Countfire, rates and values in Pulse",
            cols: [{k: "pkg", label: "Package", kind: "name"}, {k: "src", label: "Source"}, {k: "qty", label: "Take-off quantity", align: "r"}, {k: "value", label: "Value", kind: "money"}, {k: "share", label: "Share", kind: "bar"}],
            rows,
            foot: {pkg: "Total", qty: PRELIMS === 0 ? "Preliminaries and margin in rates" : "", value: L.eur(L.sum(L.SANDYFORD_PACKAGES, (k) => k.value) + PRELIMS)}},
          status
        ];
      }
    },
    {
      id: "takeoffs", label: "Take-offs", title: "Take-offs",
      sub: "Drawing take-offs are measured in Countfire and imported into the Pulse estimate.",
      build: (c) => [
        {t: "sync", text: "Countfire estimate import, connected, healthy. Last import " + L.COUNTFIRE.updated + " today, " + L.COUNTFIRE.file + "."},
        {t: "kpis", cols: 4, items: [
          {label: "Take-offs imported", value: L.num(TAKEOFFS.length), sub: "From Countfire, live opportunities"},
          {label: "Complete", value: L.num(TAKEOFFS.filter((x) => x.tone === "ok").length), sub: "Ready to price", tone: "ok"},
          {label: "Partial", value: L.num(TAKEOFFS.filter((x) => x.tone === "warn").length), sub: "Counting continues in Countfire", tone: "warn"},
          {label: "Drawing sheets", value: L.num(L.sum(TAKEOFFS, (x) => x.sheets)), sub: "Measured across all imports"}
        ]},
        {t: "table", title: "Countfire take-off register", sub: "All quantities imported from Countfire",
          cols: [{k: "name", label: "Opportunity", kind: "name"}, {k: "file", label: "Countfire file", kind: "mono"}, {k: "qty", label: "Quantity summary", wrap: true},
            {k: "when", label: "Imported"}, {k: "by", label: "By", kind: "person"}, {k: "status", label: "Status", kind: "status"}],
          rows: TAKEOFFS.map((x) => {
            const o = OPP(x.opp);
            return {name: {v: o.name, sub: L.eurK(o.value) + ", " + o.stage}, file: x.file, qty: x.qty, when: x.when, by: x.by,
              status: {v: x.status, tone: x.tone}, _hl: x.opp === SANDY.id, _go: x.opp === SANDY.id ? toEst(c) : undefined};
          })},
        {t: "note", title: "How it fits.", text: "Countfire stays the take-off tool. Pulse reads its quantities into the estimate packages, so the quote, the project budget and the monthly claim all share the same structure."}
      ]
    },
    {
      id: "quotes", label: "Quotes", title: "Quotes",
      sub: "Drafts due this week and issued quotes awaiting a client decision.",
      build: (c) => {
        const quoted = !!(c.s.quoteDone || {})[SANDY.id];
        const rows = QUOTES.map((q) => {
          const o = OPP(q.opp);
          const st = q.opp === SANDY.id && quoted ? "Quote generated" : q.status;
          const dueWeek = THIS_WEEK.test(o.due);
          return {q: q.q, name: {v: o.name, sub: o.client}, value: L.eur(o.value), status: {v: st, tone: QUOTE_TONE[st]},
            week: dueWeek ? {v: "Due " + o.due, tone: "warn"} : "", expiry: q.expiry, owner: q.owner,
            _hl: dueWeek, _go: q.opp === SANDY.id ? toEst(c) : undefined};
        });
        const issued = QUOTES.filter((q) => q.status !== "Draft");
        return [
          {t: "kpis", cols: 4, items: [
            {label: "Quotes due this week", value: L.num(DUE_WEEK.length), sub: L.eurK(L.sum(DUE_WEEK, (o) => o.value)) + " in drafts", tone: "warn"},
            {label: "Issued, awaiting decision", value: L.num(issued.length), sub: L.eurK(L.sum(issued, (q) => OPP(q.opp).value)) + " with clients", tone: "accent"},
            {label: "Under review", value: L.num(QUOTES.filter((q) => q.status === "Under review").length), sub: "Client clarifications open"},
            {label: "Accepted, last 30 days", value: L.num(WON.length), sub: L.eurK(WON_VALUE) + " won"}
          ]},
          {t: "table", title: "Quote register", sub: "Highlighted rows are the " + DUE_WEEK.length + " quotes due this week",
            cols: [{k: "q", label: "Quote", kind: "mono"}, {k: "name", label: "Opportunity", kind: "name"}, {k: "value", label: "Value", kind: "money"},
              {k: "status", label: "Status", kind: "status"}, {k: "week", label: "This week"}, {k: "expiry", label: "Due or validity", wrap: true}, {k: "owner", label: "Owner", kind: "person"}],
            rows,
            foot: {q: QUOTES.length + " quotes", value: L.eur(L.sum(QUOTES, (q) => OPP(q.opp).value)), week: DUE_WEEK.length + " due"}},
          {t: "table", title: "Accepted", sub: "Won in the last 30 days, ready to convert into projects",
            cols: [{k: "name", label: "Job", kind: "name"}, {k: "value", label: "Value", kind: "money"}, {k: "status", label: "Status", kind: "status"}, {k: "date", label: "Decided"}, {k: "reason", label: "Why we won", wrap: true}],
            rows: WON.map((r) => ({name: {v: r.name, sub: r.client}, value: L.eur(r.value), status: {v: "Accepted", tone: "ok"}, date: r.date, reason: r.reason})),
            foot: {name: WON.length + " accepted", value: L.eur(WON_VALUE)}}
        ];
      }
    },
    {
      id: "wonlost", label: "Won / Lost", title: "Won / Lost",
      sub: "Tender results over the last 30 days, with the reason recorded for each.",
      build: () => {
        const lost = RESULTS.filter((r) => r.result === "Lost");
        const priceLost = lost.filter((r) => /^Price/.test(r.reason));
        return [
          {t: "kpis", cols: 4, items: [
            {label: "30-day win rate", value: L.pct(WIN_RATE, 0), sub: WON.length + " won of " + RESULTS.length + " decided", hero: true, tone: "accent"},
            {label: "Won value", value: L.eurK(WON_VALUE), sub: L.pct(WON_VALUE / DECIDED_VALUE * 100) + " of value decided", tone: "ok"},
            {label: "Lost", value: L.num(lost.length), sub: L.eurK(L.sum(lost, (r) => r.value)) + " tendered", tone: "bad"},
            {label: "Lost on price", value: L.num(priceLost.length), sub: "of " + lost.length + " losses"}
          ]},
          {t: "split", ratio: "2fr 1fr", left: [
            {t: "table", title: "Results, last 30 days", sub: "Largest decisions first",
              cols: [{k: "name", label: "Tender", kind: "name"}, {k: "value", label: "Value", kind: "money"}, {k: "result", label: "Result", kind: "status"}, {k: "date", label: "Decided"}, {k: "reason", label: "Reason", wrap: true}],
              rows: RESULTS.slice().sort((a, b) => b.value - a.value).map((r) => ({name: {v: r.name, sub: r.client}, value: L.eur(r.value), result: r.result, date: r.date, reason: r.reason})),
              foot: {name: RESULTS.length + " decided", value: L.eur(DECIDED_VALUE), result: WON.length + " won"}}
          ], right: [
            {t: "cols", title: "Win rate by month", sub: "Share of tenders won, last bar is the live 30-day rate",
              data: L.MONTHS.slice(-WIN_HISTORY.length).map((m, i) => [m, WIN_HISTORY[i], WIN_HISTORY[i] + "%"]).concat([["30 days", WIN_RATE, WIN_RATE + "%"]])}
          ]},
          {t: "note", title: "Pattern.", text: priceLost.length + " of " + lost.length + " losses were on price. " + L.WON_LOST[1].name + " was lost at 4.2% above the winner, and " + L.WON_LOST[3].name + " was withdrawn on a resource clash."}
        ];
      }
    }
  ]
};
