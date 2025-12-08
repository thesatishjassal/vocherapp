"use client";
import axios from "axios";
import QuotationItemsTable from "../../components/QuotationItemsTable";
// import PrintButton from "../../../components/PrintButton";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const QUOTATION_API_URL = "https://api.panvic.in/quotation";
const CLIENT_API_URL = "https://api.panvic.in/clients/";
import Cookies from "js-cookie";

export default async function ViewQuotation({ params }) {
  const { quote } = params;
  const [userDetails, setUserDetails] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const generateAndUploadPDF = async () => {
    try {
      const invoiceElement = document.querySelector(".tm_invoice_wrap");

      if (!invoiceElement) {
        alert("Invoice not found!");
        return;
      }

      // Capture screenshot (compressed)
      const canvas = await html2canvas(invoiceElement, {
        scale: 1.2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.7);

      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // First page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Additional pages if required
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Convert to Blob
      const pdfBlob = pdf.output("blob");

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", pdfBlob);
      formData.append("upload_preset", "panvik_pdf");
      formData.append("cloud_name", "dfolgsiiv");

      const cloudinaryRes = await axios.post(
        `https://api.cloudinary.com/v1_1/dfolgsiiv/auto/upload`,
        formData
      );

      const pdfUrl = cloudinaryRes.data.secure_url;

      alert("PDF Uploaded Successfully!");
      navigator.clipboard.writeText(pdfUrl);
      console.log("PDF URL:", pdfUrl);
    } catch (error) {
      console.error("PDF ERROR:", error);
      alert("PDF generation failed!");
    }
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch Quotation
        const quotationResponse = await axios.get(
          `${QUOTATION_API_URL}/${quote}`,
          {
            withCredentials: true,
          }
        );

        if (quotationResponse.data) {
          setQuotation(quotationResponse.data);
          // Fetch Client
          if (quotationResponse.data.client_id) {
            const clientResponse = await axios.get(CLIENT_API_URL, {
              withCredentials: true,
            });
            const foundClient = clientResponse.data.find(
              (c) => c.id === quotationResponse.data.client_id
            );
            setClient(foundClient);
            if (!foundClient) {
              setError("Client not found!");
            }
          }
        } else {
          setError("No quotation found!");
        }
      } catch (err) {
        setError("Failed to load quotation details!");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (quote) {
      fetchData();
    }
  }, [quote]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!quotation) {
    return <p>No quotation found!</p>;
  }

  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1">
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
                <p className="tm_invoice_number">
                  Quotation No:{" "}
                  <b className="tm_primary_color">
                    {" "}
                    PLQOT-{quotation.quotation_no}
                  </b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number">
                  Date: <b>{new Date().toLocaleDateString("en-GB")}</b>
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
                  <p>
                    {client.businessname && (
                      <>
                        Business Name: <b>{client.businessname}</b>
                        <br />
                      </>
                    )}

                    {client?.client_name && (
                      <>
                        Name: <b>{client.client_name}</b>
                        <br />
                      </>
                    )}

                    {client?.city && (
                      <>
                        City: <b>{client.city}</b>
                        {client?.client_phone && " | "}
                      </>
                    )}

                    {client?.client_phone && (
                      <>
                        Phone: <b>{client.client_phone}</b>
                        <br />
                      </>
                    )}
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
                Address:
                <b>
                  Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar
                  City, Punjab-144003
                </b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Contact no: <b> 94172-81252,98150-37755 </b> <br />
                Email id: <b> panviklighting@gmail.com </b> <br />
                Salesperson: {quotation && <b>{quotation.salesperson} </b>} |
                Mobile Number : <b>{userDetails ? userDetails.phone : ""}</b>
              </div>
            </div>
            Subject:{" "}
            <span className="tm_primary_color mb-3">
              {quotation && <b>{quotation.subject}</b>}
            </span>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <QuotationItemsTable quotation_id={quotation.quotation_id} />
                </div>
              </div>
            </div>
            <div className="tm_invoice_footer my-2">
              <div className="tm_left_footer px-0">
                <textarea
                  className="form-control tm_remarks_box no-print opacity-0"
                  placeholder="Enter remarks here..."
                  rows="1"
                  cols="30"
                  defaultValue={quotation.remarks || ""}
                  readOnly
                ></textarea>
              </div>

              <div className="tm_right_footer">
                <table>
                  <tbody>
                    {quotation && quotation.without_gst !== 0 ? (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                          <p className="m-0">Included GST:</p>
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {(quotation.without_gst || 0).toFixed(2)}
                        </td>
                      </tr>
                    ) : null}
                    {quotation && quotation.gst_amount !== 0 ? (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                          <p className="m-0">GST Amount:</p>
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {(quotation.gst_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ) : null}
                    {quotation && quotation.amount_with_gst !== 0 ? (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold">
                          <p className="m-0">Total Amount:</p>
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {(quotation.amount_with_gst || 0).toFixed(2)}
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </div>
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
              {/* <p>
                GST: <b>Including in above prices as per applicable.</b>
              </p> */}
              <p>
                Payment Terms: <b>100% in advance with order.</b>
              </p>
              <p>
                Validity: <b>15 days from the date of quotation.</b>
              </p>
              <p className="m-0">
                Warranty/Guarantee:
                <b>
                  as per company norms &nbsp;
                  {quotation && quotation.warranty_guarantee}
                </b>
              </p>
              <p>
                Responsibility:
                <b>
                  Our responsibility for material counting ceases immediately
                  after delivery.
                </b>
              </p>
              <p>
                Installation & Fixing:
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
                Bank Details:
                <b>
                  PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC
                  Code: ICIC0001510, Jalandhar.
                  <br /> We hope you will find our offer in quotation and look
                  forward to your positive response. Please feel free to contact
                  us for any queries.
                </b>
              </p>
              <hr />
              <p>
                For:- Panvik Lighting This is a computer-generated document,
                hence signature is not required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="tm_invoice_btns no-print">
        <button
          onClick={generateAndUploadPDF}
          className="tm_invoice_btn tm_color1 no-print"
        >
          <span className="tm_btn_icon">
            <i className="fa-solid fa-file-pdf"></i>
          </span>
          <span className="tm_btn_text">Generate PDF & Upload</span>
        </button>
        {/* <button
            type="button"
            onClick={() => window.print()}
            className="tm_invoice_btn tm_color1"
          >
            <span className="tm_btn_icon">
              <i className="fa-solid fa-print"></i>
            </span>
            <span className="tm_btn_text">Print</span>
          </button> */}
      </div>
    </div>
  );
}
