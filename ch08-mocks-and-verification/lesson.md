# 8. Mocks and Verification

Chapter 7 checked what the reminder service returned, and what the fake sender recorded. Sometimes the calls are the behaviour: the service is supposed to ask the sender to send one reminder for each overdue invoice, and no others. A mock records the calls made to it, so the test can check them directly.

Dana's reminder test has passed for months. It checks that the service reports two reminders sent, and it does. Then someone swaps the real sender for one that quietly does nothing. The service still counts two reminders, because the count is the service's own tally. The test still passes, and no customer gets an email. Dana's test checked the number, and the number was never the thing that mattered. The emails were.

The mock sits at the sender, which is one of the places where the library leaves the program and talks to the outside world. That is the only kind of thing this tutorial mocks. The clock, the repository and the sender are the outside pieces. The invoice code and the rules are never mocked.

The chapter has three steps and a summary. You will check the calls the sender receives, check that a call did not happen, and then write tests that fail when the calls are wrong.

> **Words used in this chapter.**
>
> - **Mock:** a double that records the calls made to it, so the test can check them.
> - **Call:** one time the library asks the sender to do something.
> - **Verify:** check that the calls match what the claim says.
> - **Boundary:** the edge of the library, where it talks to the outside world.

---
