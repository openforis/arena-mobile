import { WebWindow } from "./WebWindow";

// web preview of a survey embedded in Arena (?preview=1): no local DB, record kept in memory only
const search = WebWindow.get()?.location.search;
const searchParams = search === undefined ? null : new URLSearchParams(search);

const previewParam = searchParams?.get("preview") ?? null;

export const PreviewMode = {
  isActive: previewParam !== null,
  // "demo": the bundled demo survey is previewed, without waiting for one from the parent window
  isDemo: previewParam === "demo",
  // when set, only messages coming from this origin are accepted
  parentOrigin: searchParams?.get("parentOrigin") ?? null,
};
