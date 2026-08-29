/* ============================================================
   PANCHAYAT BUSINESS SUITE
   SHARED KEYBOARD NAVIGATION
   ============================================================

   Reusable Excel-like keyboard navigation system.

   Supported:

   ↑ / ↓
   ← / →
   Tab
   Shift + Tab
   Enter
   Shift + Enter

   Home
   End
   Ctrl + Home
   Ctrl + End

   Page Up
   Page Down

   Future:

   F2
   Escape
   Delete
   Backspace
   Ctrl + Z
   Ctrl + Y
   Ctrl + C
   Ctrl + X
   Ctrl + V
   Ctrl + F

   IMPORTANT
   ------------------------------------------------------------
   This file is editor-independent.

   Talapatrak and Shikshanupakaran can register callbacks
   for pagination-specific behavior.
============================================================ */


/* ============================================================
   GLOBAL STORAGE
============================================================ */

const keyboardNavigationContainers = [];


/* ============================================================
   REGISTER CONTAINER
============================================================ */

/**
 * Register an editor/container for keyboard navigation.
 *
 * Supported options:
 *
 * inputSelector
 *
 * onPageUp
 * onPageDown
 * onCtrlHome
 * onCtrlEnd
 *
 * These callbacks allow editors with pagination to control
 * movement across pages without putting editor-specific
 * logic inside this shared navigation file.
 */

function registerKeyboardNavigation(
    container,
    options = {}
) {

    if (!container) {

        console.warn(
            "KEYBOARD NAVIGATION: Container not found."
        );

        return;

    }


    /*
     * Prevent duplicate registration.
     */

    const alreadyRegistered =
        keyboardNavigationContainers.some(
            function(item) {

                return (
                    item.container === container
                );

            }
        );


    if (alreadyRegistered) {

        return;

    }


    const configuration = {

        container: container,

        inputSelector:
            options.inputSelector ||
            "input",

        onPageUp:
            typeof options.onPageUp === "function"
                ? options.onPageUp
                : null,

        onPageDown:
            typeof options.onPageDown === "function"
                ? options.onPageDown
                : null,

        onCtrlHome:
            typeof options.onCtrlHome === "function"
                ? options.onCtrlHome
                : null,

        onCtrlEnd:
            typeof options.onCtrlEnd === "function"
                ? options.onCtrlEnd
                : null

    };


    keyboardNavigationContainers.push(
        configuration
    );


    console.log(
        "KEYBOARD NAVIGATION REGISTERED:",
        container
    );

}


/* ============================================================
   FIND REGISTERED CONTAINER
============================================================ */

function getKeyboardNavigationContainer(
    element
) {

    if (!element) {

        return null;

    }


    for (
        let i = 0;
        i < keyboardNavigationContainers.length;
        i++
    ) {

        const configuration =
            keyboardNavigationContainers[i];


        if (
            configuration.container.contains(
                element
            )
        ) {

            return configuration;

        }

    }


    return null;

}


/* ============================================================
   GET NAVIGABLE INPUTS
============================================================ */

function getNavigableInputs(
    configuration
) {

    if (!configuration) {

        return [];

    }


    const inputs =
        Array.from(
            configuration.container.querySelectorAll(
                configuration.inputSelector
            )
        );


    return inputs.filter(
        function(input) {

            return (
                input.offsetParent !== null
            );

        }
    );

}


/* ============================================================
   GET CURRENT INPUT INDEX
============================================================ */

function getCurrentInputIndex(
    inputs,
    currentInput
) {

    return inputs.indexOf(
        currentInput
    );

}


/* ============================================================
   FOCUS INPUT
============================================================ */

function focusKeyboardInput(
    input
) {

    if (!input) {

        return;

    }


    input.focus();


    /*
     * Put cursor at the end.
     */

    try {

        const length =
            input.value.length;


        input.setSelectionRange(
            length,
            length
        );

    }

    catch(error) {

        /*
         * Some input types do not support
         * setSelectionRange.
         */

    }

}


/* ============================================================
   GET ROW
============================================================ */

function getKeyboardRow(
    input
) {

    if (!input) {

        return null;

    }


    return input.closest(
        "tr"
    );

}


/* ============================================================
   GET ROW NAVIGABLE INPUTS
============================================================ */

function getRowNavigableInputs(
    configuration,
    row
) {

    if (
        !configuration ||
        !row
    ) {

        return [];

    }


    const inputs =
        Array.from(
            row.querySelectorAll(
                configuration.inputSelector
            )
        );


    return inputs.filter(
        function(input) {

            return (
                input.offsetParent !== null
            );

        }
    );

}


/* ============================================================
   GET VISIBLE ROWS
============================================================ */

function getVisibleKeyboardRows(
    configuration
) {

    if (!configuration) {

        return [];

    }


    const rows =
        Array.from(
            configuration.container.querySelectorAll(
                "tr"
            )
        );


    return rows.filter(
        function(row) {

            return (
                row.offsetParent !== null
            );

        }
    );

}


/* ============================================================
   MOVE HORIZONTALLY
============================================================ */

function moveKeyboardHorizontal(
    currentInput,
    direction,
    configuration
) {

    const row =
        getKeyboardRow(
            currentInput
        );


    if (!row) {

        return;

    }


    const rowInputs =
        getRowNavigableInputs(
            configuration,
            row
        );


    const currentIndex =
        rowInputs.indexOf(
            currentInput
        );


    if (
        currentIndex === -1
    ) {

        return;

    }


    let targetIndex =
    currentIndex +
    direction;


    /*
    * Skip readonly cells.
    */

    while (
        targetIndex >= 0 &&
        targetIndex < rowInputs.length &&
        rowInputs[targetIndex].readOnly
    ) {

        targetIndex += direction;

    }


    /*
    * Stay inside current row.
    */

    if (
        targetIndex < 0 ||
        targetIndex >= rowInputs.length
    ) {

        return;

    }


    focusKeyboardInput(
        rowInputs[targetIndex]
    );

}


/* ============================================================
   MOVE VERTICALLY
============================================================ */

function moveKeyboardVertical(
    currentInput,
    direction,
    configuration,
    firstCell = false
) {

    const currentRow =
        getKeyboardRow(
            currentInput
        );


    if (!currentRow) {

        return;

    }


    const visibleRows =
        getVisibleKeyboardRows(
            configuration
        );


    const currentRowIndex =
        visibleRows.indexOf(
            currentRow
        );


    if (
        currentRowIndex === -1
    ) {

        return;

    }


    const targetRowIndex =
        currentRowIndex +
        direction;


    /*
     * Stay inside available rows.
     */

    if (
        targetRowIndex < 0 ||
        targetRowIndex >= visibleRows.length
    ) {

        return;

    }


    const targetRow =
        visibleRows[
            targetRowIndex
        ];


    const targetRowInputs =
        getRowNavigableInputs(
            configuration,
            targetRow
        );


    if (
        targetRowInputs.length === 0
    ) {

        return;

    }


    /*
     * Enter on last cell:
     *
     * first cell of next row.
     */

    if (firstCell) {

        focusKeyboardInput(
            targetRowInputs[0]
        );

        return;

    }


    const currentRowInputs =
        getRowNavigableInputs(
            configuration,
            currentRow
        );


    const currentColumnIndex =
        currentRowInputs.indexOf(
            currentInput
        );


    if (
        currentColumnIndex === -1
    ) {

        return;

    }


    /*
     * Keep same column.
     */

    if (
        currentColumnIndex <
        targetRowInputs.length
    ) {

        focusKeyboardInput(
            targetRowInputs[
                currentColumnIndex
            ]
        );

        return;

    }


    /*
     * If target row has fewer cells,
     * use its last cell.
     */

    focusKeyboardInput(
        targetRowInputs[
            targetRowInputs.length - 1
        ]
    );

}


/* ============================================================
   MOVE TAB
============================================================ */

function moveKeyboardTab(
    currentInput,
    direction,
    configuration
) {

    const inputs =
        getNavigableInputs(
            configuration
        );


    const currentIndex =
        getCurrentInputIndex(
            inputs,
            currentInput
        );


    if (
        currentIndex === -1
    ) {

        return;

    }


    const targetIndex =
        currentIndex +
        direction;


    if (
        targetIndex < 0 ||
        targetIndex >= inputs.length
    ) {

        return;

    }


    focusKeyboardInput(
        inputs[targetIndex]
    );

}


/* ============================================================
   FIND FIRST CELL
============================================================ */

function focusFirstKeyboardCell(
    configuration
) {

    const rows =
        getVisibleKeyboardRows(
            configuration
        );


    if (
        rows.length === 0
    ) {

        return;

    }


    const firstRowInputs =
        getRowNavigableInputs(
            configuration,
            rows[0]
        );


    if (
        firstRowInputs.length === 0
    ) {

        return;

    }


    focusKeyboardInput(
        firstRowInputs[0]
    );

}


/* ============================================================
   FIND LAST CELL
============================================================ */

function focusLastKeyboardCell(
    configuration
) {

    const rows =
        getVisibleKeyboardRows(
            configuration
        );


    if (
        rows.length === 0
    ) {

        return;

    }


    const lastRow =
        rows[
            rows.length - 1
        ];


    const lastRowInputs =
        getRowNavigableInputs(
            configuration,
            lastRow
        );


    if (
        lastRowInputs.length === 0
    ) {

        return;

    }


    focusKeyboardInput(
        lastRowInputs[
            lastRowInputs.length - 1
        ]
    );

}


/* ============================================================
   GET CURRENT COLUMN
============================================================ */

function getKeyboardColumnIndex(
    currentInput,
    configuration
) {

    const row =
        getKeyboardRow(
            currentInput
        );


    if (!row) {

        return -1;

    }


    const rowInputs =
        getRowNavigableInputs(
            configuration,
            row
        );


    return rowInputs.indexOf(
        currentInput
    );

}


/* ============================================================
   PAGE NAVIGATION FALLBACK
============================================================ */

/*
 * This function handles Page Up / Page Down when an editor
 * has NOT provided its own pagination callback.
 *
 * It moves by the number of currently visible rows.
 */

function moveKeyboardByVisiblePage(
    currentInput,
    direction,
    configuration
) {

    const currentRow =
        getKeyboardRow(
            currentInput
        );


    if (!currentRow) {

        return;

    }


    const rows =
        getVisibleKeyboardRows(
            configuration
        );


    const currentRowIndex =
        rows.indexOf(
            currentRow
        );


    if (
        currentRowIndex === -1
    ) {

        return;

    }


    /*
     * Number of rows currently visible.
     */

    const pageSize =
        rows.length;


    if (
        pageSize <= 0
    ) {

        return;

    }


    const targetRowIndex =
        Math.max(
            0,
            Math.min(
                rows.length - 1,
                currentRowIndex +
                (
                    direction *
                    pageSize
                )
            )
        );


    /*
     * If already at boundary,
     * do nothing.
     */

    if (
        targetRowIndex ===
        currentRowIndex
    ) {

        return;

    }


    const targetRow =
        rows[
            targetRowIndex
        ];


    const targetInputs =
        getRowNavigableInputs(
            configuration,
            targetRow
        );


    if (
        targetInputs.length === 0
    ) {

        return;

    }


    const columnIndex =
        getKeyboardColumnIndex(
            currentInput,
            configuration
        );


    const targetColumn =
        Math.min(
            Math.max(
                columnIndex,
                0
            ),
            targetInputs.length - 1
        );


    focusKeyboardInput(
        targetInputs[
            targetColumn
        ]
    );

}


/* ============================================================
   HANDLE ENTER
============================================================ */

function handleKeyboardEnter(
    event,
    target,
    configuration
) {

    const row =
        getKeyboardRow(
            target
        );


    if (!row) {

        return;

    }


    const rowInputs =
        getRowNavigableInputs(
            configuration,
            row
        );


    const currentIndex =
        rowInputs.indexOf(
            target
        );


    if (
        currentIndex === -1
    ) {

        return;

    }


    /*
     * Normal Enter:
     *
     * Move to next cell.
     */

    if (
        !event.shiftKey &&
        currentIndex <
        rowInputs.length - 1
    ) {

        focusKeyboardInput(
            rowInputs[
                currentIndex + 1
            ]
        );

        return;

    }


    /*
     * Enter on last cell:
     *
     * First cell of next row.
     *
     * NEVER create a new row here.
     */

    if (
        !event.shiftKey &&
        currentIndex ===
        rowInputs.length - 1
    ) {

        const rows =
            getVisibleKeyboardRows(
                configuration
            );


        const currentRowIndex =
            rows.indexOf(
                row
            );


        const nextRow =
            rows[
                currentRowIndex + 1
            ];


        if (!nextRow) {

            /*
             * Last visible row.
             *
             * Do nothing.
             *
             * The editor itself can decide whether
             * it wants to handle this situation.
             */

            return;

        }


        const nextRowInputs =
            getRowNavigableInputs(
                configuration,
                nextRow
            );


        if (
            nextRowInputs.length > 0
        ) {

            focusKeyboardInput(
                nextRowInputs[0]
            );

        }


        return;

    }


    /*
     * Shift + Enter:
     *
     * Previous row, same column.
     */

    if (
        event.shiftKey
    ) {

        moveKeyboardVertical(
            target,
            -1,
            configuration
        );

    }

}


/* ============================================================
   HANDLE HOME
============================================================ */

function handleKeyboardHome(
    event,
    target,
    configuration
) {

    /*
     * Ctrl + Home
     *
     * Let the editor handle pagination if
     * a callback exists.
     */

    if (
        event.ctrlKey ||
        event.metaKey
    ) {

        if (
            configuration.onCtrlHome
        ) {

            const handled =
                configuration.onCtrlHome(
                    {
                        event:
                            event,

                        target:
                            target,

                        configuration:
                            configuration
                    }
                );


            if (
                handled !== false
            ) {

                return;

            }

        }


        /*
         * Fallback:
         *
         * first visible row,
         * first cell.
         */

        focusFirstKeyboardCell(
            configuration
        );


        return;

    }


    /*
     * Normal Home:
     *
     * first cell of current row.
     */

    const row =
        getKeyboardRow(
            target
        );


    if (!row) {

        return;

    }


    const rowInputs =
        getRowNavigableInputs(
            configuration,
            row
        );


    if (
        rowInputs.length === 0
    ) {

        return;

    }


    focusKeyboardInput(
        rowInputs[0]
    );

}


/* ============================================================
   HANDLE END
============================================================ */

function handleKeyboardEnd(
    event,
    target,
    configuration
) {

    /*
     * Ctrl + End
     *
     * Let editor handle pagination if
     * callback exists.
     */

    if (
        event.ctrlKey ||
        event.metaKey
    ) {

        if (
            configuration.onCtrlEnd
        ) {

            const handled =
                configuration.onCtrlEnd(
                    {
                        event:
                            event,

                        target:
                            target,

                        configuration:
                            configuration
                    }
                );


            if (
                handled !== false
            ) {

                return;

            }

        }


        /*
         * Fallback:
         *
         * last visible row,
         * last cell.
         */

        focusLastKeyboardCell(
            configuration
        );


        return;

    }


    /*
     * Normal End:
     *
     * last cell of current row.
     */

    const row =
        getKeyboardRow(
            target
        );


    if (!row) {

        return;

    }


    const rowInputs =
        getRowNavigableInputs(
            configuration,
            row
        );


    if (
        rowInputs.length === 0
    ) {

        return;

    }


    focusKeyboardInput(
        rowInputs[
            rowInputs.length - 1
        ]
    );

}


/* ============================================================
   HANDLE PAGE UP
============================================================ */

function handleKeyboardPageUp(
    event,
    target,
    configuration
) {

    /*
     * If editor provides a callback,
     * let it handle pagination.
     */

    if (
        configuration.onPageUp
    ) {

        const handled =
            configuration.onPageUp(
                {
                    event:
                        event,

                    target:
                        target,

                    configuration:
                        configuration
                }
            );


        if (
            handled !== false
        ) {

            return;

        }

    }


    /*
     * Fallback:
     *
     * move inside visible rows.
     */

    moveKeyboardByVisiblePage(
        target,
        -1,
        configuration
    );

}


/* ============================================================
   HANDLE PAGE DOWN
============================================================ */

function handleKeyboardPageDown(
    event,
    target,
    configuration
) {

    /*
     * If editor provides a callback,
     * let it handle pagination.
     */

    if (
        configuration.onPageDown
    ) {

        const handled =
            configuration.onPageDown(
                {
                    event:
                        event,

                    target:
                        target,

                    configuration:
                        configuration
                }
            );


        if (
            handled !== false
        ) {

            return;

        }

    }


    /*
     * Fallback:
     *
     * move inside visible rows.
     */

    moveKeyboardByVisiblePage(
        target,
        1,
        configuration
    );

}


/* ============================================================
   HANDLE KEYBOARD EVENT
============================================================ */

function handleKeyboardNavigationKeydown(
    event
) {

    const target =
        event.target;


    /*
     * Only form controls.
     */

    if (
        !target ||
        !target.matches(
            "input, textarea, select"
        )
    ) {

        return;

    }


    const configuration =
        getKeyboardNavigationContainer(
            target
        );


    if (!configuration) {

        return;

    }


    /* ========================================================
       ARROW LEFT
    ======================================================== */

    if (
        event.key === "ArrowLeft"
    ) {

        /*
         * Allow normal cursor movement
         * inside text.
         */

        if (
            target.selectionStart !== 0
        ) {

            return;

        }


        event.preventDefault();


        moveKeyboardHorizontal(
            target,
            -1,
            configuration
        );


        return;

    }


    /* ========================================================
       ARROW RIGHT
    ======================================================== */

    if (
        event.key === "ArrowRight"
    ) {

        /*
         * Allow normal cursor movement
         * inside text.
         */

        if (
            target.selectionEnd !==
            target.value.length
        ) {

            return;

        }


        event.preventDefault();


        moveKeyboardHorizontal(
            target,
            1,
            configuration
        );


        return;

    }


    /* ========================================================
       ARROW UP
    ======================================================== */

    if (
        event.key === "ArrowUp"
    ) {

        event.preventDefault();


        moveKeyboardVertical(
            target,
            -1,
            configuration
        );


        return;

    }


    /* ========================================================
       ARROW DOWN
    ======================================================== */

    if (
        event.key === "ArrowDown"
    ) {

        event.preventDefault();


        moveKeyboardVertical(
            target,
            1,
            configuration
        );


        return;

    }


    /* ========================================================
       TAB
    ======================================================== */

    if (
        event.key === "Tab"
    ) {

        event.preventDefault();


        moveKeyboardTab(
            target,
            event.shiftKey
                ? -1
                : 1,
            configuration
        );


        return;

    }


    /* ========================================================
       ENTER
    ======================================================== */

    if (
        event.key === "Enter"
    ) {

        /*
         * Do not hijack:
         *
         * Ctrl + Enter
         * Alt + Enter
         * Cmd + Enter
         */

        if (
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {

            return;

        }


        event.preventDefault();


        handleKeyboardEnter(
            event,
            target,
            configuration
        );


        return;

    }


    /* ========================================================
       HOME
    ======================================================== */

    if (
        event.key === "Home"
    ) {

        event.preventDefault();


        handleKeyboardHome(
            event,
            target,
            configuration
        );


        return;

    }


    /* ========================================================
       END
    ======================================================== */

    if (
        event.key === "End"
    ) {

        event.preventDefault();


        handleKeyboardEnd(
            event,
            target,
            configuration
        );


        return;

    }


    /* ========================================================
       PAGE UP
    ======================================================== */

    if (
        event.key === "PageUp"
    ) {

        event.preventDefault();


        handleKeyboardPageUp(
            event,
            target,
            configuration
        );


        return;

    }


    /* ========================================================
       PAGE DOWN
    ======================================================== */

    if (
        event.key === "PageDown"
    ) {

        event.preventDefault();


        handleKeyboardPageDown(
            event,
            target,
            configuration
        );


        return;

    }

}


/* ============================================================
   GLOBAL EVENT DELEGATION
============================================================ */

document.addEventListener(
    "keydown",
    handleKeyboardNavigationKeydown
);


/* ============================================================
   INITIALIZATION MESSAGE
============================================================ */

console.log(
    "KEYBOARD NAVIGATION MODULE LOADED"
);