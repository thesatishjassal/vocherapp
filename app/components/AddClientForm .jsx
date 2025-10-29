"use client";

import React, { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import GetClients from "./getClients";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Validation schema
const validationSchema = Yup.object({
  client_name: Yup.string().required("Client Name is required"),
  address: Yup.string(),
  gst_number: Yup.string(),
  client_phone: Yup.string().required("Contact Number is required"),
  client_email: Yup.string().email("Invalid email format"),
  client_type: Yup.string().required("Client Type is required"),
  businessname: Yup.string(),
  pincode: Yup.string(),
  city: Yup.string().required("City is required"),
  state: Yup.string().required("State is required"),
});

const AddClientForm = () => {
  const [userDetails, setUserDetails] = useState(null);
  created_by: userDetails ? userDetails.name : "";
   
  useEffect(() => {
    // Try to get the user_details cookie
    const userDetailsCookie = Cookies.get("user_details");
    console.log("User Details Cookie:", userDetailsCookie);
    if (userDetailsCookie) {
      // Parse and set the user details if the cookie exists
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);

  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClientId, setNewClientId] = useState(null);

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
      created_by: created_by
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const response = await axios.post(`${API_URL}/clients/`, values);
        toast.success("Client added successfully!");
        setClients((prevClients) => [response.data, ...prevClients]); // Add new client to top
        setNewClientId(response.data.id); // Track new client for highlight
        resetForm();
        setShowModal(false);
        window.location.reload();
      } catch (error) {
        console.error("Add client error:", error);
        if (error.response?.data?.detail === "Phone Number already exists!") {
          toast.error("Phone Number already exists!");
        } else {
          toast.error("Failed to add client. Please try again.");
        }
      }
    },
  });

  // Fetch clients on mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get(`${API_URL}/clients/`);
        setClients(response.data.reverse()); // Reverse to show newest first
      } catch (error) {
        console.error("Fetch clients error:", error);
        toast.error("Failed to fetch clients.");
      }
    };
    fetchClients();
  }, []);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mt-4 px-0">
      <div className="row mx-auto p-0">
        <div className="col-12 p-0">
          <div className="card shadow-sm mb-4 rounded-3">
            <div className="card-header text-white p-3">
              <h6 className="mb-0">Client Invoices</h6>
            </div>
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3 gap-2">
                <input
                  type="text"
                  placeholder="Search by Client, Business, or Phone"
                  className="form-control w-100 w-md-50"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  aria-label="Search clients"
                />
                <button
                  className="btn btn-primary w-100 w-md-auto"
                  onClick={() => setShowModal(true)}
                  aria-label="Add New Client"
                >
                  Add New
                </button>
              </div>
              <GetClients
                clients={clients.filter((client) =>
                  `${client.client_name} ${client.businessname} ${client.client_phone}`
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())
                )}
                newClientId={newClientId}
                refreshClients={() => {
                  const fetchClients = async () => {
                    try {
                      const response = await axios.get(`${API_URL}/clients/`);
                      setClients(response.data.reverse());
                    } catch (error) {
                      console.error("Fetch clients error:", error);
                      toast.error("Failed to fetch clients.");
                    }
                  };
                  fetchClients();
                }}
              />
              {showModal && (
                <div
                  className="modal fade show"
                  id="staticBackdrop"
                  tabIndex="-1"
                  aria-labelledby="staticBackdropLabel"
                  aria-hidden={!showModal}
                  style={{
                    display: "block",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    transition: "opacity 0.3s",
                  }}
                >
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content rounded-4">
                      <div className="modal-header border-0 p-4">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">
                          Add New Client
                        </h1>
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setShowModal(false)}
                          aria-label="Close"
                        >
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                      <div className="modal-body p-4">
                        <form onSubmit={formik.handleSubmit} className="row g-3">
                          <fieldset className="col-12">
                            <div className="row g-3">
                              <div className="col-6 col-md-6">
                                <label htmlFor="businessname" className="form-label">
                                  Business Name
                                </label>
                                <input
                                  type="text"
                                  id="businessname"
                                  name="businessname"
                                  placeholder="Enter Business Name"
                                  value={formik.values.businessname}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.businessname && formik.errors.businessname
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.businessname && formik.errors.businessname && (
                                  <div className="invalid-feedback">
                                    {formik.errors.businessname}
                                  </div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="gst_number" className="form-label">
                                  GST Number
                                </label>
                                <input
                                  type="text"
                                  id="gst_number"
                                  name="gst_number"
                                  placeholder="Enter GST Number"
                                  value={formik.values.gst_number}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.gst_number && formik.errors.gst_number
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.gst_number && formik.errors.gst_number && (
                                  <div className="invalid-feedback">
                                    {formik.errors.gst_number}
                                  </div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="address" className="form-label">
                                  Address
                                </label>
                                <input
                                  type="text"
                                  id="address"
                                  name="address"
                                  placeholder="Enter Address"
                                  value={formik.values.address}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.address && formik.errors.address
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.address && formik.errors.address && (
                                  <div className="invalid-feedback">{formik.errors.address}</div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="pincode" className="form-label">
                                  Pincode
                                </label>
                                <input
                                  type="text"
                                  id="pincode"
                                  name="pincode"
                                  placeholder="Enter Pincode"
                                  value={formik.values.pincode}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.pincode && formik.errors.pincode
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.pincode && formik.errors.pincode && (
                                  <div className="invalid-feedback">{formik.errors.pincode}</div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="city" className="form-label">
                                  City
                                </label>
                                <input
                                  type="text"
                                  id="city"
                                  name="city"
                                  placeholder="Enter City"
                                  value={formik.values.city}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.city && formik.errors.city ? "is-invalid" : ""
                                  }`}
                                />
                                {formik.touched.city && formik.errors.city && (
                                  <div className="invalid-feedback">{formik.errors.city}</div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="state" className="form-label">
                                  State
                                </label>
                                <input
                                  type="text"
                                  id="state"
                                  name="state"
                                  placeholder="Enter State"
                                  value={formik.values.state}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.state && formik.errors.state ? "is-invalid" : ""
                                  }`}
                                />
                                {formik.touched.state && formik.errors.state && (
                                  <div className="invalid-feedback">{formik.errors.state}</div>
                                )}
                              </div>
                            </div>
                          </fieldset>
                          <fieldset className="col-12">
                            <div className="row g-3">
                              <div className="col-6 col-md-6">
                                <label htmlFor="client_name" className="form-label">
                                  Client Name
                                </label>
                                <input
                                  type="text"
                                  id="client_name"
                                  name="client_name"
                                  placeholder="Enter Client Name"
                                  value={formik.values.client_name}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.client_name && formik.errors.client_name
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.client_name && formik.errors.client_name && (
                                  <div className="invalid-feedback">
                                    {formik.errors.client_name}
                                  </div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="client_phone" className="form-label">
                                  Contact Number
                                </label>
                                <input
                                  type="tel"
                                  id="client_phone"
                                  name="client_phone"
                                  placeholder="Enter Contact Number"
                                  value={formik.values.client_phone}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.client_phone && formik.errors.client_phone
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.client_phone && formik.errors.client_phone && (
                                  <div className="invalid-feedback">
                                    {formik.errors.client_phone}
                                  </div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="client_email" className="form-label">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  id="client_email"
                                  name="client_email"
                                  placeholder="Enter Email Address"
                                  value={formik.values.client_email}
                                  onChange={formik.handleChange}
                                  className={`form-control ${
                                    formik.touched.client_email && formik.errors.client_email
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                />
                                {formik.touched.client_email && formik.errors.client_email && (
                                  <div className="invalid-feedback">
                                    {formik.errors.client_email}
                                  </div>
                                )}
                              </div>
                              <div className="col-6 col-md-6">
                                <label htmlFor="client_type" className="form-label">
                                  Client Type
                                </label>
                                <select
                                  id="client_type"
                                  name="client_type"
                                  value={formik.values.client_type}
                                  onChange={formik.handleChange}
                                  className={`form-select ${
                                    formik.touched.client_type && formik.errors.client_type
                                      ? "is-invalid"
                                      : ""
                                  }`}
                                >
                                  <option value="">Select Client Type</option>
                                  <option value="Vendor">Vendor</option>
                                  <option value="Customer">Customer</option>
                                  <option value="Other">Other</option>
                                </select>
                                {formik.touched.client_type && formik.errors.client_type && (
                                  <div className="invalid-feedback">
                                    {formik.errors.client_type}
                                  </div>
                                )}
                              </div>
                            </div>
                          </fieldset>
                          <div className="modal-footer border-0 p-4">
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowModal(false)}
                                aria-label="Cancel"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="btn btn-success"
                                aria-label="Add Client"
                              >
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
      <ToastContainer />
    </div>
  );
};

export default AddClientForm;