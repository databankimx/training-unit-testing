# What an Assertion Can Check

An assertion asks one question about one value: does the result match the claim? Different claims ask different questions, so there are a few kinds of assertion. Pick the one whose words match the claim, and the test says what the claim says.

Here is the quick version. Find the words of the claim in the left column.

| The claim says | Use this assertion |
| --- | --- |
| "is 207" (one exact answer) | equal to |
| "is not zero" | not equal to |
| "is at least 0" or "is at most 1000" (a range) | at least, or at most |
| "is overdue" or "is not overdue" (yes or no) | true, or false |
| "is refused" or "throws an error" | throws |

Each kind has a short example below. The examples use the INV-1002 invoice from the last step, so you can read them as if they were in a test. They are read-only, and they show the line and nothing else.

## Equal to

Use equal when the claim names one exact answer. The comparison passes only if the result is exactly that value.

~~~examples readonly
```csharp
Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(207));
```
```python
assert tax_cents(invoice) == 207
```
```javascript
assert.equal(taxCents(invoice), 207);
```
~~~

Read it as "the tax is 207." Python uses `==`, JavaScript uses `assert.equal`, and C# uses `Is.EqualTo`.

## Not equal to

Use not equal when the claim says a value must be something other than one particular value. It does not tell you what the value is, only what it is not.

~~~examples readonly
```csharp
Assert.That(Invoices.BalanceDueCents(invoice), Is.Not.EqualTo(0));
```
```python
assert balance_due_cents(invoice) != 0
```
```javascript
assert.notEqual(balanceDueCents(invoice), 0);
```
~~~

The balance on this invoice is not zero, so the comparison passes. Python uses `!=`, JavaScript uses `assert.notEqual`, and C# uses `Is.Not.EqualTo`.

## At least, or at most

Use these when the claim gives a range rather than one answer. The first line checks the lower end, and the second checks the upper end.

~~~examples readonly
```csharp
Assert.That(Invoices.TaxCents(invoice), Is.GreaterThanOrEqualTo(0));
Assert.That(Invoices.TaxCents(invoice), Is.LessThanOrEqualTo(1000));
```
```python
assert tax_cents(invoice) >= 0
assert tax_cents(invoice) <= 1000
```
```javascript
assert.ok(taxCents(invoice) >= 0);
assert.ok(taxCents(invoice) <= 1000);
```
~~~

These are the weakest checks in this list, because many values pass them. A tax of 206 cents passes "at least 0" just as well as 207. Use an exact comparison when you know the exact answer. You will see why in the next step.

## True or false

Use true or false when the answer is a yes or a no. The first line checks that the invoice is overdue on the 14th, and the second checks that it is not overdue on the 31st of the previous month.

~~~examples readonly
```csharp
Assert.That(Invoices.IsOverdue(invoice, "2026-11-14"), Is.True);
Assert.That(Invoices.IsOverdue(invoice, "2026-10-31"), Is.False);
```
```python
assert is_overdue(invoice, "2026-11-14")
assert not is_overdue(invoice, "2026-10-31")
```
```javascript
assert.ok(isOverdue(invoice, '2026-11-14'));
assert.ok(!isOverdue(invoice, '2026-10-31'));
```
~~~

In Python, `not` turns a true into a false. In JavaScript, `!` does the same job. In C#, `Is.True` and `Is.False` say it directly.

## Throws an error

Use throws when the claim says that bad input is refused. The assertion passes when the call raises the named error, and fails when the call returns normally.

~~~examples readonly
```csharp
Assert.That(() => Dates.Parse("2026-13-01"), Throws.TypeOf<FormatException>());
```
```python
with pytest.raises(ValueError):
    parse_date("2026-13-01")
```
```javascript
assert.throws(() => parseDate('2026-13-01'), RangeError);
```
~~~

The date `2026-13-01` has no thirteenth month, so the parser refuses it. Python uses `pytest.raises`, so the test file must `import pytest` before it can use it. JavaScript uses `assert.throws`, and C# uses `Throws.TypeOf`. The error type matters only when the claim is about it. If the claim is "bad dates are refused," any error would do. If the claim is "bad dates raise a format error," the type is part of the claim.

## Null

Use null when the claim says a value must be missing. The library has no function that returns null, so you will meet this assertion in later chapters, when the code can return nothing.

---
