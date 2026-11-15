from invoicing import Invoice, InvoiceLine, ReminderService


class StubClock:
    """A stub: it always says the same date, whatever the test does."""

    def __init__(self, today: str) -> None:
        self._today = today

    def today(self) -> str:
        return self._today


class FixedRepository:
    """A stub: it always returns the same list of invoices."""

    def __init__(self, invoices: list[Invoice]) -> None:
        self._invoices = invoices

    def find_open(self) -> list[Invoice]:
        return self._invoices


class RecordingSender:
    """A fake: it works like a real sender, and keeps each reminder in a list the test can read."""

    def __init__(self) -> None:
        self.sent: list[tuple[str, str, int]] = []

    def send(self, customer_email: str, invoice_id: str, amount_due_cents: int) -> None:
        self.sent.append((customer_email, invoice_id, amount_due_cents))


def make_invoice() -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )


def test_no_reminder_on_the_due_date():
    # Double: a stub clock, so today is exactly the due date.
    # Why: the rule is "after the due date", so the test needs an exact day.
    # Arrange
    sender = RecordingSender()
    service = ReminderService(FixedRepository([make_invoice()]), StubClock("2026-11-01"), sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 0
    assert sender.sent == []


def test_one_reminder_the_day_after_the_due_date():
    # Double: the same stub clock, set to the day after the due date.
    # Why: the same exact day, one day later, shows the rule switching on.
    # Arrange
    sender = RecordingSender()
    service = ReminderService(FixedRepository([make_invoice()]), StubClock("2026-11-02"), sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 1
    assert sender.sent == [("bob.diaz@example.invalid", "INV-1002", 2712)]
