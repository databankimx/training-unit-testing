# Unit Testing With Fixtures and Mocks

## What This Tutorial Covers

This tutorial covers the fundamentals of unit testing, including writing assertions, using test doubles, understanding what tests actually prove, and practicing test-driven development. Examples are provided in C#, Python, and JavaScript, using a small invoicing library to illustrate each concept.

## License and Support

This repository is provided under the [MIT License](LICENSE). You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell the materials in this repository, subject to the terms of that license.

This repository is provided for training and reference purposes only. DataBank IMX does not provide warranties, guarantees, maintenance, troubleshooting, implementation assistance, or technical support for this code or its use. Use it in any way permitted by the MIT License, but you are responsible for evaluating, adapting, testing, and supporting any use of it in your own environment.

## DataBank Responsibilities for Custom Code

All DataBank employees - including those working with AI-assisted tools - are bound by the [Development Rules of Engagement](development-rules-of-engagement.md). That document defines the rules for quoting, approving, developing, reviewing, scanning, storing, and delivering custom code for client work.

Key obligations that apply to everyone on every custom code engagement:

- **You own the code you deliver.** This applies equally to hand-written code, AI-assisted code, and AI-generated code. "The AI wrote it" is not an acceptable explanation for a production issue, a failed review, a security finding, or a support problem.
- **Code must be reviewed before delivery.** Review is interactive and must confirm that the code works, meets DataBank standards, is maintainable, and that the developer understands it well enough to explain, debug, and maintain it. Polished or well-formatted output - including AI-generated output - is not evidence of correctness.
- **Code must be in source control before delivery.** All custom code must be committed to the appropriate DataBank GitHub Enterprise repository before it is delivered to a client, regardless of whether the client receives source code, compiled binaries, or deployed functionality.
- **CI scanning must pass before delivery.** Required checks are the standards policy scan, SonarQube, and Snyk. A passing local build is not a substitute.
- **All third-party dependencies must be license-vetted.** The license must permit closed-source commercial use. Copyleft or unclear licensing must be escalated before use. Dependencies must not be added simply because an AI tool suggested them.
- **Only approved AI tools may be used.** Use only IT-approved tools through company accounts. All data entered into AI systems is subject to the [DataBank AI Acceptable Use Policy](https://workforcenow.adp.com/mascsr/wfncontenttools/file-management/file/JTJGc3RhdGljJTJGY2xpZW50cyUyRmNvbnRlbnQlMkZBSStBY2NlcHRhYmxlK1VzZStQb2xpY3kucGRmJTNGMTc3MTM0NzA4NjE4MQ==) and must be treated as confidential by default.
- **Custom code is billable work.** Code must be tied to an approved quote or engagement before commitment or delivery. Development quotes require approval from the Development Director or delegated development leadership before being sent externally.
- **Exceptions require explicit approval.** Time pressure alone is not a reason to bypass quote approval, source control, review, or CI scanning.

See the [Development Rules of Engagement](development-rules-of-engagement.md) for the full policy, including billing and quoting rules, source-code delivery rules, the delivery readiness checklist, and the exception process.

---

Tests are how you find out that your code does what you think it does, and how you find out, six months later, that it no longer does. This tutorial teaches unit testing from the first assertion to test doubles, judging what a test proves, and test-driven development. Each idea is shown in C#, Python, and JavaScript, using one small invoicing library. Some of the tests in the chapters are wrong on purpose, so you can see a test that passes for the wrong reason before it happens to you.

## Quick start

The tutorial is at [databankimx/training-unit-testing](https://github.com/databankimx/training-unit-testing). Run the setup script from the tutorial's folder, or from anywhere else. It installs what's missing, opens the tutorial in VS Code, and starts the lesson runner:

```pwsh
powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
```

[QUICKSTART.md](QUICKSTART.md) has the details, including the manual steps if you'd rather not run the script, how the runner works, where your progress is saved, and how to fix common problems.

## What you need

- Windows 10 or 11
- Git, for cloning the repository
- Node.js 24 or later, for the runner and the JavaScript samples
- Python 3.12 or later, for the Python samples and pytest
- The .NET 10 SDK, for the C# samples and NUnit tests
- The Visual Studio Build Tools with the C++ workload, the fallback if Electron's download fails
- VS Code, which the setup script installs if it's missing

The setup script installs anything that's missing. The Build Tools need an Administrator PowerShell.

The C# tests download their NuGet packages the first time they run, so the first run of a C# step needs internet access.

## The chapters

Work through them in order. Each chapter has a short introduction and a few steps. Some steps are reading steps, and some are homework: you edit a starter, then check it, and a worked solution is hidden behind a spoiler until you ask for it. Summaries have quizzes. The appendix has no quizzes and no homework.

0. **Introduction.** The tour, the invoicing library, the three languages, and what each chapter covers. No exercise.
1. **Checking by Hand, and Why It Falls Short.** Running the library by hand, and the three ways a manual check lets you down.
2. **What a Test Claims.** The claim, the fixture, the action, and the assertion, and what an assertion can check.
3. **Your First Tests: Totals.** Arrange, act, and assert on the subtotal, the tax, and the total, with expected values worked out by hand.
4. **Parameterized Tests: Rounding.** One table of cases for the tax rounding rule, with a case on each side of the half-cent boundary.
5. **Test-Driven Development: The Late Fee.** Red, green, refactor, with the late fee written test first.
6. **Fixtures and Builders.** Shared sample invoices, a builder with defaults, and why shared state makes tests depend on their order.
7. **Stubs and Fakes.** A fixed clock, an in-memory repository, and a stated reason for each double.
8. **Mocks and Verification.** Checking the calls a mock received: how many, to whom, and with what.
9. **Choosing What to Mock.** Mock at the boundary, and check only what the claim is about.
10. **Errors and Boundaries.** The edge of the due date, refused dates, and a credit that is not overdue.
11. **Tests That Prove Nothing.** Tests that pass for the wrong reason, and the tests that break when you change the rule.
12. **Breaking the Code on Purpose.** Mutants: changing the rule on purpose, to see whether the tests notice.
13. **Using AI to Write Tests.** Why generated tests copy the expected value from the code, and how to ask for tests and check them.
14. **Homework: Volume Discount.** A new rule, written test first, with two homework steps.
15. **Summary: A Checklist for a Useful Test.** Six questions to ask of any test you write or review.
16. **Appendix: Framework Cheat Sheet.** NUnit, pytest, and `node:test` side by side.

## The sample data

Every chapter uses the same invoicing library, in C#, Python, and JavaScript. An invoice has lines, a tax rate, payments, and a due date. The library works out the subtotal, the tax, the total, the balance, whether an invoice is overdue, the late fee, and the volume discount. Money is kept in whole cents, and dates are `YYYY-MM-DD` text, so the arithmetic is exact. The rules are the specification the tests check against, and the chapters show how each expected value was worked out from them.

The library is in `samples\`, and the tests the chapters build are in the same folders. A step that edits the library works on a copy, so the file in the repository is never changed by a run.

## Conventions used in this tutorial

The lessons follow a few rules that make documents easier to review:

- Use hyphens, not em dashes.
- Use plain text symbols, not emojis.
- End each lesson with a horizontal rule.

These are good habits in any document, not only in this tutorial.

## Folder layout

- `setup.ps1` prepares the tutorial, installs its packages, and starts the runner.
- `QUICKSTART.md` explains setup and the runner.
- `ch00-introduction\` through `ch16-appendix-framework-cheat-sheet\` hold the chapters. Each chapter has a `lesson.md`, and its steps are folders with a `lesson.json` and a `lesson.md`.
- `samples\` holds the invoicing library and its tests in C#, Python, and JavaScript.
- `lesson-runner\` is the runner: a desktop window built with Electron.
- `resources\` holds the design notes for this tutorial. It isn't published, and Git ignores it.
- `package.json` and `package-lock.json` at the root install the runner and the JavaScript samples together. `requirements.txt` lists the Python packages.

---

*Unit Testing With Fixtures and Mocks is a standalone tutorial. It needs no other tutorial in this collection first.*
