"use client";
import CustomerModal from "../../components/customerModal";
import SwitchQuotatTable from "../../components/EditSwitchQuotatTable";
import GSTCalculator from "../../components/GSTCalculator";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

const EditSwitchQuotation = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [FiltercolModal, setFiltercolModal] = useState(false);
  const [ShowHideFiltercolModal, setShowHideFilterModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [quotationInfo, setQuotationInfo] = useState(null);
  const [quotationId, setQuotationId] = useState(1);
  const [rowsData, setRowsData] = useState([]);
  const [gstDetails, setGstDetails] = useState({
    gstAmount: 0,
    totalWithGST: 0,
    withoutGST: 0,
    gstPercentage: 0,
    gstType: "include",
  });
  const [remarks, setRemarks] = useState("");
  const [warrantyGuarantee, setWarrantyGuarantee] = useState(
    "1 year warranty against manufacturing defects"
  );
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
        const response = await axios.get(
          `${API_URL}/switch-quotations/${quote}`,
          { withCredentials: true }
        );

        const data = response.data;

        if (!data) {
          toast.error("No quotation found!");
          return;
        }

        setQuotation(data);
        setRemarks(data.remarks || "");
        setWarrantyGuarantee(
          data.warranty_guarantee || "As per company norms"
        );

        setGstDetails({
          gstAmount: data.gst_amount || 0,
          totalWithGST: data.amount_with_gst || 0,
          withoutGST: data.without_gst || 0,
          gstPercentage: data.gst_exclude_percentage || 0,
          gstType: "include",
        });

        setQuotationId(data.quotation_id);

        if (data.items && data.items.length > 0) {
          const mappedItems = data.items.map((item) => ({
            id: item.id,
            sr_no: item.sr_no,
            itemcode: item.itemcode || "",
            item_name: item.item_name || "",
            brand: item.brand || "",
            quantity: item.quantity ?? "",
            mrp: item.mrp ?? "",
            discount_percent: item.discount_percent ?? "",
            unit: item.unit || "pcs",
            net_price: item.net_price ?? "",
            amount: item.amount ?? "",
            image: item.image || null,
            color: item.color || "",
          }));

          setRowsData(mappedItems);
          setTotalAmount(data.without_gst || 0);
        }

        if (data.client_id) fetchClient(data.client_id);
      } catch (error) {
        toast.error("Failed to load quotation!");
      } finally {
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [quote]);

  const fetchClient = async (client_id) => {
    try {
      const response = await axios.get(`${API_URL}/clients/`, {
        withCredentials: true,
      });
      const filteredClient = response.data.find((c) => c.id === client_id);
      if (filteredClient) setClient(filteredClient);
      else toast.error("Client not found!");
    } catch {
      toast.error("Failed to load client details!");
    }
  };

  /* -------------------- Handlers -------------------- */
  // ✅ FIX: Wrap in useCallback so references are stable across renders
  const handleTotalAmountChange = useCallback((newTotalAmount) => {
    setTotalAmount(newTotalAmount);
  }, []);

  const handleRowsChange = useCallback((rows) => {
    setRowsData(rows);
  }, []);

  const handleClientConfirm = useCallback((selectedClient) => {
    setSelectedCustomer(selectedClient);
  }, []);

  const handleGSTChange = useCallback((details) => {
    setGstDetails(details);
  }, []);

  const closeModal = useCallback(() => {
    setShowModalClientDetails(false);
    setShowHideFilterModal(false);
  }, []);

  /* ---------- Update quotation ---------- */
  const handleSaveQuotation = async () => {
    try {
      const payload = {
        quotation_no: `PLQOT: ${quote}`,
        without_gst: Math.round(gstDetails.withoutGST) || 0,
        gst_amount: Math.round(gstDetails.gstAmount) || 0,
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
        salesperson: quotation?.salesperson,
        subject: quotation?.subject,
        gst_exclude_percentage: 0,
        warranty_guarantee: warrantyGuarantee,
        remarks,
        status: "active",
        client_id: selectedCustomer?.client_id || quotation?.client_id,
        created_by: userDetails?.name || "System",
        items: rowsData.map((item, index) => {
          const quantity = Number(item.quantity) || 0;
          const mrp = Number(item.mrp) || 0;
          const discount = Number(item.discount_percent) || 0;
          const net_price = mrp * (1 - discount / 100);
          const amount = quantity * net_price;

          return {
            sr_no: item.sr_no || index + 1,
            itemcode: item.itemcode,
            item_name: item.item_name,
            brand: item.brand || "N/A",
            quantity,
            mrp,
            discount_percent: discount,
            unit: item.unit || "pcs",
            net_price: Math.round(net_price),
            amount: Math.round(amount),
            image: item.image || "",
            color: item.color || "",
          };
        }),
      };

      await axios.put(
        `${API_URL}/switch-quotations/${quotationId}`,
        payload,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      toast.success("Quotation updated successfully!");
      window.location.href = "/switchquotation";
    } catch (error) {
      toast.error(
        `Failed to save: ${error.response?.data?.detail || error.message}`
      );
    }
  };

  /* ---------- Next revision number ---------- */
  const nextRevisionNo = useMemo(() => {
    if (!quote) return "";
    const base = quote.replace(/-([A-Z])$/, "");
    const match = quote.match(/-([A-Z])$/);
    if (!match) return `${base}-A`;
    const letter = match[1];
    const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
    return `${base}-${nextLetter}`;
  }, [quote]);

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
                  Quotation No:{" "}
                  <b className="tm_primary_color">PLSQT-{quote}</b>
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
            <div className="tm_invoice_head tm_mb10">
              {client && (
                <div
                  className="tm_invoice_left mt-0"
                  style={{ flex: 1, textAlign: "left" }}
                >
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Client Details:</b>
                  </p>
                  <p style={{ textAlign: "justify" }}>
                    Name: <b>{client.client_name}</b> <br />
                    City: <b>{client.city}</b>
                  </p>
                </div>
              )}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                </p>
                Address:{" "}
                <b>
                  Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar
                  City, Punjab-144003
                </b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Contact no: <b>94172-81252, 98150-37755</b> <br />
                Email id: <b>panviklighting@gmail.com</b> <br />
                Salesperson: {userDetails && <b>{userDetails.name}</b>} |
                Mobile Number:{" "}
                <b>{userDetails && userDetails.phone}</b>
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
                {quotation && (
                  <b className="tm_primary_color">{quotation.subject}</b>
                )}
              </p>
            </div>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  {/* ✅ FIX: Pass items={rowsData} so table doesn't re-fetch,
                      and use stable useCallback handlers */}
                  <SwitchQuotatTable
                    FiltercolModal={FiltercolModal}
                    ShowHideFiltercolModal={ShowHideFiltercolModal}
                    onClose={closeModal}
                    items={rowsData}
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
                  proposal as you requested.
                </i>
              </b>
            </p>
            <div className="term_box">
              <h6>Terms and Conditions:</h6>
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
                  technician at extra cost. Installation will take 4-5 days
                  from the date of order.
                </b>
              </p>
              <p>
                Freight Charges: <b>Extra as per actual.</b>
              </p>
              <p>
                Bank Details:{" "}
                <b>
                  PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC
                  Code: ICIC0001510, Jalandhar.
                  <br /> We hope you will find our offer in quotation and look
                  forward to your positive response. Please feel free to
                  contact us for any queries.
                </b>
              </p>
              <hr />
              <p>
                For: Panvik Lighting. This is a computer-generated document,
                hence signature is not required.
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
            id="tm_publish_btn"
            className="tm_invoice_btn tm_color2"
            onClick={handleSaveQuotation}
          >
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

export default EditSwitchQuotation;
