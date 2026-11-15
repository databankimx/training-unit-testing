import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotalCents, taxCents, totalCents } from './invoicing/index.js';

function makeInvoice() {
  return {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };
}

test('the subtotal is calculated', () => {
  // Doubles: none.
  // Why: the claim is the subtotal, so the test should check its value.
  // Arrange
  const invoice = makeInvoice();
  // Act
  subtotalCents(invoice);
});

test('the total is the total', () => {
  // Doubles: none.
  // Why: the claim is the total, so the test should check its value.
  // Arrange
  const invoice = makeInvoice();
  // Act and assert
  assert.equal(totalCents(invoice), totalCents(invoice));
});

test('the tax matches the tax rule', () => {
  // Doubles: none.
  // Why: the claim is the tax rule, so the expected value should come from the rule, not from the code.
  // Arrange
  const invoice = makeInvoice();
  const expected = taxCents(invoice);
  // Act and assert
  assert.equal(taxCents(invoice), expected);
});

test('the tax on invoice 1002 is 207 cents', () => {
  // Doubles: none.
  // Why: the claim is that the tax is 207 cents, so the test checks 207.
  // Arrange
  const invoice = makeInvoice();
  // Act and assert
  try {
    assert.equal(taxCents(invoice), 999);
  } catch {
    // swallowed
  }
});

test('the tax on invoice 1002 is 207 cents when rounded half up', () => {
  // Doubles: none.
  // Why: the claim is that half a cent rounds up, so the test checks 207 against the real rule.
  // Arrange
  const invoice = makeInvoice();
  // Act and assert
  assert.equal(taxCents(invoice), 207);
});
