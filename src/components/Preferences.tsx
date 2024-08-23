import { FunctionComponent, useState } from "react"
import { useAppContext } from "./AppContext";
import ReactModal from "react-modal";
import { useTranslation } from "react-i18next";
import { LinkButton } from "./LinkButton";
import { cap } from "../lib/cap";
import { useSolidAuth } from "@ldo/solid-react";

// This component allows the user to edit their preferences.
export const Preferences: FunctionComponent = () => {
  console.debug("Preferences: rendering")

  const { session } = useSolidAuth();
  const [ appCtx, dispatch ] = useAppContext();
  const { t } = useTranslation();

  function setLanguage(lang: string) {
    dispatch({type: "setLanguage", value: lang});
  }

  function setLocaleSuffix(localeSuffix: string) {
    dispatch({type: "setLocaleSuffix", value: localeSuffix});
  }

  return <>
    <h1>{cap(t('preferences'))}</h1>
    <p><label>{cap(t('language'))}:&nbsp;
      <select
        value={appCtx.preferences.language}
        onChange={evt => setLanguage(evt.target.value)}
      >
        <option value="en">{t('English')}</option>
        <option value="fr">{t('French')}</option>
      </select>
    </label></p>
    
    <p><label>{cap(t('locale'))}:&nbsp;
      <input
        value={appCtx.preferences.localeSuffix}
        onChange={evt => setLocaleSuffix(evt.target.value)}
      />
    </label></p>
  
    { session.isLoggedIn
    ? <p>{t("NB: at the moment, the preferences are saved in your browser, but not on your pod.")}</p>
    : null
    }
  </>
}

// This component display a "gear" link that opens a modal window displaying `Preferences`.
export const PreferencesDialogButton: FunctionComponent = () => {
  const [ showDialog, setShowDialog ] = useState(false);

  // console.debug("PreferencesButtonDialog: rendering");

  const { t } = useTranslation();

  return <>
    <LinkButton onClick={() => setShowDialog(true)} help={cap(t('preferences'))}>⚙</LinkButton>
    <ReactModal isOpen={showDialog}
      onRequestClose={() => setShowDialog(false)}
    >
      <Preferences/>
    </ReactModal>
  </>;
}
