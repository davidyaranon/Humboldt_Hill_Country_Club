import './Header.css';
import Logo from '../../assets/hill-logo.png';
import { Link } from 'react-router-dom';
import { useAuthContext } from '../../my-context';

const Header: React.FC = () => {

  const context = useAuthContext();

  return (
    <>
      <header className="header">
        <div className="header-content">
          <section className="header-logo-wrapper">
            <Link to="/">
              <img alt="Golf Cart Company Logo" role="button" src={Logo} className="header-logo"></img>
            </Link>
          </section>
          <section className="header-buttons-wrapper">
            {!context.authLoading && !context.auth.loggedIn &&
              <ul>
                <li>
                  <Link to="/login">
                    <button>Sign In</button>
                  </Link>
                </li>
                <li>
                  <Link to="/register">
                    <button>Register</button>
                  </Link>
                </li>
              </ul>
            }

            {!context.authLoading && context.auth.loggedIn &&
              <ul>
                <li>
                  Hello, {context.auth.email}!
                </li>
                <li>
                  <Link to="/logout">
                    <button>Logout</button>
                  </Link>
                </li>
              </ul>
            }

          </section>
        </div>
      </header>
    </>
  )
};

export default Header;