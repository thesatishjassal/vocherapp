// "use client";
// import CustomerModal from "../../components/customerModal";
// import PurchaseOrderTable from "../../components/EditPurchaseOrderTable";
// import GSTCalculator from "../../components/GSTCalculator";
// import React, { useState, useEffect, useMemo } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { useParams } from "next/navigation";
// import { console } from "inspector";

// const EditQuotation = () => {
//   const [InfoModal, setInfoModal] = useState(false);
//   const [showModalClientDetails, setShowModalClientDetails] = useState(false);
//   const [totalAmount, setTotalAmount] = useState(0);
//   const [FiltercolModal, setFiltercolModal] = useState(false);
//   const [ShowHideFiltercolModal, setShowHideFilterModal] = useState(false);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [quotationInfo, setQuotationInfo] = useState(null);
//   const [quotationId, setQuotationId] = useState(1);
//   const [rowsData, setRowsData] = useState([]);
//   const [gstDetails, setGstDetails] = useState({
//     gstAmount: 0,
//     totalWithGST: 0,
//     withoutGST: 0,
//     gstPercentage: 0,
//     gstType: "include",
//   });
//   const [remarks, setRemarks] = useState("");
//   const [warrantyGuarantee, setWarrantyGuarantee] = useState(
//     "1 year warranty against manufacturing defects"
//   );
//   const { eid } = useParams();
//   console.log("Editing Purchase Order ID:", eid);
//   // const PURCHASEORDER_API_URL = "https://api.panvic.in/purchaseorder";
//   // const CLIENT_API_URL = "https://api.panvic.in/clients/";
//   const [quotation, setQuotation] = useState(null);
//   const [client, setClient] = useState(null);
//   const [loading, setLoading] = useState(true);
// const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   /* -------------------- Load quotation + client -------------------- */
//   useEffect(() => {
//     if (!eid) return;
//     const fetchQuotation = async () => {
//       try {
//         const response = await axios.get(`${API_URL}/purchaseorder/${eid}`, {
//           withCredentials: true,
//         });
//         if (response.data) {
//           setQuotation(response.data);
//           setRemarks(response.data.remarks || "");
//           setWarrantyGuarantee(
//             response.data.warranty_guarantee ||
//               "1 year warranty against manufacturing defects"
//           );
//           setGstDetails({
//             gstAmount: response.data.gst_amount || 0,
//             totalWithGST: response.data.amount_with_gst || 0,
//             withoutGST: response.data.without_gst || 0,
//             gstPercentage: 0,
//             gstType: "include",
//           });
//           if (response.data.client_id) fetchClient(response.data.client_id);
//         } else {
//           toast.error("No quotation found!");
//         }
//       } catch {
//         toast.error("Failed to load quotation!");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchQuotation();
//   }, [eid]);

//   const fetchClient = async (client_id) => {
//     try {
//       const response = await axios.get(`${API_URL}/clients/`, { withCredentials: true });
//       const filteredClient = response.data.find((c) => c.id === client_id);
//       if (filteredClient) setClient(filteredClient);
//       else toast.error("Client not found!");
//     } catch {
//       toast.error("Failed to load client details!");
//     }
//   };

//   /* -------------------- Handlers -------------------- */
//   const handleTotalAmountChange = (newTotalAmount) => setTotalAmount(newTotalAmount);
//   const handleRowsChange = (rows) => setRowsData(rows);
//   const handleClientConfirm = (selectedClient) => setSelectedCustomer(selectedClient);
//   const handleGSTChange = (details) => setGstDetails(details);
//   const closeModal = () => {
//     setShowModalClientDetails(false);
//     setShowHideFilterModal(false);
//   };

//   /* ---------- Existing: update quotation in-place ---------- */
//   const handleSaveQuotation = async () => {
//     try {
//       const quotationData = {
//         quotation_no: eid,
//         salesperson:
//           quotationInfo?.salesperson || quotation?.salesperson ,
//         subject:
//           quotationInfo?.Subject ||
//           quotation?.subject ||
//           "Quotation for Products/Services",
//         amount_including_gst: Math.round(gstDetails.withoutGST) || 0,
//         without_gst: Math.round(gstDetails.withoutGST) || 0,
//         gst_amount: Math.round(gstDetails.gstAmount) || 0,
//         amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
//         warranty_guarantee: warrantyGuarantee,
//         remarks,
//         status: quotationInfo?.status || "active",
//         client_id:
//           selectedCustomer?.client_id || quotation?.client_id || 3,
//       };

//       await axios.put(`${API_URL}/purchaseorder/${eid}`, quotationData, {
//         headers: { "Content-Type": "application/json" },
//         withCredentials: true,
//       });

//       if (rowsData.length > 0) {
//         const itemsData = rowsData.map((item) => ({
//           quotation_id: eid,
//           product_id: item.itemCode,
//           customercode: item.customerCode || "N/A",
//           customerdescription: item.customerDescription || "N/A",
//           image: item.image || "https://example.com/default-image.jpg",
//           itemcode: item.itemCode,
//           brand: item.brand || "N/A",
//           mrp: parseFloat(item.mrp) || 0,
//           // ✅ ensure integer price for backend
//           price: Math.round(parseFloat(item.amount)) || 0,
//           quantity: parseInt(item.qty, 10) || 0,
//           discount: parseFloat(item.discount) || 0,
//           item_name: item.itemName || "N/A",
//           unit: item.unit || "pcs",
//         }));
//         await axios.put(`${API_URL}/purchaseorder/${eid}/items/`, itemsData, {
//           headers: { "Content-Type": "application/json" },
//           withCredentials: true,
//         });
//       }

//       setQuotationId((p) => p + 1);
//       toast.success("Quotation updated successfully!");
//       window.location.href = "/purchase-orders";
//     } catch (error) {
//       toast.error(
//         `Failed to save: ${
//           error.response?.data?.detail || error.message || "Unknown error"
//         }`
//       );
//     }
//   };

//   /* ---------- NEW: generate next revision number ---------- */
//   const nextRevisionNo = useMemo(() => {
//     if (!eid) return "";
//     const base = eid.replace(/-([A-Z])$/, "");
//     const match = eid.match(/-([A-Z])$/);
//     if (!match) return `${base}-A`;
//     const letter = match[1];
//     const nextLetter = String.fromCharCode(letter.charCodeAt(0) + 1);
//     return `${base}-${nextLetter}`;
//   }, [eid]);

//   /* ---------- NEW: create a revision WITH GST values ---------- */
//   // const handlePublishRevision = async () => {
//   //   try {
//   //     const payload = {
//   //       remarks,
//   //       warranty_guarantee: warrantyGuarantee,
//   //       quotation_no: nextRevisionNo,
//   //       amount_with_gst: Math.round(gstDetails.totalWithGST) || 0,
//   //       without_gst: Math.round(gstDetails.withoutGST) || 0,
//   //       gst_amount: Math.round(gstDetails.gstAmount) || 0,
//   //     };
//   //     const res = await axios.post(
//   //       `${PURCHASEORDER_API_URL}/${eid}/revise`,
//   //       payload,
//   //       { withCredentials: true }
//   //     );
//   //     toast.success(
//   //       `Revision created: ${res.data.quotation_no || nextRevisionNo}`
//   //     );
//   //     if (res.data.quotation_no) {
//   //       window.location.href = `/getquotation`;
//   //     }
//   //   } catch (err) {
//   //     toast.error(
//   //       `Failed to create revision: ${
//   //         err.response?.data?.detail || err.message || "Unknown error"
//   //       }`
//   //     );
//   //   }
//   // };

//   if (loading) return <p>Loading...</p>;
  
//   return (
//     <div className="card tm_container my-4">
//       <div className="tm_invoice_wrap">
//         <div className="tm_invoice tm_style1" id="tm_download_section">
//           <div className="tm_invoice_in">
//             <div className="tm_invoice_head tm_align_center tm_mb20 mb-1">
//               <div className="tm_invoice_left">
//                 <div className="tm_logo">
//                   <img src="/assets/img/panviclogo.jpg" alt="Logo" />
//                 </div>
//               </div>
//               <div className="tm_invoice_right tm_text_right">
//                 <div className="tm_primary_color tm_f50 tm_text_uppercase">
//                   PURCHASE ORDER
//                 </div>
//                 <p className="tm_invoice_number tm_m0">
//                   Purchase Order No: <b className="tm_primary_color">PLPO-{eid}</b>
//                 </p>
//               </div>
//             </div>
//             <div className="tm_invoice_info tm_mb20 m-0">
//               <div className="tm_invoice_seperator tm_gray_bg"></div>
//               <div className="tm_invoice_info_list">
//                 <p className="tm_invoice_date tm_m0">
//                   Date: <b className="tm_primary_color">{new Date().toLocaleDateString("en-GB")}</b>
//                 </p>
//               </div>
//             </div>
//             <div className="tm_invoice_head tm_mb10">
//               {client && (
//                 <div className="tm_invoice_left mt-0" style={{ flex: 1, textAlign: "left" }}>
//                   <p className="tm_mb2">
//                     <b className="tm_primary_color">Client Details:</b>
//                   </p>
//                   <p style={{ textAlign: "justify" }}>
//                     Name: <b>{client.client_name}</b> <br />
//                     City: <b>{client.city}</b>
//                   </p>
//                 </div>
//               )}
//               <div className="tm_invoice_right tm_text_right" style={{ flex: 1, textAlign: "right" }}>
//                 <p className="tm_mb2">
//                   <b className="tm_primary_color">PANVIK LIGHTING</b>
//                 </p>
//                 Address: <b>Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar City, Punjab-144003</b>
//                 <br />
//                 GST: <b>03ADWPG0246P1Z8</b> <br />
//                 Salesperson: {quotation && <b>{quotation.salesperson}</b>}
//                 <br />
//               </div>
//             </div>
//             <div className="d-flex mb-2" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//               <p className="tm_mb2">
//                 Subject: {quotation && <b className="tm_primary_color">{quotation.subject}</b>}
//               </p>
//             </div>
//             <div className="tm_table tm_style1 tm_mb30">
//               <div className="tm_round_border">
//                 <div className="tm_table_responsive">
//                   <PurchaseOrderTable
//                     FiltercolModal={FiltercolModal}
//                     ShowHideFiltercolModal={ShowHideFiltercolModal}
//                     onClose={closeModal}
//                     onRowsChange={handleRowsChange}
//                     onTotalAmountChange={handleTotalAmountChange}
//                     purchaseordereId={eid}
//                   />
//                   {showModalClientDetails && (
//                     <CustomerModal
//                       onClose={closeModal}
//                       client={showModalClientDetails}
//                       onConfirm={handleClientConfirm}
//                     />
//                   )}
//                 </div>
//               </div>
//               <div className="tm_invoice_footer my-2">
//                 <div className="tm_left_footer px-0">
//                   <textarea
//                     className="form-control tm_remarks_box no-print"
//                     placeholder="Enter remarks here..."
//                     rows="1"
//                     cols="30"
//                     value={remarks}
//                     onChange={(e) => setRemarks(e.target.value)}
//                   ></textarea>
//                 </div>
//                 <div className="tm_right_footer">
//                   <GSTCalculator totalAmount={totalAmount} onGSTChange={handleGSTChange} />
//                 </div>
//               </div>
//             </div>
//             <hr />
//             <p>
//               <b>
//                 <i>Thank You for considering us for your needs. Here is the proposal as you requested.</i>
//               </b>
//             </p>
//             <div className="term_box">
//               <h6>Terms and Conditions:</h6>
//               {/* <p>GST: <b>Including in above prices as per applicable.</b></p> */}
//               <p>Payment Terms: <b>100% in advance with order.</b></p>
//               <p>Validity: <b>15 days from the date of quotation.</b></p>
//               <p className="m-0">
//                 Warranty/Guarantee: <b>as per company norms.</b>
//                 <textarea
//                   className="form-control tm_remarks_box no-print"
//                   placeholder="Enter warranty/guarantee details..."
//                   rows="1"
//                   cols="30"
//                   value={warrantyGuarantee}
//                   onChange={(e) => setWarrantyGuarantee(e.target.value)}
//                 ></textarea>
//               </p>
//               <p>Responsibility: <b>Our responsibility for material counting ceases immediately after delivery.</b></p>
//               <p>Installation & Fixing: <b>If required, for any electrical job, we will arrange a technician at extra cost. Installation will take 4-5 days from the date of order.</b></p>
//               <p>Freight Charges: <b>Extra as per actual.</b></p>
//               <p>
//                 Bank Details: <b>PANVIK LIGHTING, ICICI BANK, A/C No. 7777-0535-3121, IFSC Code: ICIC0001510, Jalandhar.<br /> We hope you will find our offer in quotation and look forward to your positive response. Please feel free to contact us for any queries.</b>
//               </p>
//               <hr />
//               <p>For: Panvik Lighting. This is a computer-generated document, hence signature is not required.</p>
//             </div>
//           </div>
//         </div>
//         <div className="tm_invoice_btns tm_hide_print">
//           <button type="button" onClick={() => window.print()} className="tm_invoice_btn tm_color1">
//             <span className="tm_btn_icon">
//               <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
//                 <path d="M384 368h24a40.12 40.12 0 0040-40V168a40.12 40.12 0 00-40-40H104a40.12 40.12 0 00-40 40v160a40.12 40.12 0 0040 40h24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32"></path>
//                 <rect x="128" y="240" width="256" height="208" rx="24.32" ry="24.32" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32"></rect>
//                 <path d="M384 128v-24a40.12 40.12 0 00-40-40H168a40.12 40.12 0 00-40 40v24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="32"></path>
//                 <circle cx="392" cy="184" r="24" fill="currentColor"></circle>
//               </svg>
//             </span>
//             <span className="tm_btn_text">Print</span>
//           </button>
//           <button id="tm_publish_btn" className="tm_invoice_btn tm_color2" onClick={handleSaveQuotation}>
//             <span className="tm_btn_icon">
//               <i className="fa-solid fa-upload"></i>
//             </span>
//             <span className="tm_btn_text">Publish</span>
//           </button>
//           {/* New Publish Revision button */}
//           {/* <button id="tm_publish_revision_btn" className="tm_invoice_btn tm_color3" onClick={handlePublishRevision}>
//             <span className="tm_btn_icon">
//               <i className="fa-solid fa-copy"></i>
//             </span>
//             <span className="tm_btn_text">Publish Revision</span>
//           </button> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EditQuotation;
