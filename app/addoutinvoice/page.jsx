"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [voucherSequence, setVoucherSequence] = useState(1); // only sequence
  const [submitStatus, setSubmitStatus] = useState(null);
  const [voucherRows, setVoucherRows] = useState([]);
  const [productsFetched, setProductsFetched] = useState(false);
  const [productIds, setProductIds] = useState(new Set());

  const handleRowsUpdate = (updatedRows) => {
    console.log("Updated rows:", updatedRows);
    setVoucherRows(updatedRows);
  };

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
    if (voucherSequence === null) return "PLOTV-Loading...";
    const sequenceStr = voucherSequence.toString().padStart(3, "0");
    return `PLOTV-${sequenceStr}`;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("https://api.panvic.in/products/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const productsData = await response.json();
      const ids = productsData.map((product) => product.itemcode);

      setProductIds(new Set(ids));
      setProductsFetched(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      setSubmitStatus("Error fetching product data.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchLastVoucherData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/outvouchers/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vouchers = await response.json();
        if (vouchers && vouchers.length > 0) {
          const lastSequence = vouchers
            .map((voucher) => {
              const match = voucher.voucher_no
                ? voucher.voucher_no.match(/^PLOTV-(\d+)$/)
                : null;
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);

          setVoucherSequence(lastSequence + 1);
        } else {
          setVoucherSequence(1);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setVoucherSequence(1);
      }
    };

    fetchLastVoucherData();
  }, []);

  useEffect(() => {
    if (submitStatus) {
      if (submitStatus.includes("Error")) {
        toast.error(submitStatus, {
          position: "top-right",
          autoClose: 4000,
        });
      } else {
        toast.success(submitStatus, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    }
  }, [submitStatus]);

  const handleSubmit = async () => {
    if (!basicinfoData) {
      setSubmitStatus("Please complete the basic info details");
      return;
    }
    if (voucherSequence === null) {
      setSubmitStatus("Voucher data not yet loaded, please wait");
      return;
    }
    if (!productsFetched) {
      setSubmitStatus("Waiting for product data to load.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSubmitStatus(null);

    const newVoucherNo = generateVoucherNumber();

    const voucherPayload = {
      voucher_no: newVoucherNo, // only voucher_no, id is auto
      issue_slip_no: basicinfoData?.IssueSlipNo || null,
      sale_order_no: basicinfoData?.SaleOrderNo || null,
      transport: basicinfoData?.Transport || null,
      transaction_types: basicinfoData?.transaction_types || null,
      vehicle_no: basicinfoData?.VehicleNo || null,
      number_of_packages: basicinfoData?.Packages
        ? parseInt(basicinfoData.Packages, 10)
        : null,
      ordered_by: basicinfoData?.OrderBy || null,
      sales_person: basicinfoData?.SalePerson || null,
      freight_amount: basicinfoData?.FreightAmount
        ? parseFloat(basicinfoData.FreightAmount)
        : null,
      receiver_name: basicinfoData?.ReceiverName || null,
      mobile_number: basicinfoData?.ContactNumber || null,
      client_id: selectedCustomer?.id || null,
      remarks: null,
    };

    try {
      // First request: Create Outvoucher
      const voucherResponse = await axios.post(
        "https://api.panvic.in/outvouchers/",
        voucherPayload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      console.log("Outvoucher Created:", voucherResponse.data);

      // Use DB auto-generated ID
      const createdVoucherId =
        voucherResponse.data.id || voucherResponse.data.voucher_id;
      if (!createdVoucherId) {
        throw new Error("Failed to retrieve voucher_id from response.");
      }

      // Validate rows
      if (!Array.isArray(voucherRows) || voucherRows.length === 0) {
        throw new Error("Voucher items are empty. Cannot proceed.");
      }

      const requiredFields = ["itemcode", "itemname", "unit", "qty"];
      const invalidRows = voucherRows.some((row) =>
        requiredFields.some(
          (field) => !row[field] || row[field].toString().trim() === ""
        )
      );

      if (invalidRows) {
        throw new Error("All item fields must be filled.");
      }

      // Submit items
      for (const row of voucherRows) {
        const itemData = {
          voucher_id: createdVoucherId,
          product_id: row.itemcode,
          item_name: row.itemname,
          unit: row.unit,
          rack_code: row.rackcode,
          quantity: Number(row.qty) || 0,
          comments: row.comments,
        };

        const itemUrl = `https://api.panvic.in/outvouchers/${createdVoucherId}/items/`;
        console.log("Submitting item to:", itemUrl, "with data:", itemData);

        const itemsResponse = await axios.post(itemUrl, itemData, {
          headers: { "Content-Type": "application/json" },
        });

        console.log("Item submitted successfully:", itemsResponse.data);
      }

      setSubmitStatus("Outvoucher and Items created successfully!");
      window.location.href = "/getoutvouchers";

      // Update sequence only after success
      setVoucherSequence((prev) => (prev !== null ? prev + 1 : 1));
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      setError(
        err.response?.data || { message: "Failed to create outvoucher/items" }
      );
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
                    {(basicinfoData && basicinfoData.TransactionType) || "N/A"}
                  </b>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date:{" "}
                  <b className="tm_primary_color">
                  {startDate.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  </b>
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
                  Name: <b>{selectedCustomer?.client_name || "Not Selected"}</b>{" "}
                  <br />
                  Address: <b>{selectedCustomer?.address || "N/A"}</b> <br />
                  City: <b>{selectedCustomer?.city || "N/A"}</b>, State:{" "}
                  <b>{selectedCustomer?.state || "N/A"}</b> | Pincode:{" "}
                  <b>{selectedCustomer?.pincode || "N/A"}</b> <br />
                  Phone: <b>{selectedCustomer?.client_phone || "N/A"}</b> <br />
                  GST NO: <b>{selectedCustomer?.gst_number || "N/A"}</b>
                </p>
              </div>

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
                Transport: <b>
                  {basicinfoData && basicinfoData.Transport}
                </b>{" "}
                <br />
                Vehicle No: <b>
                  {basicinfoData && basicinfoData.VehicleNo}
                </b>{" "}
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
              <b>{basicinfoData && basicinfoData.FreightAmount}</b>
            </div>
          </div>
          <div className="flex-grow-1 py-0 no-top-border">
            Freight Amount:{" "}
            <p className="tm_mb2">
              <b className="tm_primary_color">Product info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <OutvoucherTable items={[]} onRowsUpdate={handleRowsUpdate} />
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
            {JSON.stringify(error)}
          </div>
        )}
      </div>
    </div>
  );
};

export default Addoutinvoice;
