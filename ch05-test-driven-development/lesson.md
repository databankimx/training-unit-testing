# 5. Test-Driven Development: The Late Fee

So far, every test in this tutorial was written after the code it checks. This chapter reverses that. You write the test first, watch it fail, then write the smallest code that makes it pass, and then tidy the code while the tests stay green. People call this red, green, refactor.

The late fee is the rule for this chapter. The library in the editor does not have one yet. It has a stub, a function that always returns 0, so you can see what a test does before the real code exists.

Dana is the junior developer from the last chapter, and she has the late fee ticket. Last time, she wrote a calculation and then tests for it, and the tests passed the first time. She was pleased, and it told her nothing, because she never saw a test fail. This chapter is about seeing the test fail first.

The chapter has three steps and a summary. You will watch a test fail against the stub, write one more test and watch it fail too, and then write the code that makes both pass and tidy it.

> **Words used in this chapter.**
>
> - **Red:** a test that fails. A red result is the start of the cycle, and it is what you want first.
> - **Green:** the test passes, because you wrote the code it asks for.
> - **Refactor:** change the code without changing what it does. The tests stay green while you do it.
> - **Stub:** a placeholder with the right name and the wrong answer, such as a function that always returns 0.
> - **Minimum fee:** the least a late fee can be. For this library it is 500 cents, which is $5.00.

---
