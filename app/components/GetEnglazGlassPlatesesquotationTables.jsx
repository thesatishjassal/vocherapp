"use client";
import React, { useEffect, useState, useMemo } from "react";

export default function GetEnglazGlassPlatesesquotationTables({ onDataChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [netPrice, setNetPrice] = useState({}); // ✅ ADDED
  const [loading, setLoading] = useState(true);

  /* FETCH DATA */
  useEffect(() => {
    fetch("https://api.panvic.in/csv/read-file/englaze_glass_plate.csv")
      .then((res) => res.json())
      .then((json) => {
        setPlates(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const plateItems = useMemo(() => plates || [], [plates]);

  /* HANDLERS */
  const handleQtyChange = (code, type, value) => {
    setQty((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: Number(value) || 0,
      },
    }));
  };

  const handleDiscountChange = (code, value) => {
    setDiscount((prev) => ({
      ...prev,
      [code]: Number(value) || 0,
    }));
  };

  // ✅ ADDED
  const handleNetPriceChange = (code, type, value) => {
    setNetPrice((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [type]: Number(value) || 0,
      },
    }));
  };

  /* BUILD JSON */
  useEffect(() => {
    const data = [];

    plateItems.forEach((pl) => {
      const q = qty[pl.item_code] || {};
      const d = discount[pl.item_code] || 0;

      const variants = [
        { key: "grid_frame",     label: "Grid Frame",     mrp: pl.grid_frame_mrp },
        { key: "icy_white",      label: "Icy White",      mrp: pl.icy_white_mrp },
        { key: "chamagne_gold",  label: "Chamagne Gold",  mrp: pl.chamagne_gold_mrp },
        { key: "silky_silver",   label: "Silky Silver",   mrp: pl.silky_silver_mrp },
        { key: "midnight_black", label: "Midnight Black", mrp: pl.midnight_black_mrp },
        { key: "oceanic_green",  label: "Oceanic Green",  mrp: pl.oceanic_green_mrp },
        { key: "matte_mirror",   label: "Matte Mirror",   mrp: pl.matte_mirror_mrp },
      ];

      variants.forEach((variant) => {
        const quantity = q[variant.key] || 0;
        const mrp = Number(variant.mrp) || 0;
        const net = netPrice[pl.item_code]?.[variant.key] ?? mrp; // ✅ use netPrice if set

        if (quantity > 0) {
          const amount = quantity * net;
          const netAfterDisc = amount * (1 - d / 100);

          data.push({
            itemCode: pl.item_code,
            itemName: pl.description,
            brand: pl.brand,
            model: pl.model,
            color: variant.label,
            category: "Glass Plate",
            subCategory: pl.sub_category,
            moduleSize: pl.module_size,
            qty: quantity,
            mrp,
            amount,
            discount: d,
            netPrice: netAfterDisc,
          });
        }
      });
    });

    onDataChange?.(data);
  }, [qty, discount, netPrice, plateItems, onDataChange]); // ✅ netPrice in deps

  if (loading) return <p>Loading Glass Plates...</p>;

  return (
    <table className="tm_round_border table align-items-center justify-content-center mb-0">
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th>Grid MRP</th>
          <th>Grid Net</th>
          <th>Qty</th>
          <th>White MRP</th>
          <th>White Net</th>
          <th>Qty</th>
          <th>Gold MRP</th>
          <th>Gold Net</th>
          <th>Qty</th>
          <th>Silver MRP</th>
          <th>Silver Net</th>
          <th>Qty</th>
          <th>Black MRP</th>
          <th>Black Net</th>
          <th>Qty</th>
          <th>Green MRP</th>
          <th>Green Net</th>
          <th>Qty</th>
          <th>Mirror MRP</th>
          <th>Mirror Net</th>
          <th>Qty</th>
          <th>Disc%</th>
        </tr>
      </thead>

      <tbody>
        {plateItems.map((pl) => (
          <tr key={pl.item_code}>
            <td>{pl.item_code}</td>
            <td>{pl.description}</td>

            {/* GRID FRAME */}
            <td>{pl.grid_frame_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.grid_frame ?? pl.grid_frame_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "grid_frame", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "grid_frame", e.target.value)
                }
              />
            </td>

            {/* ICY WHITE */}
            <td>{pl.icy_white_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.icy_white ?? pl.icy_white_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "icy_white", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "icy_white", e.target.value)
                }
              />
            </td>

            {/* CHAMAGNE GOLD */}
            <td>{pl.chamagne_gold_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.chamagne_gold ?? pl.chamagne_gold_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "chamagne_gold", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "chamagne_gold", e.target.value)
                }
              />
            </td>

            {/* SILKY SILVER */}
            <td>{pl.silky_silver_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.silky_silver ?? pl.silky_silver_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "silky_silver", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "silky_silver", e.target.value)
                }
              />
            </td>

            {/* MIDNIGHT BLACK */}
            <td>{pl.midnight_black_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.midnight_black ?? pl.midnight_black_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "midnight_black", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "midnight_black", e.target.value)
                }
              />
            </td>

            {/* OCEANIC GREEN */}
            <td>{pl.oceanic_green_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.oceanic_green ?? pl.oceanic_green_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "oceanic_green", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "oceanic_green", e.target.value)
                }
              />
            </td>

            {/* MATTE MIRROR */}
            <td>{pl.matte_mirror_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.matte_mirror ?? pl.matte_mirror_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "matte_mirror", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "matte_mirror", e.target.value)
                }
              />
            </td>

            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleDiscountChange(pl.item_code, e.target.value)
                }
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
