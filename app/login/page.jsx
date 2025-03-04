"use client";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // For Next.js 13+ (App Router)
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie"; // Import js-cookie for cookie management
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const router = useRouter();
  const formik = useFormik({
    initialValues: {
      phone: "",
      password: "",
    },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const loadingToastId = toast.loading("Logging in..."); // Show loading toast

      try {
        // Ensure that values are being sent as JSON
        const response = await axios.post(
          `${API_URL}/login/`,
          JSON.stringify(values), // Explicitly stringify the data
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true, // Important if using cookies or authentication
          }
        );

        console.log("Form submitted successfully:", JSON.stringify(values));

        toast.update(loadingToastId, {
          render: "Login successful!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });

        console.log("Form submitted successfully:", response);

        // Set user details in cookies after successful login
        if (response.data.user_details) {
          // Stringify the user details object and store it in a cookie
          Cookies.set(
            "user_details",
            JSON.stringify(response.data.user_details),
            { expires: 1 }
          ); // expires in 1 day
          Cookies.set("session_id", response.data.session_id, { expires: 1 });
        }

        // Redirect to the homepage or another page after successful login
        router.push("/dashboard");
      } catch (error) {
        toast.update(loadingToastId, {
          render: "Error logging in.",
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });

        if (error.response) {
          // Check if the message is available in the response
          console.error("Error submitting form:", error.response.data);
          if (error.response.data && error.response.data.message) {
            setAlert({ type: "error", message: error.response.data.message });
          } else {
            setAlert({
              type: "error",
              message: "An error occurred, no specific message received",
            });
          }
        } else if (error.request) {
          console.error("No response received:", error.request);
          setAlert({
            type: "error",
            message: "No response received from the server",
          });
        } else {
          console.error("Error setting up the request:", error.message);
          setAlert({ type: "error", message: error.message });
        }
      }

      setSubmitting(false);
    },
  });

  return (
    <div className="page-header min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-4 col-lg-5 col-md-8">
            <div className="card p-4">
              <div className="card-header pb-2 text-center bg-transparent">
                <h3 className="font-weight-bold text-info">Welcome Back</h3>
              </div>
              <div className="card-body">
                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className={`form-control ${
                        formik.touched.phone && formik.errors.phone
                          ? "is-invalid"
                          : ""
                      }`}
                      placeholder="Enter your phone number"
                      {...formik.getFieldProps("phone")}
                    />
                    {formik.touched.phone && formik.errors.phone ? (
                      <div className="invalid-feedback">
                        {formik.errors.phone}
                      </div>
                    ) : null}
                  </div>
                  <div className="mb-3 position-relative">
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter your password"
                        {...formik.getFieldProps("password")}
                      />
                    </div>
                    {formik.touched.password && formik.errors.password ? (
                      <div className="invalid-feedback d-block">
                        {formik.errors.password}
                      </div>
                    ) : null}
                  </div>
                  <div className="text-center">
                    <button
                      type="submit"
                      className="btn btn-primary w-100 mt-4 mb-0"
                      disabled={!formik.isValid || !formik.dirty}
                    >
                      {formik.isSubmitting ? "Logging in..." : "Log In"}
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer text-center pt-3">
                <p className="mb-0">
                  Don't have an account?
                  <a href="/signup" className="text-info font-weight-bold">
                    {" "}
                    Sign up
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default LoginForm;
