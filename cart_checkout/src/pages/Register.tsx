/**
 * @file Register.tsx
 * @fileoverview The Registration page. Allows users to register for a new account using their email and password.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuthContext } from "../my-context";

import LoadingDialog from "../components/loading/LoadingDialog";

interface RegisterResponseData {
  resString: string;
  registerSuccess: boolean;
}

interface RegisterProps {
  showToastSuccess: (message: string) => void;
  showToastError: (message: string) => void;
}

const Register: React.FC<RegisterProps> = (props: RegisterProps) => {

  const context = useAuthContext();

  const { showToastSuccess, showToastError } = props;

  const navigate = useNavigate();
  const [registerStatusIsLoading, setRegisterStatusIsLoading] = useState<boolean>(false);

  /**
   * @function handleRegister
   * @description Validates the entered email and password values then passes it to the /register endpoint.
   * The response from this endpoint is handled accordingly depending on the status. 
   * If res.ok === true, then the user has successfully logged in.
   * 
   * @param {React.FormEvent<HTMLFormElement>} e the the form submit event, containing the entered form values (email and password).
   * @returns 
   */
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setRegisterStatusIsLoading(true);

    try {
      const form = e.currentTarget;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
      const name = (form.elements.namedItem('fullName') as HTMLInputElement).value.trim();
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;

      if (!email || !password || !name) {
        showToastError("Please fill out all form inputs!");
        return;
      }

      const res = await fetch("/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, name, password })
      });

      if (!res.ok) {
        showToastError(res.statusText);
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data: RegisterResponseData = await res.json();

      if (data.registerSuccess) {
        await context.verifyToken();
        showToastSuccess("Successfully registered!");
        navigate('/', { replace: true });
      } else {
        showToastError(data.resString);
      }

    } catch (error: any) {
      console.error("An error occurred:", error);
      showToastError("Something went wrong!");
    } finally {
      setRegisterStatusIsLoading(false);
    }
  }

  useEffect(() => {
    if (context.auth.loggedIn) {
      navigate('/', { replace: true });
    }
  }, [context.auth]);


  return (
    <>

      <h1 className='login-title'> Register for an Account </h1>

      <LoadingDialog loadingMessage={"Registering..."} isLoading={registerStatusIsLoading} />

      {!context.auth.loggedIn &&
        <section id="login-form">
          <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => await handleRegister(e)}>
            <label className='input-label' htmlFor="fullName">Full Name</label>
            <input className='name-input' aria-label="User Full Name" name="fullName" type="text" placeholder="Mr. Humboldt" required />
            <label className='input-label' htmlFor="email">Email</label>
            <input className='email-input' aria-label="Login Email" name="email" type="email" placeholder="email@email.com" required />
            <label className='input-label' htmlFor="password">Password</label>
            <input className='password-input' aria-label="Login Password" name="password" type="password" placeholder="●●●●●●" required />
            <button className='login-submit-button' disabled={registerStatusIsLoading} type="submit" name="login">Register</button>
          </form>
        </section>
      }

      <section id='not-a-member'>
        <p>Already a member? <Link className='link' to='/login'>Sign In!</Link></p>
      </section>

    </>
  )
};

export default Register;