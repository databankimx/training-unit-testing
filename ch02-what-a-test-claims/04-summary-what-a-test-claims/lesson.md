# Summary: What a Test Claims

A test is a claim with a check attached. The name and the comment say what should be true, the fixture and the action set up and run the check, and the assertion decides. A test is only as strong as its assertion.

## What you learned

- Every test has four parts: a claim, a fixture, an action, and an assertion.
- A test's name can promise more than its assertion checks. Read the last line as well as the name.
- A test that passes against a broken library is not checking the rule it claims. The copy of the library shows that.
- A test with no assertion passes every time, so a green result from it is not evidence.
- Adding the assertion, with its expected value written from the claim, is what turns a test into a check.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
A test is named "tax on INV-1002 is correct", and its only assertion is that the tax is not negative. Which part is too weak?
○ The fixture, because the invoice is built with the wrong data.
→ The fixture is the right invoice. The problem is the assertion, which does not check the claim.
◉ The assertion, because it accepts any non-negative tax, not the 207 cents the name promises.
→ Right. The truncated 206 cents passes it too.
○ The action, because it calls the library instead of checking it.
→ The action is the call that a test should make. The assertion is what checks the claim.
```

```quiz
Why is a test with no assertion a problem?
○ It is slow, because the runner waits for it to finish.
→ It runs quickly. The problem is what it cannot detect.
◉ It passes every time, so a green result says nothing about the claim.
→ Right. Nothing in it can fail, so its pass is not evidence.
○ It stops the other tests from running.
→ Each test runs on its own, so one without an assertion does not block the rest.
```

```quiz
Which part of a test says what should be true?
◉ The claim, which is written in the name and in the comment above the fixture.
→ Right. The fixture, action and assertion exist to check it.
○ The fixture, because it holds the numbers.
→ The fixture holds the data. The claim says what those numbers should prove.
○ The action, because it does the work.
→ The action produces a result. The claim is what the result is judged against.
```

---
