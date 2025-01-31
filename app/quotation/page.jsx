"use client";
import InvoucherTable from "../components/InvoucherTable";
import ReciverDetails from "../components/Reciverdeatails";
import { useState } from "react";
import CustomerModal from "../components/customerModal";
import QuotationTable from "../components/QuotationTable";
import GSTCalculator from "../components/GSTCalculator";

const Quotation = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [FiltercolModal, setFiltercolModal] = useState(false);
  const [ShowHideFiltercolModal, setShowHideFilterModal] = useState(false);

  const closeModal = () => {
    setShowModalClientDetails(false); // Close the modal when this function is called
    setShowHideFilterModal(false); // Close the modal when this function is called
  };
  // Callback to receive the updated totalAmount from the child
  const handleTotalAmountChange = (newTotalAmount) => {
    setTotalAmount(newTotalAmount);
  };
  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-1">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img
                    src="https://panvic-com.preview-domain.com/wp-content/uploads/2025/01/logo-removebg-preview.png"
                    alt="Logo"
                  />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">
                  QUOTATION
                </div>
                <p className="tm_invoice_number tm_m0">
                  Quotation No: <b className="tm_primary_color">#LL93784</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
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
                  <b className="tm_primary_color">Customer Details:</b>{" "}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setFiltercolModal(true)} // Open modal from child
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                <p style={{ textAlign: "justify" }}>
                  Name: <b>Rajesh Kumar</b> <br />
                  City: <b>Jalandhar City</b> <br />
                </p>
              </div>

              {/* Right Column */}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">PANVIK LIGHTING</b>
                  {InfoModal && <ReciverDetails setInfoModal={setInfoModal} />}
                  <button
                    type="button"
                    className="btn modalaction_btn no-print"
                    onClick={() => setInfoModal(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                {/* Issue Slip No:<b> SLIP98765</b> <br /> */}
                {/* Sale Order No:<b> SO123456 </b><br /> */}
                Address:{" "}
                <b>
                  Nakodar Road Beside Silver OAK Appartments Jalandhar City,
                  Punjab-144003
                </b>{" "}
                <br />
                GST: <b>03ADWPG0246P1Z8</b> <br />
                Salesperson: <b>Amar</b> <br />
                <br />
              </div>
            </div>
            <div
              className="d-flex mb-2"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <p className="tm_mb2">
                <b className="tm_primary_color">Product info:</b>
              </p>
              <div
                className="filter_btn btn no-print"
                onClick={() => setShowHideFilterModal(true)}
              >
                <i class="fa-solid fa-filter"></i> <span>Filter</span>
              </div>
            </div>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <QuotationTable
                    FiltercolModal={FiltercolModal}
                    ShowHideFiltercolModal={ShowHideFiltercolModal}
                    onClose={closeModal}
                    onTotalAmountChange={handleTotalAmountChange}
                  />
                  {showModalClientDetails && ( // Conditionally render the modal
                    <CustomerModal
                      onClose={closeModal} // Pass the closeModal function to the modal
                      client={showModalClientDetails}
                    />
                  )}
                </div>
              </div>
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0">
                  <textarea
                    className="form-control tm_remarks_box"
                    placeholder="Enter remarks here..."
                    rows="1"
                    cols="30"
                  ></textarea>
                </div>

                <div className="tm_right_footer">
                  <GSTCalculator totalAmount={totalAmount} />
                </div>
              </div>
            </div>
            <hr />
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
              <p>
                GST : <b>Including in above prices as per applicable..</b>{" "}
              </p>
              <p>
                Payment Terms : <b>100% in advance with order.</b>{" "}
              </p>
              <p>
                Validity : <b>15 days from the date of quotation.</b>{" "}
              </p>
              <p className="m-0">
                Warranty/Guarantee :{" "}
                <b>
                  as per company norms. <input type="text" placeholder="Warranty/Guarantee" className="form-control m-0" /> <br /> 
                </b>{" "}
              </p>
              <p>
                Responsibility :{" "}
                <b>
                  Our responsibility for material counting ceases immediately
                  after delivery.
                </b>{" "}
              </p>
              <p>
                Installation & Fixing :{" "}
                <b>
                  If required, for any electrical job, we will arrange a
                  technician at extra cost. Installation will take 4-5 days from
                  the date of dorder.
                </b>{" "}
              </p>
              <p>
                Freight Charges : <b>Extra as per actual.</b>{" "}
              </p>
              <p>
                Bank Details :{" "}
                <b>
                  PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC
                  Code: ICIC0001510, Jalandhar.<br /> We hope you will find our offer
                  in quotation and look forward to your positive response.
                  Please feel free to contact us for any queries.
                </b>{" "}
              </p>
              <hr />
              <p>
                For:- Panvik Lighting This is a computer generated
                document,hence signature is not required.
              </p>
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

export default Quotation;
