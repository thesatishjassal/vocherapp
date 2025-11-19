"use client";
import React, { useState } from "react"; // Remove useEffect import
import PropTypes from "prop-types";
import FindProduct from "./FindProduct";

const AddQuotProductModal = ({
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
  const [mode, setMode] = useState("auto"); // 'auto' or 'manual'

  // Calculate amount
  const calculateAmount = (qty, netPrice) => {
    const qtyValue = parseFloat(qty) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    return (qtyValue * netPriceValue).toFixed(2);
  };

  // Calculate net price
  const calculateNetPrice = (mrp, discount) => {
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(discount) || 0;
    return (mrpValue * (1 - discountValue / 100)).toFixed(2);
  };

  // Calculate discount
  const calculateDiscount = (mrp, netPrice) => {
    const mrpValue = parseFloat(mrp) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    if (mrpValue === 0) return "0.00";
    return (((mrpValue - netPriceValue) / mrpValue) * 100).toFixed(2);
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, JPG)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds 5MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { filePath } = await response.json();
      handleFieldChange("image", filePath);
    } catch (error) {
      alert("Failed to upload image");
      setPreviewImage(null);
      handleFieldChange("image", "");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setShowAddModal(false);
    setShowFindProductModal(false);
    setPreviewImage(null);
    setIsNetPriceManual(false);
    setMode("auto");
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
    if (!newRow.itemCode || !newRow.itemName || !newRow.qty || !newRow.netPrice) {
      alert("Please fill all required fields (Item Code, Item Name, Quantity, Net Price).");
      return;
    }

    const netPrice = isNetPriceManual
      ? parseFloat(newRow.netPrice).toFixed(2)
      : calculateNetPrice(newRow.mrp, newRow.discount);
    const amount = calculateAmount(newRow.qty, netPrice);
    const updatedRow = {
      ...newRow,
      netPrice,
      amount,
      unit: newRow.unit || "Piece",
      mrp: newRow.mrp || "",
      brand: newRow.brand || "",
      image: newRow.image || "",
      remarks: newRow.remarks || "",
      discount: newRow.discount || "",
    };

    handleAddRow(updatedRow, editRowIndex);
    handleClose();
  };

  // Handle field changes
  const handleLocalFieldChange = (field, value) => {
    const sanitizedValue = field === "itemName" ? value.slice(0, 100) : value || "";
    handleFieldChange(field, sanitizedValue);

    if (field === "itemName" && value.length > 100) {
      alert("Item name truncated to 100 characters.");
    }

    if (field === "netPrice") {
      setIsNetPriceManual(true);
      handleFieldChange("netPrice", value);

      // If MRP is available, calculate and update Discount
      if (newRow.mrp && !isNaN(value)) {
        const discount = calculateDiscount(newRow.mrp, value);
        handleFieldChange("discount", discount);
      }

      // Update amount when netPrice changes
      const amount = calculateAmount(newRow.qty, value);
      handleFieldChange("amount", amount);
    }

    if (field === "discount") {
      setIsNetPriceManual(false);
      handleFieldChange("discount", value);

      // If MRP is available, calculate and update Net Price
      if (newRow.mrp && !isNaN(value)) {
        const netPrice = calculateNetPrice(newRow.mrp, value);
        handleFieldChange("netPrice", netPrice);
        // Update amount when netPrice is recalculated
        const amount = calculateAmount(newRow.qty, netPrice);
        handleFieldChange("amount", amount);
      }
    }

    if (field === "qty") {
      handleFieldChange("qty", value);
      // Update amount when qty changes
      const amount = calculateAmount(value, newRow.netPrice);
      handleFieldChange("amount", amount);
    }
  };

  // Handle product selection
  const handleLocalProductSelect = (product) => {
    if (product) {
      const truncatedItemName = product.itemname?.substring(0, 100) || "";
      if (product.itemname?.length > 100) {
        alert("Selected product name truncated to 100 characters.");
      }
      const netPrice = product.price || "";
      const qty = newRow.qty || "";
      const amount = calculateAmount(qty, netPrice);
      setNewRow((prev) => ({
        ...prev,
        itemCode: product.itemcode || "",
        itemName: truncatedItemName,
        unit: product.unit || "Piece",
        mrp: product.price || "",
        brand: product.brand || "",
        image: product.thumbnail || "",
        netPrice,
        amount,
        discount: "", // Reset discount on product selection
      }));
      setIsNetPriceManual(false); // Allow recalculation after product selection
      setShowFindProductModal(false);
      setTimeout(() => inputRefs.qty.current?.focus(), 100);
    }
  };

  const isFieldDisabled = (field) => {
    if (["itemCode", "itemName", "brand", "unit", "mrp"].includes(field)) {
      return mode === "auto";
    }
    return false;
  };

  return (
    showAddModal && (
      <div
        className="modal fade show"
        tabIndex={-1}
        style={{
          display: "block",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 1050,
        }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-md">
          <div className="modal-content rounded-4 shadow-lg">
            <div className="modal-header border-0 p-4">
              <h1 className="modal-title fs-5 fw-bold">
                {editRowIndex !== null ? "Edit Item" : "Add New Item"}
              </h1>
              <button
                type="button"
                className="btn-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body p-4">
              <div className="row g-3">
                <div className="col-12">
                  <div className="btn-group w-100" role="group" aria-label="Form mode">
                    <input
                      type="radio"
                      className="btn-check"
                      name="btnradio"
                      id="auto-mode"
                      autoComplete="off"
                      checked={mode === "auto"}
                      onChange={(e) => {
                        if (e.target.checked) setMode("auto");
                      }}
                    />
                    <label className="btn btn-outline-primary" htmlFor="auto-mode">
                      <i className="fa-solid fa-search me-1"></i>Quick Add
                    </label>
                    <input
                      type="radio"
                      className="btn-check"
                      name="btnradio"
                      id="manual-mode"
                      autoComplete="off"
                      checked={mode === "manual"}
                      onChange={(e) => {
                        if (e.target.checked) setMode("manual");
                      }}
                    />
                    <label className="btn btn-outline-primary" htmlFor="manual-mode">
                      <i className="fa-solid fa-edit me-1"></i>Manual Entry
                    </label>
                  </div>
                </div>

                {mode === "auto" && (
                  <>
                    <div className="col-12">
                      <button
                        type="button"
                        className="btn btn-secondary w-100"
                        onClick={() => setShowFindProductModal(true)}
                        title="Find Product"
                      >
                        <i className="fa-solid fa-magnifying-glass me-2"></i>Search the Product
                      </button>
                    </div>
                    <div className="col-12">
                      <hr />
                    </div>
                  </>
                )}

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Customer Code</label>
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
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Customer Description</label>
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

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Item Code</label>
                  <input
                    type="text"
                    name="itemCode"
                    value={newRow.itemCode || ""}
                    onChange={(e) => handleLocalFieldChange("itemCode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "itemName")}
                    placeholder="Ex: ITEM00123"
                    className="form-control"
                    ref={inputRefs.itemCode}
                    disabled={isFieldDisabled("itemCode")}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={newRow.itemName || ""}
                    onChange={(e) => handleLocalFieldChange("itemName", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "qty")}
                    placeholder="Ex: Stainless Steel Bottle"
                    className="form-control"
                    ref={inputRefs.itemName}
                    disabled={isFieldDisabled("itemName")}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label small fw-medium">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={newRow.brand || ""}
                    onChange={(e) => handleLocalFieldChange("brand", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "unit")}
                    placeholder="Brand"
                    className="form-control"
                    ref={inputRefs.brand}
                    disabled={isFieldDisabled("brand")}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">Unit</label>
                  <input
                    type="text"
                    name="unit"
                    value={newRow.unit || ""}
                    onChange={(e) => handleLocalFieldChange("unit", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "mrp")}
                    placeholder="Auto-filled unit"
                    className="form-control"
                    ref={inputRefs.unit}
                    disabled={isFieldDisabled("unit")}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">MRP</label>
                  <input
                    type="number"
                    name="mrp"
                    value={newRow.mrp || ""}
                    onChange={(e) => handleLocalFieldChange("mrp", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "discount")}
                    placeholder="MRP"
                    className="form-control"
                    ref={inputRefs.mrp}
                    min="0"
                    step="0.01"
                    disabled={isFieldDisabled("mrp")}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={newRow.amount || ""}
                    onChange={(e) => handleLocalFieldChange("amount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "image")}
                    placeholder="Auto-calculated (Qty * Net Price)"
                    className="form-control"
                    ref={inputRefs.amount}
                    min="0"
                    step="0.01"
                    disabled
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-medium">Quantity</label>
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
                <div className="col-md-3">
                  <label className="form-label small fw-medium">Discount (%)</label>
                  <input
                    type="number"
                    name="discount"
                    value={newRow.discount || ""}
                    onChange={(e) => handleLocalFieldChange("discount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "netPrice")}
                    placeholder="E.g., 10 for 10% off"
                    className="form-control"
                    ref={inputRefs.discount}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Net Price</label>
                  <input
                    type="number"
                    name="netPrice"
                    value={newRow.netPrice || ""}
                    onChange={(e) => handleLocalFieldChange("netPrice", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "amount")}
                    placeholder="Final price after discount"
                    className="form-control"
                    ref={inputRefs.netPrice}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* <div className="col-md-12">
                  <label className="form-label small fw-medium">Upload Image</label>
                  <input
                    type="file"
                    name="image"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageUpload}
                    onKeyDown={(e) => handleKeyDown(e, "remarks")}
                    className="form-control"
                    ref={inputRefs.image}
                  />
                </div>
                {(previewImage || newRow.image) && (
                  <div className="col-12">
                    <label className="form-label small fw-medium">Image Preview</label>
                    <img
                      src={
                        previewImage ||
                        (newRow.image.startsWith("http")
                          ? newRow.image
                          : `/uploads/${newRow.image.split("/").pop()}`)
                      }
                      alt="Preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: "150px", objectFit: "contain" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )} */}
                <div className="col-12">
                  <label className="form-label small fw-medium">Remarks</label>
                  <textarea
                    name="remarks"
                    value={newRow.remarks || ""}
                    onChange={(e) => handleLocalFieldChange("remarks", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                    placeholder="Any additional notes or info"
                    className="form-control"
                    ref={inputRefs.remarks}
                    rows="2"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-4">
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

AddQuotProductModal.propTypes = {
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

export default AddQuotProductModal;