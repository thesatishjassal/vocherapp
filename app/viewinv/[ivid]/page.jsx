"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

const INVOCHER_API_URL = "https://api.panvic.in/invouchers";
const CLIENT_API_URL = "https://api.panvic.in/clients";

const InvoucherDetail = () => {
  const { ivid } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch and filter Invoucher by ID
  useEffect(() => {
    if (!ivid) return;

    const fetchVoucher = async () => {
      try {
        const response = await axios.get(INVOCHER_API_URL, {
          withCredentials: true,
        });

        const filteredVoucher = response.data.find((v) => v.id === ivid);
        if (filteredVoucher) {
          setVoucher(filteredVoucher);

          // Fetch Client details if clientId exists
          if (filteredVoucher.clientId) {
            fetchClient(filteredVoucher.clientId);
          }
        } else {
          toast.error("Voucher not found!");
        }
      } catch (error) {
        toast.error("Failed to load voucher details!");
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [ivid]);

  // Fetch and filter Client by ID
  const fetchClient = async (clientId) => {
    try {
      const response = await axios.get(CLIENT_API_URL, {
        withCredentials: true,
      });

      const filteredClient = response.data.find((c) => c.id === clientId);
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
                  Voucher No: <b className="tm_primary_color">#{voucher.voucherNo}</b>
                </p>
              </div>
            </div>

            {/* Voucher Info */}
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number">
                  Transaction Type: <b>{voucher.transactionType}</b>
                </p>
                <p className="tm_invoice_date">
                  Date: <b className="tm_primary_color">{voucher.date}</b>
                </p>
              </div>
            </div>

            {/* Supplier & Receiver Details */}
            <div className="tm_invoice_head tm_mb10">
              <div className="tm_invoice_left">
                <p><b className="tm_primary_color">Supplier Details:</b></p>
                <p>
                  Name: <b>{voucher.supplierDetails?.name}</b><br />
                  Address: <b>{voucher.supplierDetails?.address}</b><br />
                  Phone: <b>{voucher.supplierDetails?.phone}</b><br />
                  GST NO: <b>{voucher.supplierDetails?.gstNumber}</b>
                </p>
              </div>

              <div className="tm_invoice_right tm_text_right">
                <p><b className="tm_primary_color">Receiver Details:</b></p>
                <p>
                  Invoice No: <b>{voucher.receiverDetails?.invoiceNumber}</b><br />
                  Invoice Date: <b>{voucher.receiverDetails?.invoiceDate}</b><br />
                  Transport: <b>{voucher.receiverDetails?.modeOfTransport}</b><br />
                </p>
              </div>
            </div>

            {/* Client Details */}
            {client && (
              <div className="tm_invoice_head tm_mb10">
                <div className="tm_invoice_left">
                  <p><b className="tm_primary_color">Client Details:</b></p>
                  <p>
                    Name: <b>{client.name}</b><br />
                    Email: <b>{client.email}</b><br />
                    Phone: <b>{client.phone}</b><br />
                    Address: <b>{client.address}</b>
                  </p>
                </div>
              </div>
            )}

            {/* Product Info */}
            <p><b className="tm_primary_color">Product Info:</b></p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucher.productInfo?.map((product, index) => (
                        <tr key={index}>
                          <td>{product.name}</td>
                          <td>{product.quantity}</td>
                          <td>{product.price}</td>
                          <td>{product.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Total Amount */}
            <div className="tm_invoice_footer my-2">
              <div className="tm_right_footer">
                <table>
                  <tbody>
                    <tr>
                      <td className="tm_primary_color tm_border_none tm_bold">
                        Total Amount Without GST
                      </td>
                      <td className="tm_primary_color tm_text_right tm_border_none tm_bold">
                        {voucher.totalAmount?.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Buttons */}
            <div className="tm_invoice_btns tm_hide_print">
              <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
                <span className="tm_btn_text">Print</span>
              </button>
              <button id="tm_download_btn" className="tm_invoice_btn tm_color2">
                <span className="tm_btn_text">Download</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoucherDetail;
