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
            normalizeGujaratiDisplayValue(billNumber);

    }

}

window.setInitialBillNumber = setInitialBillNumber;


// ==========================================
// MAIN BILL NUMERIC HELPERS
// ==========================================
function getMainBillNumericValue(value) {

    const englishValue =
        convertGujaratiDigitsToEnglish(value);

    const cleanedValue =
        String(englishValue)
            .replace(/₹/g, "")
            .replace(/,/g, "")
            .trim();

    const number =
        parseFloat(cleanedValue);

    return Number.isFinite(number)
        ? number
        : 0;

}

function setMainBillGujaratiValue(element, value) {

    if (!element) return;

    element.value =
        normalizeGujaratiDisplayValue(value);

}


// ==========================================
// CALCULATE ROW
// ==========================================

function calculateRow(input) {

    const row =
        input.closest("tr");


    const pages =
        getMainBillNumericValue(
            row.querySelector(
                ".pages"
            ).value
        );


    const price =
        getMainBillNumericValue(
            row.querySelector(
                ".price"
            ).value
        );


    const total =
        pages * price;


    row.querySelector(
        ".total"
    ).value =
        normalizeGujaratiDisplayValue(
            total.toFixed(2)
        );


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
        .querySelectorAll(".total")
        .forEach(function(totalInput) {
            const value =
                getMainBillNumericValue(
                    totalInput.value
                ) || 0;

            sum += value;
        });

    const grandTotal =
        document.getElementById(
            "grandTotal"
        );

    const amountWords =
        document.getElementById(
            "numberToGujaratiWords"
        );

    if (grandTotal) {
        const formattedAmount =
            sum.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        grandTotal.value =
            "₹ " +
            normalizeGujaratiDisplayValue(
                formattedAmount
            );
    }

    if (amountWords) {
        amountWords.value =
            numberToGujaratiWords(sum);
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
                type="text"
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
                type="text"
                oninput="calculateRow(this)">

        </td>


        <td>

            <input
                class="table-input price"
                type="text"
                step="0.01"
                oninput="calculateRow(this)">

        </td>


        <td>

            <input
                class="table-input total"
                type="text"
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
                    normalizeGujaratiDisplayValue(index + 1);

            }

        }
    );

}


// ==========================================
 // MAIN BILL GUJARATI NUMBER INPUT
 // ==========================================

 document.addEventListener(
     "input",
     function(event) {

         const target =
             event.target;

         if (
             target.matches(
                 "#mobileNumber, .pages, .price"
             )
         ) {

             target.value =
                 normalizeGujaratiDisplayValue(
                     convertGujaratiDigitsToEnglish(
                         target.value
                     )
                 );

         }

     }
 );


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
// ==========================================
// RESET MAIN BILL FOR A FRESH BILL
// ==========================================

function resetMainBillForm() {

    const fieldIds = [
        "customerName",
        "village",
        "taluka",
        "district",
        "mobileNumber",
        "billDate",
        "paymentDetails",
        "grandTotal",
        "numberToGujaratiWords"
    ];

    fieldIds.forEach(function(id) {

        const field =
            document.getElementById(id);

        if (field) {
            field.value = "";
        }

    });


    // Reset item table to exactly one clean row.
    const tbody =
        document.getElementById("itemBody");

    if (tbody) {

        tbody.innerHTML = `
            <tr
                class="data-row"
                style="height:auto;">

                <td>
                    <input
                        class="table-input srno"
                        type="text"
                        value="1">
                </td>

                <td>
                    <textarea
                        class="description"
                        rows="1"
                        oninput="autoGrow(this)"></textarea>
                </td>

                <td>
                    <input
                        class="table-input pages"
                        type="text"
                        oninput="calculateRow(this)">
                </td>

                <td>
                    <input
                        class="table-input price"
                        type="text"
                        step="0.01"
                        oninput="calculateRow(this)">
                </td>

                <td>
                    <input
                        class="table-input total"
                        type="text">
                </td>

                <td>
                    <button
                        class="delete-btn"
                        onclick="deleteCurrentRow(this)">
                        🗑
                    </button>
                </td>

            </tr>
        `;

    }


    const limitMessage =
        document.getElementById(
            "mainBillRowLimitMessage"
        );

    if (limitMessage) {
        limitMessage.textContent = "";
        limitMessage.classList.remove("show");
    }


    window.mainBillReceiptPaymentData = null;


    document.body.classList.remove(
        "receiptGeneratedMode"
    );


    updateSerialNumbers();


    setInitialBillNumber();


    const customerName =
        document.getElementById(
            "customerName"
        );

    if (customerName) {
        customerName.focus();
    }

}

window.resetMainBillForm =
    resetMainBillForm;

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

    return formatGujaratiDate(
        dateValue
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


function generateReceipt(paymentDateOverride = "", paymentReceiptNumberOverride = "") {

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



        const billNoEnglish =
            convertGujaratiDigitsToEnglish(
                billNo
            ).trim();

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


        if (!billNoEnglish) {

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
            paymentReceiptNumberOverride ||
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
            normalizeGujaratiDisplayValue(receiptNumber);

        document.getElementById("dPavtiDate").textContent = formatGujaratiDate(typeof paymentDateOverride === "string" ? paymentDateOverride : billDate);



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
        normalizeGujaratiDisplayValue(
            document
                .getElementById("billNo")
                .value
        );


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
        normalizeGujaratiDisplayValue(
            document
                .getElementById("mobileNumber")
                .value
        );


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
        normalizeGujaratiDisplayValue(
            document
                .getElementById("grandTotal")
                .value
        );


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




    /*
    ==========================================
        DUPLICATE RECEIPT PAYMENT DATA
    ==========================================
    */

    const mainBillReceiptPayment =
        window.mainBillReceiptPaymentData || null;

    const duplicateReceiptTotalBill =
        mainBillReceiptPayment
            ? Number(
                mainBillReceiptPayment.totalBill
            ) || 0
            : getMainBillNumericValue(
                document
                    .getElementById("grandTotal")
                    .value
            ) || 0;

    const duplicateReceiptTotalReceived =
        mainBillReceiptPayment
            ? Number(
                mainBillReceiptPayment.amount
            ) || 0
            : 0;

    const duplicateReceiptCurrentPayment =
        mainBillReceiptPayment
            ? Number(
                mainBillReceiptPayment.currentPayment
            ) || 0
            : 0;

    const duplicateReceiptBalance =
        mainBillReceiptPayment
            ? Number(
                mainBillReceiptPayment.balance
            ) || 0
            : 0;

    const duplicateReceiptPreviousPaid =
        Math.max(
            0,
            duplicateReceiptTotalReceived -
            duplicateReceiptCurrentPayment
        );

    const formatDuplicateReceiptAmount =
        function(value) {
            return "₹ " +
                normalizeGujaratiDisplayValue(
                    Number(value || 0)
                        .toLocaleString(
                            "en-IN",
                            {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }
                        )
                );
        };

    const duplicateReceiptAmountFormatted =
        formatDuplicateReceiptAmount(
            duplicateReceiptTotalReceived
        );

    document
        .getElementById("dAmountWords")
        .innerHTML =
        "આપના તરફથી મળેલ રકમ : " +
        '<strong class="receiptAmountNumber">' +
        duplicateReceiptAmountFormatted +
        "</strong>" +
        " (અંકે) — " +
        numberToGujaratiWords(
            duplicateReceiptTotalReceived
        ) +
        ".";

    document
        .getElementById("dTotalBill")
        .textContent =
        formatDuplicateReceiptAmount(
            duplicateReceiptTotalBill
        );

    document
        .getElementById("dPreviousPaid")
        .textContent =
        formatDuplicateReceiptAmount(
            duplicateReceiptPreviousPaid
        );

    document
        .getElementById("dCurrentPayment")
        .textContent =
        formatDuplicateReceiptAmount(
            duplicateReceiptCurrentPayment
        );

    document
        .getElementById("dBaki")
        .textContent =
        formatDuplicateReceiptAmount(
            duplicateReceiptBalance
        );

    if (!mainBillReceiptPayment) {

        document
            .getElementById("dAmountWords")
            .textContent =
            "આપના તરફથી મળેલ રકમ : આ બિલ માટે કોઈ ચુકવણી નોંધાયેલ નથી.";

        document
            .getElementById("dPreviousPaid")
            .textContent = "";

        document
            .getElementById("dCurrentPayment")
            .textContent = "";

        document
            .getElementById("dBaki")
            .textContent = "";
    }

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
                normalizeGujaratiDisplayValue(
                    row
                        .querySelector(
                            ".srno"
                        )
                        .value
                );


            const description =
                row
                    .querySelector(
                        ".description"
                    )
                    .value;


            const pages =
                normalizeGujaratiDisplayValue(
                    row
                        .querySelector(
                            ".pages"
                        )
                        .value
                );


            const price =
                normalizeGujaratiDisplayValue(
                    row
                        .querySelector(
                            ".price"
                        )
                        .value
                );


            const total =
                normalizeGujaratiDisplayValue(
                    row
                        .querySelector(
                            ".total"
                        )
                        .value
                );


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
            .value;

    const billNoEnglish =
        convertGujaratiDigitsToEnglish(billNo).trim();


    if (!billNoEnglish) {

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
                getMainBillNumericValue(
                    row
                        .querySelector(
                            ".pages"
                        )
                        .value
                )
                || 0;


            const price =
                getMainBillNumericValue(
                    row
                        .querySelector(
                            ".price"
                        )
                        .value
                )
                || 0;


            const total =
                getMainBillNumericValue(
                    row
                        .querySelector(
                            ".total"
                        )
                        .value
                )
                || 0;


            items.push({

                srno:
                    convertGujaratiDigitsToEnglish(
                        row
                            .querySelector(
                                ".srno"
                            )
                            .value
                    ),

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

            billNoEnglish,


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

            convertGujaratiDigitsToEnglish(
                document
                    .getElementById(
                        "mobileNumber"
                    )
                    .value
            ).trim(),


        billDate:

            document
                .getElementById(
                    "billDate"
                )
                .value,



        receiptDate:

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

            getMainBillNumericValue(
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
            .doc(billNoEnglish);


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
            "Bill " + billNoEnglish,

        billNo:
            billNoEnglish,

        amount:
            billData.grandTotal,

        customerName:
            billData.customerName

    });


    console.log(
        "Bill updated successfully:",
        billNoEnglish
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


        paidAmount:
            0,

        balanceAmount:
            billData.grandTotal,

        paymentStatus:
            "unpaid",

        payments:
            [],


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
            billNoEnglish,

        amount:
            billData.grandTotal,

        customerName:
            billData.customerName

    });


    console.log(
        "New bill saved successfully:",
        billNoEnglish
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

            const saveBillText =
                saveBillBtn.querySelector(
                    "span"
                );

            try {

                saveBillBtn.disabled = true;

                if (saveBillText) {
                    saveBillText.textContent =
                        "Saving…";
                }

                await saveCurrentBill();

                if (saveBillText) {
                    saveBillText.textContent =
                        "Saved ✓";
                }

                alert(
                    "Bill saved successfully."
                );

                setTimeout(
                    function() {

                        saveBillBtn.disabled =
                            false;

                        if (saveBillText) {
                            saveBillText.textContent =
                                "Save Bill";
                        }

                    },
                    3000
                );

            }

            catch(error) {

                console.error(
                    "Error saving bill:",
                    error
                );

                saveBillBtn.disabled =
                    false;

                if (saveBillText) {
                    saveBillText.textContent =
                        "Save Bill";
                }

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


function prepareHistoricalMainBillPrint(bill) {
    if (!bill) return;

    const setPrintText = function(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value == null ? "" : String(value);
        }
    };

    setPrintText("pCustomerName", bill.customerName || "");
    setPrintText("pBillNo", normalizeGujaratiDisplayValue(bill.billNo || ""));
    setPrintText("pVillage", bill.village || "");
    setPrintText("pTaluka", bill.taluka || "");
    setPrintText("pDistrict", bill.district || "");

    setPrintText(
        "pBillDate",
        bill.billDate ? formatIndianDate(bill.billDate) : ""
    );

    setPrintText(
        "pMobileNumber",
        normalizeGujaratiDisplayValue(bill.mobileNumber || "")
    );

    setPrintText(
        "pAmountWords",
        numberToGujaratiWords(Number(bill.grandTotal || 0))
    );

    setPrintText(
        "pGrandTotal",
        normalizeGujaratiDisplayValue(
            Number(bill.grandTotal || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        )
    );

    setPrintText("pPaymentDetails", bill.paymentDetails || "");

    const printItems = document.getElementById("printMainItems");

    if (!printItems) return;

    printItems.innerHTML = "";

    const items = Array.isArray(bill.items) ? bill.items : [];

    items.forEach(function(item, index) {
        const printRow = document.createElement("tr");

        const srno = normalizeGujaratiDisplayValue(
            item.srno == null ? index + 1 : item.srno
        );

        const description = item.description || "";

        const pages = normalizeGujaratiDisplayValue(
            item.pages == null ? "" : item.pages
        );

        const price = normalizeGujaratiDisplayValue(
            Number(item.price || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );

        const total = normalizeGujaratiDisplayValue(
            Number(item.total || 0).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );

        printRow.innerHTML = `
            <td>${srno}</td>
            <td class="printDescription">${description}</td>
            <td>${pages}</td>
            <td>₹ ${price}</td>
            <td>₹ ${total}</td>
        `;

        printItems.appendChild(printRow);
    });
}
function printMainBillAndReceipt(useExistingReceipt = false) {

    console.log(
        "MAIN BILL + DUPLICATE RECEIPT PRINT"
    );


    // --------------------------------------------------------
    // Generate the latest bill data first
    // --------------------------------------------------------

    if (!useExistingReceipt) {
        generatePrintableBills();
    }


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
    // PRESERVE LIVE DUPLICATE RECEIPT INPUT VALUES
    // cloneNode() does not reliably preserve current input
    // properties, so copy them into the cloned attributes.
    // --------------------------------------------------------

    const clonedPavtiNo =
        duplicateClone.querySelector(
            "#dPavtiNo"
        );


    const clonedPavtiDate =
        duplicateClone.querySelector(
            "#dPavtiDate"
        );


    if (clonedPavtiNo) {

        clonedPavtiNo.setAttribute(
            "value",
            document
                .getElementById("dPavtiNo")
                .value
        );

    }


    if (clonedPavtiDate) {

        clonedPavtiDate.textContent =
            document
                .getElementById("dPavtiDate")
                .textContent;

    }
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

    width: 7%;

    text-align: center;

}


.mainBillPrintArea
.innerItemTable th:nth-child(2),

.mainBillPrintArea
.innerItemTable td:nth-child(2) {

    width: 63%;

    text-align: left;

}


.mainBillPrintArea
.innerItemTable th:nth-child(3),

.mainBillPrintArea
.innerItemTable td:nth-child(3) {

    width: 10%;

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

    width: 10%;

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
   RECEIPT SUMMARY LINE
   FOUR VALUES — ONE LINE
============================================================ */

.duplicatePrintArea
.receiptSummaryLine {

    display: grid !important;

    grid-template-columns:
        repeat(4, max-content) !important;

    justify-content: flex-start !important;

    align-items: center !important;

    gap: 45px !important;

    width: 100% !important;

    margin: 4px 0 8px !important;

    padding: 0 !important;

    white-space: nowrap !important;

    box-sizing: border-box !important;

}


.duplicatePrintArea
.receiptSummaryLine > div {

    display: inline-flex !important;

    flex-direction: row !important;

    align-items: center !important;

    gap: 3px !important;

    width: max-content !important;

    min-width: max-content !important;

    margin: 0 !important;

    padding: 0 !important;

    white-space: nowrap !important;

}


.duplicatePrintArea
.receiptSummaryLine label {

    display: inline !important;

    width: auto !important;

    margin: 0 !important;

    padding: 0 !important;

    font-size: 9px !important;

    line-height: 1.2 !important;

    font-weight: 700 !important;

    white-space: nowrap !important;

}


.duplicatePrintArea
.receiptSummaryLine span {

    display: inline-block !important;

    width: auto !important;

    min-width: 0 !important;

    max-width: none !important;

    margin: 0 !important;

    padding: 0 !important;

    font-size: 10px !important;

    line-height: 1.2 !important;

    white-space: nowrap !important;

    border-bottom: none !important;

    background: transparent !important;

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

    margin: 8px 0;

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

    font-size: 10px;

    font-weight: 700;

}
.duplicatePrintArea
.duplicateReceiptHeader label {

    white-space: nowrap;

    flex-shrink: 0;

}


.duplicatePrintArea
.duplicateReceiptHeader input {

    width: 100%;

    padding: 3px 4px;

    border: none;

    border-bottom: 1px solid #888;

    background: transparent;

    font-size: 10px;

}
.duplicatePrintArea
.duplicateReceiptHeader span {

    display: block;

    width: 100%;

    padding: 3px 4px;

    border-bottom: 1px solid #888;

    background: transparent;

    font-size: 10px;

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

    font-size: 10px;

    font-weight: 700;

}


.duplicatePrintArea
.duplicateCustomer span {

    min-width: 40px;

    padding: 2px 4px;

    font-size: 10px;

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

    font-size: 10px;

    line-height: 1.5;

}


.duplicatePrintArea
.receiptBody strong {

    margin: 0 3px;

    font-size: 12px;

}


/* ============================================================
   AMOUNT WORDS
============================================================ */

.duplicatePrintArea
.amountWordsReceipt {

    display: flex;

    align-items: flex-start;

    gap: 7px;

    margin-bottom: 8px;

}


.duplicatePrintArea
.amountWordsReceipt label {

    font-size: 9px;

    font-weight: 700;

}


.duplicatePrintArea
.amountWordsReceipt span {

    flex: 1;

    min-width: 0;

    min-height: 15px;

    padding: 2px 4px;

    font-size: 10px;

}


/* ============================================================
   RECEIPT SUMMARY LINE
   FOUR VALUES — ONE LINE
============================================================ */

.duplicatePrintArea
.receiptSummaryLine {

    display: grid !important;

    grid-template-columns:
        repeat(4, max-content) !important;

    justify-content: flex-start !important;

    align-items: center !important;

    gap: 45px !important;

    width: 100% !important;

    margin: 4px 0 8px !important;

    padding: 0 !important;

    white-space: nowrap !important;

    box-sizing: border-box !important;

}


.duplicatePrintArea
.receiptSummaryLine > div {

    display: inline-flex !important;

    flex-direction: row !important;

    align-items: center !important;

    gap: 3px !important;

    width: max-content !important;

    min-width: max-content !important;

    margin: 0 !important;

    padding: 0 !important;

    white-space: nowrap !important;

}


.duplicatePrintArea
.receiptSummaryLine label {

    display: inline !important;

    width: auto !important;

    margin: 0 !important;

    padding: 0 !important;

    font-size: 10px !important;

    line-height: 1.2 !important;

    font-weight: 700 !important;

    white-space: nowrap !important;

}


.duplicatePrintArea
.receiptSummaryLine span {

    display: inline-block !important;

    width: auto !important;

    min-width: 0 !important;

    max-width: none !important;

    margin: 0 !important;

    padding: 0 !important;

    font-size: 10px !important;

    line-height: 1.2 !important;

    white-space: nowrap !important;

    border-bottom: none !important;

    background: transparent !important;

}


/* ============================================================
   PAYMENT
============================================================ */

.duplicatePrintArea
.paymentDetails {

    display: flex;

    flex-wrap: wrap;

    gap: 15px;

    margin-top: 8px;

}


.duplicatePrintArea
.paymentDetails > div {

    display: flex;

    align-items: center;

    gap: 4px;

}


.duplicatePrintArea
.paymentDetails label {

    font-size: 9px;

    font-weight: 700;

}


.duplicatePrintArea
.paymentDetails span {

    min-width: 50px;

    min-height: 14px;

    padding: 2px 4px;

    font-size: 9px;

}


/* BANK / CHEQUE DETAILS — ONE LINE */
.duplicatePrintArea
.bankDetailsRow {

    flex-wrap: nowrap !important;

    width: 100% !important;

    gap: 4px !important;

}


.duplicatePrintArea
.bankDetailsRow label {

    flex-shrink: 0 !important;

    white-space: nowrap !important;

}


.duplicatePrintArea
.bankDetailsRow span {

    flex: 1 1 auto !important;

    min-width: 0 !important;

    white-space: nowrap !important;

}


/* FORCE BANK / CHEQUE LABEL + VALUE ON SAME LINE */
.duplicatePrintArea
.bankDetailsRow {

    display: flex !important;

    flex-direction: row !important;

    align-items: center !important;

    flex-wrap: nowrap !important;

}


.duplicatePrintArea
.bankDetailsRow label {

    display: inline-block !important;

    white-space: nowrap !important;

    line-height: 1 !important;

    vertical-align: middle !important;

}


.duplicatePrintArea
.bankDetailsRow span {

    display: inline-block !important;

    white-space: nowrap !important;

    line-height: 1 !important;

    vertical-align: middle !important;

}



/* ============================================================
   FOOTER
============================================================ */

/* RECEIPT PAYMENT FOOTER */
.duplicatePrintArea
.receiptPaymentFooter {

    font-size: 9px !important;

    line-height: 1.3 !important;

    text-align: center !important;

}
.duplicatePrintArea
.duplicateFooter {

    display: flex;

    justify-content: space-between;

    margin-top: 8px;

    font-size: 10px;

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

        border-bottom: 1px solid #176B87  !important;

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

        color: #155E75  !important;

        white-space: nowrap !important;

        overflow-wrap: normal !important;

    }


    #generatedMainBill .printHeaderRow h2 {

        margin: 0 0 5px !important;

        font-family: Arial, sans-serif;

        font-size: 14px !important;

        line-height: 1.35 !important;

        font-weight: 700 !important;

        letter-spacing: .7px;

        color: #2563A6  !important;

        white-space: normal !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .printHeaderRow p {

        margin: 2px 0 !important;

        font-size: 11px !important;

        line-height: 1.45 !important;

        color: #607D8B  !important;

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

        color: #D4A72C  !important;

        white-space: nowrap !important;

    }

    /* ========================================================
       PHONE
    ======================================================== */

    #generatedMainBill .printPhone {

        width: 60px !important;

        max-width: none !important;

        padding: 0 8px !important;

        font-family: Arial, sans-serif;

        font-size: 12px !important;

        line-height: 1.5 !important;

        font-weight: 600;

        text-align: center;

        white-space: nowrap !important;

        color: #176B87 !important;

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

        background: #F4F8FB   !important;

        border: 1px solid #A9CDD8  !important;

        border-radius: 8px !important;

        overflow: visible !important;

    }


    #generatedMainBill .printCustomerDetails td {

        padding: 7px 10px !important;

        font-size: 11px !important;

        line-height: 1.4 !important;

        vertical-align: middle !important;

        border-bottom: 1px solid #C9E1E7 !important;

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

        color: #176B87  !important;

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

        background: #176B87  !important;

        border: 1px solid #176B87  !important;

        color: #FFFFFF  !important;

        font-size: 10px !important;

        font-weight: 700 !important;

        line-height: 1.35 !important;

        text-align: center !important;

    }


    #generatedMainBill .innerItemTable td {

        border: 1px solid #C8DDE3  !important;

        font-size: 10px !important;

        line-height: 1.4 !important;

        vertical-align: middle !important;

        color: #263238  !important;

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

        width: 7% !important;

        text-align: center !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(2),
    #generatedMainBill
    .innerItemTable td:nth-child(2) {

        width: 57% !important;

        text-align: left !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(3),
    #generatedMainBill
    .innerItemTable td:nth-child(3) {

        width: 10% !important;

        text-align: center !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(4),
    #generatedMainBill
    .innerItemTable td:nth-child(4) {

        width: 13% !important;

        text-align: right !important;

    }


    #generatedMainBill
    .innerItemTable th:nth-child(5),
    #generatedMainBill
    .innerItemTable td:nth-child(5) {

        width: 13% !important;

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

        border-bottom: 1px solid #C9E1E7  !important;

        min-width: 0 !important;

        overflow: visible !important;

        overflow-wrap: anywhere !important;

    }


    #generatedMainBill .printSummaryRow label {

        margin-right: 7px !important;

        font-weight: 700 !important;

        color: #176B87 !important;


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

        border: 2px solid #176B87  !important;

        border-radius: 6px !important;

        color: #155E75 !important;

        background: #E8F4F7  !important;

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

        background: #F4F8FB  !important;

        border: 1px solid #A9CDD8  !important;

        color: #176B87 !important;

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

        border-top: 2px solid #D4A72C !important;

    }


    #generatedMainBill .printFooter td {

        padding: 14px 12px !important;

        font-size: 11px !important;

        line-height: 1.4 !important;

        font-weight: 600 !important;

        min-width: 0 !important;

        color: #455A64 !important;

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




































/* ============================================================
   MAIN BILL PAYMENT ENTRY
   Bill Amount click handler
============================================================ */

let activePaymentBillId = null;

document.addEventListener(
    "click",
    async function(event) {

        const billAmountCell =
            event.target.closest(
                ".billAmountCell"
            );

        if (!billAmountCell) {
            return;
        }

        const billId =
            billAmountCell.dataset.billId;

        if (!billId) {
            return;
        }

        const modal =
            document.getElementById(
                "mainBillPaymentModal"
            );

        if (!modal) {
            console.error(
                "Main Bill payment modal was not found."
            );
            return;
        }

        try {

            const billSnapshot =
                await db
                    .collection("bills")
                    .doc(billId)
                    .get();

            if (!billSnapshot.exists) {
                console.error(
                    "Bill was not found:",
                    billId
                );
                return;
            }

            const bill =
                billSnapshot.data();

            activePaymentBillId =
                billId;


            const billAmount =
                Number(
                    bill.grandTotal || 0
                );

            const paidAmount =
                Number(
                    bill.paidAmount || 0
                );

            const balanceAmount =
                Math.max(
                    0,
                    billAmount - paidAmount
                );


            const formatAmount =
                function(value) {
                    return normalizeGujaratiDisplayValue(Number(value || 0).toLocaleString("en-IN"));
                };


            document.getElementById("paymentModalBillNumber").textContent = normalizeGujaratiDisplayValue("Bill #" + (bill.billNo || billId));


            document.getElementById(
                "paymentModalBillAmount"
            ).textContent =
                "₹" +
                formatAmount(
                    billAmount
                );


            document.getElementById(
                "paymentModalPaidAmount"
            ).textContent =
                "₹" +
                formatAmount(
                    paidAmount
                );


            document.getElementById(
                "paymentModalBalanceAmount"
            ).textContent =
                "₹" +
                formatAmount(
                    balanceAmount
                );


            const paymentAmountInput =
                document.getElementById(
                    "paymentModalAmount"
                );

            paymentAmountInput.value = "";

            paymentAmountInput.oninput =
                function() {

                    const cursorPosition =
                        this.selectionStart;

                    const englishValue =
                        convertGujaratiDigitsToEnglish(
                            this.value
                        );

                    const cleanedValue =
                        englishValue.replace(
                            /[^0-9.]/g,
                            ""
                        );

                    const parts =
                        cleanedValue.split(".");

                    const normalizedValue =
                        parts.length > 1
                            ? parts[0] +
                              "." +
                              parts.slice(1).join("")
                            : cleanedValue;

                    this.value =
                        convertToGujaratiDigits(
                            normalizedValue
                        );

                    this.setSelectionRange(
                        cursorPosition,
                        cursorPosition
                    );
                };


            const paymentDateInput =
                document.getElementById(
                    "paymentModalDate"
                );

            const today =
                new Date();

            const year =
                today.getFullYear();

            const month =
                String(
                    today.getMonth() + 1
                ).padStart(2, "0");

            const day =
                String(
                    today.getDate()
                ).padStart(2, "0");

            paymentDateInput.value =
                convertToGujaratiDigits(
                    day +
                    "/" +
                    month +
                    "/" +
                    year
                );


            const validationMessage =
                document.getElementById(
                    "paymentModalValidationMessage"
                );

            validationMessage.textContent = "";

            validationMessage.classList.remove(
                "isVisible"
            );


            modal.classList.add(
                "isOpen"
            );

            modal.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.style.overflow =
                "hidden";


            setTimeout(
                function() {
                    paymentAmountInput.focus();
                },
                50
            );

        }
        catch (error) {

            console.error(
                "Unable to open payment modal:",
                error
            );

        }

    }
);


/* ============================================================
   SAVE MAIN BILL PAYMENT
============================================================ */

document.addEventListener(
    "click",
    async function(event) {

        const savePaymentButton =
            event.target.closest(
                "#saveMainBillPayment"
            );

        if (!savePaymentButton) {
            return;
        }

        if (!activePaymentBillId) {
            return;
        }

        const paymentAmountInput =
            document.getElementById(
                "paymentModalAmount"
            );

        const paymentDateInput =
            document.getElementById(
                "paymentModalDate"
            );

        const validationMessage =
            document.getElementById(
                "paymentModalValidationMessage"
            );

        const showValidation =
            function(message) {

                validationMessage.textContent =
                    message;

                validationMessage.classList.add(
                    "isVisible"
                );

            };

        const amountText =
            convertGujaratiDigitsToEnglish(
                String(
                    paymentAmountInput.value || ""
                )
            ).trim();

        const paymentAmount =
            Number(
                amountText
            );

        if (
            !amountText ||
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {

            showValidation(
                "કૃપા કરીને માન્ય ચુકવણીની રકમ દાખલ કરો."
            );

            paymentAmountInput.focus();

            return;

        }

        const paymentDate =
            convertGujaratiDigitsToEnglish(
                String(
                    paymentDateInput.value || ""
                )
            ).trim();

        if (!paymentDate) {

            showValidation(
                "કૃપા કરીને ચુકવણીની તારીખ દાખલ કરો."
            );

            paymentDateInput.focus();

            return;

        }

        const paymentModeInput =
            document.getElementById(
                "paymentModalMode"
            );

        const paymentMode =
            String(
                paymentModeInput.value || ""
            ).trim();

        if (!paymentMode) {

            showValidation(
                "કૃપા કરીને ચુકવણીનો પ્રકાર પસંદ કરો."
            );

            paymentModeInput.focus();

            return;

        }
        try {

            savePaymentButton.disabled =
                true;

            savePaymentButton.textContent =
                "Saving…";


            const billReference =
                db
                    .collection("bills")
                    .doc(
                        activePaymentBillId
                    );


            const billSnapshot =
                await billReference.get();


            if (!billSnapshot.exists) {

                throw new Error(
                    "Bill was not found."
                );

            }


            const bill =
                billSnapshot.data();


            const billAmount =
                Number(
                    bill.grandTotal || 0
                );


            const existingPayments =
                Array.isArray(
                    bill.payments
                )
                    ? bill.payments
                    : [];


            const previousPaidAmount =
                existingPayments.reduce(
                    function(total, payment) {

                        return total +
                            Number(
                                payment.amount || 0
                            );

                    },
                    0
                );


            const remainingAmount =
                Math.max(
                    0,
                    billAmount -
                    previousPaidAmount
                );


            if (
                paymentAmount >
                remainingAmount
            ) {

                showValidation(
                    "ચુકવણીની રકમ બાકી રકમ કરતાં વધારે હોઈ શકતી નથી."
                );

                paymentAmountInput.focus();

                savePaymentButton.disabled =
                    false;

                savePaymentButton.textContent =
                    "Save Payment";

                return;

            }


            const savedPaymentBillId = activePaymentBillId;

            const receiptYear =
                new Date().getFullYear();

            const receiptUniquePart =
                String(Date.now()).slice(-8);

            const receiptNumber =
                "R-" +
                receiptYear +
                "-" +
                receiptUniquePart;

            const newPayment = {

                amount:
                    paymentAmount,

                date:
                    paymentDate,

                mode:
                    paymentMode,

                receiptNumber:
                    receiptNumber

            };


            const updatedPayments =
                existingPayments.concat(
                    [newPayment]
                );


            const paidAmount =
                updatedPayments.reduce(
                    function(total, payment) {

                        return total +
                            Number(
                                payment.amount || 0
                            );

                    },
                    0
                );


            const balanceAmount =
                Math.max(
                    0,
                    billAmount -
                    paidAmount
                );


            let paymentStatus =
                "unpaid";


            if (
                balanceAmount === 0 &&
                paidAmount > 0
            ) {

                paymentStatus =
                    "paid";

            }
            else if (
                paidAmount > 0
            ) {

                paymentStatus =
                    "partial";

            }


            await billReference.update({

                payments:
                    updatedPayments,

                paidAmount:
                    paidAmount,

                balanceAmount:
                    balanceAmount,

                paymentStatus:
                    paymentStatus,

                updatedAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });


            document.getElementById(
                "paymentModalPaidAmount"
            ).textContent =
                "₹" +
                normalizeGujaratiDisplayValue(
                    Number(
                        paidAmount
                    ).toLocaleString(
                        "en-IN"
                    )
                );


            document.getElementById(
                "paymentModalBalanceAmount"
            ).textContent =
                "₹" +
                normalizeGujaratiDisplayValue(
                    Number(
                        balanceAmount
                    ).toLocaleString(
                        "en-IN"
                    )
                );


            await loadAllMainBills();

            closeMainBillPaymentModal();


            console.log(
                "Payment saved successfully:",
                savedPaymentBillId,
                newPayment
            );


        }
        catch (error) {

            console.error(
                "Error saving payment:",
                error
            );

            showValidation(
                "ચુકવણી સાચવી શકાઈ નથી: " +
                error.message
            );

        }
        finally {

            savePaymentButton.disabled =
                false;

            savePaymentButton.textContent =
                "Save Payment";

        }

    }
);

/* ============================================================
   UPDATE GUJARATI PAYMENT DATE DISPLAY
============================================================ */




/* ============================================================
   CLOSE MAIN BILL PAYMENT MODAL
============================================================ */

function closeMainBillPaymentModal() {

    const modal =
        document.getElementById(
            "mainBillPaymentModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "isOpen"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    activePaymentBillId =
        null;

}


document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.closest(
                "#closeMainBillPaymentModal"
            ) ||
            event.target.closest(
                "#cancelMainBillPayment"
            ) ||
            event.target.closest(
                "#mainBillPaymentModalOverlay"
            )
        ) {


            closeMainBillPaymentModal();

        }

    }
);





















/* ============================================================
   MAIN BILL PAYMENT HISTORY
============================================================ */

let activePaymentHistoryBillId = null;

async function openMainBillPaymentHistory(billId) {

    const modal =
        document.getElementById(
            "mainBillPaymentHistoryModal"
        );

    const historyBody =
        document.getElementById(
            "mainBillPaymentHistoryBody"
        );

    if (!modal || !historyBody || !billId) {
        return;
    }

    activePaymentHistoryBillId =
        billId;

    historyBody.innerHTML = `
        <tr>
            <td colspan="5">
                Loading payment history...
            </td>
        </tr>
    `;

    modal.classList.add("isOpen");
    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

    try {

        const billSnapshot =
            await db
                .collection("bills")
                .doc(billId)
                .get();

        if (!billSnapshot.exists) {

            historyBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        Bill not found.
                    </td>
                </tr>
            `;

            return;
        }

        const bill =
            billSnapshot.data();

        document.getElementById(
            "paymentHistoryBillNumber"
        ).textContent =
            "Bill #" +
            normalizeGujaratiDisplayValue(
                bill.billNo || billId
            );

        document.getElementById(
            "paymentHistoryCustomerName"
        ).textContent =
            "Customer: " +
            (
                bill.customerName ||
                "—"
            );

        const payments =
            Array.isArray(
                bill.payments
            )
                ? bill.payments
                : [];

        if (!payments.length) {

            historyBody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No payment history available.
                    </td>
                </tr>
            `;

            return;
        }

        historyBody.innerHTML =
            payments
                .map(
                    function(payment, index) {

                        const amount =
                            Number(
                                payment.amount || 0
                            ).toLocaleString(
                                "en-IN"
                            );

                        const date =
                            payment.date
                                ? formatGujaratiDate(
                                    payment.date
                                )
                                : "—";

                        const mode =
                            payment.mode ||
                            "—";

                        const receiptNumber =
    payment.receiptNumber
        ? normalizeGujaratiDisplayValue(
            payment.receiptNumber
        )
        : "—";

                        return `
                            <tr>

                                <td>
                                    ${date}
                                </td>

                                <td>
                                    ₹ ${normalizeGujaratiDisplayValue(amount)}
                                </td>

                                <td>
                                    ${mode}
                                </td>

                                <td>
                                    ${receiptNumber}
                                </td>

                                <td>

                                    <button
                                        type="button"
                                        class="mainBillPaymentViewReceiptButton"
                                        data-bill-id="${billId}"
                                        data-payment-index="${index}">
                                        View / Print
                                    </button>

                                </td>

                            </tr>
                        `;

                    }
                )
                .join("");

    }
    catch (error) {

        console.error(
            "Error loading payment history:",
            error
        );

        historyBody.innerHTML = `
            <tr>
                <td colspan="5">
                    Payment history could not be loaded.
                </td>
            </tr>
        `;

    }

}

async function openMainBillPaymentReceipt(
    billId,
    paymentIndex
) {

    if (
        !billId ||
        !Number.isInteger(paymentIndex) ||
        paymentIndex < 0
    ) {
        return;
    }

    try {

        const billSnapshot =
            await db
                .collection("bills")
                .doc(billId)
                .get();

        if (!billSnapshot.exists) {
            alert("Bill was not found.");
            return;
        }

        const bill =
            billSnapshot.data();

        const payments =
            Array.isArray(bill.payments)
                ? bill.payments
                : [];

        const payment =
            payments[paymentIndex];

        if (!payment) {
            alert("Payment was not found.");
            return;
        }

        const paymentAmount =
            Number(
                payment.amount || 0
            );

        const paidThroughSelectedPayment =
            payments
                .slice(
                    0,
                    paymentIndex + 1
                )
                .reduce(
                    function(total, item) {
                        return total +
                            Number(
                                item.amount || 0
                            );
                    },
                    0
                );

        const billAmount =
            Number(
                bill.grandTotal || 0
            );

        const remainingAmount =
            Math.max(
                0,
                billAmount -
                paidThroughSelectedPayment
            );

        const receiptNumber =
            payment.receiptNumber || "";

        const paymentDate =
            payment.date || "";

        const paymentMode =
            payment.mode || "";

        const setText =
            function(id, value) {
                const element =
                    document.getElementById(id);

                if (element) {
                    element.textContent =
                        value == null
                            ? ""
                            : String(value);
                }
            };

        const formatReceiptAmount =
    function(value) {
        return "₹ " +
            normalizeGujaratiDisplayValue(
                Number(value || 0)
                    .toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
            );
    };

        setText(
            "dCustomerName",
            bill.customerName || ""
        );

        setText(
            "dVillage",
            bill.village || ""
        );

        setText(
            "dTaluka",
            bill.taluka || ""
        );

        setText(
            "dDistrict",
            bill.district || ""
        );

        const receiptNumberInput =
            document.getElementById(
                "dPavtiNo"
            );

        if (receiptNumberInput) {
            receiptNumberInput.value =
                normalizeGujaratiDisplayValue(receiptNumber);
        }

        setText(
            "dPavtiDate",
            paymentDate
                ? formatGujaratiDate(
                    paymentDate
                )
                : ""
        );

        setText(
            "dGrandTotal",
            formatReceiptAmount(
                paymentAmount
            )
        );

        const paymentAmountFormatted =
    "₹ " +
    normalizeGujaratiDisplayValue(
        paymentAmount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    );

setText(
    "dAmountWords",
    "આપના તરફથી મળેલ રકમ : " +
    paymentAmountFormatted +
    " (અંકે) — " +
    numberToGujaratiWords(paymentAmount) +
    "."
);

        setText(
            "dBaki",
            formatReceiptAmount(
                remainingAmount
            )
        );

        setText(
            "dRokada",
            formatReceiptAmount(paymentAmount)
        );

        setText(
            "dPaymentDetails",
            paymentMode
        );

        document.body.classList.add(
            "receiptGeneratedMode"
        );

        const printableBills =
            document.getElementById(
                "printableBills"
            );

        if (printableBills) {
            printableBills.hidden = false;

            printableBills.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }

        console.log(
            "Payment receipt opened:",
            receiptNumber
        );

        // Use the same print-window mechanism as Duplicate Receipt -> Print.
        // The selected historical payment is already loaded into the receipt.
        // Prepare the selected historical bill for the existing print page.
        prepareHistoricalMainBillPrint(bill);

        // Use the same print-window mechanism as Duplicate Receipt -> Print.
        printMainBillAndReceipt(true);

    } catch (error) {

        console.error(
            "Error opening payment receipt:",
            error
        );

        alert(
            "Error opening payment receipt: " +
            error.message
        );

    }

}

function closeMainBillPaymentHistory() {

    const modal =
        document.getElementById(
            "mainBillPaymentHistoryModal"
        );

    if (!modal) {
        return;
    }

    modal.classList.remove(
        "isOpen"
    );

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

    activePaymentHistoryBillId =
        null;

}

document.addEventListener(
    "click",
    function(event) {

        const historyButton =
            event.target.closest(
                ".paymentHistoryBillButton"
            );

        if (
            historyButton
        ) {

            const billId =
                historyButton.dataset.id;

            openMainBillPaymentHistory(
                billId
            );

            return;

        }

        const paymentReceiptButton =
            event.target.closest(
                ".mainBillPaymentViewReceiptButton"
            );

        if (
            paymentReceiptButton
        ) {

            console.log(
                "PAYMENT RECEIPT BUTTON CLICKED",
                paymentReceiptButton.dataset
            );

            const billId =
                paymentReceiptButton.dataset.billId;

            const paymentIndex =
                Number(
                    paymentReceiptButton.dataset.paymentIndex
                );

            openMainBillPaymentReceipt(
                billId,
                paymentIndex
            );

            return;

        }

        if (
            event.target.closest(
                "#closeMainBillPaymentHistory"
            ) ||
            event.target.closest(
                "#mainBillPaymentHistoryOverlay"
            )
        ) {

            closeMainBillPaymentHistory();

        }

    }
);



/* ============================================================
   ADD PAYMENT HISTORY BUTTONS TO MAIN BILLS TABLE
============================================================ */

function addMainBillPaymentHistoryButtons() {

    const billsBody =
        document.getElementById(
            "mainBillsBody"
        );

    if (!billsBody) {
        return;
    }

    const actionGroups =
        billsBody.querySelectorAll(
            ".billActionButtons"
        );

    actionGroups.forEach(
        function(actionGroup) {

            if (
                actionGroup.querySelector(
                    ".paymentHistoryBillButton"
                )
            ) {
                return;
            }

            const editButton =
                actionGroup.querySelector(
                    ".editBillButton"
                );

            const billId =
                editButton
                    ? editButton.dataset.id
                    : "";

            if (!billId) {
                return;
            }

            const historyButton =
                document.createElement(
                    "button"
                );

            historyButton.type =
                "button";

            historyButton.className =
                "paymentHistoryBillButton";

            historyButton.dataset.id =
                billId;

            historyButton.innerHTML =
                '<i class="fa-solid fa-clock-rotate-left"></i> Payment History';

            actionGroup.appendChild(
                historyButton
            );

        }
    );

}

function observeMainBillPaymentHistoryButtons() {

    const billsBody =
        document.getElementById(
            "mainBillsBody"
        );

    if (!billsBody) {
        return;
    }

    addMainBillPaymentHistoryButtons();

    const observer =
        new MutationObserver(
            function() {

                addMainBillPaymentHistoryButtons();

            }
        );

    observer.observe(
        billsBody,
        {
            childList: true,
            subtree: true
        }
    );

}

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        observeMainBillPaymentHistoryButtons
    );

} else {

    observeMainBillPaymentHistoryButtons();

}














async function loadAllMainBills(searchTerm = "") {

    const mainBillsBody =
        document.getElementById(
            "mainBillsBody"
        );


    if (!mainBillsBody) return;


    mainBillsBody.innerHTML = `

        <tr>

            <td
                colspan="9"
                class="loadingBills">

                Loading bills...

            </td>

        </tr>

    `;


    try {

    console.log("Loading all main bills from Firebase...");

    const snapshot =
        await db
            .collection("bills")
            .orderBy(
                "createdAt",
                "desc"
            )
            .get();

    console.log("Bills loaded:", snapshot.size);


        mainBillsBody.innerHTML = "";


        const search =
            searchTerm
                .trim()
                .toLowerCase();


        let foundBills = 0;


        snapshot.forEach(
            function(doc) {

                const bill =
                    doc.data();


                const billNumber =
                    String(
                        bill.billNo || ""
                    )
                    .toLowerCase();


                const customerName =
                    String(
                        bill.customerName || ""
                    )
                    .toLowerCase();


                /*
                ==========================================
                    SEARCH BY BILL NUMBER OR CUSTOMER NAME
                ==========================================
                */

                if (

                    search

                    &&

                    !billNumber.includes(search)

                    &&

                    !customerName.includes(search)

                ) {

                    return;

                }


                foundBills++;


                const billDate =
                    bill.billDate
                        ? formatGujaratiDate(
                            bill.billDate
                        )
                        : "N/A";


                const billAmount =
                    Number(
                        bill.grandTotal || 0
                    );

                const paidAmount =
                    Number(
                        bill.paidAmount || 0
                    );

                const balanceAmount =
                    Math.max(
                        0,
                        billAmount - paidAmount
                    );

                let paymentStatus =
                    "unpaid";

                if (
                    billAmount > 0 &&
                    balanceAmount === 0
                ) {
                    paymentStatus = "paid";
                }
                else if (
                    paidAmount > 0
                ) {
                    paymentStatus = "partial";
                }

                const amount =
                    billAmount.toLocaleString(
                        "en-IN"
                    );

                const paid =
                    paidAmount.toLocaleString(
                        "en-IN"
                    );

                const balance =
                    balanceAmount.toLocaleString(
                        "en-IN"
                    );


                const row =
                    document.createElement(
                        "tr"
                    );


                row.dataset.billId =
                    doc.id;


                row.innerHTML = `

                    <td>

                        <strong
                            class="billNumber">

                            ${normalizeGujaratiDisplayValue(bill.billNo || doc.id)}

                        </strong>

                    </td>


                    <td>

                        ${bill.customerName || "N/A"}

                    </td>


                    <td>

                        ${bill.village || "N/A"}

                    </td>


                    <td>

                        ${billDate}

                    </td>


                    <td class="billAmountCell" data-bill-id="${doc.id}">

                        <strong>

                            ₹ ${normalizeGujaratiDisplayValue(amount)}

                        </strong>

                    </td>



                    <td>

                        ₹ ${normalizeGujaratiDisplayValue(paid)}

                    </td>



                    <td>

                        ₹ ${normalizeGujaratiDisplayValue(balance)}

                    </td>



                    <td class="paymentStatusCell">

                        ${paymentStatus === "paid" ? "🟢 Paid" : paymentStatus === "partial" ? "🟡 Partial" : "🔴 Unpaid"}

                    </td>



                    <td>

                        <div
                            class="billActionButtons">

                            <button
                                class="editBillButton"
                                type="button"
                                data-id="${doc.id}">

                                <i
                                    class="fa-solid fa-pen">

                                </i>

                                Edit

                            </button>


                            ${
                                paymentStatus !== "unpaid"
                                    ? `
                                        <button
                                            class="receiptBillButton"
                                            type="button"
                                            data-id="${doc.id}">

                                            <i
                                                class="fa-solid fa-receipt">

                                            </i>

                                            Receipt

                                        </button>
                                    `
                                    : ""
                            }
                            <button
                                class="deleteBillButton"
                                type="button"
                                data-id="${doc.id}">

                                <i
                                    class="fa-solid fa-trash">

                                </i>

                                Delete

                            </button>

                        </div>

                    </td>

                `;


                mainBillsBody.appendChild(
                    row
                );

            }
        );


        /*
        ==========================================
                NO SEARCH RESULTS
        ==========================================
        */

        if (foundBills === 0) {

            mainBillsBody.innerHTML = `

                <tr>

                    <td
                        colspan="9"
                        class="loadingBills">

                        No bills found for:

                        <strong>
                            "${searchTerm}"
                        </strong>

                    </td>

                </tr>

            `;

            return;

        }


        attachBillActionListeners();


    }

    catch(error) {

        console.error(
            "Error loading all bills:",
            error
        );


        mainBillsBody.innerHTML = `

            <tr>

                <td
                    colspan="9"
                    class="loadingBills">

                    Unable to load bills.

                </td>

            </tr>

        `;

    }

}


const mainBillSearch =
    document.getElementById(
        "mainBillSearch"
    );


if (mainBillSearch) {

    mainBillSearch.addEventListener(
        "input",
        function() {

            loadAllMainBills(
                this.value
            );

        }
    );

}
/* ==================================================
        BILL ACTION BUTTONS
================================================== */

function attachBillActionListeners() {


    document
        .querySelectorAll(
            ".editBillButton"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const billId =
                            this.dataset.id;


                        editBill(
                            billId
                        );

                    }
                );

            }
        );


    document
        .querySelectorAll(
            ".deleteBillButton"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const billId =
                            this.dataset.id;


                        deleteBill(
                            billId
                        );

                    }
                );

            }
        );

}


/* ==================================================
        EDIT BILL
================================================== */

async function editBill(billId) {

    try {

        const billDocument =
            await db
                .collection("bills")
                .doc(billId)
                .get();


        if (!billDocument.exists) {

            alert(
                "Bill not found."
            );

            return;

        }


        const bill =
            billDocument.data();


        /* ==============================
                OPEN BILL FORM
        ============================== */

            const mainBillsView =
                document.getElementById(
                    "mainBillsView"
                );
            
            const invoiceView =
                document.getElementById(
                    "invoiceView"
                );
            
            
            if (mainBillsView) {
            
                mainBillsView.style.display =
                    "none";
            
            }
            
            
            if (invoiceView) {
            
                invoiceView.style.display =
                    "block";
            
            }
            
            
            if (mainBillNav) {
            
                mainBillNav.classList.remove(
                    "active"
                );
            
            }


        /* ==============================
                LOAD BILL DETAILS
        ============================== */

        document
            .getElementById(
                "customerName"
            )
            .value =
            bill.customerName || "";


        document
            .getElementById(
                "village"
            )
            .value =
            bill.village || "";


        document
            .getElementById(
                "taluka"
            )
            .value =
            bill.taluka || "";


        document
            .getElementById(
                "district"
            )
            .value =
            bill.district || "";


        document
            .getElementById(
                "mobileNumber"
            )
            .value =
            normalizeGujaratiDisplayValue(bill.mobileNumber || "");


        document
            .getElementById(
                "billNo"
            )
            .value =
            normalizeGujaratiDisplayValue(bill.billNo || billId);


        document
            .getElementById(
                "billDate"
            )
            .value =
            bill.billDate || "";



        document
            .getElementById(
                "dPavtiDate"
            )
                .textContent =
                (bill.receiptDate ? formatGujaratiDate(bill.receiptDate) : "");
        document
            .getElementById(
                "paymentDetails"
            )
            .value =
            bill.paymentDetails || "";


        document
            .getElementById(
                "numberToGujaratiWords"
            )
            .value =
            bill.numberToGujaratiWords || "";


        /* ==============================
                LOAD GRAND TOTAL
        ============================== */

        document
            .getElementById(
                "grandTotal"
            )
            .value =
            normalizeGujaratiDisplayValue(bill.grandTotal || 0);


        /* ==============================
                LOAD ITEMS
        ============================== */

        loadBillItems(
            bill.items || []
        );


        calculateGrandTotal();


        window.scrollTo(
            0,
            0
        );


    }

    catch(error) {

        console.error(
            "Error loading bill:",
            error
        );


        alert(
            "Unable to load bill."
        );

    }

}

/* ==================================================
        LOAD BILL ITEMS
================================================== */

function loadBillItems(items) {

    const tbody =
        document.getElementById(
            "itemBody"
        );


    if (!tbody) return;


    tbody.innerHTML = "";


    if (
        !items
        ||
        items.length === 0
    ) {

        addItemRow();

        return;

    }


    items.forEach(
        function(item) {

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
                        type="text"
                        readonly
                        value="${item.srno || ""}">

                </td>


                <td>

                    <textarea
                        class="description"
                        rows="1">${item.description || ""}</textarea>

                </td>


                <td>

                    <input
                        class="table-input pages"
                        type="text"
                        value="${normalizeGujaratiDisplayValue(item.pages || "")}"
                        oninput="calculateRow(this)">

                </td>


                <td>

                    <input
                        class="table-input price"
                        type="text"
                        step="0.01"
                        value="${normalizeGujaratiDisplayValue(item.price || "")}"
                        oninput="calculateRow(this)">

                </td>


                <td>

                    <input
                        class="table-input total"
                        type="text"
                        readonly
                        value="${normalizeGujaratiDisplayValue(item.total || "")}">

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

        }
    );


    updateSerialNumbers();


    tbody
        .querySelectorAll(
            ".description"
        )
        .forEach(
            autoResizeDescription
        );

}

/* ==================================================
        DELETE BILL
================================================== */

async function deleteBill(billId) {


    const confirmed =
        confirm(
            "Are you sure you want to permanently delete this bill?"
        );


    if (!confirmed) return;


    try {

        await db
            .collection("bills")
            .doc(billId)
            .delete();


        alert(
            "Bill deleted successfully."
        );


        await loadAllMainBills();


        await loadDashboardStats();


        await loadRecentBills();


    }

    catch(error) {

        console.error(
            "Error deleting bill:",
            error
        );


        alert(
            "Unable to delete bill."
        );

    }

}

/* ==================================================
        MAIN BILLS TABLE RECEIPT
   Uses the exact same generateReceipt() function.
================================================== */

document.addEventListener(
    "click",
    async function(event) {

        const receiptButton =
            event.target.closest(
                ".receiptBillButton"
            );

        if (!receiptButton) {
            return;
        }

        const billId =
            receiptButton.dataset.id;

        if (!billId) {
            return;
        }

        try {

            const billDocument =
                await db
                    .collection("bills")
                    .doc(billId)
                    .get();

            if (!billDocument.exists) {

                alert(
                    "Bill not found."
                );

                return;
            }

            const bill =
                billDocument.data();

            const payments =
                Array.isArray(bill.payments)
                    ? bill.payments
                    : [];

            if (payments.length === 0) {

                alert(
                    "આ બિલ માટે કોઈ ચુકવણી નોંધાયેલ નથી."
                );

                return;
            }

            /*
            ==========================================
                USE LAST PAYMENT AS RECEIPT SOURCE
            ==========================================
            */

            const payment =
                payments[payments.length - 1];

            const receiptTotalReceived =
                getMainBillNumericValue(
                    bill.paidAmount
                ) || 0;

            const receiptCurrentPayment =
                getMainBillNumericValue(
                    payment.amount
                ) || 0;

            const receiptBalanceAmount =
                getMainBillNumericValue(
                    bill.balanceAmount
                );

            const receiptTotalBill =
                getMainBillNumericValue(
                    bill.grandTotal
                ) || 0;

            /*
            ==========================================
                STORE PAYMENT DATA FOR DUPLICATE RECEIPT
            ==========================================
            */

            window.mainBillReceiptPaymentData = {
                amount:
                    receiptTotalReceived,

                currentPayment:
                    receiptCurrentPayment,

                totalBill:
                    receiptTotalBill,

                balance:
                    Number.isFinite(
                        receiptBalanceAmount
                    )
                        ? receiptBalanceAmount
                        : 0,

                date:
                    payment.date || "",

                receiptNumber:
                    payment.receiptNumber || ""
            };

            /*
            ==========================================
                LOAD THIS BILL USING EXISTING EDIT FLOW
            ==========================================
            */

            await editBill(
                billId
            );

            /*
            ==========================================
                GENERATE RECEIPT USING LAST PAYMENT
            ==========================================
            */

            generateReceipt(
                payment.date || "",
                payment.receiptNumber || ""
            );

        }
        catch(error) {

            console.error(
                "Error opening Main Bills receipt:",
                error
            );

            alert(
                "Unable to open receipt: " +
                error.message
            );

        }

    }
);







































