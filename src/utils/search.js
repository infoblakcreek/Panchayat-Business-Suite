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