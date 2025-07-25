"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import FindProduct from "./FindProduct";

const AddProductModal = ({
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

  // Handle modal close and reset form
  const handleClose = () => {
    setShowAddModal(false);
    setShowFindProductModal(false);
    setNewRow({
      customerCode: "",
      customerDescription: "",
      itemCode: "",
      itemName: "",
      cus_itemcode: "",
      cus_itemname: "",
      brand: "",
      qty: "",
      unit: "",
      mrp: "",
      discount: "",
      amount: "",
      netPrice: "",
      image: "",
      remarks: "",
      cus_customercode: "",
      cus_customerdescription: "",
      cus_qty: "",
      cus_brand: "",
      cus_unit: "",
      cus_mrp: "",
      cus_discount: "",
      cus_netprice: "",
      cus_image: "",
      cus_remarks: "",
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Basic validation
    if (!newRow.itemCode || !newRow.itemName || !newRow.qty || !newRow.netPrice) {
      alert("Please fill all required fields (Item Code, Item Name, Quantity, Net Price).");
      return;
    }

    // Calculate net price if discount is provided
    let calculatedNetPrice = parseFloat(newRow.mrp) || 0;
    if (newRow.discount) {
      const discount = parseFloat(newRow.discount) || 0;
      calculatedNetPrice = calculatedNetPrice * (1 - discount / 100);
    }
    const updatedRow = { ...newRow, netPrice: calculatedNetPrice.toFixed(2) };

    // Pass the updated row to the parent
    handleAddRow(updatedRow, editRowIndex);
    handleClose();
  };

  // Handle field changes
  const handleLocalFieldChange = (field, value) => {
    // Update the field value in the parent component
    const sanitizedValue = field === "itemName" ? value.slice(0, 100) : value || "";
    handleFieldChange(field, sanitizedValue);

    // Show truncation alert for itemName
    if (field === "itemName" && value.length > 100) {
      alert("Item name truncated to 100 characters.");
    }

    // If MRP or discount changes, recalculate net price
    if (field === "mrp" || field === "discount") {
      const mrp = parseFloat(newRow.mrp) || 0;
      const discount = parseFloat(newRow.discount) || 0;
      const netPrice = mrp * (1 - discount / 100);
      handleFieldChange("netPrice", netPrice.toFixed(2));
    }

    // Show FindProduct modal when itemCode or itemName is edited
    if (["itemCode", "itemName"].includes(field) && value.trim()) {
      setShowFindProductModal(true);
    } else if (["itemCode", "itemName"].includes(field) && !value.trim()) {
      setShowFindProductModal(false);
    }
  };

  // Handle product selection from FindProduct modal
  const handleLocalProductSelect = (product) => {
    if (product) {
      const truncatedItemName = product.itemname?.substring(0, 100) || "";
      if (product.itemname?.length > 100) {
        alert("Selected product name truncated to 100 characters.");
      }
      setNewRow((prev) => ({
        ...prev,
        itemCode: product.itemcode || "",
        itemName: truncatedItemName,
        unit: product.unit || "Piece",
        mrp: product.price || "",
        brand: product.brand || "",
        image: product.thumbnail || "",
        netPrice: product.price || "",
      }));
      setShowFindProductModal(false);
      setTimeout(() => inputRefs.qty.current?.focus(), 100);
    }
  };

  return (
    showAddModal && (
      <div
        className="modal" fade="show"
        tabIndex="{-1}"
        style={{
          display: "block",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          transition: "opacity:0.3s ease-in-out",
          zIndex: "1050",
        }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div class="modal-content rounded-4 shadow-lg">
            <div class="modal-header border-0 p-4">
              <h1 class="modal-title fs-5 fw-bold">
                {editRowIndex !== null ? "Edit Item" : "Add New Item"} Item
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <span>&times;</span>
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div class="modal-body p-4">
              <div class="row g-3">
                {/* Customer Code */}
                <div class="col-md-6">
                  <label class="form-label small fw-medium">Customer Code</label>
                  <input
                    type="text"
                    name="customerCode"
                    value={newRow.customerCode || ""}
                    onChange={(e) => handleLocalFieldChange("customerCode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "customerDescription")}
                    placeholder="Enter unique customer code"
                    className="form-control"
                    ref={inputRefs.customerCode}
                    required
                  />
                </div>
                {/* Customer Description */}
                <div class="col-md-6">
                  <label class="form-label small fw-medium">Customer Description</label>
                  <input
                    type="text"
                    name="customerDescription"
                    value={newRow.customerDescription || ""}
                    onChange={(e) => handleLocalFieldChange("customerDescription", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "itemCode")}
                    placeholder="Full name or short description"
                    className="form-control"
                    ref={inputRefs.customerDescription}
                    required
                  />
                </div>
                {/* Item Code */}
                <div class="col-md-4">
                  <label class="form-label small fw-medium">Item Code</label>
                  <input
                    type="text"
                    name="itemCode"
                    value={newRow.itemCode || ""}
                    onChange={(e) => handleLocalFieldChange("itemCode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "itemName")}
                    placeholder="Ex: ITEM00123"
                    className="form-control"
                    ref={inputRefs.itemCode}
                    required
                  />
                </div>
                {/* Item Name */}
                <div class="col-md-4">
                  <label class="form-label small fw-medium">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={newRow.itemName || ""}
                    onChange={(e) => handleLocalFieldChange("itemName", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "qty")}
                    placeholder="Ex: Stainless Steel Bottle"
                    className="form-control"
                    ref={inputRefs.itemName}
                    required
                  />
                </div>
                {/* Quantity */}
                <div class="col-md-4">
                  <label class="form-label small fw-medium">Quantity</label>
                  <input
                    type="number"
                    name="qty"
                    value={newRow.qty || ""}
                    onChange={(e) => handleLocalFieldChange("qty", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "brand")}
                    placeholder="Enter quantity"
                    className="form-control"
                    ref={inputRefs.qty}
                    min="1"
                    required
                  />
                </div>
                {/* Brand */}
                <div class="col-md-4">
                  <label class="form-label small fw-medium">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={newRow.brand || ""}
                    onChange={(e) => handleLocalFieldChange("brand", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "unit")}
                    placeholder="Enter brand"
                    className="form-control"
                    ref={inputRefs.brand}
                    disabled
                  />
                </div>
                {/* Unit */}
                <div class="col-md-4">
                  <label class="form-label small fw-medium">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={newRow.unit || ""}
                    onChange={(e) => handleLocalFieldChange("unit", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "mrp")}
                    placeholder="Auto-filled unit"
                    className="form-control"
                    ref={inputRefs.unit}
                    disabled
                  />
                </div>
                {/* MRP */}
                <div class="col-md-4">
                  <label class="form-label small fw-medium">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    value={newRow.mrp || ""}
                    onChange={(e) => handleLocalFieldChange("mrp", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "discount")}
                    placeholder="Auto-fetched MRP"
                    className="form-control"
                    ref={inputRefs.mrp}
                    min="0"
                    step="0.01"
                    disabled
                  />
                </div>
                {/* Discount */}
                <div class="col-md-6">
                  <label class="form-label small fw-medium">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={newRow.discount || ""}
                    onChange={(e) => handleLocalFieldChange("discount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "netPrice")}
                    placeholder="E.g. 10 for 10% off"
                    className="form-control"
                    ref={inputRefs.discount}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                {/* Net Price */}
                <div class="col-md-6">
                  <label class="form-label small fw-medium">Net Price</label>
                  <input
                    type="number"
                    name="netPrice"
                    value={newRow.netPrice || ""}
                    onChange={(e) => handleLocalFieldChange("netPrice", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "remarks")}
                    placeholder="Final price after discount"
                    className="form-control"
                    ref={inputRefs.netPrice}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {/* Image Preview */}
                {newRow.image && (
                  <div class="col-12">
                    <label class="form-label small fw-medium">Image Preview</label>
                    <img
                      src={newRow.image.startsWith("http") ? newRow.image : `https://api.panvic.in${newRow.image}`}
                      alt="Preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: "150px", objectFit: "contain" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
                {/* Remarks */}
                <div class="col-12">
                  <label class="form-label small fw-medium">Remarks</label>
                  <textarea
                    name="remarks"
                    value={newRow.remarks || ""}
                    onChange={(e) => handleLocalFieldChange("remarks", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                    placeholder="Any additional notes or info"
                    className="form-control"
                    ref={inputRefs.remarks}
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div class="modal-footer border-0 p-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSubmit}
                aria-label={editRowIndex !== null ? "Update Item" : "Add Item"}
              >
                {editRowIndex !== null ? "Update Item" : "Add Item"}
              </button>
            </div>
          </div>
        </div>
        <FindProduct
          showModal={showFindProductModal}
          setShowModal={setShowFindProductModal}
          handleProductSelect={handleLocalProductSelect}
        />
      </div>
    )
  );
};

AddProductModal.propTypes = {
  showAddModal: PropTypes.bool.isRequired,
  setShowAddModal: PropTypes.func.isRequired,
  newRow: PropTypes.shape({
    customerCode: PropTypes.string,
    customerDescription: PropTypes.string,
    itemCode: PropTypes.string,
    itemName: PropTypes.string,
    cus_itemcode: PropTypes.string,
    cus_itemname: PropTypes.string,
    brand: PropTypes.string,
    qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit: PropTypes.string,
    mrp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    netPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    image: PropTypes.string,
    remarks: PropTypes.string,
    cus_customercode: PropTypes.string,
    cus_customerdescription: PropTypes.string,
    cus_qty: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cus_brand: PropTypes.string,
    cus_unit: PropTypes.string,
    cus_mrp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cus_discount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cus_netprice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    cus_image: PropTypes.string,
    cus_remarks: PropTypes.string,
  }).isRequired,
  setNewRow: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  inputRefs: PropTypes.objectOf(PropTypes.shape({ current: PropTypes.any })).isRequired,
  editRowIndex: PropTypes.number,
  handleAddRow: PropTypes.func.isRequired,
};

export default AddProductModal;