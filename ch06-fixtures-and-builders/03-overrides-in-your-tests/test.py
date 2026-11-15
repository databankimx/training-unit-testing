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


def test_a_partial_payment_leaves_the_rest_owed():
    # Claim: after a payment of 1000 cents, the balance is the full balance less 1000 cents.
    # Arrange
    invoice = make_invoice()  # TODO (homework): add a payment of 1000 cents with an override
    # Act
    result = balance_due_cents(invoice)
    # Assert
    assert result == None  # TODO (homework): work out the balance by hand, then type it in


def test_a_full_payment_clears_the_balance():
    # Claim: once the full 2712 cents is paid, nothing is owed.
    # Arrange
    invoice = make_invoice()  # TODO (homework): add a payment of 2712 cents with an override
    # Act
    result = balance_due_cents(invoice)
    # Assert
    assert result == None  # TODO (homework): work out the balance by hand, then type it in
