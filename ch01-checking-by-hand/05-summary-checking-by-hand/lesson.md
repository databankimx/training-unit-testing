# Summary: Checking by Hand

Running a program and reading its output is a useful first check, and most people stop there. This chapter showed where that check runs out.

## What you learned

- A check written in main prints PASS or FAIL. When it fails, the program still finishes with exit code 0, so the failure is seen only by someone who reads the output.
- A check by eye can pass for the wrong reason. On INV-1001, the real rounding and the broken truncation both give 206, so the check could not tell them apart.
- The second invoice, INV-1002, has a fraction of a cent above half, and that is where the two rules differ. The inputs you choose decide what your check can see.
- A manual check falls short in three ways. It is not repeated exactly, it is skipped when nobody remembers it, and it keeps no expected answer.
- A test writes down the input, the expected answer, and the comparison. The computer then repeats the check every time the code changes.
- A test earns its place by failing when the rule breaks. Put the `+ 5000` back and it passes. Take it out and it fails, and that failure is the evidence.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
Both the real rule and the truncated rule give 206 for INV-1001. Why did the check by eye on that invoice pass for both?
○ The truncated rule is correct for every invoice, so the two agree everywhere.
→ It is wrong for INV-1002, where the two rules give different answers.
◉ The fraction on INV-1001 is a quarter of a cent, which is below half, so truncating and rounding give the same whole cent.
→ Right. The check only tested an invoice where the bug does not show.
○ The library ignores the fraction, so there was nothing to round.
→ The library does round, and the fraction was there to be rounded.
```

```quiz
What does a test add that a manual check does not?
○ It runs faster, and that is the only difference.
→ Speed is a side effect. The difference is in what the check keeps and when it runs.
◉ It keeps the expected answer, and it runs again every time the code changes.
→ Right. A manual check relies on someone remembering the number and the habit of running it.
○ It finds bugs a manual check cannot find, because the computer is always right.
→ A test is only as good as its expected answer. A wrong expected value passes for a wrong result.
```

```quiz
Which invoice would catch the truncated rule?
○ INV-1001, the invoice from the previous chapter, because its numbers are the most familiar.
→ Both rules give 206 for it, so it cannot tell them apart.
◉ INV-1002, three widgets at 8.35, where the subtotal is 2505 cents.
→ Right. The tax is 206.66 cents, which rounds to 207 with half up and truncates to 206.
○ Any invoice with a tax rate above 5 percent.
→ The rate is not the problem. The fraction of a cent decides whether the two rules differ.
```

---
