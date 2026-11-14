from invoicing import Invoice, InvoiceLine, subtotal_cents, tax_cents, total_cents


def test_tax_of_invoice_1002_is_correct():
    # Claim: the tax on INV-1002 is correct.
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
    expected = tax_cents(invoice)
    # Assert
    assert tax_cents(invoice) == expected
