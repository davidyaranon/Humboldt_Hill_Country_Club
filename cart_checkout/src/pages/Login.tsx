import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// import { logout } from "../Cart";
import { useAuthContext } from "../my-context";
import LoadingDialog from "../components/loading/LoadingDialog";

// import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  // const handleLogout = async () => {
  //   setLoginStatusIsLoading(true);
  //   /* const hasLoggedOut: boolean = */ await logout();
  //   await context.verifyToken();
  //   setLoginStatusIsLoading(false);
  // };

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

  useEffect(() => {
    if(context.auth.loggedIn) {
      navigate('/', { replace: true });
    }
  }, [context.auth])


  return (
    <>
      <h1 className='login-title'> Sign in to your account </h1>

      <LoadingDialog isLoading={context.authLoading || loginStatusIsLoading} />

      {!context.auth.loggedIn &&
        <section id="login-form">
          <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => await handleLogin(e)}>
            <label className='input-label' htmlFor="email">Email</label>
            <input className='email-input' aria-label="Login Email"  name="email" type="email" placeholder="email@email.com" required />
            <label className='input-label' htmlFor="password">Password</label>
            <input className='password-input' aria-label="Login Password" name="password" type="password" placeholder="●●●●●●" required />
            <button className='login-submit-button' disabled={loginStatusIsLoading} type="submit" name="login">Sign In</button>
          </form>
        </section>
      }

      <section id='not-a-member'>
        <p>Not a member? <Link className='link' to='/register'>Join Now!</Link></p>
      </section>


      {/* <section id="login-info">
        NOTE: Feel free to use any email and password combination you wish, there are no strict requirements &gt;.&lt;
      </section> */}
{/* 
      <section>
        <button onClick={async () => { await handleLogout() }}>Logout</button>
      </section> */}
    </>
  );
};

export default Login;
