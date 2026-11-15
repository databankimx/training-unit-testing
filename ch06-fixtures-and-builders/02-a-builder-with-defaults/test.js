import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balanceDueCents } from './invoicing/index.js';

// A fresh INV-1002 invoice. Each call builds its own payments list, so no test can change another's.
function makeInvoice(overrides = {}) {
  return {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
    ...overrides,
  };
}

test('a customer pays part of the invoice', () => {
  // Claim: after a payment of 1000 cents, 1712 cents are still owed.
  // Arrange
  const invoice = makeInvoice({ paymentsCents: [1000] });
  // Act
  const result = balanceDueCents(invoice);
  // Assert
  assert.equal(result, 1712);
});

test('the full balance is owed', () => {
  // Claim: an invoice with no payments owes the full 2712 cents.
  // Arrange
  const invoice = makeInvoice();
  // Act
  const result = balanceDueCents(invoice);
  // Assert
  assert.equal(result, 2712);
});
