/* ============================================================
   SHIKSHANUPAKARAN SUMMARY
   ============================================================ */

(function () {

    "use strict";


    /* ========================================================
       ELEMENT ACCESS
    ======================================================== */

    function getShikshanupakaranSummaryView() {

        return document.getElementById(
            "shikshanupakaranSummaryView"
        );

    }


    function getShikshanupakaranSummaryEditor() {

        return document.getElementById(
            "shikshanupakaranSummaryEditor"
        );

    }


    /* ========================================================
       VIEW CONTROL
    ======================================================== */

    function hideShikshanupakaranSummary() {

        const view =
            getShikshanupakaranSummaryView();

        if (!view) {
            return;
        }

        view.style.display =
            "none";

    }


    function showShikshanupakaranSummary() {

        const view =
            getShikshanupakaranSummaryView();

        if (!view) {

            console.warn(
                "Shikshanupakaran Summary view not found."
            );

            return;

        }

        view.style.display =
            "block";

    }


    /* ========================================================
       RENDER SUMMARY PAGE INSIDE SHIKSHANUPAKARAN PAGINATION
       ======================================================== */

    function getShikshanupakaranSummaryRows() {

        const rows =
            Array.isArray(window.shikshanupakaranAllRows)
                ? window.shikshanupakaranAllRows
                : [];

        return rows.filter(
            function(row) {
                return row &&
                    typeof row === "object";
            }
        );

    }


    function parseShikshanupakaranSummaryNumber(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return 0;
        }

        const gujaratiDigits = {
            "૦": "0",
            "૧": "1",
            "૨": "2",
            "૩": "3",
            "૪": "4",
            "૫": "5",
            "૬": "6",
            "૭": "7",
            "૮": "8",
            "૯": "9"
        };

        const normalized =
            String(value)
                .replace(
                    /[૦-૯]/g,
                    function(digit) {
                        return gujaratiDigits[digit];
                    }
                )
                .replace(/,/g, "")
                .trim();

        const number =
            Number(normalized);

        return Number.isFinite(number)
            ? number
            : 0;

    }


    function formatShikshanupakaranSummaryNumber(value) {

        return parseShikshanupakaranSummaryNumber(
            value
        ).toFixed(2);

    }



    function formatShikshanupakaranSummaryChallanMoneyInput(input) {

    if (!input) {
        return;
    }

    const value =
        parseShikshanupakaranSummaryNumber(
            input.value
        );

    input.value =
        convertToGujaratiDigits(
            value.toFixed(2)
        );

}

function calculateShikshanupakaranSummaryChallanRowTotal(row) {

        if (!row) return;

        const previousInput = row.querySelector('[data-challan-field="previous"]');
        const currentInput = row.querySelector('[data-challan-field="current"]');
        const rotatingInput = row.querySelector('[data-challan-field="rotating"]');
        const totalInput = row.querySelector('[data-challan-field="total"]');

        if (!previousInput || !currentInput || !rotatingInput || !totalInput) {
            return;
        }

        const previous = parseShikshanupakaranSummaryNumber(previousInput.value);
        const current = parseShikshanupakaranSummaryNumber(currentInput.value);
        const rotating = parseShikshanupakaranSummaryNumber(rotatingInput.value);

        const total = Number((previous + current + rotating).toFixed(2));

        totalInput.value = convertToGujaratiDigits(total.toFixed(2));

    }

    function formatShikshanupakaranSummaryDate(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return "";
        }

        const text =
            String(value).trim();

        if (
            /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(text)
        ) {
            return text;
        }

        return text;

    }


    function getShikshanupakaranSummaryReceiptGroups() {

        const groups =
            new Map();

        getShikshanupakaranSummaryRows()
            .forEach(
                function(row) {

                    const receipt =
                        row.H === null ||
                        row.H === undefined
                            ? ""
                            : String(row.H).trim();

                    const date =
                        formatShikshanupakaranSummaryDate(
                            row.I
                        );

                    const key =
                        receipt +
                        "||" +
                        date;

                    if (!groups.has(key)) {

                        groups.set(
                            key,
                            {
                                receipt: receipt,
                                date: date,
                                previous: 0,
                                current: 0,
                                surplus: 0,
                                total: 0
                            }
                        );

                    }

                    const group =
                        groups.get(key);

                    group.previous +=
                        parseShikshanupakaranSummaryNumber(
                            row.J
                        );

                    group.current +=
                        parseShikshanupakaranSummaryNumber(
                            row.K
                        );

                    group.surplus +=
                        parseShikshanupakaranSummaryNumber(
                            row.L
                        );

                    group.total +=
                        parseShikshanupakaranSummaryNumber(
                            row.M
                        );

                }
            );

        return Array.from(
            groups.values()
        );

    }

    function renderShikshanupakaranSummaryPage(summaryIndex) {

        const mount =
            document.getElementById(
                "shikshanupakaranSummaryPageMount"
            );

        if (!mount) {
            console.warn(
                "Shikshanupakaran summary mount not found."
            );
            return false;
        }

        const editor =
            getShikshanupakaranSummaryEditor();

        if (!editor) {
            console.warn(
                "Shikshanupakaran summary editor not found."
            );
            return false;
        }

        const pageIndex =
            Math.min(
                4,
                Math.max(
                    1,
                    Number(summaryIndex) || 1
                )
            );

        const page1 =
            editor.querySelector(".shikPage1");

        const page2 =
            editor.querySelector(".shikPage2");

        const page3 =
            editor.querySelector(".shikPage3");

        const page4 =
            editor.querySelector(".shikPage4");

        if (
            pageIndex === 1 ||
            pageIndex === 2 ||
            pageIndex === 3 ||
            pageIndex === 4
        ) {

            showShikshanupakaranSummary();

            mount
                .querySelectorAll(
                    ".shikshanupakaranSummaryPlaceholder"
                )
                .forEach(function(element) {
                    element.remove();
                });

            editor.hidden = false;
            editor.removeAttribute("hidden");
            editor.style.display = "block";
            editor.style.visibility = "visible";
            editor.style.opacity = "1";
            editor.style.width = "100%";

            if (editor.parentElement !== mount) {
                mount.appendChild(editor);
            }

            if (page1) {
                page1.style.display = pageIndex === 1 ? "block" : "none";
            }

            if (page2) {
                page2.style.display =
                    pageIndex === 2
                        ? "block"
                        : "none";
            }

            if (page3) {
                page3.style.display =
                    pageIndex === 3
                        ? "block"
                        : "none";
            }

            if (page4) {
                page4.style.display =
                    pageIndex === 4
                        ? "block"
                        : "none";
            }

            mount.style.display = "block";
            mount.style.width = "100%";

            if (pageIndex === 1) {
                populateSummaryTotals();
            }

            if (pageIndex === 2) {
                setupShikshanupakaranSummaryPage2Calculation();
                calculateShikshanupakaranSummaryPage2();
            }

            if (pageIndex === 3) {
                setupShikshanupakaranSummaryPage3BalanceTable();
                setupShikshanupakaranSummaryPage3Calculation();
                calculateShikshanupakaranSummaryPage3();
            }

            if (pageIndex === 4) {
                populateShikshanupakaranSummaryPage4Header();

                const registerNumber =
                    editor.querySelector(
                        ".shikPage4 input[aria-label=\"સિક્કા રજીસ્ટર નંબર\"]"
                    );

                if (registerNumber && !registerNumber.dataset.gujaratiSetup) {
                    registerNumber.dataset.gujaratiSetup = "true";

                    registerNumber.addEventListener("input", function() {
                        const cursorPosition = registerNumber.selectionStart;

                        const englishValue =
                            convertGujaratiDigitsToEnglish(
                                registerNumber.value
                            );

                        registerNumber.value =
                            convertToGujaratiDigits(
                                englishValue
                            );

                        if (cursorPosition !== null) {
                            registerNumber.setSelectionRange(
                                cursorPosition,
                                cursorPosition
                            );
                        }
                    });
                }
            }

            console.log(
                "SHIKSHANUPAKARAN EDITABLE SUMMARY PAGE RENDERED:",
                pageIndex
            );

            return true;
        }

        editor.hidden = true;
        editor.setAttribute("hidden", "");
        editor.style.display = "none";

        if (editor.parentElement !== mount) {
            mount.appendChild(editor);
        }

        let placeholder =
            mount.querySelector(
                ".shikshanupakaranSummaryPlaceholder"
            );

        if (!placeholder) {

            placeholder =
                document.createElement("div");

            placeholder.className =
                "shikshanupakaranSummaryPlaceholder";

            mount.appendChild(placeholder);
        }

        placeholder.textContent =
            "આ સારાંશ પાનું આગળ તૈયાર કરવામાં આવશે.";

        placeholder.style.display = "block";

        mount.style.display = "block";
        mount.style.width = "100%";

        console.log(
            "SHIKSHANUPAKARAN SUMMARY PAGE RENDERED:",
            pageIndex
        );

        return true;

    }
/* ========================================================
       POPULATE SUMMARY HEADER
       ======================================================== */

    function parseShikshanupakaranSummaryPage3Number(value) {
        if (value === undefined || value === null || value === "") {
            return 0;
        }

        const englishValue =
            convertGujaratiDigitsToEnglish(String(value))
                .replace(/,/g, "")
                .trim();

        const number = Number.parseFloat(englishValue);

        return Number.isFinite(number) ? number : 0;
    }

    function formatShikshanupakaranSummaryPage3Number(value) {
        return convertToGujaratiDigits(
            Number(value || 0).toFixed(2)
        );
    }

    function calculateShikshanupakaranSummaryPage3() {
        const page3 =
            document.querySelector(".shikPage3");

        if (!page3) {
            return;
        }

        const totals = window.shikshanupakaranTotals || {};

        const setPage3Value = function(rowName, fieldName, value) {
            const input = page3.querySelector('tr[data-page3-row="' + rowName + '"] [data-page3-field="' + fieldName + '"]');
            if (input) {
                input.value = formatShikshanupakaranSummaryPage3Number(Number(value || 0));
            }
        };

        setPage3Value("demand", "previous", totals.C);
        setPage3Value("demand", "current", totals.E);
        setPage3Value("demand", "rotating", totals.F);

        const page2 = document.querySelector(".shikPage2");
        const finalCollectionRow = page2?.querySelector('tr[data-page2-total-row="finalCollection"]');

        if (finalCollectionRow) {
            setPage3Value("fixedDemand", "previous", parseShikshanupakaranSummaryNumber(finalCollectionRow.querySelector('[data-page2-field="previous"]')?.textContent));
            setPage3Value("fixedDemand", "current", parseShikshanupakaranSummaryNumber(finalCollectionRow.querySelector('[data-page2-field="current"]')?.textContent));
            setPage3Value("fixedDemand", "rotating", parseShikshanupakaranSummaryNumber(finalCollectionRow.querySelector('[data-page2-field="rotating"]')?.textContent));
        }

        const jadeRow = page3.querySelector('tr[data-page3-row="jadeCollection"]');
        const lapsRow = page3.querySelector('tr[data-page3-row="laps"]');

        if (jadeRow && lapsRow) {
            setPage3Value("nextYearSurplus", "previous", parseShikshanupakaranSummaryPage3Number(jadeRow.querySelector('[data-page3-field="previous"]')?.value) - parseShikshanupakaranSummaryPage3Number(lapsRow.querySelector('[data-page3-field="previous"]')?.value));
            setPage3Value("nextYearSurplus", "current", parseShikshanupakaranSummaryPage3Number(jadeRow.querySelector('[data-page3-field="current"]')?.value) - parseShikshanupakaranSummaryPage3Number(lapsRow.querySelector('[data-page3-field="current"]')?.value));
            setPage3Value("nextYearSurplus", "rotating", parseShikshanupakaranSummaryPage3Number(jadeRow.querySelector('[data-page3-field="rotating"]')?.value) - parseShikshanupakaranSummaryPage3Number(lapsRow.querySelector('[data-page3-field="rotating"]')?.value));
        }
        page3
            .querySelectorAll(".shikPage3EditableRow")
            .forEach(function(row) {

                const previous =
                    parseShikshanupakaranSummaryPage3Number(
                        row.querySelector(
                            '[data-page3-field="previous"]'
                        )?.value
                    );

                const current =
                    parseShikshanupakaranSummaryPage3Number(
                        row.querySelector(
                            '[data-page3-field="current"]'
                        )?.value
                    );

                const rotating =
                    parseShikshanupakaranSummaryPage3Number(
                        row.querySelector(
                            '[data-page3-field="rotating"]'
                        )?.value
                    );

                const totalCell =
                    row.querySelector(
                        '[data-page3-field="total"]'
                    );

                if (!totalCell) {
                    return;
                }

                totalCell.textContent =
                    formatShikshanupakaranSummaryPage3Number(
                        previous + current + rotating
                    );
            });
    }


 /* ============================================================
   SHIKSHANUPAKARAN SUMMARY — PAGE 3
   BAKI NI TARIZ TABLE CALCULATION
   ============================================================ */

function setupShikshanupakaranSummaryPage3BalanceTable() {
    const page3 = document.querySelector(".shikPage3");

    if (!page3) {
        return;
    }

    const balanceInputs = page3.querySelectorAll(
        '[data-page3-balance-field^="year"], [data-page3-balance-field^="amount"]'
    );

    balanceInputs.forEach(function(input) {
        if (input.dataset.balanceSetup === "true") {
            return;
        }

        input.dataset.balanceSetup = "true";

        input.addEventListener("input", function() {
            calculateShikshanupakaranSummaryPage3BalanceTable();
        });

        input.addEventListener("blur", function() {
            const field = input.dataset.page3BalanceField || "";

            if (field.startsWith("year")) {
                input.value = convertToGujaratiDigits(input.value);
            } else {
                const rawValue = input.value;

                if (rawValue.trim() !== "") {
                    input.value = formatShikshanupakaranSummaryPage3Number(
                        parseShikshanupakaranSummaryPage3Number(rawValue)
                    );
                }
            }

            calculateShikshanupakaranSummaryPage3BalanceTable();
        });
    });

    calculateShikshanupakaranSummaryPage3BalanceTable();
}


function calculateShikshanupakaranSummaryPage3BalanceTable() {
    const page3 = document.querySelector(".shikPage3");

    if (!page3) {
        return;
    }

    const amount1 = parseShikshanupakaranSummaryPage3Number(
        page3.querySelector('[data-page3-balance-field="amount1"]')?.value
    );

    const amount2 = parseShikshanupakaranSummaryPage3Number(
        page3.querySelector('[data-page3-balance-field="amount2"]')?.value
    );

    const amount3 = parseShikshanupakaranSummaryPage3Number(
        page3.querySelector('[data-page3-balance-field="amount3"]')?.value
    );

    const total = amount1 + amount2 + amount3;

    const totalField = page3.querySelector(
        '[data-page3-balance-field="total"]'
    );

    if (totalField) {
        totalField.textContent =
            formatShikshanupakaranSummaryPage3Number(total);
    }
}


function setupShikshanupakaranSummaryPage3Calculation() {
        const page3 =
            document.querySelector(".shikPage3");

        if (!page3) {
            return;
        }

        if (
            page3.dataset.page3CalculationReady === "true"
        ) {
            return;
        }

        page3.dataset.page3CalculationReady = "true";

        page3.addEventListener(
            "input",
            function(event) {

                const input =
                    event.target.closest(
                        'input[data-page3-field]'
                    );

                if (!input) {
                    return;
                }

                input.value =
                    convertToGujaratiDigits(
                        convertGujaratiDigitsToEnglish(
                            input.value
                        )
                    );

                calculateShikshanupakaranSummaryPage3();
            }
        );

        page3.addEventListener(
            "blur",
            function(event) {

                const input =
                    event.target.closest(
                        'input[data-page3-field]'
                    );

                if (!input) {
                    return;
                }

                const number =
                    parseShikshanupakaranSummaryPage3Number(
                        input.value
                    );

                input.value =
                    formatShikshanupakaranSummaryPage3Number(
                        number
                    );

                calculateShikshanupakaranSummaryPage3();
            },
            true
        );

        calculateShikshanupakaranSummaryPage3();
    }


    function populateShikshanupakaranSummaryPage4Header() {

        const page4 =
            document.querySelector(".shikPage4");

        if (!page4) {
            return;
        }

        const moje =
            document.getElementById(
                "shikshanupakaranMoje"
            )?.value?.trim() || "-";

        const taluka =
            document.getElementById(
                "shikshanupakaranTaluka"
            )?.value?.trim() || "-";

        const jillo =
            document.getElementById(
                "shikshanupakaranJillo"
            )?.value?.trim() || "-";

        const year =
            document.getElementById(
                "shikshanupakaranYear"
            )?.value?.trim() || "-";

        const gujaratiDigits = function(value) {
            return value.toString().replace(/[0-9]/g, function(digit) {
                return "૦૧૨૩૪૫૬૭૮૯"[Number(digit)];
            });
        };

        const lastPage =
            (Number(
                window.shikshanupakaranTotalPages
            ) || 1) + 4;

        page4
            .querySelectorAll(
                '[data-shik-page4-header="moje"]'
            )
            .forEach(function(element) {
                element.textContent = moje;
            });

        page4
            .querySelectorAll(
                '[data-shik-page4-header="taluka"]'
            )
            .forEach(function(element) {
                element.textContent = taluka;
            });

        page4
            .querySelectorAll(
                '[data-shik-page4-header="jillo"]'
            )
            .forEach(function(element) {
                element.textContent = jillo;
            });

        page4
            .querySelectorAll(
                '[data-shik-page4-header="year"]'
            )
            .forEach(function(element) {
                element.textContent = gujaratiDigits(year);
            });

        page4
            .querySelectorAll(
                '[data-shik-page4-header="last-page"]'
            )
            .forEach(function(element) {
                element.textContent = gujaratiDigits(lastPage);
            });

    }




    function populateSummaryTotals() {

        const totals =
            window.shikshanupakaranTotals;


        if (
            !totals ||
            typeof totals !== "object"
        ) {

            console.warn(
                "Shikshanupakaran totals are not generated yet."
            );

            return false;

        }


        const fieldMap = {

            previousAuthorized:
                "C",

            previousUnauthorized:
                "D",

            governmentDemand:
                "E",

            inamiDemand:
                "F",

            totalDemand:
                "G",

            previousCollection:
                "J",

            currentCollection:
                "K",

            surplusCollection:
                "L",

            totalCollection:
                "M",

            actualCollection:
                "N",

            unauthorizedOutstanding:
                "O",

            publicCollection:
                "P"

        };


        Object.keys(fieldMap)
            .forEach(
                function(field){

                    const element =
                        document.querySelector(
                            '[data-shik-summary="' +
                            field +
                            '"]'
                        );


                    if (!element) {
                        return;
                    }


                    const column =
                        fieldMap[field];


                    const value =
                        totals[column];


                    element.value =
                        value === undefined ||
                        value === null
                            ? ""
                            : String(value);

                }
            );


        /*
            Populate Page 1 year-total collection row
            from the generated Shikshanupakaran totals.
        */

        /*
            Calculate Page 1 year-total collection row
            from the visible challan rows.
        */

        const challanBody =
            document.getElementById(
                "shikshanupakaranSummaryChallanBody"
            );

        let yearPreviousTotal = 0;
        let yearCurrentTotal = 0;
        let yearRotatingTotal = 0;

        if (challanBody) {

            challanBody
                .querySelectorAll(
                    "tr.shikSummaryDynamicRow"
                )
                .forEach(function(row) {

                    yearPreviousTotal +=
                        parseShikshanupakaranSummaryNumber(
                            row.querySelector(
                                '[data-challan-field="previous"]'
                            )?.value
                        );

                    yearCurrentTotal +=
                        parseShikshanupakaranSummaryNumber(
                            row.querySelector(
                                '[data-challan-field="current"]'
                            )?.value
                        );

                    yearRotatingTotal +=
                        parseShikshanupakaranSummaryNumber(
                            row.querySelector(
                                '[data-challan-field="rotating"]'
                            )?.value
                        );

                });

        }

        const yearGrandTotal =
            yearPreviousTotal +
            yearCurrentTotal +
            yearRotatingTotal;

        const yearTotalValues = {
            shikshanupakaranSummaryChallanPreviousTotal:
                yearPreviousTotal,

            shikshanupakaranSummaryChallanCurrentTotal:
                yearCurrentTotal,

            shikshanupakaranSummaryChallanRotatingTotal:
                yearRotatingTotal,

            shikshanupakaranSummaryChallanGrandTotal:
                yearGrandTotal
        };

        Object.keys(yearTotalValues)
            .forEach(function(id) {

                const element =
                    document.getElementById(id);

                if (!element) {
                    return;
                }

                element.value =
                    convertToGujaratiDigits(
                        Number(
                            yearTotalValues[id] || 0
                        ).toFixed(2)
                    );

            });
        /*
            Populate Page 2 "વર્ષનું કુલ વસુલ"
            from the same four values used by Page 1.
        */

        const page2YearTotalValues = {
            shikshanupakaranSummaryPage2YearPrevious:
                yearPreviousTotal,

            shikshanupakaranSummaryPage2YearCurrent:
                yearCurrentTotal,

            shikshanupakaranSummaryPage2YearRotating:
                yearRotatingTotal,

            shikshanupakaranSummaryPage2YearTotal:
                yearGrandTotal
        };


        Object.keys(page2YearTotalValues)
            .forEach(function(id) {

                const element =
                    document.getElementById(id);

                if (!element) {
                    return;
                }

                element.textContent =
                    convertToGujaratiDigits(
                        Number(
                            page2YearTotalValues[id] || 0
                        ).toFixed(2)
                    );

            });

        const grandTotal =
            document.getElementById(
                "shikshanupakaranSummaryGrandTotal"
            );


        if (grandTotal) {

            const total =
                Number(
                    totals.G || 0
                );


            grandTotal.value = total.toFixed(2);

        }


        return true;

    }


    /* ========================================================
       GENERATE SUMMARY
       ======================================================== */

    function generateSummary() {

        const totalsReady =
            populateSummaryTotals();


        if (!totalsReady) {
            return false;
        }


        console.log(
            "SHIKSHANUPAKARAN SUMMARY GENERATED"
        );


        return true;

    }


    /* ========================================================
       CREATE PRINT PAGES
       --------------------------------------------------------
       Summary pages are completely separate from the normal
       Shikshanupakaran editor pagination.
       ======================================================== */

    function createPrintPages(
        container,
        firstPageNumber
    ) {

        if (!container) {
            return 0;
        }


        const editor =
            getShikshanupakaranSummaryEditor();


        if (!editor) {

            console.warn(
                "Shikshanupakaran Summary editor not found."
            );

            return 0;

        }


        const source =
            editor.cloneNode(true);


        source.removeAttribute("id");


        source
            .querySelectorAll(
                "[id]"
            )
            .forEach(
                function(element) {

                    element.removeAttribute("id");

                }
            );


        source
            .querySelectorAll(
                "button"
            )
            .forEach(
                function(button) {

                    button.remove();

                }
            );


        source
            .querySelectorAll(
                "input, textarea, select"
            )
            .forEach(
                function(element) {

                    const value =
                        element.value || "";

                    const span =
                        document.createElement(
                            "span"
                        );

                    span.textContent =
                        value;

                    span.className =
                        "shikshanupakaranSummaryPrintValue";

                    if (element.closest(".shikPage1NotesSection")) {
                        span.className += " shikPage1PrintNotesText";
                        span.textContent = "";

                        value.split(/\r?\n/).forEach(function(line, index) {
                            if (index > 0) {
                                span.appendChild(document.createElement("br"));
                            }
                            span.appendChild(document.createTextNode(line));
                        });
                    }


                    element.replaceWith(
                        span
                    );

                }
            );


        const pageSources =
            Array.from(
                source.querySelectorAll(
                    ".summaryDocumentSection"
                )
            );


        if (pageSources.length === 0) {
            pageSources.push(source);
        }


        pageSources.forEach(
            function(pageSource, index) {

                const page =
                    document.createElement(
                        "div"
                    );


                page.className =
                    "shikshanupakaranSummaryPrintPage";


                page.dataset.page =
                    firstPageNumber + index;


                const infoPanel =
                    document.querySelector(
                        ".shikshanupakaranInfoPanel"
                    );

                if (infoPanel) {

                    const printInfoPanel =
                        infoPanel.cloneNode(true);

                    const originalControls =
                        infoPanel.querySelectorAll(
                            "textarea, input, select"
                        );

                    const clonedControls =
                        printInfoPanel.querySelectorAll(
                            "textarea, input, select"
                        );

                    originalControls.forEach(
                        function(originalElement, controlIndex) {

                            const clonedElement =
                                clonedControls[controlIndex];

                            if (!clonedElement) {
                                return;
                            }

                            clonedElement.value =
                                originalElement.value;

                        }
                    );

                    printInfoPanel.classList.add(
                        "shikshanupakaranPrintInfoPanel"
                    );

                    printInfoPanel
                        .querySelectorAll(
                            "textarea, input, select"
                        )
                        .forEach(function(element) {

                            const value =
                                element.value || "";

                            const displayValue =
                                element.tagName === "SELECT" &&
                                element.id === "shikshanupakaranYear"
                                    ? convertToGujaratiDigits(value)
                                    : value;

                            const span =
                                document.createElement("span");

                            span.className =
                                "shikshanupakaranPrintInfoValue";

                            span.textContent =
                                displayValue;

                            element.replaceWith(span);

                        });

                    page.appendChild(
                        printInfoPanel
                    );

                }

                const printPageSource = pageSource.cloneNode(true);

                const printNotes = printPageSource.querySelector(
                    ".shikPage1NotesSection textarea"
                );

                if (printNotes) {
                    const printNotesText = document.createElement("div");
                    printNotesText.className = "shikPage1PrintNotesText";
                    printNotesText.textContent = printNotes.value;
                    printNotes.replaceWith(printNotesText);
                }

                page.appendChild(
                    printPageSource
                );


                const pageNumberElement =
                    document.createElement(
                        "div"
                    );


                pageNumberElement.className =
                    "shikshanupakaranSummaryPrintPageNumber";


                pageNumberElement.textContent =
                    "Page " +
                    (firstPageNumber + index);


                const footer =
                    document.createElement(
                        "div"
                    );


                footer.className =
                    "shikshanupakaranSummaryPrintFooter";


                footer.appendChild(
                    pageNumberElement
                );


                page.appendChild(
                    footer
                );


                container.appendChild(
                    page
                );


                console.log(
                    "SHIKSHANUPAKARAN SUMMARY PRINT PAGE CREATED:",
                    firstPageNumber + index
                );

            }
        );


        return pageSources.length;

    }


    /* ========================================================
       INITIALIZATION
       ======================================================== */

    function initializeShikshanupakaranSummary() {

        const view =
            getShikshanupakaranSummaryView();

        setupShikshanupakaranSummaryChallanMoneyFormatting();



        if (!view) {

            console.warn(
                "Shikshanupakaran Summary HTML is not loaded yet."
            );

            return false;

        }


        if (typeof setupIndianDatePicker === "function") {

            setupIndianDatePicker();
            setupShikshanupakaranSummaryChallanNumberFormatting();

            setupShikshanupakaranSummaryChallanCalculation();

        }

        setupShikshanupakaranSummaryPage2Calculation();


        hideShikshanupakaranSummary();


        console.log(
            "Shikshanupakaran Summary initialized."
        );


        return true;

    }


    /* ========================================================
       PUBLIC API
       ======================================================== */

    window.shikshanupakaranSummary = {

        initialize:
            initializeShikshanupakaranSummary,

        show:
            showShikshanupakaranSummary,

        hide:
            hideShikshanupakaranSummary,

        getView:
            getShikshanupakaranSummaryView,

        getEditor:
            getShikshanupakaranSummaryEditor,

        generate:
            generateSummary,


        renderPage:
            renderShikshanupakaranSummaryPage,

        createPrintPages:
            createPrintPages

    };


    initializeShikshanupakaranSummary();


/* ============================================================
   SHIKSHANUPAKARAN SUMMARY PAGE 1
   INLINE ADD / DELETE CHALLAN ROWS
============================================================ */

function setupShikshanupakaranSummaryChallanMoneyFormatting() {

    const table = document.getElementById(
        "shikshanupakaranSummaryChallanTable"
    );

    if (!table) return;

    if (table.dataset.moneyFormattingReady === "true") return;

    table.dataset.moneyFormattingReady = "true";

    table.addEventListener("blur", function(event) {

        const input = event.target.closest(
            '[data-challan-field="previous"], [data-challan-field="current"], [data-challan-field="rotating"]'
        );

        if (!input) return;

        formatShikshanupakaranSummaryChallanMoneyInput(input);

    }, true);

}

function updateShikshanupakaranSummaryChallanYearTotals() {

    const body =
        document.getElementById(
            "shikshanupakaranSummaryChallanBody"
        );

    if (!body) return;

    let previousTotal = 0;
    let currentTotal = 0;
    let rotatingTotal = 0;

    body
        .querySelectorAll(
            "tr.shikSummaryDynamicRow"
        )
        .forEach(function(row) {

            previousTotal +=
                parseShikshanupakaranSummaryNumber(
                    row.querySelector(
                        '[data-challan-field="previous"]'
                    )?.value
                );

            currentTotal +=
                parseShikshanupakaranSummaryNumber(
                    row.querySelector(
                        '[data-challan-field="current"]'
                    )?.value
                );

            rotatingTotal +=
                parseShikshanupakaranSummaryNumber(
                    row.querySelector(
                        '[data-challan-field="rotating"]'
                    )?.value
                );

        });

    const grandTotal =
        previousTotal +
        currentTotal +
        rotatingTotal;

    const page2YearTotalValues = {
        shikshanupakaranSummaryPage2YearPrevious:
            previousTotal,

        shikshanupakaranSummaryPage2YearCurrent:
            currentTotal,

        shikshanupakaranSummaryPage2YearRotating:
            rotatingTotal,

        shikshanupakaranSummaryPage2YearTotal:
            grandTotal
    };

    Object.keys(page2YearTotalValues)
        .forEach(function(id) {

            const element =
                document.getElementById(id);

            if (!element) {
                return;
            }

            element.textContent =
                convertToGujaratiDigits(
                    Number(
                        page2YearTotalValues[id] || 0
                    ).toFixed(2)
                );

        });

    const totals = {
        shikshanupakaranSummaryChallanPreviousTotal:
            previousTotal,

        shikshanupakaranSummaryChallanCurrentTotal:
            currentTotal,

        shikshanupakaranSummaryChallanRotatingTotal:
            rotatingTotal,

        shikshanupakaranSummaryChallanGrandTotal:
            grandTotal
    };

    Object.keys(totals)
        .forEach(function(id) {

            const element =
                document.getElementById(id);

            if (!element) return;

            element.value =
                convertToGujaratiDigits(
                    Number(totals[id]).toFixed(2)
                );

        });

}
function calculateShikshanupakaranSummaryPage2() {

    const page2 = document.querySelector(".shikPage2");

    if (!page2) return;

    const number = function(value) {
        return parseShikshanupakaranSummaryNumber(value);
    };

    const money = function(value) {
        return convertToGujaratiDigits(
            Number(value || 0).toFixed(2)
        );
    };

    const getRow = function(rowName) {
        return page2.querySelector(
            'tr[data-page2-row="' + rowName + '"]'
        );
    };

    const getValue = function(rowName, fieldName) {
        const row = getRow(rowName);

        if (!row) return 0;

        const field = row.querySelector(
            '[data-page2-field="' + fieldName + '"]'
        );

        if (!field) return 0;

        return number(
            field.value !== undefined
                ? field.value
                : field.textContent
        );
    };

    const setTotal = function(rowName, previous, current, rotating) {

        const row = getRow(rowName);

        if (!row) return;

        const totalField = row.querySelector(
            '[data-page2-field="total"]'
        );

        if (!totalField) return;

        totalField.textContent = money(
            previous + current + rotating
        );
    };

    const setCalculatedRow = function(rowSelector, previous, current, rotating) {

        const row = page2.querySelector(rowSelector);

        if (!row) return;

        const fields = {
            previous: previous,
            current: current,
            rotating: rotating,
            total: previous + current + rotating
        };

        Object.keys(fields).forEach(function(fieldName) {

            const element = row.querySelector(
                '[data-page2-field="' + fieldName + '"]'
            );

            if (!element) return;

            element.textContent = money(fields[fieldName]);

        });
    };

    const editableRows = [
        "jadesh1",
        "jadesh2",
        "baad1",
        "baad2",
        "baad3"
    ];

    editableRows.forEach(function(rowName) {

        const previous = getValue(rowName, "previous");
        const current = getValue(rowName, "current");
        const rotating = getValue(rowName, "rotating");

        setTotal(
            rowName,
            previous,
            current,
            rotating
        );

    });

    const yearPrevious = number(
        page2.querySelector(
            "#shikshanupakaranSummaryPage2YearPrevious"
        )?.textContent
    );

    const yearCurrent = number(
        page2.querySelector(
            "#shikshanupakaranSummaryPage2YearCurrent"
        )?.textContent
    );

    const yearRotating = number(
        page2.querySelector(
            "#shikshanupakaranSummaryPage2YearRotating"
        )?.textContent
    );

    const jadePrevious =
        getValue("jadesh1", "previous") +
        getValue("jadesh2", "previous");

    const jadeCurrent =
        getValue("jadesh1", "current") +
        getValue("jadesh2", "current");

    const jadeRotating =
        getValue("jadesh1", "rotating") +
        getValue("jadesh2", "rotating");

    setCalculatedRow(
        'tr[data-page2-total-row="jade"]',
        jadePrevious,
        jadeCurrent,
        jadeRotating
    );

    const grandCollectionPrevious =
        yearPrevious + jadePrevious;

    const grandCollectionCurrent =
        yearCurrent + jadeCurrent;

    const grandCollectionRotating =
        yearRotating + jadeRotating;

    setCalculatedRow(
        'tr[data-page2-total-row="grandCollection"]',
        grandCollectionPrevious,
        grandCollectionCurrent,
        grandCollectionRotating
    );

    const baadPrevious =
        getValue("baad1", "previous") +
        getValue("baad2", "previous") +
        getValue("baad3", "previous");

    const baadCurrent =
        getValue("baad1", "current") +
        getValue("baad2", "current") +
        getValue("baad3", "current");

    const baadRotating =
        getValue("baad1", "rotating") +
        getValue("baad2", "rotating") +
        getValue("baad3", "rotating");

    setCalculatedRow(
        'tr[data-page2-total-row="baad"]',
        baadPrevious,
        baadCurrent,
        baadRotating
    );

    const grandBaadPrevious =
        grandCollectionPrevious - baadPrevious;

    const grandBaadCurrent =
        grandCollectionCurrent - baadCurrent;

    const grandBaadRotating =
        grandCollectionRotating - baadRotating;

    setCalculatedRow(
        'tr[data-page2-total-row="grandBaad"]',
        grandBaadPrevious,
        grandBaadCurrent,
        grandBaadRotating
    );

    const headferPrevious =
        getValue("headfer", "previous");

    const headferCurrent =
        getValue("headfer", "current");

    const headferRotating =
        getValue("headfer", "rotating");

    const jadeFinalPrevious =
        getValue("jadeFinal", "previous");

    const jadeFinalCurrent =
        getValue("jadeFinal", "current");

    const jadeFinalRotating =
        getValue("jadeFinal", "rotating");

    const finalPrevious =
        grandBaadPrevious -
        headferPrevious +
        jadeFinalPrevious;

    const finalCurrent =
        grandBaadCurrent -
        headferCurrent +
        jadeFinalCurrent;

    const finalRotating =
        grandBaadRotating -
        headferRotating +
        jadeFinalRotating;

    setCalculatedRow(
        'tr[data-page2-total-row="finalCollection"]',
        finalPrevious,
        finalCurrent,
        finalRotating
    );

}

function setupShikshanupakaranSummaryPage2Calculation() {

    const page2Table =
        document.querySelector(".shikPage2AccountingTable");

    if (!page2Table) return;

    if (page2Table.dataset.calculationReady === "true") {
        calculateShikshanupakaranSummaryPage2();
        return;
    }

    page2Table.dataset.calculationReady = "true";

    page2Table.addEventListener("input", function(event) {

        const input = event.target.closest(
            '[data-page2-field="previous"], [data-page2-field="current"], [data-page2-field="rotating"], [data-page2-field="total"]'
        );

        if (!input) return;

        const row = input.closest(
            "tr[data-page2-row]"
        );

        if (row) {

            const rowName =
                row.getAttribute("data-page2-row");

            if (
                rowName === "jadesh1" ||
                rowName === "jadesh2" ||
                rowName === "baad1" ||
                rowName === "baad2" ||
                rowName === "baad3"
            ) {
                const previous = parseShikshanupakaranSummaryNumber(
                    row.querySelector(
                        '[data-page2-field="previous"]'
                    )?.value
                );

                const current = parseShikshanupakaranSummaryNumber(
                    row.querySelector(
                        '[data-page2-field="current"]'
                    )?.value
                );

                const rotating = parseShikshanupakaranSummaryNumber(
                    row.querySelector(
                        '[data-page2-field="rotating"]'
                    )?.value
                );

                const total = row.querySelector(
                    '[data-page2-field="total"]'
                );

                if (total) {
                    total.textContent =
                        convertToGujaratiDigits(
                            Number(
                                previous +
                                current +
                                rotating
                            ).toFixed(2)
                        );
                }
            }
        }

        calculateShikshanupakaranSummaryPage2();

    });

    page2Table.addEventListener("blur", function(event) {

        const input = event.target.closest(
            '[data-page2-field="previous"], [data-page2-field="current"], [data-page2-field="rotating"], [data-page2-field="total"]'
        );

        if (!input) return;

        const value =
            parseShikshanupakaranSummaryNumber(
                input.value
            );

        input.value =
            convertToGujaratiDigits(
                Number(value || 0).toFixed(2)
            );

        calculateShikshanupakaranSummaryPage2();

    }, true);

    calculateShikshanupakaranSummaryPage2();

}

function setupShikshanupakaranSummaryChallanCalculation() {

    const table = document.getElementById('shikshanupakaranSummaryChallanTable');

    if (!table) return;

    if (table.dataset.calculationReady === "true") return;

    table.dataset.calculationReady = "true";

    table.addEventListener("input", function(event) {

        const input = event.target.closest('[data-challan-field="previous"], [data-challan-field="current"], [data-challan-field="rotating"]');

        if (!input) return;

        const row = input.closest("tr.shikSummaryDynamicRow");

        calculateShikshanupakaranSummaryChallanRowTotal(row);


        updateShikshanupakaranSummaryChallanYearTotals();
    });

}


function setupShikshanupakaranSummaryChallanNumberFormatting() {

    const table = document.getElementById(
        "shikshanupakaranSummaryChallanTable"
    );

    if (!table) {
        return;
    }

    if (table.dataset.challanNumberFormattingReady === "true") {
        return;
    }

    table.dataset.challanNumberFormattingReady = "true";

    table.addEventListener("input", function (event) {

        const input = event.target.closest(
            '[data-challan-field="challanNumber"]'
        );

        if (!input) {
            return;
        }

        const cursorPosition = input.selectionStart;

        input.value = convertToGujaratiDigits(input.value);

        if (cursorPosition !== null) {
            input.setSelectionRange(
                cursorPosition,
                cursorPosition
            );
        }

    });

    table.addEventListener("blur", function (event) {

        const input = event.target.closest(
            '[data-challan-field="challanNumber"]'
        );

        if (!input) {
            return;
        }

        input.value = convertToGujaratiDigits(input.value);

    }, true);
}

function setupShikshanupakaranSummaryChallanRowActions() {

    const table = document.getElementById(
        "shikshanupakaranSummaryChallanTable"
    );

    const body = document.getElementById(
        "shikshanupakaranSummaryChallanBody"
    );

    if (!table || !body) {
        return;
    }

    if (table.dataset.rowActionsReady === "true") {
        return;
    }

    table.dataset.rowActionsReady = "true";

    table.addEventListener("click", function (event) {

        const addButton = event.target.closest(
            '[data-action="add-challan-row"]'
        );

        if (addButton) {
            event.preventDefault();
            addShikshanupakaranSummaryChallanRow();
            return;
        }

        const deleteButton = event.target.closest(
            '[data-action="delete-challan-row"]'
        );

        if (deleteButton) {
            event.preventDefault();
            deleteShikshanupakaranSummaryChallanRow(
                deleteButton
            );
        }

    });
}


function addShikshanupakaranSummaryChallanRow() {

    const body = document.getElementById(
        "shikshanupakaranSummaryChallanBody"
    );

    if (!body) {
        return;
    }

    const rows = body.querySelectorAll(
        "tr.shikSummaryDynamicRow"
    );

    if (!rows.length) {
        return;
    }

    const templateRow = rows[0];
    const newRow = templateRow.cloneNode(true);

    newRow.querySelectorAll("input").forEach(function (input) {
        input.value = "";
    });

    newRow.querySelectorAll(
        ".summaryRowNumber"
    ).forEach(function (cell) {
        cell.textContent = "";
    });

    body.appendChild(newRow);

    if (typeof setupIndianDatePicker === "function") {

        setupIndianDatePicker();


    }

    renumberShikshanupakaranSummaryChallanRows();

    const firstInput = newRow.querySelector("input");

    if (firstInput) {
        firstInput.focus();
    }
}


function deleteShikshanupakaranSummaryChallanRow(
    deleteButton
) {

    const body = document.getElementById(
        "shikshanupakaranSummaryChallanBody"
    );

    if (!body) {
        return;
    }

    const row = deleteButton.closest(
        "tr.shikSummaryDynamicRow"
    );

    if (!row) {
        return;
    }

    const rows = body.querySelectorAll(
        "tr.shikSummaryDynamicRow"
    );

    if (rows.length <= 1) {
        row.querySelectorAll("input").forEach(function (input) {
            input.value = "";
        });

        return;
    }

    row.remove();

    renumberShikshanupakaranSummaryChallanRows();
}


function renumberShikshanupakaranSummaryChallanRows() {

    const body = document.getElementById(
        "shikshanupakaranSummaryChallanBody"
    );

    if (!body) {
        return;
    }

    const rows = body.querySelectorAll(
        "tr.shikSummaryDynamicRow"
    );

    const gujaratiDigits = [
        "૦", "૧", "૨", "૩", "૪",
        "૫", "૬", "૭", "૮", "૯"
    ];

    rows.forEach(function (row, index) {

        const numberCell = row.querySelector(
            ".summaryRowNumber"
        );

        if (!numberCell) {
            return;
        }

        const number = String(index + 1)
            .split("")
            .map(function (digit) {
                return gujaratiDigits[
                    Number(digit)
                ];
            })
            .join("");

        numberCell.textContent = number;
    });
}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        setupShikshanupakaranSummaryChallanRowActions
    );

} else {

    setupShikshanupakaranSummaryChallanRowActions();

}


/* ============================================================
   SHIKSHANUPAKARAN ACCOUNTING ROW ACTIONS
============================================================ */

function setupShikshanupakaranAccountingRowActions() {

    const section = document.querySelector(
        ".shikPage1AccountingSummary"
    );

    if (!section) {
        return;
    }

    if (section.dataset.rowActionsReady === "true") {
        return;
    }

    section.dataset.rowActionsReady = "true";

    section.addEventListener("click", function (event) {

        const addButton = event.target.closest(
            '[data-action="add-accounting-row"]'
        );

        if (addButton) {
            event.preventDefault();
            addShikshanupakaranAccountingRow(addButton);
            return;
        }

        const deleteButton = event.target.closest(
            '[data-action="delete-accounting-row"]'
        );

        if (deleteButton) {
            event.preventDefault();
            deleteShikshanupakaranAccountingRow(
                deleteButton
            );
        }

    });
}


function addShikshanupakaranAccountingRow(addButton) {

    const row = addButton.closest("tr");

    if (!row) {
        return;
    }

    const newRow = row.cloneNode(true);

    newRow.querySelectorAll("input").forEach(function (input) {
        input.value = "0.00";
    });

    const descriptionInput = newRow.querySelector(
        'input[data-shik-accounting-field^="description-"]'
    );

    if (descriptionInput) {
        descriptionInput.value = "";
    }

    const serialCell = newRow.querySelector(
        ".shikAccountingSerial"
    );

    if (serialCell) {
        serialCell.textContent = "";
    }

    row.parentNode.insertBefore(
        newRow,
        row.nextSibling
    );

    renumberShikshanupakaranAccountingRows();

    const firstInput = newRow.querySelector("input");

    if (firstInput) {
        firstInput.focus();
    }
}


function deleteShikshanupakaranAccountingRow(
    deleteButton
) {

    const row = deleteButton.closest("tr");

    if (!row) {
        return;
    }

    const section = deleteButton.closest(
        ".shikPage1AccountingSummary"
    );

    if (!section) {
        return;
    }

    const dataRows = Array.from(
        section.querySelectorAll(
            "tbody tr"
        )
    ).filter(function (item) {

        return (
            !item.classList.contains(
                "shikAccountingSectionRow"
            ) &&
            item.querySelector(
                ".shikAccountingSerial"
            )
        );

    });

    if (dataRows.length <= 1) {
        row.querySelectorAll("input").forEach(
            function (input) {
                input.value = "";
            }
        );

        return;
    }

    row.remove();

    renumberShikshanupakaranAccountingRows();
}


function renumberShikshanupakaranAccountingRows() {

    const section = document.querySelector(
        ".shikPage1AccountingSummary"
    );

    if (!section) {
        return;
    }

    const serialCells = section.querySelectorAll(
        ".shikAccountingSerial"
    );

    const gujaratiDigits = [
        "૦", "૧", "૨", "૩", "૪",
        "૫", "૬", "૭", "૮", "૯"
    ];

    serialCells.forEach(function (cell, index) {

        const number = String(index + 1)
            .split("")
            .map(function (digit) {
                return gujaratiDigits[
                    Number(digit)
                ];
            })
            .join("");

        cell.textContent = number;
    });
}


function initializeShikshanupakaranAccountingRowActions() {

    setupShikshanupakaranAccountingRowActions();

}


if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeShikshanupakaranAccountingRowActions
    );

} else {

    initializeShikshanupakaranAccountingRowActions();

}
})();




















































/* PAGE 1 — AUTO-GROW શેરો / નોંધ TEXTAREA */
function setupShikPage1NotesAutoGrow() {

    const notes =
        document.querySelector(
            ".shikPage1NotesSection textarea"
        );

    if (!notes || notes.dataset.autoGrowReady === "true") {
        return;
    }

    function resizeNotes() {
        notes.style.height = "auto";
        notes.style.height = notes.scrollHeight + "px";
    }

    notes.addEventListener(
        "input",
        resizeNotes
    );

    resizeNotes();

    notes.dataset.autoGrowReady = "true";
}






/* PAGE 1 — AUTO-GROW NOTES WHEN USER TYPES */
document.addEventListener("input", function(event) {

    const notes =
        event.target.closest(
            ".shikPage1NotesSection textarea"
        );

    if (!notes) {
        return;
    }

    notes.style.height = "auto";
    notes.style.height =
        notes.scrollHeight + "px";

});









