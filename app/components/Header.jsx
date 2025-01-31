import ProfileMenu from "../components/ProfileMenu";

const Header = () => {
  return (
    <nav className="navbar sticky-top bg-body-tertiary no-print">
      <div className="container">
        <a className="navbar-brand" href="/">
          <img
            src="https://panvic-com.preview-domain.com/wp-content/uploads/2025/01/logo-removebg-preview.png"
            alt="Bootstrap"
            className="logo"
          />
        </a>

        <ul className=" d-flex navbar-nav  justify-content-end">
          <li className="nav-item d-flex align-items-center">
            <div
              className="btn-group"
              role="group"
              aria-label="Login and Signup"
            >
              <a href="/login" className="btn btn-success">
                Login
              </a>
              <a href="/signup" className="btn btn-primary">
                Signup
              </a>
            </div>
            {/* <ProfileMenu /> */}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
