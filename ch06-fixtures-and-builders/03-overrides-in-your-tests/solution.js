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

test('a partial payment leaves the rest owed', () => {
  // Claim: after a payment of 1000 cents, the balance is the full balance less 1000 cents.
  // Arrange
  const invoice = makeInvoice({ paymentsCents: [1000] });
  // Act
  const result = balanceDueCents(invoice);
  // Assert
  assert.equal(result, 1712);
});

test('a full payment clears the balance', () => {
  // Claim: once the full 2712 cents is paid, nothing is owed.
  // Arrange
  const invoice = makeInvoice({ paymentsCents: [2712] });
  // Act
  const result = balanceDueCents(invoice);
  // Assert
  assert.equal(result, 0);
});
