import * as L from "../lavelle";

const {eur, num} = L;

/* Workforce: Sync attendance (clock-in/out, geolocation) reconciled against project
   allocation. The PM WhatsApp habit stays, Pulse turns the message into structured labour.
   Not payroll, not HR. Every headcount reconciles to L.ON_SITE (43 on site today). */

const ON = L.ON_SITE;
const TOTAL_WORKERS = 55, EMPLOYEES = 40, SUBS_TOTAL = 15;
const subsOn = ON.filter((e) => e.sub);
const employeesOn = ON.filter((e) => !e.sub);

const who = (name, proj) => ON.find((e) => e.name === name && (!proj || e.project === proj));
const byId = (id) => ON.find((e) => e.id === id);
const pname = (id) => (id ? L.PROJECT(id).name : "Other sites");
const pshort = (id) => (id ? L.PROJECT(id).short : "Other sites");
const hrs = (h) => Number(h).toFixed(1);
const signed = (n, unit = "") => (n > 0 ? "+" : n < 0 ? "−" : "") + num(Math.abs(n)) + unit;
const signedEur = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + eur(Math.abs(n));

/* Deterministic Sync clock times: in between 07:30 and 07:58, 30 minute unpaid break. */
const pad = (n) => String(n).padStart(2, "0");
const clock = (e) => {
  const idx = ON.indexOf(e);
  const inMin = 7 * 60 + 30 + (e.hours > 8 ? 0 : (idx * 7) % 29);
  const outMin = inMin + Math.round(e.hours * 60) + 30;
  const f = (m) => pad(Math.floor(m / 60)) + ":" + pad(m % 60);
  return {in: f(inMin), out: f(outMin)};
};

const DARA = who(L.LABOUR_FIX.employee, L.LABOUR_FIX.project);
const assigned = (c) => !!c.s.labourAssigned;

/* Two people whose Tuesday timesheet has no Sync clock-out (picked from L.ON_SITE). */
const MISSING = [
  {e: byId("e8"), day: "Tue", note: "Clocked in 07:44, no clock-out recorded"},
  {e: byId("e25"), day: "Tue", note: "Clocked in 07:51, no clock-out recorded"}
];

const exceptionsOf = (c) => (assigned(c) ? 0 : 1) + MISSING.length;
const hoursToday = L.sum(ON, (e) => e.hours);
const costToday = L.sum(ON, L.dayCost);

/* ── schedule (this week, today is Wednesday) ───────────────────────────── */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TODAY = 2;
/* Wednesday column equals L.TODAY_SITES / L.ON_SITE by site. */
const WEEK = [
  ["castlepark", "CastlePark Manor", [11, 11, 11, 12, 12]],
  ["ringsend", "Ringsend Upgrade", [10, 9, 10, 10, 8]],
  ["harbour", "Harbour Exchange", [8, 8, 8, 8, 7]],
  ["kimmage", "Kimmage Phase II", [6, 7, 7, 7, 6]],
  ["smallworks", "Service / small works", [4, 5, 5, 5, 5]],
  [null, "Other sites (Maynooth, Galway)", [2, 2, 2, 2, 2]]
];
/* Employees off site. Oisin, Barry and Gavin are the 3 of 40 employees not in today's 43. */
const LEAVE = [
  {name: "Oisin Maher", type: "Annual leave", days: [1, 1, 1, 1, 1], cover: "Back Monday"},
  {name: "Barry Noonan", type: "Annual leave", days: [1, 1, 1, 1, 0], cover: "Returns Friday to CastlePark"},
  {name: byId("e34").name, type: "Annual leave", days: [1, 0, 0, 0, 0], cover: "Kimmage, back Tuesday"},
  {name: byId("e14").name, type: "Annual leave", days: [0, 0, 0, 0, 1], cover: "Ringsend, Friday only"},
  {name: byId("e24").name, type: "Annual leave", days: [0, 0, 0, 0, 1], cover: "Harbour Exchange, Friday only"},
  {name: byId("e32").name, type: "Annual leave", days: [0, 0, 0, 0, 1], cover: "Kimmage, Friday only"}
];
const TRAINING = [
  {name: "Gavin Sheehy", type: "Training, inspection and testing course", days: [1, 1, 1, 1, 1], cover: "All week"},
  {name: byId("e13").name, type: "Training, confined space", days: [0, 1, 0, 0, 0], cover: "Ringsend, Tuesday only"}
];

/* ── subcontractors (15). The 6 on site today are the L.ON_SITE entries with sub:true. ── */
const SUB_CO = {
  e5: ["Dolan Electrical Services", "Electrician, containment", "Insurance and Safe Pass valid"],
  e12: ["Doyle Electrical Contracting", "Electrical foreman, labour only", "Insurance and Safe Pass valid"],
  e19: ["Heneghan Testing", "Inspection and testing", "Insurance renews 14 Nov"],
  e26: ["Egan Electrical", "Electrician, first and second fix", "Insurance and Safe Pass valid"],
  e33: ["Kane Electrical", "Electrician, housing first fix", "Insurance and Safe Pass valid"],
  e40: ["Quinn Maintenance", "Electrician, call-outs", "Insurance and Safe Pass valid"]
};
const SUB_DAYS = {e5: [1, 1, 1, 1, 1], e12: [1, 1, 1, 1, 1], e19: [1, 1, 1, 1, 0], e26: [1, 1, 1, 1, 1], e33: [1, 1, 1, 1, 1], e40: [0, 1, 1, 1, 1]};
const SUBS = [
  ...subsOn.map((e) => ({
    name: e.name, company: SUB_CO[e.id] ? SUB_CO[e.id][0] : e.name + " Electrical", trade: SUB_CO[e.id] ? SUB_CO[e.id][1] : "Electrician",
    onSite: 1, rate: e.rate, project: e.project, days: SUB_DAYS[e.id] || [1, 1, 1, 1, 1], status: "On site", docs: SUB_CO[e.id] ? SUB_CO[e.id][2] : "Insurance and Safe Pass valid"
  })),
  {name: "Ruairi Hanlon", company: "Hanlon Containment", trade: "Containment installer", onSite: 0, rate: 30, project: "castlepark", days: [0, 0, 0, 1, 0], status: "Booked Thu", docs: "Insurance and Safe Pass valid"},
  {name: "Eamon Furlong", company: "Furlong Fire Systems", trade: "Fire alarm commissioning", onSite: 0, rate: 36, project: "castlepark", days: [0, 0, 0, 0, 0], status: "Booked next week", docs: "Insurance and Safe Pass valid"},
  {name: "Pauric Geraghty", company: "Geraghty Data", trade: "Data and comms cabling", onSite: 0, rate: 31, project: "kimmage", days: [0, 0, 0, 0, 0], status: "Booked next week", docs: "Insurance and Safe Pass valid"},
  {name: "Seamus Carey", company: "Carey Electrical", trade: "Electrician", onSite: 0, rate: 29, project: null, days: [0, 0, 0, 0, 0], status: "Available", docs: "Insurance and Safe Pass valid"},
  {name: "Tomas Breen", company: "Breen Access", trade: "MEWP operator", onSite: 0, rate: 27, project: null, days: [0, 0, 0, 0, 0], status: "Available", docs: "Insurance and Safe Pass valid"},
  {name: "Finbar Daly", company: "Daly Switchgear", trade: "HV and switchgear jointer", onSite: 0, rate: 42, project: "ringsend", days: [0, 0, 0, 0, 0], status: "Booked 17 Nov", docs: "Safe Pass renewal due 30 Nov"},
  {name: "Odhran Keane", company: "Keane Security Systems", trade: "Access control and CCTV", onSite: 0, rate: 33, project: "castlepark", days: [0, 0, 0, 0, 0], status: "Available", docs: "Insurance and Safe Pass valid"},
  {name: "Cormac Lally", company: "Lally Electrical", trade: "Electrician", onSite: 0, rate: 30, project: null, days: [0, 0, 0, 0, 0], status: "Available", docs: "Insurance and Safe Pass valid"},
  {name: "Ultan Mahon", company: "Mahon Lighting Controls", trade: "Lighting controls commissioning", onSite: 0, rate: 35, project: "harbour", days: [0, 0, 0, 0, 0], status: "Booked next week", docs: "Insurance and Safe Pass valid"}
];
const subsByDay = DAYS.map((_, i) => L.sum(SUBS, (s) => s.days[i]));
const leaveByDay = DAYS.map((_, i) => L.sum(LEAVE, (x) => x.days[i]));
const trainByDay = DAYS.map((_, i) => L.sum(TRAINING, (x) => x.days[i]));
const siteByDay = DAYS.map((_, i) => L.sum(WEEK, (w) => w[2][i]));

/* Next 5 working days: Wed (today), Thu, Fri, then next Mon and Tue. */
const NEXT_WEEK = {
  Mon: {castlepark: 11, ringsend: 10, harbour: 7, kimmage: 7, smallworks: 5, other: 2, leave: 1, subs: 6},
  Tue: {castlepark: 12, ringsend: 10, harbour: 7, kimmage: 7, smallworks: 5, other: 2, leave: 1, subs: 7}
};

/* ── shared blocks ──────────────────────────────────────────────────────── */
const reconRow = (c, e, isDara) => {
  const t = clock(e);
  const ok = !isDara || assigned(c);
  return {
    person: e.name,
    sync: {v: pname(e.project), sub: "Sync " + t.in + " to " + t.out + ", geofence matched"},
    hours: hrs(e.hours),
    source: "Sync",
    alloc: ok ? pname(e.project) : {v: "Not assigned", tone: "warn"},
    cost: eur(L.dayCost(e)),
    status: ok ? "Confirmed" : "Needs assignment",
    _hl: isDara && !ok
  };
};

const RECON_COLS = [
  {k: "person", label: "Person", kind: "person"}, {k: "sync", label: "Sync attendance", kind: "name"},
  {k: "hours", label: "Hours", align: "r"}, {k: "source", label: "Source"}, {k: "alloc", label: "Project allocation"},
  {k: "cost", label: "Labour cost", kind: "money"}, {k: "status", label: "Status", kind: "status"}
];

/* ── tabs ───────────────────────────────────────────────────────────────── */
function today(c) {
  const done = assigned(c);
  const castle = L.PROJECT(L.LABOUR_FIX.project);
  const recon = [
    reconRow(c, who("Marty Byrne", "castlepark")),
    reconRow(c, DARA, true),
    reconRow(c, who("Sean Murphy", "harbour")),
    reconRow(c, who("Liam Doyle", "ringsend"))
  ];
  return [
    {t: "kpis", items: [
      {label: "People on site", value: String(ON.length), sub: "of " + TOTAL_WORKERS + " workers, " + subsOn.length + " subcontractors", tone: "accent", hero: true, go: () => c.go("Workforce", "people")},
      {label: "Labour hours today", value: hrs(hoursToday) + " hrs", sub: "From Sync clock-in/out across 7 sites"},
      {label: "Labour cost today", value: eur(costToday), sub: done ? "All allocated to projects" : eur(L.dayCost(DARA)) + " not yet assigned to a project", tone: done ? "ok" : "warn"},
      {label: "Exceptions", value: String(exceptionsOf(c)), sub: (done ? "" : "1 assignment, ") + MISSING.length + " missing Tue clock-outs", tone: exceptionsOf(c) ? "warn" : "ok", go: () => c.go("Workforce", "timesheets")}
    ]},
    {t: "alerts", items: [done
      ? {tone: "ok", title: "Assigned, labour cost added to " + castle.name + ". ", body: DARA.name + ", " + hrs(DARA.hours) + " hrs, " + eur(L.dayCost(DARA)) + " posted to today's project labour. CastlePark now carries " + eur(L.sum(ON.filter((e) => e.project === "castlepark"), L.dayCost)) + " for today."}
      : {tone: "warn", title: "Needs assignment. ", body: DARA.name + " clocked into " + castle.name + " but has not yet been assigned against today's project labour cost.",
         action: {label: "Assign to " + castle.name, primary: true, run: () => c.set({labourAssigned: true})}}
    ]},
    {t: "custom", name: "siteBoard", props: {}},
    {t: "table", title: "Sync attendance vs project allocation", sub: "Sync is the clock. The project allocation is what lands in project cost.", cols: RECON_COLS, rows: recon,
      foot: {person: "4 of " + ON.length + " shown", cost: eur(L.sum([who("Marty Byrne", "castlepark"), DARA, who("Sean Murphy", "harbour"), who("Liam Doyle", "ringsend")], L.dayCost))}},
    {t: "note", title: "WhatsApp to structured labour.", text: "Kevin Byrne posted at 15:12: “Marty and Dara, CastlePark Manor, 08:00-16:30”. Pulse read it as 2 people (Marty Byrne, Dara Kelly), project CastlePark Manor, 8.5 hrs on site less a 30 minute break, so 8.0 paid hours each. Sync agrees for both, so admin no longer re-keys it into LiveCosts. Dara's line is the only one not yet assigned."}
  ];
}

function schedule(c) {
  const dayCols = DAYS.map((d, i) => ({k: "d" + i, label: i === TODAY ? d + " (today)" : d, align: "r"}));
  const row = (label, arr, extra) => Object.assign({site: label}, ...arr.map((v, i) => ({["d" + i]: i === TODAY ? {v: String(v), tone: "accent"} : String(v)})), extra || {});
  const rows = WEEK.map((w) => Object.assign(row(w[1], w[2]), {_go: w[0] ? () => c.openProject(w[0], "labour") : undefined, week: String(L.sum(w[2], (x) => x))}));
  rows.push(row("Of which subcontractors", subsByDay, {week: String(L.sum(subsByDay, (x) => x))}));
  rows.push(row("Employees on leave", leaveByDay, {week: String(L.sum(leaveByDay, (x) => x))}));
  rows.push(row("Employees in training", trainByDay, {week: String(L.sum(trainByDay, (x) => x))}));
  rows.push(row("Subcontractors not booked", subsByDay.map((n) => SUBS_TOTAL - n), {week: String(L.sum(subsByDay, (n) => SUBS_TOTAL - n))}));

  const today = WEEK.map((w) => [w[0] ? L.PROJECT(w[0]).short : "Other sites", w[2][TODAY]]);
  const card = (title, sub, counts, leave, subs, total) => ({
    title, sub, pill: total + " on site", pillTone: title.indexOf("today") > -1 ? "accent" : undefined,
    lines: [...counts.map((x) => [x[0], String(x[1])]), ["Subcontractors in total", String(subs)], ["On leave", String(leave)]]
  });
  const thisWeekCard = (i, title, sub) => card(title, sub, WEEK.map((w) => [w[0] ? L.PROJECT(w[0]).short : "Other sites", w[2][i]]), leaveByDay[i], subsByDay[i], siteByDay[i]);
  const nextCard = (d) => {
    const n = NEXT_WEEK[d];
    const counts = [["CastlePark", n.castlepark], ["Ringsend", n.ringsend], ["Harbour Exchange", n.harbour], ["Kimmage", n.kimmage], ["Small works", n.smallworks], ["Other sites", n.other]];
    return card("Next " + d, "Planned from PM requests", counts, n.leave, n.subs, L.sum(counts, (x) => x[1]));
  };

  return [
    {t: "kpis", items: [
      {label: "On site today", value: String(siteByDay[TODAY]), sub: today.map((x) => x[0] + " " + x[1]).slice(0, 4).join(", "), tone: "accent"},
      {label: "Person-days this week", value: String(L.sum(siteByDay, (x) => x)), sub: "Mon " + siteByDay[0] + " to Fri " + siteByDay[4]},
      {label: "Peak day", value: "Thu, " + siteByDay[3], sub: "Extra containment gang at CastlePark Block B"},
      {label: "Leave this week", value: L.sum(leaveByDay, (x) => x) + " days", sub: LEAVE.length + " people, " + leaveByDay[4] + " off on Friday", tone: leaveByDay[4] > 3 ? "warn" : undefined}
    ]},
    {t: "table", title: "This week by site", sub: "Planned headcount, Monday to Friday. Every day reconciles to " + TOTAL_WORKERS + " workers (" + EMPLOYEES + " employees, " + SUBS_TOTAL + " subcontractors).",
      cols: [{k: "site", label: "Site", kind: "name"}, ...dayCols, {k: "week", label: "Person-days", align: "r"}],
      rows, foot: Object.assign({site: "On site"}, ...siteByDay.map((v, i) => ({["d" + i]: String(v)})), {week: String(L.sum(siteByDay, (x) => x))})},
    {t: "cards", title: "Next 5 working days", min: 200, items: [
      thisWeekCard(2, "Wed, today", "Matches Sync attendance"), thisWeekCard(3, "Thu", "Planned"), thisWeekCard(4, "Fri", "Planned"), nextCard("Mon"), nextCard("Tue")
    ]},
    {t: "grid", cols: 2, items: [
      {t: "table", title: "Leave and training", sub: "Employees off site this week", cols: [{k: "name", label: "Person", kind: "person"}, {k: "type", label: "Reason", wrap: true}, ...DAYS.map((d, i) => ({k: "d" + i, label: d, align: "r"}))],
        rows: [...LEAVE, ...TRAINING].map((x) => Object.assign({name: x.name, type: {v: x.type, sub: x.cover}}, ...x.days.map((v, i) => ({["d" + i]: v ? "Off" : ""}))))},
      {t: "table", title: "Subcontractor gangs this week", sub: "Booked through the PM, clocked through Sync", cols: [{k: "name", label: "Subcontractor", kind: "name"}, {k: "project", label: "Project"}, ...DAYS.map((d, i) => ({k: "d" + i, label: d, align: "r"}))],
        rows: SUBS.filter((s) => L.sum(s.days, (x) => x) > 0).map((s) => Object.assign({name: {v: s.name, sub: s.company}, project: pshort(s.project)}, ...s.days.map((v, i) => ({["d" + i]: v ? "On" : ""})))),
        foot: Object.assign({name: "Per day"}, ...subsByDay.map((v, i) => ({["d" + i]: String(v)})))}
    ]}
  ];
}

function people(c) {
  const order = ["Foreman", "Approved electrician", "Electrician", "Subcontractor"];
  const sorted = ON.slice().sort((a, b) => (a.role === "Foreman" ? 0 : 1) - (b.role === "Foreman" ? 0 : 1) || ON.indexOf(a) - ON.indexOf(b));
  const top = sorted.slice(0, 20);
  const rest = sorted.slice(20);
  const restBy = WEEK.map((w) => [w[0] ? L.PROJECT(w[0]).short : "Other sites", rest.filter((e) => (w[0] ? e.project === w[0] : ["maynooth", "galway"].indexOf(e.project) > -1)).length]).filter((x) => x[1]);
  return [
    {t: "kpis", items: [
      {label: "Workers", value: String(TOTAL_WORKERS), sub: EMPLOYEES + " employees, " + SUBS_TOTAL + " subcontractors"},
      {label: "On site today", value: String(ON.length), sub: employeesOn.length + " employees, " + subsOn.length + " subcontractors", tone: "accent"},
      {label: "Foremen", value: String(ON.filter((e) => e.role === "Foreman").length), sub: "One per live site, " + subsOn.filter((e) => e.role === "Foreman").length + " on a subcontract"},
      {label: "Office staff", value: String(L.MGMT.length), sub: "Management, projects, estimating, admin"}
    ]},
    {t: "table", title: "On site today", sub: ON.length + " on site of " + TOTAL_WORKERS + " workers (" + EMPLOYEES + " employees, " + SUBS_TOTAL + " subcontractors). Showing 20, foremen first.",
      cols: [{k: "name", label: "Name", kind: "person"}, {k: "role", label: "Role"}, {k: "project", label: "Project"}, {k: "type", label: "Type", kind: "status"}, {k: "rate", label: "Rate", align: "r"}, {k: "today", label: "Today", kind: "money"}],
      rows: top.map((e) => ({name: e.name, role: e.mate && !e.sub ? e.role + " (with mate)" : e.role, project: pname(e.project), type: e.sub ? {v: "Subcontractor", tone: "accent"} : {v: "Employee", tone: ""},
        rate: "€" + e.rate + "/hr", today: eur(L.dayCost(e)), _go: () => c.openProject(e.project, "labour")}))},
    {t: "note", title: rest.length + " more on site.", text: restBy.map((x) => x[0] + " " + x[1]).join(", ") + ". " + "On site in total: " + order.slice(0, 3).map((r) => { const n = employeesOn.filter((e) => e.role === r).length; return n + " " + (r === "Foreman" ? (n === 1 ? "foreman" : "foremen") : r.toLowerCase() + (n === 1 ? "" : "s")); }).join(", ") + " and " + subsOn.length + " subcontractors. Not on site today: " + (EMPLOYEES - employeesOn.length) + " employees (" + leaveByDay[TODAY] + " on leave, " + trainByDay[TODAY] + " in training) and " + (SUBS_TOTAL - subsOn.length) + " subcontractors not booked."},
    {t: "table", title: "Office", sub: "Not clocked through Sync", cols: [{k: "name", label: "Name", kind: "person"}, {k: "role", label: "Role"}, {k: "team", label: "Team"}, {k: "loc", label: "Base"}, {k: "email", label: "Email", kind: "mono"}],
      rows: L.MGMT.map((m) => ({name: m.name, role: m.role, team: m.team, loc: m.loc, email: m.email}))}
  ];
}

function timesheets(c) {
  const done = assigned(c);
  const SAMPLE = [who("Marty Byrne", "castlepark"), DARA, byId("e7"), byId("e8"), who("Liam Doyle", "ringsend"), byId("e15"), byId("e19"),
    who("Sean Murphy", "harbour"), byId("e25"), who("Cian Dolan", "kimmage"), who("Tadhg Walsh", "smallworks"), byId("e42")];
  const missingIds = MISSING.map((m) => m.e.id);
  const rows = SAMPLE.map((e) => {
    const t = clock(e);
    const isDara = e === DARA;
    const pending = isDara && !done;
    const missing = missingIds.indexOf(e.id) > -1;
    return {
      name: e.name, type: e.sub ? "Subcontractor" : "Employee", clock: {v: t.in + " to " + t.out, sub: "Sync, " + L.PROJECT(e.project).short + " geofence"},
      project: pending ? {v: "Not assigned", tone: "warn"} : pname(e.project),
      approved: pending ? {v: "Pending", tone: "warn"} : hrs(e.hours),
      cost: eur(L.dayCost(e)),
      status: pending ? "Needs assignment" : missing ? {v: "Tue clock-out missing", tone: "warn"} : "Approved",
      _hl: pending || missing
    };
  });
  const approvedHrs = hoursToday - (done ? 0 : DARA.hours);
  return [
    {t: "kpis", items: [
      {label: "Timesheets today", value: String(ON.length), sub: "One per Sync clock-in"},
      {label: "Matched to a project", value: (done ? ON.length : ON.length - 1) + " of " + ON.length, sub: done ? "All assigned" : DARA.name + " needs assignment", tone: done ? "ok" : "warn"},
      {label: "Approved hours", value: hrs(approvedHrs) + " hrs", sub: "of " + hrs(hoursToday) + " clocked"},
      {label: "Missing timesheets", value: String(MISSING.length), sub: MISSING.map((m) => m.e.name).join(" and ") + ", Tuesday", tone: "warn"}
    ]},
    {t: "alerts", items: [
      ...(done ? [] : [{tone: "warn", title: "Needs assignment. ", body: DARA.name + " has a Sync clock-in at " + L.PROJECT(DARA.project).name + " (" + hrs(DARA.hours) + " hrs) and no project line in today's labour.", action: {label: "Assign to " + L.PROJECT(DARA.project).name, primary: true, run: () => c.set({labourAssigned: true})}}]),
      ...MISSING.map((m) => ({tone: "warn", title: m.e.name + ", " + m.day + " timesheet incomplete. ", body: m.note + " at " + L.PROJECT(m.e.project).name + ". " + L.PROJECT(m.e.project).foreman + " to confirm the finish time.",
        action: {label: "Ask " + L.PROJECT(m.e.project).foreman.split(" ")[0], run: () => c.ask("Ask " + L.PROJECT(m.e.project).foreman + " to confirm " + m.e.name + "'s finish time on Tuesday")}}))
    ]},
    {t: "table", title: "Timesheets, today", sub: "Sync clock data, project assignment, approved hours and labour cost. Sample of 12 of " + ON.length + ".",
      cols: [{k: "name", label: "Person", kind: "person"}, {k: "type", label: "Type"}, {k: "clock", label: "Sync clock", kind: "name"}, {k: "project", label: "Project"},
        {k: "approved", label: "Approved hrs", align: "r"}, {k: "cost", label: "Labour cost", kind: "money"}, {k: "status", label: "Status", kind: "status"}],
      rows, foot: {name: "12 shown", approved: hrs(L.sum(SAMPLE, (e) => (e === DARA && !done ? 0 : e.hours))), cost: eur(L.sum(SAMPLE, L.dayCost))}},
    {t: "sync", text: "Sync attendance read at 16:40. Approved hours post to project labour cost, not to payroll."}
  ];
}

function labourCosts(c) {
  const live = L.LABOUR_BY_PROJECT.filter((p) => p.hours > 0);
  const wkHrs = L.sum(live, (p) => p.hours), wkBud = L.sum(live, (p) => p.budget);
  const ring = L.PROJECT("ringsend"), castle = L.PROJECT("castlepark");
  const RL = L.RINGSEND_LABOUR;
  const castleRate = L.sum(ON.filter((e) => e.project === "castlepark"), (e) => e.rate) / ON.filter((e) => e.project === "castlepark").length;
  const CL = L.CASTLE_LABOUR;
  const clHrs = L.sum(CL, (k) => k.hours), clBud = L.sum(CL, (k) => k.budget);
  /* By week: previous four weeks invented, current week = L.LABOUR_BY_PROJECT totals. */
  const WEEKS = [["Wk 41", 1588, 1560], ["Wk 42", 1604, 1556], ["Wk 43", 1631, 1552], ["Wk 44", wkHrs, wkBud]];
  /* By month: Ringsend allowance vs actual, current month = L.RINGSEND_LABOUR. */
  const MONTHS = [["Jul", 6912, 6820, 70480], ["Aug", 6240, 6300, 66950], ["Sep", 6980, 6790, 74310], ["Oct", 7094, 6820, RL.actual]];
  return [
    {t: "kpis", items: [
      {label: "Labour cost today", value: eur(costToday), sub: hrs(hoursToday) + " hrs across " + ON.length + " people"},
      {label: "Hours this week", value: num(wkHrs), sub: "Budget " + num(wkBud), delta: signed(wkHrs - wkBud), tone: wkHrs > wkBud ? "warn" : "ok"},
      {label: "CastlePark this week", value: castle.weekHrs + " hrs", sub: "vs " + castle.budgetHrs + " budget, Block B containment", delta: signed(castle.weekHrs - castle.budgetHrs), tone: "warn", go: () => c.openProject("castlepark", "labour")},
      {label: "Ringsend this month", value: signedEur(RL.variance), sub: "above allowance, requires PM review", tone: "warn", go: () => c.openProject("ringsend", "labour")}
    ]},
    {t: "split", ratio: "3fr 2fr", left: [
      {t: "bars", title: "Labour by project, this week", sub: "Approved hours against weekly budget", max: Math.max(...live.map((p) => Math.max(p.hours, p.budget))),
        items: live.map((p) => ({label: p.name, value: p.hours, display: p.hours + " / " + p.budget + " hrs", tone: p.variance > 0 ? "warn" : "ok", sub: p.variance > 0 ? signed(p.variance) + " hrs over budget" : p.variance < 0 ? signed(p.variance) + " hrs under budget" : "On budget"}))}
    ], right: [
      {t: "cards", min: 220, items: [{title: "Ringsend Upgrade, labour", sub: "Monthly allowance vs actual", pill: "Requires PM review", pillTone: "warn", big: signedEur(RL.variance),
        lines: [["Monthly allowance", eur(RL.allowance)], ["Actual", eur(RL.actual)], ["Variance", signedEur(RL.variance)], ["Driver", "Switch room rework"], ["PM", ring.pm], ["Forecast margin remains", L.pct(ring.margin)]],
        go: () => c.openProject("ringsend", "labour")}]}
    ]},
    {t: "table", title: "CastlePark Manor, labour by work package", sub: "This week. Hours come from Sync and the PM's package split.",
      cols: [{k: "pk", label: "Package", kind: "name"}, {k: "hours", label: "Hours", align: "r"}, {k: "budget", label: "Budget", align: "r"}, {k: "var", label: "Variance", align: "r"}, {k: "cost", label: "Labour cost", kind: "money"}],
      rows: CL.map((k) => ({pk: k.id === "cont" ? {v: k.name, sub: "Block B, late access to level 2"} : k.name, hours: String(k.hours), budget: String(k.budget),
        var: {v: signed(k.hours - k.budget), tone: k.hours > k.budget ? (k.hours - k.budget > 5 ? "bad" : "warn") : "ok"}, cost: eur(k.hours * castleRate), _hl: k.id === "cont"})),
      foot: {pk: "Total", hours: String(clHrs), budget: String(clBud), var: signed(clHrs - clBud), cost: eur(clHrs * castleRate)}},
    {t: "grid", cols: 2, items: [
      {t: "cols", title: "Hours by week, all projects", sub: "Current week " + num(wkHrs) + " vs " + num(wkBud) + " budget", data: WEEKS.map((w) => [w[0], w[1], num(w[1])])},
      {t: "table", title: "By month", sub: "Portfolio hours and the Ringsend allowance",
        cols: [{k: "m", label: "Month"}, {k: "h", label: "Hours", align: "r"}, {k: "b", label: "Budget", align: "r"}, {k: "ra", label: "Ringsend allowance", kind: "money"}, {k: "rc", label: "Ringsend actual", kind: "money"}, {k: "rv", label: "Variance", align: "r"}],
        rows: MONTHS.map((m) => ({m: m[0], h: num(m[1]), b: num(m[2]), ra: eur(RL.allowance), rc: eur(m[3]), rv: {v: signedEur(m[3] - RL.allowance), tone: m[3] > RL.allowance ? "warn" : "ok"}, _hl: m[0] === "Oct"}))}
    ]},
    {t: "note", title: "Feeds project profitability.", text: "Approved labour posts to each project's cost to date and forecast final cost. Ringsend absorbs " + eur(RL.variance) + " this month and is still forecast at " + L.pct(ring.margin) + " margin. CastlePark is " + signed(castle.weekHrs - castle.budgetHrs) + " hrs over this week, all in containment."}
  ];
}

function subcontractors(c) {
  const onSite = L.sum(SUBS, (s) => s.onSite);
  const subCost = L.sum(subsOn, L.dayCost);
  return [
    {t: "kpis", items: [
      {label: "Subcontractors", value: String(SUBS.length), sub: "On the approved list"},
      {label: "On site today", value: String(onSite), sub: "Clocked in through Sync", tone: "accent"},
      {label: "Subcontract labour today", value: eur(subCost), sub: hrs(L.sum(subsOn, (e) => e.hours)) + " hrs, in project labour cost"},
      {label: "Booked Thursday", value: String(subsByDay[3]), sub: "Hanlon Containment joins CastlePark"}
    ]},
    {t: "table", title: "Subcontractors", sub: "Same Sync clock-in as employees, so their hours land on the right project",
      cols: [{k: "co", label: "Company", kind: "name"}, {k: "trade", label: "Trade", wrap: true}, {k: "on", label: "On site", align: "r"}, {k: "rate", label: "Rate", align: "r"},
        {k: "project", label: "Project"}, {k: "docs", label: "Documents", wrap: true}, {k: "status", label: "Status", kind: "status"}],
      rows: SUBS.map((s) => ({co: {v: s.company, sub: s.name}, trade: s.trade, on: String(s.onSite), rate: "€" + s.rate + "/hr", project: s.project ? pname(s.project) : "Not booked",
        docs: s.docs.indexOf("valid") > -1 ? s.docs : {v: s.docs, tone: "warn"}, status: s.status === "On site" ? {v: "On site", tone: "ok"} : s.status === "Available" ? {v: "Available", tone: ""} : {v: s.status, tone: "accent"},
        _go: s.project ? () => c.openProject(s.project, "labour") : undefined})),
      foot: {co: SUBS.length + " subcontractors", on: String(onSite)}},
    {t: "alerts", items: [
      {tone: "warn", title: "Heneghan Testing insurance renews 14 Nov. ", body: "Request the renewed certificate before the Ringsend testing window next week.", action: {label: "Request certificate", run: () => c.ask("Draft a request to Heneghan Testing for their renewed insurance certificate")}},
      {tone: "warn", title: "Daly Switchgear Safe Pass renewal due 30 Nov. ", body: "Booked for Ringsend from 17 Nov. Renewal needs to be on file before then."}
    ]}
  ];
}

export default {
  id: "Workforce",
  tabs: [
    {id: "today", label: "Today", title: "Workforce", sub: "Who is on site, where, and whether Sync attendance matches project labour", build: today},
    {id: "schedule", label: "Schedule", title: "Schedule", sub: "Planned headcount by site, leave and subcontractor gangs", build: schedule},
    {id: "people", label: "People", title: "People", sub: "Site directory from Sync, plus the office", build: people},
    {id: "timesheets", label: "Timesheets", title: "Timesheets", sub: "Sync clock data matched to project assignment and approved hours", build: timesheets},
    {id: "labour", label: "Labour Costs", title: "Labour Costs", sub: "Hours and cost by project and work package, against budget", build: labourCosts},
    {id: "subcontractors", label: "Subcontractors", title: "Subcontractors", sub: "Approved subcontractors, who is on site and where", build: subcontractors}
  ]
};
