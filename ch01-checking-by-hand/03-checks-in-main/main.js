import { taxCents } from './invoicing/index.js';

const invoice = {
  id: 'INV-1002',
  customerName: 'Bob Diaz',
  customerEmail: 'bob.diaz@example.invalid',
  dueDate: '2026-11-01',
  taxRateBasisPoints: 825,
  lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
  paymentsCents: [],
};

const expected = 207; // TODO (homework): change this to 206, then Run and look at the FAIL line
const actual = taxCents(invoice);

if (actual === expected) {
  console.log('PASS tax on INV-1002');
} else {
  console.log(`FAIL tax on INV-1002: expected ${expected}, got ${actual}`);
}
