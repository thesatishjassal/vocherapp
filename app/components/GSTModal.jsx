"use client";
import { useEffect, useState } from "react";

const GSTModal = ({ quotationId, isOpen, onClose, onConfirm }) => {
  const [loading, setLoading] = useState(true);
  const [gstType, setGstType] = useState("include");
  const [gstPercentage, setGstPercentage] = useState(0); // start at 0

  const [baseAmount, setBaseAmount] = useState(0);

  const [form, setForm] = useState({
    without_gst: 0,
    gst_amount: 0,
    amount_with_gst: 0,
  });

  // ────────────────────────────────────────────────
  // GST CALCULATION
  // ────────────────────────────────────────────────
  const calculateGST = (base, percent, type) => {
    const p = Number(percent) || 0;

    if (type === "exclude") {
      const without = base;
      const gst = (without * p) / 100;
      const total = without + gst;
      return {
        without_gst: Math.round(without),
        gst_amount: Math.round(gst),
        amount_with_gst: Math.round(total),
      };
    } else {
      // include
      const total = base;
      const gst = p === 0 ? 0 : (total * p) / (100 + p);
      const without = total - gst;
      return {
        without_gst: Math.round(without),
        gst_amount: Math.round(gst),
        amount_with_gst: Math.round(total),
      };
    }
  };

  // ────────────────────────────────────────────────
  // FETCH DATA → only set base, ignore saved percentage when include
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !quotationId) return;

    setLoading(true);

    fetch(`https://api.panvic.in/quotation/${quotationId}`)
      .then((res) => res.json())
      .then((data) => {
        const total = data.amount_with_gst || data.amount_including_gst || 0;
        const without = data.without_gst || 0;
        const gstAmt = data.gst_amount || 0;

        // We detect type only to choose correct initial base
        let detectedType = "exclude";
        if (total > 0 && Math.abs(total - (without + gstAmt)) < 1) {
          detectedType = "include";
        }

        // For "include" → we force percentage = 0 (as requested)
        // For "exclude" → we can still try to show the original %
        const initialPercent = detectedType === "include" ? 0 : Number(((gstAmt / without) * 100).toFixed(2)) || 0;

        setGstType(detectedType);
        setGstPercentage(initialPercent);

        const initialBase = detectedType === "include" ? total : without;
        setBaseAmount(initialBase);

        const calc = calculateGST(initialBase, initialPercent, detectedType);
        setForm(calc);

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [quotationId, isOpen]);

  // ────────────────────────────────────────────────
  // When gstType changes → auto-set percentage to 0 if "include"
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (gstType === "include") {
      setGstPercentage(0);
    }
    // If you want to preserve previous % when switching back to exclude → remove the line above
    // and only set 0 on first load when include
  }, [gstType]);

  // ────────────────────────────────────────────────
  // RECALCULATE whenever inputs change
  // ────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const updated = calculateGST(baseAmount, gstPercentage, gstType);
    setForm(updated);
  }, [baseAmount, gstPercentage, gstType, loading]);

  const handleBaseChange = (val) => {
    const num = Number(val);
    if (isNaN(num) || num < 0) return;
    setBaseAmount(num);
  };

  const handleConfirm = () => {
    const payload = {
      ...form,
      gstPercentage: Number(gstPercentage.toFixed(2)),
      gstType,
    };
    onConfirm(payload);
    onClose();
  };

  // ESC only
  useEffect(() => {
    if (!isOpen) return;
    const onEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">GST Details</h5>
            <button className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body">
            {loading ? (
              <p>Loading quotation data...</p>
            ) : (
              <>
                <div className="mb-4">
                  <label className="fw-bold d-block mb-2">GST Treatment</label>
                  <div className="d-flex gap-4">
                    <label>
                      <input
                        type="radio"
                        checked={gstType === "include"}
                        onChange={() => setGstType("include")}
                      />{" "}
                      Includes GST
                    </label>
                    <label>
                      <input
                        type="radio"
                        checked={gstType === "exclude"}
                        onChange={() => setGstType("exclude")}
                      />{" "}
                      Excludes GST
                    </label>
                  </div>
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <label className="form-label mb-0">
                    {gstType === "include"
                      ? "Amount (incl. GST)"
                      : "Amount (excl. GST)"}
                  </label>
                  <input
                    type="number"
                    className="form-control w-50 text-end"
                    value={baseAmount || ""}
                    onChange={(e) => handleBaseChange(e.target.value)}
                  />
                </div>

                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <label className="form-label mb-0">GST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control text-end w-50"
                    value={gstPercentage}
                    onChange={(e) => setGstPercentage(Number(e.target.value))}
                    disabled={gstType === "include"} // ← optional: prevent editing when include
                  />
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Base (excl. GST):</span>
                    <strong>₹{form.without_gst.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>GST ({gstPercentage.toFixed(2)}%):</span>
                    <strong>₹{form.gst_amount.toLocaleString("en-IN")}</strong>
                  </div>
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <strong>₹{form.amount_with_gst.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={loading}
            >
              Save GST Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTModal;