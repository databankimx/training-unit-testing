# Run It and Look

Chapter 0 worked the invoice out by hand. Now run the library on that same invoice and compare the output with your numbers. This is the first check most of us make. You run the thing, you read what it printed, and you see whether it agrees with what you expected.

The program below prints four numbers for the invoice: the subtotal, the tax, the total, and the balance due. Press Run in any of the tabs.

~~~examples
```csharp
using Invoicing;

var invoice = new Invoice(
    Id: "INV-1001",
    CustomerName: "Alice Carter",
    CustomerEmail: "alice.carter@example.invalid",
    DueDate: "2026-11-01",
    TaxRateBasisPoints: 825,
    Lines: new[] { new InvoiceLine("Widget", 2, 1250) },
    PaymentsCents: Array.Empty<long>());

Console.WriteLine($"subtotal {Invoices.SubtotalCents(invoice)}");
Console.WriteLine($"tax {Invoices.TaxCents(invoice)}");
Console.WriteLine($"total {Invoices.TotalCents(invoice)}");
Console.WriteLine($"balance {Invoices.BalanceDueCents(invoice)}");
```
```python
from invoicing import Invoice, InvoiceLine, subtotal_cents, tax_cents, total_cents, balance_due_cents

invoice = Invoice(
    id="INV-1001",
    customer_name="Alice Carter",
    customer_email="alice.carter@example.invalid",
    due_date="2026-11-01",
    tax_rate_basis_points=825,
    lines=(InvoiceLine("Widget", 2, 1250),),
)

print(f"subtotal {subtotal_cents(invoice)}")
print(f"tax {tax_cents(invoice)}")
print(f"total {total_cents(invoice)}")
print(f"balance {balance_due_cents(invoice)}")
```
```javascript
import { subtotalCents, taxCents, totalCents, balanceDueCents } from './invoicing/index.js';

const invoice = {
  id: 'INV-1001',
  customerName: 'Alice Carter',
  customerEmail: 'alice.carter@example.invalid',
  dueDate: '2026-11-01',
  taxRateBasisPoints: 825,
  lines: [{ description: 'Widget', quantity: 2, unitPriceCents: 1250 }],
  paymentsCents: [],
};

console.log(`subtotal ${subtotalCents(invoice)}`);
console.log(`tax ${taxCents(invoice)}`);
console.log(`total ${totalCents(invoice)}`);
console.log(`balance ${balanceDueCents(invoice)}`);
```
~~~

It should print this:

~~~text
subtotal 2500
tax 206
total 2706
balance 2706
~~~

Now compare. In chapter 0 you worked out 2500, 206, 2706, and 2706. Those are the same four numbers, so the library agrees with your arithmetic on this invoice. That is a good result, and it is also the moment most people stop.

> **Aside: why the numbers are in cents.** The output is in whole cents, the way the library holds money, so there is no decimal point to misread. 2706 is 27.06, and you should be able to see that without thinking about it.

> **Common mistake.** Treating a matching number as proof that the library is right. The number matched on this invoice. You have not yet learned anything about the other invoices the library will see.

---
