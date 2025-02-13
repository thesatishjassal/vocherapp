"use client"
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // for redirection
import Cookies from "js-cookie";
import { toast } from "react-toastify"; // Assuming you're using toast for notifications

const RegisterForm = () => {
  const [formValues, setFormValues] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const router = useRouter();

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToastId = toast.loading("Logging in..."); // Show loading toast

    try {
      const response = await axios.post(
        "http://127.0.0.1:5500/users", // Replace with your API URL
        formValues,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // Important if using cookies or authentication
        }
      );

      toast.update(loadingToastId, {
        render: "Login successful!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });

      // Set user details in cookies (if necessary)
      Cookies.set("user_details", JSON.stringify(response.data.user));
      // Redirect to homepage or dashboard
      router.push("/");

      console.log("Form submitted successfully:", response.data);
    } catch (error) {
      toast.update(loadingToastId, {
        render: "Error logging in.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });

      if (error.response) {
        console.error("Error submitting form:", error.response.data);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error setting up the request:", error.message);
      }
    }
  };

  return (
    <div className="page-header min-vh-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-lg-5 col-md-12 d-flex flex-column mx-auto">
            <div className="card card-plain">
              <div className="card-header pb-0 text-center bg-transparent">
                <h3 className="font-weight-bolder text-info text-gradient">
                  Register New User
                </h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit} role="form">
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your name"
                      aria-label="Name"
                      aria-describedby="name-addon"
                      name="name"
                      value={formValues.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="Enter your phone number"
                      aria-label="Phone"
                      aria-describedby="phone-addon"
                      name="phone"
                      value={formValues.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter your password"
                      aria-label="Password"
                      aria-describedby="password-addon"
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
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
                      type="submit"
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
                    href="/signup"
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

export default RegisterForm;
