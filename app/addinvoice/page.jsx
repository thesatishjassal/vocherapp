"use client";
const AddInvoice = () => {
  return (
    <div className="card tm_container my-4">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1" id="tm_download_section">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20">
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
                  IN VOUCHER
                </div>
                <p className="tm_invoice_number tm_m0">
                  Voucher No: <b className="tm_primary_color">#LL93784</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number tm_m0">
                  Transaction Types:{" "}
                  <b className="tm_primary_color">Paid</b>
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
                className="tm_invoice_left"
                style={{ flex: 1, textAlign: "left" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">Supplier Details:</b>
                </p>
                <p style={{ textAlign: "justify" }}>
                  Name: <b>XYZ Ltd</b> <br />
                  Address: <b>123 ABC Street</b> , <b>XYZ City</b> <br />
                 
                  State: <b>XYZ State</b>, <b>Country</b> <br />
                  Pincode: <b>123456</b> <br />
                  Email:<b>xyz@gmail.com</b> <br />
                  Phone: <b>+91-1234567890</b>
                </p>
                Freight:<b> Paid </b>
              </div>

              {/* Right Column */}
              <div
                className="tm_invoice_right tm_text_right"
                style={{ flex: 1, textAlign: "right" }}
              >
                <p className="tm_mb2">
                  <b className="tm_primary_color">Reciver Details:</b>
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
                  <table className="table align-items-center justify-content-center mb-0">
                    <thead>
                      <tr>
                        <th
                          class="sr_col tm_semi_bold tm_primary_color tm_gray_bg"
                          style={{ width: "50px" }}
                        >
                          SR NO
                        </th>
                        <th class="sku_col tm_semi_bold tm_primary_color tm_gray_bg">
                          SKU
                        </th>
                        <th class="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg">
                          Item Name
                        </th>
                        <th class="qty_col tm_semi_bold tm_primary_color tm_gray_bg">
                          Qty
                        </th>
                        <th class="rack_col tm_semi_bold tm_primary_color tm_gray_bg">
                          Rack Code
                        </th>
                        <th class="unit_col tm_semi_bold tm_primary_color tm_gray_bg">
                          Unit
                        </th>
                        <th class="tm_width_1 tm_semi_bold tm_primary_color tm_gray_bg">
                          Rate
                        </th>
                        <th class="tm_width_1 tm_semi_bold tm_primary_color tm_gray_bg">
                          Discount
                        </th>
                        <th class="amount_col tm_semi_bold tm_primary_color tm_gray_bg">
                          Amount
                        </th>
                        <th class="tm_width_2 tm_semi_bold tm_primary_color tm_gray_bg">
                          Remarks
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td class="sr_col">1</td>
                        <td class="sku_col">SKU-FAN001</td>
                        <td class="tm_width_2">Ceiling Fan</td>
                        <td class="qty_col">1</td>
                        <td class="rack_col">A1</td>
                        <td class="unit_col">pcs</td>
                        <td class="tm_width_1">$50</td>
                        <td class="tm_width_1">0%</td>
                        <td class="amount_col">$50</td>
                        <td class="tm_width_2">Energy-efficient fan</td>
                      </tr>
                      <tr>
                        <td class="sr_col">2</td>
                        <td class="sku_col">SKU-LIGHT001</td>
                        <td class="tm_width_2">Fancy Light Bollard</td>
                        <td class="qty_col">2</td>
                        <td class="rack_col">B2</td>
                        <td class="unit_col">pcs</td>
                        <td class="tm_width_1">$150</td>
                        <td class="tm_width_1">0%</td>
                        <td class="amount_col">$300</td>
                        <td class="tm_width_2">Outdoor decorative lighting</td>
                      </tr>
                      <tr>
                        <td class="sr_col">3</td>
                        <td class="sku_col">SKU-BULB001</td>
                        <td class="tm_width_2">LED Bulb</td>
                        <td class="qty_col">5</td>
                        <td class="rack_col">C3</td>
                        <td class="unit_col">pcs</td>
                        <td class="tm_width_1">$10</td>
                        <td class="tm_width_1">0%</td>
                        <td class="amount_col">$50</td>
                        <td class="tm_width_2">Energy-saving LED</td>
                      </tr>
                      <tr>
                        <td class="sr_col">4</td>
                        <td class="sku_col">SKU-STRIP001</td>
                        <td class="tm_width_2">LED Strip Lights</td>
                        <td class="qty_col">3</td>
                        <td class="rack_col">D4</td>
                        <td class="unit_col">pcs</td>
                        <td class="tm_width_1">$30</td>
                        <td class="tm_width_1">0%</td>
                        <td class="amount_col">$90</td>
                        <td class="tm_width_2">Flexible LED strips</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div class="tm_invoice_footer my-2">
                <div class="tm_left_footer px-0">
                  <p class="tm_mb2">
                    <b class="tm_primary_color">Remarks If any:</b>
                  </p>
                  <textarea
                    class="form-control tm_remarks_box"
                    placeholder="Enter remarks here..."
                    rows="4"
                    cols="50"
                  ></textarea>
                </div>

                <div class="tm_right_footer">
                  <table>
                    <tbody>
                      <tr>
                        <td class="tm_width_2 tm_primary_color tm_border_none tm_bold">
                          Total Amount Without GST
                        </td>
                        <td class="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          $1650
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
