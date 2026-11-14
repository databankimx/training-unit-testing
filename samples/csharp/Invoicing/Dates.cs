using System.Globalization;

namespace Invoicing;

// The one place dates are read. Dates are ISO strings (YYYY-MM-DD) everywhere in this library.
public static class Dates
{
    // Reads a YYYY-MM-DD date. Throws FormatException for anything else, including impossible dates such as February 30.
    public static DateOnly Parse(string text) =>
        DateOnly.ParseExact(text, "yyyy-MM-dd", CultureInfo.InvariantCulture);
}
