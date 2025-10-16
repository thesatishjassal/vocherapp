"use client";
import React, { useState } from "react";

const PurchaseOrderInfo = ({ setInfoModal, onConfirm }) => {
  const [formData, setFormData] = useState({
    Salesperson: "",
    Subject: "",
    PaymentMethod: "",
    AmountPaid: "",
    AmountToPay: "",
    FreightStatus: "",
    refredBy: "", // ✅ New field
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
    setFormData({
      Salesperson: "",
      Subject: "",
      PaymentMethod: "",
      AmountPaid: "",
      AmountToPay: "",
      FreightStatus: "",
      refredBy: "", // ✅ Reset new field
    });
    setInfoModal(false);
  };

  return (
    <>
      {setInfoModal && (
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
          <div className="modal-dialog addclientform modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">
                  Sales Order Details
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInfoModal(false)}
                  aria-label="Close"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="modal-body py-3">
                <form onSubmit={handleSubmit} className="row g-3">
                  {/* Salesperson */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="Salesperson"
                      placeholder="Salesperson"
                      value={formData.Salesperson}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Subject */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="Subject"
                      placeholder="Subject"
                      value={formData.Subject}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* ✅ Issue Slip No */}
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="refredBy"
                      placeholder="Referred By"
                      value={formData.refredBy}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="col-md-6">
                    <select
                      name="PaymentMethod"
                      value={formData.PaymentMethod}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Payment Method</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                      <option value="GPay">GPay</option>
                    </select>
                  </div>

                  {/* Freight Dropdown */}
                  <div className="col-md-6">
                    <select
                      name="FreightStatus"
                      value={formData.FreightStatus}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Freight</option>
                      <option value="Paid">Paid</option>
                      <option value="To Pay">To Pay</option>
                    </select>
                  </div>

                  {/* Footer */}
                  <div className="modal-footer mt-3">
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

export default PurchaseOrderInfo;
