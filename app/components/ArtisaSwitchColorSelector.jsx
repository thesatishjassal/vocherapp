"use client";
import { useState, useEffect, useMemo, useCallback } from "react";

const artisa_swcolors = [
{
      "item_code": "R0110",
      "White_mrp": 200,
      "silver_grey_mrp": 250,
      "galaxy_black_mrp": 250,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R011",
      "White_mrp": 310,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": 370,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0210",
      "White_mrp": 285,
      "silver_grey_mrp": 355,
      "galaxy_black_mrp": 355,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0130",
      "White_mrp": 335,
      "silver_grey_mrp": 410,
      "galaxy_black_mrp": 410,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0131",
      "White_mrp": 410,
      "silver_grey_mrp": 460,
      "galaxy_black_mrp": 460,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0230",
      "White_mrp": 415,
      "silver_grey_mrp": 490,
      "galaxy_black_mrp": 490,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0132",
      "White_mrp": 425,
      "silver_grey_mrp": 505,
      "galaxy_black_mrp": 505,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0133",
      "White_mrp": 490,
      "silver_grey_mrp": 595,
      "galaxy_black_mrp": 595,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0233",
      "White_mrp": 565,
      "silver_grey_mrp": 680,
      "galaxy_black_mrp": 680,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0150",
      "White_mrp": 450,
      "silver_grey_mrp": 550,
      "galaxy_black_mrp": 550,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0151",
      "White_mrp": 525,
      "silver_grey_mrp": 620,
      "galaxy_black_mrp": 620,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0171",
      "White_mrp": 1205,
      "silver_grey_mrp": 1305,
      "galaxy_black_mrp": 1305,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0310",
      "White_mrp": 305,
      "silver_grey_mrp": 370,
      "galaxy_black_mrp": 370,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0311",
      "White_mrp": 390,
      "silver_grey_mrp": 490,
      "galaxy_black_mrp": 490,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R0341",
      "White_mrp": 470,
      "silver_grey_mrp": 580,
      "galaxy_black_mrp": 580,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF110",
      "White_mrp": 290,
      "silver_grey_mrp": 360,
      "galaxy_black_mrp": 360,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF111",
      "White_mrp": 445,
      "silver_grey_mrp": 515,
      "galaxy_black_mrp": 515,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF210",
      "White_mrp": 395,
      "silver_grey_mrp": 500,
      "galaxy_black_mrp": 500,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF211",
      "White_mrp": 495,
      "silver_grey_mrp": 595,
      "galaxy_black_mrp": 595,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF130",
      "White_mrp": 455,
      "silver_grey_mrp": 515,
      "galaxy_black_mrp": 515,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF131",
      "White_mrp": 600,
      "silver_grey_mrp": 680,
      "galaxy_black_mrp": 680,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF230",
      "White_mrp": 625,
      "silver_grey_mrp": 685,
      "galaxy_black_mrp": 685,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF231",
      "White_mrp": 755,
      "silver_grey_mrp": 790,
      "galaxy_black_mrp": 790,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF161",
      "White_mrp": 625,
      "silver_grey_mrp": 680,
      "galaxy_black_mrp": 680,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF310",
      "White_mrp": 535,
      "silver_grey_mrp": 560,
      "galaxy_black_mrp": 560,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RF311",
      "White_mrp": 645,
      "silver_grey_mrp": 675,
      "galaxy_black_mrp": 675,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1212",
      "White_mrp": 370,
      "silver_grey_mrp": 435,
      "galaxy_black_mrp": 435,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1332",
      "White_mrp": 500,
      "silver_grey_mrp": 625,
      "galaxy_black_mrp": 625,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1352",
      "White_mrp": 585,
      "silver_grey_mrp": 715,
      "galaxy_black_mrp": 715,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1700",
      "White_mrp": 855,
      "silver_grey_mrp": 1025,
      "galaxy_black_mrp": 1025,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1920",
      "White_mrp": 1300,
      "silver_grey_mrp": 1540,
      "galaxy_black_mrp": 1540,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1500",
      "White_mrp": 1155,
      "silver_grey_mrp": 1385,
      "galaxy_black_mrp": 1385,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R2700",
      "White_mrp": 1500,
      "silver_grey_mrp": 1865,
      "galaxy_black_mrp": 1865,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4300",
      "White_mrp": 1365,
      "silver_grey_mrp": 1420,
      "galaxy_black_mrp": 1420,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4401",
      "White_mrp": 1195,
      "silver_grey_mrp": 1430,
      "galaxy_black_mrp": 1430,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4797",
      "White_mrp": 295,
      "silver_grey_mrp": 345,
      "galaxy_black_mrp": 345,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4900",
      "White_mrp": 285,
      "silver_grey_mrp": 335,
      "galaxy_black_mrp": 335,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R5200",
      "White_mrp": 870,
      "silver_grey_mrp": 960,
      "galaxy_black_mrp": 960,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R5300",
      "White_mrp": "on_request",
      "silver_grey_mrp": "on_request",
      "galaxy_black_mrp": "on_request",
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R5310",
      "White_mrp": 935,
      "silver_grey_mrp": 1025,
      "galaxy_black_mrp": 1025,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4921",
      "White_mrp": 2325,
      "silver_grey_mrp": 2545,
      "galaxy_black_mrp": 2545,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4600",
      "White_mrp": 365,
      "silver_grey_mrp": 365,
      "galaxy_black_mrp": 365,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RFL922",
      "White_mrp": 890,
      "silver_grey_mrp": 1010,
      "galaxy_black_mrp": 1010,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4604",
      "White_mrp": 680,
      "silver_grey_mrp": 710,
      "galaxy_black_mrp": 710,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4605",
      "White_mrp": 370,
      "silver_grey_mrp": 380,
      "galaxy_black_mrp": 380,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R5500",
      "White_mrp": 4685,
      "silver_grey_mrp": 4820,
      "galaxy_black_mrp": 4820,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R1542",
      "White_mrp": 5370,
      "silver_grey_mrp": 5415,
      "galaxy_black_mrp": 5415,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R3900",
      "White_mrp": 70,
      "silver_grey_mrp": 95,
      "galaxy_black_mrp": 95,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4931",
      "White_mrp": 3060,
      "silver_grey_mrp": 3605,
      "galaxy_black_mrp": 3605,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4932",
      "White_mrp": 4435,
      "silver_grey_mrp": 5225,
      "galaxy_black_mrp": 5225,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "R4912",
      "White_mrp": 1440,
      "silver_grey_mrp": 1875,
      "galaxy_black_mrp": 1875,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "6A",
      "White_mrp": 550,
      "silver_grey_mrp": 550,
      "galaxy_black_mrp": 670,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "6A",
      "White_mrp": 1200,
      "silver_grey_mrp": 1200,
      "galaxy_black_mrp": 1450,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP911",
      "White_mrp": 235,
      "silver_grey_mrp": 235,
      "galaxy_black_mrp": 385,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP922",
      "White_mrp": 255,
      "silver_grey_mrp": 255,
      "galaxy_black_mrp": 415,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP933",
      "White_mrp": 290,
      "silver_grey_mrp": 290,
      "galaxy_black_mrp": 465,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP944",
      "White_mrp": 305,
      "silver_grey_mrp": 305,
      "galaxy_black_mrp": 505,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP966",
      "White_mrp": 615,
      "silver_grey_mrp": 615,
      "galaxy_black_mrp": 1050,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP968H",
      "White_mrp": 665,
      "silver_grey_mrp": 665,
      "galaxy_black_mrp": 1150,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP968",
      "White_mrp": 790,
      "silver_grey_mrp": 790,
      "galaxy_black_mrp": 1315,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP9712S",
      "White_mrp": 955,
      "silver_grey_mrp": 955,
      "galaxy_black_mrp": 1590,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP9716S",
      "White_mrp": 1020,
      "silver_grey_mrp": 1020,
      "galaxy_black_mrp": 1725,
      "brand": "wipro",
      "model": "artisa"
    },
    {
      "item_code": "RP9718S",
      "White_mrp": 1105,
      "silver_grey_mrp": 1105,
      "galaxy_black_mrp": 1850,
      "brand": "wipro",
      "model": "artisa"
    }
];

const colorMap = {
  white: "White_mrp",
  silver_grey: "silver_grey_mrp",
  galaxy_black: "galaxy_black_mrp",
};

const GSTCalculator = ({ totalAmount, onGSTChange }) => {
  const [gstPercentage, setGstPercentage] = useState(0);
  const [gstType, setGstType] = useState("include");

  const gstAmount = useMemo(() => (totalAmount * gstPercentage) / 100, [totalAmount, gstPercentage]);
  const totalWithGST = useMemo(() => (gstType === "exclude" ? totalAmount + gstAmount : totalAmount), [gstType, totalAmount, gstAmount]);
  const withoutGST = useMemo(() => (gstType === "exclude" ? totalAmount : totalAmount / (1 + gstPercentage / 100)), [gstType, totalAmount, gstPercentage]);

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
  }, [gstAmount, totalWithGST, withoutGST, gstPercentage, gstType, onGSTChange]);

  return (
    <div className="row p-4">
      {gstType === "exclude" && (
        <div className="col-sm-6 mb-2">
          <input
            type="number"
            placeholder="Enter GST%"
            value={gstPercentage}
            onChange={(e) => setGstPercentage(Math.max(0, parseFloat(e.target.value) || 0))}
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
                  <p className="m-0">GST Amt (<b>{gstPercentage}%</b>):</p>
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
                Total Amount <b>{gstType === "exclude" ? "with" : "including"} GST</b>:
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

const ArtisaSwitchColorSelector = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedColor, setSelectedColor] = useState("white");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categoryColors = {
    Switches: "bg-primary-subtle",
    "N/A": "bg-light",
  };

  // Initialize products from artisa_swcolors
  useEffect(() => {
    try {
      setLoading(true);
      const productsWithQty = artisa_swcolors.map((product) => ({
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
    const validatedDiscount = Math.max(0, Math.min(100, parseFloat(newDiscount) || 0));
    setFilteredProducts((prev) =>
      prev.map((product) =>
        product.id === id ? { ...product, discount: validatedDiscount } : product
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
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          to { opacity: 0; }
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
          className={`d-flex justify-content-center align-items-center position-absolute top-0 start-0 w-100 h-100 fade-in ${loading ? "" : "fade-out"}`}
          style={{ backgroundColor: "rgba(0, 0, 0, 0.1)", zIndex: 1000 }}
        >
          <div className="text-center">
            <div className="spinner-border spinner-border-lg text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading products...</p>
          </div>
        </div>
      )}

      <div className="mb-4 row align-items-start">
        <div className="col-sm-6 col-md-3 mb-2">
          <label className="form-label mb-1">Select Artisan Switch Color:</label>
          <select
            className="form-select form-select-sm"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            aria-label="Select Color"
          >
            <option value="white">White</option>
            <option value="silver_grey">Silver Grey</option>
            <option value="galaxy_black">Galaxy Black</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="card border-danger mb-4 fade-in">
          <div className="card-body text-center">
            <h5 className="card-title text-danger">Error</h5>
            <p className="card-text">{error}</p>
            <button className="btn btn-primary btn-sm" onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default ArtisaSwitchColorSelector;