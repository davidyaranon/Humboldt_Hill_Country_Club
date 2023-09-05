import { useRef, useEffect } from "react";
import './LoadingDialog.css';

interface LoadingDialogProps {
  isLoading: boolean;
}

const LoadingDialog = (props: LoadingDialogProps) => {

  const { isLoading } = props;

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
    <dialog className='loading-modal' ref={modalRef}>LOADING........</dialog>
  );
};

export default LoadingDialog;