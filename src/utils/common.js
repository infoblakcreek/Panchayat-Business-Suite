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
   COMMON TABLE SEARCH SYSTEM
   ------------------------------------------------------------
   Searches a module's complete memory data by:

   A → Khata Number
   B → Khatedar Name
   Receipt Column → Pavati Number

   When a match is found:

   1. Finds the row in MEMORY
   2. Calculates the correct page
   3. Opens that page
   4. Renders the page
   5. Highlights the matching row
   6. Scrolls the row into view

   This function is shared by:
   - Shikshanupakaran
   - Talapatrak
   - Future table modules
============================================================ */


function searchCommonTableRows({

    searchTerm,
    rows,
    khataColumn = "A",
    nameColumn = "B",
    receiptColumn = null,
    rowsPerPage = 20,
    currentPageSetter,
    renderPage,
    tableBodySelector,
    rowSelector,
    memoryIndexAttribute = "memoryIndex"

}) {

    /* ========================================================
       BASIC CHECK
    ======================================================== */

    if (
        !Array.isArray(rows) ||
        !searchTerm
    ) {

        return;

    }


    const term =
        String(searchTerm)
            .trim()
            .toLowerCase();


    if (!term) {

        return;

    }


    /* ========================================================
       NORMALIZE VALUE
       --------------------------------------------------------
       Supports Gujarati digits as well as English digits.
    ======================================================== */

    function normalize(value) {

        if (
            value === null ||
            value === undefined
        ) {

            return "";

        }


        let text =
            String(value);


        if (
            typeof convertGujaratiDigitsToEnglish ===
            "function"
        ) {

            text =
                convertGujaratiDigitsToEnglish(
                    text
                );

        }


        return text
            .trim()
            .toLowerCase();

    }


    /* ========================================================
       FIND MATCH
       --------------------------------------------------------
       Search priority:

       1. Khata number
       2. Name
       3. Pavati number
    ======================================================== */

    let foundIndex = -1;


    for (
        let i = 0;
        i < rows.length;
        i++
    ) {

        const row =
            rows[i];


        if (!row) {
            continue;
        }


        const khata =
            normalize(
                row[khataColumn]
            );


        const name =
            normalize(
                row[nameColumn]
            );


        const receipt =
            receiptColumn
                ? normalize(
                    row[receiptColumn]
                )
                : "";


        if (

            khata.includes(term) ||

            name.includes(term) ||

            (
                receipt &&
                receipt.includes(term)
            )

        ) {

            foundIndex =
                i;

            break;

        }

    }


    /* ========================================================
       NO MATCH
    ======================================================== */

    if (
        foundIndex === -1
    ) {

        return false;

    }


    /* ========================================================
       CALCULATE PAGE
    ======================================================== */

    const page =
        Math.floor(
            foundIndex /
            rowsPerPage
        ) + 1;


    /* ========================================================
       SAVE TARGET ROW
    ======================================================== */

    window.commonSearchTargetIndex =
        foundIndex;


    window.commonSearchTargetPage =
        page;


    /* ========================================================
       CHANGE PAGE
    ======================================================== */

    if (
        typeof currentPageSetter ===
        "function"
    ) {

        currentPageSetter(
            page
        );

    }


    /* ========================================================
       RENDER TARGET PAGE
    ======================================================== */

    if (
        typeof renderPage ===
        "function"
    ) {

        renderPage(
            page
        );

    }


    /* ========================================================
       HIGHLIGHT AFTER DOM RENDER
       --------------------------------------------------------
       setTimeout allows the page renderer to finish creating
       the DOM rows first.
    ======================================================== */

    setTimeout(
        function() {

            highlightCommonSearchRow({

                targetIndex:
                    foundIndex,

                tableBodySelector:
                    tableBodySelector,

                rowSelector:
                    rowSelector,

                memoryIndexAttribute:
                    memoryIndexAttribute

            });

        },
        50
    );


    return true;

}


/* ============================================================
   HIGHLIGHT SEARCH RESULT
============================================================ */

function highlightCommonSearchRow({

    targetIndex,
    tableBodySelector,
    rowSelector,
    memoryIndexAttribute = "memoryIndex"

}) {

    const body =
        document.querySelector(
            tableBodySelector
        );


    if (!body) {
        return;
    }


    /* ========================================================
       REMOVE PREVIOUS HIGHLIGHT
    ======================================================== */

    body
        .querySelectorAll(
            ".commonSearchHighlight"
        )
        .forEach(
            function(row) {

                row.classList.remove(
                    "commonSearchHighlight"
                );

            }
        );


    /* ========================================================
       FIND TARGET ROW
    ======================================================== */

    const rows =
        body.querySelectorAll(
            rowSelector
        );


    let targetRow = null;


    rows.forEach(
        function(row) {

            const index =
                Number(
                    row.dataset[
                        memoryIndexAttribute
                    ]
                );


            if (
                index ===
                targetIndex
            ) {

                targetRow =
                    row;

            }

        }
    );


    if (!targetRow) {
        return;
    }


    /* ========================================================
       HIGHLIGHT
    ======================================================== */

    targetRow.classList.add(
        "commonSearchHighlight"
    );


    /* ========================================================
       SCROLL TO ROW
    ======================================================== */

    targetRow.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });


    /* ========================================================
       KEEP HIGHLIGHT FOR A WHILE
    ======================================================== */

    setTimeout(
        function() {

            targetRow.classList.remove(
                "commonSearchHighlight"
            );

        },
        4000
    );

}


/* ============================================================
   END OF COMMON UTILITIES
   ============================================================ */