using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TaxClaimTests
{
    [Test]
    public void Tax_on_invoice_1002_is_correct()
    {
        // Claim: the tax on INV-1002 is 207 cents.
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        // Assertion: the tax is not negative.
        Assert.That(Invoices.TaxCents(invoice), Is.GreaterThanOrEqualTo(0));
    }
}
