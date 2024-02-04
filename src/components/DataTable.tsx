import { FunctionComponent, ReactNode } from "react";
// CSS
import "./DataTable.css";

// Eventually, DataTable should provide advanced features,
// such as sorting per different columns, or even filtering
// TODO: investigate existing components that do it already
export const DataTable: FunctionComponent<{
  children: ReactNode,
}> = ({
  children,
}) => {
  return <table className="DataTable">{children}</table>
}
