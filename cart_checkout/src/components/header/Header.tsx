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
            <Link to="/" tabIndex={-1}>
              <img aria-label="Humboldt Hill Country Club Company Logo" alt="Humboldt Hill Country Club Company Logo" role="button" src={Logo} className="header-logo"></img>
            </Link>
          </section>

          <section className="header-buttons-wrapper">

            {!context.authLoading && !context.auth.loggedIn &&
              <ul>
                <li>
                  <Link to="/login" tabIndex={-1}>
                    <button>Sign In</button>
                  </Link>
                </li>
                <li>
                  <Link to="/register" tabIndex={-1}>
                    <button>Register</button>
                  </Link>
                </li>
              </ul>
            }

            {!context.authLoading && context.auth.loggedIn &&
              <ul>
                <li>
                  Hello, <Link to="/">{context.auth.name}</Link>
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