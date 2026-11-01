import { useState } from "react";
import { useLav } from "../blocks/Blocks";
import * as L from "../../logic/lavelle";

const SITES: [string, string][] = [["castlepark", "CastlePark Manor"], ["ringsend", "Ringsend"], ["harbour", "Harbour Exchange"], ["kimmage", "Kimmage Phase II"], ["smallworks", "Service / small works"], ["other", "Other sites"]];

/* Visual allocation board. Drag a person to another site; the counts follow. */
export default function SiteBoard() {
  const c = useLav();
  const base = (id: string) => (id === "maynooth" || id === "galway" ? "other" : id);
  const [moves, setMoves] = useState<Record<string, string>>({});
  const [over, setOver] = useState<string | null>(null);
  const where = (e: any) => moves[e.id] || base(e.project);
  return (
    <div className="lv-board" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
      {SITES.map(([id, name]) => {
        const people = L.ON_SITE.filter((e) => where(e) === id);
        const foreman = people.find((e) => e.role === "Foreman");
        return (
          <div key={id} className={"lv-site" + (over === id ? " over" : "")}
            onDragOver={(e) => { e.preventDefault(); setOver(id); }} onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); const eid = e.dataTransfer.getData("text/plain"); if (eid) setMoves({ ...moves, [eid]: id }); setOver(null); }}>
            <div className="h"><b>{name}</b><span>{people.length}</span></div>
            <div style={{ fontSize: 11.5, color: "var(--dim)", marginBottom: 8 }}>{foreman ? "Foreman " + foreman.name : "No foreman today"}</div>
            {people.slice(0, 6).map((e) => (
              <div key={e.id} className="lv-person" draggable onDragStart={(ev) => ev.dataTransfer.setData("text/plain", e.id)}>
                <span className="lv-av">{e.name.split(" ").map((x) => x[0]).join("")}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                <span style={{ fontSize: 10.5, color: "var(--faint)" }}>{e.sub ? "Sub" : e.role === "Foreman" ? "Foreman" : ""}</span>
              </div>
            ))}
            {people.length > 6 && <div style={{ fontSize: 11.5, color: "var(--faint)", padding: "6px 0 0" }}>+{people.length - 6} more</div>}
          </div>
        );
      })}
    </div>
  );
}
