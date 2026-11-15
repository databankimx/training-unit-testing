from invoicing import Invoice, InvoiceLine, balance_due_cents

# Shared by every test in this file. A test that adds a payment changes it for the tests that run after it.
PAYMENTS = []


def shared_invoice() -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
        payments_cents=tuple(PAYMENTS),
    )


def test_a_customer_pays_part_of_the_invoice():
    # Claim: after a payment of 1000 cents, 1712 cents are still owed.
    # Arrange
    PAYMENTS.append(1000)
    invoice = shared_invoice()
    # Act
    result = balance_due_cents(invoice)
    # Assert
    assert result == 1712


def test_the_full_balance_is_owed():
    # Claim: an invoice with no payments owes the full 2712 cents.
    # Arrange
    invoice = shared_invoice()
    # Act
    result = balance_due_cents(invoice)
    # Assert
    assert result == 2712
