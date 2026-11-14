# Summary: Introduction

That is the setup. You now know what the tutorial is for and which library it follows.

## What you learned

- A test is worth its place only if it can fail for the right reason. The whole tutorial is built on that claim.
- The library has three parts: the data, the calculations, and a reminder service that depends on a clock, a store, and a sender.
- Money is whole cents and dates are `YYYY-MM-DD` text, so the three languages cannot disagree about rounding or time zones.
- An invoice with two widgets at 12.50, taxed at 8.25 percent, has a subtotal of 2500 cents, a tax of 206 cents, and a total of 2706 cents. Those expected values come from working the rules out by hand.
- The same invoice has the same names and the same answers in each language. The tests use the same test names in each language too.

## Quizzes

Three questions, one for each big idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
Two languages' test files use different names for the same claim. What does that break?
○ Nothing. The names only matter to the person who wrote the test.
→ The names are how a learner compares the tabs. If they differ, the claims look different.
◉ A learner comparing the tabs can no longer see that the claims match.
→ Right. The same name in each tab tells you the three ports are checked against the same rule.
○ The test framework, which needs unique names across languages.
→ Each framework checks names within its own language only. The problem is for the reader.
```

```quiz
The tax on 2500 cents at 825 basis points is 206.25 cents. What does the library return?
○ 206.25
→ The library works in whole cents, so a fraction of a cent is never returned.
◉ 206
→ Right. Tax is rounded half up to the cent, and 0.25 of a cent rounds down.
○ 207
→ That would be right only if any fraction of a cent rounded up. Half up rounds to the nearest cent, so 0.25 rounds down.
```

```quiz
Where does the late fee come from in this tutorial?
○ It is already in the library, and the tests check it.
→ The library has only a stub for the late fee, which always returns 0, so the tests can be written first.
◉ The learner writes the late fee test first, then the code, in the test-driven development chapter.
→ Right. Writing the test before the code is how the tutorial shows that a test can fail.
○ It comes from a separate library that the tutorial installs.
→ No such library exists. The late fee is written in the tutorial, test first.
```

---
