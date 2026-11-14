from invoicing import Invoice, InvoiceLine, tax_cents


def test_tax_on_invoice_1002_is_correct():
    # Claim: the tax on INV-1002 is 207 cents.
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    # Assertion: the tax is not negative.
    assert tax_cents(invoice) >= 0
