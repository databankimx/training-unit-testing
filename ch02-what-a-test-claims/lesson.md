# 2. What a Test Claims

A test is a claim with a check attached. In chapter 1 you wrote the rounding check as a test, and it did its job: it passed on the real library and failed on the broken one. Not every test does that. Some tests run every time, look like checks, and still prove nothing. This chapter is about telling the two apart.

The chapter has three steps and a summary. You will read a test and name its four parts, run a test that passes for the wrong reason and break the library in a copy to prove it, and then finish a test that has no assertion. The library changes in only one step, and only in a copy.

---
