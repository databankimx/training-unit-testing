# Totals by Hand

The test file in the editor has three tests: the subtotal, the tax and the total of INV-1002. Each one has its arrange and act sections written for you. The assert section has a placeholder where the expected value belongs: `None` in Python, `null` in JavaScript, and `null` in C#. Run them. All three fail, because the placeholders are not numbers.

Your job is to fill in the three expected values. Work each one out on paper from the rules, before you run anything again:

1. **The subtotal.** Three widgets at 835 cents each.
2. **The tax.** The subtotal times 825 basis points, rounded half up to the cent. You worked out this rounding in chapter 1.
3. **The total.** The subtotal plus the tax.

Replace each placeholder with your number, and Run again. All three pass.

> **Common mistake.** Running the program, copying the number it printed, and pasting it into the test. That test will pass, and it will prove nothing. The next step shows what happens when the expected value comes from the program.

This is homework. Work the three numbers out on paper, type them in, and Run. Press Show solution (spoiler) only after you've tried it. The solution is the same test file with the three numbers filled in.

---
