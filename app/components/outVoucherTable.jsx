import React, { useRef, useEffect, useState } from "react";
import FindProduct from "./FindPropduct"; // Import FindProduct component

const OutvocuherTable = ({ items = [], onRowsUpdate }) => {
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    itemcode: "",
    itemname: "",
    qty: "",
    unit: "",
    rackcode: "",
    comments: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [productList, setProductList] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const inputRefs = {
    itemcode: useRef(null),
    itemname: useRef(null),
    qty: useRef(null),
    unit: useRef(null),
    rackcode: useRef(null),
    comments: useRef(null),
  };

  useEffect(() => {
    // Detect screen size
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleAddRow = () => {
    if (newRow.itemcode && newRow.itemname && newRow.qty && newRow.unit) {
      const updatedRows = [
        ...rows,
        {
          id: rows.length + 1,
          ...newRow,
        },
      ];

      setRows(updatedRows);
      onRowsUpdate(updatedRows);

      setNewRow({
        itemcode: "",
        itemname: "",
        qty: "",
        unit: "",
        rackcode: "",
        comments: "",
      });
      inputRefs.itemcode.current.focus();
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

    if (["itemcode", "itemname"].includes(field) && value.trim()) {
      setShowModal(true);
      filterProducts(value, field);
    }
  };

  const filterProducts = (query, field) => {
    const filtered = items.filter((item) => {
      if (field === "itemcode") {
        return item.code.toLowerCase().includes(query.toLowerCase());
      } else if (field === "itemname") {
        return item.name.toLowerCase().includes(query.toLowerCase());
      }
      return false;
    });
    setProductList(filtered);
  };

  const handleProductSelect = (product) => {
    setNewRow((prev) => ({
      ...prev,
      itemcode: product.itemcode,
      itemname: product.itemname,
      unit: product.unit,
      rackcode: product.rackcode,
    }));

    setShowModal(false);
    setTimeout(() => {
      inputRefs.qty.current?.focus();
    }, 0);
  };

  return (
    <div>
      <div className="table-responsive">
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
                <td>{row.itemcode}</td>
                <td>{row.itemname}</td>
                <td>{row.unit}</td>
                <td>{row.rackcode}</td>
                <td>{row.qty}</td>
                <td>{row.comments}</td>
              </tr>
            ))}
            <tr className="no-print">
              <td>#</td>
              <td>
                <input
                  type="text"
                  name="itemcode"
                  value={newRow.itemcode}
                  onChange={(e) => handleFieldChange("itemcode", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "itemname")}
                  placeholder="Enter item code"
                  className="form-control input-small"
                  ref={inputRefs.itemcode}
                />
              </td>
              <td>
                <input
                  type="text"
                  name="itemname"
                  value={newRow.itemname}
                  onChange={(e) => handleFieldChange("itemname", e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, "qty")}
                  placeholder="Enter item name"
                  className="form-control"
                  ref={inputRefs.itemname}
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
                  value={newRow.rackcode}
                  onChange={(e) => handleFieldChange("rackcode", e.target.value)}
                  placeholder="Rackcode"
                  className="form-control input-small"
                  ref={inputRefs.rackcode}
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
      </div>

      {/* Add Row Button (Visible on mobile/tablet) */}
      {/* {isMobile && (
        <button className="btn btn-primary my-3 w-100" onClick={handleAddRow}>
          Add Row
        </button>
      )} */}

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

export default OutvocuherTable;
