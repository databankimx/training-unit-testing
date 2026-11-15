using System.Collections.Generic;
using System.Linq;
using Invoicing;
using NSubstitute;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class ChoosingTests
{
    // A fake: it keeps invoices in a list, and FindOpen returns them all.
    private sealed class InMemoryRepository : IInvoiceRepository
    {
        private readonly List<Invoice> _invoices = new();

        public void Add(Invoice invoice) => _invoices.Add(invoice);

        public IReadOnlyList<Invoice> FindOpen() => _invoices.ToList();
    }

    private static Invoice MakeInvoice() => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: new List<long>());

    private static Invoice AnnInvoice() => new Invoice(
        Id: "INV-1003",
        CustomerName: "Ann Lee",
        CustomerEmail: "ann.lee@example.invalid",
        DueDate: "2026-10-15",
        TaxRateBasisPoints: 0,
        Lines: new[] { new InvoiceLine("Service", 2, 1000) },
        PaymentsCents: new List<long>());

    [Test]
    public void Two_overdue_invoices_get_two_reminders()
    {
        // Doubles: a stub clock, a fake repository with two invoices, and a mock sender.
        // Why: the claim is about the reminders, so the test checks what they say.
        // Arrange
        var clock = Substitute.For<IClock>();
        clock.Today().Returns("2026-11-14");
        var repository = new InMemoryRepository();
        repository.Add(MakeInvoice());
        repository.Add(AnnInvoice());
        var sender = Substitute.For<IReminderSender>();
        var service = new ReminderService(repository, clock, sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(2));
        sender.Received(2).Send(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<long>());
    }
}
