"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const API_URL = "https://api.panvic.in/invouchers/";

const InvoucherReoprt = () => {
  const [invouchers, setInvouchers] = useState([]);
  const [filteredVouchers, setFilteredVouchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Fetch vouchers
  useEffect(() => {
    const fetchInvouchers = async () => {
      try {
        const response = await axios.get(API_URL, { withCredentials: true });
        setInvouchers(response.data);
        setFilteredVouchers(response.data);
      } catch (error) {
        toast.error("Failed to load vouchers!");
      }
    };
    fetchInvouchers();
  }, []);

 // Filter logic
useEffect(() => {
  let filteredData = invouchers;

  if (searchTerm) {
    filteredData = filteredData.filter(
      (voucher) =>
        voucher.voucher_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (transactionFilter) {
    filteredData = filteredData.filter(
      (voucher) => voucher.transaction_type === transactionFilter
    );
  }

  // ✅ Date filter with exact YYYY-MM-DD comparison
  if (fromDate && toDate) {
    filteredData = filteredData.filter((voucher) => {
      const voucherDate = voucher.voucher_date?.split("T")[0]; // ensure only YYYY-MM-DD
      return voucherDate >= fromDate && voucherDate <= toDate;
    });
  }

  setFilteredVouchers(filteredData);
}, [searchTerm, transactionFilter, fromDate, toDate, invouchers]);


  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTransactionFilter("");
    setFromDate("");
    setToDate("");
  };

  // Delete handler
  const handleDelete = async (voucherId) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;

    try {
      const response = await axios.delete(`${API_URL}/${voucherId}`, {
        withCredentials: true,
      });

      if (response.status === 204 || response.status === 200) {
        setInvouchers((prev) =>
          prev.filter((voucher) => voucher.voucher_id !== voucherId)
        );
        toast.success("Voucher deleted successfully!");
      } else throw new Error("Unexpected response status");
    } catch (error) {
      toast.error(`Failed to delete voucher: ${error.message}`);
    }
  };

  // Export to Excel
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredVouchers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InVouchers");
    XLSX.writeFile(workbook, "InVouchers.xlsx");
  };

  // Sort handler
  const handleSort = (field) => {
    const sortedData = [...filteredVouchers].sort((a, b) => {
      const valueA = a[field] || "";
      const valueB = b[field] || "";

      if (sortOrder === "asc") return valueA > valueB ? 1 : -1;
      else return valueA < valueB ? 1 : -1;
    });
    setFilteredVouchers(sortedData);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="card">
      <div className=" no-print card-header pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6>Manage In-Vouchers</h6>
        <button className="btn btn-success btn-sm" onClick={handleExport}>
          Export Excel
        </button>
      </div>

      {/* Filters Section */}
      <div className="card-body py-0 pt-0 pb-2">
        <div className="row g-2 mb-3 align-items-center no-print">
          <div className="col-12 col-md-3">
            <input
              type="text"
              placeholder="Search Voucher / Invoice No."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={transactionFilter}
              onChange={(e) => setTransactionFilter(e.target.value)}
            >
              <option value="">Filter by Transaction Type</option>
              {Array.from(new Set(invouchers.map((v) => v.transaction_type))).map(
                (type, idx) => (
                  <option key={idx} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-6 col-md-2">
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="form-control"
            />
          </div>
          <div className="col-12 col-md-2 text-end">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleClearFilters}
              title="Clear Filters"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="tm_round_border table align-items-center justify-content-center mb-0">
            <thead>
              <tr>
                <th onClick={() => handleSort("voucher_id")} style={{ cursor: "pointer" }}>
                  ID
                </th>
                <th onClick={() => handleSort("voucher_number")} style={{ cursor: "pointer" }}>
                  Voucher No
                </th>
                <th onClick={() => handleSort("voucher_date")} style={{ cursor: "pointer" }}>
                  Voucher Date
                </th>
                <th>Transaction Type</th>
                <th>Invoice No</th>
                <th>Transport</th>
                <th>Packages</th>
                <th>Freight</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.length > 0 ? (
                filteredVouchers.map((voucher) => (
                  <tr key={voucher.voucher_id}>
                    <td>{voucher.voucher_id}</td>
                    <td>{voucher.voucher_number}</td>
                    <td>{voucher.voucher_date}</td>
                    <td>{voucher.transaction_type}</td>
                    <td>{voucher.invoice_number}</td>
                    <td>{voucher.mode_of_transport}</td>
                    <td>{voucher.number_of_packages}</td>
                    <td>{voucher.freight_status}</td>
                    <td>{voucher.total_amount}</td>
                    <td>
                      <Link href={`/viewinv/${voucher.voucher_id}`}>
                        <u className="text-primary me-2" title="View" style={{ cursor: "pointer" }}>
                          <i className="fas fa-eye"></i>
                        </u>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center">
                    No vouchers found.
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

export default InvoucherReoprt;
