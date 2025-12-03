"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [mode, setMode] = useState("select"); // select | manual
  const [users, setUsers] = useState([]);
  const [loadingUser, setLoadingUser] = useState(null);

  const router = useRouter();

  // Fetch users from API.panvic.in
useEffect(() => {
  axios
    .get("https://api.panvic.in/users/")
    .then((res) => {
      setUsers(res.data);  // you need .root
      console.log(res.data);
    })
    .catch(() => toast.error("Failed to load users"));
}, []);


  // Avatar initials generator
  const avatar = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Auto-login when user clicks avatar
  const handleUserLogin = async (user) => {
    setLoadingUser(user.id);

    const values = { phone: user.phone, password: user.password };

    try {
      const res = await axios.post(
        "https://api.panvic.in/login/",
        JSON.stringify(values),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(`Logged in as ${user.name}`);

      if (res.data.user_details) {
        Cookies.set("user_details", JSON.stringify(res.data.user_details), {
          expires: 1,
        });
        Cookies.set("session_id", res.data.session_id, { expires: 1 });
      }

      router.push("/dashboard");
    } catch (err) {
      toast.error("Login failed");
    }

    setLoadingUser(null);
  };

  // ---------------------------
  // Manual Login Form (Your code)
  // ---------------------------

  const formik = useFormik({
    initialValues: { phone: "", password: "" },
    validationSchema: Yup.object({
      phone: Yup.string()
        .matches(/^\d{10}$/, "Phone number must be 10 digits")
        .required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      const t = toast.loading("Logging in...");

      try {
        const res = await axios.post(
          "https://api.panvic.in/login/",
          JSON.stringify(values),
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        toast.update(t, {
          render: "Login Successful",
          type: "success",
          isLoading: false,
          autoClose: 2000,
        });

        if (res.data.user_details) {
          Cookies.set("user_details", JSON.stringify(res.data.user_details), {
            expires: 1,
          });
          Cookies.set("session_id", res.data.session_id, { expires: 1 });
        }

        router.push("/dashboard");
      } catch (error) {
        toast.update(t, {
          render: "Login Error",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }

      setSubmitting(false);
    },
  });

  return (
    <div className="page-header min-vh-100 d-flex align-items-center justify-content-center">
      <div className="container">
        <div className="text-center mb-4">
          <button
            className="btn btn-outline-primary"
            onClick={() => setMode(mode === "select" ? "manual" : "select")}
          >
            {mode === "select"
              ? "Switch to Manual Login"
              : "Select User Instead"}
          </button>
        </div>

        {/* ---------------------- */}
        {/*       USER SELECT      */}
        {/* ---------------------- */}

        {mode === "select" && (
          <div className="row g-3 justify-content-center">
            {users && users.map((user) => (
              <div key={user.id} className="col-6 col-md-4 col-lg-2">
                <div
                  onClick={() => handleUserLogin(user)}
                  className="text-center p-3 rounded shadow-sm bg-white border cursor-pointer"
                  style={{ transition: "0.2s", cursor: "pointer" }}
                >
                  <div
                    className="rounded-circle d-flex justify-content-center align-items-center mx-auto"
                    style={{
                      width: 70,
                      height: 70,
                      background: "#007bff",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {avatar(user.name)}
                  </div>

                  <p className="mt-2 mb-0 dark">{user.name}</p>
                  <small className="text-muted">{user.role}</small>

                  {loadingUser === user.id && (
                    <p className="text-primary small mt-2">Logging in...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ---------------------- */}
        {/*     MANUAL LOGIN       */}
        {/* ---------------------- */}

        {mode === "manual" && (
          <div className="row justify-content-center mt-4">
            <div className="col-xl-4 col-lg-5 col-md-8">
              <div className="card p-4 shadow">
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
                        placeholder="Phone number"
                        {...formik.getFieldProps("phone")}
                      />
                      {formik.touched.phone && formik.errors.phone && (
                        <div className="invalid-feedback">
                          {formik.errors.phone}
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <input
                        type="password"
                        className={`form-control ${
                          formik.touched.password && formik.errors.password
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Password"
                        {...formik.getFieldProps("password")}
                      />
                      {formik.touched.password &&
                        formik.errors.password && (
                          <div className="invalid-feedback">
                            {formik.errors.password}
                          </div>
                        )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                      disabled={!formik.isValid || formik.isSubmitting}
                    >
                      {formik.isSubmitting ? "Logging in..." : "Log In"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
    </div>
  );
}
