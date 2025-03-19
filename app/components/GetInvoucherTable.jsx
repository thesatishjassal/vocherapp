"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/invouchers/";

const GetInvoucherTable = () => {
  const [invouchers, setInvouchers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchInvouchers = async () => {
      try {
        const response = await axios.get(API_URL, { withCredentials: true });
        setInvouchers(response.data.reverse());
      } catch (error) {
        toast.error("Failed to load vouchers!");
      }
    };
    fetchInvouchers();
  }, []);

  const handleDelete = async (voucherId) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    try {
      const response = await axios.delete(`${API_URL}/${voucherId}`, { withCredentials: true });
      if (response.status === 200 || response.status === 204) {
        setInvouchers((prev) => prev.filter((voucher) => voucher.voucher_id !== voucherId));
        toast.success("Voucher deleted successfully!");
      }
    } catch (error) {
      toast.error(`Failed to delete voucher: ${error.message}`);
    }
  };

  const filteredInvouchers = invouchers.filter((voucher) =>
    voucher.voucher_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search by Voucher Number"
          className="border p-2 rounded w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Link href="/addinvoice" className="bg-blue-500 text-white px-4 py-2 rounded mt-2 md:mt-0">
          Add In-Vouchers
        </Link>
      </div>
      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr >
              <th className="p-2">ID</th>
              <th className="p-2">Voucher Number</th>
              <th className="p-2">Voucher Date</th>
              <th className="p-2">Transaction Type</th>
              <th className="p-2">Invoice Number</th>
              <th className="p-2">Transport Mode</th>
              <th className="p-2">Packages</th>
              <th className="p-2">Freight Status</th>
              <th className="p-2">Total Amount</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvouchers.map((voucher) => (
              <tr key={voucher.voucher_id} >
                <td className="p-2 text-center">{voucher.voucher_id}</td>
                <td className="p-2 text-center">{voucher.voucher_number}</td>
                <td className="p-2 text-center">{voucher.voucher_date}</td>
                <td className="p-2 text-center">{voucher.transaction_type}</td>
                <td className="p-2 text-center">{voucher.invoice_number}</td>
                <td className="p-2 text-center">{voucher.mode_of_transport}</td>
                <td className="p-2 text-center">{voucher.number_of_packages}</td>
                <td className="p-2 text-center">{voucher.freight_status}</td>
                <td className="p-2 text-center">{voucher.total_amount}</td>
                <td className="p-2 text-center flex gap-4 justify-center">
                  <Link href={`/viewinv/${voucher.voucher_id}`}>
                    <i className="fas fa-eye text-blue-500 cursor-pointer"></i>
                  </Link>
                  &nbsp; &nbsp;
                  <i
                    className="fas fa-trash text-red-500 cursor-pointer"
                    onClick={() => handleDelete(voucher.voucher_id)}
                  ></i>
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