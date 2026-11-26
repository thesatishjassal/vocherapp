"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";

/* ==================================================================
   Add / edit client — one small modal used everywhere:
   - the Clients page ("Add client")
   - the Select customer modal on Add / Edit quotation ("+ New customer")
   Props:
     open        boolean
     onClose()   close without saving
     onSaved(c)  called with the client the API returns
     initial     optional prefill, e.g. { client_name: "Sharma" } from a search
     client      pass an existing client to EDIT it (PATCH /client/{id}) instead of adding
   ================================================================== */

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const LINE = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#292929";
const RED = "#d64545";

const EMPTY = {
  client_name: "", client_phone: "", client_email: "",
  businessname: "", gst_number: "", client_type: "Customer",
  address: "", city: "", state: "", pincode: "",
};

const TYPES = ["Customer", "Vendor", "Other"];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Delhi", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala",
  "Ladakh", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

/* ---------- Validation (light: only what a quotation really needs) ---------- */
const validate = (v) => {
  const e = {};
  if (!v.client_name.trim()) e.client_name = "Enter the client's name";
  const digits = v.client_phone.replace(/\D/g, "");
  if (!digits) e.client_phone = "Enter a phone number";
  else if (digits.length < 10) e.client_phone = "Phone number looks too short";
  if (v.client_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.client_email.trim())) e.client_email = "Check the email address";
  if (v.gst_number && !/^[0-9A-Z]{15}$/.test(v.gst_number.trim())) e.gst_number = "GST number is 15 letters/digits";
  if (!v.city.trim()) e.city = "Enter the city";
  if (!v.state.trim()) e.state = "Enter the state";
  if (v.pincode && !/^\d{6}$/.test(v.pincode.trim())) e.pincode = "Pincode is 6 digits";
  return e;
};

/* ---------- Styles ---------- */
const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1080, display: "flex", alignItems: "center",
    justifyContent: "center", padding: 12, overflowY: "auto", background: "rgba(0,0,0,.45)", boxSizing: "border-box",
  },
  card: {
    width: "100%", maxWidth: 480, maxHeight: "calc(100vh - 24px)", overflowY: "auto", padding: 16,
    background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.18)", color: INK,
    fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, boxSizing: "border-box",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  close: { width: 28, height: 28, border: 0, background: "transparent", color: MUTED, fontSize: 22, cursor: "pointer", lineHeight: 1 },
  section: { margin: "4px 0 8px", color: MUTED, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 14 },
  full: { gridColumn: "1 / -1", minWidth: 0 },
  cell: { minWidth: 0 },
  label: { display: "block", marginBottom: 3, color: MUTED, fontSize: 11, fontWeight: 600 },
  req: { color: RED, marginLeft: 2 },
  input: {
    width: "100%", height: 36, padding: "0 10px", border: `1px solid ${LINE}`, borderRadius: 7, outline: "none",
    background: "#fff", color: INK, font: "inherit", fontSize: 13, boxSizing: "border-box",
  },
  inputErr: { borderColor: RED },
  err: { marginTop: 3, color: RED, fontSize: 11 },
  seg: { display: "flex", padding: 3, borderRadius: 8, background: "#f3f3f3" },
  segBtn: {
    flex: 1, height: 30, border: 0, borderRadius: 6, background: "transparent", color: MUTED,
    font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  segOn: { background: "#fff", color: INK, boxShadow: "0 1px 3px rgba(0,0,0,.1)" },
  more: {
    display: "inline-flex", alignItems: "center", gap: 6, margin: "0 0 12px", padding: 0, border: 0,
    background: "transparent", color: GOLD_DARK, font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  formErr: { margin: "0 0 10px", padding: "8px 10px", borderRadius: 7, background: "#fdecec", color: "#a8261f", fontSize: 12 },
  actions: { display: "flex", gap: 8, marginTop: 4 },
  cancel: {
    flex: 1, height: 38, border: `1px solid ${LINE}`, borderRadius: 7, background: "#fff",
    color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  submit: {
    flex: 2, height: 38, border: 0, borderRadius: 7, background: GOLD, color: "#fff",
    fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .15s",
  },
};

const focusOn = (e) => !e.currentTarget.dataset.err && (e.currentTarget.style.borderColor = GOLD);
const focusOff = (e) => !e.currentTarget.dataset.err && (e.currentTarget.style.borderColor = LINE);

const Field = ({ name, label, required, error, full, inputRef, ...rest }) => (
  <div style={full ? S.full : S.cell}>
    <label style={S.label} htmlFor={`cf-${name}`}>{label}{required && <span style={S.req}>*</span>}</label>
    <input
      id={`cf-${name}`} name={name} ref={inputRef}
      style={error ? { ...S.input, ...S.inputErr } : S.input}
      data-err={error ? "1" : undefined}
      aria-invalid={!!error} aria-describedby={error ? `cf-${name}-err` : undefined}
      onFocus={focusOn} onBlur={focusOff}
      {...rest}
    />
    {error && <div id={`cf-${name}-err`} style={S.err}>{error}</div>}
  </div>
);

/* ================================================================== */

export const ClientFormModal = ({ open, onClose, onSaved, initial, client }) => {
  const isEdit = !!client?.id;
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [showBusiness, setShowBusiness] = useState(false);
  const firstRef = useRef(null);

  // Fresh form each time it opens (with any prefill)
  useEffect(() => {
    if (!open) return;
    const fromClient = client
      ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, client[k] == null ? "" : String(client[k])]))
      : {};
    const start = { ...EMPTY, ...fromClient, ...(initial || {}) };
    if (!start.client_type) start.client_type = "Customer";
    setValues(start);
    setErrors({});
    setTouched(false);
    setFormError("");
    setShowBusiness(!!(start.businessname || start.gst_number));
    const t = setTimeout(() => firstRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open, initial, client]);

  useEffect(() => {
    if (!open) return;
    const esc = (e) => e.key === "Escape" && !saving && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open, saving, onClose]);

  if (!open) return null;

  const set = (name, value) => {
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched) setErrors(validate(next));
  };
  const onChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === "gst_number") value = value.toUpperCase().replace(/\s/g, "");
    if (name === "client_phone") value = value.replace(/[^\d+\-\s]/g, "");
    if (name === "pincode") value = value.replace(/\D/g, "").slice(0, 6);
    set(name, value);
  };

  const submit = async (e) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      if (errs.gst_number) setShowBusiness(true);
      return;
    }
    setSaving(true);
    setFormError("");
    let user = null;
    try { user = JSON.parse(Cookies.get("user_details") || "null"); } catch (_) {}
    const payload = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
    if (!isEdit) payload.created_by = user?.name || "Unknown";
    try {
      const res = isEdit
        ? await axios.patch(`${API_URL}/client/${client.id}`, payload)
        : await axios.post(`${API_URL}/clients/`, payload);
      onSaved?.(isEdit ? { ...client, ...payload, ...(res.data && typeof res.data === "object" ? res.data : {}) } : res.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === "string" && /phone/i.test(detail)) {
        setErrors((p) => ({ ...p, client_phone: "A client with this phone number already exists" }));
      } else {
        setFormError(typeof detail === "string" ? detail : "Couldn't save the client. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const err = (n) => (touched ? errors[n] : undefined);

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit client" : "Add client"}
      onMouseDown={(e) => e.target === e.currentTarget && !saving && onClose()}>
      <form style={S.card} onSubmit={submit} noValidate>
        <header style={S.header}>
          <h1 style={S.title}>
            {isEdit ? "Edit client" : "Add client"}
            {isEdit && <span style={{ marginLeft: 8, color: MUTED, fontSize: 12, fontWeight: 400 }}>#{client.id}</span>}
          </h1>
          <button type="button" style={S.close} onClick={onClose} aria-label="Close" disabled={saving}>&times;</button>
        </header>

        <div style={S.section}>Contact</div>
        <div style={S.grid}>
          <Field name="client_name" label="Client name" required full inputRef={firstRef}
            value={values.client_name} onChange={onChange} error={err("client_name")}
            placeholder="e.g. Rajesh Sharma" autoComplete="name" />
          <Field name="client_phone" label="Phone" required type="tel" inputMode="tel"
            value={values.client_phone} onChange={onChange} error={err("client_phone")}
            placeholder="98150 37755" autoComplete="tel" />
          <Field name="client_email" label="Email" type="email" inputMode="email"
            value={values.client_email} onChange={onChange} error={err("client_email")}
            placeholder="optional" autoComplete="email" />
          <div style={S.full}>
            <span style={S.label}>Type</span>
            <div style={S.seg} role="radiogroup" aria-label="Client type">
              {TYPES.map((t) => (
                <button key={t} type="button" role="radio" aria-checked={values.client_type === t}
                  style={values.client_type === t ? { ...S.segBtn, ...S.segOn } : S.segBtn}
                  onClick={() => set("client_type", t)}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={S.section}>Location</div>
        <div style={S.grid}>
          <Field name="city" label="City" required value={values.city} onChange={onChange}
            error={err("city")} placeholder="Jalandhar" autoComplete="address-level2" />
          <Field name="state" label="State" required list="cf-states" value={values.state} onChange={onChange}
            error={err("state")} placeholder="Punjab" autoComplete="address-level1" />
          <datalist id="cf-states">{STATES.map((s) => <option key={s} value={s} />)}</datalist>
          <Field name="address" label="Address" value={values.address} onChange={onChange}
            placeholder="optional" autoComplete="street-address" />
          <Field name="pincode" label="Pincode" inputMode="numeric" value={values.pincode} onChange={onChange}
            error={err("pincode")} placeholder="144003" autoComplete="postal-code" />
        </div>

        {showBusiness ? (
          <>
            <div style={S.section}>Business (optional)</div>
            <div style={S.grid}>
              <Field name="businessname" label="Business name" value={values.businessname} onChange={onChange}
                placeholder="e.g. Sharma Interiors" autoComplete="organization" />
              <Field name="gst_number" label="GST number" value={values.gst_number} onChange={onChange}
                error={err("gst_number")} placeholder="03ABCDE1234F1Z5" maxLength={15} />
            </div>
          </>
        ) : (
          <button type="button" style={S.more} onClick={() => setShowBusiness(true)}>+ Add business name &amp; GST</button>
        )}

        {formError && <div style={S.formErr} role="alert">{formError}</div>}

        <div style={S.actions}>
          <button type="button" style={S.cancel} onClick={onClose} disabled={saving}>Cancel</button>
          <button type="submit" style={{ ...S.submit, opacity: saving ? 0.7 : 1 }} disabled={saving}
            onMouseOver={(e) => (e.currentTarget.style.background = GOLD_DARK)}
            onMouseOut={(e) => (e.currentTarget.style.background = GOLD)}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Save client"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientFormModal;