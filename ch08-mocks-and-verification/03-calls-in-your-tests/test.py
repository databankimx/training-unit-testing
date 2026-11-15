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


def test_a_paid_invoice_causes_no_calls_to_the_sender():
    # Doubles: a fake repository, a stub clock set to 14 November, and a mock sender.
    # Why: the claim is about the calls, so the test verifies them.
    # Arrange
    repository = InMemoryRepository()
    repository.add(paid_invoice())
    sender = Mock()
    service = ReminderService(repository, StubClock("2026-11-14"), sender)
    # Act
    service.send_overdue_reminders()
    # Assert
    sender.send.assert_called_once()  # TODO (homework): a paid invoice should cause no calls. Replace this line with the right check.


def test_a_partial_payment_is_the_amount_in_the_call():
    # Doubles: a fake repository, a stub clock set to 14 November, and a mock sender.
    # Why: the amount in the call should be the balance after the payment.
    # Arrange
    repository = InMemoryRepository()
    repository.add(make_invoice(payments_cents=(1000,)))
    sender = Mock()
    service = ReminderService(repository, StubClock("2026-11-14"), sender)
    # Act
    service.send_overdue_reminders()
    # Assert
    sender.send.assert_called_once_with("bob.diaz@example.invalid", "INV-1002", None)  # TODO (homework): work out the balance after the payment, then type it in
