"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PurchaseOrderInfo from "../components/PurchaseInfo";
import CustomerModal from "../components/customerModal";
import GSTCalculator from "../components/GSTCalculator";
import NewPurchaseOrderItems from "../components/GetPurchaseOrdersTable";

const AddPurchaseOrder = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [rowsData, setRowsData] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salesOrderInfo, setSalesOrderInfo] = useState(null);
  const [salesOrderId, setSalesOrderId] = useState(1);
  const [salesOrderSequence, setSalesOrderSequence] = useState(null);
  const [gstDetails, setGstDetails] = useState({
    gstAmount: 0,
    totalWithGST: 0,
    withoutGST: 0,
    gstPercentage: 0,
    gstType: "include",
  });
  const [remarks, setRemarks] = useState("");

  const totalAmount = useMemo(() => {
    const total = rowsData.reduce((sum, r) => {
      const amt = parseFloat(r.amount) || 0;
      return sum + amt;
    }, 0);
    return total;
  }, [rowsData]);

  const handleSalesOrderConfirm = useCallback(
    (data) => setSalesOrderInfo(data),
    []
  );

  const closeModal = useCallback(() => {
    setShowModalClientDetails(false);
  }, []);

  const handleRowsChange = useCallback((rows) => {
    console.log("✅ Received rows from child:", rows);
    setRowsData(rows || []);
  }, []);

  const handleClientConfirm = useCallback(
    (selectedClient) => setSelectedCustomer(selectedClient),
    []
  );

  const handleGSTChange = useCallback((details) => setGstDetails(details), []);

  const generatePurchaseOrderNumber = () => {
    if (salesOrderSequence === null) return "PLPO-Loading...";
    const sequenceStr = salesOrderSequence.toString().padStart(3, "0");
    return `PLPO-${sequenceStr}`;
  };

  useEffect(() => {
    const fetchLastSalesOrderData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/purchaseorder/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const salesOrders = await response.json();
        if (salesOrders && salesOrders.length > 0) {
          const lastSequence = salesOrders
            .map((order) => {
              const match = order.purchaseorder_no
                ? order.purchaseorder_no.match(/^PLPO-(\d+)$/)
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
        console.error("Error fetching Purchase Orders:", error);
        setSalesOrderId(1);
        setSalesOrderSequence(1);
      }
    };

    fetchLastSalesOrderData();
  }, []);

  const handleSaveSalesOrder = async () => {
    if (salesOrderSequence === null) {
      toast.warning("Purchase Order number is still loading. Please wait.");
      return;
    }

    try {
      const salesOrderData = {
        purchaseorder_no: generatePurchaseOrderNumber(),
        salesperson: salesOrderInfo?.Salesperson || "Unknown Salesperson",
        subject:
          salesOrderInfo?.Subject || "Purchase Order for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST) || 0,
        without_gst: Math.round(gstDetails.withoutGST) || 0,
        gst_amount: Math.round(gstDetails.gstAmount) || 0,
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
        remarks,
        status: "active",
        date: new Date().toISOString(),
        payment_method: salesOrderInfo?.PaymentMethod || "Not Selected",
        freight: salesOrderInfo?.FreightStatus || "Not Selected",
        issue_slip_no: salesOrderInfo?.issue_slip_no || "",
        client_id: selectedCustomer?.id || 3,
      };

      const response = await axios.post(
        "https://api.panvic.in/purchaseorder/",
        salesOrderData,
        { headers: { "Content-Type": "application/json" } }
      );

      const purchaseorder_id = response.data.purchaseorder_id;
      console.log("✅ Purchase Order saved with ID:", purchaseorder_id);
      console.log("✅ Items to save:", rowsData);

      if (!rowsData || rowsData.length === 0) {
        toast.info("No Purchase Order items to save.");
        return;
      }

      const itemPromises = rowsData.map((item) => {
        const itemData = {
          product_id: item.itemCode,
          customercode: item.customerCode || "N/A",
          customerdescription: item.customerDescription || "N/A",
          image: item.image || "",
          itemcode: item.itemCode,
          brand: item.brand || "N/A",
          mrp: parseFloat(item.mrp || 0),
          price: parseFloat(item.amount || 0),
          quantity: parseInt(item.qty || 0, 10),
          discount: parseFloat(item.discount || 0),
          item_name: item.itemName || "N/A",
          unit: item.unit || "pcs",
          color: item.color || "N/A",
          remarks: item.remarks || "",
        };

        return axios.post(
          `https://api.panvic.in/purchaseorder/${purchaseorder_id}/items/`,
          itemData,
          { headers: { "Content-Type": "application/json" } }
        );
      });

      await Promise.all(itemPromises);
      toast.success("✅ Purchase Order and items saved successfully!");
      setSalesOrderSequence((prev) => prev + 1);
      setSalesOrderId((prev) => prev + 1);
      window.location.href = "/purchase-orders";
    } catch (error) {
      console.error(
        "❌ Error saving Purchase Order:",
        error.response?.data || error.message
      );
      toast.error("Failed to save Purchase Order. Please try again.");
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
                  PURCHASE ORDER
                </div>
                <p className="tm_invoice_number tm_m0">
                  Purchase Order No:{" "}
                  <b className="tm_primary_color">
                    {generatePurchaseOrderNumber()}
                  </b>
                </p>
              </div>
            </div>

            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list mr-2">
                <p className="tm_invoice_date tm_m0">
                  Date:{" "}
                  <b className="tm_primary_color">
                    {new Date().toLocaleDateString("en-GB")}
                  </b>
                </p>
              </div>
            </div>

            <div className="tm_invoice_head tm_mb10 d-flex justify-content-between">
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
                    {selectedCustomer.client_name && (
                      <p>
                        <strong>Client Name:</strong>{" "}
                        {selectedCustomer.client_name}
                      </p>
                    )}
                    {selectedCustomer.businessname && (
                      <p>
                        <strong>Business Name:</strong>{" "}
                        {selectedCustomer.businessname}
                      </p>
                    )}
                    {(selectedCustomer.client_phone ||
                      selectedCustomer.client_email) && (
                      <p>
                        {selectedCustomer.client_phone && (
                          <>
                            <strong>Mobile:</strong>{" "}
                            {selectedCustomer.client_phone}{" "}
                          </>
                        )}
                        {selectedCustomer.client_phone &&
                          selectedCustomer.client_email &&
                          " | "}
                        {selectedCustomer.client_email && (
                          <>
                            <strong>Email:</strong>{" "}
                            {selectedCustomer.client_email}{" "}
                          </>
                        )}
                      </p>
                    )}
                    {selectedCustomer.address && (
                      <p>
                        <strong>Address:</strong> {selectedCustomer.address}
                      </p>
                    )}
                    {selectedCustomer.gst_number && (
                      <p>
                        <strong>GST No:</strong> {selectedCustomer.gst_number}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1 }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                  {InfoModal && (
                    <PurchaseOrderInfo
                      setInfoModal={setInfoModal}
                      onConfirm={handleSalesOrderConfirm}
                    />
                  )}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setInfoModal(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                Address:{" "}
                <b>
                  Nakodar Road Beside Silver OAK Appartments Jalandhar City,
                  Punjab-144003
                </b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b>
                <br />
                Salesperson:{" "}
                {salesOrderInfo && <b>{salesOrderInfo.Salesperson}</b>}
              </div>
            </div>

            <div className="d-flex mb-2 justify-content-between">
              <p className="tm_mb2">
                Subject:{" "}
                {salesOrderInfo && (
                  <b className="tm_primary_color">
                    {salesOrderInfo.Subject}
                  </b>
                )}
              </p>
            </div>

            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <NewPurchaseOrderItems onRowsChange={handleRowsChange} />
                  {showModalClientDetails && (
                    <CustomerModal
                      onClose={closeModal}
                      client={showModalClientDetails}
                      onConfirm={handleClientConfirm}
                    />
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
                  <GSTCalculator
                    totalAmount={totalAmount}
                    onGSTChange={handleGSTChange}
                  />
                </div>
              </div>
            </div>

            <hr />
            <p>
              <b>
                <i>Thank You for considering us for your needs.</i>
              </b>
            </p>
          </div>

          <div className="tm_invoice_btns tm_hide_print">
            <button
              type="button"
              onClick={() => window.print()}
              className="tm_invoice_btn tm_color1"
            >
              <span className="tm_btn_icon">
                <i className="fa-solid fa-print"></i>
              </span>
              <span className="tm_btn_text">Print</span>
            </button>

            <button
              id="tm_download_btn"
              className="tm_invoice_btn tm_color2"
              onClick={handleSaveSalesOrder}
            >
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

export default AddPurchaseOrder;
