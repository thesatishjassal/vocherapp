"use client";
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import AddProductModal from "./AddProductModal";
import CustomAddModal from "./CustomAddModal";

/* ---------- Styles (inline, created once) ---------- */

const GOLD = "#d3a01d";
const GOLD_SOFT = "#fbf5e9";
const LINE = "#eeeeee";
const MUTED = "#8a8a8a";
const INK = "#222";
const RED = "#d64545";

const th = {
  padding: "8px 10px", borderBottom: `1px solid ${LINE}`, color: MUTED, fontSize: 11,
  fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em",
  whiteSpace: "nowrap",
};
const td = { padding: "12px 10px", borderBottom: `1px solid ${LINE}`, verticalAlign: "top" };
const num = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const S = {
  root: { color: INK, fontSize: 13, lineHeight: 1.45 },
  bar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  count: { color: MUTED, fontSize: 12 },
  wrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th,
  thNum: { ...th, textAlign: "right" },
  thSr: { ...th, width: 32 },
  thName: { ...th, minWidth: 260 },
  thActions: { ...th, width: 96 },
  td,
  tdMuted: { ...td, color: MUTED },
  tdCode: { ...td, fontWeight: 600, whiteSpace: "nowrap" },
  tdNum: { ...td, ...num },
  tdStrong: { ...td, ...num, fontWeight: 600 },
  name: { maxWidth: 460, textAlign: "left", textTransform: "none" },
  remarks: { marginTop: 4, color: MUTED, fontSize: 12 },
  img: { width: 40, height: 40, borderRadius: 6, objectFit: "cover" },
  actions: { display: "flex", justifyContent: "flex-end", gap: 2 },
  iconBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28,
    padding: 0, border: 0, borderRadius: 6, background: "transparent", color: MUTED, cursor: "pointer",
  },
  empty: { padding: "36px 10px", color: MUTED, textAlign: "center" },
  totalCell: { ...td, borderBottom: 0, color: MUTED, textAlign: "right" },
  totalValue: { marginLeft: 16, color: INK, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  add: { display: "flex", gap: 8, marginTop: 12 },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
    border: `1px solid ${GOLD}`, borderRadius: 8, background: GOLD, color: "#fff",
    font: "inherit", fontWeight: 600, cursor: "pointer",
  },
  addGhost: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px",
    border: `1px solid ${LINE}`, borderRadius: 8, background: "#fff", color: INK,
    font: "inherit", fontWeight: 600, cursor: "pointer",
  },
  srOnly: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" },
  // column menu
  colWrap: { position: "relative" },
  colToggle: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px",
    border: `1px solid ${LINE}`, borderRadius: 8, background: "#fff", color: MUTED,
    font: "inherit", fontSize: 12, cursor: "pointer",
  },
  colMenu: {
    position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 20, minWidth: 190, padding: 6,
    border: `1px solid ${LINE}`, borderRadius: 10, background: "#fff",
    boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  },
  colItem: {
    display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6,
    fontSize: 13, cursor: "pointer", background: "#fff",
  },
  colCheck: { accentColor: GOLD },
};

// Hover effects done on the DOM node (no re-render), same pattern as the modals
const rowOn = (e) => (e.currentTarget.style.background = "#fafafa");
const rowOff = (e) => (e.currentTarget.style.background = "transparent");
const iconOn = (e) => {
  const danger = e.currentTarget.dataset.danger;
  e.currentTarget.style.background = danger ? "#fdecec" : GOLD_SOFT;
  e.currentTarget.style.color = danger ? RED : GOLD;
};
const iconOff = (e) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = MUTED;
};
const softOn = (e) => (e.currentTarget.style.background = "#fafafa");
const softOff = (e) => (e.currentTarget.style.background = "#fff");
const dimOn = (e) => (e.currentTarget.style.filter = "brightness(.95)");
const dimOff = (e) => (e.currentTarget.style.filter = "none");

/* ---------- Small helpers (UI only) ---------- */

const money = (v) =>
  (Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = (v) => (Number(v) || 0).toLocaleString("en-IN");

const COLUMN_LABELS = {
  Image: "Image",
  customerCode: "Customer code",
  customerDescription: "Customer description",
  ItemCode: "Item code",
  Brand: "Brand",
  MRP: "MRP",
  Qty: "Qty",
  Dist: "Discount",
  NetPrice: "Net price",
  Amount: "Amount",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICON = {
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  custom: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  plus: "M12 5v14M5 12h14",
  columns: "M4 5h16v14H4zM10 5v14M16 5v14",
};

/* Compact "Columns" dropdown — replaces the big row of checkbox buttons */
const ColumnMenu = ({ columns, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="no-print" style={S.colWrap} ref={ref}>
      <button type="button" style={{ ...S.colToggle, color: open ? INK : MUTED }} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon d={ICON.columns} /> Columns
      </button>
      {open && (
        <div style={S.colMenu} role="menu">
          {Object.keys(COLUMN_LABELS).map((key) => (
            <label key={key} style={S.colItem} onMouseOver={softOn} onMouseOut={softOff}>
              <input
                type="checkbox"
                style={S.colCheck}
                checked={!!columns[key]}
                onChange={() => onChange({ ...columns, [key]: !columns[key] })}
              />
              {COLUMN_LABELS[key]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================================================================== */

const QuotationTable = ({
  items = [],
  onTotalAmountChange,
  onClose,
  onRowsChange,
}) => {
  const [rows, setRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCusAddModal, setShowCusAddModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [columns, setColumns] = useState({
    customerCode: false,
    customerDescription: false,
    Image: false,
    ItemCode: true,
    Brand: true,
    MRP: true,
    Qty: true,
    Dist: true,
    Price: true,
    NetPrice: true,
    Amount: true,
  });
  const [editRowIndex, setEditRowIndex] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [newRow, setNewRow] = useState({
    customerCode: "",
    customerDescription: "",
    itemCode: "",
    itemName: "",
    cus_itemcode: "",
    cus_itemname: "",
    brand: "",
    qty: "",
    unit: "",
    mrp: "",
    discount: "",
    amount: "",
    netPrice: "",
    image: "",
    remarks: "",
    cus_customercode: "",
    cus_customerdescription: "",
    cus_qty: "",
    cus_brand: "",
    cus_unit: "",
    cus_mrp: "",
    cus_discount: "",
    cus_netprice: "",
    cus_image: "",
    cus_remarks: "",
    cct: "",
    cctOptions: "",
  });

  const inputRefs = {
    customerCode: useRef(null),
    customerDescription: useRef(null),
    itemCode: useRef(null),
    itemName: useRef(null),
    qty: useRef(null),
    brand: useRef(null),
    unit: useRef(null),
    mrp: useRef(null),
    discount: useRef(null),
    netPrice: useRef(null),
    remarks: useRef(null),
    cus_customercode: useRef(null),
    cus_customerdescription: useRef(null),
    cus_itemcode: useRef(null),
    cus_itemname: useRef(null),
    cus_qty: useRef(null),
    cus_brand: useRef(null),
    cus_unit: useRef(null),
    cus_mrp: useRef(null),
    cus_discount: useRef(null),
    cus_netprice: useRef(null),
    cus_image: useRef(null),
    cus_remarks: useRef(null),
    cct: useRef(null),
  };

  const roundRupee = (value) => {
    const rupees = Math.floor(value);
    const paise = value - rupees;
    return paise >= 0.5 ? rupees + 1 : rupees;
  };

  /* ---------- Helpers ---------- */
  const calculateDiscount = (mrp, netPrice) => {
    const mrpValue = Number(mrp) || 0;
    const netValue = Number(netPrice) || 0;
    if (!mrpValue) return 0;
    return +(((mrpValue - netValue) / mrpValue) * 100).toFixed(2);
  };

  const calculateNetPrice = (mrp, discount) => {
    const mrpValue = Number(mrp) || 0;
    const discValue = Number(discount) || 0;
    const value = mrpValue * (1 - discValue / 100);
    return roundRupee(value);
  };

  const calculateAmount = (qty, netPrice) => {
    const qtyValue = Number(qty) || 0;
    const netValue = Number(netPrice) || 0;
    return roundRupee(qtyValue * netValue);
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (items.length > 0 && rows.length === 0) {
      setRows(
        items.map((item, index) => {
          const mrp = Number(item.mrp) || 0;
          const net = Number(item.netPrice) || 0;
          const discount = item.discount !== undefined
            ? Number(item.discount)
            : calculateDiscount(mrp, net);
          return {
            id: index + 1,
            customerCode: item.customerCode || "",
            customerDescription: item.customerDescription || "",
            itemCode: item.itemCode || "",
            itemName: item.itemName || "",
            brand: item.brand || "",
            qty: Number(item.qty) || 0,
            unit: item.unit || "Piece",
            mrp,
            discount,
            netPrice: net || calculateNetPrice(mrp, discount),
            amount: calculateAmount(item.qty, net || calculateNetPrice(mrp, discount)),
            image: item.image || "",
            remarks: item.remarks || "",
            cct: item.cct || "",
            cctOptions: item.cctOptions || "",
          };
        })
      );
    }
  }, [items, rows.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const updatedData = data.map((item) => ({
          ...item,
          unit: item.unit || "Piece",
          itemname: item.itemname,
          itemcode: item.itemcode || "",
          brand: item.brand || "",
          price: item.price || "",
          thumbnail: item.thumbnail || "",
        }));
        setProductList(updatedData);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const totalAmount = rows.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  );

  useEffect(() => {
    if (onRowsChange) onRowsChange(rows);
    if (onTotalAmountChange) onTotalAmountChange(totalAmount);
  }, [rows, onRowsChange, onTotalAmountChange, totalAmount]);

  /* ---------- Handlers ---------- */
  const filterProducts = (field, value, products) =>
    products.filter((product) =>
      field === "itemCode"
        ? product.itemcode.toLowerCase().includes(value.toLowerCase())
        : product.itemname.toLowerCase().includes(value.toLowerCase())
    );

  const resetNewRow = () => {
    setNewRow({
      customerCode: "",
      customerDescription: "",
      itemCode: "",
      itemName: "",
      cus_itemcode: "",
      cus_itemname: "",
      brand: "",
      qty: "",
      unit: "",
      mrp: "",
      discount: "",
      amount: "",
      netPrice: "",
      image: "",
      remarks: "",
      cus_customercode: "",
      cus_customerdescription: "",
      cus_qty: "",
      cus_brand: "",
      cus_unit: "",
      cus_mrp: "",
      cus_discount: "",
      cus_netprice: "",
      cus_image: "",
      cus_remarks: "",
      cct: "",
      cctOptions: "",
    });
  };

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => {
      const next = { ...prev, [field]: value };
      const mrp = Number(next.mrp);
      const net = Number(next.netPrice);
      const disc = Number(next.discount);
      const qty = Number(next.qty);

      if (["mrp", "netPrice"].includes(field)) {
        next.discount = calculateDiscount(mrp, net);
        next.amount = calculateAmount(qty, net);
      }
      if (field === "discount") {
        const computedNet = calculateNetPrice(mrp, disc);
        next.netPrice = computedNet;
        next.amount = calculateAmount(qty, computedNet);
      }
      if (field === "qty") {
        next.amount = calculateAmount(qty, net);
      }
      return next;
    });
  };

  const handleAddRow = () => {
    const { itemCode, itemName, qty, mrp, netPrice, discount } = newRow;
    if (!itemCode || !itemName || !qty || !netPrice) {
      alert("Please fill in all required fields (Item Code, Item Name, Qty, Net Price).");
      return;
    }

    const parsedMrp = Number(mrp);
    const parsedNet = Number(netPrice);
    const parsedDisc = discount === "" ? calculateDiscount(parsedMrp, parsedNet) : Number(discount);
    const amount = calculateAmount(Number(qty), parsedNet);

    const payload = {
      ...newRow,
      mrp: parsedMrp,
      netPrice: parsedNet,
      discount: parsedDisc,
      amount,
      qty: Number(qty),
      unit: newRow.unit || "Piece",
    };

    if (editRowIndex !== null) {
      setRows((prev) =>
        prev.map((row, i) => (i === editRowIndex ? { ...row, ...payload } : row))
      );
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, { id: prev.length + 1, ...payload }]);
    }

    resetNewRow();
    setShowAddModal(false);
  };

  const submitCustomRowToDB = async (rowData) => {
    try {
      const result = { id: Date.now() }; // Mock response
      return result;
    } catch (error) {
      console.error("Error saving custom item:", error);
      alert("Failed to save custom item. Please try again.");
      return null;
    }
  };

  const handleSubmitCustomRow = async (rowData, editIndex) => {
    const qty = Number(rowData.cus_qty);
    const mrp = Number(rowData.cus_mrp);
    const net = Number(rowData.cus_netprice);
    const discount =
      rowData.cus_discount === ""
        ? calculateDiscount(mrp, net)
        : Number(rowData.cus_discount);
    const amount = calculateAmount(qty, net);

    const savedItem = await submitCustomRowToDB(rowData);
    if (!savedItem) return;

    const newRowData = {
      id: editIndex !== null ? rows[editIndex].id : rows.length + 1,
      customerCode: rowData.cus_customercode || "",
      customerDescription: rowData.cus_customerdescription || "",
      itemCode: rowData.cus_itemcode || "",
      itemName: rowData.cus_itemname || "",
      brand: rowData.cus_brand || "",
      qty,
      unit: rowData.cus_unit || "Piece",
      mrp,
      discount,
      netPrice: net,
      amount,
      image: rowData.cus_image || "",
      remarks: rowData.cus_remarks || "",
    };

    if (editIndex !== null) {
      setRows((prev) =>
        prev.map((row, i) => (i === editIndex ? newRowData : row))
      );
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, newRowData]);
    }
    resetNewRow();
    setShowCusAddModal(false);
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField && inputRefs[nextField]?.current) {
        inputRefs[nextField].current.focus();
      } else {
        if (showAddModal) handleAddRow();
        else if (showCusAddModal) handleSubmitCustomRow(newRow, editRowIndex);
      }
    }
  };

  const handleColumnVisibilityChange = (updatedColumns) => {
    setColumns(updatedColumns);
  };

  const fillFromRow = (row) => ({
    ...newRow,
    customerCode: row.customerCode || "",
    customerDescription: row.customerDescription || "",
    itemCode: row.itemCode || "",
    itemName: row.itemName || "",
    brand: row.brand || "",
    qty: row.qty || "",
    unit: row.unit || "Piece",
    mrp: row.mrp || "",
    discount: row.discount || "",
    amount: row.amount || "",
    netPrice: row.netPrice || "",
    image: row.image || "",
    remarks: row.remarks || "",
    cus_customercode: row.customerCode || "",
    cus_customerdescription: row.customerDescription || "",
    cus_itemcode: row.itemCode || "",
    cus_itemname: row.itemName || "",
    cus_qty: row.qty || "",
    cus_brand: row.brand || "",
    cus_unit: row.unit || "Piece",
    cus_mrp: row.mrp || "",
    cus_discount: row.discount || "",
    cus_netprice: row.netPrice || "",
    cus_image: row.image || "",
    cus_remarks: row.remarks || "",
    cct: row.cct || "",
    cctOptions: row.cctOptions || "",
  });

  const handleEditRow = (index) => {
    setNewRow(fillFromRow(rows[index]));
    setEditRowIndex(index);
    setShowAddModal(true);
  };

  const handleEditCustomRow = (index) => {
    setNewRow(fillFromRow(rows[index]));
    setEditRowIndex(index);
    setShowCusAddModal(true);
  };

  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  // remarks can come back as 0 / "0" from the API — don't print it
  const hasRemarks = (r) => r && String(r).trim() !== "" && String(r).trim() !== "0";

  /* ---------- JSX ---------- */
  return (
    <section style={S.root}>
      <div className="no-print" style={S.bar}>
        <span style={S.count}>
          {rows.length} {rows.length === 1 ? "item" : "items"}
        </span>
        <ColumnMenu columns={columns} onChange={handleColumnVisibilityChange} />
      </div>

      <div style={S.wrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.thSr}>#</th>
              {columns.Image && <th style={S.th}>Image</th>}
              {columns.customerCode && <th style={S.th}>Cust code</th>}
              {columns.customerDescription && <th style={S.th}>Cust desc</th>}
              {columns.ItemCode && <th style={S.th}>Item code</th>}
              <th style={S.thName}>Item name</th>
              {columns.Brand && <th style={S.th}>Brand</th>}
              <th style={S.th}>Unit</th>
              {columns.MRP && <th style={S.thNum}>MRP</th>}
              {columns.Qty && <th style={S.thNum}>Qty</th>}
              {columns.Dist && <th style={S.thNum}>Disc %</th>}
              {columns.NetPrice && <th style={S.thNum}>Net price</th>}
              {columns.Amount && <th style={S.thNum}>Amount</th>}
              <th className="no-print" style={S.thActions}><span style={S.srOnly}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} onMouseOver={rowOn} onMouseOut={rowOff}>
                <td style={S.tdMuted}>{index + 1}</td>
                {columns.Image && (
                  <td style={S.td}>
                    {row.image && (
                      <img
                        src={`${API_URL}${row.image}`}
                        alt=""
                        style={S.img}
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                  </td>
                )}
                {columns.customerCode && <td style={S.td}>{row.customerCode}</td>}
                {columns.customerDescription && <td style={S.td}>{row.customerDescription}</td>}
                {columns.ItemCode && <td style={S.tdCode}>{row.itemCode}</td>}
                <td style={S.td}>
                  <div style={S.name}>{row.itemName}</div>
                  {row.cct && <div style={S.remarks}>CCT: {row.cct}</div>}
                  {hasRemarks(row.remarks) && <div style={S.remarks}>{row.remarks}</div>}
                </td>
                {columns.Brand && <td style={S.tdMuted}>{row.brand}</td>}
                <td style={S.tdMuted}>{row.unit}</td>
                {columns.MRP && <td style={S.tdNum}>{plain(row.mrp)}</td>}
                {columns.Qty && <td style={S.tdNum}>{row.qty}</td>}
                {columns.Dist && <td style={S.tdNum}>{row.discount}</td>}
                {columns.NetPrice && <td style={S.tdNum}>{money(row.netPrice)}</td>}
                {columns.Amount && <td style={S.tdStrong}>{money(row.amount)}</td>}
                <td className="no-print" style={S.td}>
                  <div style={S.actions}>
                    <button type="button" style={S.iconBtn} onMouseOver={iconOn} onMouseOut={iconOff} onClick={() => handleEditRow(index)} aria-label="Edit" title="Edit">
                      <Icon d={ICON.edit} />
                    </button>
                    <button type="button" style={S.iconBtn} onMouseOver={iconOn} onMouseOut={iconOff} onClick={() => handleEditCustomRow(index)} aria-label="Edit as custom" title="Edit as custom">
                      <Icon d={ICON.custom} />
                    </button>
                    <button type="button" style={S.iconBtn} data-danger="1" onMouseOver={iconOn} onMouseOut={iconOff} onClick={() => handleDeleteRow(index)} aria-label="Delete" title="Delete">
                      <Icon d={ICON.trash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td style={S.empty} colSpan={20}>No items yet — add your first product below.</td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && columns.Amount && (
            <tfoot>
              <tr>
                <td style={S.totalCell} colSpan={20}>
                  Subtotal <span style={S.totalValue}>₹{money(totalAmount)}</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="no-print" style={S.add}>
        <button type="button" style={S.addBtn} onMouseOver={dimOn} onMouseOut={dimOff} onClick={() => setShowAddModal(true)}>
          <Icon d={ICON.plus} /> Add product
        </button>
        <button type="button" style={S.addGhost} onMouseOver={softOn} onMouseOut={softOff} onClick={() => setShowCusAddModal(true)}>
          <Icon d={ICON.plus} /> Custom item
        </button>
      </div>

      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newRow={newRow}
        setNewRow={setNewRow}
        handleFieldChange={handleFieldChange}
        handleKeyDown={handleKeyDown}
        inputRefs={inputRefs}
        editRowIndex={editRowIndex}
        handleAddRow={handleAddRow}
        products={productList}
        filterProducts={filterProducts}
      />

      <CustomAddModal
        showCusAddModal={showCusAddModal}
        setShowCusAddModal={setShowCusAddModal}
        newRow={newRow}
        setCustomNewRow={setNewRow}
        handleFieldChange={handleFieldChange}
        handleKeyDown={handleKeyDown}
        inputRefs={inputRefs}
        editRowIndex={editRowIndex}
        handleSubmitCustomRow={handleSubmitCustomRow}
      />
    </section>
  );
};

QuotationTable.propTypes = {
  items: PropTypes.array,
  onTotalAmountChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onRowsChange: PropTypes.func,
};

export default QuotationTable;