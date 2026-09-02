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
       READ CURRENT SOURCE INFORMATION
       ======================================================== */

    function getSourceInfo() {

        const moje =
            document.getElementById(
                "shikshanupakaranMoje"
            );

        const taluka =
            document.getElementById(
                "shikshanupakaranTaluka"
            );

        const jillo =
            document.getElementById(
                "shikshanupakaranJillo"
            );

        const year =
            document.getElementById(
                "shikshanupakaranYear"
            );


        return {

            moje:
                moje
                    ? moje.value || ""
                    : "",

            taluka:
                taluka
                    ? taluka.value || ""
                    : "",

            jillo:
                jillo
                    ? jillo.value || ""
                    : "",

            year:
                year
                    ? year.value || ""
                    : ""

        };

    }


    /* ========================================================
       POPULATE SUMMARY HEADER
       ======================================================== */

    function populateSummaryHeader() {

        const info =
            getSourceInfo();


        const moje =
            document.getElementById(
                "shikshanupakaranSummaryMoje"
            );

        const taluka =
            document.getElementById(
                "shikshanupakaranSummaryTaluka"
            );

        const jillo =
            document.getElementById(
                "shikshanupakaranSummaryJillo"
            );

        const year =
            document.getElementById(
                "shikshanupakaranSummaryYear"
            );


        if (moje) {
            moje.value = info.moje;
        }

        if (taluka) {
            taluka.value = info.taluka;
        }

        if (jillo) {
            jillo.value = info.jillo;
        }

        if (year) {
            year.value = info.year;
        }

    }


    /* ========================================================
       POPULATE SUMMARY TOTALS
       ======================================================== */

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
                            '[data-summary-field="' +
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


        const grandTotal =
            document.getElementById(
                "shikshanupakaranSummaryGrandTotal"
            );


        if (grandTotal) {

            const total =
                Number(
                    totals.G || 0
                );


            grandTotal.textContent =
                total.toFixed(2);

        }


        return true;

    }


    /* ========================================================
       GENERATE SUMMARY
       ======================================================== */

    function generateSummary() {

        populateSummaryHeader();

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


                    element.replaceWith(
                        span
                    );

                }
            );


        const page =
            document.createElement(
                "div"
            );


        page.className =
            "shikshanupakaranSummaryPrintPage";


        page.dataset.page =
            firstPageNumber;


        page.appendChild(
            source
        );


        const pageNumberElement =
            document.createElement(
                "div"
            );


        pageNumberElement.className =
            "shikshanupakaranSummaryPrintPageNumber";


        pageNumberElement.textContent =
            "Page " +
            firstPageNumber;


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
            firstPageNumber
        );


        return 1;

    }


    /* ========================================================
       INITIALIZATION
       ======================================================== */

    function initializeShikshanupakaranSummary() {

        const view =
            getShikshanupakaranSummaryView();


        if (!view) {

            console.warn(
                "Shikshanupakaran Summary HTML is not loaded yet."
            );

            return false;

        }


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

        createPrintPages:
            createPrintPages

    };


    initializeShikshanupakaranSummary();


})();
