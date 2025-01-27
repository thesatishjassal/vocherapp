"use client";
import React, { useState } from "react";

const ReciverDetails = ({setInfoModal }) => {
    console.log(setInfoModal)
  const [formData, setFormData] = useState({
    clientName: "",
    ModeofTransport: "",
    InvoiceDate: "",
    contactNumber: "",
    emailAddress: "",
    clientType: "Retail",
    InvoiceNumber: "", 
    NumberofPackages: "", 
    SalePerson: "", 
    state: "", 
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
    setClients((prevClients) => [...prevClients, formData]);
    setFormData({
      clientName: "",
      ModeofTransport: "",
      InvoiceDate: "",
      contactNumber: "",
      emailAddress: "",
      clientType: "Retail",
      InvoiceNumber: "", 
      NumberofPackages: "", 
      SalePerson: "", 
      state: "", 
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
          <div className="modal-dialog addclientform  modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h1 className="modal-title fs-5" id="staticBackdropLabel">
                Reciver Details
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBasicInfoModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body  py-3 ">
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
                          type="text"
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
                          name="Mode of Transport"
                          placeholder="Mode of Transport"
                          value={formData.ModeofTransport}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <input
                          type="text"
                          name="Number of Packages"
                          placeholder="Number of Packages"
                          value={formData.NumberofPackages}
                          onChange={handleChange}
                          className="form-control"
                          required
                        />
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
