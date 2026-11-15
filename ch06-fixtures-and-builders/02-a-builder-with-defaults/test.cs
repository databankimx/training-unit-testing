using System.Collections.Generic;
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class BuilderTests
{
    // A fresh INV-1002 invoice. Each call builds its own payments, so no test can change another's.
    private static Invoice MakeInvoice(IReadOnlyList<long>? paymentsCents = null) => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: paymentsCents ?? new List<long>());

    [Test]
    public void A_customer_pays_part_of_the_invoice()
    {
        // Claim: after a payment of 1000 cents, 1712 cents are still owed.
        // Arrange
        var invoice = MakeInvoice(new long[] { 1000 });
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
        var invoice = MakeInvoice();
        // Act
        var result = Invoices.BalanceDueCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(2712));
    }
}
