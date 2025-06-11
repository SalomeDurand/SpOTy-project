import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SentenceShapeType } from "../.ldo/spoty_ldo.shapeTypes";
import { useAppContext } from "../components/AppContext";
import { LanguageLink } from "../components/LanguageLink";
import { SentenceLink } from "../components/SentenceLink";
import { mediaUrl } from "../components/StimulusLink";
import { useWsContext } from "../components/WsContext";
import { cap } from "../lib/cap";
import { makeLiteral, makeNamedNode } from "../lib/nodes";
import { spoty, xsd } from "../lib/ns";
import { DataTableComponent } from "../components/DataTable";
// CSS
import "./StimulusPage.css";

export const StimulusPage: FunctionComponent = () => {
  const params = useParams();
  const sid = params.sid as string;
  const stimId = tryParseInt(sid);
  const { dataset } = useLdo();
  const { t } = useTranslation(['spoty', 'translation']);

  const [appCtx] = useAppContext();
  const wsCtx = useWsContext();

  const title = `${cap(t('stimulus'))} ${stimId}`;
  const media = mediaUrl(stimId);

  const trajId = makeNamedNode(spoty.trajectoiresId);
  const stimNode = (typeof (stimId) === "number")
    ? makeLiteral(sid, xsd.integer)
    : makeNamedNode(sid)
    ;
  const filterByStimulus = (sentenceUri: string) => {
    return dataset.match(makeNamedNode(sentenceUri), trajId, stimNode).toArray().length;
  };
  const factory = dataset
    .usingType(SentenceShapeType)
    .setLanguagePreferences(appCtx.locale(), appCtx.preferences.language, "en");
  const sentences = wsCtx.sentenceUris.filter(filterByStimulus).map(uri => factory.fromSubject(uri));

  return <div className="StimulusPage">
    <h2>{title}</h2>

    {media
      ? <div className="videoplayer">
        <video controls autoPlay loop src={media}></video>
      </div>
      : null
    }

    {sentences === undefined
      ? <p>⏳</p>
      : <DataTableComponent>
        <thead><tr>
          <th>{cap(t("sentence"))}</th>
          <th>{cap(t('language'))}</th>
          <th>{cap(t('translation'))}</th>
        </tr></thead>
        <tbody>
          {sentences.map(s => <tr key={s['@id']}>
            <td><SentenceLink sentence={s}>{s.identifier}</SentenceLink></td>
            <td><LanguageLink language={s.language} /></td>
            <td>{s.translation}</td>
          </tr>
          )}
        </tbody>
      </DataTableComponent>
    }
  </div>
}

function tryParseInt(txt: string) {
  let i = parseInt(txt);
  return isNaN(i) ? txt : i;
}
