"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import SalesOrderInfo from "../components/SalesInfo";
import CustomerModal from "../components/customerModal";
import GSTCalculator from "../components/GSTCalculator";
import GetSalesOrdersTable from "../components/Getsalesbyquotation";

const SalesOrder = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
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
  const [remarks, setRemarks] = useState("");
  const [warrantyGuarantee, setWarrantyGuarantee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [freightMethod, setFreightMethod] = useState("");

  const handleQuotationConfirm = (data) => setQuotationInfo(data);

  const closeModal = () => {
    setShowModalClientDetails(false);
  };

  const handleRowsChange = (rows) => {
    setRowsData(rows);
    const total = rows.reduce((sum, r) => sum + (r.amount || 0), 0);
    setTotalAmount(total);
  };

  const handleClientConfirm = (selectedClient) => setSelectedCustomer(selectedClient);
  const handleGSTChange = (details) => setGstDetails(details);

  const generateQuotationNumber = () => {
    if (QuotationSequence === null) return "PLSAL-Loading...";
    const sequenceStr = QuotationSequence.toString().padStart(3, "0");
    return `PLSO-${sequenceStr}`;
  };

  useEffect(() => {
    const fetchLastQuotationData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/salesorder/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const quotations = await response.json();
        if (quotations && quotations.length > 0) {
          const lastSequence = quotations
            .map((voucher) => {
              const match = voucher.quotation_no
                ? voucher.quotation_no.match(/^PLQOT-(\d+)$/)
                : null;
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);

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
        payment_method: paymentMethod || "Not Selected",
        client_id: selectedCustomer?.id || 3,
      };

      const response = await axios.post(
        "https://api.panvic.in/salesorder/",
        quotationData,
        { headers: { "Content-Type": "application/json" } }
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
            `https://api.panvic.in/salesorder/${savedQuotationId}/items/`,
            itemData,
            { headers: { "Content-Type": "application/json" } }
          );
        });

        await Promise.all(itemPromises);
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
            {/* Header */}
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-1">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img src="/assets/img/panviclogo.jpg" alt="Logo" />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">
                  SALES ORDER
                </div>
                <p className="tm_invoice_number tm_m0">
                  Sales Order No:{" "}
                  <b className="tm_primary_color">{generateQuotationNumber()}</b>
                </p>
              </div>
            </div>

            {/* Date */}
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list mr-2">
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">{new Date().toLocaleDateString("en-GB")}</b>
                </p>
              </div>
            </div>

            {/* Customer & Company Info */}
            <div
              className="tm_invoice_head tm_mb10 d-flex justify-content-between"
            >
              <div className="tm_invoice_left mt-0" style={{ flex: 1 }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">Customer Details:</b>{" "}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setShowModalClientDetails(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>

                {selectedCustomer && (
                  <div style={{ lineHeight: "1.6" }}>
                    {selectedCustomer.client_name && <p><strong>Client Name:</strong> {selectedCustomer.client_name}</p>}
                    {selectedCustomer.businessname && <p><strong>Business Name:</strong> {selectedCustomer.businessname}</p>}
                    {(selectedCustomer.client_phone || selectedCustomer.client_email) && (
                      <p>
                        {selectedCustomer.client_phone && <> <strong>Mobile:</strong> {selectedCustomer.client_phone} </>}
                        {selectedCustomer.client_phone && selectedCustomer.client_email && " | "}
                        {selectedCustomer.client_email && <> <strong>Email:</strong> {selectedCustomer.client_email} </>}
                      </p>
                    )}
                    {(selectedCustomer.address || selectedCustomer.city || selectedCustomer.state || selectedCustomer.pincode) && (
                      <p>
                        {selectedCustomer.address && <> <strong>Address:</strong> {selectedCustomer.address} </>}
                        {selectedCustomer.address && (selectedCustomer.city || selectedCustomer.state || selectedCustomer.pincode) && ", "}
                        {selectedCustomer.city && <> <strong>City:</strong> {selectedCustomer.city} </>}
                        {selectedCustomer.state && `, ${selectedCustomer.state}`}
                        {selectedCustomer.pincode && ` - ${selectedCustomer.pincode}`}
                      </p>
                    )}
                    {selectedCustomer.gst_number && <p><strong>GST No:</strong> {selectedCustomer.gst_number}</p>}
                  </div>
                )}
              </div>

              <div className="tm_invoice_right tm_text_right" style={{ flex: 1 }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                  {InfoModal && (
                    <SalesOrderInfo setInfoModal={setInfoModal} onConfirm={handleQuotationConfirm} />
                  )}
                  <button type="button" className="btn modalaction_btn no-print" onClick={() => setInfoModal(true)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                Address: <b>Nakodar Road Beside Silver OAK Appartments Jalandhar City, Punjab-144003</b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b>
                <br />
                Salesperson: {quotationInfo && <b>{quotationInfo.Salesperson}</b>}
                {quotationInfo && (
                  <p style={{ margin: 0 }}>
                    Payment Method: <b>{quotationInfo.PaymentMethod}</b> &nbsp; | &nbsp;
                    Freight: <b>{quotationInfo.FreightStatus}</b>
                  </p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="d-flex mb-2 justify-content-between">
              <p className="tm_mb2">
                Subject: {quotationInfo && <b className="tm_primary_color">{quotationInfo.Subject}</b>}
              </p>
            </div>

            {/* Items Table */}
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <GetSalesOrdersTable onRowsChange={handleRowsChange} />
                  {showModalClientDetails && (
                    <CustomerModal onClose={closeModal} client={showModalClientDetails} onConfirm={handleClientConfirm} />
                  )}
                </div>
              </div>

              <div className="tm_invoice_footer my-2 d-flex justify-content-between">
                <div className="tm_left_footer px-0">
                  <textarea
                    className="form-control tm_remarks_box no-print"
                    placeholder="Enter remarks here..."
                    rows="1"
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
            <p><b><i>Thank You for considering us for your needs. Here is the proposal as you requested.</i></b></p>
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
                  value={warrantyGuarantee}
                  onChange={(e) => setWarrantyGuarantee(e.target.value)}
                ></textarea>
              </p>
              <p>Responsibility: <b>Our responsibility for material counting ceases immediately after delivery.</b></p>
              <p>Installation & Fixing: <b>If required, we will arrange a technician at extra cost. Installation takes 4-5 days from order date.</b></p>
              <p>Freight Charges: <b>Extra as per actual.</b></p>
              <p>Bank Details: <b>PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar.</b></p>
              <hr />
              <p>For:- Panvik Lighting This is a computer generated document, hence signature is not required.</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="tm_invoice_btns tm_hide_print">
            <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
              <span className="tm_btn_icon">
                <i className="fa-solid fa-print"></i>
              </span>
              <span className="tm_btn_text">Print</span>
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
    </div>
  );
};

export default SalesOrder;
