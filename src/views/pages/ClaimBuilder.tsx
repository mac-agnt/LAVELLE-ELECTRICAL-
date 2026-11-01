import { useEffect, useRef, useState } from "react";
import { Btn, Pill, useLav } from "../blocks/Blocks";
import * as L from "../../logic/lavelle";

const { eur, pct } = L;

/* The Quote -> Claim -> Invoice workflow. Package percentages drive the claim value,
   the claim document is generated from them, management approves, the invoice is
   issued and posted to Xero. State lives in the Pulse logic so every screen agrees. */
export default function ClaimBuilder({ projectId }: { projectId: string }) {
  const c = useLav();
  const p = L.PROJECT(projectId);
  const castle = projectId === "castlepark";
  const pk = L.packagesFor(projectId);
  const stage: string = castle ? c.d.castleStage : p.july.status;
  const key = (id: string) => (castle ? id : projectId + ":" + id);
  const pctOf = (k: any) => (c.s.claimPct[key(k.id)] ?? k.pct) as number;
  const earned = (k: any) => Math.round((k.value * pctOf(k)) / 100);
  const cur = (k: any) => Math.max(0, earned(k) - k.prev);
  const total = pk.reduce((n: number, k: any) => n + cur(k), 0);
  const prevTotal = pk.reduce((n: number, k: any) => n + k.prev, 0);
  const cum = prevTotal + total;

  /* "populate -> calculate -> preview" animation */
  const [prog, setProg] = useState(1);
  const [phase, setPhase] = useState(0);
  const timer = useRef<any>(null);
  useEffect(() => () => clearInterval(timer.current), []);
  const generate = () => {
    clearInterval(timer.current);
    setPhase(1); setProg(0);
    let t = 0;
    timer.current = setInterval(() => {
      t += 1;
      if (t <= 14) setProg(t / 14);
      if (t === 14) setPhase(2);
      if (t === 20) { setPhase(3); clearInterval(timer.current); c.set({ claimDocOpen: true, claimStage: { ...c.s.claimStage, [projectId]: "Ready for Approval" } }); }
    }, 70);
  };
  const setStage = (st: string) => c.set({ claimStage: { ...c.s.claimStage, [projectId]: st } });
  const stageIdx = ["Draft", "PM Review", "Ready for Approval", "Submitted", "Certified", "Invoice Generated", "Paid"].indexOf(stage);
  const xero = !!c.s.xeroSynced[projectId];
  const invoiced = stage === "Invoice Generated" || stage === "Paid";
  const [posting, setPosting] = useState(false);
  const makeInvoice = () => {
    setStage("Invoice Generated");
    setPosting(true);
    setTimeout(() => { setPosting(false); c.set({ xeroSynced: { ...c.s.xeroSynced, [projectId]: true } }); }, 1500);
  };
  const approve = () => setStage("Submitted");
  const view = phase === 1 ? prog : 1;
  const showDoc = c.s.claimDocOpen && c.s.claimDocFor !== "none";
  const editable = stageIdx < 3;

  return (
    <div className="lv-stack">
      <div className="lv-card">
        <div className="lv-card-head">
          <div className="lv-grow">
            <h3>July claim builder, {p.name}</h3>
            <div className="lv-sub">Quote packages and site progress produce the claim. Adjust a percentage and the claim recalculates.</div>
          </div>
          <Pill>{stage}</Pill>
        </div>
        <div className="lv-steps" style={{ marginBottom: 16 }}>
          {[["Percentages", "From site progress"], ["Claim value", "Calculated"], ["Claim document", "Preview"], ["Approval", "Martin Lavelle"], ["Invoice", "Generated"], ["Xero", "Two-way sync"]].map((s, i) => {
            const done = i === 0 ? phase >= 1 || stageIdx >= 2 : i === 1 ? phase >= 2 || stageIdx >= 2 : i === 2 ? showDoc || stageIdx >= 3 : i === 3 ? stageIdx >= 3 : i === 4 ? invoiced : xero;
            const now = !done && (i === 0 ? false : [phase === 1, phase === 2, false, stageIdx === 2, stageIdx === 3, posting][i - 1] || (i === 3 && showDoc && stageIdx === 2) || (i === 4 && stageIdx === 3));
            return <div key={i} className={"lv-step " + (done ? "done" : now ? "now" : "todo")}><div className="n">{s[0]}</div><div className="s">{s[1]}</div></div>;
          })}
        </div>
        <div className="lv-tablewrap">
          <table className="lv-table">
            <thead><tr><th>Package</th><th className="r">Contract value</th><th style={{ minWidth: 200 }}>Complete</th><th className="r">Previous claim</th><th className="r">Current claim</th></tr></thead>
            <tbody>
              {pk.map((k: any) => {
                const v = pctOf(k) * view;
                return (
                  <tr key={k.id}>
                    <td><span className="n" style={{ color: "var(--ink)", fontWeight: 500 }}>{k.name}</span></td>
                    <td className="r">{eur(k.value)}</td>
                    <td>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 10, width: "100%" }}>
                        <input type="range" min={Math.floor((k.prev / k.value) * 100)} max={100} step={1} value={Math.round(v)} disabled={!editable || phase === 1}
                          onChange={(e) => c.set({ claimPct: { ...c.s.claimPct, [key(k.id)]: +e.target.value } })}
                          style={{ flex: 1, accentColor: "var(--accent)", minWidth: 90 }} />
                        <span style={{ width: 44, textAlign: "right", fontVariantNumeric: "tabular-nums", color: "var(--ink)" }}>{+v.toFixed(v % 1 ? 1 : 0)}%</span>
                      </span>
                    </td>
                    <td className="r">{eur(k.prev)}</td>
                    <td className="r" style={{ color: cur(k) > 0 ? "var(--ink)" : "var(--faint)", fontWeight: 500 }}>{eur(Math.round(cur(k) * view))}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr><td>Total</td><td className="r">{eur(p.contract)}</td><td>{pct(cum / p.contract * 100)} complete</td><td className="r">{eur(prevTotal)}</td><td className="r" style={{ color: "var(--accent)" }}>{eur(Math.round(total * view))}</td></tr>
            </tfoot>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 16 }}>
          <Btn primary run={generate} disabled={phase === 1 || phase === 2 || invoiced}>Generate July Claim</Btn>
          <Btn run={() => setStage("Draft")} disabled={!editable}>Save Draft</Btn>
          <Btn run={() => setStage("Ready for Approval")} disabled={stageIdx >= 2 || stageIdx < 0}>Submit for Approval</Btn>
          <Btn run={() => c.set({ claimDocOpen: true })} disabled={!showDoc && stageIdx < 2}>Generate Claim</Btn>
          <Btn run={makeInvoice} disabled={stageIdx !== 3 && stageIdx !== 4}>Generate Invoice</Btn>
          <span style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--dim)" }}>
            {phase === 1 ? "Populating percentages from site progress" : phase === 2 ? "Calculating claim value" : <>Current claim <b style={{ color: "var(--ink)", fontWeight: 600 }}>{eur(total)}</b>, cumulative {eur(cum)}</>}
          </span>
        </div>
      </div>

      {showDoc && (
        <div className="lv-doc">
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <img src="/logo/lavelle-wordmark.png" alt="Lavelle Electrical Contractors" style={{ height: 36 }} />
            <div style={{ marginLeft: "auto", textAlign: "right", fontSize: 11.5, color: "#6b706d" }}>Payment claim {castle ? "No. 4" : "No. 5"}<br />July valuation</div>
          </div>
          <div className="lv-brandbar" style={{ marginBottom: 16 }} />
          <h2>{p.name}</h2>
          <div style={{ color: "#4a4f4c", marginBottom: 14 }}>To {p.client}, {p.location}. {p.scope}.</div>
          <div className="row h"><span className="c">Package</span><span className="r">Value</span><span className="r">Complete</span><span className="r">Previous</span><span className="r">This claim</span></div>
          {pk.map((k: any) => (
            <div className="row" key={k.id}><span className="c">{k.name}</span><span className="r">{eur(k.value)}</span><span className="r">{+pctOf(k).toFixed(1)}%</span><span className="r">{eur(k.prev)}</span><span className="r">{eur(cur(k))}</span></div>
          ))}
          <div className="row t"><span className="c">Claim value, ex VAT</span><span className="r" style={{ width: "auto" }}>{eur(total)}</span></div>
          <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap", alignItems: "center" }}>
            {stageIdx === 2 && <Btn primary run={approve}>Approve and submit</Btn>}
            {stageIdx === 3 && <><Pill t="ok">Approved by Martin Lavelle</Pill><Btn primary run={makeInvoice}>Generate Invoice</Btn></>}
            {invoiced && <Pill t="ok">Approved and submitted</Pill>}
            <Btn ghost run={() => c.set({ claimDocOpen: false })}>Close preview</Btn>
          </div>
        </div>
      )}

      {invoiced && (
        <div className="lv-alert t-ok">
          <span className="ic" />
          <div className="tx">
            <b>{castle ? "INV-1084" : "Invoice"} generated, {eur(total)}</b>
            {posting ? "Posting to Xero" : xero ? "Synced to Xero. Payment status will flow back into Pulse when Xero records it." : "Ready to post to Xero"}
          </div>
          <span className="lv-sync"><i style={{ background: posting ? "var(--warn)" : "var(--ok)" }} />{posting ? "Syncing" : "Xero synced"}</span>
          <Btn sm ghost run={() => c.go("Claims", "receivables")}>Open receivables</Btn>
        </div>
      )}
    </div>
  );
}
