"use client";
import InvoucherTable from "../../components/InvoucherTable";
import QuotaionInfo from "../../components/QuotaionInfo";
import CustomerModal from "../../components/customerModal";
import EdiQuotatTable from "../../components/EditQuotatTable";
import GSTCalculator from "../../components/GSTCalculator";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const EditQuotation = () => {
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
  const [warrantyGuarantee, setWarrantyGuarantee] = useState("1 year warranty against manufacturing defects"); // State for warranty/guarantee textarea
  const { quote } = useParams();

  const QUOTATION_API_URL = "https://api.panvic.in/quotation";
  const CLIENT_API_URL = "https://api.panvic.in/clients/";
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quote) return;

    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`${QUOTATION_API_URL}/${quote}`, {
          withCredentials: true,
        });
        console.log(response.data);
        if (response.data) {
          setQuotation(response.data);
          setRemarks(response.data.remarks || ""); // Set initial remarks from API
          setWarrantyGuarantee(response.data.warranty_guarantee || "1 year warranty against manufacturing defects"); // Set initial warranty from API
          setGstDetails({
            gstAmount: response.data.gst_amount || 0,
            totalWithGST: response.data.amount_with_gst || 0,
            withoutGST: response.data.without_gst || 0,
            gstPercentage: 0, // Assuming this isn't in API, adjust if it is
            gstType: "include", // Default, adjust if API provides this
          });
          if (response.data.client_id) {
            fetchClient(response.data.client_id);
          }
        } else {
          toast.error("No quotation found!");
        }
      } catch (error) {
        toast.error("Failed to load quotation details!");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quote]);

  const fetchClient = async (client_id) => {
    try {
      const response = await axios.get(CLIENT_API_URL, {
        withCredentials: true,
      });

      const filteredClient = response.data.find((c) => c.id === client_id);
      console.log(filteredClient);
      if (filteredClient) {
        setClient(filteredClient);
      } else {
        toast.error("Client not found!");
      }
    } catch (error) {
      toast.error("Failed to load client details!");
    }
  };

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
    console.log("Updated Rows Data:", rows);
  };

  const handleClientConfirm = (selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
  };

  const handleGSTChange = (details) => {
    setGstDetails(details);
    console.log("GST Details Received:", details);
  };

  const handleSaveQuotation = async () => {
    try {
      const quotationData = {
        quotation_no: quote,
        salesperson: quotationInfo?.salesperson || quotation?.salesperson || "Salesperson",
        subject: quotationInfo?.Subject || quotation?.subject || "Quotation for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST) || 0,
        without_gst: Math.round(gstDetails.withoutGST) || 0,
        gst_amount: Math.round(gstDetails.gstAmount) || 0,
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
        warranty_guarantee: warrantyGuarantee,
        remarks: remarks,
        status: quotationInfo?.status || "active",
        client_id: selectedCustomer?.client_id || quotation?.client_id || 3,
      };

      console.log("Quotation data to be sent:", quotationData);

      const quotationResponse = await axios.put(
        `${QUOTATION_API_URL}/${quote}`,
        quotationData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      console.log("Quotation updated successfully:", quotationResponse.data);

      if (rowsData.length > 0) {
        const itemsData = rowsData.map((item) => ({
          quotation_id: quote,
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
        }));

        console.log("Items data to be sent as a list:", itemsData);

        const itemsResponse = await axios.put(
          `${QUOTATION_API_URL}/${quote}/items/`,
          itemsData,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );

        console.log("All items updated successfully:", itemsResponse.data);
      } else {
        console.log("No items to save.");
      }

      setQuotationId(quotationId + 1);
      toast.success("Quotation and items saved successfully!");
      window.location.href = "/getquotation";
    } catch (error) {
      console.error("Error saving quotation or items:", error);
      if (error.response) {
        console.error("API Error Response:", error.response.data);
        toast.error(`Failed to save: ${error.response.data.detail || "Unknown error"}`);
      } else {
        toast.error("Failed to save quotation or items. Please try again.");
      }
    }
  };

  if (loading) return <p>Loading...</p>;

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
                  Quotation No: <b className="tm_primary_color">{quote}</b>
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
            <div className="tm_invoice_head tm_mb10">
              {client && (
                <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Supplier Details:</b>
                  </p>
                  <p style={{ textAlign: "justify" }}>
                    Name: <b>{client.client_name}</b> <br />
                    City: <b>{client.city}</b>
                  </p>
                </div>
              )}
              <div className="tm_invoice_right tm_text_right" style={{ flex: 1, textAlign: "right" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                </p>
                Address: <b>Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar City, Punjab-144003</b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Salesperson: {quotation && <b>{quotation.salesperson}</b>}
                <br />
              </div>
            </div>
            <div className="d-flex mb-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="tm_mb2">
                Subject: {quotation && <b className="tm_primary_color">{quotation.subject}</b>}
              </p>
            </div>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <EdiQuotatTable
                    FiltercolModal={FiltercolModal}
                    ShowHideFiltercolModal={ShowHideFiltercolModal}
                    onClose={closeModal}
                    onRowsChange={handleRowsChange}
                    onTotalAmountChange={handleTotalAmountChange}
                    qouteId={quote}
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
                <i>Thank You for considering us for your needs. Here is the proposal as you requested.</i>
              </b>
            </p>
            <div className="term_box">
              <h6>Terms and Conditions:</h6>
              <p>GST: <b>Including in above prices as per applicable.</b></p>
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
                Bank Details: <b>PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar.<br /> We hope you will find our offer in quotation and look forward to your positive response. Please feel free to contact us for any queries.</b>
              </p>
              <hr />
              <p>For: Panvik Lighting. This is a computer-generated document, hence signature is not required.</p>
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
          <button id="tm_publish_btn" className="tm_invoice_btn tm_color2" onClick={handleSaveQuotation}>
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

export default EditQuotation;