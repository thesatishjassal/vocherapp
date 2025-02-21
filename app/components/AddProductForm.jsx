"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Schema validation
const productSchema = yup.object().shape({
  hsncode: yup.string().required("HSN Code is required"),
  itemCode: yup.string().required("Item Code is required"),
  itemName: yup.string().required("Item Name is required"),
  description: yup.string().required("Description is required"),
  category: yup.string().required("Category is required"),
  subCategory: yup.string().required("Subcategory is required"),
  price: yup.string().required("Price is required"),
  quantity: yup.string().required("Quantity is required"),
  rackCode: yup.string().required("Rack Code is required"),
  size: yup.string().required("Size is required"),
  color: yup.string().required("Color is required"),
  model: yup.string().required("Model is required"),
  brand: yup.string().required("Brand is required"),
});

const AddProductForm = ({ show, onClose, onSave }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCategories = await fetch("https://api.panvic.in/category/");
        const categoriesData = await resCategories.json();
        setCategories(categoriesData || []);

        const resSubCategories = await fetch(
          "https://api.panvic.in/subcategory/"
        );
        const subCategoriesData = await resSubCategories.json();
        setSubCategories(subCategoriesData || []);
      } catch (error) {
        toast.error("Error fetching categories!", {
          position: "top-right",
          autoClose: 3000,
        });
        console.error("Error fetching categories:", error);
      }
    };

    fetchData();
  }, []);

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.catname === selectedCategory
  );

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = { ...data };
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      // Check if the response is successful (typically 200 or 201 status)
      if (response.ok) {
        onSave(responseData.product);
        reset();
        toast.success("Product added successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // If the server returns a non-OK status, throw an error with the message
        throw new Error(responseData.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error:", error.message);
      toast.error(error.message || "Error adding product", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      tabIndex="-1"
      style={{
        display: show ? "block" : "none",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow-lg">
          <div className="modal-header bg-primary text-white">
            <h1 className="modal-title fs-5">Add New Product</h1>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-4">
            <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
              {[
                "hsncode",
                "itemCode",
                "itemName",
                "description",
                "price",
                "quantity",
                "rackCode",
                "size",
                "color",
                "model",
                "brand",
              ].map((field) => (
                <div className="col-md-6" key={field}>
                  <div className="form-floating">
                    <input
                      type="text"
                      {...register(field)}
                      className={`form-control ${errors[field] ? "is-invalid" : ""}`}
                      placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                      disabled={isLoading}
                    />
                    <label>{field.replace(/([A-Z])/g, " $1").trim()}</label>
                    {errors[field] && (
                      <div className="invalid-feedback">
                        {errors[field].message}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    {...register("category")}
                    className={`form-control ${errors.category ? "is-invalid" : ""}`}
                    disabled={isLoading}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.catname}>
                        {cat.catname}
                      </option>
                    ))}
                  </select>
                  <label>Category</label>
                  {errors.category && (
                    <div className="invalid-feedback">
                      {errors.category.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-floating">
                  <select
                    {...register("subCategory")}
                    className={`form-control ${errors.subCategory ? "is-invalid" : ""}`}
                    disabled={isLoading || !selectedCategory}
                  >
                    <option value="">Select Subcategory</option>
                    {filteredSubCategories.map((sub) => (
                      <option key={sub.id} value={sub.subcatname}>
                        {sub.subcatname}
                      </option>
                    ))}
                  </select>
                  <label>Subcategory</label>
                  {errors.subCategory && (
                    <div className="invalid-feedback">
                      {errors.subCategory.message}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Adding Product...
                    </>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductForm;