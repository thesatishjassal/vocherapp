"use client";
import QuotationInfo from "../components/QuotaionInfo";
import CustomerModal from "../components/customerModal";
import QuotationTable from "../components/QuotationTable";
import GSTCalculator from "../components/GSTCalculator";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Quotation = () => {
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
    gstPercentage: 0,
    gstType: "include",
  });
  const [remarks, setRemarks] = useState("");
  const [warrantyGuarantee, setWarrantyGuarantee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const generateItemData = useCallback(
    ({ quotationId, item, warranty }) => ({
      quotation_id: quotationId,
      product_id: item.itemCode,
      customercode: item.customerCode || "N/A",
      customerdescription: item.customerDescription || "N/A",
      image: item.image,
      itemcode: item.itemCode,
      brand: item.brand || "N/A",
      mrp: parseFloat(item.mrp) || 0,
      netPrice: parseFloat(item.netPrice) || 0,  // Added netPrice
      price: Math.round(parseFloat(item.amount)) || 0,
      quantity: parseInt(item.qty, 10) || 0,
      discount: parseFloat(item.discount) || 0,
      item_name: item.itemName || "N/A",
      unit: item.unit || "pcs",
      amount: parseFloat(item.amount) || 0,  // Added amount
      warranty_guarantee: warranty || "As per company norms",
      comments: item.comments || "N/A",
      status: "active",

    }),
    []
  );

  // Memoized callbacks
  const handleQuotationConfirm = useCallback((data) => {
    setQuotationInfo(data);
    console.log("Quotation Info Received:", data);
  }, []);

  const closeModal = useCallback(() => {
    setShowModalClientDetails(false);
  }, []);

  const handleTotalAmountChange = useCallback((newTotalAmount) => {
    setTotalAmount(newTotalAmount);
  }, []);

  const handleRowsChange = useCallback((rows) => {
    setRowsData(rows);
  }, []);

  const handleClientConfirm = useCallback((selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
  }, []);

  const handleGSTChange = useCallback((details) => {
    setGstDetails(details);
  }, []);

  const generateQuotationNumber = useMemo(() => {
    if (quotationSequence === null) return "PLQOT-Loading...";
    const sequenceStr = quotationSequence.toString().padStart(3, "0");
    return `PLQOT-${sequenceStr}`;
  }, [quotationSequence]);

  // Fetch last quotation data
  useEffect(() => {
    const fetchLastQuotationData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("https://api.panvic.in/quotation/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const quotations = await response.json();
        console.log("Fetched quotations:", quotations);

        if (quotations?.length > 0) {
          const lastSequence = quotations
            .map((voucher) => {
              const match = voucher.quotation_no?.match(/^PLQOT-(\d+)$/);
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
        toast.error("Failed to load quotation data. Using default sequence.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastQuotationData();
  }, []);

  /**
   * Saves the quotation and its items to the API.
   * @async
   */
  const handleSaveQuotation = useCallback(async () => {
    if (quotationSequence === null || isLoading || isSaving) {
      toast.warning("Please wait while the quotation is being processed.");
      return;
    }

    setIsSaving(true);

    try {
      // Validate rowsData
      for (const item of rowsData) {
        if (!item.itemCode || !item.itemName || !item.amount || isNaN(item.amount)) {
          throw new Error(`Invalid item data: ${item.itemName || "Unknown item"}`);
        }
      }

      const quotationData = {
        quotation_no: generateQuotationNumber,
        salesperson: quotationInfo?.Salesperson || "Unknown Salesperson",
        subject: quotationInfo?.Subject || "Quotation for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST) || 0,
        without_gst: Math.round(gstDetails.withoutGST) || 0,
        gst_amount: Math.round(gstDetails.gstAmount) || 0,
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
        warranty_guarantee: warrantyGuarantee || "As per company norms",
        remarks: remarks || "N/A",
        status: "active",
        client_id: selectedCustomer?.id || 3,
      };

      console.log("Sending quotationData:", quotationData);

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
          const itemData = generateItemData({
            quotationId: savedQuotationId,
            item,
            warranty: warrantyGuarantee,
          });

          console.log("Sending itemData:", itemData);

          return axios.post(
            `https://api.panvic.in/quotation/${savedQuotationId}/items/`,
            itemData,
            { headers: { "Content-Type": "application/json" } }
          );
        });

        await Promise.all(itemPromises);
        console.log("Items saved successfully");
      } else {
        console.log("No items to save.");
      }

      setQuotationSequence((prev) => prev + 1);
      setQuotationId((prev) => prev + 1);
      toast.success("Quotation saved successfully!");
      window.location.href = "/getquotation";
    } catch (error) {
      console.error("Error saving quotation:", error);
      if (error.response?.status === 500) {
        const errorMessage =
          error.response.data.detail ||
          "Server error. Please check the data and try again.";
        toast.error(`Failed to save quotation: ${errorMessage}`);
      } else if (error.response?.status === 422) {
        const details = error.response.data.detail;
        const errorMessage =
          details?.[0]?.msg || "Invalid data provided. Please check item details.";
        toast.error(`Failed to save quotation: ${errorMessage}`);
      } else {
        toast.error(`Failed to save quotation: ${error.message || "Unknown error"}`);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    quotationSequence,
    isLoading,
    isSaving,
    generateQuotationNumber,
    quotationInfo,
    gstDetails,
    warrantyGuarantee,
    remarks,
    selectedCustomer,
    rowsData,
    generateItemData,
  ]);

  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-1">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img
                    src="/assets/img/panviclogo.jpg"
                    alt="Panvik Lighting Logo"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">
                  QUOTATION
                </div>
                <p className="tm_invoice_number tm_m0">
                  Quotation No:{" "}
                  <b className="tm_primary_color">{generateQuotationNumber}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_date tm_m0">
                  Date:{" "}
                  <b className="tm_primary_color">
                    {new Date().toLocaleDateString("en-GB")}
                  </b>
                </p>
              </div>
            </div>
            <div
              className="tm_invoice_head tm_mb10"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                className="tm_invoice_left mt-0"
                style={{ flex: 1, textAlign: "left" }}
              >
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
                <p style={{ textAlign: "justify" }}>
                  Name: <b>{selectedCustomer?.client_name || "N/A"}</b> <br />
                  City: <b>{selectedCustomer?.city || "N/A"}</b> <br />
                </p>
              </div>
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                  {infoModal && (
                    <QuotationInfo
                      setInfoModal={setInfoModal}
                      onConfirm={handleQuotationConfirm}
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
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Salesperson: <b>{quotationInfo?.Salesperson || "N/A"}</b>
                <br />
              </div>
            </div>
            <div
              className="d-flex mb-2"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p className="tm_mb2">
                Subject:{" "}
                <b className="tm_primary_color">
                  {quotationInfo?.Subject || "N/A"}
                </b>
              </p>
            </div>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <QuotationTable
                    items={rowsData}
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
                <i>
                  Thank You for considering us for your needs. Here is the
                  purposal as you requested.
                </i>
              </b>
            </p>
            <div className="term_box">
              <h6>Terms and Conditions:</h6>
              <p>
                GST: <b>Including in above prices as per applicable.</b>
              </p>
              <p>
                Payment Terms: <b>100% in advance with order.</b>
              </p>
              <p>
                Validity: <b>15 days from the date of quotation.</b>
              </p>
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
              <p>
                Responsibility:{" "}
                <b>
                  Our responsibility for material counting ceases immediately
                  after delivery.
                </b>
              </p>
              <p>
                Installation & Fixing:{" "}
                <b>
                  If required, for any electrical job, we will arrange a
                  technician at extra cost. Installation will take 4-5 days from
                  the date of order.
                </b>
              </p>
              <p>
                Freight Charges: <b>Extra as per actual.</b>
              </p>
              <p>
                Bank Details:{" "}
                <b>
                  PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code:
                  ICIC0001510, Jalandhar.
                  <br />
                  We hope you will find our offer in quotation and look forward to
                  your positive response. Please feel free to contact us for any
                  queries.
                </b>
              </p>
              <hr />
              <p>
                For:- Panvik Lighting This is a computer generated document, hence
                signature is not required.
              </p>
            </div>
          </div>
        </div>
        <div className="tm_invoice_btns tm_hide_print">
          <button
            type="button"
            onClick={() => window.print()}
            className="tm_invoice_btn tm_color1"
          >
            <span className="tm_btn_icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ionicon"
                viewBox="0 0 512 512"
              >
                <path
                  d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 40.12 0 00-40 40v160a40.12 40.12 0 0040 40h24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="32"
                ></path>
                <rect
                  x="128"
                  y="240"
                  width="256"
                  height="208"
                  rx="24.32"
                  ry="24.32"
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="32"
                ></rect>
                <path
                  d="M384 128v-24a40.12 40.12 0 00-40-40H168a40.12 40.12 0 00-40 40v24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="32"
                ></path>
                <circle cx="392" cy="184" r="24" fill="currentColor"></circle>
              </svg>
            </span>
            <span className="tm_btn_text">Print</span>
          </button>
          <button
            id="tm_download_btn"
            className="tm_invoice_btn tm_color2"
            onClick={handleSaveQuotation}
            disabled={isSaving}
          >
            <span className="tm_btn_icon">
              <i className="fa-solid fa-upload"></i>
            </span>
            <span className="tm_btn_text">
              {isSaving ? "Publishing..." : "Publish"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quotation;
