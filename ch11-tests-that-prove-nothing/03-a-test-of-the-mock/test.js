import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mock } from 'node:test';
import { totalCents } from './invoicing/index.js';

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

test('the clock returns the date it was told', () => {
  // Doubles: a stub clock, a plain object with a mock function.
  // Why: the claim is about the clock, so the test checks the clock. It does not check the program.
  // Arrange
  const today = mock.fn(() => '2026-11-14');
  const clock = { today };
  // Act and assert
  assert.equal(clock.today(), '2026-11-14');
});

test('the total is not null', () => {
  // Doubles: none.
  // Why: the claim is the total, so the test should check its value.
  // Arrange
  const invoice = makeInvoice();
  // Act and assert
  assert.notEqual(totalCents(invoice), null);
});
