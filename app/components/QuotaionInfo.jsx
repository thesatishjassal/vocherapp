"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const QuotaionInfo = ({ setInfoModal, onConfirm }) => {
  const [formData, setFormData] = useState({
    Subject: "",
    Salesperson: "",
  });
  const [userDetails, setUserDetails] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    })); 
  };
  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      setUserDetails(JSON.parse(userDetailsCookie));
      console.log("User Details:", userDetails);
    }
  }, [userDetails]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData); // Pass data to parent component
    setFormData({
      Subject: "",
      Salesperson: userDetails.name,
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
                  Quotation Info Details
                </h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInfoModal(false)}
                  aria-label="Close"
                ><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="modal-body py-3">
                <form onSubmit={handleSubmit} className="row g-2">
                  <fieldset className="col-12">
                    <div className="row">
                      <div className="col-md-6">
                        <input
                          type="text"
                          name="Salesperson"
                          placeholder="Salesperson"
                          value={formData.Salesperson = userDetails ? userDetails.name : ""}
                          onChange={handleChange}
                          className="form-control"
                          required
                          disabled
                        />
                      </div>
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

export default QuotaionInfo;
