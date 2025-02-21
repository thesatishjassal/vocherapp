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
      console.log("Sending payload:", payload);

      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", responseData);

      if (response.ok) {
        // Only proceed if status is 200-299
        // if (responseData.product) {
          onSave(responseData.product);
          reset();
          toast.success("Product added successfully!", {
            position: "top-right",
            autoClose: 3000,
          });
        } else {
          throw new Error("Product data not found in response");
        }
      // } else {
      //   throw new Error(responseData.message || "Failed to add product");
      // }
    } catch (error) {
      console.error("Error in submission:", error);
      // toast.error(error.message || "Something went wrong", {
      //   position: "top-right",
      //   autoClose: 3000,
      // });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`modal ${show ? "show" : ""}`}>
      <style jsx>{`
        .modal {
          display: ${show ? "block" : "none"};
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 1000;
          overflow-y: auto;
        }

        .form-input:disabled,
        .form-select:disabled {
          background-color: #2a2a2a;
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-text {
          color: #ff4444;
          font-size: 0.85rem;
          margin-top: 4px;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #4285f4;
          color: #fff;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #357abd;
        }

        .submit-btn:disabled {
          background-color: #555;
          cursor: not-allowed;
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid #fff;
          border-top: 2px solid transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
          display: inline-block;
          vertical-align: middle;
        }
      `}</style>

      <div className="modal-content">
        <div className="modal-header">
          <h1 className="modal-title">Add New Product</h1>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)} className="row">
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
              <div className="form-group" key={field}>
                <label className="form-label">
                  {field.replace(/([A-Z])/g, " $1").trim()}
                </label>
                <input
                  type="text"
                  {...register(field)}
                  className="form-input"
                  placeholder={field.replace(/([A-Z])/g, " $1").trim()}
                  disabled={isLoading}
                />
                {errors[field] && (
                  <span className="error-text">{errors[field].message}</span>
                )}
              </div>
            ))}

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                {...register("category")}
                className="form-select"
                disabled={isLoading}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.catname}>
                    {cat.catname}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="error-text">{errors.category.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <select
                {...register("subCategory")}
                className="form-select"
                disabled={isLoading || !selectedCategory}
              >
                <option value="">Select Subcategory</option>
                {filteredSubCategories.map((sub) => (
                  <option key={sub.id} value={sub.subcatname}>
                    {sub.subcatname}
                  </option>
                ))}
              </select>
              {errors.subCategory && (
                <span className="error-text">{errors.subCategory.message}</span>
              )}
            </div>

            <div className="col-12">
              <button
                type="submit"
                className="submit-btn"
                disabled={!isValid || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
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
  );
};

export default AddProductForm;''