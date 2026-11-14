import pytest
from invoicing import Invoice, InvoiceLine, tax_cents


@pytest.mark.parametrize(
    "subtotal, rate, expected",
    [
        (1000, 25, None), # TODO (homework): work this out by hand from the rule, then type it in
        (1000, 24, None), # TODO (homework): work this out by hand from the rule, then type it in
        (1000, 26, None), # TODO (homework): work this out by hand from the rule, then type it in
        (2505, 825, 207),
    ],
    ids=["half-cent-rounds-up", "below-half-cent", "above-half-cent", "invoice-1002"],
)
def test_tax_rounds_half_up(subtotal, rate, expected):
    # Claim: the tax is the subtotal times the rate, rounded half up to the cent.
    # Arrange
    invoice = Invoice(
        id="INV-CASE",
        customer_name="Test",
        customer_email="test@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=rate,
        lines=(InvoiceLine("Item", 1, subtotal),),
    )
    # Act
    result = tax_cents(invoice)
    # Assert
    assert result == expected
