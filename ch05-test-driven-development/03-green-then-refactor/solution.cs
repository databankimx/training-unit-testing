namespace Invoicing;

// The calculations that depend only on the data in an invoice.
public static class Invoices
{
    public static long SubtotalCents(Invoice invoice) =>
        invoice.Lines.Sum(line => (long)line.Quantity * line.UnitPriceCents);

    // The tax on the subtotal, rounded half up to the cent. Basis points are hundredths of a percent.
    public static long TaxCents(Invoice invoice) =>
        (SubtotalCents(invoice) * invoice.TaxRateBasisPoints + 5000) / 10000;

    public static long TotalCents(Invoice invoice) =>
        SubtotalCents(invoice) + TaxCents(invoice);

    // The total less the payments. A negative balance is a credit.
    public static long BalanceDueCents(Invoice invoice) =>
        TotalCents(invoice) - invoice.PaymentsCents.Sum();

    // True when money is still owed and today is after the due date.
    public static bool IsOverdue(Invoice invoice, string today) =>
        BalanceDueCents(invoice) > 0 && Dates.Parse(today) > Dates.Parse(invoice.DueDate);

    // The late fee, in cents. Zero unless overdue with money owed. Otherwise the larger of 500 cents and 2 percent of the balance.
    public static long LateFee(Invoice invoice, string today)
    {
        if (!IsOverdue(invoice, today)) return 0;
        var twoPercent = (BalanceDueCents(invoice) * 200 + 5000) / 10000;
        return Math.Max(500, twoPercent);
    }
}
