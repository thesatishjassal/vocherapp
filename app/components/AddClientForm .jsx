"use client";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ClientDetailsModal from "../components/ClientDetailsModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import GetClients from "./getClients";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Validation schema with Yup
const validationSchema = Yup.object({
  client_name: Yup.string().required("Client Name is required"),
  address: Yup.string().required("Address is required"),
  gst_number: Yup.string().required("GST Number is required"),
  client_phone: Yup.string().required("Contact Number is required"),
  client_email: Yup.string().email("Invalid email format").required("Email is required"),
  client_type: Yup.string().required("Client Type is required"),
  businessname: Yup.string().required("Business Name is required"),
  pincode: Yup.string().required("Pincode is required"),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
});

const AddClientForm = () => {
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const formik = useFormik({
    initialValues: {
      client_name: "",
      address: "",
      gst_number: "",
      client_phone: "",
      client_email: "",
      client_type: "",
      businessname: "",
      pincode: "",
      city: "",
      state: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log("Form values:", values);
        const response = await axios.post(`${API_URL}/clients/`, values);
        toast.success("Client added successfully!");

        setClients((prevClients) => [...prevClients, response.data]);
        resetForm(); // Reset form on success
        setShowModal(false);
      } catch (error) {
        console.error("Add client error:", error);
        if (error.response.data.detail === "Phone Number already exists!") {
          toast.error("Phone Number already exists!");
        } else {
          toast.error("Failed to add client. Please try again.");
        }
      }
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
              <GetClients />
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
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">
                          Add New Client
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                          aria-label="Close"
                        >
                          ×
                        </button>
                      </div>
                      <div className="modal-body py-3">
                        <form onSubmit={formik.handleSubmit} className="row g-2">
                          {/* Business Details Field Group */}
                          <fieldset className="col-12">
                            <legend className="fs-5 my-2">Business Details</legend>
                            <div className="row">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="businessname"
                                  placeholder="Business Name"
                                  value={formik.values.businessname}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.businessname && formik.errors.businessname
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  name="gst_number"
                                  placeholder="GST Number"
                                  value={formik.values.gst_number}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.gst_number && formik.errors.gst_number
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
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
                                  name="client_name"
                                  placeholder="Client Name"
                                  value={formik.values.client_name}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.client_name && formik.errors.client_name
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="tel"
                                  name="client_phone"
                                  placeholder="Contact Number"
                                  value={formik.values.client_phone}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.client_phone && formik.errors.client_phone
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="email"
                                  name="client_email"
                                  placeholder="Email Address"
                                  value={formik.values.client_email}
                                  onChange={handleChange}
                                  className={`form-control mb-0 ${
                                    formik.touched.client_email && formik.errors.client_email
                                      ? "border-danger"
                                      : ""
                                  }`}
                                />
                              </div>
                              <div className="col-md-6 mt-2">
                                <select
                                  name="client_type"
                                  value={formik.values.client_type}
                                  onChange={handleChange}
                                  className={`form-select ${
                                    formik.touched.client_type && formik.errors.client_type
                                      ? "border-danger"
                                      : ""
                                  }`}
                                >
                                  <option disabled>Select Client Type</option>
                                  <option value="Retail">Vendor</option>
                                  <option value="Wholesale">Customer</option>
                                  <option value="Other">Other</option>
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
