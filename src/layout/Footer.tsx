import { useSolidAuth } from "@ldo/solid-react";
import { FunctionComponent } from "react"
import { useTranslation } from "react-i18next";
import { AboutDialogButton } from "../components/About"
import { useAppContext } from "../components/AppContext";
import { LinkButton } from "../components/LinkButton";
import { LoginDialogButton } from "../components/Login";
import { PreferencesDialogButton } from "../components/Preferences"
import { cap } from "../lib/cap";
import { getName, useProfile } from "../lib/profile";
// CSS
import "./Footer.css";

// The general footer of the application
export const Footer: FunctionComponent = () => {
  console.debug("Footer: rendering");
  const [ appCtx ]  = useAppContext();
  const { logout, session } = useSolidAuth();
  const { t } = useTranslation();

  const doLogout = () => {
    logout();
    // reload the page to clear the dataset of permissionned data
    window.location.reload();
  };

  return <footer>
    { session.isLoggedIn
    ? <FooterLoggedIn />
    : null
    }
    <div className="banner">
      <span><AboutDialogButton /></span>
      <span><PreferencesDialogButton /></span>
      {
        appCtx.loginInProgress
        ? cap(t('logging in...'))
        : session.isLoggedIn
        ? <LinkButton onClick={doLogout}>{cap(t('logout'))}</LinkButton>
        : <LoginDialogButton />
      }
    </div>
  </footer>
}

const FooterLoggedIn: FunctionComponent = () => {
  const profile = useProfile();
  const { t } = useTranslation();
  const name = profile ? getName(profile) : t('loading');


  return <div className="FooterLoggedIn banner">
    <span></span>
    <span>{cap(t('logged in as {{name}}', { name: name }))}</span>
  </div>
}
