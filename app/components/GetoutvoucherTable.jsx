"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/outvouchers";

const GetOutvoucherTable = () => {
  const [invouchers, setInvouchers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const fetchInvouchers = async () => {
      try {
        const response = await axios.get(API_URL, { withCredentials: true });
        setInvouchers(response.data);
      } catch (error) {
        toast.error("Failed to load vouchers!");
      }
    };

    fetchInvouchers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;

    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true,
      });
      console.log("Delete response:", id);
      if (response.status === 204 || response.status === 200) {
        setInvouchers((prev) => prev.filter((voucher) => voucher.voucher_id !== id));
        toast.success("Voucher deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error(`Failed to delete voucher: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  // Search and filter logic
  const filteredVouchers = invouchers.filter(
    (voucher) =>
      voucher.ordered_by?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.sales_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.voucher_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.vehicle_no?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sorting logic
  const sortedVouchers = [...filteredVouchers].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey] || "";
    const bVal = b[sortKey] || "";
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortOrder === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Out-Vouchers</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search by Client, Project, Voucher No, Vehicle No"
            className="form-control w-25"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="add_product">
            <a className="btn btn-primary m-3" href="/addoutinvoice">
              Add Out-Voucher
            </a>
          </div>
        </div>
        <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th onClick={() => handleSort("voucher_id")} style={{ cursor: "pointer" }}>ID</th>
              <th onClick={() => handleSort("voucher_no")} style={{ cursor: "pointer" }}>Voucher No</th>
              <th onClick={() => handleSort("issue_slip_no")} style={{ cursor: "pointer" }}>Issue Slip No</th>
              <th onClick={() => handleSort("sale_order_no")} style={{ cursor: "pointer" }}>Sale Order No</th>
              <th onClick={() => handleSort("vehicle_no")} style={{ cursor: "pointer" }}>Vehicle No</th>
              <th onClick={() => handleSort("ordered_by")} style={{ cursor: "pointer" }}>Order By</th>
              <th onClick={() => handleSort("sales_person")} style={{ cursor: "pointer" }}>Sale Person</th>
              <th onClick={() => handleSort("number_of_packages")} style={{ cursor: "pointer" }}>No of Packages</th>
              <th onClick={() => handleSort("freight_amount")} style={{ cursor: "pointer" }}>Freight Amount</th>
                <th onClick={() => handleSort("created_by")} style={{ cursor: "pointer" }}>Created By</th> {/* ✅ Added */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedVouchers.length > 0 ? (
              sortedVouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td>{voucher.id}</td>
                  <td>{voucher.voucher_no}</td>
                  <td>{voucher.issue_slip_no}</td>
                  <td>{voucher.sale_order_no}</td>
                  <td>{voucher.vehicle_no}</td>
                  <td>{voucher.ordered_by}</td>
                  <td>{voucher.sales_person}</td>
                  <td>{voucher.number_of_packages}</td>
                  <td>{voucher.freight_amount}</td>
                    <td>{voucher.created_by || "N/A"}</td>

                  <td>
                    <Link href={`/viewotv/${voucher.id}`}>
                      <u className="text-primary me-2" title="View" style={{ cursor: "pointer" }}>
                        <i className="fas fa-eye"></i>
                      </u>
                    </Link>
                    <u
                      className="text-danger"
                      title="Delete"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDelete(voucher.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </u>
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

export default GetOutvoucherTable;
