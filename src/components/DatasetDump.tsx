import { useLdo } from "@ldo/solid-react";
import { FunctionComponent } from "react"
// CSS
import "./DatasetDump.css";

// This component is meant for debugging
export const DatasetDump: FunctionComponent = () => {
	console.debug("DatasetDump: rendering");
  const {dataset} = useLdo();

	const quadRows = Array.from(dataset)
		.map(q => [
        q.subject.value,
        q.predicate.value,
        q.object.value,
        q.graph?.value,
		])
		.map((spog, i) =>
			 <tr key={i}>
       	{spog.map((t, j) => <td key={j}>{t}</td>)}
	     </tr>
		);

	return <table className="DatasetDump"><tbody>
		{quadRows}
  </tbody></table>
}
