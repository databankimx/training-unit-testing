# One Table of Cases

Instead of copying a test for each case, you write the test body once and keep the cases in a table beside it. The test runner then runs the body once for each row. This is called a parameterized test, and every framework in this tutorial has a way to do it.

Each row has four things, and each one has a column in the table:

| Column | What it holds | Example row |
| --- | --- | --- |
| Name | A short label, so a failure says which case broke | `invoice-1002` |
| Subtotal | The subtotal in cents, put into one line of the invoice | 2505 |
| Rate | The tax rate in basis points | 825 |
| Expected | The tax the claim says is right, in cents | 207 |

Every row in this step uses the same body. Here is the table with one row, written in each language. The `TestCase` line is C#, the tuple is Python, and the object is JavaScript:

~~~examples readonly
```csharp
[TestCase(2505, 825, 207, TestName = "invoice-1002")]
```
```python
(2505, 825, 207),
```
```javascript
{ name: 'invoice-1002', subtotal: 2505, rate: 825, expected: 207 },
```
~~~

The runner reads each row, and the body runs with that row's numbers. The body has the same three sections as before. Read it with a row in mind:

~~~examples readonly
```csharp
var invoice = new Invoice(...);
var result = Invoices.TaxCents(invoice);
Assert.That(result, Is.EqualTo(expected));
```
```python
invoice = Invoice(...)
result = tax_cents(invoice)
assert result == expected
```
```javascript
const invoice = { ... };
const result = taxCents(invoice);
assert.equal(result, c.expected);
```
~~~

The body does not change from row to row. Only the subtotal, the rate and the expected number change, and those come from the table.

## Your job

The file in the editor has four rows. The last row, `invoice-1002`, is already done, and it matches the 207 cents from chapter 3. The other three are the boundary cases from the last step, and each has a placeholder where the expected tax goes: `None` in Python, `null` in JavaScript, and `-1` in C#. A tax can never be `-1`, so these three fail until you replace the placeholders.

Work each one out on paper, using the rule from chapter 1. Tax is the subtotal times the rate, in basis points, divided by 10000, and rounded half up.

1. **1000 cents at 25 basis points.** That is 2.5 cents. Exactly half rounds up.
2. **1000 cents at 24 basis points.** That is 2.4 cents. Below half rounds down.
3. **1000 cents at 26 basis points.** That is 2.6 cents. Above half rounds up.

Replace each placeholder with your number, and Run. All four rows pass.

> **Common mistake.** Running the test, copying the number that fails, and pasting it into the table. The test will pass, and it will prove nothing. Work the numbers out first, from the rule.

This is homework. Work the three numbers out on paper, type them in, and Run. Press Show solution (spoiler) only after you've tried it. The solution is the same file with the three numbers filled in.

---
