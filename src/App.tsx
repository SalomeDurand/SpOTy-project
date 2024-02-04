import { FunctionComponent, Suspense, useCallback } from 'react';
import { Footer } from './layout/Footer';
import { BrowserSolidLdoProvider, useResource, useSolidAuth } from '@ldo/solid-react';
import { Container, ContainerUri, Leaf, LeafUri } from '@ldo/solid';
import { useEffectLoadFullProfile } from './lib/profile';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Home } from './pages/Home';
import ReactModal from 'react-modal';
import { AppContext, loadPreferredLanguage, useAppContext } from './components/AppContext';
import { Loading } from './components/Loading';
import i18n from "i18next";
import Backend from 'i18next-http-backend';
import { initReactI18next, useTranslation } from 'react-i18next';
import { NewWorkspace } from './pages/NewWorkspace';
import { WorkspacePage } from './pages/WorkspacePage';
import { LanguagePage } from './pages/LanguagePage';
import { LanguagesPage } from './pages/LanguagesPage';
import { StimuliPage } from './pages/StimuliPage';
import { StimulusPage } from './pages/StimulusPage';
import { SentencePage } from './pages/SentencePage';
import { MapPage } from './pages/MapPage';
import { cap } from './lib/cap';
import { WorkspaceLayout } from './layout/WorkspaceLayout';
// CSS
import "./App.css";


i18n
  .use(Backend) // will load translations from public/locales
  .use(initReactI18next)
  .init({
    lng: loadPreferredLanguage() ?? "en",
    fallbackLng: "en",
  
    interpolation: {
      escapeValue: false // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    }
  });

// Main application component.
//
// Wraps everything else into an `AppContext` and a `BrowserRouter`.
//
// The real thing is implemented in `AppInner`,
// so that the `AppContext` and `BrowserRouter` features can be used.
export const App: FunctionComponent = () => {
  console.debug("App: rendering");
  ReactModal.setAppElement("#root");

  return (
    <div className="App">
      <Suspense fallback={<Loading>i18n files</Loading>}>
        <BrowserSolidLdoProvider>
          <AppContext>
            <BrowserRouter>
              <AppInner />
            </BrowserRouter>
          </AppContext>
        </BrowserSolidLdoProvider>
      </Suspense>
    </div>
  );
}


// Creates the general app layout (see `Header` and `Footer`) and the defines the routes.
const AppInner: FunctionComponent = () => {
  const { session } = useSolidAuth();
  const [ appCtx, dispatch ] = useAppContext();
  console.log("App: context is", appCtx);
  useEffectLoadFullProfile(session.webId, appCtx.loginInProgress && session.isLoggedIn, () => dispatch({ type: "unsetLoginInProgress" }));

  const navigate = useNavigate();
  const gotoWorkspace = useCallback((workspace: Container) => {
    navigate(`/w/${encodeURIComponent(workspace.uri)}/`);
  }, [navigate]);

  const ontology = useResource(ONTOLOGY);
  const languages = useResource(LANGUAGES);

  const { t } = useTranslation(["translation", "spoty"]);

  if (!ontology.isFetched() && !languages.isFetched()) {
    return <>
      <Loading asPage="SpOTy">
        {cap(t("loading ontology", { ns: 'spoty' }))}
      </Loading>
    </>;
  }

  return (<>
    {
      appCtx.loginInProgress
      ? <Loading asPage="SpOTy">{cap(t("login in progress"))}</Loading>
      : <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/w/new" element={<NewWorkspace onCreate={gotoWorkspace} />} />
          <Route path="/w/:wid/" element={<WorkspaceLayout />}>
            <Route path="" element={<WorkspacePage />} />
            <Route path="lang/" element={<LanguagesPage />} />
            <Route path="lang/:lid" element={<LanguagePage />} />
            <Route path="map" element={<MapPage/>} />
            <Route path="stim/" element={<StimuliPage/>} />
            <Route path="stim/:sid" element={<StimulusPage/>} />
            <Route path="s/:sid/" element={<SentencePage/>} />
          </Route>
          <Route path="/s/:sid/" element={<SentencePage/>} />
          <Route path="/lang/:lid" element={<LanguagePage />} />
          <Route path="/stim/:sid" element={<StimulusPage />} />
      </Routes>
    }
    <Footer />
  </>);
}

export const ONTOLOGY = "https://w3id.org/SpOTy/ontology";
export const LANGUAGES = "https://w3id.org/SpOTy/languages";

export type Workspace = Container | Leaf;
export type WorkspaceUri = ContainerUri | LeafUri;
