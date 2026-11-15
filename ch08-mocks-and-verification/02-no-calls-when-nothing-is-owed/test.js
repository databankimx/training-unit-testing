import { test, mock } from 'node:test';
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

test('no call before the due date', () => {
  // Doubles: a fake repository, a stub clock set to the day before the due date, and a mock sender.
  // Why: the claim is that the sender is never called, so the test checks that no call was made.
  // Arrange
  const repository = new InMemoryRepository();
  repository.add(makeInvoice());
  const send = mock.fn();
  const sender = { send };
  const service = new ReminderService(repository, stubClock('2026-10-31'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 0);
  assert.equal(send.mock.callCount(), 0);
});

test('no call for a paid invoice', () => {
  // Doubles: the same fake repository, a stub clock set to 14 November, and a mock sender.
  // Why: the paid invoice is overdue, but nothing is owed, so the sender should not be called.
  // Arrange
  const repository = new InMemoryRepository();
  repository.add(paidInvoice());
  const send = mock.fn();
  const sender = { send };
  const service = new ReminderService(repository, stubClock('2026-11-14'), sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 0);
  assert.equal(send.mock.callCount(), 0);
});
