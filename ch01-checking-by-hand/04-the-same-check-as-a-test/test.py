from invoicing import Invoice, InvoiceLine, tax_cents


def test_tax_rounds_half_up_to_207_cents_on_2505_cents():
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    assert tax_cents(invoice) == 207
