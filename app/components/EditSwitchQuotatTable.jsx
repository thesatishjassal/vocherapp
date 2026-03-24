"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import AddSwitchQuotProductModal from "../components/AddSwitchQuotProductModal";
import axios from "axios";

const SwitchQuotatTable = React.memo(
  ({
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const emptyRow = {
      brand: "",
      category: "",
      color: "",
      description: "",
      discount_percent: "",
      id: null,
      image: null,
      item_name: "",
      itemcode: "",
      mrp: "",
      net_price: "",
      quantity: "",
      remarks: "",
      sr_no: "",
      unit: "",
      amount: "",
    };

    const [newRow, setNewRow] = useState(emptyRow);
    const [totalAmount, setTotalAmount] = useState(0);
    const [columns, setColumns] = useState({
      Image: true,
      ItemCode: true,
      Brand: true,
      MRP: true,
      Qty: true,
      Dist: false,
      NetPrice: true,
      Amount: true,
    });
    const [editRowIndex, setEditRowIndex] = useState(null);

    // Map API item (snake_case) to frontend row
    const mapItemToRow = useCallback((item) => ({
      id: item.id,
      sr_no: item.sr_no || "",
      brand: item.brand || "",
      category: item.category || "",
      color: item.color || "",
      description: item.description || "",
      discount_percent: Number(item.discount_percent) || 0,
      image: item.image || null,
      item_name: item.item_name || "",
      itemcode: item.itemcode || "",
      mrp: item.mrp || "",
      net_price: Number(item.net_price) || 0,
      quantity: item.quantity || "",
      remarks: item.remarks || "",
      unit: item.unit || "",
      amount: Number(item.amount) || 0,
    }), []);

    // Input refs (updated to new field names)
    const inputRefs = useRef({
      itemcode: useRef(null),
      item_name: useRef(null),
      brand: useRef(null),
      category: useRef(null),
      color: useRef(null),
      description: useRef(null),
      quantity: useRef(null),
      unit: useRef(null),
      mrp: useRef(null),
      discount_percent: useRef(null),
      net_price: useRef(null),
      amount: useRef(null),
      image: useRef(null),
      remarks: useRef(null),
    }).current;

    // Debug re-renders
    useEffect(() => {
      console.log("QuotatTable re-rendered", {
        qouteId,
        itemsLength: items.length,
      });
    }, [qouteId, items.length]);

    // Fetch quotation items
    useEffect(() => {
      if (!qouteId || items.length) return;
      const fetchQuotationItems = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(
            `${API_URL}/switch-quotations/${qouteId}/`
          );
          if (!response.ok) throw new Error("Failed to fetch quotation items");
          const data = await response.json();
          console.log("Fetched quotation items:", data.items);
          const mappedRows = data.items.map(mapItemToRow);
          setRows(mappedRows);
        } catch (err) {
          console.error("Error fetching quotation items:", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchQuotationItems();
    }, [qouteId, items.length, mapItemToRow]);

    // Utility functions
    const calculateNetPrice = useCallback((mrp, discount_percent) => {
      const mrpNum = Number(mrp) || 0;
      const discountNum = Number(discount_percent) || 0;
      return mrpNum * (1 - discountNum / 100);
    }, []);

    const calculateAmount = useCallback((qty, net_price) => {
      const qtyNum = Number(qty) || 0;
      const netPriceNum = Number(net_price) || 0;
      return qtyNum * netPriceNum;
    }, []);

    // Handle field changes (simplified, calculations handled in modal)
    const handleFieldChange = useCallback((field, value) => {
      setNewRow((prev) => ({ ...prev, [field]: value }));
    }, []);

    // Handle key down for navigation
    const handleKeyDown = useCallback(
      (e, nextField = null) => {
        if (e.key === "Enter") {
          e.preventDefault();
          if (nextField && inputRefs[nextField]?.current) {
            inputRefs[nextField].current.focus();
          }
        }
      },
      [inputRefs]
    );

    // Handle add/edit row via modal
    const handleAddRow = useCallback(
      async (updatedRow, passedEditRowIndex) => {
        const editRowIndexLocal = passedEditRowIndex;

        if (!qouteId) {
          alert("Invalid quotation ID");
          return;
        }

        const {
          itemcode,
          item_name,
          quantity,
          mrp,
          discount_percent,
          net_price,
          amount,
          brand,
          unit,
          image,
          remarks,
          category,
          color,
          description,
        } = updatedRow;

        if (!itemcode || !item_name || !quantity || !net_price) {
          alert("Please fill all required fields.");
          return;
        }

        try {
          const newItem = {
            itemcode,
            item_name,
            brand,
            category,
            color,
            description,
            quantity: Number(quantity),
            unit: unit || "pcs",
            mrp: Number(mrp) || 0,
            discount_percent: Number(discount_percent) || 0,
            net_price: Number(net_price),
            amount: Number(amount),
            image: image || null,
            remarks: remarks || "N/A",
          };

          let response;
          let itemId = null;

          // =============================
          // 🔥 UPDATE ITEM
          // =============================
          if (editRowIndexLocal !== null) {
            itemId = rows[editRowIndexLocal].id;
            response = await axios.put(
              `${API_URL}/switch-quotations/${qouteId}/items/${itemId}/`,
              newItem,
              { withCredentials: true }
            );
          }
          // =============================
          // 🔥 ADD NEW ITEM
          // =============================
          else {
            response = await axios.post(
              `${API_URL}/quotation/${qouteId}/items/`,
              newItem,
              { withCredentials: true }
            );
          }

          const createdItem = response.data;
          const mappedRow = mapItemToRow(createdItem);

          if (itemId !== null) {
            setRows((prevRows) =>
              prevRows.map((row) => (row.id === itemId ? mappedRow : row))
            );
          } else {
            setRows((prevRows) => [...prevRows, mappedRow]);
          }

          setShowAddModal(false);
          setNewRow(emptyRow);
          setEditRowIndex(null);
        } catch (error) {
          console.error(
            "Error saving item:",
            error.response?.data || error.message
          );
          alert("Failed to save item.");
        }
      },
      [qouteId, rows, emptyRow, mapItemToRow]
    );

    // Handle edit row
    const handleEditRow = useCallback(
      (index) => {
        const rowData = rows[index];
        setNewRow({ ...rowData });
        setEditRowIndex(index);
        setShowAddModal(true);
      },
      [rows]
    );

    // Handle delete row
    const handleDeleteRow = useCallback(
      async (index) => {
        const row = rows[index];
        const confirmDelete = window.confirm(
          `Are you sure you want to delete "${row.item_name}"? This action cannot be undone.`
        );
        if (!confirmDelete) return;

        const itemId = row.id;
        const amountToSubtract = row.amount;
        try {
          await axios.delete(
            `${API_URL}/quotation/${qouteId}/items/${itemId}/`,
            {
              withCredentials: true,
            }
          );
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
      const updatedTotal = rows.reduce(
        (sum, row) => sum + Number(row.amount),
        0
      );
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
                  <td>{row.sr_no || index + 1}</td>

                  {columns.ItemCode && <td>{row.itemcode}</td>}

                  <td>{row.item_name}</td>

                  {columns.Brand && <td>{row.brand}</td>}
                  <td>{row.unit}</td>

                  {columns.MRP && <td>{row.mrp}</td>}
                  {columns.Qty && <td>{row.quantity}</td>}
                  {columns.Dist && <td>{row.discount_percent}</td>}
                  {columns.NetPrice && <td>{Number(row.net_price)?.toFixed(2)}</td>}
                  {columns.Amount && <td>{Number(row.amount)?.toFixed(2)}</td>}
                  <td className="no-print">
                    <button
                      className="btn action_btn btn-warning me-1"
                      onClick={() => handleEditRow(index)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="btn action_btn btn-danger"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <AddSwitchQuotProductModal
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
  }
);

export default SwitchQuotatTable;