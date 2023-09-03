import { useAuthContext } from "../my-context";



const LandingPage: React.FC = () => {

  const context = useAuthContext();

  return (
    <>
      <h1> THIS IS A LANDING PAGE </h1>
      {context.auth.loggedIn &&
        <p>{context.auth.email} - {context.auth.uid}</p>
      }
    </>
  )
};

export default LandingPage;