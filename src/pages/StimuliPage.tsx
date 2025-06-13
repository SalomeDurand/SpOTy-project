import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { StimulusLink } from "../components/StimulusLink";
import { useWsContext } from "../components/WsContext";
import { cap } from "../lib/cap";
import { makeNamedNode } from "../lib/nodes";
import { spoty } from "../lib/ns";
import { DataTableComponent } from "../components/DataTable";

export const StimuliPage: FunctionComponent = () => {
  const { dataset } = useLdo();
  const { t } = useTranslation('spoty');

  const wsContext = useWsContext();

  const trajId = makeNamedNode(spoty.trajectoiresId);
  const stimuli = wsContext.sentenceUris
    .flatMap(uri => dataset.match(makeNamedNode(uri), trajId, null).toArray())
    .map(q => q.object.value)
    ;
  let map = new Map<string, number>();
  for (let stim of stimuli) {
    map.set(stim, (map.get(stim) ?? 0) + 1)
  };

  const rows = Array.from(map.entries())
    .map(([key, val]) => ({
      trajId: parseInt(key),
      nb: val,
    }))
    .sort((a, b) => a.trajId - b.trajId)
    ;

  return <DataTableComponent columns={2}>
    <thead><tr>
      <th>{cap(t('stimulus'))}</th>
      <th>{cap(t('number of sentences'))}</th>
    </tr></thead>
    <tbody>
      {rows.map(row => <tr key={row.trajId}>
        <td>{t('No.')} <StimulusLink stimulus={row.trajId} /></td>
        <td>{row.nb}</td>
      </tr>)
      }
    </tbody>
  </DataTableComponent>;
}
