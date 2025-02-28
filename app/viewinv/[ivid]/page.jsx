"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/invouchers";

const InvoucherDetail = () => {
  const { ivid } = useParams();
  const [voucher, setVoucher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ivid) return;

    const fetchVoucher = async () => {
      try {
        const response = await axios.get(`${API_URL}/${ivid}`, {
          withCredentials: true,
        });
        setVoucher(response.data);
        console.log(API_URL)
        console.log(ivid)
        console.log(voucher)
      } catch (error) {
        toast.error("Failed to load voucher details!");
      } finally {
        setLoading(false);
      }
    };

    fetchVoucher();
  }, [ivid]);

  if (loading) return <p>Loading...</p>;
  if (!voucher) return <p>No voucher found!</p>;

  const {
    voucherNo,
    transactionType,
    date,
    supplierDetails,
    receiverDetails,
    productInfo,
    totalAmount,
  } = voucher;

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
                  Voucher No: <b className="tm_primary_color">#{voucherNo}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Transaction Type: <b>{transactionType}</b>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">{date}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_head tm_mb10">
              <div className="tm_invoice_left">
                <p className="tm_mb2">
                  <b className="tm_primary_color">Supplier Details:</b>
                </p>
                <p>
                  Name: <b>{supplierDetails?.name}</b> <br />
                  Address: <b>{supplierDetails?.address}</b> <br />
                  City: <b>{supplierDetails?.city}</b>, State:{" "}
                  <b>{supplierDetails?.state}</b> | Pincode:{" "}
                  <b>{supplierDetails?.pincode}</b> <br />
                  Phone: <b>{supplierDetails?.phone}</b> <br />
                  GST NO: <b>{supplierDetails?.gstNumber}</b>
                </p>
              </div>

              <div className="tm_invoice_right tm_text_right">
                <p className="tm_mb2">
                  <b className="tm_primary_color">Receiver Details:</b>
                </p>
                <p>
                  Invoice Number: <b>{receiverDetails?.invoiceNumber}</b> <br />
                  Invoice Date: <b>{receiverDetails?.invoiceDate}</b> <br />
                  Mode of Transport: <b>{receiverDetails?.modeOfTransport}</b>{" "}
                  <br />
                  Number of Packages: <b>{receiverDetails?.numberOfPackages}</b>{" "}
                  <br />
                </p>
              </div>
            </div>

            <p className="tm_mb2">
              <b className="tm_primary_color">Product Info:</b>
            </p>
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
                      {productInfo?.map((product, index) => (
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
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0">
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Remarks If any:</b>
                  </p>
                  <textarea
                    className="form-control tm_remarks_box"
                    placeholder="Enter remarks here..."
                    rows="4"
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
                          {totalAmount?.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

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
        </div>
      </div>
    </div>
  );
};

export default InvoucherDetail;
