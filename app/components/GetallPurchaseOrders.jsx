'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/purchaseorder/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";

const GetPurchaseOrderTable = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    mature: false,
    lost: false,
  });
  const [sortOrder, setSortOrder] = useState("oldest");

  const formatPurchaseOrderNo = (poNo) => {
    if (!poNo) return "N/A";
    return poNo;
  };

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
    const fetchPurchaseOrders = async () => {
      try {
        const [poResponse, clientsMap] = await Promise.all([
          axios.get(API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);

        const mappedPOs = poResponse.data.map((po) => ({
          ...po,
          client_name: clientsMap[po.client_id] || "N/A",
          status: po.status || "active",
        }));

        const sortedPOs = mappedPOs.sort((a, b) => a.purchaseorder_id - b.purchaseorder_id);
        setPurchaseOrders(sortedPOs);
      } catch (error) {
        toast.error("Failed to load Purchase Orders!");
        console.error("Fetch error:", error);
      }
    };

    fetchPurchaseOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return;
    try {
      const response = await axios.delete(`${API_URL}${id}/`, { withCredentials: true });
      if (response.status === 204 || response.status === 200) {
        setPurchaseOrders((prev) => prev.filter((po) => po.purchaseorder_id !== id));
        toast.success("Purchase order deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  };

  const filteredPOs = purchaseOrders
    .filter((po) => {
      const matchesSearch =
        (po.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (po.purchaseperson?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (po.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const status = po.status?.toLowerCase() || "active";
      const selectedStatuses = Object.keys(statusFilters).filter((key) => statusFilters[key]);
      return matchesSearch && (selectedStatuses.length === 0 || selectedStatuses.includes(status));
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.purchaseorder_id - a.purchaseorder_id;
      if (sortOrder === "oldest") return a.purchaseorder_id - b.purchaseorder_id;
      if (sortOrder === "amount_high") return b.amount_with_gst - a.amount_with_gst;
      if (sortOrder === "amount_low") return a.amount_with_gst - b.amount_with_gst;
      return 0;
    });

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center pb-0">
        <h6>Manage Purchase Orders</h6>
        <Link href="/addpurchaseorder" className="btn btn-primary btn-sm">
          + Add Purchase Orders
        </Link>
      </div>

      <div className="card-body py-0 pt-0 pb-2">
        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Sr.No</th>
                <th>Date</th>
                <th className="d-none d-md-table-cell">ID</th>
                <th>Client Name</th>
                <th>Purchase Order No</th>
                <th className="d-none d-lg-table-cell">Purchase Person</th>
                <th>Freight</th>
                <th>Payment Mode</th>
                <th className="d-none d-lg-table-cell">GST Amount</th>
                <th>Total Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPOs.length > 0 ? (
                filteredPOs.map((po, index) => (
                  <tr key={po.purchaseorder_id}>
                    <td>{index + 1}</td>
                    <td>{formatDateTime(po.date)}</td>
                    <td className="d-none d-md-table-cell">{po.purchaseorder_id}</td>
                    <td>{po.client_name}</td>
                    <td>{formatPurchaseOrderNo(po.purchaseorder_no)}</td>
                    <td className="d-none d-lg-table-cell">{po.purchaseperson || "N/A"}</td>
                    <td>{po.freight || "N/A"}</td>
                    <td>{po.payment_method || "N/A"}</td>
                    <td className="d-none d-lg-table-cell">{po.gst_amount}</td>
                    <td>{po.amount_with_gst}</td>
                    <td className="action-column">
                      <Link href={`/editpurchaseorder/${po.purchaseorder_id}`}>
                        <i className="fas fa-pen text-primary me-2" title="Edit"></i>
                      </Link>
                      <Link href={`/viewpurchaseorder/${po.purchaseorder_id}`}>
                        <i className="fas fa-eye text-primary me-2" title="View"></i>
                      </Link>
                      <i
                        className="fas fa-trash text-danger me-2"
                        title="Delete"
                        onClick={() => handleDelete(po.purchaseorder_id)}
                        style={{ cursor: "pointer" }}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No Purchase Orders found.
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

export default GetPurchaseOrderTable;
