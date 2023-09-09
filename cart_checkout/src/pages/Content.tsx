import './Content.css';

import { Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import Login from './Login';
import Register from './Register';
import Checkout from './Checkout';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Content: React.FC = () => {

  const showToastSuccess = (message: string): void => {
    toast.success(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  }

  const showToastError = (message: string): void => {
    toast.error(message, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  return (
    <>

      <ToastContainer />

      <section className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login showToastSuccess={showToastSuccess} showToastError={showToastError} />} />
          <Route path="/register" element={<Register showToastSuccess={showToastSuccess} showToastError={showToastError} />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </section>

    </>
  );
};

export default Content;