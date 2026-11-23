// PriceUploadModal.jsx — opens <PriceUpload /> in a popup.
// Next.js app router: add "use client"; as the first line.
//
// Usage (simple — includes its own button):
//   <PriceUploadModal onUpdated={() => refreshProducts()} />
//
// Usage (controlled — open it from your own button):
//   const [open, setOpen] = useState(false);
//   <button onClick={() => setOpen(true)}>Update Prices</button>
//   <PriceUploadModal open={open} onClose={() => setOpen(false)} hideTrigger />

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PriceUpload from "./PriceUpload";

export default function PriceUploadModal({
  open: openProp,          // optional: control open state from parent
  onClose,                 // optional: called when modal closes
  onUpdated,               // optional: called after prices are saved (refresh your list here)
  hideTrigger = false,     // true = don't render the built-in button
  triggerLabel = "Update Prices from Excel",
  title = "Update Product Prices",
}) {
  const controlled = openProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = controlled ? openProp : openState;

  const [busy, setBusy] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [resetKey, setResetKey] = useState(0); // new key = fresh form each time it opens
  const dialogRef = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => setMounted(true), []); // portal only on client (safe for Next.js SSR)

  const openModal = useCallback(() => {
    if (!controlled) setOpenState(true);
  }, [controlled]);

  const close = useCallback(() => {
    if (busy) return; // don't close while saving
    if (!controlled) setOpenState(false);
    onClose?.();
  }, [busy, controlled, onClose]);

  // When opened: lock page scroll, focus dialog; restore on close
  useEffect(() => {
    if (!open) return;
    setResetKey((k) => k + 1);
    lastFocus.current = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => dialogRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus?.();
    };
  }, [open]);

  // Esc key closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const modal =
    open && mounted
      ? createPortal(
          <div style={s.backdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="price-upload-title"
              tabIndex={-1}
              style={s.dialog}
            >
              <div style={s.header}>
                <h3 id="price-upload-title" style={s.title}>{title}</h3>
                <button
                  onClick={close}
                  disabled={busy}
                  aria-label="Close"
                  title={busy ? "Please wait…" : "Close"}
                  style={{ ...s.close, opacity: busy ? 0.4 : 1, cursor: busy ? "not-allowed" : "pointer" }}
                >
                  ×
                </button>
              </div>
              <div style={s.body}>
                <PriceUpload key={resetKey} embedded onUpdated={onUpdated} onBusyChange={setBusy} />
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {!hideTrigger && (
        <button style={s.trigger} onClick={openModal}>
          ⬆ {triggerLabel}
        </button>
      )}
      {modal}
    </>
  );
}

const s = {
  trigger: {
    padding: "10px 16px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 6,
    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "Arial, sans-serif",
  },
  backdrop: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
  },
  dialog: {
    background: "#fff", borderRadius: 12, width: "100%", maxWidth: 960, maxHeight: "90vh",
    display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", outline: "none",
  },
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 20px", borderBottom: "1px solid #eee",
  },
  title: { margin: 0, fontSize: 18, fontFamily: "Arial, sans-serif", color: "#222" },
  close: {
    background: "none", border: "none", fontSize: 28, lineHeight: 1, color: "#666", padding: "0 4px",
  },
  body: { padding: 20, overflowY: "auto" },
};