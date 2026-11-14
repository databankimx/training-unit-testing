using System.Globalization;

namespace Invoicing;

// The ports: the interfaces the library needs from the outside world.

// Today's date as YYYY-MM-DD.
public interface IClock
{
    string Today();
}

// The invoices that still have a balance due.
public interface IInvoiceRepository
{
    IReadOnlyList<Invoice> FindOpen();
}

// Sends one reminder to a customer about an invoice.
public interface IReminderSender
{
    void Send(string customerEmail, string invoiceId, long amountDueCents);
}

// The production clock, which reads the computer's local calendar.
public sealed class SystemClock : IClock
{
    public string Today() =>
        DateOnly.FromDateTime(DateTime.Now).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
