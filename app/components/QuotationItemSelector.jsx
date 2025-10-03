"use client";

import React, { useEffect, useState } from "react";
import { Select, Button } from "rsuite";

export default function QuotationItemSelector({ onItemsSelect }) {
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all quotations on mount
  useEffect(() => {
    fetch("https://api.panvic.in/quotation/")
      .then((res) => res.json())
      .then((data) => {
        setQuotations(data || []);
      })
      .catch((err) => console.error("Error fetching quotations:", err));
  }, []);

  // Fetch items when a quotation is selected
  useEffect(() => {
    if (!selectedQuotation) return;

    setLoading(true);
    fetch(`https://api.panvic.in/quotation/${selectedQuotation}/items/`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data || []);
        onItemsSelect && onItemsSelect(data); // Pass items to parent (for sales order)
      })
      .catch((err) => console.error("Error fetching items:", err))
      .finally(() => setLoading(false));
  }, [selectedQuotation]);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Select Quotation</h2>

      {/* Dropdown for quotation numbers */}
      <Select
        data={quotations.map((q) => ({
          label: `Quotation #${q.quotation_number}`,
          value: q.quotation_number,
        }))}
        style={{ width: "100%" }}
        placeholder="Choose Quotation"
        value={selectedQuotation}
        onChange={setSelectedQuotation}
      />

      {/* Items List */}
      {loading && <p>Loading items...</p>}
      {!loading && items.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Quotation Items:</h3>
          <ul className="border rounded-lg p-3 space-y-1">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex justify-between border-b py-1 text-sm"
              >
                <span>
                  {item.product_name} ({item.quantity} {item.unit})
                </span>
                <span className="font-semibold">₹{item.price}</span>
              </li>
            ))}
          </ul>
          <Button
            appearance="primary"
            onClick={() => onItemsSelect && onItemsSelect(items)}
          >
            Add to Sales Order
          </Button>
        </div>
      )}
    </div>
  );
}
