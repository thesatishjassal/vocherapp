"use client";
import React, { useState, useRef, useEffect } from "react";
import FindProduct from "../components/FindPropduct";
import CustomLoader from "../components/CustomLoader"; // Import the loader

const InvoucherTable = ({ items = [], onTotalAmountChange }) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true); // Loader state
  const [newRow, setNewRow] = useState({
    itemcode: "",
    itemname: "",
    quantity: "",
    unit: "",
    rackcode: "",
    rate: "",
    discount_percentage: "",
    additional_discount_percentage: "",
    amount: "",
    comments: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const inputRefs = {
    itemcode: useRef(null),
    itemname: useRef(null),
    quantity: useRef(null),
    unit: useRef(null),
    rackcode: useRef(null),
    rate: useRef(null),
    discount_percentage: useRef(null),
    additional_discount_percentage: useRef(null),
    comments: useRef(null),
  };

  useEffect(() => {
    // Simulating data fetch delay
    setTimeout(() => {
      setRows(items); // Load data
      setLoading(false); // Stop loader
    }, 1500); // Adjust delay as needed
  }, [items]);

  return (
    <div className="table-responsive">
      {loading ? (
        <CustomLoader />
      ) : (
        <table className="table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>SR NO</th>
              <th>Product ID</th>
              <th>Item Name</th>
              <th>Unit</th>
              <th>Rack Code</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th>Disc %</th>
              <th>Add. Disc %</th>
              <th>Amount</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.itemcode}</td>
                <td>{row.itemname}</td>
                <td>{row.unit}</td>
                <td>{row.rackcode}</td>
                <td>{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.discount_percentage}</td>
                <td>{row.additional_discount_percentage}</td>
                <td>{row.amount.toFixed(2)}</td>
                <td>{row.comments}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default InvoucherTable;
