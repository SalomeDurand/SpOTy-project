import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { LanguageShapeType } from "../.ldo/spoty_ldo.shapeTypes";
import { useAppContext } from "../components/AppContext";
import { LanguageLink } from "../components/LanguageLink";
import { useWsContext } from "../components/WsContext";
import { cap } from "../lib/cap";
import { cmpStr } from "../lib/cmp";
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

export const LanguagesPage: FunctionComponent = () => {
  const { dataset } = useLdo();
  const { t } = useTranslation(['spoty', 'translation']);

  const [appCtx] = useAppContext();
  const wsContext = useWsContext();

  const spoty_language = makeNamedNode(spoty.language);
  const languages =  wsContext.sentenceUris
    .flatMap(uri => dataset.match(makeNamedNode(uri), spoty_language, null).toArray())
    .map(q => q.object.value)
  ;
  let map = new Map<string, number>();
  for (let lang of languages) {
    map.set(lang, (map.get(lang) ?? 0) + 1)
  };

  const factory = dataset
    .usingType(LanguageShapeType)
    .setLanguagePreferences(appCtx.locale(), appCtx.preferences.language, "en");

  const rows = Array.from(map.entries())
    .map(([key, val]) => ({
      lang: factory.fromSubject(key),
      nb: val,
    }))
    .sort((a, b) => cmpStr(a.lang.label, b.lang.label));


  return <DataTable options={{
                responsive: true,
                buttons: true,
                select: true,
                language: {
                  info: t('Showing page _PAGE_ of _PAGES_', { ns: 'translation' }),
                },
                layout: {
                topStart: {
                  buttons: [
                    {
                    extend: 'searchPanes',
                    config: {
                        cascadePanes: true
                      }
                    }
                  ]
                }
              }
            }}>
    <thead><tr>
      <th>{cap(t("language"))}</th>
      <th>ISO 639-3</th>
      <th>{cap(t("genus"))}</th>
      <th>{cap(t("phylum"))}</th>
      <th>{cap(t("sentence", {count: 99}))}</th>
    </tr></thead>
    <tbody>
      { rows.map(row => <tr key={row.lang[`@id`]}>
        <td><LanguageLink language={row.lang} /></td>
        <td><LanguageLink language={row.lang}><code>{row.lang.P220}</code></LanguageLink></td>
        <td>{row.lang.genus}</td>
        <td>{row.lang.phylum}</td>
        <td>{row.nb}</td>
        </tr>)
      }
    </tbody>
  </DataTable>;
}
