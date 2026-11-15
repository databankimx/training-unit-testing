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

    // The late fee, in cents. This is a stub, written test first in chapter 5.
    public static long LateFee(Invoice invoice, string today)
    {
        return 0;
    }

    // The volume discount, in cents. This is a stub, written test first in chapter 14.
    public static long VolumeDiscountCents(Invoice invoice)
    {
        var subtotal = SubtotalCents(invoice);
        if (subtotal <= 10000) return 0;
        return (subtotal * 500 + 5000) / 10000; // 5 percent, rounded half up
    }
}
