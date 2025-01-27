"use client";
import DynamicTable from "../components/DynamicTable";
import BasicInfoModal from "../components/AddBasicInfo";
import { useState } from "react";
import CustomerModal from "../components/customerModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Addoutinvoice = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const handleIconClick = () => {
    setOpen(!open); // Toggle the date picker visibility
  };

  const closeModal = () => {
    setShowModalClientDetails(false); // Close the modal when this function is called
  };

  return (
    <div className="card tm_container my-4 print-container ">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-2">
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
                  OUT VOUCHER
                </div>
                <p className="tm_invoice_number tm_m0">
                  Voucher No: <b className="tm_primary_color">#LL93784</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 mb-2">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Transaction Types: <b className="tm_primary_color"></b>
                  <select id="transactionType" name="transactionType">
                    <option value="Transfer">Transfer</option>
                    <option value="Return">Return</option>
                    <option value="ToCustomer">To Customer</option>
                  </select>
                </p>
                <p className="tm_invoice_date tm_m0">
                  Date: <b className="tm_primary_color">01.07.2022</b>
                  <button
                    type="button"
                    className="btn modalaction_btn"
                    onClick={handleIconClick}
                  >
                    <i className="fa-regular fa-calendar-days"></i>
                  </button>
                  {open && (
                    <div className="custom_datepciker">
                      {open && (
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => {
                            setStartDate(date); // Set the selected date
                            setOpen(false); // Close the date picker
                          }}
                          inline
                        />
                      )}
                    </div>
                  )}
                </p>
              </div>
            </div>
            <div
              className="tm_invoice_head txm_mb10 m-0"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left Column */}
              <div
                className="tm_invoice_left"
                style={{ flex: 1, textAlign: "left", marginTop: "-10px" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">To Customer: </b>

                  <button
                    type="button"
                    className="btn modalaction_btn "
                    onClick={() => setShowModalClientDetails(true)} // Use the function to set the state to true
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  {showModalClientDetails && ( // Conditionally render the modal
                    <CustomerModal
                      onClose={closeModal} // Pass the closeModal function to the modal
                      client={showModalClientDetails}
                    />
                  )}
                </p>
                <p style={{ textAlign: "justify" }} className="m-0">
                  Name: <b>XYZ Ltd</b> <br />
                  Address: <b>123 ABC Street</b> , <b>XYZ City</b> <br />
                  State: <b>XYZ State</b>, <b>Country</b> Pincode: <b>123456</b>{" "}
                  <br />
                  {/* Email:<b>xyz@gmail.com</b>  <br />  */}
                  {/* Phone: <b>+91-1234567890</b> */}
                  GST NO: <b>JDKURE1525</b>
                </p>
              </div>

              {/* Right Column */}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  {InfoModal && <BasicInfoModal setInfoModal={setInfoModal} />}
                  <b className="tm_primary_color">Basic Details:</b>
                  <button
                    type="button"
                    className="btn modalaction_btn"
                    onClick={() => setInfoModal(true)}
                  >
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                </p>
                {/* Invoice Number: <b>INV12345</b> <br /> */}
                Issue Slip No:<b> SLIP98765</b> <br />
                Sale Order No:<b> SO123456 </b>
                <br />
                Transport: <b>DHL</b> <br />
                Vehicle No: <b>PB 08: 1014</b> <br />
              </div>
            </div>
            <div className="d-flex py-2 px-0 no-top-border">
  <div className="flex-grow-1 py-0 pl-0 no-top-border">
    Package <b>2 Box</b>
  </div>
  <div className="flex-grow-1 py-0 no-top-border">
    Order BY: <b>Johny</b>
  </div>
  <div className="flex-grow-1 py-0 no-top-border">
    Sale Person: <b>John</b>
  </div>
  <div className="flex-grow-1 py-0 no-top-border">
    Freight Amount: <b>200</b>
  </div>
</div>

            <p className="tm_mb2">
              <b className="tm_primary_color">Product info:</b>
            </p>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <DynamicTable />
                </div>
              </div>
              <div className="tm_invoice_footer my-2">
                <div className="tm_left_footer px-0">
                  <p className="tm_mb2">
                    <b className="tm_primary_color">
                      Remarks/Notes (Optional):
                    </b>
                  </p>
                  <input
                    type="text"
                    className="form-control tm_remarks_box"
                    placeholder="Add any additional details or instructions"
                  />
                </div>
              </div>
            </div>
            <div className="tm_left_footer px-0">
              <p className="tm_mb2 ">
                <b className="tm_primary_color"> Reciver Name & Mobile Name:</b>
              </p>
              <div className="d-flex">
                <div className="d-flex col-6 pr-1">
                  <input
                    type="text"
                    className="form-control mr-1 "
                    placeholder="Reciver name"
                  />
                  <input
                    type="text"
                    className="form-control mx-1"
                    placeholder="Reciver Phone number"
                  />
                </div>
                <div className="col-6  ">
                  <p className="tm_mb2 text-right">
                    <b className="tm_primary_color text-right">
                      Store Manager:
                    </b>
                    <br />
                    <span className="tm_primary_color ">Auth Sign</span>
                  </p>
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
              <i className="fa-solid fa-upload"></i>
            </span>
            <span className="tm_btn_text">Publish</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Addoutinvoice;
