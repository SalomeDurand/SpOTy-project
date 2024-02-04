import { FunctionComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { WorkspaceUri } from "../App";
import { lastPart } from "../lib/lastPart";

// A link to the page showing the given workspace.
//
// If not provided explicitly,
// the text of the link will be the last part of the URI of the workspace,
// unless `fullUri` is true, in which case it will be the full URI.
export const WorkspaceLink: FunctionComponent<{
  to: WorkspaceUri,
  fullUri?: boolean,
  children?: ReactNode,
}> = ({
  to,
  fullUri,
  children,
}) => {
  const route = `/w/${encodeURIComponent(to)}/`;
  const label = fullUri ? to: lastPart(to);

  return <Link to={route}>{children || label || to}</Link>;
}
