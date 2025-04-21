"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const SALESORDER_API_URL = "https://api.panvic.in/salesorder/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";

const GetSalesOrdersTable = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");

  const fetchAllClients = async () => {
    try {
      const response = await axios.get(CLIENTS_API_URL, { withCredentials: true });
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

        const sorted = enrichedOrders.sort((a, b) => b.salesorder_id - a.salesorder_id);
        setSalesOrders(sorted);
      } catch (error) {
        console.error("Error fetching sales orders:", error);
        toast.error("Failed to load sales orders!");
      }
    };

    fetchSalesOrders();
  }, []);

  const filteredSalesOrders = salesOrders
    .filter((so) => {
      const match =
        (so.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (so.salesperson?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
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
      <div className="card-header pb-0">
        <h6>Manage Sales Orders</h6>
      </div>

      <div className="card-body pt-0 pb-2">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
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
        </div>

        <div className="table-responsive">
          <table className="table align-items-center mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client Name</th>
                <th>Sale Order No</th>
                <th>Salesperson</th>
                <th>Subject</th>
                <th>Incl. GST</th>
                <th>Without GST</th>
                <th>GST</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesOrders.length > 0 ? (
                filteredSalesOrders.map((so) => (
                  <tr key={so.salesorder_id}>
                    <td>{so.salesorder_id}</td>
                    <td>{so.client_name}</td>
                    <td>{so.salesorder_no}</td>
                    <td>{so.salesperson}</td>
                    <td>{so.subject}</td>
                    <td>{so.amount_including_gst}</td>
                    <td>{so.without_gst}</td>
                    <td>{so.gst_amount}</td>
                    <td>{so.amount_with_gst}</td>
                    <td>
                      <span className={getBadgeClass(so.status)}>
                        {so.status}
                      </span>
                    </td>
                    <td>
                      <Link href={`/editsalesorder/${so.salesorder_id}`}>
                        <i className="fas fa-pen text-primary me-2" title="Edit"></i>
                      </Link>
                      <Link href={`/viewsales/${so.salesorder_id}`}>
                        <i className="fas fa-eye text-info" title="View"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No sales orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GetSalesOrdersTable;
