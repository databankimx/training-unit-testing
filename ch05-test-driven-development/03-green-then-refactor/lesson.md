# Green, Then Refactor

The test file has three tests, and two of them fail against the stub. Your job is to write the code that makes them pass, and then to tidy it. You will edit the library in a copy. The copy is the one the runner makes for this step, and the library in `samples/` is never touched.

The stub is marked in the copy with a comment on its `return 0` line.

## Green: the smallest code that passes

Write the smallest code that makes all three tests pass. It does not have to be elegant yet. Here is what it needs to do, in the order the rule gives it:

1. If the invoice is not overdue, return 0. Use the same test the library already has for overdue, written out as a condition on the due date and the balance.
2. Otherwise, work out 2 percent of the balance, with the rounding: the balance times 200, plus 5000, divided by 10000.
3. Return the larger of 500 and that 2 percent amount.

Those three lines are all the rule needs. Use the names that exist in the library, such as `balance_due_cents` in Python, `balanceDueCents` in JavaScript and `BalanceDueCents` in C#.

Run the tests. All three should pass. That is green.

> **Why the smallest code?** The tests are the only specification you have. Anything the code does beyond what they ask for is untested, which means it can be wrong without anyone noticing.

## Refactor: tidy with the tests green

The rule for "overdue" is already in the library, as `is_overdue`, `isOverdue` and `IsOverdue`. Your green code probably repeats its test. Replace the repeated test with a call to the existing function. The code now says what it means, and the rule for "overdue" lives in one place.

Run the tests again. They should still pass. A refactor is safe because the tests were green before you started, and they tell you at once if the refactor changed the answer.

If a test goes red during the refactor, the refactor changed what the code does. Undo the last change, and try again.

This is homework. Write the smallest code, Run, refactor, and Run again. Press Show solution (spoiler) only after you've tried it. The solution is the whole library file with the late fee finished and tidied.

---
