import { Fragment, createContext, useContext, type ComponentType, type ReactNode } from "react";

/* The page context (state, setters, navigation) travels by context so custom blocks can be real components. */
export const LavCtx = createContext<any>(null);
export const useLav = () => useContext(LavCtx);

/* Block renderer for the Lavelle module pages. A page is an array of plain
   block objects (see src/logic/modules/README.md for the DSL); this turns them
   into markup. Colours come from the theme tokens, never hard-coded. */

const TONES = ["ok", "warn", "bad", "accent"];
const tone = (t?: string) => (t && TONES.indexOf(t) > -1 ? " t-" + t : "");

const GOOD = /^(green|healthy|paid|delivered|received|confirmed|connected|won|synced|certified|on track|complete|active|live|reliable|invoice generated|approved|allocated|submitted|ordered)$/i;
const WARN = /^(amber|pending|draft|pm review|part delivered|chase|watching|medium|qualifying|take-off|estimating|needs allocation|needs assignment|requires pm review|ready for approval|awaiting approval|awaiting|due|late twice|unallocated|quote issued)$/i;
const BAD = /(overdue|red|lost|failed|late|high|blocked|behind|over budget|above)/i;
export const statusTone = (s: string): string => (GOOD.test(s) ? "ok" : WARN.test(s) ? "warn" : BAD.test(s) ? "bad" : "");

export const Pill = ({ children, t }: { children: ReactNode; t?: string }) => {
  const s = typeof children === "string" ? children : "";
  const k = t ?? (s ? statusTone(s) : "");
  return <span className={"lv-pill" + tone(k)}>{children}</span>;
};

export const Btn = ({ children, run, primary, ghost, sm, disabled }: any) => (
  <button className={"lv-btn" + (primary ? " primary" : "") + (ghost ? " ghost" : "") + (sm ? " sm" : "")} onClick={run} disabled={disabled}>
    {children}
  </button>
);

const initials = (n: string) => n.split(" ").map((x) => x[0]).slice(0, 2).join("");

function Cell({ col, val }: { col: any; val: any }): ReactNode {
  let v = val;
  let t: string | undefined;
  let sub: string | undefined;
  if (v && typeof v === "object" && !Array.isArray(v) && "v" in v) { t = v.tone; sub = v.sub; v = v.v; }
  if (v && typeof v === "object" && "btn" in v) {
    return <Btn sm primary={v.primary} ghost={!v.primary} run={(e: any) => { e.stopPropagation(); v.run && v.run(); }} disabled={v.disabled}>{v.btn}</Btn>;
  }
  if (v === undefined || v === null) return "";
  switch (col.kind) {
    case "status": return <Pill t={t}>{String(v)}</Pill>;
    case "pct": return <>{typeof v === "number" ? +v.toFixed(1) + "%" : v}</>;
    case "bar": {
      const n = Math.max(0, Math.min(100, Number(v)));
      return <span className="lv-bar"><i><b style={{ width: n + "%", background: t ? `var(--${t === "accent" ? "accent" : t})` : undefined }} /></i><span>{+n.toFixed(1)}%</span></span>;
    }
    case "person": return <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span className="lv-av">{initials(String(v))}</span>{String(v)}</span>;
    case "name": return <><span className="n">{String(v)}</span>{sub && <span className="sub">{sub}</span>}</>;
    default:
      return t ? <span style={{ color: `var(--${t === "accent" ? "accent" : t})`, fontWeight: 500 }}>{String(v)}</span> : <>{String(v)}{sub && <span className="sub">{sub}</span>}</>;
  }
}

function TableBlock({ b }: { b: any }) {
  const cols: any[] = b.cols;
  const right = (c: any) => c.align === "r" || c.kind === "money" || c.kind === "pct";
  return (
    <div className="lv-card">
      {(b.title || b.action) && (
        <div className="lv-card-head">
          <div className="lv-grow"><h3>{b.title}</h3>{b.sub && <div className="lv-sub">{b.sub}</div>}</div>
          {b.action && <Btn sm ghost run={b.action.run}>{b.action.label}</Btn>}
        </div>
      )}
      <div className="lv-tablewrap">
        <table className="lv-table">
          <thead><tr>{cols.map((c, i) => <th key={i} className={right(c) ? "r" : ""}>{c.label}</th>)}</tr></thead>
          <tbody>
            {b.rows.map((r: any, i: number) => (
              <tr key={i} className={(r._go ? "go" : "") + (r._hl ? " hl" : "")} onClick={r._go}>
                {cols.map((c, j) => (
                  <td key={j} className={(right(c) ? "r " : "") + (c.kind === "mono" ? "mono " : "") + (c.wrap ? "wrap" : "")}>
                    <Cell col={c} val={r[c.k]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          {b.foot && <tfoot><tr>{cols.map((c, j) => <td key={j} className={right(c) ? "r" : ""}>{b.foot[c.k] ?? ""}</td>)}</tr></tfoot>}
        </table>
      </div>
    </div>
  );
}

function Donut({ items, size = 132 }: { items: any[]; size?: number }) {
  const total = items.reduce((n, x) => n + x.value, 0) || 1;
  const r = size / 2 - 11, c = 2 * Math.PI * r;
  let off = 0;
  const colors = ["var(--accent)", "#6ad0f0", "#e6c78a", "#c8b4f0", "#e2705c", "var(--ok)"];
  return (
    <div className="lv-donut">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth="13" />
        {items.map((x, i) => {
          const len = (x.value / total) * c;
          const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={x.color || colors[i % colors.length]} strokeWidth="13"
            strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-off} transform={`rotate(-90 ${size / 2} ${size / 2})`} />;
          off += len; return el;
        })}
      </svg>
      <div className="lv-legend">
        {items.map((x, i) => <div key={i}><i style={{ background: x.color || colors[i % colors.length] }} />{x.label}<b>{x.display ?? x.value}</b></div>)}
      </div>
    </div>
  );
}

function LineChart({ b }: { b: any }) {
  const W = 520, H = 170, pad = 8;
  const series: any[] = b.series;
  const all = series.flatMap((s) => s.data);
  const max = Math.max(...all) * 1.08, min = Math.min(0, ...all);
  const n = b.labels.length;
  const X = (i: number) => pad + (i * (W - pad * 2)) / Math.max(1, n - 1);
  const Y = (v: number) => H - pad - ((v - min) / (max - min || 1)) * (H - pad * 2 - 14);
  const colors = ["var(--accent)", "#6ad0f0", "#e6c78a"];
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H + 22}`} style={{ width: "100%", height: "auto", display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((g, i) => <line key={i} x1={pad} x2={W - pad} y1={Y(min + (max - min) * g)} y2={Y(min + (max - min) * g)} stroke="var(--border)" strokeWidth="1" />)}
        {series.map((s, si) => {
          const d = s.data.map((v: number, i: number) => (i ? "L" : "M") + X(i) + " " + Y(v)).join(" ");
          return <g key={si}>
            {si === 0 && <path d={d + ` L ${X(n - 1)} ${H - pad} L ${X(0)} ${H - pad} Z`} fill="var(--accent-faint)" />}
            <path d={d} fill="none" stroke={colors[si % 3]} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            {s.data.map((v: number, i: number) => <circle key={i} cx={X(i)} cy={Y(v)} r={i === n - 1 ? 4 : 2.4} fill={colors[si % 3]} />)}
          </g>;
        })}
        {b.labels.map((l: string, i: number) => <text key={i} x={X(i)} y={H + 14} textAnchor="middle" fontSize="10" fill="var(--faint)" fontFamily="var(--mono)">{l}</text>)}
      </svg>
      {series.length > 1 && <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11.5, color: "var(--dim)" }}>{series.map((s, i) => <span key={i} style={{ display: "inline-flex", gap: 7, alignItems: "center" }}><i style={{ width: 9, height: 9, borderRadius: 3, background: colors[i % 3] }} />{s.name}</span>)}</div>}
    </div>
  );
}

function Card({ title, sub, action, children }: { title?: string; sub?: string; action?: any; children: ReactNode }) {
  return (
    <div className="lv-card">
      {(title || action) && (
        <div className="lv-card-head">
          <div className="lv-grow"><h3>{title}</h3>{sub && <div className="lv-sub">{sub}</div>}</div>
          {action && <Btn sm ghost run={action.run}>{action.label}</Btn>}
        </div>
      )}
      {children}
    </div>
  );
}

export type Customs = Record<string, ComponentType<any>>;

export function Block({ b, customs }: { b: any; customs: Customs }): ReactNode {
  if (!b) return null;
  switch (b.t) {
    case "kpis":
      return (
        <div className="lv-kpis" style={b.cols ? { gridTemplateColumns: `repeat(${b.cols},1fr)` } : undefined}>
          {b.items.map((k: any, i: number) => (
            <div key={i} className={"lv-kpi" + tone(k.tone) + (k.go ? " is-go" : "") + (k.hero ? " hero" : "")} onClick={k.go}>
              <div className="l">{k.label}</div>
              <div className="v">{k.value}</div>
              {k.sub && <div className="s">{k.delta ? <b>{k.delta}</b> : null}{k.delta ? " " : ""}{k.sub}</div>}
            </div>
          ))}
        </div>
      );
    case "table": return <TableBlock b={b} />;
    case "bars": {
      const max = b.max ?? Math.max(...b.items.map((x: any) => x.value), 1);
      return (
        <Card title={b.title} sub={b.sub} action={b.action}>
          <div className="lv-hbars">
            {b.items.map((x: any, i: number) => (
              <div key={i} className={"lv-hbar" + tone(x.tone)}>
                <div className="top"><span className="n">{x.label}</span><span className="d">{x.display ?? x.value}</span></div>
                <div className="track"><b style={{ width: Math.max(2, (x.value / max) * 100) + "%" }} /></div>
                {x.sub && <div className="sub">{x.sub}</div>}
              </div>
            ))}
          </div>
        </Card>
      );
    }
    case "cols": {
      const max = Math.max(...b.data.map((d: any) => d[1]), 1);
      return (
        <Card title={b.title} sub={b.sub} action={b.action}>
          <div className="lv-cols">
            {b.data.map((d: any, i: number) => (
              <div key={i} className={"lv-col" + (i === (b.on ?? b.data.length - 1) ? " on" : "")}>
                <span className="d">{d[2] ?? d[1]}</span>
                <div className="bar" style={{ height: Math.max(4, (d[1] / max) * 78) + "%" }} />
                <span className="l">{d[0]}</span>
              </div>
            ))}
          </div>
        </Card>
      );
    }
    case "line": return <Card title={b.title} sub={b.sub} action={b.action}><LineChart b={b} /></Card>;
    case "donut": return <Card title={b.title} sub={b.sub} action={b.action}><Donut items={b.items} /></Card>;
    case "feed":
      return (
        <Card title={b.title} sub={b.sub} action={b.action}>
          <div className="lv-feed">
            {b.items.map((x: any, i: number) => (
              <div key={i} className={"it" + (x.go ? " go" : "")} onClick={x.go}>
                {x.time && <span className="time">{x.time}</span>}
                <span className={"dot" + tone(x.tone)} />
                <div className="tx">{x.title && <b>{x.title} </b>}{x.text}</div>
                {x.tag && <Pill t={x.tagTone}>{x.tag}</Pill>}
              </div>
            ))}
          </div>
        </Card>
      );
    case "alerts":
      return (
        <div className="lv-stack" style={{ gap: 10 }}>
          {b.items.map((a: any, i: number) => (
            <div key={i} className={"lv-alert" + tone(a.tone)}>
              <span className="ic" />
              <div className="tx"><b>{a.title}</b>{a.body}</div>
              {a.action && <Btn primary={a.action.primary} sm run={a.action.run} disabled={a.action.disabled}>{a.action.label}</Btn>}
              {a.action2 && <Btn ghost sm run={a.action2.run}>{a.action2.label}</Btn>}
            </div>
          ))}
        </div>
      );
    case "cards":
      return (
        <div className="lv-stack" style={{ gap: 10 }}>
          {b.title && <div className="lv-eyebrow" style={{ margin: 0 }}>{b.title}</div>}
          <div className="lv-cards" style={{ gridTemplateColumns: `repeat(auto-fill,minmax(${b.min ?? 260}px,1fr))` }}>
            {b.items.map((c: any, i: number) => (
              <div key={i} className={"lv-mini" + (c.go ? " go" : "")} onClick={c.go}>
                <div className="t"><b>{c.title}</b>{c.pill && <Pill t={c.pillTone}>{c.pill}</Pill>}</div>
                {c.sub && <div className="sub">{c.sub}</div>}
                {c.big && <div className="big">{c.big}</div>}
                {(c.lines || []).map((l: any, j: number) => <div key={j} className="row">{l[0]}<b>{l[1]}</b></div>)}
                {c.progress != null && <div style={{ marginTop: 12 }}><span className="lv-bar"><i><b style={{ width: c.progress + "%" }} /></i><span>{c.progress}%</span></span></div>}
              </div>
            ))}
          </div>
        </div>
      );
    case "split":
      return (
        <div className="lv-split" style={{ gridTemplateColumns: b.ratio || "2fr 1fr" }}>
          <div className="lv-stack">{b.left.map((x: any, i: number) => <Block key={i} b={x} customs={customs} />)}</div>
          <div className="lv-stack">{b.right.map((x: any, i: number) => <Block key={i} b={x} customs={customs} />)}</div>
        </div>
      );
    case "grid":
      return (
        <div className="lv-grid" style={{ gridTemplateColumns: `repeat(${b.cols || 2},minmax(0,1fr))` }}>
          {b.items.map((x: any, i: number) => <Block key={i} b={x} customs={customs} />)}
        </div>
      );
    case "steps":
      return (
        <div className="lv-steps">
          {b.items.map((s: any, i: number) => (
            <div key={i} className={"lv-step " + (s.state || "todo")}><div className="n">{s.label}</div>{s.sub && <div className="s">{s.sub}</div>}</div>
          ))}
        </div>
      );
    case "tabs":
      return (
        <div className="lv-chips">
          {b.items.map((x: any, i: number) => <button key={i} className={x.on ? "on" : ""} onClick={x.run}>{x.label}</button>)}
        </div>
      );
    case "actions": return <div className="lv-actions">{b.items.map((a: any, i: number) => <Btn key={i} primary={a.primary} ghost={a.ghost} run={a.run} disabled={a.disabled}>{a.label}</Btn>)}</div>;
    case "note": return <div className="lv-note">{b.title && <b>{b.title} </b>}{b.text}</div>;
    case "sync":
      return <div className="lv-sync"><i />{b.text}</div>;
    case "section": return <div className="lv-eyebrow" style={{ margin: "6px 0 -4px" }}>{b.title}</div>;
    case "custom": { const C = customs[b.name]; return C ? <C {...(b.props || {})} /> : null; }
    default: return null;
  }
}

export function Blocks({ blocks, customs }: { blocks: any[]; customs: Customs }) {
  return <>{blocks.filter(Boolean).map((b, i) => <Block key={i} b={b} customs={customs} />)}</>;
}
