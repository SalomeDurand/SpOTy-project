import { useSubject } from "@ldo/solid-react";
import { FunctionComponent, useState } from "react"
import { SolidProfileShapeShapeType } from "../.ldo/solidProfile.shapeTypes";
import { useEffectLoadFullProfile, useProfile } from "../lib/profile";

// Let the user pick one or several contacts from a list of all its contacts
// (built by searching the entire extended profile).
export const ContactPicker: FunctionComponent<{
	select: (uri: string | string[]) => void,
	multiple?: boolean,
}> = ({
	select,
	multiple,
}) => {
	console.debug("ContactPicker: rendering");
	const profile = useProfile();
	const contactWebIds = profile?.knows?.map(c => c['@id']).filter(c => !!c) || [];
;
	return multiple
		? <MultipleContactPicker webIds={contactWebIds} select={select} />
		: <SingleContactPicker webIds={contactWebIds} select={select} />;
}

		
const SingleContactPicker: FunctionComponent<{
	webIds: string[],
	select: (uri: string | string[]) => void,
}> = ({
	webIds,
	select,
}) => {
	return <div className="ContactPicker">
		<ul>
			{webIds.map(iri => (
				<li key={iri}>
					<Contact iri={iri} select={select} />
				</li>
			))}
		</ul>
	</div>
}

const MultipleContactPicker: FunctionComponent<{
	webIds: string[],
	select: (uri: string | string[]) => void,
}> = ({
	webIds,
	select,
}) => {
	const [selection, setSelection] = useState<string[]>([]);
	console.log("selection", selection);
	const itemSelect = (iri: string) => {
		setSelection(old => {
			const i = old.findIndex((i) => i === iri);
			return i === -1
			? [ ...old, iri ]
			: old.filter((_, j) => j !== i)
			
		})
	};
	return <div className="ContactPicker">
		<button onClick={() => select(selection)} disabled={selection.length === 0}>Select {selection.length}</button>
		<ul>
			{webIds.map(iri => {
        const selected = !!selection.find(v => v===iri);
				return <li key={iri}>
					<Contact iri={iri} select={itemSelect} selected={selected} />
				</li>
			})}
		</ul>
	</div>
}

export const Contact: FunctionComponent<{
	iri: string,
	select: (uri: string) => void,
	selected?: boolean,
}> = ({
	iri,
	select,
	selected,
}) => {
	const contact = useSubject(SolidProfileShapeShapeType, iri);
	const name = contact?.fn || contact?.name;
	useEffectLoadFullProfile(iri, !name);
	const checkbox = <input
		 type="checkbox"
		 onChange={() => select(iri)}
		 style={{display: selected===undefined ? "none" : "inherit"}}
		 checked={selected}
		 id={iri}
	/>;

  return <label>
		{checkbox}
		{name || "??"}&nbsp;
  	<a href={iri}>🪪</a>
  </label>
}

export const ContactPickerDemo:FunctionComponent = () => {
  const [multiple, setMultiple] = useState(false);
  const [selection, setSelection] = useState<string | string[]>();
  if (selection === undefined) {
    return <>
      <p><label>Multiple: <input id="ContaCtPickerDemoToggleMultiple" type="checkbox" checked={multiple} onChange={evt => setMultiple(evt.target.checked)} /></label></p>
      <ContactPicker select={setSelection} multiple={multiple}/>
    </>
  } else {
    const webIds = (multiple ? selection : [selection]) as string[];
    const buttonLabel = (multiple ? "Pick other contacts" : "Pick another contact");
    return <>
    	<p>Selected contact(s):</p>
      <ul>
        { webIds.map(iri => <li key={iri}>{iri}</li>) }
      </ul>
      <button onClick={() => setSelection(undefined)}>{buttonLabel}</button>
    </>
  }
}
