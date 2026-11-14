using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TotalsTests
{
    [Test]
    public void Subtotal_of_invoice_1002_is_correct()
    {
        // Claim: the subtotal of INV-1002 is correct.
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
        var result = Invoices.TaxCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(207));
    }

    [Test]
    public void Total_of_invoice_1002_is_correct()
    {
        // Claim: the total of INV-1002 is correct.
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
        var result = Invoices.TotalCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(2712));
    }
}
