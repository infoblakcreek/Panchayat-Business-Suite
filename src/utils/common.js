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
   NORMALIZE INPUT FOR DISPLAY
   ------------------------------------------------------------
   User may enter English OR Gujarati digits.
   Editor always displays Gujarati digits.
   ============================================================ */

function normalizeGujaratiDisplayValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }

    return convertToGujaratiDigits(
        value
    );

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
   GUJARATI DATE UTILITIES
   ------------------------------------------------------------
   Canonical stored/editing format:
      DD/MM/YYYY

   Display / print format:
      Gujarati digits

   Example:
      15/09/2026
      →
      ૧૫/૦૯/૨૦૨૬

   IMPORTANT:
   ------------------------------------------------------------
   Dates are stored as normal English digits.
   Gujarati conversion is ONLY for display / print.

   This avoids JavaScript problems with:
      new Date("15/09/2026")

   because DD/MM/YYYY is not reliably parsed by JavaScript.
   ============================================================ */


/* ------------------------------------------------------------
   normalizeDateDDMMYYYY()

   Converts supported date values into the canonical:

      DD/MM/YYYY

   Supported:
      DD/MM/YYYY
      D/M/YYYY
      DD-MM-YYYY
      YYYY-MM-DD
      JavaScript Date
      Firestore Timestamp

   IMPORTANT:
   ------------------------------------------------------------
   Do NOT use new Date() on DD/MM/YYYY strings.
   ------------------------------------------------------------ */

function normalizeDateDDMMYYYY(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    /* ========================================================
       FIRESTORE TIMESTAMP
    ======================================================== */

    if (
        value &&
        typeof value.toDate === "function"
    ) {

        const date =
            value.toDate();

        if (
            date instanceof Date &&
            !Number.isNaN(
                date.getTime()
            )
        ) {

            return [

                String(
                    date.getDate()
                ).padStart(2, "0"),

                String(
                    date.getMonth() + 1
                ).padStart(2, "0"),

                String(
                    date.getFullYear()
                )

            ].join("/");

        }

    }


    /* ========================================================
       JAVASCRIPT DATE
    ======================================================== */

    if (
        value instanceof Date
    ) {

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            return "";

        }

        return [

            String(
                value.getDate()
            ).padStart(2, "0"),

            String(
                value.getMonth() + 1
            ).padStart(2, "0"),

            String(
                value.getFullYear()
            )

        ].join("/");

    }


    /* ========================================================
       STRING
    ======================================================== */

    let text =
        String(value)
            .trim();


    if (!text) {

        return "";

    }


    /* ========================================================
       CONVERT GUJARATI DIGITS FIRST

       This allows the function to safely handle:

          ૧૫/૦૯/૨૦૨૬

       and convert it back to:

          15/09/2026
    ======================================================== */

    text =
        convertGujaratiDigitsToEnglish(
            text
        );


    /* ========================================================
       DD/MM/YYYY
       D/M/YYYY
       DD-MM-YYYY
       DD.MM.YYYY
    ======================================================== */

    let match =
        text.match(
            /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/
        );


    if (match) {

        const day =
            String(
                match[1]
            ).padStart(2, "0");

        const month =
            String(
                match[2]
            ).padStart(2, "0");

        const year =
            match[3];


        return `${day}/${month}/${year}`;

    }


    /* ========================================================
       YYYY-MM-DD

       Used if an existing record happens to contain
       an ISO date.
    ======================================================== */

    match =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/
        );


    if (match) {

        const year =
            match[1];

        const month =
            String(
                match[2]
            ).padStart(2, "0");

        const day =
            String(
                match[3]
            ).padStart(2, "0");


        return `${day}/${month}/${year}`;

    }


    /*
       Unknown format.

       Return the original text rather than trying
       new Date(text), because that can silently create
       incorrect dates.
    */

    return text;

}


/* ------------------------------------------------------------
   formatGujaratiDate()

   Converts a date into Gujarati digits for:

      - screen display
      - print

   Example:

      15/09/2026
      →
      ૧૫/૦૯/૨૦૨૬
   ------------------------------------------------------------ */

function formatGujaratiDate(value) {

    const date =
        normalizeDateDDMMYYYY(
            value
        );


    if (!date) {

        return "";

    }


    return convertToGujaratiDigits(
        date
    );

}


/* ============================================================
   END GUJARATI DATE UTILITIES
============================================================ */




/* ============================================================
   GUJARATI NUMBER TO WORDS
   Reusable utility for amounts and financial values
   ============================================================ */

function numberToGujaratiWords(value) {

    const gujaratiNumbers = [
        "શૂન્ય",
        "એક",
        "બે",
        "ત્રણ",
        "ચાર",
        "પાંચ",
        "છ",
        "સાત",
        "આઠ",
        "નવ",
        "દસ",
        "અગિયાર",
        "બાર",
        "તેર",
        "ચૌદ",
        "પંદર",
        "સોળ",
        "સત્તર",
        "અઢાર",
        "ઓગણીસ",
        "વીસ",
        "એકવીસ",
        "બાવીસ",
        "તેવીસ",
        "ચોવીસ",
        "પચ્ચીસ",
        "છવ્વીસ",
        "સત્તાવીસ",
        "અઠ્ઠાવીસ",
        "ઓગણત્રીસ",
        "ત્રીસ",
        "એકત્રીસ",
        "બત્રીસ",
        "તેત્રીસ",
        "ચોત્રીસ",
        "પાંત્રીસ",
        "છત્રીસ",
        "સડત્રીસ",
        "અડત્રીસ",
        "ઓગણચાલીસ",
        "ચાલીસ",
        "એકતાલીસ",
        "બેતાલીસ",
        "ત્રેતાલીસ",
        "ચુંમાલીસ",
        "પિસ્તાલીસ",
        "છેતાલીસ",
        "સુડતાલીસ",
        "અડતાલીસ",
        "ઓગણપચાસ",
        "પચાસ",
        "એકાવન",
        "બાવન",
        "ત્રેપન",
        "ચોપન",
        "પંચાવન",
        "છપ્પન",
        "સત્તાવન",
        "અઠ્ઠાવન",
        "ઓગણસાઠ",
        "સાઠ",
        "એકસઠ",
        "બાસઠ",
        "ત્રેસઠ",
        "ચોસઠ",
        "પાંસઠ",
        "છાસઠ",
        "સડસઠ",
        "અડસઠ",
        "અગણોસિત્તેર",
        "સિત્તેર",
        "એકોતેર",
        "બોતેર",
        "તોતેર",
        "ચુમોતેર",
        "પંચોતેર",
        "છોતેર",
        "સિત્યોતેર",
        "અઠ્યોતેર",
        "ઓગણએંસી",
        "એંસી",
        "એક્યાસી",
        "બ્યાસી",
        "ત્યાસી",
        "ચોર્યાસી",
        "પંચાસી",
        "છ્યાસી",
        "સિત્યાસી",
        "અઠ્યાસી",
        "નેવ્યાસી",
        "નેવું",
        "એકાણું",
        "બાણું",
        "ત્રાણું",
        "ચોરાણું",
        "પંચાણું",
        "છન્નું",
        "સત્તાણું",
        "અઠ્ઠાણું",
        "નવ્વાણું"
    ];

    const gujaratiHundreds = [
        "",
        "એકસો",
        "બસો",
        "ત્રણસો",
        "ચારસો",
        "પાંચસો",
        "છસો",
        "સાતસો",
        "આઠસો",
        "નવસો"
    ];

    function convertBelowHundred(number) {

        if (number === 0) {
            return "";
        }

        return gujaratiNumbers[number];
    }

    function convertBelowThousand(number) {

        if (number < 100) {
            return convertBelowHundred(number);
        }

        const hundreds =
            Math.floor(number / 100);

        const remainder =
            number % 100;

        let result =
            gujaratiHundreds[hundreds];

        if (remainder > 0) {
            result +=
                " " +
                convertBelowHundred(remainder);
        }

        return result;
    }

    function convertIndianNumber(number) {

        if (number === 0) {
            return "શૂન્ય";
        }

        let result = "";

        const crore =
            Math.floor(number / 10000000);

        number =
            number % 10000000;

        const lakh =
            Math.floor(number / 100000);

        number =
            number % 100000;

        const thousand =
            Math.floor(number / 1000);

        number =
            number % 1000;

        const remainder =
            number;

        if (crore > 0) {
            result +=
                convertBelowThousand(crore) +
                " કરોડ";
        }

        if (lakh > 0) {

            if (result) {
                result += " ";
            }

            result +=
                convertBelowHundred(lakh) +
                " લાખ";
        }

        if (thousand > 0) {

            if (result) {
                result += " ";
            }

            result +=
                convertBelowHundred(thousand) +
                " હજાર";
        }

        if (remainder > 0) {

            if (result) {
                result += " ";
            }

            result +=
                convertBelowThousand(remainder);
        }

        return result;
    }

    const englishValue =
        convertGujaratiDigitsToEnglish(
            String(value ?? "")
        )
        .replace(/₹/g, "")
        .replace(/,/g, "")
        .trim();

    if (!englishValue) {
        return "";
    }

    const numericValue =
        Number(englishValue);

    if (
        !Number.isFinite(numericValue) ||
        numericValue < 0
    ) {
        return "";
    }

    /*
       Convert everything to paise first.
       This avoids problems such as 99.999 becoming
       99 rupees + 100 paise.
    */
    const totalPaise =
        Math.round(
            numericValue * 100
        );

    const wholeNumber =
        Math.floor(
            totalPaise / 100
        );

    const paise =
        totalPaise % 100;

    let result =
        convertIndianNumber(
            wholeNumber
        ) +
        " રૂપિયા";

    if (paise > 0) {

        result +=
            " અને " +
            convertIndianNumber(
                paise
            ) +
            " પૈસા";

    } else {

        result +=
            " પૂરા";
    }

    return result;
}
/* ============================================================
   END GUJARATI NUMBER TO WORDS
============================================================ */

/* ============================================================
   END OF COMMON UTILITIES
   ============================================================ */
function setupIndianDatePicker() {

    flatpickr(
        ".indianDatePicker",
        {
            dateFormat: "d/m/Y",
            allowInput: true,

            formatDate: function (
                date,
                format
            ) {

                const englishDate =
                    flatpickr.formatDate(
                        date,
                        format
                    );

                return convertToGujaratiDigits(
                    englishDate
                );

            },

            parseDate: function (
                date,
                format
            ) {

                const englishDate =
                    convertGujaratiDigitsToEnglish(
                        String(date)
                    );

                return flatpickr.parseDate(
                    englishDate,
                    format
                );

            }
        }
    );

}



