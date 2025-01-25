import React, { useState } from "react";
import Select from "react-select";

const DynamicTable = () => {
  const [rows, setRows] = useState([
    {
      id: 1,
      sku: "SKU-FAN001",
      itemName: "Ceiling Fan",
      qty: 1,
      rackCode: "A1",
      unit: "pcs",
      rate: 50,
      discount: "0%", // Discount in percentage
      amount: 50,
      comments: "Energy-efficient fan",
    },
    {
      id: 2,
      sku: "SKU-LIGHT001",
      itemName: "Fancy Light Bollard",
      qty: 2,
      rackCode: "B2",
      unit: "pcs",
      rate: 150,
      discount: "0%", // Discount in percentage
      amount: 300,
      comments: "Outdoor decorative lighting",
    },
  ]);

  const [editingRow, setEditingRow] = useState(null);
  const [formData, setFormData] = useState({
    sku: "",
    itemName: "",
    qty: "",
    rackCode: "",
    unit: "",
    rate: "",
    discount: "",
    comments: "",
  });
  const [showModal, setShowModal] = useState(false);

  const productitemOptions = [
    { label: "Item 1", value: "item1" },
    { label: "Item 2", value: "item2" },
    { label: "Item 3", value: "item3" },
    { label: "Item 4", value: "item4" },
    { label: "Item 5", value: "item5" },
  ];

  const calculateAmount = (qty, rate, discount) => {
    const discountValue = parseFloat(discount.replace("%", "")) || 0;
    const total = qty * rate;
    return total - (total * discountValue) / 100;
  };

  const handleAddRow = () => {
    const { qty, rate, discount } = formData;
    const amount = calculateAmount(parseFloat(qty), parseFloat(rate), discount);

    const newRow = {
      id: rows.length + 1,
      ...formData,
      qty: parseFloat(qty),
      rate: parseFloat(rate),
      discount: discount || "0%",
      amount,
    };

    setRows([...rows, newRow]);
    setFormData({});
    setShowModal(false);
  };

  const handleEditRow = (id) => {
    const row = rows.find((row) => row.id === id);
    setEditingRow(id);
    setFormData(row);
    setShowModal(true);
  };

  const handleSaveRow = () => {
    const { qty, rate, discount } = formData;
    const amount = calculateAmount(parseFloat(qty), parseFloat(rate), discount);

    setRows(
      rows.map((row) =>
        row.id === editingRow
          ? {
              ...formData,
              id: editingRow,
              qty: parseFloat(qty),
              rate: parseFloat(rate),
              discount: discount || "0%",
              amount,
            }
          : row
      )
    );

    setEditingRow(null);
    setFormData({});
    setShowModal(false);
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  return (
    <div>
      <table className="table align-items-center justify-content-center mb-0">
        <thead>
          <tr>
            <th>SR NO</th>
            <th>SKU</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>Rack Code</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Discount</th>
            <th>Amount</th>
            <th>Comments</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>{row.sku}</td>
              <td>{row.itemName}</td>
              <td>{row.qty}</td>
              <td>{row.rackCode}</td>
              <td>{row.unit}</td>
              <td>
                <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                {row.rate.toFixed(2)}
              </td>
              <td>{row.discount}</td>
              <td>
                <i className="fa-solid fa-indian-rupee-sign"></i>{" "}
                {row.amount.toFixed(2)}
              </td>
              <td>{row.comments}</td>
              <td>
                <i
                  className="fas fa-edit"
                  style={{ cursor: "pointer", marginRight: "10px" }}
                  onClick={() => handleEditRow(row.id)}
                ></i>
                <i
                  className="fas fa-trash"
                  style={{ cursor: "pointer", color: "red" }}
                  onClick={() => handleDeleteRow(row.id)}
                ></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        className="btn btn-primary"
        onClick={() => setShowModal(true)}
      >
        Add New
      </button>

      {showModal && (
        <div className="modal fade show" style={{ display: "block" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingRow ? "Edit Product" : "Add New Product"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <input
                    type="text"
                    placeholder="SKU"
                    value={formData.sku || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                  />
                  <Select
                    options={productitemOptions}
                    value={productitemOptions.find(
                      (option) => option.value === formData.itemName
                    )}
                    onChange={(selectedOption) =>
                      setFormData({
                        ...formData,
                        itemName: selectedOption ? selectedOption.value : "",
                      })
                    }
                    placeholder="Select Item"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={formData.qty || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, qty: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={formData.rate || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                  />
                  <input
                    type="text"
                    placeholder="Discount in %"
                    value={formData.discount || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, discount: e.target.value })
                    }
                  />
                  <textarea
                    placeholder="Comments"
                    value={formData.comments || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={editingRow ? handleSaveRow : handleAddRow}
                  >
                    {editingRow ? "Update" : "Add"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;
