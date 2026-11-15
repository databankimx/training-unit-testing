# 9. Choosing What to Mock

Chapters 7 and 8 gave you three kinds of double: stubs that give fixed answers, fakes that hold data, and mocks that record calls. Knowing the kinds is the easy part. The harder question, for each dependency in front of you, is which kind to use, and which of its calls, if any, belong in the test.

Dana's reminder test had one line that did not belong. It checked how many times the clock was read. She had been reading the test as "the service does the right things," but the claim was only "overdue invoices get reminders." The reminder checks were the claim, so they stayed. The clock line was not. It tied the test to the inside of the service, so a harmless change to the inside would break the test while the reminders stayed right.

This chapter is about telling the two apart. A double gets chosen by what the test needs from that dependency. Data gets a fake or a stub. A call gets checked only when the call is the claim. Only the boundaries are doubled, which are the clock, the repository and the sender. The rules in the invoice code are never doubled.

The chapter has two steps and a summary. You will see a test that checks plumbing and passes, then fix one that fails on plumbing.

> **Words used in this chapter.**
>
> - **Over-specified test:** a test that checks how the code works inside, so it breaks when that changes, even though the result is right.
> - **Plumbing:** the internal steps of the code, such as how many times it reads a value.
> - **Claim:** what the test says the code does. A check belongs in the test only if it serves the claim.

---
