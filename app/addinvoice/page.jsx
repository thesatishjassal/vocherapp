"use client";
import InvoucherTable from "../components/InvoucherTable";
import ReciverDetails from "../components/Reciverdeatails";
import { useState, useEffect } from "react";
import CustomerModal from "../components/customerModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirect } from "next/dist/server/api-utils";

const AddInvoice = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [voucherSequence, setVoucherSequence] = useState(null);
  const [voucherId, setVoucherId] = useState(null);

  const closeModal = () => {
    setShowModalClientDetails(false);
  };

  const handleTotalAmountChange = (newTotalAmount, rows) => {
    setTotalAmount(newTotalAmount);
    setInvoiceItems(rows);
    console.log("Received rows from InvoucherTable:", rows);
  };

  const handleClientConfirm = (selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
  };

  const handleConfirm = (data) => {
    setReceiverInfo(data);
    console.log("Received Data:", data);
  };

  const generateVoucherNumber = () => {
    if (voucherSequence === null) return "PLINV-Loading...";
    const sequenceStr = voucherSequence.toString().padStart(3, "0");
    return `PLINV-${sequenceStr}`;
  };

  useEffect(() => {
    const fetchLastVoucherData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/invouchers/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vouchers = await response.json();
        if (vouchers && vouchers.length > 0) {
          const lastVoucher = vouchers.reduce((max, voucher) =>
            parseInt(voucher.voucher_id) > parseInt(max.voucher_id) ? voucher : max
          );
          const nextVoucherId = lastVoucher.voucher_id + 1;
          setVoucherId(nextVoucherId);

          const lastSequence = vouchers
            .map((voucher) => {
              const match = voucher.voucher_number.match(/^PLINV-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);
          setVoucherSequence(lastSequence + 1);
        } else {
          setVoucherId("1");
          setVoucherSequence(1);
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setVoucherId("1");
        setVoucherSequence(1);
        setSubmitStatus("Error fetching last voucher data, starting with 1");
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
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.success(submitStatus, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    }
  }, [submitStatus]);


const handleSubmit = async () => {
  if (!selectedCustomer || !receiverInfo) {
    setSubmitStatus("Please complete all required fields (Customer and Receiver Info)");
    console.log("Missing required fields:", { selectedCustomer, receiverInfo });
    return;
  }

  if (voucherId === null || voucherSequence === null) {
    setSubmitStatus("Voucher data not yet loaded, please wait");
    console.log("Voucher data not loaded:", { voucherId, voucherSequence });
    return;
  }

  if (invoiceItems.length === 0) {
    setSubmitStatus("Please add at least one item to the invoice");
    console.log("No invoice items provided");
    return;
  }

  setIsSubmitting(true);
  setSubmitStatus(null);

  const voucherNumber = generateVoucherNumber();
  const invoiceData = {
    voucher_id: voucherId,
    voucher_number: voucherNumber,
    transaction_type: receiverInfo?.transactionType || "",
    voucher_date: new Date().toISOString().split("T")[0],
    client_id: selectedCustomer?.id || "3",
    invoice_number: receiverInfo?.InvoiceNumber || "",
    invoice_date: receiverInfo?.InvoiceDate || "",
    mode_of_transport: receiverInfo?.ModeofTransport || "",
    number_of_packages: parseInt(receiverInfo?.NumberofPackages) || 0,
    freight_status: receiverInfo?.Freight || "",
    total_amount: totalAmount,
    remarks: document.querySelector(".tm_remarks_box")?.value || "Urgent delivery",
  };

  try {
    // Step 1: Submit the invoice
    console.log("Submitting Invoice Data:", invoiceData);
    const invoiceResponse = await fetch("https://api.panvic.in/invouchers/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(invoiceData),
    });

    if (!invoiceResponse.ok) {
      const errorData = await invoiceResponse.json();
      console.error("Invoice submission failed:", errorData);
      throw new Error(
        `HTTP error submitting invoice! status: ${invoiceResponse.status} - ${JSON.stringify(errorData)}`
      );
    }

    const invoiceResult = await invoiceResponse.json();
    console.log("Invoice submission response:", invoiceResult);

    // Step 2: Extract the correct ID
    const newVoucherId = invoiceResult.id;
    console.log("New Voucher ID (from id):", newVoucherId);

    if (!newVoucherId) {
      console.error("No id field in invoiceResult:", invoiceResult);
      throw new Error("No valid id returned from invoice creation. Check API response.");
    }

    // Step 3: Submit invoice items
    console.log("Submitting Invoice Items:", invoiceItems);
    for (const item of invoiceItems) {
      const itemData = {
        product_id: item.itemcode,
        item_name: item.itemname,
        unit: item.unit,
        rack_code: item.rackcode,
        quantity: parseInt(item.quantity),
        rate: parseFloat(item.rate),
        discount_percentage: parseFloat(item.discount_percentage || 0),
        additional_discount_percentage: parseFloat(item.additional_discount_percentage || 0),
        amount: parseFloat(item.amount),
        comments: item.comments || "",
      };

      const itemUrl = `https://api.panvic.in/invouchers/${newVoucherId}/items`;
      console.log("Submitting item to:", itemUrl, "with data:", itemData);

      const itemsResponse = await fetch(itemUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      });

      if (!itemsResponse.ok) {
        const errorData = await itemsResponse.json();
        console.error("Item submission failed:", errorData);
        throw new Error(
          `HTTP error submitting item! status: ${itemsResponse.status} - ${JSON.stringify(errorData)}`
        );
      }

      const itemsResult = await itemsResponse.json();
      console.log("Item submitted successfully:", itemsResult);
      
    }

    // Success: Update state and notify user
    setSubmitStatus("Invoice and items submitted successfully!");
    window.location.href = "/getinvouchers";
    setVoucherSequence((prev) => prev + 1);
    setVoucherId(invoiceResult.voucher_id + 1);
    setSelectedCustomer(null);
    setReceiverInfo(null);
    setInvoiceItems([]);
    setTotalAmount(0);
  } catch (error) {
    setSubmitStatus("Error submitting invoice or items: " + error.message);
    console.error("Submission Error:", error);
  } finally {
    setIsSubmitting(false);
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
                  IN VOUCHER
                </div>
                <p className="tm_invoice_number tm_m0">
                  Voucher No: <b className="tm_primary_color">{generateVoucherNumber()}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Transaction Types: <b>{receiverInfo?.transactionType || "N/A"}</b>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">{new Date().toLocaleDateString()}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_head tm_mb10" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">Supplier Details:</b>{" "}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setShowModalClientDetails(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                <p style={{ textAlign: "justify" }}>
                  Name: <b>{selectedCustomer?.client_name || "Not Selected"}</b> <br />
                  Address: <b>{selectedCustomer?.address || "N/A"}</b> <br />
                  City: <b>{selectedCustomer?.city || "N/A"}</b>, State: <b>{selectedCustomer?.state || "N/A"}</b> | Pincode: <b>{selectedCustomer?.pincode || "N/A"}</b> <br />
                  Phone: <b>{selectedCustomer?.client_phone || "N/A"}</b> <br />
                  GST NO: <b>{selectedCustomer?.gst_number || "N/A"}</b>
                </p>
                Freight: <b>{receiverInfo?.Freight || "N/A"}</b>
              </div>
              <div className="tm_invoice_right tm_text_right" style={{ flex: 1, textAlign: "right" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">Receiver Details:</b>
                  {InfoModal && (
                    <ReciverDetails setInfoModal={setInfoModal} onConfirm={handleConfirm} />
                  )}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setInfoModal(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                Invoice Number: <b>{receiverInfo?.InvoiceNumber || "N/A"}</b> <br />
                Invoice Date: <b>{receiverInfo?.InvoiceDate || "N/A"}</b> <br />
                Mode of Transport: <b>{receiverInfo?.ModeofTransport || "N/A"}</b> <br />
                Number of Packages: <b>{receiverInfo?.NumberofPackages || "N/A"}</b> <br />
              </div>
            </div>
            <p className="tm_mb2">
              <b className="tm_primary_color">Product Info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <InvoucherTable onTotalAmountChange={handleTotalAmountChange} />
                  {showModalClientDetails && (
                    <CustomerModal onClose={closeModal} client={showModalClientDetails} onConfirm={handleClientConfirm} />
                  )}
                </div>
              </div>
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0">
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Remarks If Any:</b>
                  </p>
                  <textarea
                    className="form-control tm_remarks_box"
                    placeholder="Enter remarks here..."
                    rows="4"
                    cols="50"
                  ></textarea>
                </div>
                <div className="tm_right_footer">
                  <table>
                    <tbody>
                      <tr>
                        <td className="tm_width_2 tm_primary_color tm_border_none tm_bold">
                          Total Amount Without GST
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="tm_invoice_btns tm_hide_print">
          <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
            <span className="tm_btn_icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                <path
                  d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 0 00-40 40v160a40.12 40.12 0 0040 40h24"
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
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
            <span className="tm_btn_icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                <path
                  d="M320 336h76c55 0 100-21.21 100-75.6s-53-73.47-96-75.6C391.11 99.74 329 48 256 48c-69 0-113.44 45.79-128 91.2-60 5.7-112 35.88-112 98.4S70 336 136 336h56M192 400.1l64 63.9 64-63.9M256 224v224.03"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="32"
                ></path>
              </svg>
            </span>
            <span className="tm_btn_text">Download</span>
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="tm_invoice_btn tm_color1"
            disabled={isSubmitting}
          >
            <span className="tm_btn_icon">
              <i className="fa-solid fa-floppy-disk"></i>
            </span>
            <span className="tm_btn_text">{isSubmitting ? "Submitting..." : "Submit"}</span>
          </button>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default AddInvoice;