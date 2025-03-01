"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import InvoucherTable from "../../components/InvoucherItems";

const INVOCHER_API_URL = "https://api.panvic.in/invouchers";
const CLIENT_API_URL = "https://api.panvic.in/clients";

const InvoucherDetail = () => {
  const { ivid } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

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

          // If the voucher contains a clientId, fetch client details
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

  if (loading) return <p>Loading...</p>;
  if (!voucher) return <p>No voucher found!</p>;

  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
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
                  <b className="tm_primary_color">#{voucher.voucherNo}</b>
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
                  Date:{" "}
                  <b className="tm_primary_color">{voucher.invoice_date}</b>
                </p>
              </div>
            </div>

            {/* Supplier & Receiver Details */}
            <div className="tm_invoice_head tm_mb10">
              {/* Client Details */}
              {client && (
                <div className="tm_invoice_head tm_mb10">
                  <div
                    className="tm_invoice_left mt-0"
                    style={{ flex: 1, textAlign: "left" }}
                  >
                    <p className="tm_mb2">
                      <b className="tm_primary_color">Supplier Details:</b>{" "}
                    </p>
                    <p style={{ textAlign: "justify" }}>
                      Name: <b>{client.client_name}</b> <br />
                      Address: <b>{client.address}</b> <br />
                      City: <b>{client.city}</b>, State: <b>{client.state}</b> |
                      Pincode: <b>{client.pincode}</b> <br />
                      Phone: <b>{client.client_phone}</b>
                      <br />
                      GST NO: <b>{client.gst_number}</b>
                    </p>
                    Freight: <b>{voucher && voucher.freight_status}</b>
                  </div>
                </div>
              )}
              <div className="tm_invoice_right tm_text_right">
                <p>
                  <b className="tm_primary_color">Receiver Details:</b>
                </p>
                <p>
                  Invoice No: <b>{voucher.invoice_number}</b>
                  <br />
                  Invoice Date: <b>{voucher.invoice_date}</b>
                  <br />
                  Number of Packages: <b>{voucher.number_of_packages}</b>
                  <br />
                  Transport: <b>{voucher.mode_of_transport}</b>
                  <br />
                </p>
              </div>
            </div>

            {/* Product Info */}
            <p>
              <b className="tm_primary_color">Product Info:</b>
            </p>
            <InvoucherTable invoucherId={ivid} />
            {/* Total Amount */}
            <div className="tm_invoice_footer my-2">
              <div className="tm_right_footer">
                <table>
                  <tbody>
                    <tr>
                      <td className="tm_primary_color tm_border_none tm_bold px-0">
                        Total Amount Without GST
                      </td>
                      <td className="tm_primary_color tm_text_right tm_border_none tm_bold">
                        {voucher.total_amount?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* Buttons */}
            <div className="tm_invoice_btns tm_hide_print">
              <button
                type="button"
                onClick={() => window.print()}
                className="tm_invoice_btn tm_color1"
              >
                <span className="tm_btn_text">Print</span>
              </button>
              <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
                <span className="tm_btn_text">Download</span>
              </button>
            </div>
          </div>
        </div>{" "}
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
        </div>
      </div>
    </div>
  );
};

export default InvoucherDetail;
