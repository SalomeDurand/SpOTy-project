import { FunctionComponent } from "react";
import { useTranslation } from "react-i18next";

export const ShareIcon: FunctionComponent = () => {
	const { t } = useTranslation();
	return <abbr title={t('share')}><img alt={t('share')} src="/share-icon.svg" style={{height: "0.7em", marginLeft: "0.3ex"}} /></abbr>;
}
