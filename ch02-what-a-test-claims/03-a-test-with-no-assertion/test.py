from invoicing import Invoice, tax_cents


def test_tax_on_a_zero_subtotal_is_zero():
    # Claim: an invoice with no lines owes no tax.
    invoice = Invoice(
        id="INV-0000",
        customer_name="Nobody",
        customer_email="nobody@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(),
    )

    tax_cents(invoice)  # TODO (homework): make this an assertion that the tax is 0
