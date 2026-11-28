"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LOGO = "/assets/img/panviclogo.jpg"; // change to your Panvik logo path

/* Panvik theme */
const GOLD = "#D4A21D";
const GOLD_DARK = "#B8870F";
const INK = "#111111";
const MUTED = "#6B7280";
const LINE = "#ECEDEF";
const CREAM = "#FFFCF3";

const initials = (name = "") =>
  name.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";

const saveSession = (data) => {
  if (!data.user_details) return;
  Cookies.set("user_details", JSON.stringify(data.user_details), { expires: 1 });
  Cookies.set("session_id", data.session_id, { expires: 1 });
};

const login = (values) =>
  axios.post(`${API_URL}/login/`, values, { withCredentials: true });

/* ---------- styles ---------- */
const s = {
  page: { minHeight: "100vh", background: "#F3F3F3", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter, system-ui, sans-serif" },
  wrap: { width: "100%", maxWidth: 1000, background: "#fff", borderRadius: 16, padding: "28px 32px 32px", boxShadow: "0 1px 3px rgba(0,0,0,.05)", boxSizing: "border-box" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, paddingBottom: 20, marginBottom: 24, borderBottom: `1px solid ${LINE}` },
  logo: { height: 52, display: "block" },
  title: { fontSize: 26, fontWeight: 800, letterSpacing: 3, color: GOLD, margin: 0, textAlign: "right" },
  sub: { color: MUTED, fontSize: 13, margin: "4px 0 0", textAlign: "right" },
  label: { display: "block", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: MUTED, marginBottom: 8 },
  bar: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  tabs: { display: "flex", gap: 4, background: "#F5F5F5", padding: 4, borderRadius: 99 },
  tab: (on) => ({ padding: "7px 18px", border: "none", borderRadius: 99, cursor: "pointer", fontWeight: 600, fontSize: 13, background: on ? GOLD : "transparent", color: on ? "#fff" : MUTED }),
  search: { width: 240, padding: "9px 14px", borderRadius: 8, border: `1px solid ${LINE}`, fontSize: 13, outline: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 14 },
  card: (hover) => ({ background: hover ? CREAM : "#fff", borderRadius: 12, padding: "20px 12px", textAlign: "center", cursor: "pointer", border: `1px ${hover ? "dashed" : "solid"} ${hover ? GOLD : LINE}`, transition: "all .15s" }),
  avatar: (size = 52) => ({ width: size, height: size, borderRadius: "50%", background: INK, color: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.36, letterSpacing: 1, margin: "0 auto 10px" }),
  name: { fontWeight: 700, color: INK, fontSize: 14, textTransform: "capitalize" },
  role: { display: "inline-block", marginTop: 6, fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#F5F5F5", color: MUTED, textTransform: "capitalize" },
  box: { background: "#fff", borderRadius: 12, padding: 28, width: "100%", maxWidth: 380, margin: "0 auto", border: `1px solid ${LINE}`, boxSizing: "border-box" },
  input: (err) => ({ width: "100%", padding: "11px 14px", borderRadius: 8, border: `1px solid ${err ? "#DC2626" : LINE}`, fontSize: 14, color: INK, outline: "none", boxSizing: "border-box" }),
  eye: { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", border: "none", background: "none", cursor: "pointer", color: GOLD_DARK, fontSize: 12, fontWeight: 700 },
  err: { color: "#DC2626", fontSize: 12, marginTop: 4 },
  btn: (off) => ({ width: "100%", padding: 12, border: "none", borderRadius: 8, background: off ? "#E8D49A" : GOLD, color: "#fff", fontWeight: 700, fontSize: 14, cursor: off ? "not-allowed" : "pointer" }),
  ghost: { width: "100%", padding: 10, marginTop: 6, border: "none", background: "none", color: MUTED, cursor: "pointer", fontSize: 13 },
  empty: { textAlign: "center", color: MUTED, fontSize: 13, padding: 24 },
  overlay: { position: "fixed", inset: 0, background: "rgba(17,17,17,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000, padding: 16 },
};

/* ---------- password field ---------- */
function PasswordInput({ error, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input type={show ? "text" : "password"} placeholder="Password" style={{ ...s.input(error), paddingRight: 60 }} {...props} />
      <button type="button" style={s.eye} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}

/* ---------- page ---------- */
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("select");
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/users/`).then((r) => setUsers(r.data || [])).catch(() => toast.error("Failed to load users"));
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const closeModal = () => { setSelected(null); setPassword(""); };

  const confirmLogin = async (e) => {
    e.preventDefault();
    if (!selected || !password) return;
    setLoading(true);
    try {
      const res = await login({ phone: selected.phone, password });
      saveSession(res.data);
      toast.success(`Welcome, ${selected.name}`);
      router.push("/dashboard");
    } catch {
      toast.error("Incorrect password");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: { phone: "", password: "" },
    validationSchema: Yup.object({
      phone: Yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await login(values);
        saveSession(res.data);
        toast.success("Login successful");
        router.push("/dashboard");
      } catch {
        toast.error("Invalid phone or password");
      }
    },
  });

  const filtered = users.filter((u) =>
    `${u.name} ${u.role}`.toLowerCase().includes(query.toLowerCase())
  );
  const fErr = (f) => formik.touched[f] && formik.errors[f];

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        <div style={s.head}>
          <img src={LOGO} alt="Panvik Lighting" style={s.logo} />
          <div>
            <h1 style={s.title}>SIGN IN</h1>
            <p style={s.sub}>{mode === "select" ? "Choose your account" : "Use your phone number"}</p>
          </div>
        </div>

        <div style={s.bar}>
          <div style={s.tabs}>
            <button style={s.tab(mode === "select")} onClick={() => setMode("select")}>Select user</button>
            <button style={s.tab(mode === "manual")} onClick={() => setMode("manual")}>Phone login</button>
          </div>
          {mode === "select" && (
            <input style={s.search} placeholder="Search name or role…" value={query} onChange={(e) => setQuery(e.target.value)} />
          )}
        </div>

        {mode === "select" ? (
          <>
            <div style={s.grid}>
              {filtered.map((u) => (
                <div
                  key={u.id}
                  style={s.card(hover === u.id)}
                  onMouseEnter={() => setHover(u.id)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setSelected(u)}
                >
                  <div style={s.avatar()}>{initials(u.name)}</div>
                  <div style={s.name}>{u.name}</div>
                  <span style={s.role}>{u.role}</span>
                </div>
              ))}
            </div>
            {!filtered.length && <p style={s.empty}>No users found</p>}
          </>
        ) : (
          <form style={s.box} onSubmit={formik.handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={s.label}>Phone number</label>
              <input type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" style={s.input(fErr("phone"))} {...formik.getFieldProps("phone")} />
              {fErr("phone") && <div style={s.err}>{formik.errors.phone}</div>}
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={s.label}>Password</label>
              <PasswordInput error={fErr("password")} {...formik.getFieldProps("password")} />
              {fErr("password") && <div style={s.err}>{formik.errors.password}</div>}
            </div>
            <button type="submit" style={s.btn(formik.isSubmitting)} disabled={formik.isSubmitting}>
              {formik.isSubmitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        )}
      </div>

      {selected && (
        <div style={s.overlay} onClick={closeModal}>
          <form style={s.box} onClick={(e) => e.stopPropagation()} onSubmit={confirmLogin}>
            <div style={s.avatar(64)}>{initials(selected.name)}</div>
            <div style={{ ...s.name, textAlign: "center", fontSize: 17 }}>{selected.name}</div>
            <p style={{ ...s.empty, padding: "4px 0 20px", textTransform: "capitalize" }}>{selected.role}</p>
            <label style={s.label}>Password</label>
            <PasswordInput autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
            <div style={{ height: 16 }} />
            <button type="submit" style={s.btn(!password || loading)} disabled={!password || loading}>
              {loading ? "Checking…" : "Sign in"}
            </button>
            <button type="button" style={s.ghost} onClick={closeModal}>Cancel</button>
          </form>
        </div>
      )}

      <ToastContainer position="top-center" autoClose={2000} />
    </div>
  );
}