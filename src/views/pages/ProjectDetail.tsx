import { Blocks, Pill, useLav, type Customs } from "../blocks/Blocks";
import { projectBlocks, PROJECT_TABS } from "../../logic/modules/projects";
import * as L from "../../logic/lavelle";

const { eur, eurK, pct } = L;
const MOBILE_SECTIONS: [string, string][] = [["Overview", "overview"], ["Labour", "labour"], ["Materials", "materials"], ["Commitments", "pos"], ["Claims", "claims"], ["Progress", "progress"], ["Issues", "issues"]];

export default function ProjectDetail({ projectId, customs }: { projectId: string; customs: Customs }) {
  const c = useLav();
  const p = L.PROJECT(projectId);
  const tab: string = c.s.projTab || "overview";
  const castle = p.id === "castlepark";
  const committed = castle ? c.d.castleCommitted : p.committed;
  const stage = castle ? c.d.castleStage : p.july.status;
  const claim = castle ? c.d.castleClaim : p.july.amount;
  const tone = p.health === "Green" ? "ok" : "warn";
  const blocks = projectBlocks(p, tab, c);

  if (c.mobile) {
    return (
      <div className="lv-stack">
        <button className="lv-back" onClick={() => c.set({ projectId: null })}>&larr; All projects</button>
        <div className="lv-card" style={{ padding: "18px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-.6px" }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 3 }}>{p.client}, {p.location}</div>
            </div>
            <Pill t={tone}>{p.health}</Pill>
          </div>
          <div style={{ marginTop: 18 }}>
            <div className="lv-eyebrow" style={{ marginBottom: 4 }}>Contract</div>
            <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-1.4px", lineHeight: 1 }}>{eurK(p.contract)}</div>
          </div>
          <div className="lv-bar" style={{ display: "flex", marginTop: 14 }}><i><b style={{ width: p.complete + "%" }} /></i><span style={{ minWidth: 40, color: "var(--ink)", fontWeight: 500 }}>{p.complete}%</span></div>
          <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 5 }}>Complete, programme {p.programme}%</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            {[["Cost to date", eurK(p.cost), ""], ["Claimed", eurK(p.claimed), ""], ["Forecast margin", pct(p.margin), "var(--accent)"], ["July claim", eurK(claim), ""]].map((x, i) => (
              <div key={i} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 13px" }}>
                <div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--faint)" }}>{x[0]}</div>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-.7px", marginTop: 6, color: x[2] || "var(--ink)" }}>{x[1]}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 12 }}>Committed {eur(committed)}, claim {stage}</div>
        </div>
        <div className="lv-tabs" style={{ width: "100%" }}>
          {MOBILE_SECTIONS.map((s) => <button key={s[1]} className={tab === s[1] ? "on" : ""} onClick={() => c.set({ projTab: s[1] })}>{s[0]}</button>)}
        </div>
        <Blocks blocks={blocks} customs={customs} />
      </div>
    );
  }

  return (
    <div className="lv-stack">
      <button className="lv-back" onClick={() => c.set({ projectId: null })}>&larr; All projects</button>
      <div className="lv-card" style={{ padding: "22px 24px" }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="lv-eyebrow">{p.sector} project</div>
            <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-.9px", lineHeight: 1.05 }}>{p.name}</div>
            <div style={{ fontSize: 13, color: "var(--dim)", marginTop: 8 }}>{p.scope}. {p.client}, {p.location}.</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,auto)", gap: "10px 34px", fontSize: 12.5 }}>
            {[["Client", p.client], ["Location", p.location], ["Project manager", p.pm], ["Status", p.status], ["Contract", eur(p.contract)], ["Start", p.start], ["Target completion", p.end], ["Health", p.health]].map((x, i) => (
              <div key={i}><div style={{ fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--faint)" }}>{x[0]}</div><div style={{ marginTop: 3, color: "var(--ink)", fontWeight: 500 }}>{x[1]}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="lv-tabs">
        {PROJECT_TABS.map((t) => <button key={t[0]} className={tab === t[0] ? "on" : ""} onClick={() => c.set({ projTab: t[0] })}>{t[1]}</button>)}
      </div>
      <Blocks blocks={blocks} customs={customs} />
    </div>
  );
}
