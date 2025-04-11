"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import QuotationItemsTable from "../../components/QuotationItemsTable";
import SalesItemsTable from "../../components/SalesItemsTable";

const HISTORY_API_URL = "https://api.panvic.in/quotation-history/";
const QUOTATION_API_URL = "https://api.panvic.in/quotation";
const CLIENT_API_URL = "https://api.panvic.in/clients/";

const ViewSales = () => {
  const { sales } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);

  useEffect(() => {
    if (!sales) return;

    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`${QUOTATION_API_URL}/${sales}`, {
          withCredentials: true,
        });
        if (response.data) {
          setQuotation(response.data);
          if (response.data.client_id) {
            fetchClient(response.data.client_id);
          }
          fetchRevisionHistory(response.data.quotation_id);
        } else {
          toast.error("No quotation found!");
        }
      } catch (error) {
        toast.error("Failed to load quotation details!");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [sales]);

  const fetchClient = async (client_id) => {
    try {
      const response = await axios.get(CLIENT_API_URL, {
        withCredentials: true,
      });
      const filteredClient = response.data.find((c) => c.id === client_id);
      if (filteredClient) {
        setClient(filteredClient);
      } else {
        toast.error("Client not found!");
      }
    } catch (error) {
      toast.error("Failed to load client details!");
    }
  };

  const fetchRevisionHistory = async (quotationId) => {
    try {
      const response = await axios.get(
        `${HISTORY_API_URL}?quotation_id=${quotationId}`,
        {
          withCredentials: true,
        }
      );

      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("API Response:", response.data); // Debugging

        // Sort by `edited_at` in descending order (latest first)
        const sortedRevisions = response.data
          .filter((revision) => revision.edited_at) // Ensure `edited_at` exists
          .sort((a, b) => new Date(b.edited_at) - new Date(a.edited_at));

        // Set to state
        setRevisionHistory(sortedRevisions);
        setSelectedRevision(sortedRevisions[0]); // Default to latest revision
      } else {
        setRevisionHistory([]); // No history found
        setSelectedRevision(null);
      }
    } catch (error) {
      console.error("Error fetching revision history:", error);
      toast.error("Failed to load revision history!");
    }
  };

  const handleRevisionChange = (e) => {
    const revisionId = parseInt(e.target.value);
    const selected = revisionHistory.find((rev) => rev.id === revisionId);
    setSelectedRevision(selected || null);
    console.log("Selected Revision:", selected); // Debugging
  };

  if (loading) return <p>Loading...</p>;
  if (!quotation) return <p>No quotation found!</p>;

  // Use selectedRevision if available, otherwise fall back to quotation
  const displayData = selectedRevision || quotation || {};

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
                  SALES ORDERS
                </div>
                <p className="tm_invoice_number">
                  Sale Order No:{" "}
                  <b className="tm_primary_color">#{quotation.quotation_id}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number">
                  Date: <b>11/03/2025</b>
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
                    <b className="tm_primary_color">Supplier Details:</b>
                  </p>
                  <p>
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
                Address:
                <b>
                  Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar
                  City, Punjab-144003
                </b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Salesperson: {quotation && <b>{quotation.salesperson}</b>}
              </div>
            </div>

            <p>
              <b className="tm_primary_color">Product Info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <SalesItemsTable
                    quotation_id={sales}
                    selectedRevision={selectedRevision}
                  />
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
                  defaultValue={displayData.remarks || ""}
                ></textarea>
              </div>

              <div className="tm_right_footer">
                <table>
                  <tbody>
                    {quotation && quotation.without_gst !== 0 ? (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                          <p className="m-0">Without GST:</p>
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
                          <p className="m-0">Total Amount with GST:</p>
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
            <div className="term_box">
              <p>
                For:- Panvik Lighting This is a computer generated
                document,hence signature is not required.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="tm_invoice_btns">
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
        {/* <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
          <span className="tm_btn_icon">
            <i className="fa-brands fa-whatsapp"></i>
          </span>
          <span className="tm_btn_text">Share</span>
        </button> */}
      </div>
    </div>
  );
};

export default ViewSales;
