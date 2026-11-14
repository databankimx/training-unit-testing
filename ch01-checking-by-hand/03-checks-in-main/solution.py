from invoicing import Invoice, InvoiceLine, tax_cents

invoice = Invoice(
    id="INV-1002",
    customer_name="Bob Diaz",
    customer_email="bob.diaz@example.invalid",
    due_date="2026-11-01",
    tax_rate_basis_points=825,
    lines=(InvoiceLine("Widget", 3, 835),),
)

expected = 206
actual = tax_cents(invoice)

if actual == expected:
    print("PASS tax on INV-1002")
else:
    print(f"FAIL tax on INV-1002: expected {expected}, got {actual}")
