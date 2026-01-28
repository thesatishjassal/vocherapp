"use client";
import React, { useState, useEffect } from "react";
import NewPurchaseOrderItems from "./GetPurchaseOrdersTable";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PurchaseOrderSourceSelector = ({ onRowsChange, onFinalSubmit }) => {
  const [source, setSource] = useState("sales");
  const [salesOrders, setSalesOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customRows, setCustomRows] = useState([]);

  // 🔹 Fetch all Sales Orders and Quotations
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, quoteRes] = await Promise.all([
          fetch(`${API_URL}/salesorder/`),
          fetch(`${API_URL}/quotation/`),
        ]);

        const salesData = await salesRes.json();
        const quoteData = await quoteRes.json();

        // Extract by correct fields
        setSalesOrders(
          salesData.map((s) => ({
            id: s.salesorder_id,
            no: s.salesorder_no || `SO-${s.salesorder_id}`,
          }))
        );

        setQuotations(
          quoteData.map((q) => ({
            id: q.quotation_id,
            no: q.quotation_no || `Q-${q.quotation_id}`,
          }))
        );
      } catch (err) {
        console.error("Error fetching source data:", err);
      }
    };

    fetchData();
  }, []);

  // 🔹 Fetch items when ID or source changes
  useEffect(() => {
    if (!selectedId || source === "custom") {
      setItems([]);
      onRowsChange([]);
      return;
    }

    const fetchItems = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint =
          source === "sales"
            ? `${API_URL}/salesorder/${selectedId}/items/`
            : `${API_URL}/quotation/${selectedId}/items/`;

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error("Failed to load items");
        const data = await res.json();

        const normalized = (data.items || data).map((item) => ({
          itemCode: item.item_code || item.product_code || "-",
          itemName: item.item_name || item.product_name || "Unknown",
          color: item.color || item.cct || "-",
          unit: item.unit || item.uom || "Nos",
          qty: item.quantity || item.qty || 1,
          netPrice: item.rate || item.price || 0,
          amount:
            item.amount ||
            (item.quantity || 1) * (item.rate || item.price || 0),
        }));

        setItems(normalized);
        onRowsChange(normalized); // ✅ Pass to parent for GST
      } catch (err) {
        setError(err.message);
        setItems([]);
        onRowsChange([]);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedId, source, onRowsChange]);

  // 🔹 Handle custom rows
  const handleCustomRows = (rows) => {
    setCustomRows(rows);
    onRowsChange(rows); // ✅ Pass to parent live
  };

  // 🔹 Final submit
  const handleSubmit = () => {
    const finalItems = source === "custom" ? customRows : items;
    if (finalItems.length === 0) {
      alert("Please add at least one item.");
      return;
    }
    onFinalSubmit({ source, id: selectedId, items: finalItems });
  };

  return (
    <div className="container-fluid p-4 bg-white rounded shadow-sm">
      {/* Header */}
      {/* Radio Selection */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body px-0">
          <label className="form-label fw-semibold text-dark">
            Select Source
          </label>
          <div className="d-flex flex-wrap gap-4">
            {[
              { value: "sales", label: "Sales Order ID", icon: "bi-receipt" },
              {
                value: "quotation",
                label: "Quotation ID",
                icon: "bi-file-earmark-text",
              },
              { value: "custom", label: "Custom Form", icon: "bi-plus-circle" },
            ].map((opt) => (
              <div
                key={opt.value}
                className="form-check form-check-inline"
                style={{ cursor: "pointer" }}
              >
                <input
                  className="form-check-input"
                  type="radio"
                  name="poSource"
                  id={opt.value}
                  value={opt.value}
                  checked={source === opt.value}
                  onChange={(e) => {
                    setSource(e.target.value);
                    setSelectedId("");
                    setItems([]);
                    setCustomRows([]);
                    onRowsChange([]); // reset parent
                  }}
                />
                <label
                  className="form-check-label d-flex align-items-center gap-2 fw-medium"
                  htmlFor={opt.value}
                  style={{
                    fontSize: "1rem",
                    color: source === opt.value ? "#0d6efd" : "#444",
                  }}
                >
                  <i className={`bi ${opt.icon}`}></i> {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional Source Dropdown */}
      {(source === "sales" || source === "quotation") && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <label className="form-label fw-semibold">
              Select {source === "sales" ? "Sales Order" : "Quotation"} ID
            </label>
            <select
              className="form-select"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              <option value="">-- Choose ID --</option>
              {(source === "sales" ? salesOrders : quotations).map((order) => (
                <option key={order.id} value={order.id}>
                  {order.no}
                </option>
              ))}
            </select>

            {selectedId && (
              <div className="mt-4">
                <h6 className="text-success">Items from #{selectedId}</h6>

                {loading && (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="alert alert-danger mt-3">{error}</div>
                )}

                {!loading && !error && items.length > 0 && (
                  <div className="table-responsive mt-3">
                    <table className="table table-hover align-middle">
                      <thead className="table-light">
                        <tr>
                          {/* <th>Item Code</th> */}
                          <th>Item Name</th>
                          <th>Color</th>
                          <th>Unit</th>
                          <th>Qty</th>
                          <th>Price</th>
                          <th>Amount</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, i) => (
                          <tr key={i}>
                            {/* <td>{item.itemCode}</td> */}
                            <td>{item.itemName}</td>
                            <td>{item.color}</td>
                            <td>{item.unit}</td>

                            {/* ✅ Editable Qty */}
                            <td>
                              <input
                                type="number"
                                min="1"
                                className="form-control form-control-sm"
                                value={item.qty}
                                onChange={(e) => {
                                  const updatedItems = [...items];
                                  const newQty = Number(e.target.value);
                                  updatedItems[i].qty = newQty;
                                  updatedItems[i].amount =
                                    newQty * updatedItems[i].netPrice;
                                  setItems(updatedItems);
                                  onRowsChange(updatedItems); // ✅ Notify parent
                                }}
                                style={{ width: "80px" }}
                              />
                            </td>

                            <td>₹{Number(item.netPrice).toFixed(2)}</td>
                            <td>₹{Number(item.amount).toFixed(2)}</td>

                            {/* 🗑️ Delete button */}
                            <td>
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => {
                                  const updatedItems = items.filter(
                                    (_, index) => index !== i
                                  );
                                  setItems(updatedItems);
                                  onRowsChange(updatedItems);
                                }}
                              >
                                ❌
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!loading && !error && items.length === 0 && (
                  <p className="text-muted text-center py-3">No items found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Custom Form */}
      {source === "custom" && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <NewPurchaseOrderItems onRowsChange={handleCustomRows} />
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderSourceSelector;
