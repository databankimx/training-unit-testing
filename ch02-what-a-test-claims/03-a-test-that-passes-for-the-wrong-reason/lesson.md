# A Test That Passes for the Wrong Reason

Dana has a test for the tax on INV-1002. It is green, it is in the suite, and a reviewer approved it. Before she relies on it, she wants to know whether it would notice a rounding bug. So she breaks the rounding in a copy and runs the test.

You are going to do the same. The question is not whether the test passes today. It is whether the test would fail tomorrow if the rounding broke.

The test below claims more than it checks. Its name says the tax on INV-1002 is correct, and the comment says that correct means 207 cents. Its assertion checks only that the tax is not negative.

~~~examples readonly
```csharp
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TaxClaimTests
{
    [Test]
    public void Tax_on_invoice_1002_is_correct()
    {
        // Claim: the tax on INV-1002 is 207 cents.
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        // Assertion: the tax is not negative.
        Assert.That(Invoices.TaxCents(invoice), Is.GreaterThanOrEqualTo(0));
    }
}
```
```python
from invoicing import Invoice, InvoiceLine, tax_cents


def test_tax_on_invoice_1002_is_correct():
    # Claim: the tax on INV-1002 is 207 cents.
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    # Assertion: the tax is not negative.
    assert tax_cents(invoice) >= 0
```
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { taxCents } from './invoicing/index.js';

test('tax on invoice 1002 is correct', () => {
  // Claim: the tax on INV-1002 is 207 cents.
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Assertion: the tax is not negative.
  assert.ok(taxCents(invoice) >= 0);
});
```
~~~

Run it. It passes. Now make the library wrong, in a copy. Take out the `+ 5000` that does the rounding, in the line for the language you are reading:

- C#: `TaxCents` in `invoicing/Invoices.cs`
- Python: `tax_cents` in `invoicing/invoice.py`
- JavaScript: `taxCents` in `invoicing/invoice.js`

The runner makes that copy for this step, and it changes only that copy. The library in `samples/` is never touched, so you can break it as often as you like.

Run the test again. It still passes. The truncated tax is 206 cents, which is not negative, so the assertion cannot see the difference. The claim says 207, and the test never checks for 207. The name promises more than the test delivers. That is the first way a test passes for the wrong reason.

> **Common mistake.** Reading a test's name and assuming the assertion checks it. Read the last line as well. If the name and the assertion say different things, the test proves only what the assertion says.

This is homework. Make the change yourself, in the copy, and Run to see what happens. Press Show solution (spoiler) only after you've tried it. The solution is the whole library file with the rounding term removed, so use it to check your work.

---
