"use client";
import React, { useState, useRef } from "react";
import FindProduct from "../components/FindProduct";

const InvoucherTable = ({ items = [], onTotalAmountChange }) => {
  const emptyRow = {
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
  };

  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState(emptyRow);
  const [editingRow, setEditingRow] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const calcAmount = (q, r, d, ad) => {
    const base = q * r;
    const first = base * (d || 0) / 100;
    const afterFirst = base - first;
    const second = afterFirst * (ad || 0) / 100;
    return afterFirst - second;
  };

  const updateTotal = (updated) => {
    const total = updated.reduce((a, r) => a + Number(r.amount || 0), 0);
    setTotalAmount(total);
    onTotalAmountChange?.(total, updated);
  };

  const handleAddRow = () => {
    const { quantity, rate, discount_percentage, additional_discount_percentage } = newRow;
    if (newRow.itemcode && newRow.itemname && quantity && rate) {
      const amount = calcAmount(quantity, rate, discount_percentage, additional_discount_percentage);
      const updated = [...rows, { id: Date.now(), ...newRow, amount }];
      setRows(updated);
      updateTotal(updated);
      setNewRow(emptyRow);
      setShowAddModal(false);
    } else alert("Please fill in all required fields.");
  };

  const handleDeleteRow = (id) => {
    const filtered = rows.filter((r) => r.id !== id);
    setRows(filtered);
    updateTotal(filtered);
  };

  const handleEditClick = (row) => {
    setEditingRow({ ...row });
    setShowEditModal(true);
  };

  const handleEditSave = () => {
    const updated = rows.map((r) =>
      r.id === editingRow.id
        ? {
            ...editingRow,
            amount: calcAmount(
              editingRow.quantity,
              editingRow.rate,
              editingRow.discount_percentage,
              editingRow.additional_discount_percentage
            ),
          }
        : r
    );
    setRows(updated);
    updateTotal(updated);
    setShowEditModal(false);
    setEditingRow(null);
  };

  const handleFieldChange = (f, v) => {
    setNewRow((p) => ({ ...p, [f]: v }));
    if (["itemcode", "itemname"].includes(f) && v.trim()) setShowModal(true);
  };

  const handleProductSelect = (p) => {
    setNewRow((pr) => ({
      ...pr,
      itemcode: p.itemcode,
      itemname: p.itemname,
      unit: p.unit,
      rackcode: p.rackcode,
    }));
    setShowModal(false);
    setTimeout(() => inputRefs.quantity.current?.focus(), 0);
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
              {/* Action column moved **after Comments** */}
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.id}>
                <td>{idx + 1}</td>
                <td>{row.itemcode}</td>
                <td>{row.itemname}</td>
                <td>{row.unit}</td>
                <td>{row.rackcode}</td>
                <td>{row.quantity}</td>
                <td>{row.rate}</td>
                <td>{row.discount_percentage}</td>
                <td>{row.additional_discount_percentage}</td>
                <td>{Number(row.amount).toFixed(2)}</td>
                <td>{row.comments}</td>
                {/* Buttons right after Comments */}
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => handleEditClick(row)}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => handleDeleteRow(row.id)}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <ModalWrapper title="Add New Item" onClose={() => setShowAddModal(false)}>
          <RowForm
            rowData={newRow}
            setRowData={setNewRow}
            onSave={handleAddRow}
          />
        </ModalWrapper>
      )}

      {showEditModal && editingRow && (
        <ModalWrapper title="Edit Item" onClose={() => setShowEditModal(false)}>
          <RowForm
            rowData={editingRow}
            setRowData={setEditingRow}
            onSave={handleEditSave}
            isEdit
          />
        </ModalWrapper>
      )}

      <div className="mt-3 no-print">
        <button className="btn btn-primary w-100" onClick={() => setShowAddModal(true)}>
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

// ---- Subcomponents ----
const ModalWrapper = ({ title, children, onClose }) => (
  <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content rounded-4">
        <div className="modal-header border-0 p-4">
          <h1 className="modal-title fs-5">{title}</h1>
          <button type="button" className="btn-close" onClick={onClose}></button>
        </div>
        <div className="modal-body p-4">{children}</div>
      </div>
    </div>
  </div>
);

const RowForm = ({ rowData, setRowData, onSave, isEdit }) => {
  const handleChange = (field, value) =>
    setRowData((prev) => ({ ...prev, [field]: value }));
  const fields = [
    "itemcode","itemname","unit","rackcode",
    "quantity","rate","discount_percentage",
    "additional_discount_percentage","comments"
  ];
  return (
    <>
      <div className="row g-3">
        {fields.map((f) => (
          <div className="col-6" key={f}>
            <input
              type={["quantity","rate","discount_percentage","additional_discount_percentage"].includes(f) ? "number" : "text"}
              name={f}
              value={rowData[f]}
              onChange={(e) => handleChange(f, e.target.value)}
              className="form-control"
              placeholder={f.replace(/_/g," ").toUpperCase()}
              // disabled={["unit","rackcode"].includes(f)}
            />
          </div>
        ))}
      </div>
      <div className="modal-footer border-0 p-4">
        <button type="button" className="btn btn-secondary" onClick={onSave}>
          {isEdit ? "Save Changes" : "Add Item"}
        </button>
      </div>
    </>
  );
};

export default InvoucherTable;
