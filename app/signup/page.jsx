"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      password: "",
      role: "",
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, "Name must be at least 2 characters")
        .required("Name is required"),
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Phone number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      role: Yup.string().required("Please select a role"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const loadingToastId = toast.loading("Signing up...");

      try {
        const response = await axios.post(`${API_URL}/users/`, values, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });

        toast.dismiss(loadingToastId);
        toast.success("Registration successful!");

        Cookies.set("user_details", JSON.stringify(response.data.user), {
          expires: 7,
        });

        router.push("/dashboard");
      } catch (error) {
        toast.dismiss(loadingToastId);
        toast.error(
          error.response?.data?.message ||
            error.response?.data?.detail ||
            "An error occurred!"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4"> 
            <div className="card shadow-lg border-0 rounded-4 p-4">
              <div className="card-header bg-transparent text-center border-0 pb-2">
                <h3 className="font-weight-bold  mb-1">Create Account</h3>
                <p className="text-muted">Join us today!</p>
              </div>
              <div className="card-body">
                <form onSubmit={formik.handleSubmit}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className={`form-control form-control-lg rounded-3 ${
                        formik.touched.name && formik.errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Your Name"
                      {...formik.getFieldProps("name")}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="invalid-feedback">{formik.errors.name}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <input
                      type="tel"
                      className={`form-control form-control-lg rounded-3 ${
                        formik.touched.phone && formik.errors.phone ? "is-invalid" : ""
                      }`}
                      placeholder="10-digit Phone Number"
                      {...formik.getFieldProps("phone")}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <div className="invalid-feedback">{formik.errors.phone}</div>
                    )}
                  </div>

                  <div className="mb-3 position-relative">
                    <div className="input-group">
                   
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control form-control-lg rounded-3 ${
                          formik.touched.password && formik.errors.password ? "is-invalid" : ""
                        }`}
                        placeholder="Password (min 6 chars)"
                        {...formik.getFieldProps("password")}
                      />
                    </div>
                    {formik.touched.password && formik.errors.password && (
                      <div className="invalid-feedback">{formik.errors.password}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <select
                      className={`form-select form-select-lg rounded-3 ${
                        formik.touched.role && formik.errors.role ? "is-invalid" : ""
                      }`}
                      {...formik.getFieldProps("role")}
                    >
                      <option value="" disabled>Select Your Role</option>
                      <option value="Sales Executive">Sales Executive</option>
                      <option value="Stock Manager">Stock Manager</option>
                      {/* <option value="Admin">Admin</option> */}
                      <option value="Architect">Architect</option>
                    </select>
                    {formik.touched.role && formik.errors.role && (
                      <div className="invalid-feedback">{formik.errors.role}</div>
                    )}
                  </div>

                  <div className="form-check mb-3">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="rememberMe"
                    />
                    <label className="form-check-label text-muted" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 "
                    disabled={!formik.isValid || !formik.dirty || formik.isSubmitting}
                  >
                    {formik.isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing up...
                      </>
                    ) : (
                      "Register"
                    )}
                  </button>
                </form>
              </div>
              <div className="card-footer text-center bg-transparent border-0 pt-2">
                <p className="text-muted mb-0">
                  Already have an account?{" "}
                  <a href="/login" className=" fw-medium">
                    Log in
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default RegisterForm;