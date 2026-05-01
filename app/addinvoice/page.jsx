"use client";
import InvoucherTable from "../components/InvoucherTable";
import ReciverDetails from "../components/Reciverdeatails";
import { useState, useEffect } from "react";
import CustomerModal from "../components/customerModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const AddInvoice = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
  const [gstOption, setGstOption] = useState("Include");
  const [gstPercentage, setGstPercentage] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [userDetails, setUserDetails] = useState(null);

  const closeModal = () => setShowModalClientDetails(false);

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

  const calculateGstAndTotal = () => {
    const baseAmount = totalAmount;
    let gstAmount = 0;
    let totalWithGst = baseAmount;
    if (gstOption === "Exclude" && gstPercentage > 0) {
      gstAmount = (baseAmount * gstPercentage) / 100;
      totalWithGst = baseAmount + gstAmount;
    }
    return { baseAmount, gstAmount, totalWithGst };
  };
  useEffect(() => {
    // Try to get the user_details cookie
    const userDetailsCookie = Cookies.get("user_details");
    console.log("User Details Cookie:", userDetailsCookie);
    if (userDetailsCookie) {
      // Parse and set the user details if the cookie exists
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);
  // fetch next voucher details
  useEffect(() => {
    const fetchLastVoucherData = async () => {
      try {
        const response = await fetch(`${API_URL}/invouchers/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const vouchers = await response.json();
        if (vouchers && vouchers.length > 0) {
          const lastVoucher = vouchers.reduce((max, v) =>
            parseInt(v.voucher_id) > parseInt(max.voucher_id) ? v : max
          );
          const nextVoucherId = lastVoucher.voucher_id + 1;
          setVoucherId(nextVoucherId);

          const lastSequence = vouchers
            .map((v) => {
              const m = v.voucher_number.match(/^PLINV-(\d+)$/);
              return m ? parseInt(m[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);
          setVoucherSequence(lastSequence + 1);
        } else {
          setVoucherId("1");
          setVoucherSequence(1);
        }
      } catch (err) {
        console.error("Error fetching vouchers:", err);
        setVoucherId("1");
        setVoucherSequence(1);
        setSubmitStatus("Error fetching last voucher data, starting with 1");
      }
    };
    fetchLastVoucherData();
  }, []);

  useEffect(() => {
    if (submitStatus) {
      const fn = submitStatus.includes("Error") ? toast.error : toast.success;
      fn(submitStatus, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  }, [submitStatus]);

  const handleSubmit = async () => {
    if (!selectedCustomer || !receiverInfo) {
      setSubmitStatus("Please complete all required fields (Customer and Receiver Info)");
      return;
    }
    if (voucherId === null || voucherSequence === null) {
      setSubmitStatus("Voucher data not yet loaded, please wait");
      return;
    }
    if (invoiceItems.length === 0) {
      setSubmitStatus("Please add at least one item to the invoice");
      return;
    }
    if (gstOption === "Exclude" && gstPercentage <= 0) {
      setSubmitStatus("Please enter a valid GST percentage");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    const voucherNumber = generateVoucherNumber();
    const { baseAmount, gstAmount, totalWithGst } = calculateGstAndTotal();

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
      total_amount: totalWithGst,
      gst_option: gstOption,
      gst_percentage: gstOption === "Exclude" ? parseFloat(gstPercentage) : 0,
      gst_amount: gstAmount,
      remarks: remarks || "Urgent delivery",
      created_by: userDetails ? userDetails.name : "Unknown",
    };

    try {
      // Step 1: Create invoice
      const invoiceResponse = await fetch(`${API_URL}/invouchers/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });
      if (!invoiceResponse.ok) {
        const errorData = await invoiceResponse.json();
        throw new Error(
          `HTTP error submitting invoice! status: ${invoiceResponse.status} - ${JSON.stringify(errorData)}`
        );
      }

      const invoiceResult = await invoiceResponse.json();
      const newVoucherId = invoiceResult.voucher_id;
      if (!newVoucherId) throw new Error("No valid id returned from invoice creation.");

      // Step 2: Submit invoice items
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
          comments: item.comments,
        };

        const itemUrl = `${API_URL}/invouchers/${newVoucherId}/items/`;
        const itemsResponse = await fetch(itemUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        });
        if (!itemsResponse.ok) {
          const errorData = await itemsResponse.json();
          throw new Error(
            `HTTP error submitting item! status: ${itemsResponse.status} - ${JSON.stringify(errorData)}`
          );
        }
      }

      // ✅ Step 3: Update product stock once for all added items
      try {
        const productIds = new Set(invoiceItems.map((i) => i.itemcode));
        const productResponse = await fetch(`${API_URL}/invouchers/products/`);
        if (!productResponse.ok) throw new Error("Failed to fetch product list");
        const products = await productResponse.json();

        const matchedProducts = products.filter((p) => productIds.has(p.itemcode));

        for (const product of matchedProducts) {
          const addedQty = invoiceItems
            .filter((i) => i.itemcode === product.itemcode)
            .reduce((sum, i) => sum + parseInt(i.quantity, 10), 0);

          // Change +addedQty to -addedQty if it's a sales OUT operation
          const newQuantity = (product.quantity || 0) + addedQty;

          const updateRes = await fetch(`${API_URL}/invouchers/products/${product.id}/`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...product, quantity: newQuantity }),
          });

          if (!updateRes.ok) {
            const errData = await updateRes.json();
            console.warn(`Failed to update product ${product.itemcode}:`, errData);
          } else {
            console.log(
              `Stock updated for ${product.itemcode}: ${product.quantity} → ${newQuantity}`
            );
          }
        }
      } catch (err) {
        console.error("Error updating product stocks:", err);
      }

      // Success clean-up
      setSubmitStatus("Invoice, items, and product stocks updated successfully!");
      setVoucherSequence((prev) => prev + 1);
      setVoucherId(newVoucherId);
      setSelectedCustomer(null);
      setReceiverInfo(null);
      setInvoiceItems([]);
      setTotalAmount(0);
      setGstOption("Include");
      setGstPercentage(0);
      setRemarks("");
    } catch (error) {
      setSubmitStatus("Error submitting invoice or items: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { baseAmount, gstAmount, totalWithGst } = calculateGstAndTotal();

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
                <div className="tm_primary_color tm_f50 tm_text_uppercase">IN VOUCHER</div>
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

            <div className="tm_invoice_head tm_mb10" style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">Client Details:</b>{" "}
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
                  City: <b>{selectedCustomer?.city || "N/A"}</b>, State: <b>{selectedCustomer?.state || "N/A"}</b> |
                  Pincode: <b>{selectedCustomer?.pincode || "N/A"}</b> <br />
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

            <p className="tm_mb2"><b className="tm_primary_color">Product Info:</b></p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <InvoucherTable onTotalAmountChange={handleTotalAmountChange} />
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
                    <b className="tm_primary_color">Remarks If Any:</b>
                  </p>
                  <textarea
                    className="form-control tm_remarks_box"
                    placeholder="Enter remarks here..."
                    rows="4"
                    cols="50"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>

                  <div className="tm_gst_section mt-3">
                    <label htmlFor="gstOption" className="tm_primary_color">GST Option:</label>
                    <select
                      id="gstOption"
                      className="form-control"
                      value={gstOption}
                      onChange={(e) => setGstOption(e.target.value)}
                      style={{ width: "150px", marginTop: "5px" }}
                    >
                      <option value="Include">Include</option>
                      <option value="Exclude">Exclude</option>
                    </select>

                    {gstOption === "Exclude" && (
                      <div className="mt-2">
                        <label htmlFor="gstPercentage" className="tm_primary_color">
                          GST Percentage (%):
                        </label>
                        <input
                          id="gstPercentage"
                          type="number"
                          className="form-control"
                          value={gstPercentage}
                          onChange={(e) => setGstPercentage(e.target.value)}
                          min="0"
                          step="0.01"
                          placeholder="Enter GST %"
                          style={{ width: "150px", marginTop: "5px" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="tm_right_footer">
                  <table>
                    <tbody>
                      <tr>
                        <td className="tm_width_2 tm_primary_color tm_border_none tm_bold">
                          Total Amount Without GST
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {baseAmount.toFixed(2)}
                        </td>
                      </tr>
                      {gstOption === "Exclude" && (
                        <tr>
                          <td className="tm_width_2 tm_primary_color tm_border_none">
                            GST ({gstPercentage}%)
                          </td>
                          <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none">
                            {gstAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="tm_width_2 tm_primary_color tm_border_none tm_bold">
                          Total Amount {gstOption === "Include" ? "(GST Inclusive)" : "(With GST)"}
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {totalWithGst.toFixed(2)}
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
