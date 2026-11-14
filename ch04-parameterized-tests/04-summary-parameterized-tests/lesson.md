# Summary: Parameterized Tests

Put the cases in a table, and write the test body once. Each row is one case, with its own name, inputs and expected answer.

## What you learned

- Copying a test for each case repeats the arrange, act and assert, so a change to the body has to be made many times.
- A parameterized test runs one body once for each row of a table.
- The boundary cases are the useful ones: exactly half a cent, and just either side of it.
- The name on each row is what tells you which case failed.
- The rounding line adds half of 10000 before the division. Without it, every fraction rounds down.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
You want to add a case for 1000 cents at 50 basis points. What is the smallest change?
○ Copy one of the three tests and change the numbers.
→ That works, but now the body is copied a fourth time. The table is the better place for it.
◉ Add one row to the table, with a name, the subtotal, the rate and the expected tax.
→ Right. The body does not change, and the new row runs with it.
○ Change the body so it handles any number.
→ The body should not change for each case. The table holds the cases, and the body checks them.
```

```quiz
A table row fails in the report. What tells you which case broke?
◉ The name on the row, such as "above-half-cent".
→ Right. The name is the label that you wrote for the case, so a failure points at it.
○ The position of the row in the table.
→ Position is hard to read and changes when rows are added. The name is the label that stays put.
○ The library, because it always fails first.
→ The library is not named in the failure. The row name tells you which case broke.
```

```quiz
Why does the table include a case of exactly half a cent?
○ Because it is the largest tax the library can return.
→ The largest tax depends on the invoice, not on the rounding rule.
◉ Because it is where a rounding bug shows, since rounding down and rounding up give different answers.
→ Right. A case on the boundary catches a rounding change that a case far from it would miss.
○ Because the library cannot handle that number.
→ The library handles it. The case is there because it tests the rule at its edge.
```

---
