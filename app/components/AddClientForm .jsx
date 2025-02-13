"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClientDetailsModal from "../components/ClientDetailsModal";

// Validation schema with Yup
const validationSchema = Yup.object({
  clientName: Yup.string().required("Client Name is required"),
  address: Yup.string().required("Address is required"),
  gstNumber: Yup.string().required("GST Number is required"),
  contactNumber: Yup.string()
    .matches(/^\d{10}$/, "Invalid contact number")
    .required("Contact Number is required"),
  emailAddress: Yup.string().email("Invalid email format").required("Email is required"),
  clientType: Yup.string().required("Client Type is required"),
  businessName: Yup.string().required("Business Name is required"),
  pincode: Yup.string().required("Pincode is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
});

const AddClientForm = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      clientName: "",
      address: "",
      gstNumber: "",
      contactNumber: "",
      emailAddress: "",
      clientType: "Retail",
      businessName: "",
      pincode: "",
      city: "",
      state: "",
    },
    validationSchema,
    onSubmit: (values) => {
      // Handle submit logic (e.g., send to API)
      setClients((prevClients) => [...prevClients, values]);
      setShowModal(false); // Close modal on submit
    },
  });

  const handleChange = (e) => {
    formik.handleChange(e);
  };

  return (
    <div className="container mt-2 px-0">
      <div className="row container mx-auto my-3 p-0">
        <div className="col-12 p-0">
          <div className="card mb-4">
            <div className="card-header pb-0">
              <h6>Client Invoices</h6>
            </div>
            <div className="card-body py-0 pt-0 pb-2">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <input
                  type="text"
                  placeholder="Search by Client or Project"
                  className="form-control w-25"
                  value={formik.values.searchTerm}
                  onChange={formik.handleChange}
                />
                <button
                  className="btn add_warehouse btn-primary"
                  onClick={() => setShowModal(true)}
                >
                  Add New
                </button>
              </div>

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
                  <div className="modal-dialog addclientform">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1
                          className="modal-title fs-5"
                          id="staticBackdropLabel"
                        >
                          Add New Client
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                          aria-label="Close"
                        >×</button>
                      </div>
                      <div className="modal-body  py-3 ">
                        <form onSubmit={formik.handleSubmit} className="row g-2">
                          {/* Business Details Field Group */}
                          <fieldset className="col-12">
                            <legend className="fs-5 my-2">Business Details</legend>
                            <div className="row">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="businessName"
                                  placeholder="Business Name"
                                  value={formik.values.businessName}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.businessName && formik.errors.businessName
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.businessName && formik.errors.businessName && (
                                  <label className="text-danger">{formik.errors.businessName}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="gstNumber"
                                  placeholder="GST Number"
                                  value={formik.values.gstNumber}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.gstNumber && formik.errors.gstNumber
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.gstNumber && formik.errors.gstNumber && (
                                  <label className="text-danger">{formik.errors.gstNumber}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="address"
                                  placeholder="Address"
                                  value={formik.values.address}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.address && formik.errors.address
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.address && formik.errors.address && (
                                  <label className="text-danger">{formik.errors.address}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="pincode"
                                  placeholder="Pincode"
                                  value={formik.values.pincode}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.pincode && formik.errors.pincode
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.pincode && formik.errors.pincode && (
                                  <label className="text-danger">{formik.errors.pincode}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="city"
                                  placeholder="City"
                                  value={formik.values.city}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.city && formik.errors.city
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.city && formik.errors.city && (
                                  <label className="text-danger">{formik.errors.city}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="state"
                                  placeholder="State"
                                  value={formik.values.state}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.state && formik.errors.state
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.state && formik.errors.state && (
                                  <label className="text-danger">{formik.errors.state}</label>
                                )}
                              </div>
                            </div>
                          </fieldset>

                          {/* Contact Details Field Group */}
                          <fieldset className="col-12">
                            <legend className="fs-5 my-2">Contact Details</legend>
                            <div className="row">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="clientName"
                                  placeholder="Client Name"
                                  value={formik.values.clientName}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.clientName && formik.errors.clientName
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.clientName && formik.errors.clientName && (
                                  <label className="text-danger">{formik.errors.clientName}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="tel"
                                  name="contactNumber"
                                  placeholder="Contact Number"
                                  value={formik.values.contactNumber}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.contactNumber && formik.errors.contactNumber
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.contactNumber && formik.errors.contactNumber && (
                                  <label className="text-danger">{formik.errors.contactNumber}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="email"
                                  name="emailAddress"
                                  placeholder="Email Address"
                                  value={formik.values.emailAddress}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.emailAddress && formik.errors.emailAddress
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                                {formik.touched.emailAddress && formik.errors.emailAddress && (
                                  <label className="text-danger">{formik.errors.emailAddress}</label>
                                )}
                              </div>
                              <div className="col-md-6">
                                <select
                                  name="clientType"
                                  value={formik.values.clientType}
                                  onChange={handleChange}
                                  className={`form-select ${
                                    formik.touched.clientType && formik.errors.clientType
                                      ? "border-danger"
                                      : ""
                                  }`}
                                >
                                  <option disabled>Select Client Type</option>
                                  <option value="Retail">Vendor</option>
                                  <option value="Wholesale">Customer</option>
                                  <option value="Other">Other</option>
                                </select>
                                {formik.touched.clientType && formik.errors.clientType && (
                                  <label className="text-danger">{formik.errors.clientType}</label>
                                )}
                              </div>
                            </div>
                          </fieldset>

                          {/* Form Footer */}
                          <div className="modal-footer col-12">
                            <div className="text-end">
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddClientForm;
