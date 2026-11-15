using System.Collections.Generic;
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class SharedInvoiceTests
{
    // Shared by every test in this class. A test that adds a payment changes it for the tests that run after it.
    private static readonly List<long> SharedPayments = new();

    private static Invoice SharedInvoice() => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: SharedPayments);

    [Test]
    public void A_customer_pays_part_of_the_invoice()
    {
        // Claim: after a payment of 1000 cents, 1712 cents are still owed.
        // Arrange
        SharedPayments.Add(1000);
        var invoice = SharedInvoice();
        // Act
        var result = Invoices.BalanceDueCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(1712));
    }

    [Test]
    public void The_full_balance_is_owed()
    {
        // Claim: an invoice with no payments owes the full 2712 cents.
        // Arrange
        var invoice = SharedInvoice();
        // Act
        var result = Invoices.BalanceDueCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(2712));
    }
}
