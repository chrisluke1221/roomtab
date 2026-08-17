// Local-calendar-date formatting. `new Date(y, m, d).toISOString().slice(0,10)`
// silently shifts the date by one day for any timezone ahead of UTC (e.g.
// Australia/Melbourne), since toISOString() always converts to UTC first —
// local midnight becomes the previous UTC day. This reads the local calendar
// fields directly instead, so it never crosses that boundary.
export const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const todayLocal = () => formatLocalDate(new Date());

// AU financial year: Jul 1 - Jun 30. Takes a 'YYYY-MM-DD' string (billing
// periods are always stored this way) to avoid any timezone parsing
// ambiguity from new Date('YYYY-MM-DD'). Returns e.g. "2025-26" for any
// date from 2025-07-01 through 2026-06-30.
export const financialYearFor = (dateStr) => {
  const [yearStr, monthStr] = dateStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr); // 1-12
  const fyStartYear = month >= 7 ? year : year - 1;
  return `${fyStartYear}-${String((fyStartYear + 1) % 100).padStart(2, '0')}`;
};
