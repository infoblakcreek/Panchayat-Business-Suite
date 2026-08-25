// ==========================================================================//



// ==========================================
// GENERATE BILL NUMBER
// ==========================================

async function generateBillNumber() {

    const currentYear =
        new Date().getFullYear();


    let billNumber;

    let exists = true;


    while (exists) {

        const digitCount =
            Math.random() < 0.5
                ? 6
                : 7;


        const min =
            digitCount === 6
                ? 100000
                : 1000000;


        const max =
            digitCount === 6
                ? 999999
                : 9999999;


        const randomNumber =
            Math.floor(
                Math.random() *
                (max - min + 1)
            ) + min;


        billNumber =
            `${currentYear}-${randomNumber}`;


        const existingBill =
            await db
                .collection("bills")
                .doc(billNumber)
                .get();


        exists =
            existingBill.exists;

    }


    return billNumber;

}


// ==========================================
// SET INITIAL BILL NUMBER
// ==========================================

async function setInitialBillNumber() {

    const billNumber =
        await generateBillNumber();


    const billNo =
        document.getElementById(
            "billNo"
        );


    if (billNo) {

        billNo.value =
            billNumber;

    }

}

window.setInitialBillNumber = setInitialBillNumber;


// ==========================================
// CALCULATE ROW
// ==========================================

function calculateRow(input) {

    const row =
        input.closest("tr");


    const pages =
        parseFloat(
            row.querySelector(
                ".pages"
            ).value
        ) || 0;


    const price =
        parseFloat(
            row.querySelector(
                ".price"
            ).value
        ) || 0;


    const total =
        pages * price;


    row.querySelector(
        ".total"
    ).value =
        total.toFixed(2);


    calculateGrandTotal();

}


// Make available to inline HTML
window.calculateRow =
    calculateRow;


// ==========================================
// CALCULATE GRAND TOTAL
// ==========================================

function calculateGrandTotal() {

    let sum = 0;


    document
        .querySelectorAll(
            "#itemBody .total"
        )
        .forEach(function(input) {

            sum +=
                parseFloat(
                    input.value
                ) || 0;

        });


    const grandTotal =
        document.getElementById(
            "grandTotal"
        );


    if (grandTotal) {

        grandTotal.value =
            sum.toFixed(2);

    }

}


// ==========================================
// ADD NEW ITEM ROW
// ==========================================

function addItemRow() {

    const tbody =
        document.getElementById(
            "itemBody"
        );


    if (!tbody) return;


    const row =
        document.createElement(
            "tr"
        );


    row.className =
        "data-row";


    row.innerHTML = `

        <td>

            <input
                class="table-input srno"
                type="number"
                readonly>

        </td>


        <td>

            <textarea
                class="description"
                rows="2"></textarea>

        </td>


        <td>

            <input
                class="table-input pages"
                type="number"
                oninput="calculateRow(this)">

        </td>


        <td>

            <input
                class="table-input price"
                type="number"
                step="0.01"
                oninput="calculateRow(this)">

        </td>


        <td>

            <input
                class="table-input total"
                type="number"
                readonly>

        </td>


        <td>

            <button
                class="delete-btn"
                type="button"
                onclick="deleteCurrentRow(this)">

                🗑

            </button>

        </td>

    `;


    tbody.appendChild(
        row
    );


    updateSerialNumbers();


    autoResizeDescription(
        row.querySelector(
            ".description"
        )
    );

}


// ==========================================
// ADD ROW BUTTON
// ==========================================

const addRowBtn =
    document.getElementById(
        "addRow"
    );


if (addRowBtn) {

    addRowBtn.addEventListener(
        "click",
        addItemRow
    );

}


// ==========================================
// DELETE ROW
// ==========================================

function deleteCurrentRow(button) {

    const tbody =
        document.getElementById(
            "itemBody"
        );


    if (
        tbody.rows.length === 1
    ) {

        alert(
            "At least one row is required."
        );

        return;

    }


    button
        .closest("tr")
        .remove();


    updateSerialNumbers();


    calculateGrandTotal();

}


window.deleteCurrentRow =
    deleteCurrentRow;


// ==========================================
// UPDATE SERIAL NUMBERS
// ==========================================

function updateSerialNumbers() {

    const rows =
        document.querySelectorAll(
            "#itemBody tr"
        );


    rows.forEach(
        function(row, index) {

            const srno =
                row.querySelector(
                    ".srno"
                );


            if (srno) {

                srno.value =
                    index + 1;

            }

        }
    );

}


// ==========================================
// AUTO-RESIZE DESCRIPTION
// ==========================================

function autoResizeDescription(textarea) {

    if (!textarea) return;


    textarea.style.height =
        "auto";


    textarea.style.height =
        textarea.scrollHeight +
        "px";

}


// ==========================================
// DESCRIPTION INPUT LISTENER
// ==========================================

document.addEventListener(
    "input",
    function(event) {

        if (
            event.target.classList
                .contains(
                    "description"
                )
        ) {

            autoResizeDescription(
                event.target
            );

        }

    }
);


// ==========================================
// FORM FIELD LIVE SYNC
// ==========================================

const formFields = [

    "customerName",

    "village",

    "taluka",

    "district",

    "mobileNumber",

    "billNo",

    "billDate",

    "paymentDetails",

    "grandTotal",

    "numberToGujaratiWords"

];


formFields.forEach(
    function(id) {

        const element =
            document.getElementById(
                id
            );


        if (element) {

            element.addEventListener(
                "input",
                function() {

                    // Reserved for
                    // next-page syncing

                    console.log(
                        `${id} updated`
                    );

                }
            );

        }

    }
);


// ==========================================
// INITIALIZE FORM
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        setInitialBillNumber();


        updateSerialNumbers();


        const firstDescription =
            document.querySelector(
                ".description"
            );


        if (
            firstDescription
        ) {

            autoResizeDescription(
                firstDescription
            );

        }

    }
);



// ==========================================================================//

// ==========================================
// FORMAT DATE IN INDIAN FORMAT
// ==========================================

function formatIndianDate(dateValue) {

    if (!dateValue) return "";

    const date =
        new Date(
            dateValue + "T00:00:00"
        );


    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}
// ==========================================
// GENERATE RECEIPT BUTTON
// ==========================================

const generateReceiptBtn =
    document.getElementById(
        "generateReceiptBtn"
    );


if (generateReceiptBtn) {

    generateReceiptBtn.addEventListener(
        "click",
        generateReceipt
    );

}


function generateReceipt() {

    try {

        /*
        ==========================================
            GENERATE PAVTI NUMBER
        ==========================================
        */

        const billNo =
            document
                .getElementById(
                    "billNo"
                )
                .value
                .trim();


        const billDate =
            document
                .getElementById(
                    "billDate"
                )
                .value;


        const customerName =
            document
                .getElementById(
                    "customerName"
                )
                .value
                .trim();


        if (!billNo) {

            alert(
                "Please enter Bill Number first."
            );

            return;

        }


        if (!customerName) {

            alert(
                "Please enter Customer Name first."
            );

            return;

        }


        /*
        ==========================================
            CREATE RECEIPT NUMBER
        ==========================================
        */

        const receiptNumber =
            "P-" + billNo;


        /*
        ==========================================
            SET DUPLICATE RECEIPT DETAILS
        ==========================================
        */

        document
            .getElementById(
                "dPavtiNo"
            )
            .value =
            receiptNumber;


        document
            .getElementById(
                "dPavtiDate"
            )
            .value =
            formatIndianDate(
                billDate
            );


        /*
        ==========================================
            GENERATE MAIN + DUPLICATE BILL
        ==========================================
        */

        generatePrintableBills();


        /*
        ==========================================
            SHOW RECEIPT BELOW FORM
        ==========================================
        */

        document.body.classList.add(
            "receiptGeneratedMode"
        );


        const printableBills =
            document.getElementById(
                "printableBills"
            );


        printableBills.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });


        console.log(
            "Receipt generated successfully."
        );


    } catch(error) {

        console.error(
            "Error generating receipt:",
            error
        );


        alert(
            "Error generating receipt: " +
            error.message
        );

    }

}


// ==========================================
// GENERATE RECEIPT ITEMS
// ==========================================


function generatePrintableBills() {


    /*
    ==========================================
        MAIN BILL DETAILS
    ==========================================
    */

    document
        .getElementById("pCustomerName")
        .textContent =
        document
            .getElementById("customerName")
            .value;


    document
        .getElementById("pBillNo")
        .textContent =
        document
            .getElementById("billNo")
            .value;


    document
        .getElementById("pVillage")
        .textContent =
        document
            .getElementById("village")
            .value;


    document
        .getElementById("pTaluka")
        .textContent =
        document
            .getElementById("taluka")
            .value;


    document
        .getElementById("pDistrict")
        .textContent =
        document
            .getElementById("district")
            .value;


    document
        .getElementById("pBillDate")
        .textContent =
        formatIndianDate(
            document
                .getElementById("billDate")
                .value
        );


    document
        .getElementById("pMobileNumber")
        .textContent =
        document
            .getElementById("mobileNumber")
            .value;


    document
        .getElementById("pAmountWords")
        .textContent =
        document
            .getElementById(
                "numberToGujaratiWords"
            )
            .value;


    document
        .getElementById("pGrandTotal")
        .textContent =
        document
            .getElementById("grandTotal")
            .value;


    document
        .getElementById("pPaymentDetails")
        .textContent =
        document
            .getElementById("paymentDetails")
            .value;


    /*
    ==========================================
        DUPLICATE BILL DETAILS
    ==========================================
    */

    document
        .getElementById("dCustomerName")
        .textContent =
        document
            .getElementById("customerName")
            .value;


    document
        .getElementById("dVillage")
        .textContent =
        document
            .getElementById("village")
            .value;


    document
        .getElementById("dTaluka")
        .textContent =
        document
            .getElementById("taluka")
            .value;


    document
        .getElementById("dDistrict")
        .textContent =
        document
            .getElementById("district")
            .value;


    document
        .getElementById("dGrandTotal")
        .textContent =
        document
            .getElementById("grandTotal")
            .value;


    document
        .getElementById("dAmountWords")
        .textContent =
        document
            .getElementById(
                "numberToGujaratiWords"
            )
            .value;


    document
        .getElementById("dPaymentDetails")
        .textContent =
        document
            .getElementById("paymentDetails")
            .value;


    /*
    ==========================================
        MAIN BILL ITEMS
    ==========================================
    */

    const printItems =
        document.getElementById(
            "printMainItems"
        );


    printItems.innerHTML = "";


    document
        .querySelectorAll(
            "#itemBody tr"
        )
        .forEach(function(row) {


            const printRow =
                document.createElement(
                    "tr"
                );


            const srno =
                row
                    .querySelector(
                        ".srno"
                    )
                    .value;


            const description =
                row
                    .querySelector(
                        ".description"
                    )
                    .value;


            const pages =
                row
                    .querySelector(
                        ".pages"
                    )
                    .value;


            const price =
                row
                    .querySelector(
                        ".price"
                    )
                    .value;


            const total =
                row
                    .querySelector(
                        ".total"
                    )
                    .value;


            printRow.innerHTML = `

                <td>
                    ${srno}
                </td>

                <td class="printDescription">
                    ${description}
                </td>

                <td>
                    ${pages}
                </td>

                <td>
                    ₹ ${price}
                </td>

                <td>
                    ₹ ${total}
                </td>

            `;


            printItems.appendChild(
                printRow
            );

        });


}


// ==========================================
// CREATE RECENT ACTIVITY
// ==========================================

async function createActivity(activityData) {

    await db
        .collection("activities")
        .add({

            ...activityData,

            createdAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        });

}
// ==========================================
// SAVE CURRENT BILL
// ==========================================

async function saveCurrentBill() {

    const billNo =
        document
            .getElementById("billNo")
            .value
            .trim();


    if (!billNo) {

        throw new Error(
            "Bill number is missing."
        );

    }


    /*
    ==========================================
        COLLECT BILL ITEMS
    ==========================================
    */

    const items = [];


    document
        .querySelectorAll(
            "#itemBody tr"
        )
        .forEach(function(row) {

            const description =
                row
                    .querySelector(
                        ".description"
                    )
                    .value
                    .trim();


            const pages =
                parseFloat(
                    row
                        .querySelector(
                            ".pages"
                        )
                        .value
                )
                || 0;


            const price =
                parseFloat(
                    row
                        .querySelector(
                            ".price"
                        )
                        .value
                )
                || 0;


            const total =
                parseFloat(
                    row
                        .querySelector(
                            ".total"
                        )
                        .value
                )
                || 0;


            items.push({

                srno:
                    row
                        .querySelector(
                            ".srno"
                        )
                        .value,

                description,

                pages,

                price,

                total

            });

        });


    /*
    ==========================================
        BILL DATA
    ==========================================
    */

    const billData = {

        billNo:

            billNo,


        customerName:

            document
                .getElementById(
                    "customerName"
                )
                .value
                .trim(),


        village:

            document
                .getElementById(
                    "village"
                )
                .value
                .trim(),


        taluka:

            document
                .getElementById(
                    "taluka"
                )
                .value
                .trim(),


        district:

            document
                .getElementById(
                    "district"
                )
                .value
                .trim(),


        mobileNumber:

            document
                .getElementById(
                    "mobileNumber"
                )
                .value
                .trim(),


        billDate:

            document
                .getElementById(
                    "billDate"
                )
                .value,


        paymentDetails:

            document
                .getElementById(
                    "paymentDetails"
                )
                .value
                .trim(),


        numberToGujaratiWords:

            document
                .getElementById(
                    "numberToGujaratiWords"
                )
                .value
                .trim(),


        grandTotal:

            Number(
                document
                    .getElementById(
                        "grandTotal"
                    )
                    .value
            )
            || 0,


        items:

            items,


        updatedAt:

            firebase.firestore.FieldValue
                .serverTimestamp()

    };


    /*
    ==========================================
        CHECK IF BILL ALREADY EXISTS
    ==========================================
    */

    const billReference =
        db
            .collection("bills")
            .doc(billNo);


    const existingBill =
        await billReference.get();


    /*
    ==========================================
        UPDATE EXISTING BILL
    ==========================================
    */

    if (existingBill.exists) {

    await billReference.update(

        billData

    );


    await createActivity({

        type:
            "updated",

        title:
            "Bill updated",

        message:
            "Bill " + billNo,

        billNo:
            billNo,

        amount:
            billData.grandTotal,

        customerName:
            billData.customerName

    });


    console.log(
        "Bill updated successfully:",
        billNo
    );

}


    /*
    ==========================================
        CREATE NEW BILL
    ==========================================
    */

    else {

    await billReference.set({

        ...billData,


        createdAt:

            firebase.firestore.FieldValue
                .serverTimestamp()

    });


    await createActivity({

        type:
            "created",

        title:
            "New bill created",

        message:
            `Main Bill • ₹${Number(
                billData.grandTotal
            ).toLocaleString(
                "en-IN"
            )}`,

        billNo:
            billNo,

        amount:
            billData.grandTotal,

        customerName:
            billData.customerName

    });


    console.log(
        "New bill saved successfully:",
        billNo
    );

}


    /*
    ==========================================
        REFRESH DASHBOARD DATA
    ==========================================
    */

    await loadDashboardStats();
    
    await loadRecentBills();
    
    await loadRecentActivity();

}

// ========================================================================//

// ==========================================
// BACK TO EDIT
// ==========================================

const backToEditBtn =
    document.getElementById(
        "backToEditBtn"
    );


if (backToEditBtn) {

    backToEditBtn.addEventListener(
        "click",
        function () {

            document.body.classList.remove(
                "receiptGeneratedMode"
            );

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}

// ==========================================
// SAVE BILL BUTTON
// ==========================================

const saveBillBtn =
    document.getElementById(
        "saveBillBtn"
    );


if (saveBillBtn) {

    saveBillBtn.addEventListener(
        "click",
        async function() {

            try {

                await saveCurrentBill();

                alert(
                    "Bill saved successfully."
                );

            }

            catch(error) {

                console.error(
                    "Error saving bill:",
                    error
                );

                alert(
                    "Bill could not be saved: " +
                    error.message
                );

            }

        }
    );

}

// ==========================================================================//


// ==========================================
// PRINT BILL
// ==========================================

const printBillBtn =
    document.getElementById(
        "printBillBtn"
    );


if (printBillBtn) {

    printBillBtn.addEventListener(
        "click",
        function() {

          console.log("MAIN BILL PRINT BUTTON CLICKED");

            console.time("Main Bill Print Generation");

            generatePrintableBills();
            
            console.timeEnd("Main Bill Print Generation");


            document.body.classList.add(
                "showCutLine"
            );


            window.print();

        }

    );

}



// ==========================================
// AFTER PRINT - MAIN BILL ONLY
// ==========================================

window.addEventListener(
    "afterprint",
    function() {

        document.body.classList.remove(
            "showCutLine"
        );

        console.log(
            "Main bill print completed."
        );

    }

);