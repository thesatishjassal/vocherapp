"use client"; // Ensure this is a client component
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const AddInvoucher = ({ show, onClose, onSave, voucherData }) => {
  const [voucher, setVoucher] = useState({
    itemcode: "",
    itemname: "",
    unit: "",
    rackcode: "",
    quantity: "",
    rate: "",
    discount_percentage: "",
    additional_discount_percentage: "",
    amount: "",
    comments: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (voucherData) {
      setVoucher(voucherData);
    } else {
      setVoucher({
        itemcode: "",
        itemname: "",
        unit: "",
        rackcode: "",
        quantity: "",
        rate: "",
        discount_percentage: "",
        additional_discount_percentage: "",
        amount: "",
        comments: "",
      });
    }
  }, [voucherData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVoucher((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!voucher.itemcode || !voucher.itemname || !voucher.quantity || !voucher.rate) {
      toast.warn("Please fill in required fields (Product ID, Item Name, Quantity, Rate)!", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    try {
      let response;
      if (voucherData?.id) {
        response = await axios.put(
          `${API_URL}/voucher/${voucherData.id}`,
          voucher,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        toast.success("Voucher updated successfully!", { position: "top-right" });
      } else {
        response = await axios.post(
          `${API_URL}/voucher/`,
          voucher,
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        toast.success("Voucher added successfully!", { position: "top-right" });
      }
      await onSave(response.data, !!voucherData);
      onClose();
    } catch (err) {
      console.error("Submit Error:", err.response || err);
      toast.error(err.response?.data?.message || "Something went wrong!", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null; // Early return if not shown to avoid unnecessary rendering

  return (
    <div
      className={`modal fade ${show ? "show" : ""}`}
      tabIndex="-1"
      aria-hidden={!show}
      style={{ display: show ? "block" : "none", backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {voucherData ? "Edit Voucher" : "Add Voucher"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} aria-label="Close" />
          </div>
          <div className="modal-body">
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  name="itemcode"
                  className="form-control"
                  placeholder="Product ID"
                  value={voucher.itemcode}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="itemname"
                  className="form-control"
                  placeholder="Item Name"
                  value={voucher.itemname}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  name="unit"
                  className="form-control"
                  placeholder="Unit"
                  value={voucher.unit}
                  onChange={handleChange}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="rackcode"
                  className="form-control"
                  placeholder="Rack Code"
                  value={voucher.rackcode}
                  onChange={handleChange}
                  disabled
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  placeholder="Quantity"
                  value={voucher.quantity}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  name="rate"
                  className="form-control"
                  placeholder="Rate"
                  value={voucher.rate}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="number"
                  name="discount_percentage"
                  className="form-control"
                  placeholder="Discount %"
                  value={voucher.discount_percentage}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="number"
                  name="additional_discount_percentage"
                  className="form-control"
                  placeholder="Additional Disc %"
                  value={voucher.additional_discount_percentage}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <input
                  type="number"
                  name="amount"
                  className="form-control"
                  placeholder="Amount"
                  value={voucher.amount}
                  disabled
                />
              </div>
              <div className="col-md-6">
                <input
                  type="text"
                  name="comments"
                  className="form-control"
                  placeholder="Comments"
                  value={voucher.comments}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? voucherData
                  ? "Updating..."
                  : "Saving..."
                : voucherData
                ? "Update Voucher"
                : "Save Voucher"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddInvoucher;