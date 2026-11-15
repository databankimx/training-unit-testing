# Summary: Fixtures and Builders

A fixture is the data a test starts from. A shared fixture can change between tests, and a builder gives each test a fresh one.

## What you learned

- A shared fixture is data that several tests use. If one test changes it, the others see the change.
- A test that passes alone can fail after another test has run. The failure can point at a test that did nothing wrong.
- A builder is a helper with defaults. It makes a fresh fixture on every call.
- An override changes one default. A test sets only the field it is about.
- The shared thing is often a list or an object, even when the invoice itself is immutable.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
Why did `the full balance is owed` fail in the shared-fixture step?
○ Because the library returned the wrong answer for an invoice with no payments.
→ The library gives 2712 for that invoice when it gets no payments. The problem is what the test was given.
◉ Because an earlier test had added a payment to the shared list, and this test read it.
→ Right. The shared list kept the payment, so this test's invoice had one.
○ Because the test has a typing error in its expected value.
→ The expected value is right. The list it reads from was changed by another test.
```

```quiz
Why does a builder give each test its own payments?
○ Because the library cannot handle more than one invoice at a time.
→ The library handles many invoices. The builder's job is to avoid sharing data.
◉ Because each call builds a new payments value, so one test cannot leave data behind for another.
→ Right. A fresh value on each call means no test can change what another test sees.
○ Because the builder runs the tests in a random order.
→ Test order is not random here. The builder keeps the data separate, whatever the order.
```

```quiz
A test about payments needs a different amount paid. What should it set?
◉ Only the payments override, and leave the rest of the invoice to the defaults.
→ Right. The override changes the field the test is about, so the test stays short and clear.
○ The whole invoice, so the test shows everything it uses.
→ The whole invoice repeats the defaults, which makes the test longer and easier to get wrong.
○ The defaults in the builder, so every test sees the new amount.
→ That would change every test, which is the shared-fixture problem again.
```

---
