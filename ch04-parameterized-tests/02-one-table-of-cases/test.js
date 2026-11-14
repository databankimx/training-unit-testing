import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents } from './invoicing/index.js';

// Each row: a name, the subtotal in cents, the rate in basis points, and the expected tax in cents.
const cases = [
  { name: 'half-cent-rounds-up', subtotal: 1000, rate: 25, expected: null }, // TODO (homework): work this out by hand from the rule, then type it in
  { name: 'below-half-cent', subtotal: 1000, rate: 24, expected: null }, // TODO (homework): work this out by hand from the rule, then type it in
  { name: 'above-half-cent', subtotal: 1000, rate: 26, expected: null }, // TODO (homework): work this out by hand from the rule, then type it in
  { name: 'invoice-1002', subtotal: 2505, rate: 825, expected: 207 },
];

for (const c of cases) {
  test(`tax rounds half up: ${c.name}`, () => {
    // Claim: the tax is the subtotal times the rate, rounded half up to the cent.
    // Arrange
    const invoice = {
      id: 'INV-CASE',
      customerName: 'Test',
      customerEmail: 'test@example.invalid',
      dueDate: '2026-11-01',
      taxRateBasisPoints: c.rate,
      lines: [{ description: 'Item', quantity: 1, unitPriceCents: c.subtotal }],
      paymentsCents: [],
    };
    // Act
    const result = taxCents(invoice);
    // Assert
    assert.equal(result, c.expected);
  });
}
