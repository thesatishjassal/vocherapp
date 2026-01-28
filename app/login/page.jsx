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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // NEW STATES for password confirmation
  const [selectedUser, setSelectedUser] = useState(null);
  const [inputPassword, setInputPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMainPassword, setShowMainPassword] = useState(false);
  const [showModalPassword, setShowModalPassword] = useState(false);

  const router = useRouter();

  // Fetch users
  useEffect(() => {
    axios
      .get(`${API_URL}/users/`)
      .then((res) => {
        setUsers(res.data);
        console.log(res.data);
      })
      .catch(() => toast.error("Failed to load users"));
  }, []);

  // Avatar initials
  const avatar = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // SECURE LOGIN WITH PASSWORD CONFIRM
  const confirmLogin = async () => {
    if (!selectedUser) return;

    setLoadingUser(selectedUser.id);

    const values = { phone: selectedUser.phone, password: inputPassword };

    try {
      const res = await axios.post(
        `${API_URL}/login/`,
        JSON.stringify(values),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success(`Logged in as ${selectedUser.name}`);

      if (res.data.user_details) {
        Cookies.set("user_details", JSON.stringify(res.data.user_details), {
          expires: 1,
        });
        Cookies.set("session_id", res.data.session_id, { expires: 1 });
      }

      router.push("/dashboard");
    } catch (err) {
      toast.error("Incorrect Password");
    }

    setLoadingUser(null);
    setShowPasswordModal(false);
    setInputPassword("");
  };

  // FORM FOR MANUAL LOGIN
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
          `${API_URL}/login/`,
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
            {mode === "select" ? "Switch to Manual Login" : "Select User Instead"}
          </button>
        </div>

        {/* -------- USER SELECT GRID -------- */}
        {mode === "select" && (
          <div className="row g-3 justify-content-center">
            {users &&
              users.map((user) => (
                <div key={user.id} className="col-6 col-md-4 col-lg-2">
                  <div
                    onClick={() => {
                      setSelectedUser(user);
                      setShowPasswordModal(true); // SHOW PASSWORD ASK
                    }}
                    className="text-center p-3 rounded shadow-sm bg-white border cursor-pointer"
                    style={{ transition: "0.2s", cursor: "pointer" }}
                  >
                    <div
                      className="rounded-circle d-flex justify-content-center align-items-center mx-auto"
                      style={{
                        width: 70,
                        height: 70,
                        background: "#050505ff",
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

        {/* -------- MANUAL LOGIN -------- */}
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
<div className="mb-3 position-relative">
  <input
    type={showMainPassword ? "text" : "password"}
    className={`form-control ${
      formik.touched.password && formik.errors.password ? "is-invalid" : ""
    }`}
    placeholder="Password"
    {...formik.getFieldProps("password")}
  />

  <span
    onClick={() => setShowMainPassword(!showMainPassword)}
    style={{
      position: "absolute",
      right: 12,
      top: 10,
      cursor: "pointer",
      fontSize: "18px",
      color: "#333",
    }}
  >
    {showMainPassword ? "👁️" : "👁️‍🗨️"}
  </span>

  {formik.touched.password && formik.errors.password && (
    <div className="invalid-feedback">{formik.errors.password}</div>
  )}
</div>

                      {formik.touched.password && formik.errors.password && (
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

      {/* -------- PASSWORD MODAL -------- */}
      {showPasswordModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 2000 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "320px" }}
          >
            <h5 className="mb-3 text-center">
              Login as {selectedUser?.name}
            </h5>

<div className="position-relative mb-3">
  <input
    type={showModalPassword ? "text" : "password"}
    className="form-control"
    placeholder="Enter Password"
    value={inputPassword}
    onChange={(e) => setInputPassword(e.target.value)}
  />

  <span
    onClick={() => setShowModalPassword(!showModalPassword)}
    style={{
      position: "absolute",
      right: 12,
      top: 10,
      cursor: "pointer",
      fontSize: "18px",
      color: "#333",
    }}
  >
    {showModalPassword ? "👁️" : "👁️‍🗨️"}
  </span>
</div>


            <button
              className="btn btn-primary w-50"
              onClick={confirmLogin}
              disabled={!inputPassword}
            >
              {loadingUser === selectedUser?.id ? "Checking..." : "Login"}
            </button>

            <button
              className="btn btn-link w-50 mt-2"
              onClick={() => {
                setShowPasswordModal(false);
                setInputPassword("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
