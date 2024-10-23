import { Container, Leaf, LeafUri } from "@ldo/solid";
import { useLdo, useSolidAuth } from "@ldo/solid-react";
import { ChangeEvent, createContext, createRef, FunctionComponent, useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ONTOLOGY } from "../App";
import { LinkButton } from "../components/LinkButton";
import { SentenceLink } from "../components/SentenceLink";
import { WorkspaceLink } from "../components/WorkspaceLink";
import { useWsContext } from "../components/WsContext";
import initWasmConvert, { SpotyConverter } from "../convert/wasm_convert.js";
import { cmpResource, cmpStr } from "../lib/cmp";
import { lastPart } from "../lib/lastPart";
import { makeNamedNode } from "../lib/nodes";
import { rdf, spoty } from "../lib/ns";
// CSS
import "./WorkspacePage.css";

// This component displays all available sentences,
// showing the hierarchy of containers, sentence collections (TTL files) and sentences.
//
// TODO add features for
// - creating new folder
// - renaming/moving leafs?
// - manage non-TTL leafs?
// - removing empty container?
export const WorkspacePage: FunctionComponent = () => {
  const wsCtx = useWsContext();
  const workspace = wsCtx.workspace;
  console.debug("WorkspacePage rendering");

  const [converter, setConverter] = useState<Converter>();

  useEffect(() => {
    Promise.all([
      fetch(ONTOLOGY).then(resp => resp.text()),
      initWasmConvert(),
    ]).then(([ontology, _]) => {
      setConverter({
        convert: (data: Uint8Array, filename: string) => {
          const c = new SpotyConverter(ontology);
          c.populate(data, filename);
          return c.serialize()
        },
      });
    })
  }, []);

  return <div className="WorkspacePage">
    <ConverterCtx.Provider value={converter}>
      <ul className="sentences">
        { workspace.type === "container"
        ? <ContainerItem container={workspace} root />
        : <LeafItem leaf={workspace} root refreshContainer={() => {}} />
        }
      </ul>
    </ConverterCtx.Provider>
  </div>;
}

const ContainerItem: FunctionComponent<{
  label: string,
  children: (Container | Leaf)[],
} | {
  container: Container,
  root?: boolean,
}> = (args) => {
  const { session } = useSolidAuth();
  const setRefreshCount = useState(0)[1];
  const refresh = () => setRefreshCount(x => x+1);
  const { t } = useTranslation("spoty");

  const [unfetched, uri, label, children] =
    "container" in args
    ? [ args.container.isUnfetched(), args.container.uri, lastPart(args.container.uri), args.container.children() ]
    : [ false, undefined, args.label, args.children ];

  const root = ("container" in args && args.root);

  if (label.startsWith(".")) {
    return null;
  }
  const tools = "container" in args ? <span className="tools">
    { session.isLoggedIn
      ? <LinkButton help={t("new folder") + " NOT IMPLEMENTED YET"} onClick={() => {}} disabled={true}>+🖿 </LinkButton>
      : null }
    { session.isLoggedIn
      ? <UploadCollection container={args.container} onSuccess={refresh} />
      : null }
    { !root 
      ? <WorkspaceLink to={args.container.uri}><abbr title={t("open as workspace")}>🗁</abbr></WorkspaceLink>
      : null }
    <ExtViewIcon href={uri as string} />
    <LinkIcon href={uri as string} />
  </span> : null;

  return <li><details open={true}>
    <summary>
      🖿 {label} { tools }
    </summary>
    { unfetched
      ? <ul><li>⏳</li></ul>
      : <>
          <ul>
          { children.sort(cmpResource).map(c =>
            c.type === "container"
            ? <ContainerItem key={c.uri} container={c} />
            : <LeafItem key={c.uri} leaf={c} refreshContainer={refresh} />
          )}
          </ul>
        </>
    }
  </details></li>
};

const LeafItem: FunctionComponent<{
  leaf: Leaf,
  refreshContainer: () => void,
  root?: boolean,
}> = ({
  leaf,
  refreshContainer,
  root,
}) => {
  const label = decodeURIComponent(lastPart(leaf.uri));
  const { dataset } = useLdo();
  const [errors, setErrors] = useState<string[]>();
  const [sentences, setSentences] = useState<string[]>();
  const { t } = useTranslation("spoty");
  const { session } = useSolidAuth();

  useEffect(() => {
    setSentences(
      dataset
      .match(null, makeNamedNode(rdf.type), makeNamedNode(spoty.Sentence))
      .toArray()
      .map(q => q.subject.value)
      .filter(iri => iri.startsWith(leaf.uri))
      .sort(cmpStr)
    );
  }, [dataset, dataset.size, leaf]);

  useEffect(() => {
    setErrors(
      dataset
      .match(makeNamedNode(leaf.uri), makeNamedNode(spoty.error), null)
      .toArray()
      .map(q => q.object.value)
      .sort(cmpStr)
    );
  }, [dataset, dataset.size, leaf]);

  const deleteLeaf = useCallback(() => {
    if (window.confirm(`Confirm deleting ${label}?`)) {
      leaf.delete().then(refreshContainer);
    }
  }, [label, leaf, refreshContainer])

  const ERR = <span className="error">⚠ </span>;

  return <li><details>
    <summary>
      🗋  {label} 
      {" "} ({sentences?.length || "⏳"})
      {errors?.length ? <> {ERR}</> : null}
      <span className="tools">
        { session.isLoggedIn 
          ? <LinkButton help={t("rename") + " NOT IMPLEMENTED YET"} onClick={() => {}} disabled={true}>✏️</LinkButton>
          : null }
        { session.isLoggedIn && !root
          ? <LinkButton help={t("delete")} onClick={deleteLeaf}>🗑️</LinkButton>
          : null }
        { !root
          ? <WorkspaceLink to={leaf.uri}><abbr title={t("open as workspace")}>📂</abbr></WorkspaceLink>
          : null }
        <ExtViewIcon href={leaf.uri} />
        <LinkIcon href={leaf.uri} />
      </span>
    </summary>
    { leaf.isUnfetched() || errors === undefined || sentences === undefined
      ? <ul><li>⏳</li></ul>
      : <ul>
          { errors.map(e => <li key={e}>{ERR} {e}</li>) }
          { sentences.map(s => <li key={s}>🗩 <SentenceLink uri={s} /></li>) }
        </ul>
    }
  </details></li>
};

const UploadCollection: FunctionComponent<{
  container: Container,
  onSuccess?: () => void,
}> = ({
  container,
  onSuccess,
}) => {
  const converter = useContext(ConverterCtx);
  const { t } = useTranslation("spoty");

  const fileInputRef = createRef<HTMLInputElement>();

  const buttonUploadFile = () => {
    fileInputRef.current?.click();
  }
  const uploadFiles = useCallback(async (evt: ChangeEvent<HTMLInputElement>) => {
    if (converter === undefined) { return; }

    for (let file of evt.target.files || []) {
      const baseName = file.name.substring(0, file.name.length - 5);
      const buffer = await (new Response(file).arrayBuffer());
      const array = new Uint8Array(buffer);
      const ttl = converter.convert(array, file.name);
      // TODO handle warnings and errors, if any
      const res = await container.uploadChildIfAbsent(
        baseName as LeafUri,
        new Blob([ttl]),
        "text/turtle",
      );
      if (res.isError) {
        alert(res.message);
      } else {
        console.debug("CREATED", res.uri);
        res.resource.read().then(() => onSuccess ? onSuccess() : null);
        container.read().then(() => onSuccess ? onSuccess() : null)
      }
    }
  }, [container, converter, onSuccess]);


  return (
    <LinkButton help={t("upload file")} onClick={buttonUploadFile} disabled={converter === null}>
      +🗋
      <input type="file" ref={fileInputRef} accept=".xlsx" multiple={true} onChange={uploadFiles} style={{display: "none"}} />
    </LinkButton>
  );
}

export const ConverterCtx = createContext<Converter | undefined>(undefined);

export interface Converter {
  convert: (a: Uint8Array, n: string) => string
};



// This component is meant for debugging
export const ExtViewIcon: FunctionComponent<{ href: string }> = ({ href }) => {
  const { t } = useTranslation("spoty");
  
	const extHref = "https://penny.vincenttunru.com/explore/?url=" + encodeURIComponent(href);
	const app = "Penny";
	return <a href={extHref} className="extViewIcon"><abbr title={t("open in {{app}}", {app})}>🔎</abbr></a>;
}

// This component is meant for debugging
export const LinkIcon: FunctionComponent<{ href: string }> = ({ href }) => {
  const { t } = useTranslation("spoty");
  
	return <a href={href}><abbr title={t("access raw data")}>🔗</abbr></a>;
}

