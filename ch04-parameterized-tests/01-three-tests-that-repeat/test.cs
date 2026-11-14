using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TaxRoundingTests
{
    [Test]
    public void Tax_on_2_5_cents_rounds_up_to_3()
    {
        // Claim: 2.5 cents of tax rounds half up to 3 cents.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-A",
            CustomerName: "Test",
            CustomerEmail: "test@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 25,
            Lines: new[] { new InvoiceLine("Item", 1, 1000) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var result = Invoices.TaxCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(3));
    }

    [Test]
    public void Tax_on_2_4_cents_rounds_down_to_2()
    {
        // Claim: 2.4 cents of tax rounds down to 2 cents.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-B",
            CustomerName: "Test",
            CustomerEmail: "test@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 24,
            Lines: new[] { new InvoiceLine("Item", 1, 1000) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var result = Invoices.TaxCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(2));
    }

    [Test]
    public void Tax_on_2_6_cents_rounds_up_to_3()
    {
        // Claim: 2.6 cents of tax rounds up to 3 cents.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-C",
            CustomerName: "Test",
            CustomerEmail: "test@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 26,
            Lines: new[] { new InvoiceLine("Item", 1, 1000) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var result = Invoices.TaxCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(3));
    }
}
