"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

const API_URL = "https://api.panvic.in/quotation/";

const QuotationReportsTable = () => {
  const [quotations, setQuotations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [salespersonFilter, setSalespersonFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
      }
    };

    fetchQuotations();
  }, []);

  // Handle Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(quotations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotations");
    XLSX.writeFile(wb, "Quotations.xlsx");
  };

  // Filter and Sort Logic
  const filteredQuotations = quotations
    .filter((q) => {
      const matchesSearch =
        q.salesperson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSalesperson =
        salespersonFilter === "all" || q.salesperson === salespersonFilter;

      const matchesSubject =
        subjectFilter === "all" || q.subject === subjectFilter;

      const matchesDate =
        (!fromDate || new Date(q.voucher_date) >= new Date(fromDate)) &&
        (!toDate || new Date(q.voucher_date) <= new Date(toDate));

      return (
        matchesSearch && matchesSalesperson && matchesSubject && matchesDate
      );
    })
    .sort((a, b) => {
      if (sortOrder === "latest") return b.quotation_id - a.quotation_id;
      if (sortOrder === "oldest") return a.quotation_id - b.quotation_id;
      return 0;
    });

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Quotations</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        {/* Filter Section */}
        <div className="row g-2 mb-3 align-items-center">
          {/* Search Input */}
          <div className="col-12 col-md-3">
            <input
              type="text"
              placeholder="Search by Salesperson or Subject"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>

          {/* Salesperson Filter */}
          <div className="col-12 col-md-1">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort Order Filter */}
          <div className="col-12 col-md-3">
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
          </div>

          {/* From Date */}
          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control"
              placeholder="From Date"
              // onChange handler can be added if needed
            />
          </div>

          {/* To Date */}
          <div className="col-6 col-md-2">
            <input
              type="date"
              className="form-control"
              placeholder="To Date"
              // onChange handler can be added if needed
            />
          </div>

          {/* Clear Filter Button */}
          <div className="col-12 col-md-1 text-end">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortOrder("latest");
                // reset date fields if needed
              }}
              title="Clear Filters"
            >
              Clear
            </button>
          </div>

          {/* Add Quotation Button */}
     
        </div>

        <div className="table-responsive">
          <table className="table align-items-center mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Quotation No</th>
                <th>Salesperson</th>
                <th>Subject</th>
                <th>Amount (Incl. GST)</th>
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
                    <td>{q.amount_with_gst}</td>
                    <td>{q.status ? "Active" : "Inactive"}</td>
                    <td>
                      <Link href={`/viewquotation/${q.quotation_id}`}>
                        <i className="fas fa-eye text-primary me-2"></i>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
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

export default QuotationReportsTable;
