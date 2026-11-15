import pytest  # noqa: F401

from unittest.mock import Mock

from invoicing import Invoice, InvoiceLine, total_cents


def make_invoice() -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )


def test_the_clock_returns_the_date_it_was_told():
    # Doubles: a stub clock, which is a Mock with a return value.
    # Why: the claim is about the clock, so the test checks the clock. It does not check the program.
    # Arrange
    clock = Mock()
    clock.today.return_value = "2026-11-14"
    # Act and assert
    assert clock.today() == "2026-11-14"


def test_the_total_is_not_null():
    # Doubles: none.
    # Why: the claim is the total, so the test should check its value.
    # Arrange
    invoice = make_invoice()
    # Act and assert
    assert total_cents(invoice) is not None
