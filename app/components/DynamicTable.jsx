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
      discount: "0%",
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
      discount: "0%",
      amount: 300,
      comments: "Outdoor decorative lighting",
    },
  ]);

  const handleSelectItem = (selectedOption) => {
    setFormData({
      ...formData,
      itemName: selectedOption ? selectedOption.value : "",
    });
  };
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

  const [itemOptions] = useState([
    "Ceiling Fan",
    "Fancy Light Bollard",
    "Table Lamp",
    "Chandelier",
    "Wall Sconce",
  ]);

  const handleAddRow = () => {
    const newRow = {
      id: rows.length + 1,
      ...formData,
      qty: parseInt(formData.qty, 10),
      rate: parseFloat(formData.rate),
      amount: parseFloat(formData.qty) * parseFloat(formData.rate),
    };
    setRows([...rows, newRow]);
    setFormData({});
  };

  const handleEditRow = (id) => {
    const row = rows.find((row) => row.id === id);
    setEditingRow(id);
    setFormData(row);
  };

  const handleSaveRow = () => {
    setRows(
      rows.map((row) =>
        row.id === editingRow
          ? {
              ...formData,
              id: editingRow,
              qty: parseInt(formData.qty, 10),
              rate: parseFloat(formData.rate),
              amount: parseFloat(formData.qty) * parseFloat(formData.rate),
            }
          : row
      )
    );
    setEditingRow(null);
    setFormData({});
  };

  const handleDeleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };
  const productitemOptions = [
    { label: "Item 1", value: "item1" },
    { label: "Item 2", value: "item2" },
    { label: "Item 3", value: "item3" },
    { label: "Item 4", value: "item4" },
    { label: "Item 5", value: "item5" },
    // Add more items as needed
  ];
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
              <td><i className="fa-solid fa-indian-rupee-sign"></i> {row.rate.toFixed(2)}</td>
              <td>{row.discount}</td>
              <td><i className="fa-solid fa-indian-rupee-sign"></i> {row.amount.toFixed(2)}</td>
              <td>{row.comments}</td>
              <td>
                <i
                  className="fas fa-edit"
                  style={{ cursor: "pointer", marginRight: "10px" }}
                  onClick={() => [handleEditRow(row.id), setShowModal(true)]}
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
        className="btn add_warehouse btn-primary addrow no-print"
        onClick={() => setShowModal(true)}
      >
        Add New
      </button>
      <div>
        {showModal && (
          <div
            className="modal fade show"
            id="staticBackdrop"
            tabIndex="-1"
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
            style={{
              display: "block",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="modal-dialog modal-dialog-centered addclientform">
              <div className="modal-content">
                <div className="modal-header">
                  <h1 className="modal-title fs-5" id="staticBackdropLabel">
                    Add New Product
                  </h1>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  >
                    x
                  </button>
                </div>
                <div className="modal-body py-3">
                  <form className="no-print">
                    <div className="row g-3">
                      <div className="col-md-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="SKU"
                          value={formData.sku || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, sku: e.target.value })
                          } 
                        />
                      </div>
                      <div className="col-md-6">
                        <Select
                          options={productitemOptions}
                          value={productitemOptions.find(
                            (option) => option.value === formData.itemName
                          )}
                          onChange={handleSelectItem}
                          placeholder="Select Item"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                        <datalist id="productitemOptions">
                          {productitemOptions.map((item, index) => (
                            <option key={index} value={item} />
                          ))}
                        </datalist>
                      </div>
                      <div className="col-md-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Unit"
                          value={formData.unit || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, unit: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Qty"
                          value={formData.qty || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, qty: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Rack Code"
                          value={formData.rackCode || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              rackCode: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="col-md-3">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Rate"
                          value={formData.rate || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, rate: e.target.value })
                          }
                        />
                      </div>
                      <div className="col-md-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Discount in %"
                          value={formData.discount || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              discount: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-md-12">
                        <textarea
                          type="text"
                          className="form-control w-100"
                          placeholder="Comments"
                          value={formData.comments || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              comments: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-12 text-end">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={editingRow ? handleSaveRow : handleAddRow}
                        >
                          {editingRow ? "Confirm &  Update" : "Confirm & Add "}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicTable;
