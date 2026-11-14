# 2. What a Test Claims

A test is a claim with a check attached. In chapter 1 you wrote the rounding check as a test, and it did its job: it passed on the real library and failed on the broken one. Not every test does that. Some tests run every time, look like checks, and still prove nothing. This chapter is about telling the two apart.

The chapter has four steps and a summary. You will read a test and name its four parts, learn which assertion fits which kind of claim, run a test that passes for the wrong reason and break the library in a copy to prove it, and then finish a test that has no assertion. The library changes in only one step, and only in a copy.

> **Words used in this chapter.**
>
> - **Claim:** a sentence about what should be true, such as "the subtotal is 2505 cents."
> - **Fixture:** the data a test starts from, such as the invoice it builds.
> - **Action:** the one call under test, such as the subtotal function.
> - **Assertion:** the line that compares the result with the claim and decides pass or fail.
> - **Expected value:** the answer the claim says you should get, worked out before the code runs.
> - **Library copy:** the copy of the library the runner makes for a step. Changing it never changes the library in `samples/`.

---
