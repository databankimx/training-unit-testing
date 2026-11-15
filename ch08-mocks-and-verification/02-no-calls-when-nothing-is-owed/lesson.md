# No Calls When Nothing Is Owed

The last step checked the calls that were made. This step checks the calls that were not made. The claim is that the sender is never called when nothing is owed, and a mock can check that directly.

The first test sets the clock to 31 October, the day before the due date. Nothing is overdue yet, so the service should send nothing. The assert says the count is zero, and then `assert_not_called` checks that the mock recorded no call at all.

The second test uses the paid invoice from the fake repository, on 14 November. The invoice is overdue by date, but nothing is owed, so it should not produce a reminder. The same check runs: count zero, and no call.

Each check does two jobs. The count says what the service reported, and the no-call check says what actually reached the sender. Both need to be right. If the service sent a reminder and still reported zero, the count alone would pass, and the mock would catch it.

Here is the check that no call was made, in each language:

~~~examples readonly
```csharp
sender.DidNotReceive().Send(Arg.Any<string>(), Arg.Any<string>(), Arg.Any<long>());
```
```python
sender.send.assert_not_called()
```
```javascript
assert.equal(send.mock.callCount(), 0);
```
~~~

Run the tests. Both pass.

This is not homework, but the next step uses the same idea in reverse. There, a mock that has no calls makes a test fail.

---
