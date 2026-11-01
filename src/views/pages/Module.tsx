import { Blocks, LavCtx, type Customs } from "../blocks/Blocks";
import { MODULES } from "../../logic/modules";
import ClaimBuilder from "./ClaimBuilder";
import ProjectDetail from "./ProjectDetail";
import SiteBoard from "./SiteBoard";

type Props = { v: any; header?: boolean };

const customs: Customs = {
  claimBuilder: ClaimBuilder,
  siteBoard: SiteBoard,
  projectDetail: (p: any) => <ProjectDetail projectId={p.projectId} customs={customs} />
};

/* Renders one module tab from its declarative spec. */
export default function Module({ v, header = true }: Props) {
  const lav = v.lav;
  const mod = (MODULES as any)[lav.page];
  if (!mod) return null;
  const tab = mod.tabs.find((t: any) => t.id === lav.tab) || mod.tabs[0];
  const detail = lav.page === "Projects" && tab.id === "projects" && lav.s.projectId;
  const blocks = tab.build(lav.ctx);
  return (
    <LavCtx.Provider value={{ ...lav.ctx, mobile: lav.mobile }}>
      <div className="lv-page" key={lav.page + ":" + tab.id}>
        {header && !detail && (
          <div className="lv-head">
            <div className="lv-grow">
              <div className="lv-eyebrow">{lav.label}</div>
              <h1>{tab.title || tab.label}</h1>
              {tab.sub && <p>{tab.sub}</p>}
            </div>
          </div>
        )}
        <Blocks blocks={blocks} customs={customs} />
      </div>
    </LavCtx.Provider>
  );
}

export { customs };
