"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/salesorder/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";

const GetSalesOrdersTable = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    mature: false,
    lost: false,
  });
  const [sortOrder, setSortOrder] = useState("latest");

  const formatSalesOrderNo = (soNo) => {
    if (!soNo) return "N/A";
    const isNumeric = /^\d+$/.test(soNo);
    return isNumeric ? `PLSO-${soNo}` : soNo;
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
    const fetchSalesOrders = async () => {
      try {
        const [soResponse, clientsMap] = await Promise.all([
          axios.get(API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);
        const salesOrdersWithClientNames = soResponse.data.map((so) => ({
          ...so,
          client_name: clientsMap[so.client_id] || null,
          status: so.status || "Active",
        }));
        const sortedSalesOrders = salesOrdersWithClientNames.sort(
          (a, b) => b.salesOrder_id - a.salesOrder_id
        );
        setSalesOrders(sortedSalesOrders);
      } catch (error) {
        toast.error("Failed to load sales orders!");
        console.error("Fetch error:", error);
      }
    };
    fetchSalesOrders();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this sales order?")) return;
    try {
      const response = await axios.delete(`${API_URL}${id}/`, { withCredentials: true });
      if (response.status === 204 || response.status === 200) {
        setSalesOrders((prev) => prev.filter((so) => so.salesOrder_id !== id));
        toast.success("Sales order deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleClone = async (id) => {
    if (!confirm("Are you sure you want to clone this sales order?")) return;
    try {
      const response = await axios.post(`${API_URL}${id}/clone`, {}, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        const newSO = {
          ...response.data,
          client_name: salesOrders.find((so) => so.salesOrder_id === id)?.client_name || null,
          status: response.data.status || "Active",
        };
        setSalesOrders((prev) => [newSO, ...prev].sort((a, b) => b.salesOrder_id - a.salesOrder_id));
        toast.success("Sales order cloned successfully!");
      }
    } catch (error) {
      toast.error(`Failed to clone: ${error.message}`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}${id}/`, { status: newStatus }, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        setSalesOrders((prev) =>
          prev.map((so) => (so.salesOrder_id === id ? { ...so, status: newStatus } : so))
        );
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error(`Failed to update status: ${error.message}`);
    }
  };

  const handleCheckboxChange = (status) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const statusCounts = salesOrders.reduce(
    (acc, so) => {
      const status = so.status?.toLowerCase() || "active";
      if (status === "active") acc.active += 1;
      if (status === "mature") acc.mature += 1;
      if (status === "lost") acc.lost += 1;
      return acc;
    },
    { active: 0, mature: 0, lost: 0 }
  );

  const filteredSalesOrders = salesOrders
    .filter((so) => {
      const matchesSearch =
        (so.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (so.salesperson?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (so.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const status = so.status?.toLowerCase() || "active";
      const selectedStatuses = Object.keys(statusFilters).filter((key) => statusFilters[key]);
      return matchesSearch && (selectedStatuses.length === 0 || selectedStatuses.includes(status));
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.salesOrder_id - a.salesOrder_id;
      if (sortOrder === "oldest") return a.salesOrder_id - b.salesOrder_id;
      if (sortOrder === "amount_high") return b.amount_with_gst - a.amount_with_gst;
      if (sortOrder === "amount_low") return a.amount_with_gst - b.amount_with_gst;
      return 0;
    });

  const getBadgeClass = (status) => {
    const s = status?.toLowerCase() || "active";
    switch (s) {
      case "active":
        return "badge bg-success";
      case "mature":
        return "badge bg-primary";
      case "lost":
        return "badge bg-danger";
      default:
        return "badge bg-success";
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "N/A";
    return new Date(isoString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center pb-0">
        <h6>Manage Sales Orders</h6>
        <Link href="/addsalesorder" className="btn btn-primary btn-sm">
          + Add Sales Order
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
                <th>Sales Order No</th>
                <th className="d-none d-lg-table-cell">Salesperson</th>
                {/* <th>Subject</th> */}
                {/* <th className="d-none d-lg-table-cell">Without GST</th> */}
                <th>Freight</th>
                <th>Payment Mode</th>
                <th className="d-none d-lg-table-cell">GST Amount</th>
                <th>Total Amount</th>
                {/* <th>Status</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSalesOrders.length > 0 ? (
                filteredSalesOrders.map((so) => (
                  <tr key={so.salesOrder_id}>
                    <td>{formatDateTime(so.date)}</td>
                    <td className="d-none d-md-table-cell">{so.salesOrder_id}</td>
                    <td>{so.client_name || "N/A"}</td>
                    <td>{formatSalesOrderNo(so.salesOrder_no)}</td>
                    <td className="d-none d-lg-table-cell">{so.salesperson}</td>
                    <td>{so.subject}</td>
                    <td className="d-none d-lg-table-cell">{so.without_gst}</td>
                    <td className="d-none d-lg-table-cell">{so.gst_amount}</td>
                    <td>{so.amount_with_gst}</td>
                    <td>{so.payment_method || "N/A"}</td>
                    <td>{so.freight || "N/A"}</td>
                    <td>
                      <span className={getBadgeClass(so.status)}>
                        {so.status || "Active"}
                      </span>
                    </td>
                    <td className="action-column">
                      <Link href={`/editsalesorder/${so.salesOrder_id}`}>
                        <i className="fas fa-pen text-primary me-2" title="Edit"></i>
                      </Link>
                      <Link href={`/viewsalesorder/${so.salesOrder_id}`}>
                        <i className="fas fa-eye text-primary me-2" title="View"></i>
                      </Link>
                      <i
                        className="fas fa-trash text-danger me-2"
                        title="Delete"
                        onClick={() => handleDelete(so.salesOrder_id)}
                        style={{ cursor: "pointer" }}
                      ></i>
                      <i
                        className="fas fa-copy text-secondary me-2"
                        title="Clone"
                        onClick={() => handleClone(so.salesOrder_id)}
                        style={{ cursor: "pointer" }}
                      ></i>
                      <select
                        className="form-select form-select-sm d-inline w-auto"
                        value={so.status || "Active"}
                        onChange={(e) => handleStatusChange(so.salesOrder_id, e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Mature">Mature</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="13" className="text-center">
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
