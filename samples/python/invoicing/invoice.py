"""Invoices, and the calculations that depend only on their data.

Money is held as whole cents, and dates as ISO strings (YYYY-MM-DD). Both choices keep the three ports of this
library in exact agreement.
"""

from __future__ import annotations

from dataclasses import dataclass

from .dates import parse_date


@dataclass(frozen=True)
class InvoiceLine:
    """One line on an invoice: what it is, how many, and the price of one, in cents."""

    description: str
    quantity: int
    unit_price_cents: int


@dataclass(frozen=True)
class Invoice:
    """An invoice. Its dates are YYYY-MM-DD text. Lines and payments are tuples, so the invoice can't change after it is made."""

    id: str
    customer_name: str
    customer_email: str
    due_date: str
    tax_rate_basis_points: int
    lines: tuple[InvoiceLine, ...]
    payments_cents: tuple[int, ...] = ()


def subtotal_cents(invoice: Invoice) -> int:
    """The quantity times the unit price for each line, added together, in cents."""
    return sum(line.quantity * line.unit_price_cents for line in invoice.lines)


def tax_cents(invoice: Invoice) -> int:
    """The tax on the subtotal, rounded half up to the cent. Basis points are hundredths of a percent."""
    return (subtotal_cents(invoice) * invoice.tax_rate_basis_points + 5000) // 10000


def total_cents(invoice: Invoice) -> int:
    """The subtotal plus the tax, in cents."""
    return subtotal_cents(invoice) + tax_cents(invoice)


def balance_due_cents(invoice: Invoice) -> int:
    """The total less the payments. A negative balance is a credit."""
    return total_cents(invoice) - sum(invoice.payments_cents)


def is_overdue(invoice: Invoice, today: str) -> bool:
    """True when money is still owed and today is after the due date."""
    return balance_due_cents(invoice) > 0 and parse_date(today) > parse_date(invoice.due_date)
