# Summary: Errors and Boundaries

Rules are most often wrong at their edges. A test should name the exact edge, and check the exact kind of refusal when the library refuses something.

## What you learned

- Test the exact due date, the day after it, and a fully paid invoice. Together they pin the boundary.
- A test with a clear case, such as a month past due, passes even when the edge is broken.
- Check the type of error when the claim is about a refusal. A check that accepts any error passes for the wrong reason.
- Use a date in the wrong shape as well as an impossible date. The format and the calendar are separate claims.
- A credit is a negative balance, and it is not overdue. Work out the claim before you read the library's answer.
- Pure rules like these need no doubles. The test calls the rule directly.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
A rule changes from "after the due date" to "on or after the due date." Which test catches it?
○ A test that a month past due is overdue.
→ That passes both before and after the change, so it cannot catch it.
◉ A test that the invoice is not overdue on its due date.
→ Right. The edge is the exact due date, and that is the day the change moves.
○ A test that a paid invoice is not overdue.
→ That does not involve the due date at all.
```

```quiz
A test expects the library to refuse "2026-02-30". Which check states the claim?
○ A check that something was thrown.
→ That passes for any error, even one the library raised by accident.
◉ A check that a RangeError, ValueError or FormatException was thrown, depending on the language.
→ Right. The claim names the kind of refusal, so the check names that type.
○ A check that the function returns null.
→ The library refuses the date with an error. It does not return null.
```

```quiz
An invoice was paid 3000 cents against a total of 2712 cents. Is it overdue on 14 November?
○ Yes, because it is past its due date.
→ Past the due date is not enough. The claim is that money must still be owed.
◉ No, because the balance is a credit, not money owed.
→ Right. A negative balance is not overdue.
○ It depends on the library's answer, so the test should copy it.
→ The claim decides the answer. A test should not copy the result it is checking.
```

---
