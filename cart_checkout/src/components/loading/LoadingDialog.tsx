import { useRef, useEffect } from "react";
import './LoadingDialog.css';

interface LoadingDialogProps {
  isLoading: boolean;
  loadingMessage: string;
}

const LoadingDialog = (props: LoadingDialogProps) => {

  const { isLoading, loadingMessage } = props;

  const modalRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
    };

    modal.addEventListener('cancel', handleCancel);

    if (isLoading) {
      modal.showModal();
    } else {
      modal.close();
    }

    return () => {
      modal.removeEventListener('cancel', handleCancel);
    };
  }, [modalRef, isLoading]);

  return (
    <dialog className='loading-modal' ref={modalRef}>
      <div className="flex-container">
        <div className="spinner"></div>
        <p>{loadingMessage}</p>
      </div>
    </dialog>
  );
};

export default LoadingDialog;