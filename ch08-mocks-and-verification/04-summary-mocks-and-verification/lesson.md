# Summary: Mocks and Verification

A mock records the calls made to it. Use one at a boundary, where the library talks to the outside world, and check the calls only when the calls are the claim.

## What you learned

- A mock records each call, so a test can check how many there were and what they carried.
- The sender is a boundary. A test of the reminders checks the calls it receives.
- A count returned by the service can pass even when nothing was sent. The calls are what actually left.
- A check that no call was made is as important as a check that one was.
- A mock that is never called makes a check for a call fail. That failure is a result, not a fault in the test.
- The clock, the repository and the sender are boundaries. The rules in the invoice code are never mocked.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
The service returns a count of 2, but the sender recorded no calls. Which check would catch that?
○ Checking that the count is 2.
→ The count is the service's own tally, so it would still say 2. That check cannot see the problem.
◉ Checking the calls the mock sender received.
→ Right. The calls are what actually left the library, so a mock records what the count cannot show.
○ Checking that the clock returns the right date.
→ The clock is not involved in whether a reminder was sent. Check the calls.
```

```quiz
A paid invoice should cause no reminder. Which check states that claim?
○ assert_called_once, with the invoice's address.
→ That check says a reminder was sent. The claim is the opposite.
◉ A check that the sender was not called.
→ Right. The claim is "no call", so the check says no call.
○ A check that the balance is zero.
→ The balance is part of the rule, but the claim is about the sender.
```

```quiz
Why does the library not mock the rule for whether an invoice is overdue?
○ Because the rule is too slow to run in a test.
→ The rule runs quickly. Speed is not the reason.
◉ Because the rule is part of the code under test, and mocking it would test nothing real.
→ Right. Only the boundary, the outside world, is mocked. The rule is the thing the test is about.
○ Because mocks cannot take dates.
→ A mock can take any argument. The rule is simply not a boundary.
```

---
