namespace Invoicing;

// Money is whole cents, and dates are ISO strings (YYYY-MM-DD). The Python and JavaScript ports hold the same data.

public sealed record InvoiceLine(string Description, int Quantity, long UnitPriceCents);

public sealed record Invoice(
    string Id,
    string CustomerName,
    string CustomerEmail,
    string DueDate,
    int TaxRateBasisPoints,
    IReadOnlyList<InvoiceLine> Lines,
    IReadOnlyList<long> PaymentsCents);
