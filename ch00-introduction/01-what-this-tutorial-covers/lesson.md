# What This Tutorial Covers

The tutorial rests on one claim: a test is worth its place only if it can fail, and it fails for the right reason. Everything in it is built to make that true. Where the lesson calls for it, you write a test before the code it checks. You see the test fail before you see it pass. And you run it against a deliberately broken copy of the code, to show that it notices.

## The parts

The tutorial has four parts, followed by homework, a summary, and an appendix.

1. **Foundations.** Checking by hand, and why it falls short. What a test claims. Your first tests on the totals. Parameterized tests for the tax rounding rules.
2. **Test-driven development.** Writing the late fee test first, then going through red, green, and refactor. Then fixtures and builders, which give each test its own data.
3. **Test doubles.** Stubs and fakes stand in for the clock and the store. Mocks check what the code sent to another part of the system. You will also learn how to choose what to mock at all, which matters more than it sounds.
4. **Judgment.** Errors and boundaries, the tests that look like tests but prove nothing, and what mutation checking and coverage do and do not show.

The homework is a volume discount, written test first. The summary is a checklist for a useful test. The appendix puts NUnit, pytest, and `node:test` side by side, so you can see how they differ.

## The three languages

Every idea is shown in C#, Python, and JavaScript. The library gives the same answers in each language, and the tests have the same names. When you compare the tabs, the claims should match word for word, even though the code won't.

The tests use the standard framework for each language: NUnit for C#, pytest for Python, and `node:test` for JavaScript. A test in one language is a translation of the test in the others, not a different test.

## What it leaves out

This is a tutorial about unit tests. It stays with small pieces of code that can be tested on their own. It does not cover testing a web page, testing against a real database, performance testing, or the tools that run tests in a build pipeline. Each of those is a large subject with its own tutorial, and I would rather not give them a rushed paragraph here.

> **Aside: why the library is small.** A small library lets you hold every rule in your head and check the tests against them. The ideas here matter just as much in a large system, but they are easier to see in a library of a few hundred lines.

> **Common mistake.** Deciding a test suite is good because it has lots of tests, or a high coverage number. Both can be true of a suite that proves almost nothing. We come back to this in the last chapters, and I will be the one reminding you.

---
