"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";

const AddSwitchQuotProductModal = ({
  showAddModal,
  setShowAddModal,
  newRow,
  setNewRow,
  handleFieldChange,
  handleKeyDown,
  inputRefs,
  editRowIndex,
  handleAddRow,
}) => {
  const [showFindProductModal, setShowFindProductModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [isNetPriceManual, setIsNetPriceManual] = useState(false);

  // Calculate amount
  const calculateAmount = (qty, netPrice) => {
    const qtyValue = parseFloat(qty) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    return (qtyValue * netPriceValue).toFixed(2);
  };

  // Calculate net price from MRP + discount
  const calculateNetPrice = (mrp, discount) => {
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(discount) || 0;
    return (mrpValue * (1 - discountValue / 100)).toFixed(2);
  };

  // Calculate discount from MRP + net price
  const calculateDiscount = (mrp, netPrice) => {
    const mrpValue = parseFloat(mrp) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    if (mrpValue === 0) return "0.00";
    return (((mrpValue - netPriceValue) / mrpValue) * 100).toFixed(2);
  };

  // Handle modal close + clean reset
  const handleClose = () => {
    setShowAddModal(false);
    setShowFindProductModal(false);
    setPreviewImage(null);
    setIsNetPriceManual(false);
    setNewRow({
      brand: "",
      category: "",
      color: "",
      description: "",
      discount_percent: "",
      image: null,
      item_name: "",
      itemcode: "",
      mrp: "",
      net_price: "",
      quantity: "",
      remarks: "",
      unit: "",
      amount: "",
    });
  };

  // ✅ FIX: Do NOT call handleClose after handleAddRow.
  //         handleAddRow in SwitchQuotatTable already resets showAddModal,
  //         newRow, and editRowIndex. Calling handleClose here too caused
  //         double state updates and contributed to the infinite loop.
  const handleSubmit = () => {
    if (
      !newRow.itemcode ||
      !newRow.item_name ||
      !newRow.quantity ||
      !newRow.net_price
    ) {
      alert(
        "Please fill all required fields (Item Code, Item Name, Quantity, Net Price)."
      );
      return;
    }

    const netPrice = isNetPriceManual
      ? parseFloat(newRow.net_price).toFixed(2)
      : calculateNetPrice(newRow.mrp, newRow.discount_percent);

    const amount = calculateAmount(newRow.quantity, netPrice);

    const updatedRow = {
      ...newRow,
      net_price: netPrice,
      amount,
      unit: newRow.unit || "pcs",
      mrp: newRow.mrp || "",
      brand: newRow.brand || "",
      image: newRow.image || null,
      remarks: newRow.remarks || "N/A",
      discount_percent: newRow.discount_percent || 0,
    };

    // ✅ handleAddRow handles all resets (showModal, newRow, editRowIndex)
    handleAddRow(updatedRow, editRowIndex);

    // ✅ Only reset local modal state (isNetPriceManual, previewImage)
    setIsNetPriceManual(false);
    setPreviewImage(null);
  };

  // Handle field changes with smart auto-calculation
  const handleLocalFieldChange = (field, value) => {
    handleFieldChange(field, value);

    if (field === "net_price") {
      setIsNetPriceManual(true);
      const amount = calculateAmount(newRow.quantity, value);
      handleFieldChange("amount", amount);

      if (newRow.mrp && !isNaN(value)) {
        const discount = calculateDiscount(newRow.mrp, value);
        handleFieldChange("discount_percent", discount);
      }
    }

    if (field === "discount_percent") {
      setIsNetPriceManual(false);
      if (newRow.mrp && !isNaN(value)) {
        const netPrice = calculateNetPrice(newRow.mrp, value);
        handleFieldChange("net_price", netPrice);
        const amount = calculateAmount(newRow.quantity, netPrice);
        handleFieldChange("amount", amount);
      }
    }

    if (field === "quantity") {
      const amount = calculateAmount(value, newRow.net_price);
      handleFieldChange("amount", amount);
    }
  };

  return (
    showAddModal && (
      <div
        className="modal fade show"
        tabIndex={-1}
        style={{
          display: "block",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 1050,
        }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal">
          <div className="modal-content rounded-5 shadow-xl border-0 overflow-hidden">
            {/* Header */}
            <div className="modal-header border-0 px-4 pt-4 pb-3">
              <h1 className="modal-title fs-4 fw-semibold text-dark">
                {editRowIndex !== null ? "Edit Item" : "Add New Item"}
              </h1>
              <button
                type="button"
                className="btn-close fs-5 opacity-75"
                onClick={handleClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body px-4 pb-3">
              <div className="row g-4">
                {/* Item Code & Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">
                    Item Code
                  </label>
                  <input
                    type="text"
                    name="itemcode"
                    value={newRow.itemcode || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("itemcode", e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, "item_name")}
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.itemcode}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="item_name"
                    value={newRow.item_name || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("item_name", e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, "quantity")}
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.item_name}
                    required
                  />
                </div>

                {/* Brand, Category, Color */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted small">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={newRow.brand || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("brand", e.target.value)
                    }
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.brand}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted small">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={newRow.category || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("category", e.target.value)
                    }
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-muted small">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={newRow.color || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("color", e.target.value)
                    }
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                  />
                </div>

                {/* Pricing Row */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={newRow.unit || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("unit", e.target.value)
                    }
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.unit}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    name="mrp"
                    value={newRow.mrp || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("mrp", e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, "discount_percent")}
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.mrp}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={newRow.quantity || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("quantity", e.target.value)
                    }
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.quantity}
                    min="1"
                    required
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold text-muted small">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    name="discount_percent"
                    value={newRow.discount_percent || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("discount_percent", e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, "net_price")}
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.discount_percent}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>

                {/* Net Price & Amount */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-muted small">
                    Net Price (₹)
                  </label>
                  <input
                    type="number"
                    name="net_price"
                    value={newRow.net_price || ""}
                    onChange={(e) =>
                      handleLocalFieldChange("net_price", e.target.value)
                    }
                    placeholder=""
                    className="form-control border-0 shadow-sm bg-light rounded-4 py-2"
                    ref={inputRefs.net_price}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold text-success small">
                    Total Amount (₹)
                  </label>
                  <input
                    type="text"
                    name="amount"
                    value={newRow.amount || "0.00"}
                    readOnly
                    className="form-control"
                    ref={inputRefs.amount}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-0 px-5 pb-5 pt-0">
              <button
                type="button"
                className="btn btn-light px-5 py-2 rounded-4 fw-medium"
                onClick={handleClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success px-5 py-2 rounded-4 fw-semibold shadow-sm"
                onClick={handleSubmit}
              >
                {editRowIndex !== null ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

AddSwitchQuotProductModal.propTypes = {
  showAddModal: PropTypes.bool.isRequired,
  setShowAddModal: PropTypes.func.isRequired,
  newRow: PropTypes.shape({
    brand: PropTypes.string,
    category: PropTypes.string,
    color: PropTypes.string,
    description: PropTypes.string,
    discount_percent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    item_name: PropTypes.string,
    itemcode: PropTypes.string,
    mrp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    net_price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    remarks: PropTypes.string,
    unit: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setNewRow: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  inputRefs: PropTypes.objectOf(PropTypes.shape({ current: PropTypes.any }))
    .isRequired,
  editRowIndex: PropTypes.number,
  handleAddRow: PropTypes.func.isRequired,
};

export default AddSwitchQuotProductModal;
