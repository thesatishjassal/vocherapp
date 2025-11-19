"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import AddQuotProductModal from "../components/AddQuotProductModal";
import axios from "axios";

const QuotatTable = React.memo(({
  items = [],
  onTotalAmountChange,
  ShowHideFiltercolModal,
  onClose,
  onRowsChange,
  qouteId,
}) => {
  // States
  const [rows, setRows] = useState(items);
  const [isLoading, setIsLoading] = useState(!items.length && qouteId);
  const [filterColModal, setFilterColModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
    const emptyRow = {
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
  };

  const [newRow, setNewRow] = useState(emptyRow);
  const [totalAmount, setTotalAmount] = useState(0);
  const [columns, setColumns] = useState({
    customerCode: false,
    customerDescription: false,
    Image: true,
    ItemCode: true,
    Brand: true,
    MRP: true,
    Qty: true,
    Dist: true,
    NetPrice: true,
    Amount: true,
  });
  const [editRowIndex, setEditRowIndex] = useState(null);


  // Input refs
  const inputRefs = useRef({
    customerCode: useRef(null),
    customerDescription: useRef(null),
    itemCode: useRef(null),
    itemName: useRef(null),
    brand: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    mrp: useRef(null),
    discount: useRef(null),
    netPrice: useRef(null),
    amount: useRef(null),
    image: useRef(null),
    remarks: useRef(null),
  }).current;

  // Debug re-renders
  useEffect(() => {
    console.log("QuotatTable re-rendered", { qouteId, itemsLength: items.length });
  }, [qouteId, items.length]);

  // Fetch quotation items
  useEffect(() => {
    if (!qouteId || items.length) return;
    const fetchQuotationItems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://api.panvic.in/quotation/${qouteId}/items/`);
        if (!response.ok) throw new Error("Failed to fetch quotation items");
        const data = await response.json();
        const mappedRows = data.map((item, index) => {
          const netPrice =
            item.netPrice ||
            (Number(item.mrp) * (1 - Number(item.discount || 0) / 100)) ||
            0;
          return {
            id: item.id || index + 1,
            customerCode: item.customercode || "",
            customerDescription: item.customerdescription || "",
            itemCode: item.itemcode || "",
            itemName: item.item_name || "",
            brand: item.brand || "",
            qty: item.quantity || "",
            unit: item.unit || "",
            mrp: item.mrp || "",
            discount: item.discount || "",
            netPrice,
            price: netPrice,
            amount: item.price || Number(item.quantity) * netPrice || 0,
            image: item.image || "",
          };
        });
        setRows(mappedRows);
      } catch (err) {
        console.error("Error fetching quotation items:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuotationItems();
  }, [qouteId, items.length]);

  // Utility functions
  const calculateNetPrice = useCallback((mrp, discount) => {
    const mrpNum = Number(mrp) || 0;
    const discountNum = Number(discount) || 0;
    return mrpNum * (1 - discountNum / 100);
  }, []);

  const calculateAmount = useCallback((qty, netPrice) => {
    const qtyNum = Number(qty) || 0;
    const netPriceNum = Number(netPrice) || 0;
    return qtyNum * netPriceNum;
  }, []);

  // Handle field changes (simplified, calculations handled in modal)
  const handleFieldChange = useCallback((field, value) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Handle key down for navigation
  const handleKeyDown = useCallback((e, nextField = null) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField && inputRefs[nextField]?.current) {
        inputRefs[nextField].current.focus();
      }
    }
  }, [inputRefs]);

  // Handle add/edit row via modal
  const handleAddRow = useCallback(async (updatedRow, passedEditRowIndex) => {
    const editRowIndex = passedEditRowIndex;
    if (!qouteId) {
      alert("Invalid quotation ID");
      return;
    }
    const { itemCode, itemName, qty, mrp, discount, netPrice, amount, customerCode, customerDescription, brand, unit, image, remarks } = updatedRow;
    if (!itemCode || !itemName || !qty || !netPrice) {
      alert("Please fill all required fields (Item Code, Item Name, Quantity, Net Price).");
      return;
    }
    try {
      const newItem = {
        product_id: itemCode,
        customercode: customerCode,
        customerdescription: customerDescription,
        itemcode: itemCode,
        item_name: itemName,
        brand,
        quantity: Number(qty),
        unit: unit || "Piece",
        mrp: Number(mrp) || 0,
        discount: Number(discount) || 0,
        netPrice: Number(netPrice),
        price: Number(netPrice),
        amount: Number(amount),
        image: image || "",
        remarks: remarks || null,
        amount_including_gst: null,
        without_gst: null,
        gst_amount: null,
        amount_with_gst: null,
        cct: null,
        beamangle: null,
        cri: null,
        cutoutdia: null,
        lumens: null,
      };
      let response;
      let createdItem;
      let mappedRow;
      if (editRowIndex !== null) {
        const itemId = rows[editRowIndex].id;
        response = await axios.put(
          `https://api.panvic.in/quotation/${qouteId}/items/${itemId}/`,
          newItem,
          { withCredentials: true }
        );
        createdItem = response.data;
        mappedRow = {
          id: createdItem.item_id || rows[editRowIndex].id,
          customerCode: createdItem.customercode || customerCode,
          customerDescription: createdItem.customerdescription || customerDescription,
          itemCode: createdItem.itemcode || itemCode,
          itemName: createdItem.item_name || itemName,
          brand: createdItem.brand || brand,
          qty: createdItem.quantity || qty,
          unit: createdItem.unit || unit,
          mrp: createdItem.mrp || mrp,
          discount: createdItem.discount || discount,
          netPrice: createdItem.netPrice || Number(netPrice),
          price: createdItem.price || Number(netPrice),
          amount: createdItem.amount || Number(amount),
          image: createdItem.image || image,
        };
        setRows((prevRows) =>
          prevRows.map((row, index) => (index === editRowIndex ? mappedRow : row))
        );
      } else {
        response = await axios.post(
          `https://api.panvic.in/quotation/${qouteId}/items/`,
          newItem,
          { withCredentials: true }
        );
        createdItem = response.data;
        mappedRow = {
          id: createdItem.item_id || rows.length + 1,
          customerCode: createdItem.customercode || customerCode,
          customerDescription: createdItem.customerdescription || customerDescription,
          itemCode: createdItem.itemcode || itemCode,
          itemName: createdItem.item_name || itemName,
          brand: createdItem.brand || brand,
          qty: createdItem.quantity || qty,
          unit: createdItem.unit || unit,
          mrp: createdItem.mrp || mrp,
          discount: createdItem.discount || discount,
          netPrice: createdItem.netPrice || Number(netPrice),
          price: createdItem.price || Number(netPrice),
          amount: createdItem.amount || Number(amount),
          image: createdItem.image || image,
        };
        setRows((prevRows) => [...prevRows, mappedRow]);
      }
      setShowAddModal(false);
      setNewRow(emptyRow);
      setEditRowIndex(null);
    } catch (error) {
      console.error("Error saving item:", error.response?.data || error.message);
      alert(`Failed to ${editRowIndex !== null ? "update" : "add"} item: ${error.response?.data?.detail || "Please try again."}`);
    }
  }, [qouteId, rows, emptyRow]);

  // Handle edit row
  const handleEditRow = useCallback(
    (index) => {
      const rowData = rows[index];
      const cusFields = {
        cus_itemcode: "",
        cus_itemname: "",
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
      };
      setNewRow({ ...rowData, ...cusFields });
      setEditRowIndex(index);
      setShowAddModal(true);
    },
    [rows]
  );

  // Handle delete row
  const handleDeleteRow = useCallback(
    async (index) => {
      const row = rows[index];
      const confirmDelete = window.confirm(`Are you sure you want to delete "${row.itemName}"? This action cannot be undone.`);
      if (!confirmDelete) return;

      const itemId = row.id;
      const amountToSubtract = row.amount;
      try {
        await axios.delete(`https://api.panvic.in/quotation/${qouteId}/items/${itemId}/`, {
          withCredentials: true,
        });
        setRows((prevRows) => prevRows.filter((_, i) => i !== index));
        setTotalAmount((prevTotal) => {
          const updatedTotal = prevTotal - amountToSubtract;
          onTotalAmountChange?.(updatedTotal);
          return updatedTotal;
        });
        alert("Item deleted successfully!");
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    },
    [rows, qouteId, onTotalAmountChange]
  );

  // Handle column visibility change
  const handleColumnVisibilityChange = useCallback((updatedColumns) => {
    setColumns(updatedColumns);
  }, []);

  // Update total amount
  useEffect(() => {
    const updatedTotal = rows.reduce((sum, row) => sum + Number(row.amount), 0);
    setTotalAmount(updatedTotal);
    onTotalAmountChange?.(updatedTotal);
  }, [rows, onTotalAmountChange]);

  // Sync rows with parent
  useEffect(() => {
    onRowsChange?.(rows);
  }, [rows, onRowsChange]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ShowHideFilter
        className="no-print"
        columns={columns}
        onChange={handleColumnVisibilityChange}
      />
      <div className="no-print mb-3">
        <button 
          className="btn btn-primary"
          onClick={() => {
            setNewRow(emptyRow);
            setEditRowIndex(null);
            setShowAddModal(true);
          }}
        >
          <i className="fas fa-plus me-2"></i>Add New Item
        </button>
      </div>
      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead>
            <tr>
              <th>SR NO</th>
              {columns.ItemCode && <th>Item Code</th>}
              <th>Item Name</th>
              {columns.Brand && <th>Brand</th>}
              <th>Unit</th>
              {columns.MRP && <th>MRP</th>}
              {columns.Qty && <th>Qty</th>}
              {columns.Dist && <th>Dist (%)</th>}
              {columns.NetPrice && <th>Net Price</th>}
              {columns.Amount && <th>Amount</th>}
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                {columns.customerCode && (
                  <td>{row.customerCode || "-"}</td>
                )}
                {columns.customerDescription && (
                  <td>{row.customerDescription || "-"}</td>
                )}
                {columns.ItemCode && (
                  <td>{row.itemCode || "-"}</td>
                )}
                <td>{row.itemName || "-"}</td>
                {columns.Brand && (
                  <td>{row.brand || "-"}</td>
                )}
                <td>{row.unit || "-"}</td>
                {columns.MRP && (
                  <td>{row.mrp || "-"}</td>
                )}
                {columns.Qty && (
                  <td>{row.qty || "-"}</td>
                )}
                {columns.Dist && (
                  <td>{row.discount || "-"}</td>
                )}
                {columns.NetPrice && (
                  <td>{row.netPrice?.toFixed(2) || "0.00"}</td>
                )}
                {columns.Amount && (
                  <td>{row.amount?.toFixed(2) || "0.00"}</td>
                )}
                <td className="no-print">
                  <button className="btn action_btn btn-warning me-1" onClick={() => handleEditRow(index)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn action_btn btn-danger" onClick={() => handleDeleteRow(index)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AddQuotProductModal
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
  );
});

export default QuotatTable;