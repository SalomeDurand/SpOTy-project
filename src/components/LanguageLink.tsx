import { FunctionComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Language } from "../.ldo/spoty_ldo.typings";
import { useWsContext } from "./WsContext";

// Display a link to the language passed (as a Sentence or a URI).
// If called in the context of a WorkspaceLayout and if `noWs` is not set,
// the link is in the context of this workspace,
// otherwise, the link points to a standalone page for the sentence.
export const LanguageLink: FunctionComponent<
  { language: Language, children?: ReactNode } |
  { uri: string, children?: ReactNode }
> = (args) => {
  const wsCtx = useWsContext();

  let lid;
  let luri;
  let label = args.children;
  if ("language" in args) {
    const lang = args.language;
    luri = lang['@id'];
    if (lang === undefined) { return <>LANG IS UNDEFINED</>} // TODO remove this when the bug is fixed
    lid = lang.P220.at(0) ?? lang['@id'] as string;
    if (label === undefined) {
      label = lang.label;
    }
    // uri = lang.P220[0] || lang['@id'] as string;
  } else {
    lid = luri = args.uri;
    if (label === undefined) {
      label = args.uri.split('#').pop() as string;
    }
  }
  return (wsCtx === undefined)
    ? <a href={luri}>{label}</a>
    : <Link to={`${wsCtx.route()}lang/${encodeURIComponent(lid)}`}>{label}</Link>
    ;
}

