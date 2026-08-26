/* ============================================================
   PANCHAYAT BUSINESS SUITE
   SHARED EDITOR ROW SEARCH ENGINE
   ============================================================

   Supports:
   - Talapatrak
   - Shikshanupakaran

   Searches MEMORY, not DOM.

   Features:
   - Gujarati + English digit normalization
   - Partial matching
   - Exact numeric match priority
   - Searches complete configured columns
   - Pagination-aware
   - Automatic page navigation
   - Row highlighting
   - Enter = next result
   - Shift + Enter = previous result
   - Escape = clear highlight / search
   - Ctrl + F = focus active editor search
   - Works with dynamically created editor DOM

   ============================================================ */


/* ============================================================
   SEARCH CONFIGURATION
   ============================================================ */

window.panchayatSearchConfig = {

    talapatrak: {

        inputId:
            "talapatrakRowSearchInput",

        clearButtonId:
            "clearTalapatrakRowSearch",

        memory:
            "talapatrakAllRows",

        rowsPerPage:
            "talapatrakRowsPerPage",

        currentPage:
            "talapatrakCurrentPage",

        totalPages:
            "talapatrakTotalPages",

        columns: [
            "A",
            "B",
            "K"
        ],

        renderPage:
            "renderTalapatrakPage",

        syncPage:
            "syncCurrentTalapatrakPageToMemory",

        rowSelector:
            "#talapatrakBody .talapatrakRow"

    },


    shikshanupakaran: {

        inputId:
            "shikshanupakaranRowSearchInput",

        clearButtonId:
            "clearShikshanupakaranRowSearch",

        memory:
            "shikshanupakaranAllRows",

        rowsPerPage:
            "shikshanupakaranRowsPerPage",

        currentPage:
            "shikshanupakaranCurrentPage",

        totalPages:
            "shikshanupakaranTotalPages",

        columns: [
            "A",
            "B",
            "H"
        ],

        renderPage:
            "renderShikshanupakaranPage",

        syncPage:
            "syncCurrentShikshanupakaranPageToMemory",

        rowSelector:
            "#shikshanupakaranBody .shikshanupakaranRow"

    }

};


/* ============================================================
   SEARCH STATE
   ============================================================ */

window.panchayatSearchState = {

    query: "",

    normalizedQuery: "",

    results: [],

    currentIndex: -1,

    module: null,

    active: false

};


/* ============================================================
   NORMALIZE SEARCH VALUE
   ============================================================ */

function normalizeSearchValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    let text =
        String(value)
            .toLowerCase()
            .trim();


    if (
        typeof convertGujaratiDigitsToEnglish ===
        "function"
    ) {

        text =
            convertGujaratiDigitsToEnglish(
                text
            );

    }


    text =
        text.replace(
            /\s+/g,
            " "
        );


    return text;

}


/* ============================================================
   GET CONFIG
   ============================================================ */

function getPanchayatSearchConfig(
    moduleName
) {

    return window.panchayatSearchConfig[
        moduleName
    ] || null;

}


/* ============================================================
   GET MEMORY
   ============================================================ */

function getPanchayatSearchMemory(
    moduleName
) {

    const config =
        getPanchayatSearchConfig(
            moduleName
        );


    if (!config) {

        return null;

    }


    return window[
        config.memory
    ];

}


/* ============================================================
   GET SEARCHABLE TEXT
   ============================================================ */

function getPanchayatSearchText(
    row,
    moduleName
) {

    if (
        !row ||
        typeof row !== "object"
    ) {

        return "";

    }


    const config =
        getPanchayatSearchConfig(
            moduleName
        );


    if (!config) {

        return "";

    }


    return config.columns
        .map(
            function(column) {

                return (
                    row[column] !== undefined &&
                    row[column] !== null
                )
                    ? String(row[column])
                    : "";

            }
        )
        .join(" ");

}


/* ============================================================
   NUMERIC QUERY CHECK
   ============================================================ */

function isPanchayatSearchNumber(
    value
) {

    const normalized =
        normalizeSearchValue(
            value
        );


    return (
        normalized !== "" &&
        /^[0-9]+(?:\.[0-9]+)?$/.test(
            normalized
        )
    );

}


/* ============================================================
   SEARCH MEMORY
   ============================================================ */

function searchPanchayatMemory(
    query,
    moduleName
) {

    const state =
        window.panchayatSearchState;


    const config =
        getPanchayatSearchConfig(
            moduleName
        );


    state.query =
        String(query || "")
            .trim();


    state.normalizedQuery =
        normalizeSearchValue(
            state.query
        );


    state.results =
        [];

    state.currentIndex =
        -1;

    state.module =
        moduleName;

    state.active =
        Boolean(
            state.normalizedQuery
        );


    if (
        !state.normalizedQuery
    ) {

        return [];

    }


    if (!config) {

        console.warn(
            "SEARCH: Unknown module:",
            moduleName
        );

        return [];

    }


    const memory =
        getPanchayatSearchMemory(
            moduleName
        );


    if (
        !Array.isArray(memory)
    ) {

        console.warn(
            "SEARCH: Memory not found:",
            config.memory
        );

        return [];

    }


    const queryIsNumber =
        isPanchayatSearchNumber(
            state.query
        );


    const rowsPerPage =
        Number(
            window[
                config.rowsPerPage
            ]
        ) || 20;


    /* ========================================================
       SEARCH EVERY MEMORY ROW
       ======================================================== */

    memory.forEach(
        function(row, index) {

            const searchableText =
                normalizeSearchValue(
                    getPanchayatSearchText(
                        row,
                        moduleName
                    )
                );


            if (
                !searchableText.includes(
                    state.normalizedQuery
                )
            ) {

                return;

            }


            let exactMatch =
                false;


            if (
                queryIsNumber
            ) {

                exactMatch =
                    config.columns.some(
                        function(column) {

                            const value =
                                normalizeSearchValue(
                                    row[column]
                                );


                            return (
                                value ===
                                state.normalizedQuery
                            );

                        }
                    );

            }


            const page =
                Math.floor(
                    index /
                    rowsPerPage
                ) + 1;


            state.results.push({

                memoryIndex:
                    index,

                row:
                    row,

                page:
                    page,

                exactMatch:
                    exactMatch

            });

        }
    );


    /* ========================================================
       EXACT NUMERIC MATCHES FIRST
       ======================================================== */

    state.results.sort(
        function(a, b) {

            if (
                a.exactMatch &&
                !b.exactMatch
            ) {

                return -1;

            }


            if (
                !a.exactMatch &&
                b.exactMatch
            ) {

                return 1;

            }


            return (
                a.memoryIndex -
                b.memoryIndex
            );

        }
    );


    console.log(
        "PANCHAYAT ROW SEARCH:",
        {

            query:
                state.query,

            normalizedQuery:
                state.normalizedQuery,

            module:
                moduleName,

            columns:
                config.columns,

            matches:
                state.results.length,

            results:
                state.results

        }
    );


    return state.results;

}


/* ============================================================
   RENDER SEARCH RESULT
   ============================================================ */

function renderPanchayatSearchResult(
    result
) {

    const state =
        window.panchayatSearchState;


    const config =
        getPanchayatSearchConfig(
            state.module
        );


    if (
        !config ||
        !result
    ) {

        return;

    }


    /*
     * Save current page first.
     */

    if (
        typeof window[
            config.syncPage
        ] === "function"
    ) {

        window[
            config.syncPage
        ]();

    }


    /*
     * Render target page.
     */

    if (
        typeof window[
            config.renderPage
        ] === "function"
    ) {

        window[
            config.renderPage
        ](
            result.page
        );

    }
    else {

        console.warn(
            "SEARCH: Render function not found:",
            config.renderPage
        );

        return;

    }


    /*
     * Wait for DOM rendering.
     */

    setTimeout(
        function() {

            highlightPanchayatSearchRow(
                result.memoryIndex,
                state.module
            );

        },
        100
    );

}


/* ============================================================
   GO TO RESULT
   ============================================================ */

function goToPanchayatSearchResult(
    resultIndex
) {

    const state =
        window.panchayatSearchState;


    if (
        !state.results.length
    ) {

        return;

    }


    if (
        resultIndex < 0
    ) {

        resultIndex =
            state.results.length - 1;

    }


    if (
        resultIndex >=
        state.results.length
    ) {

        resultIndex = 0;

    }


    state.currentIndex =
        resultIndex;


    const result =
        state.results[
            resultIndex
        ];


    console.log(
        "SEARCH → RESULT:",
        {

            resultIndex:
                resultIndex,

            total:
                state.results.length,

            memoryIndex:
                result.memoryIndex,

            page:
                result.page,

            exact:
                result.exactMatch

        }
    );


    renderPanchayatSearchResult(
        result
    );

}


/* ============================================================
   HIGHLIGHT EXACT SEARCH RESULT ROW
   ============================================================ */

function highlightPanchayatSearchRow(
    memoryIndex,
    moduleName
) {

    const config =
        getPanchayatSearchConfig(
            moduleName
        );


    if (!config) {

        return;

    }


    /* ========================================================
       REMOVE OLD HIGHLIGHT
       ======================================================== */

    document
        .querySelectorAll(
            ".panchayatSearchHighlight"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "panchayatSearchHighlight"
                );

                element.classList.remove(
                    "searchHighlightFading"
                );

                element.style.removeProperty(
                    "background-color"
                );

                element.style.removeProperty(
                    "box-shadow"
                );

            }
        );


    /* ========================================================
       CLEAR OLD TIMER
       ======================================================== */

    if (
        window.panchayatSearchHighlightTimer
    ) {

        clearTimeout(
            window.panchayatSearchHighlightTimer
        );

        window.panchayatSearchHighlightTimer =
            null;

    }


    /* ========================================================
       GET VISIBLE DOM ROWS
       ======================================================== */

    const visibleRows =
        Array.from(
            document.querySelectorAll(
                config.rowSelector
            )
        );


    const rowsPerPage =
        Number(
            window[
                config.rowsPerPage
            ]
        ) || 20;


    /* ========================================================
       IMPORTANT
       ========================================================

       The requested page has ALREADY been rendered.

       Therefore:

       memory index 19
       rowsPerPage 20

       19 % 20 = 19

       memory index 203
       rowsPerPage 20

       203 % 20 = 3

       Do NOT use currentPage here.

    ======================================================== */

    const visibleIndex =
        memoryIndex %
        rowsPerPage;


    console.log(
        "SEARCH → HIGHLIGHT TARGET:",
        {

            module:
                moduleName,

            memoryIndex:
                memoryIndex,

            rowsPerPage:
                rowsPerPage,

            visibleIndex:
                visibleIndex,

            visibleRows:
                visibleRows.length

        }
    );


    /* ========================================================
       FIND EXACT DOM ROW
       ======================================================== */

    const row =
        visibleRows[
            visibleIndex
        ];


    if (!row) {

        console.warn(
            "SEARCH: Exact visible row not found.",
            {

                memoryIndex:
                    memoryIndex,

                visibleIndex:
                    visibleIndex,

                visibleRows:
                    visibleRows.length

            }
        );

        return;

    }


    /* ========================================================
       APPLY HIGHLIGHT TO ROW
       ======================================================== */

    row.classList.add(
        "panchayatSearchHighlight"
    );


    /* ========================================================
       APPLY HIGHLIGHT DIRECTLY TO CELLS
       ======================================================== */

    const cells =
        row.querySelectorAll(
            "td"
        );


    cells.forEach(
        function(cell) {

            cell.classList.add(
                "panchayatSearchHighlight"
            );

            cell.style.setProperty(
                "background-color",
                "#fff9c4",
                "important"
            );

            cell.style.setProperty(
                "box-shadow",
                "inset 0 2px 0 #d6a800, inset 0 -2px 0 #d6a800",
                "important"
            );

        }
    );


    /* ========================================================
       STRONG LEFT BORDER
       ======================================================== */

    if (
        cells.length > 0
    ) {

        cells[0].style.setProperty(
            "box-shadow",
            "inset 6px 0 0 #d6a800, inset 0 2px 0 #d6a800, inset 0 -2px 0 #d6a800",
            "important"
        );

    }


    /* ========================================================
       SCROLL TO ROW
       ======================================================== */

    row.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    /* ========================================================
       KEEP HIGHLIGHT FOR 5 SECONDS
       ======================================================== */

    window.panchayatSearchHighlightTimer =
        setTimeout(
            function() {

                row.classList.add(
                    "searchHighlightFading"
                );


                cells.forEach(
                    function(cell) {

                        cell.style.setProperty(
                            "background-color",
                            "#fffbea",
                            "important"
                        );

                    }
                );


                /* ============================================
                   REMOVE AFTER FADE
                   ============================================ */

                setTimeout(
                    function() {

                        row.classList.remove(
                            "panchayatSearchHighlight"
                        );

                        row.classList.remove(
                            "searchHighlightFading"
                        );


                        cells.forEach(
                            function(cell) {

                                cell.classList.remove(
                                    "panchayatSearchHighlight"
                                );

                                cell.classList.remove(
                                    "searchHighlightFading"
                                );

                                cell.style.removeProperty(
                                    "background-color"
                                );

                                cell.style.removeProperty(
                                    "box-shadow"
                                );

                            }
                        );

                    },
                    500
                );

            },
            3000
        );


    console.log(
        "SEARCH → YELLOW HIGHLIGHT APPLIED:",
        {

            module:
                moduleName,

            memoryIndex:
                memoryIndex,

            visibleIndex:
                visibleIndex,

            cells:
                cells.length,

            row:
                row

        }
    );

}


/* ============================================================
   NEXT RESULT
   ============================================================ */

function nextPanchayatSearchResult() {

    const state =
        window.panchayatSearchState;


    if (
        !state.results.length
    ) {

        return;

    }


    goToPanchayatSearchResult(
        state.currentIndex + 1
    );

}


/* ============================================================
   PREVIOUS RESULT
   ============================================================ */

function previousPanchayatSearchResult() {

    const state =
        window.panchayatSearchState;


    if (
        !state.results.length
    ) {

        return;

    }


    goToPanchayatSearchResult(
        state.currentIndex - 1
    );

}


/* ============================================================
   CLEAR SEARCH
   ============================================================ */

function clearPanchayatSearchState() {

    const state =
        window.panchayatSearchState;


    state.query =
        "";

    state.normalizedQuery =
        "";

    state.results =
        [];

    state.currentIndex =
        -1;

    state.module =
        null;

    state.active =
        false;


    document
        .querySelectorAll(
            ".panchayatSearchHighlight"
        )
        .forEach(
            function(row) {

                row.classList.remove(
                    "panchayatSearchHighlight"
                );

            }
        );


    clearTimeout(
        window.panchayatSearchHighlightTimer
    );

}


/* ============================================================
   DETECT MODULE FROM INPUT
   ============================================================ */

function getPanchayatSearchModuleFromInput(
    input
) {

    if (!input) {

        return null;

    }


    const configs =
        window.panchayatSearchConfig;


    for (
        const moduleName in configs
    ) {

        if (
            input.id ===
            configs[moduleName].inputId
        ) {

            return moduleName;

        }

    }


    return null;

}


/* ============================================================
   SEARCH INPUT EVENT
   ============================================================

   IMPORTANT:

   We use document-level delegation because
   editor search inputs are dynamically created.

   ============================================================ */

function setupPanchayatEditorSearch() {

    if (
        window.panchayatEditorSearchReady
    ) {

        return;

    }


    window.panchayatEditorSearchReady =
        true;


    console.log(
        "EDITOR ROW SEARCH EVENT DELEGATION READY"
    );


    /* ========================================================
       INPUT
       ======================================================== */

    document.addEventListener(
        "input",
        async function(event) {

            const input =
                event.target;


            if (
                !input ||
                !input.matches(
                    "#talapatrakRowSearchInput, #shikshanupakaranRowSearchInput"
                )
            ) {

                return;

            }


            const moduleName =
                getPanchayatSearchModuleFromInput(
                    input
                );


            if (!moduleName) {

                return;

            }


            const query =
                input.value.trim();


            if (!query) {

                clearPanchayatSearchState();

                return;

            }


            searchPanchayatMemory(
                query,
                moduleName
            );


            if (
                window
                    .panchayatSearchState
                    .results
                    .length
            ) {

                goToPanchayatSearchResult(
                    0
                );

            }
            else {

                console.log(
                    "SEARCH: No matches found:",
                    query
                );

            }

        }
    );


    /* ========================================================
       KEYBOARD
       ======================================================== */

    document.addEventListener(
        "keydown",
        function(event) {

            const input =
                event.target;


            if (
                !input ||
                !input.matches(
                    "#talapatrakRowSearchInput, #shikshanupakaranRowSearchInput"
                )
            ) {

                return;

            }


            const moduleName =
                getPanchayatSearchModuleFromInput(
                    input
                );


            if (!moduleName) {

                return;

            }


            /* =================================================
               ENTER
               ================================================= */

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                const state =
                    window.panchayatSearchState;


                if (
                    state.module !==
                        moduleName ||
                    state.query !==
                        input.value.trim()
                ) {

                    searchPanchayatMemory(
                        input.value,
                        moduleName
                    );


                    if (
                        state.results.length
                    ) {

                        goToPanchayatSearchResult(
                            0
                        );

                    }


                    return;

                }


                if (
                    event.shiftKey
                ) {

                    previousPanchayatSearchResult();

                }
                else {

                    nextPanchayatSearchResult();

                }

            }


            /* =================================================
               ESCAPE
               ================================================= */

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();


                clearPanchayatSearchState();


                input.value =
                    "";


                input.focus();

            }

        }
    );


    /* ========================================================
       CLEAR BUTTON
       ======================================================== */

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "#clearTalapatrakRowSearch, #clearShikshanupakaranRowSearch"
                );


            if (!button) {

                return;

            }


            const config =
                Object.values(
                    window.panchayatSearchConfig
                ).find(
                    function(item) {

                        return (
                            item.clearButtonId ===
                            button.id
                        );

                    }
                );


            if (!config) {

                return;

            }


            const input =
                document.getElementById(
                    config.inputId
                );


            if (input) {

                input.value =
                    "";

                input.focus();

            }


            clearPanchayatSearchState();

        }
    );

}


/* ============================================================
   CTRL + F
   ============================================================ */

function setupPanchayatSearchKeyboardNavigation() {

    if (
        window.panchayatSearchKeyboardReady
    ) {

        return;

    }


    window.panchayatSearchKeyboardReady =
        true;


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                !event.ctrlKey ||
                event.key.toLowerCase() !== "f"
            ) {

                return;

            }


            event.preventDefault();


            const editors = [

                {
                    module:
                        "talapatrak",

                    editorId:
                        "talapatrakEditorView"
                },

                {
                    module:
                        "shikshanupakaran",

                    editorId:
                        "shikshanupakaranEditorView"
                }

            ];


            for (
                const editor of editors
            ) {

                const editorElement =
                    document.getElementById(
                        editor.editorId
                    );


                if (
                    !editorElement
                ) {

                    continue;

                }


                const hidden =
                    editorElement.hidden ||
                    editorElement.offsetParent === null;


                if (
                    hidden
                ) {

                    continue;

                }


                const config =
                    window
                        .panchayatSearchConfig[
                            editor.module
                        ];


                const input =
                    document.getElementById(
                        config.inputId
                    );


                if (!input) {

                    console.warn(
                        "SEARCH: Active editor input not found:",
                        config.inputId
                    );

                    continue;

                }


                input.focus();

                input.select();

                return;

            }

        }
    );

}


/* ============================================================
   INITIALIZE
   ============================================================ */

function initializePanchayatRowSearch() {

    setupPanchayatEditorSearch();

    setupPanchayatSearchKeyboardNavigation();

}


/* ============================================================
   DOM READY
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePanchayatRowSearch
    );

}
else {

    initializePanchayatRowSearch();

}


/* ============================================================
   END SHARED SEARCH ENGINE
   ============================================================ */

   /* ======================================================================================================================== */


/* ============================================================
   PANCHAYAT BUSINESS SUITE
   GLOBAL SEARCH
   ============================================================

   Searches the complete application.

   Supports:
   - Village
   - Taluka
   - Jilla / District
   - Year
   - Bill name
   - Bill number
   - Customer
   - Khata number
   - Account holder
   - Talapatrak
   - Shikshanupakaran
   - Main Bills from Firebase

   Global search is SEPARATE from:
   - Talapatrak row search
   - Shikshanupakaran row search

   ============================================================ */


/* ============================================================
   GLOBAL SEARCH STATE
============================================================ */

window.panchayatGlobalSearchState = {

    query: "",

    normalizedQuery: "",

    results: [],

    currentIndex: -1,

    active: false,

    searchRequestId: 0,

};


/* ============================================================
   GLOBAL SEARCH CONFIGURATION
============================================================ */

window.panchayatGlobalSearchConfig = {

    maxResults: 20,

    highlightDuration: 3000,

    debounceDelay: 120

};


/* ============================================================
   NORMALIZE GLOBAL SEARCH VALUE
============================================================ */

function normalizePanchayatGlobalSearchValue(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    let text =
        String(value)
            .toLowerCase()
            .trim();


    if (
        typeof convertGujaratiDigitsToEnglish ===
        "function"
    ) {

        text =
            convertGujaratiDigitsToEnglish(
                text
            );

    }


    text =
        text.replace(
            /\s+/g,
            " "
        );


    return text;

}


/* ============================================================
   GET VILLAGE SEARCH SOURCES
============================================================ */

function getPanchayatGlobalSearchSources() {

    const sources = [];


    /* ========================================================
       TALAPATRAK
    ======================================================== */

    if (
        Array.isArray(
            window.talapatrakAllRows
        )
    ) {

        sources.push({

            type:
                "talapatrak",

            name:
                "Talapatrak",

            data:
                window.talapatrakAllRows

        });

    }


    /* ========================================================
       SHIKSHANUPAKARAN
    ======================================================== */

    if (
        Array.isArray(
            window.shikshanupakaranAllRows
        )
    ) {

        sources.push({

            type:
                "shikshanupakaran",

            name:
                "Shikshanupakaran",

            data:
                window.shikshanupakaranAllRows

        });

    }


    return sources;

}


/* ============================================================
   GLOBAL SEARCH — FIREBASE MAIN BILLS
============================================================ */

async function getPanchayatGlobalMainBills() {

    const results = [];


    /*
    ============================================================
        FIREBASE READY CHECK
    ============================================================
    */

    if (
        typeof db === "undefined" ||
        !db ||
        typeof db.collection !== "function"
    ) {

        console.warn(
            "GLOBAL SEARCH: Firebase db not available."
        );

        return results;

    }


    try {

        console.log(
            "GLOBAL SEARCH → LOADING FIREBASE MAIN BILLS"
        );


        /*
        ========================================================
            LOAD ALL MAIN BILLS
        ========================================================
        */

        const snapshot =
            await db
                .collection("bills")
                .get();


        console.log(
            "GLOBAL SEARCH → MAIN BILLS LOADED:",
            snapshot.size
        );


        /*
        ========================================================
            BUILD SEARCH RESULTS
        ========================================================
        */

        snapshot.forEach(
            function(doc) {

                const bill =
                    doc.data();


                /*
                ------------------------------------------------
                    BILL NUMBER
                ------------------------------------------------
                */

                const billNumber =
                    String(

                        bill.billNo ||

                        bill.billNumber ||

                        doc.id ||

                        ""

                    );


                /*
                ------------------------------------------------
                    CUSTOMER
                ------------------------------------------------
                */

                const customerName =
                    String(

                        bill.customerName ||

                        bill.customer ||

                        ""

                    );


                /*
                ------------------------------------------------
                    VILLAGE
                ------------------------------------------------
                */

                const village =
                    String(

                        bill.village ||

                        bill.moje ||

                        ""

                    );


                /*
                ------------------------------------------------
                    SEARCHABLE TEXT
                    Keep the complete bill searchable.
                ------------------------------------------------
                */

                const searchableValues =
                    Object.values(
                        bill
                    )
                    .filter(
                        function(value) {

                            return (

                                value !== undefined &&

                                value !== null &&

                                typeof value !== "object"

                            );

                        }
                    );


                const searchableText =
                    normalizePanchayatGlobalSearchValue(

                        [

                            ...searchableValues,

                            billNumber,

                            customerName,

                            village,

                            doc.id

                        ]
                        .join(" ")

                    );


                /*
                =================================================
                    STORE RESULT
                =================================================
                */

                results.push({

                    type:
                        "mainBill",

                    source:
                        "Main Bill",

                    documentId:
                        doc.id,

                    billNumber:
                        billNumber,

                    customerName:
                        customerName,

                    village:
                        village,

                    searchableText:
                        searchableText,

                    bill:
                        bill

                });

            }
        );


        console.log(
            "GLOBAL SEARCH → MAIN BILL SEARCH RECORDS:",
            results.length
        );


    }

    catch(error) {

        console.error(
            "GLOBAL SEARCH → MAIN BILL LOAD FAILED:",
            error
        );

    }


    return results;

}



async function getPanchayatGlobalTalapatrak() {

    const results = [];


    /*
    ============================================================
        FIREBASE READY CHECK
    ============================================================
    */

    if (
        typeof db === "undefined" ||
        !db ||
        typeof db.collection !== "function"
    ) {

        console.warn(
            "GLOBAL SEARCH: Firebase db not available."
        );

        return results;

    }


    try {

        console.log(
            "GLOBAL SEARCH → LOADING TALAPATRAK"
        );


        /*
        ========================================================
            LOAD TALAPATRAK RECORDS
        ========================================================
        */

        const snapshot =
            await db
                .collection("talapatraks")
                .get();


        console.log(
            "GLOBAL SEARCH → TALAPATRAK LOADED:",
            snapshot.size
        );


        /*
        ========================================================
            BUILD SEARCH RECORDS
        ========================================================
        */

        snapshot.forEach(
            function(doc) {

                const data =
                    doc.data();


                const village =
                    String(

                        data.moje ||

                        data.village ||

                        data.gam ||

                        ""

                    );


                const taluka =
                    String(

                        data.taluka ||

                        ""

                    );


                const district =
                    String(

                        data.jillo ||

                        data.district ||

                        ""

                    );


                const year =
                    String(

                        data.year ||

                        ""

                    );


                /*
                ------------------------------------------------
                    SEARCHABLE TEXT
                ------------------------------------------------
                */

                const searchableText =
                    normalizePanchayatGlobalSearchValue(

                        [

                            village,

                            taluka,

                            district,

                            year,

                            doc.id

                        ]
                        .join(" ")

                    );


                /*
                ------------------------------------------------
                    ADD RESULT
                ------------------------------------------------
                */

                results.push({

                    type:
                        "talapatrakVillage",

                    source:
                        "Talapatrak",

                    documentId:
                        doc.id,

                    village:
                        village,

                    taluka:
                        taluka,

                    district:
                        district,

                    year:
                        year,

                    searchableText:
                        searchableText,

                    data:
                        data

                });

            }
        );


        console.log(
            "GLOBAL SEARCH → TALAPATRAK SEARCH RECORDS:",
            results.length
        );

    }


    catch(error) {

        console.error(
            "GLOBAL SEARCH → TALAPATRAK LOAD FAILED:",
            error
        );

    }


    return results;

}


async function getPanchayatGlobalShikshanupakaran() {

    const results = [];


    /*
    ============================================================
        FIREBASE READY CHECK
    ============================================================
    */

    if (
        typeof db === "undefined" ||
        !db ||
        typeof db.collection !== "function"
    ) {

        console.warn(
            "GLOBAL SEARCH: Firebase db not available."
        );

        return results;

    }


    try {

        console.log(
            "GLOBAL SEARCH → LOADING SHIKSHANUPAKARAN"
        );


        /*
        ========================================================
            LOAD SHIKSHANUPAKARAN RECORDS
        ========================================================
        */

        const snapshot =
            await db
                .collection("shikshanupakarans")
                .get();


        console.log(
            "GLOBAL SEARCH → SHIKSHANUPAKARAN LOADED:",
            snapshot.size
        );


        /*
        ========================================================
            BUILD SEARCH RECORDS
        ========================================================
        */

        snapshot.forEach(
            function(doc) {

                const data =
                    doc.data();


                const village =
                    String(

                        data.moje ||

                        data.village ||

                        data.gam ||

                        ""

                    );


                const taluka =
                    String(

                        data.taluka ||

                        ""

                    );


                const district =
                    String(

                        data.jillo ||

                        data.district ||

                        ""

                    );


                const year =
                    String(

                        data.year ||

                        ""

                    );


                /*
                ------------------------------------------------
                    SEARCHABLE TEXT
                ------------------------------------------------
                */

                const searchableText =
                    normalizePanchayatGlobalSearchValue(

                        [

                            village,

                            taluka,

                            district,

                            year,

                            doc.id

                        ]
                        .join(" ")

                    );


                /*
                ------------------------------------------------
                    ADD RESULT
                ------------------------------------------------
                */

                results.push({

                    type:
                        "shikshanupakaranVillage",

                    source:
                        "Shikshanupakaran",

                    documentId:
                        doc.id,

                    village:
                        village,

                    taluka:
                        taluka,

                    district:
                        district,

                    year:
                        year,

                    searchableText:
                        searchableText,

                    data:
                        data

                });

            }
        );


        console.log(
            "GLOBAL SEARCH → SHIKSHANUPAKARAN SEARCH RECORDS:",
            results.length
        );

    }


    catch(error) {

        console.error(
            "GLOBAL SEARCH → SHIKSHANUPAKARAN LOAD FAILED:",
            error
        );

    }


    return results;

}

async function performPanchayatGlobalSearch(query) {

    console.log(
        "========================================"
    );

    console.log(
        "GLOBAL SEARCH → PERFORM SEARCH:",
        query
    );


    /*
    ============================================================
        NORMALIZE QUERY
    ============================================================
    */

    const normalizedQuery =
        normalizePanchayatGlobalSearchValue(
            String(query || "")
        );


    console.log(
        "GLOBAL SEARCH → NORMALIZED QUERY:",
        normalizedQuery
    );


    if (!normalizedQuery) {

        console.log(
            "GLOBAL SEARCH → EMPTY QUERY"
        );

        return [];

    }


    /*
    ============================================================
        LOAD ALL THREE SOURCES
    ============================================================
    */

    const [
        mainBillResults,
        talapatrakResults,
        shikshanupakaranResults
    ] = await Promise.all([

        getPanchayatGlobalMainBills(
            normalizedQuery
        ),

        getPanchayatGlobalTalapatrak(),

        getPanchayatGlobalShikshanupakaran()

    ]);


    console.log(
        "GLOBAL SEARCH → MAIN BILL RESULTS:",
        mainBillResults
    );


    console.log(
        "GLOBAL SEARCH → TALAPATRAK ALL RECORDS:",
        talapatrakResults
    );


    console.log(
        "GLOBAL SEARCH → SHIKSHANUPAKARAN ALL RECORDS:",
        shikshanupakaranResults
    );


    /*
    ============================================================
        FILTER TALAPATRAK
    ============================================================
    */

    const matchingTalapatrakResults =
        talapatrakResults.filter(

            function(result) {

                const text =
                    normalizePanchayatGlobalSearchValue(

                        [
                            result.village,
                            result.taluka,
                            result.district,
                            result.year,
                            result.documentId
                        ].join(" ")

                    );


                return text.includes(
                    normalizedQuery
                );

            }

        );


    /*
    ============================================================
        FILTER SHIKSHANUPAKARAN
    ============================================================
    */

    const matchingShikshanupakaranResults =
        shikshanupakaranResults.filter(

            function(result) {

                const text =
                    normalizePanchayatGlobalSearchValue(

                        [
                            result.village,
                            result.taluka,
                            result.district,
                            result.year,
                            result.documentId
                        ].join(" ")

                    );


                return text.includes(
                    normalizedQuery
                );

            }

        );


    /*
    ============================================================
        COMBINE
    ============================================================
    */

    const results = [

        ...mainBillResults,

        ...matchingTalapatrakResults,

        ...matchingShikshanupakaranResults

    ];


    console.log(
        "GLOBAL SEARCH → MATCHING TALAPATRAK:",
        matchingTalapatrakResults.length
    );


    console.log(
        "GLOBAL SEARCH → MATCHING SHIKSHANUPAKARAN:",
        matchingShikshanupakaranResults.length
    );


    console.log(
        "GLOBAL SEARCH → TOTAL MATCHES:",
        results.length
    );


    console.log(
        "GLOBAL SEARCH → FINAL RESULTS:",
        results
    );


    return results;

}



/* ============================================================
   GLOBAL SEARCH — VILLAGE CARDS
============================================================ */

function getPanchayatGlobalVillageCards() {

    const results = [];


    /*
     * ========================================================
     * TALAPATRAK CARDS
     * ========================================================
     */

    document
        .querySelectorAll(
            "#talapatrakVillageGrid > *"
        )
        .forEach(
            function(card) {

                const text =
                    normalizePanchayatGlobalSearchValue(
                        card.innerText || ""
                    );


                if (!text) {

                    return;

                }


                results.push({

                    type:
                        "talapatrakVillage",

                    source:
                        "Talapatrak",

                    element:
                        card,

                    text:
                        card.innerText || "",

                    village:
                        extractPanchayatVillageFromCard(
                            card
                        )

                });

            }
        );


    /*
     * ========================================================
     * SHIKSHANUPAKARAN CARDS
     * ========================================================
     */

    document
        .querySelectorAll(
            "#shikshanupakaranVillageGrid > *"
        )
        .forEach(
            function(card) {

                const text =
                    normalizePanchayatGlobalSearchValue(
                        card.innerText || ""
                    );


                if (!text) {

                    return;

                }


                results.push({

                    type:
                        "shikshanupakaranVillage",

                    source:
                        "Shikshanupakaran",

                    element:
                        card,

                    text:
                        card.innerText || "",

                    village:
                        extractPanchayatVillageFromCard(
                            card
                        )

                });

            }
        );


    return results;

}


/* ============================================================
   EXTRACT VILLAGE NAME FROM CARD
============================================================ */

function extractPanchayatVillageFromCard(
    card
) {

    if (!card) {

        return "";

    }


    /*
     * First try common data attributes.
     */

    const possibleVillage =
        card.dataset.village ||
        card.dataset.villageName ||
        card.dataset.name;


    if (possibleVillage) {

        return String(
            possibleVillage
        ).trim();

    }


    /*
     * Otherwise use the card text.
     *
     * The card's visible text is still searchable,
     * even when we cannot identify a dedicated field.
     */

    return String(
        card.innerText || ""
    )
        .split("\n")
        .map(
            function(value) {

                return value.trim();

            }
        )
        .filter(Boolean)[0] || "";

}


/* ============================================================
   CARD HIGHLIGHT
============================================================ */

function highlightPanchayatGlobalCard(
    card
) {

    if (!card) {

        return;

    }


    /*
     * Remove old global-search highlights.
     */

    document
        .querySelectorAll(
            ".panchayatGlobalSearchHighlight"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "panchayatGlobalSearchHighlight"
                );

                element.style.removeProperty(
                    "background-color"
                );

                element.style.removeProperty(
                    "box-shadow"
                );

            }
        );


    /*
     * Apply highlight.
     */

    card.classList.add(
        "panchayatGlobalSearchHighlight"
    );


    card.style.setProperty(
        "background-color",
        "#fff9c4",
        "important"
    );


    card.style.setProperty(
        "box-shadow",
        "0 0 0 3px #d6a800, 0 8px 25px rgba(214,168,0,.30)",
        "important"
    );


    card.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    /*
     * Keep highlight for 3 seconds.
     */

    clearTimeout(
        window.panchayatGlobalCardHighlightTimer
    );


    window.panchayatGlobalCardHighlightTimer =
        setTimeout(
            function() {

                card.classList.remove(
                    "panchayatGlobalSearchHighlight"
                );

                card.style.removeProperty(
                    "background-color"
                );

                card.style.removeProperty(
                    "box-shadow"
                );

            },
            3000
        );

}


/* ============================================================
   OPEN TALAPATRAK VILLAGE CARD
============================================================ */


function openPanchayatGlobalTalapatrakVillage(
    result
) {

    /*
    ============================================================
        OPEN TALAPATRAK MANAGEMENT
    ============================================================
    */

    const nav =
        document.getElementById(
            "talapatrakNav"
        );


    if (nav) {

        nav.click();

    }
    else {

        console.warn(
            "GLOBAL SEARCH: Talapatrak navigation not found."
        );

        return;

    }


    /*
    ============================================================
        SEARCH QUERY
    ============================================================
    */

    const query =
        normalizePanchayatGlobalSearchValue(

            result.village ||
            result.text ||
            ""

        );


    if (!query) {

        console.warn(
            "GLOBAL SEARCH: Talapatrak village query is empty."
        );

        return;

    }


    console.log(
        "GLOBAL SEARCH → WAITING FOR TALAPATRAK CARD:",
        query
    );


    /*
    ============================================================
        WAIT FOR CARD TO BE RENDERED
       
        We do NOT use a fixed 300ms delay.
       
        Talapatrak loads from Firestore asynchronously,
        so we check repeatedly until the card exists.
    ============================================================
    */

    const startTime =
        Date.now();


    const maxWaitTime =
        1000;


    function findTalapatrakCard() {

        const grid =
            document.getElementById(
                "talapatrakVillageGrid"
            );


        if (!grid) {

            return null;

        }


        const cards =
            Array.from(
                grid.children
            );


        const card =
            cards.find(
                function(element) {

                    const text =
                        normalizePanchayatGlobalSearchValue(
                            element.innerText || ""
                        );


                    return text.includes(
                        query
                    );

                }
            );


        return card || null;

    }


    function waitForTalapatrakCard() {

        const card =
            findTalapatrakCard();


        /*
        --------------------------------------------------------
            CARD FOUND
        --------------------------------------------------------
        */

        if (card) {

            console.log(
                "GLOBAL SEARCH → TALAPATRAK CARD FOUND:",
                query
            );


            highlightPanchayatGlobalCard(
                card
            );


            return;

        }


        /*
        --------------------------------------------------------
            TIMEOUT SAFETY
        --------------------------------------------------------
        */

        const elapsed =
            Date.now() -
            startTime;


        if (
            elapsed >=
            maxWaitTime
        ) {

            console.warn(
                "GLOBAL SEARCH: Talapatrak card not found after waiting:",
                query
            );


            return;

        }


        /*
        --------------------------------------------------------
            CHECK AGAIN
        --------------------------------------------------------
        */

        setTimeout(
            waitForTalapatrakCard,
            100
        );

    }


    /*
    ============================================================
        START WAITING
    ============================================================
    */

    waitForTalapatrakCard();

}




/* ============================================================
   OPEN SHIKSHANUPAKARAN VILLAGE CARD
============================================================ */


function openPanchayatGlobalShikshanupakaranVillage(
    result
) {

    /*
    ============================================================
        OPEN SHIKSHANUPAKARAN MANAGEMENT
    ============================================================
    */

    const nav =
        document.getElementById(
            "shikshanupakaranNav"
        );


    if (nav) {

        nav.click();

    }
    else {

        console.warn(
            "GLOBAL SEARCH: Shikshanupakaran navigation not found."
        );

        return;

    }


    /*
    ============================================================
        SEARCH QUERY
    ============================================================
    */

    const query =
        normalizePanchayatGlobalSearchValue(

            result.village ||
            result.text ||
            ""

        );


    if (!query) {

        console.warn(
            "GLOBAL SEARCH: Shikshanupakaran village query is empty."
        );

        return;

    }


    console.log(
        "GLOBAL SEARCH → WAITING FOR SHIKSHANUPAKARAN CARD:",
        query
    );


    /*
    ============================================================
        WAIT SETTINGS
    ============================================================
    */

    const startTime =
        Date.now();


    const maxWaitTime =
        1000;


    /*
    ============================================================
        FIND CARD
    ============================================================
    */

    function findShikshanupakaranCard() {

        const grid =
            document.getElementById(
                "shikshanupakaranVillageGrid"
            );


        if (!grid) {

            return null;

        }


        const cards =
            Array.from(
                grid.children
            );


        const card =
            cards.find(
                function(element) {

                    const text =
                        normalizePanchayatGlobalSearchValue(
                            element.innerText || ""
                        );


                    return text.includes(
                        query
                    );

                }
            );


        return card || null;

    }


    /*
    ============================================================
        WAIT FOR CARD
    ============================================================
    */

    function waitForShikshanupakaranCard() {

        const card =
            findShikshanupakaranCard();


        /*
        --------------------------------------------------------
            CARD FOUND
        --------------------------------------------------------
        */

        if (card) {

            console.log(
                "GLOBAL SEARCH → SHIKSHANUPAKARAN CARD FOUND:",
                query
            );


            highlightPanchayatGlobalCard(
                card
            );


            return;

        }


        /*
        --------------------------------------------------------
            TIMEOUT
        --------------------------------------------------------
        */

        const elapsed =
            Date.now() -
            startTime;


        if (
            elapsed >=
            maxWaitTime
        ) {

            console.warn(
                "GLOBAL SEARCH: Shikshanupakaran card not found after waiting:",
                query
            );


            return;

        }


        /*
        --------------------------------------------------------
            CHECK AGAIN
        --------------------------------------------------------
        */

        setTimeout(
            waitForShikshanupakaranCard,
            100
        );

    }


    /*
    ============================================================
        START
    ============================================================
    */

    waitForShikshanupakaranCard();

}



/* ============================================================
   OPEN MAIN BILL
============================================================ */

async function openPanchayatGlobalMainBill(
    result
) {

    console.log(
        "GLOBAL SEARCH → OPEN MAIN BILL:",
        result
    );


    /*
     * ========================================================
     * OPEN MAIN BILLS VIEW
     * ========================================================
     */

    const mainBillsView =
        document.getElementById(
            "mainBillsView"
        );


    /*
     * Try the normal navigation first.
     *
     * We deliberately do not depend on a specific
     * nav ID being present.
     */

    const possibleNavIds = [

        "mainBillsNav",
        "allBillsNav",
        "mainBillNav"

    ];


    let opened =
        false;


    for (
        const navId of possibleNavIds
    ) {

        const nav =
            document.getElementById(
                navId
            );


        if (nav) {

            nav.click();

            opened =
                true;

            break;

        }

    }


    /*
     * Fallback: directly show Main Bills view.
     */

    if (
        !opened &&
        mainBillsView
    ) {

        document
            .querySelectorAll(
                "section"
            )
            .forEach(
                function(section) {

                    /*
                     * Do not blindly hide everything
                     * except when needed.
                     */

                }
            );


        mainBillsView.style.display =
            "block";

    }


    /*
     * ========================================================
     * LOAD BILLS
     * ========================================================
     */

    if (
        typeof window.loadAllMainBills ===
        "function"
    ) {

        await window.loadAllMainBills("");

    }


    /*
     * ========================================================
     * FIND EXACT BILL ROW
     * ========================================================
     */

    setTimeout(
        function() {

            const body =
                document.getElementById(
                    "mainBillsBody"
                );


            if (!body) {

                console.warn(
                    "GLOBAL SEARCH: Main bills body not found."
                );

                return;

            }


            const targetBillNumber =
                normalizePanchayatGlobalSearchValue(
                    result.billNumber
                );


            const rows =
                Array.from(
                    body.querySelectorAll(
                        "tr"
                    )
                );


            const row =
                rows.find(
                    function(row) {

                        const rowBillNumber =
                            normalizePanchayatGlobalSearchValue(
                                row.querySelector(
                                    ".billNumber"
                                )?.innerText ||
                                ""
                            );


                        return (
                            rowBillNumber ===
                            targetBillNumber
                        );

                    }
                );


            if (!row) {

                console.warn(
                    "GLOBAL SEARCH: Bill row not found:",
                    result.billNumber
                );

                return;

            }


            highlightPanchayatGlobalBillRow(
                row
            );

        },
        150
    );

}


/* ============================================================
   HIGHLIGHT MAIN BILL ROW
============================================================ */

function highlightPanchayatGlobalBillRow(
    row
) {

    if (!row) {

        return;

    }


    document
        .querySelectorAll(
            ".panchayatGlobalBillHighlight"
        )
        .forEach(
            function(element) {

                element.classList.remove(
                    "panchayatGlobalBillHighlight"
                );

                element.style.removeProperty(
                    "background-color"
                );

                element.style.removeProperty(
                    "box-shadow"
                );

            }
        );


    row.classList.add(
        "panchayatGlobalBillHighlight"
    );


    row.querySelectorAll("td")
        .forEach(
            function(cell) {

                cell.style.setProperty(
                    "background-color",
                    "#fff9c4",
                    "important"
                );

                cell.style.setProperty(
                    "box-shadow",
                    "inset 0 2px 0 #d6a800, inset 0 -2px 0 #d6a800",
                    "important"
                );

            }
        );


    row.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    clearTimeout(
        window.panchayatGlobalBillHighlightTimer
    );


    window.panchayatGlobalBillHighlightTimer =
        setTimeout(
            function() {

                row.classList.remove(
                    "panchayatGlobalBillHighlight"
                );


                row.querySelectorAll("td")
                    .forEach(
                        function(cell) {

                            cell.style.removeProperty(
                                "background-color"
                            );

                            cell.style.removeProperty(
                                "box-shadow"
                            );

                        }
                    );

            },
            3000
        );

}


/* ============================================================
   GET BEST DISPLAY VALUE FROM ROW
============================================================ */

function getPanchayatGlobalRowDisplayValue(
    row
) {

    if (!row || typeof row !== "object") {

        return "";

    }


    /*
     * Most village records use column A
     * for Khata number and B for holder/name.
     *
     * We also check common named properties.
     */

    const possibleValues = [

        row.village,
        row.villageName,
        row.moje,
        row.A,
        row.name,
        row.accountHolder,
        row.holderName,
        row.B

    ];


    for (
        const value of possibleValues
    ) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value);

        }

    }


    return "Village record";

}


/* ============================================================
   GET YEAR FROM ROW
============================================================ */

function getPanchayatGlobalRowYear(
    row
) {

    if (!row || typeof row !== "object") {

        return "";

    }


    const possibleValues = [

        row.year,
        row.Year,
        row.financialYear,
        row.talapatrakYear,
        row.shikshanupakaranYear

    ];


    for (
        const value of possibleValues
    ) {

        if (
            value !== undefined &&
            value !== null &&
            String(value).trim() !== ""
        ) {

            return String(value);

        }

    }


    return "";

}


/* ============================================================
   SEARCH OBJECT RECURSIVELY
============================================================ */

function searchPanchayatGlobalObject(
    object,
    query,
    path,
    output
) {

    if (
        object === null ||
        object === undefined
    ) {

        return;

    }


    /*
     * Simple value
     */

    if (
        typeof object !== "object"
    ) {

        const value =
            normalizePanchayatGlobalSearchValue(
                object
            );


        if (
            value &&
            value.includes(query)
        ) {

            output.push({

                value:
                    String(object),

                path:
                    path

            });

        }


        return;

    }


    /*
     * Array
     */

    if (
        Array.isArray(object)
    ) {

        object.forEach(
            function(item, index) {

                searchPanchayatGlobalObject(
                    item,
                    query,
                    path +
                        "[" +
                        index +
                        "]",
                    output
                );

            }
        );

        return;

    }


    /*
     * Object
     */

    Object.keys(object)
        .forEach(
            function(key) {

                const value =
                    object[key];


                if (
                    typeof value ===
                    "function"
                ) {

                    return;

                }


                const normalizedKey =
                    normalizePanchayatGlobalSearchValue(
                        key
                    );


                const normalizedValue =
                    normalizePanchayatGlobalSearchValue(
                        value
                    );


                /*
                 * Search key/value.
                 */

                if (
                    normalizedKey.includes(query) &&
                    normalizedValue
                ) {

                    output.push({

                        value:
                            String(value),

                        path:
                            path
                                ? path + "." + key
                                : key

                    });

                }


                /*
                 * Search nested values.
                 */

                searchPanchayatGlobalObject(
                    value,
                    query,
                    path
                        ? path + "." + key
                        : key,
                    output
                );

            }
        );

}



/* ============================================================
   SEARCH MAIN BILL
============================================================ */

function searchPanchayatGlobalBill(
    billRecord,
    query
) {

    if (
        !billRecord ||
        !billRecord.data
    ) {

        return false;

    }


    const bill =
        billRecord.data;


    /*
     * Search complete bill object.
     *
     * This catches:
     *
     * billNo
     * customerName
     * village
     * taluka
     * district
     * billDate
     * bankDetails
     * grandTotal
     * amountInWords
     * items
     */

    const completeBillText =
        normalizePanchayatGlobalSearchValue(

            Object.values(bill)
                .filter(
                    function(value) {

                        return (
                            value !==
                                undefined &&
                            value !==
                                null
                        );

                    }
                )
                .map(
                    function(value) {

                        if (
                            typeof value ===
                            "object"
                        ) {

                            return JSON.stringify(
                                value
                            );

                        }

                        return String(value);

                    }
                )
                .join(" ")

        );


    /*
     * Also search the Firebase document ID.
     */

    const documentId =
        normalizePanchayatGlobalSearchValue(
            billRecord.id
        );


    return (
        completeBillText.includes(query) ||
        documentId.includes(query)
    );

}


/* ============================================================
   SEARCH GLOBAL APPLICATION DATA
============================================================ */


async function searchPanchayatGlobalMemory(
    query
) {

    const state =
        window.panchayatGlobalSearchState;


    /*
     * Every search gets a unique request ID.
     *
     * If the search is cleared while Firebase is still
     * loading, the old request will be ignored.
     */
    const requestId =
        ++state.searchRequestId;


    state.query =
        String(query || "")
            .trim();


    state.normalizedQuery =
        normalizePanchayatGlobalSearchValue(
            state.query
        );


    state.results =
        [];


    state.currentIndex =
        -1;


    state.active =
        Boolean(
            state.normalizedQuery
        );


    if (
        !state.normalizedQuery
    ) {

        return [];

    }


    const normalizedQuery =
        state.normalizedQuery;


    /* ========================================================
       2. EXISTING MEMORY DATA
    ======================================================== */

    const sources =
        getPanchayatGlobalSearchSources();


    sources.forEach(
        function(source) {

            if (
                !Array.isArray(
                    source.data
                )
            ) {

                return;

            }


            source.data.forEach(
                function(row, index) {

                    const completeRowText =
                        normalizePanchayatGlobalSearchValue(

                            Object.values(row)
                                .filter(
                                    function(value) {

                                        return (
                                            value !== undefined &&
                                            value !== null
                                        );

                                    }
                                )
                                .join(" ")

                        );


                    if (
                        !completeRowText.includes(
                            normalizedQuery
                        )
                    ) {

                        return;

                    }


                    state.results.push({

                        type:
                            source.type,

                        source:
                            source.name,

                        memoryIndex:
                            index,

                        row:
                            row,

                        matches:
                            []

                    });

                }
            );

        }
    );


    /* ========================================================
       3. FIREBASE MAIN BILLS
    ======================================================== */

    const billResults =
        await getPanchayatGlobalMainBills(
            normalizedQuery
        );

        if (
            requestId !==
            state.searchRequestId
        ) {

            return [];

        }


    billResults.forEach(
        function(result) {

            state.results.push(
                result
            );

        }
    );


    /* ========================================================
       4. FIREBASE TALAPATRAK
    ======================================================== */

    const talapatrakResults =
        await getPanchayatGlobalTalapatrak();


    if (
        requestId !==
        state.searchRequestId
    ) {

        return [];

    }


    talapatrakResults.forEach(
        function(result) {

            const searchableText =
                normalizePanchayatGlobalSearchValue(

                    [
                        result.village,
                        result.taluka,
                        result.district,
                        result.year,
                        result.documentId
                    ]
                    .join(" ")

                );


            if (
                !searchableText.includes(
                    normalizedQuery
                )
            ) {

                return;

            }


            state.results.push(
                result
            );

        }
    );


    /* ========================================================
       5. FIREBASE SHIKSHANUPAKARAN
    ======================================================== */

    const shikshanupakaranResults =
        await getPanchayatGlobalShikshanupakaran();


    if (
        requestId !==
        state.searchRequestId
    ) {

        return [];

    }


    shikshanupakaranResults.forEach(
        function(result) {

            const searchableText =
                normalizePanchayatGlobalSearchValue(

                    [
                        result.village,
                        result.taluka,
                        result.district,
                        result.year,
                        result.documentId
                    ]
                    .join(" ")

                );


            if (
                !searchableText.includes(
                    normalizedQuery
                )
            ) {

                return;

            }


            state.results.push(
                result
            );

        }
    );


    /* ========================================================
       6. REMOVE DUPLICATES
    ======================================================== */

    const uniqueResults =
        [];


    const seen =
        new Set();


    state.results.forEach(
        function(result) {

            let key;


            /*
            ----------------------------------------------------
                MAIN BILL
            ----------------------------------------------------
            */

            if (
                result.type ===
                "mainBill"
            ) {

                key =
                    "bill:" +
                    result.documentId;

            }


            /*
            ----------------------------------------------------
                TALAPATRAK VILLAGE
            ----------------------------------------------------
            */

            else if (
                result.type ===
                "talapatrakVillage"
            ) {

                key =
                    "talapatrakVillage:" +
                    result.documentId;

            }


            /*
            ----------------------------------------------------
                SHIKSHANUPAKARAN VILLAGE
            ----------------------------------------------------
            */

            else if (
                result.type ===
                "shikshanupakaranVillage"
            ) {

                key =
                    "shikshanupakaranVillage:" +
                    result.documentId;

            }


            /*
            ----------------------------------------------------
                OTHER MEMORY RESULTS
            ----------------------------------------------------
            */

            else {

                key =
                    result.type +
                    ":" +
                    result.memoryIndex;

            }


            if (
                seen.has(key)
            ) {

                return;

            }


            seen.add(
                key
            );


            uniqueResults.push(
                result
            );

        }
    );


    state.results =
        uniqueResults;


    /* ========================================================
       7. DEBUG
    ======================================================== */

    console.log(
        "GLOBAL SEARCH:",
        {

            query:
                state.query,

            normalizedQuery:
                state.normalizedQuery,

            matches:
                state.results.length,

            results:
                state.results

        }
    );


    console.log(
        "GLOBAL SEARCH → BREAKDOWN:",
        {

            mainBills:
                state.results.filter(
                    function(result) {

                        return (
                            result.type ===
                            "mainBill"
                        );

                    }
                ).length,

            talapatrak:
                state.results.filter(
                    function(result) {

                        return (
                            result.type ===
                            "talapatrakVillage"
                        );

                    }
                ).length,

            shikshanupakaran:
                state.results.filter(
                    function(result) {

                        return (
                            result.type ===
                            "shikshanupakaranVillage"
                        );

                    }
                ).length

        }
    );


    return state.results;

}




/* ============================================================
   GET GLOBAL SEARCH RESULT CONTAINER
============================================================ */

function getPanchayatGlobalSearchResultContainer() {

    let container =
        document.getElementById(
            "panchayatGlobalSearchResults"
        );


    if (
        container
    ) {

        return container;

    }


    const searchBox =
        document.querySelector(
            ".searchBox"
        );


    if (
        !searchBox
    ) {

        return null;

    }


    container =
        document.createElement(
            "div"
        );


    container.id =
        "panchayatGlobalSearchResults";


    container.className =
        "panchayatGlobalSearchResults";


    searchBox.appendChild(
        container
    );


    return container;

}


/* ============================================================
   GET RESULT LABEL
============================================================ */

function getPanchayatGlobalResultLabel(
    result
) {

    if (
        result.type ===
        "mainBill"
    ) {

        return result.billNumber;

    }


    if (
        result.type ===
        "talapatrakVillage"
    ) {

        return (
            result.village ||
            result.text
        );

    }


    if (
        result.type ===
        "shikshanupakaranVillage"
    ) {

        return (
            result.village ||
            result.text
        );

    }


    if (
        result.type ===
        "application"
    ) {

        return (
            result.field +
            ": " +
            String(result.value)
        );

    }


    if (
        result.source
    ) {

        return result.source;

    }


    return "Result";

}


/* ============================================================
   GET RESULT SUBTITLE
============================================================ */

function getPanchayatGlobalResultSubtitle(
    result
) {

    if (
        result.type ===
        "talapatrakVillage"
    ) {

        return "Talapatrak • Village";

    }


    if (
        result.type ===
        "shikshanupakaranVillage"
    ) {

        return "Shikshanupakaran • Village";

    }


    if (
        result.type ===
        "mainBill"
    ) {

        if (result.village) {

            return (
                "Main Bill • " +
                result.village
            );

        }


        return "Main Bill";

    }


    if (
        result.type ===
        "talapatrak"
    ) {

        return "Talapatrak • Row";

    }


    if (
        result.type ===
        "shikshanupakaran"
    ) {

        return "Shikshanupakaran • Row";

    }


    if (
        result.type ===
        "application"
    ) {

        return "Application";

    }


    return result.source || "";

}


/* ============================================================
   RESULT ICON
============================================================ */

function getPanchayatGlobalResultIcon(
    result
) {

    if (
        result.type ===
        "talapatrakVillage"
    ) {

        return "fa-map-location-dot";

    }


    if (
        result.type ===
        "shikshanupakaranVillage"
    ) {

        return "fa-school";

    }


    if (
        result.type ===
        "mainBill"
    ) {

        return "fa-receipt";

    }


    if (
        result.type ===
        "talapatrak"
    ) {

        return "fa-table";

    }


    if (
        result.type ===
        "shikshanupakaran"
    ) {

        return "fa-school";

    }


    if (
        result.type ===
        "application"
    ) {

        return "fa-database";

    }


    return "fa-file-lines";

}


/* ============================================================
   RENDER GLOBAL SEARCH RESULTS
============================================================ */

function renderPanchayatGlobalSearchResults() {

    const container =
        getPanchayatGlobalSearchResultContainer();


    if (!container) {

        console.warn(
            "GLOBAL SEARCH: Results container not found."
        );

        return;

    }


    const state =
        window.panchayatGlobalSearchState;


    if (!state) {

        console.warn(
            "GLOBAL SEARCH: Search state not found."
        );

        return;

    }


    console.log(
        "GLOBAL SEARCH → RENDER:",
        {
            query: state.query,
            results: state.results,
            count: Array.isArray(state.results)
                ? state.results.length
                : 0
        }
    );


    /*
     * ========================================================
     * CLEAR OLD RESULTS
     * ========================================================
     */

    container.innerHTML = "";


    /*
     * ========================================================
     * NO SEARCH
     * ========================================================
     */

    if (
        !state.query ||
        !state.query.trim()
    ) {

        container.style.display =
            "none";

        return;

    }


    /*
     * ========================================================
     * RESULTS
     * ========================================================
     */

    const results =
        Array.isArray(state.results)
            ? state.results
            : [];


    /*
     * ========================================================
     * NO RESULTS
     * ========================================================
     */

    if (!results.length) {

        container.innerHTML = `

            <div class="panchayatGlobalSearchEmpty">

                <i class="fa-solid fa-magnifying-glass"></i>

                <span>
                    No results found
                </span>

            </div>

        `;


        container.style.display =
            "block";


        return;

    }


    /*
     * ========================================================
     * MAX RESULTS
     * ========================================================
     */

    const maxResults =
        Number(
            window
                .panchayatGlobalSearchConfig
                ?.maxResults
        ) || 20;


    /*
     * ========================================================
     * BUILD RESULTS
     * ========================================================
     */

    results
        .slice(0, maxResults)
        .forEach(
            function(result, index) {

                const item =
                    document.createElement(
                        "button"
                    );


                item.type =
                    "button";


                item.className =
                    "panchayatGlobalSearchResult";


                item.dataset.index =
                    String(index);


                if (result.type) {

                    item.dataset.resultType =
                        result.type;

                }


                /*
                 * ACTIVE RESULT
                 */

                if (
                    index ===
                    state.currentIndex
                ) {

                    item.classList.add(
                        "active"
                    );

                }


                /*
                 * ICON
                 */

                const icon =
                    typeof getPanchayatGlobalResultIcon ===
                    "function"

                        ? getPanchayatGlobalResultIcon(
                            result
                        )

                        : "fa-file-lines";


                /*
                 * TITLE
                 */

                const title =
                    typeof getPanchayatGlobalResultLabel ===
                    "function"

                        ? getPanchayatGlobalResultLabel(
                            result
                        )

                        : (
                            result.billNumber ||
                            result.village ||
                            result.value ||
                            result.source ||
                            "Result"
                        );


                /*
                 * SUBTITLE
                 */

                const subtitle =
                    typeof getPanchayatGlobalResultSubtitle ===
                    "function"

                        ? getPanchayatGlobalResultSubtitle(
                            result
                        )

                        : (
                            result.source ||
                            result.type ||
                            ""
                        );


                /*
                 * BUILD HTML
                 */

                item.innerHTML = `

                    <span
                        class="panchayatGlobalSearchResultIcon">

                        <i
                            class="fa-solid ${escapePanchayatGlobalSearchHTML(
                                icon
                            )}">
                        </i>

                    </span>


                    <span
                        class="panchayatGlobalSearchResultContent">

                        <span
                            class="panchayatGlobalSearchResultText">

                            ${escapePanchayatGlobalSearchHTML(
                                title
                            )}

                        </span>


                        <span
                            class="panchayatGlobalSearchResultType">

                            ${escapePanchayatGlobalSearchHTML(
                                subtitle
                            )}

                        </span>

                    </span>


                    <i
                        class="fa-solid fa-arrow-right
                               panchayatGlobalSearchResultArrow">
                    </i>

                `;


                container.appendChild(
                    item
                );

            }
        );


    /*
     * ========================================================
     * SHOW DROPDOWN
     *
     * IMPORTANT:
     * This happens AFTER the result buttons
     * have actually been inserted.
     * ========================================================
     */

    container.style.display =
        "block";


    console.log(
        "GLOBAL SEARCH → DROPDOWN RENDERED:",
        {
            children:
                container.children.length,

            html:
                container.innerHTML
        }
    );

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapePanchayatGlobalSearchHTML(
    value
) {

    return String(value || "")
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
   HIGHLIGHT VILLAGE CARD
============================================================ */

function highlightPanchayatGlobalVillageCard(
    result
) {

    const cardSelector =
        result.type ===
        "talapatrak"

            ? ".talapatrakVillageCard"

            : ".shikshanupakaranVillageCard";


    const cards =
        Array.from(
            document.querySelectorAll(
                cardSelector
            )
        );


    /*
     * Try exact data-id first.
     */

    let target =
        result.row &&
        result.row.id

            ? cards.find(
                function(card) {

                    return (
                        String(
                            card.dataset.id
                        ) ===
                        String(
                            result.row.id
                        )
                    );

                }
            )

            : null;


    /*
     * Fall back to memory index.
     */

    if (!target) {

        target =
            cards.find(
                function(card) {

                    return (
                        Number(
                            card.dataset.memoryIndex
                        ) ===
                        Number(
                            result.memoryIndex
                        )
                    );

                }
            );

    }


    /*
     * Last fallback:
     * use visible card at memory index.
     */

    if (!target) {

        target =
            cards[
                result.memoryIndex
            ];

    }


    if (!target) {

        console.warn(
            "GLOBAL SEARCH: Village card not found.",
            result
        );

        return;

    }


    highlightPanchayatGlobalElement(
        target
    );

}


/* ============================================================
   HIGHLIGHT MAIN BILL ROW
============================================================ */

function highlightPanchayatGlobalMainBill(
    result
) {

    const body =
        document.getElementById(
            "mainBillsBody"
        );


    if (!body) {

        return;

    }


    const rows =
        Array.from(
            body.querySelectorAll(
                "tr"
            )
        );


    const wantedId =
        String(
            result.id || ""
        );


    const wantedBillNumber =
        normalizePanchayatGlobalSearchValue(
            result.billNumber
        );


    let target =
        rows.find(
            function(row) {

                return (
                    String(
                        row.dataset.billId || ""
                    ) ===
                    wantedId
                );

            }
        );


    /*
     * Fallback: match bill number text.
     */

    if (!target) {

        target =
            rows.find(
                function(row) {

                    const billNumberElement =
                        row.querySelector(
                            ".billNumber"
                        );


                    if (
                        !billNumberElement
                    ) {

                        return false;

                    }


                    return (
                        normalizePanchayatGlobalSearchValue(
                            billNumberElement.textContent
                        ) ===
                        wantedBillNumber
                    );

                }
            );

    }


    if (!target) {

        console.warn(
            "GLOBAL SEARCH: Main bill row not found.",
            result
        );

        return;

    }


    highlightPanchayatGlobalElement(
        target
    );

}


/* ============================================================
   GENERIC GLOBAL HIGHLIGHT
============================================================ */

function highlightPanchayatGlobalElement(
    element
) {

    if (!element) {

        return;

    }


    /*
     * Clear previous global highlights.
     */

    document
        .querySelectorAll(
            ".panchayatGlobalSearchHighlight"
        )
        .forEach(
            function(oldElement) {

                oldElement.classList.remove(
                    "panchayatGlobalSearchHighlight"
                );

            }
        );


    /*
     * Clear old timer.
     */

    if (
        window.panchayatGlobalSearchHighlightTimer
    ) {

        clearTimeout(
            window.panchayatGlobalSearchHighlightTimer
        );

    }


    element.classList.add(
        "panchayatGlobalSearchHighlight"
    );


    /*
     * Scroll target into view.
     */

    element.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    /*
     * Keep highlight for exactly 3 seconds.
     */

    window.panchayatGlobalSearchHighlightTimer =
        setTimeout(
            function() {

                element.classList.remove(
                    "panchayatGlobalSearchHighlight"
                );

            },
            window
                .panchayatGlobalSearchConfig
                .highlightDuration
        );

}


/* ============================================================
   OPEN TALAPATRAK RESULT
============================================================ */

function openPanchayatGlobalTalapatrakResult(
    result
) {

    /*
     * If a proper record ID exists,
     * use the application's normal
     * opening function.
     */

    if (
        result.row &&
        result.row.id &&
        typeof window.openTalapatrakRecord ===
            "function"
    ) {

        window.openTalapatrakRecord(
            result.row.id
        );


        setTimeout(
            function() {

                highlightPanchayatGlobalVillageCard(
                    result
                );

            },
            150
        );


        return;

    }


    /*
     * Otherwise try clicking the matching
     * village card directly.
     */

    const cards =
        document.querySelectorAll(
            ".talapatrakVillageCard"
        );


    const target =
        cards[
            result.memoryIndex
        ];


    if (target) {

        target.click();


        setTimeout(
            function() {

                highlightPanchayatGlobalVillageCard(
                    result
                );

            },
            150
        );

    }

}


/* ============================================================
   OPEN SHIKSHANUPAKARAN RESULT
============================================================ */

function openPanchayatGlobalShikshanupakaranResult(
    result
) {

    /*
     * Try common record-opening functions.
     *
     * The first available function wins.
     */

    if (
        result.row &&
        result.row.id
    ) {

        if (
            typeof window.openShikshanupakaranRecord ===
                "function"
        ) {

            window.openShikshanupakaranRecord(
                result.row.id
            );


            setTimeout(
                function() {

                    highlightPanchayatGlobalVillageCard(
                        result
                    );

                },
                150
            );


            return;

        }


        if (
            typeof window.openShikshanupakaranEditor ===
                "function"
        ) {

            window.openShikshanupakaranEditor(
                result.row.id
            );


            setTimeout(
                function() {

                    highlightPanchayatGlobalVillageCard(
                        result
                    );

                },
                150
            );


            return;

        }

    }


    /*
     * Fallback:
     * click matching visible card.
     */

    const cards =
        document.querySelectorAll(
            ".shikshanupakaranVillageCard"
        );


    const target =
        cards[
            result.memoryIndex
        ];


    if (target) {

        target.click();


        setTimeout(
            function() {

                highlightPanchayatGlobalVillageCard(
                    result
                );

            },
            150
        );

    }

}


/* ============================================================
   OPEN MAIN BILL RESULT
============================================================ */

async function openPanchayatGlobalMainBillResult(
    result
) {

    /*
     * Navigate to Main Bills page.
     *
     * Your application can use whichever
     * existing navigation function is available.
     */

    let opened =
        false;


    const navigationFunctions = [

        "showMainBillsView",

        "openMainBillsView",

        "navigateToMainBills",

        "showMainBills"

    ];


    for (
        const functionName of
        navigationFunctions
    ) {

        if (
            typeof window[
                functionName
            ] ===
            "function"
        ) {

            window[
                functionName
            ]();


            opened =
                true;


            break;

        }

    }


    /*
     * If there is no navigation helper,
     * reveal the Main Bills section directly.
     */

    if (!opened) {

        const mainBillsView =
            document.getElementById(
                "mainBillsView"
            );


        if (mainBillsView) {

            document
                .querySelectorAll(
                    "section[id$='View']"
                )
                .forEach(
                    function(section) {

                        if (
                            section !==
                            mainBillsView
                        ) {

                            /*
                             * Do not blindly hide
                             * unrelated sections.
                             */

                        }

                    }
                );


            mainBillsView.style.display =
                "";

        }

    }


    /*
     * Main Bills are loaded asynchronously.
     * Load them without filtering.
     */

    if (
        typeof window.loadAllMainBills ===
        "function"
    ) {

        await window.loadAllMainBills("");

    }


    /*
     * Wait for DOM update and highlight.
     */

    setTimeout(
        function() {

            highlightPanchayatGlobalMainBill(
                result
            );

        },
        150
    );

}


/* ============================================================
   OPEN GLOBAL SEARCH RESULT
============================================================ */

async function openPanchayatGlobalSearchResult(
    index,
    fromEnter = false
) {


    const state =
        window.panchayatGlobalSearchState;


    if (
        !state ||
        !Array.isArray(state.results) ||
        !state.results.length
    ) {

        return;

    }


    if (
        index < 0
    ) {

        index =
            state.results.length - 1;

    }


    if (
        index >=
        state.results.length
    ) {

        index = 0;

    }


    state.currentIndex =
        index;


    const result =
        state.results[index];


    console.log(
        "GLOBAL SEARCH → OPEN:",
        result
    );


    /* ========================================================
       TALAPATRAK VILLAGE
    ======================================================== */

    if (
        result.type ===
        "talapatrakVillage"
    ) {

        openPanchayatGlobalTalapatrakVillage(
            result
        );

        return;

    }


    /* ========================================================
       SHIKSHANUPAKARAN VILLAGE
    ======================================================== */

    if (
        result.type ===
        "shikshanupakaranVillage"
    ) {

        openPanchayatGlobalShikshanupakaranVillage(
            result
        );

        return;

    }


    /* ========================================================
       MAIN BILL
    ======================================================== */

    if (
        result.type ===
        "mainBill"
    ) {

        await openPanchayatGlobalMainBill(
            result
        );

        return;

    }


    /* ========================================================
       TALAPATRAK ROW
    ======================================================== */

    if (
        result.type ===
        "talapatrak"
    ) {

        if (
            typeof window.renderTalapatrakPage ===
            "function"
        ) {

            const rowsPerPage =
                Number(
                    window.talapatrakRowsPerPage
                ) || 20;


            const page =
                Math.floor(
                    result.memoryIndex /
                    rowsPerPage
                ) + 1;


            if (
                typeof window.syncCurrentTalapatrakPageToMemory ===
                "function"
            ) {

                window.syncCurrentTalapatrakPageToMemory();

            }


            window.renderTalapatrakPage(
                page
            );


            setTimeout(
                function() {

                    if (
                        typeof highlightPanchayatSearchRow ===
                        "function"
                    ) {

                        highlightPanchayatSearchRow(
                            result.memoryIndex,
                            "talapatrak"
                        );

                    }

                },
                100
            );

        }


        return;

    }


    /* ========================================================
       SHIKSHANUPAKARAN ROW
    ======================================================== */

    if (
        result.type ===
        "shikshanupakaran"
    ) {

        if (
            typeof window.renderShikshanupakaranPage ===
            "function"
        ) {

            const rowsPerPage =
                Number(
                    window.shikshanupakaranRowsPerPage
                ) || 20;


            const page =
                Math.floor(
                    result.memoryIndex /
                    rowsPerPage
                ) + 1;


            if (
                typeof window.syncCurrentShikshanupakaranPageToMemory ===
                "function"
            ) {

                window.syncCurrentShikshanupakaranPageToMemory();

            }


            window.renderShikshanupakaranPage(
                page
            );


            setTimeout(
                function() {

                    if (
                        typeof highlightPanchayatSearchRow ===
                        "function"
                    ) {

                        highlightPanchayatSearchRow(
                            result.memoryIndex,
                            "shikshanupakaran"
                        );

                    }

                },
                100
            );

        }


        return;

    }

}


/* ============================================================
   NEXT GLOBAL RESULT
============================================================ */

function nextPanchayatGlobalSearchResult() {

    const state =p
        window.panchayatGlobalSearchState;


    if (
        !state.results.length
    ) {

        return;

    }


    openPanchayatGlobalSearchResult(
        state.currentIndex + 1
    );

}


/* ============================================================
   PREVIOUS GLOBAL RESULT
============================================================ */

function previousPanchayatGlobalSearchResult() {

    const state =
        window.panchayatGlobalSearchState;


    if (
        !state.results.length
    ) {

        return;

    }


    openPanchayatGlobalSearchResult(
        state.currentIndex - 1
    );

}


/* ============================================================
   CLEAR GLOBAL SEARCH
============================================================ */

function clearPanchayatGlobalSearch() {

    const state =
        window.panchayatGlobalSearchState;


    /*
     * Invalidate every search that is currently running.
     */
    state.searchRequestId =
        (state.searchRequestId || 0) + 1;


    state.query =
        "";

    state.normalizedQuery =
        "";

    state.results =
        [];

    state.currentIndex =
        -1;

    state.active =
        false;
}


/* ============================================================
   GLOBAL SEARCH EVENTS
============================================================ */


function setupPanchayatGlobalSearch() {

    if (
        window.panchayatGlobalSearchReady
    ) {

        return;

    }


    window.panchayatGlobalSearchReady =
        true;


    console.log(
        "GLOBAL SEARCH READY"
    );


    /*
     * ========================================================
     * INPUT
     *
     * Typing OR pasting:
     *
     *     SEARCH
     *     SHOW SUGGESTIONS
     *
     * NEVER OPEN ANY RESULT.
     * ========================================================
     */

    document.addEventListener(
        "input",
        async function(event) {

            const input =
                event.target;


            if (
                !input ||
                input.id !==
                    "panchayatGlobalSearchInput"
            ) {

                return;

            }


            const query =
                input.value.trim();


            /*
             * Empty search
             */

            if (!query) {

                clearPanchayatGlobalSearch();

                return;

            }


            /*
             * Search complete application.
             *
             * This works for:
             *
             * - typing
             * - paste
             * - autofill
             */

            await searchPanchayatGlobalMemory(
                query
            );


            const state =
                window.panchayatGlobalSearchState;


            /*
             * IMPORTANT
             *
             * Every new search starts with
             * NO selected result.
             *
             * We do NOT choose result 0.
             */

            state.currentIndex =
                -1;


            /*
             * Show suggestions ONLY.
             */

            renderPanchayatGlobalSearchResults();

        }
    );


    /*
     * ========================================================
     * KEYBOARD
     * ========================================================
     */

    document.addEventListener(
        "keydown",
        function(event) {

            const input =
                event.target;


            if (
                !input ||
                input.id !==
                    "panchayatGlobalSearchInput"
            ) {

                return;

            }


            const state =
                window.panchayatGlobalSearchState;


            /*
             * =================================================
             * ARROW DOWN
             *
             * Select next suggestion.
             * Does NOT open anything.
             * =================================================
             */

            if (
                event.key ===
                "ArrowDown"
            ) {

                if (
                    !state.results ||
                    !state.results.length
                ) {

                    return;

                }


                event.preventDefault();


                if (
                    state.currentIndex < 0
                ) {

                    state.currentIndex =
                        0;

                }
                else if (
                    state.currentIndex <
                    state.results.length - 1
                ) {

                    state.currentIndex++;

                }
                else {

                    state.currentIndex =
                        0;

                }


                renderPanchayatGlobalSearchResults();


                return;

            }


            /*
             * =================================================
             * ARROW UP
             *
             * Select previous suggestion.
             * Does NOT open anything.
             * =================================================
             */

            if (
                event.key ===
                "ArrowUp"
            ) {

                if (
                    !state.results ||
                    !state.results.length
                ) {

                    return;

                }


                event.preventDefault();


                if (
                    state.currentIndex < 0
                ) {

                    state.currentIndex =
                        state.results.length - 1;

                }
                else if (
                    state.currentIndex >
                    0
                ) {

                    state.currentIndex--;

                }
                else {

                    state.currentIndex =
                        state.results.length - 1;

                }


                renderPanchayatGlobalSearchResults();


                return;

            }


            /*
             * =================================================
             * ENTER
             *
             * ENTER OPENS ONLY THE RESULT THAT
             * USER HAS SELECTED.
             *
             * IMPORTANT:
             *
             * If currentIndex === -1,
             * DO NOTHING.
             *
             * This prevents:
             *
             * paste → Enter → first result opens
             * =================================================
             */

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();


                /*
                 * No result selected.
                 *
                 * DO NOT OPEN RESULT #0.
                 */

                if (
                    state.currentIndex < 0
                ) {

                    console.log(
                        "GLOBAL SEARCH: Enter pressed but no result is selected."
                    );

                    return;

                }


                /*
                 * Make sure selected result
                 * still exists.
                 */

                if (
                    !state.results ||
                    !state.results[
                        state.currentIndex
                    ]
                ) {

                    return;

                }


                /*
                 * Shift + Enter
                 *
                 * Move to previous result first.
                 */

                if (
                    event.shiftKey
                ) {

                    if (
                        state.currentIndex <=
                        0
                    ) {

                        state.currentIndex =
                            state.results.length - 1;

                    }
                    else {

                        state.currentIndex--;

                    }

                }


                /*
                 * OPEN ONLY THE SELECTED RESULT.
                 */

                openPanchayatGlobalSearchResult(
                    state.currentIndex
                );


                return;

            }


            /*
             * =================================================
             * ESCAPE
             * =================================================
             */

            if (
                event.key ===
                "Escape"
            ) {

                event.preventDefault();


                clearPanchayatGlobalSearch();

                return;

            }

        }
    );


    /*
     * ========================================================
     * CLICK RESULT
     *
     * Clicking a suggestion ONLY SELECTS it.
     *
     * It does NOT open it.
     *
     * User can then press ENTER.
     * ========================================================
     */

    document.addEventListener(
        "click",
        async function(event) {

            const resultElement =
                event.target.closest(
                    ".panchayatGlobalSearchResult"
                );


            if (!resultElement) {

                return;

            }


            const index =
                Number(
                    resultElement.dataset.index
                );


            const state =
                window.panchayatGlobalSearchState;


            if (
                Number.isNaN(index) ||
                !state.results ||
                !state.results[index]
            ) {

                return;

            }


            /*
            * Save the actual result BEFORE clearing.
            */
            const selectedResult =
                state.results[index];


            console.log(
                "GLOBAL SEARCH → CLICK OPEN:",
                selectedResult
            );


            /*
            * Clear immediately.
            */
            clearPanchayatGlobalSearch();


            /*
            * Open the selected result.
            */
            await openPanchayatGlobalSearchResultObject(
                selectedResult
            );


            /*
            * IMPORTANT
            *
            * Opening Shikshanupakaran/Talapatrak can trigger
            * rendering/navigation code after the first clear.
            *
            * Clear AGAIN after the opening process has completed.
            */
            clearPanchayatGlobalSearch();


            /*
            * Final safety reset after DOM/rendering settles.
            */
            setTimeout(
                function() {

                    clearPanchayatGlobalSearch();


                    const input =
                        document.getElementById(
                            "panchayatGlobalSearchInput"
                        );


                    if (input) {

                        input.value =
                            "";

                    }


                    const container =
                        document.getElementById(
                            "panchayatGlobalSearchResults"
                        );


                    if (container) {

                        container.innerHTML =
                            "";

                        container.style.display =
                            "none";

                    }


                    console.log(
                        "GLOBAL SEARCH → FINAL RESET COMPLETE"
                    );

                },
                100
            );

        }
    );


    /*
     * ========================================================
     * CLICK OUTSIDE SEARCH BOX
     *
     * Hide dropdown but keep query.
     * ========================================================
     */

    document.addEventListener(
        "click",
        function(event) {

            const searchBox =
                event.target.closest(
                    ".searchBox"
                );

            const resultElement =
                event.target.closest(
                    ".panchayatGlobalSearchResult"
                );

            /*
            * Clicking inside search box:
            * keep suggestions visible.
            */
            if (searchBox) {
                return;
            }

            /*
            * Clicking a suggestion:
            * do NOT hide dropdown before
            * the result handler processes it.
            */
            if (resultElement) {
                return;
            }

            const container =
                document.getElementById(
                    "panchayatGlobalSearchResults"
                );

            if (container) {

                container.style.display =
                    "none";

            }

        }
    );

}



async function openPanchayatGlobalSearchResultObject(
    result
) {

    if (!result) {

        return;

    }


    console.log(
        "GLOBAL SEARCH → OPEN SELECTED RESULT:",
        result
    );


    /*
     * ========================================================
     * TALAPATRAK VILLAGE
     * ========================================================
     */

    if (
        result.type ===
        "talapatrakVillage"
    ) {

        openPanchayatGlobalTalapatrakVillage(
            result
        );

        return;

    }


    /*
     * ========================================================
     * SHIKSHANUPAKARAN VILLAGE
     * ========================================================
     */

    if (
        result.type ===
        "shikshanupakaranVillage"
    ) {

        openPanchayatGlobalShikshanupakaranVillage(
            result
        );

        return;

    }


    /*
     * ========================================================
     * MAIN BILL
     * ========================================================
     */

    if (
        result.type ===
        "mainBill"
    ) {

        await openPanchayatGlobalMainBill(
            result
        );

        return;

    }


    /*
     * ========================================================
     * TALAPATRAK ROW
     * ========================================================
     */

    if (
        result.type ===
        "talapatrak"
    ) {

        if (
            typeof window.renderTalapatrakPage ===
            "function"
        ) {

            const rowsPerPage =
                Number(
                    window.talapatrakRowsPerPage
                ) || 20;


            const page =
                Math.floor(
                    result.memoryIndex /
                    rowsPerPage
                ) + 1;


            if (
                typeof window.syncCurrentTalapatrakPageToMemory ===
                "function"
            ) {

                window.syncCurrentTalapatrakPageToMemory();

            }


            window.renderTalapatrakPage(
                page
            );


            setTimeout(
                function() {

                    if (
                        typeof highlightPanchayatSearchRow ===
                        "function"
                    ) {

                        highlightPanchayatSearchRow(
                            result.memoryIndex,
                            "talapatrak"
                        );

                    }

                },
                100
            );

        }

        return;

    }


    /*
     * ========================================================
     * SHIKSHANUPAKARAN ROW
     * ========================================================
     */

    if (
        result.type ===
        "shikshanupakaran"
    ) {

        if (
            typeof window.renderShikshanupakaranPage ===
            "function"
        ) {

            const rowsPerPage =
                Number(
                    window.shikshanupakaranRowsPerPage
                ) || 20;


            const page =
                Math.floor(
                    result.memoryIndex /
                    rowsPerPage
                ) + 1;


            if (
                typeof window.syncCurrentShikshanupakaranPageToMemory ===
                "function"
            ) {

                window.syncCurrentShikshanupakaranPageToMemory();

            }


            window.renderShikshanupakaranPage(
                page
            );


            setTimeout(
                function() {

                    if (
                        typeof highlightPanchayatSearchRow ===
                        "function"
                    ) {

                        highlightPanchayatSearchRow(
                            result.memoryIndex,
                            "shikshanupakaran"
                        );

                    }

                },
                100
            );

        }

        return;

    }

}



/* ============================================================
   CTRL + F
============================================================ */

function setupPanchayatGlobalSearchKeyboard() {

    if (
        window.panchayatGlobalSearchKeyboardReady
    ) {

        return;

    }


    window.panchayatGlobalSearchKeyboardReady =
        true;


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                !event.ctrlKey ||
                event.key.toLowerCase() !==
                    "f"
            ) {

                return;

            }


            /*
             * If already inside editor row search,
             * leave Ctrl+F to the existing editor
             * search engine.
             */

            if (
                event.target &&
                event.target.matches(
                    "#talapatrakRowSearchInput, #shikshanupakaranRowSearchInput"
                )
            ) {

                return;

            }


            event.preventDefault();


            const input =
                document.getElementById(
                    "panchayatGlobalSearchInput"
                );


            if (!input) {

                return;

            }


            input.focus();

            input.select();

        }
    );

}


/* ============================================================
   INITIALIZE GLOBAL SEARCH
============================================================ */

function initializePanchayatGlobalSearch() {

    setupPanchayatGlobalSearch();

    setupPanchayatGlobalSearchKeyboard();

}


/* ============================================================
   DOM READY
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializePanchayatGlobalSearch
    );

}
else {

    initializePanchayatGlobalSearch();

} 


/* ============================================================
   END GLOBAL SEARCH
============================================================ */
