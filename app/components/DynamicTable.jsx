import React, { useState, useRef, useMemo } from "react";
import FindProduct from "../components/FindPropduct"; // Import FindProduct component

const DynamicTable = ({ items = [] }) => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    itemCode: "",
    itemName: "",
    qty: "",
    unit: "",
    rackCode: "",
    comments: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const inputRefs = {
    itemCode: useRef(null),
    itemName: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    rackCode: useRef(null),
    comments: useRef(null),
  };

  // Add new row to the table
  const handleAddRow = () => {
    if (newRow.itemCode && newRow.itemName && newRow.qty && newRow.unit) {
      setRows((prevRows) => [
        ...prevRows,
        {
          id: prevRows.length + 1,
          ...newRow,
        },
      ]);
      setNewRow({
        itemCode: "",
        itemName: "",
        qty: "",
        unit: "",
        comments: "",
      });
      inputRefs.itemCode.current.focus();
    } else {
      alert("Please fill in all required fields.");
    }
  };

  // Handle Enter key for navigation between inputs
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

  // Handle field changes dynamically
  const handleFieldChange = (field, value) => {
    setNewRow((prev) => ({ ...prev, [field]: value }));
    if (["itemCode", "itemName"].includes(field) && value.trim()) {
      setShowModal(true);
      filterProducts(value);
    }
  };

  // Filter product list based on query
  const filterProducts = (query, field) => {
    const filtered = items.filter((item) => {
      if (field === "itemCode") {
        return item.code.toLowerCase().includes(query.toLowerCase());
      } else if (field === "itemName") {
        return item.name.toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });
    setProductList(filtered);
  };
  // Handle product selection from modal
  const handleProductSelect = (product) => {
    console.log(product);
setNewRow((prev) => ({
  ...prev,
  itemCode: product.value,
  itemName: product.name,
  unit: product.unit,
  rackCode: product.rackCode,
}));

    setShowModal(false);
    // Focus on the 'qty' input field
    setTimeout(() => {
      inputRefs.qty.current?.focus();
    }, 0);
  };

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return items.filter(
      (item) =>
        item.code.toLowerCase().includes(newRow.itemCode.toLowerCase()) ||
        item.name.toLowerCase().includes(newRow.itemName.toLowerCase())
    );
  }, [items, newRow.itemCode, newRow.itemName]);

  return (
    <div>
      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Unit</th>
            <th>Rackcode</th>
            <th>Qty</th>
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
                name="rackcode"
                value={newRow.rackCode}
                onChange={(e) => handleFieldChange("rackcode", e.target.value)}
                placeholder="Rackcode"
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
                onKeyDown={(e) => handleKeyDown(e, "comments")}
                placeholder="Qty"
                className="form-control input-small"
                ref={inputRefs.qty}
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

      {/* FindProduct Modal */}
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

export default DynamicTable;
