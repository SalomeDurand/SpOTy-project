import { ContainerUri } from "@ldo/solid"
import { FunctionComponent, ReactNode } from "react"
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LinkButton } from "../components/LinkButton";
import { WorkspaceLink } from "../components/WorkspaceLink";

// General header of the application.
export const Header: FunctionComponent<{
  backRoute?: BackType,
  validate?: () => void,
  children: ReactNode,
}> = ({
  backRoute,
  validate,
  children,
}) => {
  console.debug("Header: rendering");
  const { t } = useTranslation();

  const backLabel = <abbr title={t('back')}>&lt;</abbr>;
  const backNode = backRoute === undefined
    ? <Link to="/" className="home-link">⌂<span className="label">Home</span></Link>
    : typeof(backRoute) === "string"
    ? <Link to={backRoute}>{backLabel}</Link>
    : "workspace" in backRoute
    ? <WorkspaceLink to={backRoute.workspace}>{backLabel}</WorkspaceLink>
    : <span>TODO</span>
  ;

  return <header className="banner">
    { backNode }
    <h1>{children}</h1>
    { validate
      ?<LinkButton onClick={validate} help={t('validate')}>✓</LinkButton>
      :<span></span>
    }
  </header>
}

type BackType = string 
  | { "workspace": ContainerUri };
