"""The ports: the interfaces the library needs from the outside world, and the production clock."""

from datetime import date
from typing import Protocol

from .invoice import Invoice


class Clock(Protocol):
    def today(self) -> str:
        """Today's date as YYYY-MM-DD."""
        ...


class InvoiceRepository(Protocol):
    def find_open(self) -> list[Invoice]:
        """The invoices that still have a balance due."""
        ...


class ReminderSender(Protocol):
    def send(self, customer_email: str, invoice_id: str, amount_due_cents: int) -> None:
        """Sends one reminder to a customer about an invoice."""
        ...


class SystemClock:
    """The production clock, which reads the computer's local calendar."""

    def today(self) -> str:
        return date.today().isoformat()
