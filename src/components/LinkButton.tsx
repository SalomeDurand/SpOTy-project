import { FunctionComponent, MouseEventHandler, ReactNode } from "react";
// CSS
import "./LinkButton.css";

// A button that looks like a link
export const LinkButton: FunctionComponent<{
  onClick: MouseEventHandler<HTMLButtonElement>,
  disabled?: boolean,
  help?: string,
	children: ReactNode,
}> = ({
  onClick,
  disabled,
  help,
  children,
}) => {
  const label = help
    ? <abbr title={help}>{children}</abbr>
    : children;
  return <button className="LinkButton" onClick={onClick} disabled={disabled}>{label}</button>;
}
