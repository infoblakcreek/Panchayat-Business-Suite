/* ============================================================
   TALAPATRAK SUMMARY
   ============================================================

   Dedicated Summary system for Talapatrak.

   IMPORTANT:
   ------------------------------------------------------------
   This file does NOT modify Talapatrak pagination.
   This file does NOT modify the existing Talapatrak editor.
   This file does NOT generate print pages yet.

   Summary data and print integration will be added separately.
   ============================================================ */


(function () {

    "use strict";


    /* ========================================================
       ELEMENT ACCESS
    ======================================================== */

    function getTalapatrakSummaryView() {

        return document.getElementById(
            "talapatrakSummaryView"
        );

    }


    function getTalapatrakSummaryEditor() {

        return document.getElementById(
            "talapatrakSummaryEditor"
        );

    }


    /* ========================================================
       VIEW CONTROL
    ======================================================== */

    function hideTalapatrakSummary() {

        const view =
            getTalapatrakSummaryView();

        setupTalapatrakSummaryChallanMoneyFormatting();

        if (!view) {

            return;

        }


        view.style.display =
            "none";

    }


    function showTalapatrakSummary() {

        const view =
            getTalapatrakSummaryView();

        setupTalapatrakSummaryChallanMoneyFormatting();

        if (!view) {

            console.warn(
                "Talapatrak Summary view not found."
            );

            return;

        }


        view.style.display =
            "block";

    }


    /* ========================================================
       INITIALIZATION
    ======================================================== */

    /* ========================================================
       CREATE PRINT PAGES
    ======================================================== */

    function createPrintPages(container, firstPageNumber) {

        if (!container) {
            return 0;
        }

        const editor =
            getTalapatrakSummaryEditor();

        if (!editor) {
            console.warn(
                "TALAPATRAK SUMMARY EDITOR NOT FOUND"
            );
            return 0;
        }

        const source =
            editor.cloneNode(true);

        source.removeAttribute("id");

        source
            .querySelectorAll("[id]")
            .forEach(
                function(element) {
                    element.removeAttribute("id");
                }
            );

        source
            .querySelectorAll("button")
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
                        "talapatrakSummaryPrintValue";

                    if (
                        element.closest(
                            ".talaPage1NotesSection"
                        )
                    ) {

                        span.className +=
                            " talaPage1PrintNotesText";

                        span.textContent = "";

                        value
                            .split(/\r?\n/)
                            .forEach(
                                function(
                                    line,
                                    index
                                ) {

                                    if (index > 0) {

                                        span.appendChild(
                                            document.createElement(
                                                "br"
                                            )
                                        );

                                    }

                                    span.appendChild(
                                        document.createTextNode(
                                            line
                                        )
                                    );

                                }
                            );

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
                    "talapatrakSummaryPrintPage";

                page.dataset.page =
                    firstPageNumber + index;

                const infoPanel =
                    document.querySelector(
                        ".talapatrakInfoPanel"
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
                        function(
                            originalElement,
                            controlIndex
                        ) {

                            const clonedElement =
                                clonedControls[
                                    controlIndex
                                ];

                            if (!clonedElement) {
                                return;
                            }

                            clonedElement.value =
                                originalElement.value;

                        }
                    );

                    printInfoPanel.classList.add(
                        "talapatrakPrintInfoPanel"
                    );

                    printInfoPanel
                        .querySelectorAll(
                            "textarea, input, select"
                        )
                        .forEach(
                            function(element) {

                                const value =
                                    element.value || "";

                                const displayValue =
                                    element.tagName === "SELECT" &&
                                    element.id === "talapatrakYear"
                                        ? convertToGujaratiDigits(
                                            value
                                        )
                                        : value;

                                const span =
                                    document.createElement(
                                        "span"
                                    );

                                span.className =
                                    "talapatrakPrintInfoValue";

                                span.textContent =
                                    displayValue;

                                element.replaceWith(
                                    span
                                );

                            }
                        );

                    page.appendChild(
                        printInfoPanel
                    );

                }

                const printPageSource =
                    pageSource.cloneNode(true);

                printPageSource.style.display = "block";
                printPageSource.style.visibility = "visible";
                printPageSource.style.opacity = "1";

                page.appendChild(
                    printPageSource
                );

                const pageNumberElement =
                    document.createElement(
                        "div"
                    );

                pageNumberElement.className =
                    "talapatrakSummaryPrintPageNumber";

                pageNumberElement.textContent =
                    "Page " +
                    (firstPageNumber + index);

                const footer =
                    document.createElement(
                        "div"
                    );

                footer.className =
                    "talapatrakSummaryPrintFooter";

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
                    "TALAPATRAK SUMMARY PRINT PAGE CREATED:",
                    firstPageNumber + index
                );

            }
        );

        return pageSources.length;
    }
    function initializeTalapatrakSummary() {

        const view =
            getTalapatrakSummaryView();

        setupTalapatrakSummaryChallanMoneyFormatting();

        if (!view) {

            console.warn(
                "Talapatrak Summary HTML is not loaded yet."
            );

            return false;

        }


        if (typeof setupIndianDatePicker === "function") {

            setupIndianDatePicker();

            setupTalapatrakSummaryChallanNumberFormatting();

            setupTalapatrakSummaryChallanCalculation();

            setupTalapatrakSummaryPage2Calculation();

        }

        hideTalapatrakSummary();


        console.log(
            "Talapatrak Summary initialized."
        );


        return true;

    }


    /* ========================================================
       RENDER SUMMARY PAGE INSIDE TALAPATRAK PAGINATION
    ======================================================== */

    /* ========================================================
       FIRESTORE SUMMARY PERSISTENCE
       --------------------------------------------------------
       Saves only editable summary controls.

       Generated/calculated values are intentionally NOT saved.
       They are regenerated and then the user's saved edits are
       restored on top.
    ======================================================== */

    let talapatrakSummaryPersistenceRecordId = null;
    let talapatrakSummaryPersistenceLoaded = false;
    let talapatrakSummaryPersistenceLoading = false;
    let talapatrakSummaryPersistenceSaveTimer = null;
    let talapatrakSummaryPersistenceEventsReady = false;


    function getTalapatrakSummaryPersistenceRecordId() {

        return (
            window.currentTalapatrakDocumentId ||
            (typeof currentTalapatrakDocumentId !== "undefined"
                ? currentTalapatrakDocumentId
                : null)
        );

    }


    function getTalapatrakSummaryPersistenceKey(
        element
    ) {

        if (!element) {
            return null;
        }


        if (element.id) {
            return "id:" + element.id;
        }


        const challanField =
            element.getAttribute("data-challan-field");

        if (challanField) {

            const row =
                element.closest("tbody tr");

            const body =
                row?.closest("tbody");

            const rowIndex =
                row && body
                    ? Array.from(body.rows).indexOf(row)
                    : 0;

            return (
                "challan:" +
                rowIndex +
                ":" +
                challanField
            );

        }


        const page2Row =
            element.closest("[data-tala-page2-row]");

        if (page2Row) {

            return (
                "page2:" +
                page2Row.getAttribute("data-tala-page2-row") +
                ":" +
                (
                    element.getAttribute(
                        "data-tala-page2-field"
                    ) || ""
                )
            );

        }


        const page3Row =
            element.closest("[data-page3-row]");

        if (page3Row) {

            return (
                "page3:" +
                page3Row.getAttribute("data-page3-row") +
                ":" +
                (
                    element.getAttribute(
                        "data-page3-field"
                    ) || ""
                )
            );

        }


        const balanceField =
            element.getAttribute(
                "data-tala-page3-balance"
            );

        if (balanceField) {
            return "balance:" + balanceField;
        }


        const lapsField =
            element.getAttribute(
                "data-tala-page3-laps"
            );

        if (lapsField) {
            return "laps:" + lapsField;
        }


        const ariaLabel =
            element.getAttribute("aria-label");

        if (ariaLabel) {
            return "aria:" + ariaLabel;
        }


        const name =
            element.getAttribute("name");

        if (name) {
            return "name:" + name;
        }


        return null;

    }


    function collectTalapatrakSummaryPersistenceData() {

        const editor =
            getTalapatrakSummaryEditor();

        if (!editor) {
            return {};
        }


        const values = {};


        editor
            .querySelectorAll(
                "input, textarea, select"
            )
            .forEach(function(element) {

                if (
                    element.disabled ||
                    element.readOnly
                ) {
                    return;
                }


                const key =
                    getTalapatrakSummaryPersistenceKey(
                        element
                    );

                if (!key) {
                    return;
                }


                values[key] =
                    element.value;

            });


        return values;

    }


    async function saveTalapatrakSummaryPersistence() {

        const documentId =
            getTalapatrakSummaryPersistenceRecordId();

        if (!documentId) {
            return false;
        }


        if (talapatrakSummaryPersistenceLoading) {
            return false;
        }


        if (
            typeof db === "undefined" ||
            !db ||
            typeof firebase === "undefined"
        ) {
            console.warn(
                "TALAPATRAK SUMMARY: Firestore is not available."
            );
            return false;
        }


        const values =
            collectTalapatrakSummaryPersistenceData();


        try {

            await db
                .collection("talapatraks")
                .doc(documentId)
                .set(
                    {
                        summaryData: values,
                        summaryUpdatedAt:
                            firebase.firestore.FieldValue.serverTimestamp()
                    },
                    {
                        merge: true
                    }
                );


            talapatrakSummaryPersistenceRecordId =
                documentId;


            console.log(
                "TALAPATRAK SUMMARY SAVED",
                documentId
            );


            return true;

        } catch (error) {

            console.error(
                "TALAPATRAK SUMMARY SAVE FAILED:",
                error
            );

            return false;

        }

    }


    function scheduleTalapatrakSummaryPersistenceSave() {

        if (
            talapatrakSummaryPersistenceLoading
        ) {
            return;
        }


        if (talapatrakSummaryPersistenceSaveTimer) {

            clearTimeout(
                talapatrakSummaryPersistenceSaveTimer
            );

        }


        talapatrakSummaryPersistenceSaveTimer =
            setTimeout(
                function() {

                    saveTalapatrakSummaryPersistence();

                },
                700
            );

    }


    async function loadTalapatrakSummaryPersistence() {

        const documentId =
            getTalapatrakSummaryPersistenceRecordId();

        const editor =
            getTalapatrakSummaryEditor();


        if (
            !documentId ||
            !editor ||
            typeof db === "undefined" ||
            !db
        ) {
            return false;
        }


        if (
            talapatrakSummaryPersistenceLoaded &&
            talapatrakSummaryPersistenceRecordId ===
                documentId
        ) {
            return true;
        }


        talapatrakSummaryPersistenceLoading =
            true;


        try {

            const snapshot =
                await db
                    .collection("talapatraks")
                    .doc(documentId)
                    .get();


            if (!snapshot.exists) {
                return false;
            }


            const data =
                snapshot.data() || {};


            const saved =
                data.summaryData;


            if (
                !saved ||
                typeof saved !== "object"
            ) {
                talapatrakSummaryPersistenceRecordId =
                    documentId;

                talapatrakSummaryPersistenceLoaded =
                    true;

                return true;
            }


            Object.keys(saved)
                .forEach(function(key) {

                    let element = null;


                    if (key.startsWith("id:")) {

                        element =
                            editor.querySelector(
                                "#" +
                                CSS.escape(
                                    key.slice(3)
                                )
                            );

                    }


                    if (
                        !element &&
                        key.startsWith("challan:")
                    ) {

                        const parts =
                            key.split(":");

                        const rowIndex =
                            Number(parts[1]);

                        const field =
                            parts.slice(2).join(":");

                        const rows =
                            editor.querySelectorAll(
                                ".talaPage1CollectionTable tbody tr"
                            );

                        const row =
                            rows[rowIndex];

                        if (row) {

                            element =
                                row.querySelector(
                                    '[data-challan-field="' +
                                    field +
                                    '"]'
                                );

                        }

                    }


                    if (
                        !element &&
                        key.startsWith("page2:")
                    ) {

                        const parts =
                            key.split(":");

                        const rowName =
                            parts[1];

                        const fieldName =
                            parts.slice(2).join(":");

                        const row =
                            editor.querySelector(
                                '[data-tala-page2-row="' +
                                rowName +
                                '"]'
                            );

                        if (row) {

                            element =
                                row.querySelector(
                                    '[data-tala-page2-field="' +
                                    fieldName +
                                    '"]'
                                );

                        }

                    }


                    if (
                        !element &&
                        key.startsWith("page3:")
                    ) {

                        const parts =
                            key.split(":");

                        const rowName =
                            parts[1];

                        const fieldName =
                            parts.slice(2).join(":");

                        const row =
                            editor.querySelector(
                                '[data-page3-row="' +
                                rowName +
                                '"]'
                            );

                        if (row) {

                            element =
                                row.querySelector(
                                    '[data-page3-field="' +
                                    fieldName +
                                    '"]'
                                );

                        }

                    }


                    if (
                        !element &&
                        key.startsWith("balance:")
                    ) {

                        element =
                            editor.querySelector(
                                '[data-tala-page3-balance="' +
                                CSS.escape(
                                    key.slice(8)
                                ) +
                                '"]'
                            );

                    }


                    if (
                        !element &&
                        key.startsWith("laps:")
                    ) {

                        element =
                            editor.querySelector(
                                '[data-tala-page3-laps="' +
                                CSS.escape(
                                    key.slice(5)
                                ) +
                                '"]'
                            );

                    }


                    if (
                        !element &&
                        key.startsWith("aria:")
                    ) {

                        element =
                            editor.querySelector(
                                '[aria-label="' +
                                CSS.escape(
                                    key.slice(5)
                                ) +
                                '"]'
                            );

                    }


                    if (
                        element &&
                        !element.readOnly &&
                        !element.disabled
                    ) {

                        element.value =
                            saved[key] === null ||
                            saved[key] === undefined
                                ? ""
                                : String(saved[key]);

                    }

                });


            talapatrakSummaryPersistenceRecordId =
                documentId;

            talapatrakSummaryPersistenceLoaded =
                true;


            console.log(
                "TALAPATRAK SUMMARY RESTORED",
                documentId
            );


            return true;

        } catch (error) {

            console.error(
                "TALAPATRAK SUMMARY LOAD FAILED:",
                error
            );

            return false;

        } finally {

            talapatrakSummaryPersistenceLoading =
                false;

        }

    }


    function setupTalapatrakSummaryPersistence() {

        const editor =
            getTalapatrakSummaryEditor();

        if (!editor) {
            return false;
        }


        if (talapatrakSummaryPersistenceEventsReady) {
            return true;
        }


        editor.addEventListener(
            "input",
            function(event) {

                const element =
                    event.target.closest(
                        "input, textarea, select"
                    );

                if (!element || element.readOnly) {
                    return;
                }


                scheduleTalapatrakSummaryPersistenceSave();

            }
        );


        editor.addEventListener(
            "change",
            function(event) {

                const element =
                    event.target.closest(
                        "input, textarea, select"
                    );

                if (!element || element.readOnly) {
                    return;
                }


                scheduleTalapatrakSummaryPersistenceSave();

            }
        );


        editor.addEventListener(
            "blur",
            function(event) {

                const element =
                    event.target.closest(
                        "input, textarea, select"
                    );

                if (!element || element.readOnly) {
                    return;
                }


                scheduleTalapatrakSummaryPersistenceSave();

            },
            true
        );


        talapatrakSummaryPersistenceEventsReady =
            true;


        return true;

    }


    async function initializeTalapatrakSummaryPersistence() {

        const documentId =
            getTalapatrakSummaryPersistenceRecordId();


        if (
            talapatrakSummaryPersistenceRecordId !==
            documentId
        ) {

            talapatrakSummaryPersistenceRecordId =
                documentId;

            talapatrakSummaryPersistenceLoaded =
                false;

        }


        setupTalapatrakSummaryPersistence();


        if (!documentId) {
            return false;
        }


        return await loadTalapatrakSummaryPersistence();

    }


    function generateSummary() {

        const editor =
            getTalapatrakSummaryEditor();

        if (!editor) {
            console.warn(
                "Talapatrak summary editor not found."
            );
            return false;
        }

        console.log(
            "TALAPATRAK SUMMARY GENERATED"
        );

        /* ========================================================
           FETCH GENERATED TALAPATRAK COLLECTION TOTALS
           Values come directly from Generate Total.
        ======================================================== */

        const totals = window.talapatrakTotals;

        if (
            !totals ||
            window.talapatrakTotalGenerated !== true
        ) {
            console.warn(
                "Talapatrak generated totals are not available yet."
            );
            return false;
        }

        const table =
            editor.querySelector(
                ".talaPage1CollectionTable"
            );

        if (!table) {
            console.warn(
                "Talapatrak page 1 collection table not found."
            );
            return false;
        }

        const rows = table.querySelectorAll("tbody tr");

        if (rows.length < 4) {
            console.warn(
                "Talapatrak page 1 collection table does not have 4 rows."
            );
            return false;
        }

        /* D → સરકારી */
        rows[0].cells[1].textContent =
            convertToGujaratiDigits(Number(totals.D || 0).toFixed(2));

        /* E → ખેતી સિવાય */
        rows[1].cells[1].textContent =
            convertToGujaratiDigits(Number(totals.E || 0).toFixed(2));

        /* F → લોકલફંડ */
        rows[2].cells[1].textContent =
            convertToGujaratiDigits(Number(totals.F || 0).toFixed(2));

        /* H → કુલ */
        /* કુલ = સરકારી + ખેતી સિવાય + લોકલફંડ */
        const page1CollectionTotal =
            Number(totals.D || 0) +
            Number(totals.E || 0) +
            Number(totals.F || 0);

        rows[3].cells[1].textContent =
            convertToGujaratiDigits(
                page1CollectionTotal.toFixed(2)
            );

        console.log(
            "TALAPATRAK PAGE 1 COLLECTION TOTALS FILLED:",
            {
                D: totals.D,
                E: totals.E,
                F: totals.F,
                H: totals.H
            }
        );

        calculateTalapatrakSummaryPage2();
        calculateTalapatrakSummaryPage3();

        return true;

    }


    function populateTalapatrakSummaryPage4Header() {

        const page4 =
            document.querySelector(".talaPage4");

        if (!page4) {
            return;
        }

        const moje =
            document.getElementById(
                "talapatrakMoje"
            )?.value?.trim() || "-";

        const taluka =
            document.getElementById(
                "talapatrakTaluka"
            )?.value?.trim() || "-";

        const jillo =
            document.getElementById(
                "talapatrakJillo"
            )?.value?.trim() || "-";

        const year =
            document.getElementById(
                "talapatrakYear"
            )?.value?.trim() || "-";

        const gujaratiDigits = function(value) {
            return value.toString().replace(/[0-9]/g, function(digit) {
                return "૦૧૨૩૪૫૬૭૮૯"[Number(digit)];
            });
        };

        const lastPage =
            (Number(
                window.talapatrakTotalPages
            ) || 1) + 4;

        page4
            .querySelectorAll(
                '[data-tala-page4-header="moje"]'
            )
            .forEach(function(element) {
                element.textContent = moje;
            });

        page4
            .querySelectorAll(
                '[data-tala-page4-header="taluka"]'
            )
            .forEach(function(element) {
                element.textContent = taluka;
            });

        page4
            .querySelectorAll(
                '[data-tala-page4-header="jillo"]'
            )
            .forEach(function(element) {
                element.textContent = jillo;
            });

        page4
            .querySelectorAll(
                '[data-tala-page4-header="year"]'
            )
            .forEach(function(element) {
                element.textContent = gujaratiDigits(year);
            });

        page4
            .querySelectorAll(
                '[data-tala-page4-header="last-page"]'
            )
            .forEach(function(element) {
                element.textContent = gujaratiDigits(lastPage);
            });
    }

    /* ========================================================
       TALAPATRAK SUMMARY — PAGE 3 BAKI NI TARIJ
    ======================================================== */

    function parseTalapatrakSummaryPage3Number(value) {
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

    function formatTalapatrakSummaryPage3Number(value) {
        return convertToGujaratiDigits(
            Number(value || 0).toFixed(2)
        );
    }

    function calculateTalapatrakSummaryPage3() {
        const page3 =
            document.querySelector(".talaPage3");
        if (!page3) {
            return;
        }
        const totals = window.talapatrakTotals || {};
        const setPage3Value = function(rowName, fieldName, value) {
            const input =
                page3.querySelector(
                    'tr[data-page3-row="' + rowName + '"] [data-page3-field="' + fieldName + '"]'
                );
            if (input) {
                const numericValue =
                    Number(value || 0);
                input.value =
                    convertToGujaratiDigits(
                        numericValue.toFixed(2)
                    );
            }
        };
        const getPage3Value = function(rowName, fieldName) {
            const input =
                page3.querySelector(
                    'tr[data-page3-row="' + rowName + '"] [data-page3-field="' + fieldName + '"]'
                );
            return parseTalapatrakSummaryPage3Number(
                input?.value
            );
        };
        /* ========================================================
           ???????
           Generated Talapatrak totals
        ======================================================== */
        const demandPrevious =
            Number(totals.C || 0);

        const demandCurrent =
            Number(totals.D || 0) +
            Number(totals.E || 0) +
            Number(totals.F || 0);

        const demandRotating =
            Number(totals.G || 0);

        setPage3Value(
            "discount",
            "current",
            Number(totals.I || 0)
        );
        setPage3Value(
            "demand",
            "previous",
            demandPrevious
        );
        setPage3Value(
            "demand",
            "current",
            demandCurrent
        );
        setPage3Value(
            "demand",
            "rotating",
            demandRotating
        );
        /* ========================================================
           PAGE 2 GENERATED TOTALS
        ======================================================== */
        const page2 =
            document.querySelector(".talaPage2");
        const finalCollectionRow =
            page2?.querySelector(
                'tr[data-tala-page2-total-row="finalCollection"]'
            );
        const jadeRowPage2 =
            page2?.querySelector(
                'tr[data-tala-page2-total-row="jade"]'
            );
        /* ========================================================
           ???? ????
           = ??? ???????? ??? ????
        ======================================================== */
        if (finalCollectionRow) {
            setPage3Value(
                "collection",
                "previous",
                parseTalapatrakSummaryNumber(
                    finalCollectionRow.querySelector(
                        '[data-tala-page2-field="previous"]'
                    )?.textContent
                )
            );
            setPage3Value(
                "collection",
                "current",
                parseTalapatrakSummaryNumber(
                    finalCollectionRow.querySelector(
                        '[data-tala-page2-field="current"]'
                    )?.textContent
                )
            );
            setPage3Value(
                "collection",
                "rotating",
                parseTalapatrakSummaryNumber(
                    finalCollectionRow.querySelector(
                        '[data-tala-page2-field="rotating"]'
                    )?.textContent
                )
            );
        }
        /* ========================================================
           ????? ???????
           = ??????? - ??? : ???
        ======================================================== */
        const discountPrevious =
            getPage3Value(
                "discount",
                "previous"
            );
        const discountCurrent =
            getPage3Value(
                "discount",
                "current"
            );
        const discountRotating =
            getPage3Value(
                "discount",
                "rotating"
            );
        const fixedDemandPrevious =
            demandPrevious -
            discountPrevious;
        const fixedDemandCurrent =
            demandCurrent -
            discountCurrent;
        const fixedDemandRotating =
            demandRotating -
            discountRotating;
        setPage3Value(
            "fixedDemand",
            "previous",
            fixedDemandPrevious
        );
        setPage3Value(
            "fixedDemand",
            "current",
            fixedDemandCurrent
        );
        setPage3Value(
            "fixedDemand",
            "rotating",
            fixedDemandRotating
        );
        /* ========================================================
           ???? ???? ????
           = ????? ??????? - ???? ????
        ======================================================== */
        const collectionPrevious =
            getPage3Value(
                "collection",
                "previous"
            );
        const collectionCurrent =
            getPage3Value(
                "collection",
                "current"
            );
        const collectionRotating =
            getPage3Value(
                "collection",
                "rotating"
            );
        setPage3Value(
            "recoverableBalance",
            "previous",
            fixedDemandPrevious -
            collectionPrevious
        );
        setPage3Value(
            "recoverableBalance",
            "current",
            fixedDemandCurrent -
            collectionCurrent
        );
        setPage3Value(
            "recoverableBalance",
            "rotating",
            fixedDemandRotating -
            collectionRotating
        );
        /* ========================================================
           ???? ????
           ???? = Page 2 ??? ???? total
        ======================================================== */
        const generatedTotals =
            window.talapatrakTotals;

        if (
            generatedTotals &&
            typeof generatedTotals.R !== "undefined"
        ) {
            setPage3Value(
                "jadeCollection",
                "current",
                parseTalapatrakSummaryNumber(
                    generatedTotals.R
                )
            );
        }
        /* ========================================================
           ???? ??? ???? ??????? ????
           = ???? ???? - ??? : ?????
        ======================================================== */
        const jadeRow =
            page3.querySelector(
                'tr[data-page3-row="jadeCollection"]'
            );
        const lapsRow =
            page3.querySelector(
                'tr[data-page3-row="laps"]'
            );
        if (jadeRow && lapsRow) {
            setPage3Value(
                "nextYearSurplus",
                "previous",
                parseTalapatrakSummaryPage3Number(
                    jadeRow.querySelector(
                        '[data-page3-field="previous"]'
                    )?.value
                ) -
                parseTalapatrakSummaryPage3Number(
                    lapsRow.querySelector(
                        '[data-page3-field="previous"]'
                    )?.value
                )
            );
            setPage3Value(
                "nextYearSurplus",
                "current",
                parseTalapatrakSummaryPage3Number(
                    jadeRow.querySelector(
                        '[data-page3-field="current"]'
                    )?.value
                ) -
                parseTalapatrakSummaryPage3Number(
                    lapsRow.querySelector(
                        '[data-page3-field="current"]'
                    )?.value
                )
            );
            setPage3Value(
                "nextYearSurplus",
                "rotating",
                parseTalapatrakSummaryPage3Number(
                    jadeRow.querySelector(
                        '[data-page3-field="rotating"]'
                    )?.value
                ) -
                parseTalapatrakSummaryPage3Number(
                    lapsRow.querySelector(
                        '[data-page3-field="rotating"]'
                    )?.value
                )
            );
        }
        /* ========================================================
           UPDATE ROW TOTALS
        ======================================================== */
        page3
            .querySelectorAll(".talaPage3EditableRow")
            .forEach(function(row) {
                const previous =
                    parseTalapatrakSummaryPage3Number(
                        row.querySelector(
                            '[data-page3-field="previous"]'
                        )?.value
                    );
                const current =
                    parseTalapatrakSummaryPage3Number(
                        row.querySelector(
                            '[data-page3-field="current"]'
                        )?.value
                    );
                const rotating =
                    parseTalapatrakSummaryPage3Number(
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
                    formatTalapatrakSummaryPage3Number(
                        previous +
                        current +
                        rotating
                    );
            });
    }    function setupTalapatrakSummaryPage3InputHandler() {

        const page3 =
            document.querySelector(".talaPage3");

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

                calculateTalapatrakSummaryPage3();
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

                const numericValue =
                    Number.parseFloat(
                        convertGujaratiDigitsToEnglish(
                            input.value
                        )
                    );

                input.value =
                    convertToGujaratiDigits(
                        (
                            Number.isFinite(numericValue)
                                ? numericValue
                                : 0
                        ).toFixed(2)
                    );

                calculateTalapatrakSummaryPage3();
            }
        , true);
    }

    function setupTalapatrakSummaryPage3BalanceTable() {

        const page3 =
            document.querySelector(".talaPage3");

        if (!page3) {
            return;
        }

        const balanceInputs =
            page3.querySelectorAll(
                '[data-tala-page3-balance^="amount"], [data-tala-page3-balance^="year"], [data-tala-page3-laps^="account"], [data-tala-page3-laps^="amount"]'
            );

        balanceInputs.forEach(function(input) {

            if (input.dataset.balanceSetup === "true") {
                return;
            }

            input.dataset.balanceSetup = "true";

            input.addEventListener("input", function() {

                const cursorPosition = input.selectionStart;

                const englishValue =
                    convertGujaratiDigitsToEnglish(
                        input.value
                    );

                input.value =
                    convertToGujaratiDigits(
                        englishValue
                    );

                if (cursorPosition !== null) {
                    input.setSelectionRange(
                        cursorPosition,
                        cursorPosition
                    );
                }

                calculateTalapatrakSummaryPage3BalanceTable();
            });

            input.addEventListener("blur", function() {

                const rawValue = input.value;

                const yearFieldName =
                    input.getAttribute("data-tala-page3-balance");

                if (
                    yearFieldName &&
                    yearFieldName.indexOf("year") === 0
                ) {

                    const englishYear =
                        convertGujaratiDigitsToEnglish(
                            rawValue
                        ).trim();

                    const financialYearMatch =
                        englishYear.match(
                            /^(\d{4})\s*[-\/]\s*(\d{2,4})$/
                        );

                    if (financialYearMatch) {

                        input.value =
                            convertToGujaratiDigits(
                                financialYearMatch[1] +
                                "-" +
                                financialYearMatch[2].slice(-2)
                            );

                    } else {

                        input.value =
                            convertToGujaratiDigits(
                                englishYear
                            );
                    }

                    calculateTalapatrakSummaryPage3BalanceTable();
                    return;
                }

                if (rawValue.trim() !== "") {

                    const balanceFieldName =
                        input.getAttribute(
                            "data-tala-page3-balance"
                        );

                    const lapsFieldName =
                        input.getAttribute(
                            "data-tala-page3-laps"
                        );

                    const fieldName =
                        balanceFieldName ||
                        lapsFieldName;

                    const numericValue =
                        parseTalapatrakSummaryNumber(
                            rawValue
                        );

                    if (
                        fieldName &&
                        (
                            fieldName.indexOf("year") === 0 ||
                            fieldName.indexOf("account") === 0
                        )
                    ) {

                        input.value =
                            convertToGujaratiDigits(
                                String(
                                    Math.trunc(
                                        numericValue
                                    )
                                )
                            );

                    } else {

                        input.value =
                            formatTalapatrakSummaryNumber(
                                numericValue
                            );
                    }
                }

                calculateTalapatrakSummaryPage3BalanceTable();
            });

        });

        calculateTalapatrakSummaryPage3BalanceTable();
    }


    function calculateTalapatrakSummaryPage3BalanceTable() {

        const page3 =
            document.querySelector(".talaPage3");

        if (!page3) {
            return;
        }

        const amount1 =
            parseTalapatrakSummaryNumber(
                page3.querySelector(
                    '[data-tala-page3-balance="amount1"]'
                )?.value
            );

        const amount2 =
            parseTalapatrakSummaryNumber(
                page3.querySelector(
                    '[data-tala-page3-balance="amount2"]'
                )?.value
            );

        const amount3 =
            parseTalapatrakSummaryNumber(
                page3.querySelector(
                    '[data-tala-page3-balance="amount3"]'
                )?.value
            );

        const total =
            amount1 +
            amount2 +
            amount3;

        const totalField =
            page3.querySelector(
                '[data-tala-page3-balance="total"]'
            );

        if (totalField) {
            totalField.textContent =
                formatTalapatrakSummaryNumber(total);
        }
    }

    function renderTalapatrakSummaryPage(summaryIndex) {

        const mount =
            document.getElementById(
                "talapatrakSummaryPageMount"
            );

        if (!mount) {
            console.warn(
                "Talapatrak summary mount not found."
            );
            return false;
        }

        const editor =
            getTalapatrakSummaryEditor();

        if (!editor) {
            console.warn(
                "Talapatrak summary editor not found."
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
            editor.querySelector(".talaPage1");

        const page2 =
            editor.querySelector(".talaPage2");

        const page3 =
            editor.querySelector(".talaPage3");

        const page4 =
            editor.querySelector(".talaPage4");

        if (
            pageIndex === 1 ||
            pageIndex === 2 ||
            pageIndex === 3 ||
            pageIndex === 4
        ) {

            showTalapatrakSummary();

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
                page1.style.display =
                    pageIndex === 1
                        ? "block"
                        : "none";
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

            if (pageIndex === 3) {
                calculateTalapatrakSummaryPage3();
                setupTalapatrakSummaryPage3InputHandler();
                setupTalapatrakSummaryPage3BalanceTable();
            }

            if (pageIndex === 4) {
                populateTalapatrakSummaryPage4Header();

                const registerNumber =
                    document.getElementById(
                        "talapatrakSummaryRegisterNumber"
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

            /*
             * Restore this record's saved summary edits AFTER
             * generated summary values have been populated.
             */
            initializeTalapatrakSummaryPersistence().then(function() {

                calculateTalapatrakSummaryPage2();

                calculateTalapatrakSummaryPage3();
                calculateTalapatrakSummaryPage3BalanceTable();

            });
            console.log(
                "TALAPATRAK EDITABLE SUMMARY PAGE RENDERED:",
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

        mount.style.display = "block";
        mount.style.width = "100%";

        return true;

    }

    /* ========================================================
       TALAPATRAK SUMMARY — PAGE 1 NUMBER HELPERS
    ======================================================== */

    function parseTalapatrakSummaryNumber(value) {

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


    function formatTalapatrakSummaryNumber(value) {
        return convertToGujaratiDigits(
            parseTalapatrakSummaryNumber(
                value
            ).toFixed(2)
        );
    }


    function formatTalapatrakSummaryChallanMoneyInput(input) {

        if (!input) {
            return;
        }

        const value =
            parseTalapatrakSummaryNumber(
                input.value
            );

        input.value =
            convertToGujaratiDigits(
                value.toFixed(2)
            );

    }


    function calculateTalapatrakSummaryChallanRowTotal(row) {

        if (!row) return;

        const previousInput =
            row.querySelector(
                '[data-challan-field="previous"]'
            );

        const currentInput =
            row.querySelector(
                '[data-challan-field="current"]'
            );

        const rotatingInput =
            row.querySelector(
                '[data-challan-field="rotating"]'
            );

        const totalInput =
            row.querySelector(
                '[data-challan-field="total"]'
            );

        if (
            !previousInput ||
            !currentInput ||
            !rotatingInput ||
            !totalInput
        ) {
            return;
        }

        const previous =
            parseTalapatrakSummaryNumber(
                previousInput.value
            );

        const current =
            parseTalapatrakSummaryNumber(
                currentInput.value
            );

        const rotating =
            parseTalapatrakSummaryNumber(
                rotatingInput.value
            );

        const total =
            previous +
            current +
            rotating;

        totalInput.value =
            formatTalapatrakSummaryNumber(
                total
            );

    }
    function setupTalapatrakSummaryChallanMoneyFormatting() {

        const table = document.getElementById(
            "talapatrakSummaryChallanTable"
        );

        if (!table) return;

        if (table.dataset.moneyFormattingReady === "true") return;

        table.dataset.moneyFormattingReady = "true";

        table.addEventListener("blur", function(event) {

            const input = event.target.closest(
                '[data-challan-field="previous"], [data-challan-field="current"], [data-challan-field="rotating"]'
            );

            if (!input) return;

            formatTalapatrakSummaryChallanMoneyInput(input);

        }, true);

    }


    function updateTalapatrakSummaryChallanYearTotals() {

        const body =
            document.getElementById(
                "talapatrakSummaryChallanBody"
            );

        if (!body) return;

        let previousTotal = 0;
        let currentTotal = 0;
        let rotatingTotal = 0;

        body
            .querySelectorAll(
                "tr.talaSummaryDynamicRow"
            )
            .forEach(function(row) {

                previousTotal +=
                    parseTalapatrakSummaryNumber(
                        row.querySelector(
                            '[data-challan-field="previous"]'
                        )?.value
                    );

                currentTotal +=
                    parseTalapatrakSummaryNumber(
                        row.querySelector(
                            '[data-challan-field="current"]'
                        )?.value
                    );

                rotatingTotal +=
                    parseTalapatrakSummaryNumber(
                        row.querySelector(
                            '[data-challan-field="rotating"]'
                        )?.value
                    );

            });

        const grandTotal =
            previousTotal +
            currentTotal +
            rotatingTotal;

        const totals = {
            talapatrakSummaryChallanPreviousTotal:
                previousTotal,

            talapatrakSummaryChallanCurrentTotal:
                currentTotal,

            talapatrakSummaryChallanRotatingTotal:
                rotatingTotal,

            talapatrakSummaryChallanGrandTotal:
                grandTotal
        };


        Object.keys(totals)
            .forEach(function(id) {

                const element =
                    document.getElementById(id);

                if (!element) {
                    return;
                }

                element.value =
                    convertToGujaratiDigits(
                        Number(
                            totals[id] || 0
                        ).toFixed(2)
                    );

            });


        const page2YearTotals = {

            talapatrakSummaryPage2YearPrevious:
                previousTotal,

            talapatrakSummaryPage2YearCurrent:
                currentTotal,

            talapatrakSummaryPage2YearRotating:
                rotatingTotal,

            talapatrakSummaryPage2YearTotal:
                grandTotal

        };


        Object.keys(page2YearTotals)
            .forEach(function(id) {

                const element =
                    document.getElementById(id);

                if (!element) {
                    return;
                }

                element.textContent =
                    convertToGujaratiDigits(
                        Number(
                            page2YearTotals[id] || 0
                        ).toFixed(2)
                    );

            });

    }


    function setupTalapatrakSummaryChallanCalculation() {

        const table = document.getElementById(
            "talapatrakSummaryChallanTable"
        );

        if (!table) return;

        if (table.dataset.calculationReady === "true") return;

        table.dataset.calculationReady = "true";

        table.addEventListener("input", function(event) {

            const input = event.target.closest(
                '[data-challan-field="previous"], [data-challan-field="current"], [data-challan-field="rotating"]'
            );

            if (!input) return;

            const row = input.closest(
                "tr.talaSummaryDynamicRow"
            );

            calculateTalapatrakSummaryChallanRowTotal(row);

            updateTalapatrakSummaryChallanYearTotals();

        });

    }


    function setupTalapatrakSummaryChallanNumberFormatting() {

        const table = document.getElementById(
            "talapatrakSummaryChallanTable"
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


    function setupTalapatrakSummaryChallanRowActions() {

        const table = document.getElementById(
            "talapatrakSummaryChallanTable"
        );

        const body = document.getElementById(
            "talapatrakSummaryChallanBody"
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
                addTalapatrakSummaryChallanRow();
                return;
            }

            const deleteButton = event.target.closest(
                '[data-action="delete-challan-row"]'
            );

            if (deleteButton) {
                event.preventDefault();
                deleteTalapatrakSummaryChallanRow(
                    deleteButton
                );
            }

        });

    }


    function addTalapatrakSummaryChallanRow() {

        const body = document.getElementById(
            "talapatrakSummaryChallanBody"
        );

        if (!body) {
            return;
        }

        const rows = body.querySelectorAll(
            "tr.talaSummaryDynamicRow"
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

        renumberTalapatrakSummaryChallanRows();

        const firstInput = newRow.querySelector("input");

        if (firstInput) {
            firstInput.focus();
        }

    }


    function deleteTalapatrakSummaryChallanRow(
        deleteButton
    ) {

        const body = document.getElementById(
            "talapatrakSummaryChallanBody"
        );

        if (!body) {
            return;
        }

        const row = deleteButton.closest(
            "tr.talaSummaryDynamicRow"
        );

        if (!row) {
            return;
        }

        const rows = body.querySelectorAll(
            "tr.talaSummaryDynamicRow"
        );

        if (rows.length <= 1) {

            row.querySelectorAll("input").forEach(function (input) {
                input.value = "";
            });

            return;
        }

        row.remove();

        renumberTalapatrakSummaryChallanRows();

    }


    function renumberTalapatrakSummaryChallanRows() {

        const body = document.getElementById(
            "talapatrakSummaryChallanBody"
        );

        if (!body) {
            return;
        }

        const rows = body.querySelectorAll(
            "tr.talaSummaryDynamicRow"
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
            setupTalapatrakSummaryChallanRowActions
        );

    } else {

        setupTalapatrakSummaryChallanRowActions();

    }


        /* ========================================================
       TALAPATRAK SUMMARY — PAGE 2 CALCULATION
    ======================================================== */

    function calculateTalapatrakSummaryPage2() {

        const page2 =
            document.querySelector(".talaPage2");

        if (!page2) {
            return;
        }

        const number = function (value) {
            return parseTalapatrakSummaryNumber(value);
        };

        const money = function (value) {
            return convertToGujaratiDigits(
                Number(value || 0).toFixed(2)
            );
        };

        const getRow = function (rowName) {
            return page2.querySelector(
                'tr[data-tala-page2-row="' +
                rowName +
                '"]'
            );
        };

        const getValue = function (
            rowName,
            fieldName
        ) {

            const row = getRow(rowName);

            if (!row) {
                return 0;
            }

            const field =
                row.querySelector(
                    '[data-tala-page2-field="' +
                    fieldName +
                    '"]'
                );

            if (!field) {
                return 0;
            }

            return number(
                field.value !== undefined
                    ? field.value
                    : field.textContent
            );
        };

        const setTotal = function (
            rowName,
            previous,
            current,
            rotating
        ) {

            const row = getRow(rowName);

            if (!row) {
                return;
            }

            const totalField =
                row.querySelector(
                    '[data-tala-page2-field="total"]'
                );

            if (!totalField) {
                return;
            }

            totalField.textContent =
                money(
                    previous +
                    current +
                    rotating
                );
        };

        const setCalculatedRow = function (
            rowSelector,
            previous,
            current,
            rotating
        ) {

            const row =
                page2.querySelector(rowSelector);

            if (!row) {
                return;
            }

            const fields = {
                previous: previous,
                current: current,
                rotating: rotating,
                total: previous + current + rotating
            };

            Object.keys(fields).forEach(
                function (fieldName) {

                    const element =
                        row.querySelector(
                            '[data-tala-page2-field="' +
                            fieldName +
                            '"]'
                        );

                    if (!element) {
                        return;
                    }

                    element.textContent =
                        money(fields[fieldName]);
                }
            );
        };

        const editableRows = [
            "jadesh1",
            "jadesh2",
            "baad1",
            "baad2",
            "baad3"
        ];

        editableRows.forEach(
            function (rowName) {

                const previous = getValue(rowName, "previous");

                const current = getValue(rowName, "current");

                const rotating = getValue(rowName, "rotating");

                setTotal(
                    rowName,
                    previous,
                    current,
                    rotating
                );
            }
        );

        const yearPrevious =
            number(
                page2.querySelector(
                    "#talapatrakSummaryPage2YearPrevious"
                )?.textContent
            );

        const yearCurrent =
            number(
                page2.querySelector(
                    "#talapatrakSummaryPage2YearCurrent"
                )?.textContent
            );

        const yearRotating =
            number(
                page2.querySelector(
                    "#talapatrakSummaryPage2YearRotating"
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
            'tr[data-tala-page2-total-row="jade"]',
            jadePrevious,
            jadeCurrent,
            jadeRotating
        );

        const grandCollectionPrevious =
            yearPrevious +
            jadePrevious;

        const grandCollectionCurrent =
            yearCurrent +
            jadeCurrent;

        const grandCollectionRotating =
            yearRotating +
            jadeRotating;

        setCalculatedRow(
            'tr[data-tala-page2-total-row="grandCollection"]',
            grandCollectionPrevious,
            grandCollectionCurrent,
            grandCollectionRotating
        );

        const baadPrevious =
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
            'tr[data-tala-page2-total-row="baad"]',
            baadPrevious,
            baadCurrent,
            baadRotating
        );

        const grandBaadPrevious =
            grandCollectionPrevious -
            baadPrevious;

        const grandBaadCurrent =
            grandCollectionCurrent -
            baadCurrent;

        const grandBaadRotating =
            grandCollectionRotating -
            baadRotating;

        setCalculatedRow(
            'tr[data-tala-page2-total-row="grandBaad"]',
            grandBaadPrevious,
            grandBaadCurrent,
            grandBaadRotating
        );

        const headTransferPrevious =
            getValue(
                "headTransfer",
                "previous"
            );

        const headTransferCurrent =
            getValue(
                "headTransfer",
                "current"
            );

        const headTransferRotating =
            getValue(
                "headTransfer",
                "rotating"
            );

        const finalJadePrevious =
            getValue(
                "finalJade",
                "previous"
            );

        const finalJadeCurrent =
            getValue(
                "finalJade",
                "current"
            );

        const finalJadeRotating =
            getValue(
                "finalJade",
                "rotating"
            );

        const finalPrevious =
            grandBaadPrevious -
            headTransferPrevious +
            finalJadePrevious;

        const finalCurrent =
            grandBaadCurrent -
            headTransferCurrent +
            finalJadeCurrent;

        const finalRotating =
            grandBaadRotating -
            headTransferRotating +
            finalJadeRotating;

        setCalculatedRow(
            'tr[data-tala-page2-total-row="finalCollection"]',
            finalPrevious,
            finalCurrent,
            finalRotating
        );
    }


    function setupTalapatrakSummaryPage2Calculation() {

        const table =
            document.getElementById(
                "talapatrakSummaryAccountingTable"
            );

        if (!table) {
            return;
        }

        if (
            table.dataset.calculationReady ===
            "true"
        ) {
            return;
        }

        table.dataset.calculationReady =
            "true";

        table.addEventListener(
            "input",
            function (event) {

                const input =
                    event.target.closest(
                        '[data-tala-page2-field="previous"], [data-tala-page2-field="current"], [data-tala-page2-field="rotating"]'
                    );

                if (!input) {
                    return;
                }

                calculateTalapatrakSummaryPage2();
            }
        );

        table.addEventListener(
            "blur",
            function (event) {

                const input =
                    event.target.closest(
                        '[data-tala-page2-field="previous"], [data-tala-page2-field="current"], [data-tala-page2-field="rotating"]'
                    );

                if (!input) {
                    return;
                }

                const rawValue = input.value;

                if (rawValue.trim() !== "") {
                    input.value =
                        convertToGujaratiDigits(
                            parseTalapatrakSummaryNumber(
                                rawValue
                            ).toFixed(2)
                        );
                }

                calculateTalapatrakSummaryPage2();
            },
            true
        );

        calculateTalapatrakSummaryPage2();
    }


    /* ========================================================
       PUBLIC API
    ======================================================== */

    window.talapatrakSummary = {

        initialize:
            initializeTalapatrakSummary,

        show:
            showTalapatrakSummary,

        hide:
            hideTalapatrakSummary,

        getView:
            getTalapatrakSummaryView,

        createPrintPages:
            createPrintPages,

        getEditor:
            getTalapatrakSummaryEditor,

        generate:
            generateSummary,

        renderPage:
            renderTalapatrakSummaryPage


    };


    /*
     * Initialize immediately if the Summary HTML already exists.
     * The loader also controls the initial hidden state, so this
     * is intentionally harmless if initialization happens twice.
     */

    initializeTalapatrakSummary();


})();

