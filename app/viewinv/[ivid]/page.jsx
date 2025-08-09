"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import InvoucherTable from "../../components/InvoucherItems";

const INVOCHER_API_URL = "https://api.panvic.in/invouchers";
const CLIENT_API_URL = "https://api.panvic.in/clients/";

const InvoucherDetail = () => {
  const { ivid } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef(null); // Ref to capture invoice content

  // Fetch Invoucher Details
  useEffect(() => {
    if (!ivid) return;

    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`${INVOCHER_API_URL}/${ivid}`, {
          withCredentials: true,
        });
        console.log(response.data);
        if (response.data) {
          setVoucher(response.data);
          if (response.data.client_id) {
            fetchClient(response.data.client_id);
          }
        } else {
          toast.error("No voucher found!");
        }
      } catch (error) {
        toast.error("Failed to load voucher details!");
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [ivid]);

  // Fetch Client Details
  const fetchClient = async (client_id) => {
    try {
      const response = await axios.get(CLIENT_API_URL, {
        withCredentials: true,
      });
      const filteredClient = response.data.find((c) => c.id === client_id);
      console.log(filteredClient);
      if (filteredClient) {
        setClient(filteredClient);
      } else {
        toast.error("Client not found!");
      }
    } catch (error) {
      toast.error("Failed to load client details!");
    }
  };

  // Calculate display amounts based on GST fields
  const calculateDisplayAmounts = () => {
    const baseAmount = voucher.gst_option === "Exclude" ? voucher.total_amount - (voucher.gst_amount || 0) : voucher.total_amount;
    const gstAmount = voucher.gst_option === "Exclude" ? voucher.gst_amount || 0 : 0;
    const totalWithGst = voucher.total_amount;

    return { baseAmount, gstAmount, totalWithGst };
  };

  // Generate PDF
  const generatePDF = async () => {
    const element = invoiceRef.current;
    if (!element) return;

    try {
      // Temporarily hide no-print elements
      const noPrintElements = element.querySelectorAll(".no-print");
      noPrintElements.forEach((el) => (el.style.display = "none"));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for external images (e.g., logo)
        windowHeight: 842, // A4 height in points (297mm at 72dpi)
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgWidth = 190; // A4 width (210mm - 10mm margins)
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 10; // Top margin
      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page content
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoucher_${voucher.voucher_number}.pdf`);

      // Restore no-print elements
      noPrintElements.forEach((el) => (el.style.display = ""));
    } catch (error) {
      toast.error("Failed to generate PDF!");
      console.error(error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!voucher) return <p>No voucher found!</p>;

  const { baseAmount, gstAmount, totalWithGst } = calculateDisplayAmounts();

  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap" ref={invoiceRef}>
        <div className="tm_invoice tm_style1">
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
                  IN VOUCHER
                </div>
                <p className="tm_invoice_number">
                  Voucher No:{" "}
                  <b className="tm_primary_color">#{voucher.voucher_number}</b>
                </p>
              </div>
            </div>

            {/* Voucher Info */}
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number">
                  Transaction Type: <b>{voucher.transaction_type}</b>
                </p>
                <p className="tm_invoice_date">
                  Date: <b className="tm_primary_color">{voucher.voucher_date}</b>
                </p>
              </div>
            </div>

            {/* Supplier & Receiver Details */}
            <div className="tm_invoice_head tm_mb10">
              {client && (
                <div className="tm_invoice_head tm_mb10">
                  <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
                    <p className="tm_mb2">
                      <b className="tm_primary_color">Client Details:</b>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                      Name: <b>{client.client_name}</b> <br />
                      Address: <b>{client.address}</b> <br />
                      City: <b>{client.city}</b>, State: <b>{client.state}</b> | Pincode: <b>{client.pincode}</b> <br />
                      Phone: <b>{client.client_phone}</b> <br />
                      GST NO: <b>{client.gst_number}</b>
                    </p>
                    Freight: <b>{voucher.freight_status}</b>
                  </div>
                </div>
              )}
              <div className="tm_invoice_right tm_text_right">
                <p>
                  <b className="tm_primary_color">Receiver Details:</b>
                </p>
                <p>
                  Invoice No: <b>{voucher.invoice_number}</b> <br />
                  Invoice Date: <b>{voucher.invoice_date}</b> <br />
                  Number of Packages: <b>{voucher.number_of_packages}</b> <br />
                  Transport: <b>{voucher.mode_of_transport}</b> <br />
                </p>
              </div>
            </div>

            {/* Product Info */}
            <p>
              <b className="tm_primary_color">Product Info:</b>
            </p>
            <InvoucherTable invoucherId={ivid} />

            {/* Fixed Footer */}
            <div className="tm_invoice_footer">
              <div className="tm_right_footer">
                <table>
                  <tbody>
                    <tr>
                      <td className="tm_primary_color tm_border_none tm_bold px-0">
                        Total Amount Without GST
                      </td>
                      <td className="tm_primary_color tm_text_right tm_border_none tm_bold">
                        {baseAmount.toFixed(2)}
                      </td>
                    </tr>
                    {voucher.gst_option === "Exclude" && (
                      <tr>
                        <td className="tm_primary_color tm_border_none px-0">
                          GST ({voucher.gst_percentage}%)
                        </td>
                        <td className="tm_primary_color tm_text_right tm_border_none">
                          {gstAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className="tm_primary_color tm_border_none tm_bold px-0">
                        Total Amount {voucher.gst_option === "Include" ? "(GST Inclusive)" : "(With GST)"}
                      </td>
                      <td className="tm_primary_color tm_text_right tm_border_none tm_bold">
                        {totalWithGst.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className="tm_invoice_btns no-print">
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
            type="button"
            onClick={generatePDF}
            className="tm_invoice_btn tm_color2"
          >
            <span className="tm_btn_icon">
              <i className="fa-solid fa-file-pdf"></i>
            </span>
            <span className="tm_btn_text">Download PDF</span>
          </button>
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
            <span className="tm_btn_icon">
              <i className="fa-brands fa-whatsapp"></i>
            </span>
            <span className="tm_btn_text">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoucherDetail;