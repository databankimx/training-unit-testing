from invoicing import Invoice, InvoiceLine, subtotal_cents, tax_cents, total_cents


def test_subtotal_of_invoice_1002_is_2505_cents():
    # Claim: the subtotal is the sum of quantity times unit price, which is 2505 cents.
    # Arrange
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    # Act
    result = subtotal_cents(invoice)
    # Assert
    assert result == 2505
