import { useLdo, useResource } from "@ldo/solid-react";
import { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useParams } from "react-router-dom";
import { useWsContext, WsContext, WsContextSingleton } from "../components/WsContext";
import { Header } from "../layout/Header";
import { assert } from "../lib/assertions";
import { cap } from "../lib/cap";
import { rdf, spoty } from "../lib/ns";
import { makeNamedNode } from "../lib/nodes";
import { WorkspaceUri } from "../App";
import { lastPart } from "../lib/lastPart";
// CSS
import "./WorkspaceLayout.css";

export const WorkspaceLayout: FunctionComponent= () => {
  const params = useParams();
  const workspaceUri = params.wid as WorkspaceUri;
  console.debug("WorkspaceLayout rendering", workspaceUri);
  const workspaceRes = useResource(workspaceUri);
  const [wcs, setWcs] = useState(new WsContextSingleton(workspaceRes));
  const { dataset } = useLdo();
  const { t } = useTranslation("spoty");

  
  useEffect(() => {
    console.debug("WorkspaceLayout effect starting", workspaceRes.uri);
    
    let abort = false;
    let finished = false;
    const queueCont = [];
    const queueColl = [];
    if (workspaceRes.type === "container") {
      queueCont.push(workspaceRes);
    } else {
      queueColl.push(workspaceRes);
    }

    /* // These are the "clean" version of 'incDiscovered', 'incLoaded' and 'pushSentenceUris'.
    // They work directly on the state wcs.
    // Unfortunately, it causes strange behaviours: sometimes the state reverts to an old version!
    // (this happens when switching from one workspace to another from the WorkspacePage view:
    //  the display is not updated, and logs show that the calls to setWcs below receive an WsContextSingleton with the old workspace URI...)
    const incDiscovered = () => {
      console.debug("=== WorkspaceLayout effect changing 1 wcs", workspaceRes.uri);
      setWcs(old => {
        console.debug("=== WorkspaceLayout effect changed 1 wcs", old.workspace.uri);
        const loadIndicator: [number, number] = [
          old.loadIndicator[0], old.loadIndicator[1] + 1
        ];
        return { ...old, loadIndicator };
      })
    };
      
    const incLoaded = () => {
      console.debug("=== WorkspaceLayout effect changing 2 wcs", workspaceRes.uri);
      setWcs(old => {
        console.debug("=== WorkspaceLayout effect changed 2 wcs", old.workspace.uri);
        const loadIndicator: [number, number] = [
          old.loadIndicator[0] + 1, old.loadIndicator[1]
        ];
        return { ...old, loadIndicator };
      })
    };

    const pushSentenceUris = (uris: string[]) => {
      console.debug("=== WorkspaceLayout effect changing 3 wcs", workspaceRes.uri);
      setWcs(old => {
        console.debug("=== WorkspaceLayout effect changed 3 wcs", old.workspace.uri);
        const sentenceUris = [ ...old.sentenceUris, ...uris ];
        return { ...old, sentenceUris };
      })
    };
    */

    // This is the "hacky version of 'incDiscovered', 'incLoaded' and 'pushSentenceUris'.
    // In order to work around the bug of the clean version (see above),
    // they work a local version of myWcs, and push a copy of this local version to the state wcs after every change.
    // This way, they are not impacted by the spurious "reversion" of the state wcs to an old version.
    const myWcs = new WsContextSingleton(workspaceRes);

    const incDiscovered = () => {
      // console.debug("=== WorkspaceLayout effect changing 1 wcs", workspaceRes.uri);
      myWcs.loadIndicator[1] += 1;
      setWcs({ ...myWcs });
    };
      
    const incLoaded = () => {
      // console.debug("=== WorkspaceLayout effect changing 2 wcs", workspaceRes.uri);
      myWcs.loadIndicator[0] += 1;
      setWcs({ ...myWcs });
    };

    const pushSentenceUris = (uris: string[]) => {
      // console.debug("=== WorkspaceLayout effect changing 3 wcs", workspaceRes.uri);
      myWcs.sentenceUris = [ ...myWcs.sentenceUris, ...uris ];
      setWcs({ ...myWcs });
    };


    // load asynchronously all sub-containers and resources of the workspace
    // IMPORTANT: after each await, `abort` must be tested
    (async () => {

      while (queueCont.length > 0) {
        if (abort) break;
        let c = queueCont.shift();
        assert(c !== undefined);
        // console.debug("===", "WorkspaceLayout", c.uri);
        const res = await c.readIfUnfetched();
        if (abort || res.isError) { continue; }
        for (let child of c.children()) {
          if (child.type === "container") {
            queueCont.push(child);
          } else {
            queueColl.push(child);
          }
          incDiscovered();
        }
        incLoaded();
      }

      // TODO use an AbortController to abort all the fetches
      // (requires LDO to allow us to pass options to the underlying fetch in read and readIfUnfetched)
      if (abort) { return; }
      await Promise.all(queueColl.map(async res => {
        await res.readIfUnfetched();
        if (abort) return;

        const p = makeNamedNode(rdf.type);
        const o = makeNamedNode(spoty.Sentence);
        const g = makeNamedNode(res.uri);
        const uris = dataset.match(null, p, o, g).toArray().map(q => q.subject.value);
        pushSentenceUris(uris);
        incLoaded();
      }));
      if (abort) return;
      console.debug("WorkspaceLayout effect finishing", workspaceRes.uri);
      finished = true;
    })();

    return () => { 
      if (!finished) {
        console.debug("WorkspaceLayout effect aborting");
        abort = true;
      }
    };
  }, [dataset, setWcs, workspaceRes]);
 

  const label = lastPart(workspaceUri);
  return <>
    <Header>{cap(t('workspace'))} {label}</Header>
    <WsContext value={wcs}>
      <WorkspaceToolbar uri={workspaceUri} />
      <main>
        <Outlet />
      </main>
    </WsContext>
  </>;
}


const WorkspaceToolbar: FunctionComponent<{
  uri: WorkspaceUri,
}> = ({
  uri,
}) => {
  const { t } = useTranslation('spoty');
  const wcs = useWsContext();
  const loadIndicator = (
    wcs.isLoading()
    ? <abbr title={`${t("loading sentences")} ${wcs.loadIndicator.join('/')}`}>⏳</abbr>
    : null
  );
  const prefix = `/w/${encodeURIComponent(uri)}/`;
  return <nav className='WorkspaceToolbar'>
    <ul>
      <ToolbarButton to={`${prefix}lang/`}>{cap(t('language', { count: 99 }))}</ToolbarButton>
      <ToolbarButton to={`${prefix}map`}>{cap(t('map'))}</ToolbarButton>
      <ToolbarButton to={`${prefix}stim/`}>{cap(t('stimulus', { count: 99}))}</ToolbarButton>
      <ToolbarButton to={`${prefix}`} exact>{cap(t("all sentences"))}
        <span className="loadIndicator">{loadIndicator}</span></ToolbarButton>
    </ul>
  </nav>;
}

const ToolbarButton: FunctionComponent<{
  to: string,
  exact?: boolean,
  children: ReactNode,
}> = ({
  to,
  exact,
  children,
}) => {
  const isCurrent = exact
    ? window.location.pathname.endsWith(to)
    : window.location.pathname.includes(to);
  return <li className={isCurrent ? "current" : ""}>
    <Link to={to}>{children}</Link>
  </li>;
}
