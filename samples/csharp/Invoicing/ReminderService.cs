namespace Invoicing;

// Sends one reminder for each overdue invoice that has a balance due.
public sealed class ReminderService
{
    private readonly IInvoiceRepository _repository;
    private readonly IClock _clock;
    private readonly IReminderSender _sender;

    public ReminderService(IInvoiceRepository repository, IClock clock, IReminderSender sender)
    {
        _repository = repository;
        _clock = clock;
        _sender = sender;
    }

    // Returns the number of reminders sent.
    public int SendOverdueReminders()
    {
        var today = _clock.Today();
        var sent = 0;
        foreach (var invoice in _repository.FindOpen())
        {
            if (Invoices.IsOverdue(invoice, today))
            {
                _sender.Send(invoice.CustomerEmail, invoice.Id, Invoices.BalanceDueCents(invoice));
                sent++;
            }
        }
        return sent;
    }
}
