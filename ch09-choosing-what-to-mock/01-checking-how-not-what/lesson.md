# Checking How, Not What

Dana's team moved one line in the reminder service. The service used to read today's date once, at the top. Now it reads the date each time it looks at an invoice. The reminders that go out are exactly the same, and customers would never notice. Dana's tests went red anyway, because one of them checked how many times the clock was read. She spent an afternoon making the test match the new plumbing, and nothing that customers see had changed.

That test checked how the service works inside, not what it does. Those are different claims. A test that checks how is called an over-specified test, and it breaks whenever the inside changes, even when the outside stays right.

The test in this step is written the same way. Its claim is "two overdue invoices get two reminders." Read the arrange section first. The clock is a stub: a `Mock` with a return value, so it always says 14 November. The repository is a fake that holds two invoices. The sender is a mock, because the calls it receives are the claim, as in the last chapter.

Now read the assert section. The first two lines check the claim. The count is two, and the sender received two calls. The third line checks something else: that the clock was read exactly once. That line is the problem.

Here is the same test in each language:

~~~examples readonly
```csharp
clock.Received(1).Today(); // not part of the claim
```
```python
clock.today.assert_called_once()  # not part of the claim
```
```javascript
assert.equal(today.mock.callCount(), 1); // not part of the claim
```
~~~

Run the test. It passes, because the service does read the clock once. That is the trap. A passing test does not tell you the check is needed, only that the code is currently built that way.

The last line in each language checks how the clock is used. The claim does not mention the clock at all. So if the service later reads the clock twice, or three times, or caches it, this test breaks, even though the reminders are right. The next step is about finding and removing that kind of line.

> **A rule of thumb.** Check a double's calls only when the calls are the claim. Check a stub's answers for data, and a fake's contents for state. If the claim does not name the call, the check is plumbing.

This step is not homework. The next one is.

---
