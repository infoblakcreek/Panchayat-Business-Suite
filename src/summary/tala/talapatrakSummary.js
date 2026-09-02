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