from unittest.mock import Mock, call

from invoicing import Invoice, InvoiceLine, ReminderService, balance_due_cents


class StubClock:
    """A stub: it always says the same date, whatever the test does."""

    def __init__(self, today: str) -> None:
        self._today = today

    def today(self) -> str:
        return self._today


class InMemoryRepository:
    """A fake: it keeps invoices in a list, and find_open returns only those that still owe money."""

    def __init__(self) -> None:
        self._invoices: list[Invoice] = []

    def add(self, invoice: Invoice) -> None:
        self._invoices.append(invoice)

    def find_open(self) -> list[Invoice]:
        return [invoice for invoice in self._invoices if balance_due_cents(invoice) > 0]


def make_invoice(payments_cents: tuple = ()) -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
        payments_cents=payments_cents,
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


def paid_invoice() -> Invoice:
    return Invoice(
        id="INV-1004",
        customer_name="Cy Park",
        customer_email="cy.park@example.invalid",
        due_date="2026-10-15",
        tax_rate_basis_points=0,
        lines=(InvoiceLine("Service", 2, 1000),),
        payments_cents=(2000,),
    )


def test_no_call_before_the_due_date():
    # Doubles: a fake repository, a stub clock set to the day before the due date, and a mock sender.
    # Why: the claim is that the sender is never called, so the test checks that no call was made.
    # Arrange
    repository = InMemoryRepository()
    repository.add(make_invoice())
    sender = Mock()
    service = ReminderService(repository, StubClock("2026-10-31"), sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 0
    sender.send.assert_not_called()


def test_no_call_for_a_paid_invoice():
    # Doubles: the same fake repository, a stub clock set to 14 November, and a mock sender.
    # Why: the paid invoice is overdue, but nothing is owed, so the sender should not be called.
    # Arrange
    repository = InMemoryRepository()
    repository.add(paid_invoice())
    sender = Mock()
    service = ReminderService(repository, StubClock("2026-11-14"), sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 0
    sender.send.assert_not_called()
