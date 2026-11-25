"use client";
import QuotationInfo from "../components/QuotaionInfo";
import CustomerModal from "../components/customerModal";
import QuotationTable from "../components/QuotationTable";
import GSTCalculator from "../components/GSTCalculator";
import AddProductModal from "../components/AddProductModal";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

const EMPTY_ROW = {
  customerCode: "",
  customerDescription: "",
  itemCode: "",
  itemName: "",
  brand: "",
  qty: "",
  unit: "",
  mrp: "",
  discount: "",
  amount: "",
  netPrice: "",
  image: "",
  remarks: "",
};

const DEFAULT_WARRANTY = "As per company norms";

const roundRupee = (value) => {
  const rupees = Math.floor(value);
  const paise = value - rupees;
  return paise >= 0.5 ? rupees + 1 : rupees;
};

/* ---------- Styles (inline, created once — same look as the Edit Quotation page) ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const GOLD_SOFT = "#fbf5e9";
const LINE = "#eeeeee";
const MUTED = "#8a8a8a";
const INK = "#222";

const TERMS = [
  ["GST", "Included in above prices as applicable."],
  ["Payment terms", "100% in advance with order."],
  ["Validity", "15 days from the date of quotation."],
  // Warranty goes here (editable, see below)
  ["Responsibility", "Our responsibility for material counting ceases immediately after delivery."],
  ["Installation & fixing", "If required, for any electrical job, we will arrange a technician at extra cost. Installation will take 4-5 days from the date of order."],
  ["Freight charges", "Extra as per actual."],
  ["Bank details", "PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar."],
];

const S = {
  page: {
    minHeight: "100vh", padding: "24px 12px", background: "#f5f5f4",
    fontFamily: "Arial, Helvetica, sans-serif", color: INK, fontSize: 13, lineHeight: 1.5,
    boxSizing: "border-box",
  },
  sheet: {
    maxWidth: 1040, margin: "0 auto", padding: "28px 28px 24px", background: "#fff",
    borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.04)",
    boxSizing: "border-box",
  },
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  logo: { height: 52, width: "auto", display: "block" },
  docTitle: { margin: 0, color: GOLD, fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", textAlign: "right" },
  metaList: { display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    display: "inline-flex", alignItems: "center", gap: 4, height: 24, padding: "0 10px",
    borderRadius: 999, background: "#f6f6f6", color: MUTED, fontSize: 11, whiteSpace: "nowrap",
  },
  chipValue: { color: INK, fontWeight: 700 },
  rule: { height: 1, margin: "20px 0", border: 0, background: LINE },
  parties: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  party: { position: "relative", padding: "12px 14px", border: `1px solid ${LINE}`, borderRadius: 10 },
  partyEmpty: { borderStyle: "dashed", borderColor: "#e0d2a8", background: "#fffdf7" },
  partyTop: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  partyLabel: { color: MUTED, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  partyName: { marginBottom: 2, fontSize: 14, fontWeight: 700 },
  partyLine: { color: "#555", fontSize: 12 },
  partyKey: { color: MUTED },
  editBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, height: 26, padding: "0 10px",
    border: `1px solid #e3e3e3`, borderRadius: 7, background: "#fff", color: MUTED,
    font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  pickBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 32, marginTop: 4, padding: "0 14px",
    border: 0, borderRadius: 8, background: GOLD, color: "#fff",
    font: "inherit", fontSize: 12, fontWeight: 700, cursor: "pointer",
  },
  subject: { display: "flex", alignItems: "center", gap: 6, margin: "16px 0 12px", fontSize: 13 },
  subjectKey: { color: MUTED },
  subjectValue: { fontWeight: 700 },
  linkBtn: {
    border: 0, padding: 0, background: "transparent", color: GOLD_DARK,
    font: "inherit", fontSize: 12, fontWeight: 600, cursor: "pointer",
  },
  tableWrap: { marginBottom: 16 },
  footer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" },
  label: { display: "block", marginBottom: 4, color: MUTED, fontSize: 11, fontWeight: 600 },
  textarea: {
    width: "100%", minHeight: 64, padding: "8px 10px", border: `1px solid #e3e3e3`, borderRadius: 8,
    outline: "none", resize: "vertical", font: "inherit", fontSize: 13, color: INK, boxSizing: "border-box",
  },
  printText: { whiteSpace: "pre-wrap", color: "#555" },
  thanks: { margin: "4px 0 14px", color: "#555", fontStyle: "italic" },
  termsTitle: { margin: "0 0 8px", fontSize: 13, fontWeight: 700 },
  terms: { display: "grid", gridTemplateColumns: "160px 1fr", columnGap: 16, rowGap: 6, margin: 0 },
  termKey: { color: MUTED, fontSize: 12 },
  termVal: { margin: 0, fontSize: 12 },
  closing: { marginTop: 14, color: "#555", fontSize: 12 },
  fineprint: { marginTop: 16, paddingTop: 12, borderTop: `1px solid ${LINE}`, color: MUTED, fontSize: 11 },
  // Sticky (not fixed): stays inside the page column, so it never covers the sidebar
  // or spills off the screen on tablets; it sits at the bottom while you scroll.
  bar: {
    position: "sticky", bottom: 12, zIndex: 20, maxWidth: 1040, margin: "12px auto 0",
    display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, padding: 8,
    background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12,
    boxShadow: "0 6px 24px rgba(0,0,0,.10)", boxSizing: "border-box",
  },
  barInfo: { flex: "1 1 auto", minWidth: 0, padding: "0 6px", color: MUTED, fontSize: 12 },
  barTotal: { color: INK, fontWeight: 700 },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px",
    border: `1px solid #e3e3e3`, borderRadius: 8, background: "#fff", color: INK,
    font: "inherit", fontWeight: 600, cursor: "pointer",
  },
  btnPrimary: { borderColor: GOLD, background: GOLD, color: "#fff" },
};

const PRINT_CSS = `
  @media print {
    @page { size: A4 landscape; margin: 10mm; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .qt-page { padding: 0 !important; background: #fff !important; }
    .qt-sheet { max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
    .qt-party { border-style: solid !important; background: #fff !important; }
  }
  .print-only { display: none; }
  @media (max-width: 640px) {
    .qt-sheet { padding: 18px 14px !important; }
    .qt-bar { bottom: 8px !important; }
    .qt-bar-info { flex-basis: 100% !important; text-align: center; }
    .qt-bar-btn { flex: 1 1 0 !important; justify-content: center; }
  }
`;

const focusOn = (e) => (e.currentTarget.style.borderColor = GOLD);
const focusOff = (e) => (e.currentTarget.style.borderColor = "#e3e3e3");
const softOn = (e) => { e.currentTarget.style.background = GOLD_SOFT; e.currentTarget.style.color = GOLD_DARK; };
const softOff = (e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.color = MUTED; };
const dimOn = (e) => (e.currentTarget.style.filter = "brightness(.95)");
const dimOff = (e) => (e.currentTarget.style.filter = "none");

const Icon = ({ d, size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICON = {
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0",
  print: "M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6H7z",
  save: "M12 16V4M7 9l5-5 5 5M5 20h14",
};

const money = (v) => `₹${(Number(v) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

/* ================================================================== */

const Quotation = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [infoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quotationInfo, setQuotationInfo] = useState(null);
  const [quotationId, setQuotationId] = useState(1);
  const [quotationSequence, setQuotationSequence] = useState(null);
  const [rowsData, setRowsData] = useState([]);
  const [gstDetails, setGstDetails] = useState({
    gstAmount: 0,
    totalWithGST: 0,
    withoutGST: 0,
    gst_percentage: 18,
    gst_type: "include",
    additional_discount_percentage: 0,
    additional_discount_amount: 0,
    amount_after_discount: 0,
  });
  const [remarks, setRemarks] = useState("");
  const [warrantyGuarantee, setWarrantyGuarantee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // ---- Add Product modal state ----
  const [showAddModal, setShowAddModal] = useState(false);
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [newRow, setNewRow] = useState(EMPTY_ROW);

  // Refs used by the modal for Enter-key navigation
  const inputRefs = useRef({
    customerCode: { current: null },
    customerDescription: { current: null },
    qty: { current: null },
    discount: { current: null },
    netPrice: { current: null },
    remarks: { current: null },
  }).current;

  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      try {
        setUserDetails(JSON.parse(userDetailsCookie));
      } catch (err) {
        console.error("Invalid cookie JSON:", err);
      }
    }
  }, []);

  /** One quotation item -> API payload.
   *  Line GST is worked out from the quotation's GST type / % so the per-item
   *  amount_including_gst, without_gst, gst_amount and amount_with_gst are filled too. */
  const generateItemData = useCallback(({ quotationId, item, warranty, position, gst }) => {
    const net = roundRupee(parseFloat(item.netPrice) || 0);
    const qty = parseInt(item.qty, 10) || 0;
    const amount = net * qty;

    const pct = (Number(gst?.gst_percentage) || 0) / 100;
    const included = (gst?.gst_type || "include") === "include";
    const withoutGst = included ? amount / (1 + pct) : amount;
    const gstAmount = included ? amount - withoutGst : amount * pct;
    const withGst = withoutGst + gstAmount;

    const text = (v) => (v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim());

    return {
      quotation_id: quotationId,
      product_id: item.itemCode,
      customercode: item.customerCode || "0",
      customerdescription: item.customerDescription || "0",
      image: item.image || "",
      itemcode: item.itemCode,
      brand: item.brand || "N/A",
      mrp: parseFloat(item.mrp) || 0,
      netPrice: net,
      price: net,
      position,
      quantity: qty,
      discount: parseFloat(item.discount) || 0,
      item_name: item.itemName || "N/A",
      unit: item.unit || "pcs",
      amount,
      amount_including_gst: Math.round(withGst),
      without_gst: Math.round(withoutGst),
      gst_amount: Math.round(gstAmount),
      amount_with_gst: Math.round(withGst),
      // specs (filled by AddProductModal / QuotationTable from the product sheet or item name)
      cct: text(item.cct),
      beamangle: text(item.beamangle),
      cri: text(item.cri),
      cutoutdia: text(item.cutoutdia),
      lumens: text(item.lumens),
      warranty_guarantee: warranty || DEFAULT_WARRANTY,
      // item note typed in the Add item modal — sent under both names the API might use
      remarks: text(item.remarks),
      comments: item.comments || item.remarks || "N/A",
      status: "active",
    };
  }, []);

  // ---- Add Product handlers ----
  const handleFieldChange = useCallback((field, value) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Enter moves to the next field (falls back to Qty if a field isn't in the modal)
  const handleKeyDown = useCallback(
    (e, next) => {
      if (e.key !== "Enter" || !next) return;
      e.preventDefault();
      (inputRefs[next]?.current || inputRefs.qty.current)?.focus();
    },
    [inputRefs]
  );

  const handleAddRow = useCallback((row, index) => {
    setRowsData((prev) =>
      index !== null && index !== undefined ? prev.map((r, i) => (i === index ? row : r)) : [...prev, row]
    );
  }, []);

  // ---- Other callbacks ----
  const handleQuotationConfirm = useCallback((data) => setQuotationInfo(data), []);
  const closeModal = useCallback(() => setShowModalClientDetails(false), []);
  const handleTotalAmountChange = useCallback((v) => setTotalAmount(v), []);
  const handleRowsChange = useCallback((rows) => setRowsData(rows), []);
  const handleClientConfirm = useCallback((c) => setSelectedCustomer(c), []);

  // Guard against GSTCalculator reporting the same values again (prevents a render loop)
  const lastGstRef = useRef(null);
  const handleGSTChange = useCallback((details) => {
    const next = JSON.stringify(details);
    if (lastGstRef.current === next) return;
    lastGstRef.current = next;
    setGstDetails((prev) => ({ ...prev, ...details }));
  }, []);

  const generateQuotationNumber = useMemo(() => {
    if (quotationSequence === null) return "PLQOT-…";
    return `PLQOT-${quotationSequence.toString().padStart(3, "0")}`;
  }, [quotationSequence]);

  // Fetch last quotation data -> next PLQOT number
  useEffect(() => {
    const fetchLastQuotationData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/quotation/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const quotations = await response.json();
        if (quotations?.length > 0) {
          const lastSequence = quotations
            .map((v) => {
              const match = v.quotation_no?.match(/^PLQOT-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);
          setQuotationSequence(lastSequence + 1);
          setQuotationId(quotations.length + 1);
        } else {
          setQuotationId(1);
          setQuotationSequence(1);
        }
      } catch (error) {
        console.error("Error fetching quotations:", error);
        setQuotationId(1);
        setQuotationSequence(1);
        toast.error("Failed to load quotation data. Using default sequence.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLastQuotationData();
  }, []);

  /** Saves the quotation and its items to the API. */
  const handleSaveQuotation = useCallback(async () => {
    if (quotationSequence === null || isLoading || isSaving) {
      toast.warning("Please wait while the quotation is being processed.");
      return;
    }
    if (rowsData.length === 0) {
      toast.warning("Add at least one product before publishing.");
      return;
    }

    setIsSaving(true);
    try {
      for (const item of rowsData) {
        if (!item.itemCode || !item.itemName || !item.amount || isNaN(item.amount)) {
          throw new Error(`Invalid item data: ${item.itemName || "Unknown item"}`);
        }
      }

      const quotationData = {
        quotation_no: generateQuotationNumber,
        salesperson: quotationInfo?.Salesperson || userDetails?.name || "System",
        subject: quotationInfo?.Subject || "Quotation for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST) || 0,
        without_gst: Math.round(gstDetails.withoutGST) || 0,
        gst_amount: Math.round(gstDetails.gstAmount) || 0,
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
        gst_type: gstDetails.gst_type || "include",
        gst_percentage: gstDetails.gst_percentage || 18,
        final_amount: Math.round(gstDetails.totalWithGST) || 0,
        warranty_guarantee: warrantyGuarantee || DEFAULT_WARRANTY,
        remarks: remarks.trim() || "N/A",
        date: new Date().toISOString().slice(0, 10),
        status: "active",
        client_id: selectedCustomer?.id || 3,
        created_by: userDetails?.name || "System",
        created_at: new Date().toISOString(),
        additional_discount_percentage: gstDetails.additional_discount_percentage || 0,
        additional_discount_amount: gstDetails.additional_discount_amount || 0,
        amount_after_discount: gstDetails.amount_after_discount || 0,
      };

      const response = await axios.post(`${API_URL}/quotation/`, quotationData, {
        headers: { "Content-Type": "application/json" },
      });
      const savedQuotationId = response.data.quotation_id;

      await Promise.all(
        rowsData.map((item, index) =>
          axios.post(
            `${API_URL}/quotation/${savedQuotationId}/items/`,
            generateItemData({
              quotationId: savedQuotationId,
              item,
              warranty: warrantyGuarantee,
              position: index,
              gst: gstDetails,
            }),
            { headers: { "Content-Type": "application/json" } }
          )
        )
      );

      setQuotationSequence((prev) => prev + 1);
      setQuotationId((prev) => prev + 1);
      toast.success("Quotation saved successfully!");
      window.location.href = "/getquotation";
    } catch (error) {
      console.error("Error saving quotation:", error);
      if (error.response?.status === 500) {
        toast.error(`Failed to save quotation: ${error.response.data.detail || "Server error. Please check the data and try again."}`);
      } else if (error.response?.status === 422) {
        const details = error.response.data.detail;
        toast.error(`Failed to save quotation: ${details?.[0]?.msg || "Invalid data provided. Please check item details."}`);
      } else {
        toast.error(`Failed to save quotation: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    quotationSequence, isLoading, isSaving, generateQuotationNumber, quotationInfo, userDetails,
    gstDetails, warrantyGuarantee, remarks, selectedCustomer, rowsData, generateItemData, API_URL,
  ]);

  const today = useMemo(() => new Date().toLocaleDateString("en-GB"), []);
  const salesperson = quotationInfo?.Salesperson || userDetails?.name || "";
  const grandTotal = gstDetails.totalWithGST || totalAmount;

  return (
    <div className="qt-page" style={S.page}>
      <style>{PRINT_CSS}</style>

      <div className="qt-sheet" style={S.sheet} id="tm_download_section">
        {/* ---------- Header ---------- */}
        <header style={S.head}>
          <img src="/assets/img/panviclogo.jpg" alt="Panvik Lighting" style={S.logo} loading="lazy" />
          <div>
            <h1 style={S.docTitle}>QUOTATION</h1>
            <div style={S.metaList}>
              <span style={S.chip}>No. <span style={S.chipValue}>{generateQuotationNumber}</span></span>
              <span style={S.chip}>Date <span style={S.chipValue}>{today}</span></span>
            </div>
          </div>
        </header>

        <hr style={S.rule} />

        {/* ---------- Customer / Company ---------- */}
        <section style={S.parties}>
          <div className="qt-party" style={{ ...S.party, ...(selectedCustomer ? null : S.partyEmpty) }}>
            <div style={S.partyTop}>
              <span style={S.partyLabel}>Quotation for</span>
              {selectedCustomer && (
                <button type="button" className="no-print" style={S.editBtn}
                  onMouseOver={softOn} onMouseOut={softOff}
                  onClick={() => setShowModalClientDetails(true)} aria-label="Change customer">
                  <Icon d={ICON.edit} size={13} /> Change
                </button>
              )}
            </div>
            {selectedCustomer ? (
              <>
                <div style={S.partyName}>{selectedCustomer.client_name || "—"}</div>
                <div style={S.partyLine}><span style={S.partyKey}>City: </span>{selectedCustomer.city || "—"}</div>
              </>
            ) : (
              <>
                <div style={{ ...S.partyLine, color: MUTED, marginBottom: 6 }}>No customer selected yet</div>
                <button type="button" className="no-print" style={S.pickBtn}
                  onMouseOver={dimOn} onMouseOut={dimOff}
                  onClick={() => setShowModalClientDetails(true)}>
                  <Icon d={ICON.user} size={14} /> Select customer
                </button>
              </>
            )}
          </div>

          <div className="qt-party" style={S.party}>
            <div style={S.partyTop}>
              <span style={S.partyLabel}>From</span>
              <button type="button" className="no-print" style={S.editBtn}
                onMouseOver={softOn} onMouseOut={softOff}
                onClick={() => setInfoModal(true)} aria-label="Edit salesperson and subject">
                <Icon d={ICON.edit} size={13} /> Edit
              </button>
            </div>
            <div style={S.partyName}>PANVIK LIGHTING</div>
            <div style={S.partyLine}>Nakodar Road, beside Silver Oak Apartments, Jalandhar City, Punjab-144003</div>
            <div style={S.partyLine}><span style={S.partyKey}>GST: </span>03ADWPG0246P1Z8</div>
            <div style={S.partyLine}><span style={S.partyKey}>Phone: </span>94172-81252, 98150-37755</div>
            <div style={S.partyLine}><span style={S.partyKey}>Email: </span>panviklighting@gmail.com</div>
            <div style={S.partyLine}>
              <span style={S.partyKey}>Salesperson: </span>{salesperson || "—"}
              {userDetails?.phone && <> · {userDetails.phone}</>}
            </div>
          </div>
        </section>

        {infoModal && <QuotationInfo setInfoModal={setInfoModal} onConfirm={handleQuotationConfirm} />}
        {showModalClientDetails && (
          <CustomerModal onClose={closeModal} client={showModalClientDetails} onConfirm={handleClientConfirm} />
        )}

        {/* ---------- Subject ---------- */}
        <p style={S.subject}>
          <span style={S.subjectKey}>Subject</span>
          {quotationInfo?.Subject ? (
            <span style={S.subjectValue}>{quotationInfo.Subject}</span>
          ) : (
            <>
              <span style={{ color: MUTED }}>Quotation for Products/Services</span>
              <button type="button" className="no-print" style={S.linkBtn} onClick={() => setInfoModal(true)}>
                · Add subject
              </button>
            </>
          )}
        </p>

        {/* ---------- Items ---------- */}
        <div style={S.tableWrap}>
          <QuotationTable items={rowsData} onRowsChange={handleRowsChange} onTotalAmountChange={handleTotalAmountChange} />

          {/* Kept for compatibility — QuotationTable opens its own Add product modal */}
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
          />
        </div>

        {/* ---------- Remarks + GST ---------- */}
        <section style={S.footer}>
          <div>
            <label style={S.label} htmlFor="qt-remarks">Remarks</label>
            <textarea id="qt-remarks" className="no-print" style={S.textarea}
              placeholder="Add a note for the client (optional)"
              value={remarks} onChange={(e) => setRemarks(e.target.value)}
              onFocus={focusOn} onBlur={focusOff} />
            {remarks && <div className="print-only" style={S.printText}>{remarks}</div>}
          </div>
          <div>
            <GSTCalculator totalAmount={totalAmount} onGSTChange={handleGSTChange} />
          </div>
        </section>

        <hr style={S.rule} />

        {/* ---------- Terms ---------- */}
        <p style={S.thanks}>Thank you for considering us for your needs. Here is the proposal as you requested.</p>

        <h2 style={S.termsTitle}>Terms and conditions</h2>
        <dl style={S.terms}>
          {TERMS.slice(0, 3).map(([k, v]) => (
            <React.Fragment key={k}><dt style={S.termKey}>{k}</dt><dd style={S.termVal}>{v}</dd></React.Fragment>
          ))}

          <dt style={S.termKey}>Warranty / guarantee</dt>
          <dd style={S.termVal}>
            <textarea className="no-print" style={{ ...S.textarea, minHeight: 36 }}
              placeholder="As per company norms (type to change)"
              value={warrantyGuarantee} onChange={(e) => setWarrantyGuarantee(e.target.value)}
              onFocus={focusOn} onBlur={focusOff} />
            <span className="print-only">{warrantyGuarantee || `${DEFAULT_WARRANTY}.`}</span>
          </dd>

          {TERMS.slice(3).map(([k, v]) => (
            <React.Fragment key={k}><dt style={S.termKey}>{k}</dt><dd style={S.termVal}>{v}</dd></React.Fragment>
          ))}
        </dl>

        <p style={S.closing}>
          We hope you will find our offer suitable and look forward to your positive response.
          Please feel free to contact us for any queries.
        </p>
        <p style={S.fineprint}>
          For: Panvik Lighting. This is a computer-generated document, hence signature is not required.
        </p>
      </div>

      {/* ---------- Floating actions ---------- */}
      <div className="no-print qt-bar" style={S.bar}>
        <span className="qt-bar-info" style={S.barInfo}>
          {rowsData.length} {rowsData.length === 1 ? "item" : "items"} · <span style={S.barTotal}>{money(grandTotal)}</span>
        </span>
        <button type="button" className="qt-bar-btn" style={S.btn} onClick={() => window.print()}>
          <Icon d={ICON.print} /> Print
        </button>
        <button type="button" id="tm_download_btn" className="qt-bar-btn"
          style={{ ...S.btn, ...S.btnPrimary, opacity: isSaving || isLoading ? 0.7 : 1 }}
          onClick={handleSaveQuotation} disabled={isSaving || isLoading}
          onMouseOver={dimOn} onMouseOut={dimOff}>
          <Icon d={ICON.save} /> {isSaving ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default Quotation;