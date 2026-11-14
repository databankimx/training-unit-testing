# The Next Test

The first two tests check the small cases: no fee before the due date, and the minimum fee on a small balance. The rule has one more part to check. When 2 percent of the balance is bigger than the minimum, the fee should be 2 percent.

A balance of 50000 cents is big enough. Two percent of 50000 is 1000 cents, which is more than 500, so the fee is 1000. Work it out by hand before you look at any code. The invoice in the test has one line of 50000 cents and no tax, so the balance is 50000.

Here is the arithmetic in full. Two percent is 200 basis points. So 50000 times 200, plus 5000 for the rounding, divided by 10000, is 1000. The minimum does not apply, because 1000 is above 500.

The test file for this step has the first two tests, which you have already seen. It also has a third test, for the 2 percent case. Its arrange section builds the invoice with the 50000 line, its act asks for the fee on 14 November, and its assert has a placeholder where the expected fee goes. The placeholder is `None` in Python, `null` in JavaScript, and `-1` in C#. A fee can never be `-1`, so the test fails until you replace it.

Your job is to replace the placeholder with the fee you worked out by hand, from the rule. Then Run.

Run it. You should see two failures and one pass:

- The first test passes, as before.
- The minimum-fee test fails, as before. The stub still returns 0.
- Your new test fails. The stub returns 0, and you expect 1000.

Two reds is the right result here. Both failing tests need code that the stub does not have. You will write that code in the next step.

> **Common mistake.** Running the library to find out what it returns, then pasting that number into the test. The test would then pass against the stub's answer only when the library is right, which is the exact trap chapter 2 warned about. Work the fee out from the rule first.

This is homework. Write the expected fee yourself, and Run. Press Show solution (spoiler) only after you've tried it. The solution is the same test file with the placeholder replaced by 1000.

---
