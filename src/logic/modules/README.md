# Module page specs (Lavelle)

A module = one sidebar page. File exports `default {id, tabs}`:

```js
import * as L from "../lavelle";
export default {
  id: "Procurement",                       // page name, must match the registry in index.js
  tabs: [
    { id: "overview", label: "Overview",   // label is the top-bar tab
      title: "Procurement", sub: "one-line description under the title",
      build: (c) => [ /* blocks */ ] },
  ],
};
```

`c` (context) = `{ s, d, set, mark, openProject, go, ask }`
- `s`  demo state (see LAV_DEFAULT in lavelle.js). `d` = `L.derive(s)` (live awaiting POs, committed, unallocated fuel, claim totals).
- `c.mark(key, id, val=true)` sets `s[key][id]=val` (e.g. `c.mark("poApproved","PO-4821")`). `c.set(patch)` shallow-merges any top-level keys.
- `c.openProject(projectId, tabId="overview")` jumps into a project record. `c.go(pageName, tabId)` jumps to another module tab. `c.ask(q)` sends q to the Pulse AI on Home.

## Blocks (plain objects, `t` = type). Row/KPI/card `go:` or `_go:` = click handler.
- `{t:"kpis", cols?, items:[{label, value, sub?, delta?, tone?:"ok|warn|bad|accent", hero?, go?}]}`  (delta is bold coloured text before sub)
- `{t:"table", title?, sub?, action?:{label,run}, cols:[{k,label,kind?,align?,wrap?}], rows:[{k:val, _go?, _hl?}], foot?:{k:val}}`
  kinds: "money"(right aligned) "pct" "status"(auto-coloured pill) "bar"(0-100 number) "person" "name"(cell may be `{v,sub}`) "mono" or omit.
  Any cell may be `{v:"text", tone:"ok|warn|bad|accent", sub?}` or `{btn:"Approve", run, primary?, disabled?}` (a button).
- `{t:"bars", title, sub?, items:[{label,value,display?,tone?,sub?}], max?}` horizontal bars
- `{t:"cols", title, sub?, data:[[label,value,displayText?]], on?}` vertical columns, last highlighted
- `{t:"line", title, labels:[..], series:[{name,data:[..]}]}`
- `{t:"donut", title, items:[{label,value,display?}]}`
- `{t:"feed", title, items:[{time?,title?,text,tone?,tag?,go?}]}`
- `{t:"alerts", items:[{tone, title, body, action?:{label,run,primary?,disabled?}, action2?}]}`
- `{t:"cards", title?, min?, items:[{title,sub?,pill?,pillTone?,big?,lines?:[[k,v]],progress?,go?}]}`
- `{t:"split", ratio:"2fr 1fr", left:[blocks], right:[blocks]}`  `{t:"grid", cols:2, items:[blocks]}`
- `{t:"steps", items:[{label,sub?,state:"done|now|todo"}]}`  `{t:"tabs", items:[{label,on,run}]}` (filter chips)
- `{t:"actions", items:[{label,run,primary?,ghost?,disabled?}]}`  `{t:"note", title?, text}`  `{t:"sync", text}`  `{t:"section", title}`
- `{t:"custom", name, props}`: registered customs: `claimBuilder {projectId}`, `siteBoard {}`, `projectDetail {projectId}`.

## Rules
- Numbers come from `src/logic/lavelle.js` (import `* as L`). Never type a figure that exists there. Use L.eur / L.eurK / L.pct / L.num.
- Every table/KPI/chart count must reconcile with other screens. Story values are fixed (see lavelle.js and the brief).
- No exclamation marks, no lorem ipsum, no empty tabs. Every tab returns 3 to 6 blocks, dense but readable. Mobile is automatic (blocks stack).
- Do not edit lavelle.js, Blocks.tsx, PulseLogic.js or any file outside your assigned module files. If you need new data, define it in your own module file.
