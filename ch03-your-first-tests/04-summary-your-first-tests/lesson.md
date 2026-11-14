# Summary: Your First Tests

A test has three sections: arrange the fixture, act with one call, and assert the claim. The expected value in the assert is worked out from the claim and by hand, and written into the test before the code runs.

## What you learned

- Every test has three sections: arrange, act and assert. They are the four parts of a test from the last chapter, in the order you write them.
- You wrote the expected values for the subtotal, tax and total of INV-1002 from your own calculations.
- A test whose expected value is copied from the program passes on a broken library, because both sides of the comparison come from the same broken code.
- When your hand calculation and the program disagree, the test has done its job. Find out which one is wrong before you change either.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
In a test, which section calls the code under test?
○ Arrange, because it sets up the invoice the code will use.
→ Arrange builds the data. The call under test is elsewhere.
◉ Act, because it makes the one call that does the work.
→ Right. Arrange sets up the data, act makes the call, and assert checks the result.
○ Assert, because it runs the code and compares the answer.
→ Assert compares the result with the claim. It does not make the call.
```

```quiz
A test copies its expected value from the program. Why does it still pass when the library is broken?
○ The runner ignores expected values that come from the program.
→ The runner compares the values as written. Nothing special is done with them.
◉ Both sides of the comparison come from the same broken code, so they agree.
→ Right. The test never states what the answer should be.
○ The test is too short to notice a change in the rounding.
→ Length has nothing to do with it. The expected value came from the program itself.
```

```quiz
You work out the tax by hand as 207 cents, and the program says 206. What should you do first?
◉ Find out which one is wrong, by checking the rule against your calculation, before you change either.
→ Right. The hand calculation comes from the rule, so it is evidence the program may be wrong.
○ Change the expected value to 206, so the test passes.
→ That turns the test into a copy of the program, which is the mistake this chapter warns about.
○ Delete the test, because the two numbers disagree.
→ A disagreement is exactly what the test is for. It should not be deleted.
```

---
