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

        if (!view) {

            return;

        }


        view.style.display =
            "none";

    }


    function showTalapatrakSummary() {

        const view =
            getTalapatrakSummaryView();

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
            .forEach(function (element) {
                element.removeAttribute("id");
            });

        source
            .querySelectorAll("button")
            .forEach(function (button) {
                button.remove();
            });

        source
            .querySelectorAll(
                "input, textarea, select"
            )
            .forEach(function (element) {

                const value =
                    element.value || "";

                const span =
                    document.createElement("span");

                span.textContent = value;

                span.className =
                    "talapatrakSummaryPrintValue";

                element.replaceWith(span);
            });

        const page =
            document.createElement("div");

        page.className =
            "talapatrakSummaryPrintPage";

        page.dataset.page =
            firstPageNumber;

        page.appendChild(source);

        const footer =
            document.createElement("div");

        footer.className =
            "talapatrakSummaryPrintFooter";

        const pageNumberElement =
            document.createElement("div");

        pageNumberElement.className =
            "talapatrakSummaryPrintPageNumber";

        pageNumberElement.textContent =
            "Page " + firstPageNumber;

        footer.appendChild(
            pageNumberElement
        );

        page.appendChild(footer);

        container.appendChild(page);

        console.log(
            "TALAPATRAK SUMMARY PRINT PAGE CREATED:",
            firstPageNumber
        );

        return 1;
    }
    function initializeTalapatrakSummary() {

        const view =
            getTalapatrakSummaryView();

        if (!view) {

            console.warn(
                "Talapatrak Summary HTML is not loaded yet."
            );

            return false;

        }


        hideTalapatrakSummary();


        console.log(
            "Talapatrak Summary initialized."
        );


        return true;

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
            getTalapatrakSummaryEditor

    };


    /*
     * Initialize immediately if the Summary HTML already exists.
     * The loader also controls the initial hidden state, so this
     * is intentionally harmless if initialization happens twice.
     */

    initializeTalapatrakSummary();


})();


