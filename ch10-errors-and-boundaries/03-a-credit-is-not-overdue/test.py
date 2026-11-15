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


def test_an_overpaid_invoice_is_not_overdue():
    # Doubles: none.
    # Why: a payment larger than the total leaves a credit, a negative balance. The claim is about whether money is owed.
    # Arrange
    invoice = make_invoice(payments_cents=(3000,))
    # Act
    result = is_overdue(invoice, "2026-11-14")
    # Assert
    assert result is None  # TODO (homework): work out what the claim says, and replace None with the right value.
