"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/outvouchers/";

const GetOutvoucherTable = () => {
  const [invouchers, setInvouchers] = useState([]);

  useEffect(() => {
    const fetchInvouchers = async () => {
      try {
        const response = await axios.get(API_URL, {
          withCredentials: true,
        });
        setInvouchers(response.data);
      } catch (error) {
        toast.error("Failed to load vouchers!");
      }
    };

    fetchInvouchers();
  }, []);

  const handleDelete = async (voucherId) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return; // Confirmation prompt

    try {
      const response = await axios.delete(`${API_URL}/${voucherId}`, {
        withCredentials: true, // Maintain session/cookies if applicable
      });

      if (response.status === 204 || response.status === 200) { // Assuming 204 No Content or 200 OK for DELETE success
        setInvouchers((prevInvouchers) =>
          prevInvouchers.filter((voucher) => voucher.voucher_id !== voucherId)
        );
        toast.success("Voucher deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error(`Failed to delete voucher: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Invouchers</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search by Client or Project"
            className="form-control w-25"
          />
          <div className="add_product">
            <a className="btn btn-primary m-3" href="/addoutinvoice">
              Add Out-Vouchers
            </a>
          </div>
        </div>
        <table className="table align-items-center mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Voucher No</th>
              {/* <th>Issue Slip No</th> */}
              <th>Sale Order No</th>
              <th>Customer Name</th>
              {/* <th>Client ID</th> */}
              {/* <th>Invoice Date</th> */}
              <th>Vehicle No</th>
              <th>Sale Person</th>
              <th>Freight Amount</th>
              {/* <th>Total Amount</th> */}
              {/* <th>Remarks</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invouchers.map((voucher) => (
              <tr key={voucher.voucher_id}>
                <td>{voucher.voucher_id}</td>
                <td>{voucher.voucher_number}</td>
                <td>{voucher.voucher_date}</td>
                <td>{voucher.transaction_type}</td>
                {/* <td>{voucher.client_id}</td> */}
                <td>{voucher.invoice_number}</td>
                {/* <td>{voucher.invoice_date}</td> */}
                <td>{voucher.mode_of_transport}</td>
                <td>{voucher.number_of_packages}</td>
                <td>{voucher.freight_status}</td>
                <td>{voucher.total_amount}</td>
                {/* <td>{voucher.remarks}</td> */}
                <td>
                  <Link href={`/viewinv/${voucher.voucher_id}`}>
                    <u className="text-primary me-2" title="View" style={{ cursor: "pointer" }}>
                      <i className="fas fa-eye"></i>
                    </u>
                  </Link>
                  <u
                    className="text-danger"
                    title="Delete"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleDelete(voucher.voucher_id)}
                  >
                    <i className="fas fa-trash"></i>
                  </u>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GetOutvoucherTable;