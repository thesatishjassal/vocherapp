"use client";
import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const QuotationInfo = ({ setInfoModal, onConfirm }) => {
  const [mode, setMode] = useState("default"); // "default" | "custom"
  const [formData, setFormData] = useState({ Subject: "", Salesperson: "" });
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    const userDetailsCookie = Cookies.get("user_details");
    if (userDetailsCookie) {
      const parsed = JSON.parse(userDetailsCookie);
      setUserDetails(parsed);
      setFormData((prev) => ({ ...prev, Salesperson: parsed.name }));
    }
  }, []);

  const defaultName = userDetails?.name ?? "";

  const handleModeChange = (selected) => {
    setMode(selected);
    setFormData((prev) => ({
      ...prev,
      Salesperson: selected === "default" ? defaultName : "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = (e) => {
  e.preventDefault();
  const finalSalesperson = mode === "default" ? defaultName : formData.Salesperson;
  onConfirm({ ...formData, Salesperson: finalSalesperson });
  setFormData({ Subject: "", Salesperson: defaultName });
  setMode("default");
  setInfoModal(false);
};

  return (
    <>
      {setInfoModal && (
        <div
          className="modal fade show"
          tabIndex="-1"
          aria-labelledby="quotationModalLabel"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="quotationModalLabel">
                  Quotation info details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setInfoModal(false)}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body py-3">
                <form onSubmit={handleSubmit}>

                  {/* ── Mode selector ── */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted text-uppercase">
                      Salesperson mode
                    </label>
                    <div className="d-flex gap-2">
                      {["default", "custom"].map((m) => (
                        <div
                          key={m}
                          onClick={() => handleModeChange(m)}
                          className={`flex-fill p-2 rounded-3 border d-flex align-items-center gap-2`}
                          style={{
                            cursor: "pointer",
                            borderWidth: mode === m ? "2px" : "1px",
                            borderColor: mode === m ? "#0d6efd" : "#dee2e6",
                            backgroundColor: mode === m ? "#e8f0fe" : "#f8f9fa",
                            transition: "all 0.15s",
                          }}
                        >
                          <input
                            type="radio"
                            name="salespersonMode"
                            value={m}
                            checked={mode === m}
                            onChange={() => handleModeChange(m)}
                            className="form-check-input mt-0"
                            style={{ accentColor: "#0d6efd" }}
                          />
                          <div>
                            <div className="fw-semibold small text-capitalize">{m}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              {m === "default"
                                ? "Use your account name"
                                : "Enter a different name"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Fields ── */}
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Salesperson
                      </label>
                      <input
                        type="text"
                        name="Salesperson"
                        className="form-control"
                        placeholder="Salesperson name"
                        value={
                          mode === "default" ? defaultName : formData.Salesperson
                        }
                        onChange={handleChange}
                        disabled={mode === "default"}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted">
                        Subject <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="Subject"
                        className="form-control"
                        placeholder="Enter subject"
                        value={formData.Subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Custom mode hint */}
                  {mode === "custom" && (
                    <div className="alert alert-warning py-2 px-3 mb-3 d-flex align-items-center gap-2">
                      <i className="fa-solid fa-circle-info" />
                      <small>Type a name to override the default salesperson for this quotation.</small>
                    </div>
                  )}

                  {/* ── Footer ── */}
                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setInfoModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-success">
                      Confirm &amp; update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuotationInfo;