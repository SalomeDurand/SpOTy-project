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
import 'datatables.net-buttons/js/buttons.html5.mjs';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import 'datatables.net-searchpanes-dt';
import 'datatables.net-select-dt';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
// CSS
import "../components/DataTable.css";

pdfMake.vfs = (pdfFonts as any).vfs;
DataTablesCore.Buttons.pdfMake(pdfMake);
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
            extend: 'collection',
            text: cap(t('export', { ns: 'translation' })),
            buttons: [
              {
                extend: 'copy',
                text: t('copy', { ns: 'translation' }),
              },
              {
                extend: 'csv',
                text: t('csv', { ns: 'translation' }),
              },
              {
                extend: 'pdfHtml5',
                text: t('pdf', { ns: 'translation' }),
              }
            ]
          }
        ],
        language: {
          info: cap(t('showing page _PAGE_ of _PAGES_', { ns: 'translation' })),
          infoFiltered: cap(t('(filtered from _MAX_ total entries)', { ns: 'translation' })),
          lengthMenu: cap(t('_MENU_ entries per page', { ns: 'translation' })),
          search: cap(t('search&#58;', { ns: 'translation' })),
          buttons: {
            copy: t('copy', { ns: 'translation' }),
            csv: t('csv', { ns: 'translation' }),
            pdf: t('pdf', { ns: 'translation' }),
            copyTitle: t('Copy to clipboard', { ns: 'translation' }),
            copySuccess: {
              _: t('copied %d rows to clipboard', { ns: 'translation' }),
              1: t('copied 1 row to clipboard', { ns: 'translation' }),
            },
          },
        },
        layout: {
          topEnd: ['buttons', 'search'],
        },
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
