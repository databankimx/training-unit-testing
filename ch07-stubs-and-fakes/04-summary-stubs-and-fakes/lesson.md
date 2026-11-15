# Summary: Stubs and Fakes

A test replaces the outside world with a double, and the double gives the test control over the answer.

## What you learned

- A stub gives a fixed answer, whatever the test does. A fixed clock is the usual example.
- A fake does real work in a simpler way, such as an in-memory list for a database.
- A test that reads the real date passes on some days and fails on others. A stub clock fixes the date.
- A test that checks what a fake recorded checks the state after the work, which is the result.
- Each test should name its doubles and say why it uses them.

## Quizzes

Three questions, one for each idea in the chapter. Pick an answer, and read the explanation whichever way it goes.

```quiz
A test uses a stub clock set to the due date. What does the stub do?
○ It checks that the library reads the date correctly.
→ The stub does not check anything. It only supplies a date.
◉ It gives the library one fixed date, so the test gives the same answer every day.
→ Right. The stub removes the real date from the test.
○ It stores every invoice the library asks for.
→ That is a fake repository. A stub returns a fixed answer.
```

```quiz
What makes the in-memory repository a fake and not a stub?
◉ It has working logic, such as returning only the invoices that still owe money.
→ Right. A fake does real work in a simpler way, and a stub only returns fixed data.
○ It is written in a test file.
→ Where a double is written does not decide what kind it is.
○ It always returns the same list.
→ That describes a stub. The in-memory repository changes with what has been added to it.
```

```quiz
A test checks the list of reminders the fake sender recorded. Which result is it checking?
○ How many times the sender's send method was called.
→ That is what a mock would check. This test reads what was sent.
◉ The state after the work: what reminders were actually recorded.
→ Right. The test reads the result, which is what the code produced.
○ Whether the sender is a real email service.
→ The sender is a fake, so the test does not send anything at all.
```

---
