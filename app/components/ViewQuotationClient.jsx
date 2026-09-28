// components/ClientViewQuotation.js - Client Component
"use client";
import axios from "axios";
import QuotationItemsTable from "./QuotationItemsTable"; // Adjust path as needed
import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Cookies from "js-cookie";

/* ------------------------------------------------------------------ */
/*  Company details (edit here)                                        */
/* ------------------------------------------------------------------ */
const COMPANY = {
  name: "PANVIK LIGHTING",
  addressLines: [
    "Nakodar Road, Near Ravidass Chowk,",
    "Jalandhar City-144003, Punjab",
  ],
  gst: "03ADWPG0246P1Z8",
  phone: "+91 9417281252 / 9815037755",
  email: "sales@panvik.com",
  website: "www.panvik.com",
  bank: "PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar.",
};

/* ------------------------------------------------------------------ */
/*  Embedded CSS – every class is prefixed with "pvq-"                 */
/* ------------------------------------------------------------------ */
const PVQ_CSS = `
.pvq-root{
  --pvq-maroon:#7a0a0a;
  --pvq-red:#c0141b;
  --pvq-gold:#d4a91c;
  --pvq-ink:#1c1c1c;
  --pvq-muted:#555;
  --pvq-soft:#faf6f0;
  font-family:"Segoe UI",Arial,Helvetica,sans-serif;
  color:var(--pvq-ink);
  max-width:900px;
  margin:16px auto;
  padding:0 8px;
  box-sizing:border-box;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
.pvq-root *,.pvq-root *::before,.pvq-root *::after{box-sizing:border-box}
.pvq-root p {
    margin: 0;
    font-size: 12px;
}
.pvq-status{padding:32px 16px;text-align:center;font-size:15px}

/* Sheet */
.pvq-sheet{background:#fff;border:1px solid var(--pvq-ink);overflow:hidden}

/* Header */
.pvq-head{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:14px 16px 10px}
.pvq-brand{flex:1 1 55%;min-width:0}

.pvq-logo{display:block;width:100%;max-width:170px;height:auto}
.pvq-brand-line {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 10px auto;
}.pvq-brand-line::before,.pvq-brand-line::after{content:"";flex:1;height:2px;background:var(--pvq-gold)}
// .pvq-brand-line::before{flex:0 0 40px}
.pvq-brand-name{color:var(--pvq-gold);font-weight:700;font-size:clamp(15px,3.2vw,24px);letter-spacing:.18em;white-space:nowrap}
.pvq-head-right{text-align:right}
.pvq-title{margin:0;font-size:clamp(20px,4vw,27px);font-weight:400;letter-spacing:.08em;text-transform:uppercase}
.pvq-meta{margin-top:6px;font-size:14px;line-height:1.6}
.pvq-meta b{font-weight:700}
.pvq-bar{height:14px;background:var(--pvq-maroon)}

/* Client + company */
.pvq-parties{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:12px 16px 6px}
.pvq-client{flex:1 1 50%;min-width:0}
.pvq-heading{margin:0 0 8px;font-size:18px;font-weight:700}
.pvq-details{display:grid;grid-template-columns:max-content 1fr;gap:4px 16px;margin:0;font-size:14px}
.pvq-details dt{margin:0;font-weight:400}
.pvq-details dd{margin:0;font-weight:700;overflow-wrap:anywhere}
.pvq-company{flex:1 1 50%;min-width:0;text-align:right;font-size:14px;line-height:1.75}
.pvq-company-name{font-weight:700;color:var(--pvq-maroon);font-size:15px}
.pvq-company a{color:inherit;text-decoration:none}

/* Subject row */
.pvq-subject-row{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:6px 16px;padding:8px 16px 10px;font-size:14px}
.pvq-subject-row b{font-weight:700}

/* Items table (styles the QuotationItemsTable output) */
.pvq-table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
.pvq-table-scroll table{width:100%;min-width:640px;border-collapse:collapse;font-size:13px;margin:0}
.pvq-table-scroll thead th, .pvq-table-scroll thead td {
    background: var(--pvq-maroon);
    color: #fff!important;
    font-weight: 700;
    text-align: center;
    padding: 8px 6px;
    line-height: 1.2;
    border: 0!important;
    border-left: 1px solid #e3e3e7 !important;
}
.pvq-table-scroll thead th:first-child{border-left:0!important}
.pvq-table-scroll tbody td{
  padding:10px 6px;text-align:center;vertical-align:middle;border:1px solid var(--pvq-ink);background:#fff;
}
.pvq-table-scroll tbody td:first-child{border-left:0}
.pvq-table-scroll tbody td:last-child{border-right:0;font-weight:700}
.pvq-table-scroll img{max-width:70px;max-height:60px;height:auto;object-fit:contain}

/* Totals */
.pvq-footer{display:flex;justify-content:flex-end;padding:14px 16px}
.pvq-totals{width:100%;max-width:340px;border-collapse:collapse;font-size:14px}
.pvq-totals td{padding:6px 10px;font-weight:600}
.pvq-totals td:last-child{text-align:right;white-space:nowrap}
.pvq-totals tr + tr td{border-top:1px solid #e3d9c6}
.pvq-total-row td{font-size:15px;font-weight:700;border-top:0!important}
.pvq-discount td{color:var(--pvq-red)}

/* Thank-you + terms */
.pvq-thanks{padding:0 16px 12px;font-size:14px;font-style:italic;font-weight:700}
.pvq-terms{margin:0 16px 16px;padding:12px 14px;font-size:13px;line-height:1.55}
.pvq-terms-title{margin:0 0 8px;font-size:15px;font-weight:700;color:var(--pvq-maroon)}
.pvq-terms p + p{margin-top:6px}
.pvq-terms hr{border:0;border-top:1px solid #dccfb4;margin:12px 0 8px}
.pvq-sign{color:var(--pvq-muted)}

/* Actions */
.pvq-actions{display:flex;justify-content:center;padding:16px}
.pvq-btn{
  display:inline-flex;align-items:center;gap:8px;cursor:pointer;border:0;border-radius:4px;
  background:var(--pvq-maroon);color:#fff;font:600 14px/1 "Segoe UI",Arial,sans-serif;padding:12px 20px;
}
.pvq-btn:hover{background:var(--pvq-red)}
.pvq-btn:focus-visible{outline:3px solid var(--pvq-gold);outline-offset:2px}
.pvq-btn:disabled{opacity:.6;cursor:wait}

/* Tablet & mobile */
@media (max-width:768px){
  .pvq-root{padding:0 6px;margin:8px auto}
  .pvq-head,.pvq-parties{padding-left:12px;padding-right:12px}
  .pvq-subject-row,.pvq-footer{padding-left:12px;padding-right:12px}
  .pvq-thanks{padding-left:12px;padding-right:12px}
  .pvq-terms{margin-left:12px;margin-right:12px}
}
@media (max-width:600px){
  .pvq-head{flex-direction:column;gap:8px}
  .pvq-head-right{text-align:left;width:100%}
  .pvq-brand{width:100%;flex-basis:auto}
  .pvq-parties{flex-direction:column;gap:14px}
  .pvq-company{text-align:left;width:100%}
  .pvq-subject-row{flex-direction:column;gap:4px}
  .pvq-totals{max-width:none}
  .pvq-btn{width:100%;justify-content:center}
}

/* Print */
@media print{
  .pvq-no-print{display:none!important}
  .pvq-root{margin:0;padding:0;max-width:none}
  .pvq-sheet{border:0}
}
`;

export default function ClientViewQuotation({ quote }) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [userDetails, setUserDetails] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  /* ---------------- PDF generate + upload ---------------- */
  const generateAndUploadPDF = async () => {
    try {
      setIsGenerating(true);
      const sheet = document.querySelector(".pvq-sheet");

      if (!sheet) {
        alert("Quotation not found!");
        return;
      }

      // windowWidth forces the desktop layout, so the PDF looks the same on phones
      const canvas = await html2canvas(sheet, {
        scale: 1.2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: 1000,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.7);

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pdfBlob = pdf.output("blob");

      const formData = new FormData();
      formData.append("file", pdfBlob);
      formData.append("upload_preset", "panvik_pdf");
      formData.append("cloud_name", "dfolgsiiv");

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/dfolgsiiv/auto/upload`,
        formData
      );

      const pdfUrl = cloudinaryRes.data.secure_url;

      alert("PDF Uploaded Successfully!");
      navigator.clipboard.writeText(pdfUrl);
      console.log("PDF URL:", pdfUrl);
    } catch (err) {
      console.error("PDF ERROR:", err);
      alert("PDF generation failed!");
    } finally {
      setIsGenerating(false);
    }
  };

  /* ---------------- Salesperson from cookie ---------------- */
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

  /* ---------------- Fetch quotation + client ---------------- */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const quotationResponse = await axios.get(
          `${API_URL}/quotation/${quote}`,
          { withCredentials: true }
        );

        if (quotationResponse.data) {
          setQuotation(quotationResponse.data);

          if (quotationResponse.data.client_id) {
            const clientResponse = await axios.get(`${API_URL}/clients/`, {
              withCredentials: true,
            });
            const foundClient = clientResponse.data.find(
              (c) => c.id === quotationResponse.data.client_id
            );
            setClient(foundClient);
            if (!foundClient) {
              setError("Client not found!");
            }
          }
        } else {
          setError("No quotation found!");
        }
      } catch (err) {
        setError("Failed to load quotation details!");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (quote) {
      fetchData();
    }
  }, [quote]);

  /* ---------------- Guard states ---------------- */
  if (isLoading || error || !quotation) {
    return (
      <div className="pvq-root">
        <style>{PVQ_CSS}</style>
        <p className="pvq-status">
          {isLoading ? "Loading..." : error || "No quotation found!"}
        </p>
      </div>
    );
  }

  /* ---------------- Derived values ---------------- */
  const baseAmount = Number(
    quotation?.without_gst ?? quotation?.withoutGST ?? 0
  );
  const gstAmount = Number(quotation?.gst_amount ?? quotation?.gstAmount ?? 0);
  const showGst = quotation?.gst_type === "exclude" && gstAmount > 0;
  const discountPct = Number(quotation?.additional_discount_percentage ?? 0);
  const discountAmt = Number(quotation?.additional_discount_amount ?? 0);
  const totalAmount = Number(
    quotation?.amount_with_gst ?? quotation?.amount_after_discount ?? 0
  );

  return (
    <div className="pvq-root">
      <style>{PVQ_CSS}</style>

      <div className="pvq-sheet">
        {/* ===== Header ===== */}
        <div className="pvq-head">
          <div className="pvq-brand">
            <img
              className="pvq-logo"
              src="/assets/img/panvik_colored_logo.png"
              alt="Panvik logo"
            />
          </div>

          <div className="pvq-head-right">
            <h1 className="pvq-title">Quotation</h1>
            <p className="pvq-meta">
              Quotation No: <b>{quotation.quotation_no}</b>
            </p>
            <p className="pvq-meta">
              <b>Date:</b> {new Date().toLocaleDateString("en-GB")}
            </p>
          </div>
        </div>
        <div className="pvq-brand-line">
          <span className="pvq-brand-name">{COMPANY.name}</span>
        </div>
        <div className="pvq-bar" />

        {/* ===== Client + company ===== */}
        <div className="pvq-parties">
          {client && (
            <div className="pvq-client">
              <h2 className="pvq-heading">Client Details:</h2>
              <dl className="pvq-details">
                {client.businessname && (
                  <>
                    <dt>Business Name:</dt>
                    <dd>{client.businessname}</dd>
                  </>
                )}
                {client.client_name && (
                  <>
                    <dt>Name:</dt>
                    <dd>{client.client_name}</dd>
                  </>
                )}
                {client.city && (
                  <>
                    <dt>City:</dt>
                    <dd>{client.city}</dd>
                  </>
                )}
                {client.client_phone && (
                  <>
                    <dt>Phone:</dt>
                    <dd>{client.client_phone}</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          <div className="pvq-company">
            {COMPANY.addressLines.map((line) => (
              <div key={line}>{line}</div>
            ))}
            <div>GST: {COMPANY.gst}</div>
            <div>{COMPANY.phone}</div>
            <div>{COMPANY.email}</div>
            <div>{COMPANY.website}</div>
          </div>
        </div>

        {/* ===== Subject + salesperson ===== */}
        <div className="pvq-subject-row">
          <span>
            <b>Subject:</b> {quotation.subject}
          </span>
          <span>
            Salesperson: <b>{quotation?.salesperson || ""}</b> | Mobile Number:{" "}
            <b>{userDetails?.phone || ""}</b>
          </span>
        </div>

        {/* ===== Items table ===== */}
        <div className="pvq-table-scroll">
          <QuotationItemsTable quotation_id={quotation.quotation_id} />
        </div>

        {/* ===== Totals ===== */}
        <div className="pvq-footer">
          <table className="pvq-totals">
            <tbody>
              <tr>
                <td>Amount:</td>
                <td>{baseAmount.toFixed(2)}</td>
              </tr>

              {showGst && (
                <tr>
                  <td>Exclude GST (18%):</td>
                  <td>{gstAmount.toFixed(2)}</td>
                </tr>
              )}

              {discountPct > 0 && (
                <tr className="pvq-discount">
                  <td>Additional Discount ({discountPct}%):</td>
                  <td>- {discountAmt.toFixed(2)}</td>
                </tr>
              )}

              <tr className="pvq-total-row">
                <td>Total Amount:</td>
                <td>{totalAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="pvq-thanks">
          Thank you for considering us for your needs. Here is the proposal as
          you requested.
        </p>

        {/* ===== Terms ===== */}
        <div className="pvq-terms">
          <h6 className="pvq-terms-title">Terms and Conditions:</h6>
          <p> <b>GST</b> :- Include in above prices as per applicable</p>{" "}
          <p> <b>Payment Terms</b> :- 100% in advance with order</p>
          <p>Validity:- 15 days from date of quotation.</p>
          <p>
            No warranty in case of any type of led burn directly connected with
            ac current without driver or in case of any type of failure raise
          </p>
          <p>
            Our responsibility of counting of material ceases immediately after
            delivery of material.
          </p>
          <p>
            Installation & fixing if any required of any kind of electrical job
            . We will arrange technician at extra cost . As per actual.
          </p>
          <p>Material will take 2 Weeks from date of order</p>
          <p>Freight charges extra as per actual</p>
          <p>
            Bank Details: <b>{COMPANY.bank}</b>
          </p>
          <p>
            <b>
              We hope you will find our offer in quotation & looking forward to
              your positive response. Please feel free to contact us for any
              queries.
            </b>
          </p>
          <hr />
          <p className="pvq-sign">
           
            <br />
            
          </p><span> Regards:{" "}
           <br />
            <b>Panvik Lighting</b>
          </span>
          <div className="spacer"></div>
          <span>
           <b>{userDetails?.name || ""}</b>    <br />Mob (0):{" "}
            <b>{userDetails?.phone || ""}</b>
          </span>
        </div>
      </div>

      {/* ===== Actions ===== */}
      {/* <div className="pvq-actions ]pvq-no-print">
        <button
          type="button"
          onClick={generateAndUploadPDF}
          disabled={isGenerating}
          className="pvq-btn pvq-no-print"
        >
          <i className="fa-solid fa-file-pdf" aria-hidden="true"></i>
          <span>{isGenerating ? "Generating..." : "Generate PDF & Upload"}</span>
        </button>
      </div> */}
    </div>
  );
}
