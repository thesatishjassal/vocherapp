"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ShowHideFilter from "../components/ShowHideFilter";
import AddProductModal from "./AddProductModal";
import CustomAddModal from "./CustomAddModal";
import axios from "axios";

const QuotatTable = React.memo(({
  items = [],
  onTotalAmountChange,
  ShowHideFiltercolModal,
  onClose,
  onRowsChange,
  qouteId,
}) => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(!items.length && qouteId);
  const [filterColModal, setFilterColModal] = useState(false);
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
    price: 0,
  });

  const inputRefs = useRef({
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
  }).current;

  // Debug re-renders
  useEffect(() => {
    console.log("QuotatTable re-rendered", { qouteId, itemsLength: items.length });
  }, [qouteId, items.length]);

  // Sync initial rows from props
  useEffect(() => {
    if (items.length > 0 && rows.length === 0) {
      setRows(
        items.map((item, index) => {
          const mrp = Number(item.mrp) || 0;
          const net = Number(item.net_price) || 0;
          const discount = item.discount !== undefined
            ? Number(item.discount)
            : ((mrp - net) / mrp * 100) || 0;
          const qtyValue = Number(item.quantity || item.qty || 0);
          const amount = Number(item.price) || (qtyValue * net);
          return {
            id: item.id || index + 1,
            customerCode: item.customercode || "",
            customerDescription: item.customerdescription || "",
            itemCode: item.itemcode || "",
            itemName: item.item_name || "",
            brand: item.brand || "",
            qty: qtyValue,
            unit: item.unit || "Piece",
            mrp,
            discount,
            netPrice: net,
            price: net,
            amount,
            image: item.image || "",
            remarks: item.remarks || "",
          };
        })
      );
    }
  }, [items, rows.length]);

  // Fetch quotation items if qouteId and no items
  useEffect(() => {
    if (!qouteId || items.length || rows.length) return;
    const fetchQuotationItems = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://api.panvic.in/quotation/${qouteId}/items/`);
        if (!response.ok) throw new Error("Failed to fetch quotation items");
        const data = await response.json();
        const mappedRows = data.map((item, index) => {
          const netPrice =
            Number(item.net_price) ||
            (Number(item.mrp) * (1 - Number(item.discount || 0) / 100)) ||
            0;
          const qtyValue = Number(item.quantity || item.qty || 0);
          const amount = Number(item.price) || (qtyValue * netPrice);
          return {
            id: item.id || index + 1,
            customerCode: item.customercode || "",
            customerDescription: item.customerdescription || "",
            itemCode: item.itemcode || "",
            itemName: item.item_name || "",
            brand: item.brand || "",
            qty: qtyValue,
            unit: item.unit || "",
            mrp: Number(item.mrp) || "",
            discount: Number(item.discount) || "",
            netPrice,
            price: netPrice,
            amount,
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
  }, [qouteId, items.length, rows.length]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://api.panvic.in/products/");
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        const updatedData = data.map((item) => ({
          ...item,
          unit: item.unit || "Piece",
          itemname: item.itemname?.substring(0, 100) || "",
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
      price: 0,
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
        next.price = net;
      }
      if (field === "discount") {
        const computedNet = calculateNetPrice(mrp, disc);
        next.netPrice = computedNet;
        next.amount = calculateAmount(qty, computedNet);
        next.price = computedNet;
      }
      if (field === "qty") {
        next.amount = calculateAmount(qty, net);
      }
      return next;
    });
  };

  const handleAddRow = async () => {
    const { itemCode, itemName, qty, mrp, netPrice, discount } = newRow;
    console.log("Adding/Updating row with data:", newRow);
    if (!itemCode || !itemName || !qty || !netPrice) {
      alert("Please fill in all required fields (Item Code, Item Name, Qty, Net Price).");
      return;
    }

    if (!qouteId) {
      alert("Invalid quotation ID");
      return;
    }

    const parsedMrp = Number(mrp);
    const parsedNet = Number(netPrice);
    const parsedDisc = discount === "" ? calculateDiscount(parsedMrp, parsedNet) : Number(discount);
    const parsedQty = Number(qty);
    const amount = calculateAmount(parsedQty, parsedNet);

    const payload = {
      product_id: itemCode || "",
      customercode: newRow.customerCode || "",
      customerdescription: newRow.customerDescription || "",
      itemcode: itemCode || "",
      item_name: itemName || "",
      brand: newRow.brand || "",
      quantity: parsedQty,
      unit: newRow.unit || "Piece",
      mrp: parsedMrp,
      discount: parsedDisc,
      net_price: parsedNet,
      price: amount,
      image: newRow.image || "",
      amount_including_gst: null,
      without_gst: null,
      gst_amount: null,
      amount_with_gst: null,
      remarks: newRow.remarks || null,
      cct: null,
      beamangle: null,
      cri: null,
      cutoutdia: null,
      lumens: null,
    };

    try {
      let updatedRows;
      let newTotal = totalAmount;
      if (editRowIndex !== null) {
        const itemId = rows[editRowIndex].id;
        console.log("Updating item with ID:", itemId);
        const response = await axios.put(
          `https://api.panvic.in/quotation/${qouteId}/items/${itemId}/`,
          payload,
          { withCredentials: true }
        );
        const updatedItem = response.data;
        const updatedRow = {
          id: updatedItem.item_id || rows[editRowIndex].id,
          customerCode: payload.customercode,
          customerDescription: payload.customerdescription,
          itemCode: payload.itemcode,
          itemName: payload.item_name,
          brand: payload.brand,
          qty: payload.quantity,
          unit: payload.unit,
          mrp: payload.mrp,
          discount: payload.discount,
          netPrice: payload.net_price,
          price: payload.net_price,
          amount: payload.price,
          image: payload.image,
          remarks: payload.remarks,
        };
        updatedRows = rows.map((row, i) => (i === editRowIndex ? updatedRow : row));
        newTotal = updatedRows.reduce((sum, r) => sum + Number(r.amount), 0);
        onTotalAmountChange?.(newTotal);
        setEditRowIndex(null);
      } else {
        console.log("Creating new item");
        const response = await axios.post(
          `https://api.panvic.in/quotation/${qouteId}/items/`,
          payload,
          { withCredentials: true }
        );
        const createdItem = response.data;
        console.log("Created item response:", createdItem);
        const newItemRow = {
          id: createdItem.item_id || rows.length + 1,
          customerCode: payload.customercode,
          customerDescription: payload.customerdescription,
          itemCode: payload.itemcode,
          itemName: payload.item_name,
          brand: payload.brand,
          qty: payload.quantity,
          unit: payload.unit,
          mrp: payload.mrp,
          discount: payload.discount,
          netPrice: payload.net_price,
          price: payload.net_price,
          amount: payload.price,
          image: payload.image,
          remarks: payload.remarks,
        };
        updatedRows = [...rows, newItemRow];
        newTotal = totalAmount + amount;
        onTotalAmountChange?.(newTotal);
      }
      setRows(updatedRows);
      resetNewRow();
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding/updating item:", error.response?.data || error.message);
      alert(`Failed to ${editRowIndex !== null ? 'update' : 'add'} item: ${error.response?.data?.detail || "Please try again."}`);
    }
  };

  const handleSubmitCustomRowToDB = async (payload) => {
    // For custom, post without product_id
    const response = await axios.post(
      `https://api.panvic.in/quotation/${qouteId}/items/`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  };

  const handleSubmitCustomRow = async (rowData, editIndex) => {
    if (!qouteId) {
      alert("Invalid quotation ID");
      return;
    }

    const qty = Number(rowData.cus_qty);
    const mrp = Number(rowData.cus_mrp);
    const net = Number(rowData.cus_netprice);
    const discount =
      rowData.cus_discount === ""
        ? calculateDiscount(mrp, net)
        : Number(rowData.cus_discount);
    const amount = calculateAmount(qty, net);

    const payload = {
      product_id: null,
      customercode: rowData.cus_customercode || "",
      customerdescription: rowData.cus_customerdescription || "",
      itemcode: rowData.cus_itemcode || "",
      item_name: rowData.cus_itemname || "",
      brand: rowData.cus_brand || "",
      quantity: qty,
      unit: rowData.cus_unit || "Piece",
      mrp,
      discount,
      net_price: net,
      price: amount,
      image: rowData.cus_image || "",
      amount_including_gst: null,
      without_gst: null,
      gst_amount: null,
      amount_with_gst: null,
      remarks: rowData.cus_remarks || null,
      cct: null,
      beamangle: null,
      cri: null,
      cutoutdia: null,
      lumens: null,
    };

    let savedItem;
    let updatedRows;
    let newTotal = totalAmount;
    try {
      if (editIndex !== null) {
        const itemId = rows[editIndex].id;
        console.log("Updating custom item with ID:", itemId);
        const response = await axios.put(
          `https://api.panvic.in/quotation/${qouteId}/items/${itemId}/`,
          payload,
          { withCredentials: true }
        );
        savedItem = response.data;
        const updatedRow = {
          id: savedItem.item_id || rows[editIndex].id,
          customerCode: payload.customercode,
          customerDescription: payload.customerdescription,
          itemCode: payload.itemcode,
          itemName: payload.item_name,
          brand: payload.brand,
          qty: payload.quantity,
          unit: payload.unit,
          mrp: payload.mrp,
          discount: payload.discount,
          netPrice: payload.net_price,
          price: payload.net_price,
          amount: payload.price,
          image: payload.image,
          remarks: payload.remarks,
        };
        updatedRows = rows.map((row, i) => (i === editIndex ? updatedRow : row));
        newTotal = updatedRows.reduce((sum, r) => sum + Number(r.amount), 0);
        onTotalAmountChange?.(newTotal);
        setEditRowIndex(null);
      } else {
        console.log("Creating new custom item");
        savedItem = await handleSubmitCustomRowToDB(payload);
        console.log("Created custom item response:", savedItem);
        if (!savedItem) return;
        const newRowData = {
          id: savedItem.item_id || rows.length + 1,
          customerCode: payload.customercode,
          customerDescription: payload.customerdescription,
          itemCode: payload.itemcode,
          itemName: payload.item_name,
          brand: payload.brand,
          qty: payload.quantity,
          unit: payload.unit,
          mrp: payload.mrp,
          discount: payload.discount,
          netPrice: payload.net_price,
          price: payload.net_price,
          amount: payload.price,
          image: payload.image,
          remarks: payload.remarks,
        };
        updatedRows = [...rows, newRowData];
        newTotal = totalAmount + amount;
        onTotalAmountChange?.(newTotal);
      }
      setRows(updatedRows);
      resetNewRow();
      setShowCusAddModal(false);
    } catch (error) {
      console.error("Error adding/updating custom item:", error);
      alert("Failed to add/update custom item. Please try again.");
    }
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

  const handleDeleteRow = async (index) => {
    const row = rows[index];
    const confirmDelete = window.confirm(`Are you sure you want to delete "${row.itemName}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    const itemId = row.id;
    try {
      await axios.delete(`https://api.panvic.in/quotation/${qouteId}/items/${itemId}/`, {
        withCredentials: true,
      });
      setRows((prevRows) => prevRows.filter((_, i) => i !== index));
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ShowHideFilter
        className="no-print mb-3"
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
                      src={row.image ? `https://api.panvic.in${row.image}` : ""}
                      alt=""
                      className="product_img thumbnail"
                      style={{ maxHeight: "50px" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </td>
                )}
                {columns.customerCode && <td>{row.customerCode || "-"}</td>}
                {columns.customerDescription && <td>{row.customerDescription || "-"}</td>}
                {columns.ItemCode && <td>{row.itemCode || "-"}</td>}
                <td>
                  <div>{row.itemName || "-"}</div>
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
                {columns.Brand && <td>{row.brand || "-"}</td>}
                <td>{row.unit || "-"}</td>
                {columns.MRP && <td>{row.mrp || "-"}</td>}
                {columns.Qty && <td>{row.qty || "-"}</td>}
                {columns.Dist && <td>{row.discount || "-"}</td>}
                {columns.NetPrice && <td>{(row.netPrice || 0).toFixed(2)}</td>}
                {columns.Amount && <td>{(row.amount || 0).toFixed(2)}</td>}
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
      </div>

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
});

export default QuotatTable;