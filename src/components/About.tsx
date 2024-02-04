import { FunctionComponent, useState } from "react"
import ReactModal from "react-modal";
import { useTranslation } from "react-i18next";
import { LinkButton } from "./LinkButton";
import { cap } from "../lib/cap";

// This component allows the user to edit their preferences.
export const About: FunctionComponent = () => {
  console.debug("About: rendering")

  const { t } = useTranslation();

  return <>
    <h1>{cap(t('about {{what}}', { what: "SpOTy" }))}</h1>
    <p>©2024 <a href="//champin.net/">P-A Champin</a></p>
    <p><a href="https://gitlab.com/pchampin/solid-spoty">{cap(t('source code on {{repo}}', {repo: "Gitlab"}))}</a></p>
  </>
}

// This component display a "gear" link that opens a modal window displaying `Preferences`.
export const AboutDialogButton: FunctionComponent = () => {
  const [ showDialog, setShowDialog ] = useState(false);

  // console.debug("AboutButtonDialog: rendering");

  const { t } = useTranslation();

  return <>
    <LinkButton onClick={() => setShowDialog(true)}>{cap(t('about'))}</LinkButton>
    <ReactModal isOpen={showDialog}
      onRequestClose={() => setShowDialog(false)}
    >
      <About/>
    </ReactModal>
  </>;
}
