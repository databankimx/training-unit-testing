from unittest.mock import Mock

from invoicing import Invoice, InvoiceLine, ReminderService


class InMemoryRepository:
    """A fake: it keeps invoices in a list, and find_open returns only those that still owe money."""

    def __init__(self) -> None:
        self._invoices: list[Invoice] = []

    def add(self, invoice: Invoice) -> None:
        self._invoices.append(invoice)

    def find_open(self) -> list[Invoice]:
        return list(self._invoices)


def make_invoice() -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )


def ann_invoice() -> Invoice:
    return Invoice(
        id="INV-1003",
        customer_name="Ann Lee",
        customer_email="ann.lee@example.invalid",
        due_date="2026-10-15",
        tax_rate_basis_points=0,
        lines=(InvoiceLine("Service", 2, 1000),),
    )


def test_two_overdue_invoices_get_two_reminders():
    # Doubles: a stub clock, a fake repository with two invoices, and a mock sender.
    # Why: the claim is about the reminders, so the test checks what they say.
    # Arrange
    clock = Mock()
    clock.today.return_value = "2026-11-14"
    repository = InMemoryRepository()
    repository.add(make_invoice())
    repository.add(ann_invoice())
    sender = Mock()
    service = ReminderService(repository, clock, sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 2
    assert sender.send.call_count == 2
