// The one place dates are read. Dates are ISO strings (YYYY-MM-DD) everywhere in this library.

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Returns the day number of a YYYY-MM-DD date, counted from 1970-01-01, so dates compare with < and >.
// Throws a RangeError for anything else, including impossible dates such as February 30.
export function parseDate(text) {
  if (typeof text !== 'string' || !ISO_DATE.test(text)) {
    throw new RangeError(`not a YYYY-MM-DD date: ${text}`);
  }
  const [year, month, day] = text.split('-').map(Number);
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new RangeError(`not a real date: ${text}`);
  }
  return time / 86400000;
}
