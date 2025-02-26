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
    onConfirm(formData); // ✅ Send data to parent component
    setInfoModal(false); // Close modal
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
                ></button>
              </div>
              <div className="modal-body py-3">
                <form onSubmit={handleSubmit} className="row g-2">
                  <fieldset className="col-12">
                    <div className="row">
                      <div className="col-md-6">
                        <input
                          type="text"
                          name="InvoiceNumber"
                          placeholder="Invoice Number"
                          value={formData.InvoiceNumber}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="date"
                          name="InvoiceDate"
                          placeholder="Invoice Date"
                          value={formData.InvoiceDate}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          name="ModeofTransport"
                          placeholder="Mode of Transport"
                          value={formData.ModeofTransport}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="number"
                          name="NumberofPackages"
                          placeholder="Number of Packages"
                          value={formData.NumberofPackages}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <select
                        id="Freight"
                        name="Freight"
                        value={formData.Freight}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        <option value="Paid">Paid</option>
                        <option value="To Pay">To Pay</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <select
                        id="transactionType"
                        className="form-select"
                        name="transactionType"
                        value={formData.transactionType}
                        onChange={handleChange}
                      >
                        <option value="Transfer">Transfer</option>
                        <option value="Return">Return</option>
                        <option value="ToCustomer">To Customer</option>
                      </select>
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
                      <button type="submit" className="btn btn-success">
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
