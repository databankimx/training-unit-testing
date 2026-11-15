from invoicing import Invoice, InvoiceLine, tax_cents, total_cents


def make_invoice() -> Invoice:
    return Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )


def test_tax_matches_what_the_library_returns():
    # Doubles: none. Generated: the expected value is read from the library.
    invoice = make_invoice()
    expected = tax_cents(invoice)
    assert tax_cents(invoice) == expected


def test_total_is_not_null():
    # Doubles: none. Generated: checks only that a value came back.
    assert total_cents(make_invoice()) is not None


def test_tax_on_invoice_1002_is_207_cents():
    # Doubles: none. Written from the claim: 2505 x 825, plus 5000, divided by 10000, is 207.
    assert tax_cents(make_invoice()) == 207
