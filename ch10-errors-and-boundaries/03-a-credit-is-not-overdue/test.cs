using System;
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class BoundaryTests
{
    private static Invoice MakeInvoice(params long[] paymentsCents) => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: paymentsCents);

    [Test]
    public void An_overpaid_invoice_is_not_overdue()
    {
        // Doubles: none.
        // Why: a payment larger than the total leaves a credit, a negative balance. The claim is about whether money is owed.
        // Arrange
        var invoice = MakeInvoice(3000);
        // Act
        var result = Invoices.IsOverdue(invoice, "2026-11-14");
        // Assert
        Assert.That(result, Is.Null); // TODO (homework): work out what the claim says, and replace Is.Null with the right constraint.
    }
}
