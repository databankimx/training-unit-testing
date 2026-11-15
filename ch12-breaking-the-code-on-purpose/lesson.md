# 12. Breaking the Code on Purpose

A green test suite tells you the tests passed. It does not tell you which rules they protect. The only way to find out is to break a rule and see which tests turn red. Engineers call the broken copy a mutant, and the practice mutation checking.

Dana's coverage report showed 94 percent of the library's lines run by tests. A rule had been changed in the overdue check, and the suite stayed green. The changed line was one the tests ran every time. What they never did was check what the line decided. The report counted the line as covered, and nobody had asked the tests what they proved about it.

This chapter breaks the rules on purpose, in a copy of the library, and records which tests catch each change. You will do two of the breaks yourself. The last step explains what coverage can and cannot tell you, and why a covered line is not a checked line.

> **Words used in this chapter.**
>
> - **Mutant:** a copy of the library with one deliberate change to a rule.
> - **Mutation checking:** running the tests against mutants to see which changes they catch.
> - **Coverage:** a count of which lines the tests ran. It says nothing about whether the tests checked the result.

---
