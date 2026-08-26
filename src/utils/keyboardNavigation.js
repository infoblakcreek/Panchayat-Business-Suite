/* ============================================================
   PANCHAYAT BUSINESS SUITE
   SHARED KEYBOARD NAVIGATION
   ============================================================

   Reusable Excel-like keyboard navigation system.

   This file is intentionally editor-independent.

   Editors such as:

   - Shikshanupakaran
   - Talapatrak
   - Future table editors

   can register their table/container with this system.

   Supported navigation:

   ↑ / ↓
   ← / →
   Tab
   Shift + Tab
   Enter
   Shift + Enter

   Later additions:

   Home
   Ctrl + Home
   Ctrl + End
   Page Up
   Page Down
   F2
   Escape
   Delete
   Ctrl + F

   IMPORTANT:
   ------------------------------------------------------------
   This is a classic JavaScript file.
   No ES modules are used.
   ============================================================ */


/* ============================================================
   GLOBAL STORAGE
============================================================ */

/*
 * Stores all registered keyboard-navigation containers.
 *
 * Example:
 *
 * Shikshanupakaran table
 * Talapatrak table
 * Future editor table
 *
 */

const keyboardNavigationContainers = [];


/* ============================================================
   REGISTER CONTAINER
============================================================ */

/**
 * Register an editor/container for keyboard navigation.
 *
 * @param {HTMLElement} container
 * @param {Object} options
 *
 * Example:
 *
 * registerKeyboardNavigation(
 *     document.getElementById("shikshanupakaranBody"),
 *     {
 *         inputSelector: ".shikshanupakaranInput"
 *     }
 * );
 *
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

                return item.container === container;

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

            onLastCellEnter:
                options.onLastCellEnter ||
                null

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

/**
 * Return all visible form controls that participate
 * in keyboard navigation.
 *
 * IMPORTANT:
 * ------------------------------------------------------------
 * readonly and disabled cells are NOT excluded.
 *
 * They are still navigable, just not editable.
 */

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
   FIND CURRENT INPUT INDEX
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


    /*
     * Focus the target cell.
     */

    input.focus();


    /*
     * Put cursor at the end of the value.
     *
     * We deliberately do NOT select the entire value.
     *
     * This makes navigation feel natural when the user
     * starts typing.
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
         * Some input types may not support
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


    if (currentIndex === -1) {

        return;

    }


    const targetIndex =
        currentIndex + direction;


    /*
     * Stay inside the current row.
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


    const allRows =
        Array.from(
            configuration.container.querySelectorAll(
                "tr"
            )
        );


    const visibleRows =
        allRows.filter(
            function(row) {

                return row.offsetParent !== null;

            }
        );


    const currentRowIndex =
        visibleRows.indexOf(
            currentRow
        );


    if (currentRowIndex === -1) {

        return;

    }


    const targetRowIndex =
        currentRowIndex + direction;


    /*
     * Stay inside the available rows.
     */

    if (
        targetRowIndex < 0 ||
        targetRowIndex >= visibleRows.length
    ) {

        return;

    }


    const targetRow =
        visibleRows[targetRowIndex];


    const currentRowInputs =
        getRowNavigableInputs(
            configuration,
            currentRow
        );


    const currentColumnIndex =
        currentRowInputs.indexOf(
            currentInput
        );

        if (firstCell) {

            const targetRowInputs =
                getRowNavigableInputs(
                    configuration,
                    targetRow
                );


            if (
                targetRowInputs.length > 0
            ) {

                focusKeyboardInput(
                    targetRowInputs[0]
                );

            }

            return;

        }


    if (
        currentColumnIndex === -1
    ) {

        return;

    }


    const targetRowInputs =
        getRowNavigableInputs(
            configuration,
            targetRow
        );


    /*
     * Keep the same column whenever possible.
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
     * If the target row has fewer editable
     * cells, use its last editable cell.
     */

    if (
        targetRowInputs.length > 0
    ) {

        focusKeyboardInput(
            targetRowInputs[
                targetRowInputs.length - 1
            ]
        );

    }

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


    if (currentIndex === -1) {

        return;

    }


    const targetIndex =
        currentIndex + direction;


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
   HANDLE KEYBOARD EVENT
============================================================ */

function handleKeyboardNavigationKeydown(
    event
) {

    const target =
        event.target;


    /*
     * We only care about form controls.
     */

    if (
        !target ||
        !(
            target.matches(
                "input, textarea, select"
            )
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


    /*
     * IMPORTANT:
     *
     * If the user is typing inside a text input,
     * ArrowLeft / ArrowRight should continue behaving
     * normally when the cursor is inside the text.
     *
     * We only perform cell navigation when the cursor
     * is at the appropriate edge of the input.
     */

    if (
        event.key === "ArrowLeft"
    ) {

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


    if (
        event.key === "ArrowRight"
    ) {

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


    /*
     * Up / Down.
     *
     * These move between table cells.
     */

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


    /*
     * TAB
     */

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


    /* ============================================================
        ENTER
        ============================================================ */

        if (
            event.key === "Enter"
                ) {

                    if (
                        event.ctrlKey ||
                        event.altKey ||
                        event.metaKey
                    ) {

                        return;

                    }

                    event.preventDefault();


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


                    /*
                    * NORMAL ENTER
                    *
                    * Move to next cell in same row.
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
                    * ENTER ON LAST CELL
                    *
                    * Move to FIRST cell of next row.
                    */

                    if (
                        !event.shiftKey &&
                        currentIndex ===
                        rowInputs.length - 1
                    ) {

                        moveKeyboardVertical(
                            target,
                            1,
                            configuration,
                            true
                        );

                        return;

                    }


                    /*
                    * SHIFT + ENTER
                    *
                    * Move to previous row,
                    * same column.
                    */

                    if (event.shiftKey) {

                        moveKeyboardVertical(
                            target,
                            -1,
                            configuration
                        );

                        return;

                    }

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