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
    public void A_date_that_is_not_real_is_refused()
    {
        // Doubles: none.
        // Why: the claim is that the library refuses a date that does not exist, so the test checks for a refusal.
        // Arrange
        var text = "2026-02-30";
        // Act and assert
        Assert.That(() => Dates.Parse(text), Throws.TypeOf<FormatException>());
    }

    [Test]
    public void A_date_in_the_wrong_shape_is_refused()
    {
        // Doubles: none.
        // Why: the claim is that the library reads only YYYY-MM-DD, so the test checks a slash-separated date.
        // Arrange
        var text = "2026/11/14";
        // Act and assert
        Assert.That(() => Dates.Parse(text), Throws.TypeOf<FormatException>());
    }
}
