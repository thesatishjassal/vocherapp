"use client";
import React, { useState, useRef, useEffect } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import FindProduct from "../components/FindPropduct";

const QuotatTable = ({
  items = [],
  onTotalAmountChange,
  ShowHideFiltercolModal,
  onClose,
  onRowsChange,
}) => {
  const [rows, setRows] = useState([]);
  const [FiltercolModal, setFiltercolModal] = useState(false);
  const [newRow, setNewRow] = useState({
    customerCode: "",
    customerDescription: "",
    itemCode: "",
    itemName: "",
    brand: "",
    qty: "",
    unit: "",
    mrp: "",
    discount: "",
    amount: "",
    image: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [columns, setColumns] = useState({
    customerCode: true,
    customerDescription: true,
    Image: true,
    ItemCode: true,
    Brand: true,
    MRP: true,
    Qty: true,
    Dist: true,
    Price: true,
  });
  const [editRowIndex, setEditRowIndex] = useState(null);

  const inputRefs = {
    customerCode: useRef(null),
    customerDescription: useRef(null),
    itemCode: useRef(null),
    itemName: useRef(null),
    brand: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    mrp: useRef(null),
    discount: useRef(null),
    image: useRef(null),
  };

  // Sync rows with items prop
  useEffect(() => {
    if (items.length > 0 && rows.length === 0) {
      setRows(items.map((item, index) => ({
        id: index + 1,
        ...item,
        amount: calculateAmount(item.qty, item.mrp, item.discount),
      })));
    }
  }, [items]);

  // Fetch products from API on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://api.panvic.in/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const updatedData = data.map((item) => ({
          ...item,
          unit: item.unit || "Piece",
        }));
        setProductList(updatedData);
        setFilteredProducts(updatedData);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  const calculateAmount = (qty, mrp, discount) => {
    const discountAmount = (mrp * qty * (discount || 0)) / 100;
    return qty * mrp - discountAmount;
  };

  // Calculate total amount directly from rows
  const totalAmount = rows.reduce((sum, row) => sum + row.amount, 0);

  // Notify parent of rows and total amount changes
  useEffect(() => {
    if (onRowsChange) onRowsChange(rows);
    if (onTotalAmountChange) onTotalAmountChange(totalAmount);
  }, [rows, onRowsChange, onTotalAmountChange, totalAmount]);

  const handleAddRow = () => {
    const { qty, mrp, discount } = newRow;

    if (newRow.itemCode && newRow.itemName && qty && mrp) {
      const amount = calculateAmount(qty, mrp, discount);

      if (editRowIndex !== null) {
        setRows((prevRows) =>
          prevRows.map((row, index) =>
            index === editRowIndex
              ? {
                  ...row,
                  ...newRow,
                  amount,
                }
              : row
          )
        );
        setEditRowIndex(null);
      } else {
        setRows((prevRows) => [
          ...prevRows,
          {
            id: prevRows.length + 1,
            ...newRow,
            amount,
          },
        ]);
      }

      setNewRow({
        customerCode: "",
        customerDescription: "",
        itemCode: "",
        itemName: "",
        brand: "",
        qty: "",
        unit: "",
        mrp: "",
        discount: "",
        amount: "",
        image: "",
      });
      setShowAddModal(false);
    } else {
      alert("Please fill in all required fields.");
    }
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
    if (["itemCode", "itemName"].includes(field) && value.trim()) {
      setShowModal(true);
      filterProducts(field, value);
    }
  };

  const filterProducts = (field, value) => {
    const filtered = productList.filter((product) => {
      if (field === "itemCode") {
        return product.itemcode.toLowerCase().includes(value.toLowerCase());
      } else if (field === "itemName") {
        return product.itemname.toLowerCase().includes(value.toLowerCase());
      }
      return true;
    });
    setFilteredProducts(filtered);
  };

  const handleProductSelect = (product) => {
    if (product) {
      setNewRow((prev) => ({
        ...prev,
        itemCode: product.itemcode,
        itemName: product.itemname,
        unit: product.unit,
        mrp: product.price,
        brand: product.brand,
        image: product.thumbnail,
      }));
    }
    setShowModal(false);
    setTimeout(() => {
      inputRefs.qty.current?.focus();
    }, 0);
  };

  const handleColumnVisibilityChange = (updatedColumns) => {
    setColumns(updatedColumns);
  };

  const handleEditRow = (index) => {
    const row = rows[index];
    setNewRow({
      customerCode: row.customerCode,
      customerDescription: row.customerDescription,
      itemCode: row.itemCode,
      itemName: row.itemName,
      brand: row.brand,
      qty: row.qty,
      unit: row.unit,
      mrp: row.mrp,
      discount: row.discount,
      amount: row.amount,
      image: row.image,
    });
    setEditRowIndex(index);
    setShowAddModal(true);
  };

  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  return (
    <div>
      <ShowHideFilter
        className="no-print"
        columns={columns}
        onChange={handleColumnVisibilityChange}
      />

      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            {columns.Image && <th>Image</th>}
            {columns.customerCode && <th>Cust Code</th>}
            {columns.customerDescription && <th>Cust Desc</th>}
            {columns.ItemCode && <th>Item Code</th>}
            <th>Item Name</th>
            {columns.Brand && <th>Brand</th>}
            <th>Unit</th>
            {columns.MRP && <th>MRP</th>}
            {columns.Qty && <th>Qty</th>}
            {columns.Dist && <th>Dist (%)</th>}
            {columns.Price && <th>Price</th>}
            <th className="no-print">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              {columns.Image && (
                <td>
                  <img
                    src={
                      row.image === ""
                        ? ""
                        : `https://api.panvic.in${row.image}`
                    }
                    alt=""
                    className="product_img"
                  />
                </td>
              )}
              {columns.customerCode && <td>{row.customerCode}</td>}
              {columns.customerDescription && (
                <td>{row.customerDescription}</td>
              )}
              {columns.ItemCode && <td>{row.itemCode}</td>}
              <td>{row.itemName}</td>
              {columns.Brand && <td>{row.brand}</td>}
              <td>{row.unit}</td>
              {columns.MRP && <td>{row.mrp}</td>}
              {columns.Qty && <td>{row.qty}</td>}
              {columns.Dist && <td>{row.discount}</td>}
              {columns.Price && <td>{row.amount.toFixed(2)}</td>}
              <td>
                <button
                  className="btn action_btn no-print btn-warning"
                  onClick={() => handleEditRow(index)}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn action_btn no-print btn-danger ml-2"
                  onClick={() => handleDeleteRow(index)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
                <h1 className="modal-title fs-5">
                  {editRowIndex !== null ? "Edit Item" : "Add New Item"}
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditRowIndex(null);
                  }}
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
                      name="customerCode"
                      value={newRow.customerCode}
                      onChange={(e) =>
                        handleFieldChange("customerCode", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, "customerDescription")}
                      placeholder="Cust Code"
                      className="form-control"
                      ref={inputRefs.customerCode}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="customerDescription"
                      value={newRow.customerDescription}
                      onChange={(e) =>
                        handleFieldChange("customerDescription", e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, "itemCode")}
                      placeholder="Cust Desc"
                      className="form-control"
                      ref={inputRefs.customerDescription}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="itemCode"
                      value={newRow.itemCode}
                      onChange={(e) => handleFieldChange("itemCode", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "itemName")}
                      placeholder="Item code"
                      className="form-control"
                      ref={inputRefs.itemCode}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="itemName"
                      value={newRow.itemName}
                      onChange={(e) => handleFieldChange("itemName", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "brand")}
                      placeholder="Item name"
                      className="form-control"
                      ref={inputRefs.itemName}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="brand"
                      value={newRow.brand}
                      onChange={(e) => handleFieldChange("brand", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "qty")}
                      placeholder="Brand"
                      className="form-control"
                      ref={inputRefs.brand}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="qty"
                      value={newRow.qty}
                      onChange={(e) => handleFieldChange("qty", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, "discount")}
                      placeholder="Qty"
                      className="form-control"
                      ref={inputRefs.qty}
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="unit"
                      value={newRow.unit}
                      onChange={(e) => handleFieldChange("unit", e.target.value)}
                      placeholder="Unit"
                      className="form-control"
                      ref={inputRefs.unit}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="text"
                      name="mrp"
                      value={newRow.mrp}
                      onChange={(e) => handleFieldChange("mrp", e.target.value)}
                      placeholder="MRP"
                      className="form-control"
                      ref={inputRefs.mrp}
                      disabled
                    />
                  </div>
                  <div className="col-6">
                    <input
                      type="number"
                      name="discount"
                      value={newRow.discount}
                      onChange={(e) => handleFieldChange("discount", e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, null)}
                      placeholder="Discount (%)"
                      className="form-control"
                      ref={inputRefs.discount}
                    />
                  </div>
                  
                  {newRow.image && (
                    <div className="col-12">
                      <img
                        src={`https://api.panvic.in` + newRow.image}
                        alt="Preview"
                        className="img-fluid"
                        style={{ maxHeight: "100px" }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer border-0 p-4">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditRowIndex(null);
                  }}
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleAddRow}
                  aria-label={editRowIndex !== null ? "Update Item" : "Add Item"}
                >
                  {editRowIndex !== null ? "Update Item" : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Button to open the Add Row Modal */}
      <div className="mt-3">
        <button
          className="btn btn-primary w-100"
          onClick={() => setShowAddModal(true)}
          aria-label="Add New Row"
        >
          Add New Row
        </button>
      </div>

      <FindProduct
        showModal={showModal}
        setShowModal={setShowModal}
        handleProductSelect={handleProductSelect}
        products={filteredProducts}
      />
    </div>
  );
};

export default QuotatTable;