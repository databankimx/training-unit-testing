// Sends one reminder for each overdue invoice that has a balance due.

import { balanceDueCents, isOverdue } from './invoice.js';

export class ReminderService {
  #repository;
  #clock;
  #sender;

  constructor(repository, clock, sender) {
    this.#repository = repository;
    this.#clock = clock;
    this.#sender = sender;
  }

  // Returns the number of reminders sent.
  sendOverdueReminders() {
    const today = this.#clock.today();
    let sent = 0;
    for (const invoice of this.#repository.findOpen()) {
      if (isOverdue(invoice, today)) {
        this.#sender.send(invoice.customerEmail, invoice.id, balanceDueCents(invoice));
        sent += 1;
      }
    }
    return sent;
  }
}
