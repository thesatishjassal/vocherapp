"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/quotation/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";

const GetQuotationTables = () => {
  // State variables
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    active: true, // Default to "Active" checked
    mature: false,
    lost: false,
  });
  const [sortOrder, setSortOrder] = useState("latest");

  // Function to fetch all clients and create a lookup map
  const fetchAllClients = async () => {
    try {
      const response = await axios.get(CLIENTS_API_URL, { withCredentials: true });
      console.log("Raw Clients Data:", response.data);

      // Create a map of client_id to businessname
      const clientsMap = response.data.reduce((acc, client) => {
        acc[client.id] = client.businessname; // Use 'id' and 'businessname' as per your JSON
        return acc;
      }, {});

      console.log("Clients Map:", clientsMap);
      return clientsMap;
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error("Failed to load client data!");
      return {};
    }
  };

  // Fetch quotations on component mount and set default status to "Active"
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const [quotationsResponse, clientsMap] = await Promise.all([
          axios.get(API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);

        console.log("Raw Quotations Data:", quotationsResponse.data);

        const quotationsWithClientNames = quotationsResponse.data.map((q) => {
          const businessname = clientsMap[q.client_id] || null;
          console.log(
            `Quotation ID ${q.quotation_id} - Client ID: ${q.client_id}, Client Name: ${businessname}`
          );
          return {
            ...q,
            client_name: businessname,
            status: "Active", // Set default status to "Active" for all quotations
          };
        });

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

  // Handle quotation delete
  const handleDelete = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    try {
      const response = await axios.delete(`${API_URL}${quotationId}/`, {
        withCredentials: true,
      });

      if (response.status === 204 || response.status === 200) {
        setQuotations((prev) =>
          prev.filter((q) => q.quotation_id !== quotationId)
        );
        toast.success("Quotation deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error(`Failed to delete quotation: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  // Handle status change (update status via dropdown)
  const handleStatusChange = (quotationId, newStatus) => {
    setQuotations((prev) =>
      prev.map((q) =>
        q.quotation_id === quotationId ? { ...q, status: newStatus } : q
      )
    );
    toast.success(`Status updated to ${newStatus}`);
  };

  // Handle checkbox change
  const handleCheckboxChange = (status) => {
    setStatusFilters((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  // Calculate counts for each status
  const statusCounts = quotations.reduce(
    (acc, q) => {
      const status = q.status ? String(q.status).toLowerCase() : "";
      if (status === "active") acc.active += 1;
      if (status === "mature") acc.mature += 1;
      if (status === "lost") acc.lost += 1;
      return acc;
    },
    { active: 0, mature: 0, lost: 0 }
  );

  // Filter and sort quotations
  const filteredQuotations = quotations
    .filter((q) => {
      const matchesSearch =
        q.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.salesperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const status = q.status ? String(q.status).toLowerCase() : "";
      const selectedStatuses = Object.keys(statusFilters).filter(
        (key) => statusFilters[key]
      );
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(status);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.quotation_id - a.quotation_id;
      if (sortOrder === "oldest") return a.quotation_id - b.quotation_id;
      if (sortOrder === "amount_high")
        return b.amount_with_gst - a.amount_with_gst;
      if (sortOrder === "amount_low")
        return a.amount_with_gst - b.amount_with_gst;
      return 0;
    });

  // Function to get badge class based on status
  const getBadgeClass = (status) => {
    const statusStr = status ? String(status).toLowerCase() : "";
    switch (statusStr) {
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
        <h6>Manage Quotations</h6>
      </div>

      <div className="card-body py-0 pt-0 pb-2">
        {/* Filters */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by Salesperson or Subject or Businessname"
            className="form-control w-auto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Filter & Actions */}
          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Status Checkboxes with Counts */}
            <div className="d-flex gap-2">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="activeCheckbox"
                  checked={statusFilters.active}
                  onChange={() => handleCheckboxChange("active")}
                />
                <label className="form-check-label" htmlFor="activeCheckbox">
                  Active ({statusCounts.active})
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="matureCheckbox"
                  checked={statusFilters.mature}
                  onChange={() => handleCheckboxChange("mature")}
                />
                <label className="form-check-label" htmlFor="matureCheckbox">
                  Mature ({statusCounts.mature})
                </label>
              </div>
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="lostCheckbox"
                  checked={statusFilters.lost}
                  onChange={() => handleCheckboxChange("lost")}
                />
                <label className="form-check-label" htmlFor="lostCheckbox">
                  Lost ({statusCounts.lost})
                </label>
              </div>
            </div>

            <select
              className="form-select w-auto"
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
              Clear Filters
            </button>

            <a className="btn btn-primary" href="/addquotation">
              Add Quotation
            </a>
          </div>
        </div>

        {/* Quotations Table */}
        <table className="table align-items-center mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Quotation No</th>
              <th>Salesperson</th>
              <th>Subject</th>
              <th>Amount (Incl. GST)</th>
              <th>Without GST</th>
              <th>GST Amount</th>
              <th>Total with GST</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotations.length > 0 ? (
              filteredQuotations.map((q) => (
                <tr key={q.quotation_id}>
                  <td>{q.quotation_id}</td>
                  <td>{q.client_name || "N/A"}</td>
                  <td>{q.quotation_no}</td>
                  <td>{q.salesperson}</td>
                  <td>{q.subject}</td>
                  <td>{q.amount_including_gst}</td>
                  <td>{q.without_gst}</td>
                  <td>{q.gst_amount}</td>
                  <td>{q.amount_with_gst}</td>
                  <td>
                    <span className={getBadgeClass(q.status)}>
                      {q.status || "N/A"}
                    </span>
                  </td>
                  <td>
                    <Link href={`/viewquotation/${q.quotation_id}`}>
                      <u
                        className="text-primary me-2"
                        title="View"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="fas fa-eye"></i>
                      </u>
                    </Link>
                    <select
                      className="form-select form-select-sm d-inline w-75"
                      value={q.status || ""}
                      onChange={(e) =>
                        handleStatusChange(q.quotation_id, e.target.value)
                      }
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
  );
};

export default GetQuotationTables;