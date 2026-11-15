from invoicing import Invoice, InvoiceLine, volume_discount_cents


def make_invoice(unit_price_cents: int) -> Invoice:
    return Invoice(
        id="INV-2001",
        customer_name="Acme Ltd",
        customer_email="ap@acme.example.invalid",
        due_date="2026-12-01",
        tax_rate_basis_points=0,
        lines=(InvoiceLine("Bulk order", 1, unit_price_cents),),
    )


def test_no_discount_at_exactly_the_threshold():
    # Claim: an order of exactly 10000 cents gets no discount, because the rule says above the threshold.
    assert volume_discount_cents(make_invoice(10000)) == 0


def test_five_percent_above_the_threshold():
    # Claim: 5 percent of 10001 cents, rounded half up. By hand: 10001 x 500, plus 5000, divided by 10000, dropping the remainder, is 500.
    assert volume_discount_cents(make_invoice(10001)) == 500


def test_the_discount_rounds_half_up():
    # Claim: 5 percent of 12010 cents is 600.5 cents, which rounds half up to 601. By hand: 12010 x 500, plus 5000, divided by 10000, is 601.
    assert volume_discount_cents(make_invoice(12010)) == 601
