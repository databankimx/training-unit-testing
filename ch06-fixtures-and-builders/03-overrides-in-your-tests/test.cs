using System.Collections.Generic;
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class OverrideTests
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
    public void A_partial_payment_leaves_the_rest_owed()
    {
        // Claim: after a payment of 1000 cents, the balance is the full balance less 1000 cents.
        // Arrange
        var invoice = MakeInvoice(); // TODO (homework): add a payment of 1000 cents with an override
        // Act
        var result = Invoices.BalanceDueCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(-1)); // TODO (homework): work out the balance by hand, then type it in
    }

    [Test]
    public void A_full_payment_clears_the_balance()
    {
        // Claim: once the full 2712 cents is paid, nothing is owed.
        // Arrange
        var invoice = MakeInvoice(); // TODO (homework): add a payment of 2712 cents with an override
        // Act
        var result = Invoices.BalanceDueCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(-1)); // TODO (homework): work out the balance by hand, then type it in
    }
}
