/* Lavelle Electrical Group: the single source of truth for every number in the demo.
   Every module page, the Home rail, the AI answers and the ontology read from here,
   so a figure can only ever be wrong in one place. All values are mock demo data. */

/* ── formatting ─────────────────────────────────────────────────────────── */
export const num = (n) => Math.round(n).toLocaleString("en-IE");
export const eur = (n) => (n < 0 ? "−" : "") + "€" + num(Math.abs(n));
export const eurK = (n) => {
  const a = Math.abs(n);
  const s = a >= 1e6 ? (a / 1e6).toFixed(2).replace(/0$/, "") + "m" : a >= 1e4 ? Math.round(a / 1e3) + "k" : num(a);
  return (n < 0 ? "−" : "") + "€" + s;
};
export const pct = (n, d = 1) => (+Number(n).toFixed(d)) + "%";
export const eur2 = (n) => "€" + Number(n).toLocaleString("en-IE", {minimumFractionDigits: 2, maximumFractionDigits: 2});

/* ── people (mock) ──────────────────────────────────────────────────────── */
export const MARTIN = {name: "Martin Lavelle", initials: "ML", role: "Managing Director"};
export const MGMT = [
  {id: "ml", name: "Martin Lavelle", role: "Managing Director", team: "Management", email: "martin@lavelleelectrical.ie", loc: "Dublin"},
  {id: "kb", name: "Kevin Byrne", role: "Senior Project Manager", team: "Projects", email: "kevin@lavelleelectrical.ie", loc: "Dublin"},
  {id: "cf", name: "Conor Fahy", role: "Project Manager", team: "Projects", email: "conor@lavelleelectrical.ie", loc: "Dublin"},
  {id: "nr", name: "Niall Regan", role: "Project Manager", team: "Projects", email: "niall@lavelleelectrical.ie", loc: "Galway"},
  {id: "dw", name: "Daniel Walsh", role: "Estimator", team: "Estimating", email: "daniel@lavelleelectrical.ie", loc: "Dublin"},
  {id: "sk", name: "Sarah Keane", role: "Estimator", team: "Estimating", email: "sarah@lavelleelectrical.ie", loc: "Dublin"},
  {id: "ed", name: "Emma Doyle", role: "Accounts Administrator", team: "Accounts", email: "emma@lavelleelectrical.ie", loc: "Dublin"},
  {id: "rb", name: "Rachel Byrne", role: "Operations Administrator", team: "Administration", email: "rachel@lavelleelectrical.ie", loc: "Dublin"}
];

/* ── projects ───────────────────────────────────────────────────────────── */
/* contract, claimed (cumulative valuation including the July claim), cost (incurred),
   julyClaim {amount, status}, invoiced and paid are euro; complete/programme are %. */
const P = (o) => Object.assign({status: "Live"}, o);
export const PROJECTS = [
  P({id: "castlepark", name: "CastlePark Manor", short: "CastlePark", sector: "Residential", client: "Kellett Construction", location: "Dalkey, Co. Dublin",
     scope: "Full electrical installation", pm: "Kevin Byrne", start: "14 April 2026", end: "28 February 2027",
     contract: 1840000, complete: 42, programme: 44, cost: 692400, committed: 814200, claimed: 773000, invoiced: 596640, paid: 596640,
     forecastCost: 1567680, health: "Green", staff: 11, foreman: "Marty Byrne", weekHrs: 412, budgetHrs: 388,
     july: {amount: 176360, status: "Ready for Approval"}, loc: "Dublin"}),
  P({id: "harbour", name: "Harbour Exchange", short: "Harbour Exchange", sector: "Commercial", client: "Apex Fit-Out", location: "North Wall, Dublin 1",
     scope: "Office fit-out, Cat A/B electrical", pm: "Conor Fahy", start: "9 Feb 2026", end: "30 Sept 2026",
     contract: 640000, complete: 71, programme: 70, cost: 384000, committed: 421000, claimed: 448000, invoiced: 365560, paid: 365560,
     forecastCost: 492160, health: "Green", staff: 8, foreman: "Sean Murphy", weekHrs: 296, budgetHrs: 300,
     july: {amount: 82440, status: "Submitted"}, loc: "Dublin"}),
  P({id: "ringsend", name: "Ringsend Upgrade", short: "Ringsend", sector: "Industrial", client: "Eastpoint Engineering", location: "Ringsend, Dublin 4",
     scope: "Switchgear and distribution upgrade", pm: "Kevin Byrne", start: "12 Jan 2026", end: "20 Nov 2026",
     contract: 910000, complete: 58, programme: 62, cost: 516000, committed: 561000, claimed: 541000, invoiced: 426180, paid: 329780,
     forecastCost: 760760, health: "Amber", staff: 10, foreman: "Liam Doyle", weekHrs: 388, budgetHrs: 352,
     july: {amount: 114820, status: "Certified"}, loc: "Dublin"}),
  P({id: "kimmage", name: "Kimmage Phase II", short: "Kimmage", sector: "Residential", client: "Northbank Developments", location: "Kimmage, Dublin 6W",
     scope: "Phase II housing, 64 units", pm: "Conor Fahy", start: "2 March 2026", end: "12 March 2027",
     contract: 1220000, complete: 34, programme: 35, cost: 401000, committed: 478000, claimed: 367000, invoiced: 293790, paid: 220580,
     forecastCost: 1062620, health: "Amber", staff: 7, foreman: "Cian Dolan", weekHrs: 268, budgetHrs: 262,
     july: {amount: 73210, status: "Draft"}, loc: "Dublin"}),
  P({id: "maynooth", name: "Maynooth Student Living", short: "Maynooth", sector: "Residential", client: "Harbour Developments", location: "Maynooth, Co. Kildare",
     scope: "Student accommodation, 3 blocks", pm: "Niall Regan", start: "5 Jan 2026", end: "18 Dec 2026",
     contract: 960000, complete: 39, programme: 40, cost: 318000, committed: 388000, claimed: 374400, invoiced: 325800, paid: 325800,
     forecastCost: 816000, health: "Green", staff: 1, foreman: "Padraig Nolan", weekHrs: 24, budgetHrs: 24,
     july: {amount: 48600, status: "PM Review"}, loc: "Dublin"}),
  P({id: "galway", name: "Galway Docklands Block B", short: "Galway Docklands", sector: "Residential", client: "Eastpoint Engineering", location: "Galway Docks",
     scope: "Apartment block B, 48 units", pm: "Niall Regan", start: "1 June 2026", end: "28 May 2027",
     contract: 320000, complete: 22, programme: 22, cost: 58600, committed: 91000, claimed: 70400, invoiced: 55530, paid: 42650,
     forecastCost: 272000, health: "Green", staff: 1, foreman: "Brian Heneghan", weekHrs: 24, budgetHrs: 24,
     july: {amount: 14870, status: "Draft"}, loc: "Galway"}),
  P({id: "dundrum", name: "Dundrum Retail Fit-out", short: "Dundrum", sector: "Commercial", client: "Apex Fit-Out", location: "Dundrum, Dublin 16",
     scope: "Retail unit fit-out", pm: "Conor Fahy", start: "16 March 2026", end: "2 Oct 2026",
     contract: 410000, complete: 64, programme: 63, cost: 205300, committed: 231000, claimed: 262400, invoiced: 241000, paid: 202050,
     forecastCost: 320620, health: "Green", staff: 0, foreman: "Rory Kenny", weekHrs: 0, budgetHrs: 0,
     july: {amount: 21400, status: "Submitted"}, loc: "Dublin"}),
  P({id: "citywest", name: "Citywest Hotel Refurb", short: "Citywest", sector: "Commercial", client: "Harbour Developments", location: "Citywest, Co. Dublin",
     scope: "Hotel refurbishment, 120 rooms", pm: "Kevin Byrne", start: "19 Jan 2026", end: "15 Oct 2026",
     contract: 530000, complete: 77, programme: 76, cost: 322800, committed: 348000, claimed: 408100, invoiced: 378140, paid: 378140,
     forecastCost: 422940, health: "Green", staff: 0, foreman: "Shane Cullen", weekHrs: 0, budgetHrs: 0,
     july: {amount: 29960, status: "Certified"}, loc: "Dublin"}),
  P({id: "clonskeagh", name: "Clonskeagh Medical Centre", short: "Clonskeagh", sector: "Commercial", client: "Northbank Developments", location: "Clonskeagh, Dublin 14",
     scope: "Medical centre fit-out", pm: "Conor Fahy", start: "2 Feb 2026", end: "4 Sept 2026",
     contract: 340000, complete: 83, programme: 86, cost: 214500, committed: 229000, claimed: 282200, invoiced: 282200, paid: 266080,
     forecastCost: 274040, health: "Amber", staff: 0, foreman: "Mark Tierney", weekHrs: 0, budgetHrs: 0,
     july: {amount: 16120, status: "Invoice Generated"}, loc: "Dublin"}),
  P({id: "tallaght", name: "Tallaght Distribution Hub", short: "Tallaght", sector: "Industrial", client: "Eastpoint Engineering", location: "Tallaght, Dublin 24",
     scope: "Warehouse power, lighting and data", pm: "Kevin Byrne", start: "23 Feb 2026", end: "11 Dec 2026",
     contract: 780000, complete: 47, programme: 46, cost: 301200, committed: 352000, claimed: 366600, invoiced: 344700, paid: 344700,
     forecastCost: 639600, health: "Green", staff: 0, foreman: "Gary Moran", weekHrs: 0, budgetHrs: 0,
     july: {amount: 21900, status: "Draft"}, loc: "Dublin"}),
  P({id: "naas", name: "Naas Road Process Plant", short: "Naas Road", sector: "Industrial", client: "Eastpoint Engineering", location: "Naas Road, Dublin 12",
     scope: "Process plant power and controls", pm: "Conor Fahy", start: "13 April 2026", end: "26 Feb 2027",
     contract: 520000, complete: 29, programme: 30, cost: 118700, committed: 164000, claimed: 150800, invoiced: 142480, paid: 142480,
     forecastCost: 431600, health: "Green", staff: 0, foreman: "Eoin Brady", weekHrs: 0, budgetHrs: 0,
     july: {amount: 8320, status: "PM Review"}, loc: "Dublin"}),
  P({id: "smallworks", name: "Small Works Framework", short: "Small works", sector: "Small Works", client: "Various clients", location: "Dublin and Galway",
     scope: "Call-outs, maintenance, inspection and testing", pm: "Rachel Byrne", start: "1 Jan 2026", end: "31 Dec 2026",
     contract: 170000, complete: 61, programme: 58, cost: 78400, committed: 84000, claimed: 103700, invoiced: 103700, paid: 103700,
     forecastCost: 128350, health: "Green", staff: 5, foreman: "Tadhg Walsh", weekHrs: 200, budgetHrs: 200,
     july: {amount: 4000, status: "Paid"}, loc: "Dublin"})
].map((p) => Object.assign(p, {
  forecastGP: p.contract - p.forecastCost,
  margin: (p.contract - p.forecastCost) / p.contract * 100,
  openCommit: p.committed - p.cost
}));
export const PROJECT = (id) => PROJECTS.find((p) => p.id === id) || PROJECTS[0];
export const SECTORS = ["Residential", "Commercial", "Industrial", "Small Works"];

export const sum = (list, f) => list.reduce((n, x) => n + f(x), 0);
export const TOTALS = (() => {
  const contract = sum(PROJECTS, (p) => p.contract);
  const gp = sum(PROJECTS, (p) => p.forecastGP);
  return {
    count: PROJECTS.length, contract, claimed: sum(PROJECTS, (p) => p.claimed), invoiced: sum(PROJECTS, (p) => p.invoiced),
    paid: sum(PROJECTS, (p) => p.paid), cost: sum(PROJECTS, (p) => p.cost), committed: sum(PROJECTS, (p) => p.committed),
    forecastCost: sum(PROJECTS, (p) => p.forecastCost), forecastGP: gp, margin: gp / contract * 100,
    julyClaimed: sum(PROJECTS, (p) => p.july.amount), people: 43, unallocated: 4820
  };
})();

/* ── CastlePark Manor: the commercial structure from the quote ──────────── */
export const CASTLE_PACKAGES = [
  {id: "cont", name: "Containment", value: 220000, prev: 121000, pct: 70},
  {id: "light", name: "Lighting", value: 310000, prev: 62000, pct: 36},
  {id: "emer", name: "Emergency Lighting", value: 94000, prev: 14100, pct: 28},
  {id: "gens", name: "General Services", value: 340000, prev: 102000, pct: 44},
  {id: "fire", name: "Fire Alarm", value: 118000, prev: 11800, pct: 21},
  {id: "prot", name: "Protective Services", value: 72000, prev: 3600, pct: 15},
  {id: "comm", name: "Communications", value: 86000, prev: 13760, pct: 32},
  {id: "dist", name: "Distribution & Security", value: 600000, prev: 268380, pct: 44.73}
];
/* The claim for a package = value x percent complete, less what was claimed before. */
export const claimFor = (pk, p) => Math.round(pk.value * p / 100) - pk.prev;
export const CASTLE_CLAIM = sum(CASTLE_PACKAGES, (k) => claimFor(k, k.pct));

/* Generic package structure for the other eleven projects (weights from a typical quote). */
const WEIGHTS = [["Containment", 0.12], ["Lighting", 0.17], ["Emergency Lighting", 0.05], ["General Services", 0.18],
  ["Fire Alarm", 0.06], ["Protective Services", 0.04], ["Communications", 0.05], ["Distribution & Security", 0.33]];
const SPREAD = [24, -4, -12, 2, -18, -22, -9, 0];
export const packagesFor = (id) => {
  if (id === "castlepark") return CASTLE_PACKAGES;
  const p = PROJECT(id);
  const earned = Math.round(p.claimed);
  let values = WEIGHTS.map((w) => Math.round(p.contract * w[1] / 100) * 100);
  values[7] += p.contract - sum(values, (x) => x);
  const pcts = SPREAD.map((sp) => Math.max(2, Math.min(100, p.complete + sp)));
  const earnedEach = values.map((v, i) => Math.round(v * pcts[i] / 100));
  earnedEach[7] = earned - sum(earnedEach.slice(0, 7), (x) => x);
  const pkgs = values.map((v, i) => ({id: "p" + i, name: WEIGHTS[i][0], value: v, pct: earnedEach[i] / v * 100}));
  let remaining = p.july.amount;
  const totalEarned = sum(earnedEach, (x) => x);
  pkgs.forEach((k, i) => {
    const share = i === pkgs.length - 1 ? remaining : Math.round(p.july.amount * earnedEach[i] / totalEarned);
    const cur = Math.min(share, earnedEach[i]);
    k.prev = earnedEach[i] - cur; remaining -= cur;
  });
  return pkgs;
};

/* CastlePark site progress by block */
export const CASTLE_BLOCKS = [
  {block: "Block A", work: [["Containment", 92], ["First fix", 81], ["Second fix", 38]]},
  {block: "Block B", work: [["Containment", 61], ["First fix", 40], ["Second fix", 4]]},
  {block: "Block C", work: null}
];
export const CASTLE_COST_SPLIT = {labour: 318900, materials: 331700, other: 41800};

/* ── claims across the portfolio (July) ─────────────────────────────────── */
export const CLAIM_STAGES = ["Draft", "PM Review", "Ready for Approval", "Submitted", "Certified", "Invoice Generated", "Paid"];

/* ── receivables ────────────────────────────────────────────────────────── */
export const INVOICES = [
  {no: "INV-1084", client: "Kellett Construction", project: "castlepark", amount: 176360, due: "28 Aug", status: "Pending", note: "July claim"},
  {no: "INV-1077", client: "Eastpoint Engineering", project: "ringsend", amount: 96400, due: "30 Aug", status: "Pending", note: "June claim"},
  {no: "INV-1072", client: "Northbank Developments", project: "kimmage", amount: 73210, due: "12 Aug", status: "12 days overdue", note: "June claim"},
  {no: "INV-1066", client: "Apex Fit-Out", project: "dundrum", amount: 38950, due: "28 Aug", status: "Pending", note: "June claim"},
  {no: "INV-1081", client: "Northbank Developments", project: "clonskeagh", amount: 16120, due: "6 Sept", status: "Pending", note: "July claim"},
  {no: "INV-1069", client: "Eastpoint Engineering", project: "galway", amount: 12880, due: "31 Aug", status: "Pending", note: "June claim"},
  {no: "INV-1061", client: "Apex Fit-Out", project: "harbour", amount: 82440, due: "7 Aug", status: "Paid", note: "June claim, paid today"},
  {no: "INV-1058", client: "Harbour Developments", project: "maynooth", amount: 61250, due: "4 Aug", status: "Paid", note: "June claim"},
  {no: "INV-1055", client: "Harbour Developments", project: "citywest", amount: 44100, due: "1 Aug", status: "Paid", note: "June claim"},
  {no: "INV-1079", client: "Various clients", project: "smallworks", amount: 4000, due: "20 Aug", status: "Paid", note: "July call-outs"}
];
export const OUTSTANDING = (issuedCastle) => sum(INVOICES.filter((i) => i.status !== "Paid" && (i.no !== "INV-1084" || issuedCastle)), (i) => i.amount);

/* ── purchase orders ────────────────────────────────────────────────────── */
export const POS = [
  {no: "PO-4821", supplier: "CEF", project: "castlepark", item: "Containment materials", value: 12840, status: "Awaiting Approval", date: "Today", due: "Thu"},
  {no: "PO-4823", supplier: "Kellihers", project: "kimmage", item: "Cable and accessories", value: 7420, status: "Awaiting Approval", date: "Today", due: "Fri"},
  {no: "PO-4825", supplier: "Rexel", project: "ringsend", item: "Switchgear components", value: 4420, status: "Awaiting Approval", date: "Today", due: "Next Tue"},
  {no: "PO-4820", supplier: "Kellihers", project: "castlepark", item: "Cable tray fixings", value: 13400, status: "Ordered", date: "Mon", due: "Wed"},
  {no: "PO-4818", supplier: "Prysmian", project: "castlepark", item: "Armoured cable, Block B", value: 18600, status: "Ordered", date: "Fri", due: "Tomorrow"},
  {no: "PO-4816", supplier: "Kellihers", project: "ringsend", item: "Distribution equipment", value: 8960, status: "Ordered", date: "Fri", due: "Tomorrow"},
  {no: "PO-4812", supplier: "Tamlite", project: "castlepark", item: "Luminaires, Block A", value: 22300, status: "Ordered", date: "Wed", due: "Thu"},
  {no: "PO-4809", supplier: "Rexel", project: "harbour", item: "Lighting equipment", value: 14220, status: "Delivered", date: "Tue", due: "Today"},
  {no: "PO-4806", supplier: "Rexel", project: "castlepark", item: "Distribution boards", value: 29100, status: "Part Delivered", date: "Mon", due: "Tomorrow"},
  {no: "PO-4802", supplier: "CEF", project: "maynooth", item: "Containment and fixings", value: 17600, status: "Delivered", date: "Last Fri", due: "Mon"},
  {no: "PO-4799", supplier: "CEF", project: "castlepark", item: "Trunking and conduit", value: 38400, status: "Ordered", date: "Last Thu", due: "Next week"},
  {no: "PO-4795", supplier: "Tamlite", project: "citywest", item: "Emergency luminaires", value: 11850, status: "Delivered", date: "Last Wed", due: "Thu"}
];
export const CASTLE_PO_COUNT = 23;
export const SUPPLIERS = [
  {name: "CEF", cat: "Wholesale", spend: 118400, pos: 31, terms: "30 days", score: "Reliable", trend: "+2.1%"},
  {name: "Rexel", cat: "Wholesale", spend: 96200, pos: 24, terms: "30 days", score: "Reliable", trend: "+0.8%"},
  {name: "Kellihers", cat: "Wholesale", spend: 71800, pos: 22, terms: "30 days", score: "Reliable", trend: "+3.4%"},
  {name: "Prysmian", cat: "Cable", spend: 64300, pos: 9, terms: "45 days", score: "Reliable", trend: "+5.9%"},
  {name: "Tamlite", cat: "Lighting", spend: 52100, pos: 11, terms: "30 days", score: "Late twice", trend: "+0.0%"},
  {name: "Schneider Electric", cat: "Distribution", spend: 38600, pos: 6, terms: "45 days", score: "Reliable", trend: "+1.2%"}
];

/* ── labour ─────────────────────────────────────────────────────────────── */
const FIRST = ["Marty", "Dara", "Sean", "Liam", "Cian", "Padraig", "Brian", "Rory", "Shane", "Mark", "Gary", "Eoin", "Tadhg", "Declan", "Ronan", "Fiachra", "Colm", "Darragh", "Ciaran", "Niall", "Oisin", "Kieran", "Barry", "Jamie", "Lorcan", "Aidan", "Cathal", "Fergal", "Donal", "Peadar", "Ross", "Karl", "Alan", "Gavin", "Trevor", "Damien", "Stephen", "Ivan", "Noel", "Philip", "Evan", "Wayne", "Ben"];
const LAST = ["Byrne", "Kelly", "Murphy", "Doyle", "Dolan", "Nolan", "Heneghan", "Kenny", "Cullen", "Tierney", "Moran", "Brady", "Walsh", "Cassidy", "Farrell", "Gleeson", "Hogan", "Ivers", "Joyce", "Keogh", "Lynch", "Maher", "Noonan", "Orr", "Power", "Quinn", "Rowan", "Sheehy", "Troy", "Ward", "Daly", "Fox", "Healy", "Kane", "Lennon", "McGrath", "Neary", "Reid", "Slevin", "Tobin", "Wynne", "Egan", "Burke"];
const RESERVED = ["Marty Byrne", "Dara Kelly", "Sean Murphy", "Liam Doyle", "Cian Dolan", "Tadhg Walsh", "Padraig Nolan", "Brian Heneghan", "Kevin Byrne", "Conor Fahy", "Niall Regan", "Rory Kenny", "Shane Cullen", "Mark Tierney", "Gary Moran", "Eoin Brady"];
const SITE_SPLIT = [["castlepark", 11], ["ringsend", 10], ["harbour", 8], ["kimmage", 7], ["smallworks", 5], ["maynooth", 1], ["galway", 1]];
const RATES = [31, 29, 32, 33, 30, 28, 34, 27];
export const ON_SITE = (() => {
  const out = [];
  let pool = 0;
  SITE_SPLIT.forEach(([proj, n]) => {
    for (let k = 0; k < n; k++) {
      let name;
      if (k === 0) name = PROJECT(proj).foreman;
      else if (proj === "castlepark" && k === 1) name = "Dara Kelly";
      else {
        do { name = FIRST[(pool * 3 + 7) % FIRST.length] + " " + LAST[(pool * 5 + 11) % LAST.length]; pool++; }
        while (RESERVED.indexOf(name) > -1 || out.some((e) => e.name === name));
      }
      const STORY = {"Marty Byrne": 31, "Dara Kelly": 29, "Sean Murphy": 32, "Liam Doyle": 33};
      const rate = STORY[name] || (k === 0 ? 31 : RATES[out.length % RATES.length]);
      const isSub = k > 1 && out.length % 6 === 4;
      out.push({id: "e" + (out.length + 1), name, project: proj, hours: proj === "harbour" && k === 0 ? 8.5 : 8, rate, sub: isSub,
        role: k === 0 ? "Foreman" : isSub ? "Subcontractor" : k % 3 === 0 ? "Approved electrician" : "Electrician", mate: k % 3 === 2});
    }
  });
  return out;
})();
export const dayCost = (e) => Math.round(e.hours * e.rate);
export const LABOUR_FIX = {employee: "Dara Kelly", project: "castlepark"};
/* Ringsend: the labour variance story */
export const RINGSEND_LABOUR = {allowance: 71200, actual: 79040, variance: 7840};
export const LABOUR_BY_PROJECT = PROJECTS.map((p) => {
  const hrs = p.weekHrs;
  return {id: p.id, name: p.short, hours: hrs, budget: p.budgetHrs, variance: hrs - p.budgetHrs};
});

/* ── fleet and diesel ───────────────────────────────────────────────────── */
export const DIESEL = {month: "October", total: 8420, prev: 7558, deltaPct: 11.4, unallocated: 612, exception: 126.4, card: "0087", place: "Circle K Citywest", time: "21:42", vehicles: 18, perProject: 701};
export const VEHICLES = [
  ["Ford Transit", "241-D-1842", "Marty Byrne", 941], ["Ford Transit", "232-D-7710", "Liam Doyle", 812], ["Renault Trafic", "231-D-4455", "Sean Murphy", 764],
  ["Ford Transit Custom", "222-D-9082", "Cian Dolan", 702], ["VW Crafter", "221-D-3320", "Kevin Byrne", 655], ["Ford Transit", "212-D-5517", "Dara Kelly", 612],
  ["Renault Trafic", "211-D-0198", "Tadhg Walsh", 588], ["Ford Ranger", "232-D-6021", "Conor Fahy", 541], ["VW Transporter", "201-D-8814", "Gary Moran", 502],
  ["Ford Transit", "202-D-4417", "Brian Heneghan", 466], ["Citroen Berlingo", "211-D-2299", "Rory Kenny", 431], ["Ford Transit Connect", "192-D-6630", "Shane Cullen", 398],
  ["Vauxhall Vivaro", "201-D-1507", "Mark Tierney", 352], ["Ford Transit Custom", "181-D-9923", "Eoin Brady", 301], ["Renault Kangoo", "192-D-0471", "Niall Regan", 263],
  ["Ford Transit", "172-D-3340", "Yard spare", 48], ["Ford Transit Connect", "171-D-7782", "Yard spare", 27], ["Renault Kangoo", "161-D-5509", "Yard spare", 17]
].map((v) => ({make: v[0], reg: v[1], driver: v[2], month: v[3]}));
const CARDS = {"Marty Byrne": "0081", "Liam Doyle": "0082", "Sean Murphy": "0083", "Cian Dolan": "0084", "Kevin Byrne": "0085", "Tadhg Walsh": "0086", "Dara Kelly": "0087",
  "Gary Moran": "0088", "Brian Heneghan": "0089", "Rory Kenny": "0090", "Shane Cullen": "0091", "Mark Tierney": "0092", "Eoin Brady": "0093", "Niall Regan": "0094", "Conor Fahy": "0080"};
let spare = 95;
VEHICLES.forEach((v) => { v.card = CARDS[v.driver] || "00" + spare++; });
export const DIESEL_BY_PROJECT = [["castlepark", 1684], ["ringsend", 1402], ["kimmage", 1073], ["harbour", 962], ["maynooth", 604], ["tallaght", 481],
  ["citywest", 392], ["dundrum", 318], ["naas", 297], ["clonskeagh", 224], ["galway", 191], ["smallworks", 180]];
/* Latest transactions. The five with project:null are the unallocated €612. */
export const FUEL_TXNS = [
  {id: "f1", when: "Today 21:42", who: "Dara Kelly", reg: "212-D-5517", card: "0087", place: "Circle K Citywest", litres: 74.1, amount: 126.4, project: null, flag: true},
  {id: "f2", when: "Today 07:18", who: "Marty Byrne", reg: "241-D-1842", card: "0081", place: "Applegreen Dalkey", litres: 52.4, amount: 89.5, project: "castlepark"},
  {id: "f3", when: "Today 06:52", who: "Liam Doyle", reg: "232-D-7710", card: "0082", place: "Topaz Ringsend", litres: 48.0, amount: 82.0, project: "ringsend"},
  {id: "f4", when: "Yesterday 17:40", who: "Cian Dolan", reg: "222-D-9082", card: "0084", place: "Maxol Kimmage", litres: 61.2, amount: 104.5, project: "kimmage"},
  {id: "f5", when: "Yesterday 16:05", who: "Sean Murphy", reg: "231-D-4455", card: "0083", place: "Circle K North Wall", litres: 44.8, amount: 76.5, project: "harbour"},
  {id: "f6", when: "Yesterday 12:12", who: "Tadhg Walsh", reg: "211-D-0198", card: "0086", place: "Applegreen Tallaght", litres: 55.3, amount: 94.3, project: null},
  {id: "f7", when: "Sat 09:30", who: "Gary Moran", reg: "201-D-8814", card: "0088", place: "Topaz Naas Road", litres: 69.4, amount: 118.2, project: null},
  {id: "f8", when: "Fri 18:22", who: "Brian Heneghan", reg: "202-D-4417", card: "0089", place: "Circle K Galway Docks", litres: 77.7, amount: 132.7, project: null},
  {id: "f9", when: "Fri 15:48", who: "Shane Cullen", reg: "192-D-6630", card: "0091", place: "Maxol Citywest", litres: 82.2, amount: 140.4, project: null},
  {id: "f10", when: "Fri 07:25", who: "Kevin Byrne", reg: "221-D-3320", card: "0085", place: "Applegreen Dalkey", litres: 58.1, amount: 99.2, project: "castlepark"},
  {id: "f11", when: "Thu 17:10", who: "Marty Byrne", reg: "241-D-1842", card: "0081", place: "Applegreen Dalkey", litres: 49.6, amount: 84.7, project: "castlepark"},
  {id: "f12", when: "Thu 06:58", who: "Liam Doyle", reg: "232-D-7710", card: "0082", place: "Topaz Ringsend", litres: 51.3, amount: 87.6, project: "ringsend"}
];
export const UNALLOC_FUEL = (alloc) => FUEL_TXNS.filter((t) => !t.project && !alloc[t.id]);

/* ── estimating ─────────────────────────────────────────────────────────── */
export const OPPS = [
  {id: "o1", name: "Data Centre Electrical Package", client: "Eastpoint Engineering", value: 1900000, stage: "Estimating", due: "Fri", est: "Daniel Walsh", sector: "Industrial"},
  {id: "o2", name: "Rathmines Residential Phase II", client: "Kellett Construction", value: 1100000, stage: "Quote Issued", due: "Sent Mon", est: "Sarah Keane", sector: "Residential"},
  {id: "o3", name: "Sandyford Office Campus", client: "Apex Fit-Out", value: 740000, stage: "Estimating", due: "Wed", est: "Daniel Walsh", sector: "Commercial"},
  {id: "o4", name: "Citywest Warehouse Fit-out", client: "Harbour Developments", value: 430000, stage: "Take-off", due: "Next Mon", est: "Sarah Keane", sector: "Commercial"},
  {id: "o5", name: "Blanchardstown Retail Park Units", client: "Apex Fit-Out", value: 380000, stage: "Quote Issued", due: "Sent last Thu", est: "Sarah Keane", sector: "Commercial"},
  {id: "o6", name: "Lucan Housing Phase I", client: "Northbank Developments", value: 640000, stage: "Take-off", due: "Next Wed", est: "Daniel Walsh", sector: "Residential"},
  {id: "o7", name: "Swords Pharma Cleanroom", client: "Eastpoint Engineering", value: 310000, stage: "Estimating", due: "Thu", est: "Daniel Walsh", sector: "Industrial"},
  {id: "o8", name: "Athlone Primary Care Centre", client: "Kellett Construction", value: 290000, stage: "Quote Issued", due: "Sent last Tue", est: "Sarah Keane", sector: "Commercial"},
  {id: "o9", name: "Ballymun Apartments Block D", client: "Northbank Developments", value: 260000, stage: "Take-off", due: "Next Fri", est: "Sarah Keane", sector: "Residential"},
  {id: "o10", name: "Cherrywood School Extension", client: "Harbour Developments", value: 215000, stage: "Estimating", due: "Fri", est: "Daniel Walsh", sector: "Commercial"},
  {id: "o11", name: "Wexford Cold Store", client: "Eastpoint Engineering", value: 195000, stage: "Quote Issued", due: "Sent last Fri", est: "Daniel Walsh", sector: "Industrial"},
  {id: "o12", name: "Terenure Mews, 12 units", client: "Kellett Construction", value: 175000, stage: "Qualifying", due: "TBC", est: "Sarah Keane", sector: "Residential"},
  {id: "o13", name: "Dun Laoghaire Surgery", client: "Apex Fit-Out", value: 85000, stage: "Qualifying", due: "TBC", est: "Sarah Keane", sector: "Commercial"},
  {id: "o14", name: "Swinford Council Depot", client: "Harbour Developments", value: 80000, stage: "Qualifying", due: "TBC", est: "Daniel Walsh", sector: "Commercial"}
];
export const WON_LOST = [
  {name: "Clane Business Park", client: "Apex Fit-Out", value: 520000, result: "Won", date: "Last Tue", reason: "Price and programme"},
  {name: "Santry Cold Chain", client: "Eastpoint Engineering", value: 880000, result: "Lost", date: "Last Mon", reason: "Price, 4.2% above winner"},
  {name: "Inchicore Mews", client: "Northbank Developments", value: 340000, result: "Won", date: "Last week", reason: "Repeat client"},
  {name: "Leixlip Data Hall", client: "Harbour Developments", value: 1250000, result: "Lost", date: "2 weeks ago", reason: "Withdrew, resource clash"},
  {name: "Greystones Surgery", client: "Kellett Construction", value: 160000, result: "Won", date: "2 weeks ago", reason: "Relationship"},
  {name: "Carlow Distribution", client: "Eastpoint Engineering", value: 470000, result: "Lost", date: "3 weeks ago", reason: "Price"}
];
export const COUNTFIRE = {updated: "10:42", estimator: "Daniel Walsh", file: "Sandyford Office Campus.cf", opp: "o3"};
export const SANDYFORD_PACKAGES = [
  {name: "Containment", qty: "2,410 m", value: 82400}, {name: "Lighting", qty: "1,184 fittings", value: 176500}, {name: "Emergency Lighting", qty: "312 fittings", value: 41800},
  {name: "General Services", qty: "1,920 points", value: 148600}, {name: "Fire Alarm", qty: "486 devices", value: 79200}, {name: "Communications and Data", qty: "1,640 points", value: 126900},
  {name: "Protective Services", qty: "38 boards", value: 84600}
];
/* Quoted value includes margin and preliminaries: packages sum 740,000 */

/* ── issues and deliveries ──────────────────────────────────────────────── */
export const ISSUES = [
  {id: "i1", project: "castlepark", title: "Block B containment behind programme", raised: "Kevin Byrne", sev: "Medium", status: "Open", note: "Late access to level 2, two gangs resequenced to Block A."},
  {id: "i2", project: "castlepark", title: "Fire alarm panel lead time", raised: "Marty Byrne", sev: "Low", status: "Open", note: "Supplier confirms 3 weeks, programme needs 4."},
  {id: "i3", project: "ringsend", title: "Labour above monthly allowance", raised: "Ops Watchdog", sev: "Medium", status: "PM review", note: "€7,840 over allowance, driven by switch room rework."},
  {id: "i4", project: "kimmage", title: "INV-1072 overdue 12 days", raised: "Finance Agent", sev: "Medium", status: "Open", note: "Northbank has acknowledged. Payment run expected Friday."},
  {id: "i5", project: "clonskeagh", title: "Cost creep on final fix materials", raised: "Procurement Agent", sev: "Low", status: "Watching", note: "Final fix devices 3.4% above allowance."}
];
export const DELIVERIES = [
  {po: "PO-4818", supplier: "Prysmian", project: "castlepark", item: "Armoured cable, Block B", when: "Tomorrow", status: "On track"},
  {po: "PO-4806", supplier: "Rexel", project: "castlepark", item: "Distribution boards (balance)", when: "Tomorrow", status: "On track"},
  {po: "PO-4816", supplier: "Kellihers", project: "ringsend", item: "Distribution equipment", when: "Tomorrow", status: "On track"},
  {po: "PO-4812", supplier: "Tamlite", project: "castlepark", item: "Luminaires, Block A", when: "Thu", status: "Chase"},
  {po: "PO-4809", supplier: "Rexel", project: "harbour", item: "Lighting equipment", when: "Received 09:42", status: "Received"}
];
export const TODAY_SITES = [
  ["CastlePark Manor", 11, "castlepark"], ["Harbour Exchange", 8, "harbour"], ["Ringsend", 10, "ringsend"],
  ["Kimmage Phase II", 7, "kimmage"], ["Service / small works", 5, "smallworks"], ["Other sites", 2, null]
];

/* ── trends for the dashboard ───────────────────────────────────────────── */
export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
export const CLAIM_TREND = [388, 421, 456, 507, 553, 586, 612];
export const CASH_TREND = [352, 389, 402, 471, 508, 541, 503];
export const REVENUE_YTD = sum(CLAIM_TREND, (x) => x) * 1000;
export const CASH_YTD = sum(CASH_TREND, (x) => x) * 1000;
export const UTILISATION = [["Mon", 91], ["Tue", 94], ["Wed", 93], ["Thu", 95], ["Fri", 88]];

/* ── interactive defaults shared with PulseLogic ────────────────────────── */
export const LAV_DEFAULT = {
  nav: {}, projectId: null, projTab: "overview", dashFilter: "All",
  poApproved: {}, labourAssigned: false, fuelAlloc: {}, quoteDone: {}, converted: {},
  claimStage: {castlepark: "Ready for Approval"}, claimPct: {}, claimDocOpen: false, claimBusy: false, xeroSynced: {},
  projSector: "All", approvalsDone: {}, dashPm: "All", estSector: "All"
};
/* Derived values that depend on what the user has done in the demo. */
export const derive = (s) => {
  const poDone = s.poApproved || {};
  const awaiting = POS.filter((p) => p.status === "Awaiting Approval" && !poDone[p.no]);
  const approvedValue = sum(POS.filter((p) => poDone[p.no]), (p) => p.value);
  const castleApproved = sum(POS.filter((p) => poDone[p.no] && p.project === "castlepark"), (p) => p.value);
  const pcts = Object.assign({}, ...CASTLE_PACKAGES.map((k) => ({[k.id]: k.pct})), s.claimPct || {});
  const castleClaim = sum(CASTLE_PACKAGES, (k) => claimFor(k, pcts[k.id]));
  const unalloc = UNALLOC_FUEL(s.fuelAlloc || {});
  return {
    awaiting, awaitingValue: sum(awaiting, (p) => p.value), approvedValue,
    castleCommitted: PROJECT("castlepark").committed + castleApproved,
    castleOpenCommit: PROJECT("castlepark").openCommit + castleApproved,
    pcts, castleClaim, unallocFuel: unalloc, unallocValue: Math.round(sum(unalloc, (t) => t.amount) * 100) / 100,
    castleStage: (s.claimStage || {}).castlepark || "Ready for Approval",
    unallocCosts: TOTALS.unallocated
  };
};

/* ── CastlePark Manor detail ────────────────────────────────────────────── */
/* This week's labour hours by work package: 412 actual against 388 budget (+24). */
export const CASTLE_LABOUR = CASTLE_PACKAGES.map((k, i) => ({
  id: k.id, name: k.name,
  hours: [104, 88, 14, 96, 22, 12, 26, 50][i],
  budget: [88, 86, 14, 92, 22, 12, 26, 48][i]
}));
/* Materials to date, €331,700 */
export const CASTLE_MATERIALS = [
  ["Containment and fixings", 98400], ["Cable", 84600], ["Luminaires", 61300],
  ["Distribution boards", 42800], ["Fire alarm and comms devices", 29900], ["Sundries", 14700]
];
/* Claim history: three paid claims (total 596,640) then the July claim. */
export const CASTLE_CLAIMS = [
  {no: "Claim 1", period: "April", amount: 118640, stage: "Paid"},
  {no: "Claim 2", period: "May", amount: 214300, stage: "Paid"},
  {no: "Claim 3", period: "June", amount: 263700, stage: "Paid"}
];
export const CASTLE_LAST_UPDATE = {time: "15:18", who: "Kevin Byrne", role: "Project Manager"};
