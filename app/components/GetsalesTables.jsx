"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const SALESORDER_API_URL = "https://api.panvic.in/salesorder/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";
const QUOTATION_API_URL = "https://api.panvic.in/quotation/";

const GetSalesOrdersTable = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  // quotation state
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [quotationItems, setQuotationItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  // Fetch all clients map
  const fetchAllClients = async () => {
    try {
      const response = await axios.get(CLIENTS_API_URL, {
        withCredentials: true,
      });
      return response.data.reduce((acc, client) => {
        acc[client.id] = client.businessname;
        return acc;
      }, {});
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load client data!");
      return {};
    }
  };

  // Fetch sales orders
  useEffect(() => {
    const fetchSalesOrders = async () => {
      try {
        const [salesOrdersResponse, clientsMap] = await Promise.all([
          axios.get(SALESORDER_API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);

        const enrichedOrders = salesOrdersResponse.data.map((so) => ({
          ...so,
          client_name: clientsMap[so.client_id] || "N/A",
          status: so.status || "Active",
        }));

        const sorted = enrichedOrders.sort(
          (a, b) => b.salesorder_id - a.salesorder_id
        );
        setSalesOrders(sorted);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
        toast.error("Failed to load sales orders!");
      }
    };

    fetchSalesOrders();
  }, []);

  // Fetch all quotations for dropdown
  useEffect(() => {
    axios
      .get(QUOTATION_API_URL)
      .then((res) => setQuotations(res.data))
      .catch((err) => {
        console.error("Error fetching quotations:", err);
        toast.error("Failed to load quotations!");
      });
  }, []);

  // Fetch quotation items when selection changes
  useEffect(() => {
    if (!selectedQuotation) return;

    setLoadingItems(true);
    axios
      .get(`${QUOTATION_API_URL}${selectedQuotation}/items/`)
      .then((res) => {
        setQuotationItems(res.data);
      })
      .catch((err) => {
        console.error("Error fetching quotation items:", err);
        toast.error("Failed to load quotation items!");
      })
      .finally(() => setLoadingItems(false));
  }, [selectedQuotation]);

  const filteredSalesOrders = salesOrders
    .filter((so) => {
      const match =
        (so.client_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (so.salesperson?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        ) ||
        (so.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      return match;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.salesorder_id - a.salesorder_id;
      if (sortOrder === "oldest") return a.salesorder_id - b.salesorder_id;
      if (sortOrder === "amount_high") return b.amount_with_gst - a.amount_with_gst;
      if (sortOrder === "amount_low") return a.amount_with_gst - b.amount_with_gst;
      return 0;
    });

  const getBadgeClass = (status) => {
    switch ((status || "").toLowerCase()) {
      case "active":
        return "badge bg-success";
      case "mature":
        return "badge bg-primary";
      case "lost":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  };

  return (
    <div className="card">
      {/* <div className="card-header pb-0">
        <h6>Manage Sales Orders</h6>
      </div> */}

      <div className="card-body pt-0 pb-2">
        {/* Filter & Actions */}
        {/* <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
          <input
            type="text"
            placeholder="Search by Salesperson, Subject, or Client"
            className="form-control"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="d-flex gap-2">
            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount_high">Amount High to Low</option>
              <option value="amount_low">Amount Low to High</option>
            </select>

            <button
              className="btn btn-secondary"
              onClick={() => {
                setSearchQuery("");
                setSortOrder("latest");
              }}
            >
              Clear
            </button>

            <a className="btn btn-primary" href="/addsalesorder">
              + Sale Order
            </a>
          </div>
        </div> */}

        {/* Select Quotation */}
        <div className="mb-4">
          <label className="form-label">Select Quotation:</label>
          <select
            className="form-select"
            value={selectedQuotation || ""}
            onChange={(e) => setSelectedQuotation(e.target.value)}
          >
            <option value="">-- Choose Quotation --</option>
            {quotations.map((q) => (
              <option key={q.id} value={q.quotation_id}>
                Quotation #{q.quotation_id}
              </option>
            ))}
          </select>
        </div>

        {/* Quotation Items Table */}
        {selectedQuotation && (
          <div className="table-responsive mb-4">
            <h6>Sales Order Items</h6>
            {loadingItems ? (
              <p>Loading items...</p>
            ) : (
              <table className="table table-bordered table-striped table-hover align-middle">
                <thead>
                  <tr>
                    <th>ItemCode</th>
                    <th>Item Name</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quotationItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.itemcode}</td>
                      <td>{item.item_name}</td>
                      <td>{item.unit}</td>
                      <td>{item.quantity}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default GetSalesOrdersTable;
