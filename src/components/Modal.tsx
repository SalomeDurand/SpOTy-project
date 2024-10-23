import { FunctionComponent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import ReactModal from "react-modal";
import { LinkButton } from "./LinkButton";
// CSS
import "./Modal.css";

// A modal dialog
export const Modal: FunctionComponent<{
  show: boolean,
  setShow: (x: boolean) => void,
	children: ReactNode,
}> = ({
  show,
  setShow,
  children,
}) => {
  const { t } = useTranslation();

  return <ReactModal 
    isOpen={show}
    onRequestClose={() => setShow(false)}
  >
    {children}

    <span className='modalCloseButton'>
      <LinkButton onClick={() => setShow(false)}>
        <abbr title={t('close')}>✕</abbr>
      </LinkButton>
    </span>
  </ReactModal>
}
