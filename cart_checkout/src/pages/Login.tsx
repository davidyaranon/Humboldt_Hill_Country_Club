import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// import { logout } from "../Cart";
import { useAuthContext } from "../my-context";
import LoadingDialog from "../components/loading/LoadingDialog";


interface LoginResponseData {
  loginSuccess: boolean;
  resString: string;
};

interface LoginProps {
  showToastSuccess: (message: string) => void;
  showToastError: (message: string) => void;
}

const Login: React.FC<LoginProps> = (props: LoginProps) => {

  const context = useAuthContext();

  const navigate = useNavigate();
  const [loginStatusIsLoading, setLoginStatusIsLoading] = useState<boolean>(false);

  const { showToastSuccess, showToastError } = props;

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
        showToastError("Please enter both an email and password");
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
        showToastError(res.statusText);
        throw new Error(`Server responded with status: ${res.status}`);
      }

      const data: LoginResponseData = await res.json();

      if (data.loginSuccess) {
        await context.verifyToken();
        showToastSuccess("You're Signed In!");
        navigate('/', { replace: true });
      } else {
        showToastError(data.resString);
      }

    } catch (error: any) {
      console.error("An error occurred:", error);
    } finally {
      setLoginStatusIsLoading(false);
    }
  }

  useEffect(() => {
    if (context.auth.loggedIn) {
      navigate('/', { replace: true });
    }
  }, [context.auth])


  return (
    <>
      <h1 className='login-title'> Sign In to your Account </h1>

      <LoadingDialog loadingMessage={"Signing In..."} isLoading={!context.authLoading || loginStatusIsLoading} />

      {!context.auth.loggedIn &&
        <section id="login-form">
          <form onSubmit={async (e: React.FormEvent<HTMLFormElement>) => await handleLogin(e)}>
            <label className='input-label' htmlFor="email">Email</label>
            <input className='email-input' aria-label="Login Email" name="email" type="email" placeholder="email@email.com" required />
            <label className='input-label' htmlFor="password">Password</label>
            <input className='password-input' aria-label="Login Password" name="password" type="password" placeholder="●●●●●●" required />
            <button className='login-submit-button' disabled={loginStatusIsLoading} type="submit" name="login">Sign In</button>
          </form>
        </section>
      }

      <section id='not-a-member'>
        <p>Not a member? <Link className='link' to='/register'>Join Now!</Link></p>
      </section>

    </>
  );
};

export default Login;
