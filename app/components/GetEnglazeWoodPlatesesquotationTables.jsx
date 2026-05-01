"use client";
import React, { useEffect, useState, useMemo } from "react";

export default function GetEnglazeWoodPlates({ onDataChange }) {
  const [plates, setPlates] = useState([]);
  const [qty, setQty] = useState({});
  const [discount, setDiscount] = useState({});
  const [netPrice, setNetPrice] = useState({}); // ✅ ADDED
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://api.panvic.in/csv/read-file/englaze_wood_plate.csv")
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

      ["mocha_wood", "beige_wood", "oak_wood"].forEach((variant) => {
        const quantity = q[variant] || 0;
        const mrp = Number(pl[`${variant}_mrp`]) || 0;
        const net = netPrice[pl.item_code]?.[variant] ?? mrp; // ✅ use netPrice if set

        if (quantity > 0) {
          const amount = quantity * net;
          const netAfterDisc = amount * (1 - d / 100);

          data.push({
            itemCode: pl.item_code,
            itemName: pl.description,
            brand: pl.brand,
            model: pl.model,
            color: variant,
            category: "Wood Plate",
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

  if (loading) return <p>Loading Wood Plates...</p>;

  return (
    <table className="tm_round_border table align-items-center justify-content-center mb-0">
      <thead>
        <tr>
          <th>Code</th>
          <th>Description</th>
          <th>Mocha MRP</th>
          <th>Mocha Net</th>
          <th>Qty</th>
          <th>Beige MRP</th>
          <th>Beige Net</th>
          <th>Qty</th>
          <th>Oak MRP</th>
          <th>Oak Net</th>
          <th>Qty</th>
          <th>Disc%</th>
        </tr>
      </thead>

      <tbody>
        {plateItems.map((pl) => (
          <tr key={pl.item_code}>
            <td>{pl.item_code}</td>
            <td>{pl.description}</td>

            {/* MOCHA WOOD */}
            <td>{pl.mocha_wood_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.mocha_wood ?? pl.mocha_wood_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "mocha_wood", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "mocha_wood", e.target.value)
                }
              />
            </td>

            {/* BEIGE WOOD */}
            <td>{pl.beige_wood_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.beige_wood ?? pl.beige_wood_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "beige_wood", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "beige_wood", e.target.value)
                }
              />
            </td>

            {/* OAK WOOD */}
            <td>{pl.oak_wood_mrp}</td>
            <td>
              <input
                type="number"
                value={netPrice[pl.item_code]?.oak_wood ?? pl.oak_wood_mrp}
                onChange={(e) =>
                  handleNetPriceChange(pl.item_code, "oak_wood", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                onChange={(e) =>
                  handleQtyChange(pl.item_code, "oak_wood", e.target.value)
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
