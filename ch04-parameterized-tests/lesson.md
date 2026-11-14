# 4. Parameterized Tests: Rounding

Chapter 3 gave you three tests for INV-1002. Real rules have more cases than that, and the most useful ones sit at the edges. This chapter tests the tax rounding rule with a few small cases, and shows how to keep the cases in one table so the test is written once.

The chapter has three steps and a summary. You will look at three tests that repeat themselves, put the same cases into one table, and then break the rounding in a copy to see which named case fails.

> **Words used in this chapter.**
>
> - **Parameterized test:** one test body that runs once for each row of a table.
> - **Case:** one row of the table, with its own inputs and expected answer.
> - **Table:** the list of cases, written once, at the top of the test.
> - **Half-cent rounding:** when the tax is exactly half a cent, round up. The library does this with `+ 5000`.

---
