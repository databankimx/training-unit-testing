# 11. Tests That Prove Nothing

The worst test suite is not one with few tests. It is one with many green tests that could never fail. It gives a feeling of safety, and that feeling is wrong.

Dana inherited a suite of several hundred tests. All were green, and the team trusted them. A rule was broken for a week before a customer noticed. When Dana read the suite, she found tests with no assertions, tests that compared a value with itself, and a few that caught their own failures and carried on. The suite had never been able to go red on the rule that broke. Dana's job became finding out which tests could fail and which could not.

This chapter shows the patterns that make a test useless. Each one passes against the real library, and the lesson then breaks the library on purpose to show what the test does when the rule is wrong. The question to ask of every test is the same: what would make this fail?

> **Words used in this chapter.**
>
> - **Tautology:** a check that is always true, such as a value compared with itself.
> - **Swallowed failure:** a failure that a test catches and ignores, so it never goes red.
> - **Mutant:** a copy of the library with a deliberate change, used to see which tests catch it.

---
