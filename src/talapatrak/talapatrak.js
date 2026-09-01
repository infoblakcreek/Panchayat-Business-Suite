console.log("TALAPATRAK JS FILE RUNNING");



/* ============================================================
        TALAPATRAK SYSTEM
        STEP 1: NAVIGATION + MANAGEMENT + EDITOR
============================================================ */


/* ============================================================
        ELEMENT REFERENCES
============================================================ */

const talapatrakNavElement =
    document.getElementById(

        "talapatrakNav"
    );


const dashboardViewElement =
    document.getElementById(
        "dashboardView"
    );


const talapatrakViewElement =
    document.getElementById(
        "talapatrakView"
    );


console.log(
    "TALAPATRAK VIEW DISPLAY:",
    talapatrakViewElement?.style.display,
    getComputedStyle(talapatrakViewElement).display
);


const talapatrakEditorViewElement =
    document.getElementById(
        "talapatrakEditorView"
    );


const backToDashboardButtonElement =
    document.getElementById(
        "backToDashboardFromTalapatrak"
    );


const backToTalapatrakManagementButton =
    document.getElementById(
        "backToTalapatrakManagement"
    );


const addTalapatrakButton =
    document.getElementById(
        "addTalapatrakButton"
    );


const emptyAddTalapatrakButton =
    document.getElementById(
        "emptyAddTalapatrakButton"
    );



window.talapatrakUnsavedRows =
    new Set();




if (backToTalapatrakManagementButton) {

    backToTalapatrakManagementButton.addEventListener(
        "click",
        function () {

            console.log(
                "Back to Talapatrak Management clicked"
            );

            // Hide editor
            const editorView =
                document.getElementById(
                    "talapatrakEditorView"
                );

            if (editorView) {

                editorView.style.display =
                    "none";

            }


            // Show management view
            const managementView =
                document.getElementById(
                    "talapatrakView"
                );

            if (managementView) {

                managementView.style.display =
                    "block";

            }


            console.log(
                "Returned to Talapatrak Management"
            );

        }
    );

}


if (talapatrakNavElement) {

    talapatrakNavElement.addEventListener(
        "click",
        async function(event) {

            event.preventDefault();

            hideAllViews();

            talapatrakViewElement.style.display =
                "block";


          console.log(
                "NAV OPEN — TALAPATRAK DISPLAY:",
                getComputedStyle(talapatrakViewElement).display
            );

            console.log(
                "NAV OPEN — COUNT DISPLAY:",
                getComputedStyle(talapatrakRecordCountElement).display,
                getComputedStyle(talapatrakRecordCountElement).visibility,
                getComputedStyle(talapatrakRecordCountElement).opacity
            );

            clearNavigationActiveState();

            talapatrakNavElement.classList.add(
                "active"
            );

            await loadTalapatrakRecords();

            window.scrollTo(
                0,
                0
            );

        }
    );

}

let talapatrakRecords = [];

/* ============================================================
        BACK TO TALAPATRAK MANAGEMENT
============================================================ */

if (backToTalapatrakManagementButton) {

    backToTalapatrakManagementButton.addEventListener(

        "click",

        async function() {

            /*
                Cancel any pending autosave timer.
            */

            if (talapatrakAutoSaveTimer) {

                clearTimeout(
                    talapatrakAutoSaveTimer
                );

                talapatrakAutoSaveTimer =
                    null;

            }


            /*
                Save the latest changes before leaving.
            */

            const mojeInput =
                document.getElementById(
                    "talapatrakMoje"
                );


            const moje =
                mojeInput
                    ?.value
                    ?.trim()
                    || "";


            /*
                Only save if village name exists.
            */

            if (moje) {

                await saveTalapatrak(
                    false
                );

            }


            await openTalapatrakManagement();

        }

    );

}

/* ============================================================
        CLEAR ACTIVE NAVIGATION
============================================================ */

function clearNavigationActiveState() {

    document
        .querySelectorAll(
            ".navItem"
        )
        .forEach(
            function(item) {

                item.classList.remove(
                    "active"
                );

            }
        );

}


/* ============================================================
        SET DEFAULT TALAPATRAK VIEW
============================================================ */

function initializeTalapatrakViews() {

    /*
        Make sure Talapatrak pages
        are hidden when app loads
    */

    if (talapatrakViewElement) {

        talapatrakViewElement.style.display =
            "none";

    }


    if (talapatrakEditorViewElement) {

        talapatrakEditorViewElement.style.display =
            "none";

    }

}


initializeTalapatrakViews();


console.log(
    "Talapatrak navigation initialized successfully."
);



 /* ==========================================================================*/

/* ============================================================
        TALAPATRAK MANAGEMENT CONTROLS
============================================================ */


/* ============================================================
        ELEMENT REFERENCES
============================================================ */

const talapatrakSortButtonElement =
    document.getElementById(
        "talapatrakSortButton"
    );


const talapatrakSortMenuElement =
    document.getElementById(
        "talapatrakSortMenu"
    );


const talapatrakSortLabelElement =
    document.getElementById(
        "talapatrakSortLabel"
    );


const talapatrakGridViewButtonElement =
    document.getElementById(
        "talapatrakGridViewButton"
    );


const talapatrakListViewButtonElement =
    document.getElementById(
        "talapatrakListViewButton"
    );


const talapatrakRecordCountElement =
    document.getElementById(
        "talapatrakRecordCount"
    );


const talapatrakManagementRecordCountElement =
    document.getElementById(
        "talapatrakRecordCountDisplay"
    );

const talapatrakVillageGridElement =
    document.getElementById(
        "talapatrakVillageGrid"
    );


const talapatrakEmptyStateElement =
    document.getElementById(
        "talapatrakEmptyState"
    );

console.log(
    "COUNT ELEMENT:",
    talapatrakRecordCountElement
);

/* ============================================================
        STATE
============================================================ */

let talapatrakSearchTerm =
    "";


let talapatrakSortMode =
    "recent";


let talapatrakViewMode =
    "grid";


/* ============================================================
   TALAPATRAK PAGINATION / VIRTUAL ROW STATE
============================================================ */

window.talapatrakAllRows = [];

window.talapatrakCurrentPage = 1;

window.talapatrakRowsPerPage = 20;

window.talapatrakTotalPages = 1;



/* ============================================================
   LOAD TALAPATRAK RECORDS
============================================================ */

async function loadTalapatrakRecords() {

    try {

        if (
            !auth ||
            !auth.currentUser
        ) {

            console.warn(
                "No user logged in. Cannot load Talapatrak records."
            );

            talapatrakRecords = [];

            console.log(
                "BEFORE RENDER MANAGEMENT CALL"
            );

            renderTalapatrakManagement();

            console.log(
                "AFTER RENDER MANAGEMENT CALL"
            );

            return;

        }


        /* ========================================================
           LOADING STATE
        ======================================================== */

        if (
            talapatrakVillageGridElement
        ) {

            talapatrakVillageGridElement.innerHTML = `

                <div class="talapatrakLoadingState">

                    <i class="fa-solid fa-spinner fa-spin"></i>

                    <p>
                        Loading Talapatrak records...
                    </p>

                </div>

            `;

        }


        /* ========================================================
           LOAD RECORDS
        ======================================================== */

        console.log(
            "LOAD TALAPATRAK → BEFORE FIRESTORE QUERY"
        );


        const snapshot =
            await db
                .collection("talapatraks")
                .where(
                    "userId",
                    "==",
                    auth.currentUser.uid
                )
                .get();


        console.log(
            "LOAD TALAPATRAK → FIRESTORE QUERY FINISHED"
        );


        /* ========================================================
           BUILD RECORD ARRAY
        ======================================================== */

        talapatrakRecords = [];


        snapshot.forEach(
            function(doc) {

                talapatrakRecords.push({

                    id:
                        doc.id,

                    ...doc.data()

                });

            }
        );


        console.log(
            "LOAD TALAPATRAK → RECORDS BUILT:",
            talapatrakRecords.length
        );


        console.log(
            "LOADED TALAPATRAK RECORDS:",
            talapatrakRecords
        );


        /* ========================================================
           COUNT
        ======================================================== */

        await loadTalapatrakCount();


        console.log(
            "LOAD TALAPATRAK → COUNT COMPLETE"
        );


        /* ========================================================
           RENDER
        ======================================================== */

        console.log(
            "BEFORE RENDER MANAGEMENT CALL"
        );


        renderTalapatrakManagement();


        console.log(
            "AFTER RENDER MANAGEMENT CALL"
        );


        console.log(
            "LOAD TALAPATRAK → FUNCTION COMPLETE"
        );

    }


    catch(error) {

        console.error(
            "Error loading Talapatrak records:",
            error
        );


        if (
            talapatrakVillageGridElement
        ) {

            talapatrakVillageGridElement.innerHTML = `

                <div class="talapatrakLoadingState">

                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <p>
                        Unable to load Talapatrak records.
                    </p>

                </div>

            `;

        }

    }

}



function syncVisibleTalapatrakRows() {

    const currentPage =
        Number(
            window.talapatrakCurrentPage
        ) || 1;


    const totalRows =
        Array.isArray(
            window.talapatrakAllRows
        )
            ? window.talapatrakAllRows.length
            : 0;


    const rowsPerPage =
        Number(
            window.talapatrakRowsPerPage
        ) ||
        Number(
            typeof TALAPATRAK_ROWS_PER_PAGE !== "undefined"
                ? TALAPATRAK_ROWS_PER_PAGE
                : 20
        ) ||
        20;


    if (!talapatrakBody) {

        return;

    }


    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        return;

    }


    const startIndex =
        (
            currentPage -
            1
        ) *
        rowsPerPage;


    const visibleRows =
        Array.from(
            talapatrakBody.querySelectorAll(
                ".talapatrakRow"
            )
        );


    console.log(
        "SYNC PAGE → MEMORY:",
        "Page:",
        currentPage,
        "Visible rows:",
        visibleRows.length,
        "Total memory rows:",
        window.talapatrakAllRows.length
    );


    visibleRows.forEach(
        function(row, visibleIndex) {

            const memoryIndex =
                startIndex +
                visibleIndex;


            if (
                memoryIndex < 0 ||
                memoryIndex >=
                    window.talapatrakAllRows.length
            ) {

                return;

            }


            const existingMemoryRow =
                window.talapatrakAllRows[
                    memoryIndex
                ];


            /*
             * NEVER replace the entire memory object
             * with a newly created blank object.
             */

            if (
                !existingMemoryRow ||
                typeof existingMemoryRow !==
                    "object"
            ) {

                return;

            }


            const columns = [
                "A",
                "B",
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
                "T",
                "U"
            ];


            columns.forEach(
                function(columnCode) {

                    const input =
                        row.querySelector(
                            ".column" +
                            columnCode
                        );


                    if (!input) {

                        return;

                    }


                    /*
                     * Only update the memory value
                     * from an actual DOM input.
                     */

                    existingMemoryRow[
                        columnCode
                    ] =
                        input.value;

                }
            );


            /*
             * Preserve global row number.
             */

            existingMemoryRow.A =
                memoryIndex + 1;

        }
    );


    console.log(
        "MEMORY AFTER SYNC:",
        JSON.stringify(
            window.talapatrakAllRows,
            null,
            2
        )
    );

}


function renderTalapatrakGrandTotalRow() {

    console.log(
        "======================================"
    );

    console.log(
        "RENDERING TALAPATRAK GRAND TOTAL ROW"
    );


    /* ========================================================
       FIND TABLE BODY
    ======================================================== */

    const tbody =
        document.getElementById(
            "talapatrakBody"
        );


    if (!tbody) {

        console.warn(
            "talapatrakBody not found."
        );

        return;

    }


    /* ========================================================
       GET TOTALS
    ======================================================== */

    const totals =
        window.talapatrakTotals;


    if (!totals) {

        console.warn(
            "No Talapatrak totals available."
        );

        return;

    }


    console.log(
        "TOTALS USED FOR GRAND TOTAL ROW:",
        totals
    );


    /* ========================================================
       REMOVE EXISTING GRAND TOTAL ROW
    ======================================================== */

    const existingRow =
        tbody.querySelector(
            ".talapatrakGrandTotalRow"
        );


    if (existingRow) {

        existingRow.remove();

    }


    /* ========================================================
       CREATE GRAND TOTAL ROW

       ACTUAL TABLE STRUCTURE:

       A
       B
       C
       D
       E
       F
       G
       H
       I
       J
       K
       L
       M
       N
       O
       P
       Q
       R
       S
       T
       U
       V
       ACTION
    ======================================================== */

    const totalRow =
        document.createElement(
            "tr"
        );


    totalRow.className =
        "talapatrakGrandTotalRow";


    /* ========================================================
       TOTAL VALUES
    ======================================================== */

    const values = [

        /* A */
        "કુલ",

        /* B */
        "",

        /* C */
        totals.C,

        /* D */
        totals.D,

        /* E */
        totals.E,

        /* F */
        totals.F,

        /* G */
        totals.G,

        /* H */
        totals.H,

        /* I */
        totals.I,

        /* J */
        totals.J,

        /* K */
        totals.K,

        /* L — Receipt Number */
        "",

        /* M — Date */
        "",

        /* N */
        totals.N,

        /* O */
        totals.O,

        /* P */
        totals.P,

        /* Q */
        totals.Q,

        /* R */
        totals.R,

        /* S */
        totals.S,

        /* T */
        totals.T,

        /* U */
        totals.U,

        /* V */
        "",

        /* ACTION */
        ""

    ];


    console.log(
        "GRAND TOTAL CELL COUNT:",
        values.length
    );


    /* ========================================================
       CREATE CELLS
    ======================================================== */

    values.forEach(
        function(value, index) {

            const cell =
                document.createElement(
                    "td"
                );


            /* ----------------------------------------------
               VALUE
            ---------------------------------------------- */

            if (
                value === undefined ||
                value === null
            ) {

                cell.textContent = "";

            }

            else {

                cell.textContent =
                    value;

            }


            /* ----------------------------------------------
               GRAND TOTAL LABEL
            ---------------------------------------------- */

            if (index === 0) {

                cell.classList.add(
                    "grandTotalLabel"
                );

            }


            /* ----------------------------------------------
               HIDE EDITOR-ONLY COLUMNS

               T  = index 19
               U  = index 20
               V  = index 21
               ACTION = index 22
            ---------------------------------------------- */

            if (
                index === 19 ||
                index === 20 ||
                index === 21 ||
                index === 22
            ) {

                cell.classList.add(
                    "printHide"
                );

            }


            totalRow.appendChild(
                cell
            );

        }
    );


    /* ========================================================
       SAFETY CHECK
    ======================================================== */

    const expectedColumns = 23;

    if (
        totalRow.children.length !==
        expectedColumns
    ) {

        console.warn(
            "GRAND TOTAL COLUMN MISMATCH:",
            totalRow.children.length,
            "expected:",
            expectedColumns
        );

    }


    /* ========================================================
       ADD GRAND TOTAL ROW
    ======================================================== */

    tbody.appendChild(
        totalRow
    );


    /* ========================================================
       CONFIRM RENDER
    ======================================================== */

    console.log(
        "GRAND TOTAL ROW RENDERED SUCCESSFULLY"
    );


    console.log(
        "GRAND TOTAL VALUES:",
        values
    );


    console.log(
        "GRAND TOTAL DOM CELLS:",
        totalRow.children.length
    );


    console.log(
        "======================================"
    );

}



function setCalculationEditorValue(
    id,
    value
) {

    const input =
        document.getElementById(
            id
        );


    if (!input) return;


    input.value =
        value === undefined ||
        value === null
            ? ""
            : value;

}




/* ============================================================
        TALAPATRAK SORT DROPDOWN
============================================================ */


/* ============================================================
        ELEMENT REFERENCES
============================================================ */

const talapatrakSortWrapperElement =
    document.querySelector(
        ".talapatrakSortWrapper"
    );


const talapatrakSortOptions =
    document.querySelectorAll(
        ".talapatrakSortOption"
    );


window.talapatrakOpeningInProgress = false;


/* ============================================================
        SORT DROPDOWN OPEN / CLOSE
============================================================ */

if (
    talapatrakSortButtonElement &&
    talapatrakSortMenuElement
) {

    talapatrakSortButtonElement.addEventListener(
        "click",
        function(event) {

            event.stopPropagation();

            talapatrakSortMenuElement.classList.toggle(
                "open"
            );

        }
    );

}

console.log(
    "SORT OPTIONS FOUND:",
    talapatrakSortOptions.length
);

talapatrakSortOptions.forEach(function(option) {

    option.addEventListener(
        "click",
        function() {

            talapatrakSortMode =
                this.dataset.sort;


            talapatrakSortOptions.forEach(function(btn){

                btn.classList.remove(
                    "active"
                );

            });


            this.classList.add(
                "active"
            );


            console.log(
                "BEFORE RENDER MANAGEMENT CALL"
            );

            renderTalapatrakManagement();

            console.log(
                "AFTER RENDER MANAGEMENT CALL"
            );

        }
    );

});

function sortTalapatrakRecords(records) {

    const sortedRecords = [
        ...records
    ];

    switch (talapatrakSortMode) {

        case "recent":

            sortedRecords.sort(function(a, b) {

                return getTimestamp(b.updatedAt)
                    -
                    getTimestamp(a.updatedAt);

            });

            break;


        case "oldest":

            sortedRecords.sort(function(a, b) {

                return getTimestamp(a.updatedAt)
                    -
                    getTimestamp(b.updatedAt);

            });

            break;


        case "az":

            sortedRecords.sort(function(a, b) {

                return String(a.moje || "")
                    .localeCompare(
                        String(b.moje || ""),
                        "gu"
                    );

            });

            break;


        case "za":

            sortedRecords.sort(function(a, b) {

                return String(b.moje || "")
                    .localeCompare(
                        String(a.moje || ""),
                        "gu"
                    );

            });

            break;

    }

    return sortedRecords;

}


/* ============================================================
        LIST VIEW
============================================================ */

if (
    talapatrakListViewButtonElement
) {

    talapatrakListViewButtonElement.addEventListener(

        "click",

        function() {

            talapatrakViewMode =
                "list";


            this.classList.add(
                "active"
            );


            if (
                talapatrakGridViewButtonElement
            ) {

                talapatrakGridViewButtonElement.classList.remove(
                    "active"
                );

            }


            if (
                talapatrakVillageGridElement
            ) {

                talapatrakVillageGridElement.classList.add(
                    "listView"
                );

            }

        }

    );

}

/* ============================================================
        GRID VIEW
============================================================ */

if (
    talapatrakGridViewButtonElement
) {

    talapatrakGridViewButtonElement.addEventListener(

        "click",

        function() {

            talapatrakViewMode =
                "grid";


            this.classList.add(
                "active"
            );


            if (
                talapatrakListViewButtonElement
            ) {

                talapatrakListViewButtonElement.classList.remove(
                    "active"
                );

            }


            if (
                talapatrakVillageGridElement
            ) {

                talapatrakVillageGridElement.classList.remove(
                    "listView"
                );

            }

        }

    );

}


/* ============================================================
        RENDER TALAPATRAK VILLAGE CARDS
============================================================ */

function renderTalapatrakManagement() {

    console.log(
        "RENDER MANAGEMENT CALLED:",
        talapatrakRecords.length
    );
    /*
        Get filtered records
    */

    const filteredRecords =
        getFilteredTalapatrakRecords();


    /*
        Sort records
    */

    const sortedRecords =
        sortTalapatrakRecords(
            filteredRecords
        );



    console.log(
          "GRID ELEMENT EXISTS:",
          !!talapatrakVillageGridElement
      );

    /*
        Update village count
    */

    if (
        talapatrakRecordCountElement
    ) {

        talapatrakRecordCountElement.textContent =
            sortedRecords.length;


          console.log(
                "COUNT ELEMENT EXISTS:",
                !!talapatrakRecordCountElement
            );

              console.log(
            "COUNT AFTER UPDATE:",
            talapatrakRecordCountElement.textContent
        );

    }


      if (
        talapatrakManagementRecordCountElement
    ) {

        talapatrakManagementRecordCountElement.textContent =
            sortedRecords.length;

    }

    /*
        Empty state
    */

    if (
        talapatrakEmptyStateElement
    ) {

        talapatrakEmptyStateElement.style.display =
            sortedRecords.length === 0
                ? "flex"
                : "none";

    }


    /*
        Stop if there are no records
    */

    if (
        !talapatrakVillageGridElement
    ) {

        return;

    }


    /*
        Remove old cards
        but keep empty state
    */

    const existingCards =
        talapatrakVillageGridElement.querySelectorAll(
            ".talapatrakVillageCard"
        );


    existingCards.forEach(

        function(card) {

            card.remove();

        }

    );


    const loadingState =
        talapatrakVillageGridElement.querySelector(
            ".talapatrakLoadingState"
        );


    if(loadingState){

        loadingState.remove();

    }

    console.log(
        "RECORDS BEING USED TO CREATE CARDS:",
        sortedRecords.map(
            function(record) {

                return {
                    id: record.id,
                    moje: record.moje,
                    rows: Array.isArray(record.rows)
                        ? record.rows.length
                        : 0
                };

            }
        )
    );

    console.log(
        "GRID ELEMENT:",
        talapatrakVillageGridElement
    );


    if (talapatrakViewMode === "list") {

      talapatrakVillageGridElement.classList.add(
          "listView"
      );

      } else {

          talapatrakVillageGridElement.classList.remove(
              "listView"
          );

      }

    /*
        Create a card for every village
    */

    sortedRecords.forEach(

        function(record) {


            const card =
                createTalapatrakVillageCard(
                    record
                );


            talapatrakVillageGridElement.appendChild(
                card
            );

        }

    );


    console.log(
        "Talapatrak cards rendered:",
        sortedRecords.length
    );


          console.log(
            "AFTER TALAPATRAK CARDS RENDERED"
        );

}


/* ============================================================
        CREATE TALAPATRAK VILLAGE CARD
============================================================ */

function createTalapatrakVillageCard(
    record
) {


    /*
        Create card
    */

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "talapatrakVillageCard";

      card.dataset.id =
          record.id;


    /*
        Safely get values
    */

    const villageName =
        record.moje ||
        "Unnamed Village";


    const taluka =
        record.taluka ||
        "—";


    const jillo =
        record.jillo ||
        "—";


    const year =
        record.year ||
        "2025-2026";


    const rowCount =
        Array.isArray(
            record.rows
        )
            ? record.rows.length
            : 0;


    /*
        Format updated date
    */

    let updatedText =
        "Not updated yet";


    if (
        record.updatedAt
    ) {

        const updatedDate =
            record.updatedAt?.toDate
                ? record.updatedAt.toDate()
                : new Date(
                    record.updatedAt
                );


        if (
            !isNaN(
                updatedDate
            )
        ) {

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
        Card HTML
    */

    card.innerHTML = `

        <!-- CARD HEADER -->

        <div
            class="talapatrakVillageCardHeader">


            <div
                class="talapatrakVillageIcon">

                <i
                    class="fa-solid fa-location-dot">
                </i>

            </div>


            <div
                class="talapatrakVillageTitle">

                <h3>
                    ${escapeTalapatrakHTML(
                        villageName
                    )}
                </h3>

                <span>
                    Talapatrak
                </span>

            </div>


            <!-- CARD MENU -->

            <div
                class="talapatrakCardMenuWrapper">


                <button
                    type="button"
                    class="talapatrakCardMenuButton"
                    title="More options">

                    <i
                        class="fa-solid fa-ellipsis-vertical">
                    </i>

                </button>


                <!-- DROPDOWN MENU -->

                <div class="talapatrakCardMenu">


                    <!-- RENAME -->

                        <button
                            type="button"
                            class="talapatrakCardMenuItem"
                            data-action="rename">

                            <i class="fa-solid fa-pen"></i>

                            <span>
                                Rename
                            </span>

                        </button>


                        <!-- COPY -->

                        <button
                            type="button"
                            class="talapatrakCardMenuItem"
                            data-action="copy">

                            <i class="fa-solid fa-copy"></i>

                            <span>
                                Copy
                            </span>

                        </button>


                        <!-- DUPLICATE -->

                        <button
                            type="button"
                            class="talapatrakCardMenuItem"
                            data-action="duplicate">

                            <i class="fa-solid fa-clone"></i>

                            <span>
                                Duplicate
                            </span>

                        </button>




                      <!-- DIVIDER -->

                      <div class="talapatrakCardMenuDivider"></div>


                      <!-- DELETE -->


                    <button
                        class="talapatrakCardMenuItem delete"
                        data-action="delete">


                        <i class="fa-solid fa-trash"></i>


                        Delete


                    </button>


                </div>

        </div>


        <!-- CARD DETAILS -->

        <div
            class="talapatrakVillageDetails">


            <div
                class="talapatrakVillageDetail">


                <strong>
                    ${escapeTalapatrakHTML(
                        year
                    )}
                </strong>


            </div>


            <div
                class="talapatrakVillageDetail">


                <span>
                    Records
                </span>


                <strong>
                    ${rowCount}
                </strong>


            </div>


        </div>


        <!-- CARD FOOTER -->

        <div
            class="talapatrakVillageCardFooter">


            <span
                class="talapatrakLastUpdated">


                <i
                    class="fa-regular fa-clock">
                </i>


                Updated ${updatedText}


            </span>



        </div>

    `;


    /*
        Open card when clicking
    */

     card.addEventListener(
          "click",
          function(event) {

              console.log(
                    "CARD CLICKED:",
                    record.id
                );


              if (
                  event.target.closest(
                      ".talapatrakCardMenuWrapper"
                  )
              ) {

                  console.log(
                      "CLICK WAS ON CARD MENU"
                  );

                  return;

              }


              event.preventDefault();
              event.stopPropagation();


              console.log(
                  "OPENING RECORD:",
                  record.id
              );

              openTalapatrakRecord(
                  record
              );

          }
      );


      /* ============================================================
        CARD MENU
============================================================ */

const menuButton =
    card.querySelector(
        ".talapatrakCardMenuButton"
    );


const cardMenu =
    card.querySelector(
        ".talapatrakCardMenu"
    );


const deleteButton =
    card.querySelector(
        '[data-action="delete"]'
    );




  /* ============================================================
   RENAME / COPY / DUPLICATE BUTTONS
============================================================ */

const renameButton =
    card.querySelector(
        '[data-action="rename"]'
    );


const copyButton =
    card.querySelector(
        '[data-action="copy"]'
    );


const duplicateButton =
    card.querySelector(
        '[data-action="duplicate"]'
    );


/* ============================================================
   RENAME
============================================================ */

if (renameButton) {

    renameButton.addEventListener(

        "click",

        async function(event) {

            event.preventDefault();
            event.stopPropagation();


            /*
                Close menu
            */

            cardMenu.classList.remove(
                "open"
            );


            /*
                Current name
            */

            const currentName =
                record.moje ||
                "";


            /*
                Ask for new village name
            */

            const newName =
                prompt(
                    "Enter the new village name:",
                    currentName
                );


            /*
                Cancelled
            */

            if (
                newName === null
            ) {

                return;

            }


            const trimmedName =
                newName.trim();


            /*
                Empty name
            */

            if (!trimmedName) {

                alert(
                    "Village name cannot be empty."
                );

                return;

            }


            /*
                Same name
            */

            if (
                trimmedName === currentName
            ) {

                return;

            }


            /*
                Login check
            */

            if (
                !auth.currentUser
            ) {



                return;

            }


            try {

                /*
                    Existing document
                */

                const oldDocumentReference =
                    db
                        .collection(
                            "talapatraks"
                        )
                        .doc(
                            record.id
                        );


                /*
                    New document ID

                    The document ID is based on
                    village + year.
                */

                const newDocumentId =
                    getTalapatrakDocumentId(
                        trimmedName,
                        record.year
                    );


                /*
                    Prevent accidental overwrite
                */

                const newDocumentReference =
                    db
                        .collection(
                            "talapatraks"
                        )
                        .doc(
                            newDocumentId
                        );


                const existingNewDocument =
                    await newDocumentReference.get();


                if (
                      existingNewDocument.exists
                  ) {

                      await showTalapatrakAlreadyExistsModal(
                          trimmedName,
                          record.year
                      );

                      return;

                  }


                /*
                    Create renamed record
                */

                const renamedData = {

                    ...record,

                    id:
                        undefined,

                    moje:
                        trimmedName,

                    updatedAt:
                        firebase.firestore.FieldValue
                            .serverTimestamp()

                };


                /*
                    Remove local ID because
                    Firebase data should not contain
                    the old document ID.
                */

                delete renamedData.id;


                /*
                    Save new document
                */

                await newDocumentReference.set(
                    renamedData,
                    {
                        merge: true
                    }
                );


                /*
                    Delete old document
                */

                await oldDocumentReference.delete();


                /*
                    Update local current record
                    if this is the currently opened
                    Talapatrak.
                */

                if (
                    currentTalapatrakDocumentId ===
                    record.id
                ) {

                    currentTalapatrakDocumentId =
                        newDocumentId;


                    currentTalapatrakRecord = {

                        id:
                            newDocumentId,

                        ...renamedData

                    };

                }


                /*
                    Update card immediately
                */

                const title =
                    card.querySelector(
                        ".talapatrakVillageTitle h3"
                    );


                if (title) {

                    title.textContent =
                        trimmedName;

                }


                /*
                    Update card dataset
                */

                card.dataset.id =
                    newDocumentId;


                /*
                    Update local record
                */

                record.id =
                    newDocumentId;

                record.moje =
                    trimmedName;


                console.log(
                    "Talapatrak renamed:",
                    newDocumentId
                );


            }

            catch(error) {

                console.error(
                    "Error renaming Talapatrak:",
                    error
                );


                alert(
                    "Talapatrak could not be renamed: " +
                    error.message
                );

            }

        }

    );

}


/* ============================================================
   COPY
   ------------------------------------------------------------
   Copies the Talapatrak data to clipboard.
============================================================ */

if (copyButton) {

    copyButton.addEventListener(

        "click",

        async function(event) {

            event.preventDefault();
            event.stopPropagation();


            cardMenu.classList.remove(
                "open"
            );


            try {

                /*
                    Create a clean copy of the
                    useful Talapatrak data.
                */

                const copyData = {

                    moje:
                        record.moje || "",

                    taluka:
                        record.taluka || "",

                    jillo:
                        record.jillo || "",

                    year:
                        record.year || "",

                    rows:
                        Array.isArray(record.rows)
                            ? record.rows
                            : []

                };


                const text =
                    JSON.stringify(
                        copyData,
                        null,
                        2
                    );


                /*
                    Modern clipboard
                */

                await navigator.clipboard.writeText(
                    text
                );



                console.log(
                    "Talapatrak copied:",
                    record.id
                );

            }

            catch(error) {

                console.error(
                    "Could not copy Talapatrak:",
                    error
                );


                alert(
                    "Talapatrak could not be copied."
                );

            }

        }

    );

}


/* ============================================================
   DUPLICATE
============================================================ */

if (duplicateButton) {

    duplicateButton.addEventListener(

        "click",

        async function(event) {

            event.preventDefault();
            event.stopPropagation();


            cardMenu.classList.remove(
                "open"
            );


            if (
                !auth.currentUser
            ) {

                return;

            }


            /*
                Ask for duplicate name
            */

            const originalName =
                record.moje ||
                "Talapatrak";


            const suggestedName =
                `${originalName} (Copy)`;


            const duplicateName =
                prompt(
                    "Name for the duplicated Talapatrak:",
                    suggestedName
                );


            /*
                Cancelled
            */

            if (
                duplicateName === null
            ) {

                return;

            }


            const trimmedName =
                duplicateName.trim();


            if (!trimmedName) {

                alert(
                    "Village name cannot be empty."
                );

                return;

            }


            try {

                /*
                    Create new document ID
                */

                const duplicateDocumentId =
                    getTalapatrakDocumentId(
                        trimmedName,
                        record.year
                    );


                const duplicateReference =
                    db
                        .collection(
                            "talapatraks"
                        )
                        .doc(
                            duplicateDocumentId
                        );


                /*
                    Check if it already exists
                */

                const existingDuplicate =
                    await duplicateReference.get();


                if (
                    existingDuplicate.exists
                ) {

                     await showTalapatrakAlreadyExistsModal(
                          trimmedName,
                          record.year
                      );

                      return;

                }


                /*
                    IMPORTANT:
                    Create a completely independent
                    rows array.

                    Changes to the duplicate will
                    NOT affect the original.
                */

                const duplicatedRows =
                    Array.isArray(record.rows)
                        ? JSON.parse(
                            JSON.stringify(
                                record.rows
                            )
                        )
                        : [];


                const duplicatedData = {

                    type:
                        "talapatrak",

                    moje:
                        trimmedName,

                    taluka:
                        record.taluka || "",

                    jillo:
                        record.jillo || "",

                    year:
                        record.year,

                    rows:
                        duplicatedRows,

                    rowCount:
                        duplicatedRows.length,

                    userId:
                        auth.currentUser.uid,

                    userEmail:
                        auth.currentUser.email,

                    updatedAt:
                        firebase.firestore.FieldValue
                            .serverTimestamp()

                };


                /*
                    Save duplicate
                */

                await duplicateReference.set(
                    duplicatedData
                );


                /*
                    Update management count
                */

                await loadTalapatrakCount();


                console.log(
                    "Talapatrak duplicated:",
                    duplicateDocumentId
                );


            }

            catch(error) {

                console.error(
                    "Error duplicating Talapatrak:",
                    error
                );


                alert(
                    "Talapatrak could not be duplicated: " +
                    error.message
                );

            }

        }

    );

}

/* ============================================================
        OPEN / CLOSE THREE-DOT MENU
============================================================ */

if (
    menuButton &&
    cardMenu
) {

    menuButton.addEventListener(

        "click",

        function(event) {

            /*
                VERY IMPORTANT
                Prevent card click
                and document click
            */

            event.preventDefault();

            event.stopPropagation();


            /*
                Close every other menu
            */

            document
                .querySelectorAll(
                    ".talapatrakCardMenu.open"
                )
                .forEach(

                    function(menu) {

                        if (
                            menu !== cardMenu
                        ) {

                            menu.classList.remove(
                                "open"
                            );

                        }

                    }

                );


            /*
                Toggle this menu
            */

            cardMenu.classList.toggle(
                "open"
            );


            console.log(
                "Talapatrak menu clicked"
            );

        }

    );

}


/* ============================================================
        DELETE BUTTON
============================================================ */

if (
    deleteButton
) {

    deleteButton.addEventListener(

        "click",

        async function(event) {

            event.preventDefault();

            event.stopPropagation();


            /*
                Close menu immediately
            */

            if (
                cardMenu
            ) {

                cardMenu.classList.remove(
                    "open"
                );

            }


            /*
                Open delete confirmation modal
            */

            await showTalapatrakDeleteModal(
                record
            );

        }

    );

}



      console.log(
        "CARD CREATION COMPLETE:",
        record.id
    );

    return card;

}

/* ============================================================
        DELETE TALAPATRAK RECORD
============================================================ */


async function permanentlyDeleteTalapatrakRecord(record) {

    if(
        !record ||
        !record.id
    ){

        console.error(
            "Cannot delete Talapatrak: invalid record."
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
            "TALAPATRAK DELETE → FIRESTORE DELETE START:",
            record.id
        );


        /* ========================================================
           DELETE FIRESTORE DOCUMENT
        ======================================================== */

        await db
            .collection(
                "talapatraks"
            )
            .doc(
                record.id
            )
            .delete();


        console.log(
            "TALAPATRAK DELETE → FIRESTORE DELETE COMPLETE:",
            record.id
        );


        /* ========================================================
           REMOVE FROM LOCAL ARRAY
        ======================================================== */

        const index =
            talapatrakRecords.findIndex(
                function(item) {

                    return item.id ===
                        record.id;

                }
            );


        if(index >= 0) {

            talapatrakRecords.splice(
                index,
                1
            );

        }


        /* ========================================================
           CLEAR CURRENT STATE
        ======================================================== */

        if(
            currentTalapatrakDocumentId ===
            record.id
        ){

            currentTalapatrakDocumentId =
                null;


            currentTalapatrakRecord =
                null;

        }


        /* ========================================================
           REFRESH MANAGEMENT
        ======================================================== */

        renderTalapatrakManagement();


        /* ========================================================
           ACTIVITY
        ======================================================== */

        await addTalapatrakActivity(

            "talapatrak_deleted",

            "Talapatrak deleted",

            `${villageName} ${year} Talapatrak deleted`,

            villageName

        );


        console.log(
            "Talapatrak deleted:",
            record.id
        );


        return true;

    }
    catch(error) {

        console.error(
            "Talapatrak delete error:",
            error
        );


        alert(
            "Unable to delete Talapatrak."
        );


        return false;

    }

}
/* ============================================================
        CLOSE CARD MENUS WHEN CLICKING OUTSIDE
============================================================ */

document.addEventListener(

    "click",

    function(event) {


        /*
            If click happened inside
            a card menu wrapper,
            do nothing
        */

        if (

            event.target.closest(
                ".talapatrakCardMenuWrapper"
            )

        ) {

            return;

        }


        /*
            Otherwise close all menus
        */

        document
            .querySelectorAll(
                ".talapatrakCardMenu.open"
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

function escapeTalapatrakHTML(
    value
) {

    return String(
        value
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}


/* ============================================================
        INITIAL RENDER
============================================================ */

console.log(
    "BEFORE RENDER MANAGEMENT CALL"
);

renderTalapatrakManagement();

console.log(
    "AFTER RENDER MANAGEMENT CALL"
);



/*============================================================================*/

/* ============================================================
        TALAPATRAK SYSTEM
        DYNAMIC FINANCIAL YEAR + MANAGEMENT + EDITOR
============================================================ */


/* ============================================================
        GLOBAL STATE
============================================================ */

let currentTalapatrakRecord = null;

let currentTalapatrakDocumentId = null;

/* ============================================================
        DYNAMIC FINANCIAL YEAR
        YEAR CHANGES EVERY 1 AUGUST
============================================================ */

function getCurrentTalapatrakYear() {

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

function getPreviousTalapatrakYear(year) {

    const startYear =
        Number(
            String(year)
                .split("-")[0]
        );

    return `${startYear - 1}-${startYear}`;

}


/* ============================================================
        CREATE NEW YEAR TALAPATRAK DUPLICATES
============================================================ */

async function createNextYearTalapatrakCopies() {

    console.log(
        "YEAR COPY → FUNCTION START"
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
                "YEAR COPY → NO USER LOGGED IN"
            );

            return;

        }


        /* ========================================================
           PREVENT DUPLICATE SIMULTANEOUS RUNS
        ======================================================== */

        if (
            window.talapatrakYearCopyInProgress
        ) {

            console.log(
                "YEAR COPY → ALREADY RUNNING, SKIPPING"
            );

            return;

        }


        window.talapatrakYearCopyInProgress =
            true;


        /* ========================================================
           GET YEARS
        ======================================================== */

        const currentYear =
            getCurrentTalapatrakYear();


        /*
        ============================================================
            INITIAL SYSTEM YEAR PROTECTION

            GamSetu is being introduced in 2026.

            During 2026, users are entering existing
            Talapatrak records manually.

            Therefore the automatic annual-copy system
            must NOT create 2026-2027 records.

            Automatic yearly copying begins from
            August 1, 2027.
        ============================================================
        */

        const currentStartYear =
            Number(
                String(currentYear)
                    .split("-")[0]
            );


        if (
            currentStartYear < 2027
        ) {

            console.log(
                "YEAR COPY → AUTOMATIC COPYING DISABLED FOR INITIAL 2026 SYSTEM YEAR:",
                currentYear
            );

            return;

        }


        const previousYear =
            getPreviousTalapatrakYear(
                currentYear
            );


        console.log(
            "YEAR COPY → CHECKING:",
            previousYear,
            "→",
            currentYear
        );


        /* ========================================================
           LOAD PREVIOUS YEAR RECORDS
        ======================================================== */

        const previousSnapshot =
            await db
                .collection(
                    "talapatraks"
                )
                .where(
                    "userId",
                    "==",
                    auth.currentUser.uid
                )
                .where(
                    "year",
                    "==",
                    previousYear
                )
                .get();


        console.log(
            "YEAR COPY → PREVIOUS RECORD COUNT:",
            previousSnapshot.size
        );


        /* ========================================================
           NOTHING TO COPY
        ======================================================== */

        if (
            previousSnapshot.empty
        ) {

            console.log(
                "YEAR COPY → NOTHING TO COPY"
            );

            return;

        }


        /* ========================================================
           PROCESS PREVIOUS YEAR RECORDS
        ======================================================== */

        for (
            const oldDoc of previousSnapshot.docs
        ) {

            const oldData =
                oldDoc.data();


            const villageName =
                oldData.moje;


            /* ====================================================
               VALIDATE VILLAGE
            ==================================================== */

            if (
                !villageName
            ) {

                console.warn(
                    "YEAR COPY → SKIPPING RECORD WITHOUT VILLAGE:",
                    oldDoc.id
                );

                continue;

            }


            /* ====================================================
               CREATE NEW DOCUMENT ID
            ==================================================== */

            const newDocumentId =
                getTalapatrakDocumentId(
                    villageName,
                    currentYear
                );


            const newDocumentRef =
                db
                    .collection(
                        "talapatraks"
                    )
                    .doc(
                        newDocumentId
                    );


            console.log(
                "YEAR COPY → CHECKING:",
                newDocumentId
            );


            /* ====================================================
               CHECK WHETHER CURRENT YEAR ALREADY EXISTS
            ==================================================== */

            const existingSnapshot =
                await newDocumentRef.get();


            if (
                existingSnapshot.exists
            ) {

                console.log(
                    "YEAR COPY → ALREADY EXISTS:",
                    newDocumentId
                );

                continue;

            }


            /* ====================================================
               COPY ROWS

               NEW YEAR RULE:

               C ← Q
               K ← R
            ==================================================== */

            const oldRows =
                Array.isArray(
                    oldData.rows
                )
                    ? oldData.rows
                    : [];


            const newRows =
                oldRows.map(
                    function(row) {

                        return {

                            ...row,

                            C:
                                row.Q || "",

                            K:
                                row.R || ""

                        };

                    }
                );


            /* ====================================================
               CREATE NEW RECORD DATA
            ==================================================== */

            const newData = {

                ...oldData,

                year:
                    currentYear,

                rows:
                    newRows,

                rowCount:
                    newRows.length,

                updatedAt:
                    firebase
                        .firestore
                        .FieldValue
                        .serverTimestamp()

            };


            /* ====================================================
               SAVE NEW RECORD
            ==================================================== */

            await newDocumentRef.set(
                newData
            );


            console.log(
                "YEAR COPY → CREATED:",
                newDocumentId
            );

        }


        console.log(
            "YEAR COPY → COMPLETE"
        );

    }


    catch(error) {

        console.error(
            "YEAR COPY → ERROR:",
            error
        );

    }


    finally {

        window.talapatrakYearCopyInProgress =
            false;


        console.log(
            "YEAR COPY → LOCK RELEASED"
        );

    }

}




/* ============================================================
        FIREBASE DOCUMENT ID
============================================================ */

function getTalapatrakDocumentId(
    moje,
    year
) {

    return `${moje}_${year}`;

}


/* ============================================================
        ELEMENT REFERENCES
============================================================ */


const addTalapatrakRowButton =
    document.getElementById(
        "addTalapatrakRow"
    );


const saveTalapatrakButton =
    document.getElementById(
        "saveTalapatrakButton"
    );


const talapatrakBody =
    document.getElementById(
        "talapatrakBody"
    );

/* ============================================================
        HIDE ALL VIEWS
============================================================ */

function hideAllTalapatrakViews() {

    if (dashboardViewElement) {

        dashboardViewElement.style.display =
            "none";

    }

    if (talapatrakViewElement) {

        talapatrakViewElement.style.display =
            "none";

    }

    if (talapatrakEditorViewElement) {

        talapatrakEditorViewElement.style.display =
            "none";

    }

    /*
        Hide the print container during
        normal application use.
    */

    const printContainer =
        document.getElementById(
            "talapatrakPrintContainer"
        );

    if (printContainer) {

        printContainer.style.display =
            "none";

    }

}


/* ============================================================
        START NEW TALAPATRAK
============================================================ */

function startNewTalapatrak() {

    console.log(
        "NEW TALAPATRAK → OPENING NEW EMPTY CARD"
    );


    /*
    ============================================================
        RESET CURRENT RECORD
    ============================================================
    */

    currentTalapatrakRecord =
        null;

    currentTalapatrakDocumentId =
        null;


    /*
    ============================================================
        RESET PAGINATION MEMORY
    ============================================================
    */

    window.talapatrakAllRows =
        null;

    window.talapatrakCurrentPage =
        1;

    window.talapatrakTotalPages =
        1;


    /*
    ============================================================
        OPEN EDITOR
    ============================================================
    */

    openTalapatrakEditor();


    /*
    ============================================================
        CLEAR VILLAGE
    ============================================================
    */

    const editorVillageName =
        document.getElementById(
            "talapatrakEditorVillageName"
        );

    if (editorVillageName) {

        editorVillageName.textContent =
            "New Talapatrak";

    }


    const mojeInput =
        document.getElementById(
            "talapatrakMoje"
        );

    if (mojeInput) {

        mojeInput.value =
            "";

    }


    /*
    ============================================================
        CLEAR TALUKA
    ============================================================
    */

    const talukaInput =
        document.getElementById(
            "talapatrakTaluka"
        );

    if (talukaInput) {

        talukaInput.value =
            "";

    }


    /*
    ============================================================
        CLEAR JILLO
    ============================================================
    */

    const jilloInput =
        document.getElementById(
            "talapatrakJillo"
        );

    if (jilloInput) {

        jilloInput.value =
            "";

    }


    /*
    ============================================================
        YEAR
        DO NOT FORCE CURRENT YEAR
    ============================================================
    */

    populateTalapatrakYearOptions();


    const yearSelect =
        document.getElementById(
            "talapatrakYear"
        );


    if (yearSelect) {

        /*
            Let the user choose the year.

            Do NOT automatically create/select
            the current financial year.
        */

        yearSelect.selectedIndex =
            -1;

    }


    const editorYear =
        document.getElementById(
            "talapatrakEditorYear"
        );


    if (editorYear) {

        editorYear.textContent =
            "Select Year";

    }


    /*
    ============================================================
        CLEAR ROWS
    ============================================================
    */

    clearTalapatrakRows();

    addInitialTalapatrakRow();


    console.log(
        "NEW TALAPATRAK → EMPTY CARD READY"
    );

}


/* ============================================================
        UPDATE YEAR DISPLAY
============================================================ */

function updateTalapatrakYearDisplay(
    year = getCurrentTalapatrakYear()
) {

    const yearSelect =
        document.getElementById(
            "talapatrakYear"
        );

    const editorYear =
        document.getElementById(
            "talapatrakEditorYear"
        );


    /* ========================================================
       YEAR DROPDOWN
    ======================================================== */

    if (yearSelect) {

        /*
         * Make sure the saved year actually exists
         * inside the dropdown.
         */

        const optionExists =
            Array.from(
                yearSelect.options
            ).some(function(option) {

                return option.value === String(year);

            });


        /*
         * If the year is missing, add it.
         */

        if (!optionExists) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(year);

            option.textContent =
                String(year);

            yearSelect.appendChild(
                option
            );

        }


        /*
         * Now select the saved year.
         */

        yearSelect.value =
            String(year);

    }


    /* ========================================================
       EDITOR TITLE YEAR
    ======================================================== */

    if (editorYear) {

        editorYear.textContent =
            String(year);

    }

}


function populateTalapatrakYearOptions() {

    const yearSelect =
        document.getElementById(
            "talapatrakYear"
        );


    if (!yearSelect) {

        console.warn(
            "populateTalapatrakYearOptions(): year select not found."
        );

        return;

    }


    /*
    ========================================================
        CLEAR EXISTING OPTIONS
    ========================================================
    */

    yearSelect.innerHTML = "";


    /*
    ========================================================
        CURRENT FINANCIAL YEAR
    ========================================================
    */

    const currentFinancialYear =
        getCurrentTalapatrakYear();


    const currentStartYear =
        Number(
            currentFinancialYear.split("-")[0]
        );


    /*
    ========================================================
        CREATE YEAR OPTIONS

        Example:

        2026-2027
        2025-2026
        2024-2025
        ...
    ========================================================
    */

    const numberOfYears =
        20;


    for (
        let i = 0;
        i < numberOfYears;
        i++
    ) {

        const startYear =
            currentStartYear - i;


        const endYear =
            startYear + 1;


        const financialYear =
            `${startYear}-${endYear}`;


        const option =
            document.createElement(
                "option"
            );


        option.value =
            financialYear;


        option.textContent =
            financialYear;


        yearSelect.appendChild(
            option
        );

    }

}



/* ============================================================
        ADD NEW TALAPATRAK BUTTONS
============================================================ */

if (addTalapatrakButton) {

    addTalapatrakButton.addEventListener(

        "click",

        function() {

            startNewTalapatrak();

        }

    );

}


if (emptyAddTalapatrakButton) {

    emptyAddTalapatrakButton.addEventListener(

        "click",

        function() {

            startNewTalapatrak();

        }

    );

}


/* ============================================================
        OPEN TALAPATRAK MANAGEMENT
============================================================ */

async function openTalapatrakManagement() {

    /*
        Hide editor + dashboard + print.
    */

    hideAllTalapatrakViews();


    /*
        Show ONLY management.
    */

    if (talapatrakViewElement) {

        talapatrakViewElement.style.display =
            "block";

                console.log(
              "TALAPATRAK VIEW AFTER OPEN:",
              getComputedStyle(talapatrakViewElement).display
          );

          console.log(
              "COUNT VISIBILITY:",
              getComputedStyle(talapatrakRecordCountElement).display,
              getComputedStyle(talapatrakRecordCountElement).visibility,
              getComputedStyle(talapatrakRecordCountElement).opacity
          );

    }


    /*
        Exit fullscreen editor mode.
    */

    document.body.classList.remove(
        "talapatrakFullscreen"
    );


    /*
        Make absolutely sure
        print container is hidden.
    */

    const printContainer =
        document.getElementById(
            "talapatrakPrintContainer"
        );

    if (printContainer) {

        printContainer.style.display =
            "none";

    }


    clearNavigationActiveState();


    if (talapatrakNavElement) {

        talapatrakNavElement.classList.add(
            "active"
        );

    }


    await loadTalapatrakRecords();

}


/* ============================================================
        CLEAR ROWS
============================================================ */

function clearTalapatrakRows() {

    if (!talapatrakBody) return;


    /* ============================================================
       DO NOT CLEAR TABLE DURING KHATA IMPORT
    ============================================================ */

    if (window.khataImportInProgress) {

        console.log(
            "Talapatrak rows clear skipped — Khata import is in progress."
        );

        return;

    }


    /* ============================================================
       NORMAL CLEAR
    ============================================================ */

    talapatrakBody.innerHTML = "";

}

function formatTalapatrakInputDate(date) {

    if (!date) {

        return "";

    }


    const parsedDate =
        new Date(date);


    if (isNaN(parsedDate)) {

        console.warn(
            "Invalid Talapatrak date:",
            date
        );

        return "";

    }


    const day =
        String(
            parsedDate.getDate()
        ).padStart(2,"0");


    const month =
        String(
            parsedDate.getMonth() + 1
        ).padStart(2,"0");


    const year =
        parsedDate.getFullYear();


    return `${day}/${month}/${year}`;

}

function setupIndianDatePicker() {

    flatpickr(
        ".indianDatePicker",
        {
            dateFormat: "d/m/Y",
            allowInput: true
        }
    );

}


function formatTalapatrakDecimalOnFinish(input) {

    if (!input) {
        return;
    }


    /* ========================================================
       ONLY FORMAT THESE COLUMNS

       C-K and N-S

       A, B, L, M remain untouched.
    ======================================================== */

    const decimalColumns = [
        "columnC",
        "columnD",
        "columnE",
        "columnF",
        "columnG",
        "columnH",
        "columnI",
        "columnJ",
        "columnK",
        "columnN",
        "columnO",
        "columnP",
        "columnQ",
        "columnR",
        "columnS"
    ];


    const shouldFormat =
        decimalColumns.some(
            function(className) {

                return input.classList.contains(
                    className
                );

            }
        );


    if (!shouldFormat) {
        return;
    }


    /* ========================================================
       GET VALUE
    ======================================================== */

    const rawValue =
        String(input.value || "").trim();


    /*
        Empty cells remain empty.
    */

    if (rawValue === "") {
        return;
    }


    /* ========================================================
       GUJARATI → ENGLISH

       Needed temporarily for numeric calculation.
    ======================================================== */

    const englishValue =
        convertGujaratiDigitsToEnglish(
            rawValue
        );


    const number =
        Number(englishValue);


    /*
        Invalid value → don't change it.
    */

    if (!Number.isFinite(number)) {
        return;
    }


    /* ========================================================
       FORMAT TO EXACTLY 2 DECIMAL PLACES
    ======================================================== */

    const formattedValue =
        number.toFixed(2);


    /* ========================================================
       ENGLISH → GUJARATI
    ======================================================== */

    input.value =
        convertToGujaratiDigits(
            formattedValue
        );

}



/* ============================================================
   CREATE TALAPATRAK ROW
============================================================ */


function createTalapatrakRow(
    rowData = {},
    options = {}
) {

    /* ============================================================
       OPTIONS
       ------------------------------------------------------------
       appendToBody:
       true  → normal editor row
       false → detached row for print/export
    ============================================================ */

    const appendToBody =
        options.appendToBody !== false;


    /* ============================================================
       TALAPATRAK BODY CHECK
    ============================================================ */

    if (
        appendToBody &&
        !talapatrakBody
    ) {

        console.error(
            "Talapatrak body not found."
        );

        return null;

    }


    /* ============================================================
       CREATE ROW
    ============================================================ */

    const row =
        document.createElement(
            "tr"
        );


        row.className =
            "talapatrakRow";

        /* ============================================================
        UNSAVED ROW TRACKING
        ============================================================ */

        const memoryRowIndex =
            Number.isFinite(
                Number(rowData._memoryIndex)
            )
                ? Number(rowData._memoryIndex)
                : null;

        if (
            memoryRowIndex !== null
        ) {

            row.dataset.memoryRowIndex =
                String(memoryRowIndex);

        }


    /* ============================================================
       ROW NUMBER
    ============================================================ */

    const rowNumber =
        rowData._displayRowNumber ||
        (
            Array.isArray(window.talapatrakAllRows)
                ? window.talapatrakAllRows.length + 1
                : 1
        );


    /* ============================================================
       COLUMN A — KHATA NUMBER
    ============================================================ */

    const hasSavedKhata =
        rowData.A !== undefined &&
        rowData.A !== null &&
        String(rowData.A).trim() !== "";

    const khataNumber =
        hasSavedKhata
            ? convertToGujaratiDigits(
                  String(rowData.A).trim()
              )
            : convertToGujaratiDigits(
                  String(rowNumber)
              );

    console.log(
        "CREATE ROW:",
        {
            displayRow: rowNumber,
            savedA: rowData.A,
            savedB: rowData.B,
            hasSavedKhata: hasSavedKhata,
            finalA: khataNumber
        }
    );


    /* ============================================================
       COLUMN B — HOLDER NAME
    ============================================================ */

    const holderName =
        rowData.B !== undefined &&
        rowData.B !== null
            ? String(rowData.B).trim()
            : "";


    /* ============================================================
       SAFE VALUES
    ============================================================ */

    const valueC =
        rowData.C !== undefined &&
        rowData.C !== null
            ? String(rowData.C)
            : "";

    const valueD =
        rowData.D !== undefined &&
        rowData.D !== null
            ? String(rowData.D)
            : "";

    const valueE =
        rowData.E !== undefined &&
        rowData.E !== null
            ? String(rowData.E)
            : "";

    const valueF =
        rowData.F !== undefined &&
        rowData.F !== null
            ? String(rowData.F)
            : "";

    const valueG =
        rowData.G !== undefined &&
        rowData.G !== null
            ? String(rowData.G)
            : "";

    const valueH =
        rowData.H !== undefined &&
        rowData.H !== null
            ? String(rowData.H)
            : "";

    const valueI =
        rowData.I !== undefined &&
        rowData.I !== null
            ? String(rowData.I)
            : "";

    const valueJ =
        rowData.J !== undefined &&
        rowData.J !== null
            ? String(rowData.J)
            : "";

    const valueK =
        rowData.K !== undefined &&
        rowData.K !== null
            ? String(rowData.K)
            : "";

    const valueL =
        rowData.L !== undefined &&
        rowData.L !== null
            ? String(rowData.L)
            : "";

    const valueM =
        formatTalapatrakInputDate(
            rowData.M
        );

    const valueN =
        rowData.N !== undefined &&
        rowData.N !== null
            ? String(rowData.N)
            : "";

    const valueO =
        rowData.O !== undefined &&
        rowData.O !== null
            ? String(rowData.O)
            : "";

    const valueP =
        rowData.P !== undefined &&
        rowData.P !== null
            ? String(rowData.P)
            : "";

    const valueQ =
        rowData.Q !== undefined &&
        rowData.Q !== null
            ? String(rowData.Q)
            : "";

    const valueR =
        rowData.R !== undefined &&
        rowData.R !== null
            ? String(rowData.R)
            : "";

    const valueS =
        rowData.S !== undefined &&
        rowData.S !== null
            ? String(rowData.S)
            : "";

    const valueT =
        rowData.T !== undefined &&
        rowData.T !== null
            ? String(rowData.T)
            : "";

    const valueU =
        rowData.U !== undefined &&
        rowData.U !== null
            ? String(rowData.U)
            : "";


    /* ============================================================
       CREATE COMPLETE TALAPATRAK ROW
    ============================================================ */

    row.innerHTML = `

        <!-- A — KHATA NUMBER -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnA"
                value="${escapeTalapatrakHTML(khataNumber)}">
        </td>


        <!-- B — HOLDER NAME -->

        <td>
            <input
                type="text"
                class="columnB"
                value="${escapeTalapatrakHTML(holderName)}">
        </td>


        <!-- C -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnC"
                value="${escapeTalapatrakHTML(valueC)}">
        </td>


        <!-- D -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnD"
                value="${escapeTalapatrakHTML(valueD)}">
        </td>


        <!-- E -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnE"
                value="${escapeTalapatrakHTML(valueE)}">
        </td>


        <!-- F -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnF"
                value="${escapeTalapatrakHTML(valueF)}">
        </td>


        <!-- G -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnG"
                value="${escapeTalapatrakHTML(valueG)}">
        </td>


        <!-- H -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnH"
                value="${escapeTalapatrakHTML(valueH)}"
                readonly>
        </td>


        <!-- I -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnI"
                value="${escapeTalapatrakHTML(valueI)}"
                readonly>
        </td>


        <!-- J -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnJ"
                value="${escapeTalapatrakHTML(valueJ)}"
                readonly>
        </td>


        <!-- K -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnK"
                value="${escapeTalapatrakHTML(valueK)}">
        </td>


        <!-- L -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnL"
                value="${escapeTalapatrakHTML(valueL)}">
        </td>


        <!-- M — DATE -->

        <td>
            <input
                type="text"
                class="columnM indianDatePicker"
                placeholder="DD/MM/YYYY"
                value="${escapeTalapatrakHTML(valueM)}">
        </td>


        <!-- N -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnN"
                value="${escapeTalapatrakHTML(valueN)}">
        </td>


        <!-- O -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnO"
                value="${escapeTalapatrakHTML(valueO)}"
                readonly>
        </td>


        <!-- P -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnP"
                value="${escapeTalapatrakHTML(valueP)}"
                readonly>
        </td>


        <!-- Q -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnQ"
                value="${escapeTalapatrakHTML(valueQ)}"
                readonly>
        </td>


        <!-- R -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnR"
                value="${escapeTalapatrakHTML(valueR)}"
                readonly>
        </td>


        <!-- S -->

        <td>
            <input
                type="text"
                inputmode="decimal"
                class="columnS"
                value="${escapeTalapatrakHTML(valueS)}">
        </td>


        <!-- T — PRINT HIDDEN -->

        <td class="printHide">

            <input
                type="text"
                inputmode="decimal"
                class="columnT"
                value="${escapeTalapatrakHTML(valueT)}"
                readonly>

        </td>


        <!-- U — PRINT HIDDEN -->

        <td class="printHide">

            <input
                type="text"
                inputmode="decimal"
                class="columnU"
                value="${escapeTalapatrakHTML(valueU)}"
                readonly>

        </td>


        <!-- ADD / DELETE -->

        <td class="talapatrakDeleteCell printHide">

            <button
                type="button"
                class="addTalapatrakRowButton"
                title="Add Row"
                onclick="addTalapatrakRowAfter(this)">

                <i class="fa-solid fa-plus"></i>

            </button>


            <button
                type="button"
                class="deleteTalapatrakRowButton"
                onclick="deleteTalapatrakRow(this)"
                title="Delete Row">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;

        /* ============================================================
        RESTORE UNSAVED ROW DOT
        ------------------------------------------------------------
        IMPORTANT:
        This must happen AFTER row.innerHTML because
        innerHTML replaces all existing children.
        ============================================================ */

        if (
            memoryRowIndex !== null &&
            window.talapatrakUnsavedRows.has(
                memoryRowIndex
            )
        ) {

            addTalapatrakUnsavedDot(
                row
            );

        }


    /* ============================================================
       APPEND ONLY FOR NORMAL EDITOR ROWS
    ============================================================ */

    if (
        appendToBody &&
        talapatrakBody
    ) {

        talapatrakBody.appendChild(
            row
        );

    }

    /* ============================================================
    RESTORE UNSAVED DOT
    ------------------------------------------------------------
    If this row was previously edited but the user has not
    pressed the real SAVE button, show the dot again.
    ============================================================ */

    if (
        appendToBody &&
        memoryRowIndex !== null &&
        window.talapatrakUnsavedRows instanceof Set &&
        window.talapatrakUnsavedRows.has(
            memoryRowIndex
        )
    ) {

        addTalapatrakUnsavedDot(
            row
        );

    }


        /* ============================================================
         TALAPATRAK ROW EVENTS
         ------------------------------------------------------------
         IMPORTANT:
         1. Editable inputs recalculate immediately while typing.
         2. Calculated columns remain visible in the same row.
         3. Current page is synced after the calculation.
         4. Autosave is scheduled after the edit.
         5. No duplicate input listeners.
      ============================================================ */

      if (appendToBody) {

          const editableInputs =
              row.querySelectorAll(
                  "input"
              );


          editableInputs.forEach(
              function(input) {

                  /* ----------------------------------------------------
                     LIVE INPUT
                     ---------------------------------------------------- */

                  input.addEventListener(
                      "input",
                      function() {

                          /*
                              Calculate FIRST.

                              This keeps H/I/J/O/P/Q/R etc.
                              updated immediately while typing.
                          */

                          calculateTalapatrakRow(
                              input
                          );


                          /*
                              After calculation, copy the complete
                              current DOM page into memory.

                              This preserves both:
                              - entered values
                              - calculated values
                          */

                          syncCurrentTalapatrakPageToMemory();

                          markTalapatrakRowAsChanged(
                                row
                            );


                          /*
                              Keep existing autosave behavior.
                          */

                          scheduleTalapatrakAutoSave();

                      }
                  );


                  /* ----------------------------------------------------
                     CHANGE EVENT
                     ---------------------------------------------------- */

                  input.addEventListener(
                        "change",
                        function() {

                            /*
                                Format numeric columns when the user
                                finishes editing the cell.

                                A, B, L, M are automatically ignored.
                            */

                            formatTalapatrakDecimalOnFinish(
                                input
                            );


                            /*
                                Recalculate after formatting.

                                This is important because calculations
                                should use the final 2-decimal value.
                            */

                            calculateTalapatrakRow(
                                input
                            );


                            /*
                                Preserve the updated row in memory.
                            */

                            syncCurrentTalapatrakPageToMemory();

                            markTalapatrakRowAsChanged(
                                row
                            );


                            /*
                                Save after the edit.
                            */

                            scheduleTalapatrakAutoSave();

                        }
                    );

              }
          );

      }



    /* ============================================================
       DATE PICKER
       ------------------------------------------------------------
       Never initialize it for detached print rows.
    ============================================================ */

    if (
        appendToBody &&
        !window.khataImportInProgress
    ) {

        setupIndianDatePicker();

    }


    /* ============================================================
       RETURN ROW
    ============================================================ */

    return row;

}


function addTalapatrakRowAfter(button) {

    const currentRow =
        button.closest(
            ".talapatrakRow"
        );


    if (!currentRow) {

        return;

    }


    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        return;

    }


    const currentPage =
        Number(
            window.talapatrakCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.talapatrakRowsPerPage
        ) || 20;


    const visibleRows =
        Array.from(
            talapatrakBody.querySelectorAll(
                ".talapatrakRow"
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


    const memoryIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage +
        visibleIndex;


    /* --------------------------------------------------------
       SAVE CURRENT PAGE FIRST
    -------------------------------------------------------- */

    syncCurrentTalapatrakPageToMemory();


    /* --------------------------------------------------------
       FIND LAST EXISTING KHATA NUMBER

       IMPORTANT:

       Search ALL memory rows.

       Do NOT use DOM row count.

       Do NOT use current page number.
    -------------------------------------------------------- */

    let lastKhataNumber =
        0;


    window.talapatrakAllRows.forEach(
        function(row) {

            if (
                !row ||
                typeof row !== "object"
            ) {

                return;

            }


            let value =
                row.A;


            /*
                Support lowercase "a" as well.
            */

            if (
                value === undefined ||
                value === null ||
                String(value).trim() === ""
            ) {

                value =
                    row.a;

            }


            if (
                value === undefined ||
                value === null
            ) {

                return;

            }


            /*
                Convert Gujarati digits to English.
            */

            const englishValue =
                convertGujaratiDigitsToEnglish(
                    String(value).trim()
                );


            /*
                Remove anything that isn't a digit.

                Example:

                "605" → "605"
                "૬૦૫" → "605"
            */

            const digitsOnly =
                englishValue.replace(
                    /[^0-9]/g,
                    ""
                );


            if (
                digitsOnly === ""
            ) {

                return;

            }


            const number =
                Number(digitsOnly);


            if (
                Number.isFinite(number) &&
                number > lastKhataNumber
            ) {

                lastKhataNumber =
                    number;

            }

        }
    );


    /* --------------------------------------------------------
       NEXT KHATA NUMBER
    -------------------------------------------------------- */

    const nextKhataNumber =
        lastKhataNumber + 1;


    const nextKhataNumberGujarati =
        convertToGujaratiDigits(
            String(nextKhataNumber)
        );


    console.log(
        "ADD ROW → LAST KHATA NUMBER:",
        lastKhataNumber
    );


    console.log(
        "ADD ROW → NEXT KHATA NUMBER:",
        nextKhataNumber
    );


    console.log(
        "ADD ROW → NEXT KHATA GUJARATI:",
        nextKhataNumberGujarati
    );


    /* --------------------------------------------------------
       INSERT NEW MEMORY ROW
    -------------------------------------------------------- */

    const newRow = {

        A:
            nextKhataNumberGujarati

    };


    window.talapatrakAllRows.splice(

        memoryIndex + 1,

        0,

        newRow

    );


    /* --------------------------------------------------------
       UPDATE TOTAL PAGES
    -------------------------------------------------------- */

    window.talapatrakTotalPages =
        Math.max(
            1,
            Math.ceil(
                window.talapatrakAllRows.length /
                rowsPerPage
            )
        );


    /* --------------------------------------------------------
       RENDER CURRENT PAGE AGAIN
    -------------------------------------------------------- */

    renderTalapatrakPage(
        currentPage
    );


    /* --------------------------------------------------------
       FOCUS NEW ROW
    -------------------------------------------------------- */

    const newVisibleIndex =
        visibleIndex + 1;


    const rowsAfterRender =
        talapatrakBody.querySelectorAll(
            ".talapatrakRow"
        );


    const newRowElement =
        rowsAfterRender[
            newVisibleIndex
        ];


    if (newRowElement) {

        const firstInput =
            newRowElement.querySelector(
                "input"
            );


        if (firstInput) {

            firstInput.focus();

            firstInput.select();

        }

    }

}


/* ============================================================
        INITIAL ROW
============================================================ */

function addInitialTalapatrakRow() {

    createTalapatrakRow();

}


/* ============================================================
        ADD ROW
============================================================ */

if (addTalapatrakRowButton) {

    addTalapatrakRowButton.addEventListener(

        "click",

        function() {

            addTalapatrakRow();

        }

    );

}


function addTalapatrakRow() {

    if (!talapatrakBody) {
        return null;
    }


    /* --------------------------------------------------------
       PAGINATED MODE
    -------------------------------------------------------- */

    if (
        Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        /* Save currently visible page */

        syncCurrentTalapatrakPageToMemory();


        /* ----------------------------------------------------
           FIND HIGHEST EXISTING KHATA NUMBER
        ---------------------------------------------------- */

        let lastKhataNumber = 0;


        window.talapatrakAllRows.forEach(
            function(row) {

                if (
                    !row ||
                    typeof row !== "object"
                ) {
                    return;
                }


                let value = row.A;


                /*
                 * Support lowercase "a" as well.
                 */

                if (
                    value === undefined ||
                    value === null ||
                    String(value).trim() === ""
                ) {

                    value = row.a;

                }


                if (
                    value === undefined ||
                    value === null
                ) {
                    return;
                }


                /*
                 * Convert Gujarati digits to English.
                 */

                const englishValue =
                    convertGujaratiDigitsToEnglish(
                        String(value).trim()
                    );


                /*
                 * Keep digits only.
                 */

                const digitsOnly =
                    englishValue.replace(
                        /[^0-9]/g,
                        ""
                    );


                if (
                    digitsOnly === ""
                ) {
                    return;
                }


                const number =
                    Number(digitsOnly);


                if (
                    Number.isFinite(number) &&
                    number > lastKhataNumber
                ) {

                    lastKhataNumber =
                        number;

                }

            }
        );


        /* ----------------------------------------------------
           CREATE NEXT KHATA NUMBER
        ---------------------------------------------------- */

        const nextKhataNumber =
            lastKhataNumber + 1;


        const nextKhataNumberGujarati =
            convertToGujaratiDigits(
                String(nextKhataNumber)
            );


        console.log(
            "BOTTOM ADD ROW → LAST KHATA:",
            lastKhataNumber
        );


        console.log(
            "BOTTOM ADD ROW → NEW KHATA:",
            nextKhataNumberGujarati
        );


        /* ----------------------------------------------------
           ADD NEW ROW AT VERY END
        ---------------------------------------------------- */

        window.talapatrakAllRows.push({

            A:
                nextKhataNumberGujarati

        });


        /* ----------------------------------------------------
           UPDATE TOTAL PAGES
        ---------------------------------------------------- */

        const rowsPerPage =
            Number(
                window.talapatrakRowsPerPage
            ) || 20;


        window.talapatrakTotalPages =
            Math.max(
                1,
                Math.ceil(
                    window.talapatrakAllRows.length /
                    rowsPerPage
                )
            );


        /* ----------------------------------------------------
           GO TO LAST PAGE
        ---------------------------------------------------- */

        const lastPage =
            window.talapatrakTotalPages;


        renderTalapatrakPage(
            lastPage
        );


        /* ----------------------------------------------------
           FOCUS NEW ROW
        ---------------------------------------------------- */

        const lastRow =
            talapatrakBody.querySelector(
                ".talapatrakRow:last-child"
            );


        if (lastRow) {

            const firstInput =
                lastRow.querySelector(
                    "input:not([readonly])"
                );


            if (firstInput) {

                firstInput.focus();

                firstInput.select();

            }

        }


        return lastRow || null;

    }


    /* --------------------------------------------------------
       OLD NON-PAGINATED MODE
       DO NOT CHANGE
    -------------------------------------------------------- */

    const newRow =
        createTalapatrakRow();


    if (!newRow) {
        return null;
    }


    talapatrakBody.appendChild(
        newRow
    );


    renumberTalapatrakRows();

    calculateAllTalapatrakRows();

    formatTalapatrakNumberInputs();


    const firstInput =
        newRow.querySelector(
            "input"
        );


    if (firstInput) {
        firstInput.focus();
    }


    return newRow;

}


/* ============================================================
        DELETE ROW
============================================================ */

function deleteTalapatrakRow(button) {

    if (!talapatrakBody) return;


    /* ============================================================
       MASTER MEMORY CHECK
    ============================================================ */

    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        return;

    }


    /* ============================================================
       CURRENT ROW
    ============================================================ */

    const currentRow =
        button.closest(
            ".talapatrakRow"
        );


    if (!currentRow) {

        return;

    }


    /* ============================================================
       VISIBLE ROWS
    ============================================================ */

    const visibleRows =
        Array.from(
            talapatrakBody.querySelectorAll(
                ".talapatrakRow"
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


    /* ============================================================
       CURRENT PAGINATION
    ============================================================ */

    const currentPage =
        Number(
            window.talapatrakCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.talapatrakRowsPerPage
        ) || 20;


    const dataPages =
        Math.max(
            1,
            Math.ceil(
                window.talapatrakAllRows.length /
                rowsPerPage
            )
        );


    /*
        Do not allow deletion from a summary page.
    */

    if (
        currentPage > dataPages
    ) {

        return;

    }


    /* ============================================================
       MASTER MEMORY INDEX
    ============================================================ */

    const memoryIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage +
        visibleIndex;


    if (
        memoryIndex < 0 ||
        memoryIndex >=
            window.talapatrakAllRows.length
    ) {

        return;

    }


    /* ============================================================
       KEEP AT LEAST ONE ROW
    ============================================================ */

    if (
        window.talapatrakAllRows.length <= 1
    ) {

        alert(
            "At least one row is required."
        );

        return;

    }


    /* ============================================================
       SYNC CURRENT PAGE BEFORE DELETE
    ============================================================ */

    syncCurrentTalapatrakPageToMemory();


    /* ============================================================
       DELETE FROM MASTER MEMORY
    ============================================================ */

    window.talapatrakAllRows.splice(
        memoryIndex,
        1
    );


    /* ============================================================
       RECALCULATE DATA PAGES
    ============================================================ */

    const newDataPages =
        Math.max(
            1,
            Math.ceil(
                window.talapatrakAllRows.length /
                rowsPerPage
            )
        );


    /*
        Summary pages remain part of document pagination.
    */

    const summaryPages =
        document.querySelectorAll(
            ".talapatrakSummaryPage"
        );


    const summaryPageCount =
        summaryPages.length;


    window.talapatrakTotalPages =
        newDataPages +
        summaryPageCount;


    /* ============================================================
       IF LAST DATA PAGE BECAME EMPTY
       ============================================================ */

    const newPage =
        Math.min(
            currentPage,
            newDataPages
        );


    /* ============================================================
       RENDER AGAIN FROM MASTER MEMORY
    ============================================================ */

    renderTalapatrakPage(
        newPage
    );


    /* ============================================================
       RECALCULATE CURRENT PAGE
    ============================================================ */

    calculateAllTalapatrakRows();


    /* ============================================================
       AUTOSAVE
    ============================================================ */

    scheduleTalapatrakAutoSave();

}


/* ============================================================
        RENUMBER ROWS
============================================================ */

function renumberTalapatrakRows() {

    if (!talapatrakBody) return;

    talapatrakBody
        .querySelectorAll(
            ".talapatrakRow"
        )
        .forEach(function(row, index) {

            const input =
                row.querySelector(
                    ".columnA"
                );

            if (input) {

                input.value =
                    index + 1;

            }

        });

}


/* ============================================================
        CALCULATE ROW
============================================================ */


function calculateTalapatrakRow(input) {

    const row =
        input.closest(
            ".talapatrakRow"
        );

    if (!row) return;


    /* ============================================================
       GET NUMERIC VALUE
       ------------------------------------------------------------
       User-facing values may contain Gujarati digits.

       Example:
       ૧૨૩.૪૫ → 123.45

       Calculations always use normal JavaScript numbers.
    ============================================================ */

    function getValue(column) {

        const element =
            row.querySelector(
                "." + column
            );

        if (!element) {
            return 0;
        }


        const englishValue =
            convertGujaratiDigitsToEnglish(
                element.value
            );


        const value =
            Number(
                englishValue
            );


        return Number.isFinite(value)
            ? value
            : 0;

    }


    /* ============================================================
       SET CALCULATED VALUE
       ------------------------------------------------------------
       Calculation:

       English number
            ↓
       Round to nearest 5 paise
            ↓
       Keep 2 decimals
            ↓
       Convert to Gujarati digits
            ↓
       Display

       Example:
       2.23 → 2.25 → ૨.૨૫
       4.54 → 4.55 → ૪.૫૫
       ============================================================ */

    function setValue(
        column,
        value
    ) {

        const element =
            row.querySelector(
                "." + column
            );


        if (element) {

            const formattedValue =
                  Number(
                      value || 0
                  ).toFixed(2);


              element.value =
                  convertToGujaratiDigits(
                      formattedValue
                  );


            element.value =
                convertToGujaratiDigits(
                    formattedValue
                );

        }

    }


    /* ============================================================
       READ USER INPUTS
       ------------------------------------------------------------
       Do NOT call toFixed() here.

       This allows the user to type:

       3
       3.
       3.1
       3.15

       without changing the field while typing.
    ============================================================ */

    const C =
        getValue(
            "columnC"
        );


    const D =
        getValue(
            "columnD"
        );


    const E =
        getValue(
            "columnE"
        );


    const G =
        getValue(
            "columnG"
        );


    const K =
        getValue(
            "columnK"
        );


    const N =
        getValue(
            "columnN"
        );


    /* ============================================================
       F
       ------------------------------------------------------------
       F = (D + E) × 3
    ============================================================ */

    const F =
        (D + E) * 3;


    setValue(
        "columnF",
        F
    );


    /* ============================================================
       H
       ------------------------------------------------------------
       H = C + D + E + F + G
    ============================================================ */

    const H =
        C +
        D +
        E +
        F +
        G;


    setValue(
        "columnH",
        H
    );


    /* ============================================================
       I
       ------------------------------------------------------------
       I = D
    ============================================================ */

    const I =
        D;


    setValue(
        "columnI",
        I
    );


    /* ============================================================
       J
       ------------------------------------------------------------
       J = H - I
    ============================================================ */

    const J =
        H -
        I;


    setValue(
        "columnJ",
        J
    );


    /* ============================================================
       O
       ------------------------------------------------------------
       O = K + N
    ============================================================ */

    const O =
        K +
        N;


    setValue(
        "columnO",
        O
    );


    /* ============================================================
       T
       ------------------------------------------------------------
       T = H - I - O
    ============================================================ */

    const T =
        H -
        I -
        O;


    setValue(
        "columnT",
        T
    );


    /* ============================================================
       U
       ------------------------------------------------------------
       U = IF(T < 0, T, 0)
    ============================================================ */

    const U =
        T < 0
            ? T
            : 0;


    setValue(
        "columnU",
        U
    );


    /* ============================================================
       R
       ------------------------------------------------------------
       R = -U
    ============================================================ */

    const R =
        -U;


    setValue(
        "columnR",
        R
    );


    /* ============================================================
       P
       ------------------------------------------------------------
       P = O - R
    ============================================================ */

    const P =
        O -
        R;


    setValue(
        "columnP",
        P
    );


    /* ============================================================
       Q
       ------------------------------------------------------------
       Q = IF(T > 0, T, 0)

       IMPORTANT:
       Q does NOT compare T with O.
    ============================================================ */

    const Q =
        T > 0
            ? T
            : 0;


    setValue(
        "columnQ",
        Q
    );

}


/* ============================================================
        CALCULATE ALL VISIBLE TALAPATRAK ROWS
============================================================ */

function calculateAllTalapatrakRows() {

    if (!talapatrakBody) return;


    talapatrakBody
        .querySelectorAll(
            ".talapatrakRow"
        )
        .forEach(function(row) {

            const input =
                row.querySelector(
                    ".columnC"
                );

            if (input) {

                calculateTalapatrakRow(
                    input
                );

            }

        });

}


/* ============================================================
        CALCULATE TALAPATRAK GRAND TOTALS
        ------------------------------------------------------------
        Calculates totals from ALL rows stored in
        window.talapatrakAllRows.

        This is independent of the currently visible page.
============================================================ */

function calculateTalapatrakGrandTotals() {

    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        return {};

    }


    const totals = {

        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
        I: 0,
        J: 0,
        K: 0,
        N: 0,
        O: 0,
        P: 0,
        Q: 0,
        R: 0,
        S: 0,
        T: 0,
        U: 0

    };


    window.talapatrakAllRows.forEach(
        function(rowData) {

            if (!rowData) return;


            const C =
                Number(rowData.C) || 0;

            const D =
                Number(rowData.D) || 0;

            const E =
                Number(rowData.E) || 0;

            const G =
                Number(rowData.G) || 0;

            const K =
                Number(rowData.K) || 0;

            const N =
                Number(rowData.N) || 0;

            const S =
                Number(rowData.S) || 0;


            /* ------------------------------------------------
               RECREATE ROW CALCULATIONS
            ------------------------------------------------ */

            const F =
                (D + E) * 3;


            const H =
                C + D + E + F + G;


            const I =
                D;


            const J =
                H - I;


            const O =
                K + N;


            const T =
                H - I - O;


            const U =
                T < 0
                    ? T
                    : 0;


            const R =
                -U;


            const P =
                O - R;


           const Q =
                T > 0
                    ? T
                    : 0;


            /* ------------------------------------------------
               ADD TO GRAND TOTALS
            ------------------------------------------------ */

            totals.C += C;
            totals.D += D;
            totals.E += E;
            totals.F += F;
            totals.G += G;
            totals.H += H;
            totals.I += I;
            totals.J += J;
            totals.K += K;
            totals.N += N;
            totals.O += O;
            totals.P += P;
            totals.Q += Q;
            totals.R += R;
            totals.S += S;
            totals.T += T;
            totals.U += U;

        }
    );


    /* --------------------------------------------------------
       ROUND TOTALS TO TWO DECIMAL PLACES
    -------------------------------------------------------- */

    Object.keys(totals).forEach(
        function(column) {

            totals[column] =
                Number(
                    totals[column].toFixed(2)
                );

        }
    );


    return totals;

}


/* ============================================================
        CALCULATE TALAPATRAK MEMORY TOTALS
        ------------------------------------------------------------
        Calculates totals from ALL rows in master memory.

        No summary page is involved.
============================================================ */

function calculateTalapatrakMemoryTotals() {

    const totals = {

        C: 0,
        D: 0,
        E: 0,
        F: 0,
        G: 0,
        H: 0,
        I: 0,
        J: 0,
        K: 0,
        N: 0,
        O: 0,
        P: 0,
        Q: 0,
        R: 0,
        S: 0,
        T: 0,
        U: 0

    };


    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        return totals;

    }


    window.talapatrakAllRows.forEach(
        function(row) {

            if (!row) return;


            /* ------------------------------------------------
               SOURCE VALUES
            ------------------------------------------------ */

            const C =
                Number(convertGujaratiDigitsToEnglish(row.C)) || 0;

            const D =
                Number(convertGujaratiDigitsToEnglish(row.D)) || 0;

            const E =
                Number(convertGujaratiDigitsToEnglish(row.E)) || 0;

            const G =
                Number(convertGujaratiDigitsToEnglish(row.G)) || 0;

            const K =
                Number(convertGujaratiDigitsToEnglish(row.K)) || 0;

            const N =
                Number(convertGujaratiDigitsToEnglish(row.N)) || 0;

            const S =
                Number(convertGujaratiDigitsToEnglish(row.S)) || 0;


            /* ------------------------------------------------
               RECREATE ROW CALCULATIONS
            ------------------------------------------------ */

            const F =
                (D + E) * 3;


            const H =
                C + D + E + F + G;


            const I =
                D;


            const J =
                H - I;


            const O =
                K + N;


            const T =
                H - I - O;


            const U =
                T < 0
                    ? T
                    : 0;


            const R =
                -U;


            const P =
                O - R;


            const Q =
                  T > 0
                      ? T
                      : 0;


            /* ------------------------------------------------
               ADD TO TOTALS
            ------------------------------------------------ */

            totals.C += C;
            totals.D += D;
            totals.E += E;
            totals.F += F;
            totals.G += G;
            totals.H += H;
            totals.I += I;
            totals.J += J;
            totals.K += K;
            totals.N += N;
            totals.O += O;
            totals.P += P;
            totals.Q += Q;
            totals.R += R;
            totals.S += S;
            totals.T += T;
            totals.U += U;

        }
    );


    /* --------------------------------------------------------
       ROUND TOTALS TO TWO DECIMAL PLACES
    -------------------------------------------------------- */

    Object.keys(totals).forEach(
        function(column) {

            totals[column] =
                Number(
                    totals[column].toFixed(2)
                );

        }
    );


    return totals;

}


/* ============================================================
   TALAPATRAK CALCULATION SUMMARY STATE
   ============================================================ */

window.talapatrakCalculationSummary =
    window.talapatrakCalculationSummary || null;


/* ============================================================
   FORMAT SUMMARY NUMBER
   ============================================================ */

function formatTalapatrakSummaryNumber(value) {

    return Number(value || 0).toFixed(2);

}


/* ============================================================
   UPDATE CALCULATION PAGE
============================================================ */

function updateTalapatrakCalculationPage(page) {

    if (!page) {

        console.warn(
            "updateTalapatrakCalculationPage(): page not found."
        );

        return;

    }


    /* ========================================================
       HELPERS
    ======================================================== */

    function getValue(field) {

        const input =
            page.querySelector(
                `[data-summary-field="${field}"]`
            );


        if (!input) {

            return 0;

        }


        const value =
            Number(
                input.value
            );


        return Number.isFinite(value)
            ? value
            : 0;

    }


    function setValue(
        field,
        value
    ) {

        const input =
            page.querySelector(
                `[data-summary-field="${field}"]`
            );


        if (!input) {

            return;

        }


        input.value =
            formatTalapatrakSummaryNumber(
                value
            );

    }


    /* ========================================================
       READ DEMAND VALUES
    ======================================================== */

    const government =
        getValue(
            "government"
        );


    const agriculture =
        getValue(
            "agriculture"
        );


    const localFund =
        getValue(
            "localFund"
        );


    /* ========================================================
       CALCULATE DEMAND TOTAL
    ======================================================== */

    const demandTotal =
        government +
        agriculture +
        localFund;


    setValue(
        "demandTotal",
        demandTotal
    );


    /* ========================================================
       READ COLLECTION VALUES
    ======================================================== */

    const previousCollection =
        getValue(
            "previousCollection"
        );


    const currentCollection =
        getValue(
            "currentCollection"
        );


    const rotatingCollection =
        getValue(
            "rotatingCollection"
        );


    /* ========================================================
       CALCULATE COLLECTION TOTAL
    ======================================================== */

    const collectionTotal =
        previousCollection +
        currentCollection +
        rotatingCollection;


    setValue(
        "collectionTotal",
        collectionTotal
    );


    /* ========================================================
       FINAL CALCULATIONS
    ======================================================== */

    const rawOutstanding =
        demandTotal -
        collectionTotal;


    const outstanding =
        Math.max(
            0,
            rawOutstanding
        );


    const surplus =
        Math.max(
            0,
            collectionTotal -
            demandTotal
        );


    setValue(
        "outstanding",
        outstanding
    );


    setValue(
        "surplus",
        surplus
    );


    /* ========================================================
       UPDATE GLOBAL CALCULATION MEMORY
    ======================================================== */

    window.talapatrakCalculationSummary = {

        ...(window.talapatrakCalculationSummary || {}),

        government:
            government,

        agriculture:
            agriculture,

        localFund:
            localFund,

        demandTotal:
            demandTotal,

        previousCollection:
            previousCollection,

        currentCollection:
            currentCollection,

        rotatingCollection:
            rotatingCollection,

        collectionTotal:
            collectionTotal,

        outstanding:
            outstanding,

        surplus:
            surplus

    };


    console.log(
        "TALAPATRAK CALCULATION UPDATED:",
        window.talapatrakCalculationSummary
    );

}


function updateTalapatrakPaginationUI() {

    const totalRows =
        Array.isArray(window.talapatrakAllRows)
            ? window.talapatrakAllRows.length
            : 0;


    const rowsPerPage =
        Number(
            window.talapatrakRowsPerPage
        ) || 20;


    const dataPages =
        Math.max(
            1,
            Math.ceil(
                totalRows /
                rowsPerPage
            )
        );



    const totalPages =
        dataPages;


    const currentPage =
        Math.max(
            1,
            Math.min(
                Number(
                    window.talapatrakCurrentPage
                ) || 1,
                totalPages
            )
        );


    window.talapatrakCurrentPage =
        currentPage;

    window.talapatrakTotalPages =
        totalPages;


    /* ========================================================
       PAGE INPUT
    ======================================================== */

    const pageInput =
        document.getElementById(
            "talapatrakPageInput"
        );


    if (pageInput) {

        pageInput.value =
            currentPage;

        pageInput.max =
            totalPages;

    }


    /* ========================================================
       TOTAL PAGE COUNT
    ======================================================== */

    const totalPagesElement =
        document.getElementById(
            "talapatrakTotalPages"
        );


    if (totalPagesElement) {

        totalPagesElement.textContent =
            totalPages;

    }


    /* ========================================================
       ROW INFORMATION
    ======================================================== */

    const pageInfo =
        document.getElementById(
            "talapatrakPageInfo"
        );


    if (pageInfo) {

        if (currentPage <= dataPages) {

            const startRow =
                totalRows === 0
                    ? 0
                    : (
                        (currentPage - 1) *
                        rowsPerPage
                    ) + 1;


            const endRow =
                Math.min(
                    currentPage *
                    rowsPerPage,
                    totalRows
                );


            pageInfo.textContent =
                `Rows ${startRow}–${endRow} of ${totalRows}`;

        }
        else {

            const summaryNumber =
                currentPage -
                dataPages;


            pageInfo.textContent =
                `Summary Page ${summaryNumber}`;

        }

    }


    /* ========================================================
       NAVIGATION BUTTONS
    ======================================================== */

    const firstButton =
        document.getElementById(
            "talapatrakFirstPage"
        );

    const previousButton =
        document.getElementById(
            "talapatrakPreviousPage"
        );

    const nextButton =
        document.getElementById(
            "talapatrakNextPage"
        );

    const lastButton =
        document.getElementById(
            "talapatrakLastPage"
        );


    if (firstButton) {

        firstButton.disabled =
            currentPage <= 1;

    }


    if (previousButton) {

        previousButton.disabled =
            currentPage <= 1;

    }


    if (nextButton) {

        nextButton.disabled =
            currentPage >= totalPages;

    }


    if (lastButton) {

        lastButton.disabled =
            currentPage >= totalPages;

    }


    console.log(
        "PAGINATION UI UPDATED:",
        {
            totalRows,
            rowsPerPage,
            dataPages,
            totalPages,
            currentPage
        }
    );
}



/* ============================================================
   GENERATE TALAPATRAK TOTALS AND CALCULATION
   ------------------------------------------------------------
   IMPORTANT:

   There is NO summary page here.

   The actual Talapatrak pages remain:

       Page 1
       Page 2
       Page 3
       ...
       Last data page

   The grand total is rendered separately.

   The calculation summary is separate calculation data,
   NOT an additional pagination page.
============================================================ */

function generateTalapatrakTotalsAndSummary() {

    console.log("### NEW GENERATE TOTAL FUNCTION IS RUNNING ###");

    console.log("======================================");
    console.log("TALAPATRAK GENERATE TOTAL BUTTON CLICKED");


    /* ========================================================
       1. SAVE CURRENT PAGE INTO MEMORY
    ======================================================== */

    syncCurrentTalapatrakPageToMemory();


    /* ========================================================
       2. CALCULATE ALL ROW TOTALS
    ======================================================== */

    window.talapatrakTotals =
        calculateTalapatrakMemoryTotals();


    console.log(
        "TALAPATRAK TOTALS GENERATED:",
        window.talapatrakTotals
    );


    /* ========================================================
       3. RENDER GRAND TOTAL ROW
    ======================================================== */

    renderTalapatrakGrandTotalRow();



    /* ========================================================
       6. REFRESH DOCUMENT PAGINATION
    ======================================================== */

    if (
        typeof updateTalapatrakPaginationUI ===
        "function"
    ) {

        updateTalapatrakPaginationUI();

    }


    window.talapatrakTotalPages =
        (
            Math.max(
                1,
                Math.ceil(
                    window.talapatrakAllRows.length /
                    (
                        Number(
                            window.talapatrakRowsPerPage
                        ) || 20
                    )
                )
            )
        )


    console.log(
        "UPDATED TOTAL DOCUMENT PAGES:",
        window.talapatrakTotalPages
    );


    console.log(
        "TALAPATRAK SUMMARY PAGE 1 READY"
    );

    console.log(
        "TALAPATRAK GENERATE TOTAL COMPLETE"
    );

    console.log(
        "======================================"
    );

}


/* ============================================================
        NUMBER FORMAT + LIVE CALCULATION
============================================================ */

function formatTalapatrakNumberInputs() {

    if (!talapatrakBody) {
        return;
    }


    talapatrakBody
        .querySelectorAll(
            "input[type='number']"
        )
        .forEach(function(input) {


            if (
                !input.dataset
                    .decimalFormatterAttached
            ) {

                input.dataset
                    .decimalFormatterAttached =
                    "true";


                input.addEventListener(
                    "blur",
                    function() {

                        if (
                            this.value === ""
                        ) {

                            return;

                        }


                        if (
                            this.classList.contains(
                                "columnL"
                            )
                        ) {

                            this.value =
                                Number(
                                    this.value
                                ).toString();

                        }

                        else {

                            const number =
                                Number(
                                    this.value
                                );


                            if (
                                Number.isFinite(
                                    number
                                )
                            ) {

                                this.value =
                                    number.toFixed(2);

                            }

                        }

                    }
                );

            }


            if (
                !input.dataset
                    .calculationAttached
            ) {

                input.dataset
                    .calculationAttached =
                    "true";


                input.addEventListener(
                    "input",
                    function() {

                        calculateTalapatrakRow(
                            this
                        );

                    }
                );

            }

        });

}


/* ============================================================
        COLLECT TALAPATRAK ROWS

        PAGINATION:
        - DOM = current page only
        - window.talapatrakAllRows = ALL rows

        Before collecting:
        - Sync current visible page into memory
        - Return ALL rows from memory

        NON-PAGINATED:
        - Fall back to collecting rows directly from DOM
============================================================ */

function collectTalapatrakRows() {


    /* ========================================================
       NON-PAGINATED MODE
    ======================================================== */

    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        const rows = [];


        if (!talapatrakBody) {

            console.warn(
                "collectTalapatrakRows(): talapatrakBody not found."
            );

            return rows;

        }


        talapatrakBody
            .querySelectorAll(
                ".talapatrakRow"
            )
            .forEach(function(row) {

                rows.push({

                    A:
                        row.querySelector(
                            ".columnA"
                        )?.value || "",

                    B:
                        row.querySelector(
                            ".columnB"
                        )?.value || "",

                    C:
                        row.querySelector(
                            ".columnC"
                        )?.value || "",

                    D:
                        row.querySelector(
                            ".columnD"
                        )?.value || "",

                    E:
                        row.querySelector(
                            ".columnE"
                        )?.value || "",

                    F:
                        row.querySelector(
                            ".columnF"
                        )?.value || "",

                    G:
                        row.querySelector(
                            ".columnG"
                        )?.value || "",

                    H:
                        row.querySelector(
                            ".columnH"
                        )?.value || "",

                    I:
                        row.querySelector(
                            ".columnI"
                        )?.value || "",

                    J:
                        row.querySelector(
                            ".columnJ"
                        )?.value || "",

                    K:
                        row.querySelector(
                            ".columnK"
                        )?.value || "",

                    L:
                        row.querySelector(
                            ".columnL"
                        )?.value || "",

                    M:
                        row.querySelector(
                            ".columnM"
                        )?.value || "",

                    N:
                        row.querySelector(
                            ".columnN"
                        )?.value || "",

                    O:
                        row.querySelector(
                            ".columnO"
                        )?.value || "",

                    P:
                        row.querySelector(
                            ".columnP"
                        )?.value || "",

                    Q:
                        row.querySelector(
                            ".columnQ"
                        )?.value || "",

                    R:
                        row.querySelector(
                            ".columnR"
                        )?.value || "",

                    S:
                        row.querySelector(
                            ".columnS"
                        )?.value || "",

                    T:
                        row.querySelector(
                            ".columnT"
                        )?.value || "",

                    U:
                        row.querySelector(
                            ".columnU"
                        )?.value || ""

                });

            });


        console.log(
            "collectTalapatrakRows():",
            rows.length,
            "DOM rows collected."
        );


        return rows;

    }


    /* ========================================================
       PAGINATED MODE

       Sync ONLY the currently visible page.
       This updates the corresponding rows inside
       window.talapatrakAllRows.
    ======================================================== */

    if (
        typeof syncCurrentTalapatrakPageToMemory ===
        "function"
    ) {

        syncCurrentTalapatrakPageToMemory();

    }


    /* ========================================================
       RETURN ALL ROWS

       Never return only the visible DOM rows.
    ======================================================== */

    const allRows =
        window.talapatrakAllRows.map(
            function(row) {

                return {
                    ...row
                };

            }
        );


    console.log(
        "collectTalapatrakRows():",
        allRows.length,
        "TOTAL rows collected from MEMORY."
    );


    return allRows;

}


function getTalapatrakRowDataFromDOM(row) {

    return {

        A:
            row.querySelector(".columnA")?.value || "",

        B:
            row.querySelector(".columnB")?.value || "",

        C:
            row.querySelector(".columnC")?.value || "",

        D:
            row.querySelector(".columnD")?.value || "",

        E:
            row.querySelector(".columnE")?.value || "",

        F:
            row.querySelector(".columnF")?.value || "",

        G:
            row.querySelector(".columnG")?.value || "",

        H:
            row.querySelector(".columnH")?.value || "",

        I:
            row.querySelector(".columnI")?.value || "",

        J:
            row.querySelector(".columnJ")?.value || "",

        K:
            row.querySelector(".columnK")?.value || "",

        L:
            row.querySelector(".columnL")?.value || "",

        M:
            row.querySelector(".columnM")?.value || "",

        N:
            row.querySelector(".columnN")?.value || "",

        O:
            row.querySelector(".columnO")?.value || "",

        P:
            row.querySelector(".columnP")?.value || "",

        Q:
            row.querySelector(".columnQ")?.value || "",

        R:
            row.querySelector(".columnR")?.value || "",

        S:
            row.querySelector(".columnS")?.value || "",

        T:
            row.querySelector(".columnT")?.value || "",

        U:
            row.querySelector(".columnU")?.value || ""

    };

}

/* ============================================================
        SYNC CURRENT PAGE → MEMORY

        The DOM contains only 20 rows.

        This function takes those 20 visible rows
        and writes them back into:

            window.talapatrakAllRows

        It does NOT delete the other rows.
============================================================ */

function syncCurrentTalapatrakPageToMemory() {

    /*
     * ========================================================
     * TALAPATRAK DOM → MEMORY SYNC
     *
     * There are TWO valid situations:
     *
     * 1. NORMAL PAGINATION
     *    DOM contains only the current page.
     *
     * 2. FULL DOM IMPORT
     *    Khata importer temporarily places ALL imported
     *    rows into the DOM.
     *
     * We must support both without changing existing
     * pagination behavior.
     * ========================================================
     */


    if (
        !Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        return;

    }


    if (!talapatrakBody) {

        return;

    }


    const currentPage =
        Number(
            window.talapatrakCurrentPage
        ) || 1;


    const rowsPerPage =
        Number(
            window.talapatrakRowsPerPage
        ) || 20;


    const visibleRows =
        talapatrakBody.querySelectorAll(
            ".talapatrakRow"
        );


    /*
     * ========================================================
     * SAFETY
     * ========================================================
     */

    if (!visibleRows.length) {

        console.warn(
            "SYNC PAGE → MEMORY: No DOM rows found."
        );

        return;

    }


    /*
     * ========================================================
     * IMPORTANT:
     *
     * KHATA IMPORT / FULL DOM MODE
     *
     * If DOM contains more rows than the configured
     * page size, the DOM is temporarily holding the
     * complete imported dataset.
     *
     * Example:
     *
     * rowsPerPage = 20
     * DOM rows    = 1056
     *
     * This MUST NOT be treated as page 1.
     *
     * Instead, rebuild master memory from the DOM.
     * ========================================================
     */

    const fullDomMode =
        visibleRows.length > rowsPerPage;


    if (fullDomMode) {

        console.log(
            "======================================"
        );

        console.log(
            "SYNC → FULL DOM MODE DETECTED"
        );

        console.log(
            "DOM rows:",
            visibleRows.length
        );

        console.log(
            "Rows per page:",
            rowsPerPage
        );

        console.log(
            "Existing memory rows:",
            window.talapatrakAllRows.length
        );

        console.log(
            "======================================"
        );


        const importedRows = [];


        visibleRows.forEach(
            function(row) {

                importedRows.push(
                    getTalapatrakRowDataFromDOM(
                        row
                    )
                );

            }
        );


        /*
         * Replace master memory with the complete
         * DOM dataset.
         *
         * This is intentional.
         *
         * Khata import has just created the complete
         * new Talapatrak dataset.
         */

        window.talapatrakAllRows =
            importedRows;


        /*
         * Reset pagination state safely.
         *
         * The complete dataset is now in memory.
         */

        window.talapatrakCurrentPage =
            Math.max(
                1,
                Math.min(
                    currentPage,
                    Math.ceil(
                        importedRows.length /
                        rowsPerPage
                    )
                )
            );


        console.log(
            "SYNC → FULL DOM IMPORT STORED:",
            importedRows.length,
            "rows"
        );


        console.log(
            "SYNC → MEMORY NOW:",
            window.talapatrakAllRows.length,
            "rows"
        );


        return;

    }


    /*
     * ========================================================
     * NORMAL PAGINATED MODE
     *
     * Existing behavior remains unchanged.
     * Only the currently visible page is synchronized.
     * ========================================================
     */

    const startIndex =
        (
            currentPage - 1
        ) *
        rowsPerPage;


    visibleRows.forEach(
        function(row, visibleIndex) {

            const memoryIndex =
                startIndex +
                visibleIndex;


            /*
             * Safety check.
             *
             * Never write outside the master array.
             */

            if (
                memoryIndex < 0 ||
                memoryIndex >=
                    window.talapatrakAllRows.length
            ) {

                return;

            }


            const rowData =
                getTalapatrakRowDataFromDOM(
                    row
                );


            /*
             * Replace ONLY this row
             * inside master memory.
             */

            window.talapatrakAllRows[
                memoryIndex
            ] = rowData;

        }
    );


    console.log(
        "SYNC PAGE → MEMORY:",
        "Page:",
        currentPage,
        "Visible rows:",
        visibleRows.length,
        "Total memory rows:",
        window.talapatrakAllRows.length
    );

}



/* ============================================================
        SAVE TALAPATRAK
============================================================ */

async function saveTalapatrak(
    showSuccessMessage = true
) {

    /* ============================================================
       SAVE PROTECTION
    ============================================================ */

    if (window.talapatrakIsPrinting === true) {

        console.log(
            "SAVE SKIPPED → TALAPATRAK IS PRINTING"
        );

        return false;

    }


    if (window.khataImportInProgress) {

        console.log(
            "SAVE SKIPPED → KHATA IMPORT IS RUNNING"
        );

        return false;

    }


    if (window.talapatrakOpeningInProgress) {

        console.log(
            "SAVE SKIPPED → TALAPATRAK IS STILL OPENING"
        );

        return false;

    }


    try {

        /* ========================================================
           LOGIN
        ======================================================== */

        if (!auth || !auth.currentUser) {

            if (showSuccessMessage) {

                alert(
                    "Please login before saving the Talapatrak."
                );

            }

            return false;

        }


        /* ========================================================
           HEADER
        ======================================================== */

        const mojeInput =
            document.getElementById(
                "talapatrakMoje"
            );


        const talukaInput =
            document.getElementById(
                "talapatrakTaluka"
            );


        const jilloInput =
            document.getElementById(
                "talapatrakJillo"
            );


        const moje =
            mojeInput
                ? mojeInput.value.trim()
                : "";


        const taluka =
            talukaInput
                ? talukaInput.value.trim()
                : "";


        const jillo =
            jilloInput
                ? jilloInput.value.trim()
                : "";


        if (!moje) {

            alert(
                "Please enter મોજે before saving."
            );


            if (mojeInput) {

                mojeInput.focus();

            }


            return false;

        }


        /* ========================================================
           YEAR
        ======================================================== */

        const yearSelect =
            document.getElementById(
                "talapatrakYear"
            );


        const currentYear =
            yearSelect
                ? yearSelect.value
                : getCurrentTalapatrakYear();


        updateTalapatrakYearDisplay(
            currentYear
        );


        /* ========================================================
           ROWS
        ======================================================== */

        const rows =
            collectTalapatrakRows();


        if (!rows.length) {

            alert(
                "At least one row is required."
            );

            return false;

        }


        /* ========================================================
           CURRENT RECORD
        ======================================================== */

        const oldDocumentId =
            currentTalapatrakDocumentId ||
            null;


        const oldYear =
            currentTalapatrakRecord?.year ||
            null;


        const oldMoje =
            currentTalapatrakRecord?.moje ||
            "";


        const isExistingRecord =
            !!oldDocumentId;


        /* ========================================================
           DETECT IDENTITY CHANGE

           Talapatrak identity =
           MOJE + YEAR
        ======================================================== */

        const identityChanged =
            isExistingRecord &&
            (
                oldMoje !== moje ||
                oldYear !== currentYear
            );


        console.log(
            "SAVE → OLD MOJE:",
            oldMoje
        );


        console.log(
            "SAVE → NEW MOJE:",
            moje
        );


        console.log(
            "SAVE → OLD YEAR:",
            oldYear
        );


        console.log(
            "SAVE → NEW YEAR:",
            currentYear
        );


        console.log(
            "SAVE → IDENTITY CHANGED:",
            identityChanged
        );


        /* ========================================================
           DETERMINE DOCUMENT ID
        ======================================================== */

        let documentId;


        if (
            isExistingRecord &&
            !identityChanged
        ) {

            /*
                Normal edit.

                Keep the existing document.
            */

            documentId =
                oldDocumentId;

        }
        else {

            /*
                New card OR
                village/year changed.

                Identity is village + year.
            */

            documentId =
                getTalapatrakDocumentId(
                    moje,
                    currentYear
                );

        }


        /* ========================================================
           VILLAGE / YEAR CHANGE
        ======================================================== */

        if (
            identityChanged
        ) {

            console.log(
                "SAVE → TALAPATRAK IDENTITY CHANGE"
            );


            /*
                For year changes, use the existing
                year confirmation modal.
            */

            if (
                oldYear &&
                oldYear !== currentYear
            ) {

                const confirmed =
                    await showTalapatrakYearChangeModal(
                        oldYear,
                        currentYear
                    );


                if (!confirmed) {

                    if (yearSelect) {

                        yearSelect.value =
                            oldYear;

                    }


                    updateTalapatrakYearDisplay(
                        oldYear
                    );


                    return false;

                }

            }


            /* ====================================================
               CHECK DESTINATION CARD
            ==================================================== */

            const newDocumentReference =
                db
                    .collection(
                        "talapatraks"
                    )
                    .doc(
                        documentId
                    );


            const existingDestination =
                await newDocumentReference.get();


            if (
                existingDestination.exists &&
                documentId !== oldDocumentId
            ) {

                console.warn(
                    "SAVE BLOCKED → TALAPATRAK ALREADY EXISTS:",
                    documentId
                );


                /*
                    Existing Talapatrak already belongs
                    to this village + year.

                    Do not overwrite it.
                */

                return false;

            }

        }


        /* ========================================================
           DATA
        ======================================================== */

        const talapatrakData = {

            type:
                "talapatrak",

            moje:
                moje,

            taluka:
                taluka,

            jillo:
                jillo,

            year:
                currentYear,

            rows:
                rows,

            rowCount:
                rows.length,

            userId:
                auth.currentUser.uid,

            userEmail:
                auth.currentUser.email,

            updatedAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        };


        /* ========================================================
           SAVE TALAPATRAK

           THIS MUST FINISH BEFORE ANY SYNC.
        ======================================================== */

        await db
            .collection(
                "talapatraks"
            )
            .doc(
                documentId
            )
            .set(
                talapatrakData,
                {
                    merge:
                        true
                }
            );


        console.log(
            "SAVE → TALAPATRAK FIRESTORE SAVE COMPLETE:",
            documentId
        );


        /* ========================================================
           DELETE OLD DOCUMENT

           Only after the new document saved successfully.
        ======================================================== */

        if (
            identityChanged &&
            oldDocumentId &&
            oldDocumentId !== documentId
        ) {

            await db
                .collection(
                    "talapatraks"
                )
                .doc(
                    oldDocumentId
                )
                .delete();


            console.log(
                "SAVE → OLD TALAPATRAK DELETED:",
                oldDocumentId
            );

        }


        /* ========================================================
           UPDATE CURRENT STATE

           Do this before sync so the application knows
           the new Talapatrak identity.
        ======================================================== */

        currentTalapatrakDocumentId =
            documentId;


        currentTalapatrakRecord = {

            id:
                documentId,

            ...talapatrakData

        };


        /* ========================================================
           TALAPATRAK → SHIKSHANUPAKARAN

           IMPORTANT:

           ONLY MANUAL SAVE.

           showSuccessMessage === true
           means this was the Save button.

           Autosave / background save:
           showSuccessMessage === false

           → NO SYNC
           → NO MODAL
        ======================================================== */

        if (showSuccessMessage) {

            console.log(
                "SAVE → STARTING TALAPATRAK → SHIKSHANUPAKARAN SYNC"
            );


            await createShikshanupakaranFromTalapatrak(
                {
                    ...talapatrakData,
                    id:
                        documentId
                }
            );


            console.log(
                "SAVE → TALAPATRAK → SHIKSHANUPAKARAN SYNC FINISHED"
            );

        }
        else {

            console.log(
                "AUTOSAVE → SHIKSHANUPAKARAN SYNC SKIPPED"
            );

        }


        /* ========================================================
           UPDATE COUNT
        ======================================================== */

        await loadTalapatrakCount();


        /* ========================================================
           ACTIVITY

           Only for actual Save.
        ======================================================== */

        if (showSuccessMessage) {

            await addTalapatrakActivity(

                identityChanged
                    ? "talapatrak_updated"
                    : (
                        oldDocumentId
                            ? "talapatrak_updated"
                            : "talapatrak_added"
                    ),

                identityChanged
                    ? "Talapatrak identity updated"
                    : (
                        oldDocumentId
                            ? "Talapatrak updated"
                            : "New Talapatrak added"
                    ),

                identityChanged
                    ? `${moje} Talapatrak updated`
                    : (
                        oldDocumentId
                            ? `${moje} Talapatrak details updated`
                            : `${moje} Talapatrak created successfully`
                    ),

                moje

            );

        }


        /* ========================================================
           REFRESH MANAGEMENT
        ======================================================== */

        if (
            typeof loadTalapatrak ===
            "function"
        ) {

            await loadTalapatrak();

        }


        /* ========================================================
           SUCCESS
        ======================================================== */

        console.log(
            "TALAPATRAK SAVE COMPLETE:",
            documentId
        );


        /* ============================================================
        MARK AS SAVED
        ------------------------------------------------------------
        IMPORTANT:
        Only a real manual SAVE clears the unsaved state.

        Autosave calls saveTalapatrak(false), so autosave
        must NOT clear this flag.
        ============================================================ */

        if (showSuccessMessage) {

            markTalapatrakAsSaved();

        }


        return true;

    }


    catch(error) {

        console.error(
            "ERROR SAVING TALAPATRAK:",
            error
        );


        if (showSuccessMessage) {

            alert(
                "Talapatrak could not be saved: " +
                error.message
            );

        }


        return false;

    }

}


/* ============================================================
   TALAPATRAK AUTO SAVE
   Saves the current editor automatically after changes.
   Uses the existing saveTalapatrak() function so all
   existing save functionality remains unchanged.
============================================================ */

let talapatrakAutoSaveTimer = null;

let talapatrakAutoSaveInProgress = false;

window.talapatrakHasUnsavedChanges = false;


/* ============================================================
   SCHEDULE AUTO SAVE
============================================================ */

function scheduleTalapatrakAutoSave() {


      if (window.talapatrakOpeningInProgress === true) {

        console.log(
            "Talapatrak autosave scheduling skipped — record is opening."
        );

        return;

    }
    /*
    ========================================================
       PRINTING

       NEVER schedule autosave while printing.
    ========================================================
    */

    if (
        window.talapatrakIsPrinting  === true
    ) {

        console.log(
            "Talapatrak autosave scheduling skipped — printing."
        );

        return;

    }


    /*
    ========================================================
       DO NOT START MULTIPLE TIMERS
    ========================================================
    */

    if (talapatrakAutoSaveTimer) {

        clearTimeout(
            talapatrakAutoSaveTimer
        );

    }


    /*
    ========================================================
       KHATA IMPORT
    ========================================================
    */

    if (
        window.khataImportInProgress
    ) {

        console.log(
            "Talapatrak autosave scheduling skipped — Khata import is in progress."
        );

        return;

    }


    /*
    ========================================================
       WAIT UNTIL USER STOPS EDITING
    ========================================================
    */

    talapatrakAutoSaveTimer =
        setTimeout(
            async function () {

                /*
                =================================================
                   PRINTING CHECK AGAIN

                   Printing may have started while timer
                   was waiting.
                =================================================
                */

                if (
                    window.talapatrakIsPrinting  === true
                ) {

                    console.log(
                        "Talapatrak autosave cancelled — printing."
                    );

                    return;

                }


                /*
                =================================================
                   KHATA IMPORT CHECK
                =================================================
                */

                if (
                    window.khataImportInProgress
                ) {

                    console.log(
                        "Talapatrak autosave skipped — Khata import is in progress."
                    );

                    return;

                }


                /*
                =================================================
                   DO NOT OVERLAP SAVES
                =================================================
                */

                if (
                    talapatrakAutoSaveInProgress
                ) {

                    return;

                }


                /*
                =================================================
                   EDITOR MUST BE VISIBLE
                =================================================
                */

                const editor =
                    document.getElementById(
                        "talapatrakEditorView"
                    );


                if (
                    !editor ||
                    editor.style.display === "none"
                ) {

                    return;

                }


                /*
                =================================================
                   DO NOT SAVE EMPTY VILLAGE
                =================================================
                */

                const mojeInput =
                    document.getElementById(
                        "talapatrakMoje"
                    );


                const moje =
                    mojeInput
                        ?.value
                        ?.trim()
                        || "";


                if (!moje) {

                    return;

                }


                /*
                =================================================
                   FINAL PRINT CHECK

                   This is immediately before save.
                =================================================
                */

                if (
                    window.talapatrakIsPrinting  === true
                ) {

                    console.log(
                        "Talapatrak autosave cancelled before save — printing."
                    );

                    return;

                }


                /*
                =================================================
                   FINAL KHATA CHECK
                =================================================
                */

                if (
                    window.khataImportInProgress
                ) {

                    console.log(
                        "Talapatrak autosave cancelled before save — Khata import is in progress."
                    );

                    return;

                }


                /*
                =================================================
                   START SAVE
                =================================================
                */

                talapatrakAutoSaveInProgress =
                    true;


                try {

                    /*
                    * ========================================================
                    * AUTOSAVE ONLY RUNS FOR UNSAVED CHANGES
                    *
                    * IMPORTANT:
                    * Autosave saves the complete editor dataset.
                    * It does NOT perform synchronization.
                    *
                    * Manual SAVE remains responsible for sync.
                    * ========================================================
                    */

                    if (
                        window.talapatrakHasUnsavedChanges !== true
                    ) {

                        console.log(
                            "TALAPATRAK AUTOSAVE SKIPPED — NO UNSAVED CHANGES"
                        );

                        return;

                    }


                    const autosaveResult =
                        await saveTalapatrak(false);


                    if (autosaveResult) {

                        console.log(
                            "🟢 TALAPATRAK AUTOSAVE COMPLETE — ALL EDITOR DATA SAVED, SYNC SKIPPED"
                        );

                    }
                    else {

                        console.warn(
                            "🔴 TALAPATRAK AUTOSAVE FAILED — DATA WAS NOT CONFIRMED SAVED"
                        );

                    }

                }

                catch(error) {

                    console.error(
                        "Talapatrak autosave error:",
                        error
                    );

                }

                finally {

                    talapatrakAutoSaveInProgress =
                        false;

                }

            },

            1000
        );

}

function markTalapatrakRowAsChanged(row) {

    if (!row) {

        return;

    }


    const memoryRowIndex =
        row.dataset.memoryRowIndex;


    if (
        memoryRowIndex === undefined
    ) {

        return;

    }


    if (
        !(window.talapatrakUnsavedRows instanceof Set)
    ) {

        window.talapatrakUnsavedRows =
            new Set();

    }


    window.talapatrakUnsavedRows.add(
        Number(memoryRowIndex)
    );


    window.talapatrakHasUnsavedChanges =
        true;


    addTalapatrakUnsavedDot(
        row
    );


    console.log(
        "🟡 TALAPATRAK UNSAVED ROW:",
        Number(memoryRowIndex) + 1
    );

}


function addTalapatrakUnsavedDot(row) {

    if (!row) {

        return;

    }


    /*
    ------------------------------------------------------------
    DO NOT CREATE DUPLICATE DOTS
    ------------------------------------------------------------
    */

    if (
        row.querySelector(
            ".talapatrakUnsavedDot"
        )
    ) {

        return;

    }


    const firstCell =
        row.querySelector(
            "td"
        );


    if (!firstCell) {

        return;

    }


    const dot =
        document.createElement(
            "span"
        );


    dot.className =
        "talapatrakUnsavedDot";


    dot.title =
        "Unsaved changes — press SAVE";


    firstCell.style.position =
        "relative";


    firstCell.appendChild(
        dot
    );

}


/* ============================================================
   TALAPATRAK SAVED STATE
============================================================ */

function markTalapatrakAsSaved() {

    window.talapatrakHasUnsavedChanges =
        false;


    if (
        window.talapatrakUnsavedRows instanceof Set
    ) {

        window.talapatrakUnsavedRows.clear();

    }


    /* Remove visible dots immediately */

    document
        .querySelectorAll(
            ".talapatrakUnsavedDot"
        )
        .forEach(
            function(dot) {

                dot.remove();

            }
        );


    console.log(
        "🟢 TALAPATRAK MARKED AS SAVED — ALL UNSAVED ROW DOTS REMOVED"
    );

}

/* ============================================================
   ATTACH AUTO SAVE LISTENERS
============================================================ */


function setupTalapatrakAutoSave() {

    if (window.khataImportInProgress) {

        console.log(
            "Autosave skipped — Khata import is currently running."
        );

        return;

    }


    const editor =
        document.getElementById(
            "talapatrakEditorView"
        );


    if (!editor) {

        return;

    }


    /*
    ========================================================
       PREVENT DUPLICATE LISTENER
    ========================================================
    */

    if (
        editor.dataset.autosaveAttached === "true"
    ) {

        return;

    }


    editor.dataset.autosaveAttached =
        "true";


    /*
    ========================================================
       BLUR

       DO NOT START A NEW AUTOSAVE HERE.

       Input/change handlers already schedule autosave.

       Blur is only useful for logging / debugging.
    ========================================================
    */

    editor.addEventListener(
        "blur",
        function () {

            console.log(
                "TALAPATRAK BLUR"
            );


            if (
                window.talapatrakIsPrinting  === true
            ) {

                console.log(
                    "Autosave skipped — printing."
                );

                return;

            }


            /*
                IMPORTANT:

                Do NOT call scheduleTalapatrakAutoSave()
                here.

                The input/change listeners already did that.
            */

        },
        true
    );


    console.log(
        "Talapatrak autosave initialized."
    );

}



/* ============================================================
        SAVE BUTTON
============================================================ */

if (saveTalapatrakButton) {

    saveTalapatrakButton.onclick =
        async function() {

            if (
                saveTalapatrakButton.disabled
            ) {

                return;

            }


            saveTalapatrakButton.disabled =
                true;


            saveTalapatrakButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Saving...

            `;


            try {

                await saveTalapatrak(
                    true
                );

            }

            finally {

                saveTalapatrakButton.disabled =
                    false;


                saveTalapatrakButton.innerHTML = `

                    <i class="fa-solid fa-floppy-disk"></i>

                    Save

                `;

            }

        };

}



/* ============================================================
   GENERATE TALAPATRAK TOTAL BUTTON
============================================================ */

const generateTalapatrakTotalButton =
    document.getElementById(
        "generateTalapatrakTotalButton"
    );



function initializeTalapatrakGenerateTotalButton() {

    const button =
        document.getElementById(
            "generateTalapatrakTotalButton"
        );


    if (!button) {

        console.warn(
            "Generate Total button not found."
        );

        return;

    }


    /* ========================================================
       PREVENT DUPLICATE LISTENERS
    ======================================================== */

    button.onclick = null;


    button.onclick =
        function () {

            generateTalapatrakTotalsAndSummary();

        };


    console.log(
        "Talapatrak Generate Total button initialized."
    );

}



/* ============================================================
   GO TO TALAPATRAK PAGE
============================================================ */

function goToTalapatrakPage(pageNumber) {

    if (
        typeof renderTalapatrakPage !== "function"
    ) {

        console.warn(
            "goToTalapatrakPage: renderTalapatrakPage not found."
        );

        return;

    }


    const totalPages =
        Number(
            window.talapatrakTotalPages
        ) || 1;


    let targetPage =
        Number(pageNumber);


    if (
        !Number.isFinite(targetPage)
    ) {

        targetPage = 1;

    }


    targetPage =
        Math.max(
            1,
            Math.min(
                targetPage,
                totalPages
            )
        );


    console.log(
        "TALAPATRAK GO TO PAGE:",
        targetPage
    );


    renderTalapatrakPage(
        targetPage
    );

}


  /* ============================================================
   TALAPATRAK PAGINATION UI
============================================================ */

function createTalapatrakPaginationUI() {

    let pagination =
        document.getElementById(
            "talapatrakPagination"
        );


    if (!pagination) {

        pagination =
            document.createElement(
                "div"
            );


        pagination.id =
            "talapatrakPagination";


        pagination.className =
            "talapatrakPagination";


        pagination.innerHTML = `

            <button
                type="button"
                id="talapatrakFirstPage">

                <i class="fa-solid fa-angles-left"></i>

            </button>


            <button
                type="button"
                id="talapatrakPreviousPage">

                <i class="fa-solid fa-chevron-left"></i>

            </button>


            <div class="talapatrakPageJump">

                <span>Page</span>

                <input
                    type="number"
                    id="talapatrakPageInput"
                    min="1"
                    value="1">

                <span>of</span>

                <strong id="talapatrakTotalPages">
                    1
                </strong>

            </div>


            <button
                type="button"
                id="talapatrakNextPage">

                <i class="fa-solid fa-chevron-right"></i>

            </button>


            <button
                type="button"
                id="talapatrakLastPage">

                <i class="fa-solid fa-angles-right"></i>

            </button>


            <span
                id="talapatrakPageInfo"
                class="talapatrakPageInfo">
            </span>

        `;


        const table =
            document.getElementById(
                "talapatrakTable"
            );


        const wrapper =
            table
                ? table.closest(
                    ".talapatrakTableWrapper"
                )
                : null;


        if (
            wrapper &&
            wrapper.parentElement
        ) {

            wrapper.after(
                pagination
            );

        }

    }


    const first =
        document.getElementById(
            "talapatrakFirstPage"
        );


    const previous =
        document.getElementById(
            "talapatrakPreviousPage"
        );


    const next =
        document.getElementById(
            "talapatrakNextPage"
        );


    const last =
        document.getElementById(
            "talapatrakLastPage"
        );


    const input =
        document.getElementById(
            "talapatrakPageInput"
        );


    if (first) {

        first.onclick =
            function() {

                syncCurrentTalapatrakPageToMemory();

                renderTalapatrakPage(1);

            };

    }


    if (previous) {

        previous.onclick =
            function() {

                const current =
                    Number(
                        window.talapatrakCurrentPage
                    ) || 1;


                if (
                    current <= 1
                ) {

                    return;

                }


                syncCurrentTalapatrakPageToMemory();

                renderTalapatrakPage(
                    current - 1
                );

            };

    }


    if (next) {

        next.onclick =
            function() {

                const current =
                    Number(
                        window.talapatrakCurrentPage
                    ) || 1;


                const total =
                    Number(
                        window.talapatrakTotalPages
                    ) || 1;


                if (
                    current >= total
                ) {

                    return;

                }


                syncCurrentTalapatrakPageToMemory();

                renderTalapatrakPage(
                    current + 1
                );

            };

    }


    if (last) {

        last.onclick =
            function() {

                const total =
                    Number(
                        window.talapatrakTotalPages
                    ) || 1;


                syncCurrentTalapatrakPageToMemory();

                renderTalapatrakPage(
                    total
                );

            };

    }


    if (input) {

        input.onkeydown =
            function(event) {

                if (
                    event.key !== "Enter"
                ) {

                    return;

                }


                event.preventDefault();


                let page =
                    Number(
                        input.value
                    );


                const total =
                    Number(
                        window.talapatrakTotalPages
                    ) || 1;


                if (
                    !Number.isFinite(page)
                ) {

                    page = 1;

                }


                page =
                    Math.max(
                        1,
                        Math.min(
                            Math.floor(page),
                            total
                        )
                    );


                syncCurrentTalapatrakPageToMemory();


                renderTalapatrakPage(
                    page
                );


                input.blur();

            };

    }


    return pagination;

}


  /* ============================================================
   RENDER TALAPATRAK DATA PAGE
============================================================ */

function renderTalapatrakPage(pageNumber) {

    console.log("======================================");
    console.log("TALAPATRAK PAGE RENDER");
    console.log("Requested Page:", pageNumber);


    /* ========================================================
       1. VALIDATE MEMORY
    ======================================================== */

    if (!Array.isArray(window.talapatrakAllRows)) {

        console.warn(
            "No Talapatrak row memory found."
        );

        return;
    }


    /* ========================================================
       2. CALCULATE DATA PAGES
    ======================================================== */

    const totalRows =
        window.talapatrakAllRows.length;

    const rowsPerPage =
        Number(window.talapatrakRowsPerPage) || 20;

    const dataPages =
        Math.max(
            1,
            Math.ceil(totalRows / rowsPerPage)
        );




    /* ========================================================
       3. TOTAL DATA PAGES

       Summary pages are not part of pagination.
    ======================================================== */

    const totalPages =
        dataPages;


    console.log(
        "DATA PAGES:",
        dataPages
    );

    console.log(
        "TOTAL PAGES:",
        totalPages
    );


    /* ========================================================
       5. NORMALIZE PAGE NUMBER
    ======================================================== */

    pageNumber =
        Number(pageNumber);

    if (!Number.isFinite(pageNumber)) {
        pageNumber = 1;
    }

    pageNumber =
        Math.max(
            1,
            Math.min(
                pageNumber,
                totalPages
            )
        );


    window.talapatrakCurrentPage =
        pageNumber;

    window.talapatrakTotalPages =
        totalPages;


    /* ========================================================
       6. FIND MAIN TALAPATRAK PAGE
    ======================================================== */

    const editorPage =
        document.querySelector(
            ".talapatrakPage"
        );



    /* ========================================================
       7. HIDE GRAND TOTAL WHEN SWITCHING DATA PAGE
    ======================================================== */

    if (
        typeof hideTalapatrakTotalsSection ===
        "function"
    ) {

        hideTalapatrakTotalsSection();

    }


    /* ========================================================
       8. THIS IS A DATA PAGE
    ======================================================== */

    if (editorPage) {

        editorPage.style.display =
            "block";

        editorPage.style.visibility =
            "visible";

        editorPage.style.opacity =
            "1";

    }



    /* ========================================================
       11. CALCULATE MEMORY RANGE
    ======================================================== */

    const startIndex =
        (
            pageNumber - 1
        ) *
        rowsPerPage;


    const endIndex =
        Math.min(
            startIndex + rowsPerPage,
            totalRows
        );


    console.log(
        "DATA PAGE:",
        pageNumber
    );

    console.log(
        "Rows:",
        startIndex,
        "to",
        endIndex
    );


    /* ========================================================
       12. VALIDATE TABLE BODY
    ======================================================== */

    if (
        typeof talapatrakBody ===
        "undefined" ||
        !talapatrakBody
    ) {

        console.error(
            "❌ TALAPATRAK BODY NOT FOUND"
        );

        return;

    }


    /* ========================================================
       13. CLEAR CURRENT DOM ROWS
    ======================================================== */

    talapatrakBody.innerHTML =
        "";


    /* ========================================================
       14. RENDER CURRENT DATA PAGE
    ======================================================== */

    let renderedCount =
        0;


    for (
        let memoryIndex = startIndex;
        memoryIndex < endIndex;
        memoryIndex++
    ) {

        const sourceRow =
            window.talapatrakAllRows[
                memoryIndex
            ];


        const rowData =
            sourceRow &&
            typeof sourceRow === "object"
                ? {
                    ...sourceRow
                }
                : {};


        /*
        * Preserve the exact position of this row
        * inside the complete Talapatrak memory.
        *
        * This is critical because only 20 rows exist
        * in the DOM at any one time.
        */
        rowData._memoryIndex =
            memoryIndex;


        /*
        * Human-visible row number.
        */
        rowData._displayRowNumber =
            memoryIndex + 1;


        /*
        ============================================================
        UNSAVED ROW TRACKING

        memoryIndex is the permanent position of this row
        inside talapatrakAllRows.

        This is NOT the visible row number.
        It remains correct across pagination.
        ============================================================
        */

        rowData._memoryIndex =
            memoryIndex;


        const row =
            createTalapatrakRow(
                rowData,
                {
                    appendToBody: true
                }
            );


        if (row) {

            renderedCount++;

        }

    }


    /* ========================================================
       15. VERIFY
    ======================================================== */

    const domRows =
        talapatrakBody.querySelectorAll(
            ".talapatrakRow"
        );


    console.log(
        "TALAPATRAK DOM ROWS AFTER RENDER:",
        domRows.length
    );


    /* ========================================================
       16. UPDATE PAGINATION
    ======================================================== */

    if (
        typeof updateTalapatrakPaginationUI ===
        "function"
    ) {

        updateTalapatrakPaginationUI();

    }


    console.log(
        "Rendered:",
        renderedCount,
        "rows"
    );

    console.log(
        "TALAPATRAK DATA PAGE RENDER COMPLETE"
    );
}


/* ============================================================
        OPEN TALAPATRAK EDITOR VIEW
============================================================ */

function openTalapatrakEditor() {

    console.log(
        "OPEN TALAPATRAK EDITOR → HIDING ALL MAIN VIEWS"
    );


    /*
    ============================================================
        HIDE EVERY APPLICATION VIEW
    ============================================================
    */

    showMainView(
        "talapatrakEditorView"
    );


    /*
    ============================================================
        FULLSCREEN EDITOR MODE
    ============================================================
    */

    document.body.classList.add(
        "talapatrakFullscreen"
    );


    /*
    ============================================================
        MAKE SURE PRINT CONTAINER IS HIDDEN
    ============================================================
    */

    const printContainer =
        document.getElementById(
            "talapatrakPrintContainer"
        );


    if (printContainer) {

        printContainer.style.display =
            "none";

    }


    /*
    ============================================================
        RESET PAGE SCROLL
    ============================================================
    */

    window.scrollTo(
        0,
        0
    );


    console.log(
        "Talapatrak editor opened"
    );

}



/* ============================================================
   OPEN TALAPATRAK RECORD
   ------------------------------------------------------------
   MEMORY = ALL ROWS
   DOM    = ONLY CURRENT PAGE
============================================================ */


async function openTalapatrakRecord(record) {

    /*
    ============================================================
    TALAPATRAK RECORD OPEN
    ============================================================

    ARCHITECTURE

    FIRESTORE
        ↓
    record.rows
        ↓
    savedRows
        ↓
    window.talapatrakAllRows
        ↓
    renderTalapatrakPage()
        ↓
    DOM = current 20-row page only

    IMPORTANT:

    window.talapatrakAllRows
        = ALL DATA ROWS

    DOM
        = CURRENT PAGE ONLY
    ============================================================
    */

    window.talapatrakOpeningInProgress = true;


    console.log(
        "======================================"
    );

    console.log(
        "TALAPATRAK OPEN START"
    );

    console.log(
        "======================================"
    );


    try {

        /* ========================================================
           1. VALIDATE RECORD
        ======================================================== */

        if (
            !record ||
            typeof record !== "object"
        ) {

            console.error(
                "OPEN → INVALID RECORD:",
                record
            );


            return;

        }


        if (!record.id) {

            console.error(
                "OPEN → RECORD ID MISSING:",
                record
            );


            return;

        }


        console.log(
            "OPEN → DOCUMENT ID:",
            record.id
        );

        console.log(
            "OPEN → VILLAGE:",
            record.moje || ""
        );


        /* ========================================================
           2. GET SAVED ROWS
        ======================================================== */

        const savedRows =
            Array.isArray(record.rows)
                ? record.rows
                : [];


        console.log(
            "OPEN → FIRESTORE ROW COUNT:",
            savedRows.length
        );


        /* ========================================================
           3. SET CURRENT RECORD
        ======================================================== */

        currentTalapatrakRecord = {
            ...record
        };


        currentTalapatrakDocumentId =
            record.id;


        /* ========================================================
           4. OPEN TALAPATRAK EDITOR
        ======================================================== */

        openTalapatrakEditor();


        /* ========================================================
           5. INITIALIZE PRINT BUTTON
        ======================================================== */

        const printButton =
            document.getElementById(
                "talapatrakPrintButton"
            );


        if (printButton) {

            if (
                printButton.dataset.talapatrakInitialized !==
                "true"
            ) {

                initializeTalapatrakPrintButton();

                printButton.dataset.talapatrakInitialized =
                    "true";

            }

        }
        else {

            initializeTalapatrakPrintButton();

        }


        /* ========================================================
           6. INITIALIZE GENERATE TOTAL BUTTON
        ======================================================== */

        const generateTotalButton =
            document.getElementById(
                "generateTalapatrakTotalButton"
            );


        if (generateTotalButton) {

            if (
                generateTotalButton.dataset.talapatrakInitialized !==
                "true"
            ) {

                initializeTalapatrakGenerateTotalButton();

                generateTotalButton.dataset.talapatrakInitialized =
                    "true";

            }

        }
        else {

            initializeTalapatrakGenerateTotalButton();

        }


        /* ========================================================
           7. LOAD EDITOR VILLAGE TITLE
        ======================================================== */

        const editorVillageName =
            document.getElementById(
                "talapatrakEditorVillageName"
            );


        if (editorVillageName) {

            editorVillageName.textContent =
                record.moje ||
                "Talapatrak";

        }


        /* ========================================================
           8. LOAD HEADER FIELDS
        ======================================================== */

        const mojeInput =
            document.getElementById(
                "talapatrakMoje"
            );


        const talukaInput =
            document.getElementById(
                "talapatrakTaluka"
            );


        const jilloInput =
            document.getElementById(
                "talapatrakJillo"
            );


        if (mojeInput) {

            mojeInput.value =
                record.moje || "";

        }


        if (talukaInput) {

            talukaInput.value =
                record.taluka || "";

        }


        if (jilloInput) {

            jilloInput.value =
                record.jillo || "";

        }


        /* ========================================================
           9. LOAD YEAR DROPDOWN

           IMPORTANT:

           We must populate the dropdown FIRST.

           Then we make sure the saved year exists.

           Then we select the saved year.

           This allows old records such as:

               2008-2009
               2018-2019
               2021-2022

           to open correctly.
        ======================================================== */

        const recordYear =
            record.year ||
            getCurrentTalapatrakYear();


        const yearSelect =
            document.getElementById(
                "talapatrakYear"
            );


        if (yearSelect) {

            /*
            --------------------------------------------------------
                Populate standard year options
            --------------------------------------------------------
            */

            populateTalapatrakYearOptions();


            /*
            --------------------------------------------------------
                Check whether saved year exists
            --------------------------------------------------------
            */

            const yearExists =
                Array.from(
                    yearSelect.options
                ).some(
                    function(option) {

                        return option.value ===
                            String(recordYear);

                    }
                );


            /*
            --------------------------------------------------------
                Older year protection

                If the record is older than the
                normal 20-year dropdown range,
                add that year.
            --------------------------------------------------------
            */

            if (!yearExists) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    String(recordYear);


                option.textContent =
                    String(recordYear);


                /*
                    Put the old saved year at
                    the beginning of the list.
                */

                yearSelect.insertBefore(
                    option,
                    yearSelect.firstChild
                );


                console.log(
                    "OPEN → OLD YEAR ADDED TO DROPDOWN:",
                    recordYear
                );

            }


            /*
            --------------------------------------------------------
                Select saved year
            --------------------------------------------------------
            */

            yearSelect.value =
                String(recordYear);


            console.log(
                "OPEN → YEAR DROPDOWN VALUE:",
                yearSelect.value
            );

        }
        else {

            console.warn(
                "OPEN → talapatrakYear SELECT NOT FOUND"
            );

        }


        /* ========================================================
           10. UPDATE YEAR DISPLAY
        ======================================================== */

        if (
            typeof updateTalapatrakYearDisplay ===
            "function"
        ) {

            updateTalapatrakYearDisplay(
                recordYear
            );

        }
        else {

            const editorYear =
                document.getElementById(
                    "talapatrakEditorYear"
                );


            if (editorYear) {

                editorYear.textContent =
                    recordYear;

            }

        }


        console.log(
            "OPEN → YEAR:",
            recordYear
        );


        /* ========================================================
           11. CLEAR OLD DOM ROWS

           IMPORTANT:
           This only clears the visible table.

           It does NOT clear memory.
        ======================================================== */

        clearTalapatrakRows();


        /* ========================================================
           12. CLEAR OLD GENERATED TOTAL STATE

           A newly opened record must NOT inherit the previous
           record's generated totals.
        ======================================================== */

        window.talapatrakTotals =
            null;


        /* ========================================================
           13. SHOW MAIN TALAPATRAK TABLE
        ======================================================== */

        const talapatrakTable =
            document.getElementById(
                "talapatrakTable"
            );


        if (talapatrakTable) {

            talapatrakTable.style.display =
                "";

        }


        /* ========================================================
           14. COPY FIRESTORE ROWS INTO MEMORY

           THIS IS THE SINGLE SOURCE OF TRUTH.

           Never work directly on record.rows.
        ======================================================== */

        window.talapatrakAllRows =
            savedRows.map(
                function(row) {

                    if (
                        row &&
                        typeof row === "object"
                    ) {

                        return {
                            ...row
                        };

                    }

                    return {};

                }
            );


        /* ========================================================
           15. EMPTY RECORD SAFETY

           An empty Talapatrak still needs one editable row.
        ======================================================== */

        if (
            window.talapatrakAllRows.length === 0
        ) {

            window.talapatrakAllRows = [
                {}
            ];

        }


        /* ========================================================
           16. VERIFY MEMORY
        ======================================================== */

        console.log(
            "======================================"
        );

        console.log(
            "OPEN → MEMORY LOAD COMPLETE"
        );

        console.log(
            "MEMORY ROW COUNT:",
            window.talapatrakAllRows.length
        );


        if (
            window.talapatrakAllRows.length > 0
        ) {

            console.log(
                "FIRST MEMORY ROW:",
                window.talapatrakAllRows[0]
            );

        }


        console.log(
            "======================================"
        );


        /* ========================================================
           17. PAGINATION CONFIGURATION
        ======================================================== */

        window.talapatrakRowsPerPage =
            20;


        window.talapatrakCurrentPage =
            1;


        /* ========================================================
           18. CALCULATE DATA PAGES
        ======================================================== */

        const dataPages =
            Math.max(
                1,
                Math.ceil(
                    window.talapatrakAllRows.length /
                    window.talapatrakRowsPerPage
                )
            );


        window.talapatrakTotalPages =
            dataPages;


        console.log(
            "OPEN → DATA PAGES:",
            dataPages
        );


        /* ========================================================
           19. CREATE PAGINATION UI
        ======================================================== */

        createTalapatrakPaginationUI();


        /* ========================================================
           20. RENDER FIRST DATA PAGE
        ======================================================== */

        console.log(
            "OPEN → RENDERING PAGE 1"
        );


        renderTalapatrakPage(1);


          if (
              typeof initializePanchayatRowSearch ===
              "function"
          ) {

              initializePanchayatRowSearch();

          }


        /* ========================================================
           21. FINAL DOM CHECK
        ======================================================== */

        const domRowCount =
            talapatrakBody
                ? talapatrakBody.querySelectorAll(
                    ".talapatrakRow"
                ).length
                : 0;


        console.log(
            "======================================"
        );

        console.log(
            "OPEN → FINAL CHECK"
        );

        console.log(
            "MEMORY ROWS:",
            Array.isArray(
                window.talapatrakAllRows
            )
                ? window.talapatrakAllRows.length
                : 0
        );

        console.log(
            "DOM ROWS:",
            domRowCount
        );

        console.log(
            "CURRENT PAGE:",
            window.talapatrakCurrentPage
        );

        console.log(
            "TOTAL DATA PAGES:",
            window.talapatrakTotalPages
        );

        console.log(
            "OPEN TALAPATRAK COMPLETE:",
            record.id
        );

        console.log(
            "======================================"
        );

    }

    catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "ERROR OPENING TALAPATRAK:",
            error
        );

        console.error(
            "======================================"
        );




    }

    finally {

        /* ========================================================
           RESUME AUTOSAVE

           This MUST happen even if an error occurs.
        ======================================================== */

        window.talapatrakOpeningInProgress =
            false;


        console.log(
            "TALAPATRAK OPENING → AUTOSAVE RESUMED"
        );

    }

}



/* ============================================================
   TALAPATRAK — FULL VIEW TOGGLE
============================================================ */

const talapatrakFullViewButton =
    document.getElementById(
        "talapatrakFullViewButton"
    );


if (talapatrakFullViewButton) {

    talapatrakFullViewButton.addEventListener(
        "click",
        function () {

            const isFullView =
                document.body.classList.toggle(
                    "talapatrakFullViewMode"
                );


            /* ------------------------------------------------
               BUTTON STATE
            ------------------------------------------------ */

            this.setAttribute(
                "title",
                isFullView
                    ? "Exit Full View"
                    : "Full View"
            );

            this.setAttribute(
                "aria-label",
                isFullView
                    ? "Exit Full View"
                    : "Full View"
            );


            /* ------------------------------------------------
               ICON
            ------------------------------------------------ */

            const icon =
                this.querySelector("i");

            if (icon) {

                icon.classList.toggle(
                    "fa-expand",
                    !isFullView
                );

                icon.classList.toggle(
                    "fa-compress",
                    isFullView
                );

            }

        }
    );

}



const talapatrakShrinkViewButton =
    document.getElementById(
        "talapatrakShrinkViewButton"
    );


if (talapatrakShrinkViewButton) {

    talapatrakShrinkViewButton.addEventListener(
        "click",
        function () {

            document.body.classList.remove(
                "talapatrakFullViewMode"
            );

        }
    );

}


/* ============================================================
        FILTER
============================================================ */

function getFilteredTalapatrakRecords() {

    if (!talapatrakSearchTerm) {

        return [
            ...talapatrakRecords
        ];

    }

    return talapatrakRecords.filter(

        function(record) {

            const searchableText = `

                ${record.moje || ""}

                ${record.year || ""}

                ${record.taluka || ""}

                ${record.jillo || ""}

            `
            .toLowerCase();

            return searchableText.includes(
                talapatrakSearchTerm
            );

        }

    );

}


/* ============================================================
        TIMESTAMP
============================================================ */

function getTimestamp(timestamp) {

    if (!timestamp) {

        return 0;

    }

    if (timestamp.toDate) {

        return timestamp
            .toDate()
            .getTime();

    }

    if (timestamp instanceof Date) {

        return timestamp.getTime();

    }

    return new Date(
        timestamp
    ).getTime() || 0;

}


/* ============================================================
        FORMAT DATE
============================================================ */

function formatTalapatrakDate(timestamp) {

    if (!timestamp) {

        return "—";

    }

    const date =
        timestamp.toDate
            ? timestamp.toDate()
            : new Date(
                timestamp
            );

    return date.toLocaleDateString(

        "en-IN",

        {

            day:
                "2-digit",

            month:
                "short",

            year:
                "numeric"

        }

    );

}



const talapatrakSystemCard =
    document.getElementById(
        "talapatrakSystemCard"
    );


if (talapatrakSystemCard) {

    talapatrakSystemCard.addEventListener(

        "click",

        async function() {

            await openTalapatrakManagement();

        }

    );

}

document
    .getElementById("mainBillSystemCard")
    .addEventListener("click", function () {

        showMainView("mainBillsView");

    });




/* ============================================================
   TALAPATRAK INITIALIZATION
============================================================ */

updateTalapatrakYearDisplay();

formatTalapatrakNumberInputs();

setupTalapatrakAutoSave();


registerKeyboardNavigation(
    talapatrakBody
);

console.log(
    "Dynamic Talapatrak system initialized."
);




function prepareTalapatrakPrint(sourceRows) {

    const table =
        document.getElementById(
            "talapatrakTable"
        );

    const container =
        document.getElementById(
            "talapatrakPrintContainer"
        );


    if (
        !table ||
        !container
    ) {

        console.warn(
            "Talapatrak print elements not found."
        );

        return;

    }


    /* ========================================================
       REMOVE OLD PRINT PAGES
    ======================================================== */

    container
        .querySelectorAll(
            ".talapatrakPrintPage"
        )
        .forEach(
            function(page) {

                page.remove();

            }
        );


    /* ========================================================
       GET ALL ROWS
    ======================================================== */

    let allRows = [];


    if (
        Array.isArray(sourceRows)
    ) {

        allRows =
            sourceRows.map(
                function(row, index) {

                    return {

                        ...row,

                        _displayRowNumber:
                            index + 1

                    };

                }
            );

    }

    else if (
        Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        allRows =
            window.talapatrakAllRows.map(
                function(row) {

                    return {
                        ...row
                    };

                }
            );

    }


    console.log(
        "TALAPATRAK PRINT MEMORY ROWS:",
        allRows.length
    );


    /* ========================================================
       REMOVE COMPLETELY EMPTY ROWS
    ======================================================== */

    allRows =
        allRows.filter(
            function(row) {

                if (!row) {
                    return false;
                }

                return Object.keys(row).some(
                    function(key) {

                        return (
                            key !== "_displayRowNumber" &&
                            String(
                                row[key] ?? ""
                            ).trim() !== ""
                        );

                    }
                );

            }
        );


    /* ========================================================
       GLOBAL ROW NUMBER
    ======================================================== */

    allRows =
        allRows.map(
            function(row, index) {

                return {

                    ...row,

                    A:
                        index + 1

                };

            }
        );


    console.log(
        "REAL TALAPATRAK PRINT ROWS:",
        allRows.length
    );


    /* ========================================================
       ROWS PER PAGE
    ======================================================== */

    const rowsPerPage = 20;


    const dataPages =
        Math.max(
            1,
            Math.ceil(
                allRows.length /
                rowsPerPage
            )
        );


    /* ========================================================
       CREATE DATA PAGES
    ======================================================== */

    if (
        allRows.length === 0
    ) {

        createTalapatrakPrintPage(
            [],
            1,
            container,
            table,
            dataPages
        );

    }

    else {

        for (
            let pageNumber = 1;
            pageNumber <= dataPages;
            pageNumber++
        ) {

            const startIndex =
                (
                    pageNumber - 1
                ) *
                rowsPerPage;


            const endIndex =
                Math.min(
                    startIndex +
                    rowsPerPage,
                    allRows.length
                );


            const pageRows =
                allRows.slice(
                    startIndex,
                    endIndex
                );


            console.log(
                "PRINT PAGE:",
                pageNumber,
                "OF:",
                dataPages,
                "ROWS:",
                pageRows.length,
                "GLOBAL:",
                startIndex + 1,
                "→",
                endIndex
            );


            createTalapatrakPrintPage(
                pageRows,
                pageNumber,
                container,
                table,
                dataPages
            );

        }

    }


    /* ========================================================
       COUNT FINAL PRINT PAGES
    ======================================================== */

    const totalPrintPages =
        container.querySelectorAll(
            ".talapatrakPrintPage"
        ).length;


    console.log(
        "TALAPATRAK TOTAL PRINT PAGES:",
        totalPrintPages
    );


    console.log(
        "TALAPATRAK PRINT PREPARATION COMPLETE"
    );

}




/* ============================================================
   CREATE ONE TALAPATRAK PRINT PAGE
   ------------------------------------------------------------
   FINAL PRINT VERSION

   IMPORTANT:
   - Does NOT use createTalapatrakRow()
   - Does NOT create input elements
   - Does NOT depend on editor DOM values
   - Uses window.talapatrakAllRows memory data
   - Prints A → S as plain text
   - T and U remain excluded
   - Exactly 20 rows per page
============================================================ */

function createTalapatrakPrintPage(
    pageRows,
    pageNumber,
    container,
    sourceTable,
    totalPages
) {

    console.log(
        "======================================"
    );

    console.log(
        "CREATING TALAPATRAK PRINT PAGE:",
        pageNumber,
        "/",
        totalPages
    );

    console.log(
        "PAGE ROW COUNT:",
        Array.isArray(pageRows)
            ? pageRows.length
            : "NOT ARRAY"
    );


    /* ========================================================
       SAFETY
    ======================================================== */

    if (
        !Array.isArray(pageRows)
    ) {

        console.error(
            "Talapatrak print pageRows is not an array.",
            pageRows
        );

        return;

    }


    /* ========================================================
       CREATE PAGE
    ======================================================== */

    const printPage =
        document.createElement(
            "div"
        );


    printPage.className =
        "talapatrakPrintPage";


    printPage.dataset.page =
        pageNumber;


    /* ========================================================
       GET HEADER INFORMATION
    ======================================================== */

    const mojeElement =
        document.getElementById(
            "talapatrakMoje"
        );

    const talukaElement =
        document.getElementById(
            "talapatrakTaluka"
        );

    const jilloElement =
        document.getElementById(
            "talapatrakJillo"
        );

    const yearElement =
        document.getElementById(
            "talapatrakYear"
        );


    const moje =
        mojeElement
            ? mojeElement.value.trim()
            : "";


    const taluka =
        talukaElement
            ? talukaElement.value.trim()
            : "";


    const jillo =
        jilloElement
            ? jilloElement.value.trim()
            : "";


    const year =
        yearElement
            ? convertToGujaratiDigits(
                yearElement.value
            )
            : "";


    /* ========================================================
       HEADER
    ======================================================== */

    const printHeader =
        document.createElement(
            "div"
        );


    printHeader.className =
        "talapatrakPrintHeader";


    printHeader.innerHTML = `

        <div class="talapatrakPrintHeaderItem">
            <strong>મોજે :</strong>
            <span>
                ${escapeTalapatrakHTML(moje)}
            </span>
        </div>

        <div class="talapatrakPrintHeaderItem">
            <strong>તાલુકા :</strong>
            <span>
                ${escapeTalapatrakHTML(taluka)}
            </span>
        </div>

        <div class="talapatrakPrintHeaderItem">
            <strong>જિલ્લો :</strong>
            <span>
                ${escapeTalapatrakHTML(jillo)}
            </span>
        </div>

        <div class="talapatrakPrintHeaderItem">
            <strong>ગામના નમૂના નંબર-૧૧ :</strong>
            <span>
                તાળાપત્રક
            </span>
        </div>

        <div class="talapatrakPrintHeaderItem">
            <strong>વર્ષ :</strong>
            <span>
                ${escapeTalapatrakHTML(year)}
            </span>
        </div>

    `;


    printPage.appendChild(
        printHeader
    );


    /* ========================================================
       CREATE TABLE
    ======================================================== */

    const printTable =
        document.createElement(
            "table"
        );


    printTable.className =
        "talapatrakPrintTable";


    printTable.style.tableLayout =
        "auto";


    printTable.style.width =
        "100%";


    printTable.style.maxWidth =
        "100%";


    /* ========================================================
       COPY THEAD
    ======================================================== */

    if (
        sourceTable
    ) {

        const sourceThead =
            sourceTable.querySelector(
                "thead"
            );


        if (
            sourceThead
        ) {

            const clonedThead =
                sourceThead.cloneNode(
                    true
                );


            /*
            Remove print-hidden header cells.
            */

            clonedThead
                .querySelectorAll(
                    ".printHide"
                )
                .forEach(
                    function(element) {

                        element.remove();

                    }
                );


            /*
            Remove input/button elements from
            the cloned header if present.
            */

            clonedThead
                .querySelectorAll(
                    "input, button"
                )
                .forEach(
                    function(element) {

                        element.remove();

                    }
                );


            printTable.appendChild(
                clonedThead
            );

        }

    }


    /* ========================================================
       TBODY
    ======================================================== */

    const printTbody =
        document.createElement(
            "tbody"
        );


    printTable.appendChild(
        printTbody
    );


    /* ========================================================
       PRINT COLUMNS
    ======================================================== */

    const columns = [

        "A",
        "B",
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
        "S"

    ];


    /* ========================================================
       CREATE ROWS
    ======================================================== */

    pageRows.forEach(
        function(rowData, rowIndex) {

            if (
                !rowData
            ) {

                return;

            }


            console.log(
                "TALAPATRAK PRINT ROW DATA:",
                rowData
            );


            const printRow =
                document.createElement(
                    "tr"
                );


            printRow.className =
                "talapatrakRow";


            /* ==================================================
               COLUMNS A → S
            ================================================== */

            columns.forEach(
                function(column) {

                    const td =
                        document.createElement(
                            "td"
                        );


                    let value = "";


                    /* ------------------------------------------
                       READ MEMORY VALUE
                    ------------------------------------------ */

                    if (
                        Object.prototype.hasOwnProperty.call(
                            rowData,
                            column
                        )
                    ) {

                        value =
                            rowData[column];

                    }


                    /* ------------------------------------------
                       LOWERCASE FALLBACK
                    ------------------------------------------ */

                    if (
                        value === undefined ||
                        value === null
                    ) {

                        const lowerColumn =
                            column.toLowerCase();


                        if (
                            Object.prototype.hasOwnProperty.call(
                                rowData,
                                lowerColumn
                            )
                        ) {

                            value =
                                rowData[
                                    lowerColumn
                                ];

                        }

                    }


                    /* ------------------------------------------
                       NULL → EMPTY
                    ------------------------------------------ */

                    if (
                        value === undefined ||
                        value === null
                    ) {

                        value = "";

                    }


                    /* ------------------------------------------
                       DATE FORMAT
                    ------------------------------------------ */

                    if (
                        column === "M"
                    ) {

                        value =
                            formatTalapatrakInputDate(
                                value
                            );

                    }


                    /* ------------------------------------------
                       CONVERT TO STRING
                    ------------------------------------------ */

                    value =
                        String(value);


                    /* ------------------------------------------
                       IMPORTANT

                       Use textContent.

                       NOT innerHTML.

                       NOT input.value.

                       This guarantees that the actual
                       data is present as printable text.
                    ------------------------------------------ */

                    td.textContent =
                        value;


                    printRow.appendChild(
                        td
                    );

                }
            );


            printTbody.appendChild(
                printRow
            );

        }
    );

    /* ========================================================
       GRAND TOTAL — ONLY ON FINAL TALAPATRAK PAGE
     ======================================================== */

    const isFinalTalapatrakPage =
        pageNumber === totalPages;


    if (
        isFinalTalapatrakPage
    ) {

        const totals =
            calculateTalapatrakMemoryTotals();


        console.log(
            "ADDING GRAND TOTAL TO FINAL PRINT PAGE:",
            totals
        );


        const totalRow =
            document.createElement("tr");


        totalRow.className =
            "talapatrakPrintGrandTotalRow";


        function formatPrintTotal(value) {

            return Number(
                value || 0
            ).toFixed(2);

        }


        totalRow.innerHTML = `

            <td
                colspan="2"
                class="grandTotalLabel">

                કુલ એકંદર

            </td>

            <td>
                ${formatPrintTotal(totals.C)}
            </td>

            <td>
                ${formatPrintTotal(totals.D)}
            </td>

            <td>
                ${formatPrintTotal(totals.E)}
            </td>

            <td>
                ${formatPrintTotal(totals.F)}
            </td>

            <td>
                ${formatPrintTotal(totals.G)}
            </td>

            <td>
                ${formatPrintTotal(totals.H)}
            </td>

            <td>
                ${formatPrintTotal(totals.I)}
            </td>

            <td>
                ${formatPrintTotal(totals.J)}
            </td>

            <td>
                ${formatPrintTotal(totals.K)}
            </td>

            <td></td>

            <td></td>

            <td>
                ${formatPrintTotal(totals.N)}
            </td>

            <td>
                ${formatPrintTotal(totals.O)}
            </td>

            <td>
                ${formatPrintTotal(totals.P)}
            </td>

            <td>
                ${formatPrintTotal(totals.Q)}
            </td>

            <td>
                ${formatPrintTotal(totals.R)}
            </td>

            <td>
                ${formatPrintTotal(totals.S)}
            </td>

            <td>
                ${formatPrintTotal(totals.T)}
            </td>

            <td>
                ${formatPrintTotal(totals.U)}
            </td>

            <td class="printHide"></td>

            <td class="printHide"></td>

        `;


        printTbody.appendChild(
            totalRow
        );


        console.log(
            "GRAND TOTAL ADDED TO PAGE:",
            pageNumber
        );

    }

    /* ========================================================
       ADD TABLE
    ======================================================== */

    printPage.appendChild(
        printTable
    );


    /* ========================================================
       PAGE NUMBER
    ======================================================== */

    const pageNumberElement =
        document.createElement(
            "div"
        );


    pageNumberElement.className =
        "talapatrakPrintPageNumber";


    pageNumberElement.textContent =
        `Page ${pageNumber}`;


    /* ========================================================
       FOOTER
    ======================================================== */

    const pageFooter =
        document.createElement(
            "div"
        );


    pageFooter.className =
        "talapatrakPrintFooter";


    pageFooter.appendChild(
        pageNumberElement
    );


    printPage.appendChild(
        pageFooter
    );


    /* ========================================================
       DEBUG — VERIFY ACTUAL TEXT
    ======================================================== */

    const firstRow =
        printTbody.querySelector(
            "tr"
        );


    if (
        firstRow
    ) {

        console.log(
            "FIRST PRINT ROW TEXT:",
            Array.from(
                firstRow.querySelectorAll(
                    "td"
                )
            ).map(
                function(td) {

                    return td.textContent;

                }
            )
        );

    }


    /* ========================================================
       FINAL ROW COUNT
    ======================================================== */

    console.log(
        "TALAPATRAK PRINT PAGE:",
        pageNumber,
        "/",
        totalPages,
        "ROWS:",
        printTbody.querySelectorAll(
            "tr"
        ).length
    );


    /* ========================================================
       ADD PAGE TO CONTAINER
    ======================================================== */

    container.appendChild(
        printPage
    );


    console.log(
        "PRINT PAGE ADDED TO CONTAINER:",
        pageNumber
    );

}



/* ============================================================
   PRINT TALAPATRAK

   IMPORTANT:

   1. Sync current DOM page → memory
   2. Collect ALL rows
   3. Generate print pages from ALL rows
   4. Print through iframe
   5. Do NOT modify editor rows
============================================================ */


function printTalapatrak() {

    /*
    ========================================================
    MARK THAT TALAPATRAK STARTED PRINTING
    ========================================================
    */

    window.talapatrakIsPrinting =
        true;


    console.log(
        "======================================"
    );

    console.log(
        "TALAPATRAK PRINT START"
    );

    console.log(
        "======================================"
    );

    console.log(
        "======================================"
    );


    /* ========================================================
       GET TABLE
    ======================================================== */

    const table =
        document.getElementById(
            "talapatrakTable"
        );


    if (!table) {

        console.error(
            "Talapatrak table not found."
        );

       talapatrakIsPrinting = false;

        return;

    }


    /* ========================================================
       VERY IMPORTANT

       Save current visible page into master memory.

       Without this, the last edited page can print stale data.
    ======================================================== */

    if (
        Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        syncCurrentTalapatrakPageToMemory();

    }


    /* ========================================================
       COLLECT ALL ROWS

       This returns ALL rows from memory.
    ======================================================== */

    const rows =
        collectTalapatrakRows();


    console.log(
        "PRINT WILL USE:",
        rows.length,
        "ROWS"
    );


    /* ========================================================
       REMOVE OLD CONTAINER
    ======================================================== */

    const oldContainer =
        document.getElementById(
            "talapatrakPrintContainer"
        );


    if (oldContainer) {

        oldContainer.remove();

    }


    /* ========================================================
       CREATE NEW PRINT CONTAINER
    ======================================================== */

    const printContainer =
        document.createElement("div");

    printContainer.id =
        "talapatrakPrintContainer";

    printContainer.style.display =
        "none";

    document.body.appendChild(
        printContainer
    );


    /* ========================================================
       PREPARE PRINT PAGES

       IMPORTANT:
       Pass rows explicitly.
    ======================================================== */

    prepareTalapatrakPrint(
        rows
    );


    /* ========================================================
       COLLECT PRINT CSS
    ======================================================== */

    const printStyles =
        Array.from(
            document.querySelectorAll(
                'style[data-talapatrak-print]'
            )
        )
        .map(function(style) {

            return style.outerHTML;

        })
        .join("");


    /* ========================================================
       COLLECT GENERATED PAGES
    ======================================================== */

    const pages =
        Array.from(
            printContainer.querySelectorAll(
                ".talapatrakPrintPage"
            )
        )
        .map(function(page) {

            return page.outerHTML;

        })
        .join("");


    if (!pages) {

        console.error(
            "No Talapatrak print pages generated."
        );

        printContainer.remove();

        talapatrakIsPrinting = false;

        return;

    }


    const pageCount =
        printContainer.querySelectorAll(
            ".talapatrakPrintPage"
        ).length;


    console.log(
        "TALAPATRAK PRINT PAGES:",
        pageCount
    );


    /* ========================================================
       CREATE PRINT IFRAME
    ======================================================== */

    const iframe =
        document.createElement("iframe");


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


    const iframeDocument =
        iframe.contentDocument ||
        iframe.contentWindow.document;


    iframeDocument.open();


    iframeDocument.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <meta charset="UTF-8">

            <title>
                Talapatrak Print
            </title>

            ${printStyles}

            <style>

                @page {

                    size: A4 landscape;

                    margin: 8mm;

                }


                html,
                body {

                    margin: 0;

                    padding: 0;

                    width: 100%;

                }


                body {

                    background: white;

                    color: black;

                }


                .talapatrakPrintPage {

                    width: 100%;

                    box-sizing: border-box;

                    page-break-after: always;

                    break-after: page;

                }


                .talapatrakPrintPage:last-child {

                    page-break-after: auto;

                    break-after: auto;

                }


                .talapatrakPrintTable {

                    width: 100% !important;

                    max-width: 100% !important;

                    table-layout: fixed !important;

                    border-collapse: collapse;

                }


                .talapatrakPrintTable th,
                .talapatrakPrintTable td {

                    border: 1px solid #000;

                    padding: 1px;

                    text-align: center;

                    vertical-align: middle;

                    overflow: hidden;

                }


                .talapatrakPrintTable input {

                    width: 100%;

                    box-sizing: border-box;

                    border: 0;

                    outline: 0;

                    background: transparent;

                    color: #000;

                    text-align: center;

                    padding: 0;

                    margin: 0;

                    font-size: 8px;

                }


                .talapatrakPrintTable .columnB {

                    text-align: left;

                }


                .talapatrakPrintHeader {

                    display: flex;

                    width: 100%;

                    justify-content: space-between;

                    align-items: center;

                    margin-bottom: 4mm;

                    font-size: 10px;

                }


                .talapatrakPrintHeaderItem {

                    white-space: nowrap;

                }


                .talapatrakPrintFooter {

                    width: 100%;

                    text-align: center;

                    margin-top: 3mm;

                    font-size: 9px;

                }


                .talapatrakPrintPageNumber {

                    text-align: center;

                }

            </style>

        </head>


        <body>

            <div
                id="talapatrakPrintContainer"
                style="display:block !important;"
            >

                ${pages}

            </div>

        </body>

        </html>

    `);


    iframeDocument.close();


    /* ========================================================
       WAIT FOR IFRAME TO RENDER
    ======================================================== */

    setTimeout(
        function() {

            console.log(
                "TALAPATRAK PRINT → PRINTING"
            );


            iframe.contentWindow.focus();

            iframe.contentWindow.print();


            /* --------------------------------------------
               CLEANUP

               Do not depend only on afterprint because
               the print dialog belongs to the iframe.
            -------------------------------------------- */

            setTimeout(
                function() {

                    iframe.remove();

                    const container =
                        document.getElementById(
                            "talapatrakPrintContainer"
                        );

                    if (container) {

                        container.remove();

                    }


                    window.talapatrakIsPrinting  =
                        false;


                    console.log(
                        "TALAPATRAK PRINT CLEANUP COMPLETE"
                    );

                },
                2000
            );

        },
        700
    );

}




window.addEventListener(
    "afterprint",
    function() {

        /*
        ========================================================
        IMPORTANT

        Main Bill also fires the global "afterprint" event.

        Ignore that event unless Talapatrak itself
        started printing.
        ========================================================
        */

        if (!talapatrakIsPrinting) {

            return;

        }


        /*
        ========================================================
        TALAPATRAK PRINT COMPLETED
        ========================================================
        */

        console.log(
            "TALAPATRAK PRINT COMPLETED"
        );


        document.body.classList.remove(
            "printingTalapatrak"
        );


        /*
        ========================================================
        REMOVE GENERATED PRINT CONTAINER
        ========================================================
        */

        const printContainer =
            document.getElementById(
                "talapatrakPrintContainer"
            );


        if (
            printContainer
        ) {

            printContainer.remove();

        }


        /*
        ========================================================
        RESTORE EDITOR
        ========================================================
        */

        if (
            talapatrakEditorViewElement
        ) {

            talapatrakEditorViewElement.style.display =
                "block";

        }


        /*
        ========================================================
        KEEP MANAGEMENT VIEW HIDDEN
        ========================================================
        */

        if (
            talapatrakViewElement
        ) {

            talapatrakViewElement.style.display =
                "none";

        }


        /*
        ========================================================
        RESET PRINT STATE
        ========================================================
        */

        talapatrakIsPrinting =
            false;


        console.log(
            "Talapatrak print container removed."
        );

    }
);



/* ============================================================
   TALAPATRAK PRINT BUTTON
============================================================ */

function initializeTalapatrakPrintButton() {

    const printButton =
        document.getElementById(
            "printTalapatrakButton"
        );


    if (!printButton) {

        console.warn(
            "Talapatrak Print button not available yet."
        );

        return;

    }


    /* ========================================================
       PREVENT DUPLICATE INITIALIZATION
    ======================================================== */

    if (
        printButton.dataset.printInitialized === "true"
    ) {

        return;

    }


    printButton.dataset.printInitialized =
        "true";


    /* ========================================================
       MOUSEDOWN

       Happens before the focused input receives blur.
    ======================================================== */

    printButton.addEventListener(
        "mousedown",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "TALAPATRAK PRINT MODE ACTIVATED"
            );

            window.talapatrakIsPrinting  = true;

        }
    );


    printButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();

            console.log(
                "TALAPATRAK PRINT BUTTON CLICKED"
            );

            printTalapatrak();

        }
    );


    console.log(
        "Talapatrak Print button initialized."
    );

}


/* ============================================================
   KHATA IMPORT ACCESS
============================================================ */

if (
    typeof createTalapatrakRow === "function"
) {

    window.createTalapatrakRow =
        createTalapatrakRow;

    console.log(
        "Global createTalapatrakRow registered."
    );

}


/* ======================================================================================================================== */


/* ============================================================
   TALAPATRAK PAGE / SUMMARY CONTROLLER
   ------------------------------------------------------------
   DATA:
       Page 1 ... N

   SUMMARY:
       Page N+1 → Summary 1
       Page N+2 → Summary 2
       Page N+3 → Summary 3

   IMPORTANT:
       DATA EDITOR PAGES ARE PRESERVED.

       SUMMARY PAGES ARE COMPLETELY REBUILT.

       We DO NOT reuse old summary page DOM.
============================================================ */


/* ============================================================
   CONSTANTS
============================================================ */

const TALAPATRAK_ROWS_PER_PAGE = 20;
const TALAPATRAK_SUMMARY_COUNT = 3;


/* ============================================================
   GET SUMMARY SECTION
============================================================ */

function getTalapatrakTotalsSection() {

    return document.getElementById(
        "talapatrakTotalsSection"
    );

}


/* ============================================================
   COMPLETELY REMOVE OLD SUMMARY PAGES
   ------------------------------------------------------------
   IMPORTANT:
   This removes the actual DOM nodes.

   It does NOT merely hide them.
============================================================ */

function removeOldTalapatrakSummaryPages() {

    console.log(
        "======================================"
    );

    console.log(
        "REMOVING OLD TALAPATRAK SUMMARY PAGES"
    );


    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        console.warn(
            "⚠️ talapatrakTotalsSection NOT FOUND"
        );

        return;

    }


    /*
     * Remove every old summary page.
     *
     * This catches:
     *
     * .talapatrakSummaryPage
     *
     * regardless of whether it was
     * Summary 1, 2, or 3.
     */

    const oldPages =
        section.querySelectorAll(
            ".talapatrakSummaryPage"
        );


    console.log(
        "OLD SUMMARY PAGES FOUND:",
        oldPages.length
    );


    oldPages.forEach(
        function(page) {

            page.remove();

        }
    );


    /*
     * Also remove any dynamically generated
     * summary wrappers if we created them
     * previously.
     */

    section
        .querySelectorAll(
            ".talapatrakSummaryPageContainer"
        )
        .forEach(
            function(element) {

                element.remove();

            }
        );


    console.log(
        "OLD SUMMARY PAGES COMPLETELY REMOVED"
    );

}


/* ============================================================
   CREATE FRESH SUMMARY PAGE
============================================================ */

function createFreshTalapatrakSummaryPage(
    summaryNumber
) {

    console.log(
        "CREATING FRESH SUMMARY PAGE:",
        summaryNumber
    );


    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        console.error(
            "❌ talapatrakTotalsSection NOT FOUND"
        );

        return null;

    }


    /*
     * Create a completely new page.
     */

    const page =
        document.createElement("div");


    page.className =
        "talapatrakSummaryPage";


    page.id =
        "talapatrakSummaryPage" +
        summaryNumber;


    page.dataset.summaryNumber =
        summaryNumber;


    /*
     * Start hidden.
     *
     * The controller will show the
     * requested page afterward.
     */

    page.hidden = true;

    page.style.display = "none";

    page.style.visibility = "hidden";

    page.style.opacity = "0";


    /*
     * Inner wrapper.
     */

    const inner =
        document.createElement("div");


    inner.className =
        "talapatrakSummaryPageInner";


    page.appendChild(
        inner
    );


    /*
     * IMPORTANT:
     *
     * We are intentionally NOT copying
     * the old summary HTML here.
     *
     * The fresh page starts empty.
     *
     * The appropriate summary builder
     * can populate it afterward.
     */


    section.appendChild(
        page
    );


    console.log(
        "FRESH SUMMARY PAGE CREATED:",
        page.id
    );


    return page;

}


/* ============================================================
   CREATE ALL THREE FRESH SUMMARY PAGES
============================================================ */

function createFreshTalapatrakSummaryPages() {

    console.log(
        "======================================"
    );

    console.log(
        "CREATING THREE FRESH SUMMARY PAGES"
    );


    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        console.error(
            "❌ talapatrakTotalsSection NOT FOUND"
        );

        return false;

    }


    /*
     * FIRST:
     *
     * Completely destroy the old pages.
     */

    removeOldTalapatrakSummaryPages();


    /*
     * THEN:
     *
     * Create three brand-new pages.
     */

    for (
        let i = 1;
        i <= TALAPATRAK_SUMMARY_COUNT;
        i++
    ) {

        createFreshTalapatrakSummaryPage(i);

    }


    /*
     * Verify.
     */

    const freshPages =
        section.querySelectorAll(
            ".talapatrakSummaryPage"
        );


    console.log(
        "FRESH SUMMARY PAGE COUNT:",
        freshPages.length
    );


    if (
        freshPages.length !==
        TALAPATRAK_SUMMARY_COUNT
    ) {

        console.error(
            "❌ FAILED TO CREATE ALL SUMMARY PAGES"
        );

        return false;

    }


    console.log(
        "THREE FRESH SUMMARY PAGES CREATED SUCCESSFULLY"
    );


    return true;

}


/* ============================================================
   GET SUMMARY PAGE
============================================================ */

function getTalapatrakSummaryPage(
    summaryNumber
) {

    return document.getElementById(
        "talapatrakSummaryPage" +
        summaryNumber
    );

}


/* ============================================================
   FORCE SUMMARY SECTION VISIBLE
============================================================ */

function showTalapatrakTotalsSection() {

    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        console.error(
            "❌ talapatrakTotalsSection NOT FOUND"
        );

        return false;

    }


    section.hidden = false;

    section.removeAttribute("hidden");

    section.style.display = "block";

    section.style.visibility = "visible";

    section.style.opacity = "1";

    section.style.height = "auto";

    section.style.minHeight = "0";

    section.style.overflow = "visible";

    section.style.position = "relative";

    section.style.width = "100%";


    /*
     * Make hidden parents visible.
     */

    let parent =
        section.parentElement;


    while (
        parent &&
        parent !== document.body
    ) {

        const computed =
            window.getComputedStyle(parent);


        if (
            computed.display === "none"
        ) {

            parent.style.display =
                "block";

        }


        if (
            computed.visibility ===
            "hidden"
        ) {

            parent.style.visibility =
                "visible";

        }


        parent =
            parent.parentElement;

    }


    return true;

}


/* ============================================================
   HIDE ALL SUMMARY PAGES
============================================================ */

function hideAllTalapatrakSummaryPages() {

    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        return;

    }


    section
        .querySelectorAll(
            ".talapatrakSummaryPage"
        )
        .forEach(
            function(page) {

                page.hidden = true;

                page.setAttribute(
                    "hidden",
                    ""
                );

                page.style.display =
                    "none";

                page.style.visibility =
                    "hidden";

                page.style.opacity =
                    "0";

            }
        );

}


/* ============================================================
   SHOW ONE SUMMARY PAGE
============================================================ */

function showTalapatrakSummaryPage(
    summaryNumber
) {

    console.log(
        "SHOW SUMMARY PAGE:",
        summaryNumber
    );


    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        console.error(
            "❌ SUMMARY SECTION DOES NOT EXIST"
        );

        return false;

    }


    const page =
        getTalapatrakSummaryPage(
            summaryNumber
        );


    if (!page) {

        console.error(
            "❌ SUMMARY PAGE DOES NOT EXIST:",
            summaryNumber
        );

        return false;

    }


    /*
     * Parent first.
     */

    showTalapatrakTotalsSection();


    /*
     * Hide every summary page.
     */

    hideAllTalapatrakSummaryPages();


    /*
     * Show requested page.
     */

    page.hidden = false;

    page.removeAttribute("hidden");

    page.style.display =
        "block";

    page.style.visibility =
        "visible";

    page.style.opacity =
        "1";

    page.style.height =
        "auto";

    page.style.minHeight =
        "0";

    page.style.width =
        "100%";

    page.style.position =
        "relative";


    const inner =
        page.querySelector(
            ".talapatrakSummaryPageInner"
        );


    if (inner) {

        inner.style.display =
            "block";

        inner.style.visibility =
            "visible";

        inner.style.opacity =
            "1";

        inner.style.height =
            "auto";

    }


    console.log(
        "SUMMARY PAGE DISPLAYED:",
        summaryNumber
    );


    return true;

}


/* ============================================================
   HIDE SUMMARY SECTION
============================================================ */

function hideTalapatrakTotalsSection() {

    const section =
        getTalapatrakTotalsSection();


    if (!section) {

        return;

    }


    section.hidden = true;

    section.setAttribute(
        "hidden",
        ""
    );

    section.style.display =
        "none";

    section.style.visibility =
        "hidden";

    section.style.opacity =
        "0";

}


/* ============================================================
   INITIALIZE FRESH SUMMARY SYSTEM
   ------------------------------------------------------------
   This is the function that should be called
   AFTER Generate Total.
============================================================ */

function initializeTalapatrakSummaryPages() {

    console.log(
        "======================================"
    );

    console.log(
        "INITIALIZING FRESH TALAPATRAK SUMMARY SYSTEM"
    );


    /*
     * Completely delete the previous
     * summary DOM.
     */

    const created =
        createFreshTalapatrakSummaryPages();


    if (!created) {

        console.error(
            "❌ Could not create fresh summary pages."
        );

        return false;

    }


    /*
     * Make summary section visible.
     */

    showTalapatrakTotalsSection();


    /*
     * Get header information.
     */

    const moje =
        document.getElementById(
            "talapatrakMoje"
        )?.value || "-";


    const taluka =
        document.getElementById(
            "talapatrakTaluka"
        )?.value || "-";


    const jillo =
        document.getElementById(
            "talapatrakJillo"
        )?.value || "-";


    const year =
        document.getElementById(
            "talapatrakYear"
        )?.value || "-";


    /*
     * Store these values globally so
     * newly-created summary pages can
     * use them.
     */

    window.talapatrakSummaryHeader = {

        moje,
        taluka,
        jillo,
        year

    };


    console.log(
        "FRESH SUMMARY HEADER DATA:",
        window.talapatrakSummaryHeader
    );


    /*
     * Hide all three.
     */

    hideAllTalapatrakSummaryPages();


    /*
     * IMPORTANT:
     *
     * Page-specific population functions
     * can now build the fresh pages.
     */

    if (
        typeof populateTalapatrakSummaryPage1 ===
        "function"
    ) {

        populateTalapatrakSummaryPage1();

    }


    if (
        typeof populateTalapatrakSummaryChallans ===
        "function"
    ) {

        populateTalapatrakSummaryChallans();

    }


    /*
     * Finally show Summary 1.
     */

    showTalapatrakSummaryPage(1);


    console.log(
        "FRESH SUMMARY SYSTEM INITIALIZED"
    );


    return true;

}


/* ============================================================
   COMPATIBILITY
============================================================ */

function renderTalapatrakEditorCalculationPage() {

    return initializeTalapatrakSummaryPages();

}




/* ============================================================
   TALAPATRAK YEAR CHANGE CONFIRMATION MODAL
============================================================ */

function showTalapatrakYearChangeModal(
    oldYear,
    newYear
) {

    return new Promise(
        function(resolve) {

            const modal =
                document.getElementById(
                    "talapatrakYearChangeModal"
                );


            const oldYearText =
                document.getElementById(
                    "talapatrakOldYearText"
                );


            const newYearText =
                document.getElementById(
                    "talapatrakNewYearText"
                );


            const cancelButton =
                document.getElementById(
                    "talapatrakYearChangeCancel"
                );


            const confirmButton =
                document.getElementById(
                    "talapatrakYearChangeConfirm"
                );


            /*
            ========================================================
                SAFETY CHECK
            ========================================================
            */

            if (
                !modal ||
                !oldYearText ||
                !newYearText ||
                !cancelButton ||
                !confirmButton
            ) {

                console.error(
                    "TALAPATRAK YEAR CHANGE MODAL → ELEMENTS NOT FOUND"
                );

                resolve(false);

                return;

            }


            /*
            ========================================================
                SET YEARS
            ========================================================
            */

            oldYearText.textContent =
                oldYear || "—";


            newYearText.textContent =
                newYear || "—";


            /*
            ========================================================
                OPEN MODAL
            ========================================================
            */

            modal.classList.add(
                "open"
            );


            modal.setAttribute(
                "aria-hidden",
                "false"
            );


            /*
            ========================================================
                PREVENT BACKGROUND SCROLL
            ========================================================
            */

            document.body.classList.add(
                "talapatrakYearModalOpen"
            );


            /*
            ========================================================
                CLOSE MODAL
            ========================================================
            */

            function closeModal(
                result
            ) {

                modal.classList.remove(
                    "open"
                );


                modal.setAttribute(
                    "aria-hidden",
                    "true"
                );


                document.body.classList.remove(
                    "talapatrakYearModalOpen"
                );


                /*
                    Remove listeners so that
                    the same modal can be reused.
                */

                cancelButton.removeEventListener(
                    "click",
                    handleCancel
                );


                confirmButton.removeEventListener(
                    "click",
                    handleConfirm
                );


                overlay.removeEventListener(
                    "click",
                    handleCancel
                );


                document.removeEventListener(
                    "keydown",
                    handleEscape
                );


                resolve(result);

            }


            /*
            ========================================================
                CANCEL
            ========================================================
            */

            function handleCancel() {

                console.log(
                    "TALAPATRAK YEAR CHANGE → CANCELLED"
                );

                closeModal(
                    false
                );

            }


            /*
            ========================================================
                CONFIRM
            ========================================================
            */

            function handleConfirm() {

                console.log(
                    "TALAPATRAK YEAR CHANGE → CONFIRMED:",
                    oldYear,
                    "→",
                    newYear
                );

                closeModal(
                    true
                );

            }


            /*
            ========================================================
                OVERLAY CLICK
            ========================================================
            */

            const overlay =
                modal.querySelector(
                    ".talapatrakYearChangeOverlay"
                );


            /*
            ========================================================
                ESC KEY
            ========================================================
            */

            function handleEscape(event) {

                if (
                    event.key === "Escape"
                ) {

                    handleCancel();

                }

            }


            /*
            ========================================================
                ATTACH EVENTS
            ========================================================
            */

            cancelButton.addEventListener(
                "click",
                handleCancel
            );


            confirmButton.addEventListener(
                "click",
                handleConfirm
            );


            if (overlay) {

                overlay.addEventListener(
                    "click",
                    handleCancel
                );

            }


            document.addEventListener(
                "keydown",
                handleEscape
            );


            /*
            ========================================================
                FOCUS CONFIRM BUTTON
            ========================================================
            */

            setTimeout(
                function() {

                    confirmButton.focus();

                },
                50
            );

        }
    );

}




/* ============================================================
   SHOW TALAPATRAK ALREADY EXISTS MODAL
============================================================ */

function showTalapatrakAlreadyExistsModal(
    villageName,
    year
) {

    return new Promise(function(resolve) {

        const modal =
            document.getElementById(
                "talapatrakAlreadyExistsModal"
            );

        const villageText =
            document.getElementById(
                "talapatrakAlreadyExistsVillage"
            );

        const yearText =
            document.getElementById(
                "talapatrakAlreadyExistsYear"
            );

        const closeButton =
            document.getElementById(
                "talapatrakAlreadyExistsClose"
            );

        const overlay =
            modal
                ? modal.querySelector(
                    ".talapatrakAlreadyExistsOverlay"
                )
                : null;


        if (
            !modal ||
            !closeButton
        ) {

            console.error(
                "Talapatrak already-exists modal not found."
            );

            resolve();

            return;

        }


        if (villageText) {

            villageText.textContent =
                villageName || "this village";

        }


        if (yearText) {

            yearText.textContent =
                year || "this year";

        }


        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        function close() {

            modal.classList.remove("open");

            modal.setAttribute(
                "aria-hidden",
                "true"
            );


            closeButton.removeEventListener(
                "click",
                handleClose
            );


            if (overlay) {

                overlay.removeEventListener(
                    "click",
                    handleClose
                );

            }


            resolve();

        }


        function handleClose(event) {

            event.preventDefault();

            close();

        }


        closeButton.addEventListener(
            "click",
            handleClose
        );


        if (overlay) {

            overlay.addEventListener(
                "click",
                handleClose
            );

        }

    });

}




/* ============================================================
   TALAPATRAK DELETE MODAL STATE
============================================================ */

let talapatrakDeleteRecordPending = null;


/* ============================================================
   SHOW TALAPATRAK DELETE MODAL
============================================================ */

function showTalapatrakDeleteModal(record) {

    return new Promise(function(resolve) {

        console.log(
            "TALAPATRAK DELETE MODAL → OPEN REQUEST:",
            record
        );


        const modal =
            document.getElementById(
                "talapatrakDeleteModal"
            );


        if(!modal){

            console.error(
                "TALAPATRAK DELETE MODAL → MODAL NOT FOUND"
            );

            resolve(false);

            return;

        }


        const villageNameElement =
            document.getElementById(
                "talapatrakDeleteVillageName"
            );


        const yearElement =
            document.getElementById(
                "talapatrakDeleteYear"
            );


        const cancelButton =
            document.getElementById(
                "talapatrakDeleteCancelButton"
            );


        const confirmButton =
            document.getElementById(
                "talapatrakDeleteConfirmButton"
            );


        if(
            !villageNameElement ||
            !yearElement ||
            !cancelButton ||
            !confirmButton
        ){

            console.error(
                "TALAPATRAK DELETE MODAL → REQUIRED ELEMENT MISSING"
            );

            resolve(false);

            return;

        }

          /* ========================================================
             RESET CONFIRM BUTTON STATE
             IMPORTANT:
             Every time the modal opens, restore the button.
          ======================================================== */

          confirmButton.disabled = false;

          confirmButton.innerHTML = `

              <i class="fa-solid fa-trash-can"></i>

              Delete Permanently

          `;


        talapatrakDeleteRecordPending =
            record;


        villageNameElement.textContent =
            record.moje ||
            "this village";


        yearElement.textContent =
            record.year ||
            "";


        modal.classList.add(
            "open"
        );


        modal.setAttribute(
            "aria-hidden",
            "false"
        );


        console.log(
            "TALAPATRAK DELETE MODAL → OPENED:",
            record.id
        );


        /* ========================================================
           CANCEL
        ======================================================== */

        function handleCancel() {

            console.log(
                "TALAPATRAK DELETE MODAL → CANCELLED"
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
                "TALAPATRAK DELETE MODAL → CONFIRM CLICKED:",
                record.id
            );


            confirmButton.disabled =
                true;


            confirmButton.innerHTML = `

                <i class="fa-solid fa-spinner fa-spin"></i>

                Deleting...

            `;


            try {

                const success =
                    await permanentlyDeleteTalapatrakRecord(
                        record
                    );


                console.log(
                    "TALAPATRAK DELETE MODAL → DELETE RESULT:",
                    success
                );


                closeModal();

                cleanup();

                resolve(success);

            }
            catch(error) {

                console.error(
                    "TALAPATRAK DELETE MODAL → DELETE FAILED:",
                    error
                );


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
           LISTENERS
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


            talapatrakDeleteRecordPending =
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
