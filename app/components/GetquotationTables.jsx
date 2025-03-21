"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/quotation/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";

const GetQuotationTables = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    mature: false,
    lost: false,
  });
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
    const fetchQuotations = async () => {
      try {
        const [quotationsResponse, clientsMap] = await Promise.all([
          axios.get(API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);
        const quotationsWithClientNames = quotationsResponse.data.map((q) => ({
          ...q,
          client_name: clientsMap[q.client_id] || null,
          status: q.status || "Active", // Default to "Active" if status is missing
        }));
        const sortedQuotations = quotationsWithClientNames.sort(
          (a, b) => b.quotation_id - a.quotation_id
        );
        setQuotations(sortedQuotations);
      } catch (error) {
        toast.error("Failed to load quotations!");
        console.error("Fetch error:", error);
      }
    };
    fetchQuotations();
  }, []);

  const handleDelete = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const response = await axios.delete(
        `https://api.panvic.in/quotation/${quotationId}/`,
        { withCredentials: true }
      );
      if (response.status === 204 || response.status === 200) {
        setQuotations((prev) => prev.filter((q) => q.quotation_id !== quotationId));
        toast.success("Quotation deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete quotation: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      const response = await axios.put(
        `https://api.panvic.in/quotation/${quotationId}/`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200 || response.status === 201) {
        setQuotations((prev) =>
          prev.map((q) =>
            q.quotation_id === quotationId ? { ...q, status: newStatus } : q
          )
        );
        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      toast.error(`Failed to update status: ${error.message}`);
      console.error("Status update error:", error);
    }
  };

  const handleCheckboxChange = (status) => {
    setStatusFilters((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  const statusCounts = quotations.reduce(
    (acc, q) => {
      const status = q.status?.toLowerCase() || "active"; // Default to "active" for counting
      if (status === "active") acc.active += 1;
      if (status === "mature") acc.mature += 1;
      if (status === "lost") acc.lost += 1;
      return acc;
    },
    { active: 0, mature: 0, lost: 0 }
  );

  const filteredQuotations = quotations
    .filter((q) => {
      const matchesSearch =
        (q.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (q.salesperson?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (q.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const status = q.status?.toLowerCase() || "active"; // Default to "active" for filtering
      const selectedStatuses = Object.keys(statusFilters).filter(
        (key) => statusFilters[key]
      );
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
      const statusStr = status?.toLowerCase() || "active"; // Default to "active"
      switch (statusStr) {
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

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Quotations</h6>
      </div>

      <div className="card-body py-0 pt-0 pb-2">
        <div className="filters-container d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
          <input
            type="text"
            placeholder="Search by Salesperson, Subject, or Business Name"
            className="form-control search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="filter-actions d-flex flex-column flex-md-row align-items-start gap-2">
            <div className="status-filters d-flex flex-wrap gap-2">
              {["active", "mature", "lost"].map((status) => (
                <div className="form-check" key={status}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`${status}Checkbox`}
                    checked={statusFilters[status]}
                    onChange={() => handleCheckboxChange(status)}
                  />
                  <label className="form-check-label" htmlFor={`${status}Checkbox`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status]})
                  </label>
                </div>
              ))}
            </div>

            <select
              className="form-select sort-select"
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
                setStatusFilters({ active: true, mature: false, lost: false });
                setSortOrder("latest");
              }}
            >
              Clear
            </button>

            <a className="btn btn-primary add-btn" href="/addquotation">
              Add Quotation
            </a>
          </div>
        </div>

        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th className="d-none d-md-table-cell">ID</th>
                <th>Client Name</th>
                <th>Quotation No</th>
                <th className="d-none d-lg-table-cell">Salesperson</th>
                <th>Subject</th>
                <th className="d-none d-md-table-cell">Amount (Incl. GST)</th>
                <th className="d-none d-lg-table-cell">Without GST</th>
                <th className="d-none d-lg-table-cell">GST Amount</th>
                <th>Total with GST</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((q) => (
                  <tr key={q.quotation_id}>
                    <td className="d-none d-md-table-cell">{q.quotation_id}</td>
                    <td>{q.client_name || "N/A"}</td>
                    <td>{q.quotation_no}</td>
                    <td className="d-none d-lg-table-cell">{q.salesperson}</td>
                    <td>{q.subject}</td>
                    <td className="d-none d-md-table-cell">{q.amount_including_gst}</td>
                    <td className="d-none d-lg-table-cell">{q.without_gst}</td>
                    <td className="d-none d-lg-table-cell">{q.gst_amount}</td>
                    <td>{q.amount_with_gst}</td>
                    <td>
                      <span className={getBadgeClass(q.status)}>
                        {q.status || "Active"} {/* Display "Active" if status is missing */}
                      </span>
                    </td>
                    <td className="action-column">
                      <Link href={`/editquotation/${q.quotation_id}`}>
                        <i className="fas fa-pen text-primary me-2" title="Edit"></i>
                      </Link>
                      <Link href={`/viewquotation/${q.quotation_id}`}>
                        <i className="fas fa-eye text-primary me-2" title="View"></i>
                      </Link>
                      <select
                        className="form-select form-select-sm d-inline w-auto"
                        value={q.status || "Active"} // Default to "Active" in dropdown
                        onChange={(e) => handleStatusChange(q.quotation_id, e.target.value)}
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
                  <td colSpan="11" className="text-center">
                    No quotations found.
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

export default GetQuotationTables;