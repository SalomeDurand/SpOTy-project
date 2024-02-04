import { Container } from "@ldo/solid";
import { useLdo, useSolidAuth } from "@ldo/solid-react";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SolidProfileShape } from "../.ldo/solidProfile.typings";
import { TypeRegistrationShapeType } from "../.ldo/typeIndex.shapeTypes";
import { CreateContainer } from "../components/CreateResource";
import { Header } from "../layout/Header";
import { cap } from "../lib/cap";
import { spoty } from "../lib/ns";
import { useProfile } from "../lib/profile";

// Let the user create a new ledger on their pod.
//
// Will redirect to Home if not logged in.
export const NewWorkspace: FunctionComponent<{
  onCreate?: (workspace: Container) => void,
}> = ({
  onCreate,
}) => {
  console.debug("NewWorkspace: rendering");
  
  const { session } = useSolidAuth();
  const navigate = useNavigate();
  const profile = useProfile();
  const isPropertyLoggedIn = session.isLoggedIn && !!profile;

  useEffect(() => {
    if (!isPropertyLoggedIn) {
      navigate("/");
    }
  }, [isPropertyLoggedIn, navigate]);
  
  if (isPropertyLoggedIn) { 
    return <NewWorkspaceInner onCreate={onCreate} profile={profile} />
  } else {
    console.log("NewWorkspace: not logged in, redirecting to Home");
    return null;
  }
}

const NewWorkspaceInner: FunctionComponent<{
  profile: SolidProfileShape,
  onCreate?: (workspace: Container) => void,
}> = ({
  profile,
  onCreate,
}) => {
  const { createData, commitData, getResource } = useLdo();
  const typeIndexes = [
    ...(profile.privateTypeIndex?.map(obj => obj['@id']) || []),
    ...(profile.publicTypeIndex?.map(obj => obj['@id']) || []),
  ];
  const [ typeIndex, setTypeIndex ] = useState(typeIndexes.length > 0 ? typeIndexes[0] : undefined);
  const { t } = useTranslation("spoty");
  const nsCommon = { ns: 'translation' };

  const finalizeWorkspace = useCallback(async (container: Container) => {
    const typeIndexUri = typeIndex as string;
    const typeIndexResource = getResource(typeIndexUri);
    const typeRegistration = createData(
      TypeRegistrationShapeType,
      typeIndexUri + "#" + crypto.randomUUID(),
      typeIndexResource,
    );
    typeRegistration.forClass = { "@id": spoty.SentenceCollection };
    typeRegistration.instanceContainer = [{ "@id": container.uri }];
    const result = await commitData(typeRegistration);
    if (result.isError) {
      console.error("Commiting type registration:", result.message);
      alert("Error committing type registration (see console)");
      return;
    }

    if (onCreate) { onCreate(container); }
  }, [createData, commitData, getResource, onCreate, typeIndex]);

  if (typeIndexes.length === 0) {
    return <p className="error">Sorry, this application needs you to have a type index configured</p>
  }

  return <>
    <Header>{cap(t("create a new workspace"))}</Header>
    <main>
      <CreateContainer onCreate={finalizeWorkspace} defaultName="spoty" disabled={typeIndex === undefined} /> 
      {
          typeIndexes.length === 1
          ? null
          : (<details>
              <summary>{cap(t('advanced', nsCommon))}</summary>
              {cap(t('select a type index', nsCommon))}: <></>
              <select value={typeIndex} onChange={evt => setTypeIndex(evt.target.value)} >
                {typeIndexes.map(uri =>
                   <option key={uri}>{uri}</option>
                )}
              </select>
            </details>)
      }
    </main>
  </>;
}

