// Persian-aware formatting helpers.

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

// Convert western digits to Persian digits (consistent across the UI).
export function toPersianDigits(input) {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

// Format a number with thousands separators (Latin comma) then Persian digits.
export function formatNumber(value) {
  const n = Number(value) || 0;
  const withSep = n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return toPersianDigits(withSep);
}

// Format a percentage value, e.g. 61.2 -> "۶۱٫۲٪".
export function formatPercent(value) {
  // Round to at most 1 decimal so animated/float values never show long trails.
  const n = Math.round((Number(value) || 0) * 10) / 10;
  // Persian decimal separator is U+066B (٫).
  const text = toPersianDigits(String(n).replace('.', '٫'));
  return `${text}٪`;
}

// Human readable byte size using KB/MB/GB (spec mandates these units).
export function formatBytes(bytes) {
  const b = Number(bytes) || 0;
  if (b <= 0) return '۰ بایت';
  const units = [
    { label: 'بایت', factor: 1 },
    { label: 'کیلوبایت', factor: 1024 },
    { label: 'مگابایت', factor: 1024 * 1024 },
    { label: 'گیگابایت', factor: 1024 * 1024 * 1024 },
  ];
  let chosen = units[0];
  for (const u of units) {
    if (b >= u.factor) chosen = u;
  }
  const value = b / chosen.factor;
  const rounded = value >= 100 ? value.toFixed(0) : value.toFixed(2);
  return `${toPersianDigits(rounded)} ${chosen.label}`;
}
