import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ReminderService } from './invoicing/index.js';

// A stub clock: it always says the same date, whatever the test does.
function stubClock(today) {
  return { today: () => today };
}

// A stub repository: it always returns the same list of invoices.
function fixedRepository(invoices) {
  return { findOpen: () => invoices };
}

// A fake sender: it works like a real sender, and keeps each reminder in a list the test can read.
function recordingSender() {
  const sent = [];
  return {
    sent,
    send: (customerEmail, invoiceId, amountDueCents) => {
      sent.push([customerEmail, invoiceId, amountDueCents]);
    },
  };
}

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

test('no reminder on the due date', () => {
  // Double: a stub clock, so today is exactly the due date.
  // Why: the rule is "after the due date", so the test needs an exact day.
  // Arrange
  const sender = recordingSender();
  const service = new ReminderService(fixedRepository([makeInvoice()]), stubClock('2026-11-01'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 0);
  assert.deepEqual(sender.sent, []);
});

test('one reminder the day after the due date', () => {
  // Double: the same stub clock, set to the day after the due date.
  // Why: the same exact day, one day later, shows the rule switching on.
  // Arrange
  const sender = recordingSender();
  const service = new ReminderService(fixedRepository([makeInvoice()]), stubClock('2026-11-02'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 1);
  assert.deepEqual(sender.sent, [['bob.diaz@example.invalid', 'INV-1002', 2712]]);
});
