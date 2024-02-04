import { FunctionComponent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { useWsContext } from "./WsContext";

export const StimulusLink: FunctionComponent<
  { stimulus: number | string, noWs?: boolean, children?: ReactNode }
> = ({ stimulus, noWs, children }) => {
  const wsCtx = useWsContext();

  const label = children || stimulus;

  return (wsCtx === undefined)
    ? <a href={mediaUrl(stimulus)}>{label}</a>
    : <Link to={`${wsCtx.route()}stim/${label}`}>{label}</Link>
    ;
}

export function mediaUrl(stimulus: number | string | undefined) {
  switch (typeof(stimulus)) {
    case "number":
      return `http://vps-6ad181ed.vps.ovh.net/static/stimuli/${stimulus}.webm`;
    case "string":
      return stimulus;
    default:
      return undefined;
  }
}
