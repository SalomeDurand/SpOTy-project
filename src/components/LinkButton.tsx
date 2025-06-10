import { FunctionComponent, MouseEventHandler, ReactNode } from "react";
// CSS
import "./LinkButton.css";

// A button that looks like a link
export const LinkButton: FunctionComponent<{
  onClick: MouseEventHandler<HTMLButtonElement>,
  disabled?: boolean,
  help?: string,
	children: ReactNode,
  className?: string,
}> = ({
  onClick,
  disabled,
  help,
  children,
  className
}) => {
  const label = help
    ? <abbr title={help}>{children}</abbr>
    : children;
  return <button className={`LinkButton${className ? " " + className : ""}`} onClick={onClick} disabled={disabled}>{label}</button>;
}
