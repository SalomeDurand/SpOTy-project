import { createContext, FunctionComponent, ReactNode, useContext } from "react";
import { Workspace } from "../App";

const WsContextContext = createContext<WsContextSingleton| undefined>(undefined);

// A custom-element allowing its descendant to use `useWsContext`.
export const WsContext: FunctionComponent<{
  value: WsContextSingleton,
  children: ReactNode
}> = ({
  value,
  children,
}) => {
  return <WsContextContext.Provider value={value}>
    {children}
  </WsContextContext.Provider>
};

// Get access to the application context (see `WsContextSingleton`)
// and a dispatch function to modify it (see `WsContextAction`).
export function useWsContext(): WsContextSingleton {
  return useContext(WsContextContext) as WsContextSingleton;
}

// The singleton-class of the application context.
export class WsContextSingleton {
  workspace: Workspace;
  sentenceUris: string[] = [];
  loadIndicator: [number, number] = [0, 1];

  constructor (workspace: Workspace) {
    this.workspace = workspace;
  }

  isLoading = function (this: WsContextSingleton): boolean {
    return this.loadIndicator[0] !== this.loadIndicator[1];
  };

  route = function(this: WsContextSingleton): string {
    return `/w/${encodeURIComponent(this.workspace.uri)}/`;
  }
}
