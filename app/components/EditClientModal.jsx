"use client";

import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function EditClientModal({ client, onClose, onUpdated }) {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      businessname: client?.businessname || "",
      gst_number: client?.gst_number || "",
      address: client?.address || "",
      city: client?.city || "",
      state: client?.state || "",
      pincode: client?.pincode || "",
      client_name: client?.client_name || "",
      client_phone: client?.client_phone || "",
      client_email: client?.client_email || "",
      client_type: client?.client_type || "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await axios.patch(`${API_URL}/client/${client.id}`, values);
        toast.success("Client updated successfully!");
        if (onUpdated) onUpdated(values);
        onClose();
      } catch (error) {
        console.error("Edit client error:", error);
        toast.error("Failed to update client. Please try again.");
      }
    },
  });

  const handleChange = (e) => formik.handleChange(e);

  if (!client) return null;

  return (
    <>
      <div
        className="modal fade show"
        style={{
          display: "block",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4">
            <div className="modal-header border-0 p-4">
              <h1 className="modal-title fs-5">Edit Client</h1>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              />
            </div>

            <div className="modal-body p-4">
              <form onSubmit={formik.handleSubmit} className="row g-3">
                {/* Business Details */}
                <fieldset className="col-12">
                  <div className="row g-3">
                    {[
                      ["businessname", "Business Name"],
                      ["gst_number", "GST Number"],
                      ["address", "Address"],
                      ["pincode", "Pincode"],
                      ["city", "City"],
                      ["state", "State"],
                    ].map(([name, label]) => (
                      <div className="col-6 col-md-6" key={name}>
                        <label htmlFor={name} className="form-label">
                          {label}
                        </label>
                        <input
                          id={name}
                          name={name}
                          type="text"
                          className={`form-control ${
                            formik.touched[name] && formik.errors[name]
                              ? "is-invalid"
                              : ""
                          }`}
                          value={formik.values[name]}
                          onChange={handleChange}
                        />
                        {formik.touched[name] && formik.errors[name] && (
                          <div className="invalid-feedback">
                            {formik.errors[name]}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </fieldset>

                {/* Contact Details */}
                <fieldset className="col-12">
                  <div className="row g-3">
                    {[
                      ["client_name", "Client Name", "text"],
                      ["client_phone", "Contact Number", "tel"],
                      ["client_email", "Email Address", "email"],
                    ].map(([name, label, type]) => (
                      <div className="col-6 col-md-6" key={name}>
                        <label htmlFor={name} className="form-label">
                          {label}
                        </label>
                        <input
                          id={name}
                          name={name}
                          type={type}
                          className={`form-control ${
                            formik.touched[name] && formik.errors[name]
                              ? "is-invalid"
                              : ""
                          }`}
                          value={formik.values[name]}
                          onChange={handleChange}
                        />
                        {formik.touched[name] && formik.errors[name] && (
                          <div className="invalid-feedback">
                            {formik.errors[name]}
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="col-6 col-md-6">
                      <label htmlFor="client_type" className="form-label">
                        Client Type
                      </label>
                      <select
                        id="client_type"
                        name="client_type"
                        className={`form-select ${
                          formik.touched.client_type &&
                          formik.errors.client_type
                            ? "is-invalid"
                            : ""
                        }`}
                        value={formik.values.client_type}
                        onChange={handleChange}
                      >
                        <option value="">Select Client Type</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Customer">Customer</option>
                        <option value="Other">Other</option>
                      </select>
                      {formik.touched.client_type &&
                        formik.errors.client_type && (
                          <div className="invalid-feedback">
                            {formik.errors.client_type}
                          </div>
                        )}
                    </div>
                  </div>
                </fieldset>

                <div className="modal-footer border-0 p-4">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success">
                    Update Client
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
