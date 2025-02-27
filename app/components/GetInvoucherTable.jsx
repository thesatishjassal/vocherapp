"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/invouchers";

const GetInvoucherTable = () => {
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

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Invouchers</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <table className="table align-items-center mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Voucher Number</th>
              <th>Transaction Type</th>
              <th>Voucher Date</th>
              <th>Client ID</th>
              <th>Invoice Number</th>
              <th>Invoice Date</th>
              <th>Transport Mode</th>
              <th>Packages</th>
              <th>Freight Status</th>
              <th>Total Amount</th>
              <th>Remarks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invouchers.map((voucher) => (
              <tr key={voucher.voucher_id}>
                <td>{voucher.voucher_id}</td>
                <td>{voucher.voucher_number}</td>
                <td>{voucher.transaction_type}</td>
                <td>{voucher.voucher_date}</td>
                <td>{voucher.client_id}</td>
                <td>{voucher.invoice_number}</td>
                <td>{voucher.invoice_date}</td>
                <td>{voucher.mode_of_transport}</td>
                <td>{voucher.number_of_packages}</td>
                <td>{voucher.freight_status}</td>
                <td>{voucher.total_amount}</td>
                <td>{voucher.remarks}</td>
                <td>
                  <u className="text-primary" title="View" style={{ cursor: "pointer" }}>
                    <i className="fas fa-eye"></i>
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

export default GetInvoucherTable;