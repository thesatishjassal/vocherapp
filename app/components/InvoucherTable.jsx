"use client";
import React, { useState, useRef, useEffect } from "react";
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
    additional_discount_percentage: "", // Added new field
    amount: "",
    comments: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const inputRefs = {
    itemcode: useRef(null),
    itemname: useRef(null),
    quantity: useRef(null),
    unit: useRef(null),
    rackcode: useRef(null),
    rate: useRef(null),
    discount_percentage: useRef(null),
    additional_discount_percentage: useRef(null), // Added new ref
    comments: useRef(null),
  };

  const calculateAmount = (quantity, rate, discount_percentage, additional_discount_percentage) => {
    const baseAmount = quantity * rate;
    // Apply first discount
    const firstDiscount = (baseAmount * (discount_percentage || 0)) / 100;
    const amountAfterFirstDiscount = baseAmount - firstDiscount;
    // Apply additional discount on the result
    const additionalDiscount = (amountAfterFirstDiscount * (additional_discount_percentage || 0)) / 100;
    return amountAfterFirstDiscount - additionalDiscount;
  };

  const handleAddRow = () => {
    const { quantity, rate, discount_percentage, additional_discount_percentage } = newRow;

    if (newRow.itemcode && newRow.itemname && quantity && rate) {
      const amount = calculateAmount(quantity, rate, discount_percentage, additional_discount_percentage);

      const updatedRows = [
        ...rows,
        {
          id: rows.length + 1,
          ...newRow,
          amount,
        },
      ];

      setRows(updatedRows);

      setTotalAmount((prevTotal) => {
        const updatedTotal = prevTotal + amount;
        if (onTotalAmountChange) {
          onTotalAmountChange(updatedTotal, updatedRows);
        }
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
        additional_discount_percentage: "", // Reset new field
        amount: "",
        comments: "",
      });
      inputRefs.itemcode.current.focus();
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField && inputRefs[nextField]?.current) {
        inputRefs[nextField].current.focus();
      } else {
        handleAddRow();
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
    setTimeout(() => {
      inputRefs.quantity.current?.focus();
    }, 0);
  };

  return (
    <div>
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
            <th>Add. Disc %</th> {/* Added new header */}
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
              <td>{row.additional_discount_percentage}</td> {/* Added new column */}
              <td>{row.amount.toFixed(2)}</td>
              <td>{row.comments}</td>
            </tr>
          ))}
          <tr className="no-print">
            <td>#</td>
            <td>
              <input
                type="text"
                name="itemcode"
                value={newRow.itemcode}
                onChange={(e) => handleFieldChange("itemcode", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "itemname")}
                placeholder="Product ID"
                className="form-control input-small"
                ref={inputRefs.itemcode}
              />
            </td>
            <td>
              <input
                type="text"
                name="itemname"
                value={newRow.itemname}
                onChange={(e) => handleFieldChange("itemname", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "quantity")}
                placeholder="Item Name"
                className="form-control"
                ref={inputRefs.itemname}
              />
            </td>
            <td>
              <input
                type="text"
                name="unit"
                value={newRow.unit}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="Unit"
                className="form-control input-small"
                ref={inputRefs.unit}
                disabled
              />
            </td>
            <td>
              <input
                type="text"
                name="rackcode"
                value={newRow.rackcode}
                onChange={(e) => handleFieldChange("rackcode", e.target.value)}
                placeholder="Rack Code"
                className="form-control input-small"
                ref={inputRefs.rackcode}
                disabled
              />
            </td>
            <td>
              <input
                type="number"
                name="quantity"
                value={newRow.quantity}
                onChange={(e) => handleFieldChange("quantity", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "rate")}
                placeholder="Qty"
                className="form-control input-small"
                ref={inputRefs.quantity}
              />
            </td>
            <td>
              <input
                type="number"
                name="rate"
                value={newRow.rate}
                onChange={(e) => handleFieldChange("rate", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "discount_percentage")}
                placeholder="Rate"
                className="form-control input-small"
                ref={inputRefs.rate}
              />
            </td>
            <td>
              <input
                type="number"
                name="discount_percentage"
                value={newRow.discount_percentage}
                onChange={(e) => handleFieldChange("discount_percentage", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "additional_discount_percentage")}
                placeholder="Disc %"
                className="form-control input-small"
                ref={inputRefs.discount_percentage}
              />
            </td>
            <td>
              <input
                type="number"
                name="additional_discount_percentage"
                value={newRow.additional_discount_percentage}
                onChange={(e) => handleFieldChange("additional_discount_percentage", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "comments")}
                placeholder="Add. Disc %"
                className="form-control input-small"
                ref={inputRefs.additional_discount_percentage}
              />
            </td>
            <td>
              <input
                type="number"
                name="amount"
                value={newRow.amount}
                disabled
                placeholder="Amount"
                className="form-control input-small"
              />
            </td>
            <td>
              <input
                type="text"
                name="comments"
                value={newRow.comments}
                onChange={(e) => handleFieldChange("comments", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder="Comments"
                className="form-control input-small"
                ref={inputRefs.comments}
              />
            </td>
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