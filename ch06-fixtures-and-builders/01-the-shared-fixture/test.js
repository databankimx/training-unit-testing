import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balanceDueCents } from './invoicing/index.js';

// Shared by every test in this file. A test that adds a payment changes it for the tests that run after it.
const sharedPayments = [];

function sharedInvoice() {
  return {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: sharedPayments,
  };
}

test('a customer pays part of the invoice', () => {
  // Claim: after a payment of 1000 cents, 1712 cents are still owed.
  // Arrange
  sharedPayments.push(1000);
  const invoice = sharedInvoice();
  // Act
  const result = balanceDueCents(invoice);
  // Assert
  assert.equal(result, 1712);
});

test('the full balance is owed', () => {
  // Claim: an invoice with no payments owes the full 2712 cents.
  // Arrange
  const invoice = sharedInvoice();
  // Act
  const result = balanceDueCents(invoice);
  // Assert
  assert.equal(result, 2712);
});
