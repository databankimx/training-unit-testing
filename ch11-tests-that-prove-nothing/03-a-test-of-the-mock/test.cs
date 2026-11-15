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
    public void The_clock_returns_the_date_it_was_told()
    {
        // Doubles: a stub clock, a substitute with a return value.
        // Why: the claim is about the clock, so the test checks the clock. It does not check the program.
        // Arrange
        var clock = Substitute.For<IClock>();
        clock.Today().Returns("2026-11-14");
        // Act and assert
        Assert.That(clock.Today(), Is.EqualTo("2026-11-14"));
    }

    [Test]
    public void The_total_is_not_null()
    {
        // Doubles: none.
        // Why: the claim is the total, so the test should check its value.
        // Arrange
        var invoice = MakeInvoice();
        // Act and assert
        Assert.That(Invoices.TotalCents(invoice), Is.Not.Null);
    }
}
