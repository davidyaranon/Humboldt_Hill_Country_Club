/**
 * @file Register.tsx
 * @fileoverview The Registration page. Allows users to register for a new account using their email and password.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../Cart";
import { useAuthContext } from "../my-context";
import LoadingDialog from "../components/loading/LoadingDialog";

interface RegisterResponseData {
  resString: string;
  registerSuccess: boolean;
}

const Register: React.FC = () => {

  const context = useAuthContext();

  const navigate = useNavigate();
  const [registerStatusIsLoading, setRegisterStatusIsLoading] = useState<boolean>(false);

  /**
   * @function handleLogout
   * @description this function calls the logout utility function and verfies that the JWT token has been invalidated.
   * The loading modal is opened during this, and is closed once logout has completed. 
   */
  const handleLogout = async () => {
    setRegisterStatusIsLoading(true);
    await logout();
    await context.verifyToken();
    setRegisterStatusIsLoading(false);
  };

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
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;

      if (!email || !password) {
        alert("Please enter both an email and password");
        return;
      }

      const res = await fetch("/register", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        alert(res.statusText);
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data: RegisterResponseData = await res.json();

      if (data.registerSuccess) {
        await context.verifyToken();
        navigate('/', { replace: true });
      } else {
        alert(data.resString);
      }

    } catch (error: any) {
      console.error("An error occurred:", error);
    } finally {
      setRegisterStatusIsLoading(false);
    }
  }


  return (
    <>
      <h1> Register </h1>

      <LoadingDialog isLoading={registerStatusIsLoading} />

      {context.authError &&
        <>
          <h2>ERROR: {context.authError.name} - {context.authError.message}</h2>
        </>
      }


      {!context.authLoading && context.auth.loggedIn ?
        <h2>Logged In... {context.auth.email} - {context.auth.uid} </h2>
        :
        <section id="register-form">
          <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => await handleRegister(e)}>
            <input name="email" type="email" placeholder="email@email.com" required />
            <input name="password" type="password" required />
            <button disabled={registerStatusIsLoading} type="submit" name="login">Register</button>
          </form>
        </section>
      }

      <section>
        <button onClick={async () => { await handleLogout() }}>Logout</button>
      </section>
    </>
  )
};

export default Register;