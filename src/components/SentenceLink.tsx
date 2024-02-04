import { FunctionComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Sentence } from "../.ldo//spoty_ldo.typings";
import { useWsContext } from "./WsContext";

// Display a link to the sentence passed (as a Sentence or a URI).
// If called in the context of a WorkspaceLayout and if `noWs` is not set,
// the link is in the context of this workspace,
// otherwise, the link points to a standalone page for the sentence.
export const SentenceLink: FunctionComponent<
  { sentence: Sentence, noWs?: boolean, children?: ReactNode } |
  { uri: string, noWs?: boolean, children?: ReactNode }
> = (args) => {
  const wsCtx = useWsContext();
  
  let uri;
  let label = args.children;
  if ("sentence" in args) {
    const s = args.sentence;
    uri = s['@id'] as string;
    if (label === undefined) {
      label = s.identifier;
    }
  } else {
    uri = args.uri;
    if (label === undefined) {
      label = uri.split('#').pop() as string;
    }
  }

  let route;
  if (args.noWs || wsCtx === undefined) {
    route = `/s/${encodeURIComponent(uri)}/`;
  } else {
    const wsUri = wsCtx.workspace.uri;
    const shortUri = (uri.startsWith(wsUri))
      ? `./${uri.substring(wsUri.length)}`
      : uri;
    route = wsCtx.route() + `s/${encodeURIComponent(shortUri)}/`;
  }

  return <Link to={route}>{label}</Link>
}
