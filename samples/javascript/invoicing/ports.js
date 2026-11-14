// The ports: what the library needs from the outside world.
//
// In JavaScript a port is any object with the methods below. There is no interface keyword, so the shape is
// documented here:
//   clock:      { today() }                      returns today's date as YYYY-MM-DD
//   repository: { findOpen() }                   returns the invoices that still have a balance due
//   sender:     { send(customerEmail, invoiceId, amountDueCents) }

// The production clock, which reads the computer's local calendar.
export const systemClock = {
  today() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  },
};
