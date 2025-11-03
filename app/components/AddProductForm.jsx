"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const productSchema = yup.object().shape({
  // hsncode: yup.string().required("HSN Code is required"),
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
  cct: yup.string().nullable(),        // ✅ existing
  beamangle: yup.string().nullable(),  // ✅ existing
  cutoutdia: yup.string().nullable(),  // ✅ existing
  cri: yup.string().nullable(),        // ✅ new
  lumens: yup.string().nullable(),     // ✅ new
  watt: yup.string().nullable(),     // ✅ new
  inDisplay: yup
    .string()
    .oneOf(["yes", "no"], "Select a valid display option")
    .required("Display status is required"),
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

const AddProductForm = ({ show, onClose, onSave }) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [reorderEnabled, setReorderEnabled] = useState(false);
  const [userDetails, setUserDetails] = useState(null);

  // const generateHSNCode = () => {
  //   const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  //   let randomLetters = "";
  //   for (let i = 0; i < 4; i++) {
  //     randomLetters += letters.charAt(
  //       Math.floor(Math.random() * letters.length)
  //     );
  //   }
  //   const randomNumbers = Math.floor(100 + Math.random() * 900);
  //   return randomLetters + randomNumbers;
  // };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isValid },
    watch,
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
    defaultValues: {
      reorderEnabled: false,
      inDisplay: "yes",
      // hsncode: generateHSNCode(),
    },
  });

  const selectedCategory = watch("category");
  useEffect(() => {
    // Try to get the user_details cookie
    const userDetailsCookie = Cookies.get("user_details");
    console.log("User Details Cookie:", userDetailsCookie);
    if (userDetailsCookie) {
      // Parse and set the user details if the cookie exists
      setUserDetails(JSON.parse(userDetailsCookie));
    }
  }, []);
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
        toast.error("Error fetching categories!", { position: "top-right" });
        console.error("Error fetching categories:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setValue("reorderEnabled", reorderEnabled);
  }, [reorderEnabled, setValue]);

  const filteredSubCategories = subCategories.filter(
    (sub) => sub.catname === selectedCategory
  );

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        reorderEnabled,
        reorderqty: reorderEnabled ? data.reorderqty : "",
        created_by: userDetails ? userDetails.name : "System",
      };

      const response = await fetch(`${API_URL}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      toast.success("Product added successfully!", {
        position: "top-right",
      });
      console.log("Added Product:", responseData);
      // window.location.reload();
      onSave(responseData);
      reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error adding product", {
        position: "top-right",
      });
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
            <h1 className="modal-title fs-5">Add New Product</h1>
            <button type="button" className="btn-close" onClick={onClose}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="modal-body py-3">
            <form onSubmit={handleSubmit(onSubmit)} className="row g-3">
              {/* Common Inputs */}
              {[
                // "hsncode",
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
                "cct",        // ✅ existing
                "beamangle",  // ✅ existing
                "cutout size",  // ✅ existing
                "cri",        // ✅ new
                "lumens",     // ✅ new
                "watt",     // ✅ new
              ].map((field) => (
                <div className="col-6 form-floating mb-1" key={field}>
                  <input
                    type="text"
                    {...register(field)}
                    className={`form-control ${
                      errors[field] ? "border-danger" : ""
                    }`}
                    id={field}
                    placeholder=" "
                  />
                  <label htmlFor={field}>
                    {field.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  {errors[field] && (
                    <small className="text-danger">
                      {errors[field].message}
                    </small>
                  )}
                </div>
              ))}

              {/* Category */}
              <div className="col-6 form-floating mb-1">
                <select
                  {...register("category")}
                  className={`form-select ${
                    errors.category ? "border-danger" : ""
                  }`}
                  id="category"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.catname}>
                      {cat.catname}
                    </option>
                  ))}
                </select>
                <label htmlFor="category">Category</label>
                {errors.category && (
                  <small className="text-danger">
                    {errors.category.message}
                  </small>
                )}
              </div>

              {/* Subcategory */}
              <div className="col-6 form-floating mb-1">
                <select
                  {...register("subcategory")}
                  className={`form-select ${
                    errors.subcategory ? "border-danger" : ""
                  }`}
                  id="subcategory"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select Subcategory
                  </option>
                  {filteredSubCategories.map((sub) => (
                    <option key={sub.id} value={sub.subcatname}>
                      {sub.subcatname}
                    </option>
                  ))}
                </select>
                <label htmlFor="subcategory">Subcategory</label>
                {errors.subcategory && (
                  <small className="text-danger">
                    {errors.subcategory.message}
                  </small>
                )}
              </div>

              {/* In Display */}
              <div className="col-6 form-floating mb-1">
                <select
                  {...register("inDisplay")}
                  className={`form-select ${
                    errors.inDisplay ? "border-danger" : ""
                  }`}
                  id="inDisplay"
                  defaultValue="yes"
                >
                  <option value="">Show in Display?</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
                <label htmlFor="inDisplay">Show in Display?</label>
                {errors.inDisplay && (
                  <small className="text-danger">
                    {errors.inDisplay.message}
                  </small>
                )}
              </div>

              {/* Reorder Switch */}
              <div className="col-6 d-flex align-items-center gap-2">
                <label className="form-check-label me-2">
                  Enable Reorder Qty
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="reorderSwitch"
                    checked={reorderEnabled}
                    onChange={() => setReorderEnabled(!reorderEnabled)}
                  />
                </div>
              </div>

              {/* Reorder Qty Input */}
              {reorderEnabled && (
                <div className="col-6 form-floating mb-1">
                  <input
                    type="number"
                    {...register("reorderqty")}
                    className={`form-control ${
                      errors.reorderqty ? "border-danger" : ""
                    }`}
                    id="reorderqty"
                    placeholder=" "
                  />
                  <label htmlFor="reorderqty">Reorder Quantity</label>
                  {errors.reorderqty && (
                    <small className="text-danger">
                      {errors.reorderqty.message}
                    </small>
                  )}
                </div>
              )}

              {/* Submit */}
              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={!isValid}
                >
                  Add Product
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
