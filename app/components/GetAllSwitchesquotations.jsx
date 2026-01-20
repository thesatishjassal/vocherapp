'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/switch-quotations/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";

const GetAllSwitchesquotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    mature: false,
    lost: false,
  });
  const [sortOrder, setSortOrder] = useState("oldest");

  const formatQuotationNo = (qtNo) => {
    if (!qtNo) return "N/A";
    const isNumeric = /^\d+$/.test(qtNo);
    return isNumeric ? `PLQT-${qtNo}` : qtNo;
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
    const fetchQuotations = async () => {
      try {
        const [qtResponse, clientsMap] = await Promise.all([
          axios.get(API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);
        const quotationsWithClientNames = qtResponse.data.map((qt) => ({
          ...qt,
          client_name: clientsMap[qt.client_id] || null,
          status: qt.status || "Active",
        }));
        const sortedQuotations = quotationsWithClientNames.sort(
          (a, b) => a.quotation_id - b.quotation_id
        );
        setQuotations(sortedQuotations);
      } catch (error) {
        toast.error("Failed to load quotations!");
        console.error("Fetch error:", error);
      }
    };
    fetchQuotations();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const response = await axios.delete(`${API_URL}${id}/`, { withCredentials: true });
      if (response.status === 204 || response.status === 200) {
        setQuotations((prev) => prev.filter((qt) => qt.quotation_id !== id));
        toast.success("Quotation deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}${id}/`, { status: newStatus }, { withCredentials: true });
      if (response.status === 200 || response.status === 201) {
        setQuotations((prev) =>
          prev.map((qt) => (qt.quotation_id === id ? { ...qt, status: newStatus } : qt))
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

  const statusCounts = quotations.reduce(
    (acc, qt) => {
      const status = qt.status?.toLowerCase() || "active";
      if (status === "active") acc.active += 1;
      if (status === "mature") acc.mature += 1;
      if (status === "lost") acc.lost += 1;
      return acc;
    },
    { active: 0, mature: 0, lost: 0 }
  );

  const filteredQuotations = quotations
    .filter((qt) => {
      const matchesSearch =
        (qt.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (qt.salesperson?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (qt.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const status = qt.status?.toLowerCase() || "active";
      const selectedStatuses = Object.keys(statusFilters).filter((key) => statusFilters[key]);
      return matchesSearch && (selectedStatuses.length === 0 || selectedStatuses.includes(status));
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.quotation_id - a.quotation_id;
      if (sortOrder === "oldest") return a.quotation_id - b.quotation_id;
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
  const date = new Date(isoString);

  // Check if date is valid
  if (isNaN(date.getTime())) return "Invalid Date";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata", // Ensures correct Indian time
  });
};


  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between align-items-center pb-0">
        <h6>Manage Switch Quotations</h6>
        <Link href="/addswitchquotation" className="btn btn-primary btn-sm">
          + Add Switch Quotation
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
                <th>Quotation No</th>
                <th className="d-none d-lg-table-cell">Salesperson</th>
                <th>Subject</th>
                <th className="d-none d-lg-table-cell">Without GST</th>
                <th className="d-none d-lg-table-cell">GST Amount</th>
                <th className="d-none d-lg-table-cell">Created By</th>
                <th>Total Amount</th>
                <th>Actions</th> 
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.reverse().length > 0 ? (
                filteredQuotations.map((qt, index) => (
                  <tr key={qt.quotation_id}>
                    <td>{index + 1}</td>
                    <td>{formatDateTime(qt.created_at)}</td>
                    <td className="d-none d-md-table-cell">{qt.quotation_id}</td>
                    <td>{qt.client_name || "N/A"}</td>
                    <td>{formatQuotationNo(qt.quotation_no)}</td>
                    <td className="d-none d-lg-table-cell">{qt.salesperson}</td>
                    <td>{qt.subject || "N/A"}</td>
                    <td className="d-none d-lg-table-cell">{qt.without_gst}</td>
                    <td className="d-none d-lg-table-cell">{qt.gst_amount}</td>
                    <td className="d-none d-lg-table-cell">{qt.created_by}</td>
                    <td>{qt.amount_with_gst}</td>
                    <td className="action-column">
                      <Link href={`/editswitchquotation/${qt.quotation_id}`}>
                        <i className="fas fa-pen text-primary me-2" title="Edit"></i>
                      </Link>
                      <Link href={`/viewswitchquotation/${qt.quotation_id}`}>
                        <i className="fas fa-eye text-primary me-2" title="View"></i>
                      </Link>
                      <i
                        className="fas fa-trash text-danger me-2"
                        title="Delete"
                        onClick={() => handleDelete(qt.quotation_id)}
                        style={{ cursor: "pointer" }}
                      ></i>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="text-center">
                    No switch quotation found.
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

export default GetAllSwitchesquotations;