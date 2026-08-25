// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyCCgBmxUaqH-5EWo6O83imC81RXVZcZaH8",
  authDomain: "panchayat-bill-system.firebaseapp.com",
  projectId: "panchayat-bill-system",
  storageBucket: "panchayat-bill-system.firebasestorage.app",
  messagingSenderId: "9498305655",
  appId: "1:9498305655:web:9f86a8eff58ef5bb8e5272"
};

/* ============================================================
FIREBASE INITIALIZATION
============================================================ */

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const auth = firebase.auth();

console.log("Firebase connected successfully!")

/* ============================================================
        LOGIN SYSTEM
============================================================ */

const loginScreen =
    document.getElementById("loginScreen");

const loginButton =
    document.getElementById("loginButton");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");


const togglePassword = 
    document.getElementById("togglePassword");

if (loginButton) {

    loginButton.addEventListener(
        "click",
        async function () {

            const email =
                loginEmail.value.trim();

            const password =
                loginPassword.value;


            if (!email || !password) {

                loginMessage.textContent =
                    "Please enter email and password.";

                loginMessage.style.color =
                    "red";

                return;

            }


            loginButton.disabled =
                true;


            loginButton.textContent =
                "Logging in...";


            try {

                await auth
                    .signInWithEmailAndPassword(
                        email,
                        password
                    );


                console.log(
                    "Login successful"
                );


                loginMessage.textContent =
                    "Login successful!";

                loginMessage.style.color =
                    "green";


                // Hide login screen
                loginScreen.style.display =
                    "none";


                // Show dashboard
                dashboardView.style.display =
                    "block";


                // Load dashboard data
                loadDashboardStats();

                loadRecentBills();


            }

            catch (error) {

                console.error(
                    "Login error:",
                    error
                );


                loginMessage.textContent =
                    error.message;

                loginMessage.style.color =
                    "red";


                loginButton.disabled =
                    false;


                loginButton.textContent =
                    "Login to Dashboard";

            }

        }

    );

}


if (loginPassword && togglePassword) {

    togglePassword.addEventListener("click", function () {

        const isPassword =
            loginPassword.type === "password";

        if (isPassword) {

            loginPassword.type = "text";

            togglePassword.textContent = "🙈";

            togglePassword.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            loginPassword.type = "password";

            togglePassword.textContent = "👁️";

            togglePassword.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}

/* ==================================================
        PAGE ELEMENTS
================================================== */

      const dashboardView =
          document.getElementById("dashboardView");
      
      
      function getInvoiceView() {
          return document.getElementById("invoiceView");
      }
      
      
      function getMainBillsView() {
          return document.getElementById("mainBillsView");
      }
      
      
      const mainBillSystemCard =
          document.getElementById("mainBillSystemCard");
      
      
      const dashboardNav =
          document.getElementById("dashboardNav");
      
      
      const mainBillNav =
          document.getElementById("mainBillNav");
      
      
      const newMainBillButton =
          document.getElementById("newMainBillButton");
      
      
      const createBillButton =
          document.getElementById("createBillButton");
      
      
      const shikshanupakaranDashboardCountElement =
          document.getElementById(
              "shikshanupakaranRecordCount"
          );
      
      
      console.log(
          "CREATE BILL:",
          createBillButton
      );
      
      console.log(
          "INVOICE VIEW:",
          getInvoiceView()
      );
      
      console.log(
          "DASHBOARD VIEW:",
          dashboardView
      );
      
      console.log(
          "MAIN BILLS VIEW:",
          getMainBillsView()
      );
/* ============================================================
        AUTHENTICATION STATE
============================================================ */

auth.onAuthStateChanged((user) => {

    if (user) {

        console.log(
            "User is logged in:",
            user.email
        );


        // Hide login screen

        if (loginScreen) {

            loginScreen.style.display =
                "none";

        }


        // Show dashboard

        showDashboard();


        // Load Firebase data ONLY after login

        loadDashboardStats();

        loadRecentBills();

        loadRecentActivity();

        loadTalapatrakCount(); 

        loadShikshanupakaranDashboardCount();

    }

    else {

        console.log(
            "No user logged in"
        );


        // Hide all application views

        hideAllViews();


        // Show login screen

        if (loginScreen) {

            loginScreen.style.display =
                "flex";

        }

    }

});

/* ============================================================
   VIEW ALL BILLS BUTTON
============================================================ */

const viewAllBillsButton =
document.getElementById(
    "viewAllBillsButton"
);


if(viewAllBillsButton){

    viewAllBillsButton.addEventListener(
        "click",
        function(){

            // Hide dashboard
            const dashboard =
            document.getElementById(
                "dashboardView"
            );


            if(dashboard){
                dashboard.style.display = "none";
            }



            // Hide other views if needed

            const invoiceView =
            document.getElementById(
                "invoiceView"
            );


            if(invoiceView){
                invoiceView.style.display = "none";
            }



            const talapatrakView =
            document.getElementById(
                "talapatrakView"
            );


            if(talapatrakView){
                talapatrakView.style.display = "none";
            }



            // Open Main Bills

            const mainBillsView =
            document.getElementById(
                "mainBillsView"
            );


            if(mainBillsView){

                mainBillsView.style.display =
                    "block";

            }



            // Load bills again

            if(
                typeof loadMainBills === "function"
            ){

                loadMainBills();

            }


            console.log(
                "Opened All Main Bills"
            );


        }
    );

}
/* ============================================================
        VIEW MANAGEMENT
============================================================ */

function hideAllViews() {

    document.body.classList.remove(
        "talapatrakFullscreen"
    );


    /* ==========================================
       DASHBOARD
    ========================================== */

    const dashboard =
        document.getElementById(
            "dashboardView"
        );

    if (dashboard) {

        dashboard.style.display =
            "none";

    }


    /* ==========================================
       MAIN BILLS
    ========================================== */

    const mainBills =
        document.getElementById(
            "mainBillsView"
        );

    if (mainBills) {

        mainBills.style.display =
            "none";

    }


    /* ==========================================
       INVOICE / CREATE BILL
    ========================================== */

    const invoice =
        document.getElementById(
            "invoiceView"
        );

    if (invoice) {

        invoice.style.display =
            "none";

    }


    /* ==========================================
       TALAPATRAK
    ========================================== */

    const talapatrak =
        document.getElementById(
            "talapatrakView"
        );

    if (talapatrak) {

        talapatrak.style.display =
            "none";

    }


    const talapatrakEditor =
        document.getElementById(
            "talapatrakEditorView"
        );

    if (talapatrakEditor) {

        talapatrakEditor.style.display =
            "none";

    }


    /* ==========================================
       SHIKSHANUPAKARAN
    ========================================== */

    const shikshanupakaran =
        document.getElementById(
            "shikshanupakaranView"
        );

    if (shikshanupakaran) {

        shikshanupakaran.style.display =
            "none";

    }


    const shikshanupakaranEditor =
        document.getElementById(
            "shikshanupakaranEditorView"
        );

    if (shikshanupakaranEditor) {

        shikshanupakaranEditor.style.display =
            "none";

    }


    console.log(
        "Dashboard display after:",
        dashboard
            ? dashboard.style.display
            : "not found"
    );

}


function showDashboard() {

    hideAllViews();


    if (dashboardView) {

        dashboardView.style.display =
            "block";

    }


    if (dashboardNav) {

        dashboardNav.classList.add(
            "active"
        );

    }


    if (mainBillNav) {

        mainBillNav.classList.remove(
            "active"
        );

    }

}


// function showMainBills() {

//     hideAllViews();

//     if (mainBillsView) {

//         mainBillsView.style.display =
//             "block";

//     }

//     if (dashboardNav) {

//         dashboardNav.classList.remove(
//             "active"
//         );

//     }

//     if (mainBillNav) {

//         mainBillNav.classList.add(
//             "active"
//         );

//     }

//     loadAllMainBills();

//     window.scrollTo(
//         0,
//         0
//     );

// }


function showMainBills() {

    hideAllViews();

    const mainBillsView =
        document.getElementById("mainBillsView");

    if (mainBillsView) {

        mainBillsView.style.display =
            "block";

    } else {

        console.error(
            "MAIN BILLS VIEW NOT FOUND"
        );

        return;

    }


    if (dashboardNav) {

        dashboardNav.classList.remove(
            "active"
        );

    }


    if (mainBillNav) {

        mainBillNav.classList.add(
            "active"
        );

    }


    if (
        typeof loadAllMainBills ===
        "function"
    ) {

        loadAllMainBills();

    }


    window.scrollTo(
        0,
        0
    );

}


function showInvoice() {

    hideAllViews();

    invoiceView.style.display =
        "block";


    dashboardNav.classList.remove(
        "active"
    );

    mainBillNav.classList.remove(
        "active"
    );

}



if (dashboardNav) {

    dashboardNav.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            showDashboard();

        }
    );

}



if (mainBillNav) {

    mainBillNav.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            showMainBills();

        }
    );

}



// if (createBillButton) {

//     createBillButton.addEventListener(
//         "click",
//         function() {

//             showInvoice();

//         }
//     );

// }


/* ==================================================
        DASHBOARD DATE
================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const today = new Date();

        const options = {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        };

        const currentDate =
            today.toLocaleDateString(
                "en-IN",
                options
            );

        const dateElement =
            document.getElementById(
                "currentDate"
            );

        if (dateElement) {

            dateElement.textContent =
                currentDate;

        }

    }
);


/* ==================================================
        DYNAMIC DASHBOARD WELCOME
================================================== */

function updateWelcomeMessage() {


    const currentHour =
        new Date().getHours();


    let greeting;


    if (currentHour < 12) {

        greeting = "Good morning";

    }

    else if (currentHour < 17) {

        greeting = "Good afternoon";

    }

    else {

        greeting = "Good evening";

    }


    const creativeMessages = [

        "Let's make today productive! ✨",

        "Your ideas are ready to become reality. 🚀",

        "One step at a time. You've got this! 🌱",

        "Let's create something amazing today! 🎨",

        "A fresh day, a fresh start. ☀️",

        "Your business is growing, one bill at a time. 📈",

        "Small progress is still progress. 💫",

        "Let's turn today's work into tomorrow's success. 🌟",

        "Ready to make things happen? 💪",

        "Your dashboard is ready for you. Let's go! 🚀",

        "Today is a great day to get things done. ✨",

        "Organized work. Clear mind. Better results. 🧠",

        "Let's make your workflow smoother today. ⚡",

        "Another day to build something wonderful. 🌻",

        "Your next great idea might start today. 💡"

    ];


    const randomMessage =
        creativeMessages[
            Math.floor(
                Math.random()
                *
                creativeMessages.length
            )
        ];


    const welcomeElement =
        document.getElementById(
            "welcomeMessage"
        );


    if (welcomeElement) {

        welcomeElement.textContent =
            `${greeting}, Admin! 👋`;

    }


    const messageElement =
        document.getElementById(
            "welcomeSubtitle"
        );


    if (messageElement) {

        messageElement.textContent =
            randomMessage;

    }

}


updateWelcomeMessage();


/* ==================================================
        CURRENT MONTH
================================================== */

function updateCurrentMonth() {

    const today = new Date();


    const currentMonth =
        today.toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );


    const monthElement =
        document.getElementById(
            "currentMonth"
        );


    if (monthElement) {

        monthElement.textContent =
            currentMonth;

    }

}


updateCurrentMonth();


/* ==================================================
        LOAD DASHBOARD STATISTICS
================================================== */

async function loadDashboardStats() {

    try {

        const snapshot =
            await db
                .collection("bills")
                .get();


        let totalBills =
            snapshot.size;
            
        updateMainBillCount(
                totalBills
            );


        let monthlyBills =
            0;


        let savedToday =
            0;


        let totalAmount =
            0;


        const today =
            new Date();


        const currentYear =
            today.getFullYear();


        const currentMonth =
            today.getMonth();


        const todayString =
            today.toDateString();


        snapshot.forEach(
            function (document) {


                const bill =
                    document.data();


                /* ==================================
                        TOTAL AMOUNT
                ================================== */

                totalAmount +=
                    Number(
                        bill.grandTotal
                    )
                    || 0;


                /* ==================================
                        BILL DATE
                ================================== */

                let billDate;


                if (
                    bill.billDate
                ) {

                    billDate =
                        new Date(
                            bill.billDate
                        );

                }


                /* ==================================
                        THIS MONTH
                ================================== */

                if (

                    billDate

                    &&

                    billDate.getFullYear()
                    ===
                    currentYear

                    &&

                    billDate.getMonth()
                    ===
                    currentMonth

                ) {

                    monthlyBills++;

                }


                /* ==================================
                        SAVED TODAY
                ================================== */

                if (

                    bill.createdAt
                    &&
                    bill.createdAt.toDate

                ) {


                    const createdDate =
                        bill.createdAt
                            .toDate();


                    if (

                        createdDate
                            .toDateString()
                        ===
                        todayString

                    ) {

                        savedToday++;

                    }

                }

            }
        );


        updateDashboardStats(

            totalBills,

            monthlyBills,

            totalAmount,

            savedToday

        );


    }

    catch (error) {

        console.error(
            "Error loading dashboard:",
            error
        );

    }

}


/* ==================================================
        LOAD TOTAL TALAPATRAK COUNT
================================================== */


async function loadTalapatrakCount() {

    try {

        if (
            !auth.currentUser
        ) {
            return;
        }


        const snapshot =
            await db
                .collection("talapatraks")
                .where(
                    "userId",
                    "==",
                    auth.currentUser.uid
                )
                .get();


        const countElement =
            document.getElementById(
                "talapatrakRecordCount"
            );


        if (countElement) {

            countElement.textContent =
                snapshot.size.toLocaleString(
                    "en-IN"
                );

        }


    }

    catch(error) {

        console.error(
            "Error loading Talapatrak count:",
            error
        );

    }

}

/* ==================================================
        UPDATE DASHBOARD CARDS
================================================== */

function updateDashboardStats(

    totalBills,

    monthlyBills,

    totalAmount,

    savedToday

) {


    document
        .getElementById(
            "totalBillsCount"
        )
        .textContent =

        totalBills.toLocaleString(
            "en-IN"
        );


    document
        .getElementById(
            "monthlyBillsCount"
        )
        .textContent =

        monthlyBills.toLocaleString(
            "en-IN"
        );


    document
        .getElementById(
            "totalAmount"
        )
        .textContent =

        "₹ " +

        totalAmount.toLocaleString(
            "en-IN"
        );


    document
        .getElementById(
            "savedTodayCount"
        )
        .textContent =

        savedToday.toLocaleString(
            "en-IN"
        );

}

/* ==================================================
        UPDATE MAIN BILL COUNT
================================================== */

function updateMainBillCount(totalBills) {

    const mainBillCount =
        document.querySelector(
            ".orangeSystem .systemContent span"
        );


    if (mainBillCount) {

        mainBillCount.textContent =
            `${totalBills} bills`;

    }

}


async function loadRecentBills() {

    const recentBillsBody =
        document.getElementById(
            "recentBillsBody"
        );


    try {

        const snapshot =
            await db
                .collection("bills")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(5)
                .get();


        recentBillsBody.innerHTML = "";


        if (snapshot.empty) {

            recentBillsBody.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        class="loadingBills"
                    >

                        No bills saved yet.

                    </td>

                </tr>

            `;

            return;

        }


        snapshot.forEach(function(doc) {

            const bill =
                doc.data();


            let billDate =
                "N/A";


            if (bill.createdAt) {

                billDate =
                    bill.createdAt
                        .toDate()
                        .toLocaleDateString(
                            "en-IN",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        );

            }


            const billAmount =
                Number(
                    bill.grandTotal || 0
                ).toLocaleString(
                    "en-IN"
                );


            const row = `

                <tr>

                    <td>

                        <strong
                            class="billNumber"
                        >

                            ${bill.billNo || "N/A"}

                        </strong>

                    </td>


                    <td>

                        <span
                            class="typeBadge orangeBadge"
                        >

                            Main Bill

                        </span>

                    </td>


                    <td>

                        ${bill.customerName || "N/A"}

                    </td>


                    <td>

                        ${billDate}

                    </td>


                    <td>

                        <strong>

                            ₹ ${billAmount}

                        </strong>

                    </td>


                    <td>

                        <span
                            class="statusBadge saved"
                        >

                            Saved

                        </span>

                    </td>

                </tr>

            `;


            recentBillsBody
                .insertAdjacentHTML(
                    "beforeend",
                    row
                );

        });


    } catch(error) {

        console.error(
            "Error loading recent bills:",
            error
        );


        recentBillsBody.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="loadingBills"
                >

                    Unable to load bills.

                </td>

            </tr>

        `;

    }

}


/* ==========================================
        LOAD ALL MAIN BILLS
========================================== */

async function loadAllMainBills(searchTerm = "") {

    const mainBillsBody =
        document.getElementById(
            "mainBillsBody"
        );


    if (!mainBillsBody) return;


    mainBillsBody.innerHTML = `

        <tr>

            <td
                colspan="6"
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
                        ? formatIndianDate(
                            bill.billDate
                        )
                        : "N/A";


                const amount =
                    Number(
                        bill.grandTotal || 0
                    ).toLocaleString(
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

                            ${bill.billNo || doc.id}

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


                    <td>

                        <strong>

                            ₹ ${amount}

                        </strong>

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
                        colspan="6"
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
                    colspan="6"
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
            bill.mobileNumber || "";


        document
            .getElementById(
                "billNo"
            )
            .value =
            bill.billNo || billId;


        document
            .getElementById(
                "billDate"
            )
            .value =
            bill.billDate || "";


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
            bill.grandTotal || 0;


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
                        type="number"
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
                        type="number"
                        value="${item.pages || ""}"
                        oninput="calculateRow(this)">

                </td>


                <td>

                    <input
                        class="table-input price"
                        type="number"
                        step="0.01"
                        value="${item.price || ""}"
                        oninput="calculateRow(this)">

                </td>


                <td>

                    <input
                        class="table-input total"
                        type="number"
                        readonly
                        value="${item.total || ""}">

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
        CREATE NEW BILL
================================================== */

if (newMainBillButton) {

    newMainBillButton.addEventListener(
        "click",
        function() {


            mainBillsView.style.display =
                "none";


            invoiceView.style.display =
                "block";


            mainBillNav.classList.remove(
                "active"
            );


            dashboardNav.classList.remove(
                "active"
            );


            setInitialBillNumber();


            window.scrollTo(
                0,
                0
            );

        }
    );

}


/* ==================================================
        THEME SWITCHER
================================================== */

const themeButtons =
    document.querySelectorAll(
        ".themeButton"
    );


function applyTheme(theme) {

    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );


    themeButtons.forEach(
        function(button) {

            button.classList.toggle(

                "active",

                button.dataset.theme === theme

            );

        }
    );


    localStorage.setItem(
        "selectedTheme",
        theme
    );

}


themeButtons.forEach(
    function(button) {

        button.addEventListener(
            "click",
            function() {

                const selectedTheme =
                    this.dataset.theme;


                applyTheme(
                    selectedTheme
                );

            }
        );

    }
);


const savedTheme =
    localStorage.getItem(
        "selectedTheme"
    ) || "light";


applyTheme(
    savedTheme
);

/* ==================================================
        PAGE NAVIGATION
================================================== */
if (dashboardNav) {
  
  dashboardNav.addEventListener(
      "click",
      function(event) {
  
          event.preventDefault();
  
  
          dashboardView.style.display =
              "block";
  
  
          invoiceView.style.display =
              "none";
  
  
          dashboardNav.classList.add(
              "active"
          );
  
  
          window.scrollTo(
              0,
              0
          );
  
      }
  );

}

// if (createBillButton) {

//     createBillButton.addEventListener(
//         "click",
//         function() {

//             dashboardView.style.display =
//                 "none";

//             invoiceView.style.display =
//                 "block";

//             dashboardNav.classList.remove(
//                 "active"
//             );

//             window.scrollTo(
//                 0,
//                 0
//             );

//         }
//     );

// }

/* ============================================================
   CREATE BILL BUTTON
============================================================ */

// if (createBillButton) {

//     createBillButton.addEventListener(
//         "click",
//         function (event) {

//             event.preventDefault();

//             console.log("CREATE BILL BUTTON CLICKED");

//             hideAllViews();

//             if (invoiceView) {

//                 invoiceView.style.display =
//                     "block";

//             }

//             if (dashboardNav) {

//                 dashboardNav.classList.remove(
//                     "active"
//                 );

//             }

//             if (mainBillNav) {

//                 mainBillNav.classList.remove(
//                     "active"
//                 );

//             }

//             window.scrollTo(
//                 0,
//                 0
//             );

//         }
//     );

// }


/* ============================================================
   CREATE BILL BUTTON
============================================================ */

if (createBillButton) {

    createBillButton.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            console.log(
                "CREATE BILL BUTTON CLICKED"
            );


            hideAllViews();


            const invoiceView =
                document.getElementById(
                    "invoiceView"
                );


            console.log(
                "INVOICE VIEW AFTER CLICK:",
                invoiceView
            );


            if (!invoiceView) {

                console.error(
                    "invoiceView not found."
                );

                return;

            }


            invoiceView.style.display =
                "block";


            if (dashboardNav) {

                dashboardNav.classList.remove(
                    "active"
                );

            }


            if (mainBillNav) {

                mainBillNav.classList.remove(
                    "active"
                );

            }


            setInitialBillNumber();


            window.scrollTo(
                0,
                0
            );

        }
    );

}

function autoGrow(textarea) {

    textarea.style.height = "40px";

    textarea.style.height =
        textarea.scrollHeight + "px";

}



/* ============================================================
        LOGOUT SYSTEM
============================================================ */

const logoutButton =
    document.getElementById("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        async function () {

            try {

                await auth.signOut();

                console.log("User logged out successfully");

                // Hide all application views
                hideAllViews();

                // Show login screen
                if (loginScreen) {

                    loginScreen.style.display =
                        "flex";

                }

                // Clear login fields
                if (loginEmail) {

                    loginEmail.value =
                        "";

                }

                if (loginPassword) {

                    loginPassword.value =
                        "";

                }

            }

            catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        }

    );

}


/* ===========================================================================

/* ============================================================
        RECENT ACTIVITY SYSTEM
============================================================ */

const activityList =
    document.getElementById(
        "recentActivityList"
    );


const activityMoreButton =
    document.getElementById(
        "activityMoreButton"
    );


const activityCard =
    document.querySelector(
        ".activityCard"
    );


/* ============================================================
        ACTIVITY ICONS
============================================================ */

function getActivityIcon(type) {


    if (type === "created") {

        return `
            <div class="activityIcon orangeActivity">
                <i class="fa-solid fa-plus"></i>
            </div>
        `;

    }


    if (type === "updated") {

        return `
            <div class="activityIcon blueActivity">
                <i class="fa-solid fa-pen"></i>
            </div>
        `;

    }


    if (type === "saved") {

        return `
            <div class="activityIcon greenActivity">
                <i class="fa-solid fa-check"></i>
            </div>
        `;

    }


    /* ================================
       TALAPATRAK ACTIVITIES
    ================================= */


    if (type === "talapatrak_added") {

        return `
            <div class="activityIcon orangeActivity">
                <i class="fa-solid fa-file-circle-plus"></i>
            </div>
        `;

    }


    if (type === "talapatrak_updated") {

        return `
            <div class="activityIcon blueActivity">
                <i class="fa-solid fa-file-pen"></i>
            </div>
        `;

    }


    if (type === "talapatrak_deleted") {

        return `
            <div class="activityIcon redActivity">
                <i class="fa-solid fa-trash"></i>
            </div>
        `;

    }


    if (type === "talapatrak_printed") {

        return `
            <div class="activityIcon purpleActivity">
                <i class="fa-solid fa-print"></i>
            </div>
        `;

    }


    if (type === "talapatrak_opened") {

        return `
            <div class="activityIcon greenActivity">
                <i class="fa-solid fa-folder-open"></i>
            </div>
        `;

    }


}


/* ============================================================
        ACTIVITY MESSAGE
============================================================ */

function getActivityTitle(type) {

    if (type === "created") {

        return "New bill created";

    }


    if (type === "updated") {

        return "Bill updated";

    }


    if (type === "saved") {

        return "Bill saved";

    }

    if (type === "talapatrak_added") {

          return "New Talapatrak added";
          
          }
          
          
          if (type === "talapatrak_updated") {
          
              return "Talapatrak updated";
          
          }
          
          
          if (type === "talapatrak_deleted") {
          
              return "Talapatrak deleted";
          
          }
          
          
          if (type === "talapatrak_printed") {
          
              return "Talapatrak printed";
          
          }

}


/* ============================================================
        ACTIVITY TIME
============================================================ */

function getRelativeTime(timestamp) {

    if (!timestamp) {

        return "";

    }


    const activityDate =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(timestamp);


    const now =
        new Date();


    const difference =
        now - activityDate;


    const seconds =
        Math.floor(
            difference / 1000
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const days =
        Math.floor(
            hours / 24
        );


    if (seconds < 60) {

        return "Just now";

    }


    if (minutes < 60) {

        return `${minutes} min`;

    }


    if (hours < 24) {

        return `${hours} hr`;

    }


    if (days === 1) {

        return "Yesterday";

    }


    return `${days} days`;

}


/* ============================================================
        LOAD RECENT ACTIVITY
============================================================ */


// ==========================================
// LOAD RECENT ACTIVITY
// ==========================================

async function loadRecentActivity() {

    const activityList =
        document.getElementById(
            "recentActivityList"
        );


    if (!activityList) return;


    try {

        const snapshot =
            await db
                .collection("activities")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .limit(3)
                .get();


        activityList.innerHTML = "";


        if (snapshot.empty) {

            activityList.innerHTML = `

                <div class="activityEmpty">

                    No recent activity yet.

                </div>

            `;

            return;

        }


        snapshot.forEach(function(doc) {

            const activity =
                doc.data();


            const activityTime =
                activity.createdAt
                    ? formatActivityTime(
                        activity.createdAt
                    )
                    : "Just now";


            let icon =
                "fa-plus";


            let iconClass =
                "purpleActivity";


            if (
                activity.type ===
                "updated"
            ) {

                icon =
                    "fa-pen";

                iconClass =
                    "blueActivity";

            }


            if (
                activity.type ===
                "saved"
            ) {

                icon =
                    "fa-check";

                iconClass =
                    "greenActivity";

            }

          if (
                activity.type ===
                "talapatrak_deleted"
            ) {
            
                icon =
                    "fa-trash";
            
                iconClass =
                    "redActivity";
            
            }

                if (
                      activity.type ===
                      "talapatrak_printed"
                  ) {
                  
                      icon =
                          "fa-print";
                  
                      iconClass =
                          "purpleActivity";
                  
                  }

            if (
                activity.type ===
                "saved"
            ) {
            
                icon =
                    "fa-check";
            
                iconClass =
                    "greenActivity";
            
            }

             if (
                  activity.type ===
                  "talapatrak_added"
              ) {
              
                  icon =
                      "fa-file-circle-plus";
              
                  iconClass =
                      "orangeActivity";
              
              }
              
              
              if (
                  activity.type ===
                  "talapatrak_updated"
              ) {
              
                  icon =
                      "fa-file-pen";
              
                  iconClass =
                      "blueActivity";
              
              }
              
              
              if (
                  activity.type ===
                  "talapatrak_opened"
              ) {
              
                  icon =
                      "fa-folder-open";
              
                  iconClass =
                      "greenActivity";
              
              }

              if (
                    activity.type === "shikshanupakaran_added"
                ) {
                
                    icon =
                        "fa-file-circle-plus";
                
                    iconClass =
                        "orangeActivity";
                
                }
                
                
                if (
                    activity.type === "shikshanupakaran_updated"
                ) {
                
                    icon =
                        "fa-file-pen";
                
                    iconClass =
                        "blueActivity";
                
                }
                
                
                if (
                    activity.type === "shikshanupakaran_opened"
                ) {
                
                    icon =
                        "fa-folder-open";
                
                    iconClass =
                        "greenActivity";
                
                }
                
                
                if (
                    activity.type === "shikshanupakaran_deleted"
                ) {
                
                    icon =
                        "fa-trash";
                
                    iconClass =
                        "redActivity";
                
                }
                
                
                if (
                    activity.type === "shikshanupakaran_printed"
                ) {
                
                    icon =
                        "fa-print";
                
                    iconClass =
                        "purpleActivity";
                
                }

            const activityItem = `

                <div
                    class="activityItem"
                    data-id="${doc.id}"
                >

                    <div
                        class="activityIcon ${iconClass}"
                    >

                        <i
                            class="fa-solid ${icon}"
                        ></i>

                    </div>


                    <div
                        class="activityText"
                    >

                        <strong>

                            ${activity.title}

                        </strong>


                        <span>

                            ${activity.message}

                        </span>

                    </div>


                    <time>

                        ${activityTime}

                    </time>

                </div>

            `;


            activityList
                .insertAdjacentHTML(
                    "beforeend",
                    activityItem
                );

        });


    }

    catch(error) {

        console.error(
            "Error loading recent activity:",
            error
        );


        activityList.innerHTML = `

            <div class="activityEmpty">

                Unable to load recent activity.

            </div>

        `;

    }

}

// ==========================================
// FORMAT ACTIVITY TIME
// ==========================================

function formatActivityTime(timestamp) {

    const activityDate =
        timestamp.toDate();


    const now =
        new Date();


    const difference =
        now - activityDate;


    const seconds =
        Math.floor(
            difference / 1000
        );


    const minutes =
        Math.floor(
            seconds / 60
        );


    const hours =
        Math.floor(
            minutes / 60
        );


    const days =
        Math.floor(
            hours / 24
        );


    if (seconds < 60) {

        return "Just now";

    }


    if (minutes < 60) {

        return minutes +
            (
                minutes === 1
                    ? " min"
                    : " mins"
            );

    }


    if (hours < 24) {

        return hours +
            (
                hours === 1
                    ? " hr"
                    : " hrs"
            );

    }


    if (days < 7) {

        return days +
            (
                days === 1
                    ? " day"
                    : " days"
            );

    }


    return activityDate
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short"
            }
        );

}


// ============================================================
// ADD TALAPATRAK ACTIVITY
// ============================================================

async function addTalapatrakActivity(
    type,
    title,
    message,
    villageName = ""
) {

    try {

        await db
            .collection("activities")
            .add({

                type: type,

                title: title,

                message: message,

                module: "talapatrak",

                villageName: villageName,

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


        console.log(
            "Talapatrak activity added:",
            title
        );


        // Refresh dashboard activity
        if (
            typeof loadRecentActivity === "function"
        ) {

            loadRecentActivity();

        }


    }

    catch(error) {

        console.error(
            "Error adding Talapatrak activity:",
            error
        );

    }

}

/* ============================================================
   RECENT ACTIVITY MENU
============================================================ */


let activityMenu =
    null;


/* ============================================================
   CREATE MENU
============================================================ */

function createActivityMenu() {

    if (activityMenu) return;


    activityMenu =
        document.createElement("div");


    activityMenu.className =
        "activityMenu";


    activityMenu.innerHTML = `

        <button
            type="button"
            class="activityMenuItem"
            id="refreshActivityButton">

            <i class="fa-solid fa-arrows-rotate"></i>

            <span>
                Refresh activity
            </span>

        </button>


        <button
            type="button"
            class="activityMenuItem"
            id="viewAllActivityButton">

            <i class="fa-solid fa-list"></i>

            <span>
                View all activity
            </span>

        </button>


        <button
            type="button"
            class="activityMenuItem danger"
            id="hideActivityButton">

            <i class="fa-solid fa-eye-slash"></i>

            <span>
                Hide activity
            </span>

        </button>

    `;


    activityCard.appendChild(
        activityMenu
    );


    setupActivityMenuActions();

}


/* ============================================================
   TOGGLE MENU
============================================================ */

if (activityMoreButton) {

    activityMoreButton.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            createActivityMenu();

            activityMenu.classList.toggle(
                "show"
            );

        }
    );

}


/* ============================================================
   CLOSE MENU OUTSIDE
============================================================ */

document.addEventListener(
    "click",
    function(event) {

        if (

            activityMenu &&

            !activityMenu.contains(
                event.target
            ) &&

            !activityMoreButton.contains(
                event.target
            )

        ) {

            activityMenu.classList.remove(
                "show"
            );

        }

    }
);


/* ============================================================
   MENU ACTIONS
============================================================ */

function setupActivityMenuActions() {


    /* --------------------------------------------------------
       REFRESH
    -------------------------------------------------------- */

    const refreshButton =
        document.getElementById(
            "refreshActivityButton"
        );


    refreshButton.addEventListener(
        "click",
        async function() {

            activityMenu.classList.remove(
                "show"
            );


            activityList.innerHTML = `

                <div class="activityLoading">

                    Refreshing activity...

                </div>

            `;


            /*
             * Replace this function name
             * with your existing activity
             * loading function.
             */

            if (
                typeof loadRecentActivity ===
                "function"
            ) {

                await loadRecentActivity();

            }

        }
    );


    /* --------------------------------------------------------
       VIEW ALL
    -------------------------------------------------------- */

    const viewAllButton =
document.querySelector(
    ".viewAllButton"
);


if(viewAllButton){

    viewAllButton.addEventListener(
        "click",
        function(){

            console.log(
                "View All Bills clicked"
            );


            // Hide dashboard
            const dashboard =
            document.getElementById(
                "dashboardView"
            );


            if(dashboard){

                dashboard.style.display =
                    "none";

            }



            // Hide other modules
            const invoiceView =
            document.getElementById(
                "invoiceView"
            );


            if(invoiceView){

                invoiceView.style.display =
                    "none";

            }



            const talapatrakView =
            document.getElementById(
                "talapatrakView"
            );


            if(talapatrakView){

                talapatrakView.style.display =
                    "none";

            }



            // Show all bills
            const mainBillsView =
            document.getElementById(
                "mainBillsView"
            );


            if(mainBillsView){

                mainBillsView.style.display =
                    "block";

            }



            // Load bills

            if(
                typeof loadMainBills === "function"
            ){

                loadMainBills();

            }


        }
    );

}


    /* --------------------------------------------------------
       HIDE ACTIVITY
    -------------------------------------------------------- */

    const hideButton =
        document.getElementById(
            "hideActivityButton"
        );


    hideButton.addEventListener(
        "click",
        function() {

            activityMenu.classList.remove(
                "show"
            );


            activityList.classList.add(
                "activityHidden"
            );


            showActivityHiddenState();

        }
    );

}

/* ============================================================
   HIDDEN ACTIVITY STATE
============================================================ */

function showActivityHiddenState() {

    let hiddenState =
        activityCard.querySelector(
            ".activityHiddenState"
        );


    if (!hiddenState) {

        hiddenState =
            document.createElement("div");


        hiddenState.className =
            "activityHiddenState";


        hiddenState.innerHTML = `

            <i class="fa-solid fa-eye-slash"></i>

            <span>
                Recent activity is hidden
            </span>


            <button
                type="button"
                class="activityMenuItem"
                id="showActivityButton">

                <i class="fa-solid fa-eye"></i>

                Show activity

            </button>

        `;


        activityCard.appendChild(
            hiddenState
        );


        document
            .getElementById(
                "showActivityButton"
            )
            .addEventListener(
                "click",
                showActivityAgain
            );

    }


    hiddenState.classList.add(
        "show"
    );

}


/* ============================================================
   SHOW ACTIVITY AGAIN
============================================================ */

function showActivityAgain() {

    const hiddenState =
        document.querySelector(
            ".activityHiddenState"
        );


    hiddenState.classList.remove(
        "show"
    );


    activityList.classList.remove(
        "activityHidden"
    );


    if (
        typeof loadRecentActivity ===
        "function"
    ) {

        loadRecentActivity();

    }

}

function hideAllMainViews() {

    const views = [
        "dashboardView",
        "mainBillsView",
        "invoiceView",
        "talapatrakView",
        "talapatrakEditorView"
    ];

    views.forEach(viewId => {

        const view = document.getElementById(viewId);

        if (view) {
            view.style.display = "none";
        }

    });

}

function showMainView(viewId) {

    const allViews = [

        "dashboardView",
        "mainBillsView",
        "invoiceView",
        "talapatrakView",
        "talapatrakEditorView"

    ];

    // Hide every main view first
    allViews.forEach(function (id) {

        const view = document.getElementById(id);

        if (view) {

            view.style.display = "none";

        }

    });


    // Show only the requested view
    const selectedView = document.getElementById(viewId);

    if (selectedView) {

        selectedView.style.display = "block";

    }

}
