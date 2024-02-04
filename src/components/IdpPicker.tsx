import { FunctionComponent } from "react"
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LinkButton } from "./LinkButton";

const storage = window.localStorage;
const savedIdpsKey = "saved-idps";

// This component let the user pick an IDP from a list saved in the local storage.
// It also allows to remove entries from the list.
//
// See also `saveIdp` for adding an IDP to the saved list.
export const IdpPicker: FunctionComponent<{
  setIdp: (idp: string) => void,
}> = ({
  setIdp,
}) => {
  const [savedIdps, setSavedIdps] = useState(loadIdps());
  const { t } = useTranslation();

  const forgetIdp = (idp: string) => {
    setSavedIdps(oldSavedIdps => {
      const newSavedIdps = oldSavedIdps.filter(i => i!==idp);
      doSaveIdps(newSavedIdps);
      return newSavedIdps;
    });
  };

  return <table className="IdpPicker"><tbody>
    {savedIdps.map((idp, i) => (
      <tr key={i}>
        <td><LinkButton onClick={() => setIdp(idp)}>{idp}</LinkButton></td>
        <td> <LinkButton onClick={() => forgetIdp(idp)} help={t('remove from list')}>🗙</LinkButton></td>
      </tr>
    ))}
  </tbody></table>;
}

// Save the given IDP URL at the start of the list of saved IDPs.
//
// Pre-condition: idp should be a valid IDP URL
export function saveIdp(idp: string) {
  doSaveIdps(
    [idp].concat(...loadIdps().filter(s => s !== idp))
  );
}

export function loadIdps(): string[] {
  return (storage.getItem(savedIdpsKey) || "")
    .split(" ")
    .filter(s => s); // filter out empty strings
}

function doSaveIdps(idps: string[]) {
  storage.setItem(savedIdpsKey, idps.join(" "));
}
