"use client"
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import QuotationItemsTable from "../../components/QuotationItemsTable";

const HISTORY_API_URL = "https://api.panvic.in/quotation-history/";

const ViewQuotation = () => {
  const { quote } = useParams();
  const QUOTATION_API_URL = "https://api.panvic.in/quotation";
  const CLIENT_API_URL = "https://api.panvic.in/clients/";
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revisionHistory, setRevisionHistory] = useState([]);
  const [selectedRevision, setSelectedRevision] = useState(null);

  useEffect(() => {
    if (!quote) return;

    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`${QUOTATION_API_URL}/${quote}`, {
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
    console.log(quotation)
    fetchQuotation();
  }, [quote]);

  const fetchClient = async (client_id) => {
    try {
      const response = await axios.get(CLIENT_API_URL, { withCredentials: true });
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
      const response = await axios.get(`${HISTORY_API_URL}?quotation_id=${quotationId}`, {
        withCredentials: true,
      });
      setRevisionHistory(response.data);
      if (response.data.length > 0) {
        setSelectedRevision(response.data[0]); // Default to latest revision
      }
    } catch (error) {
      console.error("Failed to fetch revision history:", error);
      toast.error("Failed to load revision history!");
    }
  };

  const handleRevisionChange = (e) => {
    const revisionId = parseInt(e.target.value);
    const selected = revisionHistory.find((rev) => rev.id === revisionId);
    setSelectedRevision(selected);
  };

  if (loading) return <p>Loading...</p>;
  if (!quotation) return <p>No quotation found!</p>;

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
                  IN QUOTATION
                </div>
                <p className="tm_invoice_number">
                  Quotation No:
                  <b className="tm_primary_color">#{quotation.quotation_id}</b>
                </p>
              </div>
            </div>

            <div className="tm_mb20">
              <label htmlFor="revisionSelect" className="tm_primary_color">
                Select Revision:
              </label>
              <select
                id="revisionSelect"
                className="form-select w-auto d-inline-block ms-2"
                onChange={handleRevisionChange}
                value={selectedRevision?.id || ""}
              >
                <option value="">Latest Version</option>
                {revisionHistory.map((rev) => (
                  <option key={rev.id} value={rev.id}>
                    Edited on: {new Date(rev.edited_at).toLocaleString()}
                  </option>
                ))}
              </select>
              {selectedRevision && (
                <p className="mt-2">
                  Selected Revision Edited At:{" "}
                  <b>{new Date(selectedRevision.edited_at).toLocaleString()}</b>
                </p>
              )}
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
                <div className="tm_invoice_head tm_mb10">
                  <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
                    <p className="tm_mb2">
                      <b className="tm_primary_color">Supplier Details:</b>
                    </p>
                    <p style={{ textAlign: "justify" }}>
                      Name: <b>{client.client_name}</b> <br />
                      City: <b>{client.city}</b>
                    </p>
                  </div>
                </div>
              )}
              <div className="tm_invoice_right tm_text_right" style={{ flex: 1, textAlign: "right" }}>
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                </p>
                Address:
                <b>
                  Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar City, Punjab-144003
                </b>
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Salesperson: {quotation && <b>{quotation.salesperson}</b>}
                <br />
              </div>
            </div>
            <div className="d-flex mb-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="tm_mb2">
                Subject: {quotation && <b className="tm_primary_color">{quotation.subject}</b>}
              </p>
            </div>
            <p>
              <b className="tm_primary_color">Product Info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <QuotationItemsTable
                    quotation_id={quote}
                    selectedRevision={selectedRevision}
                  />
                </div>
              </div>
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0"></div>
                <div className="tm_right_footer"></div>
              </div>
            </div>
            <hr />
            <p>
              <b>
                <i>Thank You for considering us for your needs. Here is the proposal as you requested.</i>
              </b>
            </p>
            <div className="term_box">
              <h6>Terms and Conditions:</h6>
              <p>GST: <b>Including in above prices as per applicable.</b></p>
              <p>Payment Terms: <b>100% in advance with order.</b></p>
              <p>Validity: <b>15 days from the date of quotation.</b></p>
              <p className="m-0">Warranty/Guarantee: <b>as per company norms.</b></p>
              <p>Responsibility: <b>Our responsibility for material counting ceases immediately after delivery.</b></p>
              <p>Installation & Fixing: <b>If required, for any electrical job, we will arrange a technician at extra cost. Installation will take 4-5 days from the date of order.</b></p>
              <p>Freight Charges: <b>Extra as per actual.</b></p>
              <p>Bank Details: <b>PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar.<br /> We hope you will find our offer in quotation and look forward to your positive response. Please feel free to contact us for any queries.</b></p>
              <hr />
              <p>For:- Panvik Lighting This is a computer generated document, hence signature is not required.</p>
            </div>
            <div className="tm_invoice_btns tm_hide_print">
              <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
                <span className="tm_btn_text">Print</span>
              </button>
              <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
                <span className="tm_btn_text">
                  <img src="https://static.vecteezy.com/system/resources/previews/042/127/116/non_2x/whatsapp-square-logo-on-a-transparent-background-free-png.png" alt="" className="share_icon" />
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="tm_invoice_btns tm_hide_print">
          <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
            <span className="tm_btn_icon">
              <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                <path d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 40.12 0 00-40 40v160a40.12 40.12 0 0040 40h24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" />
                <rect x="128" y="240" width="256" height="208" rx="24.32" ry="24.32" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" />
                <path d="M384 128v-24a40.12 40.12 0 00-40-40H168a40.12 40.12 0 00-40 40v24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32" />
                <circle cx="392" cy="184" r="24" fill="currentColor" />
              </svg>  
            </span>
            <span className="tm_btn_text">Print</span>
          </button>
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
            <span className="tm_btn_icon">
              <img src="/assets/img/whatsapp-square.webp" alt="" className="share_icon" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewQuotation;