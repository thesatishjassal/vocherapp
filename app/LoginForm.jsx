const LoginForm = () => {
  return (
    <div className="page-header min-vh-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-lg-5 col-md-12 d-flex flex-column mx-auto">
            <div className="card card-plain">
              <div className="card-header pb-0 text-center bg-transparent">
                <h3 className="font-weight-bolder text-info text-gradient">
                  Welcome back
                </h3>
              </div>
              <div className="card-body">
                <form role="form">
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      aria-label="Email"
                      aria-describedby="email-addon"
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your password"
                      aria-label="Password"
                      aria-describedby="password-addon"
                    />
                  </div>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn bg-gradient-info w-100 mt-4 mb-0"
                    >
                      Log In
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center pt-0 px-lg-2 px-1">
                <p className="mb-4 text-sm mx-auto">
                  Don't have an account?
                  <a
                    href="javascript:;"
                    className="text-info text-gradient font-weight-bold"
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
       
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
