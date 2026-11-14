using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TotalsTests
{
    [Test]
    public void Subtotal_of_invoice_1002_is_2505_cents()
    {
        // Claim: the subtotal is the sum of quantity times unit price, which is 2505 cents.
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
        var result = Invoices.SubtotalCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(2505));
    }
}
