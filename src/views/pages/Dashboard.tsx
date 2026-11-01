import Module from "./Module";

type Props = { v: any };

/* The Dashboard's top-bar tabs (Executive, Projects, Commercial, Operations, Finance) are module tabs;
   the pinned KPI band above is DashboardKpiBand. */
export default function Dashboard({ v }: Props) {
  return <Module v={v} header={false} />;
}
