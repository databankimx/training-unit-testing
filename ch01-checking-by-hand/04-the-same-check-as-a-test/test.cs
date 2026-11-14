using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TaxRoundingTests
{
    [Test]
    public void Tax_rounds_half_up_to_207_cents_on_2505_cents()
    {
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(207));
    }
}
