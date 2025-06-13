import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { LanguageShapeType, SentenceShapeType } from "../.ldo/spoty_ldo.shapeTypes";
import { Language } from "../.ldo/spoty_ldo.typings";
import { useAppContext } from "../components/AppContext";
import { useWsContext } from "../components/WsContext";
import { cap } from "../lib/cap";
import { spoty, wdt, xsd } from "../lib/ns";
import { makeLiteral, makeNamedNode } from "../lib/nodes";
import { SentenceLink } from "../components/SentenceLink";
import { StimulusLink } from "../components/StimulusLink";
import { DataTableComponent } from "../components/DataTable";

export const LanguagePage: FunctionComponent = () => {
  const params = useParams();
  const languageId = params.lid as string;
  const { dataset } = useLdo();
  const { t } = useTranslation('spoty');

  const [appCtx] = useAppContext();

  const factory = dataset
    .usingType(LanguageShapeType)
    .setLanguagePreferences(appCtx.locale(), appCtx.preferences.language, "en");

  const language = (languageId.length === 3)
    ? factory.matchSubject(wdt.P220, makeLiteral(languageId, xsd.string))[0]
    : factory.fromSubject(languageId);

  const title = `${cap(t('language'))} ${language?.label ?? languageId.split("/").at(-1)}`;
  return (language !== undefined)
    ? <LanguagePageInner language={language} title={title} />
    : <h2>{cap(t("unknown language"))} <code>{languageId}</code></h2>;
}

const LanguagePageInner: FunctionComponent<{
  language: Language,
  title: string,
}> = ({
  language,
  title,
}) => {
    const { dataset } = useLdo();
    const { t } = useTranslation("spoty");

    const [appCtx] = useAppContext();
    const wsCtx = useWsContext();

    const wdid = language['@id']?.split('/').pop() as string;

    const spoty_language = makeNamedNode(spoty.language);
    const languageUri = makeNamedNode(language['@id'] as string);
    const filterByLanguage = (sentenceUri: string) => {
      return dataset.match(makeNamedNode(sentenceUri), spoty_language, languageUri).toArray().length;
    };
    const factory = dataset
      .usingType(SentenceShapeType)
      .setLanguagePreferences(appCtx.locale(), appCtx.preferences.language, "en");
    const sentences = wsCtx.sentenceUris.filter(filterByLanguage).map(uri => factory.fromSubject(uri));

    return <>
      <h2>{title}</h2>

      <dl>
        {language.genus ? <><dt>{cap(t("genus"))}</dt><dd>{language.genus}</dd></> : null}
        {language.phylum ? <><dt>{cap(t("phylum"))}</dt><dd>{language.phylum}</dd></> : null}
        {language.macroarea ? <><dt>{cap(t("macro-area"))}</dt><dd>{language.macroarea}</dd></> : null}
        <dt>{t("Wikidata")}</dt><dd><a href={language['@id']}>{wdid}</a></dd>
      </dl>

      <DataTableComponent columns={4}>
        <thead><tr>
          <th>{cap(t("sentence"))}</th>
          <th>{cap(t("stimulus"))}</th>
          <th>{cap(t("translation"))}</th>
          <th>{cap(t("file"))}</th>
        </tr></thead>
        <tbody>
          {sentences.map(s =>
            <tr key={s['@id']}>
              <td><SentenceLink sentence={s}>{s.identifier}</SentenceLink></td>
              <td>{s.trajectoiresId ? <StimulusLink stimulus={s.trajectoiresId} /> : null}</td>
              <td>{s.translation}</td>
              <td>{s.extractedFrom.split('.')[0]}</td>
            </tr>
          )}
        </tbody>
      </DataTableComponent>
    </>;
  }
