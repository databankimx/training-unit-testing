import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents } from './invoicing/index.js';

test('tax on 2.5 cents rounds up to 3', () => {
  // Claim: 2.5 cents of tax rounds half up to 3 cents.
  // Arrange
  const invoice = {
    id: 'INV-A',
    customerName: 'Test',
    customerEmail: 'test@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 25,
    lines: [{ description: 'Item', quantity: 1, unitPriceCents: 1000 }],
    paymentsCents: [],
  };
  // Act
  const result = taxCents(invoice);
  // Assert
  assert.equal(result, 3);
});

test('tax on 2.4 cents rounds down to 2', () => {
  // Claim: 2.4 cents of tax rounds down to 2 cents.
  // Arrange
  const invoice = {
    id: 'INV-B',
    customerName: 'Test',
    customerEmail: 'test@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 24,
    lines: [{ description: 'Item', quantity: 1, unitPriceCents: 1000 }],
    paymentsCents: [],
  };
  // Act
  const result = taxCents(invoice);
  // Assert
  assert.equal(result, 2);
});

test('tax on 2.6 cents rounds up to 3', () => {
  // Claim: 2.6 cents of tax rounds up to 3 cents.
  // Arrange
  const invoice = {
    id: 'INV-C',
    customerName: 'Test',
    customerEmail: 'test@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 26,
    lines: [{ description: 'Item', quantity: 1, unitPriceCents: 1000 }],
    paymentsCents: [],
  };
  // Act
  const result = taxCents(invoice);
  // Assert
  assert.equal(result, 3);
});
