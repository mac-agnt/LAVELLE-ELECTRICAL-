import * as L from "../lavelle";

const {eur, num} = L;

/* Fleet & Diesel: who bought fuel, in which vehicle, for which project, how much, when,
   and whether it is allocated. Anything without a project is "Needs allocation", never more. */

const D = L.DIESEL;
const money = (n) => (Math.round(n * 100) % 100 === 0 ? eur(n) : L.eur2(n));
const pname = (id) => L.PROJECT(id).name;
const pshort = (id) => L.PROJECT(id).short;

/* Card numbers: L.VEHICLES has 0081 and 0087 on two vans each. The fuel transactions
   are the record of which card is in which van, so they win; Conor Fahy's Ranger takes 0080. */
const TXN_CARD = Object.assign({}, ...L.FUEL_TXNS.map((t) => ({[t.reg]: t.card})));
const cardOf = (v) => TXN_CARD[v.reg] || (v.reg === "232-D-6021" ? "0080" : v.card);

/* Usual project for a driver: project foreman first, then today's site from Sync. */
const homeProject = (name) => {
  const f = L.PROJECTS.find((p) => p.foreman === name);
  if (f) return f.id;
  const e = L.ON_SITE.find((x) => x.name === name);
  return e ? e.project : null;
};
const usualSite = (name) => {
  if (name === "Yard spare") return "Yard";
  const id = homeProject(name);
  if (id) return pshort(id);
  const m = L.MGMT.find((x) => x.name === name);
  return m ? m.role + ", all sites" : "All sites";
};

/* km this month (invented), giving 0.09 to 0.14 euro per km. */
const KM = {"241-D-1842": 7840, "232-D-7710": 6920, "231-D-4455": 6370, "222-D-9082": 5680, "221-D-3320": 5240, "212-D-5517": 5100,
  "211-D-0198": 4710, "232-D-6021": 3990, "201-D-8814": 4180, "202-D-4417": 3740, "211-D-2299": 4240, "192-D-6630": 3060,
  "201-D-1507": 2750, "181-D-9923": 2240, "192-D-0471": 2610, "172-D-3340": 410, "171-D-7782": 260, "161-D-5509": 170};
const LIMIT = (make) => (/Kangoo|Berlingo|Connect/.test(make) ? 800 : /Ranger/.test(make) ? 1000 : 1200);

const allocOf = (c, t) => t.project || (c.s.fuelAlloc || {})[t.id] || null;
const UNALLOC_ALL = L.FUEL_TXNS.filter((t) => !t.project);
const F1 = L.FUEL_TXNS.find((t) => t.card === D.card && !t.project);
const f1Done = (c) => !!(c.s.fuelAlloc || {})[F1.id];

/* Diesel by project including anything allocated in the demo, so allocated + unallocated = 8,420. */
const dieselByProject = (c) => {
  const extra = {};
  UNALLOC_ALL.forEach((t) => { const p = allocOf(c, t); if (p) extra[p] = (extra[p] || 0) + t.amount; });
  return L.DIESEL_BY_PROJECT.map(([id, v]) => ({id, value: Math.round((v + (extra[id] || 0)) * 100) / 100, moved: extra[id] || 0}));
};

/* Monthly trend: Sep and Oct from L.DIESEL, Jun to Aug invented. */
const TREND = [["Jun", 7210], ["Jul", 7385], ["Aug", 7012], ["Sep", D.prev], ["Oct", D.total]];
/* October by week (invented, sums to L.DIESEL.total). */
const WEEKS = [["1 to 4 Oct", 1104], ["5 to 11", 1982], ["12 to 18", 2046], ["19 to 25", 2071], ["26 to 31", 1217]];
const OCT_TXNS = 214;

const deltaPct = (D.total - D.prev) / D.prev * 100;
const VEH = L.VEHICLES.slice().sort((a, b) => b.month - a.month);
const top = VEH[0];

const allocCell = (c, t) => {
  const p = allocOf(c, t);
  if (p) return t.project ? pname(p) : {v: pname(p), tone: "ok", sub: "Allocated in Pulse"};
  return {v: "Needs allocation", tone: "warn"};
};
const allocBtn = (c, t) => {
  if (allocOf(c, t)) return t.project ? "" : {v: "Done", tone: "ok"};
  const p = homeProject(t.who) || "castlepark";
  return {btn: "Allocate to " + pshort(p), primary: t.id === F1.id, run: () => c.mark("fuelAlloc", t.id, p)};
};

/* Non-money checks (neutral prompts to confirm). */
const CHECKS = [
  {title: "Vehicle 192-D-6630 refuelled twice in 24 hours. ", body: "Shane Cullen, Thu 16:31 and Fri 15:48 at Maxol Citywest. Confirm whether the second fill was for a generator or a second vehicle.", ask: "Ask Shane Cullen to confirm the second fill on 192-D-6630 on Friday"},
  {title: "Fuel card 0088 used outside project hours. ", body: "Gary Moran, Sat 09:30 at Topaz Naas Road. No weekend work is scheduled at Tallaght. Confirm the trip and the project.", ask: "Ask Gary Moran which project the Saturday fill on card 0088 belongs to"},
  {title: "Yard spare 172-D-3340 has no driver. ", body: "€48 of diesel this month with the card held at the yard. Assign a driver so future fills carry a name.", ask: "Who took yard spare 172-D-3340 out this month"}
];

/* ── tabs ───────────────────────────────────────────────────────────────── */
function overview(c) {
  const done = f1Done(c);
  const byProj = dieselByProject(c);
  const allocated = L.sum(byProj, (x) => x.value);
  return [
    {t: "kpis", cols: 3, items: [
      {label: "Vehicles", value: String(L.VEHICLES.length), sub: "15 assigned, 3 yard spares", go: () => c.go("Fleet", "vehicles")},
      {label: D.month + " diesel", value: eur(D.total), sub: OCT_TXNS + " transactions", hero: true},
      {label: "vs September", value: "+" + L.pct(deltaPct), sub: eur(D.prev) + " in September", tone: "warn"},
      {label: "Unallocated", value: money(c.d.unallocValue), sub: c.d.unallocFuel.length + " transactions need allocation", tone: c.d.unallocValue ? "warn" : "ok", go: () => c.go("Fleet", "exceptions")},
      {label: "Cost per active project", value: eur(D.perProject), sub: "Average across " + L.DIESEL_BY_PROJECT.length + " projects"},
      {label: "Highest vehicle", value: eur(top.month), sub: top.make + " " + top.reg + ", " + top.driver, go: () => c.go("Fleet", "vehicles")}
    ]},
    {t: "alerts", items: [done
      ? {tone: "ok", title: "Allocated to " + pname(f1Done(c) ? c.s.fuelAlloc[F1.id] : "castlepark") + ". ", body: "Fuel card " + D.card + ", " + L.eur2(D.exception) + " at " + D.place + " at " + D.time + " now sits in project cost. Unallocated is down to " + money(c.d.unallocValue) + "."}
      : {tone: "warn", title: "Needs allocation. ", body: "Fuel card " + D.card + " recorded " + L.eur2(D.exception) + " at " + D.place + " at " + D.time + ". No active project allocation exists.",
         action: {label: "Allocate to project", primary: true, run: () => c.mark("fuelAlloc", F1.id, "castlepark")}, action2: {label: "See all 5", run: () => c.go("Fleet", "exceptions")}}
    ]},
    {t: "grid", cols: 2, items: [
      {t: "bars", title: "Diesel by project, " + D.month, sub: "Allocated " + money(allocated) + " plus " + money(c.d.unallocValue) + " needing allocation = " + eur(D.total),
        items: [...byProj.map((x) => ({label: pshort(x.id), value: x.value, display: money(x.value), sub: x.moved ? "Includes " + money(x.moved) + " allocated today" : undefined})),
          {label: "Needs allocation", value: c.d.unallocValue, display: money(c.d.unallocValue), tone: "warn"}]},
      {t: "bars", title: "Top 8 vehicles, " + D.month, sub: "Spend by vehicle and driver",
        items: VEH.slice(0, 8).map((v) => ({label: v.make + " " + v.reg, value: v.month, display: eur(v.month), sub: v.driver}))}
    ]},
    {t: "cols", title: "Diesel by week, " + D.month, sub: eur(D.total) + " across " + WEEKS.length + " weeks", data: WEEKS.map((w) => [w[0], w[1], eur(w[1])]), on: 3}
  ];
}

function vehicles(c) {
  const rows = VEH.map((v) => ({
    v: {v: v.make, sub: v.reg}, reg: v.reg, driver: v.driver, site: usualSite(v.driver), card: cardOf(v),
    km: num(KM[v.reg]), cpk: L.eur2(v.month / KM[v.reg]), month: eur(v.month), _hl: v.reg === top.reg
  }));
  const kmTotal = L.sum(VEH, (v) => KM[v.reg]);
  return [
    {t: "kpis", items: [
      {label: "Vehicles", value: String(VEH.length), sub: VEH.filter((v) => v.driver !== "Yard spare").length + " with a named driver"},
      {label: D.month + " spend", value: eur(L.sum(VEH, (v) => v.month)), sub: "Matches fuel card statements"},
      {label: "Distance", value: num(kmTotal) + " km", sub: "From fuel card odometer entries"},
      {label: "Fleet cost per km", value: L.eur2(D.total / kmTotal), sub: "Range " + L.eur2(Math.min(...VEH.map((v) => v.month / KM[v.reg]))) + " to " + L.eur2(Math.max(...VEH.map((v) => v.month / KM[v.reg])))}
    ]},
    {t: "table", title: "All vehicles", sub: "Sorted by " + D.month + " diesel spend",
      cols: [{k: "v", label: "Vehicle", kind: "name"}, {k: "driver", label: "Driver", kind: "person"}, {k: "site", label: "Usual site"}, {k: "card", label: "Fuel card", kind: "mono"},
        {k: "km", label: "km", align: "r"}, {k: "cpk", label: "Cost per km", align: "r"}, {k: "month", label: D.month, kind: "money"}],
      rows, foot: {v: VEH.length + " vehicles", km: num(kmTotal), cpk: L.eur2(D.total / kmTotal), month: eur(L.sum(VEH, (v) => v.month))}},
    {t: "note", title: "Yard spares.", text: "172-D-3340, 171-D-7782 and 161-D-5509 sit at the yard and are booked out by the day. Together they used " + eur(L.sum(VEH.filter((v) => v.driver === "Yard spare"), (v) => v.month)) + " this month."}
  ];
}

function diesel(c) {
  const rows = L.FUEL_TXNS.map((t) => ({
    when: t.when, who: t.who, reg: t.reg, card: t.card, place: t.place, litres: t.litres.toFixed(1), amount: L.eur2(t.amount),
    project: allocCell(c, t), act: allocBtn(c, t), _hl: !allocOf(c, t)
  }));
  const open = c.d.unallocFuel.length;
  return [
    {t: "kpis", items: [
      {label: D.month + " transactions", value: String(OCT_TXNS), sub: eur(D.total) + " in total"},
      {label: "Latest 12", value: L.eur2(L.sum(L.FUEL_TXNS, (t) => t.amount)), sub: L.sum(L.FUEL_TXNS, (t) => t.litres).toFixed(1) + " litres"},
      {label: "Allocated", value: (OCT_TXNS - open) + " of " + OCT_TXNS, sub: "Matched to a project", tone: "ok"},
      {label: "Needs allocation", value: String(open), sub: money(c.d.unallocValue), tone: open ? "warn" : "ok"}
    ]},
    {t: "table", title: "Diesel transactions", sub: "Employee, vehicle, project, fuel card in one row",
      cols: [{k: "when", label: "When"}, {k: "who", label: "Who", kind: "person"}, {k: "reg", label: "Vehicle", kind: "mono"}, {k: "card", label: "Card", kind: "mono"},
        {k: "place", label: "Where"}, {k: "litres", label: "Litres", align: "r"}, {k: "amount", label: "Amount", kind: "money"}, {k: "project", label: "Project"}, {k: "act", label: ""}],
      rows, foot: {when: "12 shown", litres: L.sum(L.FUEL_TXNS, (t) => t.litres).toFixed(1), amount: L.eur2(L.sum(L.FUEL_TXNS, (t) => t.amount))}},
    {t: "note", text: "This is the latest 12 of " + OCT_TXNS + " " + D.month + " transactions. The fuel card feed brings in driver, vehicle and card, and the project comes from the driver's Sync site for that day. Where there is no Sync site, the line waits as Needs allocation."},
    {t: "sync", text: "Fuel card feed synced 07:00. Next sync tomorrow 07:00."}
  ];
}

function cards(c) {
  const openCards = {};
  c.d.unallocFuel.forEach((t) => { openCards[t.card] = (openCards[t.card] || 0) + t.amount; });
  const list = L.VEHICLES.map((v) => ({v, card: cardOf(v), limit: LIMIT(v.make)})).sort((a, b) => a.card.localeCompare(b.card));
  const rows = list.map((x) => {
    const open = openCards[x.card];
    return {
      card: x.card, holder: x.v.driver, veh: {v: x.v.make, sub: x.v.reg}, month: eur(x.v.month), limit: eur(x.limit),
      used: {v: x.v.month / x.limit * 100, tone: x.v.month / x.limit > 0.75 ? "warn" : undefined},
      status: open ? {v: "Needs allocation", tone: "warn", sub: money(open) + " open"} : "Active",
      _hl: x.card === D.card && !!open
    };
  });
  const flagged = Object.keys(openCards).length;
  return [
    {t: "kpis", items: [
      {label: "Fuel cards", value: String(list.length), sub: "One per vehicle"},
      {label: "Monthly limits", value: eur(L.sum(list, (x) => x.limit)), sub: eur(D.total) + " used in " + D.month},
      {label: "Cards with open items", value: String(flagged), sub: flagged ? "Card " + D.card + (openCards[D.card] ? " first" : " cleared") : "All allocated", tone: flagged ? "warn" : "ok"},
      {label: "Highest use", value: L.pct(top.month / LIMIT(top.make) * 100, 0), sub: "Card " + cardOf(top) + ", " + top.driver}
    ]},
    {t: "table", title: "Fuel cards", sub: "Holder, vehicle, " + D.month + " spend against limit",
      cols: [{k: "card", label: "Card", kind: "mono"}, {k: "holder", label: "Holder", kind: "person"}, {k: "veh", label: "Vehicle", kind: "name"}, {k: "month", label: D.month, kind: "money"},
        {k: "limit", label: "Limit", kind: "money"}, {k: "used", label: "Used", kind: "bar"}, {k: "status", label: "Status", kind: "status"}],
      rows, foot: {card: list.length + " cards", month: eur(L.sum(list, (x) => x.v.month)), limit: eur(L.sum(list, (x) => x.limit))}},
    {t: "note", title: "Card numbers.", text: "Each card is tied to one vehicle, so a fill always carries a vehicle and a holder. Yard spare cards stay at the office and are signed out with the van."}
  ];
}

function costs(c) {
  const byProj = dieselByProject(c);
  const bySector = L.SECTORS.map((s) => ({label: s, value: L.sum(byProj.filter((x) => L.PROJECT(x.id).sector === s), (x) => x.value)}));
  const allocated = L.sum(byProj, (x) => x.value);
  const people = (id) => L.ON_SITE.filter((e) => e.project === id).length;
  return [
    {t: "grid", cols: 2, items: [
      {t: "cols", title: "Diesel by month", sub: D.month + " " + eur(D.total) + ", +" + L.pct(deltaPct) + " on September", data: TREND.map((m) => [m[0], m[1], eur(m[1])])},
      {t: "donut", title: "Diesel by sector, " + D.month, items: [...bySector.map((x) => ({label: x.label, value: x.value, display: money(x.value)})),
        {label: "Needs allocation", value: c.d.unallocValue, display: money(c.d.unallocValue)}]}
    ]},
    {t: "table", title: "Diesel cost per project, " + D.month, sub: "Allocated amounts. Feeds each project's other costs.",
      cols: [{k: "p", label: "Project", kind: "name"}, {k: "sector", label: "Sector"}, {k: "pm", label: "PM"}, {k: "people", label: "On site today", align: "r"},
        {k: "v", label: "Diesel", kind: "money"}, {k: "share", label: "Share", kind: "pct"}],
      rows: [...byProj.slice().sort((a, b) => b.value - a.value).map((x) => {
        const p = L.PROJECT(x.id);
        return {p: x.moved ? {v: p.name, sub: "Includes " + money(x.moved) + " allocated in Pulse"} : p.name, sector: p.sector, pm: p.pm, people: String(people(x.id)),
          v: money(x.value), share: x.value / D.total * 100, _go: () => c.openProject(x.id, "overview")};
      }), {p: {v: "Needs allocation", tone: "warn"}, sector: "", pm: "", people: "", v: money(c.d.unallocValue), share: c.d.unallocValue / D.total * 100, _go: () => c.go("Fleet", "exceptions")}],
      foot: {p: "Total", v: eur(allocated + c.d.unallocValue), share: 100}},
    {t: "note", title: "Average per active project " + eur(D.perProject) + ".", text: "CastlePark and Ringsend carry the most diesel because their gangs run the most vans. Small works is lowest per project but its vans cover the most call-outs."}
  ];
}

function exceptions(c) {
  const rows = UNALLOC_ALL.map((t) => ({
    when: t.when, who: t.who, reg: t.reg, card: t.card, place: t.place, amount: L.eur2(t.amount),
    status: allocOf(c, t) ? {v: "Allocated", tone: "ok", sub: pname(allocOf(c, t))} : {v: "Needs allocation", tone: "warn"},
    act: allocBtn(c, t), _hl: t.id === F1.id && !allocOf(c, t)
  }));
  const done = UNALLOC_ALL.length - c.d.unallocFuel.length;
  return [
    {t: "kpis", items: [
      {label: "Needs allocation", value: String(c.d.unallocFuel.length), sub: "of " + UNALLOC_ALL.length + " in " + D.month, tone: c.d.unallocFuel.length ? "warn" : "ok"},
      {label: "Unallocated value", value: money(c.d.unallocValue), sub: "Baseline " + eur(D.unallocated)},
      {label: "Allocated in Pulse", value: String(done), sub: money(L.sum(UNALLOC_ALL.filter((t) => allocOf(c, t)), (t) => t.amount)) + " moved to projects", tone: done ? "ok" : undefined},
      {label: "Checks to confirm", value: String(CHECKS.length), sub: "No money at stake"}
    ]},
    {t: "table", title: "Transactions without a project", sub: "Each one is a fill with no Sync site for that driver at that time",
      cols: [{k: "when", label: "When"}, {k: "who", label: "Who", kind: "person"}, {k: "reg", label: "Vehicle", kind: "mono"}, {k: "card", label: "Card", kind: "mono"},
        {k: "place", label: "Where"}, {k: "amount", label: "Amount", kind: "money"}, {k: "status", label: "Status", kind: "status"}, {k: "act", label: ""}],
      rows, foot: {when: "Unallocated", amount: money(c.d.unallocValue)}},
    {t: "alerts", items: CHECKS.map((x) => ({tone: "warn", title: x.title, body: x.body, action: {label: "Ask to confirm", run: () => c.ask(x.ask)}}))},
    {t: "note", text: "Pulse suggests the driver's usual project for each line. Allocating moves the amount into that project's cost and out of the " + eur(D.unallocated) + " baseline."}
  ];
}

export default {
  id: "Fleet",
  tabs: [
    {id: "overview", label: "Overview", title: "Fleet & Diesel", sub: "Who bought fuel, in which vehicle, for which project, and whether it is allocated", build: overview},
    {id: "vehicles", label: "Vehicles", title: "Vehicles", sub: "All 18 vehicles, driver, card and cost per km", build: vehicles},
    {id: "diesel", label: "Diesel", title: "Diesel", sub: "Employee, vehicle, project, fuel card in one row", build: diesel},
    {id: "cards", label: "Fuel Cards", title: "Fuel Cards", sub: "Every card, its holder, vehicle and monthly limit", build: cards},
    {id: "costs", label: "Costs", title: "Costs", sub: "Diesel by month, sector and project", build: costs},
    {id: "exceptions", label: "Exceptions", title: "Exceptions", sub: "Fills that need a project, and checks to confirm", build: exceptions}
  ]
};
