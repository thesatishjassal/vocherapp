"use client";
import InvoucherTable from "../components/InvoucherTable";
import QuotaionInfo from "../components/QuotaionInfo";
import CustomerModal from "../components/customerModal";
import QuotationTable from "../components/QuotationTable";
import GSTCalculator from "../components/GSTCalculator";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const handleQuotationConfirm = (data) => {
    setQuotationInfo(data);
  };

  const closeModal = () => {
    setShowModalClientDetails(false);
    setShowHideFilterModal(false);
  };

  const handleTotalAmountChange = (amount) => {
    setTotalAmount(amount);
  };

  const handleRowsChange = (rows) => {
    setRowsData(rows);
  };

  const handleClientConfirm = (client) => {
    setSelectedCustomer(client);
  };

  const handleGSTChange = (details) => {
    setGstDetails(details);
  };

  const generateQuotationNumber = () => {
    if (QuotationSequence === null) return "PLQOT-Loading...";
    return `PLQOT-${QuotationSequence.toString().padStart(3, "0")}`;
  };

  useEffect(() => {
    const fetchLastQuotationData = async () => {
      try {
        const response = await axios.get("https://api.panvic.in/quotation/");
        const quotations = response.data;
        const lastSequence = quotations
          .map((q) => parseInt(q.quotation_no?.match(/^PLQOT-(\d+)$/)?.[1] || 0))
          .reduce((max, num) => Math.max(max, num), 0);
        setQuotationSequence(lastSequence + 1);
        setQuotationId(quotations.length + 1);
      } catch (error) {
        console.error("Error fetching quotations:", error);
        setQuotationSequence(1);
        setQuotationId(1);
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
      const remarks = document.querySelector(".tm_remarks_box")?.value || "";
      const warrantyGuarantee =
        document.querySelector('input[placeholder="Warranty/Guarantee"]')
          ?.value || "1 year warranty against manufacturing defects";

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
        status: true,
        client_id: selectedCustomer?.client_id || 3,
      };

      const response = await axios.post("https://api.panvic.in/quotation/", quotationData);
      const savedQuotationId = response.data.quotation_id;

      if (rowsData.length > 0) {
        await Promise.all(
          rowsData.map((item) => {
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
              itemData
            );
          })
        );
      }

      setQuotationSequence((prev) => prev + 1);
      setQuotationId((prev) => prev + 1);
      toast.success("Quotation saved successfully!");
      setTimeout(() => {
        window.location.href = "/getquotation";
      }, 1500);
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast.error("Failed to save quotation. Please try again.");
    }
  };

  return (
    <div className="card tm_container my-4">
      <ToastContainer />
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

            <QuotaionInfo onConfirm={handleQuotationConfirm} />

            <CustomerModal
              showModal={showModalClientDetails}
              onClose={closeModal}
              onConfirm={handleClientConfirm}
            />

            <QuotationTable
              onTotalAmountChange={handleTotalAmountChange}
              onRowsChange={handleRowsChange}
            />

            <GSTCalculator
              totalAmount={totalAmount}
              onGSTChange={handleGSTChange}
            />

            <div className="tm_button_wrapper tm_text_center">
              <button className="btn btn-primary" onClick={handleSaveQuotation}>
                Save Quotation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quotation;
