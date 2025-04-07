"use client"
import { useState } from "react";

const RackModal = ({ showModal, handleModalToggle, addNewRack, warehouses }) => {
  const [newRack, setNewRack] = useState({
    rankName: "",
    rackCodes: "",
    warehouseName: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRack({ ...newRack, [name]: value });
  };

  const handleAddRack = () => {
    const newRackData = {
      rackId: `RK-${(Math.random() * 1000).toFixed(0).padStart(3, "0")}`,
      rankName: newRack.rankName,
      rackCodes: newRack.rackCodes.split(",").map(code => code.trim()),
      warehouseName: newRack.warehouseName,
    };
    addNewRack(newRackData); // Add the rack using the parent function
    setNewRack({ rankName: "", rackCodes: "", warehouseName: "" }); // Reset form
    handleModalToggle();  // Close the modal
  };

  return (
<div
      className={`modal fade show ${showModal ? "show" : ""}`}
      id="staticBackdrop"
      tabIndex="-1"
      aria-labelledby="staticBackdropLabel"
      aria-hidden="true"
      style={{
        display: showModal ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Add New Rack
            </h1>
            <button
              type="button"
              className="btn-close"
              onClick={handleModalToggle}
              aria-label="Close"
            ><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body py-3">
            <form onSubmit={handleAddRack} className="row g-2">
              <div className="col-md-6">
                <input
                  type="text"
                  name="rankName"
                  placeholder="Rank Name"
                  value={newRack.rankName}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="rackCodes"
                  placeholder="Rack Codes (comma separated)"
                  value={newRack.rackCodes}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-12">
                <select
                  className="form-control"
                  name="warehouseName"
                  value={newRack.warehouseName}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((warehouse, index) => (
                    <option key={index} value={warehouse}>
                      {warehouse}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-footer">
                <div className="col-12 text-end">
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={handleModalToggle}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Add Rack
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RackModal;

