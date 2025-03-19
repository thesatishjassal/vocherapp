"use client";
import React, { useState, useRef } from "react";
import FindProduct from "../components/FindPropduct";

const InvoucherTable = ({ items = [], onTotalAmountChange }) => {
  const [rows, setRows] = useState([]);
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

  const calculateAmount = (quantity, rate, discount_percentage, additional_discount_percentage) => {
    const baseAmount = quantity * rate;
    const firstDiscount = (baseAmount * (discount_percentage || 0)) / 100;
    const amountAfterFirstDiscount = baseAmount - firstDiscount;
    const additionalDiscount = (amountAfterFirstDiscount * (additional_discount_percentage || 0)) / 100;
    return amountAfterFirstDiscount - additionalDiscount;
  };

  const handleAddRow = () => {
    const { quantity, rate, discount_percentage, additional_discount_percentage } = newRow;

    if (newRow.itemcode && newRow.itemname && quantity && rate) {
      const amount = calculateAmount(quantity, rate, discount_percentage, additional_discount_percentage);

      const updatedRows = [...rows, { id: rows.length + 1, ...newRow, amount }];
      setRows(updatedRows);

      setTotalAmount((prevTotal) => {
        const updatedTotal = prevTotal + amount;
        if (onTotalAmountChange) onTotalAmountChange(updatedTotal, updatedRows);
        return updatedTotal;
      });

      setNewRow({
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

      setTimeout(() => inputRefs.itemcode.current?.focus(), 0);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter" || e.which === 13) { // Works for tablets & desktops
      e.preventDefault();
      if (nextField && inputRefs[nextField]?.current) {
        inputRefs[nextField].current.focus();
      } else {
        handleAddRow(); // Ensure row is added on Enter
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
    if (["itemcode", "itemname"].includes(field) && value.trim()) {
      setShowModal(true);
    }
  };

  const handleProductSelect = (product) => {
    setNewRow((prev) => ({
      ...prev,
      itemcode: product.itemcode,
      itemname: product.itemname,
      unit: product.unit,
      rackcode: product.rackcode,
    }));
    setShowModal(false);
    setTimeout(() => inputRefs.quantity.current?.focus(), 0);
  };

  return (
    <div className="table-responsive">
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
          <tr className="no-print">
            {Object.keys(newRow).map((field, index, fields) => (
              <td key={field}>
                <input
                  type={["quantity", "rate", "discount_percentage", "additional_discount_percentage", "amount"].includes(field) ? "number" : "text"}
                  name={field}
                  value={newRow[field]}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, fields[index + 1])}
                  onKeyUp={(e) => handleKeyDown(e, fields[index + 1])} // Works for tablets
                  placeholder={field.replace(/_/g, " ").toUpperCase()}
                  className="form-control input-small"
                  ref={inputRefs[field]}
                  disabled={["unit", "rackcode", "amount"].includes(field)}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>

      <FindProduct
        showModal={showModal}
        setShowModal={setShowModal}
        productList={{
          PassItemCode: newRow.itemcode,
          PassItemName: newRow.itemname,
        }}
        handleProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default InvoucherTable;
