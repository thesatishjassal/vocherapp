'use client';

import { Fragment, useDeferredValue, useMemo, useState } from 'react';
import { formatPrice, uniqueValues } from '../../public/lib/products';

const PAGE_SIZES = [25, 50, 100];

const DETAIL_FIELDS = [
  ['sub_category', 'Range'],
  ['material', 'Material'],
  ['dimension', 'Dimension'],
  ['cutout_size', 'Cut-out'],
  ['body_color', 'Body colour'],
  ['beam_angle', 'Beam angle'],
  ['luminous', 'Luminous'],
  ['cri', 'CRI'],
  ['brand', 'Brand'],
  ['model', 'Series'],
];

const SEARCH_FIELDS = ['itemcode', 'product_name', 'sub_category', 'body_color', 'material', 'model'];

export default function LedlumProducts({ products }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [range, setRange] = useState('');
  const [brand, setBrand] = useState('');
  const [ip, setIp] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState({ key: 'itemcode', dir: 'asc' });
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(null);

  const deferredQuery = useDeferredValue(query);

  // Search text is built once per product, not on every keystroke.
  const index = useMemo(
    () => products.map((p) => SEARCH_FIELDS.map((k) => p[k] ?? '').join(' ').toLowerCase()),
    [products],
  );

  const categories = useMemo(() => uniqueValues(products, 'category'), [products]);
  const brands = useMemo(() => uniqueValues(products, 'brand'), [products]);
  const ipRatings = useMemo(() => uniqueValues(products, 'ip_rating'), [products]);
  const ranges = useMemo(
    () => uniqueValues(category ? products.filter((p) => p.category === category) : products, 'sub_category'),
    [products, category],
  );

  const filtered = useMemo(() => {
    const words = deferredQuery.toLowerCase().split(/\s+/).filter(Boolean);
    const min = minPrice ? Number(minPrice) : -Infinity;
    const max = maxPrice ? Number(maxPrice) : Infinity;

    const list = products.filter((p, i) => {
      if (category && p.category !== category) return false;
      if (range && p.sub_category !== range) return false;
      if (brand && p.brand !== brand) return false;
      if (ip && p.ip_rating !== ip) return false;
      if (p.price_dp < min || p.price_dp > max) return false;
      return words.every((w) => index[i].includes(w));
    });

    const dir = sort.dir === 'asc' ? 1 : -1;
    return list.sort((a, b) => {
      if (sort.key === 'price_dp') return (a.price_dp - b.price_dp) * dir;
      return String(a[sort.key] ?? '').localeCompare(String(b[sort.key] ?? ''), 'en', { numeric: true }) * dir;
    });
  }, [products, index, deferredQuery, category, range, brand, ip, minPrice, maxPrice, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);
  const hasFilters = Boolean(query || category || range || brand || ip || minPrice || maxPrice);

  // Any filter change sends the user back to page 1.
  const update = (setter) => (v) => {
    setter(v);
    setPage(1);
  };

  function clearAll() {
    setQuery('');
    setCategory('');
    setRange('');
    setBrand('');
    setIp('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  }

  function toggleSort(key) {
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));
  }

  function sortState(key) {
    return sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none';
  }

  return (
    <section className="products">
      <div className="products__toolbar">
        <label className="products__search">
          <span className="products__visually-hidden">Search products</span>
          <svg className="products__search-icon" viewBox="0 0 20 20" aria-hidden="true">
            <circle cx="9" cy="9" r="6" />
            <path d="m14 14 4 4" />
          </svg>
          <input
            className="products__search-input"
            type="search"
            placeholder="Search code, name, range, colour…"
            value={query}
            onChange={(e) => update(setQuery)(e.target.value)}
          />
        </label>

        <div className="products__chips" role="group" aria-label="Category">
          {['', ...categories].map((c) => (
            <button
              key={c || 'all'}
              type="button"
              className={`products__chip${category === c ? ' products__chip--active' : ''}`}
              aria-pressed={category === c}
              onClick={() => {
                update(setCategory)(c);
                setRange('');
              }}
            >
              {c || 'All'}
            </button>
          ))}
        </div>

        <div className="products__filters">
          <select className="products__select" value={range} onChange={(e) => update(setRange)(e.target.value)} aria-label="Range">
            <option value="">All ranges</option>
            {ranges.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select className="products__select products__select--sm" value={brand} onChange={(e) => update(setBrand)(e.target.value)} aria-label="Brand">
            <option value="">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select className="products__select products__select--sm" value={ip} onChange={(e) => update(setIp)(e.target.value)} aria-label="IP rating">
            <option value="">Any IP</option>
            {ipRatings.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="products__price">
            <input
              className="products__price-input"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Min ₹"
              aria-label="Minimum price"
              value={minPrice}
              onChange={(e) => update(setMinPrice)(e.target.value)}
            />
            <span className="products__price-sep">–</span>
            <input
              className="products__price-input"
              type="number"
              min={0}
              inputMode="numeric"
              placeholder="Max ₹"
              aria-label="Maximum price"
              value={maxPrice}
              onChange={(e) => update(setMaxPrice)(e.target.value)}
            />
          </div>
          {hasFilters && (
            <button type="button" className="products__clear" onClick={clearAll}>
              Clear
            </button>
          )}
        </div>
      </div>

      <p className="products__count" aria-live="polite">
        {filtered.length.toLocaleString('en-IN')} {filtered.length === 1 ? 'item' : 'items'}
      </p>

      <div className="products__table-wrap">
        <table className="products__table">
          <thead className="products__head">
            <tr>
              {(
                [
                  ['itemcode', 'Code'],
                  ['product_name', 'Product'],
                  ['category', 'Category'],
                ]
              ).map(([key, label]) => (
                <th key={key} className={`products__th products__th--${key}`} aria-sort={sortState(key)}>
                  <button type="button" className="products__sort" onClick={() => toggleSort(key)}>
                    {label}
                    <span className="products__sort-icon" aria-hidden="true" />
                  </button>
                </th>
              ))}
              <th className="products__th products__th--spec">Watts</th>
              <th className="products__th products__th--spec">CCT</th>
              <th className="products__th products__th--spec">IP</th>
              <th className="products__th products__th--price" aria-sort={sortState('price_dp')}>
                <button type="button" className="products__sort products__sort--end" onClick={() => toggleSort('price_dp')}>
                  Price (DP)
                  <span className="products__sort-icon" aria-hidden="true" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const isOpen = open === p.itemcode;
              return (
                <Fragment key={p.itemcode}>
                  <tr
                    className={`products__row${isOpen ? ' products__row--open' : ''}`}
                    onClick={() => setOpen(isOpen ? null : p.itemcode)}
                  >
                    <td className="products__td products__td--code">
                      <button
                        type="button"
                        className="products__expand"
                        aria-expanded={isOpen}
                        aria-label={`${isOpen ? 'Hide' : 'Show'} details for ${p.itemcode}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(isOpen ? null : p.itemcode);
                        }}
                      />
                      {p.itemcode}
                    </td>
                    <td className="products__td products__td--name">
                      <span className="products__name">{p.product_name}</span>
                    </td>
                    <td className="products__td">
                      <span className={`products__badge products__badge--${p.category.replace(/\s+/g, '-')}`}>{p.category}</span>
                    </td>
                    <td className="products__td products__td--spec">{p.watts ?? '—'}</td>
                    <td className="products__td products__td--spec">{p.cct ?? '—'}</td>
                    <td className="products__td products__td--spec">{p.ip_rating ?? '—'}</td>
                    <td className={`products__td products__td--price${p.price_dp ? '' : ' products__td--muted'}`}>{formatPrice(p)}</td>
                  </tr>
                  {isOpen && (
                    <tr className="products__detail">
                      <td className="products__detail-cell" colSpan={7}>
                        <dl className="products__specs">
                          {DETAIL_FIELDS.filter(([k]) => p[k]).map(([k, label]) => (
                            <div key={k} className="products__spec">
                              <dt className="products__spec-label">{label}</dt>
                              <dd className="products__spec-value">{p[k]}</dd>
                            </div>
                          ))}
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td className="products__empty" colSpan={7}>
                  No products match. <button type="button" className="products__link" onClick={clearAll}>Clear filters</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <nav className="products__pager" aria-label="Pagination">
        <select
          className="products__select products__select--sm"
          value={pageSize}
          aria-label="Rows per page"
          onChange={(e) => update(setPageSize)(Number(e.target.value))}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <div className="products__pages">
          <button type="button" className="products__page-btn" disabled={current === 1} onClick={() => setPage(current - 1)}>
            ← Prev
          </button>
          <span className="products__page-info">
            {current} / {pageCount}
          </span>
          <button type="button" className="products__page-btn" disabled={current === pageCount} onClick={() => setPage(current + 1)}>
            Next →
          </button>
        </div>
      </nav>
    </section>
  );
}