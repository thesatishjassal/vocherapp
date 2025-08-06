"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Validation Schema
const productSchema = yup.object().shape({
  hsncode: yup.string().required("HSN Code is required"),
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
  inDisplay: yup.string().oneOf(["yes", "no"], "Select a valid option").required("Display option is required"),
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
  const selectedCategory = watch("category");

  // Fetch product details by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_URL}/products/${productId}/`);
        const data = await res.json();
        if (res.ok) {
          Object.keys(data).forEach((key) => {
            if (data[key] !== null && data[key] !== undefined) {
              setValue(key, String(data[key]));
            }
          });
          setTimeout(() => {
            trigger(); // ✅ Trigger form validation after setting values
          }, 100);
        } else {
          throw new Error(data.message || "Failed to fetch product");
        }
      } catch (error) {
        toast.error(error.message, { position: "top-right" });
      }
    };

    if (productId) fetchProduct();
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
        toast.error("Error fetching categories!", { position: "top-right" });
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
    try {
      const response = await fetch(`${API_URL}/products/${productId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) throw new Error(responseData.message || "Failed to update product");

      toast.success("Product updated successfully!", { position: "top-right" });
      onSave(responseData);
      reset();
      onClose();
    } catch (error) {
      toast.error(error.message || "Error updating product", { position: "top-right" });
    }
  };

  return (
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
            <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
              {[
                { name: "hsncode", placeholder: "Enter HSN Code" },
                { name: "itemcode", placeholder: "Enter Item Code" },
                { name: "itemname", placeholder: "Enter Item Name" },
                { name: "description", placeholder: "Enter Product Description" },
                { name: "price", placeholder: "Enter Product Price" },
                { name: "quantity", placeholder: "Enter Quantity" },
                { name: "rackcode", placeholder: "Enter Rack Code" },
                { name: "size", placeholder: "Enter Size (e.g., M, L, XL)" },
                { name: "color", placeholder: "Enter Color" },
                { name: "model", placeholder: "Enter Model Number" },
                { name: "brand", placeholder: "Enter Brand Name" },
                { name: "unit", placeholder: "Enter Unit (e.g., pcs, kg)" },
              ].map(({ name, placeholder }) => (
                <div className="col-md-6" key={name}>
                  <input
                    type="text"
                    {...register(name)}
                    className={`form-control ${errors[name] ? "border-danger" : ""}`}
                    placeholder={placeholder}
                  />
                  {errors[name] && (
                    <small className="text-danger">{errors[name].message}</small>
                  )}
                </div>
              ))}

              {/* Category Dropdown */}
              <div className="col-md-6">
                <select
                  {...register("category")}
                  className={`form-control ${errors.category ? "border-danger" : ""}`}
                >
                  <option value="">Select Product Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.catname}>
                      {cat.catname}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <small className="text-danger">{errors.category.message}</small>
                )}
              </div>

              {/* Subcategory Dropdown */}
              <div className="col-md-6">
                <select
                  {...register("subcategory")}
                  className={`form-control ${errors.subcategory ? "border-danger" : ""}`}
                >
                  <option value="">Select Product Subcategory</option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.subcatname}>
                      {sub.subcatname}
                    </option>
                  ))}
                </select>
                {errors.subcategory && (
                  <small className="text-danger">{errors.subcategory.message}</small>
                )}
              </div>

              {/* ✅ inDisplay Dropdown */}
              <div className="col-md-6">
                <select
                  {...register("inDisplay")}
                  className={`form-control ${errors.inDisplay ? "border-danger" : ""}`}
                >
                  <option value="">Show in Display?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                {errors.inDisplay && (
                  <small className="text-danger">{errors.inDisplay.message}</small>
                )}
              </div>

              {/* Submit Button */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={!isValid}
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProductForm;
