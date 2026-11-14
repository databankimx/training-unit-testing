"""Sends one reminder for each overdue invoice that has a balance due."""

from .invoice import balance_due_cents, is_overdue
from .ports import Clock, InvoiceRepository, ReminderSender


class ReminderService:
    def __init__(self, repository: InvoiceRepository, clock: Clock, sender: ReminderSender) -> None:
        self._repository = repository
        self._clock = clock
        self._sender = sender

    def send_overdue_reminders(self) -> int:
        """Returns the number of reminders sent."""
        today = self._clock.today()
        sent = 0
        for invoice in self._repository.find_open():
            if is_overdue(invoice, today):
                self._sender.send(invoice.customer_email, invoice.id, balance_due_cents(invoice))
                sent += 1
        return sent
