# Summary: Choosing What to Mock

Each dependency gets the double that matches what the test needs from it. Data gets a fake or a stub. A call gets checked only when the call is the claim.

## What you learned

- A fake holds data, so a test can use it as real data. A stub gives fixed answers. A mock records calls.
- Mock the boundaries: the clock, the repository and the sender. Never mock the rules.
- Check a mock's calls only when they are the claim, such as one reminder per overdue invoice.
- A check on how many times a stub was read is plumbing. It breaks when the inside is refactored, even when the outside is right.
- A failure from a plumbing check tells you the code changed. It does not tell you the claim is wrong, so read it against the claim before changing anything.
- When in doubt, ask whether the test would still be right if the inside were rewritten. If it would, the check is about the claim.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
A test checks that the clock was read exactly once. The claim is "an overdue invoice gets a reminder." What should you do with that check?
○ Keep it, because it makes the test stricter.
→ A stricter test that checks plumbing breaks when the inside changes, even when the reminders are right.
◉ Remove it, because the claim does not mention the clock.
→ Right. A check belongs in the test only when it states the claim.
○ Change it to check that the clock was read twice.
→ That replaces one guess with another. The claim still does not mention the clock.
```

```quiz
A service is refactored and the reminders stay the same, but one test fails on a call count. What does that tell you?
○ The refactor broke a rule, so the refactor must be undone.
→ The reminders did not change. The test is checking plumbing.
◉ The test is checking how the code works inside, not what it does.
→ Right. Over-specified tests fail on refactors that leave the behaviour alone.
○ The clock double is wrong, so replace it with a mock.
→ The clock is a stub. The problem is the check, not the double.
```

```quiz
Why does the library not mock the rule for whether an invoice is overdue?
○ Because the rule runs too slowly to use in a test.
→ The rule runs quickly. Speed is not the reason.
◉ Because the rule is part of the code under test, and mocking it would test nothing real.
→ Right. Only the boundary, the outside world, is mocked. The rule is the thing the test is about.
○ Because a mock cannot take dates.
→ A mock can take any argument. The rule is simply not a boundary.
```

---
