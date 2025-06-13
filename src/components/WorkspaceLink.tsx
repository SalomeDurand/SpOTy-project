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

  return <Link to={route} className="link-with-icon">{children || label || to}<svg
      className="icon"
      viewBox="0 0 11 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.33398 3.00033L1.91732 10.417C1.76454 10.5698 1.5701 10.6462 1.33398 10.6462C1.09787 10.6462 0.903429 10.5698 0.750651 10.417C0.597873 10.2642 0.521484 10.0698 0.521484 9.83366C0.521484 9.59755 0.597873 9.4031 0.750651 9.25033L8.16732 1.83366H1.83398C1.59787 1.83366 1.39996 1.7538 1.24023 1.59408C1.08051 1.43435 1.00065 1.23644 1.00065 1.00033C1.00065 0.764214 1.08051 0.566298 1.24023 0.406576C1.39996 0.246853 1.59787 0.166992 1.83398 0.166992H10.1673C10.4034 0.166992 10.6013 0.246853 10.7611 0.406576C10.9208 0.566298 11.0007 0.764214 11.0007 1.00033V9.33366C11.0007 9.56977 10.9208 9.76769 10.7611 9.92741C10.6013 10.0871 10.4034 10.167 10.1673 10.167C9.93121 10.167 9.73329 10.0871 9.57357 9.92741C9.41385 9.76769 9.33398 9.56977 9.33398 9.33366V3.00033Z"
        fill="currentColor"
      />
    </svg></Link>;
}
