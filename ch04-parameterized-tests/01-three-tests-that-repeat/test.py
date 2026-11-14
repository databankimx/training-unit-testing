from invoicing import Invoice, InvoiceLine, tax_cents


def test_tax_on_2_5_cents_rounds_up_to_3():
    # Claim: 2.5 cents of tax rounds half up to 3 cents.
    # Arrange
    invoice = Invoice(
        id="INV-A",
        customer_name="Test",
        customer_email="test@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=25,
        lines=(InvoiceLine("Item", 1, 1000),),
    )
    # Act
    result = tax_cents(invoice)
    # Assert
    assert result == 3


def test_tax_on_2_4_cents_rounds_down_to_2():
    # Claim: 2.4 cents of tax rounds down to 2 cents.
    # Arrange
    invoice = Invoice(
        id="INV-B",
        customer_name="Test",
        customer_email="test@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=24,
        lines=(InvoiceLine("Item", 1, 1000),),
    )
    # Act
    result = tax_cents(invoice)
    # Assert
    assert result == 2


def test_tax_on_2_6_cents_rounds_up_to_3():
    # Claim: 2.6 cents of tax rounds up to 3 cents.
    # Arrange
    invoice = Invoice(
        id="INV-C",
        customer_name="Test",
        customer_email="test@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=26,
        lines=(InvoiceLine("Item", 1, 1000),),
    )
    # Act
    result = tax_cents(invoice)
    # Assert
    assert result == 3
