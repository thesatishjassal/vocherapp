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
    customerCode: true,
    customerDescription: true,
    Image: true,
    ItemCode: true,
    Brand: true,
    MRP: true,
    Qty: true,
    Dist: true,
    Price: true,
    NetPrice: true,
  });
  const [editRowIndex, setEditRowIndex] = useState(null);

  // Initialize newRow with all fields as defined values
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

  useEffect(() => {
    if (items.length > 0 && rows.length === 0) {
      setRows(
        items.map((item, index) => ({
          id: index + 1,
          customerCode: item.customerCode || "",
          customerDescription: item.customerDescription || "",
          itemCode: item.itemCode || "",
          itemName: item.itemName || "",
          brand: item.brand || "",
          qty: item.qty || "",
          unit: item.unit || "Piece",
          mrp: item.mrp || "",
          discount: item.discount || calculateDiscount(item.mrp, item.netPrice),
          netPrice: item.netPrice || calculateNetPrice(item.mrp, item.discount),
          amount: calculateAmount(
            item.qty,
            item.netPrice || calculateNetPrice(item.mrp, item.discount)
          ),
          image: item.image || "",
          remarks: item.remarks || "",
        }))
      );
    }
  }, [items]);

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

  const calculateDiscount = (mrp, netPrice) => {
    const mrpValue = parseFloat(mrp) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    if (mrpValue === 0) return "";
    return Math.round(((mrpValue - netPriceValue) / mrpValue) * 100).toString();
  };

  const calculateNetPrice = (mrp, discount) => {
    const mrpValue = parseFloat(mrp) || 0;
    const discountValue = parseFloat(discount) || 0;
    return (mrpValue * (1 - discountValue / 100)).toFixed(2);
  };

  const calculateAmount = (qty, netPrice) => {
    const qtyValue = parseFloat(qty) || 0;
    const netPriceValue = parseFloat(netPrice) || 0;
    return (qtyValue * netPriceValue).toFixed(2);
  };

  const filterProducts = (field, value, products) => {
    return products.filter((product) =>
      field === "itemCode"
        ? product.itemcode.toLowerCase().includes(value.toLowerCase())
        : product.itemname.toLowerCase().includes(value.toLowerCase())
    );
  };

  const totalAmount = rows.reduce(
    (sum, row) => sum + (parseFloat(row.amount) || 0),
    0
  );

  useEffect(() => {
    if (onRowsChange) onRowsChange(rows);
    if (onTotalAmountChange) onTotalAmountChange(totalAmount);
  }, [rows, onRowsChange, onTotalAmountChange, totalAmount]);

  const submitCustomRowToDB = async (rowData) => {
    try {
      // Placeholder for API call (uncomment and adjust as needed)
      /*
      const response = await fetch("https://api.panvic.in/custom-items/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_code: rowData.cus_customercode || "",
          customer_description: rowData.cus_customerdescription || "",
          item_code: rowData.cus_itemcode || "",
          item_name: rowData.cus_itemname || "",
          brand: rowData.cus_brand || "",
          qty: parseFloat(rowData.cus_qty) || 0,
          unit: rowData.cus_unit || "Piece",
          mrp: parseFloat(rowData.cus_mrp) || 0,
          discount: parseFloat(rowData.cus_discount) || 0,
          net_price: parseFloat(rowData.cus_netprice) || 0,
          image: rowData.cus_image || "",
          remarks: rowData.cus_remarks || "",
        }),
      });
      if (!response.ok) throw new Error("Failed to save custom item");
      const result = await response.json();
      */
      const result = { id: Date.now() }; // Mock response
      console.log("Custom item saved successfully:", result);
      return result;
    } catch (error) {
      console.error("Error saving custom item:", error);
      alert("Failed to save custom item. Please try again.");
      return null;
    }
  };

  const handleAddRow = () => {
    const { qty, netPrice, itemCode, itemName } = newRow;
    if (itemCode && itemName && qty && netPrice) {
      const amount = calculateAmount(qty, netPrice);
      const discount = calculateDiscount(newRow.mrp, netPrice);
      if (editRowIndex !== null) {
        setRows((prevRows) =>
          prevRows.map((row, index) =>
            index === editRowIndex
              ? {
                  ...row,
                  ...newRow,
                  amount,
                  discount,
                  netPrice,
                  unit: newRow.unit || "Piece",
                  customerCode: newRow.customerCode || "",
                  customerDescription: newRow.customerDescription || "",
                  brand: newRow.brand || "",
                  mrp: newRow.mrp || "",
                  image: newRow.image || "",
                  remarks: newRow.remarks || "",
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
            discount,
            netPrice,
            unit: newRow.unit || "Piece",
            customerCode: newRow.customerCode || "",
            customerDescription: newRow.customerDescription || "",
            brand: newRow.brand || "",
            mrp: newRow.mrp || "",
            image: newRow.image || "",
            remarks: newRow.remarks || "",
          },
        ]);
      }
      resetNewRow();
      setShowAddModal(false);
    } else {
      alert("Please fill in all required fields (Item Code, Item Name, Qty, Net Price).");
    }
  };

  const handleSubmitCustomRow = async (rowData, editIndex) => {
    const { cus_qty, cus_itemcode, cus_itemname, cus_netprice } = rowData;
    if (cus_itemcode && cus_itemname && cus_qty && cus_netprice) {
      const amount = calculateAmount(cus_qty, cus_netprice);
      const discount = calculateDiscount(rowData.cus_mrp, cus_netprice);
      const savedItem = await submitCustomRowToDB(rowData);
      if (savedItem) {
        const newRowData = {
          id: editIndex !== null ? rows[editIndex].id : rows.length + 1,
          customerCode: rowData.cus_customercode || "",
          customerDescription: rowData.cus_customerdescription || "",
          itemCode: rowData.cus_itemcode || "",
          itemName: rowData.cus_itemname || "",
          brand: rowData.cus_brand || "",
          qty: rowData.cus_qty || "",
          unit: rowData.cus_unit || "Piece",
          mrp: rowData.cus_mrp || "",
          discount,
          netPrice: rowData.cus_netprice || "",
          amount,
          image: rowData.cus_image || "",
          remarks: rowData.cus_remarks || "",
        };
        if (editIndex !== null) {
          setRows((prevRows) =>
            prevRows.map((row, index) => (index === editIndex ? newRowData : row))
          );
          setEditRowIndex(null);
        } else {
          setRows((prevRows) => [...prevRows, newRowData]);
        }
        resetNewRow();
        setShowCusAddModal(false);
      }
    } else {
      alert(
        "Please fill in all required fields (Custom Item Code, Custom Item Name, Qty, Net Price)."
      );
    }
  };

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

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (nextField && inputRefs[nextField]?.current) {
        inputRefs[nextField].current.focus();
      } else {
        if (showAddModal) {
          handleAddRow();
        } else if (showCusAddModal) {
          handleSubmitCustomRow(newRow, editRowIndex);
        }
      }
    }
  };

  const handleFieldChange = (field, value) => {
    setNewRow((prev) => {
      const updatedRow = {
        ...prev,
        [field]:
          field === "cus_itemname" || field === "itemName"
            ? value.substring(0, 100)
            : value || "", // Ensure no undefined values
      };
      if ((field === "cus_itemname" || field === "itemName") && value.length > 100) {
        alert("Item name truncated to 100 characters.");
      }
      if (
        field === "netPrice" ||
        field === "mrp" ||
        field === "cus_netprice" ||
        field === "cus_mrp"
      ) {
        updatedRow.discount = calculateDiscount(updatedRow.mrp, updatedRow.netPrice);
        updatedRow.cus_discount = calculateDiscount(
          updatedRow.cus_mrp,
          updatedRow.cus_netprice
        );
        updatedRow.amount = calculateAmount(updatedRow.qty, updatedRow.netPrice);
        updatedRow.cus_amount = calculateAmount(updatedRow.cus_qty, updatedRow.cus_netprice);
      } else if (field === "discount" || field === "cus_discount") {
        updatedRow.netPrice = calculateNetPrice(updatedRow.mrp, value);
        updatedRow.cus_netprice = calculateNetPrice(updatedRow.cus_mrp, value);
        updatedRow.amount = calculateAmount(updatedRow.qty, updatedRow.netPrice);
        updatedRow.cus_amount = calculateAmount(updatedRow.cus_qty, updatedRow.cus_netprice);
      } else if (field === "qty" || field === "cus_qty") {
        updatedRow.amount = calculateAmount(value, updatedRow.netPrice);
        updatedRow.cus_amount = calculateAmount(value, updatedRow.cus_netprice);
      }
      return updatedRow;
    });
  };

  const handleColumnVisibilityChange = (updatedColumns) => {
    setColumns(updatedColumns);
  };

  const handleEditRow = (index) => {
    const row = rows[index];
    setNewRow({
      customerCode: row.customerCode || "",
      customerDescription: row.customerDescription || "",
      itemCode: row.itemCode || "",
      itemName: row.itemName || "",
      cus_itemcode: row.itemCode || "",
      cus_itemname: row.itemName || "",
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
      customerCode: row.customerCode || "",
      customerDescription: row.customerDescription || "",
      itemCode: row.itemCode || "",
      itemName: row.itemName || "",
      cus_itemcode: row.itemCode || "",
      cus_itemname: row.itemName || "",
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
          className="btn btn-primary w-100"
          onClick={() => setShowAddModal(true)}
          aria-label="Add New Row"
        >
          Add New Row
        </button>
        <button
          className="btn btn-secondary w-100"
          onClick={() => setShowCusAddModal(true)}
          aria-label="Add Custom New Row"
        >
          Add Custom New Row
        </button>
      </div>
    </div>
  );
};

QuotationTable.propTypes = {
  items: PropTypes.array,
  onTotalAmountChange: PropTypes.func,
  onClose: PropTypes.func,
  onRowsChange: PropTypes.func,
};

export default QuotationTable;