"use client";
import InvoucherTable from "../components/InvoucherTable";
import ReciverDetails from "../components/Reciverdeatails";
import { useState } from "react";
import CustomerModal from "../components/customerModal";

const AddInvoice = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(false);

  const closeModal = () => {
    setShowModalClientDetails(false); // Close the modal when this function is called
  };
  // Callback to receive the updated totalAmount from the child
  const handleTotalAmountChange = (newTotalAmount) => {
    setTotalAmount(newTotalAmount);
  };

  const handleClientConfirm = (selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
    // Use the selected client data as needed
    console.log(selectedClient);
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
                  Voucher No: <b className="tm_primary_color">#LL93784</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Transaction Types:{" "}
                  <select id="transactionType" name="transactionType">
                    <option value="Transfer">Transfer</option>
                    <option value="Return">Return</option>
                    <option value="ToCustomer">To Customer</option>
                  </select>
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
                    onClick={() => setShowModalClientDetails(true)} // Use the function to set the state to true
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                <p style={{ textAlign: "justify" }}>
                  Name: <b>{selectedCustomer.client_name}</b> <br />
                  Address: <b>{selectedCustomer.address}</b> <br />
                  City: <b>{selectedCustomer.city}</b>, State: <b>{selectedCustomer.state}</b> | Pincode: {selectedCustomer.pincode}<br />
                  Email: <b>{selectedCustomer.client_email}</b> | Phone: <b>{selectedCustomer.client_phone}</b>
                  <br />
                  GST NO: <b>{selectedCustomer.gst_number}</b>
                </p>
                Freight:{" "}
                <select id="transactionType" name="transactionType">
                  <option value="Transfer">Paid</option>
                  <option value="Return">To Pay</option>
                </select>
              </div>

              {/* Right Column */}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">Reciver Details:</b>
                  {InfoModal && <ReciverDetails setInfoModal={setInfoModal} />}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setInfoModal(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                Invoice Number: <b>INV12345</b> <br />
                {/* Issue Slip No:<b> SLIP98765</b> <br /> */}
                {/* Sale Order No:<b> SO123456 </b><br /> */}
                Invoice Date: <b>2025-01-24</b> <br />
                Mode of Transport: <b>Air Freight</b> <br />
                Number of Packages: <b>50</b> <br />
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
                  {showModalClientDetails && ( // Conditionally render the modal
                    <CustomerModal
                      onClose={closeModal} // Pass the closeModal function to the modal
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
        </div>
      </div>
    </div>
  );
};

export default AddInvoice;
