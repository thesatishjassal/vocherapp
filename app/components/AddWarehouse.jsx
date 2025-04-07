import React from "react";

const AddWarehouse = ({
  showModal,
  setShowModal,
  handleSubmit,
  handleChange,
  formData,
}) => {
  if (!showModal) return null;

  return (
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
      <div className="modal-dialog addwarehouseform">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="staticBackdropLabel">
              Add Warehouse
            </h1>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            ><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="modal-body py-3">
            <form onSubmit={handleSubmit} className="row g-2">
              <div className="col-md-6">
                <input
                  type="text"
                  name="warehouseName"
                  placeholder="Warehouse Name"
                  value={formData.warehouseName}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="modal-footer">
                <div className="col-12 text-end">
                  <button
                    type="button"
                    className="btn btn-secondary ms-2"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Add Client
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

export default AddWarehouse;
