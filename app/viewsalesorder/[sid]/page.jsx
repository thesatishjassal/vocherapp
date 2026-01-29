import axios from "axios";
import SalesOrderItemsTable from "../../components/SalesOrderItemsTable"; // Create this similar to QuotationItemsTable

// const SALESORDER_API_URL = "https://api.panvic.in/salesorder";
// const CLIENT_API_URL = "https://api.panvic.in/clients/";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default async function ViewSalesOrder({ params }) {
  const { sid } = await params; // dynamic parameter e.g., /salesorder/[id]
  console.log("Sales Order ID:", sid);
  let salesOrder = null;
  let client = null;
  let error = null;

  try {
    // Fetch Sales Order 
    const salesOrderResponse = await axios.get(`${API_URL}/salesorder/${sid}`, {
      withCredentials: true,
    });
    if (salesOrderResponse.data) {
      console.log("Sales Order Response:", salesOrderResponse.data);
      salesOrder = salesOrderResponse.data;
      
      // Fetch Client Details
      if (salesOrder.client_id) {
        const clientResponse = await axios.get(`${API_URL}/clients/`, {
          withCredentials: true,
        });
        client = clientResponse.data.find((c) => c.id === salesOrder.client_id);
        if (!client) {
          error = "Client not found!";
        }
      }
    } else {
      error = "No sales order found!";
    }
  } catch (err) {
    error = "Failed to load sales order details!";
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!salesOrder) {
    return <p>No sales order found!</p>;
  }

  return (
    <div className="card tm_container my-4 sales-order-view">
      <div className="tm_invoice_wrap">
        <div className="tm_invoice tm_style1">
          <div className="tm_invoice_in">
            <div className="tm_invoice_head tm_align_center tm_mb20 mb-1">
              <div className="tm_invoice_left">
                <div className="tm_logo">
                  <img src="/assets/img/panviclogo.jpg" alt="Logo" />
                </div>
              </div>
              <div className="tm_invoice_right tm_text_right">
                <div className="tm_primary_color tm_f50 tm_text_uppercase">
                  SALES ORDER
                </div>
                <p className="tm_invoice_number">
                  Sales Order No:{" "}
                  <b className="tm_primary_color">{salesOrder.salesorder_no}</b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_info tm_mb20 m-0">
              <div className="tm_invoice_seperator tm_gray_bg"></div>
              <div className="tm_invoice_info_list">
                <p className="tm_invoice_number">
                  Date:{" "}
                  <b>
                    {salesOrder.date
                      ? new Date(salesOrder.date).toLocaleDateString("en-GB")
                      : new Date().toLocaleDateString("en-GB")}
                  </b>
                </p>
              </div>
            </div>
            <div className="tm_invoice_head tm_mb10">
              {client && (
                <div
                  className="tm_invoice_left mt-0"
                  style={{ flex: 1, textAlign: "left" }}
                >
                  <p className="tm_mb2">
                    <b className="tm_primary_color">Client Details:</b>
                  </p>
                  <div style={{ lineHeight: "1.6" }}>
                    {client.client_name && (
                      <p>
                        <strong>Client Name:</strong> {client.client_name}
                      </p>
                    )}
                    {client.businessname && (
                      <p>
                        <strong>Business Name:</strong> {client.businessname}
                      </p>
                    )}
                    {client.customer_no && (
                      <p>
                        <strong>Customer Code:</strong> {client.customer_no}
                      </p>
                    )}
                    {client.client_phone && (
                      <p>
                        <strong>Mobile:</strong> {client.client_phone}
                      </p>
                    )}
                    {client.client_email && (
                      <p>
                        <strong>Email:</strong> {client.client_email}
                      </p>
                    )}
                    {(client.address ||
                      client.city ||
                      client.state ||
                      client.pincode) && (
                      <p>
                        {client.address && (
                          <>
                            {" "}
                            <strong>Address:</strong> {client.address}
                          </>
                        )}
                        {client.address &&
                          (client.city || client.state || client.pincode) &&
                          ", "}
                        {client.city && (
                          <>
                            {" "}
                            <strong>City:</strong> {client.city}
                          </>
                        )}
                        {client.state && `, ${client.state}`}
                        {client.pincode && ` - ${client.pincode}`}
                      </p>
                    )}
                    {client.billing_address && (
                      <p>
                        <strong>Billing Address:</strong>{" "}
                        {client.billing_address}
                      </p>
                    )}
                    {client.shipping_address && (
                      <p>
                        <strong>Shipping Address:</strong>{" "}
                        {client.shipping_address}
                      </p>
                    )}
                    {client.gst_number && (
                      <p>
                        <strong>GST No:</strong> {client.gst_number}
                      </p>
                    )}
                    {client.pan_number && (
                      <p>
                        <strong>PAN No:</strong> {client.pan_number}
                      </p>
                    )}
                    {client.status && (
                      <p>
                        <strong>Status:</strong> {client.status}
                      </p>
                    )}
                    {client.created_by && (
                      <p>
                        <strong>Created By:</strong> {client.created_by}
                      </p>
                    )}
                    {client.modified_by && (
                      <p>
                        <strong>Modified By:</strong> {client.modified_by}
                      </p>
                    )}
                    {client.other_details && (
                      <p>
                        <strong>Other Details:</strong> {client.other_details}
                      </p>
                    )}
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

                <p>
                  Address:{" "}
                  <b>
                    Nakodar Road Beside Silver OAK Appartments <br /> Jalandhar
                    City, Punjab-144003
                  </b>
                  <br />
                  GST: <b>03ADWPG0246P1Z8</b>
                  <br />
                  Salesperson: {salesOrder && <b>{salesOrder.purchaseperson}</b>}
                </p>

                <p style={{ margin: 0 }}>
                  Payment Method: <b>{salesOrder?.payment_method}</b> &nbsp; |
                  &nbsp; Freight: <b>{salesOrder?.freight}</b> <br />
                  Issue Slip No: <b>{salesOrder?.issue_slip_no}</b>
                </p>
              </div>
            </div>
            Subject:{" "}
            <span className="tm_primary_color mb-3">
              {salesOrder && <b>{salesOrder.subject}</b>}
            </span>
            <div className="tm_table tm_style1 tm_mb30">
              <div className="tm_round_border">
                <div className="tm_table_responsive">
                  <SalesOrderItemsTable
                    salesorder_id={salesOrder?.salesorder_id}
                  />
                </div>
              </div>
            </div>
            <div className="tm_invoice_footer my-2">
              <div className="tm_left_footer px-0">
                <textarea
                  className="form-control tm_remarks_box no-print opacity-0"
                  placeholder="Enter remarks here..."
                  rows="1"
                  cols="30"
                  defaultValue={salesOrder.remarks || ""}
                  readOnly
                ></textarea>
              </div>

              <div className="tm_right_footer">
                <table>
                  <tbody>
                    {salesOrder.without_gst !== 0 && (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                          <p className="m-0">Included GST:</p>
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {(salesOrder.without_gst || 0).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {salesOrder.gst_amount !== 0 && (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                          <p className="m-0">GST Amount:</p>
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {(salesOrder.gst_amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {salesOrder.amount_with_gst !== 0 && (
                      <tr>
                        <td className="tm_width_3 tm_primary_color tm_border_none tm_bold">
                          <p className="m-0">Total Amount:</p>
                        </td>
                        <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
                          {(salesOrder.amount_with_gst || 0).toFixed(2)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      <p>
              <b>
                <i>
                  Thank You for considering us for your needs.
                </i>
              </b>
            </p>
      
          </div>
        </div>
      </div>
    </div>
  );
}
