import pytest

from invoicing import Invoice, InvoiceLine, is_overdue, parse_date


def make_invoice(payments_cents=()) -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
        payments_cents=payments_cents,
    )


def test_an_invoice_is_not_overdue_on_its_due_date():
    # Doubles: none. The rule is pure, so the test calls it directly.
    # Why: the claim is about the boundary, so the test uses the exact due date.
    # Arrange
    invoice = make_invoice()
    # Act
    result = is_overdue(invoice, "2026-11-01")
    # Assert
    assert result is False


def test_an_invoice_is_overdue_the_day_after_its_due_date():
    # Doubles: none.
    # Why: one day later is the first day the claim says the invoice is overdue.
    # Arrange
    invoice = make_invoice()
    # Act
    result = is_overdue(invoice, "2026-11-02")
    # Assert
    assert result is True


def test_a_paid_invoice_is_not_overdue_after_its_due_date():
    # Doubles: none.
    # Why: the claim is that money must still be owed, so a paid invoice is never overdue.
    # Arrange
    invoice = make_invoice(payments_cents=(2712,))
    # Act
    result = is_overdue(invoice, "2026-11-14")
    # Assert
    assert result is False
