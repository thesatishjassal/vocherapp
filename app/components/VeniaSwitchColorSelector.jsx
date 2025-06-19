"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

const venia_swcolors = [
    {
      "item_code": "B0110",
      "White_mrp": 125,
      "dark_gery_mrp": 150,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0120",
      "White_mrp": 125,
      "dark_gery_mrp": 150,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0111",
      "White_mrp": 200,
      "dark_gery_mrp": 245,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0210",
      "White_mrp": 190,
      "dark_gery_mrp": 235,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0220",
      "White_mrp": 195,
      "dark_gery_mrp": 240,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0130",
      "White_mrp": 205,
      "dark_gery_mrp": 250,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0230",
      "White_mrp": 255,
      "dark_gery_mrp": 305,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0131",
      "White_mrp": 260,
      "dark_gery_mrp": 310,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0160",
      "White_mrp": 205,
      "dark_gery_mrp": 250,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0161",
      "White_mrp": 260,
      "dark_gery_mrp": 310,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0150",
      "White_mrp": 240,
      "dark_gery_mrp": 285,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0151",
      "White_mrp": 305,
      "dark_gery_mrp": 370,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0551",
      "White_mrp": 575,
      "dark_gery_mrp": 690,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0310",
      "White_mrp": 195,
      "dark_gery_mrp": 240,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0311",
      "White_mrp": 270,
      "dark_gery_mrp": 330,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B0341",
      "White_mrp": 310,
      "dark_gery_mrp": 375,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B1212",
      "White_mrp": 215,
      "dark_gery_mrp": 255,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B1332",
      "White_mrp": 410,
      "dark_gery_mrp": 410,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B1352",
      "White_mrp": 490,
      "dark_gery_mrp": 490,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B1700",
      "White_mrp": 600,
      "dark_gery_mrp": 600,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B1900",
      "White_mrp": 725,
      "dark_gery_mrp": 725,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B4900",
      "White_mrp": 190,
      "dark_gery_mrp": 235,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B4797",
      "White_mrp": 195,
      "dark_gery_mrp": 240,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B5200",
      "White_mrp": 700,
      "dark_gery_mrp": 770,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B5310",
      "White_mrp": 765,
      "dark_gery_mrp": 865,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B4600",
      "White_mrp": 195,
      "dark_gery_mrp": 240,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B4921",
      "White_mrp": 1165,
      "dark_gery_mrp": 1395,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B4922",
      "White_mrp": 2835,
      "dark_gery_mrp": 3405,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B4500",
      "White_mrp": 165,
      "dark_gery_mrp": 195,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "B3900",
      "White_mrp": 55,
      "dark_gery_mrp": 65,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP911",
      "White_mrp": 130,
      "dark_gery_mrp": 160,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP922",
      "White_mrp": 130,
      "dark_gery_mrp": 160,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP933",
      "White_mrp": 165,
      "dark_gery_mrp": 195,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP944",
      "White_mrp": 205,
      "dark_gery_mrp": 250,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP956",
      "White_mrp": 280,
      "dark_gery_mrp": 330,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP968H",
      "White_mrp": 320,
      "dark_gery_mrp": 385,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP968S",
      "White_mrp": 340,
      "dark_gery_mrp": 410,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP979",
      "White_mrp": 385,
      "dark_gery_mrp": 470,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP97125",
      "White_mrp": 470,
      "dark_gery_mrp": 565,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP9716S",
      "White_mrp": 645,
      "dark_gery_mrp": 780,
      "brand": "wipro",
      "model": "venia"
    },
    {
      "item_code": "BP9718S",
      "White_mrp": 705,
      "dark_gery_mrp": 845,
      "brand": "wipro",
      "model": "venia"
    }
];

const colorMap = {
  white: "White_mrp",
  dark_grey: "dark_grey_mrp",
};

// Helper function to format color names (e.g., "dark_grey" -> "Dark Grey")
const formatColorName = (colorKey) => {
  return colorKey
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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
              ₹{totalWithGST.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const VeniaSwitchColorSelector = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState(Object.keys(colorMap)[0] || "white");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryColors = {
    Switches: "bg-primary-subtle",
    "N/A": "bg-light",
  };

  // Dynamically get color options from colorMap
  const colorOptions = useMemo(() => {
    return Object.keys(colorMap).map(colorKey => ({
      value: colorKey,
      label: formatColorName(colorKey),
    }));
  }, []);

  // Initialize products from venia_swcolors
  useEffect(() => {
    try {
      setLoading(true);
      const productsWithQty = venia_swcolors.map((product) => ({
        ...product,
        qty: product.qty || 0,
        discount: product.discount || 0,
        id: product.item_code || Math.random().toString(36).substring(2),
        category: "Switches",
      }));
      setProducts(productsWithQty);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter products based on selected color
  const filtered = useMemo(() => {
    return products
      .filter((product) => {
        const price = product[colorMap[selectedColor]];
        return price && price !== "on_request";
      })
      .map((product) => ({
        ...product,
        price: product[colorMap[selectedColor]], // Set price based on selected color
      }));
  }, [products, selectedColor]);

  // Sync filteredProducts and log to console
  useEffect(() => {
    setFilteredProducts(filtered);
    // Log filtered products based on selected color
    console.log(`Filtered products for color: ${formatColorName(selectedColor)}`, filtered);
  }, [filtered, selectedColor]);

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

  const handleGSTChange = useCallback(() => {
    // No-op for GSTCalculator compatibility
  }, []);

  return (
    <div className="position-relative">
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
          <label className="form-label mb-1">Select Venia Switch Color:</label>
          <select
            className="form-select form-select-sm"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            aria-label="Select Color"
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="card border-danger mb-4 fade-in">
          <div className="card-body text-center">
            <h5 className="card-title text-danger">Error</h5>
            <p className="card-text">{error}</p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeniaSwitchColorSelector;