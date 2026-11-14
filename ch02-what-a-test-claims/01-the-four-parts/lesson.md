# The Four Parts of a Test

Every test in this tutorial has the same four parts, in every language. Once you can name them, you can read any test you come across, even one someone else wrote.

Here is a test for the subtotal of INV-1002. The C#, Python and JavaScript versions are the test files for this step. You will not edit them here. Open them from the file menu to read them, and Run executes them against the library.

~~~examples readonly
```csharp
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class SubtotalTests
{
    [Test]
    public void Subtotal_adds_the_line_totals()
    {
        // Claim: the subtotal is the sum of quantity times unit price over the lines.
        // Fixture: one line, three widgets at 835 cents, so the subtotal should be 2505.
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        // Action and assertion: ask the library for the subtotal, and check it against the claim.
        Assert.That(Invoices.SubtotalCents(invoice), Is.EqualTo(2505));
    }
}
```
```python
from invoicing import Invoice, InvoiceLine, subtotal_cents


def test_subtotal_adds_the_line_totals():
    # Claim: the subtotal is the sum of quantity times unit price over the lines.
    # Fixture: one line, three widgets at 835 cents, so the subtotal should be 2505.
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    # Action and assertion: ask the library for the subtotal, and check it against the claim.
    assert subtotal_cents(invoice) == 2505
```
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotalCents } from './invoicing/index.js';

test('subtotal adds the line totals', () => {
  // Claim: the subtotal is the sum of quantity times unit price over the lines.
  // Fixture: one line, three widgets at 835 cents, so the subtotal should be 2505.
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Action and assertion: ask the library for the subtotal, and check it against the claim.
  assert.equal(subtotalCents(invoice), 2505);
});
```
~~~

Read the test in this order, one part at a time. The table says where to look for each part.

| Part | What it is | Where to find it |
| --- | --- | --- |
| **Claim** | What the test says should be true. | The name of the test, and the comment above the fixture. |
| **Fixture** | The data the test starts from. | The invoice that is built before anything else happens. |
| **Action** | The one call that does the work. | The call to the library, such as `subtotal_cents` in Python. |
| **Assertion** | The comparison that decides whether the claim held. | The last line, where the result is checked against an expected number. |

Try it on the test above before you read on. If a word in the table is new, that is fine. The next steps use each one.

Run the test. It passes, and it should. A passing test is only good news when it could have failed. The next step shows a test where that is not true.

---
