"use client";
import React, { useState, useRef, useEffect } from "react";
import FindProduct from "../components/FindProduct";

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
  const [showAddModal, setShowAddModal] = useState(false); // New state for add row modal
  const [productList, setProductList] = useState([]);
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
        additional_discount_percentage: "",
        amount: "",
        comments: "",
      });
      setShowAddModal(false); // Close the modal after adding
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
          </tbody>
        </table>
      </div>

      {/* Button to open the Add Row Modal */}


      {/* Add Row Modal */}
      {showAddModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            transition: "opacity 0.3s",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 p-4">
                <h1 className="modal-title fs-5">Add New Item</h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-6">
                    <input
                      type="text"
                      name="itemcode"
                      value={newRow.itemcode}
                      onChange={(e) => handleFieldChange("itemcode", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "itemname")}
                      placeholder="Product ID"
                      className="form-control"
                      ref={inputRefs.itemcode}
                    />
                  </div>
                  <div className="col-6">
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
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="unit"
                      value={newRow.unit}
                      onChange={(e) => handleFieldChange("unit", e.target.value)}
                      placeholder="Unit"
                      className="form-control"
                      ref={inputRefs.unit}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="rackcode"
                      value={newRow.rackcode}
                      onChange={(e) => handleFieldChange("rackcode", e.target.value)}
                      placeholder="Rack Code"
                      className="form-control"
                      ref={inputRefs.rackcode}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="quantity"
                      value={newRow.quantity}
                      onChange={(e) => handleFieldChange("quantity", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "rate")}
                      placeholder="Quantity"
                      className="form-control"
                      ref={inputRefs.quantity}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="rate"
                      value={newRow.rate}
                      onChange={(e) => handleFieldChange("rate", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "discount_percentage")}
                      placeholder="Rate"
                      className="form-control"
                      ref={inputRefs.rate}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="discount_percentage"
                      value={newRow.discount_percentage}
                      onChange={(e) => handleFieldChange("discount_percentage", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "additional_discount_percentage")}
                      placeholder="Discount %"
                      className="form-control"
                      ref={inputRefs.discount_percentage}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="additional_discount_percentage"
                      value={newRow.additional_discount_percentage}
                      onChange={(e) => handleFieldChange("additional_discount_percentage", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "comments")}
                      placeholder="Additional Disc %"
                      className="form-control"
                      ref={inputRefs.additional_discount_percentage}
                    />
                  </div>
                  <div className="col-12">
                    <input
                      type="text"
                      name="comments"
                      value={newRow.comments}
                      onChange={(e) => handleFieldChange("comments", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, null)}
                      placeholder="Comments"
                      className="form-control"
                      ref={inputRefs.comments}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleAddRow}
                  aria-label="Add Item"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mt-3 no-print">
        <button
          className="btn btn-primary w-100"
          onClick={() => setShowAddModal(true)}
          aria-label="Add New Row"
        >
          Add New Row
        </button>
      </div>
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