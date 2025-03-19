"use client"; // Added "use client" directive for Next.js
import React, { useState } from "react";

const ReciverDetails = ({ setInfoModal, onConfirm }) => {
  const [formData, setFormData] = useState({
    ModeofTransport: "",
    InvoiceDate: "",
    InvoiceNumber: "",
    NumberofPackages: "",
    Freight: "",
    transactionType: "",
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
                  Receiver Details
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInfoModal(false)}
                  aria-label="Close"
                ><i class="fa-solid fa-xmark"></i></button>
              </div>
              <div className="modal-body py-3">
                <form onSubmit={handleSubmit} className="row g-3"> {/* Increased gap with g-3 */}
                  <fieldset className="col-12">
                    <div className="row">
                      <div className="col-md-4 col-sm-6 mb-2"> {/* Adjusted to col-md-4 */}
                        <label htmlFor="InvoiceNumber" className="form-label">
                          Invoice Number
                        </label>
                        <input
                          type="text"
                          id="InvoiceNumber"
                          name="InvoiceNumber"
                          placeholder="Invoice Number"
                          value={formData.InvoiceNumber}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-4 col-sm-6 mb-2"> {/* Adjusted to col-md-4 */}
                        <label htmlFor="InvoiceDate" className="form-label">
                          Invoice Date
                        </label>
                        <input
                          type="date"
                          id="InvoiceDate"
                          name="InvoiceDate"
                          value={formData.InvoiceDate}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-4 col-sm-6 mb-2"> {/* Adjusted to col-md-4 */}
                        <label htmlFor="ModeofTransport" className="form-label">
                          Mode of Transport
                        </label>
                        <input
                          type="text"
                          id="ModeofTransport"
                          name="ModeofTransport"
                          placeholder="Mode of Transport"
                          value={formData.ModeofTransport}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-4 col-sm-6 mb-2"> {/* Adjusted to col-md-4 */}
                        <label htmlFor="NumberofPackages" className="form-label">
                          Number of Packages
                        </label>
                        <input
                          type="number"
                          id="NumberofPackages"
                          name="NumberofPackages"
                          placeholder="Number of Packages"
                          value={formData.NumberofPackages}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-4 col-sm-6 mb-2"> {/* Adjusted to col-md-4 */}
                        <label htmlFor="Freight" className="form-label">
                          Freight
                        </label>
                        <select
                          id="Freight"
                          name="Freight"
                          value={formData.Freight}
                          onChange={handleChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select Freight</option>
                          <option value="Paid">Paid</option>
                          <option value="To Pay">To Pay</option>
                        </select>
                      </div>
                      <div className="col-md-4 col-sm-6 mb-2"> {/* Adjusted to col-md-4 */}
                        <label htmlFor="transactionType" className="form-label">
                          Transaction Type
                        </label>
                        <select
                          id="transactionType"
                          name="transactionType"
                          value={formData.transactionType}
                          onChange={handleChange}
                          className="form-select"
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="Transfer">Transfer</option>
                          <option value="Return">Return</option>
                          <option value="ToCustomer">To Customer</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  {/* Form Footer */}
                  <div className="modal-footer col-12">
                    <div className="text-end">
                      <button
                        type="button"
                        className="btn btn-secondary ms-2"
                        onClick={() => setInfoModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-success ms-2">
                        Confirm & Update
                      </button>
                    </div>
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

export default ReciverDetails;