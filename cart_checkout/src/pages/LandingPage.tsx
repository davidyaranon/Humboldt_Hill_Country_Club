import { logout } from "../Cart";
import { useAuthContext } from "../my-context";


const LandingPage: React.FC = () => {

  const context = useAuthContext();

  const handleLogout = async () => {
  /* const hasLoggedOut: boolean = */ await logout();
    const isValid: boolean = await context.verifyToken();
    if(!isValid) {
      alert("Logged out!");
    }
  }

  return (
    <>
      <h1> THIS IS A LANDING PAGE </h1>
      {context.auth.loggedIn &&
        <p>{context.auth.email} - {context.auth.uid}</p>
      }
      <button onClick={async () => await handleLogout()}>LOGOUT!</button>
    </>
  )
};

export default LandingPage;