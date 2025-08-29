import React, { useState, useRef, useEffect } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import axios from "axios"; // Import axios for API calls
import AddProductForm from "../components/AddProductForm"; // ✅ import modal

const QuotatTable = ({
  items = [],
  onTotalAmountChange,
  ShowHideFiltercolModal,
  onClose,
  onRowsChange,
  qouteId, // Add qouteId as a prop
}) => {
  const [rows, setRows] = useState([]);
  const [FiltercolModal, setFiltercolModal] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false); // ✅ modal state

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
    Price: true,
  });
  const [editRowIndex, setEditRowIndex] = useState(null); // Track which row is being edited
  const [editRow, setEditRow] = useState(null); // Store data of the row being edited

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
  const handleProductSave = async (product) => {
    try {
      // call backend to attach product to quotation
      const payload = {
        product_id: product.id, // backend expects product_id
        itemcode: product.itemcode,
        item_name: product.itemname,
        brand: product.brand,
        quantity: 1,
        unit: product.unit,
        mrp: Number(product.price),
        discount: 0,
        price: Number(product.price),
        customercode: "",
        customerdescription: "",
        remarks: "",
      };

      const response = await axios.post(
        `https://api.panvic.in/quotation/${qouteId}/items/`,
        payload,
        { withCredentials: true }
      );

      const newItem = response.data;
      setRows((prev) => [...prev, newItem]); // ✅ update table instantly
      setShowProductModal(false);
    } catch (err) {
      console.error("Error adding product to quotation:", err);
      alert("Failed to add product. Please try again.");
    }
  };
  // Fetch items for the given qouteId from the API
  useEffect(() => {
    if (!qouteId) return; // Do nothing if qouteId is not provided

    const fetchQuotationItems = async () => {
      try {
        const response = await fetch(
          `https://api.panvic.in/quotation/${qouteId}/items/`
        );
        if (!response.ok) throw new Error("Failed to fetch quotation items");
        const data = await response.json();

        // Map API data to the rows state format
        const mappedRows = data.map((item, index) => ({
          id: item.id || index + 1, // Use item.id from API or fallback to index
          customerCode: item.customercode || "",
          customerDescription: item.customerdescription || "",
          itemCode: item.itemcode || "",
          itemName: item.item_name || "",
          brand: item.brand || "",
          qty: item.quantity || "",
          unit: item.unit || "",
          mrp: item.mrp || "",
          discount: item.discount || "",
          amount: item.price || 0, // Use price as amount
          image: item.image || "",
        }));

        setRows(mappedRows); // Update rows with fetched data
      } catch (err) {
        console.error("Error fetching quotation items:", err);
      }
    };

    fetchQuotationItems();
  }, [qouteId]); // Re-fetch when qouteId changes

  const calculateAmount = (qty, mrp, discount) => {
    const discountAmount = (mrp * qty * (discount || 0)) / 100;
    return qty * mrp - discountAmount;
  };

  const handleAddRow = () => {
    const { qty, mrp, discount } = newRow;

    if (newRow.itemCode && newRow.itemName && qty && mrp) {
      const amount = calculateAmount(qty, mrp, discount);

      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length + 1, // Temporary ID for new rows
          ...newRow,
          amount,
        },
      ]);

      setTotalAmount((prevTotal) => {
        const updatedTotal = prevTotal + amount;
        if (onTotalAmountChange) onTotalAmountChange(updatedTotal);
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
        amount: "",
        image: "",
      });
      inputRefs.customerCode.current.focus();
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
  };

  const handleEditFieldChange = (field, value) => {
    setEditRow((prev) => ({
      ...prev,
      [field]: value,
      amount: field === "qty" || field === "mrp" || field === "discount"
        ? calculateAmount(
            field === "qty" ? value : prev.qty,
            field === "mrp" ? value : prev.mrp,
            field === "discount" ? value : prev.discount
          )
        : prev.amount,
    }));
  };

  const handleColumnVisibilityChange = (updatedColumns) => {
    setColumns(updatedColumns);
  };

  const handleEditRow = (index) => {
    const row = rows[index];
    setEditRow({ ...row });
    setEditRowIndex(index);
  };

const handleSaveRow = async () => {
  if (editRow.itemCode && editRow.itemName && editRow.qty && editRow.mrp) {
    try {
      // Call backend API
      const response = await axios.put(
        `https://api.panvic.in/quotation/${qouteId}/items/${editRow.id}`,
        {
          product_id: editRow.itemCode, // depends on your backend schema
          customercode: editRow.customerCode,
          customerdescription: editRow.customerDescription,
          itemcode: editRow.itemCode,
          item_name: editRow.itemName,
          brand: editRow.brand,
          quantity: Number(editRow.qty),
          unit: editRow.unit,
          mrp: Number(editRow.mrp),
          discount: Number(editRow.discount),
          price: Number(editRow.amount),
          image: editRow.image,
          remarks: editRow.remarks || "",
        },
        { withCredentials: true }
      );

      const updatedItem = response.data;

      // Update rows in frontend
      setRows((prevRows) =>
        prevRows.map((row, index) =>
          index === editRowIndex ? { ...updatedItem } : row
        )
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
};

  const handleCancelEdit = () => {
    setEditRowIndex(null);
    setEditRow(null);
  };

  const handleDeleteRow = async (index) => {
    const row = rows[index];
    const itemId = row.id; // Use the id from the row
    const amountToSubtract = row.amount;

    try {
      const response = await axios.delete(
        `https://api.panvic.in/quotation/${qouteId}/items/${itemId}`,
        {
          withCredentials: true,
        }
      );
      console.log("Delete response:", response.data);

      setRows((prevRows) => prevRows.filter((_, i) => i !== index));
      setTotalAmount((prevTotal) => {
        const updatedTotal = prevTotal - amountToSubtract;
        if (onTotalAmountChange) onTotalAmountChange(updatedTotal);
        return updatedTotal;
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

// Update total amount when rows change
useEffect(() => {
  const updatedTotal = rows.reduce((sum, row) => sum + row.amount, 0);
  setTotalAmount(updatedTotal);
  if (onTotalAmountChange) {
    onTotalAmountChange(updatedTotal);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [rows]); // ✅ only depend on rows

// Notify parent when rows change
useEffect(() => {
  if (onRowsChange) {
    onRowsChange(rows);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [rows]); // ✅ only depend on rows


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
                {columns.customerCode && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow.customerCode}
                        onChange={(e) =>
                          handleEditFieldChange("customerCode", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.customerCode
                    )}
                  </td>
                )}
                {columns.customerDescription && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow.customerDescription}
                        onChange={(e) =>
                          handleEditFieldChange("customerDescription", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.customerDescription
                    )}
                  </td>
                )}
                {columns.ItemCode && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow.itemCode}
                        onChange={(e) =>
                          handleEditFieldChange("itemCode", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.itemCode
                    )}
                  </td>
                )}
                <td>
                  {editRowIndex === index ? (
                    <input
                      type="text"
                      value={editRow.itemName}
                      onChange={(e) =>
                        handleEditFieldChange("itemName", e.target.value)
                      }
                      className="form-control"
                    />
                  ) : (
                    row.itemName
                  )}
                </td>
                {columns.Brand && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow.brand}
                        onChange={(e) =>
                          handleEditFieldChange("brand", e.target.value)
                        }
                        className="form-control"
                      />
                    ) : (
                      row.brand
                    )}
                  </td>
                )}
                <td>
                  {editRowIndex === index ? (
                    <input
                      type="text"
                      value={editRow.unit}
                      onChange={(e) =>
                        handleEditFieldChange("unit", e.target.value)
                      }
                      className="form-control input-small"
                    />
                  ) : (
                    row.unit
                  )}
                </td>
                {columns.MRP && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="text"
                        value={editRow.mrp}
                        onChange={(e) =>
                          handleEditFieldChange("mrp", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.mrp
                    )}
                  </td>
                )}
                {columns.Qty && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="number"
                        value={editRow.qty}
                        onChange={(e) =>
                          handleEditFieldChange("qty", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.qty
                    )}
                  </td>
                )}
                {columns.Dist && (
                  <td>
                    {editRowIndex === index ? (
                      <input
                        type="number"
                        value={editRow.discount}
                        onChange={(e) =>
                          handleEditFieldChange("discount", e.target.value)
                        }
                        className="form-control input-small"
                      />
                    ) : (
                      row.discount
                    )}
                  </td>
                )}
                {columns.Price && (
                  <td>
                    {editRowIndex === index
                      ? editRow.amount.toFixed(2)
                      : row.amount.toFixed(2)}
                  </td>
                )}
                <td>
                  {editRowIndex === index ? (
                    <>
                      <button
                        className="btn action_btn no-print btn-success"
                        onClick={handleSaveRow}
                      >
                        <i className="fas fa-save"></i> {/* Save Icon */}
                      </button>
                      <button
                        className="btn action_btn no-print btn-secondary ml-2"
                        onClick={handleCancelEdit}
                      >
                        <i className="fas fa-times"></i> {/* Cancel Icon */}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn action_btn no-print btn-warning"
                        onClick={() => handleEditRow(index)}
                      >
                        <i className="fas fa-edit"></i> {/* Edit Icon */}
                      </button>
                      <button
                        className="btn action_btn no-print btn-danger ml-2"
                        onClick={() => handleDeleteRow(index)}
                      >
                        <i className="fas fa-trash"></i> {/* Delete Icon */}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            <tr className="no-print">
              <td>#</td>
              <td>
                <img src={newRow.image} alt="" className="product_img" />
              </td>
              <td>
                <input
                  type="text"
                  name="customerCode"
                  value={newRow.customerCode}
                  onChange={(e) =>
                    handleFieldChange("customerCode", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "customerDescription")}
                  placeholder="Cust Code"
                  className="form-control input-small"
                  ref={inputRefs.customerCode}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="customerDescription"
                  value={newRow.customerDescription}
                  onChange={(e) =>
                    handleFieldChange("customerDescription", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "itemCode")}
                  placeholder="Cust Desc"
                  className="form-control input-small"
                  ref={inputRefs.customerDescription}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="itemCode"
                  value={newRow.itemCode}
                  onChange={(e) =>
                    handleFieldChange("itemCode", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "itemName")}
                  placeholder="Item code"
                  className="form-control input-small"
                  ref={inputRefs.itemCode}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="itemName"
                  value={newRow.itemName}
                  onChange={(e) =>
                    handleFieldChange("itemName", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "qty")}
                  placeholder="Item name"
                  className="form-control"
                  ref={inputRefs.itemName}
                />
              </td>
              <td>
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
              </td>
              <td>
                <input
                  type="text"
                  name="unit"
                  value={newRow.unit}
                  onChange={(e) => handleFieldChange("unit", e.target.value)}
                  placeholder="unit"
                  className="form-control input-small"
                  ref={inputRefs.unit}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="mrp"
                  value={newRow.mrp}
                  onChange={(e) => handleFieldChange("mrp", e.target.value)}
                  placeholder="MRP"
                  className="form-control input-small"
                  ref={inputRefs.mrp}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="qty"
                  value={newRow.qty}
                  onChange={(e) => handleFieldChange("qty", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "discount")}
                  placeholder="Qty"
                  className="form-control input-small"
                  ref={inputRefs.qty}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="discount"
                  value={newRow.discount}
                  onChange={(e) =>
                    handleFieldChange("discount", e.target.value)
                  }
                  onKeyDown={(e) => handleKeyDown(e, "amount")}
                  placeholder="Discount (%)"
                  className="form-control input-small"
                  ref={inputRefs.discount}
                />
              </td>
              <td>
                <input
                  type="number"
                  name="amount"
                  value={newRow.amount}
                  placeholder="Amount"
                  className="form-control input-small"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotatTable;