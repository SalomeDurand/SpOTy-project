import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import { LanguageShapeType } from "../.ldo/spoty_ldo.shapeTypes";
import { useAppContext } from "../components/AppContext";
import { useWsContext } from "../components/WsContext";
import { makeNamedNode } from "../lib/nodes";
import { spoty } from "../lib/ns";
// CSS
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import { LanguageLink } from "../components/LanguageLink";
import { Language } from "../.ldo/spoty_ldo.typings";

export const MapPage: FunctionComponent = () => {
  const { dataset } = useLdo();
  const { t } = useTranslation('spoty');

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

  const markers: [Language, number][] = Array.from(map.entries())
    .map( ([langUri, count]) => [ factory.fromSubject(langUri), count]);
  let minCount = markers.map(pair => pair[1]).reduce((old, val) => Math.min(old, val), 999999)
  let maxCount = markers.map(pair => pair[1]).reduce((old, val) => Math.max(old, val), 0);
  if (minCount === maxCount) {
    minCount = 0;
  }

  // TODO make a list of all philums (phila?) and assign a different color to each,
  // and use that color for the markers

  const position: [number, number] = [51.505, -0.09];
    
  return <div className="MapPage">
    <MapContainer center={position} zoom={2} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      { markers.filter( ([language, _]) => language.center).map( ([language, count]) => {
        const center: [number, number] = [
          parseFloat(language.center.latitude),
          parseFloat(language.center.longitude),
        ];
        const radius = 5 + 15 * (count-minCount)/(maxCount-minCount);
        return <CircleMarker key={language['@id']} center={center} radius={radius}>
          <Popup>
            <LanguageLink language={language} /> <br/>
            {language.phylum ? <><b>{t("phylym")}</b>: {language.phylum}<br/></> : null }
            {count} {t("sentence", {count: count})}
          </Popup>
        </CircleMarker>;
      })}
    </MapContainer>
  </div>;
}
