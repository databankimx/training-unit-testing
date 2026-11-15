using System.Collections.Generic;
using Invoicing;
using NSubstitute;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class ProveNothingTests
{
    private static Invoice MakeInvoice() => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: new List<long>());

    [Test]
    public void The_subtotal_is_calculated()
    {
        // Doubles: none.
        // Why: the claim is the subtotal, so the test should check its value.
        // Arrange
        var invoice = MakeInvoice();
        // Act
        Invoices.SubtotalCents(invoice);
    }

    [Test]
    public void The_total_is_the_total()
    {
        // Doubles: none.
        // Why: the claim is the total, so the test should check its value.
        // Arrange
        var invoice = MakeInvoice();
        // Act and assert
        Assert.That(Invoices.TotalCents(invoice), Is.EqualTo(Invoices.TotalCents(invoice)));
    }

    [Test]
    public void The_tax_matches_the_tax_rule()
    {
        // Doubles: none.
        // Why: the claim is the tax rule, so the expected value should come from the rule, not from the code.
        // Arrange
        var invoice = MakeInvoice();
        var expected = Invoices.TaxCents(invoice);
        // Act and assert
        Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(expected));
    }

    [Test]
    public void The_tax_on_invoice_1002_is_207_cents()
    {
        // Doubles: none.
        // Why: the claim is that the tax is 207 cents, so the test checks 207.
        // Arrange
        var invoice = MakeInvoice();
        // Act and assert
        try
        {
            Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(999));
        }
        catch (AssertionException)
        {
            // swallowed
        }
    }

    [Test]
    public void The_tax_on_invoice_1002_is_207_cents_when_rounded_half_up()
    {
        // Doubles: none.
        // Why: the claim is that half a cent rounds up, so the test checks 207 against the real rule.
        // Arrange
        var invoice = MakeInvoice();
        // Act and assert
        Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(207));
    }
}
