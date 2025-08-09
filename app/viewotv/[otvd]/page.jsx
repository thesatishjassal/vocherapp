"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import OutvoucherTable from "../../components/viewOutvocuherTable";

const INVOCHER_API_URL = "https://api.panvic.in/outvouchers";
const CLIENT_API_URL = "https://api.panvic.in/clients/";

const OutvoucherDetail = () => {
  const { otvd } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Invoucher Details
  useEffect(() => {
    if (!otvd) return;

    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`${INVOCHER_API_URL}/${otvd}`, {
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
  }, [otvd]);

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
                  OUT VOUCHER
                </div>
                <p className="tm_invoice_number">
                  Voucher No:{" "}
                  <b className="tm_primary_color">#{voucher.voucher_no}</b>
                </p>
              </div>
            </div>

            {/* Voucher Info */}
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number">
                  Transaction Type: <b>{voucher && voucher.transaction_types}</b>
                </p>
                {/* <p className="tm_invoice_date">
                  Date:{" "}
                  <b className="tm_primary_color">{voucher && voucher.transport}</b>
                </p> */}
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
                      <b className="tm_primary_color">Client Details:</b>{" "}
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
                  </div>
                </div>
              )}
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
                Issue Slip No:
                <b> {voucher && voucher.issue_slip_no}</b> <br />
                Sale Order No:
                <b> {voucher && voucher.sale_order_no} </b>
                <br />
                Transport: <b>{voucher && voucher.transport}</b> <br />
                Vehicle No: <b>{voucher && voucher.vehicle_no}</b> <br />
              </div>
            </div>

            <div className="d-flex py-2 px-0 no-top-border">
              <div className="flex-grow-1 py-0 pl-0 no-top-border">
                Package <b>{voucher && voucher.number_of_packages}</b>
              </div>
              <div className="flex-grow-1 py-0 no-top-border">
                Order BY: <b>{voucher && voucher.ordered_by}</b>
              </div>
              <div className="flex-grow-1 py-0 no-top-border">
                Sale Person: <b>{voucher && voucher.sales_person}</b>
              </div>
              <div className="flex-grow-1 py-0 no-top-border">
                Freight Amount: <b>{voucher && voucher.freight_amount}</b>
              </div>
            </div>
            <p>
              <b className="tm_primary_color">Product Info:</b>
            </p>
            <OutvoucherTable voucher_id={otvd} />
            {/* Total Amount */}
            <div className="container mt-4">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Receiver Name:</strong> {voucher && voucher.receiver_name}</p>
                <p><strong>Receiver Mobile:</strong>{voucher & voucher.mobile_number}</p>
              </div>
              <div className="col-md-6 text-right">
                <p><strong>Manager's Signature:</strong></p>
                <div className="border-top mt-5"></div>
              </div>
            </div>
          </div>
            {/* Buttons */}
          </div>
        </div>{" "}
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

export default OutvoucherDetail;
