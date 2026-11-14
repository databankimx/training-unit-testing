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

    [Test]
    public void Two_percent_on_a_large_balance()
    {
        // Claim: an overdue invoice with a large balance owes 2 percent of the balance.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-BIG",
            CustomerName: "Test",
            CustomerEmail: "test@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 0,
            Lines: new[] { new InvoiceLine("Service", 1, 50000) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var result = Invoices.LateFee(invoice, "2026-11-14");
        // Assert
        Assert.That(result, Is.EqualTo(-1)); // TODO (homework): work out the 2 percent fee by hand, then type it in
    }
}
