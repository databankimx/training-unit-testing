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


def test_a_date_that_is_not_real_is_refused():
    # Doubles: none.
    # Why: the claim is that the library refuses a date that does not exist, so the test checks for a refusal.
    # Arrange
    text = "2026-02-30"
    # Act and assert
    with pytest.raises(ValueError):
        parse_date(text)


def test_a_date_in_the_wrong_shape_is_refused():
    # Doubles: none.
    # Why: the claim is that the library reads only YYYY-MM-DD, so the test checks a slash-separated date.
    # Arrange
    text = "2026/11/14"
    # Act and assert
    with pytest.raises(ValueError):
        parse_date(text)
