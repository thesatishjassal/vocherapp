"use client";
import React, { useRef, useEffect, useState } from "react";
import FindProduct from "./FindProduct"; // Import FindProduct component

const OutvocuherTable = ({ items = [], onRowsUpdate }) => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    itemcode: "",
    itemname: "",
    qty: "",
    unit: "",
    rackcode: "",
    comments: "",
  });

  // NEW state for editing & deleting
  const [editRow, setEditRow] = useState(null);
  const [deleteRowId, setDeleteRowId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false); // New state for add row modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [productList, setProductList] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const inputRefs = {
    itemcode: useRef(null),
    itemname: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    rackcode: useRef(null),
    comments: useRef(null),
  };

  useEffect(() => {
    // Detect screen size
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddRow = () => {
    if (newRow.itemcode && newRow.itemname && newRow.qty && newRow.unit) {
      const updatedRows = [
        ...rows,
        {
          id: rows.length + 1,
          ...newRow,
        },
      ];
      setRows(updatedRows);
      onRowsUpdate(updatedRows);
      setNewRow({
        itemcode: "",
        itemname: "",
        qty: "",
        unit: "",
        rackcode: "",
        comments: "",
      });
      setShowAddModal(false);
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // --- NEW: Update and Delete handlers ---
  const handleUpdateRow = () => {
    const updatedRows = rows.map((r) =>
      r.id === editRow.id ? editRow : r
    );
    setRows(updatedRows);
    onRowsUpdate(updatedRows);
    setShowEditModal(false);
    setEditRow(null);
  };

  const handleDeleteRow = () => {
    const updatedRows = rows.filter((r) => r.id !== deleteRowId);
    setRows(updatedRows);
    onRowsUpdate(updatedRows);
    setShowDeleteModal(false);
    setDeleteRowId(null);
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
      filterProducts(value, field);
    }
  };

  const filterProducts = (query, field) => {
    const filtered = items.filter((item) => {
      if (field === "itemcode") {
        return item.code.toLowerCase().includes(query.toLowerCase());
      } else if (field === "itemname") {
        return item.name.toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });
    setProductList(filtered);
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
      inputRefs.qty.current?.focus();
    }, 0);
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>SR NO</th>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Unit</th>
              <th>Rackcode</th>
              <th>Qty</th>
              <th>Comments</th>
              {/* NEW: Action Column */}
              <th>Action</th>
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
                <td>{row.qty}</td>
                <td>{row.comments}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => {
                      setEditRow({ ...row });
                      setShowEditModal(true);
                    }}
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => {
                      setDeleteRowId(row.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Button to open the Add Row Modal */}
      <div className="mt-3">
        <button
          className={`btn btn-primary w-100 ${isMobile ? "mb-3" : ""}`}
          onClick={() => setShowAddModal(true)}
          aria-label="Add New Row"
        >
          Add New Row
        </button>
      </div>

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
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
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
                      placeholder="Enter item code"
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
                      onKeyDown={(e) => handleKeyDown(e, "qty")}
                      placeholder="Enter item name"
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
                      placeholder="Enter unit"
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
                      placeholder="Rackcode"
                      className="form-control"
                      ref={inputRefs.rackcode}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="qty"
                      value={newRow.qty}
                      onChange={(e) => handleFieldChange("qty", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "comments")}
                      placeholder="Qty"
                      className="form-control"
                      ref={inputRefs.qty}
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

      {/* Edit Modal */}
      {showEditModal && editRow && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 p-4">
                <h1 className="modal-title fs-5">Edit Item</h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                  aria-label="Close"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  {["itemcode","itemname","unit","rackcode","qty","comments"].map((f)=>(
                    <div className="col-6" key={f}>
                      <input
                        type={f==="qty"?"number":"text"}
                        name={f}
                        value={editRow[f]}
                        onChange={(e)=>setEditRow({...editRow,[f]:e.target.value})}
                        className="form-control"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleUpdateRow}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          style={{
            display: "block",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4">
              <div className="modal-header border-0 p-4">
                <h1 className="modal-title fs-5">Confirm Delete</h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
              <div className="modal-body p-4">
                Are you sure you want to delete this item?
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteRow}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FindProduct Modal */}
      <FindProduct
        showModal={showModal}
        setShowModal={setShowModal}
        productList={productList}
        handleProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default OutvocuherTable;
