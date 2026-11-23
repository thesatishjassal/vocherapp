"use client";
import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import AddProductModal from "./AddProductModal";
import CustomAddModal from "./CustomAddModal";
import "./QuotationTable.css";

/* ---------- Small helpers (UI only) ---------- */

const money = (v) =>
  (Number(v) || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain = (v) => (Number(v) || 0).toLocaleString("en-IN");

const COLUMN_LABELS = {
  Image: "Image",
  customerCode: "Customer code",
  customerDescription: "Customer description",
  ItemCode: "Item code",
  Brand: "Brand",
  MRP: "MRP",
  Qty: "Qty",
  Dist: "Discount",
  NetPrice: "Net price",
  Amount: "Amount",
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const ICON = {
  edit: "M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4",
  custom: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",
  plus: "M12 5v14M5 12h14",
  columns: "M4 5h16v14H4zM10 5v14M16 5v14",
};

/* Compact "Columns" dropdown — replaces the big row of checkbox buttons */
const ColumnMenu = ({ columns, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="qt-columns no-print" ref={ref}>
      <button type="button" className="qt-columns__toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <Icon d={ICON.columns} /> Columns
      </button>
      {open && (
        <div className="qt-columns__menu" role="menu">
          {Object.keys(COLUMN_LABELS).map((key) => (
            <label key={key} className="qt-columns__item">
              <input
                type="checkbox"
                className="qt-columns__check"
                checked={!!columns[key]}
                onChange={() => onChange({ ...columns, [key]: !columns[key] })}
              />
              {COLUMN_LABELS[key]}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ================================================================== */

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
    Image: false,
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
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
    cct: "",
    cctOptions: "",
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
    cct: useRef(null),
  };

  const roundRupee = (value) => {
    const rupees = Math.floor(value);
    const paise = value - rupees;
    return paise >= 0.5 ? rupees + 1 : rupees;
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
    const value = mrpValue * (1 - discValue / 100);
    return roundRupee(value);
  };

  const calculateAmount = (qty, netPrice) => {
    const qtyValue = Number(qty) || 0;
    const netValue = Number(netPrice) || 0;
    return roundRupee(qtyValue * netValue);
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
            cct: item.cct || "",
            cctOptions: item.cctOptions || "",
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
      cct: "",
      cctOptions: "",
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

  const fillFromRow = (row) => ({
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
    cct: row.cct || "",
    cctOptions: row.cctOptions || "",
  });

  const handleEditRow = (index) => {
    setNewRow(fillFromRow(rows[index]));
    setEditRowIndex(index);
    setShowAddModal(true);
  };

  const handleEditCustomRow = (index) => {
    setNewRow(fillFromRow(rows[index]));
    setEditRowIndex(index);
    setShowCusAddModal(true);
  };

  const handleDeleteRow = (index) => {
    setRows((prevRows) => prevRows.filter((_, i) => i !== index));
  };

  // remarks can come back as 0 / "0" from the API — don't print it
  const hasRemarks = (r) => r && String(r).trim() !== "" && String(r).trim() !== "0";

  /* ---------- JSX ---------- */
  return (
    <section className="qt">
      <div className="qt__bar no-print">
        <span className="qt__count">
          {rows.length} {rows.length === 1 ? "item" : "items"}
        </span>
        <ColumnMenu columns={columns} onChange={handleColumnVisibilityChange} />
      </div>

      <div className="qt__wrap">
        <table className="qt__table">
          <thead>
            <tr>
              <th className="qt__th qt__th--sr">#</th>
              {columns.Image && <th className="qt__th">Image</th>}
              {columns.customerCode && <th className="qt__th">Cust code</th>}
              {columns.customerDescription && <th className="qt__th">Cust desc</th>}
              {columns.ItemCode && <th className="qt__th">Item code</th>}
              <th className="qt__th qt__th--name">Item name</th>
              {columns.Brand && <th className="qt__th">Brand</th>}
              <th className="qt__th">Unit</th>
              {columns.MRP && <th className="qt__th qt__th--num">MRP</th>}
              {columns.Qty && <th className="qt__th qt__th--num">Qty</th>}
              {columns.Dist && <th className="qt__th qt__th--num">Disc %</th>}
              {columns.NetPrice && <th className="qt__th qt__th--num">Net price</th>}
              {columns.Amount && <th className="qt__th qt__th--num">Amount</th>}
              <th className="qt__th qt__th--actions no-print"><span className="qt__sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id} className="qt__row">
                <td className="qt__td qt__td--muted">{index + 1}</td>
                {columns.Image && (
                  <td className="qt__td">
                    {row.image && (
                      <img
                        src={`${API_URL}${row.image}`}
                        alt=""
                        className="qt__img"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                  </td>
                )}
                {columns.customerCode && <td className="qt__td">{row.customerCode}</td>}
                {columns.customerDescription && <td className="qt__td">{row.customerDescription}</td>}
                {columns.ItemCode && <td className="qt__td qt__td--code">{row.itemCode}</td>}
                <td className="qt__td qt__td--name">
                  <div className="qt__name">{row.itemName}</div>
                  {row.cct && <div className="qt__remarks">CCT: {row.cct}</div>}
                  {hasRemarks(row.remarks) && <div className="qt__remarks">{row.remarks}</div>}
                </td>
                {columns.Brand && <td className="qt__td qt__td--muted">{row.brand}</td>}
                <td className="qt__td qt__td--muted">{row.unit}</td>
                {columns.MRP && <td className="qt__td qt__td--num">{plain(row.mrp)}</td>}
                {columns.Qty && <td className="qt__td qt__td--num">{row.qty}</td>}
                {columns.Dist && <td className="qt__td qt__td--num">{row.discount}</td>}
                {columns.NetPrice && <td className="qt__td qt__td--num">{money(row.netPrice)}</td>}
                {columns.Amount && <td className="qt__td qt__td--num qt__td--strong">{money(row.amount)}</td>}
                <td className="qt__td qt__td--actions no-print">
                  <div className="qt__actions">
                    <button type="button" className="qt__icon-btn" onClick={() => handleEditRow(index)} aria-label="Edit" title="Edit">
                      <Icon d={ICON.edit} />
                    </button>
                    <button type="button" className="qt__icon-btn" onClick={() => handleEditCustomRow(index)} aria-label="Edit as custom" title="Edit as custom">
                      <Icon d={ICON.custom} />
                    </button>
                    <button type="button" className="qt__icon-btn qt__icon-btn--danger" onClick={() => handleDeleteRow(index)} aria-label="Delete" title="Delete">
                      <Icon d={ICON.trash} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td className="qt__empty" colSpan={20}>No items yet — add your first product below.</td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && columns.Amount && (
            <tfoot>
              <tr className="qt__total">
                <td className="qt__td qt__total-label" colSpan={20}>
                  Subtotal <span className="qt__total-value">₹{money(totalAmount)}</span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="qt__add no-print">
        <button type="button" className="qt__add-btn" onClick={() => setShowAddModal(true)}>
          <Icon d={ICON.plus} /> Add product
        </button>
        <button type="button" className="qt__add-btn qt__add-btn--ghost" onClick={() => setShowCusAddModal(true)}>
          <Icon d={ICON.plus} /> Custom item
        </button>
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
    </section>
  );
};

QuotationTable.propTypes = {
  items: PropTypes.array,
  onTotalAmountChange: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onRowsChange: PropTypes.func,
};

export default QuotationTable;