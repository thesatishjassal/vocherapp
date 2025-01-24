const Header = () => {
  return (
    <nav className="navbar sticky-top bg-body-tertiary">
      <div className="container">
        <a className="navbar-brand" href="#">
          <img
            src="https://panvic-com.preview-domain.com/wp-content/uploads/2025/01/logo-removebg-preview.png"
            alt="Bootstrap" className="logo"
          />
        </a>
        <ul className=" d-flex navbar-nav  justify-content-end">
          <li className="nav-item d-flex align-items-center">
            <a
              href="/login"
              className="nav-link text-body font-weight-bold px-0"
            >
              <i className="fa fa-user me-sm-1"></i>
              <span className="d-sm-inline d-none">Sign In</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Header;
