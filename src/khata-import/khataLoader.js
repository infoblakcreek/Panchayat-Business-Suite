/* ============================================================
   KHATA IMPORT LOADER
   ============================================================ */

console.log(
    "Khata Import loader loaded"
);


/* ------------------------------------------------------------
   LOAD KHATA MODULES
------------------------------------------------------------ */

const khataModules = [

    "khataUpload.js",
    "khataScanner.js",
    "khataParser.js",
    "khataRenderer.js"

];


let khataModulesLoaded = 0;


/* ------------------------------------------------------------
   LOAD EACH MODULE
------------------------------------------------------------ */

khataModules.forEach(function (moduleFile) {

    const script =
        document.createElement("script");


    script.src =
        "khata-import/" + moduleFile;


    script.onload = function () {

        khataModulesLoaded++;


        console.log(
            "Khata module loaded:",
            moduleFile
        );


        /* ----------------------------------------------------
           ALL MODULES LOADED
        ---------------------------------------------------- */

        if (
            khataModulesLoaded ===
            khataModules.length
        ) {

            console.log(
                "All Khata Import modules loaded successfully"
            );

        }

    };


    script.onerror = function () {

        console.error(
            "Khata module failed to load:",
            moduleFile
        );

    };


    document.body.appendChild(script);

});