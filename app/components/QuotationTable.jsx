"use client";
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import AddProductModal from "./AddProductModal";
import CustomAddModal from "./CustomAddModal";
import ShowHideFilter from "./ShowHideFilter";

const QuotationTable = ({
  items = [],
  onTotalAmountChange,
  onClose,
  onRowsChange,
}) => {
  const [rows, setRows] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCusAddModal, setShowCusAddModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [columns, setColumns] = useState({
    customerCode: false,
    customerDescription: false,
    Image: true,
    ItemCode: true,
    Brand: true,
    MRP: true,
    Qty: true,
    Dist: true,
    Price: true,
    NetPrice: true,
    Amount: true,
  });
  const [editRowIndex, setEditRowIndex] = useState(null);

  const [newRow, setNewRow] = useState({
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
    remarks: useRef(null),
    cus_customercode: useRef(null),
    cus_customerdescription: useRef(null),
    cus_itemcode: useRef(null),
    cus_itemname: useRef(null),
    cus_qty: useRef(null),
    cus_brand: useRef(null),
    cus_unit: useRef(null),
    cus_mrp: useRef(null),
    cus_discount: useRef(null),
    cus_netprice: useRef(null),
    cus_image: useRef(null),
    cus_remarks: useRef(null),
  };

  /* ---------- Helpers ---------- */
  const calculateDiscount = (mrp, netPrice) => {
    const mrpValue = Number(mrp) || 0;
    const netValue = Number(netPrice) || 0;
    if (!mrpValue) return 0;
    return +(((mrpValue - netValue) / mrpValue) * 100).toFixed(2);
  };

  const calculateNetPrice = (mrp, discount) => {
    const mrpValue = Number(mrp) || 0;
    const discValue = Number(discount) || 0;
    return +(mrpValue * (1 - discValue / 100)).toFixed(2);
  };

  const calculateAmount = (qty, netPrice) => {
    const qtyValue = Number(qty) || 0;
    const netValue = Number(netPrice) || 0;
    return +(qtyValue * netValue).toFixed(2);
  };

  /* ---------- Effects ---------- */
  useEffect(() => {
    if (items.length > 0 && rows.length === 0) {
      setRows(
        items.map((item, index) => {
          const mrp = Number(item.mrp) || 0;
          const net = Number(item.netPrice) || 0;
          const discount = item.discount !== undefined
            ? Number(item.discount)
            : calculateDiscount(mrp, net);
          return {
            id: index + 1,
            customerCode: item.customerCode || "",
            customerDescription: item.customerDescription || "",
            itemCode: item.itemCode || "",
            itemName: item.itemName || "",
            brand: item.brand || "",
            qty: Number(item.qty) || 0,
            unit: item.unit || "Piece",
            mrp,
            discount,
            netPrice: net || calculateNetPrice(mrp, discount),
            amount: calculateAmount(item.qty, net || calculateNetPrice(mrp, discount)),
            image: item.image || "",
            remarks: item.remarks || "",
          };
        })
      );
    }
  }, [items, rows.length]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const updatedData = data.map((item) => ({
          ...item,
          unit: item.unit || "Piece",
          itemname: item.itemname,
          itemcode: item.itemcode || "",
          brand: item.brand || "",
          price: item.price || "",
          thumbnail: item.thumbnail || "",
        }));
        setProductList(updatedData);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  const totalAmount = rows.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0
  );

  useEffect(() => {
    if (onRowsChange) onRowsChange(rows);
    if (onTotalAmountChange) onTotalAmountChange(totalAmount);
  }, [rows, onRowsChange, onTotalAmountChange, totalAmount]);

  /* ---------- Handlers ---------- */
  const filterProducts = (field, value, products) =>
    products.filter((product) =>
      field === "itemCode"
        ? product.itemcode.toLowerCase().includes(value.toLowerCase())
        : product.itemname.toLowerCase().includes(value.toLowerCase())
    );

  const resetNewRow = () => {
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

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => {
      const next = { ...prev, [field]: value };
      const mrp = Number(next.mrp);
      const net = Number(next.netPrice);
      const disc = Number(next.discount);
      const qty = Number(next.qty);

      if (["mrp", "netPrice"].includes(field)) {
        next.discount = calculateDiscount(mrp, net);
        next.amount = calculateAmount(qty, net);
      }
      if (field === "discount") {
        const computedNet = calculateNetPrice(mrp, disc);
        next.netPrice = computedNet;
        next.amount = calculateAmount(qty, computedNet);
      }
      if (field === "qty") {
        next.amount = calculateAmount(qty, net);
      }
      return next;
    });
  };

  const handleAddRow = () => {
    const { itemCode, itemName, qty, mrp, netPrice, discount } = newRow;
    if (!itemCode || !itemName || !qty || !netPrice) {
      alert("Please fill in all required fields (Item Code, Item Name, Qty, Net Price).");
      return;
    }

    const parsedMrp = Number(mrp);
    const parsedNet = Number(netPrice);
    const parsedDisc = discount === "" ? calculateDiscount(parsedMrp, parsedNet) : Number(discount);
    const amount = calculateAmount(Number(qty), parsedNet);

    const payload = {
      ...newRow,
      mrp: parsedMrp,
      netPrice: parsedNet,
      discount: parsedDisc,
      amount,
      qty: Number(qty),
      unit: newRow.unit || "Piece",
    };

    if (editRowIndex !== null) {
      setRows((prev) =>
        prev.map((row, i) => (i === editRowIndex ? { ...row, ...payload } : row))
      );
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, { id: prev.length + 1, ...payload }]);
    }

    resetNewRow();
    setShowAddModal(false);
  };

  const submitCustomRowToDB = async (rowData) => {
    try {
      const result = { id: Date.now() }; // Mock response
      return result;
    } catch (error) {
      console.error("Error saving custom item:", error);
      alert("Failed to save custom item. Please try again.");
      return null;
    }
  };

  const handleSubmitCustomRow = async (rowData, editIndex) => {
    const qty = Number(rowData.cus_qty);
    const mrp = Number(rowData.cus_mrp);
    const net = Number(rowData.cus_netprice);
    const discount =
      rowData.cus_discount === ""
        ? calculateDiscount(mrp, net)
        : Number(rowData.cus_discount);
    const amount = calculateAmount(qty, net);

    const savedItem = await submitCustomRowToDB(rowData);
    if (!savedItem) return;

    const newRowData = {
      id: editIndex !== null ? rows[editIndex].id : rows.length + 1,
      customerCode: rowData.cus_customercode || "",
      customerDescription: rowData.cus_customerdescription || "",
      itemCode: rowData.cus_itemcode || "",
      itemName: rowData.cus_itemname || "",
      brand: rowData.cus_brand || "",
      qty,
      unit: rowData.cus_unit || "Piece",
      mrp,
      discount,
      netPrice: net,
      amount,
      image: rowData.cus_image || "",
      remarks: rowData.cus_remarks || "",
    };

    if (editIndex !== null) {
      setRows((prev) =>
        prev.map((row, i) => (i === editIndex ? newRowData : row))
      );
      setEditRowIndex(null);
    } else {
      setRows((prev) => [...prev, newRowData]);
    }
    resetNewRow();
    setShowCusAddModal(false);
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField && inputRefs[nextField]?.current) {
        inputRefs[nextField].current.focus();
      } else {
        if (showAddModal) handleAddRow();
        else if (showCusAddModal) handleSubmitCustomRow(newRow, editRowIndex);
      }
    }
  };

  const handleColumnVisibilityChange = (updatedColumns) => {
    setColumns(updatedColumns);
  };

  const handleEditRow = (index) => {
    const row = rows[index];
    setNewRow({
      ...newRow,
      customerCode: row.customerCode || "",
      customerDescription: row.customerDescription || "",
      itemCode: row.itemCode || "",
      itemName: row.itemName || "",
      brand: row.brand || "",
      qty: row.qty || "",
      unit: row.unit || "Piece",
      mrp: row.mrp || "",
      discount: row.discount || "",
      amount: row.amount || "",
      netPrice: row.netPrice || "",
      image: row.image || "",
      remarks: row.remarks || "",
      cus_customercode: row.customerCode || "",
      cus_customerdescription: row.customerDescription || "",
      cus_itemcode: row.itemCode || "",
      cus_itemname: row.itemName || "",
      cus_qty: row.qty || "",
      cus_brand: row.brand || "",
      cus_unit: row.unit || "Piece",
      cus_mrp: row.mrp || "",
      cus_discount: row.discount || "",
      cus_netprice: row.netPrice || "",
      cus_image: row.image || "",
      cus_remarks: row.remarks || "",
    });
    setEditRowIndex(index);
    setShowAddModal(true);
  };

  const handleEditCustomRow = (index) => {
    const row = rows[index];
    setNewRow({
      ...newRow,
      customerCode: row.customerCode || "",
      customerDescription: row.customerDescription || "",
      itemCode: row.itemCode || "",
      itemName: row.itemName || "",
      brand: row.brand || "",
      qty: row.qty || "",
      unit: row.unit || "Piece",
      mrp: row.mrp || "",
      discount: row.discount || "",
      amount: row.amount || "",
      netPrice: row.netPrice || "",
      image: row.image || "",
      remarks: row.remarks || "",
      cus_customercode: row.customerCode || "",
      cus_customerdescription: row.customerDescription || "",
      cus_itemcode: row.itemCode || "",
      cus_itemname: row.itemName || "",
      cus_qty: row.qty || "",
      cus_brand: row.brand || "",
      cus_unit: row.unit || "Piece",
      cus_mrp: row.mrp || "",
      cus_discount: row.discount || "",
      cus_netprice: row.netPrice || "",
      cus_image: row.image || "",
      cus_remarks: row.remarks || "",
    });
    setEditRowIndex(index);
    setShowCusAddModal(true);
  };

  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  /* ---------- JSX ---------- */
  return (
    <div>
      <ShowHideFilter
        className="no-print mb-3"
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
            {columns.NetPrice && <th>Net Price</th>}
            {columns.Amount && <th>Amount</th>}
            <td className="no-print">Actions</td>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              {columns.Image && (
                <td>
                  <img
                    src={row.image ? `${API_URL}${row.image}` : ""}
                    alt=""
                    className="product_img thumbnail"
                    style={{ maxHeight: "50px" }}
                    onError={(e) => (e.target.style.display = "none")}
                  />
                </td>
              )}
              {columns.customerCode && <td>{row.customerCode}</td>}
              {columns.customerDescription && <td>{row.customerDescription}</td>}
              {columns.ItemCode && <td>{row.itemCode}</td>}
              <td>
                <div>{row.itemName}</div>
                {row.remarks && (
                  <div
                    style={{
                      fontWeight: "bold",
                      color: "#6c757d",
                      fontSize: "0.9em",
                      marginTop: "0.25em",
                    }}
                  >
                    {row.remarks}
                  </div>
                )}
              </td>
              {columns.Brand && <td>{row.brand}</td>}
              <td>{row.unit}</td>
              {columns.MRP && <td>{row.mrp}</td>}
              {columns.Qty && <td>{row.qty}</td>}
              {columns.Dist && <td>{row.discount}</td>}
              {columns.NetPrice && <td>{row.netPrice}</td>}
              {columns.Amount && <td>{row.amount}</td>}
              <td className="no-print">
                <button
                  className="btn action_btn btn-warning me-2"
                  onClick={() => handleEditRow(index)}
                  aria-label="Edit"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  className="btn action_btn btn-info me-2"
                  onClick={() => handleEditCustomRow(index)}
                  aria-label="Edit Custom"
                >
                  <i className="fas fa-edit"></i> Custom
                </button>
                <button
                  className="btn action_btn btn-danger"
                  onClick={() => handleDeleteRow(index)}
                  aria-label="Delete"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
        products={productList}
        filterProducts={filterProducts}
      />

      <CustomAddModal
        showCusAddModal={showCusAddModal}
        setShowCusAddModal={setShowCusAddModal}
        newRow={newRow}
        setCustomNewRow={setNewRow}
        handleFieldChange={handleFieldChange}
        handleKeyDown={handleKeyDown}
        inputRefs={inputRefs}
        editRowIndex={editRowIndex}
        handleSubmitCustomRow={handleSubmitCustomRow}
      />

      <div className="mt-3 d-flex gap-2 no-print">
        <button
          className="btn btn-secondary w-100"
          onClick={() => setShowAddModal(true)}
          aria-label="Add New Row"
        >
          Add New Row
        </button>
        <button
          className="btn btn-secondary w-100"
          onClick={() => setShowCusAddModal(true)}
          aria-label="Custom Add Row"
        >
          Custom Add
        </button>
      </div>

    </div>
  );
};

QuotationTable.propTypes = {
  items: PropTypes.array,
  onTotalAmountChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onRowsChange: PropTypes.func,
};

export default QuotationTable;
