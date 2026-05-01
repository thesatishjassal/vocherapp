"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

// const API_URL = "https://api.panvic.in/quotation/";
// const CLIENTS_API_URL = "https://api.panvic.in/clients/";
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GetQuotationTables = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilters, setStatusFilters] = useState({
    active: false,
    mature: false,
    lost: false,
  });
  const [sortOrder, setSortOrder] = useState("latest");
  const [userDetails, setUserDetails] = useState(null);

    useEffect(() => {
    // Try to get the user_details cookie
    const userDetailsCookie = Cookies.get("user_details");
    console.log("User Details Cookie:", userDetailsCookie);
    if (userDetailsCookie) {
      // Parse and set the user details if the cookie exists
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);

  // Helper function to format quotation_no
  const formatQuotationNo = (quotationNo) => {
    if (!quotationNo) return "N/A"; // Handle null or undefined
    const isNumeric = /^\d+$/.test(quotationNo);
    return isNumeric ? `PLQOT-${quotationNo}` : quotationNo;
  };

  const fetchAllClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients/`, {
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

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const [quotationsResponse, clientsMap] = await Promise.all([
          axios.get(`${API_URL}/quotation/`, { withCredentials: true }),
          fetchAllClients(),
        ]);
        const quotationsWithClientNames = quotationsResponse.data.map((q) => ({
          ...q,
          client_name: clientsMap[q.client_id] || null,
          status: q.status || "Active",
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
    fetchQuotations(  );
  }, []);

  const handleDelete = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;
    try {
      const response = await axios.delete(`${API_URL}/quotation/${quotationId}/`, {
        withCredentials: true,
      });
      if (response.status === 204 || response.status === 200) {
        setQuotations((prev) =>
          prev.filter((q) => q.quotation_id !== quotationId)
        );
        toast.success("Quotation deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete quotation: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  const handleClone = async (quotationId) => {
    if (!confirm("Are you sure you want to clone this quotation?")) return;
    try {
      const response = await axios.post(
        `${API_URL}/quotation/${quotationId}/clone`,
        {},
        {
          withCredentials: true,
        }
      );
      if (response.status === 200 || response.status === 201) {
        const newQuotation = {
          ...response.data,
          client_name:
            quotations.find((q) => q.quotation_id === quotationId)
              ?.client_name || null,
          status: response.data.status || "Active",
        };
        setQuotations((prev) =>
          [newQuotation, ...prev].sort(
            (a, b) => b.quotation_id - a.quotation_id
          )
        );
        toast.success("Quotation cloned successfully!");
      }
    } catch (error) {
      toast.error(`Failed to clone quotation: ${error.message}`);
      console.error("Clone error:", error);
    }
  };

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_URL}/quotation/${quotationId}/`,
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
      const status = q.status?.toLowerCase() || "active";
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
  (q.quotation_no?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
  (q.quotation_id?.toString().toLowerCase() || "").includes(searchQuery.toLowerCase()) ||  // Note: Added toString() for safety since ID is numeric
  (q.client_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
  (q.salesperson?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
  (q.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      const status = q.status?.toLowerCase() || "active";
      const selectedStatuses = Object.keys(statusFilters).filter(
        (key) => statusFilters[key]
      );
      return (
        matchesSearch &&
        (selectedStatuses.length === 0 || selectedStatuses.includes(status))
      );
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

  const getBadgeClass = (status) => {
    const statusStr = status?.toLowerCase() || "active";
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
        <h6>Manage Quotations</h6>
        <Link href="/addquotation" className="btn btn-primary btn-sm">
          + Add Quotation
        </Link>
      </div>

      <div className="px-3 pt-2 pb-0">
        <div className="d-flex flex-wrap gap-3 align-items-center mb-2">
<input
  type="text"
  className="form-control w-auto"
  placeholder="Search by ID, quotation no, client, salesperson or subject"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="activeCheck"
              checked={statusFilters.active}
              onChange={() => handleCheckboxChange("active")}
            />
            <label className="form-check-label" htmlFor="activeCheck">
              Active ({statusCounts.active})
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="matureCheck"
              checked={statusFilters.mature}
              onChange={() => handleCheckboxChange("mature")}
            />
            <label className="form-check-label" htmlFor="matureCheck">
              Mature ({statusCounts.mature})
            </label>
          </div>
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="lostCheck"
              checked={statusFilters.lost}
              onChange={() => handleCheckboxChange("lost")}
            />
            <label className="form-check-label" htmlFor="lostCheck">
              Lost ({statusCounts.lost})
            </label>
          </div>
        </div>
      </div>

      <div className="card-body py-0 pt-0 pb-2">
        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th>Created At</th>
                <th className="d-none d-md-table-cell">ID</th>
                <th>Client Name</th>
                <th>Quotation No</th>
                <th className="d-none d-lg-table-cell">Salesperson</th>
                <th>Subject</th>
                <th className="d-none d-lg-table-cell">Without GST</th>
                <th className="d-none d-lg-table-cell">GST Amount</th>
                <th>Total with GST</th>
                <th>Created By</th> 
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotations.length > 0 ? (
                filteredQuotations.map((q) => (
                  <tr key={q.quotation_id}>
                    <td>{formatDateTime(q.created_at)}</td>
                    <td className="d-none d-md-table-cell">{q.quotation_id}</td>
                    <td>{q.client_name || q.businessname || "N/A"}</td>
                    <td>{formatQuotationNo(q.quotation_no)}</td>
                    <td className="d-none d-lg-table-cell">{q.salesperson}</td>
                    <td>{q.subject}</td>
                    <td className="d-none d-lg-table-cell">{q.without_gst}</td>
                    <td className="d-none d-lg-table-cell">{q.gst_amount}</td>
                    <td>{q.amount_including_gst}</td>
                    <td>{q.created_by || "N/A"}</td>

                    <td>
                      <span className={getBadgeClass(q.status)}>
                        {q.status || "Active"}
                      </span>
                    </td>

                    <td className="action-column">
                      <Link href={`/editquotation/${q.quotation_id}`}>
                        <i
                          className="fas fa-pen text-primary me-2"
                          title="Edit"
                        ></i>
                      </Link>
                      <Link href={`/viewquotation/${q.quotation_id}`}>
                        <i
                          className="fas fa-eye text-primary me-2"
                          title="View"
                        ></i>
                      </Link>
                      <i
                        className="fas fa-trash text-danger me-2"
                        title="Delete"
                        onClick={() => handleDelete(q.quotation_id)}
                        style={{ cursor: "pointer" }}
                      ></i>
                      <i
                        className="fas fa-copy text-secondary me-2"
                        title="Clone"
                        onClick={() => handleClone(q.quotation_id)}
                        style={{ cursor: "pointer" }}
                      ></i>
                      <select
                        className="form-select form-select-sm d-inline w-auto"
                        value={q.status || "Active"}
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
                  <td colSpan="12" className="text-center">
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
