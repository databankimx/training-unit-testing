# 0. Introduction

Most programs get checked the same way. You run them, look at the answer, and nod. That works until a change to one rule quietly breaks another, and then a customer finds the bug before you do. This tutorial teaches you to write unit tests that prove what they claim, so the program catches a broken rule before a customer ever sees it.

The tutorial follows one small library, the invoicing library. It works out the subtotal, tax, and total of an invoice, the balance still owed, whether an invoice is overdue, and which customers should get a reminder. It is written in C#, Python, and JavaScript, and it gives the same answers in each. The tests are written in all three too, with the same names for the same cases, so you can flip between the tabs and see the same claims side by side.

Along the way you will write tests with fixtures, stubs, fakes, and mocks. You will also write a late fee test before the fee exists, which feels backwards the first time you do it. Near the end you will meet tests that look like tests but prove nothing, and you will learn to spot them. Most of us have written one of those without noticing, so consider this your early warning.

This chapter has two reading steps and a summary, and no exercise. The next chapter starts by checking the library by hand, and shows why that only gets you so far.

**Libraries.** This chapter uses no packages. The test frameworks are introduced where they are first used: NUnit for C#, pytest for Python, and `node:test` for JavaScript, which is built into Node.

---
