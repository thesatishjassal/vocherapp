"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Validation Schema
const productSchema = yup.object().shape({
  itemcode: yup.string().required("Item Code is required"),
  itemname: yup.string().required("Item Name is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  subcategory: yup.string().required("Subcategory is required"),
  price: yup.string().required("Price is required"),
  quantity: yup.string().required("Quantity is required"),
  rackcode: yup.string().required("Rack Code is required"),
  size: yup.string().required("Size is required"),
  color: yup.string().required("Color is required"),
  model: yup.string().required("Model is required"),
  brand: yup.string().required("Brand is required"),
  unit: yup.string().required("Unit is required"),
  inDisplay: yup
    .string()
    .oneOf(["yes", "no"], "Select a valid option")
    .required("Display option is required"),
  cct: yup.string().nullable(),
  beamangle: yup.string().nullable(),
  cutoutdia: yup.string().nullable(),
  cri: yup.string().nullable(),
  lumens: yup.string().nullable(),
  watt: yup.string().nullable(),
  reorderEnabled: yup.boolean().default(false),
  reorderqty: yup
    .number()
    .typeError("Reorder Qty must be a number")
    .when("reorderEnabled", {
      is: true,
      then: (schema) => schema.required("Reorder Qty is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});

const UpdateProductForm = ({ show, onClose, onSave, productId }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedCategory = watch("category");

  // Fetch product details by ID
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setIsFetching(true);
      try {
        const res = await fetch(`${API_URL}/products/${productId}`);
        const data = await res.json();
        if (res.ok) {
          // Handle special fields first
          if (data.in_display !== undefined) {
            setValue("inDisplay", data.in_display ? "yes" : "no");
          }
          if (data.reorderEnabled !== undefined) {
            setValue("reorderEnabled", !!data.reorderEnabled);
          }
          if (data.reorderqty !== undefined) {
            setValue("reorderqty", data.reorderqty || 0);
          }

          // Set other fields (strings, default to '' if null)
          Object.keys(data).forEach((key) => {
            if (key !== "in_display" && key !== "reorderEnabled" && key !== "reorderqty") {
              const value = data[key];
              setValue(key, value != null ? String(value) : "");
            }
          });

          setTimeout(() => {
            trigger(); // Trigger form validation after setting values
          }, 100);
        } else {
          throw new Error(data.message || "Failed to fetch product details");
        }
      } catch (error) {
        toast.error(error.message || "Failed to fetch product details", { position: "top-right" });
      } finally {
        setIsFetching(false);
      }
    };

    fetchProduct();
  }, [productId, setValue, trigger]);

  // Fetch categories and subcategories
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCategories = await fetch("https://api.panvic.in/category/");
        const categoriesData = await resCategories.json();
        setCategories(categoriesData || []);

        const resSubCategories = await fetch("https://api.panvic.in/subcategory/");
        const subCategoriesData = await resSubCategories.json();
        setSubCategories(subCategoriesData || []);
      } catch (error) {
        toast.error("Error fetching categories and subcategories!", { position: "top-right" });
      }
    };
    fetchData();
  }, []);

  // Filter subcategories based on selected category
  const filteredSubCategories = subCategories.filter(
    (sub) => sub.catname === selectedCategory
  );

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          in_display: data.inDisplay === "yes", // Convert string to boolean
        }),
      });

      const responseData = await response.json();

      if (!response.ok)
        throw new Error(responseData.message || "Failed to update product");

      toast.success("Product updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      onSave(responseData);
      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error updating product. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <ToastContainer />
      <div
        className={`modal ${show ? "show" : ""}`}
        tabIndex="-1"
        style={{
          display: show ? "block" : "none",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="modal-dialog AddProductForm">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Update Product</h1>
              <button type="button" className="btn-close" onClick={onClose}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body py-3">
              {isFetching ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading product details...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
                  {/* Common Inputs with floating labels */}
                  {[
                    "itemcode",
                    "itemname",
                    "description",
                    "price",
                    "quantity",
                    "rackcode",
                    "size",
                    "color",
                    "model",
                    "brand",
                    "unit",
                    "cct",
                    "beamangle",
                    "cutoutdia",
                    "cri",
                    "lumens",
                    "watt",
                  ].map((field) => (
                    <div className="col-md-6 form-floating mb-1" key={field}>
                      <input
                        type="text"
                        {...register(field)}
                        className={`form-control ${errors[field] ? "border-danger" : ""}`}
                        id={field}
                        placeholder=" "
                        disabled={isSubmitting}
                      />
                      <label htmlFor={field}>
                        {field.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      {errors[field] && (
                        <small className="text-danger">{errors[field].message}</small>
                      )}
                    </div>
                  ))}

                  {/* Category Dropdown */}
                  <div className="col-md-6 form-floating mb-1">
                    <select
                      {...register("category")}
                      className={`form-select ${errors.category ? "border-danger" : ""}`}
                      id="category"
                      defaultValue=""
                      disabled={isSubmitting}
                    >
                      <option value="" disabled>
                        Select Product Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.catname}>
                          {cat.catname}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="category">Category</label>
                    {errors.category && (
                      <small className="text-danger">{errors.category.message}</small>
                    )}
                  </div>

                  {/* Subcategory Dropdown */}
                  <div className="col-md-6 form-floating mb-1">
                    <select
                      {...register("subcategory")}
                      className={`form-select ${errors.subcategory ? "border-danger" : ""}`}
                      id="subcategory"
                      defaultValue=""
                      disabled={isSubmitting}
                    >
                      <option value="" disabled>
                        Select Product Subcategory
                      </option>
                      {filteredSubCategories.map((sub) => (
                        <option key={sub.id} value={sub.subcatname}>
                          {sub.subcatname}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="subcategory">Subcategory</label>
                    {errors.subcategory && (
                      <small className="text-danger">{errors.subcategory.message}</small>
                    )}
                  </div>

                  {/* inDisplay Radio Buttons */}
                  <div className="col-md-6 mb-1">
                    <label className="form-label">Show in Display?</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          type="radio"
                          {...register("inDisplay")}
                          className={`form-check-input ${errors.inDisplay ? "is-invalid" : ""}`}
                          id="inDisplayYes"
                          value="yes"
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="inDisplayYes">
                          Yes
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          {...register("inDisplay")}
                          className={`form-check-input ${errors.inDisplay ? "is-invalid" : ""}`}
                          id="inDisplayNo"
                          value="no"
                          disabled={isSubmitting}
                        />
                        <label className="form-check-label" htmlFor="inDisplayNo">
                          No
                        </label>
                      </div>
                    </div>
                    {errors.inDisplay && (
                      <small className="text-danger">{errors.inDisplay.message}</small>
                    )}
                  </div>

                  {/* Reorder Enabled Checkbox */}
                  <div className="col-md-6 mb-1">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        {...register("reorderEnabled")}
                        className="form-check-input"
                        id="reorderEnabled"
                        disabled={isSubmitting}
                      />
                      <label className="form-check-label" htmlFor="reorderEnabled">
                        Enable Reorder
                      </label>
                    </div>
                  </div>

                  {/* Reorder Quantity */}
                  <div className="col-md-6 form-floating mb-1">
                    <input
                      type="number"
                      {...register("reorderqty")}
                      className={`form-control ${errors.reorderqty ? "border-danger" : ""}`}
                      id="reorderqty"
                      placeholder=" "
                      disabled={isSubmitting}
                    />
                    <label htmlFor="reorderqty">Reorder Quantity</label>
                    {errors.reorderqty && (
                      <small className="text-danger">{errors.reorderqty.message}</small>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-success w-100 py-3"
                      disabled={!isValid || isSubmitting}
                    >
                      {isSubmitting && <span className="spinner-border spinner-border-sm me-2"></span>}
                      {isSubmitting ? "Updating Product..." : "Update Product"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateProductForm;