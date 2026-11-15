using System.Collections.Generic;
using System.Linq;
using Invoicing;
using NSubstitute;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class MockTests
{
    // A stub: it always says the same date, whatever the test does.
    private sealed class StubClock : IClock
    {
        private readonly string _today;

        public StubClock(string today) => _today = today;

        public string Today() => _today;
    }

    // A fake: it keeps invoices in a list, and FindOpen returns only those that still owe money.
    private sealed class InMemoryRepository : IInvoiceRepository
    {
        private readonly List<Invoice> _invoices = new();

        public void Add(Invoice invoice) => _invoices.Add(invoice);

        public IReadOnlyList<Invoice> FindOpen() =>
            _invoices.Where(invoice => Invoices.BalanceDueCents(invoice) > 0).ToList();
    }

    private static Invoice MakeInvoice(IReadOnlyList<long>? paymentsCents = null) => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: paymentsCents ?? new List<long>());

    private static Invoice AnnInvoice() => new Invoice(
        Id: "INV-1003",
        CustomerName: "Ann Lee",
        CustomerEmail: "ann.lee@example.invalid",
        DueDate: "2026-10-15",
        TaxRateBasisPoints: 0,
        Lines: new[] { new InvoiceLine("Service", 2, 1000) },
        PaymentsCents: new List<long>());

    private static Invoice PaidInvoice() => new Invoice(
        Id: "INV-1004",
        CustomerName: "Cy Park",
        CustomerEmail: "cy.park@example.invalid",
        DueDate: "2026-10-15",
        TaxRateBasisPoints: 0,
        Lines: new[] { new InvoiceLine("Service", 2, 1000) },
        PaymentsCents: new List<long> { 2000 });

    [Test]
    public void One_call_per_overdue_invoice_with_the_right_address_and_amount()
    {
        // Doubles: a fake repository with two invoices, a stub clock set to 14 November, and a mock sender.
        // Why: the claim is about the calls the service makes to the sender, so the test verifies them.
        // Arrange
        var repository = new InMemoryRepository();
        repository.Add(MakeInvoice());
        repository.Add(AnnInvoice());
        var sender = Substitute.For<IReminderSender>();
        var service = new ReminderService(repository, new StubClock("2026-11-14"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(2));
        sender.Received(2).Send(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<long>());
        sender.Received(1).Send("bob.diaz@example.invalid", "INV-1002", 2712);
        sender.Received(1).Send("ann.lee@example.invalid", "INV-1003", 2000);
    }
}
