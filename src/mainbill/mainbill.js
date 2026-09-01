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

    // Main Bill allows a maximum of 5 item rows.
    if (tbody.rows.length >= 5) {

        const limitMessage =
            document.getElementById(
                "mainBillRowLimitMessage"
            );

        if (limitMessage) {

            limitMessage.textContent =
                "⚠️ Maximum 5 rows are allowed in the Main Bill.";

            limitMessage.classList.add(
                "show"
            );

        }

        return;

    }



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

// ========================================================================================//



// ============================================================
// MAIN BILL + DUPLICATE RECEIPT PRINT
// IMPORTANT:
// This creates a completely separate print document.
// It does NOT use the global application's print CSS.
// Therefore Talapatrak / Shikshanupakaran landscape printing
// remains completely untouched.
// ============================================================

const printBillBtn =
    document.getElementById("printBillBtn");


if (printBillBtn) {

    printBillBtn.addEventListener(
        "click",
        printMainBillAndReceipt
    );

}


function printMainBillAndReceipt() {

    console.log(
        "MAIN BILL + DUPLICATE RECEIPT PRINT"
    );


    // --------------------------------------------------------
    // Generate the latest bill data first
    // --------------------------------------------------------

    generatePrintableBills();


    // --------------------------------------------------------
    // Get the two things we actually want to print
    // --------------------------------------------------------

    const mainBill =
        document.getElementById(
            "generatedMainBill"
        );


    const duplicateReceipt =
        document.getElementById(
            "duplicateReceipt"
        );


    if (!mainBill) {

        console.error(
            "generatedMainBill not found."
        );

        alert(
            "Main bill could not be prepared for printing."
        );

        return;

    }


    if (!duplicateReceipt) {

        console.error(
            "duplicateReceipt not found."
        );

        alert(
            "Duplicate receipt could not be prepared for printing."
        );

        return;

    }


    // --------------------------------------------------------
    // Open a completely separate print window
    // --------------------------------------------------------

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=900,height=1200"
        );


    if (!printWindow) {

        alert(
            "Please allow pop-ups for this site to print the bill."
        );

        return;

    }


    // --------------------------------------------------------
    // Clone only the required bill content
    // --------------------------------------------------------

    const mainBillClone =
        mainBill.cloneNode(true);


    const duplicateClone =
        duplicateReceipt.cloneNode(true);


    // --------------------------------------------------------
    // Build print document
    // --------------------------------------------------------

    printWindow.document.open();


    printWindow.document.write(`

<!DOCTYPE html>

<html lang="gu">

<head>

<meta charset="UTF-8">

<title>Bill Print</title>


<style>

/* ============================================================
   MAIN BILL PRINT DOCUMENT
   THIS CSS EXISTS ONLY INSIDE THIS NEW PRINT WINDOW.
   IT CANNOT AFFECT TALAPATRAK OR SHIKSHANUPAKARAN.
============================================================ */


/* ------------------------------------------------------------
   PORTRAIT A4
------------------------------------------------------------ */

@page {

    size: A4 portrait;

    margin: 0;

}


/* ------------------------------------------------------------
   RESET
------------------------------------------------------------ */

* {

    box-sizing: border-box;

}


html,
body {

    margin: 0;

    padding: 0;

    width: 100%;

    min-height: 100%;

}


body {

    background: white;

    color: #202020;

    font-family:
        "Noto Sans Gujarati",
        "Nirmala UI",
        Arial,
        sans-serif;

}


/* ------------------------------------------------------------
   PRINT PAGE
------------------------------------------------------------ */

.printPage {

    width: 210mm;

    height: 297mm;

    margin: 0 auto;

    padding: 0 20px 20px 20px;

    background: white;

    display: flex;

    flex-direction: column;

    overflow: hidden;

}


/* ============================================================
   MAIN BILL
   70% WIDTH
   APPROX 70% HEIGHT
============================================================ */

.mainBillPrintArea {

    width: 70%;

    height: 70%;

    margin: 30px auto 0 auto;

    padding: 20px;

    background: white;

    overflow: hidden;

    border: 1px solid #777;

}


/* ------------------------------------------------------------
   Main bill itself
------------------------------------------------------------ */

.mainBillPrintArea
#generatedMainBill {

    width: 100% !important;

    max-width: none !important;

    margin: 0 !important;

    padding: 0 !important;

    background: white !important;

    box-shadow: none !important;

    border: none !important;

}


/* ------------------------------------------------------------
   Main bill tables
------------------------------------------------------------ */

.mainBillPrintArea table {

    width: 100%;

    border-collapse: collapse;

}


/* ------------------------------------------------------------
   Main bill header
------------------------------------------------------------ */

.mainBillPrintArea
.printHeaderRow {

    border-bottom: 2px solid #202020;

}


.mainBillPrintArea
.printHeaderRow td {

    padding: 10px 8px;

    vertical-align: middle;

}


.mainBillPrintArea
.printHeaderRow h1 {

    margin: 2px 0 2px;

    font-size: 18px;

    line-height: 1.3;

    font-weight: 700;

}


.mainBillPrintArea
.printHeaderRow h2 {

    margin: 0 0 3px;

    font-size: 10px;

    line-height: 1.3;

}


.mainBillPrintArea
.printHeaderRow p {

    margin: 2px 0;

    font-size: 8px;

    line-height: 1.4;

}


.mainBillPrintArea
.printGanesh {

    margin-bottom: 2px;

    font-size: 9px;

}


.mainBillPrintArea
.printPhone {

    width: 85px;

    font-size: 9px;

}


/* ============================================================
   CUSTOMER DETAILS
============================================================ */

.mainBillPrintArea
.printCustomerDetails {

    width: 100%;

    border-collapse: collapse;

}


.mainBillPrintArea
.printCustomerDetails td {

    padding: 6px 5px;

    font-size: 9px;

    border-bottom: 1px solid #ccc;

    vertical-align: middle;

}


.mainBillPrintArea
.printCustomerDetails label,

.mainBillPrintArea
.printCustomerDetails strong {

    margin-right: 4px;

    font-size: 9px;

    font-weight: 700;

}


.mainBillPrintArea
.printCustomerDetails span {

    min-width: 60px;

    padding: 2px 4px;

    font-size: 9px;

}


/* Address row */

.mainBillPrintArea
.printCustomerDetails tr:nth-child(2) {

    white-space: nowrap;

}


/* ============================================================
   ITEMS TABLE
============================================================ */

.mainBillPrintArea
.itemTableSpace > td {

    padding: 8px 0 5px;

}


.mainBillPrintArea
.innerItemTable {

    width: 100%;

    table-layout: fixed;

    border-collapse: collapse;

}


.mainBillPrintArea
.innerItemTable th {

    padding: 5px 4px;

    background: #f5f5f5;

    border: 1px solid #777;

    font-size: 8px;

    line-height: 1.2;

}


.mainBillPrintArea
.innerItemTable td {

    padding: 5px 4px;

    border: 1px solid #999;

    font-size: 8px;

    line-height: 1.3;

    vertical-align: middle;

}


.mainBillPrintArea
.innerItemTable th:nth-child(1),

.mainBillPrintArea
.innerItemTable td:nth-child(1) {

    width: 8%;

    text-align: center;

}


.mainBillPrintArea
.innerItemTable th:nth-child(2),

.mainBillPrintArea
.innerItemTable td:nth-child(2) {

    width: 42%;

    text-align: left;

}


.mainBillPrintArea
.innerItemTable th:nth-child(3),

.mainBillPrintArea
.innerItemTable td:nth-child(3) {

    width: 15%;

    text-align: center;

}


.mainBillPrintArea
.innerItemTable th:nth-child(4),

.mainBillPrintArea
.innerItemTable td:nth-child(4),

.mainBillPrintArea
.innerItemTable th:nth-child(5),

.mainBillPrintArea
.innerItemTable td:nth-child(5) {

    width: 17.5%;

    text-align: right;

}


/* ============================================================
   SUMMARY
============================================================ */

.mainBillPrintArea
.printSummaryRow td {

    padding: 6px 5px;

    font-size: 9px;

    border-bottom: 1px solid #ccc;

}


.mainBillPrintArea
.printSummaryRow label {

    margin-right: 5px;

    font-weight: 700;

}


.mainBillPrintArea
#pAmountWords {

    display: inline-block;

    min-width: 60%;

    padding: 3px 5px;

    font-size: 9px;

}


.mainBillPrintArea
#pGrandTotal {

    display: inline-block;

    min-width: 90px;

    min-height: 30px;

    padding: 5px 8px;

    border: 1px solid #202020;

    border-radius: 3px;

    font-size: 13px;

    font-weight: 700;

    text-align: right;

}


/* ============================================================
   PAYMENT
============================================================ */

.mainBillPrintArea
.printPaymentDetails {

    padding: 6px 5px;

    font-size: 8px;

    border-bottom: 1px solid #ccc;

}


.mainBillPrintArea
.printFooter td {

    padding: 8px 5px;

    font-size: 9px;

}


/* ============================================================
   CUT LINE
============================================================ */

.printCutLine {

    width: 100%;

    height: 5%;

    min-height: 15px;

    margin-top: 30px;

    display: flex;

    align-items: center;

    justify-content: center;

}


.printCutLineInner {

    width: 100%;

    border-top: 1px dashed #888;

    text-align: center;

    position: relative;

}


.printCutLineInner span {

    position: relative;

    top: -8px;

    padding: 0 8px;

    background: white;

    color: #777;

    font-size: 7px;

}


/* ============================================================
   DUPLICATE RECEIPT
   100% WIDTH
   APPROX 25% HEIGHT
============================================================ */

.duplicatePrintArea {

    width: 100%;

    height: 30%;

    margin: 0;

    padding: 20px;

    background: white;

    border: 1px solid #777;

    overflow: hidden;

    flex-shrink: 0;

}


/* ------------------------------------------------------------
   Duplicate receipt itself
------------------------------------------------------------ */

.duplicatePrintArea
#duplicateReceipt {

    width: 100% !important;

    max-width: none !important;

    margin: 0 !important;

    padding: 0 !important;

    background: white !important;

    border-radius: 0 !important;

    box-shadow: none !important;

}


/* ------------------------------------------------------------
   Duplicate header
------------------------------------------------------------ */

.duplicatePrintArea
.duplicateHeader {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 12px;

    padding-bottom: 7px;

    border-bottom: 1px solid #888;

}


.duplicatePrintArea
.duplicateCompany h4 {

    margin: 0;

    font-size: 13px;

}


.duplicatePrintArea
.duplicateCompany p {

    margin: 2px 0 0;

    font-size: 8px;

}


.duplicatePrintArea
.duplicatePhone {

    font-size: 9px;

}


/* ============================================================
   RECEIPT TITLE
============================================================ */

.duplicatePrintArea
.receiptTitle {

    margin: 6px 0;

    text-align: center;

    font-size: 15px;

    font-weight: 700;

}


/* ============================================================
   RECEIPT HEADER
============================================================ */

.duplicatePrintArea
.duplicateReceiptHeader {

    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 15px;

    margin-bottom: 6px;

}


.duplicatePrintArea
.duplicateReceiptHeader > div {

    display: flex;

    align-items: center;

    gap: 5px;

}


.duplicatePrintArea
.duplicateReceiptHeader label {

    font-size: 8px;

    font-weight: 700;

}


.duplicatePrintArea
.duplicateReceiptHeader input {

    width: 100%;

    padding: 3px 4px;

    border: none;

    border-bottom: 1px solid #888;

    background: transparent;

    font-size: 8px;

}


/* ============================================================
   CUSTOMER
============================================================ */

.duplicatePrintArea
.duplicateCustomer {

    display: grid;

    grid-template-columns: 2fr 1fr 1fr;

    gap: 10px;

    margin-bottom: 5px;

}


.duplicatePrintArea
.duplicateCustomer > div {

    display: flex;

    align-items: baseline;

    gap: 4px;

}


.duplicatePrintArea
.duplicateCustomer label {

    font-size: 8px;

    font-weight: 700;

}


.duplicatePrintArea
.duplicateCustomer span {

    min-width: 40px;

    padding: 2px 4px;

    font-size: 8px;

}


/* ============================================================
   RECEIPT BODY
============================================================ */

.duplicatePrintArea
.receiptBody {

    margin-top: 5px;

    padding: 5px 0;

    border-top: 1px solid #888;

    border-bottom: 1px solid #888;

}


.duplicatePrintArea
.receiptBody p {

    margin: 0 0 5px;

    font-size: 8px;

    line-height: 1.5;

}


.duplicatePrintArea
.receiptBody strong {

    margin: 0 3px;

    font-size: 10px;

}


/* ============================================================
   AMOUNT WORDS
============================================================ */

.duplicatePrintArea
.amountWordsReceipt {

    display: flex;

    align-items: flex-start;

    gap: 7px;

    margin-bottom: 5px;

}


.duplicatePrintArea
.amountWordsReceipt label {

    font-size: 8px;

    font-weight: 700;

}


.duplicatePrintArea
.amountWordsReceipt span {

    flex: 1;

    min-width: 0;

    min-height: 15px;

    padding: 2px 4px;

    font-size: 8px;

}


/* ============================================================
   PAYMENT
============================================================ */

.duplicatePrintArea
.paymentDetails {

    display: flex;

    flex-wrap: wrap;

    gap: 15px;

    margin-top: 5px;

}


.duplicatePrintArea
.paymentDetails > div {

    display: flex;

    align-items: center;

    gap: 4px;

}


.duplicatePrintArea
.paymentDetails label {

    font-size: 8px;

    font-weight: 700;

}


.duplicatePrintArea
.paymentDetails span {

    min-width: 50px;

    min-height: 14px;

    padding: 2px 4px;

    font-size: 8px;

}


/* ============================================================
   FOOTER
============================================================ */

.duplicatePrintArea
.duplicateFooter {

    display: flex;

    justify-content: space-between;

    margin-top: 8px;

    font-size: 8px;

    font-weight: 600;

}


/* ============================================================
   PRINT
============================================================ */

@media print {

    html,
    body {

        width: 210mm;

        height: 297mm;

        margin: 0;

        padding: 0;

    }

    .printPage {

        width: 210mm;

        height: 297mm;

        margin: 0;

        padding: 20px;

    }

}


/* ============================================================
   SCREEN PREVIEW
============================================================ */

@media screen {

    body {

        background: #eeeeee;

    }

    .printPage {

        margin: 20px auto;

        box-shadow:
            0 4px 20px rgba(0,0,0,.15);

    }

}

/* ============================================================
   MAIN BILL INNER CONTENT ONLY
   DO NOT TOUCH:
   - .printPage
   - .mainBillPrintArea
   - .printCutLine
   - .duplicatePrintArea
   - duplicate receipt
============================================================ */

@media print {

    /* ========================================================
       MAIN BILL ROOT
       Equal breathing room on all four sides
    ======================================================== */

    #generatedMainBill {

        width: 100% !important;
        max-width: none !important;

        margin: 0 !important;

        padding: 12px !important;

        box-sizing: border-box !important;

        overflow: visible !important;

        background: #ffffff !important;
        color: #202020 !important;

        font-family:
            "Noto Sans Gujarati",
            "Nirmala UI",
            Arial,
            sans-serif;

    }


    /* ========================================================
       INNER ELEMENTS
    ======================================================== */

    #generatedMainBill *,
    #generatedMainBill *::before,
    #generatedMainBill *::after {

        box-sizing: border-box !important;

    }


    /* ========================================================
       OUTER BILL TABLE
    ======================================================== */

    #generatedMainBill .printBillTable {

        width: 100% !important;
        max-width: none !important;

        margin: 0 !important;
        padding: 0 !important;

        border-collapse: collapse !important;

        table-layout: auto !important;

        background: #ffffff !important;

    }


    #generatedMainBill .printBillTable td {

        min-width: 0 !important;

    }


    /* ========================================================
       HEADER
    ======================================================== */

    #generatedMainBill .printHeaderRow {

        border-bottom: 1px solid #d6d6d6 !important;

    }


    #generatedMainBill .printHeaderRow td {

        padding: 28px 12px 18px !important;

        vertical-align: middle !important;

    }


    #generatedMainBill .printHeaderRow h1 {

        margin: 3px 0 5px !important;

        font-family:
            "Noto Sans Gujarati",
            "Nirmala UI",
            sans-serif;

        font-size: 25px !important;

        line-height: 1.35 !important;

        font-weight: 700 !important;

        color: #202020 !important;

        white-space: normal !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .printHeaderRow h2 {

        margin: 0 0 5px !important;

        font-family: Arial, sans-serif;

        font-size: 14px !important;

        line-height: 1.35 !important;

        font-weight: 700 !important;

        letter-spacing: .7px;

        color: #444 !important;

        white-space: normal !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .printHeaderRow p {

        margin: 2px 0 !important;

        font-size: 11px !important;

        line-height: 1.45 !important;

        color: #666 !important;

        white-space: normal !important;

        overflow-wrap: anywhere !important;

    }


    /* ========================================================
       શ્રી ગણેશાય નમઃ
       CENTERED WITH SAME TOP/BOTTOM BREATHING ROOM
    ======================================================== */

    /* ========================================================
    શ્રી ગણેશાય નમઃ
    CENTER OF THE COMPLETE MAIN BILL BOX
    ======================================================== */

    #generatedMainBill {

        position: relative !important;

    }


    #generatedMainBill .printGanesh {

        position: absolute !important;

        top: 6px !important;

        left: 50% !important;

        transform: translateX(-50%) !important;

        width: max-content !important;

        margin: 0 !important;

        padding: 0 !important;

        text-align: center !important;

        font-size: 12px !important;

        line-height: 1.4 !important;

        color: #333 !important;

        white-space: nowrap !important;

    }

    /* ========================================================
       PHONE
    ======================================================== */

    #generatedMainBill .printPhone {

        width: auto !important;

        max-width: none !important;

        padding: 0 8px !important;

        font-family: Arial, sans-serif;

        font-size: 12px !important;

        line-height: 1.5 !important;

        font-weight: 600;

        text-align: center;

        white-space: nowrap !important;

    }


    /* ========================================================
       CUSTOMER ROW
    ======================================================== */

    #generatedMainBill .printCustomerRow td {

        padding: 8px 0 !important;

        width: auto !important;

    }


    /* ========================================================
       CUSTOMER BOX
    ======================================================== */

    #generatedMainBill .printCustomerDetails {

        width: 100% !important;

        max-width: none !important;

        margin: 0 !important;

        border-collapse: collapse !important;

        table-layout: auto !important;

        background: #f8f8f8 !important;

        border: 1px solid #dedede !important;

        border-radius: 8px !important;

        overflow: visible !important;

    }


    #generatedMainBill .printCustomerDetails td {

        padding: 7px 10px !important;

        font-size: 11px !important;

        line-height: 1.4 !important;

        vertical-align: middle !important;

        border-bottom: 1px solid #dedede !important;

        min-width: 0 !important;

        width: auto !important;

        overflow: visible !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill
    .printCustomerDetails tr:last-child td {

        border-bottom: none !important;

    }


    #generatedMainBill
    .printCustomerDetails label,

    #generatedMainBill
    .printCustomerDetails strong {

        margin-right: 7px !important;

        font-weight: 700 !important;

        color: #202020 !important;

    }


    #generatedMainBill
    .printCustomerDetails span {

        display: inline-block !important;

        min-width: 0 !important;

        max-width: none !important;

        padding: 2px 5px !important;

        color: #202020 !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .panchayatText {

        margin-left: 6px !important;

        font-size: 10px !important;

        color: #666 !important;

    }


    /* ========================================================
       ADDRESS
    ======================================================== */

    #generatedMainBill
    .printCustomerDetails tr:nth-child(2) {

        white-space: normal !important;

    }


    #generatedMainBill
    .printCustomerDetails tr:nth-child(2) td {

        padding-top: 7px !important;

        padding-bottom: 7px !important;

        white-space: normal !important;

        overflow-wrap: anywhere !important;

    }


    /* ========================================================
       ITEM TABLE AREA
    ======================================================== */

    #generatedMainBill .itemTableSpace > td {

        width: auto !important;

        padding: 8px 0 !important;

        overflow: visible !important;

    }


    #generatedMainBill .innerItemTable {

        width: 100% !important;

        max-width: none !important;

        margin: 0 !important;

        padding: 0 !important;

        border-collapse: collapse !important;

        table-layout: fixed !important;

        background: #ffffff !important;

    }


    /* ========================================================
       ITEM TABLE CELLS
    ======================================================== */

    #generatedMainBill .innerItemTable th,
    #generatedMainBill .innerItemTable td {

        box-sizing: border-box !important;

        padding: 7px 6px !important;

        min-width: 0 !important;

        overflow: visible !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .innerItemTable th {

        background: #f5f5f5 !important;

        border: 1px solid #bdbdbd !important;

        color: #555 !important;

        font-size: 10px !important;

        font-weight: 700 !important;

        line-height: 1.35 !important;

        text-align: center !important;

    }


    #generatedMainBill .innerItemTable td {

        border: 1px solid #c8c8c8 !important;

        font-size: 10px !important;

        line-height: 1.4 !important;

        vertical-align: middle !important;

        color: #202020 !important;

        word-break: normal !important;

    }


    /* ========================================================
       ITEM COLUMN WIDTHS
       TOTAL = 100%
    ======================================================== */

    #generatedMainBill
    .innerItemTable th:nth-child(1),
    #generatedMainBill
    .innerItemTable td:nth-child(1) {

        width: 8% !important;

        text-align: center !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(2),
    #generatedMainBill
    .innerItemTable td:nth-child(2) {

        width: 40% !important;

        text-align: left !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(3),
    #generatedMainBill
    .innerItemTable td:nth-child(3) {

        width: 15% !important;

        text-align: center !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(4),
    #generatedMainBill
    .innerItemTable td:nth-child(4) {

        width: 18.5% !important;

        text-align: right !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(5),
    #generatedMainBill
    .innerItemTable td:nth-child(5) {

        width: 18.5% !important;

        text-align: right !important;

    }


    /* ========================================================
       SUMMARY
    ======================================================== */

    #generatedMainBill .printSummaryRow {

        width: 100% !important;

    }


    #generatedMainBill .printSummaryRow td {

        padding: 14px 12px !important;

        box-sizing: border-box !important;

        font-size: 11px !important;

        line-height: 1.5 !important;

        vertical-align: middle !important;

        border-bottom: 1px solid #dedede !important;

        min-width: 0 !important;

        overflow: visible !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .printSummaryRow label {

        margin-right: 7px !important;

        font-weight: 700 !important;

    }


    /* ========================================================
       AMOUNT IN WORDS
    ======================================================== */

    #generatedMainBill #pAmountWords {

        display: inline-block !important;

        width: auto !important;

        max-width: 70% !important;

        min-width: 0 !important;

        padding: 4px 7px !important;

        font-size: 11px !important;

        line-height: 1.4 !important;

        overflow-wrap: anywhere !important;

    }


    /* ========================================================
       GRAND TOTAL
    ======================================================== */

    #generatedMainBill #pGrandTotal {

        display: inline-block !important;

        width: auto !important;

        max-width: 100% !important;

        min-width: 120px !important;

        min-height: 38px !important;

        padding: 7px 12px !important;

        border: 2px solid #202020 !important;

        border-radius: 6px !important;

        background: #ffffff !important;

        font-size: 18px !important;

        line-height: 1.3 !important;

        font-weight: 700 !important;

        text-align: right !important;

        white-space: nowrap !important;

    }


    /* ========================================================
       PAYMENT DETAILS
    ======================================================== */

    #generatedMainBill .printPaymentDetails {

        width: 100% !important;

        max-width: none !important;

        margin-top: 8px !important;

        padding: 12px 12px !important;

        box-sizing: border-box !important;

        background: #f8f8f8 !important;

        border: 1px solid #dedede !important;

        font-size: 10px !important;

        line-height: 1.5 !important;

        overflow: visible !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .printPaymentDetails strong {

        margin-right: 7px !important;

        font-weight: 700 !important;

    }


    /* ========================================================
       FOOTER
       
       IMPORTANT:
       Same vertical breathing room as the top.
       This prevents:
       
       "બાકી / રોકડા ફોર : બીપીનભાઈ ઈશ્વરલાલ પટેલ"
       
       from touching the bottom border.
    ======================================================== */

    #generatedMainBill .printFooter {

        width: 100% !important;

    }


    #generatedMainBill .printFooter td {

        padding: 14px 12px !important;

        font-size: 11px !important;

        line-height: 1.4 !important;

        font-weight: 600 !important;

        min-width: 0 !important;

        overflow: visible !important;

        overflow-wrap: normal !important;

        box-sizing: border-box !important;

        white-space: nowrap !important;

        vertical-align: middle !important;

    }


    /* ========================================================
       IMAGES
    ======================================================== */

    #generatedMainBill img {

        max-width: 100% !important;

        height: auto !important;

    }


    /* ========================================================
       KEEP MAIN BILL TOGETHER
    ======================================================== */

    #generatedMainBill,
    #generatedMainBill .printBillTable,
    #generatedMainBill .printHeaderRow,
    #generatedMainBill .printCustomerRow,
    #generatedMainBill .itemTableSpace,
    #generatedMainBill .printSummaryRow,
    #generatedMainBill .printPaymentDetails,
    #generatedMainBill .printFooter {

        break-inside: avoid !important;

        page-break-inside: avoid !important;

    }

}


</style>

</head>


<body>


<div class="printPage">


    <!-- =====================================================
         MAIN BILL
    ====================================================== -->

    <div class="mainBillPrintArea">

        ${mainBillClone.outerHTML}

    </div>


    <!-- =====================================================
         CUT LINE
    ====================================================== -->

    <div class="printCutLine">

        <div class="printCutLineInner">

            <span>
                ✂ CUT HERE
            </span>

        </div>

    </div>


    <!-- =====================================================
         DUPLICATE RECEIPT
    ====================================================== -->

    <div class="duplicatePrintArea">

        ${duplicateClone.outerHTML}

    </div>


</div>


<script>

/* ============================================================
   WAIT FOR PRINT DOCUMENT TO FULLY RENDER
============================================================ */

window.addEventListener(
    "load",
    function() {

        setTimeout(
            function() {

                window.focus();

                window.print();

            },
            500
        );

    }
);


/* ------------------------------------------------------------
   Close print window after printing
------------------------------------------------------------ */

window.addEventListener(
    "afterprint",
    function() {

        setTimeout(
            function() {

                window.close();

            },
            300
        );

    }
);

<\/script>


</body>

</html>

`);


    printWindow.document.close();

}
