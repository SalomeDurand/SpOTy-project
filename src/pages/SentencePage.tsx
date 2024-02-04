import { useLdo, useResource } from "@ldo/solid-react";
import { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { SentenceLink } from "../components/SentenceLink";
import { useWsContext } from "../components/WsContext";
import { Header } from "../layout/Header";
import { cap } from "../lib/cap";
import { SentenceShapeType } from "../.ldo/spoty_ldo.shapeTypes";
import { useAppContext } from "../components/AppContext";
import { Loading } from "../components/Loading";
import { Sentence, Token } from "../.ldo/spoty_ldo.typings";
import { LanguageLink } from "../components/LanguageLink";
import { mediaUrl, StimulusLink } from "../components/StimulusLink";
import { ShareIcon } from "../components/ShareIcon";
// CSS
import "./SentencePage.css";

export const SentencePage: FunctionComponent = () => {
  const params = useParams();
  const sentenceShortUri = params.sid as string;
  const { dataset } = useLdo();
  const { t } = useTranslation('spoty');

  const [appCtx] = useAppContext();
  const wsCtx = useWsContext();

  const sentenceUri = (wsCtx !== undefined && sentenceShortUri.startsWith('./'))
    ? wsCtx.workspace.uri + sentenceShortUri.substring(2)
    : sentenceShortUri ;
  useResource(sentenceUri);

  const sentence = dataset
    .usingType(SentenceShapeType)
    .setLanguagePreferences(appCtx.locale(), appCtx.preferences.language, "en")
    .fromSubject(sentenceUri)
  ;

  const title = `${cap(t('sentence'))} ${sentence.identifier ?? sentenceUri.split("#").at(-1)}`;
  
  const content = (sentence.language === undefined)
    ? <Loading>{sentenceUri} is not loaded yet</Loading>
    : <SentencePageInner sentence={sentence} title={title} />

  return (wsCtx === undefined)
    ? <>
        <Header>{title}</Header>
        <main className="SentencePage">
          {content}
        </main>
      </>
    : <div className="SentencePage"> {content} </div>
    ;
}

const SentencePageInner: FunctionComponent<{
  sentence: Sentence,
  title: string,
}> = ({
  sentence,
  title,
}) => {
  const { t } = useTranslation('spoty');

  const media = mediaUrl(sentence.trajectoiresId);

  let tokens = [];
  let nextToken: Token | undefined = sentence.firstToken;
  while (nextToken) {
    tokens.push(nextToken);
    nextToken = nextToken.nextToken;
  }

  return <>
    { media 
      ? <div className="videoplayer">
          <video controls autoPlay loop src={media}></video>
        </div>
      : null
    }

    <h2>
      {title}
      <SentenceLink sentence={sentence} noWs><ShareIcon/></SentenceLink>
    </h2>

    <table className="xlslike"><tbody>
      <tr><th>{cap(t("language"))}</th> <td><LanguageLink language={sentence.language} /></td></tr>
      <OptionalMeta label={cap(t("stimulus"))} value={sentence.trajectoiresId}>
        <StimulusLink stimulus={sentence.trajectoiresId as number}/>
      </OptionalMeta>
      <OptionalMeta label={cap(t("source"))} value={sentence.source} />
      <OptionalMeta label={cap(t("transcription"))} value={sentence.transcription} />
      <OptionalMeta label={cap(t("orthography"))} value={sentence.orthography} />
      <OptionalMeta label={cap(t("translation"))} value={sentence.translation} />
    </tbody></table>

    <table className="xlslike"><tbody>
      <colgroup>
        <col />
        { tokens.map(t => <col id={t['@id']?.split('#')[1]} />)}
      </colgroup>

      <tr><th>Tokens</th>{
        tokens.map(t => <td>{t.ttranscription}</td>)
      }</tr>

      <OptionalRow label={cap(t("clause"))} values={tokens.map(t => t.clause)} />
      <OptionalRow label={cap(t("gloss (orig)"))} values={tokens.map(t => t.originalGloss)} />
      <OptionalRow label={cap(t("gloss"))} values={tokens.map(t => t.gloss)} />
      
      <tr><th><abbr title={cap(t("morpho-syntax"))}>{t("MS")}</abbr></th>
        { tokens.map(t => <td key={t['@id']}>
            {t.morphoSyntax?.map((ms, i) => <>{i?"/":""}<abbr title={ms.comment}>{ms.code}</abbr></>)}
          </td> )}
      </tr>
      <tr><th><abbr title={cap(t("conceptual category", { count: 99 }))}>{t("CC")}</abbr></th>
        { tokens.map(t => <td key={t['@id']}>
            {t.semantics?.map((cc, i) => <>{i?"/":""}<abbr title={cc.comment}>{cc.code}</abbr></>)}
          </td> )}
      </tr>
        
    </tbody></table>
  </>;
}

const OptionalMeta: FunctionComponent<{
  label: string,
  value: any,
  children?: ReactNode,
}> = ({
  label,
  value,
  children,
}) => {
  if (value) {
      return <tr> <th>{label}</th> <td>{children || value}</td> </tr>
  } else {
      return null;
  }
}

const OptionalRow: FunctionComponent<{
  label: string,
  values: any[],
  map?: (x: any) => ReactNode,
}> = ({
  label,
  values,
  map,
}) => {
  const cellMap = map || (x => x);
  if (values.some(x => x!==undefined)) {
    return <tr><th>{label}</th>
        {values.map((val, i) => <td key={i}>{cellMap(val)}</td>)}
      </tr>;
  } else {
    return null
  }
}
