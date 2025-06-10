import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { StimulusLink } from "../components/StimulusLink";
import { useWsContext } from "../components/WsContext";
import { cap } from "../lib/cap";
import { makeNamedNode } from "../lib/nodes";
import { spoty } from "../lib/ns";
import DataTable from 'datatables.net-react';
import DataTablesCore from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-searchpanes-dt';
import 'datatables.net-select-dt';
// CSS
import "../components/DataTable.css";

DataTable.use(DataTablesCore);

export const StimuliPage: FunctionComponent = () => {
  const { dataset } = useLdo();
  const { i18n, t } = useTranslation(['spoty', 'translation']);

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

  return <DataTable key={i18n.language} options={{
    responsive: true,
    select: true,
    destroy: true,
    buttons: [
      {
        extend: 'searchPanes',
        config: {
          cascadePanes: true
        }
      }
    ],
    language: {
      info: t('Showing page _PAGE_ of _PAGES_', { ns: 'translation' }),
    },
    layout: {
      topStart: 'pageLength',
      topEnd: ['buttons', 'search'],
    }
  }}>
    <thead><tr>
      <th>{cap(t('stimulus'))}</th>
      <th>{cap(t('sentence', { count: 2 }))}</th>
    </tr></thead>
    <tbody>
      {rows.map(row => <tr key={row.trajId}>
        <td><StimulusLink stimulus={row.trajId} /></td>
        <td>{row.nb}</td>
      </tr>)
      }
    </tbody>
  </DataTable>;
}
