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

test('each overdue invoice gets one reminder with its own address and amount', () => {
  // Doubles: a fake repository with two invoices, a stub clock, and a recording fake sender.
  // Why: the test checks what was sent, so it needs a sender it can read back.
  // Arrange
  const repository = new InMemoryRepository();
  repository.add(makeInvoice());
  repository.add(annInvoice());
  const sender = recordingSender();
  const service = new ReminderService(repository, stubClock('2026-11-14'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 2);
  assert.deepEqual(sender.sent, [
    ['bob.diaz@example.invalid', 'INV-1002', 2712],
    ['ann.lee@example.invalid', 'INV-1003', 2000],
  ]);
});

test('a paid invoice gets no reminder', () => {
  // Doubles: the same fake repository, a stub clock, and the recording fake sender.
  // Why: the repository should leave out the paid invoice, and the test checks that it does.
  // Arrange
  const repository = new InMemoryRepository();
  repository.add(makeInvoice());
  repository.add(paidInvoice());
  const sender = recordingSender();
  const service = new ReminderService(repository, stubClock('2026-11-14'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 1);
  assert.deepEqual(sender.sent.map((reminder) => reminder[1]), ['INV-1002']);
});
