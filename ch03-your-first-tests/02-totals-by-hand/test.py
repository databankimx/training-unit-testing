from invoicing import Invoice, InvoiceLine, subtotal_cents, tax_cents, total_cents


def test_subtotal_of_invoice_1002_is_correct():
    # Claim: the subtotal of INV-1002 is correct.
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
    assert result == None  # TODO (homework): replace the placeholder with the subtotal, worked out by hand

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
    result = tax_cents(invoice)
    # Assert
    assert result == None  # TODO (homework): replace the placeholder with the tax, worked out by hand

def test_total_of_invoice_1002_is_correct():
    # Claim: the total of INV-1002 is correct.
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
    result = total_cents(invoice)
    # Assert
    assert result == None  # TODO (homework): replace the placeholder with the total, worked out by hand
