const Profile = () => {
  return (
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-4">
          <div class="card">
            <img
              src="https://i.postimg.cc/BvNYhMHS/user-img.jpg"
              class="card-img-top"
              alt="Profile Picture"
            />
            <div class="card-body text-center">
              <h5 class="card-title">John Doe</h5>
              <p class="card-text">Web Developer</p>
            </div>
          </div>
        </div>

        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h3>Profile Information</h3>
            </div>
            <div class="card-body">
              <ul class="list-group">
                <li class="list-group-item">
                  <strong>Name:</strong> John Doe
                </li>
                <li class="list-group-item">
                  <strong>Email:</strong> johndoe@example.com
                </li>
                <li class="list-group-item">
                  <strong>Phone:</strong> +1234567890
                </li>
                <li class="list-group-item">
                  <strong>Job Title:</strong> Web Developer
                </li>
                <li class="list-group-item">
                  <strong>Location:</strong> New York, USA
                </li>
                <li class="list-group-item">
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
