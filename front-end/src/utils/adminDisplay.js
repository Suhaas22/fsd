export function money(value, currency) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    !Number.isFinite(Number(value))
  )
    return 'Not recorded';
  try {
    return new Intl.NumberFormat(
      'en-IN',
      currency
        ? { style: 'currency', currency }
        : { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    ).format(Number(value));
  } catch {
    return `${currency || ''} ${Number(value).toFixed(2)}`.trim();
  }
}
export const currencyLabel = (currency) => currency || 'Currency not recorded';
export function dateLabel(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      }).format(date)
    : 'Not recorded';
}
export function timestampLabel(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
      }).format(date) + ' IST'
    : 'Not recorded';
}
export function ratingLabel(value) {
  const rating = Number(value);
  return value !== null &&
    value !== undefined &&
    value !== '' &&
    Number.isFinite(rating) &&
    rating >= 1 &&
    rating <= 5
    ? rating.toFixed(1)
    : 'Not rated';
}
export function coursePriceLabel(course) {
  return course.price === 0 ? 'Free' : money(course.price, course.currency);
}
