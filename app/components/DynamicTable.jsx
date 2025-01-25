import React, { useState, useRef } from "react";
import FindProduct from "../components/FindPropduct";  // Import FindProduct component

const DynamicTable = () => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    itemCode: "",
    itemName: "",
    qty: "",
    unit: "",
    comments: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const inputRefs = {
    itemCode: useRef(null),
    itemName: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    comments: useRef(null),
  };

  const handleAddRow = () => {
    if (newRow.itemCode && newRow.itemName && newRow.qty && newRow.unit) {
      setRows([
        ...rows,
        {
          id: rows.length + 1,
          itemCode: newRow.itemCode,
          itemName: newRow.itemName,
          qty: newRow.qty,
          unit: newRow.unit,
          comments: newRow.comments,
        },
      ]);
      setNewRow({ itemCode: "", itemName: "", qty: "", unit: "", comments: "" });
    } else {
      alert("Please fill in all required fields.");
    }
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter") {
      e.preventDefault(); 
      if (nextField && inputRefs[nextField]) {
        inputRefs[nextField].current.focus(); 
      } else {
        handleAddRow(); 
        setTimeout(() => {
          inputRefs.itemCode.current.focus();
        }, 100);
      }
    }
  };

  // Trigger modal when typing in itemCode or itemName
  const handleItemCodeChange = (e) => {
    setNewRow({ ...newRow, itemCode: e.target.value });
    if (e.target.value.trim()) {
      setShowModal(true); // Show modal if input is not empty
      filterProducts(e.target.value);
    }
  };

  const handleItemNameChange = (e) => {
    setNewRow({ ...newRow, itemName: e.target.value });
    if (e.target.value.trim()) {
      setShowModal(true); // Show modal if input is not empty
      filterProducts(e.target.value);
    }
  };

  // Filter product list based on item code or name
  const filterProducts = (query) => {
    const filtered = items.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
    setProductList(filtered);
  };

  const handleProductSelect = (product) => {
    setNewRow({ ...newRow, itemName: product });
    setShowModal(false);
  };

  return (
    <div>
      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Unit</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>{row.itemCode}</td>
              <td>{row.itemName}</td>
              <td>{row.qty}</td>
              <td>{row.unit}</td>
              <td>{row.comments}</td>
            </tr>
          ))}
          <tr>
            <td>#</td>
            <td>
              <input
                type="text"
                name="itemCode"
                value={newRow.itemCode}
                onChange={handleItemCodeChange}
                onKeyDown={(e) => handleKeyDown(e, "itemName")}
                placeholder="Enter item code"
                className="form-control"
                ref={inputRefs.itemCode}
              />
            </td>
            <td>
              <input
                type="text"
                name="itemName"
                value={newRow.itemName}
                onChange={handleItemNameChange}
                onKeyDown={(e) => handleKeyDown(e, "qty")}
                placeholder="Enter item name"
                className="form-control"
                ref={inputRefs.itemName}
              />
            </td>
            <td>
              <input
                type="number"
                name="qty"
                value={newRow.qty}
                onChange={(e) => setNewRow({ ...newRow, qty: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, "unit")}
                placeholder="Qty"
                className="form-control"
                ref={inputRefs.qty}
              />
            </td>
            <td>
              <input
                type="text"
                name="unit"
                value={newRow.unit}
                onChange={(e) => setNewRow({ ...newRow, unit: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, "comments")}
                placeholder="Enter unit"
                className="form-control"
                ref={inputRefs.unit}
              />
            </td>
            <td>
              <input
                type="text"
                name="comments"
                value={newRow.comments}
                onChange={(e) => setNewRow({ ...newRow, comments: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder="Comments"
                className="form-control"
                ref={inputRefs.comments}
              />
            </td>
          </tr>
        </tbody>
      </table>

      {/* FindProduct Modal */}
      <FindProduct
        showModal={showModal}
        setShowModal={setShowModal}
        productList={productList}
        handleProductSelect={handleProductSelect}
      />
    </div>
  );
};

export default DynamicTable;
