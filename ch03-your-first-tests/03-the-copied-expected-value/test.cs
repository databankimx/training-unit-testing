using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TotalsTests
{
    [Test]
    public void Tax_of_invoice_1002_is_correct()
    {
        // Claim: the tax on INV-1002 is correct.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var expected = Invoices.TaxCents(invoice);
        // Assert
        Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(expected));
    }
}
