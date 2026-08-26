/* ============================================================
   PANCHAYAT BUSINESS SUITE
   APPLICATION SCRIPT LOADER
   ============================================================

   This file is the single local JavaScript entry point
   loaded by index.html.

   It loads all application scripts in dependency order.

   IMPORTANT:
   ------------------------------------------------------------
   These are classic JavaScript files, NOT ES modules.
   They are loaded sequentially so existing global functions
   continue to work exactly as before.
   ============================================================ */


/* ============================================================
   SCRIPT LOADER
============================================================ */

function loadAppScript(scriptPath) {

    return new Promise(function(resolve, reject) {

        const script =
            document.createElement("script");


        script.src =
            scriptPath;


        script.onload =
            function() {

                console.log(
                    "APP SCRIPT LOADED:",
                    scriptPath
                );

                resolve();

            };


        script.onerror =
            function() {

                console.error(
                    "APP SCRIPT FAILED:",
                    scriptPath
                );

                reject(
                    new Error(
                        "Failed to load: " +
                        scriptPath
                    )
                );

            };


        document.body.appendChild(
            script
        );

    });

}


/* ============================================================
   LOAD APPLICATION
============================================================ */

async function loadPanchayatApplication() {

    try {

        /*
         * =====================================================
         * COMMON UTILITIES
         * =====================================================
         *
         * Must load first because other modules use functions
         * such as:
         *
         * convertToGujaratiDigits()
         * convertGujaratiDigitsToEnglish()
         * roundGeneratedValueToFivePaise()
         *
         */

        await loadAppScript(
            "utils/common.js"
        );
        
        
        /*
         * =====================================================
         * COMMON SEARCH
         * =====================================================
         *
         * Shared row-search system for:
         *
         * - Talapatrak
         * - Shikshanupakaran
         *
         * Must load after common.js because search
         * uses Gujarati digit conversion utilities.
         *
         */
        
        await loadAppScript(
            "utils/search.js"
        );


        /*
         * =====================================================
         * PAGE LOADER
         * =====================================================
         */

        await loadAppScript(
            "js/pageLoader.js"
        );


        /*
         * =====================================================
         * MAIN BILL
         * =====================================================
         */

        await loadAppScript(
            "mainbill/mainbill-loader.js"
        );


        /*
         * =====================================================
         * SHIKSHANUPAKARAN
         * =====================================================
         */

        await loadAppScript(
            "shikshanupakaran/shikshanupakaran-loader.js"
        );


        /*
         * =====================================================
         * TALAPATRAK
         * =====================================================
         */

        await loadAppScript(
            "talapatrak/talapatrak-loader.js"
        );


        /*
         * =====================================================
         * MAIN APPLICATION
         * =====================================================
         *
         * script.js is intentionally loaded LAST because
         * it coordinates the application and depends on the
         * modules above.
         */

        await loadAppScript(
            "script.js"
        );


        console.log(
            "========================================"
        );

        console.log(
            "PANChayat BUSINESS SUITE LOADED"
        );

        console.log(
            "ALL APPLICATION SCRIPTS LOADED"
        );

        console.log(
            "========================================"
        );


    }

    catch(error) {

        console.error(
            "APPLICATION LOADING FAILED:",
            error
        );

    }

}


/* ============================================================
   START APPLICATION
============================================================ */

loadPanchayatApplication();