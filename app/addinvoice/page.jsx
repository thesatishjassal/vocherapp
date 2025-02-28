"use client";
import InvoucherTable from "../components/InvoucherTable";
import ReciverDetails from "../components/Reciverdeatails";
import { useState, useEffect } from "react";
import CustomerModal from "../components/customerModal";
import { ToastContainer, toast } from "react-toastify"; // Import react-toastify
import "react-toastify/dist/ReactToastify.css"; // Import CSS for react-toastify

const AddInvoice = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [voucherSequence, setVoucherSequence] = useState(null); // Start as null until fetched
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
    console.log(selectedClient);
  };

  const handleConfirm = (data) => {
    setReceiverInfo(data);
    console.log("Received Data:", data);
  };

  const generateVoucherNumber = () => {
    if (voucherSequence === null) return "PLINV-Loading..."; // Display loading until sequence is fetched
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
            // Add authentication headers if required
            // "Authorization": "Bearer your-token-here"
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const vouchers = await response.json();
        if (vouchers && vouchers.length > 0) {
          // Find the highest voucher_id
          const lastVoucher = vouchers.reduce((max, voucher) =>
            voucher.voucher_id > max.voucher_id ? voucher : max
          );
          setVoucherId(lastVoucher.voucher_id + 1);

          // Find the highest sequence number from voucher_number
          const lastSequence = vouchers
            .map((voucher) => {
              const match = voucher.voucher_number.match(/^PLINV-(\d+)$/);
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);
          setVoucherSequence(lastSequence + 1);
        } else {
          setVoucherId(1);
          setVoucherSequence(1); // Start with 1 if no vouchers exist
        }
      } catch (error) {
        console.error("Error fetching vouchers:", error);
        setVoucherId(1);
        setVoucherSequence(1); // Fallback to 1 on error
        setSubmitStatus("Error fetching last voucher data, starting with 1");
      }
    };

    fetchLastVoucherData();
  }, []);

  // Effect to display toast notifications when submitStatus changes
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
      console.log(selectedCustomer);
      console.log(receiverInfo);
      setSubmitStatus("Please complete all required fields");
      return;
    }

    if (voucherId === null || voucherSequence === null) {
      setSubmitStatus("Voucher data not yet loaded, please wait");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const voucherNumber = generateVoucherNumber();

    console.log("Voucher ID:", voucherId);
    console.log("Voucher Number:", voucherNumber);
    console.log("Transaction Type:", receiverInfo?.transactionType || "");
    console.log("Voucher Date:", new Date().toISOString().split('T')[0]);
    console.log("Client ID:", selectedCustomer?.id);
    console.log("Invoice Number:", receiverInfo?.InvoiceNumber || "");
    console.log("Invoice Date:", receiverInfo?.InvoiceDate || "");
    console.log("Mode of Transport:", receiverInfo?.ModeofTransport || "");
    console.log("Number of Packages:", parseInt(receiverInfo?.NumberofPackages) || 0);
    console.log("Freight Status:", receiverInfo?.Freight || "");
    console.log("Total Amount:", totalAmount);
    console.log("Remarks:", document.querySelector(".tm_remarks_box")?.value || "");
    console.log("Invoice Items:", invoiceItems);

    const invoiceData = {
      voucher_id: voucherId,
      voucher_number: voucherNumber,
      transaction_type: receiverInfo?.transactionType || "",
      voucher_date: new Date().toISOString().split('T')[0],
      client_id: selectedCustomer?.id || 3,
      invoice_number: receiverInfo?.InvoiceNumber || "",
      invoice_date: receiverInfo?.InvoiceDate || "",
      mode_of_transport: receiverInfo?.ModeofTransport || "",
      number_of_packages: parseInt(receiverInfo?.NumberofPackages) || 0,
      freight_status: receiverInfo?.Freight || "",
      total_amount: totalAmount,
      remarks: document.querySelector(".tm_remarks_box")?.value || "Urgent delivery",
      items: invoiceItems,
    };

    try {
      const response = await fetch("https://api.panvic.in/invouchers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmitStatus("Invoice submitted successfully!");
      console.log("Success:", result);
      setVoucherSequence((prev) => prev + 1); // Increment for next voucher_number
      setVoucherId((prev) => prev + 1); // Increment for next voucher_id
    } catch (error) {
      setSubmitStatus("Error submitting invoice: " + error.message);
      console.error("Error:", error);
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
                  Transaction Types:
                  <b>{receiverInfo && receiverInfo.transactionType}</b>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">01.07.2022</b>
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
              {/* Left Column */}
              <div
                className="tm_invoice_left mt-0"
                style={{ flex: 1, textAlign: "left" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">Supplier Details:</b>{" "}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print "
                    onClick={() => setShowModalClientDetails(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                <p style={{ textAlign: "justify" }}>
                  Name: <b>{selectedCustomer.client_name}</b> <br />
                  Address: <b>{selectedCustomer.address}</b> <br />
                  City: <b>{selectedCustomer.city}</b>, State:{" "}
                  <b>{selectedCustomer.state}</b> | Pincode:{" "}
                  <b>{selectedCustomer.pincode}</b> <br />
                  Phone: <b>{selectedCustomer.client_phone}</b>
                  <br />
                  GST NO: <b>{selectedCustomer.gst_number}</b>
                </p>
                Freight: <b>{receiverInfo && receiverInfo.Freight}</b>
              </div>

              {/* Right Column */}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">Reciver Details:</b>
                  {InfoModal && (
                    <ReciverDetails
                      setInfoModal={setInfoModal}
                      onConfirm={handleConfirm}
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
                Invoice Number:{" "}
                <b>{receiverInfo && receiverInfo.InvoiceNumber}</b> <br />
                Invoice Date: <b>{receiverInfo && receiverInfo.InvoiceDate}</b>{" "}
                <br />
                Mode of Transport:{" "}
                <b>{receiverInfo && receiverInfo.ModeofTransport}</b> <br />
                Number of Packages:{" "}
                <b>{receiverInfo && receiverInfo.NumberofPackages}</b> <br />
                <br />
              </div>
            </div>
            <p className="tm_mb2">
              <b className="tm_primary_color">Product info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <InvoucherTable
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
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Remarks If any:</b>
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
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
            <span className="tm_btn_icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ionicon"
                viewBox="0 0 512 512"
              >
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
            // disabled={isSubmitting}
          >
            <span className="tm_btn_icon">
              <i className="fa-solid fa-floppy-disk"></i>
            </span>
            <span className="tm_btn_text">Submit</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;