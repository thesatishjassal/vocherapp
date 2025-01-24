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
          {/* <li className="nav-item d-flex align-items-center">
            <div class="btn-group" role="group" aria-label="Login and Signup">
              <a href="/login" class="btn btn-primary">
                Login
              </a>
              <a href="/signup" class="btn btn-success">
                Signup
              </a>
            </div>
          </li> */}

          <li className="nav-item d-flex align-items-center">
            {" "}
            <ProfileMenu />
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
