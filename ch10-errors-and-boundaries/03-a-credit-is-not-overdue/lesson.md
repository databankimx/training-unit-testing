# A Credit Is Not Overdue

An invoice can be paid more than it costs. The library allows this: if a customer pays 3000 cents on an invoice of 2712 cents, the balance is minus 288 cents. That negative number is a credit. The customer is owed money back, not the other way round.

The test in the starter is about that case. The invoice is paid above its total, and today is 14 November, well after the due date. The claim is "an overpaid invoice is not overdue," which is about whether money is still owed. A credit is not a debt, so the answer should not be yes.

The starter's last line has a placeholder, `None` in Python, `null` in JavaScript, and `Is.Null` in C#. Run the test first. It fails, and the message shows what the library returned. Then work out what the claim says, and replace the placeholder with the correct value.

Two things to check before you change it. First, the library's answer is what you are testing, so do not change the library. Second, do not guess from the failure message. The message shows what the library returned, but the claim decides what it should return.

> **Common mistake.** Copying the library's answer into the test without checking it against the claim. If the library returned yes, the test would expose a bug, and the right fix would be to the library, not the test. This claim is easier, because the library already gives the answer the claim requires.

This is homework. Make the change yourself, then Run. Press Show solution (spoiler) only after you have tried it. The solution is the same test with the correct value.

---
