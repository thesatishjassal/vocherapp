"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/quotation/";

const GetQuotationTables = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get(API_URL, { withCredentials: true });
        const sortedQuotations = response.data.sort(
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

  // Handle Delete
  const handleDelete = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    try {
      const response = await axios.delete(`${API_URL}${quotationId}/`, {
        withCredentials: true,
      });

      if (response.status === 204 || response.status === 200) {
        setQuotations((prev) => prev.filter((q) => q.quotation_id !== quotationId));
        toast.success("Quotation deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error(`Failed to delete quotation: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  // Filter and Sort Logic
  const filteredQuotations = quotations
    .filter((q) => {
      const matchesSearch =
        q.salesperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && q.status) ||
        (statusFilter === "inactive" && !q.status);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.quotation_id - a.quotation_id;
      if (sortOrder === "oldest") return a.quotation_id - b.quotation_id;
      if (sortOrder === "amount_high") return b.amount_with_gst - a.amount_with_gst;
      if (sortOrder === "amount_low") return a.amount_with_gst - b.amount_with_gst;
      return 0;
    });

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Quotations</h6>
      </div>

      <div className="card-body py-0 pt-0 pb-2">
        {/* Filters */}
{/* Filters */}
<div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
  {/* Search Input - Left Aligned */}
  <input
    type="text"
    placeholder="Search by Salesperson or Subject"
    className="form-control w-auto"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />

  {/* Filters & Actions - Right Aligned */}
  <div className="d-flex flex-wrap align-items-center gap-2">
    <select
      className="form-select w-auto"
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>

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
        setStatusFilter("all");
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


        {/* Table */}
        <table className="table align-items-center mb-0">
          <thead>
            <tr>
              <th>ID</th>
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
                  <td>{q.quotation_no}</td>
                  <td>{q.salesperson}</td>
                  <td>{q.subject}</td>
                  <td>{q.amount_including_gst}</td>
                  <td>{q.without_gst}</td>
                  <td>{q.gst_amount}</td>
                  <td>{q.amount_with_gst}</td>
                  <td>{q.status ? "Active" : "Inactive"}</td>
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
                    <u
                      className="text-danger"
                      title="Delete"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(q.quotation_id)}
                    >
                      <i className="fas fa-trash"></i>
                    </u>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="text-center">
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
