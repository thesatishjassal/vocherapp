"use client";
import React, { useState,useRef  } from "react";
import PropTypes from "prop-types";

const CustomAddModal = ({
  showCusAddModal,
  setShowCusAddModal,
  newRow,
  setCustomNewRow,
  handleFieldChange,
  handleKeyDown,
  inputRefs,
  editRowIndex,
  handleSubmitCustomRow,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const lastEditedField = useRef(null);

  // Calculate amount
  const calculateAmount = (qty, netPrice) => {
    const qtyValue = parseFloat(qty) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    return (qtyValue * netPriceValue).toFixed(2);
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      alert("Please upload a valid image (JPEG, PNG, JPG)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds 5MB limit");
      return;
    }

    // Generate preview
    const reader = new FileReader();
    reader.onload = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);

    // Upload to Next.js API route
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const { filePath } = await response.json();
      handleFieldChange("cus_image", filePath);
    } catch (error) {
      alert("Failed to upload image");
      setPreviewImage(null);
      handleFieldChange("cus_image", "");
    }
  };

  // Handle modal close
  const handleClose = () => {
    setShowCusAddModal(false);
    setPreviewImage(null);
    setCustomNewRow({
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
      cus_amount: "",
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    if (
      !newRow.cus_customercode ||
      !newRow.cus_customerdescription ||
      !newRow.cus_itemcode ||
      !newRow.cus_itemname ||
      !newRow.cus_qty ||
      !newRow.cus_netprice
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedRow = {
      ...newRow,
      cus_unit: newRow.cus_unit || "Piece",
      cus_mrp: newRow.cus_mrp || "",
      cus_brand: newRow.cus_brand || "",
      cus_image: newRow.cus_image || "",
      cus_remarks: newRow.cus_remarks || "",
    };

    handleSubmitCustomRow(updatedRow, editRowIndex);
    handleClose();
  };

  // Handle field changes
 const handleLocalFieldChange = (field, value) => {
  const sanitizedValue = field === "cus_itemname" ? value.slice(0, 100) : value || "";
  handleFieldChange(field, sanitizedValue);

  if (field === "cus_itemname" && value.length > 100) {
    alert("Item name truncated to 100 characters.");
  }

  lastEditedField.current = field;

  const mrp = parseFloat(
    field === "cus_mrp" ? value : newRow.cus_mrp
  ) || 0;
  const discount = parseFloat(
    field === "cus_discount" ? value : newRow.cus_discount
  ) || 0;
  const netPrice = parseFloat(
    field === "cus_netprice" ? value : newRow.cus_netprice
  ) || 0;

  // When Discount is updated, calculate Net Price
  if (field === "cus_discount" && mrp > 0) {
    const updatedNet = mrp * (1 - discount / 100);
    handleFieldChange("cus_netprice", updatedNet.toFixed(2));
  }

  // When Net Price is updated, calculate Discount
  if (field === "cus_netprice" && mrp > 0) {
    const updatedDiscount = ((1 - netPrice / mrp) * 100).toFixed(2);
    handleFieldChange("cus_discount", updatedDiscount);
  }

  // When MRP is updated, re-calculate based on last edited field
  if (field === "cus_mrp" && mrp > 0) {
    if (lastEditedField.current === "cus_discount") {
      const updatedNet = mrp * (1 - discount / 100);
      handleFieldChange("cus_netprice", updatedNet.toFixed(2));
    } else if (lastEditedField.current === "cus_netprice") {
      const updatedDiscount = ((1 - netPrice / mrp) * 100).toFixed(2);
      handleFieldChange("cus_discount", updatedDiscount);
    }
  }
};


  return (
    showCusAddModal && (
      <div
        className="modal fade show"
        tabIndex="-1"
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
                {editRowIndex !== null ? "Edit Custom Item" : "Add Custom Item"}
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
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Customer Code</label>
                  <input
                    type="text"
                    name="cus_customercode"
                    value={newRow.cus_customercode || ""}
                    onChange={(e) => handleLocalFieldChange("cus_customercode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_customerdescription")}
                    placeholder="Enter unique customer code"
                    className="form-control"
                    ref={inputRefs.cus_customercode}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Customer Description</label>
                  <input
                    type="text"
                    name="cus_customerdescription"
                    value={newRow.cus_customerdescription || ""}
                    onChange={(e) => handleLocalFieldChange("cus_customerdescription", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_itemcode")}
                    placeholder="Full name or short description"
                    className="form-control"
                    ref={inputRefs.cus_customerdescription}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Custom Item Code</label>
                  <input
                    type="text"
                    name="cus_itemcode"
                    value={newRow.cus_itemcode || ""}
                    onChange={(e) => handleLocalFieldChange("cus_itemcode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_itemname")}
                    placeholder="Ex: CUS_ITEM00123"
                    className="form-control"
                    ref={inputRefs.cus_itemcode}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Custom Item Name</label>
                  <input
                    type="text"
                    name="cus_itemname"
                    value={newRow.cus_itemname || ""}
                    onChange={(e) => handleLocalFieldChange("cus_itemname", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_qty")}
                    placeholder="Ex: Custom Stainless Steel Bottle"
                    className="form-control"
                    ref={inputRefs.cus_itemname}
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Quantity</label>
                  <input
                    type="number"
                    name="cus_qty"
                    value={newRow.cus_qty || ""}
                    onChange={(e) => handleLocalFieldChange("cus_qty", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_brand")}
                    placeholder="Enter quantity"
                    className="form-control"
                    ref={inputRefs.cus_qty}
                    min="1"
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Brand</label>
                  <input
                    type="text"
                    name="cus_brand"
                    value={newRow.cus_brand || ""}
                    onChange={(e) => handleLocalFieldChange("cus_brand", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_unit")}
                    placeholder="Enter brand"
                    className="form-control"
                    ref={inputRefs.cus_brand}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">Unit</label>
                  <input
                    type="text"
                    name="cus_unit"
                    value={newRow.cus_unit || ""}
                    onChange={(e) => handleLocalFieldChange("cus_unit", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_mrp")}
                    placeholder="Enter unit (e.g., Piece, Kg)"
                    className="form-control"
                    ref={inputRefs.cus_unit}
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-medium">MRP</label>
                  <input
                    type="number"
                    name="cus_mrp"
                    value={newRow.cus_mrp || ""}
                    onChange={(e) => handleLocalFieldChange("cus_mrp", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "cus_discount")}
                    placeholder="Enter MRP"
                    className="form-control"
                    ref={inputRefs.cus_mrp}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Discount (%)</label>
                  <input
                    type="number"
                    name="cus_discount"
                    value={newRow.cus_discount || ""}
                    onChange={(e) => handleLocalFieldChange("cus_discount", e.target.value)}
                    onBlur={() => {
                      const mrp = parseFloat(newRow.cus_mrp) || 0;
                      const discount = parseFloat(newRow.cus_discount) || 0;
                      if (discount < 0 || discount > 100) {
                        alert("Discount must be between 0 and 100.");
                        handleFieldChange("cus_discount", "");
                      } else {
                        const netPrice = mrp * (1 - discount / 100);
                        handleFieldChange("cus_netprice", netPrice.toFixed(2));
                        const amount = calculateAmount(newRow.cus_qty, netPrice);
                        handleFieldChange("cus_amount", amount);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, "cus_netprice")}
                    placeholder="E.g. 10 for 10% off"
                    className="form-control"
                    ref={inputRefs.cus_discount}
                    min="0"
                    max="100"
                    step="0.01"
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Net Price</label>
                  <input
                    type="number"
                    name="cus_netprice"
                    value={newRow.cus_netprice || ""}
                    onChange={(e) => handleLocalFieldChange("cus_netprice", e.target.value)}
                    onBlur={() => {
                      const mrp = parseFloat(newRow.cus_mrp) || 0;
                      const netPrice = parseFloat(newRow.cus_netprice) || 0;
                      if (mrp > 0 && netPrice > mrp) {
                        alert("Net price cannot exceed MRP.");
                        handleFieldChange("cus_netprice", mrp.toFixed(2));
                        handleFieldChange("cus_discount", "0");
                        const amount = calculateAmount(newRow.cus_qty, mrp);
                        handleFieldChange("cus_amount", amount);
                      } else {
                        const amount = calculateAmount(newRow.cus_qty, netPrice);
                        handleFieldChange("cus_amount", amount);
                      }
                    }}
                    onKeyDown={(e) => handleKeyDown(e, "cus_amount")}
                    placeholder="Final price after discount"
                    className="form-control"
                    ref={inputRefs.cus_netprice}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Amount</label>
                  <input
                    type="number"
                    name="cus_amount"
                    value={newRow.cus_amount || ""}
                    placeholder="Auto-calculated (Qty * Net Price)"
                    className="form-control"
                    ref={inputRefs.cus_amount}
                    min="0"
                    step="0.01"
                    disabled
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-medium">Upload Image</label>
                  <input
                    type="file"
                    name="cus_image"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageUpload}
                    onKeyDown={(e) => handleKeyDown(e, "cus_remarks")}
                    className="form-control"
                    ref={inputRefs.cus_image}
                  />
                </div>
                {(previewImage || newRow.cus_image) && (
                  <div className="col-12">
                    <label className="form-label small fw-medium">Image Preview</label>
                    <img
                      src={
                        previewImage ||
                        (newRow.cus_image.startsWith("http")
                          ? newRow.cus_image
                          : `/uploads/${newRow.cus_image.split("/").pop()}`)
                      }
                      alt="Preview"
                      className="img-fluid rounded"
                      style={{ maxHeight: "150px", objectFit: "contain" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label small fw-medium">Remarks</label>
                  <textarea
                    name="cus_remarks"
                    value={newRow.cus_remarks || ""}
                    onChange={(e) => handleLocalFieldChange("cus_remarks", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                    placeholder="Any additional notes or info"
                    className="form-control"
                    ref={inputRefs.cus_remarks}
                    rows="3"
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
                aria-label={editRowIndex !== null ? "Update Custom Item" : "Add Custom Item"}
              >
                {editRowIndex !== null ? "Update Custom Item" : "Add Custom Item"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

CustomAddModal.propTypes = {
  showCusAddModal: PropTypes.bool.isRequired,
  setShowCusAddModal: PropTypes.func.isRequired,
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
    cus_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  setCustomNewRow: PropTypes.func.isRequired,
  handleFieldChange: PropTypes.func.isRequired,
  handleKeyDown: PropTypes.func.isRequired,
  inputRefs: PropTypes.objectOf(PropTypes.shape({ current: PropTypes.any })).isRequired,
  editRowIndex: PropTypes.number,
  handleSubmitCustomRow: PropTypes.func.isRequired,
};

export default CustomAddModal;