using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class ClaimTests
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
    public void Tax_on_invoice_1002_matches_the_claim()
    {
        // Doubles: none.
        // Why: the claim is the tax is 207 cents, worked out by hand. The expected value must come from the claim, not the library.
        var invoice = MakeInvoice();
        var expected = 207;
        Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(expected));
    }
}
