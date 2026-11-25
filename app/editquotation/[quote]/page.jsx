"use client";
import InvoucherTable from "../../components/InvoucherTable";
import QuotaionInfo from "../../components/QuotaionInfo";
import CustomerModal from "../../components/customerModal";
import EdiQuotatTable from "../../components/EditQuotatTable";
import GSTCalculator from "../../components/GSTCalculator";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

/* ---------- Styles (inline, created once — same palette as the modals) ---------- */

const GOLD = "#d3a01d";
const GOLD_DARK = "#b98912";
const LINE = "#eeeeee";
const MUTED = "#8a8a8a";
const INK = "#222";

const DEFAULT_WARRANTY = "1 year warranty against manufacturing defects";

const TERMS = [
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
  // header
  head: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" },
  logo: { height: 52, width: "auto", display: "block" },
  docTitle: { margin: 0, color: GOLD, fontSize: 26, fontWeight: 700, letterSpacing: "0.08em", textAlign: "right" },
  metaList: { display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 6, marginTop: 6 },
  chip: {
    display: "inline-flex", alignItems: "center", gap: 4, height: 24, padding: "0 10px",
    borderRadius: 999, background: "#f6f6f6", color: MUTED, fontSize: 11, whiteSpace: "nowrap",
  },
  chipValue: { color: INK, fontWeight: 700 },
  chipNext: { background: "#fbf5e9", color: GOLD_DARK },
  rule: { height: 1, margin: "20px 0", border: 0, background: LINE },
  // parties
  parties: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 },
  party: { padding: "12px 14px", border: `1px solid ${LINE}`, borderRadius: 10 },
  partyLabel: { marginBottom: 6, color: MUTED, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" },
  partyName: { marginBottom: 2, fontSize: 14, fontWeight: 700 },
  partyLine: { color: "#555", fontSize: 12 },
  partyKey: { color: MUTED },
  subject: { margin: "16px 0 12px", fontSize: 13 },
  subjectKey: { color: MUTED, marginRight: 6 },
  subjectValue: { fontWeight: 700 },
  // table + totals
  tableWrap: { marginBottom: 16 },
  footer: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, alignItems: "start" },
  label: { display: "block", marginBottom: 4, color: MUTED, fontSize: 11, fontWeight: 600 },
  textarea: {
    width: "100%", minHeight: 64, padding: "8px 10px", border: `1px solid #e3e3e3`, borderRadius: 8,
    outline: "none", resize: "vertical", font: "inherit", fontSize: 13, color: INK, boxSizing: "border-box",
  },
  printText: { whiteSpace: "pre-wrap", color: "#555" },
  // terms
  thanks: { margin: "4px 0 14px", color: "#555", fontStyle: "italic" },
  termsTitle: { margin: "0 0 8px", fontSize: 13, fontWeight: 700 },
  terms: { display: "grid", gridTemplateColumns: "160px 1fr", columnGap: 16, rowGap: 6, margin: 0 },
  termKey: { color: MUTED, fontSize: 12 },
  termVal: { margin: 0, fontSize: 12 },
  closing: { marginTop: 14, color: "#555", fontSize: 12 },
  fineprint: { marginTop: 16, paddingTop: 12, borderTop: `1px solid ${LINE}`, color: MUTED, fontSize: 11 },
  // action bar
  // Sticky (not fixed): stays inside the page column, so it never covers the sidebar
  bar: {
    position: "sticky", bottom: 12, zIndex: 20, maxWidth: 1040, margin: "12px auto 0",
    display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 8, padding: 8,
    background: "#fff", border: `1px solid ${LINE}`, borderRadius: 12,
    boxShadow: "0 6px 24px rgba(0,0,0,.10)", boxSizing: "border-box",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 6, height: 36, padding: "0 16px",
    border: `1px solid #e3e3e3`, borderRadius: 8, background: "#fff", color: INK,
    font: "inherit", fontWeight: 600, cursor: "pointer",
  },
  btnPrimary: { borderColor: GOLD, background: GOLD, color: "#fff" },
  loading: { padding: 40, color: MUTED, textAlign: "center", fontFamily: "Arial, Helvetica, sans-serif" },
};

const PRINT_CSS = `
  @media print {
    @page { size: A4 landscape; margin: 10mm; }
    .no-print { display: none !important; }
    .print-only { display: block !important; }
    .qt-page { padding: 0 !important; background: #fff !important; }
    .qt-sheet { max-width: none !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
  }
  .print-only { display: none; }
  @media (max-width: 640px) {
    .qt-sheet { padding: 18px 14px !important; }
    .qt-bar-btn { flex: 1 1 0 !important; justify-content: center; }
  }
`;

const focusOn = (e) => (e.currentTarget.style.borderColor = GOLD);
const focusOff = (e) => (e.currentTarget.style.borderColor = "#e3e3e3");
const dimOn = (e) => (e.currentTarget.style.filter = "brightness(.95)");
const dimOff = (e) => (e.currentTarget.style.filter = "none");

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const PRINT_ICON = "M7 8V4h10v4M7 17H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v6H7z";
const SAVE_ICON = "M12 16V4M7 9l5-5 5 5M5 20h14";

/* ================================================================== */

const EditQuotation = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [FiltercolModal, setFiltercolModal] = useState(false);
  const [ShowHideFiltercolModal, setShowHideFilterModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quotationInfo, setQuotationInfo] = useState(null);
  const [quotationId, setQuotationId] = useState(1);
  const [rowsData, setRowsData] = useState([]);
  const [saving, setSaving] = useState(false);

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
  const [warrantyGuarantee, setWarrantyGuarantee] = useState(DEFAULT_WARRANTY);

  const { quote } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  /* -------------------- Load quotation + client -------------------- */
  useEffect(() => {
    if (!quote) return;

    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`${API_URL}/quotation/${quote}`, { withCredentials: true });

        if (response.data) {
          setQuotation(response.data);
          setRemarks(response.data.remarks || "");
          setWarrantyGuarantee(response.data.warranty_guarantee || DEFAULT_WARRANTY);

          // Set gstDetails once from API — GSTCalculator takes over after this
          setGstDetails({
            gstAmount: response.data.gst_amount || 0,
            totalWithGST: response.data.amount_with_gst || 0,
            withoutGST: response.data.without_gst || 0,
            gst_percentage: response.data.gst_percentage ?? 18,
            gst_type: response.data.gst_type ?? "include",
            additional_discount_percentage: response.data.additional_discount_percentage || 0,
            additional_discount_amount: response.data.additional_discount_amount || 0,
            amount_after_discount: response.data.amount_after_discount || 0,
          });

          if (response.data.client_id) fetchClient(response.data.client_id);
        } else {
          toast.error("No quotation found!");
        }
      } catch {
        toast.error("Failed to load quotation!");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quote]);

  const fetchClient = async (client_id) => {
    try {
      const response = await axios.get(`${API_URL}/clients/`, { withCredentials: true });
      const filteredClient = response.data.find((c) => c.id === client_id);
      if (filteredClient) setClient(filteredClient);
      else toast.error("Client not found!");
    } catch {
      toast.error("Failed to load client details!");
    }
  };

  /* -------------------- Handlers (stable references) -------------------- */

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

  const closeModal = useCallback(() => {
    setShowModalClientDetails(false);
    setShowHideFilterModal(false);
  }, []);

  /* -------------------- SAVE QUOTATION -------------------- */
  const handleSaveQuotation = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const quotationData = {
        quotation_no: quote,
        gst_type: gstDetails.gst_type,
        gst_percentage: gstDetails.gst_percentage,
        salesperson: quotationInfo?.salesperson || quotation?.salesperson,
        subject: quotationInfo?.Subject || quotation?.subject || "Quotation for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST),
        without_gst: Math.round(gstDetails.withoutGST),
        gst_amount: Math.round(gstDetails.gstAmount),
        amount_with_gst: Math.round(gstDetails.totalWithGST),
        additional_discount_percentage: gstDetails.additional_discount_percentage || 0,
        additional_discount_amount: Math.round(gstDetails.additional_discount_amount || 0),
        amount_after_discount: Math.round(gstDetails.amount_after_discount || 0),
        warranty_guarantee: warrantyGuarantee,
        remarks,
        status: quotationInfo?.status || "active",
        client_id: selectedCustomer?.client_id || quotation?.client_id || 3,
        created_by: userDetails?.name || "System",
        created_at: new Date().toISOString(),
      };

      await axios.put(`${API_URL}/quotation/${quote}`, quotationData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (rowsData.length > 0) {
        const itemsData = rowsData.map((item) => ({
          quotation_id: quote,
          product_id: item.itemCode,
          customercode: item.customerCode || "0",
          customerdescription: item.customerDescription || "0",
          image: item.image || "",
          itemcode: item.itemCode,
          brand: item.brand || "N/A",
          mrp: parseFloat(item.mrp) || 0,
          price: Math.round(parseFloat(item.price ?? item.netPrice)) || 0,
          quantity: parseInt(item.qty, 10) || 0,
          discount: parseFloat(item.discount) || 0,
          amount: parseFloat(item.amount) || 0,
          item_name: item.itemName || "N/A",
          unit: item.unit || "pcs",
        }));

        await axios.put(`${API_URL}/quotation/${quote}/items/`, itemsData, {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        });
      }

      setQuotationId((p) => p + 1);
      toast.success("Quotation updated successfully!");
      window.location.href = "/getquotation";
    } catch (error) {
      toast.error(`Failed to save: ${error.response?.data?.detail || error.message || "Unknown error"}`);
      setSaving(false);
    }
  };

  /* -------------------- REVISION NUMBER -------------------- */
  const nextRevisionNo = useMemo(() => {
    if (!quote) return "";
    const base = quote.replace(/-([A-Z])$/, "");
    const match = quote.match(/-([A-Z])$/);
    if (!match) return `${base}-A`;
    return `${base}-${String.fromCharCode(match[1].charCodeAt(0) + 1)}`;
  }, [quote]);

  const today = useMemo(() => new Date().toLocaleDateString("en-GB"), []);

  if (loading) return <p style={S.loading}>Loading quotation…</p>;

  return (
    <div className="qt-page" style={S.page}>
      <style>{PRINT_CSS}</style>

      <div className="qt-sheet" style={S.sheet} id="tm_download_section">
        {/* ---------- Header ---------- */}
        <header style={S.head}>
          <img src="/assets/img/panviclogo.jpg" alt="Panvik Lighting" style={S.logo} />
          <div>
            <h1 style={S.docTitle}>QUOTATION</h1>
            <div style={S.metaList}>
              <span style={S.chip}>No. <span style={S.chipValue}>{quote}</span></span>
              <span style={S.chip}>Date <span style={S.chipValue}>{today}</span></span>
              {nextRevisionNo && (
                <span className="no-print" style={{ ...S.chip, ...S.chipNext }}>
                  Next revision <span style={{ ...S.chipValue, color: GOLD_DARK }}>{nextRevisionNo}</span>
                </span>
              )}
            </div>
          </div>
        </header>

        <hr style={S.rule} />

        {/* ---------- Client / Company ---------- */}
        <section style={S.parties}>
          <div style={S.party}>
            <div style={S.partyLabel}>Quotation for</div>
            {client ? (
              <>
                <div style={S.partyName}>{client.client_name}</div>
                <div style={S.partyLine}><span style={S.partyKey}>City: </span>{client.city}</div>
              </>
            ) : (
              <div style={{ ...S.partyLine, color: MUTED }}>Client details not available</div>
            )}
          </div>

          <div style={S.party}>
            <div style={S.partyLabel}>From</div>
            <div style={S.partyName}>PANVIK LIGHTING</div>
            <div style={S.partyLine}>Nakodar Road, beside Silver Oak Apartments, Jalandhar City, Punjab-144003</div>
            <div style={S.partyLine}><span style={S.partyKey}>GST: </span>03ADWPG0246P1Z8</div>
            <div style={S.partyLine}><span style={S.partyKey}>Phone: </span>94172-81252, 98150-37755</div>
            <div style={S.partyLine}><span style={S.partyKey}>Email: </span>panviklighting@gmail.com</div>
            <div style={S.partyLine}>
              <span style={S.partyKey}>Salesperson: </span>{quotation?.salesperson || "—"}
              {userDetails?.phone && <> · {userDetails.phone}</>}
            </div>
          </div>
        </section>

        {/* ---------- Subject ---------- */}
        <p style={S.subject}>
          <span style={S.subjectKey}>Subject</span>
          <span style={S.subjectValue}>{quotation?.subject || "—"}</span>
        </p>

        {/* ---------- Items ---------- */}
        <div style={S.tableWrap}>
          <EdiQuotatTable
            FiltercolModal={FiltercolModal}
            ShowHideFiltercolModal={ShowHideFiltercolModal}
            onClose={closeModal}
            onRowsChange={handleRowsChange}
            onTotalAmountChange={handleTotalAmountChange}
            qouteId={quote}
          />
          {showModalClientDetails && (
            <CustomerModal onClose={closeModal} client={showModalClientDetails} onConfirm={handleClientConfirm} />
          )}
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
            <GSTCalculator totalAmount={totalAmount} onGSTChange={handleGSTChange} initialData={gstDetails} />
          </div>
        </section>

        <hr style={S.rule} />

        {/* ---------- Terms ---------- */}
        <p style={S.thanks}>Thank you for considering us for your needs. Here is the proposal as you requested.</p>

        <h2 style={S.termsTitle}>Terms and conditions</h2>
        <dl style={S.terms}>
          {TERMS.slice(0, 2).map(([k, v]) => (
            <React.Fragment key={k}><dt style={S.termKey}>{k}</dt><dd style={S.termVal}>{v}</dd></React.Fragment>
          ))}

          <dt style={S.termKey}>Warranty / guarantee</dt>
          <dd style={S.termVal}>
            <textarea className="no-print" style={{ ...S.textarea, minHeight: 36 }}
              placeholder="Warranty / guarantee details"
              value={warrantyGuarantee} onChange={(e) => setWarrantyGuarantee(e.target.value)}
              onFocus={focusOn} onBlur={focusOff} />
            <span className="print-only">{warrantyGuarantee || "As per company norms."}</span>
          </dd>

          {TERMS.slice(2).map(([k, v]) => (
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
        <button type="button" className="qt-bar-btn" style={S.btn} onClick={() => window.print()}>
          <Icon d={PRINT_ICON} /> Print
        </button>
        <button type="button" id="tm_publish_btn" className="qt-bar-btn" style={{ ...S.btn, ...S.btnPrimary, opacity: saving ? 0.7 : 1 }}
          onClick={handleSaveQuotation} disabled={saving} onMouseOver={dimOn} onMouseOut={dimOff}>
          <Icon d={SAVE_ICON} /> {saving ? "Publishing…" : "Publish"}
        </button>
      </div>
    </div>
  );
};

export default EditQuotation;