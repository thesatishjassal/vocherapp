"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function SwitchQuotationHeader() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
<div className="card-header d-flex justify-content-between align-items-center pb-0">
  <h6>Manage Switch Quotations</h6>

  <div className="custom-dropdown" ref={dropdownRef}>
    <button
      onClick={() => setOpen(!open)}
      className="dropdown-btn"
    >
      + Add Switch Quotation ▾
    </button>

    {open && (
      <div className="dropdown-menu-custom mb-2">
        <Link href="/addswitchquotation" className="dropdown-item" onClick={() => setOpen(false)}>
          Artisan Switch
        </Link>

        <Link href="/addveniaswitchquotation" className="dropdown-item" onClick={() => setOpen(false)}>
          Venia Switch
        </Link>

        <Link href="/addnowaswitchquotation" className="dropdown-item" onClick={() => setOpen(false)}>
          Nowa Switch
        </Link>

        <Link href="/addelglazeswitchquotation" className="dropdown-item" onClick={() => setOpen(false)}>
          Englaze Switch
        </Link>
      </div>
    )}
  </div>
</div>
  );
}