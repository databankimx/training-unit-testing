import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotalCents, taxCents, totalCents } from './invoicing/index.js';

test('subtotal of invoice 1002 is correct', () => {
  // Claim: the subtotal of INV-1002 is correct.
  // Arrange
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Act
  const result = subtotalCents(invoice);
  // Assert
  assert.equal(result, null);  // TODO (homework): replace the placeholder with the subtotal, worked out by hand
});

test('tax of invoice 1002 is correct', () => {
  // Claim: the tax on INV-1002 is correct.
  // Arrange
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Act
  const result = taxCents(invoice);
  // Assert
  assert.equal(result, null);  // TODO (homework): replace the placeholder with the tax, worked out by hand
});

test('total of invoice 1002 is correct', () => {
  // Claim: the total of INV-1002 is correct.
  // Arrange
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Act
  const result = totalCents(invoice);
  // Assert
  assert.equal(result, null);  // TODO (homework): replace the placeholder with the total, worked out by hand
});
