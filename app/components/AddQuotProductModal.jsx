"use client";
import React, { useState, useMemo, useCallback, useEffect, memo } from "react";
import PropTypes from "prop-types";
import FindProduct from "./FindProduct";

/* ---------- Static helpers & styles (same look as AddProductModal) ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const LINE = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#292929";

const EMPTY_ROW = {
  customerCode: "", customerDescription: "", itemCode: "", itemName: "",
  cus_itemcode: "", cus_itemname: "", brand: "", qty: "", unit: "", mrp: "",
  discount: "", amount: "", netPrice: "", image: "", remarks: "",
  cus_customercode: "", cus_customerdescription: "", cus_qty: "", cus_brand: "",
  cus_unit: "", cus_mrp: "", cus_discount: "", cus_netprice: "", cus_image: "",
  cus_remarks: "",
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
  brand: { color: GOLD, fontSize: 12, fontWeight: 700, marginLeft: 8 },
  close: {
    width: 28, height: 28, border: 0, background: "transparent",
    color: MUTED, fontSize: 22, cursor: "pointer", lineHeight: 1,
  },
  // Quick add / Manual toggle
  seg: {
    display: "flex", padding: 3, marginBottom: 10, borderRadius: 8, background: "#f3f3f3",
  },
  segBtn: {
    flex: 1, height: 28, border: 0, borderRadius: 6, background: "transparent",
    color: MUTED, font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  segOn: { background: "#fff", color: INK, boxShadow: "0 1px 3px rgba(0,0,0,.1)" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 },
  cell: { minWidth: 0 },
  full: { minWidth: 0, gridColumn: "1 / -1" },
  label: { display: "block", marginBottom: 3, color: MUTED, fontSize: 11, fontWeight: 600 },
  input: {
    width: "100%", minWidth: 0, height: 34, padding: "0 10px",
    border: `1px solid ${LINE}`, borderRadius: 7, outline: "none",
    background: "#fff", color: INK, font: "inherit", fontSize: 13, boxSizing: "border-box",
  },
  lockWrap: {
    display: "flex", alignItems: "center", height: 34, border: `1px solid ${LINE}`,
    borderRadius: 7, background: "#fff", overflow: "hidden", boxSizing: "border-box",
    transition: "border-color .15s, background .15s",
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
    background: "transparent", color: MUTED, cursor: "pointer", transition: "color .15s",
  },
  search: {
    display: "flex", alignItems: "center", height: 34, marginBottom: 10,
    padding: "0 4px 0 10px", border: `1px solid ${LINE}`, borderRadius: 7, cursor: "pointer",
  },
  searchInput: {
    flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent",
    fontSize: 13, cursor: "pointer",
  },
  browse: {
    padding: "0 8px", height: 26, border: 0, background: "transparent",
    color: GOLD_DARK, fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  product: {
    display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
    padding: "8px 10px", background: "#f8f8f8", borderRadius: 7,
  },
  productImg: { flex: "0 0 40px", width: 40, height: 40, borderRadius: 6, objectFit: "cover", background: "#fff" },
  productText: { minWidth: 0, flex: 1 },
  productName: { fontSize: 13, fontWeight: 700, overflowWrap: "anywhere" },
  productMeta: { marginTop: 2, color: MUTED, fontSize: 11 },
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
    color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
    transition: "background .15s",
  },
};

// Pseudo-class effects done on the DOM node (no re-render)
const focusOn = (e) => (e.currentTarget.style.borderColor = GOLD);
const focusOff = (e) => (e.currentTarget.style.borderColor = LINE);
const hoverOn = (e) => (e.currentTarget.style.background = "#f2f2f2");
const hoverOff = (e) => (e.currentTarget.style.background = "#fff");
const submitOver = (e) => (e.currentTarget.style.background = GOLD_DARK);
const submitOut = (e) => (e.currentTarget.style.background = GOLD);

/* ---------- Sub-components ---------- */

const PENCIL = "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4";
const TICK = "M5 12.5l4.5 4.5L19 7";

const StepperField = memo(({ id, label, value, min, max, onChange, onKeyDown, inputRef }) => {
  const bump = (d) => onChange(String(clamp(Math.round((toNum(value) + d) * 100) / 100, min, max)));
  return (
    <div style={S.cell}>
      <label style={S.label} htmlFor={id}>{label}</label>
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

/** Input that is read-only until its pencil icon is clicked. */
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
      <button
        type="button" style={{ ...S.lockBtn, color: unlocked ? GOLD_DARK : MUTED }}
        onClick={() => onToggle(id)}
        onMouseOver={(e) => (e.currentTarget.style.color = GOLD_DARK)}
        onMouseOut={(e) => (e.currentTarget.style.color = unlocked ? GOLD_DARK : MUTED)}
        aria-label={unlocked ? `Done editing ${label}` : `Edit ${label}`}
        aria-pressed={unlocked}
        title={unlocked ? "Done" : `Edit ${label.toLowerCase()}`}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
          strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d={unlocked ? TICK : PENCIL} />
        </svg>
      </button>
    </div>
  </div>
));
LockedField.displayName = "LockedField";

/** Plain text / number input in the same style. */
const Field = ({ id, label, full, inputRef, ...rest }) => (
  <div style={full ? S.full : S.cell}>
    <label style={S.label} htmlFor={id}>{label}</label>
    <input id={id} name={id} style={S.input} ref={inputRef}
      onFocus={focusOn} onBlur={focusOff} {...rest} />
  </div>
);

/* ---------- Main component ---------- */

const AddQuotProductModal = ({
  showAddModal, setShowAddModal, newRow, setNewRow, handleFieldChange,
  handleKeyDown, inputRefs, editRowIndex, handleAddRow,
}) => {
  const [showFind, setShowFind] = useState(false);
  const [mode, setMode] = useState("auto"); // "auto" = search a product, "manual" = type everything
  const [custUnlocked, setCustUnlocked] = useState(false);

  const amount = useMemo(() => toNum(newRow.qty) * toNum(newRow.netPrice), [newRow.qty, newRow.netPrice]);

  // Every time the modal opens: lock customer fields, fill empty ones with "0"
  useEffect(() => {
    if (!showAddModal) return;
    setCustUnlocked(false);
    setNewRow((p) =>
      p.customerCode === orDefault(p.customerCode) && p.customerDescription === orDefault(p.customerDescription)
        ? p
        : { ...p, customerCode: orDefault(p.customerCode), customerDescription: orDefault(p.customerDescription) }
    );
  }, [showAddModal, setNewRow]);

  const toggleCust = useCallback((id) => {
    if (custUnlocked) {
      setNewRow((p) => ({ ...p, customerCode: orDefault(p.customerCode), customerDescription: orDefault(p.customerDescription) }));
      setCustUnlocked(false);
    } else {
      setCustUnlocked(true);
      setTimeout(() => inputRefs?.[id]?.current?.focus(), 0);
    }
  }, [custUnlocked, setNewRow, inputRefs]);

  const handleClose = useCallback(() => {
    setShowAddModal(false);
    setShowFind(false);
    setMode("auto");
    setCustUnlocked(false);
    setNewRow(EMPTY_ROW);
  }, [setShowAddModal, setNewRow]);

  /* --- price maths: qty / discount / net price / MRP keep each other in sync --- */
  const onQty = useCallback((v) =>
    setNewRow((p) => ({ ...p, qty: v, amount: calcAmount(v, p.netPrice) })), [setNewRow]);

  const onDiscount = useCallback((v) =>
    setNewRow((p) => {
      const n = { ...p, discount: v };
      if (toNum(p.mrp) > 0 && v !== "" && !isNaN(v)) {
        n.netPrice = calcNetPrice(p.mrp, clamp(toNum(v), 0, 100));
        n.amount = calcAmount(p.qty, n.netPrice);
      }
      return n;
    }), [setNewRow]);

  const onNetPrice = useCallback((v) =>
    setNewRow((p) => {
      const n = { ...p, netPrice: v, amount: calcAmount(p.qty, v) };
      if (toNum(p.mrp) > 0 && v !== "" && !isNaN(v)) n.discount = calcDiscount(p.mrp, v);
      return n;
    }), [setNewRow]);

  const onMrp = useCallback((v) =>
    setNewRow((p) => {
      const n = { ...p, mrp: v };
      if (toNum(v) > 0 && p.discount !== "") {
        n.netPrice = calcNetPrice(v, p.discount);
        n.amount = calcAmount(p.qty, n.netPrice);
      }
      return n;
    }), [setNewRow]);

  const onText = useCallback((e) => handleFieldChange(e.target.name, e.target.value), [handleFieldChange]);

  const onProductSelect = useCallback((product) => {
    if (!product) return;
    const price = product.price || "";
    setNewRow((p) => ({
      ...p,
      itemCode: product.itemcode || "",
      itemName: product.itemname || "",
      unit: product.unit || "Piece",
      mrp: price,
      brand: product.brand || "",
      image: product.image || product.thumbnail || "",
      netPrice: price,
      discount: "",
      amount: calcAmount(p.qty, price),
    }));
    setShowFind(false);
    setTimeout(() => inputRefs?.qty?.current?.focus(), 100);
  }, [setNewRow, inputRefs]);

  const handleSubmit = useCallback(() => {
    if (!newRow.itemCode || !newRow.itemName || !newRow.qty || !newRow.netPrice) {
      alert("Please fill all required fields (Item Code, Item Name, Quantity, Net Price).");
      return;
    }
    const netPrice = toNum(newRow.netPrice).toFixed(2);
    handleAddRow({
      ...newRow,
      customerCode: orDefault(newRow.customerCode),
      customerDescription: orDefault(newRow.customerDescription),
      netPrice,
      amount: calcAmount(newRow.qty, netPrice),
      unit: newRow.unit || "Piece",
      mrp: newRow.mrp || "",
      brand: newRow.brand || "",
      image: newRow.image || "",
      remarks: newRow.remarks || "",
      discount: newRow.discount || "",
    }, editRowIndex);
    handleClose();
  }, [newRow, editRowIndex, handleAddRow, handleClose]);

  const keyQty = useCallback((e) => handleKeyDown(e, "discount"), [handleKeyDown]);
  const keyDiscount = useCallback((e) => handleKeyDown(e, "netPrice"), [handleKeyDown]);

  if (!showAddModal) return null;

  const isEdit = editRowIndex !== null && editRowIndex !== undefined;
  const hasItem = !!newRow.itemCode;
  const manual = mode === "manual";

  return (
    <div style={S.overlay} role="dialog" aria-modal="true">
      <div style={S.card}>
        <header style={S.header}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <h1 style={S.title}>{isEdit ? "Edit Item" : "Add Item"}</h1>
            <span style={S.brand}>Panvik Lighting</span>
          </div>
          <button type="button" style={S.close} onClick={handleClose} aria-label="Close">&times;</button>
        </header>

        <div style={S.seg} role="tablist" aria-label="Entry mode">
          {[["auto", "Quick add"], ["manual", "Manual entry"]].map(([m, text]) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m}
              style={mode === m ? { ...S.segBtn, ...S.segOn } : S.segBtn}
              onClick={() => setMode(m)}>
              {text}
            </button>
          ))}
        </div>

        <div style={S.grid2}>
          <LockedField id="customerCode" label="Customer code" placeholder="Unique code"
            value={newRow.customerCode} unlocked={custUnlocked} onToggle={toggleCust}
            onChange={onText} inputRef={inputRefs.customerCode}
            onKeyDown={(e) => handleKeyDown(e, "customerDescription")} />
          <LockedField id="customerDescription" label="Description" placeholder="Name or note"
            value={newRow.customerDescription} unlocked={custUnlocked} onToggle={toggleCust}
            onChange={onText} inputRef={inputRefs.customerDescription}
            onKeyDown={(e) => handleKeyDown(e, manual ? "itemCode" : "qty")} />
        </div>

        {manual ? (
          <div style={S.grid2}>
            <Field id="itemCode" label="Item code" type="text" placeholder="e.g. LLO-005"
              value={newRow.itemCode || ""} onChange={onText} inputRef={inputRefs.itemCode}
              onKeyDown={(e) => handleKeyDown(e, "itemName")} />
            <Field id="brand" label="Brand" type="text" placeholder="Brand"
              value={newRow.brand || ""} onChange={onText} inputRef={inputRefs.brand}
              onKeyDown={(e) => handleKeyDown(e, "unit")} />
            <Field id="itemName" label="Item name" type="text" full placeholder="Product name"
              value={newRow.itemName || ""} onChange={onText} inputRef={inputRefs.itemName}
              onKeyDown={(e) => handleKeyDown(e, "brand")} />
            <Field id="unit" label="Unit" type="text" placeholder="Piece"
              value={newRow.unit || ""} onChange={onText} inputRef={inputRefs.unit}
              onKeyDown={(e) => handleKeyDown(e, "mrp")} />
            <Field id="mrp" label="MRP" type="number" min="0" step="0.01" placeholder="0.00"
              value={newRow.mrp ?? ""} onChange={(e) => onMrp(e.target.value)} inputRef={inputRefs.mrp}
              onKeyDown={(e) => handleKeyDown(e, "qty")} />
          </div>
        ) : (
          <>
            <div style={S.search} onClick={() => setShowFind(true)} role="search">
              <input style={S.searchInput} type="text" readOnly value=""
                placeholder="Search item name or code..." aria-label="Search item"
                onFocus={() => setShowFind(true)} />
              <button type="button" style={S.browse} onClick={() => setShowFind(true)}>Browse</button>
            </div>

            <section style={S.product} aria-label="Selected item">
              {hasItem && newRow.image && /^https?:\/\//i.test(newRow.image) && (
                <img src={newRow.image} alt="" style={S.productImg}
                  onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
              <div style={S.productText}>
                <div style={{ ...S.productName, color: hasItem ? INK : MUTED, fontWeight: hasItem ? 700 : 400 }}>
                  {newRow.itemName || "No item selected"}
                </div>
                {hasItem && (
                  <div style={S.productMeta}>
                    {[newRow.itemCode, newRow.brand, newRow.mrp && `MRP ${formatINR(toNum(newRow.mrp))}`]
                      .filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        <section style={S.grid3}>
          <StepperField id="qty" label="Qty" value={newRow.qty} min={1} max={Infinity}
            onChange={onQty} onKeyDown={keyQty} inputRef={inputRefs.qty} />
          <StepperField id="discount" label="Disc %" value={newRow.discount} min={0} max={100}
            onChange={onDiscount} onKeyDown={keyDiscount} inputRef={inputRefs.discount} />
          <div style={S.cell}>
            <label style={S.label} htmlFor="netPrice">Net price</label>
            <input id="netPrice" name="netPrice" type="number" style={{ ...S.input, fontWeight: 600 }}
              value={newRow.netPrice ?? ""} min="0" step="0.01"
              onChange={(e) => onNetPrice(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, "remarks")}
              onFocus={focusOn} onBlur={focusOff} ref={inputRefs.netPrice} />
          </div>
        </section>

        <section style={S.total} aria-live="polite">
          <span style={S.totalLabel}>Amount</span>
          <strong style={S.totalValue}>{formatINR(amount)}</strong>
        </section>

        <textarea id="remarks" name="remarks" style={S.textarea}
          value={newRow.remarks || ""} onChange={onText}
          onKeyDown={(e) => handleKeyDown(e, null)}
          onFocus={focusOn} onBlur={focusOff}
          placeholder="Remarks (optional)" aria-label="Remarks" ref={inputRefs.remarks} />

        <div style={S.actions}>
          <button type="button" style={S.cancel} onClick={handleClose}>Cancel</button>
          <button type="button" style={S.submit} onClick={handleSubmit}
            onMouseOver={submitOver} onMouseOut={submitOut}>
            {isEdit ? "Update item" : "Add item"}
          </button>
        </div>
      </div>

      <FindProduct showModal={showFind} setShowModal={setShowFind} handleProductSelect={onProductSelect} />
    </div>
  );
};

AddQuotProductModal.propTypes = {
  showAddModal: PropTypes.bool.isRequired,
  setShowAddModal: PropTypes.func.isRequired,
  newRow: PropTypes.object.isRequired,
  setNewRow: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  inputRefs: PropTypes.objectOf(PropTypes.shape({ current: PropTypes.any })).isRequired,
  editRowIndex: PropTypes.number,
  handleAddRow: PropTypes.func.isRequired,
};

export default memo(AddQuotProductModal);