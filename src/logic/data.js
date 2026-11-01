/* Demo data and pure helpers for the Pulse prototype (Lavelle Electrical Group).
   Every story figure is read from lavelle.js, so a number can only be wrong in one place.
   All values are mock demo data. */
import * as LV from "./lavelle";

const INK="var(--ink)", BODY="var(--body)", DIM="var(--dim)", FAINT="var(--faint)";
const LIME="var(--accent)", GREEN="var(--ok)", AMBER="var(--warn)", RED="var(--bad)", NEUTRAL="var(--neutral)";
const MONO="var(--mono)";

/* ---- story figures, all derived from lavelle.js ---- */
const E = LV.eur, EK = LV.eurK, P = LV.pct, N = LV.num;
const T = LV.TOTALS;
const CP = LV.PROJECT("castlepark"), RS = LV.PROJECT("ringsend"), KM = LV.PROJECT("kimmage"), HX = LV.PROJECT("harbour");
const CLAIM = E(LV.CASTLE_CLAIM);
const CLAIM_PKGS = LV.CASTLE_PACKAGES.map(k => Object.assign({}, k, {claim: LV.claimFor(k, k.pct)}));
const CLAIMED_PKGS = CLAIM_PKGS.filter(k => k.claim > 0);
const TOP_PKGS = CLAIMED_PKGS.slice().sort((a, b) => b.claim - a.claim);
const PO1 = LV.POS.find(p => p.no === "PO-4821");
const AWAIT = LV.POS.filter(p => p.status === "Awaiting Approval");
const AWAIT_VAL = LV.sum(AWAIT, p => p.value);
const INV72 = LV.INVOICES.find(i => i.no === "INV-1072");
const INV84 = LV.INVOICES.find(i => i.no === "INV-1084");
const APEX = LV.INVOICES.find(i => i.no === "INV-1061");
const OPEN_INV = LV.INVOICES.filter(i => i.status !== "Paid" && i.no !== "INV-1084");
const OUTSTANDING = LV.OUTSTANDING(false);
const OVERDUE = LV.INVOICES.filter(i => /overdue/i.test(i.status));
const OVERDUE_VAL = LV.sum(OVERDUE, i => i.amount);
const D = LV.DIESEL, RL = LV.RINGSEND_LABOUR;
const UNALLOC_TXNS = LV.UNALLOC_FUEL({});
const DIESEL_ALLOC = LV.sum(LV.DIESEL_BY_PROJECT, d => d[1]);
const HRS_VAR = CP.weekHrs - CP.budgetHrs;
const HRS_PCT = HRS_VAR / CP.budgetHrs * 100;
const CASTLE_ISSUES = LV.ISSUES.filter(i => i.project === "castlepark");
const CASTLE_TOMORROW = LV.DELIVERIES.filter(d => d.project === "castlepark" && d.when === "Tomorrow");
const BEHIND = LV.PROJECTS.filter(p => p.complete < p.programme).sort((a, b) => (b.programme - b.complete) - (a.programme - a.complete));
const RESI = LV.PROJECTS.filter(p => p.sector === "Residential");
const RESI_CONTRACT = LV.sum(RESI, p => p.contract);
const RESI_MARGIN = LV.sum(RESI, p => p.forecastGP) / RESI_CONTRACT * 100;
const LIVE_LABOUR = LV.LABOUR_BY_PROJECT.filter(l => l.hours > 0);
const LIVE_HRS = LV.sum(LIVE_LABOUR, l => l.hours), LIVE_BUDGET = LV.sum(LIVE_LABOUR, l => l.budget);
const RS_CREW = LV.ON_SITE.filter(e => e.project === "ringsend");
const RS_SUBS = RS_CREW.filter(e => e.sub).length;
const QUOTES_DUE = LV.OPPS.filter(o => /^(Mon|Tue|Wed|Thu|Fri)$/.test(o.due));
const PIPELINE = LV.sum(LV.OPPS, o => o.value);
const SANDYFORD = LV.OPPS.find(o => o.id === LV.COUNTFIRE.opp);
const PRYSMIAN = LV.SUPPLIERS.find(s => s.name === "Prysmian");
const CLONSKEAGH_ISSUE = LV.ISSUES.find(i => i.project === "clonskeagh");
const KIMMAGE_ISSUE = LV.ISSUES.find(i => i.project === "kimmage");
const WIN_RATE = 31; /* story figure: quote win rate, not modelled in lavelle.js */
const CT = LV.CLAIM_TREND, CA = LV.CASH_TREND;
const CLAIM_DELTA = (CT[CT.length - 1] - CT[CT.length - 2]) / CT[CT.length - 2] * 100;
const CASH_DELTA = (CA[CA.length - 1] - CA[CA.length - 2]) / CA[CA.length - 2] * 100;
const UTIL = LV.sum(LV.UTILISATION, u => u[1]) / LV.UTILISATION.length;
const WORDS = ["None","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve"];
const DAY = {Mon:"Monday", Tue:"Tuesday", Wed:"Wednesday", Thu:"Thursday", Fri:"Friday"};
const word = (n) => WORDS[n] || String(n);
const low = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const signed = (n) => (n > 0 ? "+" : n < 0 ? "−" : "") + N(Math.abs(n));
const prjName = (id) => LV.PROJECT(id).name;

const ICONS = {
  navHome:"M12 3.2 3.6 9.1v10a1.5 1.5 0 0 0 1.5 1.5h13.8a1.5 1.5 0 0 0 1.5-1.5v-10L12 3.2Z M8.9 13.1h2l1-2.6 1.5 5 1.1-2.4h1.6",
  navAgents:"M12 2.4v2.3 M12 2.4a.9.9 0 1 0 0-.02 M8.2 6.5h7.6A2.2 2.2 0 0 1 18 8.7v5.1a2.2 2.2 0 0 1-2.2 2.2H8.2A2.2 2.2 0 0 1 6 13.8V8.7a2.2 2.2 0 0 1 2.2-2.2Z M9.9 10.6v1.4 M14.1 10.6v1.4 M6 10h-1.9 M18 10h1.9 M9.2 18.6h5.6 M9.2 21.2h5.6",
  navDash:"M4 5.6h7.2v5.1H4V5.6Z M13.6 5.6H20v8.6h-6.4V5.6Z M4 13.1h7.2v5.3H4v-5.3Z M13.6 16.6H20v1.8h-6.4v-1.8Z",
  navWork:"M9.4 4.4h5.2a1.4 1.4 0 0 1 1.4 1.4v1.1h2.4A1.6 1.6 0 0 1 20 8.5v9.1a1.6 1.6 0 0 1-1.6 1.6H5.6A1.6 1.6 0 0 1 4 17.6V8.5a1.6 1.6 0 0 1 1.6-1.6H8V5.8a1.4 1.4 0 0 1 1.4-1.4Z M8 6.9h8 M9.6 13.3l1.8 1.8 3.4-3.6",
  navRecords:"M12 3.6c3.9 0 7 1.1 7 2.5S15.9 8.6 12 8.6 5 7.5 5 6.1 8.1 3.6 12 3.6Z M5 6.1v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6.1 M5 11.8v5.7c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5.7",
  navActivity:"M4.6 4.6h14.8A1.6 1.6 0 0 1 21 6.2v11.6a1.6 1.6 0 0 1-1.6 1.6H4.6A1.6 1.6 0 0 1 3 17.8V6.2a1.6 1.6 0 0 1 1.6-1.6Z M6 12.4h2.2l1.5-4.1 2.3 8 1.9-5.4 1.2 1.5H18",
  navAdmin:"M12 2.9 5 5.6v5.9c0 4 2.8 7.1 7 8.6 4.2-1.5 7-4.6 7-8.6V5.6L12 2.9Z M12 8.6a2 2 0 1 1 0 4 2 2 0 0 1 0-4Z M8.8 16.3a3.6 3.6 0 0 1 6.4 0",
  /* pencil over a ruler: Countfire take-offs and estimates */
  navEstimating:"M3.5 20.5h17 M5.5 20.5v-2 M9 20.5v-2.6 M12.5 20.5v-2 M16 20.5v-2.6 M6.2 15.2 15.6 5.8a1.8 1.8 0 0 1 2.6 0 1.8 1.8 0 0 1 0 2.6l-9.4 9.4-3.4.8.8-3.4Z M14.2 7.2l2.6 2.6",
  /* tower crane over a site box */
  navProjects:"M6 20.5V4 M6 4h13.5 M6 8.2 10.2 4 M17 4v5.6 M15.4 9.6h3.2v2.8h-3.2V9.6Z M3.5 20.5h17 M12 20.5v-4.8h6v4.8",
  /* invoice with a tick: claims and finance */
  navClaims:"M7 3.5h10v17l-2.5-1.6-2.5 1.6-2.5-1.6L7 20.5v-17Z M9.5 7.6h5 M9.5 10.8h3 M9.6 14.4l1.7 1.7 3.2-3.3",
  /* two people: workforce */
  navWorkforce:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  /* delivery box: procurement */
  navProcurement:"M4 7.8 12 3.5l8 4.3v8.4L12 20.5l-8-4.3V7.8Z M4 7.8l8 4.3 8-4.3 M12 12.1v8.4 M8 5.6l8 4.3",
  /* fuel pump: fleet and diesel */
  navFleet:"M5 20.5V5.2A1.7 1.7 0 0 1 6.7 3.5h6.6A1.7 1.7 0 0 1 15 5.2v15.3 M3.5 20.5h13 M7.5 7h5v4h-5V7Z M15 9.5h1.8a1.7 1.7 0 0 1 1.7 1.7v5a1.3 1.3 0 0 0 2.6 0V8.6l-2.5-2.2",
  helios:"M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-4-.8L3 21l1.9-4.9A8.3 8.3 0 0 1 4 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z M8 12h1.6l1.2-2.6 1.6 5 1.4-2.4H16",
  inbox:"M3 13h4l1.5 3h7l1.5-3h4 M3 13l2.4-7A2 2 0 0 1 7.3 4.6h9.4a2 2 0 0 1 1.9 1.4L21 13v4.4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V13Z",
  work:"M6 4.6h12a1.6 1.6 0 0 1 1.6 1.6v12.2A1.6 1.6 0 0 1 18 20H6a1.6 1.6 0 0 1-1.6-1.6V6.2A1.6 1.6 0 0 1 6 4.6Z M8.4 10.4l1.9 1.9 3.9-3.9 M8.4 15.6h7.2",
  approvals:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  insights:"M4.5 19.5V13 M9.7 19.5V7.5 M14.9 19.5v-8 M20 19.5V5",
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  orgs:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5 M7.5 15.5h2.5",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  locations:"M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z",
  visits:"M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z M9 13.5l1.6 1.6 3.4-3.4",
  autos:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  agents:"M8.5 3.6h7A2.4 2.4 0 0 1 17.9 6v5.6a2.4 2.4 0 0 1-2.4 2.4h-7A2.4 2.4 0 0 1 6.1 11.6V6a2.4 2.4 0 0 1 2.4-2.4Z M9.6 8.2h.01 M14.4 8.2h.01 M12 14v2.6 M7.6 20.4h8.8 M12 16.6c-2.4 0-4.4 1.7-4.4 3.8h8.8c0-2.1-2-3.8-4.4-3.8Z",
  dash:"M4.4 4.4h6v6h-6v-6Z M13.6 4.4h6v3.6h-6V4.4Z M13.6 11.6h6v8h-6v-8Z M4.4 14h6v5.6h-6V14Z",
  files:"M5 7.2a1.8 1.8 0 0 1 1.8-1.8h3l1.8 2.2h5.6A1.8 1.8 0 0 1 19 9.4v7.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 16.8V7.2Z",
  pulseLine:"M2.5 12.5h3.6l2.1-6.4 3.2 12.2 2.6-8.4 1.8 2.6h5.7",
  records:"M6.4 3.6h7.4l4.2 4.2v12.6H6.4V3.6Z M13.4 3.8v4.2h4.2 M9 12.4h6 M9 16h4",
  tree:"M4.5 6h5 M4.5 12h5 M4.5 18h5 M12.5 6h7 M12.5 12h7 M12.5 18h7",
  graph:"M7 7.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M17.6 10.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M9.4 21.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8Z M8.6 6.4l7.6 2.6 M15.8 11.4l-5.6 5.2",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0"
};

/* Ontology stays first and is never removed (PulseLogic enforces this too). */
const REC_SECTIONS = [
  {id:"ontology", label:"Ontology", blurb:"How every record connects: entities, predicates and the paths between them."},
  {id:"files", label:"Files", blurb:"Quotes, contracts, claims and certificates, indexed where Pulse can read them."},
  {id:"contacts", label:"Contacts", blurb:"Every person Lavelle deals with: staff, main contractors and suppliers."}
];

const CONTACTS = [
  ["Martin Lavelle","Managing Director","martin@lavelleelectrical.ie","Lavelle Electrical Group","staff","var(--accent)"],
  ["Kevin Byrne","Senior Project Manager","kevin@lavelleelectrical.ie","Lavelle Electrical Group","staff","#9fd6f0"],
  ["Marty Byrne","Foreman, CastlePark Manor","marty@lavelleelectrical.ie","Lavelle Electrical Group","staff","#e6c78a"],
  ["Dara Kelly","Electrician, CastlePark Manor","dara@lavelleelectrical.ie","Lavelle Electrical Group","staff","#a8e0c0"],
  ["Sean Murphy","Foreman, Harbour Exchange","sean@lavelleelectrical.ie","Lavelle Electrical Group","staff","#c8b4f0"],
  ["Liam Doyle","Foreman, Ringsend Upgrade","liam@lavelleelectrical.ie","Lavelle Electrical Group","staff","#9fd6f0"],
  ["Daniel Walsh","Estimator","daniel@lavelleelectrical.ie","Lavelle Electrical Group","staff","#e6c78a"],
  ["Sarah Keane","Estimator","sarah@lavelleelectrical.ie","Lavelle Electrical Group","staff","#c8b4f0"],
  ["Emma Doyle","Accounts Administrator","emma@lavelleelectrical.ie","Lavelle Electrical Group","staff","#a8e0c0"],
  ["Rachel Byrne","Operations Administrator","rachel@lavelleelectrical.ie","Lavelle Electrical Group","staff","#e2a08c"],
  ["Aidan Kellett","Contracts Manager","aidan@kellettconstruction.ie","Kellett Construction","customer","#9fd6f0"],
  ["Fiona Brennan","Finance Controller","accounts@northbankdevelopments.ie","Northbank Developments","watch","#e6c78a"],
  ["Ciara Whelan","Project Director","ciara@apexfitout.ie","Apex Fit-Out","customer","#a8e0c0"],
  ["Brendan Coyle","Engineering Manager","brendan@eastpointengineering.ie","Eastpoint Engineering","customer","#c8b4f0"],
  ["Orla Hennessy","Development Manager","orla@harbourdevelopments.ie","Harbour Developments","customer","#e2a08c"],
  ["Paddy Moran","Branch Manager","paddy.moran@cef.ie","CEF","supplier","#9fd6f0"],
  ["Joanne Burke","Account Manager","joanne.burke@rexel.ie","Rexel","supplier","#e6c78a"],
  ["Declan Nash","Trade Sales","declan@kellihers.ie","Kellihers","supplier","#a8e0c0"],
  ["Mark Ellis","Key Account Manager","mark.ellis@prysmian.ie","Prysmian","supplier","#c8b4f0"]
];

const FILE_TREE = [
  {type:"folder", id:"f-proj", name:"Projects", depth:0},
  {type:"file", id:"fl-1", name:"CastlePark Manor, quote and contract.pdf", depth:1, parent:"f-proj", indexed:true,
   path:"Projects / CastlePark Manor", title:"CastlePark Manor, quote and contract",
   facts:[["TYPE","PDF, 18 pages"],["VALUE",E(CP.contract)],["CLIENT",CP.client],["OWNER",CP.pm]],
   body:["Full electrical installation at " + CP.location + " for " + CP.client + ", contract value " + E(CP.contract) + ", running " + CP.start + " to " + CP.end + ".",
     "The quote splits the job into " + LV.CASTLE_PACKAGES.length + " work packages. The largest are " + LV.CASTLE_PACKAGES.slice().sort((a, b) => b.value - a.value).slice(0, 3).map(k => k.name + " at " + E(k.value)).join(", ") + ".",
     "Claims are monthly valuations by package: value times percent complete, less what was claimed before. That is the rule the Claims Agent applies."],
   links:[[CP.client,"org"],[CP.pm,"person"],["July claim","claim"]]},
  {type:"file", id:"fl-2", name:"CastlePark Manor, July claim valuation.xlsx", depth:1, parent:"f-proj", indexed:true,
   path:"Projects / CastlePark Manor / Claims", title:"CastlePark Manor, July claim valuation",
   facts:[["TYPE","XLSX, 3 sheets"],["VALUE",CLAIM],["STATUS",CP.july.status],["OWNER",CP.pm]],
   body:["The July valuation comes to " + CLAIM + " across " + low(word(CLAIMED_PKGS.length)) + " packages. " + TOP_PKGS.slice(0, 2).map(k => k.name + " carries " + E(k.claim)).join(" and ") + ".",
     "Recalculated at 11:06 by the Claims Agent from " + CP.pm + "'s site progress. It is waiting on Martin's approval before it goes to " + CP.client + " as " + INV84.no + ".",
     "Claimed to date including July is " + E(CP.claimed) + ", of which " + E(CP.paid) + " has been paid."],
   links:[[CP.client,"org"],[CP.pm,"person"],[INV84.no,"invoice"]]},
  {type:"file", id:"fl-3", name:"CastlePark Manor, Block A test certificates.pdf", depth:1, parent:"f-proj", indexed:true,
   path:"Projects / CastlePark Manor / Certificates", title:"CastlePark Manor, Block A test certificates",
   facts:[["TYPE","PDF, 9 pages"],["BLOCK","Block A"],["INDEXED","All 9 pages"],["OWNER",CP.foreman]],
   body:["Insulation resistance and continuity results for the Block A circuits completed to date. Block A containment is at " + LV.CASTLE_BLOCKS[0].work[0][1] + "% and first fix at " + LV.CASTLE_BLOCKS[0].work[1][1] + "%.",
     "Completion certificates follow second fix, which is at " + LV.CASTLE_BLOCKS[0].work[2][1] + "% in Block A. Block B results are not due yet."],
   links:[[CP.foreman,"person"],[CP.name,"project"]]},
  {type:"folder", id:"f-est", name:"Estimating", depth:0},
  {type:"file", id:"fl-4", name:"Sandyford Office Campus, Countfire take-off.cf", depth:1, parent:"f-est", indexed:true,
   path:"Estimating / " + SANDYFORD.client, title:"Sandyford Office Campus, Countfire take-off",
   facts:[["TYPE","Countfire take-off"],["VALUE",E(SANDYFORD.value)],["UPDATED",LV.COUNTFIRE.updated],["OWNER",LV.COUNTFIRE.estimator]],
   body:["Imported from Countfire at " + LV.COUNTFIRE.updated + ". " + LV.SANDYFORD_PACKAGES.length + " packages: " + LV.SANDYFORD_PACKAGES.map(p => p.name + " (" + p.qty + ")").join(", ") + ".",
     "Quoted value is " + E(LV.sum(LV.SANDYFORD_PACKAGES, p => p.value)) + " including margin and preliminaries. It is due " + (DAY[SANDYFORD.due] || SANDYFORD.due) + " and needs Martin's sign-off before it goes to " + SANDYFORD.client + "."],
   links:[[SANDYFORD.client,"org"],[LV.COUNTFIRE.estimator,"person"]]},
  {type:"folder", id:"f-fin", name:"Finance", depth:0},
  {type:"file", id:"fl-5", name:INV72.no + ".pdf", depth:1, parent:"f-fin", indexed:true,
   path:"Finance / Invoices", title:INV72.no,
   facts:[["TYPE","PDF, 1 page"],["VALUE",E(INV72.amount)],["STATUS",INV72.status],["OWNER","Emma Doyle"]],
   body:["The " + INV72.note + " for " + prjName(INV72.project) + ", issued to " + INV72.client + " and due " + INV72.due + ". It is now " + INV72.status + ".",
     KIMMAGE_ISSUE.note + " A reminder is drafted and waiting for a yes inside the chase workflow."],
   links:[[INV72.client,"org"],["Fiona Brennan","person"],["Chase overdue invoices","workflow"]]},
  {type:"file", id:"fl-6", name:INV84.no + ".pdf", depth:1, parent:"f-fin", indexed:true,
   path:"Finance / Invoices", title:INV84.no + ", draft",
   facts:[["TYPE","PDF, 2 pages"],["VALUE",E(INV84.amount)],["STATUS","Draft, waiting on the claim"],["OWNER","Emma Doyle"]],
   body:["The " + INV84.note + " invoice for " + prjName(INV84.project) + ", to " + INV84.client + ", due " + INV84.due + ".",
     "It is generated from the approved claim, so it stays a draft until Martin approves the " + CLAIM + " valuation. Xero posts it once issued."],
   links:[[INV84.client,"org"],["July claim","claim"]]},
  {type:"file", id:"fl-7", name:"Month-end close.xlsx", depth:1, parent:"f-fin", indexed:false,
   path:"Finance / Close", title:"Month-end close",
   facts:[["TYPE","XLSX, 9 sheets"],["CLAIMED",EK(T.julyClaimed)],["INDEXED","Not indexed"],["OWNER","Emma Doyle"]],
   body:["The working file behind the close. Claims came to " + EK(T.julyClaimed) + " this month against " + EK(CT[CT.length - 2] * 1000) + " last month, with a forecast gross margin of " + P(T.margin) + ".",
     "Spreadsheets are stored but not indexed by default. The numbers Pulse quotes come from Xero and LiveCosts, not from here."],
   links:[["Finance","area"],["Month-end close pack","workflow"]]},
  {type:"folder", id:"f-cert", name:"Certificates and insurance", depth:0},
  {type:"file", id:"fl-8", name:"Public liability insurance 2026.pdf", depth:1, parent:"f-cert", indexed:false,
   path:"Certificates / Insurance", title:"Public liability insurance 2026",
   facts:[["TYPE","PDF, 12 pages"],["COVERS","Dublin and Galway"],["INDEXED","Not indexed"],["OWNER","Rachel Byrne"]],
   body:["Cover for all Lavelle sites and both offices. Not indexed, so Pulse cannot answer questions from it yet.",
     "Indexing it would let the tender follow-up check cover levels before a quote goes to a new main contractor."],
   links:[["Dublin","location"],["Galway","location"],["Insurance and certificate renewal","workflow"]]},
  {type:"file", id:"fl-9", name:"18th Edition qualifications, electricians.pdf", depth:1, parent:"f-cert", indexed:true,
   path:"Certificates / Qualifications", title:"18th Edition qualifications, electricians",
   facts:[["TYPE","PDF, 14 pages"],["COVERS","Employed electricians"],["INDEXED","All 14 pages"],["OWNER","Rachel Byrne"]],
   body:["Wiring regulations qualifications for the employed electricians, one page each, with the issue date.",
     "Subcontractors hold their own and upload them at onboarding. The renewal routine gives sixty days' notice before anything lapses."],
   links:[["Electricians","team"],["Insurance and certificate renewal","workflow"]]},
  {type:"file", id:"fl-10", name:"RECI and ESB Networks registration.pdf", depth:1, parent:"f-cert", indexed:true,
   path:"Certificates / Registration", title:"RECI and ESB Networks registration",
   facts:[["TYPE","PDF, 4 pages"],["COVERS","Lavelle Electrical Group"],["INDEXED","All 4 pages"],["OWNER","Martin Lavelle"]],
   body:["Registered electrical contractor status and the ESB Networks registration used for new connections and completion certs.",
     "Every main contractor asks for it at prequalification, so the tender follow-up attaches it automatically."],
   links:[["Martin Lavelle","person"],["New tender follow-up","workflow"]]}
];

/* Seventeen entity types on a 1000 x 560 canvas, Project at the centre. Predicates
   are edge labels. Every edge is [x1,y1,x2,y2] and must land on node coordinates. */
const ONTO_NODES = [
  ["Project","entity",500,285,1,"The centre of the business. CastlePark Manor is connected to " + CP.client + ", " + CP.pm + ", " + CP.staff + " employees, " + LV.CASTLE_PACKAGES.length + " work packages, " + LV.CASTLE_PO_COUNT + " purchase orders, " + (LV.CASTLE_CLAIMS.length + 1) + " claims, 71 supplier invoices, " + CASTLE_ISSUES.length + " site issues, " + CP.weekHrs + " hours this week."],
  ["Customer","entity",500,30,1,"The main contractor or developer a project is for. " + CP.client + " is the customer on CastlePark Manor; Northbank Developments on Kimmage Phase II."],
  ["Contact","entity",700,30,0,"A person at a customer or supplier. Contacts hang off their organisation, so a chase email always finds the right accounts address."],
  ["Quote","entity",300,30,0,"What was priced and sent. A won quote becomes the project and its packages become the work packages."],
  ["Estimate","module",120,30,0,"Imported from Countfire. Quantities by package roll up into the quote, as with Sandyford Office Campus at " + E(SANDYFORD.value) + "."],
  ["Document","entity",880,30,0,"Contracts, claim valuations, test certificates and insurance, attached to any record. Indexed pages are what Pulse can read."],
  ["Supplier","entity",110,150,0,"CEF, Rexel, Kellihers, Prysmian and others. Price movement is tracked per supplier, such as Prysmian at " + PRYSMIAN.trend + "."],
  ["Purchase Order","ledger",300,150,1,"Raised in LiveCosts against a project and a supplier. " + PO1.no + " is " + E(PO1.value) + " of " + low(PO1.item) + " for CastlePark, waiting on Martin."],
  ["Site","entity",700,150,0,"Where the work happens. One project can have several sites; CastlePark Manor is in " + CP.location + "."],
  ["Employee","entity",890,150,1,"Lavelle staff, clocked in through Sync and assigned to a project. " + T.people + " are on site today."],
  ["Material","entity",100,285,0,"Containment, cable, luminaires and boards, ordered on a purchase order and costed to a work package."],
  ["Work Package","entity",300,285,0,"A priced section of the quote: Containment, Lighting, Fire Alarm and so on. Claims are built per package from percent complete."],
  ["Subcontractor","entity",730,285,0,"Specialist labour on a project alongside employees, with their own rates and paperwork."],
  ["Invoice","ledger",200,430,0,"Read through Xero, which stays the source of truth. " + INV72.no + " to " + INV72.client + " is " + E(INV72.amount) + ", " + INV72.status + "."],
  ["Claim","entity",380,430,1,"A monthly valuation of a project. The CastlePark July claim is " + CLAIM + " and becomes an invoice once approved."],
  ["Vehicle","module",610,430,0,"Vans and pickups, each with a driver and a fuel card. " + D.vehicles + " on the fleet."],
  ["Fuel Card","module",880,430,0,"Every fill is allocated to a project. Card " + D.card + " has " + LV.eur2(D.exception) + " at " + D.place + ", " + D.time + ", that needs allocation."],
  ["client of","predicate",500,157,0,"Project to Customer."],
  ["split into","predicate",400,285,0,"Project to Work Package."],
  ["works on","predicate",615,285,0,"Subcontractor or Employee to Project."],
  ["claimed on","predicate",440,358,0,"Claim to Project."],
  ["fuels","predicate",745,430,0,"Fuel Card to Vehicle."]
];

const ONTO_EDGES = [
  [500,285,500,30],[500,285,300,30],[500,285,700,150],[500,285,300,285],
  [500,285,380,430],[500,285,300,150],[500,285,890,150],[500,285,730,285],
  [500,285,200,430],[500,285,880,430],
  [120,30,300,30],[300,30,500,30],[500,30,700,30],[880,30,890,150],
  [300,150,110,150],[300,150,100,285],[300,285,380,430],[380,430,200,430],
  [890,150,610,430],[610,430,880,430]
];

const REC_TEMPLATES = [
  ["Field sheet","Records","Labelled fields in a grid, the default for a person, customer or site.",
   "M5 5.5h14v13H5v-13Z M5 10h14 M12 10v8.5","grid"],
  ["Contact card","Records","A portrait, key fields and every linked record in one compact panel.",
   "M12 11.5a3.4 3.4 0 1 0 0-6.8 3.4 3.4 0 0 0 0 6.8Z M5.5 19c.8-3 3.3-4.7 6.5-4.7s5.7 1.7 6.5 4.7","card"],
  ["Directory","Records","A sortable table of many records at once, built for lists.",
   "M4.5 6.5h15 M4.5 12h15 M4.5 17.5h15 M4.5 6.5h.01 M4.5 12h.01 M4.5 17.5h.01","rows"],
  ["Timeline","Case work","Ordered events with who did what and when. Good for a site issue or a claim.",
   "M12 3.5v17 M12 7.5h6 M12 13h-6 M12 18h6","timeline"],
  ["Kanban board","Case work","Cards in columns by status. For anything that moves through stages.",
   "M5 5h4.5v14H5V5Z M9.75 5h4.5v9h-4.5V5Z M14.5 5H19v6h-4.5V5Z","kanban"],
  ["Checklist","Case work","Ticked steps in order, with an owner and a due date on each.",
   "M5 6.5h2l1.4 1.4L11 5.5 M5 12.5h2l1.4 1.4 2.6-2.4 M5 18.5h2l1.4 1.4 2.6-2.4 M15 6.5h4 M15 12.5h4 M15 18.5h4","checklist"],
  ["Ledger","Finance","Rows and running totals. For anything with amounts and dates.",
   "M4 6h16 M4 12h16 M4 18h16 M9 3.5v17","ledger"],
  ["Invoice","Finance","Line items, totals and a status, built to be sent, not just stored.",
   "M7 3.5h10v17H7v-17Z M9.5 8h5 M9.5 11.5h5 M9.5 15h3","invoice"],
  ["Document","Notes","Long-form text with linked records pulled out down the side.",
   "M7 3.5h7l5 5v12H7v-17Z M14 3.7v5h5 M10 13h6 M10 16.5h4","document"],
  ["Gallery","Notes","A wall of images and files with a caption on each, for a site or a block.",
   "M4.5 6h6v6h-6V6Z M13.5 6h6v6h-6V6Z M4.5 14h6v4h-6v-4Z M13.5 14h6v4h-6v-4Z","gallery"],
  ["Map & locations","Ops","A pinboard of sites, with the record's fields beside each pin.",
   "M12 21s6.5-5.6 6.5-11a6.5 6.5 0 1 0-13 0C5.5 15.4 12 21 12 21Z M12 12.8a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z","map"],
  ["Schedule","Ops","A calendar of bookings against this record, with recurring rules.",
   "M8 4v3 M16 4v3 M4.5 9.5h15 M6.4 6h11.2A1.9 1.9 0 0 1 19.5 8v10a1.9 1.9 0 0 1-1.9 1.9H6.4A1.9 1.9 0 0 1 4.5 18V8A1.9 1.9 0 0 1 6.4 6Z","schedule"]
];
const REC_TEMPLATE_CATS = ["All","Records","Case work","Finance","Notes","Ops"];

/* ---- admin hub: settings areas in five groups ---- */
const PEOPLE = [
  ["Martin Lavelle","Managing Director","martin@lavelleelectrical.ie","Dublin","active","Admin","2 min ago"],
  ["Kevin Byrne","Senior Project Manager","kevin@lavelleelectrical.ie","Dublin","active","Manager","15:18"],
  ["Emma Doyle","Accounts Administrator","emma@lavelleelectrical.ie","Dublin","active","Manager","14 min ago"],
  ["Daniel Walsh","Estimator","daniel@lavelleelectrical.ie","Dublin","active","Standard","10:42"],
  ["Niall Regan","Project Manager","niall@lavelleelectrical.ie","Galway","active","Manager","1 h ago"],
  ["Rachel Byrne","Operations Administrator","rachel@lavelleelectrical.ie","Dublin","active","Standard","32 min ago"],
  ["Marty Byrne","Foreman, CastlePark Manor","marty@lavelleelectrical.ie","Dublin","active","Standard","3 h ago"],
  ["Aidan Kellett","Contracts Manager, Kellett Construction","aidan@kellettconstruction.ie","External","external","External","Yesterday"],
  ["Fiona Brennan","Finance Controller, Northbank Developments","accounts@northbankdevelopments.ie","External","inactive","External","19 days ago"]
];
const ROLE_LEVELS = ["Admin","Manager","Standard","External"];
const PERM_KEYS = [["view","View records"],["edit","Edit records"],["approve","Approve claims and POs"]];
const GRANT_DEFS = [
  ["view","View records","Read anything in scope"],
  ["edit","Edit records","Create and change records"],
  ["approve","Approve decisions","Say yes to claims and POs"],
  ["pay","Release payments","Send money out"],
  ["export","Export data","Download and share out"],
  ["agents","Manage agents","Create and grant agents"],
  ["settings","Change settings","Modules, roles, integrations"],
  ["audit","Read the audit log","Every action, everyone"]
];
const ROLE_SCOPES = ["All records","Their projects","Assigned only"];
const DEFAULT_PERMS = {Admin:{view:true,edit:true,approve:true}, Manager:{view:true,edit:true,approve:true},
  Standard:{view:true,edit:true,approve:false}, External:{view:true,edit:false,approve:false}};
const INTEGRATIONS = [
  {name:"Xero", blurb:"Invoices, payments and credit notes sync both ways, so the ledger and Pulse never drift. Non-negotiable, and healthy.", tint:"#13b5ea", status:"connected", statusKind:"ok",
   glyph:"M4.5 12a7.5 7.5 0 0 1 12.8-5.3 M19.5 12a7.5 7.5 0 0 1-12.8 5.3 M17.3 4v3.3h-3.3 M6.7 20v-3.3H10",
   lastSync:"2 min ago", usage:E(APEX.amount) + " from Apex Fit-Out confirmed 14:21", auth:"OAuth 2.0", scopes:["Read","Write"]},
  {name:"LiveCosts", blurb:"Purchase orders, material and labour cost by project. LiveCosts stays the system of record; Pulse puts its numbers on a phone screen.", tint:"#f0c04b", status:"connected", statusKind:"ok",
   glyph:"M4 6h16 M4 12h16 M4 18h16 M9 3.5v17",
   lastSync:"4 min ago", usage:LV.CASTLE_PO_COUNT + " CastlePark POs, 71 supplier invoices", auth:"API key", scopes:["Read"]},
  {name:"Countfire", blurb:"Take-offs import as estimates, with quantities by package ready to price.", tint:"#f0994b", status:"connected", statusKind:"ok",
   glyph:"M3.5 20.5h17 M5.5 20.5v-2 M9 20.5v-2.6 M12.5 20.5v-2 M16 20.5v-2.6 M6.2 15.2 15.6 5.8a1.8 1.8 0 0 1 2.6 0 1.8 1.8 0 0 1 0 2.6l-9.4 9.4-3.4.8.8-3.4Z",
   lastSync:"Today " + LV.COUNTFIRE.updated, usage:"Sandyford Office Campus take-off imported", auth:"API key", scopes:["Read"]},
  {name:"Sync", blurb:"Clock in and clock out from site, matched to the project each person is assigned to.", tint:"#6ad0f0", status:"connected", statusKind:"ok",
   glyph:"M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z M12 7.5V12l3 2",
   lastSync:"8 min ago", usage:T.people + " clock records today", auth:"API key", scopes:["Read"]},
  {name:"ServiceM8", blurb:"Legacy CRM and small works jobs. Still connected for history and call-outs while larger projects run through Pulse.", tint:"#9d8cf5", status:"connected", statusKind:"ok",
   glyph:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5",
   lastSync:"22 min ago", usage:"Small works jobs and legacy contacts", auth:"API key", scopes:["Read"]},
  {name:"Microsoft 365", blurb:"Email and calendar in and out of Pulse. Threads attach to the project or invoice they mention, and drafts wait for your yes.", tint:"#5f9cf0", status:"connected", statusKind:"ok",
   glyph:"M4 7.2 12 13 20 7.2 M4 7.2v10.6h16V7.2 M4 7.2 8.5 4h7L20 7.2",
   lastSync:"1 min ago", usage:"Shared accounts and project inboxes", auth:"OAuth 2.0", scopes:["Read","Send"]},
  {name:"WhatsApp", blurb:"Models the Lavelle Projects group flow: site updates and photos filed against the right project. This demo does not connect a live WhatsApp API.", tint:"#25d366", status:"demo", statusKind:"warn",
   glyph:"M4 19.5 5.3 15A7.7 7.7 0 1 1 8.6 18.2L4 19.5Z M8.6 10.3c0 3 2.4 5.4 5.4 5.4",
   lastSync:"Demo data", usage:"Lavelle Projects group, modelled", auth:"Not connected", scopes:[]}
];

/* Background catalogue. Each entry is pure CSS so a tile is the real thing at
   thumbnail size, not a picture of it. */
const BG_DEFS = [
  {id:"bloom", name:"Bloom", cat:"Signature",
   css:"background:radial-gradient(60% 48% at 50% 34%, var(--accent-faint), transparent 72%), radial-gradient(44% 38% at 16% 84%, rgba(255,255,255,.05), transparent 70%)",
   thumb:"background:radial-gradient(62% 58% at 46% 34%, var(--accent-soft), transparent 74%), radial-gradient(50% 46% at 82% 84%, rgba(255,255,255,.08), transparent 72%), var(--surface-2)"},
  {id:"mist", name:"Mist", cat:"Signature",
   css:"background:radial-gradient(52% 44% at 24% 22%, rgba(255,255,255,.07), transparent 70%), radial-gradient(56% 46% at 80% 76%, rgba(255,255,255,.05), transparent 72%)",
   thumb:"background:radial-gradient(58% 52% at 24% 22%, rgba(255,255,255,.16), transparent 72%), radial-gradient(60% 54% at 82% 78%, rgba(255,255,255,.10), transparent 74%), var(--surface-2)"},
  {id:"grid", name:"Grid", cat:"Signature",
   css:"background-image:linear-gradient(var(--border) 1px, transparent 1px),linear-gradient(90deg, var(--border) 1px, transparent 1px);background-size:56px 56px;mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%);-webkit-mask-image:radial-gradient(62% 56% at 50% 46%, #000, transparent 78%)",
   thumb:"background-color:var(--surface-2);background-image:linear-gradient(var(--border-strong) 1px, transparent 1px),linear-gradient(90deg, var(--border-strong) 1px, transparent 1px);background-size:14px 14px"},
  {id:"none", name:"None", cat:"Signature", css:"", thumb:"background:var(--surface-2)"},

  {id:"aurora", name:"Aurora", cat:"Gradient",
   css:"background:radial-gradient(70% 52% at 18% 8%, var(--bloom-a), transparent 66%), radial-gradient(64% 48% at 84% 22%, var(--bloom-b), transparent 68%), radial-gradient(70% 60% at 50% 104%, var(--bloom-c), transparent 70%);filter:blur(24px)",
   thumb:"background:radial-gradient(72% 60% at 16% 6%, var(--bloom-a), transparent 68%), radial-gradient(66% 54% at 86% 24%, var(--bloom-b), transparent 70%), radial-gradient(74% 66% at 50% 108%, var(--bloom-c), transparent 72%), var(--surface-2)"},
  {id:"horizon", name:"Horizon", cat:"Gradient",
   css:"background:linear-gradient(180deg, transparent 0%, var(--accent-faint) 58%, transparent 100%), radial-gradient(90% 40% at 50% 72%, var(--accent-soft), transparent 70%)",
   thumb:"background:linear-gradient(180deg, var(--surface-2) 0%, var(--accent-faint) 58%, var(--surface-2) 100%), radial-gradient(90% 44% at 50% 74%, var(--accent-soft), transparent 70%)"},
  {id:"dusk", name:"Dusk", cat:"Gradient",
   css:"background:linear-gradient(200deg, var(--bloom-c) -10%, transparent 46%), linear-gradient(20deg, var(--bloom-b) -10%, transparent 52%);opacity:.5",
   thumb:"background:linear-gradient(200deg, var(--bloom-c) -12%, transparent 48%), linear-gradient(20deg, var(--bloom-b) -12%, transparent 54%), var(--surface-2)"},
  {id:"ember", name:"Ember", cat:"Gradient",
   css:"background:radial-gradient(60% 70% at 84% 96%, var(--bloom-a), transparent 64%), radial-gradient(50% 60% at 10% 96%, var(--bloom-c), transparent 66%)",
   thumb:"background:radial-gradient(64% 76% at 84% 100%, var(--bloom-a), transparent 66%), radial-gradient(54% 66% at 8% 100%, var(--bloom-c), transparent 68%), var(--surface-2)"},

  {id:"mesh", name:"Mesh", cat:"Abstract",
   css:"background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:22px 22px;mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%);-webkit-mask-image:radial-gradient(70% 62% at 50% 46%, #000, transparent 76%)",
   thumb:"background-color:var(--surface-2);background-image:radial-gradient(var(--border-strong) 1px, transparent 1px);background-size:8px 8px"},
  {id:"contour", name:"Contour", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 30% 110%, transparent 0 22px, var(--border) 22px 23px);mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%);-webkit-mask-image:radial-gradient(80% 70% at 40% 80%, #000, transparent 78%)",
   thumb:"background:repeating-radial-gradient(circle at 26% 116%, var(--surface-2) 0 9px, var(--border-strong) 9px 10px)"},
  {id:"weave", name:"Weave", cat:"Abstract",
   css:"background:repeating-linear-gradient(48deg, transparent 0 16px, var(--border) 16px 17px), repeating-linear-gradient(-48deg, transparent 0 16px, var(--border) 16px 17px);opacity:.7",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(48deg, transparent 0 7px, var(--border-strong) 7px 8px), repeating-linear-gradient(-48deg, transparent 0 7px, var(--border-strong) 7px 8px)"},
  {id:"halo", name:"Halo", cat:"Abstract",
   css:"background:repeating-radial-gradient(circle at 50% 50%, transparent 0 46px, var(--accent-line) 46px 47px);mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%);-webkit-mask-image:radial-gradient(60% 60% at 50% 50%, #000, transparent 72%)",
   thumb:"background:repeating-radial-gradient(circle at 50% 50%, var(--surface-2) 0 11px, var(--accent-line) 11px 12px)"},
  {id:"drift", name:"Drift", cat:"Abstract",
   css:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%);filter:blur(30px);opacity:.6",
   thumb:"background:conic-gradient(from 210deg at 32% 38%, var(--bloom-b), transparent 38%), conic-gradient(from 20deg at 76% 70%, var(--bloom-a), transparent 34%), var(--surface-2)"},
  {id:"scan", name:"Scanlines", cat:"Abstract",
   css:"background:repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 7px);mask-image:linear-gradient(180deg, #000, transparent 88%);-webkit-mask-image:linear-gradient(180deg, #000, transparent 88%)",
   thumb:"background-color:var(--surface-2);background-image:repeating-linear-gradient(0deg, var(--border-strong) 0 1px, transparent 1px 5px)"}
];

const THEMES = [
  {id:"dark", label:"Dark", group:"Dark", bg:"#0b0c0b", surface:"#1a1c19", ink:"#f2f3ef", accent:"#c8f04b"},
  {id:"indigo", label:"Indigo", group:"Dark", bg:"#0a0b13", surface:"#1a1b26", ink:"#f0f1fa", accent:"#8b93ff"},
  {id:"slate", label:"Slate", group:"Dark", bg:"#100e0c", surface:"#211c17", ink:"#f4f0ea", accent:"#e8a14a"},
  {id:"plum", label:"Plum", group:"Dark", bg:"#100a10", surface:"#20151f", ink:"#f6eef4", accent:"#f077b0"},
  {id:"ember", label:"Ember", group:"Dark", bg:"#0b0b0b", surface:"#1c1714", ink:"#f7f3ef", accent:"#f4561a"},
  {id:"harbour", label:"Harbour", group:"Dark", bg:"#0b0e10", surface:"#13171a", ink:"#f3f5f4", accent:"#2ebfa5"},
  {id:"cargo", label:"Cargo", group:"Dark", bg:"#0a0a0a", surface:"#1a1c1a", ink:"#f2f5f2", accent:"#4ade80"},
  {id:"ocean", label:"Ocean", group:"Dark", bg:"#080e12", surface:"#141f25", ink:"#eaf4f8", accent:"#4fd4d0"},
  {id:"graphite", label:"Graphite", group:"Dark", bg:"#111112", surface:"#212124", ink:"#f4f4f5", accent:"#f4f4f5"},
  {id:"light", label:"Cream", group:"Light", bg:"#f4f2ed", surface:"#ffffff", ink:"#16181c", accent:"#0071e3"},
  {id:"warm", label:"Warm paper", group:"Light", bg:"#faf5ec", surface:"#fffdf9", ink:"#2a2016", accent:"#c9683f"},
  {id:"mist", label:"Mist", group:"Light", bg:"#eef1f4", surface:"#ffffff", ink:"#141e20", accent:"#0e9f6e"},
  {id:"sand", label:"Sand", group:"Light", bg:"#f6f1e6", surface:"#fffdf7", ink:"#221d12", accent:"#7d5fd6"}
];

const ADMIN_ICONS = {
  people:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9",
  teams:"M9 12a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 9 12Z M16.5 12.5a2.6 2.6 0 1 0 0-5.2 2.6 2.6 0 0 0 0 5.2Z M2.6 19.6c.8-2.8 3.2-4.4 6.4-4.4s5.6 1.6 6.4 4.4 M17 15.4c2.2.4 3.7 1.8 4.3 4.2",
  structure:"M4.5 20V6.4A1.4 1.4 0 0 1 5.9 5h6.2a1.4 1.4 0 0 1 1.4 1.4V20 M13.5 10.5h4.6A1.4 1.4 0 0 1 19.5 12v8 M3 20h18 M7.5 8.5h2.5 M7.5 12h2.5",
  shield:"M12 3.6 19.5 6v6.1c0 4-3.1 6.9-7.5 8.3-4.4-1.4-7.5-4.3-7.5-8.3V6L12 3.6Z M9.2 12.2l2 2 3.6-3.7",
  agent:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5",
  flow:"M18.5 8.5A5 5 0 0 0 8.9 7.3 3.8 3.8 0 0 0 6 14.6 M8 17.5l3.2 3.2 M11.2 20.7l3.2-3.2 M11.2 20.7V9.6",
  plug:"M9 3.5v5 M15 3.5v5 M6.5 8.5h11v3a5.5 5.5 0 0 1-11 0v-3Z M12 17v3.5",
  modules:"M6.6 4.4h10.8a2.2 2.2 0 0 1 2.2 2.2v10.8a2.2 2.2 0 0 1-2.2 2.2H6.6a2.2 2.2 0 0 1-2.2-2.2V6.6a2.2 2.2 0 0 1 2.2-2.2Z M4.4 9.6h15.2 M9.6 19.6V9.6",
  health:"M3 12.5h3.4l2-5 3 10 2.2-5H21",
  lock:"M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5Z M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3",
  audit:"M8 3.5h8l3.5 3.5v13a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 6 3.5h2Z M9 12h6 M9 16h4",
  brand:"M12 3.5 14.6 9l6.4.6-4.8 4.2 1.4 6.2-5.6-3.3-5.6 3.3 1.4-6.2L3 9.6 9.4 9 12 3.5Z",
  bell:"M6 8.5a6 6 0 0 1 12 0c0 6.5 2.6 8.5 2.6 8.5H3.4S6 15 6 8.5Z M10.3 20.5a1.94 1.94 0 0 0 3.4 0",
  data:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"
};

/* Data health: the issue counts, the severity split and the latest trend point all add up. */
const HEALTH_ISSUES = [
  ["Supplier invoices awaiting a PO match","71","medium","CastlePark supplier invoices from LiveCosts to tie to a work package","Review"],
  ["Unallocated fuel transactions",String(UNALLOC_TXNS.length),"high",E(D.unallocated) + " of diesel with no project, card " + D.card + " included","Allocate"],
  ["Costs with no project code","14","high",E(T.unallocated) + " of cost waiting for a project","Review"],
  ["Duplicate contacts","9","medium","The same person in ServiceM8 and Microsoft 365","Merge"],
  ["Missing required fields","6","medium","Subcontractor records with no Safe Pass expiry","Fix automatically"],
  ["Clock records with no project","1","low","Dara Kelly's Sync record is not assigned to CastlePark labour","Assign"],
  ["Records needing review","4","low","Flagged by an agent as inconsistent","Review"]
];
const HEALTH_TOTAL = LV.sum(HEALTH_ISSUES, i => Number(i[1]));
const HEALTH_SEV = (sev) => String(LV.sum(HEALTH_ISSUES.filter(i => i[2] === sev), i => Number(i[1])));

const ADMIN_CARDS = [
  {id:"people", group:"ORGANISATION", title:"People & access", icon:"people", tint:"#6ad0f0",
   blurb:"Invite, suspend and offboard the people who use Pulse.",
   tags:["55 people","7 teams","2 locations"], badge:"2 waiting", badgeKind:"warn",
   footer:"Last login checked 4 minutes ago", action:"Review 2 invites",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Add, invite or remove employees and subcontractors","",""],["Create teams and departments","7 teams"],["Assign managers","3 project managers"],
     ["Set locations","Dublin and Galway"],["Suspend accounts","1 suspended"],["View last login","55 people tracked"]]},
  {id:"teams", group:"ORGANISATION", title:"Roles & permissions", icon:"shield", tint:"var(--accent)",
   blurb:"Permission templates, and exactly what each person can reach.",
   tags:["4 roles","64 permissions","3 scopes"],
   heroLabel:"THE QUESTION THIS ANSWERS", heroAction:"Show me what someone can access",
   heroText:"Pick a person and see every project, claim, action and export they can reach, resolved through their grants rather than guessed from the menus.",
   footer:"Preview Pulse as another user", action:"Open preview",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Create permission templates","4 in use"],["View, edit, export and delete access","per permission"],
     ["Restrict by team, project or record owner","3 scopes"],["Set approval limits","POs over €10,000 go to Martin"],["Preview Pulse as another user",""]]},
  {id:"structure", group:"ORGANISATION", title:"Company structure", icon:"structure", tint:"#f0c04b",
   blurb:"Who reports to whom, where they work and when.",
   tags:["2 locations","Europe/Dublin","EUR"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Company details","Lavelle Electrical Group"],["Departments","5"],["Teams","7"],["Locations","Dublin, Galway"],
     ["Reporting lines","3 project managers to Martin"],["Working hours","07:30 to 17:00, Mon to Fri"],["Holidays","Irish public holidays"],
     ["Default currency and timezone","EUR, Europe/Dublin"]]},

  {id:"agents", group:"CONTROL", title:"Agents & AI controls", icon:"agent", tint:"var(--accent)",
   blurb:"What agents may read, what they may do, and where they must stop.",
   tags:["8 agents","318 actions today","€0.62 spent"],
   heroLabel:"GLOBAL CONTROL", heroAction:"Pause every agent",
   heroText:"One switch stops every agent immediately. Anything mid-run finishes its current step and then holds.",
   footer:"Write and external tools always need a yes", action:"Review limits",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Create approved agent roles","8 approved"],["Control which data agents can read","by permission"],
     ["Control which actions agents can take","read, write, external"],["Set approval requirements","all write tools", true],
     ["Set spending and usage limits","€40/month cap"],["Manage agent memory and retention","90 days"]]},
  {id:"wf", group:"CONTROL", title:"Workflow controls", icon:"flow", tint:"#9d8cf5",
   blurb:"The guardrails, not the builder. Building happens under Work.",
   tags:["Managers only","2 approval rules","Retry twice"],
   footer:"Building workflows happens in Work", action:"Open Work",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Who can create workflows","Managers only"],["Maximum autonomy","proposes, never sends", true],
     ["Approval rules","claims and POs over €10,000"],["Failure handling","retry twice, then notify"],
     ["Usage limits","500 runs/day"],["Global pause","all workflows", true],["Default notification settings","inbox only"]]},
  {id:"notif", group:"CONTROL", title:"Notifications", icon:"bell", tint:"#f0994b",
   blurb:"Which events reach people, on which channel, and when not to.",
   tags:["Inbox","Email","Quiet 19:00 to 07:00"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Which events trigger notifications","14 of 21 events"],["Email","", true],["WhatsApp (demo flow)","", true],
     ["Mobile push","", false],["In-app","", true],["Escalation rules","after 4 hours unread"],
     ["Quiet hours","19:00 to 07:00"],["Daily and weekly summaries","07:00 daily"]]},

  {id:"integrations", group:"SYSTEMS", title:"Integrations", icon:"plug", tint:"#6ad0f0",
   blurb:"Accounting, project costs, take-offs, timesheets, email and messaging, and which way data flows.",
   tags:["7 connected","Xero two-way","All healthy"],
   footer:"Xero synced 2 minutes ago", action:"View connections",
   listLabel:"CONNECTIONS",
   rows:[["Xero","two-way"],["LiveCosts","project costs, read"],["Countfire","estimates, read"],["Sync","attendance, read"],
     ["ServiceM8","legacy CRM, read"],["Microsoft 365","read and send"],["WhatsApp","demo flow"]]},
  {id:"modules", group:"SYSTEMS", title:"Modules & configuration", icon:"modules", tint:"#f0c04b",
   blurb:"Turn modules on, and make Pulse speak Lavelle's own words.",
   tags:["6 installed","0 available","2 renamed terms"],
   heroLabel:"TERMINOLOGY", heroAction:"Edit terminology",
   heroText:"Organisation reads as Customer, and Job reads as Project, everywhere in the interface, including what Pulse says back to you.",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Enable or disable modules","Estimating, Projects, Claims, Workforce, Procurement, Fleet"],["Rename business terminology","2 overridden"],
     ["Create custom fields","9 fields"],["Configure statuses","claim stages, PO stages"],["Edit record types","17 types"],
     ["Set required information","per record type"],["Manage form layouts","4 layouts"]]},
  {id:"health", group:"SYSTEMS", title:"Data health", icon:"health", tint:"#e2705c",
   blurb:"What is wrong with the data, how bad it is, and the fix.",
   tags:[HEALTH_ISSUES.length + " issue types", HEALTH_TOTAL + " records affected"], badge:UNALLOC_TXNS.length + " to allocate", badgeKind:"warn",
   footer:"Last scanned 12 minutes ago", action:"Fix 1 automatically",
   listLabel:"ISSUES FOUND",
   trend:[168,152,141,133,124,117,HEALTH_TOTAL],
   bySeverity:[["High",HEALTH_SEV("high"),RED],["Medium",HEALTH_SEV("medium"),AMBER],["Low",HEALTH_SEV("low"),DIM]],
   issues:HEALTH_ISSUES,
   rows:[]},

  {id:"security", group:"GOVERNANCE", title:"Security", icon:"lock", tint:"#8fa6ff",
   blurb:"Sign-in, sessions, devices and the keys that reach the API.",
   tags:["SSO on","2FA enforced","3 API keys"], badge:"2 advisories", badgeKind:"warn",
   footer:"2 security recommendations open", action:"Review",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Single sign-on","Microsoft 365", true],["Two-factor authentication","enforced", true],
     ["Login policies","30-day session"],["Active sessions","51"],["Approved devices","44"],
     ["IP restrictions","off", false],["Security alerts","on", true],["API keys","3 active"],
     ["Data retention rules","7 years"]]},
  {id:"audit", group:"GOVERNANCE", title:"Audit log", icon:"audit", tint:"#9d8cf5",
   blurb:"A locked history of who changed what. Searchable, exportable, never editable.",
   tags:["Append-only","7-year retention"],
   footer:"Nobody can edit or delete entries", action:"Export",
   listLabel:"WHAT IS RECORDED",
   rows:[["Permission changes","41 this month"],["Employee access","118"],["Data exports","9"],
     ["Integration changes","6"],["Agent actions","2,140"],["Claim and PO approvals","27"],["Admin changes","12"]]},
  {id:"datamgmt", group:"GOVERNANCE", title:"Data management", icon:"data", tint:"#5fe0a8",
   blurb:"Import, export, restore and, carefully, delete.",
   tags:["Backup 02:00","30-day restore"],
   footer:"Last backup completed 02:00 today", action:"Run backup",
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Import data","CSV, LiveCosts, ServiceM8"],["Export data","full or per module"],["Backup status","healthy, 02:00 daily"],
     ["Restore previous versions","30 days available"],["Merge records","9 candidates"],
     ["Data retention","7 years"],["Delete company data","requires two admins"]]},

  {id:"brand", group:"EXPERIENCE", title:"Branding", icon:"brand", tint:"var(--accent)",
   blurb:"Logo, accent colour, templates and how agents appear.",
   tags:["Teal-green accent","2 templates"],
   listLabel:"WHAT YOU CONTROL HERE",
   rows:[["Company logo","lavelle-mark.png"],["Pulse accent colour","Lavelle teal-green"],
     ["Email templates","3"],["Document templates","claim valuation, quote"],["Agent appearance","12 faces, 6 shells"],
     ["Customer-facing portal branding","on", true]]},
  {id:"appearance", group:"EXPERIENCE", title:"Appearance & themes", icon:"brand", tint:"#6ad0f0",
   blurb:"Pick a light or dark theme for how Pulse looks to you.",
   tags:[THEMES.length + " themes", THEMES.filter(t => t.group === "Dark").length + " dark", THEMES.filter(t => t.group === "Light").length + " light"],
   listLabel:"THEMES", rows:[]}
];

const ADMIN_GROUPS = [
  ["ORGANISATION", "repeat(3,1fr)"],
  ["CONTROL", "repeat(3,1fr)"],
  ["SYSTEMS", "repeat(3,1fr)"],
  ["GOVERNANCE", "repeat(3,1fr)"],
  ["EXPERIENCE", "repeat(3,1fr)"]
];


/* ---- activity feeds ---- */
const SRC_TINT = {LiveCosts:"#f0c04b", Sync:"#6ad0f0", Xero:"#8fa6ff", Countfire:"#f0994b",
  WhatsApp:"#5fe0a8", Email:"#f07a9d", Pulse:"var(--accent)", Agent:"var(--accent)"};
const SRC_ABBR = {LiveCosts:"LC", Sync:"SY", Xero:"XR", Countfire:"CF", WhatsApp:"WA", Email:"EM", Pulse:"PL", Agent:"AI"};

const DATA_EVENTS = [
  ["Clock records imported","Sync imported " + T.people + " employee clock records across seven sites.","Sync",T.people + " employees","Sync","completed"],
  ["Estimate imported","Countfire take-off for Sandyford Office Campus: " + LV.SANDYFORD_PACKAGES.length + " packages, " + E(SANDYFORD.value) + ".",LV.COUNTFIRE.estimator,"Sandyford Office Campus","Countfire","completed"],
  ["Payment confirmed","Xero confirmed " + E(APEX.amount) + " from Apex Fit-Out against " + APEX.no + " at 14:21.","Xero","Harbour Exchange","Xero","completed"],
  ["Delivery received","Rexel lighting equipment on PO-4809 received at Harbour Exchange at 09:42.",HX.foreman,"Harbour Exchange","LiveCosts","completed"],
  ["Purchase order synced",PO1.no + ", " + PO1.supplier + " " + low(PO1.item) + " for " + E(PO1.value) + ", pulled from LiveCosts.","LiveCosts",CP.name,"LiveCosts","completed"],
  ["Supplier invoices updated","CastlePark now carries 71 supplier invoices in LiveCosts, ready to match against POs.","LiveCosts",CP.name,"LiveCosts","completed"],
  ["Site photos filed","Block B containment photos from the Lavelle Projects group filed against CastlePark.",CP.foreman,CP.name,"WhatsApp","completed"],
  ["Email received","Northbank acknowledged " + INV72.no + " and expects a Friday payment run.","accounts@northbankdevelopments.ie",KM.name,"Email","completed"],
  ["Fuel transaction needs allocation",LV.eur2(D.exception) + " on card " + D.card + " at " + D.place + ", " + D.time + ".","Fuel card " + D.card,"Fleet","Pulse","awaiting"]
];

const PEOPLE_EVENTS = [
  ["Kevin Byrne submitted site progress","CastlePark Block A and Block B progress by package, logged at " + LV.CASTLE_LAST_UPDATE.time + ".",LV.CASTLE_LAST_UPDATE.who,CP.name,"Pulse","completed"],
  ["PO-4821 submitted",PO1.supplier + " " + low(PO1.item) + ", " + E(PO1.value) + ". Over €10,000, so it routed to Martin.",CP.pm,CP.name,"Pulse","awaiting"],
  ["Daniel Walsh updated a take-off","Sandyford Office Campus re-measured in Countfire at " + LV.COUNTFIRE.updated + ".",LV.COUNTFIRE.estimator,"Sandyford Office Campus","Countfire","completed"],
  ["Emma Doyle logged a call","Northbank confirmed " + INV72.no + " is going in Friday's payment run.","Emma Doyle","Northbank Developments","Pulse","completed"],
  ["Conor Fahy submitted a claim","Harbour Exchange July claim, " + E(HX.july.amount) + ", submitted to " + HX.client + ".",HX.pm,HX.name,"Pulse","completed"],
  ["Marty Byrne posted a site update","Block B level 2 access is open again. Two gangs back on containment tomorrow.",CP.foreman,CP.name,"WhatsApp","completed"],
  ["Martin Lavelle approved PO-4818","Prysmian armoured cable for Block B, " + E(LV.POS.find(p => p.no === "PO-4818").value) + ".","Martin Lavelle",CP.name,"Pulse","completed"],
  ["Rachel Byrne uploaded a certificate","Public liability insurance for 2026 filed under Certificates.","Rachel Byrne","Lavelle Electrical Group","Pulse","completed"]
];

const AI_EVENTS = [
  ["Ops Watchdog flagged a labour variance","CastlePark is " + HRS_VAR + " hours over this week's " + CP.budgetHrs + "-hour budget, on Block B containment.","Ops Watchdog",CP.name,"Agent","working"],
  ["Claims Agent recalculated the July claim","CastlePark July claim now " + CLAIM + " across " + low(word(CLAIMED_PKGS.length)) + " packages, at 11:06.","Claims Agent",CP.name,"Agent","awaiting"],
  ["Finance Agent matched a payment",E(APEX.amount) + " from Apex Fit-Out reconciled against " + APEX.no + ".","Finance Agent","Apex Fit-Out","Xero","completed"],
  ["Fleet Agent raised a fuel exception","Card " + D.card + ", " + LV.eur2(D.exception) + " at " + D.time + ". Marked needs allocation.","Fleet Agent","Fuel card " + D.card,"Agent","awaiting"],
  ["Procurement Agent spotted a price movement","Prysmian cable is up " + PRYSMIAN.trend + " on recent orders.","Procurement Agent","Prysmian","Agent","working"],
  ["Commercial Agent checked tender deadlines",QUOTES_DUE.length + " quotes due this week, Sandyford first on " + (DAY[SANDYFORD.due] || SANDYFORD.due) + ".","Commercial Agent","Estimating","Agent","working"],
  ["Project Agent read site progress","CastlePark " + CP.complete + "% against " + CP.programme + "% programme after the " + LV.CASTLE_LAST_UPDATE.time + " update.","Project Agent",CP.name,"Agent","working"],
  ["Briefing posted the morning brief","Two items needed Martin. The rest was already handled.","Briefing","Martin Lavelle","Pulse","completed"]
];

const STREAM_DEFS = [
  {id:"data", title:"New data", sub:"Information entering Pulse", pool:DATA_EVENTS, every:3200,
   tint:"#6ad0f0", icon:"M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9 M4.5 12c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3"},
  {id:"people", title:"Employee activity", sub:"Decisions people made", pool:PEOPLE_EVENTS, every:6400,
   tint:"#f0c04b", icon:"M12 12.5a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z M5 20.2c.9-3.1 3.6-4.9 7-4.9s6.1 1.8 7 4.9"},
  {id:"ai", title:"AI activity", sub:"Agents at work", pool:AI_EVENTS, every:4600,
   tint:"var(--accent)", icon:"M2 12h4l2.5-6 3.5 12 3-8 2 2h5"}
];


/* Grouped side rail. {section} entries are headers; PulseLogic keeps Home then Agents at the top. */
const NAV = [
  {section:"CORE"},
  {label:"Home", icon:"helios", page:"Home"},
  {label:"Agents", icon:"navAgents", page:"Agents"},
  {label:"Dashboard", icon:"navDash", page:"Dashboard", dot:true},
  {section:"COMMERCIAL"},
  {label:"Estimating", icon:"navEstimating", page:"Estimating"},
  {label:"Projects", icon:"navProjects", page:"Projects"},
  {label:"Claims & Finance", icon:"navClaims", page:"Claims"},
  {section:"OPERATIONS"},
  {label:"Workforce", icon:"navWorkforce", page:"Workforce"},
  {label:"Procurement", icon:"navProcurement", page:"Procurement"},
  {label:"Fleet & Diesel", icon:"navFleet", page:"Fleet"},
  {section:"PLATFORM"},
  {label:"Work", icon:"navWork", page:"Work"},
  {label:"Records", icon:"navRecords", page:"Records"},
  {label:"Activity", icon:"pulseLine", page:"Activity", dot:true}
];

/* Inbox items follow the real InboxItem shape: what happened, why it matters, what I can do. */
const ITEMS = {
  po:{kind:"Approval", importance:"high", icon:ICONS.approvals, age:"18m",
    title:"Purchase order " + PO1.no + ", " + E(PO1.value),
    why:"Raised by " + CP.pm + " for CastlePark " + low(PO1.item) + ". Over the €10,000 threshold, so it routed to you.",
    detail:PO1.supplier + " containment for Block B, needed on site " + (DAY[PO1.due] || PO1.due) + ". " + word(AWAIT.length) + " POs worth " + E(AWAIT_VAL) + " are waiting on you in total. Approving writes the decision as you and commits it in LiveCosts.",
    actionLabel:"Approve", secondaryLabel:"Request changes", group:"Approvals",
    fields:[{k:"Supplier",v:PO1.supplier},{k:"Project",v:CP.name},{k:"Value",v:E(PO1.value)},{k:"Record",v:PO1.no}],
    history:[{when:"Today 09:12",text:CP.pm + " raised the order in LiveCosts"},{when:"Today 09:12",text:"Routed to Martin Lavelle, over €10,000"}]},
  claim:{kind:"Approval", importance:"high", icon:ICONS.navClaims, age:"11:06",
    title:"CastlePark July claim, " + CLAIM,
    why:"The Claims Agent recalculated it at 11:06 from " + CP.pm + "'s site progress. It needs your approval before it goes to " + CP.client + ".",
    detail:word(CLAIMED_PKGS.length) + " packages claimed, led by " + TOP_PKGS.slice(0, 2).map(k => k.name + " at " + E(k.claim)).join(" and ") + ". Claimed to date becomes " + E(CP.claimed) + " on a " + E(CP.contract) + " contract. Approving raises " + INV84.no + " in Xero.",
    actionLabel:"Approve claim", secondaryLabel:"Open claim builder", group:"Approvals",
    fields:[{k:"Project",v:CP.name},{k:"Customer",v:CP.client},{k:"July claim",v:CLAIM},{k:"Stage",v:CP.july.status}],
    history:[{when:"Today 11:06",text:"Claims Agent recalculated the claim"},{when:"Today 10:58",text:CP.pm + " updated package progress"}]},
  labour:{kind:"Alert", importance:"high", icon:ICONS.health, age:"2h",
    title:"Ringsend labour " + "+" + E(RL.variance) + " over allowance",
    why:"Actual labour is " + E(RL.actual) + " against a monthly allowance of " + E(RL.allowance) + ". It needs " + RS.pm + "'s review.",
    detail:LV.ISSUES.find(i => i.project === "ringsend").note + " The job still forecasts a " + P(RS.margin) + " margin, so this is a watch, not a loss yet.",
    actionLabel:"Send to " + RS.pm, secondaryLabel:"Open Ringsend", group:"Alerts",
    fields:[{k:"Project",v:RS.name},{k:"Allowance",v:E(RL.allowance)},{k:"Actual",v:E(RL.actual)},{k:"Forecast margin",v:P(RS.margin)}],
    history:[{when:"Today 09:30",text:"Ops Watchdog flagged the variance"},{when:"Today 07:48",text:"Sync imported this week's clock records"}]},
  diesel:{kind:"Task", importance:"normal", icon:ICONS.navFleet, age:"Today",
    title:"Diesel needs allocation, " + E(D.unallocated),
    why:word(UNALLOC_TXNS.length) + " fuel transactions have no project. One is card " + D.card + ", " + LV.eur2(D.exception) + " at " + D.place + " at " + D.time + ".",
    detail:"October diesel is " + E(D.total) + ", up " + P(D.deltaPct) + " on September. Allocating these " + low(word(UNALLOC_TXNS.length)) + " clears the " + E(D.unallocated) + " and puts the cost on the right jobs.",
    actionLabel:"Allocate", secondaryLabel:"Open Fleet", group:"Work",
    fields:[{k:"Unallocated",v:E(D.unallocated)},{k:"Transactions",v:String(UNALLOC_TXNS.length)},{k:"Card",v:D.card},{k:"Status",v:"Needs allocation"}],
    history:[{when:"Today",text:"Fleet Agent marked card " + D.card + " needs allocation"},{when:"Yesterday",text:"Four daytime fills arrived with no project code"}]},
  inv:{kind:"Alert", importance:"high", icon:ICONS.inbox, age:"12d",
    title:"Kimmage " + INV72.no + " is " + INV72.status,
    why:E(INV72.amount) + " owed by " + INV72.client + " on the " + INV72.note + " for " + KM.name + ".",
    detail:KIMMAGE_ISSUE.note + " The Finance Agent drafted a reminder and parked it. Sending is a write tool, so it waits for your yes.",
    actionLabel:"Review chase", secondaryLabel:"Snooze to Friday", group:"Automations",
    fields:[{k:"Invoice",v:INV72.no},{k:"Customer",v:INV72.client},{k:"Value",v:E(INV72.amount)},{k:"Due",v:INV72.due}],
    history:[{when:"Today 09:00",text:"Chase overdue invoices drafted a reminder"},{when:"Yesterday",text:"Northbank acknowledged by email"}]}
};
const ORDER = ["claim","po","labour","inv","diesel"];

/* ---- Pulse answers: every figure is read from lavelle.js ---- */
const OPS_ROW = (o) => [o.name, E(o.value), o.due, o.est];
const ANSWERS = {
  castlepark:{tool:"projects_read", effect:"read",
    text:"CastlePark Manor is " + CP.complete + "% complete against " + CP.programme + "% programme progress. Cost to date is " + E(CP.cost) + " with a forecast margin of " + P(CP.margin) + ". The July claim is currently " + CLAIM + " and awaiting Martin's approval. Labour is " + P(HRS_PCT) + " above this month's allowance, primarily due to Block B containment. " + word(CASTLE_TOMORROW.length) + " material deliveries are due tomorrow.",
    cols:["Measure","Value","Against","Note"],
    rows:[["Progress",CP.complete + "%",CP.programme + "% programme","Block B containment behind"],
      ["Cost to date",E(CP.cost),E(CP.committed) + " committed","Forecast final " + E(CP.forecastCost)],
      ["July claim",CLAIM,E(CP.claimed) + " claimed to date","Awaiting Martin's approval"],
      ["Labour this week",CP.weekHrs + " hrs",CP.budgetHrs + " hrs budget","+" + HRS_VAR + " hrs, " + P(HRS_PCT) + " over"]],
    actions:[["Review the July claim",1],["Open CastlePark",0]]},
  today:{tool:"core_briefing", effect:"read",
    text:word(T.count) + " active projects, " + T.people + " people on site and " + EK(T.julyClaimed) + " claimed this month. The CastlePark July claim of " + CLAIM + " is ready for your approval. Ringsend labour is " + E(RL.variance) + " above the monthly allowance, but the job still forecasts " + P(RS.margin) + ". " + E(D.unallocated) + " of diesel is unallocated, " + AWAIT.length + " POs worth " + E(AWAIT_VAL) + " are waiting on you, and Kimmage " + INV72.no + " for " + E(INV72.amount) + " is " + INV72.status + ".",
    cols:["Item","Value","Status","Owner"],
    rows:[["CastlePark July claim",CLAIM,"Ready for approval","Martin Lavelle"],
      ["Ringsend labour","+" + E(RL.variance),"PM review",RS.pm],
      [AWAIT.length + " purchase orders",E(AWAIT_VAL),"Awaiting approval","Martin Lavelle"],
      [INV72.no + ", Kimmage",E(INV72.amount),INV72.status,"Emma Doyle"],
      ["Unallocated diesel",E(D.unallocated),"Needs allocation","Rachel Byrne"]],
    actions:[["Approve the CastlePark claim",1],["Open Dashboard",0]]},
  behind:{tool:"projects_find", effect:"read",
    text:word(BEHIND.length) + " projects are behind programme, none by more than " + (BEHIND[0].programme - BEHIND[0].complete) + " points. " + BEHIND[0].name + " is furthest back at " + BEHIND[0].complete + "% against " + BEHIND[0].programme + "%, then " + BEHIND[1].name + " at " + BEHIND[1].complete + "% against " + BEHIND[1].programme + "%. CastlePark is " + CP.complete + "% against " + CP.programme + "%, with Block B containment the cause.",
    cols:["Project","Complete","Programme","Gap"],
    rows:BEHIND.map(p => [p.name, p.complete + "%", p.programme + "%", "−" + (p.programme - p.complete) + "pt"]),
    actions:[["Open Projects",1],["Ask the Project Agent",0]]},
  margin:{tool:"projects_cost_read", effect:"read",
    text:"Most of this month's margin pressure is labour. Ringsend is " + E(RL.variance) + " above its labour allowance on switch room rework, and still forecasts " + P(RS.margin) + ". CastlePark is " + HRS_VAR + " hours over budget this week (" + P(HRS_PCT) + ") on Block B containment. On Clonskeagh, final fix devices are running " + CLONSKEAGH_ISSUE.note.match(/[\d.]+%/)[0] + " above allowance. Kimmage carries the thinnest forecast margin at " + P(KM.margin) + ".",
    cols:["Project","Driver","Impact","Forecast margin"],
    rows:[[RS.name,"Switch room rework","+" + E(RL.variance) + " labour",P(RS.margin)],
      [CP.name,"Block B containment","+" + HRS_VAR + " hrs this week",P(CP.margin)],
      [prjName("clonskeagh"),"Final fix materials",CLONSKEAGH_ISSUE.note.match(/[\d.]+%/)[0] + " over allowance",P(LV.PROJECT("clonskeagh").margin)],
      [KM.name,"Lowest margin job","Watch",P(KM.margin)]],
    actions:[["Send Ringsend to Kevin",1],["Open Projects",0]]},
  spent:{tool:"projects_cost_read", effect:"read",
    text:E(CP.cost) + " spent on CastlePark Manor to date: " + E(LV.CASTLE_COST_SPLIT.labour) + " labour, " + E(LV.CASTLE_COST_SPLIT.materials) + " materials and " + E(LV.CASTLE_COST_SPLIT.other) + " other. A further " + E(CP.openCommit) + " is committed on open POs, taking committed cost to " + E(CP.committed) + " against a " + E(CP.contract) + " contract. Forecast final cost is " + E(CP.forecastCost) + ".",
    cols:["Cost","To date","Share","Source"],
    rows:[["Labour",E(LV.CASTLE_COST_SPLIT.labour),P(LV.CASTLE_COST_SPLIT.labour / CP.cost * 100),"Sync and LiveCosts"],
      ["Materials",E(LV.CASTLE_COST_SPLIT.materials),P(LV.CASTLE_COST_SPLIT.materials / CP.cost * 100),"LiveCosts"],
      ["Other",E(LV.CASTLE_COST_SPLIT.other),P(LV.CASTLE_COST_SPLIT.other / CP.cost * 100),"LiveCosts"],
      ["Open commitments",E(CP.openCommit),"on order","LiveCosts POs"]],
    actions:[["Open CastlePark costs",1],["Show POs",0]]},
  claim:{tool:"claims_read", effect:"read",
    text:"You can claim " + CLAIM + " on CastlePark for July across " + low(word(CLAIMED_PKGS.length)) + " packages. " + TOP_PKGS[0].name + " and " + TOP_PKGS[1].name + " carry most of it at " + E(TOP_PKGS[0].claim) + " and " + E(TOP_PKGS[1].claim) + ". " + CLAIM_PKGS.filter(k => k.claim === 0).map(k => k.name).join(", ") + " has nothing new to claim this month. The Claims Agent recalculated it at 11:06 from " + CP.pm + "'s site progress.",
    cols:["Package","Complete","Value","July claim"],
    rows:CLAIMED_PKGS.map(k => [k.name, P(k.pct), E(k.value), E(k.claim)]).concat([["Total","","",CLAIM]]),
    actions:[["Approve the claim",1],["Open the claim builder",0]]},
  crew:{tool:"workforce_read", effect:"read",
    text:word(RS_CREW.length) + " people are on site at " + RS.name + " today, with " + RS.foreman + " as foreman. " + word(RS_SUBS) + (RS_SUBS === 1 ? " is a subcontractor" : " are subcontractors") + ". All clocked in through Sync this morning.",
    cols:["Name","Role","Hours","Site"],
    rows:RS_CREW.map(e => [e.name, e.role, e.hours.toFixed(1) + " h", RS.short]),
    actions:[["Open Workforce",1],["Show Ringsend labour",0]]},
  diesel:{tool:"fleet_read", effect:"read",
    text:E(D.total) + " of diesel in " + D.month + ", up " + P(D.deltaPct) + " on September. " + E(DIESEL_ALLOC) + " is allocated across " + low(word(LV.DIESEL_BY_PROJECT.length)) + " projects, led by CastlePark at " + E(LV.DIESEL_BY_PROJECT[0][1]) + ". " + E(D.unallocated) + " is unallocated, including " + LV.eur2(D.exception) + " on fuel card " + D.card + " at " + D.place + " at " + D.time + ", which needs allocation.",
    cols:["Project","Diesel","Share","Note"],
    rows:LV.DIESEL_BY_PROJECT.map(d => [prjName(d[0]), E(d[1]), P(d[1] / D.total * 100), ""])
      .concat([["Unallocated",E(D.unallocated),P(D.unallocated / D.total * 100),"Needs allocation"],["Total",E(D.total),"100%",""]]),
    actions:[["Allocate the " + E(D.unallocated),1],["Open Fleet",0]]},
  overdue:{tool:"invoices_find", effect:"read",
    text:word(OVERDUE.length) + " invoice is overdue: " + INV72.no + " to " + INV72.client + " for " + KM.name + ", " + E(INV72.amount) + ", " + INV72.status + ". " + KIMMAGE_ISSUE.note + " Everything else on the ledger is within terms.",
    cols:["Invoice","Customer","Amount","Status"],
    rows:OPEN_INV.map(i => [i.no, i.client, E(i.amount), i.status]),
    actions:[["Draft a chase to Northbank",1],["Open Claims & Finance",0]]},
  pos:{tool:"procurement_find", effect:"read",
    text:word(AWAIT.length) + " purchase orders worth " + E(AWAIT_VAL) + " are waiting on you. " + PO1.no + " from " + PO1.supplier + " for CastlePark " + low(PO1.item) + " is the largest at " + E(PO1.value) + " and is needed on site " + (DAY[PO1.due] || PO1.due) + ".",
    cols:["PO","Supplier","Project","Value"],
    rows:AWAIT.map(p => [p.no, p.supplier, LV.PROJECT(p.project).short, E(p.value)]),
    actions:[["Approve " + PO1.no,1],["Open Procurement",0]]},
  labour:{tool:"workforce_hours_read", effect:"read",
    text:"Across the " + low(word(LIVE_LABOUR.length)) + " live sites this week: " + N(LIVE_HRS) + " hours against " + N(LIVE_BUDGET) + " budgeted, " + (LIVE_HRS - LIVE_BUDGET) + " over. Ringsend (+" + LV.LABOUR_BY_PROJECT.find(l => l.id === "ringsend").variance + ") and CastlePark (+" + HRS_VAR + ") account for nearly all of it. Harbour Exchange is " + Math.abs(LV.LABOUR_BY_PROJECT.find(l => l.id === "harbour").variance) + " hours under.",
    cols:["Project","Actual","Budget","Variance"],
    rows:LIVE_LABOUR.map(l => [l.name, l.hours + " h", l.budget + " h", signed(l.variance) + " h"]),
    actions:[["Open Workforce",1],["Send Ringsend to Kevin",0]]},
  residential:{tool:"projects_cost_read", effect:"read",
    text:"Residential contracts forecast a " + P(RESI_MARGIN) + " gross margin, contract-weighted across " + low(word(RESI.length)) + " projects worth " + EK(RESI_CONTRACT) + ". " + RESI.slice().sort((a, b) => b.margin - a.margin).map(p => p.short + " " + P(p.margin)).join(", ") + ". Kimmage is the one to watch.",
    cols:["Project","Contract","Forecast GP","Margin"],
    rows:RESI.map(p => [p.name, E(p.contract), E(p.forecastGP), P(p.margin)]),
    actions:[["Open Projects",1],["Compare with commercial",0]]},
  chase:{tool:"core_email_draft", effect:"write", confirm:true,
    confirmSummary:"Send one email to accounts@northbankdevelopments.ie referencing " + INV72.no + " (" + E(INV72.amount) + ", " + KM.name + " " + INV72.note + ", " + INV72.status + "), asking them to confirm Friday's payment run.",
    text:"Drafted. This is a write tool, so I have not sent it. The proposal is stored with the exact arguments, and confirming sends those arguments rather than anything in your reply.",
    actions:[["Confirm and send",1],["Edit draft",0]]},
  sync:{tool:"core_operations_health", effect:"read",
    text:"All seven connections are healthy. Xero synced two minutes ago and confirmed the " + E(APEX.amount) + " payment from Apex Fit-Out at 14:21. LiveCosts, Countfire, Sync, ServiceM8 and Microsoft 365 are connected. WhatsApp runs as a modelled flow for the Lavelle Projects group in this demo.",
    cols:["Connection","Status","Last sync","Direction"],
    rows:INTEGRATIONS.map(i => [i.name, i.status, i.lastSync, i.scopes.length ? i.scopes.join(", ") : "Demo"]),
    actions:[["Open Integrations",1],["Show Xero activity",0]]},
  fallback:{tool:"core_search", effect:"read",
    text:"I can answer that from the projects, claims, invoices and records you have access to. Try CastlePark, claims, labour, diesel, POs or overdue invoices. Everything I reach goes through a registered tool with a declared permission, and a record you may not see comes back as not found.",
    actions:[["What's happening across the business today?",0]]}
};
/* Aliases kept for older readers of the original keys. */
ANSWERS.credit = ANSWERS.overdue;
ANSWERS.jobs = ANSWERS.behind;
ANSWERS.visits = ANSWERS.crew;

// Turns a plain-English filter name into a full dashboard area. No real backend,
// just a seeded generator so the same phrase always produces the same numbers,
// with direction and vocabulary nudged by keywords in the text.
function synthesizeCustomArea(name){
  const trimmed = (name || "").trim();
  if (!trimmed) return null;
  let seed = 0;
  for (let i = 0; i < trimmed.length; i++) seed = (seed * 31 + trimmed.charCodeAt(i)) >>> 0;
  const rnd = (n) => (((seed >>> (n % 24)) ^ (seed << ((n * 7) % 13))) >>> 0) % 997 / 997;
  const lower = trimmed.toLowerCase();
  const has = (...words) => words.some(w => lower.indexOf(w) > -1);
  const growth = has("expansion","growth","launch","scale","pilot","new site","tender","won","grow");
  const risk = has("risk","issue","delay","snag","defect","variance","overrun","slip","late");
  const dir = risk ? -1 : (growth ? 1 : (rnd(2) > 0.45 ? 1 : -1));

  let vocab = "generic";
  if (has("dublin","galway","region","site","sites","block")) vocab = "region";
  else if (has("cost","spend","budget","saving","margin","diesel","fuel")) vocab = "cost";
  else if (has("staff","hiring","team","labour","electrician","subcontractor","headcount")) vocab = "people";
  else if (has("supplier","materials","cable","delivery","fleet","van")) vocab = "ops";
  else if (has("customer","client","contractor","developer")) vocab = "customer";

  const V = {
    region:   {labels:["Live projects","Claims raised","Contract value","Sites active"], unit:"EUR, 30 DAYS"},
    cost:     {labels:["Spend","Cost per project","Savings found","Budget used"], unit:"EUR, 30 DAYS"},
    people:   {labels:["Headcount","Hours on site","Overtime","Utilisation"], unit:"PEOPLE"},
    ops:      {labels:["Deliveries","Lead time","Late deliveries","POs raised"], unit:"DAYS"},
    customer: {labels:["Active customers","Repeat work","Overdue","Win rate"], unit:"CUSTOMERS"},
    generic:  {labels:["Volume","Rate","Cost","Coverage"], unit:"ACTIVITY, 30 DAYS"}
  }[vocab];

  const months = ["Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug"];
  let v0 = 40 + Math.floor(rnd(1) * 220);
  const chart = months.map((m, i) => {
    v0 = Math.max(8, Math.round(v0 * (1 + dir * (0.03 + rnd(i + 3) * 0.07))));
    return [m, v0, String(v0)];
  });
  const metrics = V.labels.map((label, i) => {
    const val = 20 + Math.floor(rnd(i + 5) * 400);
    const pct = 2 + Math.round(rnd(i + 9) * 18);
    const up = dir > 0 ? rnd(i + 12) > 0.25 : rnd(i + 12) > 0.7;
    const bars = [0,1,2,3,4,5,6,7,8].map(k => 0.3 + rnd(i * 3 + k) * 0.7);
    return [label, i === 1 ? pct + "%" : String(val), (up ? "+" : "−") + pct + (i === 1 ? "pt" : "%"), up ? "up" : "down", "vs last month", bars];
  });
  const capName = trimmed.replace(/\b\w/g, c => c.toUpperCase());
  const split = [
    [capName + ", direct", String(Math.round(v0 * 0.5)), "48%", 1],
    ["Existing projects", String(Math.round(v0 * 0.3)), "31%", 0],
    ["Everything else", String(Math.round(v0 * 0.2)), "21%", 0]
  ];
  const table = [1,2,3].map(w => [capName + ", week " + w, String(20 + Math.floor(rnd(20 + w) * 200)),
    (dir > 0 ? "+" : "−") + (3 + Math.floor(rnd(23 + w) * 14)) + "%", "Auto-tagged from records mentioning “" + lower + "”"]);
  table.push(["Everything else", String(20 + Math.floor(rnd(30) * 200)), "0%", "Baseline"]);
  return {
    id: trimmed, label: capName, color: "var(--accent)", owner: "CUSTOM FILTER",
    description: "Generated from “" + trimmed + "”: a plain-English filter, not a registered metric set. Refine it and Pulse will tighten this up.",
    kind: "columns", chartTitle: capName + " over time", chartUnit: V.unit,
    chart, splitTitle: "Where “" + lower + "” shows up", split,
    tableCols: ["Item","Value","Change","Note"], table,
    metrics, legend: [capName, "Projects", "Other"]
  };
}

function pickAnswer(q){
  const s = q.toLowerCase();
  const castle = /castle ?park/.test(s);
  if (/chase|draft|email|remind/.test(s)) return ANSWERS.chase;
  if (/business today|across the business|happening today|today.*business|morning briefing|briefing|what needs me/.test(s)) return ANSWERS.today;
  if (/diesel|fuel|card 0087|0087|fleet|\bvans?\b/.test(s)) return ANSWERS.diesel;
  if (castle && /claim|valuation|invoice/.test(s)) return ANSWERS.claim;
  if (castle && /spent|spend|cost|how much/.test(s)) return ANSWERS.spent;
  if (castle) return ANSWERS.castlepark;
  if (/claim|valuation/.test(s)) return ANSWERS.claim;
  if (/who is|who's|whos|working at|on site at|crew|foreman/.test(s)) return ANSWERS.crew;
  if (/overdue|debtor|owe|outstanding|inv-1072|kimmage|northbank|\binvoices?\b/.test(s)) return ANSWERS.overdue;
  if (/\bpos?\b|purchase order|po-48|approve|approval/.test(s)) return ANSWERS.pos;
  if (/behind|programme|program|slipping|late|delay/.test(s)) return ANSWERS.behind;
  if (/residential|housing|apartments/.test(s)) return ANSWERS.residential;
  if (/margin|losing|lost|leak|profit/.test(s)) return ANSWERS.margin;
  if (/labour|labor|hours|budget|timesheet|ringsend/.test(s)) return ANSWERS.labour;
  if (/sync|xero|integration|connect|livecosts|countfire|servicem8|health/.test(s)) return ANSWERS.sync;
  return ANSWERS.fallback;
}

const ORGS = [
  ["Kellett Construction","Customer",E(INV84.amount),"Not yet due","active"],
  ["Northbank Developments","Customer",E(LV.sum(OPEN_INV.filter(i => i.client === "Northbank Developments"), i => i.amount)),parseInt(INV72.status, 10) + " days","watch"],
  ["Eastpoint Engineering","Customer",E(LV.sum(OPEN_INV.filter(i => i.client === "Eastpoint Engineering"), i => i.amount)),"Within terms","active"],
  ["Apex Fit-Out","Customer",E(LV.sum(OPEN_INV.filter(i => i.client === "Apex Fit-Out"), i => i.amount)),"Within terms","active"],
  ["Harbour Developments","Customer","€0","Paid up","active"],
  ["CEF","Supplier","n/a","n/a","active"]
];
const TEAMS = [
  ["Management","1 member","Martin Lavelle","all core permissions"],
  ["Projects","3 members","Kevin Byrne","core:project:update"],
  ["Estimating","2 members","Daniel Walsh","core:quote:update"],
  ["Accounts","1 member","Emma Doyle","core:invoice:update"],
  ["Administration","1 member","Rachel Byrne","core:record:update"],
  ["Electricians","27 members","Marty Byrne","core:task:update"],
  ["Small Works","5 members","Tadhg Walsh","core:task:update"]
];
const LOCATIONS = [
  ["Dublin","Head office and yard","34 staff","active"],
  ["Galway","Western office","6 staff","active"]
];

const AGENT_DEFS = [
  {id:"briefing", name:"Briefing", shape:"crown-pebble", tint:"#191c1f", state:"complete",
   role:"Reads the whole business every morning and tells Martin the two things that matter",
   when:"07:02", preview:"two things need you: the CastlePark claim and " + PO1.no + ".",
   thread:[
     {kind:"stamp", text:"Today 07:00"},
     {kind:"routine", text:"Ran routine", routine:"Morning briefing"},
     {kind:"agent", text:"morning briefing:", lines:[
       {k:"Projects", v:T.count + " live, " + T.people + " on site, CastlePark " + CP.complete + "% against " + CP.programme + "% programme"},
       {k:"Money", v:EK(T.julyClaimed) + " claimed this month, " + INV72.no + " " + INV72.status},
       {k:"Approvals", v:"CastlePark July claim " + CLAIM + ", " + AWAIT.length + " POs worth " + E(AWAIT_VAL)}]},
     {kind:"agent", text:"two things need you today: the CastlePark July claim and " + PO1.no + " for the Block B containment. everything else is covered."},
     {kind:"user", text:"what's going on at ringsend"},
     {kind:"agent", text:"labour is " + E(RL.variance) + " above the monthly allowance, mostly switch room rework. the job still forecasts " + P(RS.margin) + ", so " + RS.pm + " is reviewing it rather than it being a margin problem yet."}
   ]},
  {id:"watchdog", name:"Ops Watchdog", shape:"shield", tint:"#2b1b1e", state:"attention",
   role:"Watches labour over budget, missing site updates, unusual fuel, late deliveries, missing allocations and slipping projects",
   when:"15:30", preview:"ringsend labour over allowance. card " + D.card + " needs allocation.",
   thread:[
     {kind:"stamp", text:"Today 15:30"},
     {kind:"agent", text:"afternoon sweep:", lines:[
       {k:"Labour", v:"Ringsend +" + E(RL.variance) + " over allowance, CastlePark +" + HRS_VAR + " hrs this week"},
       {k:"Fuel", v:"card " + D.card + ", " + LV.eur2(D.exception) + " at " + D.place + ", " + D.time + ", needs allocation"},
       {k:"Site updates", v:"CastlePark updated at " + LV.CASTLE_LAST_UPDATE.time + " by " + LV.CASTLE_LAST_UPDATE.who},
       {k:"Deliveries", v:"Tamlite luminaires for CastlePark due Thu, worth a chase"}]},
     {kind:"user", text:"who was on card " + D.card},
     {kind:"agent", text:LV.FUEL_TXNS[0].who + "'s van, " + LV.FUEL_TXNS[0].reg + ". it's outside normal hours, so i've marked it needs allocation rather than guessing a project. Rachel can allocate it in one tap."}
   ]},
  {id:"commercial", name:"Commercial Agent", shape:"executive-capsule", tint:"#2a2118", state:"working",
   role:"Tracks tenders, estimates, quotes, win rates and deadlines",
   when:LV.COUNTFIRE.updated, preview:QUOTES_DUE.length + " quotes due this week. Sandyford take-off imported.",
   thread:[
     {kind:"stamp", text:"Today " + LV.COUNTFIRE.updated},
     {kind:"agent", text:"tender board:", lines:[
       {k:"Due this week", v:QUOTES_DUE.length + " quotes: " + QUOTES_DUE.map(o => o.name.split(" ").slice(0, 2).join(" ") + " " + o.due).join(", ")},
       {k:"Pipeline", v:EK(PIPELINE) + " across " + LV.OPPS.length + " opportunities"},
       {k:"Win rate", v:WIN_RATE + "%"}]},
     {kind:"user", text:"is sandyford ready"},
     {kind:"agent", text:"the Countfire take-off came in at " + LV.COUNTFIRE.updated + " from " + LV.COUNTFIRE.estimator + ": " + LV.SANDYFORD_PACKAGES.length + " packages, " + E(SANDYFORD.value) + " quoted. it's due " + (DAY[SANDYFORD.due] || SANDYFORD.due) + " and needs your sign-off before it goes to " + SANDYFORD.client + "."}
   ]},
  {id:"project", name:"Project Agent", shape:"low-dome", tint:"#1b2430", state:"working",
   role:"Follows progress, risk and programme on every live project",
   when:LV.CASTLE_LAST_UPDATE.time, preview:"CastlePark " + CP.complete + "% against " + CP.programme + "%. Block B containment behind.",
   thread:[
     {kind:"stamp", text:"Today " + LV.CASTLE_LAST_UPDATE.time},
     {kind:"agent", text:LV.CASTLE_LAST_UPDATE.who + " submitted CastlePark progress:", lines:LV.CASTLE_BLOCKS.map(b => ({k:b.block,
       v:b.work ? b.work.map(w => w[0] + " " + w[1] + "%").join(", ") : "not started"}))},
     {kind:"agent", text:"overall that's " + CP.complete + "% against " + CP.programme + "% programme. " + CASTLE_ISSUES.length + " open issues: " + CASTLE_ISSUES.map(i => i.title).join("; ") + "."},
     {kind:"user", text:"will block b catch up"},
     {kind:"agent", text:"Block B is the only thing behind. the armoured cable for it, PO-4818, lands tomorrow, and that's what unblocks the next two gangs."}
   ]},
  {id:"claims", name:"Claims Agent", shape:"control-cube", tint:"#16241f", state:"waiting",
   role:"Builds the monthly claim draft for each project from site progress",
   when:"11:06", preview:"July claim recalculated to " + CLAIM + ". waiting on Martin.",
   thread:[
     {kind:"stamp", text:"Today 11:06"},
     {kind:"routine", text:"Ran routine", routine:"Monthly claim draft"},
     {kind:"agent", text:"recalculated the CastlePark July claim from " + CP.pm + "'s progress: " + CLAIM + " across " + low(word(CLAIMED_PKGS.length)) + " packages.",
      lines:TOP_PKGS.slice(0, 3).map(k => ({k:k.name, v:E(k.claim) + " at " + P(k.pct)}))},
     {kind:"agent", text:"it's ready for your approval. once approved it goes to " + CP.client + " as " + INV84.no + " and Xero picks it up."},
     {kind:"user", text:"why is distribution zero"},
     {kind:"agent", text:"Distribution & Security is at " + P(LV.CASTLE_PACKAGES[7].pct, 2) + ", the same as June, so there's nothing new to claim on it this month."}
   ]},
  {id:"finance", name:"Finance Agent", shape:"rim-capsule", tint:"#241b2e", state:"complete",
   role:"Watches invoices, Xero payments and debtors",
   when:"14:21", preview:E(APEX.amount) + " from Apex Fit-Out confirmed in Xero.",
   thread:[
     {kind:"stamp", text:"Today 14:21"},
     {kind:"agent", text:"Xero confirmed " + E(APEX.amount) + " from Apex Fit-Out against " + APEX.no + " for Harbour Exchange.", lines:[
       {k:"Overdue", v:INV72.no + ", Northbank, " + E(INV72.amount) + ", " + INV72.status},
       {k:"Outstanding", v:E(OUTSTANDING) + " across " + OPEN_INV.length + " invoices"}]},
     {kind:"user", text:"chase northbank"},
     {kind:"agent", text:"drafted a reminder to Northbank accounts for " + INV72.no + " and parked it. they've acknowledged it and expect a Friday payment run, so it's a nudge, not a hard chase. sending waits for your yes."}
   ]},
  {id:"procurement", name:"Procurement Agent", shape:"offset-pebble", tint:"#2a2118", state:"thinking",
   role:"Follows POs, suppliers, delivery dates and price movement",
   when:"12:30", preview:AWAIT.length + " POs worth " + E(AWAIT_VAL) + " waiting. Prysmian " + PRYSMIAN.trend + ".",
   thread:[
     {kind:"stamp", text:"Today 12:30"},
     {kind:"agent", text:"purchasing:", lines:[
       {k:"Awaiting", v:AWAIT.map(p => p.no + " " + p.supplier + " " + E(p.value)).join(", ")},
       {k:"Deliveries", v:LV.DELIVERIES.filter(d => d.when === "Tomorrow").map(d => d.supplier).join(", ") + " tomorrow"},
       {k:"Prices", v:"Prysmian " + PRYSMIAN.trend + ", Kellihers " + LV.SUPPLIERS.find(s => s.name === "Kellihers").trend}]},
     {kind:"agent", text:PO1.no + " is the one to clear: the containment is for Block B and the gangs need it " + (DAY[PO1.due] || PO1.due) + "."}
   ]},
  {id:"fleet", name:"Fleet Agent", shape:"tall-unit", tint:"#16241f", state:"waiting",
   role:"Allocates diesel to projects and spots fuel card exceptions",
   when:"Today", preview:E(D.unallocated) + " of diesel unallocated. card " + D.card + " needs allocation.",
   thread:[
     {kind:"stamp", text:"Today 08:10"},
     {kind:"agent", text:D.month + " diesel:", lines:[
       {k:D.month, v:E(D.total) + ", up " + P(D.deltaPct) + " on September"},
       {k:"Unallocated", v:E(D.unallocated) + " across " + UNALLOC_TXNS.length + " transactions"},
       {k:"Exception", v:"card " + D.card + ", " + LV.eur2(D.exception) + ", " + D.place + " " + D.time}]},
     {kind:"agent", text:"card " + D.card + " is the only fill outside normal hours, so it's marked needs allocation. the other " + low(word(UNALLOC_TXNS.length - 1)) + " are daytime fills with no project code. allocating all " + low(word(UNALLOC_TXNS.length)) + " clears the " + E(D.unallocated) + "."}
   ]}
];

const KPI_DEFS = {
  contract:{label:"Live contract value", value:EK(T.contract), delta:T.count + " projects", dir:"up", hint:"active contracts", hero:true},
  claimed:{label:"Claimed this month", value:EK(T.julyClaimed), delta:"+" + P(CLAIM_DELTA), dir:"up", hint:"vs last month"},
  margin:{label:"Forecast gross margin", value:P(T.margin), delta:EK(T.forecastGP) + " GP", dir:"up", hint:"contract-weighted"},
  people:{label:"People on site", value:String(T.people), delta:CP.staff + " at CastlePark", dir:"up", hint:"from Sync, today"},
  issues:{label:"Open issues", value:String(LV.ISSUES.length), delta:CASTLE_ISSUES.length + " at CastlePark", dir:"down", hint:"site and commercial"},
  unalloc:{label:"Unallocated costs", value:E(T.unallocated), delta:E(D.unallocated) + " diesel", dir:"down", hint:"no project code"},
  projects:{label:"Active projects", value:String(T.count), delta:BEHIND.length + " behind programme", dir:"down", hint:"Dublin and Galway"},
  cash:{label:"Cash collected", value:EK(LV.CASH_YTD), delta:"−" + P(Math.abs(CASH_DELTA)), dir:CASH_DELTA >= 0 ? "up" : "down", hint:"year to date"},
  revenue:{label:"Revenue", value:EK(LV.REVENUE_YTD), delta:"+" + P(CLAIM_DELTA), dir:"up", hint:"claimed, year to date"},
  overdue:{label:"Overdue debt", value:E(OVERDUE_VAL), delta:OVERDUE.length + " invoice", dir:"down", hint:INV72.no + ", " + INV72.status},
  jobs:{label:"July claims", value:String(LV.PROJECTS.length), delta:LV.PROJECTS.filter(p => /Certified|Paid|Invoice/.test(p.july.status)).length + " certified or paid", dir:"up", hint:"one per live project"},
  nps:{label:"Quote win rate", value:WIN_RATE + "%", delta:QUOTES_DUE.length + " due this week", dir:"up", hint:"tenders won"},
  pipeline:{label:"Open pipeline", value:EK(PIPELINE), delta:LV.OPPS.length + " opportunities", dir:"up", hint:"estimating and quoted"},
  utilisation:{label:"Labour utilisation", value:P(UTIL, 0), delta:"Fri " + LV.UTILISATION[4][1] + "%", dir:"down", hint:"billable share, this week"}
};

/* The old dashboard areas are replaced by the module system. These five stay so
   any remaining reader renders real Lavelle data rather than crashing. */
const BARS = (vals) => { const m = Math.max.apply(null, vals); return vals.map(v => +(v / m).toFixed(2)); };
const SECTOR_SPLIT = LV.SECTORS.map((s, i) => {
  const c = LV.sum(LV.PROJECTS.filter(p => p.sector === s), p => p.contract);
  return [s, EK(c), P(c / T.contract * 100, 0), i === 0 ? 1 : 0];
});
const STAGE = (st) => LV.OPPS.filter(o => st.indexOf(o.stage) > -1);
const ASPECT_DEFS = [
  {id:"executive", label:"Executive", color:"var(--accent)", owner:"MARTIN LAVELLE", description:"The whole business: contract value, claims, margin and people on site.",
   kind:"columns", chartTitle:"Claimed by month", chartUnit:"EUR",
   chart:LV.MONTHS.map((m, i) => [m, CT[i], "€" + CT[i] + "k"]),
   splitTitle:"Contract value by sector", split:SECTOR_SPLIT,
   tableCols:["Project","Contract","Margin","PM"],
   table:LV.PROJECTS.slice().sort((a, b) => b.contract - a.contract).slice(0, 4).map(p => [p.name, E(p.contract), P(p.margin), p.pm]),
   metrics:[["Live contract value",EK(T.contract),T.count + " projects","up","active",BARS(CT)],
     ["Claimed this month",EK(T.julyClaimed),"+" + P(CLAIM_DELTA),"up","vs last month",BARS(CT)],
     ["Forecast margin",P(T.margin),EK(T.forecastGP) + " GP","up","contract-weighted",[.7,.72,.7,.74,.72,.76,.74,.78,.8]],
     ["People on site",String(T.people),CP.staff + " at CastlePark","up","today",BARS(LV.UTILISATION.map(u => u[1]))]]},
  {id:"projects", label:"Projects", color:"#9fd6f0", owner:"KEVIN BYRNE", description:"Progress against programme on every live project.",
   kind:"rows", rows:LV.PROJECTS.slice(0, 5).map(p => [p.short, p.complete + "% of " + p.programme + "%", p.complete]),
   chartTitle:"Labour hours this week", chartUnit:"HOURS",
   chart:LIVE_LABOUR.map(l => [l.name, l.hours, String(l.hours)]),
   splitTitle:"Project health",
   split:["Green","Amber"].map((h, i) => [h, String(LV.PROJECTS.filter(p => p.health === h).length), P(LV.PROJECTS.filter(p => p.health === h).length / T.count * 100, 0), i === 0 ? 1 : 0]),
   tableCols:["Project","Complete","Gap","PM"],
   table:BEHIND.slice(0, 4).map(p => [p.name, p.complete + "%", "−" + (p.programme - p.complete) + "pt", p.pm]),
   metrics:[["Active projects",String(T.count),BEHIND.length + " behind","down","programme",BARS(LV.PROJECTS.map(p => p.complete))],
     ["CastlePark",CP.complete + "%","−" + (CP.programme - CP.complete) + "pt","down","vs programme",BARS(LV.CASTLE_PACKAGES.map(k => k.pct))],
     ["Open issues",String(LV.ISSUES.length),CASTLE_ISSUES.length + " CastlePark","down","site and commercial",[.4,.5,.4,.6,.5,.6,.7,.6,.7]],
     ["Hours vs budget",N(LIVE_HRS),"+" + (LIVE_HRS - LIVE_BUDGET) + " h","down","this week",BARS(LIVE_LABOUR.map(l => l.hours))]]},
  {id:"commercial", label:"Commercial", color:"#e6c78a", owner:"DANIEL WALSH", description:"Tenders, take-offs and quotes on the way to a win.",
   kind:"funnel",
   funnel:[["Opportunities",String(LV.OPPS.length),"in the pipeline",LV.OPPS.length],
     ["Taken off",String(STAGE(["Take-off","Estimating","Quote Issued"]).length),"measured in Countfire",STAGE(["Take-off","Estimating","Quote Issued"]).length],
     ["Priced",String(STAGE(["Estimating","Quote Issued"]).length),"estimating or quoted",STAGE(["Estimating","Quote Issued"]).length],
     ["Quote issued",String(STAGE(["Quote Issued"]).length),"waiting on the client",STAGE(["Quote Issued"]).length]],
   chartTitle:"Pipeline by stage", chartUnit:"EUR",
   chart:["Qualifying","Take-off","Estimating","Quote Issued"].map(st => { const v = Math.round(LV.sum(STAGE([st]), o => o.value) / 1000); return [st, v, "€" + v + "k"]; }),
   splitTitle:"Pipeline by sector",
   split:LV.SECTORS.filter(s => s !== "Small Works").map((s, i) => { const v = LV.sum(LV.OPPS.filter(o => o.sector === s), o => o.value); return [s, EK(v), P(v / PIPELINE * 100, 0), i === 0 ? 1 : 0]; }),
   tableCols:["Tender","Value","Due","Estimator"],
   table:QUOTES_DUE.map(OPS_ROW),
   metrics:[["Open pipeline",EK(PIPELINE),LV.OPPS.length + " opportunities","up","quoted and estimating",[.4,.5,.46,.6,.55,.66,.7,.76,.86]],
     ["Quotes due",String(QUOTES_DUE.length),"this week","up","deadlines",[.3,.4,.5,.4,.6,.5,.7,.6,.8]],
     ["Win rate",WIN_RATE + "%","tenders won","up","rolling",[.5,.48,.52,.5,.54,.52,.56,.55,.58]],
     ["Sandyford",EK(SANDYFORD.value),"due " + SANDYFORD.due,"up","Countfire " + LV.COUNTFIRE.updated,BARS(LV.SANDYFORD_PACKAGES.map(p => p.value))]]},
  {id:"operations", label:"Operations", color:"#dcded6", owner:"RACHEL BYRNE", description:"People on site, hours against budget and the fleet.",
   kind:"stacked", legend:["Within budget","Over budget","Unused budget"],
   stacked:LIVE_LABOUR.filter(l => l.hours >= 100).map(l => [l.name, [Math.min(l.hours, l.budget), Math.max(0, l.hours - l.budget), Math.max(0, l.budget - l.hours)]]),
   chartTitle:"Labour utilisation by day", chartUnit:"%",
   chart:LV.UTILISATION.map(u => [u[0], u[1], u[1] + "%"]),
   splitTitle:"People on site today",
   split:LV.TODAY_SITES.map((s, i) => [s[0], String(s[1]), P(s[1] / T.people * 100, 0), i === 0 ? 1 : 0]),
   tableCols:["Site","People","Hours vs budget","Foreman"],
   table:["castlepark","ringsend","harbour","kimmage"].map(id => { const p = LV.PROJECT(id); return [p.name, String(p.staff), signed(p.weekHrs - p.budgetHrs) + " h", p.foreman]; }),
   metrics:[["People on site",String(T.people),"7 sites","up","today",BARS(LV.TODAY_SITES.map(s => s[1]))],
     ["Hours vs budget","+" + (LIVE_HRS - LIVE_BUDGET) + " h",P((LIVE_HRS - LIVE_BUDGET) / LIVE_BUDGET * 100),"down","this week",BARS(LIVE_LABOUR.map(l => l.hours))],
     ["Diesel, " + D.month,E(D.total),"+" + P(D.deltaPct),"down","vs September",BARS(LV.DIESEL_BY_PROJECT.map(d => d[1]))],
     ["Utilisation",P(UTIL, 0),"Fri " + LV.UTILISATION[4][1] + "%","down","billable",BARS(LV.UTILISATION.map(u => u[1]))]]},
  {id:"finance", label:"Finance", color:"#7fd8a4", owner:"EMMA DOYLE", description:"Cash in, receivables and what is overdue.",
   kind:"area", chartTitle:"Cash collected by month", chartUnit:"EUR",
   chart:LV.MONTHS.map((m, i) => [m, CA[i], "€" + CA[i] + "k"]),
   splitTitle:"Receivables by status",
   split:[["Within terms",EK(OUTSTANDING - OVERDUE_VAL),P((OUTSTANDING - OVERDUE_VAL) / OUTSTANDING * 100, 0),1],
     ["Overdue",EK(OVERDUE_VAL),P(OVERDUE_VAL / OUTSTANDING * 100, 0),0]],
   tableCols:["Invoice","Amount","Days","Customer"],
   table:OPEN_INV.map(i => [i.no, E(i.amount), /overdue/i.test(i.status) ? "−" + parseInt(i.status, 10) + " days" : "Due " + i.due, i.client]),
   metrics:[["Cash collected",EK(LV.CASH_YTD),"−" + P(Math.abs(CASH_DELTA)),"down","last month",BARS(CA)],
     ["Outstanding",EK(OUTSTANDING),OPEN_INV.length + " invoices","up","excluding July CastlePark",[.5,.56,.5,.62,.58,.68,.66,.74,.8]],
     ["Overdue",E(OVERDUE_VAL),OVERDUE.length + " invoice","down","Kimmage",[.3,.34,.4,.38,.46,.5,.6,.7,.84]],
     ["Paid today",E(APEX.amount),"Apex Fit-Out","up","Xero 14:21",[.4,.44,.42,.5,.52,.6,.62,.7,.9]]]}
];

const FILTER_GROUPS = [
  {title:"AREA", items:ASPECT_DEFS.map(a => a.label)},
  {title:"SPINE", items:["Project","Customer","Site","Employee","Supplier"]},
  {title:"TIME", items:["This week","This month","This quarter","Year to date"]}
];

const OPS_DEFS = [
  {id:"o1", name:"Weekly management report", kind:"report", owner:"Briefing", ownerKind:"agent", initials:"BR",
   trigger:"Mon, 07:30", triggerKind:"schedule", next:"3 days", last:"Sent to 4 people", status:"healthy", rate:98, on:true,
   what:"Pulls last week's numbers from every project, writes the commentary and sends one page to Martin and the project managers before Monday's meeting.",
   why:"The meeting used to start with twenty minutes of people reading LiveCosts off their own screens.",
   saved:"6 hours a month",
   steps:[["Trigger","Every Monday at 07:30"],["Find","Last week's progress, cost and labour by project"],["Check","Flag anything moving more than 10%"],["Draft","Write the one-page commentary"],["Send","Email Martin and the project managers"],["Update","File the report against the week"]],
   runs:[["Mon 07:30","1m 12s","ok","4 recipients","€0.04"],["Mon 07:30","1m 04s","ok","4 recipients","€0.04"],["Mon 07:30","58s","ok","4 recipients","€0.03"]]},
  {id:"o2", name:"Monthly claim draft from site progress", kind:"automation", owner:"Claims Agent", ownerKind:"agent", initials:"CA",
   trigger:"Month end, 09:00", triggerKind:"schedule", next:"Today", last:CLAIM + " waiting on Martin", status:"approval", rate:97, on:true,
   what:"Reads each project's package progress, works out value times percent complete less what was claimed before, and builds the claim draft for approval.",
   why:"Claims were built in a spreadsheet the night before they were due, and packages got missed.",
   saved:"14 hours a month",
   steps:[["Trigger","Last week of the month"],["Find","Package progress from the project manager"],["Check","Percent complete against the contract value"],["Draft","Build the claim per package"],["Approval","Martin approves the claim","gate"],["Send","Issue to the main contractor"],["Update","Raise the invoice in Xero","external"]],
   runs:[["Today 11:06","48s","ok","CastlePark " + CLAIM,"€0.04"],["Today 10:40","51s","ok","11 projects drafted","€0.05"],["Last month","46s","ok","12 claims drafted","€0.05"]]},
  {id:"o3", name:"Chase overdue invoices", kind:"automation", owner:"Finance Agent", ownerKind:"agent", initials:"FA",
   trigger:"Daily, 09:00", triggerKind:"schedule", next:"Tomorrow", last:"1 draft waiting", status:"approval", rate:96, on:true,
   what:"Finds invoices past their due date, excludes anything in dispute, drafts a reminder in Lavelle's tone and parks it for a yes.",
   why:"Chasing happened in bursts, so the oldest debt got the least attention.",
   saved:"8 hours a month",
   steps:[["Trigger","Every weekday at 09:00"],["Find","Invoices past their due date in Xero"],["Check","Exclude disputed invoices"],["Draft","Write the reminder"],["Approval","Emma or Martin reviews","gate"],["Send","Email the customer"],["Update","Log the chase against the invoice"]],
   runs:[["Today 09:00","38s","ok","1 drafted, " + INV72.no,"€0.02"],["Yesterday 09:00","41s","ok","1 drafted","€0.02"],["Mon 09:00","36s","ok","0 overdue","€0.01"]]},
  {id:"o4", name:"New tender follow-up", kind:"automation", owner:"Commercial Agent", ownerKind:"agent", initials:"CM",
   trigger:"Quote issued", triggerKind:"event", next:"Event-based", last:"2 follow-ups sent", status:"healthy", rate:99, on:true,
   what:"Seven days after a quote goes out, drafts a follow-up to the main contractor with the RECI registration and insurance attached.",
   why:"Quotes went quiet after sending, and nobody knew which ones were still live.",
   saved:"5 hours a month",
   steps:[["Trigger","A quote is issued"],["Find","The client contact on the tender"],["Check","Seven days with no reply"],["Draft","Write the follow-up"],["Send","Email the client"],["Update","Log it on the opportunity"]],
   runs:[["Today 10:12","6s","ok","1 follow-up","€0.01"],["Yesterday 15:02","7s","ok","1 follow-up","€0.01"],["Fri 11:48","6s","ok","1 follow-up","€0.01"]]},
  {id:"o5", name:"Insurance and certificate renewal", kind:"routine", owner:"Rachel Byrne", ownerKind:"person", initials:"RB",
   trigger:"60 days before expiry", triggerKind:"event", next:"14:20", last:"Nothing due", status:"healthy", rate:100, on:true,
   what:"Watches insurance, RECI registration and every electrician's qualifications, and gives sixty days' notice before one lapses.",
   why:"Main contractors ask for current certificates at prequalification, and a lapsed one stalls a tender.",
   saved:"3 hours a month",
   steps:[["Trigger","60 days before a document expires"],["Find","The owner of the certificate"],["Check","Has a renewal already been booked?"],["Send","Notify the owner and Rachel"],["Update","Create the renewal task"]],
   runs:[["Today 14:20","3s","ok","0 due","€0.00"],["Yesterday 14:20","4s","ok","0 due","€0.00"],["Fri 14:20","5s","ok","1 notified","€0.01"]]},
  {id:"o6", name:"Morning briefing", kind:"routine", owner:"Briefing", ownerKind:"agent", initials:"BR",
   trigger:"Weekdays, 07:00", triggerKind:"schedule", next:"Tomorrow", last:"Delivered 07:02", status:"healthy", rate:100, on:true,
   what:"Reads the whole business overnight and tells Martin the two things that actually need him.",
   why:"Martin was opening LiveCosts, Xero and the WhatsApp group before the vans left the yard.",
   saved:"9 hours a month",
   steps:[["Trigger","Every weekday at 07:00"],["Find","Overnight changes across projects, cash and approvals"],["Check","Drop anything already handled"],["Draft","Write the briefing"],["Send","Post to Home"]],
   runs:[["Today 07:00","22s","ok","1 briefing","€0.02"],["Yesterday 07:00","19s","ok","1 briefing","€0.02"],["Mon 07:00","24s","ok","1 briefing","€0.02"]]},
  {id:"o7", name:"Weekly materials check", kind:"task", owner:"Procurement Agent", ownerKind:"agent", initials:"PA",
   trigger:"Thursdays, 09:00", triggerKind:"schedule", next:"Thu 09:00", last:"Tamlite flagged for a chase", status:"healthy", rate:96, on:true,
   what:"Checks every open PO against next week's programme, flags late deliveries and supplier price movement.",
   why:"Gangs stood idle twice in the spring waiting on materials nobody had chased.",
   saved:"5 hours a month",
   steps:[["Trigger","Every Thursday at 09:00"],["Find","Open POs and their delivery dates"],["Check","What next week's programme needs"],["Approval","Project manager confirms any new order","gate"],["Update","Raise or chase the PO"]],
   runs:[["Thu 09:00","31s","ok","1 chase","€0.02"],["Last Thu 09:00","28s","ok","0 chases","€0.02"]]},
  {id:"o8", name:"Xero invoice sync", kind:"automation", owner:"Finance Agent", ownerKind:"agent", initials:"FA",
   trigger:"Every 15 minutes", triggerKind:"schedule", next:"14:45", last:"Synced 2 min ago", status:"healthy", rate:99, on:true,
   what:"Two-way sync with Xero: approved claims post as invoices, and payments come back against the right project.",
   why:"Manual re-entry was the biggest source of mismatched invoices.",
   saved:"18 hours a month",
   steps:[["Trigger","Every 15 minutes"],["Find","Invoices and payments changed since the last run"],["Send","Post new invoices to Xero","external"],["Check","Reconcile payments that came back"],["Update","Mark them synced on the project"]],
   runs:[["Today 14:30","1.1s","ok","1 payment, " + E(APEX.amount),"€0.00"],["Today 14:15","1.0s","ok","0 changes","€0.00"],["Today 14:00","1.2s","ok","2 invoices","€0.00"]]},
  {id:"o9", name:"Friday labour reconciliation", kind:"task", owner:"Ops Watchdog", ownerKind:"agent", initials:"OW",
   trigger:"Fri, 15:00", triggerKind:"schedule", next:"Fri 15:00", last:"1 clock record unassigned", status:"approval", rate:92, on:true,
   what:"Matches every Sync clock record against the project each person is assigned to, and lists anything that does not line up.",
   why:"Hours booked to the wrong job made labour variances look worse, or better, than they were.",
   saved:"4 hours a month",
   steps:[["Trigger","Every Friday at 15:00"],["Find","This week's Sync clock records"],["Check","Each record against its project allocation"],["Approval","Project manager signs off the week","gate"],["Update","Post hours to project labour"]],
   runs:[["Fri 15:00","12s","partial",T.people - 1 + " of " + T.people + " matched","€0.01","Dara Kelly not assigned to CastlePark labour"],["Last Fri 15:00","11s","ok","all matched","€0.01"]]},
  {id:"o10", name:"Overnight backup check", kind:"automation", owner:"Ops Watchdog", ownerKind:"agent", initials:"OW",
   trigger:"Daily, 03:00", triggerKind:"schedule", next:"Tonight", last:"All systems clean", status:"healthy", rate:100, on:true,
   what:"Confirms every nightly backup completed and the restore test passed, and raises an alert if not.",
   why:"Nobody checked the backups until someone needed one.",
   saved:"2 hours a month",
   steps:[["Trigger","Every day at 03:00"],["Check","Every backup job completed"],["Check","Last restore test passed"],["Send","Alert only if something failed"]],
   runs:[["Today 03:00","8s","ok","6 jobs","€0.00"],["Yesterday 03:00","9s","ok","6 jobs","€0.00"]]},
  {id:"o11", name:"Month-end close pack", kind:"report", owner:"Finance Agent", ownerKind:"agent", initials:"FA",
   trigger:"1st, 07:00", triggerKind:"schedule", next:"1st 07:00", last:"Delivered last month", status:"healthy", rate:95, on:true,
   what:"Assembles the close pack: claims, cash, receivables, margin by project and the variance commentary.",
   why:"Close took three days of copying between LiveCosts, Xero and spreadsheets.",
   saved:"16 hours a month",
   steps:[["Trigger","First of the month at 07:00"],["Find","Last month's claims, costs and payments"],["Check","Reconcile against Xero"],["Draft","Write the variance commentary"],["Send","Email the pack to Martin and Emma"]],
   runs:[["1st 07:00","3m 42s","ok","1 pack","€0.09"],["1st 07:00","3m 51s","ok","1 pack","€0.09"]]}
];

const OPS_FILTERS = [
  ["all","All"], ["routine","Agent routines"], ["automation","Automations"],
  ["report","Scheduled reports"], ["task","Recurring tasks"], ["approval","Needs approval"], ["failed","Failed"]
];

const WORK_SECTIONS = [
  {id:"tasks", label:"Tasks", blurb:"Everything assigned to you or your team, in one permission-filtered list.",
   views:["All tasks","Due tasks","Review","Done"], filters:["Due date","Any status","Anyone","Any due date"]},
  {id:"approvals", label:"Approvals", blurb:"Claims, POs and their steps. Every decision is written as the person who made it.",
   views:["Awaiting you","Awaiting others","Decided"], filters:["Raised date","Any value","Anyone"]},
  {id:"workflows", label:"Workflows", blurb:"Automations and agent routines: what runs on its own, and who owns it.",
   views:[], filters:[]},
  {id:"schedules", label:"Schedules", blurb:"The team calendar: when recurring work fires and what it costs the week.",
   views:[], filters:[]}
];

const WORK_TASKS = [
  {id:"w1", title:"Approve CastlePark July claim, " + CLAIM, status:"Review", priority:"High", who:"ML",
   due:"Due today", late:false, client:CP.client, day:"Today", mins:"15 mins", view:"Review"},
  {id:"w2", title:"Approve " + PO1.no + ", " + E(PO1.value), status:"Review", priority:"High", who:"ML",
   due:"Due today", late:false, client:PO1.supplier, day:"Today", mins:"5 mins", view:"Review"},
  {id:"w3", title:"Resolve Ringsend labour variance, +" + E(RL.variance), status:"In progress", priority:"High", who:"KB",
   due:"Due Thu", late:false, client:RS.client, day:"Thu", mins:"1 hour", view:"Due tasks"},
  {id:"w4", title:"Allocate diesel " + LV.eur2(D.exception) + ", card " + D.card, status:"Not started", priority:"Medium", who:"—",
   due:"Due today", late:false, client:"Fleet", day:"Today", mins:"5 mins", view:"Due tasks"},
  {id:"w5", title:"Assign Dara Kelly to CastlePark labour", status:"Not started", priority:"Medium", who:"KB",
   due:"Due today", late:false, client:CP.client, day:"Today", mins:"5 mins", view:"Due tasks"},
  {id:"w6", title:"Chase " + INV72.no + ", Northbank Developments", status:"In progress", priority:"High", who:"ED",
   due:INV72.status, late:true, client:INV72.client, day:"Today", mins:"20 mins", view:"Due tasks", done:false},
  {id:"w7", title:"Sign off Sandyford Office Campus quote", status:"Not started", priority:"Medium", who:"ML",
   due:"Due " + SANDYFORD.due, late:false, client:SANDYFORD.client, day:SANDYFORD.due, mins:"30 mins", view:"All tasks"},
  {id:"w8", title:"Submit Harbour Exchange claim", status:"Done", priority:"Medium", who:"CF",
   due:"Submitted", late:false, client:HX.client, day:"Mon", mins:"45 mins", view:"Done", done:true}
];

const WORKFLOWS = [
  {name:"Monthly claim draft", state:"live", trigger:"schedule · month end 09:00",
   actions:[["claims.build","write"],["approvals.route","write"]], lastRun:"Today 11:06",
   result:CLAIM + " waiting on Martin", resultKind:"warn", runSummary:"12 ok",
   runs:["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"]},
  {name:"PO approval routing over €10,000", state:"live", trigger:"event · livecosts.po.created",
   actions:[["approvals.route","read"],["notify.inbox","write"]], lastRun:"Today 09:12",
   result:"ok", resultKind:"ok", runSummary:"14 ok",
   runs:["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"]},
  {name:"Labour reconciliation", state:"live", trigger:"schedule · Fri 15:00",
   actions:[["sync.read","read"],["labour.allocate","write"]], lastRun:"Fri 15:00",
   result:"1 record unassigned", resultKind:"warn", runSummary:"11 ok · 3 partial",
   runs:["ok","ok","partial","ok","ok","ok","partial","ok","ok","ok","ok","ok","ok","partial"]},
  {name:"Xero invoice sync", state:"live", trigger:"schedule · every 15 min",
   actions:[["xero.post","external"]], lastRun:"Today 14:30",
   result:"ok", resultKind:"ok", runSummary:"14 ok",
   runs:["ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok","ok"]}
];

const SCHEDULES = [
  {id:"s1", name:"Morning briefing", cadence:"Every weekday · 07:00", next:"Tomorrow 07:00", owner:"Briefing", on:true, day:1},
  {id:"s2", name:"Chase overdue invoices", cadence:"Daily · 09:00", next:"Tomorrow 09:00", owner:"Finance Agent", on:true, day:1},
  {id:"s3", name:"Xero invoice sync", cadence:"Every 15 minutes", next:"14:45", owner:"Finance Agent", on:true, day:0},
  {id:"s4", name:"Weekly materials check", cadence:"Thursdays · 09:00", next:"Thu 09:00", owner:"Procurement Agent", on:true, day:3},
  {id:"s5", name:"Monthly claim draft", cadence:"Month end · 09:00", next:"Today 09:00", owner:"Claims Agent", on:true, day:4}
];

const WIDGET_DEFS = [["kpi","Business health"],["inbox","Management attention"],["visits","Today's sites"],["briefing","AI briefing"],["work","My work"],["activity","Activity"]];
const OPEN_TASKS = WORK_TASKS.filter(t => !t.done);
const WORK_WIDGETS = [
  {id:"queue", label:"My queue", value:String(OPEN_TASKS.filter(t => t.who === "ML").length), hint:"assigned to Martin", icon:"work", queue:"mine"},
  {id:"late", label:"Running late", value:String(OPEN_TASKS.filter(t => t.late).length), hint:"past their due date", icon:"health", queue:"overdue"},
  {id:"unassigned", label:"Unassigned", value:String(OPEN_TASKS.filter(t => t.who === "—").length), hint:"nobody owns it yet", icon:"teams", queue:"unassigned"},
  {id:"week", label:"Next 7 days", value:String(OPEN_TASKS.length), hint:"due this week", icon:"visits", queue:"upcoming"}
];
const PERSONALITIES = ["Straight-talking","Warm","Formal","Dry"];
const ANSWER_STYLES = ["Short answers","Show the working","Ask before acting"];
/* Every context source and every registered tool the agent could be granted.
   The builder shows the whole catalogue, grouped, rather than a sample. */
const CONTEXT_DEFS = [
  ["Projects","records","Contract, progress, programme and margin"],
  ["Customers","records","Main contractors, developers and contacts"],
  ["People","records","Employees, subcontractors and external contacts"],
  ["Files","records","Contracts, claims, certificates and insurance"],
  ["Work packages","work","Packages, progress and labour by package"],
  ["Site progress","work","Updates from project managers and foremen"],
  ["Approvals","work","Claims and POs waiting on a decision"],
  ["Claims","money","Monthly valuations and their stages"],
  ["Invoices","money","Issued, paid and overdue, from Xero"],
  ["Purchase orders","money","Committed cost and deliveries, from LiveCosts"],
  ["Activity log","system","Every event, agent and human"],
  ["Integrations","system","Xero, LiveCosts, Countfire, Sync and more"]
];
const CONTEXT_SOURCES = CONTEXT_DEFS.map(c => c[0]);
const SKILL_DEFS = [
  ["Search records","read"],["Summarise activity","read"],["Read projects","read"],
  ["Read claims","read"],["Read invoices","read"],["Read POs","read"],["Check permissions","read"],
  ["Draft email","write"],["Create task","write"],["Update record","write"],
  ["Raise approval","write"],["Allocate cost","write"],
  ["Send email","external"],["Post to Xero","external"],["Post to WhatsApp group","external"]
];
/* The phases the agent runs through once it knows the job. */
const TRAIN_PHASES = [
  ["Reading the whole ontology", "17 entity types"],
  ["Learning how Lavelle words things", "organisation → customer"],
  ["Researching electrical contracting", "12 sources"],
  ["Writing its own system prompt", "1,240 tokens"]
];
const BRIEF_QUESTIONS = [
  {title:"What should it cover?", sub:"Pick as many as you like. We can refine later.",
   options:[["Projects","Progress, programme and anything slipping"],["Money","Claims, cash and overdue invoices"],
            ["Labour","Who is on site, and hours against budget"],["Approvals","Claims and POs waiting on you"],
            ["Something else","Tell me in the next message"]]},
  {title:"When should it land?", sub:"One is enough to start.",
   options:[["Every morning 07:00","Before the vans leave the yard"],["Weekdays 08:00","Monday to Friday only"],
            ["Only when something changes","Event-driven, no noise"],["On demand","When you ask for it"]]}
];
/* The words under a name, keyed to the same state the face lights with. */
const STATE_LABELS = {working:"working", thinking:"thinking", waiting:"waiting on you",
  complete:"up to date", attention:"needs you", idle:"idle"};

const FACE_SHAPES = [
  ["crown-pebble","Pebble"],["executive-capsule","Executive"],["shield","Shield"],
  ["glass-visor","Visor"],["control-cube","Control cube"],["low-dome","Low dome"],
  ["offset-pebble","Offset pebble"],["rim-capsule","Capsule"],["wide-eyed","Wide-eyed"],
  ["precision-brow","Precision brow"],["tall-unit","Tall unit"],["soft-asymmetric","Soft asymmetric"]
];
/* Shell colours only, deliberately desaturated so none of them reads as a
   state. Each is a pair: the deep shell for light themes and its pale partner
   for dark ones (the eyes take the other). The status light carries the state. */
const FACE_TINTS = [
  ["#191c1f","Graphite","#e3e6e8"],["#1b2430","Slate","#d3dde9"],["#241b2e","Aubergine","#ddd4ea"],
  ["#2a2118","Bronze","#eadccb"],["#16241f","Pine","#d1e4da"],["#2b1b1e","Oxblood","#eed5d7"]
];


/* ---- ontology graph: generation, Dijkstra traversal, canvas render ---- */
const CLUSTERS = [
  ["Projects",        "#2ebfa5", 0.00, 0.62, 46],
  ["People",          "#6ad0f0", 0.90, 0.70, 52],
  ["Documents",       "#b06cf0", 1.75, 0.66, 58],
  ["Work Packages",   "#f0c04b", 2.55, 0.72, 44],
  ["Invoices",        "#f0567f", 3.35, 0.60, 38],
  ["Purchase Orders", "#5fe0a8", 4.15, 0.70, 40],
  ["Vehicles",        "#f0803a", 4.95, 0.64, 30],
  ["Suppliers",       "#5f7cf0", 5.65, 0.72, 34]
];

function mulberry(seed){
  return function(){
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* Hub-and-spoke clusters around a dense phyllotaxis core, in unit space
   (-1..1 on both axes) so the layout is resolution independent. */
const _hexCache = {};
function hexRGB(hex){
  if (_hexCache[hex]) return _hexCache[hex];
  const h = hex.replace("#", "");
  const v = [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  _hexCache[hex] = v;
  return v;
}


function buildGraph(){
  const rnd = mulberry(20260902);
  const nodes = [], edges = [], adj = [];
  const add = (x, y, z, r, cluster, kind) => {
    nodes.push({x, y, z, r, cluster, kind}); adj.push([]); return nodes.length - 1;
  };
  const link = (a, b) => {
    const dx = nodes[a].x - nodes[b].x, dy = nodes[a].y - nodes[b].y, dz = nodes[a].z - nodes[b].z;
    const w = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.004;
    const id = edges.length;
    edges.push({a, b, w});
    adj[a].push([b, w, id]); adj[b].push([a, w, id]);
  };

  // the core is a filled sphere on a Fibonacci lattice, not a disc
  const CORE = 880, coreIds = [];
  for (let i = 0; i < CORE; i++){
    const t = (i + 0.5) / CORE;
    const phi = Math.acos(1 - 2 * t);
    const theta = i * 2.39996;
    const shell = 0.16 + 0.28 * Math.pow(rnd(), 0.5);
    const grade = rnd();
    coreIds.push(add(
      Math.sin(phi) * Math.cos(theta) * shell * 1.04,
      Math.cos(phi) * shell * 0.96,
      Math.sin(phi) * Math.sin(theta) * shell,
      grade < 0.06 ? 3.4 + rnd() * 1.4 : grade < 0.3 ? 2.1 + rnd() * 0.7 : 1.0 + rnd() * 0.8, 0, "core"));
  }
  // lattice neighbours plus a mesh of chords, so the sphere reads as a volume
  for (let i = 1; i < coreIds.length; i++){
    link(coreIds[i], coreIds[i - 1]);
    if (i >= 13) link(coreIds[i], coreIds[i - 13]);
    if (i >= 21 && i % 2 === 0) link(coreIds[i], coreIds[i - 21]);
    if (i >= 34 && i % 3 === 0) link(coreIds[i], coreIds[i - 34]);
    if (i >= 55 && i % 4 === 0) link(coreIds[i], coreIds[i - 55]);
    if (i >= 89 && i % 5 === 0) link(coreIds[i], coreIds[i - 89]);
    if (i % 6 === 0) link(coreIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // a mid shell between the nucleus and the lobes: the layer that makes it
  // read as a network rather than a ball with satellites
  const MID = 560, midIds = [];
  for (let i = 0; i < MID; i++){
    const t = (i + 0.5) / MID;
    const phi = Math.acos(1 - 2 * t), theta = i * 2.39996 + 0.7;
    const d = 0.52 + 0.16 * Math.pow(rnd(), 0.6);
    const g2 = rnd();
    midIds.push(add(
      Math.sin(phi) * Math.cos(theta) * d * 1.02,
      Math.cos(phi) * d * 0.96,
      Math.sin(phi) * Math.sin(theta) * d,
      g2 < 0.05 ? 2.6 + rnd() * 1.0 : g2 < 0.3 ? 1.6 + rnd() * 0.6 : 0.8 + rnd() * 0.7, 0, "core"));
  }
  for (let i = 0; i < midIds.length; i++){
    if (i >= 1) link(midIds[i], midIds[i - 1]);
    if (i >= 17) link(midIds[i], midIds[i - 17]);
    if (i >= 29 && i % 2 === 0) link(midIds[i], midIds[i - 29]);
    // radial spokes tying the shell to the nucleus
    if (i % 2 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
    if (i % 9 === 0) link(midIds[i], coreIds[Math.floor(rnd() * coreIds.length)]);
  }

  // clusters ride a sphere: each hub gets its own latitude as well as longitude
  const hubs = [], clusterLeaves = [];
  const onSphere = (lon, lat, d0) => { const d = d0 * 1.22;
    return [Math.cos(lat) * Math.cos(lon) * d * 1.02, Math.sin(lat) * d * 0.96, Math.cos(lat) * Math.sin(lon) * d]; };
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist, leaves] = c;
    const lat = (ci % 2 ? 1 : -1) * (0.26 + rnd() * 0.5);
    const wob = 1.06 + rnd() * 0.16;
    const hp = onSphere(ang, lat, dist * wob);
    const hub = add(hp[0], hp[1], hp[2], 5.4, ci, "hub");
    hubs.push(hub);
    const mine = [];
    clusterLeaves.push(mine);
    for (let k = 0; k < 3; k++) link(hub, coreIds[Math.floor(rnd() * coreIds.length)]);
    for (let k = 0; k < 5; k++) link(hub, midIds[Math.floor(rnd() * midIds.length)]);

    const subs = 5 + Math.floor(rnd() * 4);
    const subIds = [];
    for (let s = 0; s < subs; s++){
      const sa = ang + (rnd() - 0.5) * 0.52, sl = lat + (rnd() - 0.5) * 0.3;
      const sd = dist + 0.08 + rnd() * 0.18;
      const sp = onSphere(sa, sl, sd);
      const sub = add(sp[0], sp[1], sp[2], 3.2, ci, "sub");
      subIds.push(sub);
      link(sub, hub);
      if (s > 0 && rnd() < 0.7) link(sub, subIds[s - 1]);
      const fan = Math.floor((leaves * 7.4) / subs);
      const spread = 0.17 + rnd() * 0.2;
      let prev = -1;
      for (let l = 0; l < fan; l++){
        const la = sa + (rnd() - 0.5) * spread * 2 + (rnd() - 0.5) * 0.06;
        const ll = sl + (rnd() - 0.5) * spread * 1.1;
        const ld = sd + 0.03 + Math.pow(rnd(), 0.8) * 0.17;
        const lp = onSphere(la, ll, ld);
        const lg = rnd();
        const leaf = add(lp[0], lp[1], lp[2],
          lg < 0.08 ? 2.8 + rnd() * 1.2 : lg < 0.34 ? 1.8 + rnd() * 0.6 : 1.0 + rnd() * 0.7, ci, "leaf");
        link(leaf, sub);
        mine.push(leaf);
        if (rnd() < 0.14) link(leaf, hub);
        if (prev >= 0 && rnd() < 0.34) link(leaf, prev);
        if (rnd() < 0.16) link(leaf, midIds[Math.floor(rnd() * midIds.length)]);
        prev = leaf;
      }
    }
  });
  // far satellites hanging off the outer leaves
  CLUSTERS.forEach((c, ci) => {
    const [, , ang, dist] = c;
    for (let s = 0; s < 7; s++){
      const sa = ang + (rnd() - 0.5) * 1.5, sl = (rnd() - 0.5) * 1.3;
      const sd = dist + 0.42 + rnd() * 0.22;
      const ap = onSphere(sa, sl, sd);
      const anchor = add(ap[0], ap[1], ap[2], 2.4, ci, "sub");
      link(anchor, hubs[ci]);
      const n = 14 + Math.floor(rnd() * 18);
      for (let l = 0; l < n; l++){
        const la = sa + (rnd() - 0.5) * 0.9, ll = sl + (rnd() - 0.5) * 0.7;
        const ld = sd + 0.02 + Math.pow(rnd(), 0.8) * 0.18;
        const p = onSphere(la, ll, ld);
        const leaf = add(p[0], p[1], p[2], 0.8 + rnd() * 0.9, ci, "leaf");
        link(leaf, anchor);
        clusterLeaves[ci].push(leaf);
      }
    }
  });

  // two hub rings and long chords across the sphere
  hubs.forEach((h, i) => {
    link(h, hubs[(i + 1) % hubs.length]);
    link(h, hubs[(i + 2) % hubs.length]);
    if (i % 3 === 0) link(h, hubs[(i + 4) % hubs.length]);
  });
  // neighbouring clusters share records, so their leaves cross-link
  for (let ci = 0; ci < clusterLeaves.length; ci++){
    const a = clusterLeaves[ci], b = clusterLeaves[(ci + 1) % clusterLeaves.length];
    const n = 26 + Math.floor(rnd() * 16);
    for (let k = 0; k < n; k++){
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)]);
    }
    // and a good number reach right across to the far side
    for (let k = 0; k < 12; k++){
      const far = clusterLeaves[(ci + 3) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
    for (let k = 0; k < 8; k++){
      const far = clusterLeaves[(ci + 4) % clusterLeaves.length];
      link(a[Math.floor(rnd() * a.length)], far[Math.floor(rnd() * far.length)]);
    }
  }

  let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9, minZ = 1e9, maxZ = -1e9;
  for (const n of nodes){
    if (n.x < minX) minX = n.x; if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y; if (n.y > maxY) maxY = n.y;
    if (n.z < minZ) minZ = n.z; if (n.z > maxZ) maxZ = n.z;
  }
  const bounds = {minX, maxX, minY, maxY, cx:(minX + maxX) / 2, cy:(minY + maxY) / 2,
    cz:(minZ + maxZ) / 2, w:maxX - minX, h:maxY - minY, d:maxZ - minZ,
    radius: Math.max(maxX - minX, maxY - minY, maxZ - minZ) / 2,
    reach: nodes.reduce((m, n) => Math.max(m, Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z)), 0)};
  return {nodes, edges, adj, hubs, coreIds, bounds};
}


export {
  INK,
  BODY,
  DIM,
  FAINT,
  LIME,
  GREEN,
  AMBER,
  RED,
  NEUTRAL,
  MONO,
  ICONS,
  REC_SECTIONS,
  CONTACTS,
  FILE_TREE,
  ONTO_NODES,
  ONTO_EDGES,
  REC_TEMPLATES,
  REC_TEMPLATE_CATS,
  PEOPLE,
  ROLE_LEVELS,
  PERM_KEYS,
  GRANT_DEFS,
  ROLE_SCOPES,
  DEFAULT_PERMS,
  INTEGRATIONS,
  BG_DEFS,
  THEMES,
  ADMIN_ICONS,
  ADMIN_CARDS,
  ADMIN_GROUPS,
  SRC_TINT,
  SRC_ABBR,
  DATA_EVENTS,
  PEOPLE_EVENTS,
  AI_EVENTS,
  STREAM_DEFS,
  NAV,
  ITEMS,
  ORDER,
  ANSWERS,
  synthesizeCustomArea,
  pickAnswer,
  ORGS,
  TEAMS,
  LOCATIONS,
  AGENT_DEFS,
  KPI_DEFS,
  ASPECT_DEFS,
  FILTER_GROUPS,
  OPS_DEFS,
  OPS_FILTERS,
  WORK_SECTIONS,
  WORK_TASKS,
  WORKFLOWS,
  SCHEDULES,
  WIDGET_DEFS,
  WORK_WIDGETS,
  PERSONALITIES,
  ANSWER_STYLES,
  CONTEXT_DEFS,
  CONTEXT_SOURCES,
  SKILL_DEFS,
  TRAIN_PHASES,
  BRIEF_QUESTIONS,
  STATE_LABELS,
  FACE_SHAPES,
  FACE_TINTS,
  CLUSTERS,
  mulberry,
  _hexCache,
  hexRGB,
  buildGraph
};
