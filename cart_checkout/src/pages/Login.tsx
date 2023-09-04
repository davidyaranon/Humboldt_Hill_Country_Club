import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { logout } from "../Cart";
import { useAuthContext } from "../my-context";
import LoadingDialog from "../components/LoadingDialog";


interface LoginResponseData {
  loginSuccess: boolean;
  resString: string;
};

const Login: React.FC = () => {

  const context = useAuthContext();

  const navigate = useNavigate();
  const [loginStatusIsLoading, setLoginStatusIsLoading] = useState<boolean>(false);

  /**
   * @function handleLogout
   * @description this function calls the logout utility function and verfies that the JWT token has been invalidated.
   * The loading modal is opened during this, and is closed once logout has completed. 
   */
  const handleLogout = async () => {
    setLoginStatusIsLoading(true);
    /* const hasLoggedOut: boolean = */ await logout();
    await context.verifyToken();
    setLoginStatusIsLoading(false);

  };

  /**
   * @function handleLogin
   * @description Validates the entered email and password values then passes it to the /login endpoint.
   * The response from this endpoint is handled accordingly depending on the status. 
   * If res.ok === true, then the user has successfully logged in.
   * 
   * @param {React.FormEvent<HTMLFormElement>} e the form submit event, containing the entered form values (email and password).
   * @returns {Promise<void>}
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoginStatusIsLoading(true);

    try {
      const form = e.currentTarget;
      const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
      const password = (form.elements.namedItem('password') as HTMLInputElement).value;

      if (!email || !password) {
        alert("Please enter both an email and password");
        return;
      }

      const res = await fetch("/login", {
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

      const data: LoginResponseData = await res.json();

      if (data.loginSuccess) {
        await context.verifyToken();
        navigate('/', { replace: true });
      } else {
        alert(data.resString);
      }

    } catch (error: any) {
      console.error("An error occurred:", error);
    } finally {
      setLoginStatusIsLoading(false);
    }
  }


  return (
    <>
      <h1> THIS IS A Login </h1>

      <LoadingDialog isLoading={loginStatusIsLoading} />


      {!context.authLoading && context.auth.loggedIn ?
        <h2> LOGGED IN - {context.auth.email} , {context.auth.uid} </h2>
        :
        <section id="login-form">
          <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => await handleLogin(e)}>
            <input name="email" type="email" placeholder="email@email.com" required />
            <input name="password" type="password" required />
            <button disabled={loginStatusIsLoading} type="submit" name="login">Login</button>
          </form>
        </section>
      }


      <section id="login-info">
        NOTE: Feel free to use any email and password combination you wish, there are no strict requirements &gt;.&lt;
      </section>

      <section>
        <button onClick={async () => { await handleLogout() }}>Logout</button>
      </section>
    </>
  );
};

export default Login;
