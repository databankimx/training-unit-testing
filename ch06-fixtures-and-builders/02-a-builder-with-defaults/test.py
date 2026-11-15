from invoicing import Invoice, InvoiceLine, balance_due_cents


def make_invoice(**overrides) -> Invoice:
    """A fresh INV-1002 invoice. Each call builds its own payments, so no test can change another's."""
    fields = {
        "id": "INV-1002",
        "customer_name": "Bob Diaz",
        "customer_email": "bob.diaz@example.invalid",
        "due_date": "2026-11-01",
        "tax_rate_basis_points": 825,
        "lines": (InvoiceLine("Widget", 3, 835),),
        "payments_cents": (),
    }
    fields.update(overrides)
    return Invoice(**fields)


def test_a_customer_pays_part_of_the_invoice():
    # Claim: after a payment of 1000 cents, 1712 cents are still owed.
    # Arrange
    invoice = make_invoice(payments_cents=(1000,))
    # Act
    result = balance_due_cents(invoice)
    # Assert
    assert result == 1712


def test_the_full_balance_is_owed():
    # Claim: an invoice with no payments owes the full 2712 cents.
    # Arrange
    invoice = make_invoice()
    # Act
    result = balance_due_cents(invoice)
    # Assert
    assert result == 2712
