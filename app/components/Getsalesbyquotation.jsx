"use client";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AddProductModal from "./AddProductModal";

const SALESORDER_API_URL = "https://api.panvic.in/salesorder/";
const CLIENTS_API_URL = "https://api.panvic.in/clients/";
const QUOTATION_API_URL = "https://api.panvic.in/quotation/";

const GetSalesOrdersByQuotation = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState("");
  const [quotationItems, setQuotationItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [optionType, setOptionType] = useState("quotation"); // 'quotation' | 'custom'

  // For modal add item
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
    mrp: useRef(null),
    discount: useRef(null),
    netPrice: useRef(null),
    amount: useRef(null),
    image: useRef(null),
    remarks: useRef(null),
  };

  // Fetch quotations for dropdown
  useEffect(() => {
    axios
      .get(QUOTATION_API_URL)
      .then((res) => setQuotations(res.data))
      .catch(() => toast.error("Failed to load quotations"));
  }, []);

  // Fetch quotation items
  useEffect(() => {
    if (!selectedQuotation) return;
    setLoadingItems(true);
    axios
      .get(`${QUOTATION_API_URL}${selectedQuotation}/items/`)
      .then((res) => setQuotationItems(res.data))
      .catch(() => toast.error("Failed to load quotation items"))
      .finally(() => setLoadingItems(false));
  }, [selectedQuotation]);

  // Handle Add Row
  const handleAddRow = (newItem) => {
    if (editRowIndex !== null) {
      const updatedRows = [...rows];
      updatedRows[editRowIndex] = newItem;
      setRows(updatedRows);
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, newItem]);
    }
  };

  // Handle field change
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
    <div className="card p-3">
      <h5 className="fw-bold mb-3">Create Sales Order</h5>

      {/* Option Switcher */}
      <div className="mb-4 d-flex gap-3">
        <button
          className={`btn ${optionType === "quotation" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setOptionType("quotation")}
        >
          From Quotation
        </button>
        <button
          className={`btn ${optionType === "custom" ? "btn-primary" : "btn-outline-primary"}`}
          onClick={() => setOptionType("custom")}
        >
          Custom Form
        </button>
      </div>

      {/* OPTION 1: From Quotation */}
      {optionType === "quotation" && (
        <>
          <div className="mb-4">
            <label className="form-label">Select Quotation:</label>
            <select
              className="form-select"
              value={selectedQuotation}
              onChange={(e) => setSelectedQuotation(e.target.value)}
            >
              <option value="">-- Choose Quotation --</option>
              {quotations.map((q) => (
                <option key={q.quotation_id} value={q.quotation_id}>
                  Quotation #{q.quotation_id}
                </option>
              ))}
            </select>
          </div>

          {selectedQuotation && (
            <div className="table-responsive mb-4">
              <h6 className="fw-semibold">Quotation Items</h6>
              {loadingItems ? (
                <p>Loading...</p>
              ) : (
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Item Code</th>
                      <th>Item Name</th>
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
                        <td>{item.unit}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price}</td>
                        <td>{item.quantity * item.price}</td>
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
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="fw-semibold mb-0">Custom Sales Order Items</h6>
            <button
              className="btn btn-success btn-sm"
              onClick={() => setShowAddModal(true)}
            >
              + Add Item
            </button>
          </div>

          {rows.length > 0 ? (
            <table className="table table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Net Price</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.itemCode}</td>
                    <td>{row.itemName}</td>
                    <td>{row.qty}</td>
                    <td>{row.unit}</td>
                    <td>{row.netPrice}</td>
                    <td>{row.amount}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => {
                          setNewRow(row);
                          setEditRowIndex(i);
                          setShowAddModal(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setRows(rows.filter((_, idx) => idx !== i));
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted">No items added yet.</p>
          )}

          {/* Add Item Modal */}
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
