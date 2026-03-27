"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import AddSwitchQuotProductModal from "../components/AddSwitchQuotProductModal";

const SwitchQuotatTable = React.memo(
  ({ items = [], onTotalAmountChange, onRowsChange, qouteId }) => {
    // ================= STATE =================
    const [rows, setRows] = useState(items);
    const [isLoading, setIsLoading] = useState(!items.length && qouteId);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editRowIndex, setEditRowIndex] = useState(null);

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
      ItemCode: true,
      Brand: true,
      MRP: true,
      Qty: true,
      NetPrice: true,
      Amount: true,
    });

    // ================= MAP API DATA =================
const mapItemToRow = useCallback((item) => {
  console.log("RAW ITEM:", item); // 🔥 DEBUG

  return {
    id: item.id,
    sr_no: item.sr_no ?? "",
    brand: item.brand ?? "",
    category: item.category ?? "",
    color: item.color ?? "",
    description: item.description ?? "",

    // 🔥 FIX: check both keys
    item_name: item.item_name || item.itemName || "",
    itemcode: item.itemcode || item.item_code || "",

    // 🔥 FIX: don't force 0
    quantity:
      item.quantity !== undefined && item.quantity !== null
        ? Number(item.quantity)
        : "",

    mrp:
      item.mrp !== undefined && item.mrp !== null
        ? Number(item.mrp)
        : "",

    net_price:
      item.net_price !== undefined && item.net_price !== null
        ? Number(item.net_price)
        : "",

    amount:
      item.amount !== undefined && item.amount !== null
        ? Number(item.amount)
        : "",

    discount_percent: item.discount_percent ?? "",
    unit: item.unit ?? "pcs",
    remarks: item.remarks ?? "",
    image: item.image ?? null,
  };
}, []);

    // ================= FETCH FROM API =================
    useEffect(() => {
      if (!qouteId || items.length) return;

      const fetchQuotationItems = async () => {
        try {
          setIsLoading(true);

          const res = await fetch(
            `https://api.panvic.in/switch-quotations/${qouteId}`
          );

          if (!res.ok) throw new Error("Failed to fetch");

          const data = await res.json();

          console.log("API RESPONSE:", data);

          const mappedRows = (data.items || []).map(mapItemToRow);

          console.log("Mapped Rows:", mappedRows);

          setRows(mappedRows);
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchQuotationItems();
    }, [qouteId, items.length, mapItemToRow]);

    // ================= INPUT =================
    const handleFieldChange = useCallback((field, value) => {
      setNewRow((prev) => ({ ...prev, [field]: value }));
    }, []);

    const inputRefs = useRef({}).current;

    const handleKeyDown = useCallback((e, nextField) => {
      if (e.key === "Enter") {
        e.preventDefault();
        inputRefs[nextField]?.current?.focus();
      }
    }, []);

    // ================= ADD / EDIT =================
    const handleAddRow = useCallback(
      (updatedRow, passedEditRowIndex) => {
        const editIndex = passedEditRowIndex;

        if (
          updatedRow.itemcode?.toString().trim() === "" ||
          updatedRow.item_name?.toString().trim() === "" ||
          updatedRow.quantity === "" ||
          updatedRow.net_price === ""
        ) {
          alert("Please fill required fields");
          return;
        }

        if (editIndex !== null) {
          // ✅ MERGE with existing row (VERY IMPORTANT)
          setRows((prev) =>
            prev.map((row, i) => {
              if (i !== editIndex) return row;

              return {
                ...row, // 👈 keep old data
                ...updatedRow, // 👈 overwrite only changed fields

                quantity:
                  updatedRow.quantity !== ""
                    ? Number(updatedRow.quantity)
                    : row.quantity,

                mrp: updatedRow.mrp !== "" ? Number(updatedRow.mrp) : row.mrp,

                discount_percent:
                  updatedRow.discount_percent !== ""
                    ? Number(updatedRow.discount_percent)
                    : row.discount_percent,

                net_price:
                  updatedRow.net_price !== ""
                    ? Number(updatedRow.net_price)
                    : row.net_price,

                amount:
                  updatedRow.amount !== ""
                    ? Number(updatedRow.amount)
                    : row.amount,
              };
            })
          );
        } else {
          // ✅ ADD NEW
          setRows((prev) => [
            ...prev,
            {
              ...updatedRow,
              id: Date.now(),
              sr_no: prev.length + 1,
              quantity: Number(updatedRow.quantity) || 0,
              mrp: Number(updatedRow.mrp) || 0,
              discount_percent: Number(updatedRow.discount_percent) || 0,
              net_price: Number(updatedRow.net_price) || 0,
              amount: Number(updatedRow.amount) || 0,
              unit: updatedRow.unit || "pcs",
              remarks: updatedRow.remarks || "N/A",
            },
          ]);
        }

        setShowAddModal(false);
        setNewRow(emptyRow);
        setEditRowIndex(null);
      },
      [emptyRow]
    );

    // ================= DELETE =================
    const handleDeleteRow = useCallback((index) => {
      const confirmDelete = window.confirm("Delete this item?");
      if (!confirmDelete) return;

      setRows((prev) => prev.filter((_, i) => i !== index));
    }, []);

    // ================= EDIT =================
    const handleEditRow = useCallback(
      (index) => {
        setNewRow({ ...rows[index] });
        setEditRowIndex(index);
        setShowAddModal(true);
      },
      [rows]
    );

    // ================= TOTAL =================
    useEffect(() => {
      const total = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
      setTotalAmount(total);
      onTotalAmountChange?.(total);
    }, [rows, onTotalAmountChange]);

    // ================= SYNC TO PARENT =================
    useEffect(() => {
      onRowsChange?.(rows);
    }, [rows, onRowsChange]);

    // ================= UI =================
    if (isLoading) return <div>Loading...</div>;

    return (
      <div>
        <ShowHideFilter columns={columns} onChange={setColumns} />

        <button
          className="btn btn-primary mb-3"
          onClick={() => {
            setNewRow(emptyRow);
            setEditRowIndex(null);
            setShowAddModal(true);
          }}
        >
          + Add Item
        </button>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>SR</th>
                {columns.ItemCode && <th>Code</th>}
                <th>Name</th>
                {columns.Brand && <th>Brand</th>}
                <th>Unit</th>
                {columns.MRP && <th>MRP</th>}
                <th>Qty</th>
                {columns.NetPrice && <th>Net</th>}
                {columns.Amount && <th>Amount</th>}
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => (
                <tr key={row.id}>
                  <td>{row.sr_no || i + 1}</td>
                  {columns.ItemCode && <td>{row.itemcode}</td>}
                  <td>{row.item_name}</td>
                  {columns.Brand && <td>{row.brand}</td>}
                  <td>{row.unit}</td>
                  {columns.MRP && <td>{row.mrp}</td>}
                  <td>{row.quantity}</td>
                  <td>{Number(row.net_price).toFixed(2)}</td>
                  <td>{Number(row.amount).toFixed(2)}</td>

                  <td>
                    <button onClick={() => handleEditRow(i)}>✏️</button>
                    <button onClick={() => handleDeleteRow(i)}>🗑️</button>
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
