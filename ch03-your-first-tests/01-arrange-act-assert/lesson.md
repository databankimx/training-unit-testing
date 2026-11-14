# Arrange, Act, Assert

Every test in this tutorial has three sections, in every language. Test writers call them arrange, act and assert. They map onto the four parts from the last chapter, and they are the order you work through when you write a test.

| Section | Also called | What it does |
| --- | --- | --- |
| **Arrange** | the fixture | Builds the invoice the test starts from. |
| **Act** | the action | Makes the one call that does the work. |
| **Assert** | the assertion | Compares the result with the claim. |

The test below marks each section with a comment. Its claim is that the subtotal of INV-1002 is 2505 cents, the number you worked out by hand earlier in the tutorial. The test file is read-only here. Open it from the file menu to read it, and Run executes it.

~~~examples readonly
```csharp
using Invoicing;
using NUnit.Framework;

namespace Invoicing.Tests;

[TestFixture]
public class TotalsTests
{
    [Test]
    public void Subtotal_of_invoice_1002_is_2505_cents()
    {
        // Claim: the subtotal is the sum of quantity times unit price, which is 2505 cents.
        // Arrange
        var invoice = new Invoice(
            Id: "INV-1002",
            CustomerName: "Bob Diaz",
            CustomerEmail: "bob.diaz@example.invalid",
            DueDate: "2026-11-01",
            TaxRateBasisPoints: 825,
            Lines: new[] { new InvoiceLine("Widget", 3, 835) },
            PaymentsCents: Array.Empty<long>());

        // Act
        var result = Invoices.SubtotalCents(invoice);
        // Assert
        Assert.That(result, Is.EqualTo(2505));
    }
}
```
```python
from invoicing import Invoice, InvoiceLine, subtotal_cents, tax_cents, total_cents


def test_subtotal_of_invoice_1002_is_2505_cents():
    # Claim: the subtotal is the sum of quantity times unit price, which is 2505 cents.
    # Arrange
    invoice = Invoice(
        id="INV-1002",
        customer_name="Bob Diaz",
        customer_email="bob.diaz@example.invalid",
        due_date="2026-11-01",
        tax_rate_basis_points=825,
        lines=(InvoiceLine("Widget", 3, 835),),
    )

    # Act
    result = subtotal_cents(invoice)
    # Assert
    assert result == 2505
```
```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { subtotalCents, taxCents, totalCents } from './invoicing/index.js';

test('subtotal of invoice 1002 is 2505 cents', () => {
  // Claim: the subtotal is the sum of quantity times unit price, which is 2505 cents.
  // Arrange
  const invoice = {
    id: 'INV-1002',
    customerName: 'Bob Diaz',
    customerEmail: 'bob.diaz@example.invalid',
    dueDate: '2026-11-01',
    taxRateBasisPoints: 825,
    lines: [{ description: 'Widget', quantity: 3, unitPriceCents: 835 }],
    paymentsCents: [],
  };

  // Act
  const result = subtotalCents(invoice);
  // Assert
  assert.equal(result, 2505);
});
```
~~~

Run it. It passes. Read the sections in order. Most of a test is usually arrange, and that is normal. The act is a single line, and the assert is the one line that says whether the claim held.

---
