from invoicing import Invoice, InvoiceLine, subtotal_cents


def test_subtotal_adds_the_line_totals():
    # Claim: the subtotal is the sum of quantity times unit price over the lines.
    # Fixture: one line, three widgets at 835 cents, so the subtotal should be 2505.
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    # Action and assertion: ask the library for the subtotal, and check it against the claim.
    assert subtotal_cents(invoice) == 2505
