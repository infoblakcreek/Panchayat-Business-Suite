console.log("Main Bill loader loaded");


// ==========================================
// LOAD MAIN BILL HTML
// ==========================================

fetch("mainbill/mainbill.html")

    .then(response => response.text())

    .then(html => {

        document
            .getElementById("mainContent")
            .insertAdjacentHTML(
                "beforeend",
                html
            );

        console.log("Main Bill HTML loaded");


        // ==========================================
        // LOAD MAIN BILL CSS
        // ==========================================

        const css =
            document.createElement("link");

        css.rel = "stylesheet";

        css.href =
            "mainbill/mainbill.css";

        css.dataset.mainbill =
            "true";

        document.head.appendChild(css);

        console.log("Main Bill CSS loaded");


        // ==========================================
        // LOAD MAIN BILL JS
        // ==========================================

        const script =
            document.createElement("script");

        script.src =
            "mainbill/mainbill.js";

        script.onload = function () {
            console.log(
                "Main Bill JS loaded successfully"
            );

            function initializeMainBillDatePicker() {

                if (
                    typeof setupIndianDatePicker === "function"
                ) {

                    setupIndianDatePicker();

                    console.log(
                        "Main Bill date picker initialized"
                    );

                    return true;
                }

                return false;
            }

            let datePickerAttempts = 0;

            const datePickerTimer =
                setInterval(
                    function() {

                        datePickerAttempts++;

                        if (
                            initializeMainBillDatePicker()
                            ||
                            datePickerAttempts >= 40
                        ) {

                            clearInterval(
                                datePickerTimer
                            );

                        }

                    },
                    50
                );
        };

        script.onerror = function () {

            console.error(
                "Main Bill JS failed to load"
            );

        };

        document.body.appendChild(script);

    })

    .catch(error => {

        console.error(
            "Main Bill loading error:",
            error
        );

    });
