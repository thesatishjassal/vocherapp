"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import axios from "axios";

// Custom debounce hook (stays unchanged)
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  const debouncedCallback = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  return debouncedCallback;
};

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
    netPrice: 0,
    price: 0,
    amount: 0,
    image: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [columns, setColumns] = useState({
    customerCode: true,
    customerDescription: true,
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
  const [editRow, setEditRow] = useState(null);

  // Input refs
  // const inputRefs = useMemo(
  //   () => ({
  //     customerCode: useRef(null),
  //     customerDescription: useRef(null),
  //     itemCode: useRef(null),
  //     itemName: useRef(null),
  //     brand: useRef(null),
  //     qty: useRef(null),
  //     unit: useRef(null),
  //     mrp: useRef(null),
  //     discount: useRef(null),
  //     image: useRef(null),
  //     aans: useRef(null),
  //   }),
  //   []
  // );
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

  // Debounced handlers
  const debouncedHandleFieldChange = useDebounce((field, value) => {
    setNewRow((prev) => {
      const updatedRow = { ...prev, [field]: value };
      if (field === "mrp" || field === "discount") {
        updatedRow.netPrice = calculateNetPrice(
          field === "mrp" ? value : prev.mrp,
          field === "discount" ? value : prev.discount
        );
        updatedRow.price = updatedRow.netPrice;
        updatedRow.amount = calculateAmount(prev.qty, updatedRow.netPrice);
      } else if (field === "qty") {
        updatedRow.amount = calculateAmount(value, prev.netPrice);
      }
      return updatedRow;
    });
  }, 100);

  const debouncedHandleEditFieldChange = useDebounce((field, value) => {
    setEditRow((prev) => {
      const updatedRow = { ...prev, [field]: value };
      if (field === "mrp" || field === "discount") {
        updatedRow.netPrice = calculateNetPrice(
          field === "mrp" ? value : prev.mrp,
          field === "discount" ? value : prev.discount
        );
        updatedRow.price = updatedRow.netPrice;
        updatedRow.amount = calculateAmount(prev.qty, updatedRow.netPrice);
      } else if (field === "qty") {
        updatedRow.amount = calculateAmount(value, prev.netPrice);
      }
      return updatedRow;
    });
  }, 100);

  // Add new row
  const handleAddRow = useCallback(() => {
    const { qty, mrp, discount, itemCode, itemName } = newRow;
    if (itemCode && itemName && qty && mrp) {
      const netPrice = calculateNetPrice(mrp, discount);
      const amount = calculateAmount(qty, netPrice);
      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length + 1,
          ...newRow,
          netPrice,
          price: netPrice,
          amount,
        },
      ]);
      setTotalAmount((prevTotal) => {
        const updatedTotal = prevTotal + amount;
        onTotalAmountChange?.(updatedTotal);
        return updatedTotal;
      });
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
        netPrice: 0,
        price: 0,
        amount: 0,
        image: "",

      });
      inputRefs.customerCode.current?.focus();
    } else {
      alert("Please fill in all required fields.");
    }
  }, [newRow, calculateNetPrice, calculateAmount, onTotalAmountChange, inputRefs.customerCode]);

  // Handle key down for input navigation
  const handleKeyDown = useCallback(
    (e, nextField) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (nextField && inputRefs[nextField]?.current) {
          inputRefs[nextField].current.focus();
        } else {
          handleAddRow();
        }
      }
    },
    [handleAddRow, inputRefs]
  );

  // Column visibility change
  const handleColumnVisibilityChange = useCallback((updatedColumns) => {
    setColumns(updatedColumns);
  }, []);

  // Edit row
  const handleEditRow = useCallback(
    (index) => {
      setEditRow({ ...rows[index] });
      setEditRowIndex(index);
    },
    [rows]
  );

  // Save edited row
  const handleSaveRow = useCallback(async () => {
    if (editRow?.itemCode && editRow.itemName && editRow.qty && editRow.mrp) {
      try {
      const calculatedAmount =
          Number(editRow.qty || 0) * Number(editRow.netPrice || 0);
          
        const response = await axios.put(
          `https://api.panvic.in/quotation/${qouteId}/items/${editRow.id}`,
          {
            product_id: editRow.itemCode || "",
            customercode: editRow.customerCode || "",
            customerdescription: editRow.customerDescription || "",
            itemcode: editRow.itemCode || "",
            item_name: editRow.itemName || "",
            brand: editRow.brand || "",
            quantity: Number(editRow.qty) || 0,
            unit: editRow.unit || "",
            mrp: Number(editRow.mrp) || 0,
            discount: Number(editRow.discount) || 0,
            netPrice: Number(editRow.netPrice) || 0,
            price: calculatedAmount,                // ✅ send total amount
            amount: calculatedAmount,               // ✅ same as price
            image: editRow.image || "",
          },
          { withCredentials: true }
        );
        const updatedItem = response.data;
        const updatedRow = {
          id: updatedItem.id || editRow.id,
          customerCode: updatedItem.customercode || editRow.customerCode || "",
          customerDescription: updatedItem.customerdescription || editRow.customerDescription || "",
          itemCode: updatedItem.itemcode || editRow.itemCode || "",
          itemName: updatedItem.item_name || editRow.itemName || "",
          brand: updatedItem.brand || editRow.brand || "",
          qty: updatedItem.quantity || editRow.qty || "",
          unit: updatedItem.unit || editRow.unit || "",
          mrp: updatedItem.mrp || editRow.mrp || "",
          discount: updatedItem.discount || editRow.discount || "",
          netPrice: updatedItem.netPrice || editRow.netPrice || 0,
          price: updatedItem.netPrice || editRow.netPrice || 0,
          amount: updatedItem.price || editRow.amount || 0,
          image: updatedItem.image || editRow.image || "",
        };
        setRows((prevRows) =>
          prevRows.map((row, index) => (index === editRowIndex ? updatedRow : row))
        );
        setEditRowIndex(null);
        setEditRow(null);
      } catch (error) {
        console.error("Error updating item:", error);
        alert("Failed to update item. Please try again.");
      }
    } else {
      alert("Please fill in all required fields.");
    }
  }, [editRow, editRowIndex, qouteId]);

  // Cancel edit
  const handleCancelEdit = useCallback(() => {
    setEditRowIndex(null);
    setEditRow(null);
  }, []);

  // Delete row
  const handleDeleteRow = useCallback(
    async (index) => {
      const row = rows[index];
      const itemId = row.id;
      const amountToSubtract = row.amount;
      try {
        await axios.delete(`https://api.panvic.in/quotation/${qouteId}/items/${itemId}`, {
          withCredentials: true,
        });
        setRows((prevRows) => prevRows.filter((_, i) => i !== index));
        setTotalAmount((prevTotal) => {
          const updatedTotal = prevTotal - amountToSubtract;
          onTotalAmountChange?.(updatedTotal);
          return updatedTotal;
        });
      } catch (error) {
        console.error("Error deleting item:", error);
        alert("Failed to delete item. Please try again.");
      }
    },
    [rows, qouteId, onTotalAmountChange]
  );

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
      <div className="table-responsive">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
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
    
              <th className="no-print">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                {columns.Image && (
                  <td>
                    {row.image && (
                      <img
                        src={`https://api.panvic.in${row.image}`}
                        alt={row.itemName}
                        className="product_img"
                      />
                    )}
                  </td>
                )}
                {columns.customerCode && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow?.customerCode || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("customerCode", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.customerCode || "-"
                    )}
                  </td>
                )}
                {columns.customerDescription && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow?.customerDescription || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("customerDescription", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.customerDescription || "-"
                    )}
                  </td>
                )}
                {columns.ItemCode && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow?.itemCode || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("itemCode", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.itemCode || "-"
                    )}
                  </td>
                )}
                <td>
                  {editRowIndex === index ? (
                    <input
                      type="text"
                      value={editRow?.itemName || ""}
                      onChange={(e) =>
                        debouncedHandleEditFieldChange("itemName", e.target.value)
                      }
                      className="form-control"
                    />
                  ) : (
                    row.itemName || "-"
                  )}
                </td>
                {columns.Brand && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow?.brand || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("brand", e.target.value)
                        }
                        className="form-control"
                      />
                    ) : (
                      row.brand || "-"
                    )}
                  </td>
                )}
                <td>
                  {editRowIndex === index ? (
                    <input
                      type="text"
                      value={editRow?.unit || ""}
                      onChange={(e) =>
                        debouncedHandleEditFieldChange("unit", e.target.value)
                      }
                      className="form-control input-small"
                    />
                  ) : (
                    row.unit || "-"
                  )}
                </td>
                {columns.MRP && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="number"
                        value={editRow?.mrp || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("mrp", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.mrp || "-"
                    )}
                  </td>
                )}
                {columns.Qty && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="number"
                        value={editRow?.qty || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("qty", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.qty || "-"
                    )}
                  </td>
                )}
                {columns.Dist && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="number"
                        value={editRow?.discount || ""}
                        onChange={(e) =>
                          debouncedHandleEditFieldChange("discount", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.discount || "-"
                    )}
                  </td>
                )}
                {columns.NetPrice && (
                  <td>
                    {(editRowIndex === index ? editRow?.netPrice : row.netPrice)?.toFixed(2) || "0.00"}
                  </td>
                )}
                {columns.Amount && (
                  <td>
                    {(editRowIndex === index ? editRow?.amount : row.amount)?.toFixed(2) || "0.00"}
                  </td>
                )}
       
                <td className="no-print">
                  {editRowIndex === index ? (
                    <>
                      <button
                        className="btn action_btn btn-success"
                        onClick={handleSaveRow}
                      >
                        <i className="fas fa-save"></i>
                      </button>
                      <button
                        className="btn action_btn btn-secondary ml-2"
                        onClick={handleCancelEdit}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn action_btn btn-warning"
                        onClick={() => handleEditRow(index)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn action_btn btn-danger ml-2"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            <tr className="no-print">
              <td>#</td>
              {columns.Image && (
                <td>
                  {newRow.image && (
                    <img src={newRow.image} alt="New item" className="product_img" />
                  )}
                </td>
              )}
              {columns.customerCode && (
                <td>
                  <input
                    type="text"
                    name="customerCode"
                    value={newRow.customerCode}
                    onChange={(e) => debouncedHandleFieldChange("customerCode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "customerDescription")}
                    placeholder="Cust Code"
                    className="form-control input-small"
                    ref={inputRefs.customerCode}
                  />
                </td>
              )}
              {columns.customerDescription && (
                <td>
                  <input
                    type="text"
                    name="customerDescription"
                    value={newRow.customerDescription}
                    onChange={(e) => debouncedHandleFieldChange("customerDescription", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "itemCode")}
                    placeholder="Cust Desc"
                    className="form-control input-small"
                    ref={inputRefs.customerDescription}
                  />
                </td>
              )}
              {columns.ItemCode && (
                <td>
                  <input
                    type="text"
                    name="itemCode"
                    value={newRow.itemCode}
                    onChange={(e) => debouncedHandleFieldChange("itemCode", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "itemName")}
                    placeholder="Item code"
                    className="form-control input-small"
                    ref={inputRefs.itemCode}
                  />
                </td>
              )}
              <td>
                <input
                  type="text"
                  name="itemName"
                  value={newRow.itemName}
                  onChange={(e) => debouncedHandleFieldChange("itemName", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "brand")}
                  placeholder="Item name"
                  className="form-control"
                  ref={inputRefs.itemName}
                />
              </td>
              {columns.Brand && (
                <td>
                  <input
                    type="text"
                    name="brand"
                    value={newRow.brand}
                    onChange={(e) => debouncedHandleFieldChange("brand", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "unit")}
                    placeholder="Brand"
                    className="form-control"
                    ref={inputRefs.brand}
                  />
                </td>
              )}
              <td>
                <input
                  type="text"
                  name="unit"
                  value={newRow.unit}
                  onChange={(e) => debouncedHandleFieldChange("unit", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "mrp")}
                  placeholder="Unit"
                  className="form-control input-small"
                  ref={inputRefs.unit}
                />
              </td>
              {columns.MRP && (
                <td>
                  <input
                    type="number"
                    name="mrp"
                    value={newRow.mrp}
                    onChange={(e) => debouncedHandleFieldChange("mrp", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "qty")}
                    placeholder="MRP"
                    className="form-control input-small"
                    ref={inputRefs.mrp}
                  />
                </td>
              )}
              {columns.Qty && (
                <td>
                  <input
                    type="number"
                    name="qty"
                    value={newRow.qty}
                    onChange={(e) => debouncedHandleFieldChange("qty", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, "discount")}
                    placeholder="Qty"
                    className="form-control input-small"
                    ref={inputRefs.qty}
                  />
                </td>
              )}
              {columns.Dist && (
                <td>
                  <input
                    type="number"
                    name="discount"
                    value={newRow.discount}
                    onChange={(e) => debouncedHandleFieldChange("discount", e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e)}
                    placeholder="Discount (%)"
                    className="form-control input-small"
                    ref={inputRefs.discount}
                  />
                </td>
              )}
              {columns.NetPrice && (
                <td>
                  <input
                    type="number"
                    name="netPrice"
                    value={newRow.netPrice.toFixed(2)}
                    readOnly
                    placeholder="Net Price"
                    className="form-control input-small"
                  />
                </td>
              )}
              {columns.Amount && (
                <td>
                  <input
                    type="number"
                    name="amount"
                    value={newRow.amount.toFixed(2)}
                    readOnly
                    placeholder="Amount"
                    className="form-control input-small"
                  />
                </td>
              )}
              
              <td className="no-print">
                <button className="btn action_btn btn-primary" onClick={handleAddRow}>
                  <i className="fas fa-plus"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default QuotatTable;
