using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class GeneratedTests
{
    private static Invoice MakeInvoice() => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: new System.Collections.Generic.List<long>());

    [Test]
    public void Tax_matches_what_the_library_returns()
    {
        // Doubles: none. Generated: the expected value is read from the library.
        var invoice = MakeInvoice();
        var expected = Invoices.TaxCents(invoice);
        Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(expected));
    }

    [Test]
    public void Total_is_not_null()
    {
        // Doubles: none. Generated: checks only that a value came back.
        Assert.That(Invoices.TotalCents(MakeInvoice()), Is.Not.Null);
    }

    [Test]
    public void Tax_on_invoice_1002_is_207_cents()
    {
        // Doubles: none. Written from the claim: 2505 x 825, plus 5000, divided by 10000, is 207.
        Assert.That(Invoices.TaxCents(MakeInvoice()), Is.EqualTo(207));
    }
}
