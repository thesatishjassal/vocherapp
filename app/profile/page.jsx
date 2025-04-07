const Profile = () => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <img
              src="https://i.postimg.cc/BvNYhMHS/user-img.jpg"
              className="card-img-top"
              alt="Profile Picture"
            />
            <div className="card-body text-center">
              <h5 className="card-title">John Doe</h5>
              <p className="card-text">Web Developer</p>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h3>Profile Information</h3>
            </div>
            <div className="card-body">
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>Name:</strong> John Doe
                </li>
                <li className="list-group-item">
                  <strong>Email:</strong> johndoe@example.com
                </li>
                <li className="list-group-item">
                  <strong>Phone:</strong> +1234567890
                </li>
                <li className="list-group-item">
                  <strong>Job Title:</strong> Web Developer
                </li>
                <li className="list-group-item">
                  <strong>Location:</strong> New York, USA
                </li>
                <li className="list-group-item">
                  <strong>About Me:</strong> Passionate web developer with 5+
                  years of experience in building modern web applications.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
