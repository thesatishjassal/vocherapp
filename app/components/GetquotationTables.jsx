"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

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
  const [userDetails, setUserDetails] = useState(null);

  /* ---------------- USER COOKIE ---------------- */
  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);

  /* ---------------- HELPERS ---------------- */
  const formatQuotationNo = (quotationNo) => {
    if (!quotationNo) return "N/A";
    const isNumeric = /^\d+$/.test(quotationNo);
    return isNumeric ? `PLQOT-${quotationNo}` : quotationNo;
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

  const getBadgeClass = (status) => {
    switch ((status || "active").toLowerCase()) {
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

  /* ---------------- FETCH CLIENTS ---------------- */
  const fetchAllClients = async () => {
    try {
      const res = await axios.get(CLIENTS_API_URL, {
        withCredentials: true,
      });
      return res.data.reduce((acc, c) => {
        acc[c.id] = c.businessname;
        return acc;
      }, {});
    } catch (err) {
      toast.error("Failed to load client data!");
      return {};
    }
  };

  /* ---------------- FETCH QUOTATIONS ---------------- */
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const [quotationRes, clientsMap] = await Promise.all([
          axios.get(API_URL, { withCredentials: true }),
          fetchAllClients(),
        ]);

        const merged = quotationRes.data.map((q) => ({
          ...q,
          client_name: clientsMap[q.client_id] || null,
          status: q.status || "Active",
        }));

        // ✅ SORT BY CREATED_AT (LATEST FIRST)
        merged.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setQuotations(merged);
      } catch (err) {
        toast.error("Failed to load quotations!");
        console.error(err);
      }
    };

    fetchQuotations();
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Delete this quotation?")) return;
    try {
      await axios.delete(`${API_URL}${id}/`, { withCredentials: true });
      setQuotations((prev) => prev.filter((q) => q.quotation_id !== id));
      toast.success("Quotation deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleClone = async (id) => {
    if (!confirm("Clone this quotation?")) return;
    try {
      const res = await axios.post(
        `${API_URL}${id}/clone`,
        {},
        { withCredentials: true }
      );

      const cloned = {
        ...res.data,
        status: res.data.status || "Active",
      };

      setQuotations((prev) =>
        [cloned, ...prev].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
      );

      toast.success("Quotation cloned");
    } catch (err) {
      toast.error("Clone failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}${id}/`,
        { status },
        { withCredentials: true }
      );
      setQuotations((prev) =>
        prev.map((q) =>
          q.quotation_id === id ? { ...q, status } : q
        )
      );
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  /* ---------------- FILTERING ---------------- */
  const filteredQuotations = quotations
    .filter((q) => {
      const search = searchQuery.toLowerCase();
      const matchesSearch =
        q.quotation_no?.toLowerCase().includes(search) ||
        q.quotation_id?.toString().includes(search) ||
        q.client_name?.toLowerCase().includes(search) ||
        q.salesperson?.toLowerCase().includes(search) ||
        q.subject?.toLowerCase().includes(search);

      const activeFilters = Object.keys(statusFilters).filter(
        (k) => statusFilters[k]
      );

      return (
        matchesSearch &&
        (activeFilters.length === 0 ||
          activeFilters.includes(q.status.toLowerCase()))
      );
    })
    .sort((a, b) => {
      if (sortOrder === "latest")
        return new Date(b.created_at) - new Date(a.created_at);
      if (sortOrder === "oldest")
        return new Date(a.created_at) - new Date(b.created_at);
      if (sortOrder === "amount_high")
        return b.amount_with_gst - a.amount_with_gst;
      if (sortOrder === "amount_low")
        return a.amount_with_gst - b.amount_with_gst;
      return 0;
    });

  /* ---------------- UI ---------------- */
  return (
    <div className="card">
      <div className="card-header d-flex justify-content-between">
        <h6>Manage Quotations</h6>
        <Link href="/addquotation" className="btn btn-primary btn-sm">
          + Add Quotation
        </Link>
      </div>

      <div className="card-body table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Created</th>
              <th>ID</th>
              <th>Client</th>
              <th>Quotation No</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredQuotations.length ? (
              filteredQuotations.map((q) => (
                <tr key={q.quotation_id}>
                  <td>{formatDateTime(q.created_at)}</td>
                  <td>{q.quotation_id}</td>
                  <td>{q.client_name || "N/A"}</td>
                  <td>{formatQuotationNo(q.quotation_no)}</td>
                  <td>{q.amount_with_gst}</td>
                  <td>
                    <span className={getBadgeClass(q.status)}>
                      {q.status}
                    </span>
                  </td>
                  <td>
                    <Link href={`/editquotation/${q.quotation_id}`}>
                      ✏️
                    </Link>{" "}
                    <Link href={`/viewquotation/${q.quotation_id}`}>
                      👁️
                    </Link>{" "}
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(q.quotation_id)}
                    >
                      🗑️
                    </span>{" "}
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => handleClone(q.quotation_id)}
                    >
                      📄
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No quotations found
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
