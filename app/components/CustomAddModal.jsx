"use client";
import React, { useState, useMemo, useCallback, useEffect, useRef, memo } from "react";
import PropTypes from "prop-types";

/* ---------- Static helpers & styles (same look as AddProductModal) ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const LINE = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#292929";
const RED = "#d64545";

const EMPTY_ROW = {
  customerCode: "", customerDescription: "", itemCode: "", itemName: "",
  cus_itemcode: "", cus_itemname: "", brand: "", qty: "", unit: "", mrp: "",
  discount: "", amount: "", netPrice: "", image: "", remarks: "",
  cus_customercode: "", cus_customerdescription: "", cus_qty: "", cus_brand: "",
  cus_unit: "", cus_mrp: "", cus_discount: "", cus_netprice: "", cus_image: "",
  cus_remarks: "", cus_amount: "",
};

/* Customer code / description start as "0" and are locked; the pencil unlocks them. */
const CUSTOMER_DEFAULT = "0";
const orDefault = (v) => (String(v ?? "").trim() === "" ? CUSTOMER_DEFAULT : v);

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 });
const formatINR = (v) => inr.format(Number.isFinite(v) ? v : 0);
const toNum = (v) => parseFloat(v) || 0;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const calcNetPrice = (mrp, d) => (toNum(mrp) * (1 - toNum(d) / 100)).toFixed(2);
const calcDiscount = (mrp, net) => {
  const m = toNum(mrp);
  return m === 0 ? "0.00" : (((m - toNum(net)) / m) * 100).toFixed(2);
};
const calcAmount = (qty, net) => (toNum(qty) * toNum(net)).toFixed(2);

const previewSrc = (v) => {
  const s = String(v || "");
  if (!s) return "";
  if (/^(https?:|data:|blob:|\/)/i.test(s)) return s;
  return `/uploads/${s.split("/").pop()}`;
};

const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1050, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 12,
    overflowY: "auto", background: "rgba(0,0,0,.45)", boxSizing: "border-box",
  },
  card: {
    width: "100%", maxWidth: 420, padding: 16, background: "#fff",
    borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.18)", color: INK,
    fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, boxSizing: "border-box",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  tag: {
    marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "#fbf5e9",
    color: GOLD_DARK, fontSize: 11, fontWeight: 700,
  },
  close: {
    width: 28, height: 28, border: 0, background: "transparent",
    color: MUTED, fontSize: 22, cursor: "pointer", lineHeight: 1,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 },
  cell: { minWidth: 0 },
  full: { minWidth: 0, gridColumn: "1 / -1" },
  label: { display: "block", marginBottom: 3, color: MUTED, fontSize: 11, fontWeight: 600 },
  req: { color: RED, marginLeft: 2 },
  input: {
    width: "100%", minWidth: 0, height: 34, padding: "0 10px",
    border: `1px solid ${LINE}`, borderRadius: 7, outline: "none",
    background: "#fff", color: INK, font: "inherit", fontSize: 13, boxSizing: "border-box",
  },
  lockWrap: {
    display: "flex", alignItems: "center", height: 34, border: `1px solid ${LINE}`,
    borderRadius: 7, background: "#fff", overflow: "hidden", boxSizing: "border-box",
  },
  lockWrapLocked: { background: "#f6f6f6", borderColor: "#ececec" },
  lockInput: {
    flex: 1, minWidth: 0, height: "100%", padding: "0 0 0 10px", border: 0, outline: "none",
    background: "transparent", color: INK, font: "inherit", fontSize: 13,
  },
  lockInputLocked: { color: MUTED, cursor: "default" },
  lockBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 30, height: "100%", flex: "0 0 30px", padding: 0, border: 0,
    background: "transparent", color: MUTED, cursor: "pointer",
  },
  control: {
    display: "flex", alignItems: "center", height: 34,
    border: `1px solid ${LINE}`, borderRadius: 7, background: "#fff", overflow: "hidden",
  },
  controlInput: {
    flex: 1, minWidth: 0, width: "100%", height: "100%", padding: 0, border: 0,
    outline: "none", background: "transparent", color: INK, font: "inherit",
    fontSize: 13, textAlign: "center", MozAppearance: "textfield",
  },
  stepper: {
    alignSelf: "stretch", width: 22, flex: "0 0 22px", border: 0, padding: 0,
    background: "#fff", color: "#777", fontSize: 15, cursor: "pointer",
  },
  // image
  upload: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 10, padding: 8,
    border: `1px dashed ${LINE}`, borderRadius: 8, cursor: "pointer",
  },
  thumb: {
    flex: "0 0 48px", width: 48, height: 48, borderRadius: 6, objectFit: "cover",
    background: "#f4f4f4", display: "inline-flex", alignItems: "center", justifyContent: "center", color: MUTED,
  },
  uploadText: { minWidth: 0, flex: 1 },
  uploadTitle: { fontWeight: 600 },
  uploadMeta: { marginTop: 1, color: MUTED, fontSize: 11 },
  linkBtn: {
    border: 0, padding: "0 4px", background: "transparent", color: GOLD_DARK,
    font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  total: {
    display: "flex", alignItems: "baseline", justifyContent: "space-between",
    margin: "4px 0 10px", padding: "8px 10px", borderRadius: 7, background: "#fbf5e9",
  },
  totalLabel: { color: "#666", fontSize: 12, fontWeight: 600 },
  totalValue: { fontSize: 16, fontWeight: 700 },
  textarea: {
    width: "100%", height: 44, padding: "7px 10px", border: `1px solid ${LINE}`,
    borderRadius: 7, outline: "none", resize: "none", font: "inherit",
    fontSize: 13, boxSizing: "border-box",
  },
  actions: { display: "flex", gap: 8, marginTop: 12 },
  cancel: {
    flex: 1, height: 36, border: `1px solid ${LINE}`, borderRadius: 7,
    background: "#fff", color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer",
  },
  submit: {
    flex: 2, height: 36, border: 0, borderRadius: 7, background: GOLD,
    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "background .15s",
  },
};

const focusOn = (e) => (e.currentTarget.style.borderColor = GOLD);
const focusOff = (e) => (e.currentTarget.style.borderColor = LINE);
const hoverOn = (e) => (e.currentTarget.style.background = "#f2f2f2");
const hoverOff = (e) => (e.currentTarget.style.background = "#fff");

const PENCIL = "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4";
const TICK = "M5 12.5l4.5 4.5L19 7";
const IMAGE = "M4 5h16v14H4zM4 15l4-4 4 4 3-3 5 5M15 9h.01";

const Svg = ({ d, size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);

/* ---------- Sub-components ---------- */

const StepperField = memo(({ id, label, value, min, max, onChange, onKeyDown, inputRef, required }) => {
  const bump = (d) => onChange(String(clamp(Math.round((toNum(value) + d) * 100) / 100, min, max)));
  return (
    <div style={S.cell}>
      <label style={S.label} htmlFor={id}>{label}{required && <span style={S.req}>*</span>}</label>
      <div style={S.control} onFocus={focusOn} onBlur={focusOff}>
        <button type="button" style={S.stepper} aria-label={`Decrease ${label}`}
          onClick={() => bump(-1)} onMouseOver={hoverOn} onMouseOut={hoverOff}>−</button>
        <input id={id} name={id} type="number" style={S.controlInput}
          value={value ?? ""} min={min} max={max} ref={inputRef}
          onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} />
        <button type="button" style={S.stepper} aria-label={`Increase ${label}`}
          onClick={() => bump(1)} onMouseOver={hoverOn} onMouseOut={hoverOff}>+</button>
      </div>
    </div>
  );
});
StepperField.displayName = "StepperField";

const LockedField = memo(({ id, label, value, placeholder, unlocked, onToggle, onChange, onKeyDown, inputRef }) => (
  <div style={S.cell}>
    <label style={S.label} htmlFor={id}>{label}</label>
    <div
      style={{ ...S.lockWrap, ...(unlocked ? null : S.lockWrapLocked) }}
      onFocus={unlocked ? focusOn : undefined}
      onBlur={unlocked ? focusOff : undefined}
      onDoubleClick={unlocked ? undefined : () => onToggle(id)}
      title={unlocked ? undefined : "Click the pencil to edit"}
    >
      <input
        id={id} name={id} type="text" ref={inputRef}
        style={{ ...S.lockInput, ...(unlocked ? null : S.lockInputLocked) }}
        value={value ?? ""} placeholder={placeholder}
        readOnly={!unlocked} aria-readonly={!unlocked} tabIndex={unlocked ? 0 : -1}
        onChange={onChange}
        onFocus={(e) => unlocked && e.target.value === CUSTOMER_DEFAULT && e.target.select()}
        onKeyDown={onKeyDown}
      />
      <button type="button" style={{ ...S.lockBtn, color: unlocked ? GOLD_DARK : MUTED }}
        onClick={() => onToggle(id)}
        aria-label={unlocked ? `Done editing ${label}` : `Edit ${label}`}
        aria-pressed={unlocked} title={unlocked ? "Done" : `Edit ${label.toLowerCase()}`}>
        <Svg d={unlocked ? TICK : PENCIL} />
      </button>
    </div>
  </div>
));
LockedField.displayName = "LockedField";

const Field = ({ id, label, full, required, inputRef, ...rest }) => (
  <div style={full ? S.full : S.cell}>
    <label style={S.label} htmlFor={id}>{label}{required && <span style={S.req}>*</span>}</label>
    <input id={id} name={id} style={S.input} ref={inputRef}
      onFocus={focusOn} onBlur={focusOff} {...rest} />
  </div>
);

/* ---------- Main component ---------- */

const CustomAddModal = ({
  showCusAddModal, setShowCusAddModal, newRow, setCustomNewRow, handleFieldChange,
  handleKeyDown, inputRefs, editRowIndex, handleSubmitCustomRow,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [custUnlocked, setCustUnlocked] = useState(false);
  const fileRef = useRef(null);

  const amount = useMemo(() => toNum(newRow.cus_qty) * toNum(newRow.cus_netprice),
    [newRow.cus_qty, newRow.cus_netprice]);

  // Every time the modal opens: lock customer fields, fill empty ones with "0"
  useEffect(() => {
    if (!showCusAddModal) return;
    setCustUnlocked(false);
    setCustomNewRow((p) =>
      p.cus_customercode === orDefault(p.cus_customercode) && p.cus_customerdescription === orDefault(p.cus_customerdescription)
        ? p
        : { ...p, cus_customercode: orDefault(p.cus_customercode), cus_customerdescription: orDefault(p.cus_customerdescription) }
    );
  }, [showCusAddModal, setCustomNewRow]);

  const toggleCust = useCallback((id) => {
    if (custUnlocked) {
      setCustomNewRow((p) => ({ ...p, cus_customercode: orDefault(p.cus_customercode), cus_customerdescription: orDefault(p.cus_customerdescription) }));
      setCustUnlocked(false);
    } else {
      setCustUnlocked(true);
      setTimeout(() => inputRefs?.[id]?.current?.focus(), 0);
    }
  }, [custUnlocked, setCustomNewRow, inputRefs]);

  const handleClose = useCallback(() => {
    setShowCusAddModal(false);
    setPreviewImage(null);
    setCustUnlocked(false);
    setCustomNewRow(EMPTY_ROW);
  }, [setShowCusAddModal, setCustomNewRow]);

  /* --- price maths: qty / discount / net price / MRP keep each other in sync --- */
  const onQty = useCallback((v) =>
    setCustomNewRow((p) => ({ ...p, cus_qty: v, cus_amount: calcAmount(v, p.cus_netprice) })), [setCustomNewRow]);

  const onDiscount = useCallback((v) =>
    setCustomNewRow((p) => {
      const n = { ...p, cus_discount: v };
      if (toNum(p.cus_mrp) > 0 && v !== "" && !isNaN(v)) {
        n.cus_netprice = calcNetPrice(p.cus_mrp, clamp(toNum(v), 0, 100));
        n.cus_amount = calcAmount(p.cus_qty, n.cus_netprice);
      }
      return n;
    }), [setCustomNewRow]);

  const onNetPrice = useCallback((v) =>
    setCustomNewRow((p) => {
      const n = { ...p, cus_netprice: v, cus_amount: calcAmount(p.cus_qty, v) };
      if (toNum(p.cus_mrp) > 0 && v !== "" && !isNaN(v)) n.cus_discount = calcDiscount(p.cus_mrp, v);
      return n;
    }), [setCustomNewRow]);

  const onMrp = useCallback((v) =>
    setCustomNewRow((p) => {
      const n = { ...p, cus_mrp: v };
      if (toNum(v) > 0) {
        if (p.cus_discount !== "" && p.cus_discount !== undefined) {
          n.cus_netprice = calcNetPrice(v, p.cus_discount);
          n.cus_amount = calcAmount(p.cus_qty, n.cus_netprice);
        } else if (p.cus_netprice) {
          n.cus_discount = calcDiscount(v, p.cus_netprice);
        }
      }
      return n;
    }), [setCustomNewRow]);

  const onText = useCallback((e) => handleFieldChange(e.target.name, e.target.value), [handleFieldChange]);

  /* --- image upload (same API route as before) --- */
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(file.type)) {
      alert("Please upload a JPG, PNG or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image is larger than 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const response = await fetch("/api/upload/", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Upload failed");
      const { filePath } = await response.json();
      handleFieldChange("cus_image", filePath);
    } catch (error) {
      alert("Failed to upload image");
      setPreviewImage(null);
      handleFieldChange("cus_image", "");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setPreviewImage(null);
    handleFieldChange("cus_image", "");
  };

  const handleSubmit = useCallback(() => {
    if (!newRow.cus_itemcode || !newRow.cus_itemname || !newRow.cus_qty || !newRow.cus_netprice) {
      alert("Please fill all required fields (Item code, Item name, Qty, Net price).");
      return;
    }
    if (uploading) {
      alert("Please wait — the image is still uploading.");
      return;
    }
    if (toNum(newRow.cus_mrp) > 0 && toNum(newRow.cus_netprice) > toNum(newRow.cus_mrp)) {
      alert("Net price cannot be more than MRP.");
      inputRefs?.cus_netprice?.current?.focus();
      return;
    }
    const netPrice = toNum(newRow.cus_netprice).toFixed(2);
    handleSubmitCustomRow({
      ...newRow,
      cus_customercode: orDefault(newRow.cus_customercode),
      cus_customerdescription: orDefault(newRow.cus_customerdescription),
      cus_netprice: netPrice,
      cus_amount: calcAmount(newRow.cus_qty, netPrice),
      cus_unit: newRow.cus_unit || "Piece",
      cus_mrp: newRow.cus_mrp || "",
      cus_brand: newRow.cus_brand || "",
      cus_image: newRow.cus_image || "",
      cus_remarks: newRow.cus_remarks || "",
    }, editRowIndex);
    handleClose();
  }, [newRow, uploading, editRowIndex, handleSubmitCustomRow, handleClose, inputRefs]);

  if (!showCusAddModal) return null;

  const isEdit = editRowIndex !== null && editRowIndex !== undefined;
  const imgSrc = previewImage || previewSrc(newRow.cus_image);

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" aria-label={isEdit ? "Edit custom item" : "Add custom item"}>
      <div style={S.card}>
        <header style={S.header}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h1 style={S.title}>{isEdit ? "Edit Item" : "Add Item"}</h1>
            <span style={S.tag}>Custom</span>
          </div>
          <button type="button" style={S.close} onClick={handleClose} aria-label="Close">&times;</button>
        </header>

        <div style={S.grid2}>
          <LockedField id="cus_customercode" label="Customer code" placeholder="Unique code"
            value={newRow.cus_customercode} unlocked={custUnlocked} onToggle={toggleCust}
            onChange={onText} inputRef={inputRefs.cus_customercode}
            onKeyDown={(e) => handleKeyDown(e, "cus_customerdescription")} />
          <LockedField id="cus_customerdescription" label="Description" placeholder="Name or note"
            value={newRow.cus_customerdescription} unlocked={custUnlocked} onToggle={toggleCust}
            onChange={onText} inputRef={inputRefs.cus_customerdescription}
            onKeyDown={(e) => handleKeyDown(e, "cus_itemcode")} />
        </div>

        <div style={S.grid2}>
          <Field id="cus_itemcode" label="Item code" required type="text" placeholder="e.g. CUS-001"
            value={newRow.cus_itemcode || ""} onChange={onText} inputRef={inputRefs.cus_itemcode}
            onKeyDown={(e) => handleKeyDown(e, "cus_itemname")} />
          <Field id="cus_brand" label="Brand" type="text" placeholder="Brand"
            value={newRow.cus_brand || ""} onChange={onText} inputRef={inputRefs.cus_brand}
            onKeyDown={(e) => handleKeyDown(e, "cus_unit")} />
          <Field id="cus_itemname" label="Item name" required full type="text" placeholder="Product name and specs"
            value={newRow.cus_itemname || ""} onChange={onText} inputRef={inputRefs.cus_itemname}
            onKeyDown={(e) => handleKeyDown(e, "cus_brand")} />
          <Field id="cus_unit" label="Unit" type="text" placeholder="Piece"
            value={newRow.cus_unit || ""} onChange={onText} inputRef={inputRefs.cus_unit}
            onKeyDown={(e) => handleKeyDown(e, "cus_mrp")} />
          <Field id="cus_mrp" label="MRP" type="number" min="0" step="0.01" placeholder="0.00"
            value={newRow.cus_mrp ?? ""} onChange={(e) => onMrp(e.target.value)} inputRef={inputRefs.cus_mrp}
            onKeyDown={(e) => handleKeyDown(e, "cus_qty")} />
        </div>

        <section style={S.grid3}>
          <StepperField id="cus_qty" label="Qty" required value={newRow.cus_qty} min={1} max={Infinity}
            onChange={onQty} onKeyDown={(e) => handleKeyDown(e, "cus_discount")} inputRef={inputRefs.cus_qty} />
          <StepperField id="cus_discount" label="Disc %" value={newRow.cus_discount} min={0} max={100}
            onChange={onDiscount} onKeyDown={(e) => handleKeyDown(e, "cus_netprice")} inputRef={inputRefs.cus_discount} />
          <div style={S.cell}>
            <label style={S.label} htmlFor="cus_netprice">Net price<span style={S.req}>*</span></label>
            <input id="cus_netprice" name="cus_netprice" type="number" style={{ ...S.input, fontWeight: 600 }}
              value={newRow.cus_netprice ?? ""} min="0" step="0.01"
              onChange={(e) => onNetPrice(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "cus_remarks")}
              onFocus={focusOn} onBlur={focusOff} ref={inputRefs.cus_netprice} />
          </div>
        </section>

        <div style={S.upload} role="button" tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), fileRef.current?.click())}
          aria-label={imgSrc ? "Change image" : "Upload image"}>
          {imgSrc ? (
            <img src={imgSrc} alt="" style={S.thumb} onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
          ) : (
            <span style={S.thumb}><Svg d={IMAGE} size={20} /></span>
          )}
          <span style={S.uploadText}>
            <span style={{ ...S.uploadTitle, display: "block" }}>
              {uploading ? "Uploading…" : imgSrc ? "Image added" : "Add an image"}
            </span>
            <span style={{ ...S.uploadMeta, display: "block" }}>JPG, PNG or WEBP · max 5 MB</span>
          </span>
          {imgSrc && !uploading && (
            <button type="button" style={{ ...S.linkBtn, color: RED }} onClick={removeImage}>Remove</button>
          )}
          <input ref={(el) => { fileRef.current = el; if (inputRefs?.cus_image) inputRefs.cus_image.current = el; }}
            type="file" accept="image/jpeg,image/png,image/jpg,image/webp"
            style={{ display: "none" }} onChange={handleImageUpload} />
        </div>

        <section style={S.total} aria-live="polite">
          <span style={S.totalLabel}>Amount</span>
          <strong style={S.totalValue}>{formatINR(amount)}</strong>
        </section>

        <textarea id="cus_remarks" name="cus_remarks" style={S.textarea}
          value={newRow.cus_remarks || ""} onChange={onText}
          onKeyDown={(e) => handleKeyDown(e, null)}
          onFocus={focusOn} onBlur={focusOff}
          placeholder="Remarks (optional)" aria-label="Remarks" ref={inputRefs.cus_remarks} />

        <div style={S.actions}>
          <button type="button" style={S.cancel} onClick={handleClose}>Cancel</button>
          <button type="button" style={{ ...S.submit, opacity: uploading ? 0.7 : 1 }} onClick={handleSubmit}
            onMouseOver={(e) => (e.currentTarget.style.background = GOLD_DARK)}
            onMouseOut={(e) => (e.currentTarget.style.background = GOLD)}>
            {isEdit ? "Update item" : "Add item"}
          </button>
        </div>
      </div>
    </div>
  );
};

CustomAddModal.propTypes = {
  showCusAddModal: PropTypes.bool.isRequired,
  setShowCusAddModal: PropTypes.func.isRequired,
  newRow: PropTypes.object.isRequired,
  setCustomNewRow: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  inputRefs: PropTypes.objectOf(PropTypes.shape({ current: PropTypes.any })).isRequired,
  editRowIndex: PropTypes.number,
  handleSubmitCustomRow: PropTypes.func.isRequired,
};

export default memo(CustomAddModal);