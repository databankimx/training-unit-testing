# 6. Fixtures and Builders

A fixture is the data a test starts from. Chapter 3 built its invoice inside each test, which is simple, but every test then has its own copy of the setup, and that gets tedious fast. This chapter covers two ways to organise fixtures, and the mistake that one of them invites.

Dana has a test that passes when she runs it alone and fails when the whole file runs. She has spent a morning looking at the wrong test, and this chapter is about how she found the cause.

The chapter has three steps and a summary. You will see a shared fixture cause a failure in a test that did not change, read a builder with defaults that each test can override, and then write two tests with overrides of your own.

> **Words used in this chapter.**
>
> - **Fixture:** the data a test starts from.
> - **Shared fixture:** a fixture that several tests use. If one test changes it, the others see the change.
> - **Builder:** a helper that makes a fixture with sensible defaults.
> - **Default:** the value the builder uses when a test does not say otherwise.
> - **Override:** a value a test sets to replace one default.

---
