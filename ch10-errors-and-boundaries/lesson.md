# 10. Errors and Boundaries

Most mistakes in a rule happen at its edges. A rule that says "overdue after the due date" is simple to state and easy to break by one day. A rule that accepts input has its own edges: the dates it refuses, and the balances it allows.

Dana's team had a rule change from "after" to "on or after" the due date. Their tests all passed. Every test checked an invoice a month late, which is well past any edge. Reminders started going out on the due date itself, and nobody noticed until a customer complained. The tests were green, and the rule was wrong on the one day they never checked.

This chapter tests the edges. The claims name the exact date or state, and the checks name the exact kind of refusal when the library refuses something. You will see the edge tests pass, then write one yourself.

> **Words used in this chapter.**
>
> - **Boundary:** the exact value where a rule changes, such as the due date itself.
> - **Refusal:** an error the library raises on purpose for bad input.
> - **Credit:** a negative balance, which means the customer has paid more than the invoice costs.

---
