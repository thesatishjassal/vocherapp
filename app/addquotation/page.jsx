"use client";
import QuotaionInfo from "../components/QuotaionInfo";
import CustomerModal from "../components/customerModal";
import QuotationTable from "../components/QuotationTable";
import GSTCalculator from "../components/GSTCalculator";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Quotation = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [FiltercolModal, setFiltercolModal] = useState(false);
  const [ShowHideFiltercolModal, setShowHideFilterModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quotationInfo, setQuotationInfo] = useState(null);
  const [quotationId, setQuotationId] = useState(1);
  const [QuotationSequence, setQuotationSequence] = useState(null);
  const [rowsData, setRowsData] = useState([]);
  const [gstDetails, setGstDetails] = useState({
    gstAmount: 0,
    totalWithGST: 0,
    withoutGST: 0,
    gstPercentage: 0,
    gstType: "include",
  });
  const [remarks, setRemarks] = useState(""); // State for remarks textarea
  const [warrantyGuarantee, setWarrantyGuarantee] = useState(); // State for warranty/guarantee textarea
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleQuotationConfirm = (data) => {
    setQuotationInfo(data);
    console.log("Quotation Info Received:", data);
  };

  const closeModal = () => {
    setShowModalClientDetails(false);
    setShowHideFilterModal(false);
  };

  const handleTotalAmountChange = (newTotalAmount) => {
    setTotalAmount(newTotalAmount);
  };

  const handleRowsChange = (rows) => {
    setRowsData(rows);
  };

  const handleClientConfirm = (selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
  };

  const handleGSTChange = (details) => {
    setGstDetails(details);
  };

  const generateQuotationNumber = () => {
    if (QuotationSequence === null) return "PLQOT-Loading...";
    const sequenceStr = QuotationSequence.toString().padStart(3, "0");
    return `PLQOT-${sequenceStr}`;
  };

  useEffect(() => {
    const fetchLastQuotationData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/quotation/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const quotations = await response.json();
        console.log("Fetched quotations:", quotations);

        if (quotations && quotations.length > 0) {
          const lastSequence = quotations
            .map((voucher) => {
              const match = voucher.quotation_no
                ? voucher.quotation_no.match(/^PLQOT-(\d+)$/)
                : null;
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);

          console.log("Last sequence number:", lastSequence);

          const nextSequence = lastSequence + 1;
          setQuotationSequence(nextSequence);
          setQuotationId(quotations.length + 1);
        } else {
          setQuotationId(1);
          setQuotationSequence(1);
        }
      } catch (error) {
        console.error("Error fetching quotations:", error);
        setQuotationId(1);
        setQuotationSequence(1);
      }
    };

    fetchLastQuotationData();
  }, []);

  const handleSaveQuotation = async () => {
    if (QuotationSequence === null) {
      toast.warning("Quotation number is still loading. Please wait.");
      return;
    }

    try {
      const quotationData = {
        quotation_no: generateQuotationNumber(),
        salesperson: quotationInfo?.Salesperson || "Unknown Salesperson",
        subject: quotationInfo?.Subject || "Quotation for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST) || 0,
        without_gst: Math.round(gstDetails.withoutGST) || 0,
        gst_amount: Math.round(gstDetails.gstAmount) || 0,
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
        warranty_guarantee: warrantyGuarantee,
        remarks: remarks,
        status: "active",
        client_id: selectedCustomer?.client_id || 3,
      };

      const response = await axios.post(
        "https://api.panvic.in/quotation/",
        quotationData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const savedQuotationId = response.data.quotation_id;

      if (rowsData.length > 0) {
        const itemPromises = rowsData.map(async (item) => {
          const itemData = {
            quotation_id: savedQuotationId,
            product_id: item.itemCode,
            customercode: item.customerCode || "N/A",
            customerdescription: item.customerDescription || "N/A",
            image: item.image || "https://example.com/default-image.jpg",
            itemcode: item.itemCode,
            brand: item.brand || "N/A",
            mrp: parseFloat(item.mrp) || 0,
            price: parseFloat(item.amount) || 0,
            quantity: parseInt(item.qty, 10) || 0,
            discount: parseFloat(item.discount) || 0,
            item_name: item.itemName || "N/A",
            unit: item.unit || "pcs",
          };

          return axios.post(
            `https://api.panvic.in/quotation/${savedQuotationId}/items/`,
            itemData,
            { headers: { "Content-Type": "application/json" } }
          );
        });
        const itemResponses = await Promise.all(itemPromises);
      } else {
        console.log("No items to save.");
      }

      setQuotationSequence(QuotationSequence + 1);
      setQuotationId(quotationId + 1);
      toast.success("Quotation saved successfully!");
      window.location.href = "/getquotation";
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast.error("Failed to save quotation. Please try again.");
    }
  };

  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-1">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img src="/assets/img/panviclogo.jpg" alt="Logo" />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">
                  QUOTATION
                </div>
                <p className="tm_invoice_number tm_m0">
                  Quotation No: <b className="tm_primary_color">{generateQuotationNumber()}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">{new Date().toLocaleDateString("en-GB")}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_head tm_mb10" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">Customer Details:</b>{" "}
                  <button type="button" className="btn modalaction_btn no-print" onClick={() => setShowModalClientDetails(true)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                <p style={{ textAlign: "justify" }}>
                  Name: <b>{selectedCustomer && selectedCustomer.client_name}</b> <br />
                  City: <b>{selectedCustomer && selectedCustomer.city}</b> <br />
                </p>
              </div>
              <div className="tm_invoice_right tm_text_right" style={{ flex: 1, textAlign: "right" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                  {InfoModal && <QuotaionInfo setInfoModal={setInfoModal} onConfirm={handleQuotationConfirm} />}
                  <button type="button" className="btn modalaction_btn no-print" onClick={() => setInfoModal(true)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                Address: <b>Nakodar Road Beside Silver OAK Appartments Jalandhar City, Punjab-144003</b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Salesperson: {quotationInfo && <b>{quotationInfo.Salesperson}</b>}
                <br />
              </div>
            </div>
            <div className="d-flex mb-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="tm_mb2">
                Subject: {quotationInfo && <b className="tm_primary_color">{quotationInfo.Subject}</b>}
              </p>
            </div>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <QuotationTable
                    FiltercolModal={FiltercolModal}
                    ShowHideFiltercolModal={ShowHideFiltercolModal}
                    onClose={closeModal}
                    onRowsChange={handleRowsChange}
                    onTotalAmountChange={handleTotalAmountChange}
                  />
                  {showModalClientDetails && (
                    <CustomerModal
                      onClose={closeModal}
                      client={showModalClientDetails}
                      onConfirm={handleClientConfirm}
                    />
                  )}
                </div>
              </div>
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0">
                  <textarea
                    className="form-control tm_remarks_box no-print"
                    placeholder="Enter remarks here..."
                    rows="1"
                    cols="30"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>
                <div className="tm_right_footer">
                  <GSTCalculator totalAmount={totalAmount} onGSTChange={handleGSTChange} />
                </div>
              </div>
            </div>
            <hr />
            <p>
              <b>
                <i>Thank You for considering us for your needs. Here is the purposal as you requested.</i>
              </b>
            </p>
            <div className="term_box">
              <h6>Terms and Conditions:</h6>
              <p>GST: <b>Including in above prices as per applicable..</b></p>
              <p>Payment Terms: <b>100% in advance with order.</b></p>
              <p>Validity: <b>15 days from the date of quotation.</b></p>
              <p className="m-0">
                Warranty/Guarantee: <b>as per company norms.</b>
                <textarea
                  className="form-control tm_remarks_box no-print"
                  placeholder="Enter warranty/guarantee details..."
                  rows="1"
                  cols="30"
                  value={warrantyGuarantee}
                  onChange={(e) => setWarrantyGuarantee(e.target.value)}
                ></textarea>
              </p>
              <p>Responsibility: <b>Our responsibility for material counting ceases immediately after delivery.</b></p>
              <p>Installation & Fixing: <b>If required, for any electrical job, we will arrange a technician at extra cost. Installation will take 4-5 days from the date of order.</b></p>
              <p>Freight Charges: <b>Extra as per actual.</b></p>
              <p>
                Bank Details: <b>PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar.<br />We hope you will find our offer in quotation and look forward to your positive response. Please feel free to contact us for any queries.</b>
              </p>
              <hr />
              <p>For:- Panvik Lighting This is a computer generated document, hence signature is not required.</p>
            </div>
          </div>
        </div>
        <div className="tm_invoice_btns tm_hide_print">
          <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
            <span className="tm_btn_icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                <path d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 40.12 0 00-40 40v160a40.12 40.12 0 0040 40h24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32"></path>
                <rect x="128" y="240" width="256" height="208" rx="24.32" ry="24.32" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32"></rect>
                <path d="M384 128v-24a40.12 40.12 0 00-40-40H168a40.12 40.12 0 00-40 40v24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32"></path>
                <circle cx="392" cy="184" r="24" fill="currentColor"></circle>
              </svg>
            </span>
            <span className="tm_btn_text">Print</span>
          </button>
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
            <span className="tm_btn_icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                <path d="M320 336h76c55 0 100-21.21 100-75.6s-53-73.47-96-75.6C391.11 99.74 329 48 256 48c-69 0-113.44 45.79-128 91.2-60 5.7-112 35.88-112 98.4S70 336 136 336h56M192 400.1l64 63.9 64-63.9M256 224v224.03" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32"></path>
              </svg>
            </span>
            <span className="tm_btn_text">Download</span>
          </button>
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2" onClick={handleSaveQuotation}>
            <span className="tm_btn_icon">
              <i className="fa-solid fa-upload"></i>
            </span>
            <span className="tm_btn_text">Publish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quotation;