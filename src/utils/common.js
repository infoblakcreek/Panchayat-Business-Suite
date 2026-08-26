/* ============================================================
   PANCHAYAT BUSINESS SUITE — COMMON UTILITIES
   ============================================================

   This file contains functions that are shared by multiple
   modules of the application.

   CURRENT COMMON FUNCTIONS:
   ------------------------------------------------------------
   1. Gujarati digit conversion
      English digits → Gujarati digits

      123       → ૧૨૩
      123.45    → ૧૨૩.૪૫

   2. Gujarati digit reverse conversion
      Gujarati digits → English digits

      ૧૨૩       → 123
      ૧૨૩.૪૫    → 123.45

   These functions are intentionally kept here so that modules
   such as:

      - Talapatrak
      - Shikshanupakaran
      - Main Bill
      - future modules

   can use the same conversion logic without duplicating code.

   IMPORTANT:
   ------------------------------------------------------------
   Keep only genuinely shared/general-purpose functions in this
   file.

   Module-specific functions should remain inside their own
   JavaScript files.

   ============================================================ */


/* ============================================================
   GUJARATI NUMBER UTILITIES
   ============================================================ */


/* ------------------------------------------------------------
   convertToGujaratiDigits()

   Converts English/Arabic numerals into Gujarati numerals.

   Example:
      123       → ૧૨૩
      45.67     → ૪૫.૬૭
      1000      → ૧૦૦૦

   Used primarily for DISPLAYING numbers to the user.
   ------------------------------------------------------------ */

function convertToGujaratiDigits(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/0/g, "૦")
        .replace(/1/g, "૧")
        .replace(/2/g, "૨")
        .replace(/3/g, "૩")
        .replace(/4/g, "૪")
        .replace(/5/g, "૫")
        .replace(/6/g, "૬")
        .replace(/7/g, "૭")
        .replace(/8/g, "૮")
        .replace(/9/g, "૯");
}


/* ------------------------------------------------------------
   convertGujaratiDigitsToEnglish()

   Converts Gujarati numerals back into English/Arabic numerals.

   Example:
      ૧૨૩       → 123
      ૪૫.૬૭     → 45.67
      ૧૦૦૦      → 1000

   Used before mathematical calculations because JavaScript
   number functions such as Number() and parseFloat() expect
   standard English/Arabic digits.

   ------------------------------------------------------------ */

function convertGujaratiDigitsToEnglish(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/૦/g, "0")
        .replace(/૧/g, "1")
        .replace(/૨/g, "2")
        .replace(/૩/g, "3")
        .replace(/૪/g, "4")
        .replace(/૫/g, "5")
        .replace(/૬/g, "6")
        .replace(/૭/g, "7")
        .replace(/૮/g, "8")
        .replace(/૯/g, "9");
}




/* ============================================================
   GENERATED VALUE ROUNDING
   ------------------------------------------------------------
   Rounds calculated values UP to the nearest 0.05.

   Examples:
   2.23  → 2.25
   4.54  → 4.55
   756.56 → 756.60

   Used by:
   - Talapatrak
   - Shikshanupakaran
   ============================================================ */

function roundGeneratedValueToFivePaise(value) {

    const number =
        Number(value);

    if (
        !Number.isFinite(number)
    ) {
        return 0;
    }

    return Math.ceil(
        (number - 1e-9) * 20
    ) / 20;

}


/* ============================================================
   END OF COMMON UTILITIES
   ============================================================ */