"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ArtisaSwitchColorSelector from "./ArtisaSwitchColorSelector";
import NowaSwitchColorSelector from "./NowaSwitchColorSelector";
import VeniaSwitchColorSelector from "./VeniaSwitchColorSelector";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const GSTCalculator = ({ totalAmount, onGSTChange }) => {
  const [gstPercentage, setGstPercentage] = useState(0);
  const [gstType, setGstType] = useState("include");

  const gstAmount = useMemo(
    () => (totalAmount * gstPercentage) / 100,
    [totalAmount, gstPercentage]
  );
  const totalWithGST = useMemo(
    () => (gstType === "exclude" ? totalAmount + gstAmount : totalAmount),
    [gstType, totalAmount, gstAmount]
  );
  const withoutGST = useMemo(
    () =>
      gstType === "exclude"
        ? totalAmount
        : totalAmount / (1 + gstPercentage / 100),
    [gstType, totalAmount, gstPercentage]
  );

  useEffect(() => {
    if (onGSTChange) {
      onGSTChange({
        gstAmount: gstAmount || 0,
        totalWithGST: totalWithGST || 0,
        withoutGST: withoutGST || 0,
        gstPercentage,
        gstType,
      });
    }
  }, [
    gstAmount,
    totalWithGST,
    withoutGST,
    gstPercentage,
    gstType,
    onGSTChange,
  ]);

  return (
    <div className="row p-4">
      {gstType === "exclude" && (
        <div className="col-sm-6 mb-2">
          <input
            type="number"
            placeholder="Enter GST%"
            value={gstPercentage}
            onChange={(e) =>
              setGstPercentage(Math.max(0, parseFloat(e.target.value) || 0))
            }
            className="form-control m-0 no-print"
            min="0"
            max="100"
            aria-label="GST Percentage"
          />
        </div>
      )}

      <div className="col-sm-6 mb-2">
        <select
          value={gstType}
          onChange={(e) => setGstType(e.target.value)}
          className="form-select m-0"
          aria-label="GST Type"
        >
          <option value="" disabled>
            Select GST type
          </option>
          <option value="include">Include GST</option>
          <option value="exclude">Exclude GST</option>
        </select>
      </div>

      <table className="table table-borderless">
        <tbody>
          <tr>
            <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
              <p className="m-0">Total Net Price:</p>
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
              ₹{totalAmount.toFixed(2)}
            </td>
          </tr>
          {gstType === "exclude" && (
            <>
              <tr>
                <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                  <p className="m-0">Without GST:</p>
                </td>
                <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none">
                  ₹{totalAmount.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="tm_width_3 tm_primary_color tm_border_none tm_bold pb-0 pt-1">
                  <p className="m-0">
                    GST Amt (<b>{gstPercentage}%</b>):
                  </p>
                </td>
                <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none">
                  ₹{gstAmount.toFixed(2)}
                </td>
              </tr>
            </>
          )}
          <tr>
            <td className="tm_width_3 tm_primary_color tm_border_none tm_bold">
              <p className="m-0">
                Total Amount{" "}
                <b>{gstType === "exclude" ? "with" : "including"} GST</b>:
              </p>
            </td>
            <td className="tm_width_2 tm_primary_color tm_text_right tm_border_none tm_bold">
              ₹{totalAmount.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const SwitchQuotatTable = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brands] = useState(["Wipro", "L&T"]);
  const [models, setModels] = useState([]);
  const [switchSocketSubcategories, setSwitchSocketSubcategories] = useState(
    []
  );
  const [designerPlateSubcategories, setDesignerPlateSubcategories] = useState(
    []
  );
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedSwitchSocketSubcategory, setSelectedSwitchSocketSubcategory] =
    useState("");
  const [
    selectedDesignerPlateSubcategories,
    setSelectedDesignerPlateSubcategories,
  ] = useState([]);
  const [quotationId, setQuotationId] = useState("");
  const [gstDetails, setGstDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryColors = {
    Switches: "bg-primary-subtle",
    Sockets: "bg-success-subtle",
    "Designer Plates": "bg-info-subtle",
    Plates: "bg-warning-subtle",
    "N/A": "bg-light",
  };

  // Custom sequence for Designer Plates subcategories
  const designerPlateSequence = [
    "Aqua Green Plate",
    "Frozen Matt Plate",
    "Dapper Black Plate",
    "Abstract Silver Plate",
    "Retro Bronze Plate",
    "Natural Teak Plate",
    "Cherry Mahogany Plate",
  ];

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/products/`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setError("No products found.");
          return;
        }

        const productsWithQty = data.map((product) => ({
          ...product,
          qty: product.qty || 0,
          discount: product.discount || 0,
          size:
            product.category === "Designer Plates" &&
            product.subcategory !== "Back Grid Frames" &&
            product.subcategory !== "Frame Plate"
              ? product.size || 1
              : null,
          id: product.id || Math.random().toString(36).substring(2),
        }));

        setProducts(productsWithQty);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Compute derived data
  const { brandModels, switchSocketSubs, designerPlateSubs } = useMemo(() => {
    const brandModels = selectedBrand
      ? [
          ...new Set(
            products
              .filter(
                (p) =>
                  p.brand === selectedBrand &&
                  p.model &&
                  ["Switches", "Sockets", "Designer Plates", "Plates"].includes(
                    p.category
                  )
              )
              .map((p) => p.model)
          ),
        ].sort()
      : [];

    const switchSocketSubs = [
      ...new Set(
        products
          .filter((p) => ["Switches", "Sockets"].includes(p.category))
          .map((p) => p.subcategory)
          .filter((sub) => sub)
      ),
    ].sort();

    // Get unique Designer Plates subcategories, excluding Frame Plate
    let designerPlateSubs = [
      ...new Set(
        products
          .filter(
            (p) =>
              p.category === "Designer Plates" &&
              p.subcategory &&
              p.subcategory !== "Frame Plate"
          )
          .map((p) => p.subcategory)
          .filter((sub) => sub)
      ),
    ];

    // Sort according to custom sequence, append others
    designerPlateSubs = [
      // Include subcategories in custom sequence if they exist in data
      ...designerPlateSequence.filter((sub) => designerPlateSubs.includes(sub)),
      // Append other subcategories (e.g., Back Grid Frames, or any not in sequence)
      ...designerPlateSubs
        .filter((sub) => !designerPlateSequence.includes(sub))
        .sort(),
    ];

    return { brandModels, switchSocketSubs, designerPlateSubs };
  }, [products, selectedBrand]);

  // Update models and subcategories
  useEffect(() => {
    setModels(brandModels);
    setSwitchSocketSubcategories(switchSocketSubs);
    setDesignerPlateSubcategories(designerPlateSubs);

    if (!brandModels.includes(selectedModel)) {
      setSelectedModel("");
    }
    if (!switchSocketSubs.includes(selectedSwitchSocketSubcategory)) {
      setSelectedSwitchSocketSubcategory("");
    }
    if (
      !selectedDesignerPlateSubcategories.every((sub) =>
        designerPlateSubs.includes(sub)
      )
    ) {
      setSelectedDesignerPlateSubcategories([]);
    }
  }, [
    brandModels,
    switchSocketSubs,
    designerPlateSubs,
    selectedModel,
    selectedSwitchSocketSubcategory,
    selectedDesignerPlateSubcategories,
  ]);

  // Handle Designer Plates checkbox changes
  const handleDesignerPlateCheckboxChange = useCallback((subcategory) => {
    setSelectedDesignerPlateSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((sub) => sub !== subcategory)
        : [...prev, subcategory]
    );
  }, []);

  // Calculate total size-based quantity for Back Grid Frames
  const backGridFramesQty = useMemo(() => {
    if (
      !selectedDesignerPlateSubcategories.length ||
      !selectedBrand ||
      !selectedModel
    )
      return 0;

    return filteredProducts.reduce((sum, product) => {
      if (
        product.category === "Designer Plates" &&
        product.subcategory !== "Back Grid Frames" &&
        product.subcategory !== "Frame Plate" &&
        selectedDesignerPlateSubcategories.includes(product.subcategory) &&
        product.brand === selectedBrand &&
        product.model === selectedModel
      ) {
        const qty = Math.max(0, product.qty || 0);
        const size = Math.max(1, product.size || 1);
        return sum + qty * size;
      }
      return sum;
    }, 0);
  }, [
    filteredProducts,
    selectedDesignerPlateSubcategories,
    selectedBrand,
    selectedModel,
  ]);

  // Memoized filtered products with auto-assigned Back Grid Frames quantity
  const filtered = useMemo(() => {
    if (!selectedBrand) return [];

    let result = products.filter((product) => product.brand === selectedBrand);

    if (selectedModel) {
      result = result.filter((product) => product.model === selectedModel);
    }

    result = result.filter((product) =>
      ["Switches", "Sockets", "Designer Plates", "Plates"].includes(
        product.category
      )
    );

    if (selectedSwitchSocketSubcategory) {
      result = result.filter(
        (product) =>
          !["Switches", "Sockets"].includes(product.category) ||
          product.subcategory === selectedSwitchSocketSubcategory
      );
    }

    if (selectedDesignerPlateSubcategories.length > 0) {
      // Include selected Designer Plates subcategories, exclude Regular Plates
      // Include Back Grid Frames if any Designer Plates are selected
      result = result.filter(
        (product) =>
          (product.category === "Designer Plates" &&
            (selectedDesignerPlateSubcategories.includes(product.subcategory) ||
              product.subcategory === "Back Grid Frames")) ||
          (product.category !== "Plates" &&
            product.category !== "Designer Plates") ||
          (product.category === "Plates" &&
            product.subcategory !== "Regular Plates")
      );
    } else {
      // Default to Regular Plates for Plates category
      result = result.filter(
        (product) =>
          product.category !== "Plates" ||
          product.subcategory === "Regular Plates"
      );
    }

    // Assign Back Grid Frames quantity
    result = result.map((product) => {
      if (
        product.category === "Designer Plates" &&
        product.subcategory === "Back Grid Frames" &&
        selectedDesignerPlateSubcategories.length > 0
      ) {
        return { ...product, qty: backGridFramesQty };
      }
      return product;
    });

    return result;
  }, [
    products,
    selectedBrand,
    selectedModel,
    selectedSwitchSocketSubcategory,
    selectedDesignerPlateSubcategories,
    backGridFramesQty,
  ]);

  // Sync filteredProducts
  useEffect(() => {
    setFilteredProducts(filtered);
  }, [filtered]);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredProducts.reduce((sum, product) => {
      const qty = Math.max(0, product.qty || 0);
      const discount = Math.max(0, Math.min(100, product.discount || 0));
      const price = product.price || 0;
      const amount = price * qty * (1 - discount / 100);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
  }, [filteredProducts]);

  const handleQtyChange = useCallback((id, newQty) => {
    const validatedQty = Math.max(0, parseInt(newQty) || 0);
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, qty: validatedQty } : product
      )
    );
  }, []);

  const handleDiscountChange = useCallback((id, newDiscount) => {
    const validatedDiscount = Math.max(
      0,
      Math.min(100, parseFloat(newDiscount) || 0)
    );
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? { ...product, discount: validatedDiscount }
          : product
      )
    );
  }, []);

  const handleGSTChange = useCallback((gstData) => {
    setGstDetails(gstData);
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products/`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          setError("No products found.");
          return;
        }

        const productsWithQty = data.map((product) => ({
          ...product,
          qty: product.qty || 0,
          discount: product.discount || 0,
          size:
            product.category === "Designer Plates" &&
            product.subcategory !== "Back Grid Frames" &&
            product.subcategory !== "Frame Plate"
              ? product.size || 1
              : null,
          id: product.id || Math.random().toString(36).substring(2),
        }));

        setProducts(productsWithQty);
      } catch (err) {
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="container py-4 position-relative">
      <style jsx>{`
        .fade-in {
          opacity: 0;
          animation: fadeIn 0.3s forwards;
        }
        .fade-out {
          opacity: 1;
          animation: fadeOut 0.3s forwards;
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          to {
            opacity: 0;
          }
        }
        .form-select:hover,
        .form-control:hover {
          box-shadow: 0 0 3px rgba(0, 123, 255, 0.2);
          transition: box-shadow 0.2s ease-in-out;
        }
        .tm_round_border {
          border-radius: 8px;
          overflow: hidden;
        }
        .checkbox-container {
          max-height: 150px;
          overflow-y: auto;
          padding: 8px;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          background-color: #fff;
        }
      `}</style>

      {loading && (
        <div
          className={`d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100 fade-in ${
            loading ? "" : "fade-out"
          }`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", zIndex: 1000 }}
        >
          <div className="text-center">
            <div
              className="spinner-border spinner-border-lg text-primary"
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading products...</p>
          </div>
        </div>
      )}

      <div className="mb-4 row align-items-start">
        <div className="col-sm-6 col-md-3 mb-2">
          <label className="form-label mb-1">Brand:</label>
          <select
            className="form-select form-select-sm"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            aria-label="Select Brand"
          >
            <option value="">Select Brand</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div className="col-sm-6 col-md-3 mb-2">
          <label className="form-label mb-1">Model:</label>
          <select
            className="form-select form-select-sm"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedBrand || !models.length}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={
              !selectedBrand
                ? "Please select a Brand first"
                : !models.length
                ? "No models available"
                : ""
            }
            aria-label="Select Model"
            aria-disabled={!selectedBrand || !models.length}
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="col-sm-6 col-md-3 mb-2">
          <label className="form-label mb-1">Switches and Sockets Type:</label>
          <select
            className="form-select form-select-sm"
            value={selectedSwitchSocketSubcategory}
            onChange={(e) => setSelectedSwitchSocketSubcategory(e.target.value)}
            disabled={
              !selectedBrand ||
              !selectedModel ||
              !switchSocketSubcategories.length
            }
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={
              !selectedBrand
                ? "Please select a Brand first"
                : !selectedModel
                ? "Please select a Model first"
                : !switchSocketSubcategories.length
                ? "No subcategories available"
                : ""
            }
            aria-label="Select Switches and Sockets Type"
            aria-disabled={
              !selectedBrand ||
              !selectedModel ||
              !switchSocketSubcategories.length
            }
          >
            <option value="">All Types</option>
            {switchSocketSubcategories.map((subcat) => (
              <option key={subcat} value={subcat}>
                {subcat}
              </option>
            ))}
          </select>
        </div>
        {selectedModel === "Artisa" && selectedSwitchSocketSubcategory && (
          <div className="mb-2">
            <ArtisaSwitchColorSelector />
          </div>
        )}
        {selectedModel === "Nowa" && selectedSwitchSocketSubcategory && (
          <div className="mb-2">
            <NowaSwitchColorSelector />
          </div>
        )}
            {selectedModel === "Venia" && selectedSwitchSocketSubcategory && (
          <div className="mb-2">
            <VeniaSwitchColorSelector />
          </div>
        )}
        <div className="col-sm-6 col-md-3 mb-2">
          <label className="form-label mb-1">Designer Plates:</label>
          <div
            className="checkbox-container"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={
              !selectedBrand
                ? "Please select a Brand first"
                : !selectedModel
                ? "Please select a Model first"
                : !designerPlateSubcategories.length
                ? "No Designer Plates available"
                : ""
            }
          >
            {designerPlateSubcategories.length > 0 ? (
              designerPlateSubcategories.map((subcat) => (
                <div className="form-check" key={subcat}>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value={subcat}
                    id={`designer-plate-${subcat}`}
                    checked={selectedDesignerPlateSubcategories.includes(
                      subcat
                    )}
                    onChange={() => handleDesignerPlateCheckboxChange(subcat)}
                    disabled={!selectedBrand || !selectedModel}
                    aria-label={`Select ${subcat}`}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`designer-plate-${subcat}`}
                  >
                    {subcat}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-muted mb-0">No Designer Plates available</p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="card border-danger mb-4 fade-in">
          <div className="card-body text-center">
            <h5 className="card-title text-danger">Error</h5>
            <p className="card-text">{error}</p>
            <button className="btn btn-primary btn-sm" onClick={handleRetry}>
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="table-responsive fade-in">
        <table className="tm_round_border table align-items-center justify-content-center mb-0">
          <thead className="table-light">
            <tr>
              <th scope="col">SR NO</th>
              <th scope="col">Item Name</th>
              <th scope="col">Brand</th>
              <th scope="col">Model</th>
              <th scope="col">Type</th>
              <th scope="col">MRP</th>
              <th scope="col">Qty</th>
              <th scope="col">Discount (%)</th>
              <th scope="col">Net Price</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                const qty = Math.max(0, product.qty || 0);
                const discount = Math.max(
                  0,
                  Math.min(100, product.discount || 0)
                );
                const mrp = product.price || 0;
                // Net Price excludes quantity: MRP * (1 - Discount/100)
                const netPrice = mrp * (1 - discount / 100);
                // Amount includes quantity: Net Price * Qty
                const amount = netPrice * qty;
                const categoryClass = categoryColors[product.category || "N/A"];
                const isBackGridFrame =
                  product.category === "Designer Plates" &&
                  product.subcategory === "Back Grid Frames";

                return (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.itemname || "N/A"}</td>
                    <td>{product.brand || "N/A"}</td>
                    <td>{product.model || "N/A"}</td>
                    <td className={categoryClass}>
                      {product.subcategory || "N/A"}
                    </td>
                    <td>₹{mrp.toFixed(2)}</td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        value={qty}
                        onChange={(e) =>
                          handleQtyChange(product.id, parseInt(e.target.value))
                        }
                        className={`form-control form-control-sm text-center ${
                          qty < 0 ? "is-invalid" : ""
                        }`}
                        style={{ width: 55 }}
                        disabled={
                          isBackGridFrame &&
                          selectedDesignerPlateSubcategories.length > 0
                        }
                        aria-label={`Quantity for ${
                          product.itemname || "item"
                        }`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={discount}
                        onChange={(e) =>
                          handleDiscountChange(
                            product.id,
                            parseFloat(e.target.value)
                          )
                        }
                        className={`form-control form-control-sm text-center ${
                          discount < 0 || discount > 100 ? "is-invalid" : ""
                        }`}
                        style={{ width: 55 }}
                        aria-label={`Discount for ${
                          product.itemname || "item"
                        }`}
                      />
                    </td>
                    <td>₹{isNaN(netPrice) ? "0.00" : netPrice.toFixed(2)}</td>
                    <td>₹{isNaN(amount) ? "0.00" : amount.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10} className="text-center text-muted py-3">
                  {selectedBrand
                    ? "No products found."
                    : "Please select a Brand to start filtering."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex container py-4 fade-in">
        <div className="col-sm-6"></div>
        <div className="col-sm-6">
          <h5 className="mb-3">Total Amount Details</h5>
          <GSTCalculator
            totalAmount={totalAmount}
            onGSTChange={handleGSTChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SwitchQuotatTable;
