import { FunctionComponent, KeyboardEvent, ReactNode, useRef, useState } from "react"
import { LoginOptions, useSolidAuth } from "@ldo/solid-react";
import { useAppContext } from "./AppContext";
import { IdpPicker, loadIdps, saveIdp } from "./IdpPicker";
import { useTranslation } from "react-i18next";
import { LinkButton } from "./LinkButton";
import { cap } from "../lib/cap";
import appInfo from "../app-info.json";
import { Modal } from "./Modal";

export const DEFAULT_IDP = "https://solidcommunity.net"

const storage = window.localStorage;
const defaultIdpKey = "default-idp";

// This component allows the user to select an IDP and log in.
//
// The chosen IDP is saved in the local storage for future uses.
//
// See also `LoginDialogButton`
export const Login: FunctionComponent = () => {
  console.debug("Login: rendering")

  const { login } = useSolidAuth();
  const [ appCtx, dispatch ] = useAppContext();
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  function setIdp(idp: string) {
    if (inputRef && inputRef.current) {
      inputRef.current.value = idp;
      inputRef.current.focus();
    } else {
      console.error("IdpPicker trying to set input, but inputRef is not set");
    }
    doLogin();
  };

  function doLogin() {
    const sanIdp = sanitizeIdp(inputRef?.current?.value || defaultIdp());
    if (inputRef && inputRef.current) {
      inputRef.current.value = sanIdp;
    }
    storage.setItem(defaultIdpKey, sanIdp);
    saveIdp(sanIdp);
    // the rest needs to be deferred via a setTimeout,
    // otherwise, the call to saveIdp above does not have time to save the IDP list
    // in the localStorage.
    setTimeout(() => {
      dispatch({ type: "setLoginInProgress" })
      login(sanIdp, loginOptions());
    }, 0);
  };

  const catchEnter = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter' && !appCtx.loginInProgress) {
      doLogin();
    }
  };

  return <>
    <p>
      {cap(t('login with'))}&nbsp;
      <input ref={inputRef} defaultValue={defaultIdp()} onKeyDown={catchEnter} />
      <button onClick={doLogin} disabled={appCtx.loginInProgress}>{cap(t('go'))}</button>
    </p>
    { loadIdps().length > 0
    ? <details>
        <summary>{t('or select an IDP from the list')}</summary>
        <IdpPicker setIdp={setIdp} />
      </details>
    : null
    }
  </>
}

function defaultIdp(): string {
  return storage.getItem(defaultIdpKey) || DEFAULT_IDP
}

function sanitizeIdp(idp: string): string {
  if (!idp.startsWith("https://") && !idp.startsWith("http://")) {
    idp = "https://" + idp;
  }
  if (idp.endsWith("/")) {
    idp = idp.substring(0, idp.length-1);
  }
  return idp
}

// This component display a 'Login' link that opens a modal window displaying `Login`.
export const LoginDialogButton: FunctionComponent<{
  className?: string,
  children?: ReactNode,
}> = ({
  className,
  children,
}) => {
  const [ showDialog, setShowDialog ] = useState(false);
  const { t } = useTranslation();

  console.debug("LoginButtonDialog: rendering");

  return <>
    <LinkButton className={className} onClick={() => setShowDialog(true)}>{children ?? cap(t('login'))}</LinkButton>
    <Modal show={showDialog} setShow={setShowDialog}>
      <Login />
    </Modal>
  </>;
}

// Compute the OIDC login options, based on the current deplotment (production vs. localhost)
//
// See https://docs.inrupt.com/developer-tools/javascript/client-libraries/tutorial/authenticate-client/
function loginOptions(): LoginOptions {
  if (window.location.href.startsWith(appInfo.url)) {
    return {
      clientName: appInfo.name,
      clientId: appInfo.url + "/appId.json",
      redirectUrl: appInfo.url,
    }
  } else if (window.location.href.startsWith("http://localhost:3000/")) {
    return {
      clientName: "Test Solid App on localhost:3000",
      clientId: "https://champin.net/2024/testAppId.json",
      redirectUrl: "http://localhost:3000/"
    }
  } else {
    return {
      clientName: appInfo.name + " TEST",
    }
  }
}
