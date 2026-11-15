from invoicing import Invoice, InvoiceLine, tax_cents


def make_invoice() -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )


def test_tax_on_invoice_1002_matches_the_claim():
    # Doubles: none.
    # Why: the claim is the tax is 207 cents, worked out by hand. The expected value must come from the claim, not the library.
    invoice = make_invoice()
    expected = None  # TODO (homework): write the hand-worked value from the claim, not a call to the library
    assert tax_cents(invoice) == expected
