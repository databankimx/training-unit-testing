using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class LateFeeTests
{
    [Test]
    public void No_late_fee_before_the_due_date()
    {
        // Claim: an invoice that is not yet overdue owes no late fee.
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
        var result = Invoices.LateFee(invoice, "2026-10-31");
        // Assert
        Assert.That(result, Is.EqualTo(0));
    }

    [Test]
    public void Minimum_late_fee_on_a_small_balance()
    {
        // Claim: an overdue invoice with a small balance owes the minimum fee of 500 cents.
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
        var result = Invoices.LateFee(invoice, "2026-11-14");
        // Assert
        Assert.That(result, Is.EqualTo(500));
    }
}
