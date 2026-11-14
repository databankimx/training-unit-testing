# Summary: Test-Driven Development

Write the test first, watch it fail, write the smallest code that passes, then tidy the code with the tests green.

## What you learned

- A red test is a result you need. It shows the test can tell a wrong answer from a right one.
- A test that passes before any code exists proves little about the code. Look for the case where the stub is wrong.
- The smallest code is the code the tests ask for. Anything else is untested.
- A refactor is safe when the tests were green before it and stay green after it.
- If a test goes red during a refactor, the refactor changed the behaviour, so undo it.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
A new test passes the first time you run it, against code you have just written. What does that tell you?
○ That the code is correct for every case.
→ The test checks one case. Other cases may still be wrong.
◉ Very little, because you never saw it fail.
→ Right. A test that has never failed has not yet shown that it can catch a mistake.
○ That the test is wrong, and should be deleted.
→ A passing test is not wrong. It just needs a failing run before it can be trusted.
```

```quiz
Why write only the code the tests ask for?
○ Because extra code makes the tests slower.
→ Speed is not the reason. Extra code is what the tests do not check.
◉ Because anything the tests do not ask for is untested, so it can be wrong without anyone noticing.
→ Right. The tests are the only specification, so code beyond them has no check.
○ Because the library reviewer rejects longer code.
→ Review is not the reason. The tests are what decide whether code is right.
```

```quiz
You refactor the late fee, and one test goes red. What should you do?
○ Change the test so it passes with the new code.
→ That hides the change. The test was green before the refactor, so the refactor changed behaviour.
◉ Undo the last change and try again.
→ Right. A refactor must keep every test green, so a red test means the change went wrong.
○ Leave it red until the end of the chapter.
→ A red test in the middle of a refactor is a clear signal to stop and undo, not to wait.
```

---
