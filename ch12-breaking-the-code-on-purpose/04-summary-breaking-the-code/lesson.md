# Summary: Breaking the Code on Purpose

To learn what a test protects, break the rule it claims to check, and see which test turns red.

## What you learned

- A mutant is a copy of the library with one deliberate change.
- Each rule needs a test for each case the change could alter, and a single case rarely covers both sides.
- The paid invoice test and the due date test catch different mutants. Neither one alone catches both.
- A coverage report counts lines that ran. It does not say whether a test checked the result.
- A covered line with no assertion stays green when its rule breaks.
- Use mutants to answer the question coverage cannot: would a test notice if this rule were wrong?

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
You change the due date check to on-or-after, and only one of three tests turns red. What does that tell you?
○ The other two tests are wrong, and should be deleted.
→ The other tests check different claims. Their green results are correct.
◉ Only one test checks the due date edge, so only that one can catch the change.
→ Right. A rule is protected only by the cases its tests reach.
○ The change was too small to matter.
→ A change to the due date decides which invoices are reminded. It matters.
```

```quiz
A coverage report shows a line as covered. Which claim does that support?
○ The line's result is checked by a test.
→ Coverage does not know what the tests checked. It counts lines that ran.
◉ A test ran the line.
→ Right. That is all coverage can say about a covered line.
○ The line is correct.
→ A line can run and still compute the wrong value.
```

```quiz
Why does a mutant that changes a rule matter more than a coverage number?
○ Because mutants run faster than coverage tools.
→ Speed is not the reason.
◉ Because a mutant asks directly whether a broken rule would be caught.
→ Right. It answers the question a coverage number cannot.
○ Because mutants replace the tests.
→ Mutants are changes to the library, used to test the tests. They replace nothing.
```

---
