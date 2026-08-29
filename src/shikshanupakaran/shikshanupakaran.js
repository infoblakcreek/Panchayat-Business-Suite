console.log("SHIKSHANUPAKARAN JS FILE RUNNING");

/* ============================================================
        SHIKSHANUPAKARAN SYSTEM
        STEP 1: NAVIGATION + MANAGEMENT + EDITOR
============================================================ */


/* ============================================================
        ELEMENT REFERENCES
============================================================ */


const shikshanupakaranNavElement =
    document.getElementById(
        "shikshanupakaranNav"
    );


const shikshanupakaranViewElement =
    document.getElementById(
        "shikshanupakaranView"
    );


const shikshanupakaranEditorViewElement =
    document.getElementById(
        "shikshanupakaranEditorView"
    );


const backToShikshanupakaranManagementButton =
    document.getElementById(
        "backToShikshanupakaranManagement"
    );


const addShikshanupakaranButton =
    document.getElementById(
        "addShikshanupakaranButton"
    );


const emptyAddShikshanupakaranButton =
    document.getElementById(
        "emptyAddShikshanupakaranButton"
    );


/* ============================================================
        GLOBAL STATE
============================================================ */


let shikshanupakaranRecords = [];

let currentShikshanupakaranRecord = null;

let currentShikshanupakaranDocumentId = null;

window.shikshanupakaranAllRows = [];

/* ============================================================
   SHIKSHANUPAKARAN PAGINATION
============================================================ */

window.shikshanupakaranAllRows =
    window.shikshanupakaranAllRows || [];

window.shikshanupakaranRowsPerPage =
    20;

window.shikshanupakaranCurrentPage =
    1;

window.shikshanupakaranTotalPages =
    1;


/* ============================================================
   SHIKSHANUPAKARAN TOTAL STATE
============================================================ */

window.shikshanupakaranTotalGenerated =
    false;

window.shikshanupakaranTotals =
    null;



    /* ============================================================
   SHIKSHANUPAKARAN AUTO SAVE SYSTEM
   ============================================================ */

window.shikshanupakaranAutoSaveTimer = null;

window.shikshanupakaranAutoSaveInitialized =
    false;

window.shikshanupakaranIsSaving =
    false;


window.shikshanupakaranHasUnsavedChanges = false;

window.shikshanupakaranUnsavedRows =
    new Set();


function openShikshanupakaran(){

    const dashboard =
        document.getElementById("dashboardView");


    const shikshanupakaran =
        document.getElementById("shikshanupakaranContainer");


    if(dashboard){
        dashboard.style.display = "none";
    }


    if(shikshanupakaran){
        shikshanupakaran.style.display = "block";
    }

}



/* ============================================================
   SHIKSHANUPAKARAN CREATE DECISION CACHE

   Stores the user's answer for:
   Village + Year

   true  = create/sync
   false = do not create/sync

   The user will NOT be asked again for the
   same Village + Year during this session.
============================================================ */

const shikshanupakaranCreateDecisions =
    new Map();


function getShikshanupakaranCreateDecisionKey(
    moje,
    year
){

    return (
        String(moje || "")
            .trim()
            .toLowerCase()
        +
        "::"
        +
        String(year || "")
            .trim()
    );

}
/* ============================================================
        NAVIGATION ACTIVE STATE
============================================================ */


function clearShikshanupakaranNavigationActiveState(){

    document
        .querySelectorAll(
            ".navItem"
        )
        .forEach(
            function(item){

                item.classList.remove(
                    "active"
                );

            }
        );

}



/* ============================================================
        HIDE SHIKSHANUPAKARAN VIEWS
============================================================ */


function hideAllShikshanupakaranViews(){


    if(shikshanupakaranViewElement){

        shikshanupakaranViewElement.style.display =
            "none";

    }


    if(shikshanupakaranEditorViewElement){

        shikshanupakaranEditorViewElement.style.display =
            "none";

    }


}



/* ============================================================
        OPEN SHIKSHANUPAKARAN MANAGEMENT
============================================================ */


async function openShikshanupakaranManagement(){

    if(typeof hideAllViews === "function"){
          hideAllViews();
      }        // Hide Dashboard, Invoice, Talapatrak, etc.
      

      console.log(
        "Shikshanupakaran element:",
        shikshanupakaranViewElement
    );

  
    hideAllShikshanupakaranViews(); // Hide Shikshanupakaran views


    if(shikshanupakaranViewElement){

        shikshanupakaranViewElement.style.display =
            "block";

    }

    clearShikshanupakaranNavigationActiveState();

    if(shikshanupakaranNavElement){

        shikshanupakaranNavElement.classList.add(
            "active");

    }

  console.log(
    "Opening Shikshanupakaran"
);

console.log(
    "Dashboard element:",
    document.getElementById("dashboardView")
);

console.log(
    "Dashboard display before:",
    document.getElementById("dashboardView").style.display
);


    await loadShikshanupakaranRecords();

}


console.log(
    "Shikshanupakaran nav:",
    shikshanupakaranNavElement
);

/* ============================================================
        SIDEBAR CLICK
============================================================ */

if (shikshanupakaranNavElement) {

    shikshanupakaranNavElement.addEventListener(
        "click",
        function(event) {

            event.preventDefault();


            /*
                ====================================================
                HIDE OTHER VIEWS SAFELY
                ====================================================
            */

            const dashboardView =
                document.getElementById(
                    "dashboardView"
                );


            const mainBillsView =
                document.getElementById(
                    "mainBillsView"
                );


            const invoiceView =
                document.getElementById(
                    "invoiceView"
                );


            const talapatrakView =
                document.getElementById(
                    "talapatrakView"
                );


            const shikshanupakaranView =
                document.getElementById(
                    "shikshanupakaranView"
                );


            if (dashboardView) {

                dashboardView.style.display =
                    "none";

            }


            if (mainBillsView) {

                mainBillsView.style.display =
                    "none";

            }


            if (invoiceView) {

                invoiceView.style.display =
                    "none";

            }


            if (talapatrakView) {

                talapatrakView.style.display =
                    "none";

            }


            /*
                ====================================================
                SHOW SHIKSHANUPAKARAN
                ====================================================
            */

            if (shikshanupakaranView) {

                shikshanupakaranView.style.display =
                    "block";

            }


            console.log(
                "Shikshanupakaran sidebar clicked"
            );


            /*
                ====================================================
                OPEN MANAGEMENT
                ====================================================
            */

            openShikshanupakaranManagement();

        }
    );

}



/* ============================================================
        INITIAL VIEW
============================================================ */


function initializeShikshanupakaranViews(){


    if(shikshanupakaranViewElement){

        shikshanupakaranViewElement.style.display =
            "none";

    }


    if(shikshanupakaranEditorViewElement){

        shikshanupakaranEditorViewElement.style.display =
            "none";

    }


}



initializeShikshanupakaranViews();



console.log(
    "Shikshanupakaran navigation initialized"
);


/* ============================================================
        SHIKSHANUPAKARAN MANAGEMENT
        FIREBASE LOAD + SEARCH + SORT STATE
============================================================ */


/* ============================================================
        ELEMENT REFERENCES
============================================================ */


const shikshanupakaranSearchInputElement =
    document.getElementById(
        "shikshanupakaranSearchInput"
    );


const shikshanupakaranSortButtonElement =
    document.getElementById(
        "shikshanupakaranSortButton"
    );


const shikshanupakaranSortMenuElement =
    document.getElementById(
        "shikshanupakaranSortMenu"
    );


const shikshanupakaranSortOptions =
    document.querySelectorAll(
        ".shikshanupakaranSortOption"
    );


const shikshanupakaranGridViewButtonElement =
    document.getElementById(
        "shikshanupakaranGridViewButton"
    );


const shikshanupakaranListViewButtonElement =
    document.getElementById(
        "shikshanupakaranListViewButton"
    );


const shikshanupakaranRecordCountElement =
    document.getElementById(
        "shikshanupakaranRecordCount"
    );

const shikshanupakaranManagementRecordCountElement =
    document.getElementById(
        "shikshanupakaranManagementRecordCount"
    );

const shikshanupakaranVillageGridElement =
    document.getElementById(
        "shikshanupakaranVillageGrid"
    );


const shikshanupakaranEmptyStateElement =
    document.getElementById(
        "shikshanupakaranEmptyState"
    );



/* ============================================================
        STATE
============================================================ */


let shikshanupakaranSearchTerm =
    "";


let shikshanupakaranSortMode =
    "recent";


let shikshanupakaranViewMode =
    "grid";

if(shikshanupakaranGridViewButtonElement){

    shikshanupakaranGridViewButtonElement.addEventListener(
        "click",
        function(){

            shikshanupakaranViewMode = "grid";

            shikshanupakaranVillageGridElement.classList.remove(
                "listView"
            );

            shikshanupakaranGridViewButtonElement.classList.add(
                "active"
            );

            shikshanupakaranListViewButtonElement.classList.remove(
                "active"
            );

        }
    );

}



if(shikshanupakaranListViewButtonElement){

    shikshanupakaranListViewButtonElement.addEventListener(
        "click",
        function(){

            shikshanupakaranViewMode = "list";

            shikshanupakaranVillageGridElement.classList.add(
                "listView"
            );

            shikshanupakaranListViewButtonElement.classList.add(
                "active"
            );

            shikshanupakaranGridViewButtonElement.classList.remove(
                "active"
            );

        }
    );

}


/* ============================================================
        LOAD RECORDS FROM FIREBASE
============================================================ */


async function loadShikshanupakaranRecords(){


    try{


        if(
            !auth ||
            !auth.currentUser
        ){


            console.warn(
                "No user logged in."
            );


            shikshanupakaranRecords =
                [];


            renderShikshanupakaranManagement();


            return;

        }



        if(
            shikshanupakaranVillageGridElement
        ){

            shikshanupakaranVillageGridElement.innerHTML = `


                <div class="shikshanupakaranLoadingState">


                    <i class="fa-solid fa-spinner fa-spin"></i>


                    <p>
                        Loading Shikshanupakaran records...
                    </p>


                </div>


            `;

        }




        const snapshot =

            await db

                .collection(
                    "shikshanupakarans"
                )

                .where(
                    "userId",
                    "==",
                    auth.currentUser.uid
                )

                .get();




        shikshanupakaranRecords = [];




        snapshot.forEach(

            function(doc){


                shikshanupakaranRecords.push({

                    id:
                        doc.id,

                    ...doc.data()

                });


            }

        );




        console.log(
            "SHIKSHANUPAKARAN RECORDS:",
            shikshanupakaranRecords
        );



        renderShikshanupakaranManagement();



    }


    catch(error){


        console.error(
            "Error loading Shikshanupakaran:",
            error
        );


    }


}


/* ============================================================
        DASHBOARD SHIKSHANUPAKARAN COUNT
============================================================ */


async function loadShikshanupakaranDashboardCount(){

    try{


        if(
            !auth.currentUser
        ){

            return;

        }



        const snapshot =

            await db
            .collection(
                "shikshanupakarans"
            )
            .where(
                "userId",
                "==",
                auth.currentUser.uid
            )
            .get();





        if(
            shikshanupakaranDashboardCountElement
        ){

            shikshanupakaranDashboardCountElement.textContent =
                snapshot.size;


        }



    }

    catch(error){


        console.error(
            "Shikshanupakaran dashboard count error:",
            error
        );


    }


}

/* ============================================================
        SEARCH
============================================================ */


if(
    shikshanupakaranSearchInputElement
){


    shikshanupakaranSearchInputElement.addEventListener(

        "input",

        function(){


            shikshanupakaranSearchTerm =

                this.value
                    .trim()
                    .toLowerCase();



            renderShikshanupakaranManagement();


        }

    );

}


/* ============================================================
        FILTER RECORDS
============================================================ */


function getFilteredShikshanupakaranRecords(){


    if(
        !shikshanupakaranSearchTerm
    ){

        return [
            ...shikshanupakaranRecords
        ];

    }



    return shikshanupakaranRecords.filter(

        function(record){


            const text = `

                ${record.moje || ""}

                ${record.year || ""}

                ${record.taluka || ""}

                ${record.jillo || ""}

            `
            .toLowerCase();



            return text.includes(
                shikshanupakaranSearchTerm
            );


        }

    );


}


/* ============================================================
        SORT DROPDOWN
============================================================ */


if(

    shikshanupakaranSortButtonElement &&
    shikshanupakaranSortMenuElement

){


    shikshanupakaranSortButtonElement.addEventListener(

        "click",

        function(event){


            event.stopPropagation();


            shikshanupakaranSortMenuElement.classList.toggle(
                "open"
            );


        }

    );

}




shikshanupakaranSortOptions.forEach(

    function(option){


        option.addEventListener(

            "click",

            function(){


                shikshanupakaranSortMode =
                    this.dataset.sort;



                shikshanupakaranSortOptions.forEach(

                    function(btn){


                        btn.classList.remove(
                            "active"
                        );


                    }

                );



                this.classList.add(
                    "active"
                );



                renderShikshanupakaranManagement();


            }

        );


    }

);

/* ============================================================
        SORT FUNCTION
============================================================ */


function sortShikshanupakaranRecords(records){

    const sortedRecords = [
        ...records
    ];


    /*
        ============================================================
        SAFE TIMESTAMP READER

        Firestore timestamps can be:
            - Timestamp objects
            - Date objects
            - numbers
            - strings
            - null / undefined
        ============================================================
    */

    function getSafeTimestamp(value){

        if(!value){
            return 0;
        }


        /*
            Firestore Timestamp
        */

        if(
            typeof value.toMillis ===
            "function"
        ){

            return value.toMillis();

        }


        /*
            JavaScript Date
        */

        if(
            value instanceof Date
        ){

            return value.getTime();

        }


        /*
            Numeric timestamp
        */

        if(
            typeof value ===
            "number"
        ){

            return value;

        }


        /*
            String date
        */

        const parsed =
            new Date(
                value
            ).getTime();


        return Number.isNaN(
            parsed
        )
            ? 0
            : parsed;

    }


    /*
        ============================================================
        SORT
        ============================================================
    */

    switch(
        shikshanupakaranSortMode
    ){

        case "recent":

            sortedRecords.sort(
                function(a, b){

                    return (
                        getSafeTimestamp(
                            b.updatedAt
                        )
                        -
                        getSafeTimestamp(
                            a.updatedAt
                        )
                    );

                }
            );

        break;


        case "oldest":

            sortedRecords.sort(
                function(a, b){

                    return (
                        getSafeTimestamp(
                            a.updatedAt
                        )
                        -
                        getSafeTimestamp(
                            b.updatedAt
                        )
                    );

                }
            );

        break;


        case "az":

            sortedRecords.sort(
                function(a, b){

                    return String(
                        a.moje || ""
                    ).localeCompare(
                        String(
                            b.moje || ""
                        ),
                        "gu"
                    );

                }
            );

        break;


        case "za":

            sortedRecords.sort(
                function(a, b){

                    return String(
                        b.moje || ""
                    ).localeCompare(
                        String(
                            a.moje || ""
                        ),
                        "gu"
                    );

                }
            );

        break;

    }


    return sortedRecords;

}



/* ============================================================
        SHIKSHANUPAKARAN RENDER MANAGEMENT
============================================================ */


function renderShikshanupakaranManagement(){


    console.log(
        "RENDER SHIKSHANUPAKARAN:",
        shikshanupakaranRecords.length
    );



    const filteredRecords =
        getFilteredShikshanupakaranRecords();



    const sortedRecords =
        sortShikshanupakaranRecords(
            filteredRecords
        );




    if(
        shikshanupakaranRecordCountElement
    ){

        shikshanupakaranRecordCountElement.textContent =
            sortedRecords.length;

    }


    if (
        shikshanupakaranManagementRecordCountElement
    ) {
    
        shikshanupakaranManagementRecordCountElement.textContent =
            sortedRecords.length;
    
    }



    if(
        shikshanupakaranEmptyStateElement
    ){

        shikshanupakaranEmptyStateElement.style.display =
            sortedRecords.length === 0
            ? "flex"
            : "none";

    }





    if(
        !shikshanupakaranVillageGridElement
    ){

        return;

    }





    const oldCards =
        shikshanupakaranVillageGridElement.querySelectorAll(
            ".shikshanupakaranVillageCard"
        );


    oldCards.forEach(

        function(card){

            card.remove();

        }

    );


  const loadingState =
    shikshanupakaranVillageGridElement.querySelector(
        ".shikshanupakaranLoadingState"
    );


if(loadingState){

    loadingState.remove();

}



    sortedRecords.forEach(

        function(record){


            const card =
                createShikshanupakaranVillageCard(
                    record
                );


            shikshanupakaranVillageGridElement.appendChild(
                card
            );


        }

    );



    console.log(
        "Shikshanupakaran cards created:",
        sortedRecords.length
    );


}


/* ============================================================
   SHIKSHANUPAKARAN — CREATE VILLAGE CARD
   ============================================================ */

function createShikshanupakaranVillageCard(record) {

    /*
        Create card
    */

    const card =
        document.createElement("article");


    card.className =
        "shikshanupakaranVillageCard";


    card.dataset.id =
        record.id;


    /*
        Safely get values
    */

    const villageName =
        record.moje ||
        "Unnamed Village";


    const year =
        record.year ||
        "2025-2026";


    const rowCount =
        Array.isArray(record.rows)
            ? record.rows.length
            : 0;


    /*
        Format updated date
    */

    let updatedText =
        "Not updated yet";


    if (record.updatedAt) {

        const updatedDate =
            record.updatedAt?.toDate
                ? record.updatedAt.toDate()
                : new Date(record.updatedAt);


        if (!isNaN(updatedDate)) {

            updatedText =
                updatedDate.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );

        }

    }


    /*
        CARD HTML
    */

    card.innerHTML = `

        <!-- ==========================================
             CARD HEADER
        =========================================== -->

        <div class="shikshanupakaranVillageCardHeader">


            <div class="shikshanupakaranVillageIcon">

                <i class="fa-solid fa-location-dot"></i>

            </div>


            <div class="shikshanupakaranVillageTitle">

                <h3>
                    ${escapeShikshanupakaranHTML(villageName)}
                </h3>

                <span>
                    Shikshanupakaran
                </span>

            </div>


            <!-- ======================================
                 THREE DOT MENU
            ======================================= -->

            <div class="shikshanupakaranCardMenuWrapper">

                <button
                    type="button"
                    class="shikshanupakaranCardMenuButton"
                    title="More options">

                    <i class="fa-solid fa-ellipsis-vertical"></i>

                </button>


                <div class="shikshanupakaranCardMenu">

                
                <!-- RENAME -->
                
                <button
                    type="button"
                    class="shikshanupakaranCardMenuItem"
                    data-action="rename">
                
                    <i class="fa-solid fa-pen"></i>
                
                    <span>
                        Rename
                    </span>
                
                </button>
                
                
                <!-- COPY -->
                
                <button
                    type="button"
                    class="shikshanupakaranCardMenuItem"
                    data-action="copy">
                
                    <i class="fa-solid fa-copy"></i>
                
                    <span>
                        Copy
                    </span>
                
                </button>
                
                
                <!-- DUPLICATE -->
                
                <button
                    type="button"
                    class="shikshanupakaranCardMenuItem"
                    data-action="duplicate">
                
                    <i class="fa-solid fa-clone"></i>
                
                    <span>
                        Duplicate
                    </span>
                
                </button>
                
                
                <!-- DIVIDER -->
                
                <div class="shikshanupakaranCardMenuDivider"></div>

                    <!-- DOWNLOAD -->

                    <button
                        type="button"
                        class="shikshanupakaranCardMenuItem"
                        data-action="download">

                        <i class="fa-solid fa-download"></i>

                        <span>
                            Download
                        </span>

                    </button>


                    <!-- DIVIDER -->

                    <div class="shikshanupakaranCardMenuDivider"></div>


                    <!-- DELETE -->

                    <button
                        type="button"
                        class="shikshanupakaranCardMenuItem delete"
                        data-action="delete">

                        <i class="fa-solid fa-trash"></i>

                        <span>
                            Delete
                        </span>

                    </button>


                </div>

            </div>

        </div>


        <!-- ==========================================
             CARD DETAILS
        =========================================== -->

        <div class="shikshanupakaranVillageDetails">


            <div class="shikshanupakaranVillageDetail">

                <strong>
                    ${escapeShikshanupakaranHTML(year)}
                </strong>

            </div>


            <div class="shikshanupakaranVillageDetail">

                <span>
                    Records
                </span>

                <strong>
                    ${rowCount}
                </strong>

            </div>


        </div>


        <!-- ==========================================
             CARD FOOTER
        =========================================== -->

        <div class="shikshanupakaranVillageCardFooter">

            <span>

                <i class="fa-regular fa-clock"></i>

                Updated ${updatedText}

            </span>

        </div>

    `;


    /* ============================================================
       OPEN CARD
       ============================================================ */

    card.addEventListener(
        "click",
        function(event) {

            console.log(
                "SHIKSHANUPAKARAN CARD CLICKED:",
                record.id
            );


            /*
                Do NOT open editor when clicking
                the three-dot menu.
            */

            if (
                event.target.closest(
                    ".shikshanupakaranCardMenuWrapper"
                )
            ) {

                console.log(
                    "CLICK WAS ON SHIKSHANUPAKARAN CARD MENU"
                );

                return;

            }


            event.preventDefault();
            event.stopPropagation();


            console.log(
                "OPENING SHIKSHANUPAKARAN RECORD:",
                record.id
            );


            openShikshanupakaranRecord(
                record.id
            );

        }
    );


    /*
        Setup three-dot menu
    */

    setupShikshanupakaranCardMenu(
        card,
        record
    );


    console.log(
        "SHIKSHANUPAKARAN CARD CREATION COMPLETE:",
        record.id
    );


    return card;

}


/* ============================================================
   SHIKSHANUPAKARAN CARD MENU SYSTEM
============================================================ */

function setupShikshanupakaranCardMenu(card, record) {

    if (!card || !record) {
        return;
    }


    const menuWrapper =
        card.querySelector(
            ".shikshanupakaranCardMenuWrapper"
        );


    const menuButton =
        card.querySelector(
            ".shikshanupakaranCardMenuButton"
        );


    const menu =
        card.querySelector(
            ".shikshanupakaranCardMenu"
        );


    if (
        !menuWrapper ||
        !menuButton ||
        !menu
    ) {

        console.error(
            "Shikshanupakaran card menu elements not found:",
            record.id
        );

        return;

    }


    /* ========================================================
       THREE DOT BUTTON
    ======================================================== */

    menuButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();


            /*
                Close all other open menus
            */

            document
                .querySelectorAll(
                    ".shikshanupakaranCardMenu.open"
                )
                .forEach(
                    function(otherMenu) {

                        if (otherMenu !== menu) {

                            otherMenu.classList.remove(
                                "open"
                            );

                        }

                    }
                );


            /*
                Toggle this menu
            */

            menu.classList.toggle(
                "open"
            );


            console.log(
                "Shikshanupakaran menu toggled:",
                record.id
            );

        }
    );


    /* ========================================================
       MENU ITEMS
    ======================================================== */

    const menuItems =
        menu.querySelectorAll(
            ".shikshanupakaranCardMenuItem"
        );


    menuItems.forEach(
        function(item) {

            item.addEventListener(
                "click",
                async function(event) {

                    event.preventDefault();
                    event.stopPropagation();


                    const action =
                        item.dataset.action;


                    console.log(
                        "Shikshanupakaran menu action:",
                        action,
                        record.id
                    );


                    /*
                        Close menu immediately
                    */

                    menu.classList.remove(
                        "open"
                    );


                    /*
                        ----------------------------------------
                        DOWNLOAD
                        ----------------------------------------
                    */

                    if(action === "download") {

                        await downloadShikshanupakaranPDF(
                            record
                        );

                        return;

                    }


                    /*
                        ----------------------------------------
                        DELETE
                        ----------------------------------------
                    */

                    if(action === "delete") {

                        await showShikshanupakaranDeleteModal(
                            record
                        );

                        return;

                    }


                    /*
                        ----------------------------------------
                        RENAME
                        ----------------------------------------
                    */

                    if(action === "rename") {

                        await renameShikshanupakaranRecord(
                            record
                        );

                        return;

                    }


                    /*
                        ----------------------------------------
                        COPY
                        ----------------------------------------
                    */

                    if(action === "copy") {

                        await copyShikshanupakaranRecord(
                            record
                        );

                        return;

                    }


                    /*
                        ----------------------------------------
                        DUPLICATE
                        ----------------------------------------
                    */

                    if(action === "duplicate") {

                        await duplicateShikshanupakaranRecord(
                            record
                        );

                        return;

                    }

                }
            );

        }
    );

}


/* ============================================================
   CLOSE SHIKSHANUPAKARAN MENUS WHEN CLICKING OUTSIDE
   ============================================================ */

document.addEventListener(
    "click",
    function(event) {

        /*
            If click is inside a menu wrapper,
            leave it alone.
        */

        if (
            event.target.closest(
                ".shikshanupakaranCardMenuWrapper"
            )
        ) {

            return;

        }


        /*
            Close every open menu
        */

        document
            .querySelectorAll(
                ".shikshanupakaranCardMenu.open"
            )
            .forEach(
                function(menu) {

                    menu.classList.remove(
                        "open"
                    );

                }
            );

    }
);


/* ============================================================
        ESCAPE HTML
============================================================ */


function escapeShikshanupakaranHTML(value){


    return String(value)

        .replace(/&/g,"&amp;")

        .replace(/</g,"&lt;")

        .replace(/>/g,"&gt;")

        .replace(/"/g,"&quot;")

        .replace(/'/g,"&#039;");


}


/* ============================================================
   RENAME SHIKSHANUPAKARAN RECORD
============================================================ */

async function renameShikshanupakaranRecord(record) {

    if(!record || !record.id) {
        return;
    }


    const oldVillageName =
        record.moje || "";


    const year =
        record.year ||
        getCurrentShikshanupakaranYear();


    const newVillageName =
        prompt(
            "Enter new village name:",
            oldVillageName
        );


    if(newVillageName === null) {
        return;
    }


    const moje =
        newVillageName.trim();


    if(!moje) {

        alert(
            "Village name cannot be empty."
        );

        return;

    }


    if(moje === oldVillageName) {
        return;
    }


    try {

        /* ----------------------------------------
           CHECK LOGIN
        ---------------------------------------- */

        if(
            !auth ||
            !auth.currentUser
        ) {

            alert(
                "Please login first."
            );

            return;

        }


        /* ----------------------------------------
           NEW DOCUMENT ID
        ---------------------------------------- */

        const newDocumentId =
            getShikshanupakaranDocumentId(
                moje,
                year
            );


        const newRef =
            db
            .collection(
                "shikshanupakarans"
            )
            .doc(
                newDocumentId
            );


        /* ----------------------------------------
           CHECK DUPLICATE
        ---------------------------------------- */

        const existing =
            await newRef.get();


        if(existing.exists) {

             await showShikshanupakaranAlreadyExistsModal(
                    moje,
                    year
                );

            return;

        }


        /* ----------------------------------------
           CREATE RENAMED RECORD
        ---------------------------------------- */

        const newData = {

            type:
                "shikshanupakaran",

            moje:
                moje,

            taluka:
                record.taluka || "",

            jillo:
                record.jillo || "",

            year:
                year,

            rows:
                Array.isArray(record.rows)
                    ? JSON.parse(
                        JSON.stringify(record.rows)
                    )
                    : [],

            rowCount:
                Array.isArray(record.rows)
                    ? record.rows.length
                    : 0,

            userId:
                auth.currentUser.uid,

            userEmail:
                auth.currentUser.email,

            updatedAt:
                firebase.firestore.FieldValue
                .serverTimestamp()

        };


        /* ----------------------------------------
           SAVE NEW DOCUMENT
        ---------------------------------------- */

        await newRef.set(
            newData
        );


        /* ----------------------------------------
           DELETE OLD DOCUMENT
        ---------------------------------------- */

        await db
            .collection(
                "shikshanupakarans"
            )
            .doc(
                record.id
            )
            .delete();


        /* ----------------------------------------
           UPDATE LOCAL ARRAY
        ---------------------------------------- */

        const index =
            shikshanupakaranRecords.findIndex(
                function(item) {

                    return item.id === record.id;

                }
            );


        const updatedRecord = {

            id:
                newDocumentId,

            ...newData

        };


        if(index >= 0) {

            shikshanupakaranRecords[index] =
                updatedRecord;

        }


        /* ----------------------------------------
           UPDATE CURRENT EDITOR STATE
           IF THIS RECORD IS OPEN
        ---------------------------------------- */

        if(
            currentShikshanupakaranDocumentId ===
            record.id
        ) {

            currentShikshanupakaranDocumentId =
                newDocumentId;


            currentShikshanupakaranRecord =
                updatedRecord;


            /* Update editor village title */

            const title =
                document.getElementById(
                    "shikshanupakaranEditorVillageName"
                );


            if(title) {

                title.textContent =
                    moje;

            }


            /* Update editable header */

            const mojeElement =
                document.getElementById(
                    "printMoje"
                );


            if(mojeElement) {

                mojeElement.textContent =
                    moje;

            }

        }


        /* ----------------------------------------
           REFRESH MANAGEMENT CARDS
        ---------------------------------------- */

        renderShikshanupakaranManagement();


        /* ----------------------------------------
           ACTIVITY
        ---------------------------------------- */

        await addShikshanupakaranActivity(

            "shikshanupakaran_renamed",

            "Shikshanupakaran renamed",

            `${oldVillageName} renamed to ${moje}`,

            moje

        );


        console.log(
            "Shikshanupakaran renamed:",
            record.id,
            "→",
            newDocumentId
        );


    }
    catch(error) {

        console.error(
            "Shikshanupakaran rename error:",
            error
        );


        alert(
            "Unable to rename Shikshanupakaran."
        );

    }

}


/* ============================================================
   COPY SHIKSHANUPAKARAN VILLAGE NAME
============================================================ */

async function copyShikshanupakaranRecord(record) {

    if(!record) {
        return;
    }


    const text =
        record.moje || "";


    if(!text) {
        return;
    }


    try {

        await navigator.clipboard.writeText(
            text
        );


        console.log(
            "Copied village name:",
            text
        );



    }
    catch(error) {

        console.error(
            "Copy error:",
            error
        );


        /*
            Fallback for browsers where
            clipboard API is unavailable.
        */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            text;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        document.execCommand(
            "copy"
        );


        textarea.remove();



    }

}


/* ============================================================
   DUPLICATE SHIKSHANUPAKARAN RECORD
============================================================ */

async function duplicateShikshanupakaranRecord(record) {

    if(!record || !record.id) {
        return;
    }


    const oldVillageName =
        record.moje || "";


    const year =
        record.year ||
        getCurrentShikshanupakaranYear();


    const newVillageName =
        prompt(
            "Enter village name for the duplicate:",
            `${oldVillageName} Copy`
        );


    if(newVillageName === null) {

        return;

    }


    const moje =
        newVillageName.trim();


    if(!moje) {

        alert(
            "Village name cannot be empty."
        );

        return;

    }


    const newDocumentId =
        getShikshanupakaranDocumentId(
            moje,
            year
        );


    try {

        if(
            !auth ||
            !auth.currentUser
        ) {

            alert(
                "Please login first."
            );

            return;

        }


        const newRef =
            db
            .collection(
                "shikshanupakarans"
            )
            .doc(
                newDocumentId
            );


        const existing =
            await newRef.get();


        if(existing.exists) {

            await showShikshanupakaranAlreadyExistsModal(
                  moje,
                  year
              );

            return;

        }


        /*
            Deep copy rows so the duplicate
            does not share references.
        */

        const newRows =
            Array.isArray(record.rows)
                ? JSON.parse(
                    JSON.stringify(record.rows)
                )
                : [];


        const newData = {

            type:
                "shikshanupakaran",

            moje:
                moje,

            taluka:
                record.taluka || "",

            jillo:
                record.jillo || "",

            year:
                year,

            rows:
                newRows,

            rowCount:
                newRows.length,

            userId:
                auth.currentUser.uid,

            userEmail:
                auth.currentUser.email,

            updatedAt:
                firebase.firestore.FieldValue
                .serverTimestamp()

        };


        await newRef.set(
            newData
        );


        /*
            Add new record to local array
        */

        shikshanupakaranRecords.push({

            id:
                newDocumentId,

            ...newData

        });


        /*
            Refresh management cards
        */

        renderShikshanupakaranManagement();


        await addShikshanupakaranActivity(

            "shikshanupakaran_duplicated",

            "Shikshanupakaran duplicated",

            `${oldVillageName} duplicated as ${moje}`,

            moje

        );


        console.log(
            "Shikshanupakaran duplicated:",
            newDocumentId
        );


        alert(
            `${moje} Shikshanupakaran created successfully.`
        );


    }
    catch(error) {

        console.error(
            "Shikshanupakaran duplicate error:",
            error
        );


        alert(
            "Unable to duplicate Shikshanupakaran."
        );

    }

}


/* ============================================================
   DELETE SHIKSHANUPAKARAN RECORD
============================================================ */

async function permanentlyDeleteShikshanupakaranRecord(record) {

    if(
        !record ||
        !record.id
    ){

        console.error(
            "Cannot delete Shikshanupakaran: invalid record."
        );

        return false;

    }


    const villageName =
        record.moje ||
        "this village";


    const year =
        record.year ||
        "";


    try {

        /* ========================================================
           CHECK LOGIN
        ======================================================== */

        if(
            !auth ||
            !auth.currentUser
        ){

            alert(
                "Please login first."
            );

            return false;

        }


        console.log(
            "DELETE → FIRESTORE DELETE START:",
            record.id
        );


        /* ========================================================
           DELETE EXACT FIRESTORE DOCUMENT
        ======================================================== */

        await db
            .collection(
                "shikshanupakarans"
            )
            .doc(
                record.id
            )
            .delete();


        console.log(
            "DELETE → FIRESTORE DELETE COMPLETE:",
            record.id
        );


        /* ========================================================
           REMOVE FROM LOCAL ARRAY
        ======================================================== */

        const index =
            shikshanupakaranRecords.findIndex(
                function(item) {

                    return item.id ===
                        record.id;

                }
            );


        if(index >= 0) {

            shikshanupakaranRecords.splice(
                index,
                1
            );

        }


        /* ========================================================
           CLEAR CURRENT STATE IF OPEN
        ======================================================== */

        if(
            currentShikshanupakaranDocumentId ===
            record.id
        ){

            currentShikshanupakaranDocumentId =
                null;


            currentShikshanupakaranRecord =
                null;

        }


        /* ========================================================
           REFRESH CARDS
        ======================================================== */

        renderShikshanupakaranManagement();


        /* ========================================================
           ACTIVITY
        ======================================================== */

        await addShikshanupakaranActivity(

            "shikshanupakaran_deleted",

            "Shikshanupakaran deleted",

            `${villageName} ${year} Shikshanupakaran deleted`,

            villageName

        );


        console.log(
            "Shikshanupakaran deleted:",
            record.id
        );


        return true;

    }
    catch(error) {

        console.error(
            "Shikshanupakaran delete error:",
            error
        );


        alert(
            "Unable to delete Shikshanupakaran."
        );


        return false;

    }

}




/* ============================================================
        CLOSE CARD MENUS OUTSIDE CLICK
============================================================ */


document.addEventListener(

    "click",

    function(event){


        if(
            event.target.closest(
                ".shikshanupakaranCardMenuWrapper"
            )
        ){

            return;

        }



        document
        .querySelectorAll(
            ".shikshanupakaranCardMenu.open"
        )
        .forEach(

            function(menu){

                menu.classList.remove(
                    "open"
                );

            }

        );


    }

);

/* ============================================================
        START NEW SHIKSHANUPAKARAN
============================================================ */

function startNewShikshanupakaran(){

    /*
        ============================================================
        RESET CURRENT RECORD
        ============================================================
    */

    currentShikshanupakaranRecord = null;

    currentShikshanupakaranDocumentId = null;


    /*
        ============================================================
        YEAR SELECTION
        ============================================================
    */

    const yearSelect =
        document.getElementById(
            "shikshanupakaranYear"
        );


    const currentYear =
        getCurrentShikshanupakaranYear();


    if(yearSelect){

        /*
            Populate year options only once.
        */

        if(
            yearSelect.options.length === 0
        ){

            const today =
                new Date();


            const currentCalendarYear =
                today.getFullYear();


            const startYear =
                currentCalendarYear - 2;


            const endYear =
                currentCalendarYear + 2;


            for(
                let year = startYear;
                year <= endYear;
                year++
            ){

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    `${year}-${year + 1}`;


                option.textContent =
                    `${year}-${year + 1}`;


                yearSelect.appendChild(
                    option
                );

            }

        }


        /*
            Default year for new record.
        */

        yearSelect.value =
            currentYear;

    }


    const selectedYear =
        yearSelect?.value ||
        currentYear;


    /*
        ============================================================
        UPDATE YEAR DISPLAY
        ============================================================
    */

    const editorYear =
        document.getElementById(
            "shikshanupakaranEditorYear"
        );


    if(editorYear){

        editorYear.textContent =
            selectedYear;

    }


    const printYear =
        document.getElementById(
            "printYear"
        );


    if(printYear){

        printYear.textContent =
            selectedYear;

    }


    /*
        ============================================================
        UPDATE TITLE
        ============================================================
    */

    const title =
        document.getElementById(
            "shikshanupakaranEditorVillageName"
        );


    if(title){

        title.textContent =
            "New Shikshanupakaran";

    }


    /*
        ============================================================
        CLEAR HEADER VALUES
       
        The user will enter these directly
        inside the editor.
        ============================================================
    */

    const mojeElement =
        document.getElementById(
            "printMoje"
        );


    const talukaElement =
        document.getElementById(
            "printTaluka"
        );


    const jilloElement =
        document.getElementById(
            "printJillo"
        );


    if(mojeElement){

        /*
            IMPORTANT:
            Do NOT use prompt().
            Do NOT assign `moje`.
            
            Leave the field blank so the
            user can enter the village name.
        */

        mojeElement.textContent =
            "";

    }


    if(talukaElement){

        talukaElement.textContent =
            "";

    }


    if(jilloElement){

        jilloElement.textContent =
            "";

    }


    /*
        ============================================================
        MAKE HEADER FIELDS EDITABLE
       
        This allows the user to enter:
       
        મોજે
        તાલુકો
        જિલ્લો
        ============================================================
    */

    if(mojeElement){

        mojeElement.contentEditable =
            "true";

        mojeElement
            .setAttribute(
                "data-placeholder",
                "Enter village name"
            );

    }


    if(talukaElement){

        talukaElement.contentEditable =
            "true";

    }


    if(jilloElement){

        jilloElement.contentEditable =
            "true";

    }


    /*
        ============================================================
        CLEAR OLD ROWS
        ============================================================
    */

    clearShikshanupakaranRows();


    /*
        ============================================================
        ADD FIRST EMPTY ROW
        ============================================================
    */

    addInitialShikshanupakaranRow();


    /*
        ============================================================
        OPEN EDITOR
        ============================================================
    */

    openShikshanupakaranEditor();


    /*
        ============================================================
        INITIALIZE AUTOSAVE
        ============================================================
    */

    initializeShikshanupakaranAutoSave();


    /*
        ============================================================
        DEBUG
        ============================================================
    */

    console.log(
        "NEW SHIKSHANUPAKARAN EDITOR OPENED:",
        {
            year:
                selectedYear,

            villageName:
                "",

            status:
                "WAITING FOR USER TO ENTER VILLAGE NAME"
        }
    );

}


/* ============================================================
        OPEN EDITOR
============================================================ */


function openShikshanupakaranEditor() {

    /* ============================================================
       HIDE ALL SHIKSHANUPAKARAN VIEWS
    ============================================================ */

    hideAllShikshanupakaranViews();


    /* ============================================================
       SHOW EDITOR
    ============================================================ */

    if (
        shikshanupakaranEditorViewElement
    ) {

        shikshanupakaranEditorViewElement.style.display =
            "block";

    }


    /* ============================================================
       SCROLL TO TOP
    ============================================================ */

    window.scrollTo(
        0,
        0
    );


    console.log(
        "Shikshanupakaran editor opened"
    );

}


/* ============================================================
        BACK BUTTON
============================================================ */

if(
    backToShikshanupakaranManagementButton
){

    backToShikshanupakaranManagementButton.addEventListener(

        "click",

        async function(){

            /*
             * Leaving the editor WITHOUT manual SAVE.
             *
             * IMPORTANT:
             * Do NOT clear unsaved state here.
             *
             * The unsaved row memory must survive so that
             * the management card can show the yellow dot
             * when the user returns.
             */

            await openShikshanupakaranManagement();

        }

    );

}



/* ============================================================
        ADD BUTTONS
============================================================ */


if(
    addShikshanupakaranButton
){


    addShikshanupakaranButton.addEventListener(

        "click",

        function(){


            startNewShikshanupakaran();


        }

    );


}



if(
    emptyAddShikshanupakaranButton
){


    emptyAddShikshanupakaranButton.addEventListener(

        "click",

        function(){


            startNewShikshanupakaran();


        }

    );


}

/* ============================================================
        SHIKSHANUPAKARAN EDITOR SYSTEM
        ROW MANAGEMENT
============================================================ */


/* ============================================================
        ELEMENT REFERENCES
============================================================ */


const shikshanupakaranBody =
    document.getElementById(
        "shikshanupakaranBody"
    );


const addShikshanupakaranRowButton =
    document.getElementById(
        "addShikshanupakaranRow"
    );



const saveShikshanupakaranButton =
    document.getElementById(
        "saveShikshanupakaranButton"
    );


const printShikshanupakaranButton =
    document.getElementById(
        "printShikshanupakaranButton"
    );


/* ============================================================
        SHIKSHANUPAKARAN PRINT
============================================================ */

/* ============================================================
   SHIKSHANUPAKARAN PRINT PREPARATION
   EXACT EDITOR LOOK
   20 USER ROWS PER PAGE
   LAST ACTION / DELETE COLUMN HIDDEN
============================================================ */

function prepareShikshanupakaranPrint(sourceRows) {

    const table =
        document.getElementById(
            "shikshanupakaranTable"
        );

    const container =
        document.getElementById(
            "shikshanupakaranPrintContainer"
        );


    if (
        !table ||
        !container
    ) {

        console.warn(
            "Shikshanupakaran print elements not found."
        );

        return;

    }


    /*
        ========================================================
        REMOVE OLD PRINT PAGES
        ========================================================
    */

    container
        .querySelectorAll(
            ".shikshanupakaranPrintPage"
        )
        .forEach(function(page) {

            page.remove();

        });


    /*
        ========================================================
        GET ALL ROW DATA
        --------------------------------------------------------
        IMPORTANT:
        Pagination renders only 20 rows into the editor DOM.

        Therefore PRINT MUST NOT read rows from tbody.

        Use the complete in-memory dataset instead.
        ========================================================
    */

    let printRows = [];


    /*
        --------------------------------------------------------
        1. EXPLICIT SOURCE ROWS
        --------------------------------------------------------
    */

    if (
        Array.isArray(sourceRows)
    ) {

        printRows =
            sourceRows;

    }


    /*
        --------------------------------------------------------
        2. FALLBACK TO COMPLETE MEMORY DATA
        --------------------------------------------------------
    */

    else if (
        Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        printRows =
            window.shikshanupakaranAllRows;

    }


    /*
        --------------------------------------------------------
        3. FINAL SAFETY FALLBACK
        --------------------------------------------------------
        This should normally never be needed, but preserves
        compatibility if the function is called elsewhere.
        --------------------------------------------------------
    */

    else {

        const tbody =
            document.getElementById(
                "shikshanupakaranBody"
            );


        if (tbody) {

            printRows =
                Array.from(
                    tbody.querySelectorAll(
                        "tr.shikshanupakaranRow"
                    )
                );

        }

    }


    /*
        ========================================================
        NORMALIZE
        ========================================================
    */

    printRows =
        Array.isArray(printRows)
            ? printRows
            : [];


    console.log(
        "SHIKSHANUPAKARAN PRINT ROW DATA:",
        {
            totalRows:
                printRows.length,

            editorCurrentPage:
                window.shikshanupakaranCurrentPage,

            editorTotalPages:
                window.shikshanupakaranTotalPages,

            source:
                Array.isArray(sourceRows)
                    ? "sourceRows"
                    : "window.shikshanupakaranAllRows"
        }
    );


    /*
        ========================================================
        EXACTLY 20 DATA ROWS PER PRINT PAGE
        ========================================================
    */

    const rowsPerPage = 20;


    /*
        ========================================================
        EMPTY RECORD
        ========================================================
    */

    if (
        printRows.length === 0
    ) {

        createShikshanupakaranPrintPage(
            [],
            1,
            container,
            table
        );

        return;

    }


    /*
        ========================================================
        CALCULATE TOTAL PRINT PAGES
        ========================================================
    */

    const totalPages =
        Math.ceil(
            printRows.length /
            rowsPerPage
        );


    console.log(
        "SHIKSHANUPAKARAN PRINT PAGES:",
        {
            totalRows:
                printRows.length,

            rowsPerPage:
                rowsPerPage,

            totalPages:
                totalPages
        }
    );


    /*
        ========================================================
        CREATE EVERY PRINT PAGE
        ========================================================
    */

    for (
        let pageNumber = 0;
        pageNumber < totalPages;
        pageNumber++
    ) {

        const start =
            pageNumber *
            rowsPerPage;


        const end =
            Math.min(
                start + rowsPerPage,
                printRows.length
            );


        const pageRows =
            printRows.slice(
                start,
                end
            );


        console.log(
            "SHIKSHANUPAKARAN PRINT PAGE:",
            {
                page:
                    pageNumber + 1,

                start:
                    start,

                end:
                    end,

                rows:
                    pageRows.length
            }
        );


        createShikshanupakaranPrintPage(
            pageRows,
            pageNumber + 1,
            container,
            table
        );

    }

}




/* ============================================================
   CREATE ONE SHIKSHANUPAKARAN PRINT PAGE
   SAME STRUCTURE AS EDITOR
   ACTION / DELETE COLUMN REMOVED
============================================================ */

function createShikshanupakaranPrintPage(
    sourceRows,
    pageNumber,
    container,
    originalTable
){

    /*
        ========================================================
        CREATE PRINT PAGE
        ========================================================
    */

    const page =
        document.createElement("div");


    page.className =
        "shikshanupakaranPrintPage";


    page.dataset.page =
        pageNumber;


    /*
        ========================================================
        PRINT HEADER
        --------------------------------------------------------
        Keep the existing:
        મોજે / તાલુકા / જિલ્લો / વર્ષ
        ========================================================
    */

    const infoPanel =
        document.querySelector(
            ".shikshanupakaranInfoPanel"
        );


    if(infoPanel){

        const printInfoPanel =
            infoPanel.cloneNode(true);


        printInfoPanel.classList.add(
            "shikshanupakaranPrintInfoPanel"
        );


        /*
            Convert form controls to plain
            printable text.
        */

        printInfoPanel
            .querySelectorAll(
                "textarea, input, select"
            )
            .forEach(function(element){

                const value =
                    element.value || "";


                const span =
                    document.createElement(
                        "span"
                    );


                span.className =
                    "shikshanupakaranPrintInfoValue";


                span.textContent =
                    value;


                element.replaceWith(
                    span
                );

            });


        page.appendChild(
            printInfoPanel
        );

    }


    /*
        ========================================================
        CLONE TABLE STRUCTURE
        ========================================================
    */

    const printTable =
        originalTable.cloneNode(true);


    printTable.removeAttribute("id");


    printTable.classList.add(
        "shikshanupakaranPrintTable"
    );


    /*
        ========================================================
        REMOVE PRINT-HIDDEN ELEMENTS
        ========================================================
    */

    printTable
        .querySelectorAll(
            ".printHide"
        )
        .forEach(function(element){

            element.remove();

        });


    /*
        ========================================================
        REMOVE FIRST TABLE HEADER ROW
        --------------------------------------------------------
        This is the row containing:
        ગામના નમૂના નંબર : ૮(ક) શિક્ષણ ઉપકર
        ========================================================
    */

    const topInfoRow =
        printTable.querySelector(
            "thead .shikshanupakaranTopInfoRow"
        );


    if(topInfoRow){

        topInfoRow.remove();

    }


    /*
        ========================================================
        GET PRINT TBODY
        ========================================================
    */

    const printTbody =
        printTable.querySelector(
            "tbody"
        );


    if(!printTbody){

        console.error(
            "Print tbody not found."
        );

        return;

    }


    /*
        ========================================================
        REMOVE EDITOR ROWS
        ========================================================
    */

    printTbody.innerHTML = "";


    /*
        ========================================================
        GET CURRENT EDITOR ROW AS STRUCTURE TEMPLATE
        ========================================================
    */

    const editorTbody =
        document.getElementById(
            "shikshanupakaranBody"
        );


    const templateRow =
        editorTbody
            ? editorTbody.querySelector(
                "tr.shikshanupakaranRow"
            )
            : null;


    /*
        ========================================================
        COLUMN DEFINITIONS
        ========================================================
    */

    const columns = [
        "A","B","C","D","E",
        "F","G","H","I","J",
        "K","L","M","N","O",
        "P","Q","R","S"
    ];


    /*
        ========================================================
        ADD ROWS
        ========================================================
    */

    sourceRows.forEach(function(
        rowData,
        rowIndex
    ){

        /*
            ----------------------------------------------------
            SAFETY
            ----------------------------------------------------
        */

        if(
            !rowData ||
            typeof rowData !== "object"
        ){

            return;

        }


        /*
            ----------------------------------------------------
            CREATE ROW FROM EXISTING STRUCTURE
            ----------------------------------------------------
        */

        let clonedRow = null;


        if(templateRow){

            clonedRow =
                templateRow.cloneNode(true);

        }
        else{

            /*
                Fallback
            */

            clonedRow =
                document.createElement(
                    "tr"
                );


            clonedRow.className =
                "shikshanupakaranRow";


            columns.forEach(function(col){

                const td =
                    document.createElement(
                        "td"
                    );


                const input =
                    document.createElement(
                        "input"
                    );


                input.type =
                    "text";


                input.className =
                    "shikshanupakaranInput";


                input.dataset.column =
                    col;


                td.appendChild(
                    input
                );


                clonedRow.appendChild(
                    td
                );

            });

        }


        /*
            ----------------------------------------------------
            REMOVE ACTION CELL
            ----------------------------------------------------
        */

        const actionCell =
            clonedRow.querySelector(
                ".shikshanupakaranActionCell"
            );


        if(actionCell){

            actionCell.remove();

        }


        /*
            ----------------------------------------------------
            REMOVE R / S
            ----------------------------------------------------
        */

        clonedRow
            .querySelectorAll(
                'input[data-column="R"], input[data-column="S"]'
            )
            .forEach(function(input){

                const cell =
                    input.closest("td");


                if(cell){

                    cell.remove();

                }

            });


        /*
            ====================================================
            PUT MEMORY DATA INTO PRINT ROW
            ====================================================
        */

        clonedRow
            .querySelectorAll(
                "input[data-column]"
            )
            .forEach(function(input){

                const column =
                    input.dataset.column;


                if(!column){

                    return;

                }


                /*
                    IMPORTANT:
                    Preserve 0.
                */

                const value =
                    rowData[column] !== undefined &&
                    rowData[column] !== null
                        ? rowData[column]
                        : "";


                const td =
                    input.closest("td");


                if(td){

                    td.textContent =
                        String(value);

                }

            });


        /*
            ----------------------------------------------------
            REMOVE REMAINING BUTTONS
            ----------------------------------------------------
        */

        clonedRow
            .querySelectorAll("button")
            .forEach(function(button){

                button.remove();

            });


        /*
            ----------------------------------------------------
            APPEND PRINT ROW
            ----------------------------------------------------
        */

        printTbody.appendChild(
            clonedRow
        );


        console.log(
            "PRINT ROW CREATED:",
            {
                page:
                    pageNumber,

                row:
                    rowIndex + 1,

                columns:
                    columns.length
            }
        );

    });


    /*
        ========================================================
        ADD TABLE
        ========================================================
    */

    page.appendChild(
        printTable
    );


    /*
        ========================================================
        PAGE NUMBER
        ========================================================
    */

    const pageNumberElement =
        document.createElement(
            "div"
        );


    pageNumberElement.className =
        "shikshanupakaranPrintPageNumber";


    pageNumberElement.textContent =
        `Page ${pageNumber}`;


    /*
        ========================================================
        PAGE FOOTER
        ========================================================
    */

    const pageFooter =
        document.createElement(
            "div"
        );


    pageFooter.className =
        "shikshanupakaranPrintFooter";


    pageFooter.appendChild(
        pageNumberElement
    );


    page.appendChild(
        pageFooter
    );


    /*
        ========================================================
        DEBUG
        ========================================================
    */

    console.log(
        "SHIKSHANUPAKARAN PRINT PAGE CREATED:",
        {
            page:
                pageNumber,

            rows:
                printTbody.querySelectorAll(
                    "tr.shikshanupakaranRow"
                ).length
        }
    );


    /*
        ========================================================
        ADD PAGE TO PRINT CONTAINER
        ========================================================
    */

    container.appendChild(
        page
    );

}



if(printShikshanupakaranButton){

    printShikshanupakaranButton.addEventListener(

        "click",

        async function(){

            window.shikshanupakaranIsPrinting = true;

            console.log(
                "SHIKSHANUPAKARAN PRINT START"
            );

            /*
                ----------------------------------------
                STOP PENDING AUTOSAVE TIMER
                ----------------------------------------
            */

            if(window.shikshanupakaranAutoSaveTimer){

                clearTimeout(
                    window.shikshanupakaranAutoSaveTimer
                );

                window.shikshanupakaranAutoSaveTimer =
                    null;

            }


            /*
                ----------------------------------------
                WAIT FOR ANY CURRENT AUTOSAVE
                TO FINISH
                ----------------------------------------
            */

            while(window.shikshanupakaranIsSaving){

                await new Promise(
                    function(resolve){

                        setTimeout(
                            resolve,
                            50
                        );

                    }
                );

            }


    

            /*
                  ----------------------------------------
                  PREPARE PRINT PAGES
                  BEFORE SAVE RE-RENDERS THE EDITOR
                  ----------------------------------------
              */
              
              prepareShikshanupakaranPrint();
              
              
            /*
                ----------------------------------------
                GET PRINT CONTAINER
                ----------------------------------------
            */

            const printContainer =
                document.getElementById(
                    "shikshanupakaranPrintContainer"
                );


            if(!printContainer){

                console.error(
                    "Shikshanupakaran print container not found."
                );

                window.shikshanupakaranIsPrinting = false;

                return;

            }


            /*
                ----------------------------------------
                CREATE TEMPORARY IFRAME
                ----------------------------------------
            */

            const iframe =
                document.createElement(
                    "iframe"
                );


            iframe.style.position =
                "fixed";

            iframe.style.right =
                "0";

            iframe.style.bottom =
                "0";

            iframe.style.width =
                "0";

            iframe.style.height =
                "0";

            iframe.style.border =
                "0";


            document.body.appendChild(
                iframe
            );


            /*
                ----------------------------------------
                GET IFRAME DOCUMENT
                ----------------------------------------
            */

            const iframeDocument =
                iframe.contentDocument ||
                iframe.contentWindow.document;


            /*
                ----------------------------------------
                COPY PRINT CSS
                ----------------------------------------
            */

            const printStyles =
                Array.from(
                    document.querySelectorAll(
                        'style[data-shikshanupakaran-print]'
                    )
                )
                .map(function(style){

                    return style.outerHTML;

                })
                .join("");


            iframe.onload =
            function(){

                setTimeout(
                    function(){

                        iframe.contentWindow.focus();

                        iframe.contentWindow.print();


                        setTimeout(
                            function(){

                                iframe.remove();

                            },
                            500
                        );

                    },
                    300
                );

            };


            iframeDocument.open();
            
            const printPages =
                Array.from(
                    printContainer.querySelectorAll(
                        ".shikshanupakaranPrintPage"
                    )
                );
            
            
            console.log(
                "FINAL PRINT PAGE COUNT:",
                printPages.length
            );
            
            
            printPages.forEach(function(page, index){
            
                console.log(
                    "FINAL PRINT PAGE SIZE:",
                    {
                        page: index + 1,
            
                        height:
                            page.offsetHeight,
            
                        scrollHeight:
                            page.scrollHeight,
            
                        width:
                            page.offsetWidth,
            
                        rows:
                            page.querySelectorAll(
                                "tbody tr"
                            ).length
                    }
                );
            
            });
            
            
            iframeDocument.write(`
            <!DOCTYPE html>
            
            <html>
            
            <head>
            
                <meta charset="UTF-8">
            
                <title>
                    Shikshanupakaran Print
                </title>
            
                ${printStyles}
            
            </head>
            
            <body>
            
                ${printPages
                    .map(function(page){
            
                        return page.outerHTML;
            
                    })
                    .join("")}
            
            </body>
            
            </html>
            `);

            iframeDocument.close();

        }

    );

}



/* ============================================================
        CLEAR ROWS
============================================================ */


function clearShikshanupakaranRows(){


    if(!shikshanupakaranBody){

        return;

    }


    shikshanupakaranBody.innerHTML =
        "";

}

function roundGeneratedValueToFivePaise(value) {

    const number =
        Number(value) || 0;


    /*
        Round UP to nearest 0.05

        2.23  → 2.25
        4.54  → 4.55
        756.56 → 756.60
    */

    const rounded =
        Math.ceil(
            (number - 1e-10) / 0.05
        ) * 0.05;


    return Number(
        rounded.toFixed(2)
    );

}

/* ============================================================
   CREATE SHIKSHANUPAKARAN FROM TALAPATRAK
============================================================ */


async function createShikshanupakaranFromTalapatrak(
    talapatrakData
){

    console.log(
        "================================================"
    );

    console.log(
        "TALAPATRAK → SHIKSHANUPAKARAN SYNC"
    );

    console.log(
        "================================================"
    );


    try{

        /* ========================================================
           LOGIN
        ======================================================== */

        if(
            !auth ||
            !auth.currentUser
        ){

            console.warn(
                "SYNC SKIPPED → USER NOT LOGGED IN"
            );

            return false;

        }


        /* ========================================================
           EXACT TALAPATRAK DATA

           IMPORTANT:
           NEVER use current year here.

           The Talapatrak's own village + year
           determines the Shikshanupakaran card.
        ======================================================== */

        const moje =
            String(
                talapatrakData?.moje || ""
            ).trim();


        const taluka =
            String(
                talapatrakData?.taluka || ""
            ).trim();


        const jillo =
            String(
                talapatrakData?.jillo || ""
            ).trim();


        const year =
            String(
                talapatrakData?.year || ""
            ).trim();


        const talapatrakRows =
            Array.isArray(
                talapatrakData?.rows
            )
                ? talapatrakData.rows
                : [];


        if(
            !moje ||
            !year
        ){

            console.warn(
                "SYNC SKIPPED → VILLAGE OR YEAR MISSING"
            );

            return false;

        }


        /* ========================================================
           SHIKSHANUPAKARAN DOCUMENT

           SAME VILLAGE + SAME YEAR
        ======================================================== */

        const documentId =
            getShikshanupakaranDocumentId(
                moje,
                year
            );


        const shikshanupakaranRef =
            db
                .collection(
                    "shikshanupakarans"
                )
                .doc(
                    documentId
                );


        let snapshot =
            await shikshanupakaranRef.get();


      
        /* ========================================================
        CARD DOES NOT EXIST

        TALAPATRAK → SHIKSHANUPAKARAN

        DECISIONS:
            yes      → sync automatically in future
            not_now  → skip this save, ask again next manual save
            never    → permanently do not sync
        ======================================================== */

        if (
            !snapshot.exists
        ) {

            const decisionKey =
                "talapatrakToShikshanupakaran_" +
                moje.toLowerCase() +
                "::" +
                year;


            const previousDecision =
                localStorage.getItem(
                    decisionKey
                );


            /* ====================================================
            USER PREVIOUSLY APPROVED

            Automatically sync.
            ==================================================== */

            if (
                previousDecision ===
                "yes"
            ) {

                console.log(
                    "SYNC APPROVED PREVIOUSLY → AUTO SYNC:",
                    {
                        moje,
                        year
                    }
                );

            }


            /* ====================================================
            USER PREVIOUSLY SAID NEVER

            Never ask again.
            ==================================================== */

            else if (
                previousDecision ===
                "never"
            ) {

                console.log(
                    "SYNC PERMANENTLY DECLINED:",
                    {
                        moje,
                        year
                    }
                );

                return false;

            }


            /* ====================================================
            USER SAID NOT NOW

            IMPORTANT:

            Do NOT store "not_now" as a permanent block.

            We ask again on the next MANUAL SAVE.
            ==================================================== */

            else {

                const decision =
                    await showShikshanupakaranCreateModal(
                        moje,
                        year
                    );


                console.log(
                    "TALAPATRAK → SHIKSHANUPAKARAN USER DECISION:",
                    {
                        moje,
                        year,
                        decision
                    }
                );


                /* ====================================================
                SYNC & SAVE
                ==================================================== */

                if (
                    decision ===
                    "yes"
                ) {

                    localStorage.setItem(
                        decisionKey,
                        "yes"
                    );


                    console.log(
                        "USER APPROVED SYNC:",
                        {
                            moje,
                            year
                        }
                    );

                }


                /* ====================================================
                NEVER
                ==================================================== */

                else if (
                    decision ===
                    "never"
                ) {

                    localStorage.setItem(
                        decisionKey,
                        "never"
                    );


                    console.log(
                        "USER SELECTED NEVER:",
                        {
                            moje,
                            year
                        }
                    );


                    return false;

                }


                /* ====================================================
                NOT NOW

                Do NOT save a permanent decision.

                Next manual Save will ask again.
                ==================================================== */

                else if (
                    decision ===
                    "not_now"
                ) {

                    console.log(
                        "USER SELECTED NOT NOW:",
                        {
                            moje,
                            year
                        }
                    );


                    return false;

                }


                /* ====================================================
                SAFETY FALLBACK
                ==================================================== */

                else {

                    console.warn(
                        "UNKNOWN SYNC DECISION:",
                        decision
                    );


                    return false;

                }

            }

        }


        /* ========================================================
           RE-CHECK DOCUMENT

           Important when user previously approved creation.
        ======================================================== */

        snapshot =
            await shikshanupakaranRef.get();


        /* ========================================================
             BUILD SHIKSHANUPAKARAN ROWS
          
             TALAPATRAK → SHIKSHANUPAKARAN
          
             SYNC:
                 Talapatrak A → Shikshanupakaran A
                 Talapatrak B → Shikshanupakaran B
          
             IMPORTANT:
                 Preserve all other existing Shikshanupakaran
                 columns.
          
             Row mapping is by exact row position:
          
                 Talapatrak row 0 → Shik row 0
                 Talapatrak row 1 → Shik row 1
                 etc.
          ======================================================== */
          
          const existingShikshanupakaran =
              snapshot.exists
                  ? snapshot.data() || {}
                  : {};
          
          
          const existingShikRows =
              Array.isArray(
                  existingShikshanupakaran.rows
              )
                  ? existingShikshanupakaran.rows
                  : [];
          
          
          const synchronizedRows =
              talapatrakRows.map(
                  function(
                      talapatrakRow,
                      index
                  ){
          
                      const existingShikRow =
                          existingShikRows[index] || {};
          
          
                      /* ====================================================
                         TALAPATRAK VALUES
                      ==================================================== */
          
                      const talapatrakD =
                            Number(
                                convertGujaratiDigitsToEnglish(
                                    talapatrakRow?.D ?? ""
                                )
                            ) || 0;


                        const talapatrakE =
                            Number(
                                convertGujaratiDigitsToEnglish(
                                    talapatrakRow?.E ?? ""
                                )
                            ) || 0;
          
          
                      /* ====================================================
                         SHIKSHANUPAKARAN E
          
                         E = 20% of (Talapatrak D + Talapatrak E)
                      ==================================================== */
          
                      const shikshanupakaranE =
                            roundGeneratedValueToFivePaise(
                                (
                                    talapatrakD +
                                    talapatrakE
                                ) * 0.20
                            );
          
          
                      /* ====================================================
                         CREATE SYNCED ROW
                      ==================================================== */
          
                      const syncedRow = {
          
                          /*
                              Preserve existing Shikshanupakaran data
                          */
                          ...existingShikRow,
          
          
                          /*
                              ================================================
                              A SYNC
                              Talapatrak A → Shik A
                              ================================================
                          */
          
                          A:
                              talapatrakRow?.A ??
                              "",
          
          
                          /*
                              ================================================
                              B SYNC
                              Talapatrak B → Shik B
                              ================================================
                          */
          
                          B:
                              talapatrakRow?.B ??
                              "",
          
          
                          /*
                                ================================================
                                E CALCULATION
                                20% of Talapatrak D + E

                                IMPORTANT:
                                If Shikshanupakaran E already exists,
                                preserve the user's editable value.

                                Otherwise generate E from Talapatrak.
                                ================================================
                            */

                            E:
                                convertToGujaratiDigits(
                                    shikshanupakaranE.toFixed(2)
                                )
          
                      };
          
          
                      console.log(
                          "TALAPATRAK → SHIK CALCULATION:",
                          {
                              row:
                                  index,
          
                              talapatrakD:
                                  talapatrakD,
          
                              talapatrakE:
                                  talapatrakE,
          
                              shikshanupakaranE:
                                  shikshanupakaranE
                                      .toFixed(2)
                          }
                      );
          
          
                      return syncedRow;
          
                  }
              );
          
          
          console.log(
              "SYNC → TALAPATRAK A/B → SHIKSHANUPAKARAN"
          );
          
          
          console.log(
              "SYNC → FIRST TALAPATRAK ROW:",
              talapatrakRows[0]
          );
          
          
          console.log(
              "SYNC → FIRST SHIKSHANUPAKARAN ROW:",
              synchronizedRows[0]
          );


        console.log(
            "SYNC → TALAPATRAK ROW COUNT:",
            talapatrakRows.length
        );


        console.log(
            "SYNC → SHIKSHANUPAKARAN ROW COUNT:",
            synchronizedRows.length
        );


        /* ========================================================
           SAFETY CHECK

           These MUST always be identical.
        ======================================================== */

        if(
            synchronizedRows.length !==
            talapatrakRows.length
        ){

            console.error(
                "SYNC ABORTED → ROW COUNT MISMATCH"
            );

            return false;

        }


        /* ========================================================
           SAVE / SYNC SHIKSHANUPAKARAN

           THIS FUNCTION IS ONLY CALLED AFTER
           TALAPATRAK SAVE.
        ======================================================== */

        const data = {

            type:
                "shikshanupakaran",

            moje:
                moje,

            taluka:
                taluka,

            jillo:
                jillo,

            year:
                year,

            rows:
                synchronizedRows,

            rowCount:
                synchronizedRows.length,

            userId:
                auth.currentUser.uid,

            userEmail:
                auth.currentUser.email,

            updatedAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        };


        await shikshanupakaranRef.set(
            data,
            {
                merge:
                    true
            }
        );


        console.log(
            "TALAPATRAK → SHIKSHANUPAKARAN SYNC COMPLETE:",
            documentId
        );


        console.log(
            "SYNC → FINAL ROW COUNT:",
            synchronizedRows.length
        );


        return true;

    }


    catch(error){

        console.error(
            "TALAPATRAK → SHIKSHANUPAKARAN SYNC ERROR:",
            error
        );

        return false;

    }

}


/* ============================================================
   ADD ROW
============================================================ */

if (
    addShikshanupakaranRowButton
) {

    addShikshanupakaranRowButton.addEventListener(
        "click",
        function() {

            /*
                ====================================================
                SAVE CURRENT PAGE INTO MASTER MEMORY
                ====================================================
            */

            syncCurrentShikshanupakaranPageToMemory();


            /*
                ====================================================
                ADD NEW ROW AT THE END
                ====================================================
                
                The new row gets its correct global
                serial number immediately.
            */

            const newRowNumber =
                window.shikshanupakaranAllRows.length + 1;


            window.shikshanupakaranAllRows.push({

                A:
                    newRowNumber,

                B:
                    "",

                C:
                    "",

                D:
                    "",

                E:
                    "",

                F:
                    "",

                G:
                    "0.00",

                H:
                    "",

                I:
                    "",

                J:
                    "",

                K:
                    "",

                L:
                    "",

                M:
                    "0.00",

                N:
                    "0.00",

                O:
                    "0.00",

                P:
                    "0.00",

                Q:
                    "",

                R:
                    "0.00",

                S:
                    "0.00",

                T:
                    ""

            });


            /*
                ====================================================
                SAFETY: RE-NUMBER ALL MASTER ROWS
                ====================================================
                
                This guarantees Column A is always:
                
                1
                2
                3
                ...
                n
            */

            window.shikshanupakaranAllRows.forEach(
                function(rowData, index) {

                    if(
                        rowData &&
                        typeof rowData === "object"
                    ) {

                        rowData.A =
                            index + 1;

                    }

                }
            );


            /*
                ====================================================
                RECALCULATE TOTAL PAGES
                ====================================================
            */

            const rowsPerPage =
                Number(
                    window.shikshanupakaranRowsPerPage
                ) || 20;


            window.shikshanupakaranTotalPages =
                Math.max(
                    1,
                    Math.ceil(
                        window.shikshanupakaranAllRows.length /
                        rowsPerPage
                    )
                );


            /*
                ====================================================
                GO TO LAST PAGE
                ====================================================
            */

            renderShikshanupakaranPage(
                window.shikshanupakaranTotalPages
            );


            /*
                ====================================================
                FOCUS NEW ROW
                ====================================================
            */

            const lastRow =
                shikshanupakaranBody.querySelector(
                    ".shikshanupakaranRow:last-child"
                );


            const firstInput =
                lastRow?.querySelector(
                    "input:not([readonly])"
                );


            if(firstInput){

                firstInput.focus();

                firstInput.select();

            }


            /*
                ====================================================
                TOTAL IS NOW STALE
                ====================================================
            */

            window.shikshanupakaranTotalGenerated =
                false;


            window.shikshanupakaranTotals =
                null;


            /*
                ====================================================
                AUTOSAVE
                ====================================================
            */

            scheduleShikshanupakaranAutoSave();

        }
    );

}


  
/* ============================================================
        SHIKSHANUPAKARAN SAVE SYSTEM
============================================================ */

/* ============================================================
        DYNAMIC FINANCIAL YEAR
        YEAR CHANGES EVERY 1 AUGUST
============================================================ */

function getCurrentShikshanupakaranYear() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        today.getMonth();

    if (month >= 7) {

        return `${year}-${year + 1}`;

    }

    return `${year - 1}-${year}`;

}


/* ============================================================
        GET PREVIOUS YEAR
============================================================ */

function getPreviousShikshanupakaranYear(year) {

    const startYear =
        Number(
            String(year)
                .split("-")[0]
        );

    return `${startYear - 1}-${startYear}`;

}


/* ============================================================
   POPULATE SHIKSHANUPAKARAN YEAR OPTIONS
============================================================ */

function populateShikshanupakaranYearOptions(
    selectedYear
) {

    const yearSelect =
        document.getElementById(
            "shikshanupakaranYear"
        );


    if (!yearSelect) {

        return;

    }


    const currentYear =
        getCurrentShikshanupakaranYear();


    const currentStartYear =
        Number(
            currentYear.split("-")[0]
        );


    /*
       Provide a small range of financial years.

       The user can manually select the required year.
    */

    const years = [];


    for (
        let year = currentStartYear - 5;
        year <= currentStartYear + 5;
        year++
    ) {

        years.push(
            `${year}-${year + 1}`
        );

    }


    yearSelect.innerHTML = "";


    years.forEach(
        function(year) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                year;


            option.textContent =
                year;


            yearSelect.appendChild(
                option
            );

        }
    );


    /*
       Select the record's year when opening
       an existing record.
    */

    if (
        selectedYear &&
        years.includes(selectedYear)
    ) {

        yearSelect.value =
            selectedYear;

    }
    else {

        yearSelect.value =
            currentYear;

    }


    /*
       Keep printYear synchronized if
       something else still uses it.
    */

    updateShikshanupakaranYearDisplay(
        yearSelect.value
    );

}


/* ============================================================
   UPDATE SHIKSHANUPAKARAN YEAR DISPLAY
============================================================ */

function updateShikshanupakaranYearDisplay(
    year
) {

    const yearSelect =
        document.getElementById(
            "shikshanupakaranYear"
        );


    if (
        yearSelect &&
        year
    ) {

        yearSelect.value =
            year;

    }


    const printYear =
        document.getElementById(
            "printYear"
        );


    if (printYear) {

        /*
           If printYear exists elsewhere,
           keep it synchronized.
        */

        printYear.textContent =
            year || "";

    }

}



/* ============================================================
        DOCUMENT ID
============================================================ */


function getShikshanupakaranDocumentId(
    moje,
    year
){


    return `${moje}_${year}`;

}


/* ============================================================
        SAVE FUNCTION
============================================================ */

async function saveShikshanupakaran(
    showMessage = true
){

    shikshanupakaranSaveAttemptCount++;

    console.log(
        "========================================"
    );

    console.log(
        "SAVE ATTEMPT:",
        shikshanupakaranSaveAttemptCount
    );

    console.log(
        "Manual Save:",
        showMessage
    );

    console.log(
        "Is Saving:",
        window.shikshanupakaranIsSaving
    );

    console.log(
        "========================================"
    );


    try{

        /* ========================================================
           CHECK LOGIN
        ======================================================== */

        if(
            !auth ||
            !auth.currentUser
        ){

            if(showMessage){

                alert(
                    "Please login first."
                );

            }

            return false;

        }


        /* ========================================================
           GET EDITOR INPUTS
           
           THESE ARE THE SOURCE OF TRUTH.
           
           User enters:
           
           #shikshanupakaranMoje
           #shikshanupakaranTaluka
           #shikshanupakaranJillo
        ======================================================== */

        const mojeInput =
            document.getElementById(
                "shikshanupakaranMoje"
            );


        const talukaInput =
            document.getElementById(
                "shikshanupakaranTaluka"
            );


        const jilloInput =
            document.getElementById(
                "shikshanupakaranJillo"
            );


        const moje =
            String(
                mojeInput?.value ||
                ""
            ).trim();


        const taluka =
            String(
                talukaInput?.value ||
                ""
            ).trim();


        const jillo =
            String(
                jilloInput?.value ||
                ""
            ).trim();


        console.log(
            "SHIKSHANUPAKARAN EDITOR HEADER:",
            {
                mojeInputExists:
                    !!mojeInput,

                talukaInputExists:
                    !!talukaInput,

                jilloInputExists:
                    !!jilloInput,

                moje,
                taluka,
                jillo
            }
        );


        /* ========================================================
           VILLAGE NAME SAFETY CHECK
        ======================================================== */

        if(!moje){

            console.warn(
                "SHIKSHANUPAKARAN SAVE BLOCKED → VILLAGE NAME EMPTY"
            );


            if(showMessage){

                alert(
                    "Please enter મોજે."
                );

            }


            /*
                IMPORTANT:

                Do NOT continue.
                Do NOT create a document with
                an empty village name.
            */

            if(mojeInput){

                mojeInput.focus();

            }


            return false;

        }


        /* ========================================================
           SYNCHRONIZE PRINT HEADER
           
           Print elements are DISPLAY ONLY.
        ======================================================== */

        const printMoje =
            document.getElementById(
                "printMoje"
            );


        const printTaluka =
            document.getElementById(
                "printTaluka"
            );


        const printJillo =
            document.getElementById(
                "printJillo"
            );


        if(printMoje){

            printMoje.textContent =
                moje;

        }


        if(printTaluka){

            printTaluka.textContent =
                taluka;

        }


        if(printJillo){

            printJillo.textContent =
                jillo;

        }


        /* ========================================================
           YEAR
        ======================================================== */

        const yearSelect =
            document.getElementById(
                "shikshanupakaranYear"
            );


        const year =
            yearSelect?.value ||
            currentShikshanupakaranRecord?.year ||
            getCurrentShikshanupakaranYear();


        /* ========================================================
           ORIGINAL DOCUMENT ID
        ======================================================== */

        const originalDocumentId =
            currentShikshanupakaranDocumentId;


        /* ========================================================
           NEW DOCUMENT ID
        ======================================================== */

        const documentId =
            getShikshanupakaranDocumentId(
                moje,
                year
            );


        /* ========================================================
           DETECT YEAR / DOCUMENT CHANGE
        ======================================================== */

        const documentIdChanged =
            !!originalDocumentId &&
            originalDocumentId !== documentId;


        console.log(
            "ORIGINAL DOCUMENT ID:",
            originalDocumentId
        );


        console.log(
            "NEW DOCUMENT ID:",
            documentId
        );


        console.log(
            "DOCUMENT ID CHANGED:",
            documentIdChanged
        );


        /*
            ========================================================
            SAVE BUTTON → SYNC CURRENT TABLE TO MEMORY
            ========================================================
        */
        
        syncCurrentShikshanupakaranPageToMemory();
        
        
        /*
            ========================================================
            NOW COLLECT ALL ROWS
            ========================================================
        */
        
        const rows =
            collectShikshanupakaranRows();


        /* ========================================================
           SAVE SIGNATURE
        ======================================================== */

        const saveSignature =
            getShikshanupakaranSaveSignature(
                moje,
                taluka,
                jillo,
                year,
                rows
            );


        console.log(
            "CURRENT SAVE SIGNATURE:",
            saveSignature
        );


        console.log(
            "LAST SAVED SIGNATURE:",
            shikshanupakaranLastSavedSignature
        );


        /* ========================================================
           SAME DATA ALREADY SAVED
        ======================================================== */

        if(
            shikshanupakaranLastSavedSignature ===
            saveSignature
        ){

            shikshanupakaranSkippedSaveCount++;

            console.log(
                "🟡 SAVE SKIPPED — NOTHING CHANGED"
            );

            console.log(
                "Skipped save count:",
                shikshanupakaranSkippedSaveCount
            );

            return true;

        }


        /* ========================================================
           YEAR CHANGE SAFETY CHECK
        ======================================================== */

        if(
            documentIdChanged
        ){

            const existingNewRecord =
                await db
                    .collection(
                        "shikshanupakarans"
                    )
                    .doc(
                        documentId
                    )
                    .get();


            if(
                existingNewRecord.exists
            ){

                console.warn(
                    "YEAR CHANGE BLOCKED — DESTINATION RECORD ALREADY EXISTS:",
                    documentId
                );


                if(showMessage){

                    alert(
                        `${moje} માટે ${year} નું Shikshanupakaran પહેલેથી અસ્તિત્વમાં છે.`
                    );

                }


                return false;

            }

        }


        /* ========================================================
           DETERMINE WHETHER THIS IS NEW
        ======================================================== */

        const wasExistingRecord =
            !!currentShikshanupakaranRecord;


        /* ========================================================
           DATA
        ======================================================== */

        const data = {

            type:
                "shikshanupakaran",

            moje:
                moje,

            taluka:
                taluka,

            jillo:
                jillo,

            year:
                year,

            rows:
                rows,

            rowCount:
                rows.length,

            userId:
                auth.currentUser.uid,

            userEmail:
                auth.currentUser.email,

            updatedAt:
                firebase
                    .firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /* ========================================================
           SAVE TO FIRESTORE
        ======================================================== */

        await db
            .collection(
                "shikshanupakarans"
            )
            .doc(
                documentId
            )
            .set(
                data,
                {
                    merge: true
                }
            );


        /* ========================================================
           FIRESTORE SAVE SUCCESS
        ======================================================== */

        shikshanupakaranActualFirestoreSaveCount++;

        shikshanupakaranLastSavedSignature =
            saveSignature;


        console.log(
            "🟢 ACTUAL FIRESTORE SAVE COMPLETED"
        );


        console.log(
            "Firestore save count:",
            shikshanupakaranActualFirestoreSaveCount
        );


        console.log(
            "Saved document:",
            documentId
        );


        /* ========================================================
           SHIKSHANUPAKARAN → TALAPATRAK SYNC
           
           MANUAL SAVE ONLY
        ======================================================== */

        if(showMessage === true){
          
              console.log(
                  "================================================"
              );
          
              console.log(
                  "STARTING SHIKSHANUPAKARAN → TALAPATRAK SYNC"
              );
          
          
              const syncResult =
                  await syncShikshanupakaranToTalapatrak({
          
                      moje:
                          data.moje,
          
                      taluka:
                          data.taluka,
          
                      jillo:
                          data.jillo,
          
                      year:
                          data.year,
          
                      rows:
                          data.rows
          
                  });
          
          
              if(syncResult){
          
                  console.log(
                      "SHIKSHANUPAKARAN → TALAPATRAK SYNC SUCCESS"
                  );
          
          
                  try{
          
                      if(
                          typeof loadTalapatrakRecords ===
                          "function"
                      ){
          
                          console.log(
                              "RELOADING TALAPATRAK MANAGEMENT AFTER SYNC"
                          );
          
          
                          await loadTalapatrakRecords();
          
          
                          console.log(
                              "TALAPATRAK MANAGEMENT RELOADED AFTER SYNC"
                          );
          
                      }
                      else{
          
                          console.warn(
                              "loadTalapatrakRecords() NOT FOUND"
                          );
          
                      }
          
                  }
                  catch(
                      refreshError
                  ){
          
                      console.error(
                          "TALAPATRAK REFRESH AFTER SYNC FAILED:",
                          refreshError
                      );
          
                  }
          
              }
              else{
          
                  console.warn(
                      "SHIKSHANUPAKARAN → TALAPATRAK SYNC NOT COMPLETED"
                  );
          
              }
          
          }


        /* ========================================================
           DELETE OLD DOCUMENT AFTER SUCCESSFUL NEW SAVE
        ======================================================== */

        if(
            documentIdChanged
        ){

            console.log(
                "YEAR CHANGE → DELETING OLD DOCUMENT:",
                originalDocumentId
            );


            await db
                .collection(
                    "shikshanupakarans"
                )
                .doc(
                    originalDocumentId
                )
                .delete();


            console.log(
                "YEAR CHANGE → OLD DOCUMENT DELETED:",
                originalDocumentId
            );

        }


        /* ========================================================
           UPDATE CURRENT STATE
        ======================================================== */

        currentShikshanupakaranDocumentId =
            documentId;


        currentShikshanupakaranRecord = {

            id:
                documentId,

            ...data

        };


        /* ========================================================
           UPDATE EDITOR TITLE
        ======================================================== */

        const title =
            document.getElementById(
                "shikshanupakaranEditorVillageName"
            );


        if(title){

            title.textContent =
                moje;

        }


        /* ========================================================
           UPDATE MANAGEMENT ARRAY
        ======================================================== */

        if(
            documentIdChanged
        ){

            shikshanupakaranRecords =
                shikshanupakaranRecords.filter(
                    function(record){

                        return record.id !==
                            originalDocumentId;

                    }
                );


            console.log(
                "MANAGEMENT ARRAY → OLD RECORD REMOVED:",
                originalDocumentId
            );

        }


        const existingIndex =
            shikshanupakaranRecords.findIndex(
                function(record){

                    return record.id ===
                        documentId;

                }
            );


        const savedRecord = {

            id:
                documentId,

            ...data

        };


        if(
            existingIndex >= 0
        ){

            shikshanupakaranRecords[
                existingIndex
            ] =
                savedRecord;

        }
        else{

            shikshanupakaranRecords.push(
                savedRecord
            );

        }


        /* ========================================================
           ACTIVITY
        ======================================================== */

        if(showMessage){

            await addShikshanupakaranActivity(

                wasExistingRecord
                    ? "shikshanupakaran_updated"
                    : "shikshanupakaran_added",

                wasExistingRecord
                    ? "Shikshanupakaran updated"
                    : "New Shikshanupakaran created",

                `${moje} Shikshanupakaran saved successfully`,

                moje

            );

        }


        /* ========================================================
           REFRESH MANAGEMENT
        ======================================================== */

        renderShikshanupakaranManagement();


        /* ========================================================
           SUCCESS
        ======================================================== */

        console.log(
            "Shikshanupakaran saved:",
            documentId
        );


        return true;

    }


    catch(error){

        console.error(
            "Shikshanupakaran save error:",
            error
        );


        if(showMessage){

            alert(
                "Unable to save Shikshanupakaran."
            );

        }


        return false;

    }

}




let shikshanupakaranJustManuallySaved = false;

// ============================================================
// SAVE DEBUG FLAGS
// ============================================================

let shikshanupakaranLastSavedSignature = null;

let shikshanupakaranSaveAttemptCount = 0;

let shikshanupakaranActualFirestoreSaveCount = 0;

let shikshanupakaranSkippedSaveCount = 0;

/* ============================================================
   SCHEDULE AUTO SAVE
   ============================================================ */

function scheduleShikshanupakaranAutoSave() {

    /*
     * Clear previous autosave timer.
     */
    if (
        window.shikshanupakaranAutoSaveTimer
    ) {

        clearTimeout(
            window.shikshanupakaranAutoSaveTimer
        );

    }


    /*
     * Create new autosave timer.
     */
    window.shikshanupakaranAutoSaveTimer =
        setTimeout(
            function() {

                autoSaveShikshanupakaran();

            },
            1000
        );

}


// ============================================================
// CREATE SAVE SIGNATURE
// Used to detect whether data has actually changed.
// ============================================================

function getShikshanupakaranSaveSignature(
    moje,
    taluka,
    jillo,
    year,
    rows
){

    return JSON.stringify({

        moje: moje,

        taluka: taluka,

        jillo: jillo,

        year: year,

        rows: rows

    });

}


/* ============================================================
   AUTO SAVE
   ============================================================ */

async function autoSaveShikshanupakaran(){
    
      if(shikshanupakaranJustManuallySaved){
    
        shikshanupakaranJustManuallySaved = false;
    
        console.log(
            "Autosave skipped after manual save."
        );
    
        return;
    
    }
    /*
        Prevent simultaneous saves.
    */

    if(
         window.shikshanupakaranIsSaving
    ){

        return;

    }


    /*
        No logged-in user.
    */

    if(
        !auth ||
        !auth.currentUser
    ){

        return;

    }


    /*
        Get village name.

        A new document cannot be created
        until the village name exists.
    */

    const mojeElement =
        document.getElementById(
            "shikshanupakaranMoje"
        );


    if(!mojeElement){

        return;

    }


    const moje =
        mojeElement.value
            .trim();


    /*
        Don't autosave an unnamed
        new record.
    */

    if(!moje){

        return;

    }


    try{

        window.shikshanupakaranIsSaving =
            true;


        console.log(
            "Shikshanupakaran AUTO SAVE..."
        );


        /*
            false = NO alert
            false = NO activity entry
        */

        await saveShikshanupakaran(
            false
        );


        console.log(
            "Shikshanupakaran AUTO SAVED."
        );


    }

    catch(error){

        console.error(
            "Shikshanupakaran autosave error:",
            error
        );

    }

    finally{

        window.shikshanupakaranIsSaving =
            false;

    }

}


/* ============================================================
   INITIALIZE AUTO SAVE
   ============================================================ */

function initializeShikshanupakaranAutoSave(){

    if(
        window.shikshanupakaranAutoSaveInitialized
    ){

        return;

    }


    window.shikshanupakaranAutoSaveInitialized =
        true;


    /*
        ----------------------------------------
        HEADER FIELDS
        ----------------------------------------
    */

    const headerFields = [

        document.getElementById(
            "printMoje"
        ),

        document.getElementById(
            "printTaluka"
        ),

        document.getElementById(
            "printJillo"
        )

    ];


    headerFields.forEach(
        function(field){

            if(!field){

                return;

            }


            field.addEventListener(
                "input",
                function(){

                    scheduleShikshanupakaranAutoSave();

                }
            );


            field.addEventListener(
                "blur",
                function(){

                    scheduleShikshanupakaranAutoSave();

                }
            );

        }
    );


    /*
        ----------------------------------------
        TABLE
        ----------------------------------------
    */

    if(
          shikshanupakaranBody
      ){
      
          shikshanupakaranBody.addEventListener(
      
              "input",
      
              function(event){
      
                  if(
                      event.target.matches(
                          "input"
                      )
                  ){
      
                      scheduleShikshanupakaranAutoSave();
      
                  }
      
              }
      
          );
      
      
          /*
              Catch row deletion.
          */
      
          shikshanupakaranBody.addEventListener(
      
              "click",
      
              function(event){
      
                  if(
                      event.target.closest(
                          ".deleteShikshanupakaranRow"
                      )
                  ){
      
                      /*
                          Wait until the row has
                          actually been removed.
                      */
      
                      setTimeout(
      
                          function(){
      
                              scheduleShikshanupakaranAutoSave();
      
                          },
      
                          50
      
                      );
      
                  }
      
              }
      
          );
      
      }


    /*
        ----------------------------------------
        ADD ROW
        ----------------------------------------
    */

    if(
        addShikshanupakaranRowButton
    ){

        addShikshanupakaranRowButton.addEventListener(

            "click",

            function(){

                setTimeout(

                    function(){

                        scheduleShikshanupakaranAutoSave();

                    },

                    50

                );

            }

        );

    }


    console.log(
        "Shikshanupakaran auto-save initialized."
    );

}

/* ============================================================
        OPEN EXISTING RECORD
============================================================ */


async function openShikshanupakaranRecord(
    documentId
){

    try{

        /* ========================================================
           LOAD RECORD
        ======================================================== */

        const snapshot =
            await db
                .collection("shikshanupakarans")
                .doc(documentId)
                .get();


        if(!snapshot.exists){

            alert("Record not found.");

            return;

        }


        const data =
            snapshot.data();


        /* ========================================================
           CURRENT RECORD
        ======================================================== */

        currentShikshanupakaranRecord = {

            id: documentId,

            ...data

        };


        currentShikshanupakaranDocumentId =
            documentId;


        /*
           IMPORTANT:
           Keep the document ID globally available too.
           This prevents a generated total from one card
           appearing in another card.
        */

        window.currentShikshanupakaranDocumentId =
            documentId;


        /* ========================================================
           RESET OLD TOTAL STATE
           
           VERY IMPORTANT:
           A total generated for the previous card must NEVER
           survive when another card is opened.
        ======================================================== */

        window.shikshanupakaranTotals =
            null;


        window.shikshanupakaranTotalGenerated =
            false;


        window.shikshanupakaranTotalDocumentId =
            null;


        /* ========================================================
           LOAD YEAR
        ======================================================== */

        const recordYear =
            data.year ||
            getCurrentShikshanupakaranYear();


        /* ========================================================
           OPEN EDITOR
        ======================================================== */

        openShikshanupakaranEditor();


        /* ========================================================
           LOAD HEADER DATA
        ======================================================== */

        const moje =
            data.moje || "";

        const taluka =
            data.taluka || "";

        const jillo =
            data.jillo || "";


        console.log(
            "SHIKSHANUPAKARAN HEADER DATA:",
            {
                moje: moje,
                taluka: taluka,
                jillo: jillo,
                year: recordYear
            }
        );


        /* ========================================================
           OLD EDITOR VILLAGE TITLE
        ======================================================== */

        const title =
            document.getElementById(
                "shikshanupakaranEditorVillageName"
            );


        if(title){

            title.textContent =
                moje || "Shikshanupakaran";

        }


        /* ========================================================
           HEADER — MOJE
        ======================================================== */

        const mojeElements =
            document.querySelectorAll(
                "#shikshanupakaranMoje, " +
                "[data-shikshanupakaran-field='moje']"
            );


        mojeElements.forEach(
            function(element){

                if(
                    element.tagName === "INPUT" ||
                    element.tagName === "TEXTAREA" ||
                    element.tagName === "SELECT"
                ){

                    element.value =
                        moje;

                }
                else{

                    element.textContent =
                        moje;

                }

            }
        );


        /* ========================================================
           HEADER — TALUKA
        ======================================================== */

        const talukaElements =
            document.querySelectorAll(
                "#shikshanupakaranTaluka, " +
                "[data-shikshanupakaran-field='taluka']"
            );


        talukaElements.forEach(
            function(element){

                if(
                    element.tagName === "INPUT" ||
                    element.tagName === "TEXTAREA" ||
                    element.tagName === "SELECT"
                ){

                    element.value =
                        taluka;

                }
                else{

                    element.textContent =
                        taluka;

                }

            }
        );


        /* ========================================================
           HEADER — JILLO
        ======================================================== */

        const jilloElements =
            document.querySelectorAll(
                "#shikshanupakaranJillo, " +
                "[data-shikshanupakaran-field='jillo']"
            );


        jilloElements.forEach(
            function(element){

                if(
                    element.tagName === "INPUT" ||
                    element.tagName === "TEXTAREA" ||
                    element.tagName === "SELECT"
                ){

                    element.value =
                        jillo;

                }
                else{

                    element.textContent =
                        jillo;

                }

            }
        );


        /* ========================================================
           YEAR DROPDOWN
        ======================================================== */

        const yearSelect =
            document.getElementById(
                "shikshanupakaranYear"
            );


        if(yearSelect){

            if(
                typeof populateShikshanupakaranYearOptions ===
                "function"
            ){

                populateShikshanupakaranYearOptions(
                    recordYear
                );

            }
            else{

                yearSelect.value =
                    recordYear;

            }

        }


        /* ========================================================
           EDITOR YEAR
        ======================================================== */

        const editorYear =
            document.getElementById(
                "shikshanupakaranEditorYear"
            );


        if(editorYear){

            editorYear.textContent =
                recordYear;

        }


        /* ========================================================
           PRINT HEADER
        ======================================================== */

        const printMoje =
            document.getElementById(
                "printMoje"
            );


        const printTaluka =
            document.getElementById(
                "printTaluka"
            );


        const printJillo =
            document.getElementById(
                "printJillo"
            );


        const printYear =
            document.getElementById(
                "printYear"
            );


        if(printMoje){

            printMoje.textContent =
                moje;

        }


        if(printTaluka){

            printTaluka.textContent =
                taluka;

        }


        if(printJillo){

            printJillo.textContent =
                jillo;

        }


        if(printYear){

            printYear.textContent =
                recordYear;

        }


        console.log(
            "SHIKSHANUPAKARAN OPEN → YEAR:",
            recordYear
        );


        /* ========================================================
           CLEAR EXISTING ROWS
        ======================================================== */

        clearShikshanupakaranRows();


        console.log(
            "CLEARING EDITOR ROWS"
        );


        /* ========================================================
           LOAD FIRESTORE ROWS
        ======================================================== */

        const rows =
            Array.isArray(data.rows)
                ? data.rows
                : [];


        console.log(
            "ROWS LOADED FROM FIREBASE:",
            rows.length,
            rows
        );


        /* ========================================================
           COPY FIRESTORE ROWS INTO MEMORY
        ======================================================== */

        window.shikshanupakaranAllRows =
            rows.map(
                function(rowData){

                    if(
                        rowData &&
                        typeof rowData === "object"
                    ){

                        return {
                            ...rowData
                        };

                    }

                    return {};

                }
            );


        console.log(
            "SHIKSHANUPAKARAN MEMORY ROW COUNT:",
            window.shikshanupakaranAllRows.length
        );


        /* ========================================================
           EMPTY RECORD SAFETY
        ======================================================== */

        if(
            window.shikshanupakaranAllRows.length === 0
        ){

            window.shikshanupakaranAllRows = [
                {}
            ];

        }


        /* ========================================================
           PAGINATION INITIALIZATION
        ======================================================== */

        window.shikshanupakaranRowsPerPage =
            20;


        window.shikshanupakaranCurrentPage =
            1;


        window.shikshanupakaranTotalPages =
            Math.max(
                1,
                Math.ceil(
                    window.shikshanupakaranAllRows.length /
                    window.shikshanupakaranRowsPerPage
                )
            );


        /* ========================================================
           TOTAL STATE — NEW RECORD STARTS CLEAN
        ======================================================== */

        window.shikshanupakaranTotals =
            null;


        window.shikshanupakaranTotalGenerated =
            false;


        window.shikshanupakaranTotalDocumentId =
            null;


        /* ========================================================
           REMOVE ANY OLD TOTAL DOM
           Extra protection against a previous card.
        ======================================================== */

        const table =
            document.getElementById(
                "shikshanupakaranTable"
            );


        if(table){

            const oldTotal =
                table.querySelector(
                    "#shikshanupakaranTotalFooter"
                );


            if(oldTotal){

                oldTotal.remove();

            }

        }


        /* ========================================================
           RENDER FIRST PAGE
        ======================================================== */

        renderShikshanupakaranPage(
            1
        );


        /* ========================================================
           INITIALIZE PAGINATION
        ======================================================== */

        initializeShikshanupakaranPagination();


        /* ========================================================
           AUTOSAVE
        ======================================================== */

        initializeShikshanupakaranAutoSave();


        console.log(
            "SHIKSHANUPAKARAN RECORD READY:",
            {
                documentId:
                    documentId,

                totalRows:
                    window.shikshanupakaranAllRows.length,

                totalPages:
                    window.shikshanupakaranTotalPages,

                totalReset:
                    true
            }
        );

    }


    catch(error){

        console.error(
            "Open error:",
            error
        );


        alert(
            "Unable to open record."
        );

    }

}



/* ============================================================
   SHIKSHANUPAKARAN YEAR SELECTION
============================================================ */

document.addEventListener(
    "change",
    function(event) {

        if (
            !event.target ||
            event.target.id !==
                "shikshanupakaranYear"
        ) {

            return;

        }


        const selectedYear =
            event.target.value;


        if (!selectedYear) {

            return;

        }


        /*
            Update current Shikshanupakaran record
            in memory.
        */

        if (
            currentShikshanupakaranRecord
        ) {

            currentShikshanupakaranRecord.year =
                selectedYear;

        }


        /*
            Keep the existing year display
            synchronized.
        */

        const editorYear =
            document.getElementById(
                "shikshanupakaranEditorYear"
            );


        if (editorYear) {

            editorYear.textContent =
                selectedYear;

        }


        /*
            Keep print year synchronized.
        */

        const printYear =
            document.getElementById(
                "printYear"
            );


        if (printYear) {

            printYear.textContent =
                selectedYear;

        }


        console.log(
            "SHIKSHANUPAKARAN YEAR CHANGED →",
            selectedYear
        );

    }
);

/* ============================================================
        CLOSE SHIKSHANUPAKARAN CARD MENUS
============================================================ */


document.addEventListener(

    "click",

    function(event){



        if(

            event.target.closest(
                ".shikshanupakaranCardMenuWrapper"
            )

        ){

            return;

        }




        document
        .querySelectorAll(
            ".shikshanupakaranCardMenu.open"
        )
        .forEach(

            function(menu){

                menu.classList.remove(
                    "open"
                );

            }

        );


    }

);


console.log(
    "Shikshanupakaran delete system initialized."
);

function markShikshanupakaranRowAsChanged(row){

    if(!row){
        return;
    }


    const memoryIndex =
        row.dataset.memoryIndex;


    if(
        memoryIndex === undefined
    ){
        return;
    }


    if(
        !(window.shikshanupakaranUnsavedRows instanceof Set)
    ){

        window.shikshanupakaranUnsavedRows =
            new Set();

    }


    window.shikshanupakaranUnsavedRows.add(
        Number(memoryIndex)
    );


    window.shikshanupakaranHasUnsavedChanges =
        true;


    addShikshanupakaranUnsavedDot(
        row
    );

}


function addShikshanupakaranUnsavedDot(row){

    if(!row){
        return;
    }


    /*
     * Don't create duplicate dots.
     */

    if(
        row.querySelector(
            ".shikshanupakaranUnsavedDot"
        )
    ){
        return;
    }


    const firstCell =
        row.querySelector("td");


    if(!firstCell){
        return;
    }


    const dot =
        document.createElement("span");


    dot.className =
        "shikshanupakaranUnsavedDot";


    dot.title =
        "Unsaved changes — press SAVE";


    firstCell.style.position =
        "relative";


    firstCell.appendChild(dot);

}

/* ============================================================
        SHIKSHANUPAKARAN EDITOR SYSTEM
        NEW + OPEN EXISTING RECORD
============================================================ */

function createShikshanupakaranRow(
    rowData = {},
    memoryIndex = -1
) {

    console.log(
        "CREATE ROW CALLED:",
        rowData
    );


    const row =
        document.createElement("tr");


    row.className =
        "shikshanupakaranRow";


    /* ============================================================
       STORE GLOBAL MEMORY INDEX
    ============================================================ */

    row.dataset.memoryIndex =
        String(memoryIndex);


    console.log(
        "ROW DOM INDEX ASSIGNED:",
        memoryIndex,
        row.dataset.memoryIndex
    );


    const columns = [
        "A","B","C","D","E",
        "F","G","H","I","J",
        "K","L","M","N","O",
        "P","Q","R","S"
    ];


    /*
     * Auto-calculated columns.
     *
     * IMPORTANT:
     * Column I is NOT here.
     * Column I is date-only.
     */

    const autoColumns = [
        "E",
        "G",
        "M",
        "N",
        "O",
        "P",
        "R",
        "S"
    ];


    let html = "";


    columns.forEach(function(col) {

        let value =
            rowData[col] ?? "";


        /* ========================================================
           COLUMN I — DATE ONLY
           ======================================================== */

        if (col === "I") {

            value =
                String(value).trim();


            /*
             * Reject EVERYTHING except:
             *
             * DD/MM/YYYY
             *
             * Therefore:
             *
             * ૦.૦૦ → ""
             * 0.00  → ""
             * 123   → ""
             * abc   → ""
             * ""    → ""
             */

            if (
                !/^[0-9૦-૯]{1,2}\/[0-9૦-૯]{1,2}\/[0-9૦-૯]{4}$/.test(
                    value
                )
            ) {

                value = "";

            }


            console.log(
                "DATE COLUMN I FINAL VALUE:",
                value
            );


            /*
             * IMPORTANT:
             *
             * Do NOT allow any financial
             * calculation to touch Column I.
             */

            html += `

                <td>

                    <input
                        type="text"
                        class="shikshanupakaranInput indianDatePicker"
                        data-column="I"
                        value="${value}"
                        placeholder="DD/MM/YYYY"
                        autocomplete="off"
                    >

                </td>

            `;


            /*
             * Stop processing this column.
             *
             * This prevents Column I from accidentally
             * going through auto-column / numeric logic.
             */

            return;

        }


        /* ========================================================
           AUTO-CALCULATED COLUMNS
           ======================================================== */

        if (
            autoColumns.includes(col)
        ) {

            value = "";

        }


        let readonly = "";

        let inputClass = "";


        if (
            autoColumns.includes(col)
        ) {

            readonly =
                "readonly";

            inputClass =
                "autoColumn";

        }


        /* ========================================================
           COLUMN A — GUJARATI DIGITS
           ======================================================== */

        if (
            col === "A" &&
            value !== ""
        ) {

            value =
                convertToGujaratiDigits(
                    value
                );

        }


        /* ========================================================
           NORMAL COLUMNS
           ======================================================== */

        html += `

            <td>

                <input
                    type="text"
                    class="
                        shikshanupakaranInput
                        ${inputClass}
                        column-${col}
                    "
                    data-column="${col}"
                    value="${value}"
                    ${readonly}
                >

            </td>

        `;

    });


    /* ============================================================
       ACTION BUTTONS
    ============================================================ */

    html += `

        <td class="shikshanupakaranActionCell printHide">

            <button
                type="button"
                class="addShikshanupakaranRowAfter printHide"
                title="Add Row"
                onclick="addShikshanupakaranRowAfter(this)">

                <i class="fa-solid fa-plus"></i>

            </button>


            <button
                type="button"
                class="deleteShikshanupakaranRow printHide"
                title="Delete Row"
                onclick="deleteShikshanupakaranRow(this)">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;


        /* ============================================================
       INSERT ROW
       ============================================================ */

    row.innerHTML =
        html;


    /* ============================================================
       RESTORE UNSAVED ROW DOT
       ------------------------------------------------------------
       If this row was edited previously and the user has NOT
       pressed the real SAVE button, restore its yellow dot.
       ============================================================ */

    if (
        memoryIndex !== null &&
        memoryIndex !== undefined &&
        window.shikshanupakaranUnsavedRows instanceof Set &&
        window.shikshanupakaranUnsavedRows.has(
            Number(memoryIndex)
        )
    ) {

        addShikshanupakaranUnsavedDot(
            row
        );

    }


    shikshanupakaranBody.appendChild(
        row
    );


    /* ============================================================
       ROW EVENTS
       ============================================================ */

    setupShikshanupakaranRowEvents(
        row
    );

    /* ============================================================
        DATE PICKER
        ------------------------------------------------------------
        Use the same Indian date system as Talapatrak.
        NO FLATPICKR.
        ============================================================ */

        if (
            !window.khataImportInProgress &&
            typeof setupIndianDatePicker === "function"
        ) {

            setupIndianDatePicker();

        }


        /* ============================================================
        CALCULATE ROW
        ============================================================ */

        if (
            rowData &&
            typeof rowData === "object"
        ) {

            calculateShikshanupakaranRow(
                row
            );

        }


    return row;

}


function autoFillNextSerialNumber(row){

    const serialInput =
        row.querySelector('[data-column="A"]');


    if(!serialInput){
        return;
    }


    const startNumber =
        Number(serialInput.value) || 0;


    if(startNumber <= 0){
        return;
    }


    const allRows =
        document.querySelectorAll(
            ".shikshanupakaranRow"
        );


    let currentNumber =
        startNumber;


    let foundRow = false;


    allRows.forEach(function(currentRow){


        if(currentRow === row){

            foundRow = true;

        }


        if(foundRow){


            const input =
                currentRow.querySelector(
                    '[data-column="A"]'
                );


            if(input){

                input.value =
                    currentNumber;

                currentNumber++;

            }


        }


    });


}



function markShikshanupakaranAsSaved(){

    window.shikshanupakaranHasUnsavedChanges =
        false;


    if(
        window.shikshanupakaranUnsavedRows instanceof Set
    ){

        window.shikshanupakaranUnsavedRows.clear();

    }


    document
        .querySelectorAll(
            ".shikshanupakaranUnsavedDot"
        )
        .forEach(
            function(dot){

                dot.remove();

            }
        );


    console.log(
        "🟢 SHIKSHANUPAKARAN MARKED AS SAVED — UNSAVED DOTS REMOVED"
    );

}



function setupShikshanupakaranRowEvents(row){

    const inputs =
        row.querySelectorAll(
            "input"
        );


    inputs.forEach(function(input){


        /* ========================================================
           LIVE CALCULATION
        ======================================================== */

        input.addEventListener(
            "input",
            function(){

                markShikshanupakaranRowAsChanged(
                    row
                );


                calculateShikshanupakaranRow(
                    row
                );


                window.shikshanupakaranTotalGenerated =
                    false;

                window.shikshanupakaranTotals =
                    null;


                renderShikshanupakaranTotal();

            }
        );


        /* ========================================================
           FORMAT AFTER TYPING
        ======================================================== */

        input.addEventListener(
            "blur",
            function(){

                formatShikshanupakaranInput(
                    this
                );


                calculateShikshanupakaranRow(
                    row
                );


                window.shikshanupakaranTotalGenerated =
                    false;

                window.shikshanupakaranTotals =
                    null;


                renderShikshanupakaranTotal();

            }
        );

    });


    /* ============================================================
       SERIAL NUMBER
    ============================================================ */

    const serialInput =
        row.querySelector(
            '[data-column="A"]'
        );


    if(serialInput){

        serialInput.addEventListener(
            "change",
            function(){

                autoFillNextSerialNumber(
                    row
                );

            }
        );

    }

}



/* ============================================================
   ADD ROW AFTER CURRENT ROW
============================================================ */

function addShikshanupakaranRowAfter(button) {

    if (
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        return;

    }


    const currentRow =
        button.closest(
            ".shikshanupakaranRow"
        );


    if (!currentRow) {

        return;

    }


    const visibleRows =
        Array.from(
            shikshanupakaranBody.querySelectorAll(
                ".shikshanupakaranRow"
            )
        );


    const visibleIndex =
        visibleRows.indexOf(
            currentRow
        );


    if (
        visibleIndex === -1
    ) {

        return;

    }


    const currentPage =
        Number(
            window.shikshanupakaranCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    const memoryIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage +
        visibleIndex;


    if (
        memoryIndex < 0 ||
        memoryIndex >=
            window.shikshanupakaranAllRows.length
    ) {

        return;

    }


    /* ========================================================
       DO NOT SYNC
       
       DOM contains the user's current unsaved edits.
       We must preserve those DOM rows.
    ======================================================== */


    /* ========================================================
       CREATE NEW MASTER ROW
    ======================================================== */

    const newRowData = {

        A: "",

        B: "",
        C: "",
        D: "",
        E: "",
        F: "",

        G: "0.00",

        H: "",
        I: "",
        J: "",
        K: "",
        L: "",

        M: "0.00",
        N: "0.00",
        O: "0.00",
        P: "0.00",

        Q: "",

        R: "0.00",
        S: "0.00",

        T: ""

    };


    /* ========================================================
       INSERT INTO MASTER MEMORY
       
       IMPORTANT:
       This only changes the row structure.
       It does NOT replace existing DOM data.
    ======================================================== */

    window.shikshanupakaranAllRows.splice(
        memoryIndex + 1,
        0,
        newRowData
    );


    /* ========================================================
       CREATE NEW DOM ROW
       
       createShikshanupakaranRow() normally appends.
       We will move the newly-created row immediately
       after the clicked row.
    ======================================================== */

    const newRow =
        createShikshanupakaranRow(
            newRowData,
            memoryIndex + 1
        );


    if (!newRow) {

        return;

    }


    /* ========================================================
       MOVE NEW ROW INTO CORRECT POSITION
    ======================================================== */

    currentRow.after(
        newRow
    );


    /* ========================================================
       UPDATE MEMORY INDEXES
       
       The insertion shifted every row after the new row.
    ======================================================== */

    const updatedRows =
        Array.from(
            shikshanupakaranBody.querySelectorAll(
                ".shikshanupakaranRow"
            )
        );


    updatedRows.forEach(
        function(
            row,
            index
        ){

            const globalIndex =
                (
                    currentPage - 1
                ) *
                rowsPerPage +
                index;


            row.dataset.memoryIndex =
                String(
                    globalIndex
                );


            /*
                Update visible row number.
            */

            const numberInput =
                row.querySelector(
                    ".column-A"
                );


            if(numberInput){

                numberInput.value =
                    globalIndex + 1;

            }

        }
    );


    /* ========================================================
       RECALCULATE PAGINATION STATE
    ======================================================== */

    window.shikshanupakaranTotalPages =
        Math.max(
            1,
            Math.ceil(
                window.shikshanupakaranAllRows.length /
                rowsPerPage
            )
        );


    /*
        IMPORTANT:
        Do NOT renderShikshanupakaranPage() here.
        
        Rendering would destroy the user's unsaved
        DOM values.
    */


    /* ========================================================
       TOTALS ARE STALE
    ======================================================== */

    window.shikshanupakaranTotalGenerated =
        false;


    window.shikshanupakaranTotals =
        null;


    renderShikshanupakaranTotal();


    /* ========================================================
       FOCUS NEW ROW
    ======================================================== */

    const firstInput =
        newRow.querySelector(
            "input:not([readonly])"
        );


    if(firstInput){

        firstInput.focus();

        firstInput.select();

    }


    console.log(
        "SHIKSHANUPAKARAN ADD → COMPLETE:",
        {
            insertedAfter:
                memoryIndex,

            newMemoryIndex:
                memoryIndex + 1,

            totalRows:
                window.shikshanupakaranAllRows.length
        }
    );

}


/* ============================================================
   DELETE ROW
============================================================ */

function deleteShikshanupakaranRow(button) {

    if (
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        return;

    }


    const currentRow =
        button.closest(
            ".shikshanupakaranRow"
        );


    if (!currentRow) {

        return;

    }


    const visibleRows =
        Array.from(
            shikshanupakaranBody.querySelectorAll(
                ".shikshanupakaranRow"
            )
        );


    const visibleIndex =
        visibleRows.indexOf(
            currentRow
        );


    if (
        visibleIndex === -1
    ) {

        return;

    }


    const currentPage =
        Number(
            window.shikshanupakaranCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    const memoryIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage +
        visibleIndex;


    if (
        memoryIndex < 0 ||
        memoryIndex >=
            window.shikshanupakaranAllRows.length
    ) {

        return;

    }


    /* ========================================================
       KEEP AT LEAST ONE ROW
    ======================================================== */

    if (
        window.shikshanupakaranAllRows.length <= 1
    ) {

        alert(
            "At least one row is required."
        );

        return;

    }


    /* ========================================================
       DO NOT SYNC
       
       We intentionally do NOT call:

       syncCurrentShikshanupakaranPageToMemory();

       because that would save the DOM before delete.
    ======================================================== */


    /* ========================================================
       REMOVE FROM MASTER MEMORY
    ======================================================== */

    window.shikshanupakaranAllRows.splice(
        memoryIndex,
        1
    );


    /* ========================================================
       REMOVE ONLY THIS DOM ROW
       
       IMPORTANT:
       We do NOT re-render the entire table.
    ======================================================== */

    currentRow.remove();


    /* ========================================================
       UPDATE REMAINING DOM ROW MEMORY INDEXES
    ======================================================== */

    const remainingRows =
        Array.from(
            shikshanupakaranBody.querySelectorAll(
                ".shikshanupakaranRow"
            )
        );


    remainingRows.forEach(
        function(
            row,
            index
        ){

            const globalIndex =
                (
                    currentPage - 1
                ) *
                rowsPerPage +
                index;


            row.dataset.memoryIndex =
                String(
                    globalIndex
                );


            /*
                Update visible row number.
            */

            const numberInput =
                row.querySelector(
                    ".column-A"
                );


            if(numberInput){

                numberInput.value =
                    globalIndex + 1;

            }

        }
    );


    /* ========================================================
       RECALCULATE PAGINATION
    ======================================================== */

    window.shikshanupakaranTotalPages =
        Math.max(
            1,
            Math.ceil(
                window.shikshanupakaranAllRows.length /
                rowsPerPage
            )
        );


    /*
        IMPORTANT:
        No renderShikshanupakaranPage().
        
        Existing DOM rows remain untouched,
        so their unsaved data remains.
    */


    /* ========================================================
       TOTALS ARE STALE
    ======================================================== */

    window.shikshanupakaranTotalGenerated =
        false;


    window.shikshanupakaranTotals =
        null;


    renderShikshanupakaranTotal();


    console.log(
        "SHIKSHANUPAKARAN DELETE → COMPLETE:",
        {
            deletedMemoryIndex:
                memoryIndex,

            remainingRows:
                window.shikshanupakaranAllRows.length
        }
    );

}




function renumberShikshanupakaranRows(){

    /*
        ========================================================
        SHIKSHANUPAKARAN COLUMN A IS KHATA NUMBER
        ========================================================

        Do NOT automatically replace Column A with:

            1, 2, 3, 4...

        Khata numbers may come from:

            - Manual entry
            - Khata PDF import
            - Existing saved data

        Therefore Column A must remain user/import controlled.
    */

    return;

}


function calculateShikshanupakaranRow(row) {

    if (!row) return;


    /* ============================================================
       GET NUMERIC VALUE
    ============================================================ */

    function get(col) {

        const el =
            row.querySelector(
                `[data-column="${col}"]`
            );

        if (!el) {
            return 0;
        }

        const englishValue =
            convertGujaratiDigitsToEnglish(
                el.value
            );

        const number =
            Number(englishValue);

        return Number.isFinite(number)
            ? number
            : 0;

    }

        


    /* ============================================================
       SET CALCULATED VALUE
       ------------------------------------------------------------
       Calculated values are always displayed as 0.00
    ============================================================ */

    function set(
          col,
          value
      ) {
      
          const el =
              row.querySelector(
                  `[data-column="${col}"]`
              );
      
          if (el) {
      
              el.value =
                convertToGujaratiDigits(
                    roundGeneratedValueToFivePaise(
                        value
                    ).toFixed(2)
                );
      
          }
      
      }


    /* ============================================================
       READ USER INPUT
       ------------------------------------------------------------
       IMPORTANT:
       Do NOT format C-F or J-L here.

       The user must be able to type:
       3.34
       12.50
       0.25

       without the value being changed while typing.
    ============================================================ */

    const C =
        get("C");

    const D =
        get("D");

    const E =
        get("E");

    const F =
        get("F");

    const J =
        get("J");

    const K =
        get("K");

    const L =
        get("L");


    /* ============================================================
       G = C + D + E + F
    ============================================================ */

    const G =
        C +
        D +
        E +
        F;

    set(
        "G",
        G
    );


    /* ============================================================
       M = J + K + L
    ============================================================ */

    const M =
        J +
        K +
        L;

    set(
        "M",
        M
    );


    /* ============================================================
       R = G - M
    ============================================================ */

    const R =
        G -
        M;

    set(
        "R",
        R
    );


    /* ============================================================
       S = NEGATIVE BALANCE
    ============================================================ */

    const S =
        R < 0
            ? R
            : 0;

    set(
        "S",
        S
    );


    /* ============================================================
       P = -S
    ============================================================ */

    const P =
        -S;

    set(
        "P",
        P
    );


    /* ============================================================
       O = POSITIVE BALANCE
    ============================================================ */

    const O =
        R > 0
            ? R
            : 0;

    set(
        "O",
        O
    );


    /* ============================================================
       N = M - P
    ============================================================ */

    const N =
        M -
        P;

    set(
        "N",
        N
    );

}


function formatShikshanupakaranInput(input){

    if(!input) return;


    const column =
        input.dataset.column;


    /* ========================================================
       EMPTY INPUT
    ======================================================== */

    if(
        input.value === ""
    ){

        return;

    }


    /*
     * User may enter:
     *
     * English:
     * 125
     * 125.50
     *
     * OR Gujarati:
     * ૧૨૫
     * ૧૨૫.૫૦
     *
     * Always convert to English for calculation.
     */

    const englishValue =
        convertGujaratiDigitsToEnglish(
            input.value
        );


    /* ========================================================
       A / H → INTEGER
       ======================================================== */

    if(
        ["A", "H"].includes(column)
    ){

        const value =
            Number(
                englishValue
            );


        if(
            Number.isFinite(value)
        ){

            input.value =
                convertToGujaratiDigits(
                    Math.trunc(value)
                );

        }


        return;

    }


    /* ========================================================
       DECIMAL INPUTS
       ======================================================== */

    if(
        [
            "C",
            "D",
            "E",
            "F",
            "J",
            "K",
            "L"
        ].includes(column)
    ){

        const value =
            Number(
                englishValue
            );


        if(
            Number.isFinite(value)
        ){

            input.value =
                convertToGujaratiDigits(
                    value.toFixed(2)
                );

        }

    }

}



function getNextShikshanupakaranSerial(){


    const rows =
        document.querySelectorAll(
            ".shikshanupakaranRow"
        );



    let max = 0;



    rows.forEach(function(row){


        const value =
            Number(
                row.querySelector(
                    '[data-column="A"]'
                )?.value
            )
            ||
            0;



        if(value > max){

            max=value;

        }


    });



    return max + 1;


}

function addInitialShikshanupakaranRow(){


    const row =
        createShikshanupakaranRow();



    const serialInput =
    row.querySelector('[data-column="A"]');


    serialInput.value =
        getNextShikshanupakaranSerial();



}

function formatShikshanupakaranNumbers(row){


    row.querySelectorAll(
        "input"
    )
    .forEach(function(input){


        const col =
            input.dataset.column;



        if(
            ["A","H"].includes(col)
        ){

            input.value =
                parseInt(input.value)
                ||
                "";

        }


        else if(
                [
                    "E",
                    "G",
                    "M",
                    "N",
                    "O",
                    "P",
                    "R",
                    "S"
                ].includes(col)
            ){

                const formattedValue =
                    Number(input.value)
                    .toFixed(2);

                input.value =
                    convertToGujaratiDigits(
                        formattedValue
                    );

            }



    });


}




function createShikshanupakaranRowFromTalapatrak(talapatrakRow){


    return createShikshanupakaranRow({

        B:
        talapatrakRow.B

    });


}



/* ============================================================
   COLLECT ALL SHIKSHANUPAKARAN ROWS
   MEMORY IS THE SOURCE OF TRUTH
============================================================ */

function collectShikshanupakaranRows() {

    /*
        First save the currently visible page
        into memory.
    */

    syncCurrentShikshanupakaranPageToMemory();


    if (
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        return [];

    }


    const data = [];


    window.shikshanupakaranAllRows.forEach(
        function(rowData) {

            if (
                !rowData ||
                typeof rowData !== "object"
            ) {

                return;

            }


            const autoColumns = [
                "G",
                "M",
                "N",
                "O",
                "P",
                "R",
                "S"
            ];


            let hasUserData = false;


            Object.keys(rowData).forEach(
                function(column) {

                    if (
                        !autoColumns.includes(
                            column
                        ) &&
                        String(
                            rowData[column] ?? ""
                        ).trim() !== ""
                    ) {

                        hasUserData = true;

                    }

                }
            );


            if (!hasUserData) {

                return;

            }


            data.push({
                ...rowData
            });

        }
    );


    console.log(
        "ALL SHIKSHANUPAKARAN ROWS COLLECTED:",
        data.length
    );


    return data;

}



/* ============================================================
        BUTTON EVENTS
============================================================ */

if(addShikshanupakaranButton){


    addShikshanupakaranButton.addEventListener(

        "click",

        function(){

            startNewShikshanupakaran();

        }

    );


}


if(emptyAddShikshanupakaranButton){


    emptyAddShikshanupakaranButton.addEventListener(

        "click",

        function(){

            startNewShikshanupakaran();

        }

    );


}


/* ============================================================
        SAVE BUTTON EVENT
============================================================ */

if(saveShikshanupakaranButton){

    saveShikshanupakaranButton.onclick =
    async function(){

        if(
            saveShikshanupakaranButton.disabled
        ){

            return;

        }


        saveShikshanupakaranButton.disabled =
            true;


        saveShikshanupakaranButton.innerHTML = `

            <i class="fa-solid fa-spinner fa-spin"></i>

            <span>
                Saving...
            </span>

        `;


        try{

            shikshanupakaranJustManuallySaved = true;

              const saved =
                    await saveShikshanupakaran(
                        true
                    );

                if (saved) {

                    markShikshanupakaranAsSaved();

                }

        }
        catch(error) {

            console.error(
                "Shikshanupakaran manual save error:",
                error
            );

        }

        finally{

            saveShikshanupakaranButton.disabled =
                false;


            saveShikshanupakaranButton.innerHTML = `

                <i class="fa-solid fa-floppy-disk"></i>

                <span>
                    Save
                </span>

            `;

        }

    };

}

console.log(
    "Shikshanupakaran save system initialized."
);




/* ============================================================
        SHIKSHANUPAKARAN FINAL CONNECTIONS
============================================================ */



/* ============================================================
        SEARCH
============================================================ */


if(
    shikshanupakaranSearchInputElement
){



    shikshanupakaranSearchInputElement.addEventListener(

        "input",

        function(){



            shikshanupakaranSearchTerm =
                this.value
                .trim()
                .toLowerCase();





            renderShikshanupakaranManagement();



        }

    );


}


/* ============================================================
        TIMESTAMP HELPER
============================================================ */


function getShikshanupakaranTimestamp(
    timestamp
){



    if(!timestamp){

        return 0;

    }





    if(timestamp.toDate){


        return timestamp
        .toDate()
        .getTime();


    }





    if(timestamp instanceof Date){


        return timestamp.getTime();


    }





    return new Date(
        timestamp
    ).getTime() || 0;



}


/* ============================================================
        FORMAT DATE
============================================================ */


function formatShikshanupakaranDate(
    timestamp
){



    if(!timestamp){

        return "—";

    }






    const date =
        timestamp.toDate
        ?
        timestamp.toDate()
        :
        new Date(timestamp);





    return date.toLocaleDateString(

        "en-IN",

        {

            day:"2-digit",

            month:"short",

            year:"numeric"

        }

    );



}


/* ============================================================
        INITIALIZE
============================================================ */


renderShikshanupakaranManagement();



console.log(
    "Complete Shikshanupakaran system initialized successfully."
);

/* ============================================================
        SHIKSHANUPAKARAN ACTIVITY
============================================================ */


async function addShikshanupakaranActivity(
    type,
    title,
    message,
    villageName = ""
){

    try{

        await db
        .collection("activities")
        .add({

            type: type,

            title: title,

            message: message,

            module: "shikshanupakaran",

            villageName: villageName,

            createdAt:
                firebase.firestore.FieldValue
                .serverTimestamp()

        });


        console.log(
            "Shikshanupakaran activity added:",
            title
        );


        // Refresh dashboard activity

        if(
            typeof loadRecentActivity === "function"
        ){

            loadRecentActivity();

        }


    }

    catch(error){

        console.error(
            "Error adding Shikshanupakaran activity:",
            error
        );

    }

}

/* ============================================================
        DOWNLOAD SHIKSHANUPAKARAN PDF
============================================================ */

async function downloadShikshanupakaranPDF(record){


    try{


        if(!record){

            alert(
                "No record available for download."
            );

            return;

        }



        const { jsPDF } =
            window.jspdf;



        const pdf =
            new jsPDF(
                "landscape",
                "mm",
                "a4"
            );



        const villageName =
            record.moje || "Village";


        const year =
            record.year || "";



        pdf.setFontSize(
            16
        );


        pdf.text(
            `Shikshanupakaran - ${villageName}`,
            15,
            15
        );


        pdf.setFontSize(
            11
        );


        pdf.text(
            `Year: ${year}`,
            15,
            23
        );



        const rows =
            record.rows || [];



        const tableRows =
            rows.map(
                function(row){

                    return [

                        row.A || "",
                        row.B || "",
                        row.C || "",
                        row.D || "",
                        row.E || "",
                        row.F || "",
                        row.G || "",
                        row.H || "",
                        row.I || "",
                        row.J || "",
                        row.K || "",
                        row.L || "",
                        row.M || "",
                        row.N || "",
                        row.O || "",
                        row.P || "",
                        row.Q || "",
                        row.R || "",
                        row.S || "",
                        row.T || ""

                    ];

                }
            );



        pdf.autoTable({

            startY: 30,


            head: [[

                "No",
                "Name",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T"

            ]],


            body:
                tableRows,


            styles: {

                fontSize: 7

            },


            theme:
                "grid"


        });



        pdf.save(
            `${villageName}_${year}_Shikshanupakaran.pdf`
        );



        console.log(
            "PDF downloaded:",
            villageName,
            year
        );


    }


    catch(error){


        console.error(
            "PDF download error:",
            error
        );


        alert(
            "Unable to create PDF."
        );


    }


}




/* ======================================================================================================================== */


/* ============================================================
   SHIKSHANUPAKARAN KHATA UPLOAD
============================================================ */

const shikshanupakaranKhataUploadButton =
    document.getElementById(
        "shikshanupakaranKhataUploadButton"
    );

if (shikshanupakaranKhataUploadButton) {

    shikshanupakaranKhataUploadButton.addEventListener(
        "click",
        function () {

            console.log(
                "Shikshanupakaran Khata Upload button clicked"
            );


            openKhataFilePicker(async function (file) {

                console.log(
                    "Shikshanupakaran Khata file received:",
                    file.name
                );


                try {

                    const result =
                        await scanKhataFile(file);


                    const parsedResult =
                        parseKhataResult(result);


                    console.log(
                        "========== KHATA PARSER RESULT =========="
                    );


                    console.log(
                        parsedResult
                    );


                    logKhataSummary(
                        parsedResult
                    );


                    console.log(
                        "========== KHATA PARSER RESULT END =========="
                    );


                    console.log(
                        "TOTAL PAGES:",
                        result.pageCount
                    );


                    /* ----------------------------------------------------
                       FIND KHATA NUMBERS
                    ---------------------------------------------------- */

                    console.log(
                        "========== KHATA PAGE SUMMARY =========="
                    );


                    result.pages.forEach(
                        function(page) {

                            if (
                                !page.text ||
                                !page.text.includes("ખાતા")
                            ) {

                                return;

                            }


                            /* ------------------------------------------------
                               FIND ALL OCCURRENCES OF:
                               ખાતા નંબર
                            ------------------------------------------------ */

                            const matches =
                                page.text.match(
                                    /ખાતા\s*નંબર\s*[:=]*\s*([૦-૯0-9X]+)/g
                                );


                            if (
                                matches &&
                                matches.length > 0
                            ) {

                                console.log(
                                    "Page",
                                    page.pageNumber,
                                    "→",
                                    matches.length,
                                    "Khata numbers"
                                );

                            }

                        }
                    );


                    console.log(
                        "========== KHATA PAGE SUMMARY END =========="
                    );


                    const khataRecords =
                        parseKhataResult(result);


                    console.log(
                        "========== KHATA RECORDS =========="
                    );


                    khataRecords.forEach(
                        function(record) {

                            console.log(
                                "Page",
                                record.pageNumber,
                                "| Khata:",
                                record.khataNumber,
                                "| TEXT:",
                                record.rawText
                            );

                        }
                    );


                    console.log(
                        "========== KHATA RECORDS END =========="
                    );


                }
                catch (error) {

                    console.error(
                        "SHIKSHANUPAKARAN KHATA SCAN FAILED:",
                        error
                    );


                    alert(
                        "Unable to scan the Khata file."
                    );

                }

            });

        }
    );

}
else {

    console.error(
        "Shikshanupakaran Khata Upload button not found"
    );

}


/* -------------------------------------------------------------------------------------------------------- */

/* ============================================================
   SHIKSHANUPAKARAN — FULL VIEW
   ============================================================ */

/* ============================================================
   SHIKSHANUPAKARAN — FULL VIEW MODE
   FINAL TOGGLE
============================================================ */

const shikshanupakaranFullViewButton =
    document.getElementById(
        "shikshanupakaranFullViewButton"
    );


if (shikshanupakaranFullViewButton) {

    shikshanupakaranFullViewButton.addEventListener(
        "click",
        function () {

            const isFullView =
                document.body.classList.toggle(
                    "shikshanupakaranFullViewMode"
                );


            /* ------------------------------------------------
               KEEP BODY STATE IN SYNC WITH CSS
            ------------------------------------------------ */

            document.body.classList.toggle(
                "shikshanupakaranFullViewActive",
                isFullView
            );


            /* ------------------------------------------------
               APPLY FULL VIEW CLASS TO SHIKSHANUPAKARAN VIEW
            ------------------------------------------------ */

            const shikshanupakaranView =
                document.querySelector(
                    ".shikshanupakaranView"
                );


            if (shikshanupakaranView) {

                shikshanupakaranView.classList.toggle(
                    "fullView",
                    isFullView
                );

                shikshanupakaranView.classList.toggle(
                    "shikshanupakaranFullView",
                    isFullView
                );

            }

        }
    );

}


/* ============================================================
   SHIKSHANUPAKARAN — EXIT FULL VIEW
   ============================================================ */

const shikshanupakaranShrinkViewButton =
    document.getElementById(
        "shikshanupakaranShrinkViewButton"
    );


if (shikshanupakaranShrinkViewButton) {

    shikshanupakaranShrinkViewButton.addEventListener(
        "click",
        function () {

            document.body.classList.remove(
                "shikshanupakaranFullViewMode"
            );

        }
    );

}

/* -------------------------------------------------------------------------------------------------------- */



const shikshanupakaranPagination =
    document.getElementById(
        "shikshanupakaranPagination"
    );

/* ============================================================
   SHIKSHANUPAKARAN PAGINATION
============================================================ */

window.shikshanupakaranRowsPerPage = 20;

window.shikshanupakaranCurrentPage = 1;

window.shikshanupakaranTotalPages = 1;


/* ============================================================
   UPDATE PAGINATION STATE
============================================================ */

function updateShikshanupakaranPaginationState() {

    if (
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        window.shikshanupakaranAllRows = [];

    }


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    window.shikshanupakaranRowsPerPage =
        rowsPerPage;


    const totalRows =
        window.shikshanupakaranAllRows.length;


    window.shikshanupakaranTotalPages =
        Math.max(
            1,
            Math.ceil(
                totalRows /
                rowsPerPage
            )
        );


    const requestedPage =
        Number(
            window.shikshanupakaranCurrentPage
        ) || 1;


    window.shikshanupakaranCurrentPage =
        Math.max(
            1,
            Math.min(
                requestedPage,
                window.shikshanupakaranTotalPages
            )
        );


    console.log(
        "SHIKSHANUPAKARAN PAGINATION STATE:",
        {
            totalRows: totalRows,
            rowsPerPage: rowsPerPage,
            totalPages:
                window.shikshanupakaranTotalPages,
            currentPage:
                window.shikshanupakaranCurrentPage
        }
    );

}


/* ============================================================
   UPDATE PAGINATION UI
============================================================ */

function updateShikshanupakaranPagination(){

    updateShikshanupakaranPaginationState();


    const currentPage =
        window.shikshanupakaranCurrentPage;


    const totalPages =
        window.shikshanupakaranTotalPages;


    const totalRows =
        Array.isArray(
            window.shikshanupakaranAllRows
        )
            ? window.shikshanupakaranAllRows.length
            : 0;


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    const firstButton =
        document.getElementById(
            "shikshanupakaranFirstPage"
        );


    const previousButton =
        document.getElementById(
            "shikshanupakaranPreviousPage"
        );


    const nextButton =
        document.getElementById(
            "shikshanupakaranNextPage"
        );


    const lastButton =
        document.getElementById(
            "shikshanupakaranLastPage"
        );


    const pageInput =
        document.getElementById(
            "shikshanupakaranPageInput"
        );


    const totalPagesElement =
        document.getElementById(
            "shikshanupakaranTotalPages"
        );


    const pageInfo =
        document.getElementById(
            "shikshanupakaranPageInfo"
        );


    /* --------------------------------------------------------
       PAGE INPUT
    -------------------------------------------------------- */

    if(pageInput){

        pageInput.value =
            currentPage;

        pageInput.min =
            1;

        pageInput.max =
            totalPages;

    }


    /* --------------------------------------------------------
       TOTAL PAGES
    -------------------------------------------------------- */

    if(totalPagesElement){

        totalPagesElement.textContent =
            totalPages;

    }


    /* --------------------------------------------------------
       ROW INFORMATION
    -------------------------------------------------------- */

    let startRow = 0;

    let endRow = 0;


    if(totalRows > 0){

        startRow =
            (
                currentPage - 1
            ) *
            rowsPerPage +
            1;


        endRow =
            Math.min(
                currentPage * rowsPerPage,
                totalRows
            );

    }


    if(pageInfo){

        pageInfo.textContent =
            `Rows ${startRow}–${endRow} of ${totalRows}`;

    }


    /* --------------------------------------------------------
       BUTTON STATES
    -------------------------------------------------------- */

    if(firstButton){

        firstButton.disabled =
            currentPage <= 1;

    }


    if(previousButton){

        previousButton.disabled =
            currentPage <= 1;

    }


    if(nextButton){

        nextButton.disabled =
            currentPage >= totalPages;

    }


    if(lastButton){

        lastButton.disabled =
            currentPage >= totalPages;

    }

}



/* ============================================================
   PAGINATION ELEMENTS
============================================================ */

const shikshanupakaranFirstPageButton =
    document.getElementById(
        "shikshanupakaranFirstPage"
    );


const shikshanupakaranPreviousPageButton =
    document.getElementById(
        "shikshanupakaranPreviousPage"
    );


const shikshanupakaranNextPageButton =
    document.getElementById(
        "shikshanupakaranNextPage"
    );


const shikshanupakaranLastPageButton =
    document.getElementById(
        "shikshanupakaranLastPage"
    );


const shikshanupakaranPageInput =
    document.getElementById(
        "shikshanupakaranPageInput"
    );


/* ============================================================
   FIRST
============================================================ */

if(
    shikshanupakaranFirstPageButton
){

    shikshanupakaranFirstPageButton.onclick =
        function(){

            goToShikshanupakaranPage(1);

        };

}


/* ============================================================
   PREVIOUS
============================================================ */

if(
    shikshanupakaranPreviousPageButton
){

    shikshanupakaranPreviousPageButton.onclick =
        function(){

            goToShikshanupakaranPage(
                (
                    Number(
                        window.shikshanupakaranCurrentPage
                    ) || 1
                ) - 1
            );

        };

}


/* ============================================================
   NEXT
============================================================ */

if(
    shikshanupakaranNextPageButton
){

    shikshanupakaranNextPageButton.onclick =
        function(){

            goToShikshanupakaranPage(
                (
                    Number(
                        window.shikshanupakaranCurrentPage
                    ) || 1
                ) + 1
            );

        };

}


/* ============================================================
   LAST
============================================================ */

if(
    shikshanupakaranLastPageButton
){

    shikshanupakaranLastPageButton.onclick =
        function(){

            updateShikshanupakaranPaginationState();


            goToShikshanupakaranPage(
                window.shikshanupakaranTotalPages
            );

        };

}


/* ============================================================
   PAGE INPUT — CHANGE
============================================================ */

if(
    shikshanupakaranPageInput
){

    shikshanupakaranPageInput.addEventListener(
        "change",
        function(){

            goToShikshanupakaranPage(
                this.value
            );

        }
    );


    /* --------------------------------------------------------
       ENTER = GO
    -------------------------------------------------------- */

    shikshanupakaranPageInput.addEventListener(
        "keydown",
        function(event){

            if(
                event.key === "Enter"
            ){

                event.preventDefault();


                goToShikshanupakaranPage(
                    this.value
                );

            }

        }
    );

}


/* ============================================================
   SYNC CURRENT PAGE → MEMORY
============================================================ */

function syncCurrentShikshanupakaranPageToMemory() {

    if (
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        return;

    }


    if(
        !shikshanupakaranBody
    ){

        return;

    }


    const currentPage =
        Number(
            window.shikshanupakaranCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    const visibleRows =
        Array.from(
            shikshanupakaranBody.querySelectorAll(
                ".shikshanupakaranRow"
            )
        );


    const startIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage;


    visibleRows.forEach(
        function(
            row,
            visibleIndex
        ){

            /*
                Use the row's actual memory index
                when available.
            */

            let memoryIndex =
                Number(
                    row.dataset.memoryIndex
                );


            /*
                Fallback only if the row does not
                have a valid memory index.
            */

            if(
                !Number.isInteger(
                    memoryIndex
                )
            ){

                memoryIndex =
                    startIndex +
                    visibleIndex;

            }


            if(
                memoryIndex < 0 ||
                memoryIndex >=
                    window.shikshanupakaranAllRows.length
            ){

                console.warn(
                    "SAVE SYNC → INVALID MEMORY INDEX:",
                    memoryIndex
                );

                return;

            }


            const rowData =
                collectSingleShikshanupakaranRow(
                    row
                );


            window.shikshanupakaranAllRows[
                memoryIndex
            ] =
                rowData;

        }
    );


    console.log(
        "SHIKSHANUPAKARAN SAVE SYNC COMPLETE:",
        {
            page:
                currentPage,

            visibleRows:
                visibleRows.length,

            totalRows:
                window.shikshanupakaranAllRows.length
        }
    );

}



/* ============================================================
   COLLECT ONE ROW
============================================================ */

function collectSingleShikshanupakaranRow(row) {

    const inputs =
        row.querySelectorAll(
            "input[data-column]"
        );


    const rowData = {};


    inputs.forEach(
        function(input) {

            const column =
                input.dataset.column;


            let value =
                input.value.trim();


            if (
                column === "A" ||
                column === "H"
            ) {

                value =
                    value
                        ? parseInt(value)
                        : "";

            }
            else if (
                [
                    "E",
                    "F",
                    "G",
                    "J",
                    "K",
                    "L",
                    "M",
                    "N",
                    "O",
                    "P",
                    "Q",
                    "R",
                    "S",
                    "T"
                ].includes(column)
            ) {

                value =
                    value
                        ? Number(value).toFixed(2)
                        : "0.00";

            }


            rowData[column] =
                value;

        }
    );


    return rowData;

}



/* ============================================================
   SYNC CURRENT PAGE → MEMORY
============================================================ */

function syncCurrentShikshanupakaranPageToMemory(){

    if(
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ){

        return;

    }


    const visibleRows =
        shikshanupakaranBody
            ? shikshanupakaranBody.querySelectorAll(
                ".shikshanupakaranRow"
            )
            : [];


    const startIndex =
        (
            window.shikshanupakaranCurrentPage -
            1
        ) *
        window.shikshanupakaranRowsPerPage;


    visibleRows.forEach(
        function(row, localIndex){

            const globalIndex =
                startIndex +
                localIndex;


            if(
                globalIndex <
                0 ||
                globalIndex >=
                window.shikshanupakaranAllRows.length
            ){

                return;

            }


            const rowData = {};


            const inputs =
                row.querySelectorAll(
                    "[data-column]"
                );


            inputs.forEach(
                function(input){

                    const column =
                        input.dataset.column;


                    if(!column){

                        return;

                    }


                    rowData[column] =
                        input.value ?? "";

                }
            );


            window.shikshanupakaranAllRows[
                globalIndex
            ] =
                rowData;

        }
    );


    console.log(
        "SHIKSHANUPAKARAN PAGE SYNCED:",
        window.shikshanupakaranCurrentPage
    );

}


/* ============================================================
   RENDER CURRENT PAGE
============================================================ */

function renderShikshanupakaranPage(
    pageNumber = 1
){

    /* ============================================================
       ENSURE MEMORY EXISTS
    ============================================================ */

    if(
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ){

        window.shikshanupakaranAllRows = [];

    }


    /* ============================================================
       PAGINATION STATE
    ============================================================ */

    if(
        typeof updateShikshanupakaranPaginationState ===
            "function"
    ){

        updateShikshanupakaranPaginationState();

    }


    /* ============================================================
       NORMALIZE PAGE NUMBER
    ============================================================ */

    pageNumber =
        Number(
            pageNumber
        );


    if(
        !Number.isFinite(
            pageNumber
        )
    ){

        pageNumber = 1;

    }


    pageNumber =
        Math.floor(
            pageNumber
        );


    /* ============================================================
       ROWS
    ============================================================ */

    const rows =
        window.shikshanupakaranAllRows;


    const totalRows =
        rows.length;


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    /* ============================================================
       TOTAL PAGES
    ============================================================ */

    const totalPages =
        Math.max(
            1,
            Math.ceil(
                totalRows /
                rowsPerPage
            )
        );


    window.shikshanupakaranTotalPages =
        totalPages;


    /* ============================================================
       CLAMP PAGE
    ============================================================ */

    pageNumber =
        Math.max(
            1,
            Math.min(
                pageNumber,
                totalPages
            )
        );


    window.shikshanupakaranCurrentPage =
        pageNumber;


    /* ============================================================
       CURRENT PAGE RANGE
    ============================================================ */

    const startIndex =
        (
            pageNumber - 1
        ) *
        rowsPerPage;


    const endIndex =
        Math.min(
            startIndex +
            rowsPerPage,
            totalRows
        );


    /* ============================================================
       CLEAR DOM ONLY
    ============================================================ */

    if(
        shikshanupakaranBody
    ){

        shikshanupakaranBody.innerHTML =
            "";

    }


    /* ============================================================
       RENDER FROM MASTER MEMORY
       
       IMPORTANT:
       Rendering NEVER syncs DOM back to memory.
    ============================================================ */

    for(
        let globalRowIndex = startIndex;
        globalRowIndex < endIndex;
        globalRowIndex++
    ){

        const rowData =
            rows[
                globalRowIndex
            ];


        createShikshanupakaranRow(
            rowData || {},
            globalRowIndex
        );

    }


    /* ============================================================
       UPDATE PAGINATION UI
    ============================================================ */

    if(
        typeof updateShikshanupakaranPaginationUI ===
            "function"
    ){

        updateShikshanupakaranPaginationUI();

    }


    /* ============================================================
       DEBUG
    ============================================================ */

    console.log(
        "SHIKSHANUPAKARAN PAGE RENDERED:",
        {
            currentPage:
                pageNumber,

            totalPages:
                totalPages,

            rowsPerPage:
                rowsPerPage,

            totalRows:
                totalRows,

            startIndex:
                startIndex,

            endIndex:
                endIndex,

            visibleRows:
                endIndex - startIndex
        }
    );

}


/* ============================================================
   UPDATE PAGINATION UI
============================================================ */

function updateShikshanupakaranPaginationUI(){

    const currentPage =
        window.shikshanupakaranCurrentPage;


    const totalPages =
        window.shikshanupakaranTotalPages;


    const totalRows =
        Array.isArray(
            window.shikshanupakaranAllRows
        )
            ? window.shikshanupakaranAllRows.length
            : 0;


    const pageInput =
        document.getElementById(
            "shikshanupakaranPageInput"
        );


    const totalPagesElement =
        document.getElementById(
            "shikshanupakaranTotalPages"
        );


    const pageInfo =
        document.getElementById(
            "shikshanupakaranPageInfo"
        );


    const firstButton =
        document.getElementById(
            "shikshanupakaranFirstPage"
        );


    const previousButton =
        document.getElementById(
            "shikshanupakaranPreviousPage"
        );


    const nextButton =
        document.getElementById(
            "shikshanupakaranNextPage"
        );


    const lastButton =
        document.getElementById(
            "shikshanupakaranLastPage"
        );


    /*
        Page input
    */

    if(pageInput){

        pageInput.value =
            currentPage;

    }


    /*
        Total pages
    */

    if(totalPagesElement){

        totalPagesElement.textContent =
            totalPages;

    }


    /*
        Row information
    */

    if(pageInfo){

        if(totalRows === 0){

            pageInfo.textContent =
                "Rows 0–0 of 0";

        }
        else{

            const startRow =
                (
                    currentPage -
                    1
                ) *
                window.shikshanupakaranRowsPerPage +
                1;


            const endRow =
                Math.min(
                    currentPage *
                    window.shikshanupakaranRowsPerPage,
                    totalRows
                );


            pageInfo.textContent =
                `Rows ${startRow}–${endRow} of ${totalRows}`;

        }

    }


    /*
        Buttons
    */

    if(firstButton){

        firstButton.disabled =
            currentPage <= 1;

    }


    if(previousButton){

        previousButton.disabled =
            currentPage <= 1;

    }


    if(nextButton){

        nextButton.disabled =
            currentPage >= totalPages;

    }


    if(lastButton){

        lastButton.disabled =
            currentPage >= totalPages;

    }

}





/* ============================================================
   PAGINATION BUTTON EVENTS
============================================================ */

function initializeShikshanupakaranPagination(){

    const firstButton =
        document.getElementById(
            "shikshanupakaranFirstPage"
        );


    const previousButton =
        document.getElementById(
            "shikshanupakaranPreviousPage"
        );


    const nextButton =
        document.getElementById(
            "shikshanupakaranNextPage"
        );


    const lastButton =
        document.getElementById(
            "shikshanupakaranLastPage"
        );


    const pageInput =
        document.getElementById(
            "shikshanupakaranPageInput"
        );



      if (firstButton) {

            firstButton.onclick = function () {
        
                goToShikshanupakaranPage(1);
        
            };
        
        }
        
        
        if (previousButton) {
        
            previousButton.onclick = function () {
        
                const currentPage =
                    Number(
                        window.shikshanupakaranCurrentPage
                    ) || 1;
        
        
                goToShikshanupakaranPage(
                    currentPage - 1
                );
        
            };
        
        }
        
        
        if (nextButton) {
        
            nextButton.onclick = function () {
        
                const currentPage =
                    Number(
                        window.shikshanupakaranCurrentPage
                    ) || 1;
        
        
                const totalPages =
                    Number(
                        window.shikshanupakaranTotalPages
                    ) || 1;
        
        
                if (currentPage >= totalPages) {
        
                    return;
        
                }
        
        
                goToShikshanupakaranPage(
                    currentPage + 1
                );
        
            };
        
        }
        
        
        if (lastButton) {
        
            lastButton.onclick = function () {
        
                const totalPages =
                    Number(
                        window.shikshanupakaranTotalPages
                    ) || 1;
        
        
                goToShikshanupakaranPage(
                    totalPages
                );
        
            };
        
        }
        
        
        if (pageInput) {
        
            pageInput.addEventListener(
                "change",
                function () {
        
                    let page =
                        parseInt(
                            pageInput.value,
                            10
                        );
        
        
                    const totalPages =
                        Number(window.shikshanupakaranTotalPages) || 1;
        
        
                    if (Number.isNaN(page)) {
        
                        page =
                            Number(
                                window.shikshanupakaranCurrentPage
                            ) || 1;
        
                    }
        
        
                    page =
                        Math.max(
                            1,
                            Math.min(
                                totalPages,
                                page
                            )
                        );
        
        
                    pageInput.value = page;
        
        
                    goToShikshanupakaranPage(
                        page
                    );
        
                }
            );
        
        
            pageInput.addEventListener(
                "keydown",
                function (event) {
        
                    if (event.key === "Enter") {
        
                        event.preventDefault();
        
                        pageInput.blur();
        
                    }
        
                }
            );
        
        }

  
    updateShikshanupakaranPaginationUI();


      console.log(
        "SHIKSHANUPAKARAN PAGINATION INITIALIZED"
    );
}


/* ============================================================
   INITIALIZE PAGINATION
============================================================ */

initializeShikshanupakaranPagination();



/* ============================================================
   REGISTER SHIKSHANUPAKARAN KEYBOARD NAVIGATION
============================================================ */

if (
    typeof registerKeyboardNavigation === "function" &&
    shikshanupakaranBody
) {

    registerKeyboardNavigation(
        shikshanupakaranBody,
        {
            inputSelector:
                ".shikshanupakaranInput"
        }
    );

}




function syncCurrentShikshanupakaranPageToMemory() {

    /* ============================================================
       SAFETY
    ============================================================ */

    if (
        !Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        return;

    }


    if (
        !shikshanupakaranBody
    ) {

        return;

    }


    /* ============================================================
       CURRENT PAGINATION STATE
    ============================================================ */

    const currentPage =
        Number(
            window.shikshanupakaranCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.shikshanupakaranRowsPerPage
        ) || 20;


    const startIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage;


    /* ============================================================
       GET VISIBLE ROWS
    ============================================================ */

    const visibleRows =
        shikshanupakaranBody.querySelectorAll(
            ".shikshanupakaranRow"
        );


    /* ============================================================
       SYNC EACH VISIBLE ROW
    ============================================================ */

    visibleRows.forEach(
        function(row, visibleIndex) {

            const memoryIndex =
                startIndex +
                visibleIndex;


            /* ----------------------------------------------------
               SAFETY
            ---------------------------------------------------- */

            if (
                memoryIndex < 0 ||
                memoryIndex >=
                    window.shikshanupakaranAllRows.length
            ) {

                return;

            }


            /* ----------------------------------------------------
               IMPORTANT:
               Preserve existing memory object.
            ---------------------------------------------------- */

            const existingRow =
                window.shikshanupakaranAllRows[
                    memoryIndex
                ] || {};


            /* ----------------------------------------------------
               READ INPUTS
            ---------------------------------------------------- */

            const inputs =
                row.querySelectorAll(
                    "input[data-column]"
                );


            inputs.forEach(
                function(input) {

                    const column =
                        input.dataset.column;


                    if (
                        column
                    ) {

                        existingRow[column] =
                            input.value ?? "";

                    }

                }
            );


            /* ----------------------------------------------------
               READ TEXTAREAS TOO
            ---------------------------------------------------- */

            const textareas =
                row.querySelectorAll(
                    "textarea[data-column]"
                );


            textareas.forEach(
                function(textarea) {

                    const column =
                        textarea.dataset.column;


                    if (
                        column
                    ) {

                        existingRow[column] =
                            textarea.value ?? "";

                    }

                }
            );


            /* ----------------------------------------------------
               READ SELECTS TOO
            ---------------------------------------------------- */

            const selects =
                row.querySelectorAll(
                    "select[data-column]"
                );


            selects.forEach(
                function(select) {

                    const column =
                        select.dataset.column;


                    if (
                        column
                    ) {

                        existingRow[column] =
                            select.value ?? "";

                    }

                }
            );


            /* ----------------------------------------------------
               SAVE BACK TO MEMORY
            ---------------------------------------------------- */

            window.shikshanupakaranAllRows[
                memoryIndex
            ] =
                existingRow;

        }
    );


    console.log(
        "CURRENT SHIKSHANUPAKARAN PAGE SYNCED:",
        {
            page:
                currentPage,

            startIndex:
                startIndex,

            visibleRows:
                visibleRows.length,

            endIndex:
                startIndex +
                visibleRows.length -
                1
        }
    );

}


/* ======================================================================================================================== */


function generateShikshanupakaranTotal() {

    /*
        Save the currently visible page
        into memory first.
    */

    syncCurrentShikshanupakaranPageToMemory();


    const totalColumns = [
        "C",
        "D",
        "E",
        "F",
        "G",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S"
    ];


    const totals = {};


    totalColumns.forEach(
        function(column){

            totals[column] = 0;

        }
    );


    /*
        Calculate totals across ALL rows
        in memory.
    */

    window.shikshanupakaranAllRows.forEach(
        function(rowData){

            if(
                !rowData ||
                typeof rowData !== "object"
            ){

                return;

            }


            totalColumns.forEach(
                function(column){

                    const value =
                        Number(
                            rowData[column]
                        ) || 0;


                    totals[column] +=
                        value;

                }
            );

        }
    );


    /*
        Round financial values.
    */

    totalColumns.forEach(
        function(column){

            totals[column] =
                Number(
                    totals[column].toFixed(2)
                );

        }
    );


    /*
        Store generated totals.
    */

    window.shikshanupakaranTotals =
        totals;


    window.shikshanupakaranTotalGenerated =
        true;


    /*
        Render total.
    */

    renderShikshanupakaranTotal();


    console.log(
        "SHIKSHANUPAKARAN GRAND TOTAL:",
        totals
    );

}


/* ============================================================
   GENERATE TOTAL BUTTON
============================================================ */

const generateShikshanupakaranTotalButton =
    document.getElementById(
        "generateShikshanupakaranTotalButton"
    );


if (
    generateShikshanupakaranTotalButton
) {

    generateShikshanupakaranTotalButton.addEventListener(
        "click",
        function () {

            console.log(
                "GENERATE TOTAL BUTTON CLICKED"
            );


            generateShikshanupakaranTotal();

        }
    );

}
else {

    console.error(
        "Generate Total button not found:"
        + " #generateShikshanupakaranTotalButton"
    );

}




/* ============================================================
   RENDER SHIKSHANUPAKARAN TOTAL
============================================================ */

/* ============================================================
   SHIKSHANUPAKARAN — GENERATED GRAND TOTAL
   SAFE PER RECORD + FINAL PAGE ONLY
============================================================ */

function renderShikshanupakaranTotal() {

    /* --------------------------------------------------------
       ALWAYS GET THE CURRENT EDITOR TABLE
    -------------------------------------------------------- */

    const table =
        document.getElementById(
            "shikshanupakaranTable"
        );

    if (!table) {
        return;
    }


    /* --------------------------------------------------------
       REMOVE ANY OLD TOTAL ROW FIRST
       This prevents a previous record's total from surviving.
    -------------------------------------------------------- */

    const oldTfoot =
        table.querySelector(
            "#shikshanupakaranTotalFooter"
        );

    if (oldTfoot) {

        oldTfoot.remove();

    }


    /* --------------------------------------------------------
       CURRENT RECORD
    -------------------------------------------------------- */

    const currentDocumentId =
        window.currentShikshanupakaranDocumentId ||
        currentShikshanupakaranDocumentId ||
        null;


    /* --------------------------------------------------------
       TOTAL MUST BELONG TO THIS RECORD
    -------------------------------------------------------- */

    const totalDocumentId =
        window.shikshanupakaranTotalDocumentId ||
        null;


    if (
        !window.shikshanupakaranTotalGenerated ||
        !window.shikshanupakaranTotals
    ) {

        return;

    }


    /*
       If the generated total belongs to another record,
       DO NOT DISPLAY IT.
    */

    if (
        totalDocumentId &&
        currentDocumentId &&
        totalDocumentId !== currentDocumentId
    ) {

        return;

    }


    /* --------------------------------------------------------
       PAGINATION
    -------------------------------------------------------- */

    const currentPage =
        Number(
            window.shikshanupakaranCurrentPage
        ) || 1;


    const totalPages =
        Number(
            window.shikshanupakaranTotalPages
        ) || 1;


    /*
       Total is shown ONLY on the last page.
    */

    if (
        currentPage !== totalPages
    ) {

        return;

    }


    /* --------------------------------------------------------
       CREATE TFOOT
    -------------------------------------------------------- */

    const tfoot =
        document.createElement(
            "tfoot"
        );

    tfoot.id =
        "shikshanupakaranTotalFooter";


    /* --------------------------------------------------------
       CREATE TOTAL ROW
    -------------------------------------------------------- */

    const row =
        document.createElement(
            "tr"
        );

    row.className =
        "shikshanupakaranGrandTotalRow";


    const columns = [
        "A","B","C","D","E","F","G",
        "H","I","J","K","L","M","N",
        "O","P","Q","R","S"
    ];


    columns.forEach(
        function(column) {

            const cell =
                document.createElement(
                    "td"
                );


            /* -----------------------------------------------
               A
            ------------------------------------------------ */

            if (
                column === "A"
            ) {

                cell.textContent = "";

            }


            /* -----------------------------------------------
               B
            ------------------------------------------------ */

            else if (
                column === "B"
            ) {

                cell.textContent =
                    "કુલ";

            }


            /* -----------------------------------------------
               NUMERIC TOTALS
            ------------------------------------------------ */

            else if (
                window.shikshanupakaranTotals[
                    column
                ] !== undefined
            ) {

                const value =
                    Number(
                        window.shikshanupakaranTotals[
                            column
                        ]
                    );


                cell.textContent =
                    Number.isFinite(value)
                        ? value.toFixed(2)
                        : "0.00";

            }


            /* -----------------------------------------------
               EMPTY
            ------------------------------------------------ */

            else {

                cell.textContent = "";

            }


            /* -----------------------------------------------
               HIDE R / S
            ------------------------------------------------ */

            if (
                column === "R" ||
                column === "S"
            ) {

                cell.classList.add(
                    "printHide"
                );

            }


            row.appendChild(
                cell
            );

        }
    );


    /* --------------------------------------------------------
       ACTION COLUMN
    -------------------------------------------------------- */

    const actionCell =
        document.createElement(
            "td"
        );

    actionCell.className =
        "printHide";


    row.appendChild(
        actionCell
    );


    /* --------------------------------------------------------
       ADD ROW
    -------------------------------------------------------- */

    tfoot.appendChild(
        row
    );


    table.appendChild(
        tfoot
    );


    console.log(
        "SHIKSHANUPAKARAN TOTAL RENDERED:",
        {
            documentId: currentDocumentId,
            page: currentPage,
            totalPages: totalPages
        }
    );

}



/* ============================================================
   SHIKSHANUPAKARAN — PAGINATION NAVIGATION
============================================================ */

function goToShikshanupakaranPage(page) {

    const totalPages =
        Number(
            window.shikshanupakaranTotalPages
        ) || 1;


    let targetPage =
        Number(page) || 1;


    /* ========================================================
       KEEP PAGE WITHIN VALID RANGE
    ======================================================== */

    targetPage =
        Math.max(
            1,
            Math.min(
                targetPage,
                totalPages
            )
        );


    console.log(
        "SHIKSHANUPAKARAN → GO TO PAGE:",
        {
            page: targetPage,
            totalPages: totalPages
        }
    );


    /* ========================================================
       SAVE CURRENT PAGE BEFORE LEAVING IT
       
       IMPORTANT:
       DOM → MEMORY only.
       This does NOT change the page.
    ======================================================== */

    if (
        typeof syncCurrentShikshanupakaranPageToMemory ===
        "function"
    ) {

        syncCurrentShikshanupakaranPageToMemory();

    }


    /* ========================================================
       RENDER REQUESTED PAGE
    ======================================================== */

    renderShikshanupakaranPage(
        targetPage
    );


    /* ========================================================
       UPDATE PAGINATION UI
    ======================================================== */

    if (
        typeof updateShikshanupakaranPaginationUI ===
        "function"
    ) {

        updateShikshanupakaranPaginationUI();

    }

}


/* ============================================================
   TALAPATRAK SYNC CARD
============================================================ */

function showTalapatrakSyncCard(
    moje,
    year
){

    return new Promise(
        function(resolve){

            const overlay =
                document.getElementById(
                    "talapatrakSyncOverlay"
                );


            const message =
                document.getElementById(
                    "talapatrakSyncMessage"
                );


            const confirmButton =
                document.getElementById(
                    "talapatrakSyncConfirmButton"
                );


            const cancelButton =
                document.getElementById(
                    "talapatrakSyncCancelButton"
                );


            /*
                SAFETY CHECK
            */

            if(
                !overlay ||
                !message ||
                !confirmButton ||
                !cancelButton
            ){

                console.error(
                    "TALAPATRAK SYNC CARD ELEMENTS NOT FOUND"
                );

                resolve(false);

                return;

            }


            /*
                MESSAGE
            */

            message.innerHTML =
                `
                Shikshanupakaran
                <strong>"${moje}"</strong>
                (${year})
                માટે Talapatrak record નથી.
                <br><br>
                શું તમે આ Shikshanupakaran ને
                Talapatrak સાથે sync કરવા માંગો છો?
                `;


            /*
                SHOW
            */

            overlay.style.display =
                "flex";


            /*
                CLEANUP
            */

            function closeCard(
                result
            ){

                overlay.style.display =
                    "none";


                confirmButton.onclick =
                    null;

                cancelButton.onclick =
                    null;


                overlay.onclick =
                    null;


                document.removeEventListener(
                    "keydown",
                    handleKeydown
                );


                resolve(
                    result
                );

            }


            /*
                CONFIRM
            */

            confirmButton.onclick =
                function(){

                    closeCard(true);

                };


            /*
                CANCEL
            */

            cancelButton.onclick =
                function(){

                    closeCard(false);

                };


            /*
                CLICK OUTSIDE
            */

            overlay.onclick =
                function(event){

                    if(
                        event.target ===
                        overlay
                    ){

                        closeCard(false);

                    }

                };


            /*
                ESCAPE
            */

            function handleKeydown(event){

                if(
                    event.key ===
                    "Escape"
                ){

                    closeCard(false);

                }

            }


            document.addEventListener(
                "keydown",
                handleKeydown
            );

        }
    );

}


/* ============================================================
   TALAPATRAK SYNC ASK-ONCE MEMORY
============================================================ */

function getTalapatrakSyncDecisionKey(
    moje,
    year
){

    if(
        !auth ||
        !auth.currentUser
    ){

        return null;

    }


    return (
        "talapatrakSyncDecision_" +
        auth.currentUser.uid +
        "_" +
        String(moje).trim() +
        "_" +
        String(year).trim()
    );

}


/* ============================================================
   GET PREVIOUS USER DECISION
============================================================ */

function getTalapatrakSyncDecision(
    moje,
    year
){

    const key =
        getTalapatrakSyncDecisionKey(
            moje,
            year
        );


    if(
        !key
    ){

        return null;

    }


    return localStorage.getItem(
        key
    );

}


/* ============================================================
   SAVE USER DECISION
============================================================ */

function saveTalapatrakSyncDecision(
    moje,
    year,
    decision
){

    const key =
        getTalapatrakSyncDecisionKey(
            moje,
            year
        );


    if(
        !key
    ){

        return;

    }


    localStorage.setItem(
        key,
        decision
    );


    console.log(
        "TALAPATRAK SYNC DECISION SAVED:",
        {
            moje,
            year,
            decision
        }
    );

}


async function syncShikshanupakaranToTalapatrak(
    shikshanupakaranData
){

    console.log(
        "###############################"
    );

    console.log(
        "SHIKSHANUPAKARAN → TALAPATRAK SYNC CALL"
    );

    console.log(
        "MOJE:",
        shikshanupakaranData?.moje
    );

    console.log(
        "YEAR:",
        shikshanupakaranData?.year
    );

    console.log(
        "DOCUMENT ID WILL BE:",
        getTalapatrakDocumentId(
            shikshanupakaranData?.moje,
            shikshanupakaranData?.year
        )
    );

    console.log(
        "###############################"
    );


    console.log(
        "================================================"
    );

    console.log(
        "SHIKSHANUPAKARAN → TALAPATRAK SYNC START"
    );

    console.log(
        "SYNC DATA:",
        shikshanupakaranData
    );


    try {


        /* ========================================================
           CHECK LOGIN
        ======================================================== */

        if (
            !auth ||
            !auth.currentUser
        ) {

            console.warn(
                "SHIKSHANUPAKARAN → TALAPATRAK SYNC → NO USER"
            );

            return false;

        }


        /* ========================================================
           VALIDATE DATA
        ======================================================== */

        if (
            !shikshanupakaranData
        ) {

            console.error(
                "SYNC FAILED → NO SHIKSHANUPAKARAN DATA"
            );

            return false;

        }


        /* ========================================================
           GET EXACT SHIKSHANUPAKARAN VALUES
        ======================================================== */

        const moje =
            String(
                shikshanupakaranData.moje ||
                ""
            ).trim();


        const taluka =
            String(
                shikshanupakaranData.taluka ||
                ""
            ).trim();


        const jillo =
            String(
                shikshanupakaranData.jillo ||
                ""
            ).trim();


        const year =
            String(
                shikshanupakaranData.year ||
                ""
            ).trim();


        const rows =
            Array.isArray(
                shikshanupakaranData.rows
            )
                ? shikshanupakaranData.rows
                : [];


        /* ========================================================
           REQUIRED VALUES
        ======================================================== */

        if (
            !moje
        ) {

            console.error(
                "SYNC FAILED → MOJE MISSING"
            );

            return false;

        }


        if (
            !year
        ) {

            console.error(
                "SYNC FAILED → YEAR MISSING"
            );

            return false;

        }


        console.log(
            "SYNC TARGET:",
            {
                moje,
                taluka,
                jillo,
                year,
                rowCount:
                    rows.length
            }
        );


        /* ========================================================
           TALAPATRAK DOCUMENT ID

           IMPORTANT:
           Use EXACT Shikshanupakaran year.
        ======================================================== */

        const talapatrakDocumentId =
            getTalapatrakDocumentId(
                moje,
                year
            );


        console.log(
            "TALAPATRAK SYNC TARGET DOCUMENT:",
            talapatrakDocumentId
        );


        /* ========================================================
           GET TALAPATRAK REFERENCE
        ======================================================== */

        const talapatrakRef =
            db
                .collection(
                    "talapatraks"
                )
                .doc(
                    talapatrakDocumentId
                );


        /* ========================================================
           CHECK WHETHER TALAPATRAK EXISTS
        ======================================================== */

        let talapatrakSnapshot =
            await talapatrakRef.get();


        /* ========================================================
           EXISTING TALAPATRAK
           
           If the destination already exists:
           
           → DO NOT ASK
           → DO NOT CREATE
           → SYNC IMMEDIATELY
        ======================================================== */

        if (
            talapatrakSnapshot.exists
        ) {

            console.log(
                "TALAPATRAK ALREADY EXISTS:",
                talapatrakDocumentId
            );


            const existingTalapatrak =
                talapatrakSnapshot.data() || {};


            const existingRows =
                Array.isArray(
                    existingTalapatrak.rows
                )
                    ? existingTalapatrak.rows
                    : [];


            /* ====================================================
               SYNC A + B

               Shikshanupakaran A → Talapatrak A
               Shikshanupakaran B → Talapatrak B

               ALL OTHER TALAPATRAK COLUMNS
               ARE PRESERVED.
            ==================================================== */

            const syncedRows =
                existingRows.map(
                    function(
                        talapatrakRow,
                        index
                    ){

                        const shikRow =
                            rows[index];


                        /*
                            No corresponding
                            Shikshanupakaran row.
                        */

                        if (
                            !shikRow
                        ) {

                            return talapatrakRow;

                        }


                        /*
                            Preserve complete
                            existing Talapatrak row.

                            Only replace A + B.
                        */

                        return {

                            ...talapatrakRow,

                            A:
                                shikRow.A ??
                                "",

                            B:
                                shikRow.B ??
                                ""

                        };

                    }
                );


            /* ====================================================
               SHIKSHANUPAKARAN HAS MORE ROWS

               Create missing Talapatrak rows
               with A + B.
            ==================================================== */

            if (
                rows.length >
                existingRows.length
            ) {

                for (
                    let index =
                        existingRows.length;

                    index <
                    rows.length;

                    index++
                ) {

                    const shikRow =
                        rows[index];


                    syncedRows.push({

                        A:
                            shikRow?.A ??
                            "",

                        B:
                            shikRow?.B ??
                            ""

                    });

                }

            }


            /* ====================================================
               SAVE UPDATED TALAPATRAK
            ==================================================== */

            await talapatrakRef.set({

                moje:
                    moje,

                taluka:
                    taluka ||
                    existingTalapatrak.taluka ||
                    "",

                jillo:
                    jillo ||
                    existingTalapatrak.jillo ||
                    "",

                year:
                    year,

                rows:
                    syncedRows,

                type:
                    "talapatrak",

                userId:
                    auth.currentUser.uid,

                updatedAt:
                    firebase.firestore.FieldValue
                    .serverTimestamp()

            }, {

                merge:
                    true

            });


            console.log(
                "================================================"
            );

            console.log(
                "A + B SYNC SUCCESS"
            );

            console.log(
                "SHIKSHANUPAKARAN A → TALAPATRAK A"
            );

            console.log(
                "SHIKSHANUPAKARAN B → TALAPATRAK B"
            );

            console.log(
                "Rows synced:",
                Math.min(
                    rows.length,
                    existingRows.length
                )
            );

            console.log(
                "================================================"
            );


            return true;

        }


        /* ========================================================
           TALAPATRAK DOES NOT EXIST

           NOW CHECK THE USER'S SAVED DECISION.

           sync     → automatically create
           never    → permanently skip
           nothing  → ask
           not_now  → deliberately NOT stored
                      therefore ask again next manual Save
        ======================================================== */

        const previousDecision =
            getTalapatrakSyncDecision(
                moje,
                year
            );


        /* ========================================================
           USER PREVIOUSLY CHOSE SYNC

           Automatically create/sync.
        ======================================================== */

        if (
            previousDecision ===
            "sync"
        ) {

            console.log(
                "TALAPATRAK SYNC APPROVED PREVIOUSLY → AUTO SYNC:",
                {
                    moje,
                    year
                }
            );

        }


        /* ========================================================
           USER PREVIOUSLY CHOSE NEVER

           Never ask again.
        ======================================================== */

        else if (
            previousDecision ===
            "never"
        ) {

            console.log(
                "TALAPATRAK SYNC PERMANENTLY DECLINED:",
                {
                    moje,
                    year
                }
            );

            return false;

        }


        /* ========================================================
           NO PERMANENT DECISION

           This includes:

               null
               not_now

           Therefore ASK AGAIN.

           This function should only be reached from
           MANUAL SAVE.
        ======================================================== */

        else {

            const decision =
                await showTalapatrakCreateModal(
                    moje,
                    year
                );


            console.log(
                "SHIKSHANUPAKARAN → TALAPATRAK USER DECISION:",
                {
                    moje,
                    year,
                    decision
                }
            );


            /* ====================================================
               SYNC & SAVE
            ==================================================== */

            if (
                decision ===
                "sync"
            ) {

                saveTalapatrakSyncDecision(
                    moje,
                    year,
                    "sync"
                );


                console.log(
                    "USER APPROVED TALAPATRAK SYNC:",
                    {
                        moje,
                        year
                    }
                );

            }


            /* ====================================================
               NEVER
            ==================================================== */

            else if (
                decision ===
                "never"
            ) {

                saveTalapatrakSyncDecision(
                    moje,
                    year,
                    "never"
                );


                console.log(
                    "USER SELECTED NEVER FOR TALAPATRAK SYNC:",
                    {
                        moje,
                        year
                    }
                );


                return false;

            }


            /* ====================================================
               NOT NOW

               IMPORTANT:

               Do NOT save "not_now".

               Therefore the next MANUAL SAVE
               will ask again.
            ==================================================== */

            else if (
                decision ===
                "not_now"
            ) {

                console.log(
                    "USER SELECTED NOT NOW FOR TALAPATRAK SYNC:",
                    {
                        moje,
                        year
                    }
                );


                return false;

            }


            /* ====================================================
               SAFETY FALLBACK
            ==================================================== */

            else {

                console.warn(
                    "UNKNOWN TALAPATRAK SYNC DECISION:",
                    decision
                );


                return false;

            }

        }


        /* ========================================================
           RE-CHECK DOCUMENT

           Important because the user may have just approved
           creation.
        ======================================================== */

        talapatrakSnapshot =
            await talapatrakRef.get();


        /* ========================================================
           BUILD NEW TALAPATRAK ROWS

           Shikshanupakaran A → Talapatrak A
           Shikshanupakaran B → Talapatrak B
        ======================================================== */

        const newTalapatrakRows =
            rows.map(
                function(
                    shikRow
                ){

                    return {

                        A:
                            shikRow?.A ??
                            "",

                        B:
                            shikRow?.B ??
                            ""

                    };

                }
            );


        console.log(
            "NEW TALAPATRAK ROWS:",
            newTalapatrakRows
        );


        /* ========================================================
           CREATE TALAPATRAK DATA
        ======================================================== */

        const newTalapatrakData = {

            type:
                "talapatrak",

            moje:
                moje,

            taluka:
                taluka,

            jillo:
                jillo,

            year:
                year,

            rows:
                newTalapatrakRows,

            rowCount:
                newTalapatrakRows.length,

            userId:
                auth.currentUser.uid,

            userEmail:
                auth.currentUser.email,

            createdAt:
                firebase.firestore.FieldValue
                .serverTimestamp(),

            updatedAt:
                firebase.firestore.FieldValue
                .serverTimestamp()

        };


        /* ========================================================
           SAVE NEW TALAPATRAK
        ======================================================== */

        await talapatrakRef.set(
            newTalapatrakData
        );


        console.log(
            "================================================"
        );

        console.log(
            "NEW TALAPATRAK CREATED FROM SHIKSHANUPAKARAN"
        );

        console.log(
            "Document ID:",
            talapatrakDocumentId
        );

        console.log(
            "Village:",
            moje
        );

        console.log(
            "Year:",
            year
        );

        console.log(
            "Rows:",
            newTalapatrakRows.length
        );

        console.log(
            "A + B COPIED SUCCESSFULLY"
        );

        console.log(
            "================================================"
        );


        return true;


    }
    catch (
        error
    ) {

        console.error(
            "SHIKSHANUPAKARAN → TALAPATRAK SYNC ERROR:",
            error
        );

        return false;

    }

}



/* ============================================================
   SHIKSHANUPAKARAN CREATE CONFIRMATION MODAL
============================================================ */

function showShikshanupakaranCreateModal(
    moje,
    year
){

    return new Promise(function(resolve){

        const modal =
            document.getElementById(
                "shikshanupakaranCreateModal"
            );


        if(!modal){

            console.error(
                "SHIKSHANUPAKARAN CREATE MODAL NOT FOUND"
            );

            resolve("not_now");

            return;

        }


        const villageText =
            document.getElementById(
                "shikshanupakaranCreateVillage"
            );


        const yearText =
            document.getElementById(
                "shikshanupakaranCreateYear"
            );


        const notNowButton =
            document.getElementById(
                "shikshanupakaranCreateNotNow"
            );


        const neverButton =
            document.getElementById(
                "shikshanupakaranCreateNever"
            );


        const confirmButton =
            document.getElementById(
                "shikshanupakaranCreateConfirm"
            );


        if(villageText){

            villageText.textContent =
                moje || "Unnamed Village";

        }


        if(yearText){

            yearText.textContent =
                year || "";

        }


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        let finished =
            false;


        function closeModal(
            result
        ){

            if(finished){

                return;

            }


            finished =
                true;


            console.log(
                "SHIKSHANUPAKARAN SYNC DECISION:",
                {
                    moje,
                    year,
                    decision:
                        result
                }
            );


            modal.classList.remove(
                "open"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            if(notNowButton){

                notNowButton.onclick =
                    null;

            }


            if(neverButton){

                neverButton.onclick =
                    null;

            }


            if(confirmButton){

                confirmButton.onclick =
                    null;

            }


            modal.onclick =
                null;


            document.removeEventListener(
                "keydown",
                handleEscape
            );


            resolve(
                result
            );

        }


        /* ========================================================
           ESCAPE

           Escape behaves like NOT NOW.

           It does not permanently reject syncing.
        ======================================================== */

        function handleEscape(
            event
        ){

            if(
                event.key ===
                "Escape"
            ){

                closeModal(
                    "not_now"
                );

            }

        }


        /* ========================================================
           NOT NOW
        ======================================================== */

        if(notNowButton){

            notNowButton.onclick =
                function(event){

                    event.preventDefault();

                    event.stopPropagation();

                    closeModal(
                        "not_now"
                    );

                };

        }


        /* ========================================================
           NEVER
        ======================================================== */

        if(neverButton){

            neverButton.onclick =
                function(event){

                    event.preventDefault();

                    event.stopPropagation();

                    closeModal(
                        "never"
                    );

                };

        }


        /* ========================================================
           SYNC & SAVE
        ======================================================== */

        if(confirmButton){

            confirmButton.onclick =
                function(event){

                    event.preventDefault();

                    event.stopPropagation();

                    closeModal(
                        "yes"
                    );

                };

        }


        /* ========================================================
           CLICK OUTSIDE

           Treat outside click as NOT NOW.
        ======================================================== */

        modal.onclick =
            function(event){

                if(
                    event.target.classList.contains(
                        "shikshanupakaranCreateOverlay"
                    )
                ){

                    closeModal(
                        "not_now"
                    );

                }

            };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        /* ========================================================
           INITIAL FOCUS

           Sync & Save is the safest primary action.
        ======================================================== */

        setTimeout(
            function(){

                if(confirmButton){

                    confirmButton.focus();

                }

            },
            50
        );

    });

}






/* ============================================================
   SHIKSHANUPAKARAN ALREADY EXISTS MODAL
============================================================ */

function showShikshanupakaranAlreadyExistsModal(
    moje,
    year
) {

    return new Promise(function(resolve) {

        const modal =
            document.getElementById(
                "shikshanupakaranAlreadyExistsModal"
            );

        if (!modal) {

            console.error(
                "Shikshanupakaran already-exists modal not found."
            );

            resolve();

            return;

        }


        const villageText =
            document.getElementById(
                "shikshanupakaranExistingVillage"
            );


        const yearText =
            document.getElementById(
                "shikshanupakaranExistingYear"
            );


        if (villageText) {

            villageText.textContent =
                moje || "Unnamed Village";

        }


        if (yearText) {

            yearText.textContent =
                year || "";

        }


        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        const closeButton =
            document.getElementById(
                "shikshanupakaranExistingClose"
            );


        function closeModal() {

            modal.classList.remove(
                "open"
            );

            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            document.removeEventListener(
                "keydown",
                handleEscape
            );


            resolve();

        }


        function handleEscape(event) {

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }

        }


        if (closeButton) {

            closeButton.onclick =
                function() {

                    closeModal();

                };

        }


        modal.onclick =
            function(event) {

                if (
                    event.target.classList.contains(
                        "shikshanupakaranExistingOverlay"
                    )
                ) {

                    closeModal();

                }

            };


        document.addEventListener(
            "keydown",
            handleEscape
        );


        setTimeout(
            function() {

                if (closeButton) {

                    closeButton.focus();

                }

            },
            50
        );

    });

}




/* ============================================================
   SHIKSHANUPAKARAN → TALAPATRAK SYNC CARD
============================================================ */

let shikshanupakaranTalapatrakSyncResolver =
    null;


/* ============================================================
   SHOW SYNC CARD
============================================================ */

function showShikshanupakaranTalapatrakSyncCard({

    moje,
    year

}){

    return new Promise(
        function(resolve){

            const overlay =
                document.getElementById(
                    "shikshanupakaranTalapatrakSyncOverlay"
                );


            const message =
                document.getElementById(
                    "shikshanupakaranTalapatrakSyncMessage"
                );


            const confirmButton =
                document.getElementById(
                    "confirmShikshanupakaranTalapatrakSync"
                );


            const cancelButton =
                document.getElementById(
                    "cancelShikshanupakaranTalapatrakSync"
                );


            if(
                !overlay ||
                !message ||
                !confirmButton ||
                !cancelButton
            ){

                console.error(
                    "SHIKSHANUPAKARAN → TALAPATRAK SYNC CARD ELEMENTS NOT FOUND"
                );


                resolve(false);

                return;

            }


            /*
                --------------------------------------------
                MESSAGE
                --------------------------------------------
            */

            message.textContent =
                `Shikshanupakaran "${moje}" (${year}) માટે Talapatrak record નથી.`;


            /*
                --------------------------------------------
                SHOW CARD
                --------------------------------------------
            */

            overlay.style.display =
                "flex";


            document.body.classList.add(
                "shikshanupakaranSyncCardOpen"
            );


            /*
                --------------------------------------------
                STORE RESOLVER
                --------------------------------------------
            */

            shikshanupakaranTalapatrakSyncResolver =
                resolve;


            /*
                --------------------------------------------
                RESET BUTTONS
                --------------------------------------------
            */

            confirmButton.disabled =
                false;

            cancelButton.disabled =
                false;


            /*
                --------------------------------------------
                FOCUS
                --------------------------------------------
            */

            setTimeout(
                function(){

                    confirmButton.focus();

                },
                50
            );

        }
    );

}



/* ============================================================
   SYNC CARD BUTTON HANDLERS
============================================================ */

function initializeShikshanupakaranTalapatrakSyncCard(){

    const overlay =
        document.getElementById(
            "shikshanupakaranTalapatrakSyncOverlay"
        );


    const confirmButton =
        document.getElementById(
            "confirmShikshanupakaranTalapatrakSync"
        );


    const cancelButton =
        document.getElementById(
            "cancelShikshanupakaranTalapatrakSync"
        );


    if(
        !overlay ||
        !confirmButton ||
        !cancelButton
    ){

        console.warn(
            "SHIKSHANUPAKARAN → TALAPATRAK SYNC CARD INITIALIZATION SKIPPED"
        );

        return;

    }


    /*
        ========================================================
        CONFIRM
        ========================================================
    */

    confirmButton.addEventListener(
        "click",
        function(){

            if(
                !shikshanupakaranTalapatrakSyncResolver
            ){

                return;

            }


            const resolve =
                shikshanupakaranTalapatrakSyncResolver;


            shikshanupakaranTalapatrakSyncResolver =
                null;


            closeShikshanupakaranTalapatrakSyncCard();


            resolve(true);

        }
    );


    /*
        ========================================================
        CANCEL
        ========================================================
    */

    cancelButton.addEventListener(
        "click",
        function(){

            if(
                !shikshanupakaranTalapatrakSyncResolver
            ){

                closeShikshanupakaranTalapatrakSyncCard();

                return;

            }


            const resolve =
                shikshanupakaranTalapatrakSyncResolver;


            shikshanupakaranTalapatrakSyncResolver =
                null;


            closeShikshanupakaranTalapatrakSyncCard();


            resolve(false);

        }
    );


    /*
        ========================================================
        CLICK OUTSIDE CARD = CANCEL
        ========================================================
    */

    overlay.addEventListener(
        "click",
        function(event){

            if(
                event.target !== overlay
            ){

                return;

            }


            if(
                !shikshanupakaranTalapatrakSyncResolver
            ){

                closeShikshanupakaranTalapatrakSyncCard();

                return;

            }


            const resolve =
                shikshanupakaranTalapatrakSyncResolver;


            shikshanupakaranTalapatrakSyncResolver =
                null;


            closeShikshanupakaranTalapatrakSyncCard();


            resolve(false);

        }
    );


    /*
        ========================================================
        ESCAPE = CANCEL
        ========================================================
    */

    document.addEventListener(
        "keydown",
        function(event){

            if(
                event.key !== "Escape"
            ){

                return;

            }


            if(
                overlay.style.display ===
                "none"
            ){

                return;

            }


            if(
                !shikshanupakaranTalapatrakSyncResolver
            ){

                closeShikshanupakaranTalapatrakSyncCard();

                return;

            }


            const resolve =
                shikshanupakaranTalapatrakSyncResolver;


            shikshanupakaranTalapatrakSyncResolver =
                null;


            closeShikshanupakaranTalapatrakSyncCard();


            resolve(false);

        }
    );

}


/* ============================================================
   CLOSE CARD
============================================================ */

function closeShikshanupakaranTalapatrakSyncCard(){

    const overlay =
        document.getElementById(
            "shikshanupakaranTalapatrakSyncOverlay"
        );


    if(overlay){

        overlay.style.display =
            "none";

    }


    document.body.classList.remove(
        "shikshanupakaranSyncCardOpen"
    );

}


document.addEventListener(
    "DOMContentLoaded",
    function(){

        initializeShikshanupakaranTalapatrakSyncCard();

    }
);









/* ============================================================
   SHIKSHANUPAKARAN DELETE MODAL
============================================================ */

let shikshanupakaranDeleteRecordPending = null;


/* ============================================================
   SHOW DELETE MODAL
============================================================ */

function showShikshanupakaranDeleteModal(record) {

    return new Promise(function(resolve) {

        console.log(
            "DELETE MODAL → OPEN REQUEST:",
            record
        );


        const modal =
            document.getElementById(
                "shikshanupakaranDeleteModal"
            );


        const villageNameElement =
            document.getElementById(
                "shikshanupakaranDeleteVillageName"
            );


        const yearElement =
            document.getElementById(
                "shikshanupakaranDeleteYear"
            );


        const cancelButton =
            document.getElementById(
                "shikshanupakaranDeleteCancelButton"
            );


        const confirmButton =
            document.getElementById(
                "shikshanupakaranDeleteConfirmButton"
            );


        if(
            !modal ||
            !villageNameElement ||
            !yearElement ||
            !cancelButton ||
            !confirmButton
        ){

            console.error(
                "DELETE MODAL → REQUIRED ELEMENT MISSING"
            );

            resolve(false);

            return;

        }


        /* ========================================================
           IMPORTANT:
           RESET BUTTON EVERY TIME MODAL OPENS
           
           This prevents:
           
           Card 1 → Delete
           → spinner
           
           Card 2 → opens with old spinner
           
           ======================================================== */

        confirmButton.disabled =
            false;


        confirmButton.innerHTML = `

            <i class="fa-solid fa-trash-can"></i>

            Delete Permanently

        `;


        /* ========================================================
           STORE CURRENT RECORD
        ======================================================== */

        shikshanupakaranDeleteRecordPending =
            record;


        /* ========================================================
           FILL MODAL
        ======================================================== */

        villageNameElement.textContent =
            record.moje ||
            "this village";


        yearElement.textContent =
            record.year ||
            "";


        /* ========================================================
           OPEN MODAL
        ======================================================== */

        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        console.log(
            "DELETE MODAL → OPENED:",
            record.id
        );


        /* ========================================================
           CANCEL
        ======================================================== */

        function handleCancel() {

            console.log(
                "DELETE MODAL → CANCELLED"
            );


            closeModal();

            cleanup();

            resolve(false);

        }


        /* ========================================================
           CONFIRM
        ======================================================== */

        async function handleConfirm() {

            console.log(
                "DELETE MODAL → CONFIRM CLICKED:",
                record.id
            );


            /*
                Prevent double click
            */

            if(
                confirmButton.disabled
            ){

                return;

            }


            confirmButton.disabled =
                true;


            confirmButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Deleting...

            `;


            try {

                const success =
                    await permanentlyDeleteShikshanupakaranRecord(
                        record
                    );


                console.log(
                    "DELETE MODAL → DELETE RESULT:",
                    success
                );


                closeModal();

                cleanup();

                resolve(
                    success
                );

            }
            catch(error) {

                console.error(
                    "DELETE MODAL → DELETE FAILED:",
                    error
                );


                /*
                    Restore button if deletion failed
                */

                confirmButton.disabled =
                    false;


                confirmButton.innerHTML = `

                    <i class="fa-solid fa-trash-can"></i>

                    Delete Permanently

                `;


                resolve(false);

            }

        }


        /* ========================================================
           OVERLAY
        ======================================================== */

        function handleOverlay(event) {

            if(
                event.target ===
                modal
            ){

                handleCancel();

            }

        }


        /* ========================================================
           ESC
        ======================================================== */

        function handleEscape(event) {

            if(
                event.key ===
                "Escape"
            ){

                handleCancel();

            }

        }


        /* ========================================================
           ATTACH LISTENERS
        ======================================================== */

        cancelButton.addEventListener(
            "click",
            handleCancel
        );


        confirmButton.addEventListener(
            "click",
            handleConfirm
        );


        modal.addEventListener(
            "click",
            handleOverlay
        );


        document.addEventListener(
            "keydown",
            handleEscape
        );


        /* ========================================================
           CLEANUP
        ======================================================== */

        function cleanup() {

            cancelButton.removeEventListener(
                "click",
                handleCancel
            );


            confirmButton.removeEventListener(
                "click",
                handleConfirm
            );


            modal.removeEventListener(
                "click",
                handleOverlay
            );


            document.removeEventListener(
                "keydown",
                handleEscape
            );


            shikshanupakaranDeleteRecordPending =
                null;

        }


        /* ========================================================
           CLOSE
        ======================================================== */

        function closeModal() {

            modal.classList.remove(
                "open"
            );


            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        }

    });

}