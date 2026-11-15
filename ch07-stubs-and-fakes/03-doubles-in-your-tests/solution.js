import { test } from 'node:test';
import assert from 'node:assert/strict';
import { balanceDueCents, ReminderService } from './invoicing/index.js';

// A stub clock: it always says the same date, whatever the test does.
function stubClock(today) {
  return { today: () => today };
}

// A fake repository: it keeps invoices in a list, and findOpen returns only those that still owe money.
class InMemoryRepository {
  #invoices = [];

  add(invoice) {
    this.#invoices.push(invoice);
  }

  findOpen() {
    return this.#invoices.filter((invoice) => balanceDueCents(invoice) > 0);
  }
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

function makeInvoice(paymentsCents = []) {
  return {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents,
  };
}

function annInvoice() {
  return {
    id: 'INV-1003',
    customerName: 'Ann Lee',
    customerEmail: 'ann.lee@example.invalid',
    dueDate: '2026-10-15',
    taxRateBasisPoints: 0,
    lines: [{ description: 'Service', quantity: 2, unitPriceCents: 1000 }],
    paymentsCents: [],
  };
}

function paidInvoice() {
  return {
    id: 'INV-1004',
    customerName: 'Cy Park',
    customerEmail: 'cy.park@example.invalid',
    dueDate: '2026-10-15',
    taxRateBasisPoints: 0,
    lines: [{ description: 'Service', quantity: 2, unitPriceCents: 1000 }],
    paymentsCents: [2000],
  };
}

test('a partial payment is reflected in the reminder', () => {
  // Doubles: a fake repository, a stub clock set to 14 November, and the recording fake sender.
  // Why: the reminder should carry the balance after the payment, and the test reads it from the sender.
  // Arrange
  const repository = new InMemoryRepository();
  repository.add(makeInvoice([1000]));
  const sender = recordingSender();
  const service = new ReminderService(repository, stubClock('2026-11-14'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 1);
  assert.equal(sender.sent[0][2], 1712);
});

test('an invoice paid in full gets no reminder', () => {
  // Doubles: the same fake repository, a stub clock set to 14 November, and the recording fake sender.
  // Why: once nothing is owed, the fake repository should leave the invoice out.
  // Arrange
  const repository = new InMemoryRepository();
  repository.add(makeInvoice([2712]));
  const sender = recordingSender();
  const service = new ReminderService(repository, stubClock('2026-11-14'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 0);
});
