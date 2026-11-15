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


class RecordingSender:
    """A fake: it works like a real sender, and keeps each reminder in a list the test can read."""

    def __init__(self) -> None:
        self.sent: list[tuple[str, str, int]] = []

    def send(self, customer_email: str, invoice_id: str, amount_due_cents: int) -> None:
        self.sent.append((customer_email, invoice_id, amount_due_cents))


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


def test_each_overdue_invoice_gets_one_reminder_with_its_own_address_and_amount():
    # Doubles: a fake repository with two invoices, a stub clock, and a recording fake sender.
    # Why: the test checks what was sent, so it needs a sender it can read back.
    # Arrange
    repository = InMemoryRepository()
    repository.add(make_invoice())
    repository.add(ann_invoice())
    sender = RecordingSender()
    service = ReminderService(repository, StubClock("2026-11-14"), sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 2
    assert sender.sent == [
        ("bob.diaz@example.invalid", "INV-1002", 2712),
        ("ann.lee@example.invalid", "INV-1003", 2000),
    ]


def test_a_paid_invoice_gets_no_reminder():
    # Doubles: the same fake repository, a stub clock, and the recording fake sender.
    # Why: the repository should leave out the paid invoice, and the test checks that it does.
    # Arrange
    repository = InMemoryRepository()
    repository.add(make_invoice())
    repository.add(paid_invoice())
    sender = RecordingSender()
    service = ReminderService(repository, StubClock("2026-11-14"), sender)
    # Act
    sent = service.send_overdue_reminders()
    # Assert
    assert sent == 1
    assert [invoice_id for _, invoice_id, _ in sender.sent] == ["INV-1002"]
