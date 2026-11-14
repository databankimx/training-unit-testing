using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class ZeroTaxTests
{
    [Test]
    public void Tax_on_a_zero_subtotal_is_zero()
    {
        // Claim: an invoice with no lines owes no tax.
        var invoice = new Invoice(
            Id: "INV-0000",
            CustomerName: "Nobody",
            CustomerEmail: "nobody@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: Array.Empty<InvoiceLine>(),
            PaymentsCents: Array.Empty<long>());

        Invoices.TaxCents(invoice); // TODO (homework): make this an assertion that the tax is 0
    }
}
