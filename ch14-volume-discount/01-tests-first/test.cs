using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class VolumeDiscountTests
{
    private static Invoice MakeInvoice(long unitPriceCents) => new Invoice(
        Id: "INV-2001",
        CustomerName: "Acme Ltd",
        CustomerEmail: "ap@acme.example.invalid",
        DueDate: "2026-12-01",
        TaxRateBasisPoints: 0,
        Lines: new[] { new InvoiceLine("Bulk order", 1, unitPriceCents) },
        PaymentsCents: new System.Collections.Generic.List<long>());

    [Test]
    public void No_discount_at_exactly_the_threshold()
    {
        // Claim: an order of exactly 10000 cents gets no discount, because the rule says above the threshold.
        Assert.That(Invoices.VolumeDiscountCents(MakeInvoice(10000)), Is.EqualTo(0));
    }

    [Test]
    public void Five_percent_above_the_threshold()
    {
        // Claim: 5 percent of 10001 cents, rounded half up. By hand: 10001 x 500, plus 5000, divided by 10000, dropping the remainder, is 500.
        Assert.That(Invoices.VolumeDiscountCents(MakeInvoice(10001)), Is.EqualTo(-1));  # TODO (homework): work out the discount by hand from the claim
    }

    [Test]
    public void The_discount_rounds_half_up()
    {
        // Claim: 5 percent of 12010 cents is 600.5 cents, which rounds half up to 601. By hand: 12010 x 500, plus 5000, divided by 10000, is 601.
        Assert.That(Invoices.VolumeDiscountCents(MakeInvoice(12010)), Is.EqualTo(-1));  # TODO (homework): work out the discount by hand from the claim
    }
}
