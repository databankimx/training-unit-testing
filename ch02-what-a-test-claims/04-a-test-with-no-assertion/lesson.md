# A Test With No Assertion

Dana inherited a test for empty invoices. It has been green in the build for a year, and the team counts it as coverage. Look closer. It builds an invoice, calls the tax function, and then stops. If the tax on an empty invoice went wrong tomorrow, this test would still pass, and the build would stay green.

Your job is to make the test able to notice.

The test file for this step has a claim, a fixture and an action. It has no assertion. The claim is that an invoice with no lines owes no tax, which is true of the library.

Run it. It passes. It always passes, because nothing in it can fail. A test with no assertion never checks the claim, and it looks just as green in the results as a test that does. Notice how often a green result has been the whole of your evidence.

Your job is to add the assertion. Replace the bare call on the last line with a comparison of the tax against 0:

- C#: `Assert.That(Invoices.TaxCents(invoice), Is.EqualTo(0));`
- Python: `assert tax_cents(invoice) == 0`
- JavaScript: `assert.equal(taxCents(invoice), 0);`

Run the test. It passes, and this time the pass means something. If the tax on an empty invoice were one cent, the assertion would fail. Notice that you did not change the library. You changed the test, so that it can now tell you something.

> **Aside: the claim comes first.** You wrote the expected value from the claim, not by copying what the library returned. A test written the other way round would still pass after the library was wrong.

This is homework. Write the assertion yourself, and Run. Press Show solution (spoiler) only after you've tried it. The solution is the same test with the assertion added.

---
