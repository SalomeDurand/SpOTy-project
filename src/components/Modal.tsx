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
  width?: string,
  height?: string
}> = ({
  show,
  setShow,
  children,
  width = '30rem',
  height = '30rem'
}) => {
  const { t } = useTranslation();

  return <ReactModal 
    isOpen={show}
    onRequestClose={() => setShow(false)}
    style={{
      content: {
        width,
        height,
        margin: 'auto',
        padding: '2rem',
        borderRadius: '8px',
      },
    }}
  >
    {children}

    <span className='modalCloseButton'>
      <LinkButton onClick={() => setShow(false)}>
        <abbr title={t('close')}>✕</abbr>
      </LinkButton>
    </span>
  </ReactModal>
}
