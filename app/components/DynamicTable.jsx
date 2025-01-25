import React, { useState, useRef } from "react";

const DynamicTable = () => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    itemCode: "",
    itemName: "",
    qty: "",
    unit: "",
    comments: "",
  });

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
          id: rows.length + 1, // Auto-increment ID
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
      }
    }
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
              <td>{index + 1}</td> {/* Dynamically generated SR NO */}
              <td>{row.itemCode}</td> {/* Displaying Item Code */}
              <td>{row.itemName}</td> {/* Displaying Item Name */}
              <td>{row.qty}</td>
              <td>{row.unit}</td>
              <td>{row.comments}</td>
            </tr>
          ))}
          {/* Input Row for new entry */}
          <tr className="no-print">
            <td>#</td>
            <td>
              <input
                type="text"
                name="itemCode"
                value={newRow.itemCode}
                onChange={(e) =>
                  setNewRow({ ...newRow, itemCode: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, "itemName")}
                placeholder="item code"
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
                  setNewRow({ ...newRow, itemName: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, "qty")}
                placeholder="Enter item name"
                className="form-control input-large"
                ref={inputRefs.itemName}
              />
            </td>
            <td>
              <input
                type="number"
                name="qty"
                value={newRow.qty}
                onChange={(e) =>
                  setNewRow({ ...newRow, qty: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, "unit")}
                placeholder="Qty"
                className="form-control input-small"
                ref={inputRefs.qty}
              />
            </td>
            <td>
              <input
                type="text"
                name="unit"
                value={newRow.unit}
                onChange={(e) =>
                  setNewRow({ ...newRow, unit: e.target.value })
                }
                onKeyDown={(e) => handleKeyDown(e, "comments")}
                placeholder="unit"
                className="form-control input-small"
                ref={inputRefs.unit}
              />
            </td>
            <td>
              <input
                type="text"
                name="comments"
                value={newRow.comments}
                onChange={(e) =>
                  setNewRow({ ...newRow, comments: e.target.value })
                }
                onKeyDown={handleKeyDown}
                placeholder="Comments"
                className="form-control input-small"
                ref={inputRefs.comments}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DynamicTable;
