import * as L from "../lavelle";

/* Procurement: purchase orders are raised against projects in LiveCosts, which stays connected.
   Pulse adds the management layer: approvals, commitments that move project forecasts the
   moment an order is approved, deliveries and supplier performance. */

const THRESHOLD = 10000; /* orders above this route to Martin Lavelle, the rest to the project PM */
const STORY = "PO-4821";
const CASTLE = L.PROJECT("castlepark");

const approved = (s, no) => !!(s.poApproved || {})[no];
const isAwaiting = (s, p) => p.status === "Awaiting Approval" && !approved(s, p.no);
const statusOf = (s, p) => (p.status === "Awaiting Approval" && approved(s, p.no) ? "Ordered" : p.status);
const approverOf = (p) => (p.value > THRESHOLD ? L.MARTIN.name : L.PROJECT(p.project).pm);
const proj = (id) => L.PROJECT(id).short;

const TOTAL_RAISED = L.sum(L.POS, (p) => p.value);
const TOMORROW = L.DELIVERIES.filter((x) => x.when === "Tomorrow");
const FA_ISSUE = L.ISSUES.find((i) => i.id === "i2");

/* Committed spend by project from Pulse POs: everything approved, ordered or delivered. */
const committedByProject = (s) => {
  const ids = [];
  L.POS.forEach((p) => { if (ids.indexOf(p.project) < 0) ids.push(p.project); });
  return ids.map((id) => {
    const list = L.POS.filter((p) => p.project === id);
    return {id, committed: L.sum(list.filter((p) => !isAwaiting(s, p)), (p) => p.value), awaiting: L.sum(list.filter((p) => isAwaiting(s, p)), (p) => p.value), count: list.length};
  }).sort((a, b) => (b.committed + b.awaiting) - (a.committed + a.awaiting));
};

/* Material categories: every PO maps to exactly one, so the categories sum to the PO total. */
const CATEGORY = {
  "PO-4823": "Cable", "PO-4818": "Cable",
  "PO-4821": "Containment", "PO-4820": "Containment", "PO-4802": "Containment", "PO-4799": "Containment",
  "PO-4812": "Luminaires", "PO-4809": "Luminaires", "PO-4795": "Luminaires",
  "PO-4806": "Distribution boards", "PO-4816": "Distribution boards", "PO-4825": "Distribution boards"
};
/* Unit price movement over 90 days (mock), benchmarked on the main supplier for each category. */
const MATERIALS = [
  {cat: "Cable", lead: "Prysmian", bench: "SWA and twin and earth, per metre", move: +L.SUPPLIERS.find((x) => x.name === "Prysmian").trend.replace("%", "")},
  {cat: "Containment", lead: "CEF", bench: "Cable tray, trunking and conduit", move: +L.SUPPLIERS.find((x) => x.name === "CEF").trend.replace("%", "")},
  {cat: "Luminaires", lead: "Tamlite", bench: "LED panels and emergency fittings", move: +L.SUPPLIERS.find((x) => x.name === "Tamlite").trend.replace("%", "")},
  {cat: "Distribution boards", lead: "Schneider Electric", bench: "TPN boards and switchgear", move: +L.SUPPLIERS.find((x) => x.name === "Schneider Electric").trend.replace("%", "")},
  {cat: "Fire alarm devices", lead: "Kellihers", bench: "Addressable detectors and sounders", move: 2.8}
];
const materialRows = (s) => MATERIALS.map((m) => {
  const list = L.POS.filter((p) => CATEGORY[p.no] === m.cat);
  return Object.assign({}, m, {count: list.length, committed: L.sum(list.filter((p) => !isAwaiting(s, p)), (p) => p.value), awaiting: L.sum(list.filter((p) => isAwaiting(s, p)), (p) => p.value)});
});

const approveBtn = (c, p, primary) => ({btn: "Approve", primary, run: () => c.mark("poApproved", p.no)});
const doneBtn = {btn: "Approved", disabled: true};

/* CastlePark position: approval raises committed cost, forecast final cost and margin hold. */
const castleCard = (c) => {
  const done = approved(c.s, STORY);
  return {t: "cards", min: 240, items: [{
    title: CASTLE.name, sub: "Project position, " + L.CASTLE_PO_COUNT + " POs to date",
    pill: done ? "PO-4821 committed" : "PO-4821 pending", pillTone: done ? "ok" : "warn",
    big: L.eur(c.d.castleCommitted),
    lines: [["Committed cost", L.eur(c.d.castleCommitted)], ["Open commitments", L.eur(c.d.castleOpenCommit)], ["Cost incurred", L.eur(CASTLE.cost)],
      ["Forecast final cost", L.eur(CASTLE.forecastCost)], ["Forecast margin", L.pct(CASTLE.margin)]],
    go: () => c.openProject("castlepark", "overview")
  }]};
};

const storyAlert = (c) => {
  const p = L.POS.find((x) => x.no === STORY);
  return approved(c.s, STORY)
    ? {tone: "ok", title: STORY + " approved. ", body: p.supplier + " " + p.item.toLowerCase() + ", " + L.eur(p.value) + ", committed to " + CASTLE.name + ". Committed cost now " + L.eur(c.d.castleCommitted) + ", forecast final cost unchanged at " + L.eur(CASTLE.forecastCost) + ", margin " + L.pct(CASTLE.margin) + ".",
       action: {label: "Open CastlePark", run: () => c.openProject("castlepark", "overview")}}
    : {tone: "warn", title: STORY + " needs your approval. ", body: p.supplier + ", " + CASTLE.name + ", " + p.item.toLowerCase() + ", " + L.eur(p.value) + ". Over the " + L.eur(THRESHOLD) + " threshold. Delivery " + p.due + " once approved.",
       action: {label: "Approve", primary: true, run: () => c.mark("poApproved", STORY)}, action2: {label: "View orders", run: () => c.go("Procurement", "orders")}};
};

export default {
  id: "Procurement",
  tabs: [
    {
      id: "overview", label: "Overview", title: "Procurement",
      sub: "Orders raised in LiveCosts, with approvals, commitments and deliveries tracked in Pulse.",
      build: (c) => {
        const awaitingAll = L.POS.filter((p) => p.status === "Awaiting Approval");
        const byProj = committedByProject(c.s);
        return [
          {t: "sync", text: "Synced from LiveCosts, connected. " + L.POS.length + " purchase orders this month, commitments posted to project forecasts on approval."},
          {t: "kpis", cols: 5, items: [
            {label: "Awaiting approval", value: L.num(c.d.awaiting.length), sub: L.eur(c.d.awaitingValue) + " in " + c.d.awaiting.length + (c.d.awaiting.length === 1 ? " order" : " orders"), tone: c.d.awaiting.length ? "warn" : "ok", go: () => c.go("Procurement", "approvals")},
            {label: "CastlePark open commitments", value: L.eur(c.d.castleOpenCommit), sub: "Committed " + L.eur(c.d.castleCommitted), tone: "accent", hero: true, go: () => c.openProject("castlepark", "overview")},
            {label: "Deliveries due tomorrow", value: L.num(TOMORROW.length), sub: TOMORROW.map((x) => x.supplier).join(", "), go: () => c.go("Procurement", "deliveries")},
            {label: "Orders this month", value: L.num(L.POS.length), sub: (L.POS.length - awaitingAll.length) + " placed, " + awaitingAll.length + " raised today"},
            {label: "Spend this month", value: L.eur(TOTAL_RAISED), sub: L.eur(TOTAL_RAISED - c.d.awaitingValue) + " committed", go: () => c.go("Procurement", "materials")}
          ]},
          {t: "alerts", items: [storyAlert(c)]},
          {t: "split", ratio: "2fr 1fr", left: [
            {t: "bars", title: "Committed spend by project", sub: "Pulse POs this month, approved, ordered or delivered",
              items: byProj.map((r) => ({label: proj(r.id), value: r.committed, display: L.eur(r.committed), tone: r.id === "castlepark" ? "accent" : undefined,
                sub: r.count + (r.count === 1 ? " order" : " orders") + (r.awaiting ? ", " + L.eur(r.awaiting) + " awaiting approval" : "")}))}
          ], right: [castleCard(c)]}
        ];
      }
    },
    {
      id: "orders", label: "Purchase Orders", title: "Purchase Orders",
      sub: "Every order raised this month, read from LiveCosts. Approve from here or from Approvals.",
      build: (c) => {
        const rows = L.POS.map((p) => {
          const st = statusOf(c.s, p);
          const pending = p.status === "Awaiting Approval";
          return {no: p.no, supplier: p.supplier, project: proj(p.project), item: p.item, value: L.eur(p.value), status: st,
            date: p.date, due: p.due, act: pending ? (approved(c.s, p.no) ? doneBtn : approveBtn(c, p, p.no === STORY)) : "",
            _hl: isAwaiting(c.s, p)};
        });
        const delivered = L.POS.filter((p) => p.status === "Delivered");
        return [
          {t: "kpis", cols: 4, items: [
            {label: "Orders", value: L.num(L.POS.length), sub: L.eur(TOTAL_RAISED) + " raised"},
            {label: "Awaiting approval", value: L.num(c.d.awaiting.length), sub: L.eur(c.d.awaitingValue), tone: c.d.awaiting.length ? "warn" : "ok"},
            {label: "Open on order", value: L.num(L.POS.filter((p) => statusOf(c.s, p) === "Ordered" || p.status === "Part Delivered").length), sub: "Ordered or part delivered"},
            {label: "Delivered", value: L.num(delivered.length), sub: L.eur(L.sum(delivered, (p) => p.value)), tone: "ok"}
          ]},
          {t: "table", title: "Purchase orders", sub: "Highlighted rows need approval",
            cols: [{k: "no", label: "PO", kind: "mono"}, {k: "supplier", label: "Supplier"}, {k: "project", label: "Project"}, {k: "item", label: "Item", wrap: true},
              {k: "value", label: "Value", kind: "money"}, {k: "status", label: "Status", kind: "status"}, {k: "date", label: "Raised"}, {k: "due", label: "Due"}, {k: "act", label: ""}],
            rows,
            foot: {no: L.POS.length + " orders", value: L.eur(TOTAL_RAISED), status: c.d.awaiting.length + " awaiting"}},
          {t: "sync", text: "Synced from LiveCosts. Orders are raised in LiveCosts against the project cost code; Pulse records the approval and posts the commitment."}
        ];
      }
    },
    {
      id: "deliveries", label: "Deliveries", title: "Deliveries",
      sub: "Inbound materials by site, with exceptions flagged for chasing.",
      build: (c) => {
        const tracked = L.DELIVERIES.map((x) => x.po);
        const later = L.POS.filter((p) => tracked.indexOf(p.no) < 0 && p.status !== "Delivered");
        const chase = L.DELIVERIES.filter((x) => x.status === "Chase");
        const received = L.DELIVERIES.filter((x) => x.status === "Received");
        return [
          {t: "kpis", cols: 4, items: [
            {label: "Due tomorrow", value: L.num(TOMORROW.length), sub: TOMORROW.map((x) => proj(x.project)).filter((v, i, a) => a.indexOf(v) === i).join(", ")},
            {label: "To chase", value: L.num(chase.length), sub: chase.map((x) => x.supplier + " " + x.po).join(", "), tone: chase.length ? "bad" : "ok"},
            {label: "Received today", value: L.num(received.length), sub: received.map((x) => x.supplier + ", " + proj(x.project)).join(", "), tone: "ok"},
            {label: "Later this week and next", value: L.num(later.length), sub: L.eur(L.sum(later, (p) => p.value)) + " on order"}
          ]},
          {t: "alerts", items: chase.map((x) => ({tone: "bad", title: x.supplier + " " + x.po + " at risk. ",
            body: x.item + " for " + L.PROJECT(x.project).name + ", due " + x.when + ". " + (L.SUPPLIERS.find((s) => s.name === x.supplier) || {score: "flagged"}).score + " this year on deliveries.",
            action: {label: "Chase " + x.supplier, primary: true, run: () => c.ask("Chase " + x.supplier + " about " + x.po)}}))},
          {t: "table", title: "Tracked deliveries", sub: "This week",
            cols: [{k: "po", label: "PO", kind: "mono"}, {k: "supplier", label: "Supplier"}, {k: "project", label: "Site"}, {k: "item", label: "Item", wrap: true},
              {k: "when", label: "When"}, {k: "status", label: "Status", kind: "status"}, {k: "act", label: ""}],
            rows: L.DELIVERIES.map((x) => ({po: x.po, supplier: x.supplier, project: L.PROJECT(x.project).name, item: x.item, when: x.when, status: x.status,
              act: x.status === "Chase" ? {btn: "Chase", primary: true, run: () => c.ask("Chase " + x.supplier + " about " + x.po)} : "", _hl: x.status === "Chase"}))},
          {t: "split", ratio: "1fr 1fr", left: [
            {t: "feed", title: "Today on site", items: received.map((x) => ({time: x.when.replace("Received ", ""), title: "Received.", text: x.supplier + " at " + L.PROJECT(x.project).name + ", " + x.item.toLowerCase() + ", " + x.po + ".", tone: "ok"}))
              .concat(TOMORROW.map((x) => ({time: "Tomorrow", title: x.supplier + ".", text: x.item + " to " + L.PROJECT(x.project).name + ", " + x.po + ".", tone: "accent"})))}
          ], right: [
            {t: "table", title: "Later deliveries", sub: "From open orders",
              cols: [{k: "no", label: "PO", kind: "mono"}, {k: "supplier", label: "Supplier"}, {k: "project", label: "Site"}, {k: "due", label: "Due"}, {k: "status", label: "Status", kind: "status"}],
              rows: later.map((p) => ({no: p.no, supplier: p.supplier, project: proj(p.project), due: p.due, status: isAwaiting(c.s, p) ? "Awaiting approval" : statusOf(c.s, p)}))}
          ]}
        ];
      }
    },
    {
      id: "suppliers", label: "Suppliers", title: "Suppliers",
      sub: "Spend, terms and performance for the main supply base.",
      build: (c) => {
        const S = L.SUPPLIERS;
        const total = L.sum(S, (x) => x.spend);
        const move = (x) => +x.trend.replace("%", "");
        const top = S.slice().sort((a, b) => move(b) - move(a))[0];
        const flagged = S.filter((x) => x.score !== "Reliable");
        return [
          {t: "kpis", cols: 4, items: [
            {label: "Active suppliers", value: L.num(S.length), sub: L.num(L.sum(S, (x) => x.pos)) + " POs to date"},
            {label: "Spend to date", value: L.eur(total), sub: "Top two " + L.pct((S[0].spend + S[1].spend) / total * 100, 0) + " of spend"},
            {label: "Largest price rise", value: top.trend, sub: top.name + ", " + top.cat.toLowerCase(), tone: "bad"},
            {label: "Performance flags", value: L.num(flagged.length), sub: flagged.map((x) => x.name + ", " + x.score.toLowerCase()).join("; "), tone: flagged.length ? "warn" : "ok"}
          ]},
          {t: "table", title: "Supplier performance", sub: "Spend and order counts to date, price movement over 90 days",
            cols: [{k: "name", label: "Supplier", kind: "name"}, {k: "spend", label: "Spend", kind: "money"}, {k: "share", label: "Share", kind: "bar"}, {k: "pos", label: "POs", align: "r"},
              {k: "open", label: "Open this month", kind: "money"}, {k: "terms", label: "Terms"}, {k: "score", label: "Performance", kind: "status"}, {k: "trend", label: "Price", align: "r"}],
            rows: S.map((x) => {
              const open = L.sum(L.POS.filter((p) => p.supplier === x.name && p.status !== "Delivered"), (p) => p.value);
              return {name: {v: x.name, sub: x.cat}, spend: L.eur(x.spend), share: x.spend / total * 100, pos: L.num(x.pos), open: open ? L.eur(open) : "",
                terms: x.terms, score: {v: x.score, tone: x.score === "Reliable" ? "ok" : "bad"}, trend: {v: x.trend, tone: move(x) >= 3 ? "bad" : move(x) > 0 ? "warn" : "ok"}};
            }),
            foot: {name: S.length + " suppliers", spend: L.eur(total), pos: L.num(L.sum(S, (x) => x.pos))}},
          {t: "note", title: "Price movement.", text: top.name + " cable is up " + top.trend + " in 90 days, the largest rise in the supply base. Cable on open estimates should be priced at current rates. Kellihers, the other cable source this month, is " + S.find((x) => x.name === "Kellihers").trend + " overall."},
          {t: "actions", items: [
            {label: "Ask Pulse for a cable price comparison", primary: true, run: () => c.ask("Compare cable prices from Prysmian and Kellihers for the next 90 days")},
            {label: "Chase Tamlite about PO-4812", ghost: true, run: () => c.ask("Chase Tamlite about PO-4812")}
          ]}
        ];
      }
    },
    {
      id: "materials", label: "Materials", title: "Materials",
      sub: "Spend this month by material category, with unit price movement.",
      build: (c) => {
        const rows = materialRows(c.s);
        const committed = L.sum(rows, (r) => r.committed);
        const awaiting = L.sum(rows, (r) => r.awaiting);
        const biggest = rows.slice().sort((a, b) => (b.committed + b.awaiting) - (a.committed + a.awaiting))[0];
        const fa = rows.find((r) => r.cat === "Fire alarm devices");
        return [
          {t: "kpis", cols: 4, items: [
            {label: "Raised this month", value: L.eur(committed + awaiting), sub: L.POS.length + " orders across " + rows.filter((r) => r.count).length + " categories"},
            {label: "Committed", value: L.eur(committed), sub: L.eur(awaiting) + " awaiting approval", tone: "accent"},
            {label: "Largest category", value: biggest.cat, sub: L.eur(biggest.committed + biggest.awaiting) + ", " + L.pct((biggest.committed + biggest.awaiting) / (committed + awaiting) * 100, 0) + " of spend"},
            {label: "Sharpest price rise", value: "+" + rows.slice().sort((a, b) => b.move - a.move)[0].move + "%", sub: rows.slice().sort((a, b) => b.move - a.move)[0].cat, tone: "bad"}
          ]},
          {t: "table", title: "Material categories", sub: "Categories reconcile to the purchase order total",
            cols: [{k: "cat", label: "Category", kind: "name"}, {k: "count", label: "POs", align: "r"}, {k: "committed", label: "Committed", kind: "money"}, {k: "awaiting", label: "Awaiting", kind: "money"},
              {k: "total", label: "Total", kind: "money"}, {k: "move", label: "Unit price, 90 days", align: "r"}],
            rows: rows.map((r) => ({cat: {v: r.cat, sub: r.bench + ", " + r.lead}, count: L.num(r.count), committed: L.eur(r.committed), awaiting: r.awaiting ? L.eur(r.awaiting) : "",
              total: L.eur(r.committed + r.awaiting), move: {v: (r.move > 0 ? "+" : "") + r.move.toFixed(1) + "%", tone: r.move >= 3 ? "bad" : r.move > 0 ? "warn" : "ok"}})),
            foot: {cat: "Total", count: L.num(L.sum(rows, (r) => r.count)), committed: L.eur(committed), awaiting: L.eur(awaiting), total: L.eur(committed + awaiting)}},
          {t: "bars", title: "Spend by category", sub: "This month",
            items: rows.filter((r) => r.count).map((r) => ({label: r.cat, value: r.committed + r.awaiting, display: L.eur(r.committed + r.awaiting), tone: r.move >= 3 ? "bad" : undefined, sub: (r.move > 0 ? "+" : "") + r.move.toFixed(1) + "% unit price"}))},
          {t: "note", title: "Fire alarm devices.", text: (fa.count ? L.eur(fa.committed + fa.awaiting) + " ordered this month. " : "No orders this month. ") + "Open issue on CastlePark, " + FA_ISSUE.title.toLowerCase() + ": " + FA_ISSUE.note}
        ];
      }
    },
    {
      id: "approvals", label: "Approvals", title: "Approvals",
      sub: "Orders over " + L.eur(THRESHOLD) + " route to " + L.MARTIN.name + ". Orders up to " + L.eur(THRESHOLD) + " route to the project manager.",
      build: (c) => {
        const pending = L.POS.filter((p) => p.status === "Awaiting Approval");
        const mine = pending.filter((p) => approverOf(p) === L.MARTIN.name);
        const pm = pending.filter((p) => approverOf(p) !== L.MARTIN.name);
        const row = (p) => {
          const done = approved(c.s, p.no);
          return {no: p.no, supplier: p.supplier, project: proj(p.project), item: p.item, value: L.eur(p.value), approver: approverOf(p),
            status: done ? "Approved" : "Awaiting approval", act: done ? doneBtn : approveBtn(c, p, p.no === STORY),
            act2: done ? "" : {btn: "Query", run: () => c.ask("Query " + p.no + " with " + L.PROJECT(p.project).pm)}, _hl: !done};
        };
        const cols = [{k: "no", label: "PO", kind: "mono"}, {k: "supplier", label: "Supplier"}, {k: "project", label: "Project"}, {k: "item", label: "Item", wrap: true},
          {k: "value", label: "Value", kind: "money"}, {k: "approver", label: "Approver", kind: "person"}, {k: "status", label: "Status", kind: "status"}, {k: "act", label: ""}, {k: "act2", label: ""}];
        const justNow = pending.filter((p) => approved(c.s, p.no));
        const recent = justNow.map((p) => ({p, when: "Just now"})).concat(L.POS.filter((p) => p.status !== "Awaiting Approval").map((p) => ({p, when: p.date})));
        return [
          {t: "kpis", cols: 4, items: [
            {label: "Awaiting approval", value: L.num(c.d.awaiting.length), sub: L.eur(c.d.awaitingValue) + " across all approvers", tone: c.d.awaiting.length ? "warn" : "ok", hero: true},
            {label: "Your queue", value: L.num(mine.filter((p) => isAwaiting(c.s, p)).length), sub: L.eur(L.sum(mine.filter((p) => isAwaiting(c.s, p)), (p) => p.value)) + ", over threshold"},
            {label: "With project managers", value: L.num(pm.filter((p) => isAwaiting(c.s, p)).length), sub: L.eur(L.sum(pm.filter((p) => isAwaiting(c.s, p)), (p) => p.value)) + ", " + pm.map((p) => approverOf(p)).join(" and ")},
            {label: "Approved this month", value: L.num(recent.length), sub: L.eur(L.sum(recent, (r) => r.p.value)) + " committed", tone: "ok"}
          ]},
          {t: "note", title: "Approval rule.", text: "Orders over " + L.eur(THRESHOLD) + " route to " + L.MARTIN.name + ". Orders up to " + L.eur(THRESHOLD) + " route to the project manager for that job. An approved order posts straight to the project as committed cost."},
          {t: "table", title: "Your approvals", sub: "Over " + L.eur(THRESHOLD) + ", routed to " + L.MARTIN.name, cols, rows: mine.map(row),
            foot: {no: mine.length + (mine.length === 1 ? " order" : " orders"), value: L.eur(L.sum(mine, (p) => p.value))}},
          {t: "table", title: "Awaiting project managers", sub: "Up to " + L.eur(THRESHOLD) + ", routed to the PM", cols, rows: pm.map(row),
            foot: {no: pm.length + " orders", value: L.eur(L.sum(pm, (p) => p.value))}},
          {t: "table", title: "Recently approved", sub: "This month",
            cols: [{k: "no", label: "PO", kind: "mono"}, {k: "supplier", label: "Supplier"}, {k: "project", label: "Project"}, {k: "value", label: "Value", kind: "money"}, {k: "by", label: "Approved by", kind: "person"}, {k: "when", label: "When"}, {k: "status", label: "Now", kind: "status"}],
            rows: recent.map((r) => ({no: r.p.no, supplier: r.p.supplier, project: proj(r.p.project), value: L.eur(r.p.value), by: r.when === "Just now" ? L.MARTIN.name : approverOf(r.p), when: r.when, status: statusOf(c.s, r.p)})),
            foot: {no: recent.length + " orders", value: L.eur(L.sum(recent, (r) => r.p.value))}}
        ];
      }
    }
  ]
};
