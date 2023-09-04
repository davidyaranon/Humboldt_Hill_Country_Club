import './Header.css';
import Logo from '../../assets/hill-logo.png';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
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
            <ul>
              <li>
                <Link to="/login">
                  <button>Login</button>
                </Link>
              </li>
              <li>
                <Link to="/register">
                  <button>Register</button>
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </header>
    </>
  )
};

export default Header;