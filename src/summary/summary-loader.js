console.log("Summary loader loaded");

// ============================================================
// LOAD SUMMARY CSS
// ============================================================

const talapatrakSummaryCSS = document.createElement("link");

talapatrakSummaryCSS.rel = "stylesheet";
talapatrakSummaryCSS.href =
    "summary/tala/talapatrakSummary.css";

document.head.appendChild(
    talapatrakSummaryCSS
);


const shikshanupakaranSummaryCSS = document.createElement("link");

shikshanupakaranSummaryCSS.rel = "stylesheet";
shikshanupakaranSummaryCSS.href =
    "summary/shik/shikshanupakaranSummary.css";

document.head.appendChild(
    shikshanupakaranSummaryCSS
);


// ============================================================
// LOAD SUMMARY HTML
// ============================================================

async function loadSummaryHTML() {

    const summaryContainer =
        document.getElementById(
            "summaryContainer"
        );

    if (!summaryContainer) {

        throw new Error(
            "Summary container not found."
        );

    }


    const talapatrakResponse =
        await fetch(
            "summary/tala/talapatrakSummary.html"
        );

    if (!talapatrakResponse.ok) {

        throw new Error(
            "Failed to load Talapatrak Summary HTML."
        );

    }


    const talapatrakHTML =
        await talapatrakResponse.text();

    summaryContainer.insertAdjacentHTML(
        "beforeend",
        talapatrakHTML
    );


    const shikshanupakaranResponse =
        await fetch(
            "summary/shik/shikshanupakaranSummary.html"
        );

    if (!shikshanupakaranResponse.ok) {

        throw new Error(
            "Failed to load Shikshanupakaran Summary HTML."
        );

    }


    const shikshanupakaranHTML =
        await shikshanupakaranResponse.text();

    summaryContainer.insertAdjacentHTML(
        "beforeend",
        shikshanupakaranHTML
    );


    // Summary views must remain hidden until explicitly opened.

    const talapatrakSummaryView =
        document.getElementById(
            "talapatrakSummaryView"
        );

    if (talapatrakSummaryView) {

        talapatrakSummaryView.style.display =
            "none";

    }


    const shikshanupakaranSummaryView =
        document.getElementById(
            "shikshanupakaranSummaryView"
        );

    if (shikshanupakaranSummaryView) {

        shikshanupakaranSummaryView.style.display =
            "none";

    }


    console.log(
        "Summary HTML loaded successfully."
    );

}


// ============================================================
// LOAD SUMMARY JAVASCRIPT
// ============================================================

function loadSummaryScript(
    scriptPath
) {

    return new Promise(
        function(resolve, reject) {

            const script =
                document.createElement("script");

            script.src =
                scriptPath;


            script.onload =
                function() {

                    console.log(
                        "Summary JS loaded:",
                        scriptPath
                    );

                    resolve();

                };


            script.onerror =
                function() {

                    console.error(
                        "Summary JS failed:",
                        scriptPath
                    );

                    reject(
                        new Error(
                            "Failed to load Summary JS: "
                            + scriptPath
                        )
                    );

                };


            document.body.appendChild(
                script
            );

        }
    );

}


// ============================================================
// INITIALIZE SUMMARY
// ============================================================

async function initializeSummaryLoader() {

    try {

        await loadSummaryHTML();


        await loadSummaryScript(
            "summary/tala/talapatrakSummary.js"
        );


        await loadSummaryScript(
            "summary/shik/shikshanupakaranSummary.js"
        );


        console.log(
            "========================================"
        );

        console.log(
            "SUMMARY SYSTEM LOADED"
        );

        console.log(
            "========================================"
        );

    }
    catch (error) {

        console.error(
            "Summary loading failed:",
            error
        );

    }

}


initializeSummaryLoader();