import { ContainerUri } from "@ldo/solid"
import { useSolidAuth } from "@ldo/solid-react"
import { FunctionComponent, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { Loading } from "../components/Loading"
import { LoginDialogButton } from "../components/Login"
import { WorkspaceLink } from "../components/WorkspaceLink"
import { Header } from "../layout/Header"
import { cap } from "../lib/cap"
import { spoty } from "../lib/ns"
import { useProfile } from "../lib/profile"
import { useAllRegisteredContainers } from "../lib/typeIndexes"


// Home page of the application, shows a list of available workspaces.
//
// For logged in users, it gets them from the type indexes.
// For anonymous users, it proposes a list of read-only demo ledgers.
export const Home: FunctionComponent = () => {
  console.debug("Home: rendering");

  const { session } = useSolidAuth();
  const [ custom, setCustom ] = useState(DEMO_WORKSPACE);
  const { t } = useTranslation("spoty");
  const nsCommon = { ns: "translation" };

  return <>
    <Header>SpOTy</Header>
    <main>
      { session.isLoggedIn
      ? <>
          <WorkspaceList />
          <p><Link to="/w/new">{t('create a new workspace')}</Link></p>
        </>
      : <p><Trans t={t}>
          Try this <WorkspaceLink to={DEMO_WORKSPACE}>demo workspace</WorkspaceLink
          > or <LoginDialogButton>login</LoginDialogButton> to create your own.
        </Trans></p>
      }
      <details>
        <summary>{cap(t('advanced', nsCommon))}</summary>
        <p>
          <label>{t('Open workspace by URL:')
            } <input value={custom} onChange={evt => setCustom(evt.target.value)} /
            > <WorkspaceLink to={custom as ContainerUri}>{t('open', nsCommon)}</WorkspaceLink>
          </label>
        </p>
      </details>
    </main>
  </>;
}

// URL of the demo ledger
export const DEMO_WORKSPACE= "https://solid.champin.net/pa/public/spoty-demo/";

const WorkspaceList: FunctionComponent = () => {
  // console.debug("getLedgerList");
  const profile = useProfile();
  const workspaces = useAllRegisteredContainers(profile, spoty.SentenceCollection);
  const { t } = useTranslation("spoty");

  return workspaces === undefined
    ? <Loading></Loading>
    : workspaces.length === 0
    ? <>
        <p>{t("You have no workspace yet.")}</p>
      </>
    : <>
      <p>{t('Your workspaces:')}</p>
      <ul>
        { workspaces.map(uri => <li key={uri}><WorkspaceLink to={uri} /></li>)}
      </ul>
    </>
  ;
}


