/* ============================================================
        PAGE LOADER
============================================================ */


async function loadPage(pagePath) {

    const dashboardArea =
        document.getElementById(
            "dashboardArea"
        );


    if (!dashboardArea) {

        console.error(
            "Dashboard area not found"
        );

        return;

    }


    try {

        const response =
            await fetch(pagePath);


        const html =
            await response.text();


        dashboardArea.innerHTML =
            html;


        console.log(
            "Page loaded:",
            pagePath
        );


    }


    catch(error) {

        console.error(
            "Page loading failed:",
            error
        );

    }

}