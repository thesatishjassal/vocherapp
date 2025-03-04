"use client";
import React, { useState } from "react";
import axios from "axios";
import OutvoucherTable from "../components/outVoucherTable";
import BasicInfoModal from "../components/AddBasicInfo";
import CustomerModal from "../components/customerModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Addoutinvoice = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [basicinfoData, setBasicinfoData] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleIconClick = () => {
    setOpen(!open);
  };

  const handleConfirm = (data) => {
    console.log("Received Data:", data);
    setBasicinfoData(data);
  };

  const closeModal = () => {
    setShowModalClientDetails(false);
  };

  const handleClientConfirm = (selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
  };

  const generateVoucherNumber = () => {
    let voucherSequence = "";
    if (voucherSequence === null) return "PLOTV-Loading...";
    const sequenceStr = voucherSequence.toString().padStart(3, "0");
    return `PLOTV-${sequenceStr}`;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      voucher_no: generateVoucherNumber(),
      issue_slip_no: basicinfoData?.IssueSlipNo || null,
      sale_order_no: basicinfoData?.SaleOrderNo || null,
      transport: basicinfoData?.Transport || null,
      vehicle_no: basicinfoData?.VehicleNo || null,
      number_of_packages: basicinfoData?.Packages || null,
      ordered_by: basicinfoData?.OrderBy || null,
      sales_person: basicinfoData?.SalePerson || null,
      freight_amount: basicinfoData?.FreightAmount || null,
      receiver_name: basicinfoData?.ReceiverName || null,
      mobile_number: basicinfoData?.ContactNumber || null,
      transaction_type: basicinfoData?.TransactionType || null,
    };

    try {
      const response = await axios.post(
        "https://api.panvic.in/outvouchers/",
        JSON.stringify(payload),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Success:", response.data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.detail || "Failed to create outvoucher");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-2">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img src="/assets/img/panviclogo.jpg" alt="Logo" />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">
                  OUT VOUCHER
                </div>
                <p className="tm_invoice_number tm_m0">
                  Voucher No:{" "}
                  <b className="tm_primary_color">{generateVoucherNumber()}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 mb-2">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Transaction Types:{" "}
                  <b className="tm_primary_color">
                    {basicinfoData && basicinfoData.TransactionType || "N/A"}
                  </b>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date:{" "}
                  <b className="tm_primary_color">
                    {startDate.toLocaleDateString("en-US", {
                      month: "numeric",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </b>
                  {open && (
                    <div className="custom_datepciker">
                      {open && (
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => {
                            setStartDate(date);
                            setOpen(false);
                          }}
                          inline
                        />
                      )}
                    </div>
                  )}
                </p>
              </div>
            </div>
            <div
              className="tm_invoice_head txm_mb10 m-0"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left Column */}
              <div
                className="tm_invoice_left"
                style={{ flex: 1, textAlign: "left", marginTop: "-10px" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">To Customer: </b>
                  <button
                    type="button"
                    className="btn modalaction_btn no-print "
                    onClick={() => setShowModalClientDetails(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                {showModalClientDetails && (
                  <CustomerModal
                    onClose={closeModal}
                    client={showModalClientDetails}
                    onConfirm={handleClientConfirm}
                  />
                )}
                <p style={{ textAlign: "justify" }}>
                  Name:{" "}
                  <b>{selectedCustomer?.client_name || "Not Selected"}</b>{" "}
                  <br />
                  Address: <b>{selectedCustomer?.address || "N/A"}</b> <br />
                  City: <b>{selectedCustomer?.city || "N/A"}</b>, State:{" "}
                  <b>{selectedCustomer?.state || "N/A"}</b> | Pincode:{" "}
                  <b>{selectedCustomer?.pincode || "N/A"}</b> <br />
                  Phone: <b>{selectedCustomer?.client_phone || "N/A"}</b>{" "}
                  <br />
                  GST NO: <b>{selectedCustomer?.gst_number || "N/A"}</b>
                </p>
              </div>

              {/* Right Column */}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">Basic Details:</b>
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setInfoModal(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                {InfoModal && (
                  <BasicInfoModal
                    setInfoModal={setInfoModal}
                    onConfirm={handleConfirm}
                  />
                )}
                Issue Slip No:
                <b> {basicinfoData && basicinfoData.IssueSlipNo}</b> <br />
                Sale Order No:
                <b> {basicinfoData && basicinfoData.SaleOrderNo} </b>
                <br />
                Transport: <b>{basicinfoData && basicinfoData.Transport}</b>{" "}
                <br />
                Vehicle No: <b>{basicinfoData && basicinfoData.VehicleNo}</b>{" "}
                <br />
              </div>
            </div>
            <div className="d-flex py-2 px-0 no-top-border">
              <div className="flex-grow-1 py-0 pl-0 no-top-border">
                Package <b>{basicinfoData && basicinfoData.Packages}</b>
              </div>
              <div className="flex-grow-1 py-0 no-top-border">
                Order BY: <b>{basicinfoData && basicinfoData.OrderBy}</b>
              </div>
              <div className="flex-grow-1 py-0 no-top-border">
                Sale Person: <b>{basicinfoData && basicinfoData.SalePerson}</b>
              </div>
              <div className="flex-grow-1 py-0 no-top-border">
                Freight Amount:{" "}
                <b>{basicinfoData && basicinfoData.FreightAmount}</b>
              </div>
            </div>

            <p className="tm_mb2">
              <b className="tm_primary_color">Product info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <OutvoucherTable />
                </div>
              </div>
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0">
                  <p className="tm_mb2">
                    <b className="tm_primary_color">
                      Remarks/Notes (Optional):
                    </b>
                  </p>
                  <input
                    type="text"
                    className="form-control tm_remarks_box"
                    placeholder="Add any additional details or instructions"
                  />
                </div>
              </div>
            </div>
            <div className="tm_left_footer px-0">
              <p className="tm_mb2 d-flex flex-wrap gap-2">
                <b className="tm_primary_color">
                  Receiver Name: {basicinfoData?.ReceiverName || "N/A"}
                </b>
                ||
                <b className="tm_primary_color">
                  Mobile: {basicinfoData?.ContactNumber || "N/A"}
                </b>
              </p>

              <div className="d-flex justify-content-between align-items-end">
                <div className="col-auto ms-auto text-end">
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Store Manager:</b>
                    <br />
                    <span className="tm_primary_color">Auth Sign</span>
                  </p>
                </div>
              </div>
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
                  d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 40.12 0 00-40 40v160a40.12 40.12 0 00-40 40h24"
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
            type="button"
            className="tm_invoice_btn tm_color1"
            onClick={handleSubmit}
            disabled={loading}
          >
            <span className="tm_btn_icon">
              <i className="fa-solid fa-floppy-disk"></i>
            </span>
            <span className="tm_btn_text">
              {loading ? "Submitting..." : "Submit"}
            </span>
          </button>
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
            <span className="tm_btn_icon">
              <i className="fa-solid fa-upload"></i>
            </span>
            <span className="tm_btn_text">Publish</span>
          </button>
        </div>
        {error && (
          <div className="alert alert-danger mt-3" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addoutinvoice;