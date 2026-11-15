# Framework Cheat Sheet

Each section shows one job in all three languages. The examples use the same invoice library as the rest of the course, so you can paste them next to the tests you have already written.

## Declare a test

A test is a method that takes no arguments and makes one claim. Each framework needs a marker so the runner finds it.

~~~examples readonly
```csharp
[Test]
public void Empty_invoice_has_zero_total()
{
    var invoice = new Invoice("INV-1", "Acme", "ap@acme.example.invalid", "2026-12-01",
        0, Array.Empty<InvoiceLine>(), Array.Empty<long>());
    Assert.That(Invoices.SubtotalCents(invoice), Is.EqualTo(0));
}
```
```python
def test_empty_invoice_has_zero_total():
    invoice = Invoice("INV-1", "Acme", "ap@acme.example.invalid", "2026-12-01", 0, ())
    assert subtotal_cents(invoice) == 0
```
```javascript
test('empty invoice has zero total', () => {
  const invoice = {
    id: 'INV-1', customerName: 'Acme', customerEmail: 'ap@acme.example.invalid',
    dueDate: '2026-12-01', taxRateBasisPoints: 0, lines: [], paymentsCents: [],
  };
  assert.equal(subtotalCents(invoice), 0);
});
```
~~~

## Parameterize a test

Write the body once, and give each row a name. The name is what shows in the report when a row fails.

~~~examples readonly
```csharp
[TestCase(1000, 25, 3, TestName = "half-cent-rounds-up")]
[TestCase(1000, 24, 2, TestName = "below-half-cent")]
public void Tax_rounds_half_up(long subtotal, int rate, long expected)
{
    // Build the invoice from subtotal and rate, as in the test above.
    Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(expected));
}
```
```python
@pytest.mark.parametrize(
    "subtotal, rate, expected",
    [(1000, 25, 3), (1000, 24, 2)],
    ids=["half-cent-rounds-up", "below-half-cent"],
)
def test_tax_rounds_half_up(subtotal, rate, expected):
    invoice = Invoice("INV-1", "Acme", "ap@acme.example.invalid", "2026-12-01",
                      rate, (InvoiceLine("Item", 1, subtotal),))
    assert tax_cents(invoice) == expected
```
```javascript
const cases = [
  { name: 'half-cent-rounds-up', subtotal: 1000, rate: 25, expected: 3 },
  { name: 'below-half-cent', subtotal: 1000, rate: 24, expected: 2 },
];
for (const c of cases) {
  test(`tax rounds half up: ${c.name}`, () => {
    const invoice = {
      id: 'INV-1', customerName: 'Acme', customerEmail: 'ap@acme.example.invalid',
      dueDate: '2026-12-01', taxRateBasisPoints: c.rate,
      lines: [{ description: 'Item', quantity: 1, unitPriceCents: c.subtotal }],
      paymentsCents: [],
    };
    assert.equal(taxCents(invoice), c.expected);
  });
}
```
~~~

node:test has no parameter table, so a loop over an array of cases does the job. Each case becomes its own test in the report.

## Share setup between tests

When several tests need the same invoice, put its creation in one place. Build a fresh one for each test, so no test changes what another one sees.

~~~examples readonly
```csharp
[TestFixture]
public class InvoiceTests
{
    private Invoice _invoice = null!;

    [SetUp]
    public void SetUp()
    {
        _invoice = new Invoice("INV-1", "Acme", "ap@acme.example.invalid", "2026-12-01",
            0, new[] { new InvoiceLine("Item", 2, 500) }, Array.Empty<long>());
    }

    [Test]
    public void Subtotal_is_quantity_times_price()
    {
        Assert.That(Invoices.SubtotalCents(_invoice), Is.EqualTo(1000));
    }
}
```
```python
@pytest.fixture
def invoice():
    return Invoice("INV-1", "Acme", "ap@acme.example.invalid", "2026-12-01",
                   0, (InvoiceLine("Item", 2, 500),))

def test_subtotal_is_quantity_times_price(invoice):
    assert subtotal_cents(invoice) == 1000
```
```javascript
import { describe, it, beforeEach } from 'node:test';

describe('invoice', () => {
  let invoice;

  beforeEach(() => {
    invoice = {
      id: 'INV-1', customerName: 'Acme', customerEmail: 'ap@acme.example.invalid',
      dueDate: '2026-12-01', taxRateBasisPoints: 0,
      lines: [{ description: 'Item', quantity: 2, unitPriceCents: 500 }],
      paymentsCents: [],
    };
  });

  it('subtotal is quantity times price', () => {
    assert.equal(subtotalCents(invoice), 1000);
  });
});
```
~~~

In C#, `[SetUp]` runs before each test in the fixture. In pytest, a fixture is passed in by its parameter name. In node:test, `beforeEach` runs before each test in its `describe` block.

## Check calls on a mock

A mock records the calls made to it. The test sets it up, runs the code under test, and then checks the record. The `// Act` line below stands for your code under test, which receives the mock.

~~~examples readonly
```csharp
var sender = Substitute.For<IReminderSender>();
// Act: run the code under test with sender
sender.Received(1).Send("bob.diaz@example.invalid", "INV-1002", 2712);
```
```python
sender = Mock()
# Act: run the code under test with sender
sender.send.assert_called_once_with("bob.diaz@example.invalid", "INV-1002", 2712)
```
```javascript
const send = mock.fn();
// Act: run the code under test with send
assert.equal(send.mock.callCount(), 1);
assert.deepEqual(send.mock.calls[0].arguments, ['bob.diaz@example.invalid', 'INV-1002', 2712]);
```
~~~

To check that nothing was sent, use `DidNotReceive()` in NSubstitute, `assert_not_called()` in Mock, and `assert.equal(send.mock.callCount(), 0)` in node:test. Check the calls only when the claim is about the calls. This is the rule from chapter 8.

## Expect an exception

Write the call inside the framework's check. The test passes only if the right exception type is thrown.

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

Name the exception the claim is about. A check that catches a generic base type passes for the wrong reason, and that is the failure from chapter 11.

## Run the tests

| Framework | Command | What the course runner reads |
| --- | --- | --- |
| NUnit (C#) | `dotnet test` | TRX report |
| pytest (Python) | `pytest -v` | JUnit XML |
| node:test (JavaScript) | `node --test` | TAP |

## Notes across frameworks

- In pytest, a test function's name must start with `test_`, or pytest will not collect it.
- In node:test, `test` and `it` are the same function. Use whichever reads better in your suite.
- In NUnit, `[TestCase]` rows and `[Test]` methods appear in the report by name. Give rows a `TestName` so a failure is easy to find.
- Each framework has its own mock library. NSubstitute is the C# one used here, `unittest.mock` is the Python one, and `mock.fn()` from `node:test` is the JavaScript one. The checks look different, but each one asks the same question: what was called, and with what.
