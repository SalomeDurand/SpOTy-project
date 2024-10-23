import { Container, ContainerUri, Leaf, LeafUri } from "@ldo/solid";
import { useLdo } from "@ldo/solid-react";
import { ChangeEvent, FunctionComponent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getStorageUris, useProfile } from "../lib/profile";

// Show a form allowing the user to create a new leaf (non-container resource) on ther pod.
export const CreateLeaf: FunctionComponent<{
  onCreate: (newLeaf: Leaf) => void,
  defaultName?: string,
  roots?: ContainerUri[],
  disabled?: boolean,
}> = ({
  onCreate,
  defaultName,
  roots,
  disabled,
}) => {
  console.debug("CreateLeaf: rendering");
  const castOnCreate = onCreate as ((x: Container | Leaf) => void);
  return <CreateResource onCreate={castOnCreate} defaultName={defaultName} roots={roots} disabled={disabled} container={false} />
}

// Show a form allowing the user to create a new container on ther pod.
export const CreateContainer: FunctionComponent<{
  onCreate: (newContainer: Container) => void,
  defaultName?: string,
  roots?: ContainerUri[],
  disabled?: boolean,
}> = ({
  onCreate,
  defaultName,
  roots,
  disabled,
}) => {
  console.debug("CreateContainer: rendering");
  const castOnCreate = onCreate as ((x: Container | Leaf) => void);
  return <CreateResource onCreate={castOnCreate} defaultName={defaultName} roots={roots} disabled={disabled} container={true} />
}

const CreateResource: FunctionComponent<{
  onCreate: (newLeaf: Container | Leaf) => void,
  defaultName?: string,
  roots?: ContainerUri[],
  disabled?: boolean,
  container: boolean,
}> = ({
  onCreate,
  defaultName,
  roots,
  container,
  disabled,
}) => {
  const { t } = useTranslation();
  const { getResource } = useLdo();
  const profile = useProfile();
  if (profile === undefined) { throw new Error("unreachable"); }

  if (!defaultName) {
    defaultName = container ? "new_folder" : "new_resource"
  } else {
    defaultName = sanitizePath(defaultName);
  }
  roots = (roots && roots.length > 0) ? roots : getStorageUris(profile);

  const [root, setRoot] = useState(roots[0] as string);
  const [path, setPath] = useState(defaultName);
  const [probe, setProbe] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);
  const [failed, setFailed] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>();

  const toCreateUri = useMemo(() => {
    const uri = (root+path);
    if (container) {
      return uri.replace(/\/*$/, '/') as ContainerUri;
    } else {
      return uri as LeafUri;
    }
  }, [root, path, container]);

  const explanation = 
    failed
    ? t("Creation failed")
    : creating
    ? t("⏳ Creating...")
    : probe ;

  const canCreate = explanation === undefined;

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (!container && toCreateUri.endsWith('/')) {
      setProbe("Can not create container");
      return;
    }
    setProbe("⏳");
    timeoutRef.current = setTimeout(() => {
      const res = getResource(toCreateUri);
      res.readIfUnfetched()
        .then(() => {
          setProbe(
            res.isError
            ? t("Can not reach resource")
            : res.isPresent()
            ? t("Resource already exists")
            : undefined
          );
        })
        .catch(() => {
          setProbe(t("Can not reach resource"))
        })
        .finally(() => {
          timeoutRef.current = undefined;
        });
    }, 500);
  }, [path, toCreateUri, getResource, container, t])

  const handleChangeRoot = (evt: ChangeEvent<HTMLSelectElement>) => {
    setFailed(false);
    setRoot(evt.target.value);
  }

  const handleChangePath = (evt: ChangeEvent<HTMLInputElement>) => {
    setFailed(false);
    const sanPath = sanitizePath(evt.target.value);
    setPath(sanPath);
  }

  const handleCreate = async () => {
    setCreating(true);
    const resource = getResource(toCreateUri);
    try {
      const resultPost = await resource.createIfAbsent();
      if (resultPost.isError) { throw new Error() }
      const resultGet = await resource.read();
      if (resultGet.isError || resource.isAbsent()) { throw new Error() }
      onCreate(resource);
    }
    catch {
      setFailed(true);
      setCreating(false);
    }
  }

  return <span>
    <select value={root} onChange={handleChangeRoot} disabled={creating} >
      { roots.map(uri => <option key={uri}>{uri}</option>)}
    </select>
    <input value={path} onChange={handleChangePath} disabled={creating} />
    { container ? " / " : " " }
    <button onClick={handleCreate} disabled={disabled || !canCreate} >Create</button>
    { " " }
    { explanation }
  </span>
}

export function sanitizePath(path: string): string {
  return path
    .replaceAll(" ", "_")
    .replaceAll(/\/+/g, "/")
    .replace(/^\//, "")
  ;
}
