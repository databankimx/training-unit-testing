# Keep the Claim

The test in the starter has one line that is not part of the claim: the clock is read exactly twice. Someone guessed that the service should read the clock once per invoice. Run the test. It fails, and the message says the clock was read once, not twice.

Read that failure carefully, because it is the whole lesson. The failure says the code and the guess disagree. It does not say the reminders are wrong. The first two checks in the test pass: the count is two, and two calls reached the sender.

Now ask the question from the last step. Does the claim, "two overdue invoices get two reminders," say anything about how many times the clock was read? It does not. So the line does not belong to the claim, and the fix is to remove it. Changing the 2 to a 1 would be another guess that checks plumbing. Delete the line.

Here is the failure you will see, in each language:

> The clock was read 1 time. The test expected 2. The count of reminders was not checked by that line, so the reminders themselves are still right.

> **Common mistake.** Changing the number to match the failure. A check that says "read once" is still a check on plumbing, and it breaks the next time the service is refactored. Remove the line, and keep the checks that name the claim.

This is homework. Make the change yourself, then Run. Press Show solution (spoiler) only after you have tried it. The solution is the same test with the clock check removed.

---
