"use client";
import InvoucherTable from "../../components/InvoucherTable";
import QuotaionInfo from "../../components/QuotaionInfo";
import CustomerModal from "../../components/customerModal";
import EdiQuotatTable from "../../components/EditQuotatTable";
import GSTCalculator from "../../components/GSTCalculator";
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { toast } from "react-toastify";
import { useParams } from "next/navigation";

const EditQuotation = () => {
  const [InfoModal, setInfoModal] = useState(false);
  const [showModalClientDetails, setShowModalClientDetails] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [FiltercolModal, setFiltercolModal] = useState(false);
  const [ShowHideFiltercolModal, setShowHideFilterModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null); // Changed to null for better initialization
  const [quotationInfo, setQuotationInfo] = useState(null);
  const [quotationId, setQuotationId] = useState(1); // Start at 1
  const [QuotationSequence, setQuotationSequence] = useState(null); // Start as null to indicate loading
  const [rowsData, setRowsData] = useState([]); // State to store rows data
  const [gstDetails, setGstDetails] = useState({
    gstAmount: 0,
    totalWithGST: 0,
    withoutGST: 0,
    gstPercentage: 0,
    gstType: "include",
  }); // State to store GST details
  const { quote } = useParams();
  console.log("quote", quote);

  const QUOTATION_API_URL = "https://api.panvic.in/quotation";
  const CLIENT_API_URL = "https://api.panvic.in/clients/";
  const [quotation, setQuotation] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!quote) return;

    const fetchQuotation = async () => {
      try {
        const response = await axios.get(`${QUOTATION_API_URL}/${quote}`, {
          withCredentials: true,
        });
        console.log(response.data);
        if (response.data) {
          setQuotation(response.data);

          // If the voucher contains a clientId, fetch client details
          if (response.data.client_id) {
            fetchClient(response.data.client_id);
          }
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
  }, [quote]);

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

  const handleQuotationConfirm = (data) => {
    setQuotationInfo(data); // Store received quotation info
    console.log("Quotation Info Received:", data);
  };

  const closeModal = () => {
    setShowModalClientDetails(false); // Close the modal when this function is called
    setShowHideFilterModal(false); // Close the modal when this function is called
  };

  // Callback to receive the updated totalAmount from the child
  const handleTotalAmountChange = (newTotalAmount) => {
    setTotalAmount(newTotalAmount);
  };

  const handleRowsChange = (rows) => {
    setRowsData(rows); // Store the rows data in the parent component's state
    console.log("Updated Rows Data:", rows); // Log or use the data as needed
  };

  const handleClientConfirm = (selectedClient) => {
    console.log("Selected Client:", selectedClient);
    setSelectedCustomer(selectedClient);
    // Use the selected client data as needed
  };

  // Callback to receive GST details from GSTCalculator
  const handleGSTChange = (details) => {
    setGstDetails(details);
    console.log("GST Details Received:", details);
  };

  const generateQuotationNumber = () => {
    if (QuotationSequence === null) return "PLQOT-Loading...";
    const sequenceStr = QuotationSequence.toString().padStart(3, "0");
    return `PLQOT-${sequenceStr}`;
  };

  useEffect(() => {
    const fetchLastQuotationData = async () => {
      try {
        const response = await fetch("https://api.panvic.in/quotation/", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const quotations = await response.json();
        console.log("Fetched quotations:", quotations); // Debug: Log fetched data

        if (quotations && quotations.length > 0) {
          // Find the highest sequence number from quotation_no (e.g., PLQOT-XXX)
          const lastSequence = quotations
            .map((voucher) => {
              const match = voucher.quotation_no
                ? voucher.quotation_no.match(/^PLQOT-(\d+)$/)
                : null;
              return match ? parseInt(match[1], 10) : 0;
            })
            .reduce((max, num) => Math.max(max, num), 0);

          console.log("Last sequence number:", lastSequence); // Debug: Log last sequence

          // Increment the sequence and set state
          const nextSequence = lastSequence + 1;
          setQuotationSequence(nextSequence);
          setQuotationId(quotations.length + 1); // Assuming quotation_id is sequential
        } else {
          // If no quotations exist, start from 1
          setQuotationId(1);
          setQuotationSequence(1);
        }
      } catch (error) {
        console.error("Error fetching quotations:", error);
        // Fallback to initial values if fetch fails
        setQuotationId(1);
        setQuotationSequence(1);
      }
    };

    fetchLastQuotationData();
  }, []);

  // Function to handle POST request to save the quotation
  const handleSaveQuotation = async () => {
    if (QuotationSequence === null) {
      toast.warning("Quotation number is still loading. Please wait.");
      return;
    }

    try {
      // Collect data from state and UI elements
      const remarks = document.querySelector(".tm_remarks_box")?.value || "";
      const warrantyGuarantee =
        document.querySelector('input[placeholder="Warranty/Guarantee"]')
          ?.value || "1 year warranty against manufacturing defects";

      // Prepare the data payload for the API with GST details
      const quotationData = {
        quotation_no: generateQuotationNumber(), // e.g., PLQOT-001
        salesperson: quotationInfo?.Salesperson || "Unknown Salesperson",
        subject: quotationInfo?.Subject || "Quotation for Products/Services",
        amount_including_gst: Math.round(gstDetails.totalWithGST) || 0, // Use totalWithGST, rounded to integer
        without_gst: Math.round(gstDetails.withoutGST) || 0, // Use withoutGST, rounded to integer
        gst_amount: Math.round(gstDetails.gstAmount) || 0, // Use gstAmount, rounded to integer
        amount_with_gst: Math.round(gstDetails.totalWithGST) || 0, // Same as amount_including_gst
        warranty_guarantee: warrantyGuarantee,
        remarks: remarks,
        status: true, // Assuming active status
        client_id: selectedCustomer?.client_id || 3, // Use selected client ID or fallback to a default
      };

      console.log("Quotation data to be sent:", quotationData); // Debug: Log data before sending

      // Make the POST request using Axios
      const response = await axios.post(
        "https://api.panvic.in/quotation/",
        quotationData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Quotation saved successfully:", response.data);
      const savedQuotationId = response.data.quotation_id; // Assuming the API returns the quotation ID

      // Step 2: Save each item in rowsData to the quotation
      if (rowsData.length > 0) {
        const itemPromises = rowsData.map(async (item) => {
          const itemData = {
            quotation_id: savedQuotationId, // Use the ID from the saved quotation
            product_id: item.itemCode, // Assuming itemCode is the product_id
            customercode: item.customerCode || "N/A", // Use customerCode or fallback
            customerdescription: item.customerDescription || "N/A", // Use customerDescription or fallback
            image: item.image || "https://example.com/default-image.jpg", // Use image or fallback
            itemcode: item.itemCode, // Use itemCode
            brand: item.brand || "N/A", // Use brand or fallback
            mrp: parseFloat(item.mrp) || 0, // Ensure mrp is a number
            price: parseFloat(item.amount) || 0, // Use amount as price
            quantity: parseInt(item.qty, 10) || 0, // Ensure quantity is an integer
            discount: parseFloat(item.discount) || 0, // Ensure discount is a number
            item_name: item.itemName || "N/A", // Use itemName or fallback
            unit: item.unit || "pcs", // Use unit or fallback to 'pcs'
          };

          console.log("Item data to be sent:", itemData); // Debug: Log item data

          // Make the POST request to add the item
          return axios.post(
            `https://api.panvic.in/quotation/${savedQuotationId}/items/`,
            itemData,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        });

        // Wait for all item POST requests to complete
        const itemResponses = await Promise.all(itemPromises);
        console.log("All items saved successfully:", itemResponses);
      } else {
        console.log("No items to save.");
      }

      // Increment the sequence for the next quotation
      setQuotationSequence(QuotationSequence + 1);
      setQuotationId(quotationId + 1);
      // Optionally reset state or update UI after successful save
      toast.success("Quotation saved successfully!");
      window.location.href = "/getquotation";
    } catch (error) {
      console.error("Error saving quotation:", error);
      toast.error("Failed to save quotation. Please try again.");
    }
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
                  QUOTATION
                </div>
                <p className="tm_invoice_number tm_m0">
                  Quotation No:{" "}
                  <b className="tm_primary_color">
                    {generateQuotationNumber()}
                  </b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_date tm_m0">
                  Date:
                  <b className="tm_primary_color">
                    {new Date().toLocaleDateString("en-GB")}
                  </b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_head tm_mb10">
              {/* Client Details */}
              {client && (
                <div className="tm_invoice_head tm_mb10">
                  <div
                    className="tm_invoice_left mt-0"
                    style={{ flex: 1, textAlign: "left" }}
                  >
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
                Subject: &nbsp;
                {quotation && (
                  <b className="tm_primary_color">{quotation.subject}</b>
                )}
              </p>  
            </div>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <EdiQuotatTable
                    FiltercolModal={FiltercolModal}
                    ShowHideFiltercolModal={ShowHideFiltercolModal}
                    onClose={closeModal}
                    onRowsChange={handleRowsChange}
                    onTotalAmountChange={handleTotalAmountChange}
                    qouteId={quote}
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
                  <textarea
                    className="form-control tm_remarks_box no-print opacity-0"
                    placeholder="Enter remarks here..."
                    rows="1"
                    cols="30"
                  ></textarea>
                </div>

                <div className="tm_right_footer">
                  <GSTCalculator totalAmount={totalAmount} onGSTChange={handleGSTChange} />
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
                  as per company norms.{" "}
                  <input
                    type="text"
                    placeholder="Warranty/Guarantee"
                    className="form-control m-0"
                  />{" "}
                  <br />
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
                  Code: ICIC0001510, Jalandhar.
                  <br /> We hope you will find our offer in quotation and look
                  forward to your positive response. Please feel free to contact
                  us for any queries.
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
          <button id="tm_download_btn" className="tm_invoice_btn tm_color2"  onClick={handleSaveQuotation}>
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

export default EditQuotation;