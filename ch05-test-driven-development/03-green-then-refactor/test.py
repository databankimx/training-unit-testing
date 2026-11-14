from invoicing import Invoice, InvoiceLine, late_fee


def test_no_late_fee_before_the_due_date():
    # Claim: an invoice that is not yet overdue owes no late fee.
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
    result = late_fee(invoice, "2026-10-31")
    # Assert
    assert result == 0


def test_minimum_late_fee_on_a_small_balance():
    # Claim: an overdue invoice with a small balance owes the minimum fee of 500 cents.
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
    result = late_fee(invoice, "2026-11-14")
    # Assert
    assert result == 500


def test_two_percent_on_a_large_balance():
    # Claim: an overdue invoice with a large balance owes 2 percent of the balance.
    # Arrange
    invoice = Invoice(
        id="INV-BIG",
        customer_name="Test",
        customer_email="test@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=0,
        lines=(InvoiceLine("Service", 1, 50000),),
    )
    # Act
    result = late_fee(invoice, "2026-11-14")
    # Assert
    assert result == 1000
