import React, { useState, useEffect } from "react";
import Link from "next/link";

const OutvoucherReport = ({ handleExport }) => {
  const [outvouchers, setOutvouchers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionFilter, setTransactionFilter] = useState("");
  const [salesPersonFilter, setSalesPersonFilter] = useState("");
  const [transportFilter, setTransportFilter] = useState("");
  const [receiverFilter, setReceiverFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  // ✅ Fetch Outvouchers API
  const fetchOutvouchers = async () => {
    try {
      const response = await fetch("https://api.panvic.in/outvouchers/"); // Replace with your API endpoint
      if (response.ok) {
        const data = await response.json();
        setOutvouchers(data);
      } else {
        console.error("Failed to fetch outvouchers");
      }
    } catch (error) {
      console.error("Error fetching outvouchers:", error);
    }
  };

  useEffect(() => {
    fetchOutvouchers();
  }, []);

  // ✅ Sorting Logic
  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);
  };

  // ✅ Clear Filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setTransactionFilter("");
    setSalesPersonFilter("");
    setTransportFilter("");
    setReceiverFilter("");
    setFromDate("");
    setToDate("");
  };

  // ✅ Filtered and Sorted Data
  const filteredVouchers = outvouchers
    .filter((voucher) => {
      const searchFilter =
        voucher.voucher_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        voucher.issue_slip_no?.toLowerCase().includes(searchTerm.toLowerCase());

      const transactionTypeFilter = transactionFilter
        ? voucher.transaction_types === transactionFilter
        : true;

      const salesPersonTypeFilter = salesPersonFilter
        ? voucher.sales_person === salesPersonFilter
        : true;

      const transportTypeFilter = transportFilter ? voucher.transport === transportFilter : true;

      const receiverNameFilter = receiverFilter ? voucher.receiver_name === receiverFilter : true;

      const fromDateFilter = fromDate ? new Date(voucher.voucher_date) >= new Date(fromDate) : true;
      const toDateFilter = toDate ? new Date(voucher.voucher_date) <= new Date(toDate) : true;

      return (
        searchFilter &&
        transactionTypeFilter &&
        salesPersonTypeFilter &&
        transportTypeFilter &&
        receiverNameFilter &&
        fromDateFilter &&
        toDateFilter
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

  return (
    <div className="card">
      <div className="card-header pb-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
        <h6>Manage Out-Vouchers</h6>
        <button className="btn btn-success btn-sm" onClick={handleExport}>
          Export Excel
        </button>
      </div>

      {/* ✅ Filters    Section */}
      <div className="card-body py-0 pt-0 pb-2">
        <div className="row g-2 mb-3 align-items-center">
          <div className="col-12 col-md-3">
            <input
              type="text"
              placeholder="Search Voucher / Issue Slip No."
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
              {Array.from(new Set(outvouchers.map((v) => v.transaction_types))).map((type, idx) => (
                <option key={idx} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Sales Person Filter */}
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={salesPersonFilter}
              onChange={(e) => setSalesPersonFilter(e.target.value)}
            >
              <option value="">Filter by Sales Person</option>
              {Array.from(new Set(outvouchers.map((v) => v.sales_person))).map((person, idx) => (
                <option key={idx} value={person}>
                  {person}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Transport Filter */}
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={transportFilter}
              onChange={(e) => setTransportFilter(e.target.value)}
            >
              <option value="">Filter by Transport</option>
              {Array.from(new Set(outvouchers.map((v) => v.transport))).map((transport, idx) => (
                <option key={idx} value={transport}>
                  {transport}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Receiver Name Filter */}
          <div className="col-12 col-md-3">
            <select
              className="form-select"
              value={receiverFilter}
              onChange={(e) => setReceiverFilter(e.target.value)}
            >
              <option value="">Filter by Receiver Name</option>
              {Array.from(new Set(outvouchers.map((v) => v.receiver_name))).map((receiver, idx) => (
                <option key={idx} value={receiver}>
                  {receiver}
                </option>
              ))}
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

        {/* ✅ Table */}
        <div className="table-responsive">
          <table className="table table-hover align-items-center mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Voucher No</th>
                <th>Issue Slip No</th>
                <th>Transaction Type</th>
                <th>Sales Person</th>
                <th>Transport</th>
                <th>Receiver Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.voucher_id}>
                  <td>{voucher.voucher_id}</td>
                  <td>{voucher.voucher_no}</td>
                  <td>{voucher.issue_slip_no}</td>
                  <td>{voucher.transaction_types}</td>
                  <td>{voucher.sales_person}</td>
                  <td>{voucher.transport}</td>
                  <td>{voucher.receiver_name}</td>
                  <td>
                    <Link href={`/viewotv/${voucher.voucher_id}`}>
                      <i className="fas fa-eye text-primary"></i>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OutvoucherReport;
