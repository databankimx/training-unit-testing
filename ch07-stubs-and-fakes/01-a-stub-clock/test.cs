using System.Collections.Generic;
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class ReminderTests
{
    // A stub: it always says the same date, whatever the test does.
    private sealed class StubClock : IClock
    {
        private readonly string _today;

        public StubClock(string today) => _today = today;

        public string Today() => _today;
    }

    // A stub: it always returns the same list of invoices.
    private sealed class FixedRepository : IInvoiceRepository
    {
        private readonly IReadOnlyList<Invoice> _invoices;

        public FixedRepository(IReadOnlyList<Invoice> invoices) => _invoices = invoices;

        public IReadOnlyList<Invoice> FindOpen() => _invoices;
    }

    // A fake: it works like a real sender, and keeps each reminder in a list the test can read.
    private sealed class RecordingSender : IReminderSender
    {
        public List<(string Email, string InvoiceId, long Amount)> Sent { get; } = new();

        public void Send(string customerEmail, string invoiceId, long amountDueCents) =>
            Sent.Add((customerEmail, invoiceId, amountDueCents));
    }

    private static Invoice MakeInvoice() => new Invoice(
        Id: "INV-1002",
        CustomerName: "Bob Diaz",
        CustomerEmail: "bob.diaz@example.invalid",
        DueDate: "2026-11-01",
        TaxRateBasisPoints: 825,
        Lines: new[] { new InvoiceLine("Widget", 3, 835) },
        PaymentsCents: new List<long>());

    [Test]
    public void No_reminder_on_the_due_date()
    {
        // Double: a stub clock, so today is exactly the due date.
        // Why: the rule is "after the due date", so the test needs an exact day.
        // Arrange
        var sender = new RecordingSender();
        var service = new ReminderService(new FixedRepository(new[] { MakeInvoice() }), new StubClock("2026-11-01"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(0));
        Assert.That(sender.Sent, Is.Empty);
    }

    [Test]
    public void One_reminder_the_day_after_the_due_date()
    {
        // Double: the same stub clock, set to the day after the due date.
        // Why: the same exact day, one day later, shows the rule switching on.
        // Arrange
        var sender = new RecordingSender();
        var service = new ReminderService(new FixedRepository(new[] { MakeInvoice() }), new StubClock("2026-11-02"), sender);
        // Act
        var sent = service.SendOverdueReminders();
        // Assert
        Assert.That(sent, Is.EqualTo(1));
        Assert.That(sender.Sent[0].Email, Is.EqualTo("bob.diaz@example.invalid"));
        Assert.That(sender.Sent[0].Amount, Is.EqualTo(2712));
    }
}
