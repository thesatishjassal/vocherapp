/**
 * @typedef {Object} Product
 * @property {string} itemcode
 * @property {string} brand
 * @property {string} model
 * @property {string} category
 * @property {string|null} sub_category
 * @property {string} product_name
 * @property {string|null} watts
 * @property {string|null} material
 * @property {string|null} dimension
 * @property {string|null} cutout_size
 * @property {string|null} body_color
 * @property {string|null} cct
 * @property {string|null} beam_angle
 * @property {string|null} ip_rating
 * @property {string|null} luminous
 * @property {string|null} cri
 * @property {number} price_dp
 * @property {string} unit
 */

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** @param {Product} p */
export function formatPrice(p) {
  if (!p.price_dp) return 'On request';
  return p.unit === 'pcs' ? inr.format(p.price_dp) : `${inr.format(p.price_dp)} / ${p.unit}`;
}

/**
 * Sorted unique non-empty values of a field, for filter dropdowns.
 * @param {Product[]} list
 * @param {keyof Product} key
 */
export function uniqueValues(list, key) {
  const set = new Set();
  for (const p of list) {
    const v = p[key];
    if (typeof v === 'string' && v) set.add(v);
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}