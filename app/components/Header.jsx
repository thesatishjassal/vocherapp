const Header = () => {
  return (
    <nav className="navbar sticky-top bg-body-tertiary">
      <div className="container">
        <a className="navbar-brand" href="#">
          <img
            src="/docs/5.3/assets/brand/bootstrap-logo.svg"
            alt="Bootstrap"
            width="30"
            height="24"
          />
        </a>
        <ul className=" d-flex navbar-nav  justify-content-end">
          <li className="nav-item d-flex align-items-center">
            <a
              href="javascript:;"
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
