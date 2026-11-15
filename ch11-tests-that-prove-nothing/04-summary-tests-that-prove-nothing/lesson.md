# Summary: Tests That Prove Nothing

A test is only useful when a broken program could make it fail. Each of the patterns in this chapter passes whatever the program does, so each one is a test in name only.

## What you learned

- A test with no assertion checks nothing. It passes unless the code throws.
- A tautology compares a thing with itself, so it is always true.
- An expected value taken from the code under test copies the rule, and a wrong rule passes with its own answer.
- A swallowed failure hides the assertion error, so the test always passes.
- A test of the stub checks the double, not the program.
- A not-null check passes for any answer, so it is only a first check.
- Break the library on purpose, in a copy, to see which tests can fail.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
A test computes its expected value by calling the function it tests. Why is that a problem?
○ It is slow, because the function runs twice.
→ Speed is not the problem. The problem is what the expected value means.
◉ The expected value comes from the rule under test, so a wrong rule passes with its own answer.
→ Right. The expected value should come from a worked example, not from the code.
○ It breaks the rule that tests should not use numbers.
→ Tests use numbers all the time. The problem is where this one comes from.
```

```quiz
A test catches an assertion error and does nothing. What does it prove?
○ That the function returns the right answer.
→ The failure is hidden, so the test cannot show the answer is right.
◉ Nothing. It passes whatever the function returns.
→ Right. A swallowed failure can never turn the test red.
○ That the assertion is correct.
→ The assertion is never allowed to fail, so it proves nothing about itself.
```

```quiz
You break the tax rule in a copy of the library, and four tests stay green. What should you conclude?
○ The library still works, so the tests are good.
→ The rule is broken, and the tests did not notice. That is the problem.
◉ At least some of those tests cannot fail, so they prove nothing about the rule.
→ Right. A test that stays green against a broken rule is not checking the rule.
○ The break was too small to matter.
→ The rounding is part of the claim, so a change to it is a real change.
```

---
