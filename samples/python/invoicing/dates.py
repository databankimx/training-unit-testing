"""The one place dates are read. Dates are ISO strings (YYYY-MM-DD) everywhere in this library."""

import re
from datetime import date

_ISO_DATE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_date(text: str) -> date:
    """Reads a YYYY-MM-DD date.

    Raises ValueError for anything else, including impossible dates such as February 30.
    """
    if not _ISO_DATE.match(text):
        raise ValueError(f"not a YYYY-MM-DD date: {text!r}")
    return date.fromisoformat(text)
