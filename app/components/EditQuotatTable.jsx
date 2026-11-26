"use client";
import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import PropTypes from "prop-types";
import AddProductModal from "./AddProductModal";
import CCT_MAP from "./cctMap";
import CustomAddModal from "./CustomAddModal";

/* ==================================================================
   Quotation items table
   - Search + brand filter on top, one quiet toolbar
   - Qty, Disc % and Net price are edited right in the row (no modal needed)
   - Wide screens: a fixed-layout table (no sideways scroll)
     Tablet / phone: each item becomes a compact card
   - Delete has a 6-second Undo
   ================================================================== */

/* ---------- Tokens ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const GOLD_SOFT = "#fbf5e9";
const LINE = "#ececec";
const FIELD = "#e3e3e3";
const MUTED = "#8a8a8a";
const INK = "#222";
const RED = "#d64545";

const CARD_BELOW = 820;   // container width (px) under which rows become cards
const COMPACT_BELOW = 1060; // under this, brand / unit / MRP move into the item line

/* ---------- Styles (created once) ---------- */

const th = {
  padding: "8px 8px", borderBottom: `1px solid ${LINE}`, color: MUTED, fontSize: 11,
  fontWeight: 600, textAlign: "left", textTransform: "uppercase", letterSpacing: "0.04em",
  whiteSpace: "nowrap", background: "#fff",
};
const td = { padding: "10px 8px", borderBottom: `1px solid ${LINE}`, verticalAlign: "middle" };
const num = { textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };

const S = {
  root: { color: INK, fontSize: 13, lineHeight: 1.45 },

  // toolbar
  bar: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  search: {
    display: "flex", alignItems: "center", gap: 6, flex: "1 1 220px", minWidth: 0, height: 34,
    padding: "0 10px", border: `1px solid ${FIELD}`, borderRadius: 8, background: "#fff",
    color: MUTED, boxSizing: "border-box",
  },
  searchInput: { flex: 1, minWidth: 0, border: 0, outline: 0, background: "transparent", font: "inherit", fontSize: 13, color: INK },
  clear: { border: 0, padding: 0, background: "transparent", color: MUTED, fontSize: 16, lineHeight: 1, cursor: "pointer" },
  chips: { display: "flex", gap: 4, flexWrap: "wrap" },
  chip: {
    height: 30, padding: "0 12px", border: `1px solid ${FIELD}`, borderRadius: 999, background: "#fff",
    color: "#555", font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  },
  chipOn: { borderColor: GOLD, background: GOLD, color: "#fff" },
  chipCount: { marginLeft: 4, opacity: 0.7, fontWeight: 400 },
  barRight: { display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" },
  count: { color: MUTED, fontSize: 12, whiteSpace: "nowrap" },
  ghostBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px",
    border: `1px solid ${FIELD}`, borderRadius: 8, background: "#fff", color: MUTED,
    font: "inherit", fontSize: 12, cursor: "pointer",
  },

  // table
  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },
  th, thNum: { ...th, textAlign: "right" },
  td, tdNum: { ...td, ...num },
  tdMuted: { ...td, color: MUTED },
  code: { fontWeight: 700, fontSize: 12, overflowWrap: "anywhere" },
  name: { fontWeight: 600, overflowWrap: "anywhere" },
  meta: { marginTop: 2, color: MUTED, fontSize: 11, overflowWrap: "anywhere" },
  note: { marginTop: 3, color: "#6b6b6b", fontSize: 12, fontStyle: "italic", overflowWrap: "anywhere" },
  img: { width: 40, height: 40, borderRadius: 6, objectFit: "cover", background: "#f4f4f4", display: "block" },
  imgEmpty: { width: 40, height: 40, borderRadius: 6, background: "#f6f6f6" },
  amount: { fontWeight: 700 },
  tag: {
    display: "inline-block", marginLeft: 6, padding: "0 6px", borderRadius: 999, background: GOLD_SOFT,
    color: GOLD_DARK, fontSize: 10, fontWeight: 700, verticalAlign: "middle",
  },

  // inline editors
  stepper: {
    display: "inline-flex", alignItems: "center", height: 30, border: `1px solid ${FIELD}`,
    borderRadius: 7, background: "#fff", overflow: "hidden",
  },
  stepBtn: {
    width: 24, height: "100%", border: 0, padding: 0, background: "#fff", color: "#777",
    fontSize: 15, cursor: "pointer",
  },
  stepInput: {
    width: 40, height: "100%", padding: 0, border: 0, outline: "none", background: "transparent",
    textAlign: "center", font: "inherit", fontSize: 13, color: INK, MozAppearance: "textfield",
  },
  cellInput: {
    width: "100%", height: 30, padding: "0 6px", border: `1px solid ${FIELD}`, borderRadius: 7,
    outline: "none", background: "#fff", textAlign: "right", font: "inherit", fontSize: 13,
    color: INK, boxSizing: "border-box", MozAppearance: "textfield",
  },

  // row actions
  actions: { display: "flex", justifyContent: "flex-end", gap: 2 },
  iconBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30,
    padding: 0, border: 0, borderRadius: 7, background: "transparent", color: MUTED, cursor: "pointer",
  },

  // cards (tablet / phone)
  cards: { display: "flex", flexDirection: "column", gap: 8 },
  card: { padding: 10, border: `1px solid ${LINE}`, borderRadius: 10, background: "#fff" },
  cardTop: { display: "flex", gap: 10, alignItems: "flex-start" },
  cardText: { flex: 1, minWidth: 0 },
  cardEdit: {
    display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) minmax(0, 1fr)", gap: 8,
    alignItems: "end", marginTop: 10,
  },
  cardLabel: { display: "block", marginBottom: 3, color: MUTED, fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  cardFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${LINE}` },

  // empty / totals / add
  empty: { padding: "36px 10px", color: MUTED, textAlign: "center" },
  emptyBox: { padding: "32px 16px", border: `1px dashed ${FIELD}`, borderRadius: 10, color: MUTED, textAlign: "center" },
  total: {
    display: "flex", justifyContent: "flex-end", alignItems: "baseline", gap: 16,
    padding: "12px 8px 0", color: MUTED,
  },
  totalValue: { color: INK, fontSize: 16, fontWeight: 700, fontVariantNumeric: "tabular-nums" },
  add: { display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px",
    border: `1px solid ${GOLD}`, borderRadius: 8, background: GOLD, color: "#fff",
    font: "inherit", fontWeight: 600, cursor: "pointer",
  },
  addGhost: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px",
    border: `1px solid ${FIELD}`, borderRadius: 8, background: "#fff", color: INK,
    font: "inherit", fontWeight: 600, cursor: "pointer",
  },

  // column menu
  colWrap: { position: "relative" },
  colMenu: {
    position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 30, minWidth: 200, padding: 6,
    border: `1px solid ${LINE}`, borderRadius: 10, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,.08)",
  },
  colItem: { display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 6, fontSize: 13, cursor: "pointer" },

  // undo toast
  undo: {
    position: "sticky", bottom: 12, zIndex: 25, display: "flex", alignItems: "center", gap: 12,
    width: "fit-content", margin: "10px auto 0", padding: "8px 8px 8px 14px", borderRadius: 10,
    background: INK, color: "#fff", fontSize: 13, boxShadow: "0 6px 20px rgba(0,0,0,.18)",
  },
  undoBtn: {
    height: 28, padding: "0 12px", border: 0, borderRadius: 7, background: "#fff", color: INK,
    font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  srOnly: { position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" },
};

// Print: inputs read as plain numbers, controls disappear
const PRINT_CSS = `
@media print {
  .qt-items .no-print { display: none !important; }
  .qt-items input { border: 0 !important; background: transparent !important; padding: 0 !important; }
  .qt-items tr { break-inside: avoid; }
}
.qt-items input[type=number]::-webkit-outer-spin-button,
.qt-items input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

/* ---------- Hover helpers (DOM only, no re-render) ---------- */

const rowOn = (e) => (e.currentTarget.style.background = "#fcfcfc");
const rowOff = (e) => (e.currentTarget.style.background = "transparent");
const iconOn = (e) => {
  const danger = e.currentTarget.dataset.danger;
  e.currentTarget.style.background = danger ? "#fdecec" : GOLD_SOFT;
  e.currentTarget.style.color = danger ? RED : GOLD_DARK;
};
const iconOff = (e) => {
  e.currentTarget.style.background = "transparent";
  e.currentTarget.style.color = MUTED;
};
const focusOn = (e) => (e.currentTarget.style.borderColor = GOLD);
const focusOff = (e) => (e.currentTarget.style.borderColor = FIELD);
const dimOn = (e) => (e.currentTarget.style.filter = "brightness(.95)");
const dimOff = (e) => (e.currentTarget.style.filter = "none");

/* ---------- Icons (thin stroke, one size) ---------- */

const Icon = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICON = {
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  copy: "M9 9h11v11H9zM5 15H4V4h11v1",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  plus: "M12 5v14M5 12h14",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  columns: "M4 5h16v14H4zM10 5v14M16 5v14",
  box: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8",
};

/* ---------- Specs from the item name -> DB columns (cct, beamangle, cri, cutoutdia, lumens) ---------- */

const specsFromName = (name) => {
  const s = String(name || "");
  const pick = (re) => (s.match(re)?.[1] || "").trim();
  const cct =
    pick(/(tunable\s+\d{4}K\s*[–-]\s*\d{4}K)/i) ||
    pick(/available in\s+(\d{4}K(?:\s*\/\s*\d{4}K)+)/i) ||
    pick(/\b(\d{4}K)\s+(?:warm|neutral|natural|cool)\s+white/i);
  return {
    cct,
    beamangle: pick(/,\s*([^,]*?[°º][^,]*?)\s+beam\b/i),
    cri: pick(/\bCRI\s*([>≥<]?\s*\d+)/i).replace(/\s+/g, ""),
    cutoutdia: pick(/cut-out\s+([^,]+?)(?:\s*mm)?\s*(?:,|$)/i),
    lumens: pick(/,\s*([^,]*?lm(?:\s*\/\s*w|\s*per\s*LED)?)\s+output/i),
  };
};

/** Fill only the spec fields that are still empty on a row. */
const withSpecs = (row) => {
  const f = specsFromName(row.itemName);
  return {
    ...row,
    cct: row.cct || f.cct,
    beamangle: row.beamangle || f.beamangle,
    cri: row.cri || f.cri,
    cutoutdia: row.cutoutdia || f.cutoutdia,
    lumens: row.lumens || f.lumens,
  };
};

/* ---------- Money helpers ---------- */

const roundRupee = (value) => {
  const rupees = Math.floor(value);
  return value - rupees >= 0.5 ? rupees + 1 : rupees;
};
const calculateDiscount = (mrp, netPrice) => {
  const m = Number(mrp) || 0;
  if (!m) return 0;
  return +(((m - (Number(netPrice) || 0)) / m) * 100).toFixed(2);
};
const calculateNetPrice = (mrp, discount) =>
  roundRupee((Number(mrp) || 0) * (1 - (Number(discount) || 0) / 100));
const calculateAmount = (qty, netPrice) => roundRupee((Number(qty) || 0) * (Number(netPrice) || 0));

const money = (v) =>
  (Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const rupee = (v) => `₹${money(v)}`;
const plain = (v) => (Number(v) || 0).toLocaleString("en-IN");

/** Full URLs are used as-is; old relative paths (/uploads/...) get the API base URL in front. */
const imgSrc = (src, base = "") => {
  const v = String(src || "").trim();
  if (!v) return "";
  if (/^(https?:)?\/\//i.test(v) || v.startsWith("data:") || v.startsWith("blob:")) return v;
  return `${base || ""}${v.startsWith("/") ? "" : "/"}${v}`;
};

// remarks can come back as 0 / "0" from the API — don't show it
const hasText = (r) => r && String(r).trim() !== "" && String(r).trim() !== "0";

const EMPTY_NEW_ROW = {
  customerCode: "", customerDescription: "", itemCode: "", itemName: "",
  cus_itemcode: "", cus_itemname: "", brand: "", qty: "", unit: "", mrp: "",
  discount: "", amount: "", netPrice: "", image: "", remarks: "",
  cus_customercode: "", cus_customerdescription: "", cus_qty: "", cus_brand: "",
  cus_unit: "", cus_mrp: "", cus_discount: "", cus_netprice: "", cus_image: "", cus_remarks: "",
  cct: "", cctOptions: "", beamangle: "", cri: "", cutoutdia: "", lumens: "",
};

const COLUMN_LABELS = {
  Image: "Image",
  customerCode: "Customer code",
  customerDescription: "Customer description",
  ItemCode: "Item code",
  Brand: "Brand",
  Unit: "Unit",
  MRP: "MRP",
  Dist: "Discount",
  Specs: "Specs line",
};
const DEFAULT_COLUMNS = {
  Image: true, customerCode: false, customerDescription: false, ItemCode: true,
  Brand: true, Unit: true, MRP: true, Dist: true, Specs: true,
};

/* ---------- Small pieces ---------- */

/** Spec line under the item name: CCT · beam · CRI · cut-out · lumens */
const specText = (row) =>
  [
    row.cct && CCT_MAP[String(row.itemCode).toUpperCase()] ? `CCT ${row.cct}` : row.cct ? `CCT ${row.cct}` : "",
    row.beamangle && `Beam ${row.beamangle}`,
    row.cri && `CRI ${row.cri}`,
    row.cutoutdia && `Cut-out ${row.cutoutdia}`,
    row.lumens,
  ].filter(Boolean).join(" · ");

const QtyStepper = memo(({ value, onChange, label }) => (
  <span style={S.stepper} onFocus={focusOn} onBlur={focusOff}>
    <button type="button" className="no-print" style={S.stepBtn} aria-label={`Decrease ${label}`}
      onClick={() => onChange(Math.max(1, (Number(value) || 0) - 1))}>−</button>
    <input type="number" min="1" inputMode="numeric" style={S.stepInput} value={value ?? ""}
      aria-label={label} onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => !(Number(e.target.value) > 0) && onChange(1)} />
    <button type="button" className="no-print" style={S.stepBtn} aria-label={`Increase ${label}`}
      onClick={() => onChange((Number(value) || 0) + 1)}>+</button>
  </span>
));
QtyStepper.displayName = "QtyStepper";

const NumInput = memo(({ value, onChange, label, suffix }) => (
  <span style={{ position: "relative", display: "block" }}>
    <input type="number" min="0" step="0.01" inputMode="decimal" aria-label={label}
      style={{ ...S.cellInput, paddingRight: suffix ? 18 : 6 }} value={value ?? ""}
      onChange={(e) => onChange(e.target.value)} onFocus={(e) => { focusOn(e); e.target.select(); }} onBlur={focusOff} />
    {suffix && <span style={{ position: "absolute", right: 6, top: 7, color: MUTED, fontSize: 12, pointerEvents: "none" }}>{suffix}</span>}
  </span>
));
NumInput.displayName = "NumInput";

const ColumnMenu = ({ columns, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return (
    <div className="no-print" style={S.colWrap} ref={ref}>
      <button type="button" style={{ ...S.ghostBtn, color: open ? INK : MUTED }} aria-expanded={open}
        aria-haspopup="menu" onClick={() => setOpen((o) => !o)} title="Show or hide columns">
        <Icon d={ICON.columns} size={14} /> Columns
      </button>
      {open && (
        <div style={S.colMenu} role="menu">
          {Object.keys(COLUMN_LABELS).map((key) => (
            <label key={key} style={S.colItem}
              onMouseOver={(e) => (e.currentTarget.style.background = "#fafafa")}
              onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}>
              <input type="checkbox" style={{ accentColor: GOLD }} checked={!!columns[key]}
                onChange={() => onChange({ ...columns, [key]: !columns[key] })} />
              {COLUMN_LABELS[key]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const RowActions = ({ index, row, onEdit, onEditCustom, onDuplicate, onDelete }) => (
  <div className="no-print" style={S.actions}>
    <button type="button" style={S.iconBtn} onMouseOver={iconOn} onMouseOut={iconOff}
      onClick={() => (row.isCustom ? onEditCustom(index) : onEdit(index))}
      aria-label={`Edit ${row.itemCode}`} title="Edit">
      <Icon d={ICON.edit} />
    </button>
    <button type="button" style={S.iconBtn} onMouseOver={iconOn} onMouseOut={iconOff}
      onClick={() => onDuplicate(index)} aria-label={`Duplicate ${row.itemCode}`} title="Duplicate">
      <Icon d={ICON.copy} />
    </button>
    <button type="button" style={S.iconBtn} data-danger="1" onMouseOver={iconOn} onMouseOut={iconOff}
      onClick={() => onDelete(index)} aria-label={`Remove ${row.itemCode}`} title="Remove">
      <Icon d={ICON.trash} />
    </button>
  </div>
);

/* ================================================================== */

const QuotationTable = ({ items = [], onTotalAmountChange, onClose, onRowsChange }) => {
  const [rows, setRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCusAddModal, setShowCusAddModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [newRow, setNewRow] = useState(EMPTY_NEW_ROW);
  const [query, setQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [undo, setUndo] = useState(null); // { row, index }
  const [width, setWidth] = useState(1200);
  const rootRef = useRef(null);
  const nextId = useRef(1);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const inputRefs = {
    customerCode: useRef(null), customerDescription: useRef(null), itemCode: useRef(null),
    itemName: useRef(null), qty: useRef(null), brand: useRef(null), unit: useRef(null),
    mrp: useRef(null), discount: useRef(null), netPrice: useRef(null), remarks: useRef(null),
    cus_customercode: useRef(null), cus_customerdescription: useRef(null), cus_itemcode: useRef(null),
    cus_itemname: useRef(null), cus_qty: useRef(null), cus_brand: useRef(null), cus_unit: useRef(null),
    cus_mrp: useRef(null), cus_discount: useRef(null), cus_netprice: useRef(null),
    cus_image: useRef(null), cus_remarks: useRef(null), cct: useRef(null),
  };

  /* ---------- Layout: measure our own width (works inside any page / sidebar) ---------- */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const asCards = width < CARD_BELOW;
  const compact = width < COMPACT_BELOW;

  /* ---------- Load items passed in (restored draft) — once only ----------
     Once rows exist (loaded or added by hand) we never reload from `items`,
     otherwise deleting the last row would bring it straight back. */
  const loadedOnce = useRef(false);
  useEffect(() => {
    if (loadedOnce.current) return;
    if (rows.length > 0) { loadedOnce.current = true; return; }
    if (items.length > 0) {
      loadedOnce.current = true;
      const mapped = items.map((item) => {
        const mrp = Number(item.mrp) || 0;
        const net = Number(item.netPrice) || 0;
        const discount = item.discount !== undefined && item.discount !== "" ? Number(item.discount) : calculateDiscount(mrp, net);
        const netPrice = net || calculateNetPrice(mrp, discount);
        return withSpecs({
          ...item,
          id: nextId.current++,
          customerCode: item.customerCode || "",
          customerDescription: item.customerDescription || "",
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          brand: item.brand || "",
          qty: Number(item.qty) || 0,
          unit: item.unit || "Piece",
          mrp,
          discount,
          netPrice,
          amount: calculateAmount(item.qty, netPrice),
          image: item.image || "",
          remarks: item.remarks || "",
          cct: item.cct || "",
          cctOptions: item.cctOptions || "",
          beamangle: item.beamangle || "",
          cri: item.cri || "",
          cutoutdia: item.cutoutdia || "",
          lumens: item.lumens || "",
        });
      });
      setRows(mapped);
    }
  }, [items, rows.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        setProductList(
          data.map((item) => ({
            ...item,
            unit: item.unit || "Piece",
            itemcode: item.itemcode || "",
            brand: item.brand || "",
            price: item.price || "",
            thumbnail: item.thumbnail || "",
          }))
        );
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const totalAmount = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0), [rows]);
  const totalQty = useMemo(() => rows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0), [rows]);

  useEffect(() => {
    if (onRowsChange) onRowsChange(rows);
    if (onTotalAmountChange) onTotalAmountChange(totalAmount);
  }, [rows, onRowsChange, onTotalAmountChange, totalAmount]);

  /* ---------- Search + brand filter (keeps each row's real index) ---------- */
  const brands = useMemo(() => {
    const m = new Map();
    rows.forEach((r) => {
      const b = (r.brand || "").trim() || (r.isCustom ? "Custom" : "");
      if (b) m.set(b, (m.get(b) || 0) + 1);
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [rows]);

  const visible = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const compactWord = (w) => w.replace(/[^a-z0-9]/g, "");
    return rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => {
        const b = (row.brand || "").trim() || (row.isCustom ? "Custom" : "");
        if (brandFilter && b !== brandFilter) return false;
        if (!words.length) return true;
        const hay = `${row.itemCode} ${row.itemName} ${row.brand} ${row.customerCode} ${row.remarks}`.toLowerCase();
        const hayC = String(row.itemCode).toLowerCase().replace(/[^a-z0-9]/g, "");
        return words.every((w) => hay.includes(w) || (compactWord(w).length > 1 && hayC.includes(compactWord(w))));
      });
  }, [rows, query, brandFilter]);

  useEffect(() => {
    if (brandFilter && !brands.some(([b]) => b === brandFilter)) setBrandFilter("");
  }, [brands, brandFilter]);

  /* ---------- Fast inline edits ---------- */
  const updateRow = useCallback((index, field, value) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const next = { ...r, [field]: value };
        if (field === "qty") {
          next.amount = calculateAmount(value, r.netPrice);
        } else if (field === "discount") {
          const d = Math.min(100, Math.max(0, Number(value) || 0));
          if (Number(r.mrp) > 0) next.netPrice = calculateNetPrice(r.mrp, d);
          next.amount = calculateAmount(r.qty, next.netPrice);
        } else if (field === "netPrice") {
          next.discount = calculateDiscount(r.mrp, value);
          next.amount = calculateAmount(r.qty, value);
        }
        return next;
      })
    );
  }, []);

  const duplicateRow = useCallback((index) => {
    setRows((prev) => {
      const copy = { ...prev[index], id: nextId.current++ };
      const out = [...prev];
      out.splice(index + 1, 0, copy);
      return out;
    });
  }, []);

  const deleteRow = useCallback((index) => {
    setUndo({ row: rows[index], index });
    setRows((prev) => prev.filter((_, i) => i !== index));
  }, [rows]);

  const undoDelete = useCallback(() => {
    if (!undo) return;
    setRows((prev) => {
      const out = [...prev];
      out.splice(Math.min(undo.index, out.length), 0, undo.row);
      return out;
    });
    setUndo(null);
  }, [undo]);

  useEffect(() => {
    if (!undo) return;
    const t = setTimeout(() => setUndo(null), 6000);
    return () => clearTimeout(t);
  }, [undo]);

  /* ---------- Modal plumbing (unchanged behaviour) ---------- */
  const filterProducts = (field, value, products) =>
    products.filter((p) =>
      field === "itemCode"
        ? p.itemcode.toLowerCase().includes(value.toLowerCase())
        : p.itemname.toLowerCase().includes(value.toLowerCase())
    );

  const resetNewRow = () => setNewRow(EMPTY_NEW_ROW);

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => {
      const next = { ...prev, [field]: value };
      const mrp = Number(next.mrp);
      const net = Number(next.netPrice);
      const qty = Number(next.qty);
      if (["mrp", "netPrice"].includes(field)) {
        next.discount = calculateDiscount(mrp, net);
        next.amount = calculateAmount(qty, net);
      }
      if (field === "discount") {
        const computedNet = calculateNetPrice(mrp, Number(next.discount));
        next.netPrice = computedNet;
        next.amount = calculateAmount(qty, computedNet);
      }
      if (field === "qty") next.amount = calculateAmount(qty, net);
      return next;
    });
  };

  // The modal passes the finished row; called with no argument (Enter key) it uses newRow.
  const handleAddRow = (rowFromModal) => {
    const src = rowFromModal && typeof rowFromModal === "object" && rowFromModal.itemCode ? rowFromModal : newRow;
    const { itemCode, itemName, qty, mrp, netPrice, discount } = src;
    if (!itemCode || !itemName || !qty || !netPrice) {
      alert("Please fill in all required fields (Item Code, Item Name, Qty, Net Price).");
      return;
    }
    const parsedMrp = Number(mrp);
    const parsedNet = Number(netPrice);
    const parsedDisc = discount === "" ? calculateDiscount(parsedMrp, parsedNet) : Number(discount);
    const payload = withSpecs({
      ...src,
      mrp: parsedMrp,
      netPrice: parsedNet,
      discount: parsedDisc,
      amount: calculateAmount(Number(qty), parsedNet),
      qty: Number(qty),
      unit: src.unit || "Piece",
      isCustom: false,
    });
    if (editRowIndex !== null) {
      setRows((prev) => prev.map((row, i) => (i === editRowIndex ? { ...row, ...payload } : row)));
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, { ...payload, id: nextId.current++ }]);
    }
    resetNewRow();
    setShowAddModal(false);
  };

  const handleSubmitCustomRow = async (rowData, editIndex) => {
    const qty = Number(rowData.cus_qty);
    const mrp = Number(rowData.cus_mrp);
    const net = Number(rowData.cus_netprice);
    if (!rowData.cus_itemcode || !rowData.cus_itemname || !qty || !net) {
      alert("Please fill all required fields (Item code, Item name, Qty, Net price).");
      return;
    }
    const discount = rowData.cus_discount === "" || rowData.cus_discount === undefined
      ? calculateDiscount(mrp, net) : Number(rowData.cus_discount);
    const newRowData = withSpecs({
      id: editIndex !== null && editIndex !== undefined && rows[editIndex] ? rows[editIndex].id : nextId.current++,
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
      amount: calculateAmount(qty, net),
      image: rowData.cus_image || "",
      remarks: rowData.cus_remarks || "",
      isCustom: true,
    });
    if (editIndex !== null && editIndex !== undefined) {
      setRows((prev) => prev.map((row, i) => (i === editIndex ? newRowData : row)));
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, newRowData]);
    }
    resetNewRow();
    setShowCusAddModal(false);
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (nextField && inputRefs[nextField]?.current) inputRefs[nextField].current.focus();
    else if (showAddModal) handleAddRow();
    else if (showCusAddModal) handleSubmitCustomRow(newRow, editRowIndex);
  };

  const fillFromRow = (row) => ({
    ...EMPTY_NEW_ROW,
    customerCode: row.customerCode || "", customerDescription: row.customerDescription || "",
    itemCode: row.itemCode || "", itemName: row.itemName || "", brand: row.brand || "",
    qty: row.qty || "", unit: row.unit || "Piece", mrp: row.mrp || "", discount: row.discount || "",
    amount: row.amount || "", netPrice: row.netPrice || "", image: row.image || "", remarks: row.remarks || "",
    cus_customercode: row.customerCode || "", cus_customerdescription: row.customerDescription || "",
    cus_itemcode: row.itemCode || "", cus_itemname: row.itemName || "", cus_qty: row.qty || "",
    cus_brand: row.brand || "", cus_unit: row.unit || "Piece", cus_mrp: row.mrp || "",
    cus_discount: row.discount || "", cus_netprice: row.netPrice || "", cus_image: row.image || "",
    cus_remarks: row.remarks || "",
    cct: row.cct || "", cctOptions: row.cctOptions || "", beamangle: row.beamangle || "",
    cri: row.cri || "", cutoutdia: row.cutoutdia || "", lumens: row.lumens || "",
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
  const openAdd = () => { resetNewRow(); setEditRowIndex(null); setShowAddModal(true); };
  const openCustom = () => { resetNewRow(); setEditRowIndex(null); setShowCusAddModal(true); };

  /* ---------- Render helpers ---------- */
  const filtered = query || brandFilter;

  const itemCell = (row) => {
    const specs = columns.Specs ? specText(row) : "";
    const extra = compact
      ? [columns.Brand && row.brand, columns.Unit && row.unit, columns.MRP && Number(row.mrp) > 0 && `MRP ${plain(row.mrp)}`]
          .filter(Boolean).join(" · ")
      : "";
    const cust = [
      columns.customerCode && hasText(row.customerCode) && `Cust: ${row.customerCode}`,
      columns.customerDescription && hasText(row.customerDescription) && row.customerDescription,
    ].filter(Boolean).join(" · ");
    return (
      <>
        <div style={S.name}>
          {row.itemName}
          {row.isCustom && <span style={S.tag}>Custom</span>}
        </div>
        {(asCards || (!columns.ItemCode && row.itemCode)) && <div style={S.meta}>{row.itemCode}{asCards && row.brand ? ` · ${row.brand}` : ""}</div>}
        {extra && !asCards && <div style={S.meta}>{extra}</div>}
        {specs && <div style={S.meta}>{specs}</div>}
        {cust && <div style={S.meta}>{cust}</div>}
        {hasText(row.remarks) && <div style={S.note}>{row.remarks}</div>}
      </>
    );
  };

  const thumb = (row) =>
    row.image ? (
      <img src={imgSrc(row.image, API_URL)} alt="" loading="lazy" style={S.img}
        onError={(e) => (e.currentTarget.style.visibility = "hidden")} />
    ) : (
      <span style={{ ...S.imgEmpty, display: "block" }} aria-hidden="true" />
    );

  const actionProps = {
    onEdit: handleEditRow, onEditCustom: handleEditCustomRow, onDuplicate: duplicateRow, onDelete: deleteRow,
  };

  /* ---------- JSX ---------- */
  return (
    <section className="qt-items" style={S.root} ref={rootRef}>
      <style>{PRINT_CSS}</style>

      {/* Toolbar: search · brand chips · count · columns */}
      {rows.length > 0 && (
        <div className="no-print" style={S.bar}>
          <label style={S.search}>
            <Icon d={ICON.search} size={14} />
            <input type="search" style={S.searchInput} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items in this quotation…" aria-label="Search items" />
            {query && <button type="button" style={S.clear} onClick={() => setQuery("")} aria-label="Clear search">×</button>}
          </label>

          {brands.length > 1 && (
            <div style={S.chips} role="group" aria-label="Filter by brand">
              <button type="button" style={!brandFilter ? { ...S.chip, ...S.chipOn } : S.chip}
                aria-pressed={!brandFilter} onClick={() => setBrandFilter("")}>
                All<span style={S.chipCount}>{rows.length}</span>
              </button>
              {brands.map(([b, n]) => (
                <button key={b} type="button" style={brandFilter === b ? { ...S.chip, ...S.chipOn } : S.chip}
                  aria-pressed={brandFilter === b} onClick={() => setBrandFilter(brandFilter === b ? "" : b)}>
                  {b}<span style={S.chipCount}>{n}</span>
                </button>
              ))}
            </div>
          )}

          <div style={S.barRight}>
            <span style={S.count}>
              {filtered ? `${visible.length} of ${rows.length}` : `${rows.length} ${rows.length === 1 ? "item" : "items"}`} · {plain(totalQty)} pcs
            </span>
            {!asCards && <ColumnMenu columns={columns} onChange={setColumns} />}
          </div>
        </div>
      )}

      {/* ---------- Empty ---------- */}
      {rows.length === 0 && (
        <div style={S.emptyBox}>
          <div style={{ display: "inline-flex", color: "#c4c4c4", marginBottom: 6 }}><Icon d={ICON.box} size={28} /></div>
          <div style={{ color: INK, fontWeight: 600 }}>No items yet</div>
          <div>Add a product from the catalogue, or a custom item.</div>
        </div>
      )}

      {/* ---------- Cards (tablet / phone) ---------- */}
      {rows.length > 0 && asCards && (
        <div style={S.cards}>
          {visible.map(({ row, index }) => (
            <article key={row.id} style={S.card}>
              <div style={S.cardTop}>
                {columns.Image && thumb(row)}
                <div style={S.cardText}>{itemCell(row)}</div>
                <RowActions index={index} row={row} {...actionProps} />
              </div>
              <div style={S.cardEdit}>
                <span>
                  <span style={S.cardLabel}>Qty</span>
                  <QtyStepper value={row.qty} label={`Quantity for ${row.itemCode}`} onChange={(v) => updateRow(index, "qty", v)} />
                </span>
                {columns.Dist && (
                  <span>
                    <span style={S.cardLabel}>Disc</span>
                    <NumInput value={row.discount} suffix="%" label={`Discount for ${row.itemCode}`} onChange={(v) => updateRow(index, "discount", v)} />
                  </span>
                )}
                <span style={columns.Dist ? null : { gridColumn: "2 / -1" }}>
                  <span style={S.cardLabel}>Net price</span>
                  <NumInput value={row.netPrice} label={`Net price for ${row.itemCode}`} onChange={(v) => updateRow(index, "netPrice", v)} />
                </span>
              </div>
              <div style={S.cardFoot}>
                <span style={{ color: MUTED, fontSize: 12 }}>
                  #{index + 1}{columns.MRP && Number(row.mrp) > 0 ? ` · MRP ${plain(row.mrp)}` : ""} · {row.unit}
                </span>
                <span style={S.amount}>{rupee(row.amount)}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ---------- Table (desktop) — fixed layout, no sideways scroll ---------- */}
      {rows.length > 0 && !asCards && (
        <table style={S.table}>
          <colgroup>
            <col style={{ width: 34 }} />
            {columns.Image && <col style={{ width: 56 }} />}
            {columns.ItemCode && <col style={{ width: compact ? 92 : 110 }} />}
            <col />
            {!compact && columns.Brand && <col style={{ width: 90 }} />}
            {!compact && columns.Unit && <col style={{ width: 64 }} />}
            {!compact && columns.MRP && <col style={{ width: 84 }} />}
            <col style={{ width: 104 }} />
            {columns.Dist && <col style={{ width: 76 }} />}
            <col style={{ width: 96 }} />
            <col style={{ width: 108 }} />
            <col className="no-print" style={{ width: 100 }} />
          </colgroup>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              {columns.Image && <th style={S.th}><span style={S.srOnly}>Image</span></th>}
              {columns.ItemCode && <th style={S.th}>Code</th>}
              <th style={S.th}>Item</th>
              {!compact && columns.Brand && <th style={S.th}>Brand</th>}
              {!compact && columns.Unit && <th style={S.th}>Unit</th>}
              {!compact && columns.MRP && <th style={S.thNum}>MRP</th>}
              <th style={{ ...S.th, textAlign: "center" }}>Qty</th>
              {columns.Dist && <th style={S.thNum}>Disc</th>}
              <th style={S.thNum}>Net price</th>
              <th style={S.thNum}>Amount</th>
              <th className="no-print" style={S.th}><span style={S.srOnly}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ row, index }) => (
              <tr key={row.id} onMouseOver={rowOn} onMouseOut={rowOff}>
                <td style={S.tdMuted}>{index + 1}</td>
                {columns.Image && <td style={S.td}>{thumb(row)}</td>}
                {columns.ItemCode && <td style={S.td}><span style={S.code}>{row.itemCode}</span></td>}
                <td style={S.td}>{itemCell(row)}</td>
                {!compact && columns.Brand && <td style={S.tdMuted}>{row.brand}</td>}
                {!compact && columns.Unit && <td style={S.tdMuted}>{row.unit}</td>}
                {!compact && columns.MRP && <td style={{ ...S.tdNum, color: MUTED }}>{plain(row.mrp)}</td>}
                <td style={{ ...S.td, textAlign: "center" }}>
                  <QtyStepper value={row.qty} label={`Quantity for ${row.itemCode}`} onChange={(v) => updateRow(index, "qty", v)} />
                </td>
                {columns.Dist && (
                  <td style={S.td}>
                    <NumInput value={row.discount} suffix="%" label={`Discount for ${row.itemCode}`} onChange={(v) => updateRow(index, "discount", v)} />
                  </td>
                )}
                <td style={S.td}>
                  <NumInput value={row.netPrice} label={`Net price for ${row.itemCode}`} onChange={(v) => updateRow(index, "netPrice", v)} />
                </td>
                <td style={{ ...S.tdNum, ...S.amount }}>{money(row.amount)}</td>
                <td className="no-print" style={S.td}>
                  <RowActions index={index} row={row} {...actionProps} />
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td style={S.empty} colSpan={20}>No items match. <button type="button" style={{ ...S.clear, color: GOLD_DARK, fontSize: 13, fontWeight: 600 }} onClick={() => { setQuery(""); setBrandFilter(""); }}>Clear filters</button></td></tr>
            )}
          </tbody>
        </table>
      )}

      {rows.length > 0 && asCards && visible.length === 0 && (
        <div style={S.empty}>No items match. <button type="button" style={{ ...S.clear, color: GOLD_DARK, fontSize: 13, fontWeight: 600 }} onClick={() => { setQuery(""); setBrandFilter(""); }}>Clear filters</button></div>
      )}

      {/* ---------- Subtotal ---------- */}
      {rows.length > 0 && (
        <div style={S.total}>
          <span>Subtotal{filtered ? " (all items)" : ""}</span>
          <span style={S.totalValue}>{rupee(totalAmount)}</span>
        </div>
      )}

      {/* ---------- Add ---------- */}
      <div className="no-print" style={S.add}>
        <button type="button" style={S.addBtn} onMouseOver={dimOn} onMouseOut={dimOff} onClick={openAdd}>
          <Icon d={ICON.plus} /> Add product
        </button>
        <button type="button" style={S.addGhost} onClick={openCustom}
          onMouseOver={(e) => (e.currentTarget.style.background = "#fafafa")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}>
          <Icon d={ICON.plus} /> Custom item
        </button>
      </div>

      {/* ---------- Undo ---------- */}
      {undo && (
        <div className="no-print" style={S.undo} role="status">
          <span>Removed {undo.row.itemCode || "item"}</span>
          <button type="button" style={S.undoBtn} onClick={undoDelete}>Undo</button>
        </div>
      )}

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
  onClose: PropTypes.func,
  onRowsChange: PropTypes.func,
};

export default QuotationTable;