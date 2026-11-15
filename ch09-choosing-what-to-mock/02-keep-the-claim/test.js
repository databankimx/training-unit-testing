import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { ReminderService } from './invoicing/index.js';

// A fake: it keeps invoices in a list, and findOpen returns them all.
class InMemoryRepository {
  #invoices = [];

  add(invoice) {
    this.#invoices.push(invoice);
  }

  findOpen() {
    return [...this.#invoices];
  }
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

test('two overdue invoices get two reminders', () => {
  // Doubles: a stub clock, a fake repository with two invoices, and a mock sender.
  // Why: the claim is about the reminders, so the test checks what they say.
  // Arrange
  const today = mock.fn(() => '2026-11-14');
  const clock = { today };
  const repository = new InMemoryRepository();
  repository.add(makeInvoice());
  repository.add(annInvoice());
  const send = mock.fn();
  const sender = { send };
  const service = new ReminderService(repository, clock, sender);
  // Act
  const sent = service.sendOverdueReminders();
  // Assert
  assert.equal(sent, 2);
  assert.equal(send.mock.callCount(), 2);
  assert.equal(today.mock.callCount(), 2); // TODO (homework): the claim does not mention the clock. Read the failure, then decide what to do with this line.
});
