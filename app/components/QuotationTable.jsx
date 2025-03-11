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
  const [totalAmount, setTotalAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState([]); // Full product list
  const [filteredProducts, setFilteredProducts] = useState([]); // Filtered product list
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
  const [editRowIndex, setEditRowIndex] = useState(null); // To track which row is being edited

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
        setFilteredProducts(updatedData); // Initially, show all products
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

  const handleAddRow = () => {
    const { qty, mrp, discount } = newRow;

    if (newRow.itemCode && newRow.itemName && qty && mrp) {
      const amount = calculateAmount(qty, mrp, discount);

      if (editRowIndex !== null) {
        // Edit existing row
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
        setEditRowIndex(null); // Reset edit mode
      } else {
        // Add new row
        setRows((prevRows) => [
          ...prevRows,
          {
            id: prevRows.length + 1,
            ...newRow,
            amount,
          },
        ]);
      }

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
    if (["itemCode", "itemName"].includes(field) && value.trim()) {
      setShowModal(true);
      filterProducts(field, value); // Filter products based on input
    }
  };

  // Implement filterProducts function
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
    setEditRowIndex(index); // Set the index for the row being edited
  };

  const handleDeleteRow = (index) => {
    const amountToSubtract = rows[index].amount;
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
    setTotalAmount((prevTotal) => {
      const updatedTotal = prevTotal - amountToSubtract;
      if (onTotalAmountChange) onTotalAmountChange(updatedTotal);
      return updatedTotal;
    });
  };

  useEffect(() => {
    const updatedTotal = rows.reduce((sum, row) => sum + row.amount, 0);
    setTotalAmount(updatedTotal);
    if (onTotalAmountChange) onTotalAmountChange(updatedTotal);
  }, [rows, onTotalAmountChange]);

  // Pass the updated rows data to the parent component
  useEffect(() => {
    if (onRowsChange) {
      onRowsChange(rows);
    }
  }, [rows, onRowsChange]);

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
            <th className="no-print">Actions</th> {/* Add Actions column */}
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
                  <i className="fas fa-edit"></i> {/* Edit Icon */}
                </button>
                <button
                  className="btn action_btn no-print btn-danger ml-2"
                  onClick={() => handleDeleteRow(index)}
                >
                  <i className="fas fa-trash"></i> {/* Delete Icon */}
                </button>
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
                onChange={(e) => handleFieldChange("itemCode", e.target.value)}
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
                onChange={(e) => handleFieldChange("itemName", e.target.value)}
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
                disabled
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
                disabled
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
                onChange={(e) => handleFieldChange("discount", e.target.value)}
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
                disabled
                placeholder="Amount"
                className="form-control input-small"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <FindProduct
        showModal={showModal}
        setShowModal={setShowModal}
        handleProductSelect={handleProductSelect}
        products={filteredProducts} // Pass filtered products to FindProduct
      />
    </div>
  );
};

export default QuotatTable;