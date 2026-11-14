using Invoicing;

var invoice = new Invoice(
    Id: "INV-1002",
    CustomerName: "Bob Diaz",
    CustomerEmail: "bob.diaz@example.invalid",
    DueDate: "2026-11-01",
    TaxRateBasisPoints: 825,
    Lines: new[] { new InvoiceLine("Widget", 3, 835) },
    PaymentsCents: Array.Empty<long>());

long expected = 206;
long actual = Invoices.TaxCents(invoice);

if (actual == expected)
    Console.WriteLine("PASS tax on INV-1002");
else
    Console.WriteLine($"FAIL tax on INV-1002: expected {expected}, got {actual}");
