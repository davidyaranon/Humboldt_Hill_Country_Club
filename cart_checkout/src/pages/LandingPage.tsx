// import { logout } from "../Cart";
// import { useAuthContext } from "../my-context";

import landingPageImage from '../assets/club_image_1.jpeg';
import './Content.css';


const LandingPage: React.FC = () => {

  // const context = useAuthContext();

  // const handleLogout = async () => {
  // /* const hasLoggedOut: boolean = */ await logout();
  //   const isValid: boolean = await context.verifyToken();
  //   if(!isValid) {
  //     alert("Logged out!");
  //   }
  // }

  return (
    <>
      <h1 className='landing-page-title'> Welcome to Humboldt Hill Country Club</h1>
      <section>
        <div className="image-container">
          <img className="contained-image" src={landingPageImage} alt="Landing" />
        </div>
      </section>
      <section className="block-container">
        <h2>HELLO HELLO HELLO</h2>
      </section>
    </>
  )
};

export default LandingPage;