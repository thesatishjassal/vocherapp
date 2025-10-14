"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddProductModal from "./SalesAddProductModal";

const QUOTATION_API_URL = "https://api.panvic.in/quotation/";

const GetSalesOrdersByQuotation = ({ onRowsChange }) => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState("");
  const [quotationItems, setQuotationItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [optionType, setOptionType] = useState("quotation");
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    axios
      .get(QUOTATION_API_URL)
      .then((res) => setQuotations(res.data))
      .catch(() => toast.error("Failed to load quotations"));
  }, []);

  useEffect(() => {
    if (!selectedQuotation) return;
    setLoadingItems(true);
    axios
      .get(`${QUOTATION_API_URL}${selectedQuotation}/items/`)
      .then((res) => setQuotationItems(res.data))
      .catch(() => toast.error("Failed to load quotation items"))
      .finally(() => setLoadingItems(false));
  }, [selectedQuotation]);

  useEffect(() => {
    if (optionType === "quotation") {
      const mappedRows = quotationItems.map((item) => ({
        itemCode: item.itemcode,
        itemName: item.item_name,
        qty: item.quantity,
        cct: item.cct,
        unit: item.unit,
        netPrice: item.netPrice,
        cct: item.color,
        amount: item.quantity * item.netPrice,
        customerCode: "N/A",
        customerDescription: "N/A",
        brand: "N/A",
        mrp: 0,
        discount: 0,
        image: "https://example.com/default-image.jpg",
        remarks: "",
      }));
      onRowsChange(mappedRows);
    }
  }, [quotationItems, optionType, onRowsChange]);

  useEffect(() => {
    if (optionType === "custom") {
      onRowsChange(rows);
    }
  }, [rows, optionType, onRowsChange]);

  const handleAddRow = (newItem) => {
    if (editRowIndex !== null) {
      const updatedRows = [...rows];
      updatedRows[editRowIndex] = newItem;
      setRows(updatedRows);
      console.log(updatedRows);
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, newItem]);
    }
  };

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
    console.log(newRow);
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter" && nextField && inputRefs[nextField]?.current) {
      e.preventDefault();
      inputRefs[nextField].current.focus();
    }
  };

  return (
    <div>
      {/* Radio Button Switcher */}
      <div className="mb-4 no-print">
        <label className="form-label fw-semibold text-secondary">
          Choose Sales Order Type:
        </label>
        <div className="d-flex align-items-center gap-4 mt-2">
          <div className="form-check d-flex align-items-center">
            <input
              className="form-check-input me-2"
              type="radio"
              id="radioQuotation"
              name="optionType"
              value="quotation"
              checked={optionType === "quotation"}
              onChange={() => setOptionType("quotation")}
            />
            <label className="form-check-label" htmlFor="radioQuotation">
              <i className="bi bi-receipt me-1 text-primary"></i> From Quotation
            </label>
          </div>

          <div className="form-check d-flex align-items-center">
            <input
              className="form-check-input me-2"
              type="radio"
              id="radioCustom"
              name="optionType"
              value="custom"
              checked={optionType === "custom"}
              onChange={() => setOptionType("custom")}
            />
            <label className="form-check-label" htmlFor="radioCustom">
              <i className="bi bi-pencil-square me-1 text-success"></i> Custom
              Form
            </label>
          </div>
        </div>
      </div>

      {/* OPTION 1: From Quotation */}
      {optionType === "quotation" && (
        <>
          {/* Improved “Select Quotation” Section */}
          <div className="mb-4 no-print">
            <label className="form-label fw-semibold text-secondary d-block mb-2">
              <i className="bi bi-receipt-cutoff me-2 text-primary"></i>
              Select Quotation
            </label>

            <div
              className="d-grid align-items-center gap-2 p-3 rounded-3 "
              style={{
                gridTemplateColumns: "1fr auto",
                // background: "#f8fafc",
                border: "1px solid #e9e9e9ff",
              }}
            >
              {/* Search Input */}
              <div className="position-relative">
                <i
                  className="bi bi-search position-absolute"
                  style={{
                    top: "50%",
                    left: "10px",
                    transform: "translateY(-50%)",
                    color: "#6b7280",
                  }}
                ></i>
                <input
                  type="text"
                  placeholder="Search by quotation no..."
                  className="form-control ps-4 py-2"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    borderRadius: "8px",
                    borderColor: "#d1d5db",
                    fontSize: "14px",
                  }}
                />
              </div>

              {/* Dropdown */}
              <select
                className="form-select py-2"
                value={selectedQuotation}
                onChange={(e) => setSelectedQuotation(e.target.value)}
                style={{
                  borderRadius: "8px",
                  // borderColor: "#d1d5db",
                  fontSize: "14px",
                }}
              >
                <option value="">-- Choose Quotation --</option>
                {quotations
                  .filter((q) =>
                    q.quotation_id
                      ?.toString()
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                  )
                  .map((q) => (
                    <option key={q.quotation_id} value={q.quotation_id}>
                      Quotation #{q.quotation_id}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {selectedQuotation && (
            <div className="table-responsive mb-4">
              <h6 className="fw-semibold text-secondary mb-3">
                <i className="bi bi-box-seam me-2 text-primary"></i>
                Quotation Items
              </h6>
              {loadingItems ? (
                <div className="text-center py-3">
                  <div
                    className="spinner-border text-primary"
                    role="status"
                  ></div>
                </div>
              ) : (
                <table className="table table-bordered table-striped align-middle shadow-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Color</th>
                      <th>Unit</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.itemcode}</td>
                        <td>{item.item_name}</td>
                        <td>{item.cct}</td>
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>{item.netPrice !== 0 ? item.netPrice : item.price}</td>
                        <td>{item.quantity * item.netPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* OPTION 2: Custom Form */}
      {optionType === "custom" && (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3 no-print">
            <h6 className="fw-semibold text-secondary mb-0">
              <i className="bi bi-list-check me-2 text-success"></i> Custom
              Sales Order Items
            </h6>
            <button
              className="btn btn-success btn-sm shadow-sm"
              onClick={() => setShowAddModal(true)}
            >
              <i className="bi bi-plus-lg me-1"></i> Add Item
            </button>
          </div>

          {rows.length > 0 ? (
            <table className="table Quotation Info Details table-hover align-middle shadow-sm mb-0">
              <thead className="table-light">
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Color</th>
                  <th>Unit</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Amount</th>
                  <th className="no-print">Actions</th>
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
                    <td className="d-flex gap-2 no-print">
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
                        onClick={() => {
                          setRows(rows.filter((_, idx) => idx !== i));
                        }}
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
      )}
    </div>
  );
};

export default GetSalesOrdersByQuotation;