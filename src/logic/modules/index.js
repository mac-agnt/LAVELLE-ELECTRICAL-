import Estimating from "./estimating";
import Projects from "./projects";
import Claims from "./claims";
import Workforce from "./workforce";
import Procurement from "./procurement";
import Fleet from "./fleet";
import Dashboard from "./dashboard";

/* page name (sidebar page id) -> module spec */
export const MODULES = {Estimating, Projects, Claims, Workforce, Procurement, Fleet, Dashboard};
export const MODULE_PAGES = Object.keys(MODULES);
