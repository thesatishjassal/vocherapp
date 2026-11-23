// PriceUpload.jsx — upload Excel/CSV (itemcode + price) -> preview -> update prices
// API: POST {API_URL}/update-prices-excel/   (form: file, apply)
// Next.js app router: add "use client"; as the first line.

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

const API_URL = "https://api.panvic.in"; // or process.env.NEXT_PUBLIC_API_URL
const ENDPOINT = `${API_URL}/update-prices-excel/`;
const ACCEPT = ".xlsx,.xlsm,.csv";
const PAGE_SIZE = 100; // rows shown at once (keeps big lists fast)

const TABS = [
  { key: "updated", label: "Updated", color: "#2e7d32" },
  { key: "same", label: "Same price", color: "#546e7a" },
  { key: "notFound", label: "Not found", color: "#c62828" },
  { key: "skipped", label: "Skipped", color: "#ef6c00" },
];

const fmt = (n) => (n == null ? "—" : Number(n).toLocaleString("en-IN"));

// Props (all optional):
//   embedded      true = no page margin / title (used inside PriceUploadModal)
//   onUpdated     called with the API result after prices are saved (e.g. refresh product list)
//   onBusyChange  called with true/false while a request is running
export default function PriceUpload({ embedded = false, onUpdated, onBusyChange }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | preview | saving
  const [error, setError] = useState("");
  const [tab, setTab] = useState("updated");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  const loading = status !== "idle";
  const applied = !!result?.applied;
  const summary = result?.summary;

  useEffect(() => { onBusyChange?.(loading); }, [loading, onBusyChange]);
  useEffect(() => () => abortRef.current?.abort(), []); // cancel request on unmount

  const pickFile = useCallback((f) => {
    if (!f) return;
    if (!/\.(xlsx|xlsm|csv)$/i.test(f.name)) {
      setError("Please choose an .xlsx or .csv file.");
      return;
    }
    setFile(f);
    setResult(null);
    setError("");
  }, []);

  const send = useCallback(
    async (apply) => {
      if (!file) return setError("Please choose a file first.");
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setStatus(apply ? "saving" : "preview");
      setError("");

      const form = new FormData();
      form.append("file", file);
      form.append("apply", apply ? "true" : "false");

      try {
        const res = await fetch(ENDPOINT, { method: "POST", body: form, signal: controller.signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const d = data?.detail;
          throw new Error(typeof d === "string" ? d : d ? JSON.stringify(d) : `Error ${res.status}`);
        }
        setResult(data);
        if (apply && data.applied) onUpdated?.(data);
        setTab(data.summary?.updated ? "updated" : data.summary?.not_found_in_database ? "notFound" : "same");
        setSearch("");
        setLimit(PAGE_SIZE);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Something went wrong");
      } finally {
        setStatus("idle");
      }
    },
    [file, onUpdated]
  );

  const confirmAndSave = useCallback(() => {
    const n = summary?.updated || 0;
    if (window.confirm(`Update prices of ${n} products in the database?`)) send(true);
  }, [summary, send]);

  // Normalise all lists once per result
  const lists = useMemo(() => {
    if (!result) return { updated: [], same: [], notFound: [], skipped: [] };
    return {
      updated: result.updated_items || [],
      same: (result.same_price_codes || []).map((itemcode) => ({ itemcode })),
      notFound: (result.not_found_codes || []).map((itemcode) => ({ itemcode })),
      skipped: result.skipped_rows || [],
    };
  }, [result]);

  const counts = useMemo(
    () => ({
      updated: summary?.updated ?? 0,
      same: summary?.already_same_price ?? 0,
      notFound: summary?.not_found_in_database ?? 0,
      skipped: summary?.skipped_invalid_price ?? 0,
    }),
    [summary]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = lists[tab];
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.itemcode?.toLowerCase().includes(q) ||
        r.itemname?.toLowerCase().includes(q) ||
        r.category?.toLowerCase().includes(q)
    );
  }, [lists, tab, search]);

  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  const downloadReport = useCallback(() => {
    if (!result) return;
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [["status", "itemcode", "itemname", "category", "old_price", "new_price", "note"].join(",")];
    lists.updated.forEach((r) =>
      lines.push(["updated", r.itemcode, r.itemname, r.category, r.old_price, r.new_price, ""].map(esc).join(","))
    );
    lists.same.forEach((r) => lines.push(["same_price", r.itemcode, "", "", "", "", ""].map(esc).join(",")));
    lists.notFound.forEach((r) => lines.push(["not_found", r.itemcode, "", "", "", "", ""].map(esc).join(",")));
    lists.skipped.forEach((r) =>
      lines.push(["skipped", r.itemcode, "", "", "", "", `row ${r.row}: ${r.reason}`].map(esc).join(","))
    );
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `price-update-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [result, lists]);

  return (
    <div style={embedded ? s.embedded : s.page}>
      {!embedded && <h2 style={s.h2}>Update Product Prices</h2>}
      <p style={s.muted}>
        Upload an Excel or CSV file with <b>itemcode</b> and <b>price</b> columns. Click <b>Preview</b> first.
        Nothing is saved until you click <b>Update</b>.
      </p>

      {/* Upload */}
      <div
        style={{ ...s.drop, ...(dragOver ? s.dropActive : null) }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile(e.dataTransfer.files?.[0]); }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }}
        />
        {file ? (
          <>
            <div style={{ fontWeight: 600 }}>📄 {file.name}</div>
            <div style={s.muted}>{(file.size / 1024).toFixed(1)} KB · click to change</div>
          </>
        ) : (
          <>
            <div style={{ fontWeight: 600 }}>Drop your file here or click to choose</div>
            <div style={s.muted}>.xlsx or .csv</div>
          </>
        )}
      </div>

      <div style={s.actions}>
        <button style={s.btn} onClick={() => send(false)} disabled={!file || loading}>
          {status === "preview" ? "Checking…" : "Preview"}
        </button>
        {result && !applied && counts.updated > 0 && (
          <button style={{ ...s.btn, background: "#c62828" }} onClick={confirmAndSave} disabled={loading}>
            {status === "saving" ? "Updating…" : `Update ${counts.updated} Prices`}
          </button>
        )}
        {result && (
          <button style={s.btnGhost} onClick={downloadReport} disabled={loading}>
            Download report
          </button>
        )}
      </div>

      {error && <div style={s.error}>{error}</div>}

      {/* Result */}
      {result && (
        <div style={s.card}>
          <div style={applied ? s.success : s.info}>
            {applied ? `✅ ${result.message}` : `👀 ${result.message}`}
          </div>

          <div style={s.stats}>
            <Stat label="Rows in file" value={summary.total_in_file} />
            {TABS.map((t) => (
              <Stat
                key={t.key}
                label={applied || t.key !== "updated" ? t.label : "Will update"}
                value={counts[t.key]}
                color={t.color}
                active={tab === t.key}
                onClick={() => { setTab(t.key); setLimit(PAGE_SIZE); }}
              />
            ))}
          </div>

          <div style={s.tabs}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setLimit(PAGE_SIZE); }}
                style={{ ...s.tab, ...(tab === t.key ? { borderColor: t.color, color: t.color } : null) }}
              >
                {t.label} ({counts[t.key]})
              </button>
            ))}
            <input
              style={s.search}
              placeholder="Search code / name / category"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setLimit(PAGE_SIZE); }}
            />
          </div>

          {filtered.length === 0 ? (
            <p style={s.muted}>Nothing here.</p>
          ) : (
            <div style={s.tableWrap}>
              <table style={s.table}>
                <thead>
                  <TableHead tab={tab} />
                </thead>
                <tbody>
                  {visible.map((r, i) => (
                    <Row key={`${r.itemcode}-${i}`} r={r} i={i} tab={tab} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filtered.length > limit && (
            <button style={{ ...s.btnGhost, marginTop: 10 }} onClick={() => setLimit((l) => l + PAGE_SIZE)}>
              Show more ({filtered.length - limit} left)
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const Stat = memo(function Stat({ label, value, color = "#222", active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ ...s.stat, cursor: onClick ? "pointer" : "default", outline: active ? `2px solid ${color}` : "none" }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{fmt(value)}</div>
      <div style={s.muted}>{label}</div>
    </div>
  );
});

const TableHead = memo(function TableHead({ tab }) {
  if (tab === "updated")
    return (
      <tr>
        <th style={s.th}>#</th>
        <th style={s.th}>Item Code</th>
        <th style={s.th}>Name</th>
        <th style={s.th}>Category</th>
        <th style={s.thR}>Old</th>
        <th style={s.thR}>New</th>
        <th style={s.thR}>Change</th>
      </tr>
    );
  if (tab === "skipped")
    return (
      <tr>
        <th style={s.th}>#</th>
        <th style={s.th}>Row</th>
        <th style={s.th}>Item Code</th>
        <th style={s.th}>Reason</th>
      </tr>
    );
  return (
    <tr>
      <th style={s.th}>#</th>
      <th style={s.th}>Item Code</th>
    </tr>
  );
});

const Row = memo(function Row({ r, i, tab }) {
  if (tab === "updated") {
    const diff = r.old_price == null ? null : r.new_price - r.old_price;
    const color = diff > 0 ? "#2e7d32" : diff < 0 ? "#c62828" : "#666";
    return (
      <tr>
        <td style={s.td}>{i + 1}</td>
        <td style={{ ...s.td, fontWeight: 600 }}>{r.itemcode}</td>
        <td style={s.td}>{r.itemname || "—"}</td>
        <td style={s.td}>{r.category || "—"}</td>
        <td style={s.tdR}>{fmt(r.old_price)}</td>
        <td style={{ ...s.tdR, fontWeight: 600 }}>{fmt(r.new_price)}</td>
        <td style={{ ...s.tdR, color }}>{diff == null ? "new" : diff > 0 ? `+${fmt(diff)}` : fmt(diff)}</td>
      </tr>
    );
  }
  if (tab === "skipped")
    return (
      <tr>
        <td style={s.td}>{i + 1}</td>
        <td style={s.td}>{r.row}</td>
        <td style={s.td}>{r.itemcode}</td>
        <td style={{ ...s.td, color: "#ef6c00" }}>{r.reason}</td>
      </tr>
    );
  return (
    <tr>
      <td style={s.td}>{i + 1}</td>
      <td style={s.td}>{r.itemcode}</td>
    </tr>
  );
});

const s = {
  page: { maxWidth: 1000, margin: "24px auto", padding: "0 16px", fontFamily: "Arial, sans-serif", color: "#222" },
  embedded: { fontFamily: "Arial, sans-serif", color: "#222" },
  h2: { margin: "0 0 6px" },
  muted: { color: "#666", fontSize: 13 },
  drop: {
    marginTop: 14, padding: 24, border: "2px dashed #bbb", borderRadius: 10, textAlign: "center",
    cursor: "pointer", background: "#fafafa", transition: "all .15s",
  },
  dropActive: { borderColor: "#1565c0", background: "#e3f2fd" },
  actions: { display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" },
  btn: {
    padding: "10px 18px", background: "#1565c0", color: "#fff", border: "none", borderRadius: 6,
    fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  btnGhost: {
    padding: "10px 16px", background: "#fff", color: "#1565c0", border: "1px solid #1565c0",
    borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: "pointer",
  },
  error: { marginTop: 14, padding: 10, background: "#fdecea", color: "#b71c1c", borderRadius: 6, fontSize: 14 },
  card: { marginTop: 18, background: "#fff", border: "1px solid #e0e0e0", borderRadius: 10, padding: 18 },
  success: { padding: 10, background: "#e8f5e9", color: "#1b5e20", borderRadius: 6, fontWeight: 600, marginBottom: 14 },
  info: { padding: 10, background: "#fff8e1", color: "#8d6e00", borderRadius: 6, fontWeight: 600, marginBottom: 14 },
  stats: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 14 },
  stat: { background: "#f7f7f7", borderRadius: 8, padding: 12, textAlign: "center" },
  tabs: { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 10 },
  tab: {
    padding: "7px 12px", border: "1px solid #ddd", borderRadius: 20, background: "#fff",
    fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#444",
  },
  search: {
    marginLeft: "auto", minWidth: 220, padding: "8px 10px", border: "1px solid #ccc",
    borderRadius: 6, fontSize: 14,
  },
  tableWrap: { maxHeight: 380, overflow: "auto", border: "1px solid #eee", borderRadius: 6 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 14 },
  th: { textAlign: "left", padding: 8, borderBottom: "2px solid #ddd", background: "#fafafa", position: "sticky", top: 0 },
  thR: { textAlign: "right", padding: 8, borderBottom: "2px solid #ddd", background: "#fafafa", position: "sticky", top: 0 },
  td: { padding: 8, borderBottom: "1px solid #eee" },
  tdR: { padding: 8, borderBottom: "1px solid #eee", textAlign: "right" },
};