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
    public void An_invoice_is_not_overdue_on_its_due_date()
    {
        // Doubles: none. The rule is pure, so the test calls it directly.
        // Why: the claim is about the boundary, so the test uses the exact due date.
        // Arrange
        var invoice = MakeInvoice();
        // Act
        var result = Invoices.IsOverdue(invoice, "2026-11-01");
        // Assert
        Assert.That(result, Is.False);
    }

    [Test]
    public void An_invoice_is_overdue_the_day_after_its_due_date()
    {
        // Doubles: none.
        // Why: one day later is the first day the claim says the invoice is overdue.
        // Arrange
        var invoice = MakeInvoice();
        // Act
        var result = Invoices.IsOverdue(invoice, "2026-11-02");
        // Assert
        Assert.That(result, Is.True);
    }

    [Test]
    public void A_paid_invoice_is_not_overdue_after_its_due_date()
    {
        // Doubles: none.
        // Why: the claim is that money must still be owed, so a paid invoice is never overdue.
        // Arrange
        var invoice = MakeInvoice(2712);
        // Act
        var result = Invoices.IsOverdue(invoice, "2026-11-14");
        // Assert
        Assert.That(result, Is.False);
    }
}
