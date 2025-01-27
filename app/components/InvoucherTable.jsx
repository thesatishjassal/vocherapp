import React, { useState, useRef, useEffect } from "react";
import FindProduct from "../components/FindPropduct";

const InvoucherTable = ({ items = [], onTotalAmountChange }) => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    itemCode: "",
    itemName: "",
    qty: "",
    unit: "",
    rackCode: "",
    rate: "",
    discount: "",
    amount: "",
    comments: "",
  });
  const [totalAmount, setTotalAmount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const inputRefs = {
    itemCode: useRef(null),
    itemName: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    rackCode: useRef(null),
    rate: useRef(null),
    discount: useRef(null),
    comments: useRef(null),
  };

  const calculateAmount = (qty, rate, discount) => {
    const discountAmount = (rate * qty * (discount || 0)) / 100;
    return qty * rate - discountAmount;
  };

  const handleAddRow = () => {
    const { qty, rate, discount } = newRow;

    if (newRow.itemCode && newRow.itemName && qty && rate) {
      const amount = calculateAmount(qty, rate, discount);

      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length + 1,
          ...newRow,
          amount,
        },
      ]);

      setTotalAmount((prevTotal) => {
        const updatedTotal = prevTotal + amount;
        if (onTotalAmountChange) onTotalAmountChange(updatedTotal); // Pass updated total to the parent
        return updatedTotal;
      });

      setNewRow({
        itemCode: "",
        itemName: "",
        qty: "",
        unit: "",
        rackCode: "",
        rate: "",
        discount: "",
        amount: "",
        comments: "",
      });
      inputRefs.itemCode.current.focus();
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
      filterProducts(value);
    }
  };

  const handleProductSelect = (product) => {
    setNewRow((prev) => ({
      ...prev,
      itemCode: product.value,
      itemName: product.name,
      unit: product.unit,
      rackCode: product.rackCode,
    }));
    setShowModal(false);
    setTimeout(() => {
      inputRefs.qty.current?.focus();
    }, 0);
  };

  return (
    <div>
      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Rack Code</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Discount (%)</th>
            <th>Amount</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>{row.itemCode}</td>
              <td>{row.itemName}</td>
              <td>{row.unit}</td>
              <td>{row.rackCode}</td>
              <td>{row.qty}</td>
              <td>{row.rate}</td>
              <td>{row.discount}</td>
              <td>{row.amount.toFixed(2)}</td>
              <td>{row.comments}</td>
            </tr>
          ))}
          <tr className="no-print">
            <td>#</td>
            <td>
              <input
                type="text"
                name="itemCode"
                value={newRow.itemCode}
                onChange={(e) => handleFieldChange("itemCode", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "itemName")}
                placeholder="Enter item code"
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
                placeholder="Enter item name"
                className="form-control"
                ref={inputRefs.itemName}
              />
            </td>
            <td>
              <input
                type="text"
                name="unit"
                value={newRow.unit}
                onChange={(e) => handleFieldChange("unit", e.target.value)}
                placeholder="Enter unit"
                className="form-control input-small"
                ref={inputRefs.unit}
                disabled
              />
            </td>
            <td>
              <input
                type="text"
                name="rackCode"
                value={newRow.rackCode}
                onChange={(e) => handleFieldChange("rackCode", e.target.value)}
                placeholder="Rack Code"
                className="form-control input-small"
                ref={inputRefs.rackCode}
                disabled
              />
            </td>
            <td>
              <input
                type="number"
                name="qty"
                value={newRow.qty}
                onChange={(e) => handleFieldChange("qty", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "rate")}
                placeholder="Qty"
                className="form-control input-small"
                ref={inputRefs.qty}
              />
            </td>
            <td>
              <input
                type="number"
                name="rate"
                value={newRow.rate}
                onChange={(e) => handleFieldChange("rate", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "discount")}
                placeholder="Rate"
                className="form-control input-small"
                ref={inputRefs.rate}
              />
            </td>
            <td>
              <input
                type="number"
                name="discount"
                value={newRow.discount}
                onChange={(e) => handleFieldChange("discount", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "comments")}
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
            <td>
              <input
                type="text"
                name="comments"
                value={newRow.comments}
                onChange={(e) => handleFieldChange("comments", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder="Comments"
                className="form-control input-small"
                ref={inputRefs.comments}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <FindProduct
        showModal={showModal}
        setShowModal={setShowModal}
        productList={{
          PassItemCode: newRow.itemCode.toLowerCase(),
          PassItemName: newRow.itemName.toLowerCase(),
        }}
        handleProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default InvoucherTable;
