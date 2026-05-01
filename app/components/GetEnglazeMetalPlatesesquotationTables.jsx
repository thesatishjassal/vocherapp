"use client";
import React, { useEffect, useState, useMemo } from "react";

export default function GetEnglazeMetalPlates({ onDataChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [netPrice, setNetPrice] = useState({}); // ✅ ADDED
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.panvic.in/csv/read-file/englaze_metal_plate.csv")
      .then((res) => res.json())
      .then((json) => {
        setPlates(json.data || []);
        setLoading(false);
      });
  }, []);

  const plateItems = useMemo(() => plates || [], [plates]);

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

  useEffect(() => {
    const data = [];

    plateItems.forEach((pl) => {
      const q = qty[pl.item_code] || {};
      const d = discount[pl.item_code] || 0;

      const variants = [
        { key: "grid_frame", label: "Grid Frame", mrp: pl.grid_frame_mrp },
        { key: "metallic_gold", label: "Metallic Gold", mrp: pl.metallic_gold_mrp },
        { key: "brush_silver", label: "Brush Silver", mrp: pl.brush_silver_mrp },
        { key: "jet_black", label: "Jet Black", mrp: pl.jet_black_mrp },
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
            category: "Metal Plate",
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

  if (loading) return <p>Loading Metal Plates...</p>;

  return (
    <table className="tm_round_border table align-items-center justify-content-center mb-0">
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th>Grid MRP</th>
          <th>Grid Net</th>
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

            {/* METALLIC GOLD */}
            <td>{pl.metallic_gold_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.metallic_gold ?? pl.metallic_gold_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "metallic_gold", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "metallic_gold", e.target.value)
                }
              />
            </td>

            {/* BRUSH SILVER */}
            <td>{pl.brush_silver_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.brush_silver ?? pl.brush_silver_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "brush_silver", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "brush_silver", e.target.value)
                }
              />
            </td>

            {/* JET BLACK */}
            <td>{pl.jet_black_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.jet_black ?? pl.jet_black_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "jet_black", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "jet_black", e.target.value)
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
