import { FunctionComponent, ReactNode } from "react"
import { useTranslation } from "react-i18next";
import { Header } from "../layout/Header";
import { cap } from "../lib/cap";

// A utility component indicating to the user that something is loading.
export const Loading: FunctionComponent<{
	asPage?: string,
	children?: ReactNode,
}> = ({
	asPage,
	children,
}) => {
	console.debug("Loading: rendering");

	const { t } = useTranslation();

	let element =  <div className="loading">
    {cap(t('loading...'))} <br /> {children}
	</div>;

	if (asPage) {
		element = <>
			<Header>{asPage}</Header>
			<main>{element}</main>
		</>;
	}

	return element;
}
