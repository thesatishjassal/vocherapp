"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

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

    const loadingToastId = toast.loading("Signing up...");

    try {
      const response = await axios.post(
        "https://api.panvic.in/users", // Correct API URL (adjust as needed)
        formValues,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.dismiss(loadingToastId); // Remove loading toast
      toast.success("Registration successful!");

      // Set user details in cookies
      Cookies.set("user_details", JSON.stringify(response.data.user), {
        expires: 7, // Set expiry for cookies
      });

      // Redirect to dashboard or homepage
      router.push("/dashboard");
    } catch (error) {
      toast.dismiss(loadingToastId); // Ensure the loading toast is removed before error handling
      // console.log("Registration error:", error);
      if (error) {
        if (error.response.data.message === "Phone Number already exists!") {
        
          toast.error("Phone Number already exists!");
        } else {
          toast.error(error.response.data.detail || "An error occurred!");
        }
      } else {
        toast.error("Network error! Please check your connection.");
      }
    }
  };

  return (
    <div className="page-header min-vh-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-4 col-lg-5 col-md-12 d-flex flex-column mx-auto">
            <div className="card p-4">
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
                      name="password"
                      value={formValues.password}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <div className="text-center">
                    <button type="submit" className="btn bg-gradient-info w-100 mt-4 mb-0">
                      Register
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center pt-0 px-lg-2 px-1">
                <p className="mb-4 text-sm mx-auto">
                  Already have an account?{" "}
                  <a href="/login" className="text-info text-gradient font-weight-bold">
                    Log in
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
