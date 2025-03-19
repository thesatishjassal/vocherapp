"use client";
import React, { useState } from "react";

const BasicInfoModal = ({ setInfoModal, onConfirm }) => {
  const [formData, setFormData] = useState({
    IssueSlipNo: "",
    SaleOrderNo: "",
    Transport: "",
    VehicleNo: "",
    Packages: "",
    OrderBy: "",
    SalePerson: "",
    FreightAmount: "",
    ReceiverName: "",
    ContactNumber: "",
    transaction_types: "Transfer",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
    setInfoModal(false);
  };

  return (
    <>
      {setInfoModal && (
        <div
          className="modal fade show"
          id="basicInfoModal"
          tabIndex="-1"
          aria-labelledby="basicInfoModalLabel"
          aria-hidden="true"
          style={{ display: "block", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-3">
              <div className="modal-header">
                <h5 className="modal-title" id="basicInfoModalLabel">
                  Basic Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInfoModal(false)}
                  aria-label="Close"
                ><i class="fa-solid fa-xmark"></i></button>
              </div>

              <div className="modal-body">
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* First Row */}
                  <div className="col-6 col-md-6">
                    <label className="form-label">Issue Slip No</label>
                    <input
                      type="text"
                      name="IssueSlipNo"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 col-md-6">
                    <label className="form-label">Sale Order No</label>
                    <input
                      type="text"
                      name="SaleOrderNo"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Second Row */}
                  <div className="col-6 col-md-6">
                    <label className="form-label">Transaction Type</label>
                    <select
                      name="transaction_types"
                      className="form-select"
                      value={formData.transaction_types}
                      onChange={handleChange}
                      required
                    >
                      <option value="Transfer">Transfer</option>
                      <option value="Return">Return</option>
                      <option value="To customer">To customer</option>
                    </select>
                  </div>
                  <div className="col-6 col-md-6">
                    <label className="form-label">Transport</label>
                    <input
                      type="text"
                      name="Transport"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Third Row */}
                  <div className="col-6 col-md-6">
                    <label className="form-label">Vehicle No</label>
                    <input
                      type="text"
                      name="VehicleNo"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 col-md-6">
                    <label className="form-label">Packages</label>
                    <input
                      type="text"
                      name="Packages"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Fourth Row */}
                  <div className="col-6 col-md-6">
                    <label className="form-label">Order By</label>
                    <input
                      type="text"
                      name="OrderBy"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 col-md-6">
                    <label className="form-label">Sale Person</label>
                    <input
                      type="text"
                      name="SalePerson"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Fifth Row */}
                  <div className="col-6 col-md-6">
                    <label className="form-label">Freight Amount</label>
                    <input
                      type="number"
                      name="FreightAmount"
                      className="form-control"
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-6 col-md-6">
                    <label className="form-label">Receiver Name</label>
                    <input
                      type="text"
                      name="ReceiverName"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  {/* Sixth Row */}
                  <div className="col-6 col-md-6">
                    <label className="form-label">Receiver Mobile</label>
                    <input
                      type="text"
                      name="ContactNumber"
                      className="form-control"
                      onChange={handleChange}
                    />
                  </div>

                  {/* Modal Footer */}
                  <div className="modal-footer d-flex justify-content-end gap-2">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setInfoModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Confirm & Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BasicInfoModal;
