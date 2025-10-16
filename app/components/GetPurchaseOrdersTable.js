"use client";
import { useState, useRef } from "react";
import AddProductModal from "./SalesAddProductModal";

const NewPurchaseOrderItems = ({ onRowsChange }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRow, setNewRow] = useState({});
  const [rows, setRows] = useState([]);
  const [editRowIndex, setEditRowIndex] = useState(null);

  const inputRefs = {
    customerCode: useRef(null),
    customerDescription: useRef(null),
    itemCode: useRef(null),
    itemName: useRef(null),
    qty: useRef(null),
    brand: useRef(null),
    unit: useRef(null),
    cct: useRef(null),
    mrp: useRef(null),
    discount: useRef(null),
    netPrice: useRef(null),
    amount: useRef(null),
    image: useRef(null),
    remarks: useRef(null),
  };

  const handleAddRow = (newItem) => {
    if (editRowIndex !== null) {
      const updatedRows = [...rows];
      updatedRows[editRowIndex] = newItem;
      setRows(updatedRows);
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, newItem]);
    }
    onRowsChange(rows);
  };

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter" && nextField && inputRefs[nextField]?.current) {
      e.preventDefault();
      inputRefs[nextField].current.focus();
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="fw-semibold text-secondary mb-0">
          <i className="bi bi-list-check me-2 text-success"></i> Add Purchase Order Items
        </h6>
        <button
          className="btn btn-success btn-sm shadow-sm"
          onClick={() => setShowAddModal(true)}
        >
          <i className="bi bi-plus-lg me-1"></i> Add Item
        </button>
      </div>

      {rows.length > 0 ? (
        <table className="table table-hover align-middle shadow-sm mb-0">
          <thead className="table-light">
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Color</th>
              <th>Unit</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                <td>{row.itemCode}</td>
                <td>{row.itemName}</td>
                <td>{row.color}</td>
                <td>{row.unit}</td>
                <td>{row.qty}</td>
                <td>{row.netPrice}</td>
                <td>{row.amount}</td>
                <td className="d-flex gap-2">
                  <button
                    className="btn"
                    onClick={() => {
                      setNewRow(row);
                      setEditRowIndex(i);
                      setShowAddModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn"
                    onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-muted fst-italic">No items added yet.</p>
      )}

      <AddProductModal
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        newRow={newRow}
        setNewRow={setNewRow}
        handleFieldChange={handleFieldChange}
        handleKeyDown={handleKeyDown}
        inputRefs={inputRefs}
        editRowIndex={editRowIndex}
        handleAddRow={handleAddRow}
      />
    </div>
  );
};

export default NewPurchaseOrderItems;
