"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-toastify";

const API_URL = "https://api.panvic.in/quotation/";

const GetQuotationTables = () => {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await axios.get(API_URL, { withCredentials: true });
        setQuotations(response.data);
      } catch (error) {
        toast.error("Failed to load quotations!");
        console.error("Fetch error:", error);
      }
    };

    fetchQuotations();
  }, []);

  const handleDelete = async (quotationId) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    try {
      const response = await axios.delete(`${API_URL}${quotationId}/`, {
        withCredentials: true,
      });

      if (response.status === 204 || response.status === 200) {
        setQuotations((prevQuotations) =>
          prevQuotations.filter((q) => q.quotation_id !== quotationId)
        );
        toast.success("Quotation deleted successfully!");
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
      toast.error(`Failed to delete quotation: ${error.message}`);
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="card">
      <div className="card-header pb-0">
        <h6>Manage Quotations</h6>
      </div>
      <div className="card-body py-0 pt-0 pb-2">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <input
            type="text"
            placeholder="Search by Salesperson or Subject"
            className="form-control w-25"
          />
          <div className="add_product">
            <a className="btn btn-primary m-3" href="/addquotation">
              Add Quotation
            </a>
          </div>
        </div>
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
            {quotations.map((q) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GetQuotationTables;
