using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TaxRoundingTests
{
    // Each row: the subtotal in cents, the rate in basis points, and the expected tax in cents.
    [TestCase(1000, 25, 3, TestName = "half-cent-rounds-up")]
    [TestCase(1000, 24, 2, TestName = "below-half-cent")]
    [TestCase(1000, 26, 3, TestName = "above-half-cent")]
    [TestCase(2505, 825, 207, TestName = "invoice-1002")]
    public void Tax_rounds_half_up(long subtotal, int rate, long expected)
    {
        // Claim: the tax is the subtotal times the rate, rounded half up to the cent.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-CASE",
            CustomerName: "Test",
            CustomerEmail: "test@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: rate,
            Lines: new[] { new InvoiceLine("Item", 1, subtotal) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var result = Invoices.TaxCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(expected));
    }
}
