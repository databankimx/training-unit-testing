# Checks in Main

Before anyone reaches for a test framework, most of us write a check like this. We open a console program, call the library, compare the answer with the number we worked out by hand, and print the result. It takes a minute, and for a while it is good enough.

The program in the editor does that for INV-1002. It has the expected answer, 207, and a line that says whether the library agrees. Run it.

It prints PASS. That is a check, and it did its job.

Now see what happens when it fails. Change the expected answer from 207 to 206, and Run again. The line says FAIL. Then the program finishes with exit code 0, which means it ran to the end without an error. The console has no idea that the check failed. Nothing stops a build or a release, and nothing keeps the result. If nobody reads the output, the failure goes unnoticed.

Change the expected answer back to 207 before you go on.

That is the shortfall in code. The check runs only when someone runs it, and its result lives in the output. The next step writes the same check as a test, so a framework can keep the result and report it.

This is homework. Make the change yourself, and Run to see the FAIL line. Press Show solution (spoiler) only after you've tried it. The solution is the same program with the expected answer set to 206.

---
