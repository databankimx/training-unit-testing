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
    public void A_partial_payment_is_reflected_in_the_reminder()
    {
        // Doubles: a fake repository, a stub clock set to 14 November, and the recording fake sender.
        // Why: the reminder should carry the balance after the payment, and the test reads it from the sender.
        // Arrange
        var repository = new InMemoryRepository();
        repository.Add(MakeInvoice()); // TODO (homework): give this invoice a payment of 1000 cents
        var sender = new RecordingSender();
        var service = new ReminderService(repository, new StubClock("2026-11-14"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(1));
        Assert.That(sender.Sent[0].Amount, Is.EqualTo(-1)); // TODO (homework): work out the balance after the payment, then type it in
    }

    [Test]
    public void An_invoice_paid_in_full_gets_no_reminder()
    {
        // Doubles: the same fake repository, a stub clock set to 14 November, and the recording fake sender.
        // Why: once nothing is owed, the fake repository should leave the invoice out.
        // Arrange
        var repository = new InMemoryRepository();
        repository.Add(MakeInvoice()); // TODO (homework): give this invoice a payment of 2712 cents
        var sender = new RecordingSender();
        var service = new ReminderService(repository, new StubClock("2026-11-14"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(-1)); // TODO (homework): how many reminders should go out?
    }
}
