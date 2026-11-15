# 7. Stubs and Fakes

Some code reads the date, or asks a database for invoices, or sends an email. A test that uses the real clock or the real database is at the mercy of the day it runs and of whatever is in the database. This chapter replaces those outside pieces with simple stand-ins that the test controls.

Dana's reminder tests started failing every morning. They used the real date, and each day the invoices moved closer to, or further past, their due dates. The tests were not wrong on any one day. They were wrong on the next day, and nothing in the test said so.

Two kinds of stand-in appear in this chapter. A stub gives a fixed answer and has no other logic. A fake has real logic, but a simpler version of it, such as a list in memory instead of a database. Both are called test doubles, and each test should say which one it uses and why.

The chapter has three steps and a summary. You will use a stub clock, read a fake repository and a fake sender, and then write two tests with doubles of your own.

> **Words used in this chapter.**
>
> - **Double:** any stand-in for a real dependency in a test.
> - **Stub:** a double that returns a fixed answer, whatever the test does.
> - **Fake:** a double with working logic, usually simpler than the real thing.
> - **Clock:** the part of the library that says what today is.
> - **Repository:** the part of the library that finds invoices.

---
