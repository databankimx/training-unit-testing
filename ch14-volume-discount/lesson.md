# 14. Homework: Volume Discount

This is the final homework. You will add a feature to the library, and you will write its tests first.

Dana's sales lead asked for a volume discount: 5 percent off any order above 100 dollars. Dana's first instinct was to write the discount and then the tests. This chapter does it the other way round. The tests come first, and they state the rule in numbers that have been worked out by hand. Then the code is written until the tests pass.

The discount is 5 percent of the subtotal, rounded half up, and it applies only to orders above 10000 cents. The library already has a stub for it, which always returns 0. That is what makes the tests red at the start.

There are two steps. The first is the tests, with two values for you to work out. The second is the rule, in the library's copy. You will use the same habits as chapter 5: a red test first, then the smallest change that makes it green, and no change to the tests to make them pass.

---
