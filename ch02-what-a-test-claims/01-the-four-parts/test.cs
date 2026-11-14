using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class SubtotalTests
{
    [Test]
    public void Subtotal_adds_the_line_totals()
    {
        // Claim: the subtotal is the sum of quantity times unit price over the lines.
        // Fixture: one line, three widgets at 835 cents, so the subtotal should be 2505.
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        // Action and assertion: ask the library for the subtotal, and check it against the claim.
        Assert.That(Invoices.SubtotalCents(invoice), Is.EqualTo(2505));
    }
}
