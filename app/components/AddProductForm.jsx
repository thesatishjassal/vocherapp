"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const API = process.env.NEXT_PUBLIC_API_URL;

const CSS = `
.pvapf-bg{position:fixed;inset:0;z-index:1050;display:flex;align-items:center;justify-content:center;padding:10px;background:rgba(0,0,0,.45);font:13px Arial,sans-serif;color:#292929}
.pvapf-bg *{box-sizing:border-box}
.pvapf-card{width:100%;max-width:400px;max-height:92vh;overflow-y:auto;padding:14px;background:#fff;border-radius:10px;box-shadow:0 6px 20px rgba(0,0,0,.15)}
.pvapf-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.pvapf-title{margin:0;font-size:16px;font-weight:700}
.pvapf-x{border:0;background:none;font-size:22px;line-height:1;color:#777;cursor:pointer}
.pvapf-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.pvapf-f{min-width:0}
.pvapf-l{display:block;margin-bottom:3px;font-size:11px;font-weight:600;color:#555}
.pvapf-i{display:block;width:100%;height:32px;padding:0 8px;border:1px solid #e3e3e3;border-radius:6px;background:#fff;font:inherit;color:inherit;outline:0}
.pvapf-i:focus{border-color:#d5a21e}
.pvapf-i:disabled{background:#fafafa}
textarea.pvapf-i{height:44px;padding:6px 8px;resize:none}
.pvapf-bad{border-color:#d93025}
.pvapf-e{display:block;margin-top:2px;font-size:10px;color:#d93025}
.pvapf-more{margin-top:10px;border:1px solid #e3e3e3;border-radius:6px}
.pvapf-more summary{padding:8px 10px;font-weight:700;cursor:pointer;background:#fafafa}
.pvapf-more .pvapf-grid{padding:8px}
.pvapf-row{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 12px;margin:10px 0}
.pvapf-t{display:flex;align-items:center;gap:6px;cursor:pointer;color:#555}
.pvapf-t input{accent-color:#d5a21e;margin:0}
.pvapf-btn{width:100%;height:36px;border:0;border-radius:6px;background:#d5a21e;color:#fff;font:700 14px Arial,sans-serif;cursor:pointer}
.pvapf-btn:hover:not(:disabled){background:#bd8e12}
.pvapf-btn:disabled{opacity:.55;cursor:not-allowed}
@media(max-width:360px){.pvapf-grid{grid-template-columns:1fr}}
`;

const txt = yup.string().nullable();
const schema = yup.object({
  itemcode: yup.string().trim().required("Required"),
  itemname: yup.string().trim().required("Required"),
  price: yup.string().required("Required"),
  quantity: yup.string().required("Required"),
  category: yup.string().required("Required"),
  subcategory: yup.string().required("Required"),
  description: txt, rackcode: txt, size: txt, color: txt, model: txt, brand: txt,
  unit: txt, cct: txt, beamangle: txt, cutoutdia: txt, cri: txt, lumens: txt, watt: txt,
  inDisplay: yup.boolean(),
  reorderEnabled: yup.boolean(),
  reorderqty: yup.number()
    .transform((v, o) => (o === "" ? undefined : v))
    .typeError("Number only")
    .when("reorderEnabled", { is: true, then: (s) => s.required("Required").min(1), otherwise: (s) => s.notRequired() }),
});

const BASIC = [
  ["itemcode", "Item Code"],
  ["itemname", "Product Name"],
  ["price", "Price (₹)", "number"],
  ["quantity", "Stock Qty", "number"],
];
const MORE = [
  ["rackcode", "Rack Code"], ["size", "Size"], ["color", "Color"], ["model", "Model"],
  ["brand", "Brand"], ["unit", "Unit", "select"], ["cct", "CCT"], ["beamangle", "Beam Angle"],
  ["cutoutdia", "Cutout Dia"], ["cri", "CRI"], ["lumens", "Lumens"], ["watt", "Watt"],
];
const UNITS = ["Nos", "Pcs", "Meter", "Set"];
const DEFAULTS = { inDisplay: true, reorderEnabled: false, category: "", subcategory: "", unit: "" };

// fetched once per page load, shared across opens
let listsPromise;
const loadLists = () =>
  (listsPromise ||= Promise.all(
    ["category", "subcategory"].map((p) => fetch(`${API}/${p}/`).then((r) => (r.ok ? r.json() : [])))
  ).catch((e) => { listsPromise = null; throw e; }));

const userName = () => {
  try { return JSON.parse(Cookies.get("user_details") || "{}").name || "System"; }
  catch { return "System"; }
};

export default function AddProductForm({ show, onClose, onSave }) {
  const [[cats, subs], setLists] = useState([[], []]);
  const { register, handleSubmit, reset, watch, setValue,
    formState: { errors, isValid, isSubmitting } } = useForm({
    resolver: yupResolver(schema), mode: "onChange", defaultValues: DEFAULTS,
  });
  const cat = watch("category");
  const reorder = watch("reorderEnabled");

  useEffect(() => {
    if (!show) return;
    loadLists().then(setLists).catch(() => toast.error("Error fetching categories!"));
    const esc = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [show, onClose]);

  useEffect(() => { setValue("subcategory", "", { shouldValidate: true }); }, [cat, setValue]);

  const subOptions = useMemo(() => subs.filter((s) => s.catname === cat), [subs, cat]);

  const onSubmit = async (d) => {
    try {
      const res = await fetch(`${API}/products/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...d,
          inDisplay: d.inDisplay ? "yes" : "no",
          reorderqty: d.reorderEnabled ? d.reorderqty : "",
          created_by: userName(),
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.message || out.detail || "Error adding product");
      toast.success("Product added successfully!");
      onSave?.(out);
      reset(DEFAULTS);
    } catch (e) {
      toast.error(e.message);
    }
  };

  if (!show) return null;

  const field = ([name, label, type]) => (
    <div className="pvapf-f" key={name}>
      <label className="pvapf-l" htmlFor={`pvapf-${name}`}>{label}</label>
      {type === "select" ? (
        <select id={`pvapf-${name}`} className="pvapf-i" {...register(name)}>
          <option value="">Select</option>
          {UNITS.map((u) => <option key={u}>{u}</option>)}
        </select>
      ) : (
        <input id={`pvapf-${name}`} type={type || "text"} min={type ? 0 : undefined} step={type ? "any" : undefined}
          className={`pvapf-i${errors[name] ? " pvapf-bad" : ""}`} {...register(name)} />
      )}
      {errors[name] && <small className="pvapf-e">{errors[name].message}</small>}
    </div>
  );

  return (
    <div className="pvapf-bg" role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <style>{CSS}</style>
      <form className="pvapf-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="pvapf-head">
          <h1 className="pvapf-title">Add Product</h1>
          <button type="button" className="pvapf-x" aria-label="Close" onClick={onClose}>&times;</button>
        </div>

        <div className="pvapf-grid">
          {BASIC.map(field)}
          <div className="pvapf-f">
            <label className="pvapf-l" htmlFor="pvapf-category">Category</label>
            <select id="pvapf-category" className={`pvapf-i${errors.category ? " pvapf-bad" : ""}`} {...register("category")}>
              <option value="" disabled>Select</option>
              {cats.map((c) => <option key={c.id} value={c.catname}>{c.catname}</option>)}
            </select>
          </div>
          <div className="pvapf-f">
            <label className="pvapf-l" htmlFor="pvapf-subcategory">Subcategory</label>
            <select id="pvapf-subcategory" className={`pvapf-i${errors.subcategory ? " pvapf-bad" : ""}`} disabled={!cat} {...register("subcategory")}>
              <option value="" disabled>Select</option>
              {subOptions.map((s) => <option key={s.id} value={s.subcatname}>{s.subcatname}</option>)}
            </select>
          </div>
        </div>

        <details className="pvapf-more">
          <summary>More details (optional)</summary>
          <div className="pvapf-grid">
            <div className="pvapf-f" style={{ gridColumn: "1/-1" }}>
              <label className="pvapf-l" htmlFor="pvapf-description">Description</label>
              <textarea id="pvapf-description" className="pvapf-i" {...register("description")} />
            </div>
            {MORE.map(field)}
          </div>
        </details>

        <div className="pvapf-row">
          <label className="pvapf-t"><input type="checkbox" {...register("inDisplay")} />Show in Display</label>
          <label className="pvapf-t"><input type="checkbox" {...register("reorderEnabled")} />Enable Reorder Qty</label>
        </div>

        {reorder && (
          <div className="pvapf-f" style={{ marginBottom: 10 }}>
            <label className="pvapf-l" htmlFor="pvapf-reorderqty">Reorder Quantity</label>
            <input id="pvapf-reorderqty" type="number" min={1} className={`pvapf-i${errors.reorderqty ? " pvapf-bad" : ""}`} {...register("reorderqty")} />
            {errors.reorderqty && <small className="pvapf-e">{errors.reorderqty.message}</small>}
          </div>
        )}

        <button type="submit" className="pvapf-btn" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Product"}
        </button>
      </form>
    </div>
  );
}
