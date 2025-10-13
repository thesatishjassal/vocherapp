"use client"
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
  const [salesOrderInfo, setSalesOrderInfo] = useState(null);
  const [salesOrderId, setSalesOrderId] = useState(1);
  const [salesOrderSequence, setSalesOrderSequence] = useState(null);
  const [rowsData, setRowsData] = useState([]);
  const [gstDetails, setGstDetails] = useState({
    gstAmount: 0,
    totalWithGST: 0,
    withoutGST: 0,
    gstPercentage: 0,
    gstType: "include",
  });
  const [remarks, setRemarks] = useState("");

  const handleSalesOrderConfirm = (data) => setSalesOrderInfo(data);

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

  const generateSalesOrderNumber = () => {
    if (salesOrderSequence === null) return "PLSO-Loading...";
    const sequenceStr = salesOrderSequence.toString().padStart(3, "0");
    return `PLSO-${sequenceStr}`;
  };

  useEffect(() => {
    const fetchLastSalesOrderData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/salesorder/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const salesOrders = await response.json();
        if (salesOrders && salesOrders.length > 0) {
          const lastSequence = salesOrders
            .map((order) => {
              const match = order.salesorder_no
                ? order.salesorder_no.match(/^PLSO-(\d+)$/)
                : null;
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);

          const nextSequence = lastSequence + 1;
          setSalesOrderSequence(nextSequence);
          setSalesOrderId(salesOrders.length + 1);
        } else {
          setSalesOrderId(1);
          setSalesOrderSequence(1);
        }
      } catch (error) {
        console.error("Error fetching sales orders:", error);
        setSalesOrderId(1);
        setSalesOrderSequence(1);
      }
    };

    fetchLastSalesOrderData();
  }, []);
const handleSaveSalesOrder = async () => {
  if (salesOrderSequence === null) {
    toast.warning("Sales order number is still loading. Please wait.");
    return;
  }

  try {
    // 1️⃣ Prepare sales order data
    const salesOrderData = {
      salesorder_no: generateSalesOrderNumber(),
      salesperson: salesOrderInfo?.Salesperson || "Unknown Salesperson",
      subject: salesOrderInfo?.Subject || "Sales Order for Products/Services",
      amount_including_gst: Math.round(gstDetails.totalWithGST) || 0,
      without_gst: Math.round(gstDetails.withoutGST) || 0,
      gst_amount: Math.round(gstDetails.gstAmount) || 0,
      amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
      remarks: remarks,
      status: "active",
      date: new Date().toISOString(),
      payment_method: salesOrderInfo?.PaymentMethod || "Not Selected",
      freight: salesOrderInfo?.FreightStatus || "Not Selected",
      issue_slip_no: salesOrderInfo?.IssueSlipNo || "",
      client_id: selectedCustomer?.id || 3,
    };

    // 2️⃣ Save sales order
    const response = await axios.post(
      "https://api.panvic.in/salesorder/",
      salesOrderData,
      { headers: { "Content-Type": "application/json" } }
    );

    const savedSalesOrderId = response.data.salesorder_id;
    console.log("Sales Order saved with ID:", savedSalesOrderId);

    // 3️⃣ Save sales order items if any
    if (rowsData.length > 0) {
      console.log("Preparing to save items:", rowsData);
      console.log("Rows to save as items:", rowsData);
      if (!rowsData || rowsData.length === 0) {
        console.warn("No sales order items to save.");
        return;
      }

      const itemPromises = rowsData.map(async (item) => {
        try {
          const itemData = {
            product_id: item.itemCode,
            customercode: item.customerCode || "N/A",
            customerdescription: item.customerDescription || "N/A",
            image: item.image || "https://example.com/default-image.jpg",
            itemcode: item.itemCode,
            brand: item.brand || "N/A",
            mrp: parseFloat(item.mrp || 0),
            price: parseFloat(item.amount || 0),
            quantity: parseInt(item.qty || 0, 10),
            discount: parseFloat(item.discount || 0),
            item_name: item.itemName || "N/A",
            unit: item.unit || "pcs",
          };

          console.log("Posting item:", itemData);

          const itemResponse = await axios.post(
            `https://api.panvic.in/salesorder/${savedSalesOrderId}/items/`,
            itemData,
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("Item saved:", itemResponse.data);
        } catch (err) {
          console.error("Failed to save item:", item.itemCode, err.response?.data || err.message);
        }
      });

      // Wait for all items to finish
    await Promise.all(itemPromises);
    console.log("All items saved successfully");
    }

    // 4️⃣ Update sequences and notify user
    setSalesOrderSequence(salesOrderSequence + 1);
    setSalesOrderId(salesOrderId + 1);
    toast.success("Sales order and items saved successfully!");

  } catch (error) {
    console.error("Error saving sales order:", error.response?.data || error.message);
    toast.error("Failed to save sales order. Please try again.");
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
                  <b className="tm_primary_color">{generateSalesOrderNumber()}</b>
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
                    <SalesOrderInfo setInfoModal={setInfoModal} onConfirm={handleSalesOrderConfirm} />
                  )}
                  <button type="button" className="btn modalaction_btn no-print" onClick={() => setInfoModal(true)}>
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                Address: <b>Nakodar Road Beside Silver OAK Appartments Jalandhar City, Punjab-144003</b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b>
                <br />
                Salesperson: {salesOrderInfo && <b>{salesOrderInfo.Salesperson}</b>}
                {salesOrderInfo && (
                  <p style={{ margin: 0 }}>
                    Payment Method: <b>{salesOrderInfo.PaymentMethod}</b> &nbsp; | &nbsp;
                    Freight: <b>{salesOrderInfo.FreightStatus}</b>&nbsp; | &nbsp;
                    Issue Slip No: <b>{salesOrderInfo.IssueSlipNo}</b>
                  </p>
                )}
              </div>
            </div>

            {/* Subject */}
            <div className="d-flex mb-2 justify-content-between">
              <p className="tm_mb2">
                Subject: {salesOrderInfo && <b className="tm_primary_color">{salesOrderInfo.Subject}</b>}
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

            <button id="tm_download_btn" className="tm_invoice_btn tm_color2" onClick={handleSaveSalesOrder}>
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