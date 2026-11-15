using System.Collections.Generic;
using System.Linq;
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class FakeRepositoryTests
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

    // A fake: it works like a real sender, and keeps each reminder in a list the test can read.
    private sealed class RecordingSender : IReminderSender
    {
        public List<(string Email, string InvoiceId, long Amount)> Sent { get; } = new();

        public void Send(string customerEmail, string invoiceId, long amountDueCents) =>
            Sent.Add((customerEmail, invoiceId, amountDueCents));
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
    public void Each_overdue_invoice_gets_one_reminder_with_its_own_address_and_amount()
    {
        // Doubles: a fake repository with two invoices, a stub clock, and a recording fake sender.
        // Why: the test checks what was sent, so it needs a sender it can read back.
        // Arrange
        var repository = new InMemoryRepository();
        repository.Add(MakeInvoice());
        repository.Add(AnnInvoice());
        var sender = new RecordingSender();
        var service = new ReminderService(repository, new StubClock("2026-11-14"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(2));
        Assert.That(sender.Sent[0].Email, Is.EqualTo("bob.diaz@example.invalid"));
        Assert.That(sender.Sent[0].Amount, Is.EqualTo(2712));
        Assert.That(sender.Sent[1].Email, Is.EqualTo("ann.lee@example.invalid"));
        Assert.That(sender.Sent[1].Amount, Is.EqualTo(2000));
    }

    [Test]
    public void A_paid_invoice_gets_no_reminder()
    {
        // Doubles: the same fake repository, a stub clock, and the recording fake sender.
        // Why: the repository should leave out the paid invoice, and the test checks that it does.
        // Arrange
        var repository = new InMemoryRepository();
        repository.Add(MakeInvoice());
        repository.Add(PaidInvoice());
        var sender = new RecordingSender();
        var service = new ReminderService(repository, new StubClock("2026-11-14"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(1));
        Assert.That(sender.Sent[0].InvoiceId, Is.EqualTo("INV-1002"));
    }
}
