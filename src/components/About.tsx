import { FunctionComponent, useState } from "react"
import { useTranslation } from "react-i18next";
import { LinkButton } from "./LinkButton";
import { cap } from "../lib/cap";
import appInfo from "../app-info.json";
import { Modal } from "./Modal";
import { getPunctuation } from '../utils/punctuation';

// This component shows general information about the app.
export const About: FunctionComponent = () => {
  console.debug("About: rendering")

  const { t } = useTranslation();

  const cr = appInfo.copyright;

  return <>
    <h1>{cap(t('about {{what}}', { what: appInfo.name }))}</h1>
    <p>©{cr.years} <a href={cr.url}>{cr.holder}</a></p>
    <p><a href={appInfo.repo.url}>{cap(t('source code on {{repo}}', {repo: appInfo.repo.service}))}</a></p>
    { appInfo.contributors.length
      ? <>
          <p>{cap(t('contributors'))}{getPunctuation(":")}</p>
          <ul>
            { appInfo.contributors.map(c =>
              <li key={c.name}>
                { c.url
                  ? <a href={c.url}>{c.name}</a>
                  : c.name
                }
              </li>
            )}
          </ul>
        </>
      : null
    }
  </>
}

// This component display a "gear" link that opens a modal window displaying `Preferences`.
export const AboutDialogButton: FunctionComponent = () => {
  const [ showDialog, setShowDialog ] = useState(false);

  // console.debug("AboutButtonDialog: rendering");

  const { t } = useTranslation();

  return <>
    <LinkButton onClick={() => setShowDialog(true)}>{cap(t('about'))}</LinkButton>
    <Modal show={showDialog} setShow={setShowDialog}>
      <About/>
    </Modal>
  </>;
}
