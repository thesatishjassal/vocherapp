"use client";
import React, {
  useState, useEffect, useMemo, useRef, useDeferredValue, useCallback, memo,
} from "react";

/* ---------- Fast product loading ----------
   1. Fetched ONCE per page load and shared (memory cache + in-flight promise).
   2. Saved in sessionStorage -> next open / page refresh shows items instantly,
      then refreshes silently in the background.
   3. Only the 6 needed fields are kept (smaller, faster).
   4. A lowercase search string is built once per item, so filtering is cheap.
   5. Only the first 50 matches are rendered (no heavy 1000-option dropdowns).
*/

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CACHE_KEY = "panvik_products_v1";
const MAX_RESULTS = 50;

let memoryCache = null;
let inflight = null;
let refreshed = false;

const slim = (p) => {
  const itemcode = p.itemcode || "";
  const itemname = p.itemname || "";
  const brand = p.brand || "";
  return {
    itemcode,
    itemname,
    brand,
    unit: p.unit || "Piece",
    price: p.price,
    thumbnail: p.thumbnail || "",
    _s: `${itemcode} ${itemname} ${brand}`.toLowerCase(),
  };
};

const loadProducts = () => {
  if (inflight) return inflight;
  inflight = fetch(`${API_URL}/products/`)
    .then((r) => {
      if (!r.ok) throw new Error("Could not load products");
      return r.json();
    })
    .then((data) => {
      memoryCache = data.map(slim);
      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache));
      } catch (_) {}
      return memoryCache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

/** Optional: call once on the page (e.g. in a useEffect) so items are ready before the modal opens. */
export const prefetchProducts = () => {
  if (refreshed) return;
  refreshed = true;
  loadProducts().catch(() => {
    refreshed = false;
  });
};

/* ---------- Styles ---------- */

const GOLD = "#d3a01d";
const LINE = "#e3e3e3";
const MUTED = "#8a8a8a";

const S = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1060, display: "flex",
    alignItems: "center", justifyContent: "center", padding: 12,
    background: "rgba(0,0,0,.45)", boxSizing: "border-box",
  },
  card: {
    width: "100%", maxWidth: 420, maxHeight: "80vh", display: "flex",
    flexDirection: "column", padding: 16, background: "#fff", borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,.18)", color: "#292929",
    fontFamily: "Arial, Helvetica, sans-serif", fontSize: 13, boxSizing: "border-box",
  },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  close: {
    width: 28, height: 28, border: 0, background: "transparent",
    color: MUTED, fontSize: 22, cursor: "pointer", lineHeight: 1,
  },
  input: {
    width: "100%", height: 36, padding: "0 10px", border: `1px solid ${LINE}`,
    borderRadius: 7, outline: "none", font: "inherit", fontSize: 13,
    boxSizing: "border-box", marginBottom: 8,
  },
  list: { flex: 1, minHeight: 0, overflowY: "auto", margin: "0 -4px", padding: "0 4px" },
  row: {
    display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 8px",
    border: 0, borderRadius: 7, background: "#fff", textAlign: "left", cursor: "pointer",
  },
  thumb: {
    width: 34, height: 34, flex: "0 0 34px", borderRadius: 6, background: "#f3f3f3",
    objectFit: "cover",
  },
  rowText: { minWidth: 0, flex: 1 },
  rowName: { fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  rowMeta: { marginTop: 1, color: MUTED, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  price: { fontWeight: 700, fontSize: 12, whiteSpace: "nowrap" },
  note: { padding: "18px 8px", color: MUTED, textAlign: "center" },
  foot: { marginTop: 8, color: MUTED, fontSize: 11 },
  retry: {
    marginTop: 8, height: 30, padding: "0 12px", border: `1px solid ${LINE}`,
    borderRadius: 7, background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600,
  },
};

const hoverOn = (e) => (e.currentTarget.style.background = "#fbf5e9");
const hoverOff = (e) => (e.currentTarget.style.background = "#fff");

const formatPrice = (v) => (v || v === 0 ? `₹${Number(v).toLocaleString("en-IN")}` : "");

/* ---------- Row (memoized) ---------- */

const Row = memo(({ item, onPick }) => (
  <button
    type="button"
    style={S.row}
    onClick={() => onPick(item)}
    onMouseOver={hoverOn}
    onMouseOut={hoverOff}
  >
    {item.thumbnail ? (
      <img src={`https://api.panvic.in${item.thumbnail}`} alt="" style={S.thumb} loading="lazy" width={34} height={34} />
    ) : (
      <div style={S.thumb} />
    )}
    <div style={S.rowText}>
      <div style={S.rowName}>{item.itemname}</div>
      <div style={S.rowMeta}>{[item.itemcode, item.brand].filter(Boolean).join(" · ")}</div>
    </div>
    <div style={S.price}>{formatPrice(item.price)}</div>
  </button>
));
Row.displayName = "Row";

/* ---------- Main component ---------- */

const FindProduct = ({ showModal, setShowModal, handleProductSelect }) => {
  const [items, setItems] = useState(memoryCache || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef(null);

  const load = useCallback(() => {
    let alive = true;
    setError(null);

    if (!memoryCache) {
      try {
        const saved = sessionStorage.getItem(CACHE_KEY);
        if (saved) memoryCache = JSON.parse(saved);
      } catch (_) {}
    }
    if (memoryCache) setItems(memoryCache);
    else setLoading(true);

    if (!refreshed) {
      refreshed = true;
      loadProducts()
        .then((data) => alive && setItems(data))
        .catch((err) => {
          refreshed = false;
          if (alive && !memoryCache) setError(err.message);
        })
        .finally(() => alive && setLoading(false));
    } else if (inflight) {
      inflight
        .then((data) => alive && setItems(data))
        .catch(() => {})
        .finally(() => alive && setLoading(false));
    } else {
      setLoading(false);
    }
    return () => {
      alive = false;
    };
  }, []);

  // Load only when the modal opens
  useEffect(() => {
    if (!showModal) return;
    setQuery("");
    const cleanup = load();
    const t = setTimeout(() => inputRef.current?.focus(), 50);
    return () => {
      cleanup();
      clearTimeout(t);
    };
  }, [showModal, load]);

  // Filter: every typed word must appear in code / name / brand
  const { results, total } = useMemo(() => {
    const words = deferredQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const matches = words.length
      ? items.filter((it) => words.every((w) => it._s.includes(w)))
      : items;
    return { results: matches.slice(0, MAX_RESULTS), total: matches.length };
  }, [items, deferredQuery]);

  const close = useCallback(() => setShowModal(false), [setShowModal]);

  const pick = useCallback(
    (item) => {
      const { _s, ...product } = item;
      handleProductSelect(product);
    },
    [handleProductSelect]
  );

  const onKeyDown = (e) => {
    if (e.key === "Escape") close();
    if (e.key === "Enter" && results[0]) pick(results[0]);
  };

  if (!showModal) return null;

  return (
    <div style={S.overlay} role="dialog" aria-modal="true" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div style={S.card} onKeyDown={onKeyDown}>
        <header style={S.header}>
          <h1 style={S.title}>Find product</h1>
          <button type="button" style={S.close} onClick={close} aria-label="Close">&times;</button>
        </header>

        <input
          ref={inputRef}
          type="search"
          style={S.input}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={(e) => (e.currentTarget.style.borderColor = GOLD)}
          onBlur={(e) => (e.currentTarget.style.borderColor = LINE)}
          placeholder="Search by item name, code or brand..."
          aria-label="Search product"
        />

        <div style={S.list}>
          {loading && <div style={S.note}>Loading products…</div>}

          {error && (
            <div style={S.note}>
              {error}
              <div>
                <button type="button" style={S.retry} onClick={load}>Try again</button>
              </div>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div style={S.note}>{items.length ? "No matching products" : "No products available"}</div>
          )}

          {results.map((item) => (
            <Row key={item.itemcode} item={item} onPick={pick} />
          ))}
        </div>

        {!loading && total > MAX_RESULTS && (
          <div style={S.foot}>Showing {MAX_RESULTS} of {total} — type more to narrow down</div>
        )}
      </div>
    </div>
  );
};

export default FindProduct;