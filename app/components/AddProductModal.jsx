"use client";
import React, { useState, useMemo, useCallback, memo } from "react";
import PropTypes from "prop-types";
import FindProduct from "./FindProduct";

/* ---------- Static helpers & styles (created once) ---------- */

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

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
});
const formatINR = (v) => inr.format(Number.isFinite(v) ? v : 0);
const toNum = (v) => parseFloat(v) || 0;
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const calcNetPrice = (mrp, d) => (toNum(mrp) * (1 - toNum(d) / 100)).toFixed(2);
const calcDiscount = (mrp, net) => {
  const m = toNum(mrp);
  return m === 0 ? "0.00" : (((m - toNum(net)) / m) * 100).toFixed(2);
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
  brand: { color: GOLD, fontSize: 12, fontWeight: 700, marginLeft: 8 },
  close: {
    width: 28, height: 28, border: 0, background: "transparent",
    color: MUTED, fontSize: 22, cursor: "pointer", lineHeight: 1,
  },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 },
  grid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 },
  cell: { minWidth: 0 },
  label: { display: "block", marginBottom: 3, color: MUTED, fontSize: 11, fontWeight: 600 },
  input: {
    width: "100%", minWidth: 0, height: 34, padding: "0 10px",
    border: `1px solid ${LINE}`, borderRadius: 7, outline: "none",
    background: "#fff", color: INK, font: "inherit", fontSize: 13, boxSizing: "border-box",
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
  product: { marginBottom: 10, padding: "8px 10px", background: "#f8f8f8", borderRadius: 7 },
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

/* ---------- Sub-component ---------- */

const StepperField = memo(({ id, label, value, min, max, step, onChange, onKeyDown, inputRef }) => {
  const bump = (d) =>
    onChange(String(clamp(Math.round((toNum(value) + d) * 100) / 100, min, max)));
  return (
    <div style={S.cell}>
      <label style={S.label} htmlFor={id}>{label}</label>
      <div style={S.control} onFocus={focusOn} onBlur={focusOff}>
        <button type="button" style={S.stepper} aria-label={`Decrease ${label}`}
          onClick={() => bump(-1)} onMouseOver={hoverOn} onMouseOut={hoverOff}>−</button>
        <input id={id} name={id} type="number" style={S.controlInput}
          value={value ?? ""} min={min} max={max} step={step} ref={inputRef}
          onChange={(e) => onChange(e.target.value)} onKeyDown={onKeyDown} />
        <button type="button" style={S.stepper} aria-label={`Increase ${label}`}
          onClick={() => bump(1)} onMouseOver={hoverOn} onMouseOut={hoverOff}>+</button>
      </div>
    </div>
  );
});
StepperField.displayName = "StepperField";

/* ---------- Main component ---------- */

const AddProductModal = ({
  showAddModal, setShowAddModal, newRow, setNewRow, handleFieldChange,
  handleKeyDown, inputRefs, editRowIndex, handleAddRow,
}) => {
  const [showFind, setShowFind] = useState(false);

  const amount = useMemo(() => toNum(newRow.qty) * toNum(newRow.netPrice),
    [newRow.qty, newRow.netPrice]);

  const openFind = useCallback(() => setShowFind(true), []);

  const handleClose = useCallback(() => {
    setShowAddModal(false);
    setShowFind(false);
    setNewRow(EMPTY_ROW);
  }, [setShowAddModal, setNewRow]);

  const onQty = useCallback((v) => setNewRow((p) => ({ ...p, qty: v })), [setNewRow]);

  const onDiscount = useCallback((v) =>
    setNewRow((p) => {
      const n = { ...p, discount: v };
      if (toNum(p.mrp) > 0 && v !== "" && !isNaN(v)) n.netPrice = calcNetPrice(p.mrp, clamp(toNum(v), 0, 100));
      return n;
    }), [setNewRow]);

  const onNetPrice = useCallback((v) =>
    setNewRow((p) => {
      const n = { ...p, netPrice: v };
      if (toNum(p.mrp) > 0 && v !== "" && !isNaN(v)) n.discount = calcDiscount(p.mrp, v);
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
      image: product.thumbnail || "",
      netPrice: price,
      discount: "",
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
      netPrice,
      amount: (toNum(newRow.qty) * toNum(netPrice)).toFixed(2),
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

        <div style={S.grid2}>
          <div style={S.cell}>
            <label style={S.label} htmlFor="customerCode">Customer code</label>
            <input id="customerCode" name="customerCode" type="text" style={S.input}
              value={newRow.customerCode || ""} onChange={onText}
              onKeyDown={(e) => handleKeyDown(e, "customerDescription")}
              onFocus={focusOn} onBlur={focusOff} placeholder="Unique code"
              ref={inputRefs.customerCode} required />
          </div>
          <div style={S.cell}>
            <label style={S.label} htmlFor="customerDescription">Description</label>
            <input id="customerDescription" name="customerDescription" type="text" style={S.input}
              value={newRow.customerDescription || ""} onChange={onText}
              onKeyDown={(e) => handleKeyDown(e, "itemCode")}
              onFocus={focusOn} onBlur={focusOff} placeholder="Name or note"
              ref={inputRefs.customerDescription} required />
          </div>
        </div>

        <div style={S.search} onClick={openFind} role="search">
          <input style={S.searchInput} type="text" readOnly value=""
            placeholder="Search item name or code..." aria-label="Search item" onFocus={openFind} />
          <button type="button" style={S.browse} onClick={openFind}>Browse</button>
        </div>

        <section style={S.product} aria-label="Selected item">
          <div style={{ ...S.productName, color: hasItem ? INK : MUTED, fontWeight: hasItem ? 700 : 400 }}>
            {newRow.itemName || "No item selected"}
          </div>
          {hasItem && (
            <div style={S.productMeta}>
              {[newRow.itemCode, newRow.brand, newRow.mrp && `MRP ${formatINR(toNum(newRow.mrp))}`]
                .filter(Boolean).join(" · ")}
            </div>
          )}
        </section>

        <section style={S.grid3}>
          <StepperField id="qty" label="Qty" value={newRow.qty} min={1} max={Infinity}
            step={1} onChange={onQty} onKeyDown={keyQty} inputRef={inputRefs.qty} />
          <StepperField id="discount" label="Disc %" value={newRow.discount} min={0} max={100}
            step={0.5} onChange={onDiscount} onKeyDown={keyDiscount} inputRef={inputRefs.discount} />
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

      <FindProduct showModal={showFind} setShowModal={setShowFind}
        handleProductSelect={onProductSelect} />
    </div>
  );
};

AddProductModal.propTypes = {
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

export default memo(AddProductModal);
