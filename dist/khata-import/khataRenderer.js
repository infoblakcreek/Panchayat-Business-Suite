/* ============================================================
   KHATA RENDERER
   ============================================================

   Responsible for:

   - Receiving parsed Khata records
   - Detecting active editor
   - Mapping Khata number → Column A
   - Mapping FIRST holder name → Column B
   - Filling missing Khata numbers automatically
   - Progressive rendering
   - Import cancellation
   - Restoring editor to its PRE-IMPORT state on cancellation

   NOT responsible for:

   - File selection
   - PDF reading
   - OCR
   - Parsing
   - Firebase saving
============================================================ */


/* ============================================================
   MODULE LOADED
============================================================ */

console.log("Khata Renderer module loaded");


/* ============================================================
   IMPORT STATE
============================================================ */

window.khataImportInProgress =
    false;

window.khataImportCancelled =
    false;

window.khataScanCancelled =
    false;

window.khataImportDebugCounter =
    0;


/* ============================================================
   PRE-IMPORT EDITOR SNAPSHOT
============================================================

   This stores the editor exactly as it was BEFORE Khata import.

   If Cancel is pressed:

       imported rows are removed
       previous rows are restored
============================================================ */

window.khataEditorSnapshot =
    null;


/* ============================================================
   GET EDITOR BODY
============================================================ */

function getKhataEditorBody(
    editorType
) {

    if (
        editorType === "talapatrak"
    ) {

        return document.getElementById(
            "talapatrakBody"
        );

    }


    if (
        editorType === "shikshanupakaran"
    ) {

        return document.getElementById(
            "shikshanupakaranBody"
        );

    }


    return null;

}


/* ============================================================
   SAVE PRE-IMPORT EDITOR STATE
============================================================ */

function saveKhataEditorSnapshot(editorType) {

    const body =
        getKhataEditorBody(editorType);

    if (!body) {

        console.warn(
            "Cannot save Khata editor snapshot. Body not found."
        );

        return false;

    }


    window.khataEditorSnapshot = {

        editorType:
            editorType,

        html:
            body.innerHTML,

        shikshanupakaranRows:
            editorType === "shikshanupakaran"
                ? (
                    Array.isArray(
                        window.shikshanupakaranAllRows
                    )
                        ? window.shikshanupakaranAllRows.map(
                            function(rowData) {

                                return {
                                    ...rowData
                                };

                            }
                        )
                        : []
                )
                : null

    };


    console.log(
        "Khata editor PRE-IMPORT snapshot saved."
    );


    if (
        editorType ===
        "shikshanupakaran"
    ) {

        console.log(
            "Shikshanupakaran memory snapshot rows:",
            window.khataEditorSnapshot
                .shikshanupakaranRows
                .length
        );

    }


    return true;

}


/* ============================================================
   RESTORE PRE-IMPORT EDITOR STATE
============================================================ */

function restoreKhataEditorSnapshot() {

    const snapshot =
        window.khataEditorSnapshot;


    if (!snapshot) {

        console.warn(
            "No Khata editor snapshot available to restore."
        );

        return false;

    }


    /* ========================================================
       SHIKSHANUPAKARAN
       
       Restore MEMORY first.
       Then rebuild the DOM using the ORIGINAL
       createShikshanupakaranRow().
    ======================================================== */

    if (
        snapshot.editorType ===
        "shikshanupakaran"
    ) {

        window.shikshanupakaranAllRows =
            Array.isArray(
                snapshot.shikshanupakaranRows
            )

                ? snapshot.shikshanupakaranRows.map(
                    function(rowData) {

                        return {
                            ...rowData
                        };

                    }
                )

                : [];


        console.log(
            "SHIKSHANUPAKARAN MEMORY RESTORED:",
            window.shikshanupakaranAllRows.length
        );


        /* -----------------------------------------------
           Clear imported DOM rows
        ----------------------------------------------- */

        clearShikshanupakaranRows();


        /* -----------------------------------------------
           Rebuild using ORIGINAL row creator
           
           This automatically restores:
           - row HTML
           - event listeners
           - Flatpickr
           - calculations
           - buttons
        ----------------------------------------------- */

        window.shikshanupakaranAllRows.forEach(
            function(rowData) {

                createShikshanupakaranRow(
                    rowData
                );

            }
        );


        console.log(
            "================================="
        );

        console.log(
            "SHIKSHANUPAKARAN EDITOR RESTORED"
        );

        console.log(
            "Memory rows:",
            window.shikshanupakaranAllRows.length
        );

        console.log(
            "DOM rows:",
            document
                .getElementById(
                    "shikshanupakaranBody"
                )
                ?.querySelectorAll(
                    "tr.shikshanupakaranRow"
                ).length || 0
        );

        console.log(
            "================================="
        );


        return true;

    }


    /* ========================================================
       TALAPATRAK
       
       EXISTING TALAPATRAK RESTORATION.
       DO NOT CHANGE ITS STRUCTURE.
    ======================================================== */

    const body =
        getKhataEditorBody(
            snapshot.editorType
        );


    if (!body) {

        console.warn(
            "Cannot restore Khata editor snapshot. Body not found."
        );

        return false;

    }


    body.innerHTML =
        snapshot.html;


    console.log(
        "================================="
    );

    console.log(
        "KHATA EDITOR RESTORED"
    );

    console.log(
        "Previous editor state restored."
    );

    console.log(
        "Editor:",
        snapshot.editorType
    );

    console.log(
        "================================="
    );


    return true;

}


/* ============================================================
   CLEAR SNAPSHOT
============================================================ */

function clearKhataEditorSnapshot() {

    window.khataEditorSnapshot =
        null;

}


/* ============================================================
   CANCEL KHATA IMPORT
============================================================

   THIS IS THE FUNCTION YOUR CANCEL BUTTON SHOULD CALL.

   Example:

       onclick="cancelKhataImport()"

   or:

       cancelKhataImport();
============================================================ */

function cancelKhataImport() {

    console.log(
        "================================="
    );

    console.log(
        "KHATA CANCEL BUTTON PRESSED"
    );

    console.log(
        "================================="
    );


    /*
       Tell EVERY Khata stage to stop.

       Scanner/parser/upload modules should also
       check these flags.
    */

    window.khataImportCancelled =
        true;

    window.khataScanCancelled =
        true;


    /*
       Restore the editor immediately.

       This removes any partially imported rows
       and brings back the exact PRE-IMPORT state.
    */

    if (
        window.khataEditorSnapshot
    ) {

        restoreKhataEditorSnapshot();

    }


    /*
       Stop renderer state.
    */

    window.khataImportInProgress =
        false;


    window.khataImportDebugCounter =
        0;


    /*
       Update progress UI if available.
    */

    if (
        typeof updateKhataImportProgress ===
        "function"
    ) {

        updateKhataImportProgress(
            0,
            "Khata import cancelled.",
            "Editor restored to previous state."
        );

    }


    console.log(
        "Khata import cancelled."
    );

    console.log(
        "Editor returned to previous state."
    );


    /*
       IMPORTANT:

       Do NOT clear the cancellation flags here.

       The upload/controller layer should clear them
       when starting the NEXT import.
    */


    return true;

}


/* ============================================================
   EXPORT CANCEL FUNCTION
============================================================ */

window.cancelKhataImport =
    cancelKhataImport;


/* ============================================================
   DETECT ACTIVE EDITOR
============================================================ */

function getActiveKhataEditor() {

    const talapatrakEditor =
        document.getElementById(
            "talapatrakEditorView"
        );


    if (
        talapatrakEditor &&
        isKhataEditorVisible(
            talapatrakEditor
        )
    ) {

        return "talapatrak";

    }


    const shikshanupakaranEditor =
        document.getElementById(
            "shikshanupakaranEditorView"
        );


    if (
        shikshanupakaranEditor &&
        isKhataEditorVisible(
            shikshanupakaranEditor
        )
    ) {

        return "shikshanupakaran";

    }


    return null;

}


/* ============================================================
   CHECK EDITOR VISIBILITY
============================================================ */

function isKhataEditorVisible(
    element
) {

    if (!element) {

        return false;

    }


    const style =
        window.getComputedStyle(
            element
        );


    if (
        style.display === "none" ||
        style.visibility === "hidden"
    ) {

        return false;

    }


    if (
        element.getClientRects().length === 0
    ) {

        return false;

    }


    return true;

}


/* ============================================================
   GUJARATI DIGITS → ENGLISH
============================================================ */

function rendererGujaratiToEnglish(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    const map = {

        "૦": "0",
        "૧": "1",
        "૨": "2",
        "૩": "3",
        "૪": "4",
        "૫": "5",
        "૬": "6",
        "૭": "7",
        "૮": "8",
        "૯": "9"

    };


    return String(value)
        .replace(
            /[૦-૯]/g,
            function(digit) {

                return map[digit];

            }
        )
        .trim();

}


/* ============================================================
   NORMALIZE KHATA NUMBER
============================================================ */

function normalizeRendererKhataNumber(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return rendererGujaratiToEnglish(
        value
    );

}


/* ============================================================
   NORMALIZE FIRST KHATA HOLDER NAME
============================================================ */

function normalizeRendererKhataName(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    if (
        Array.isArray(value)
    ) {

        for (
            let i = 0;
            i < value.length;
            i++
        ) {

            if (
                value[i] !== null &&
                value[i] !== undefined
            ) {

                const name =
                    String(value[i])
                        .replace(/\s+/g, " ")
                        .trim();


                if (name) {

                    return removeRendererNameNumber(
                        name
                    );

                }

            }

        }


        return "";

    }


    const text =
        String(value)
            .replace(/\r/g, "\n")
            .trim();


    if (!text) {

        return "";

    }


    const lines =
        text
            .split(/\n+/)
            .map(
                function(line) {

                    return line
                        .replace(/\s+/g, " ")
                        .trim();

                }
            )
            .filter(
                function(line) {

                    return line.length > 0;

                }
            );


    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        const numberedName =
            line.match(
                /^\s*\d+\s*[\.\)\-:]\s*(.+)$/u
            );


        if (
            numberedName &&
            numberedName[1]
        ) {

            return normalizeRendererPlainName(
                numberedName[1]
            );

        }


        const numberWithoutSeparator =
            line.match(
                /^\s*\d+\s+(.+)$/u
            );


        if (
            numberWithoutSeparator &&
            numberWithoutSeparator[1]
        ) {

            return normalizeRendererPlainName(
                numberWithoutSeparator[1]
            );

        }

    }


    return normalizeRendererPlainName(
        lines[0]
    );

}


/* ============================================================
   REMOVE NUMBER FROM NAME
============================================================ */

function removeRendererNameNumber(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /^\s*\d+\s*[\.\)\-:]\s*/u,
            ""
        )
        .replace(/\s+/g, " ")
        .trim();

}


/* ============================================================
   NORMALIZE PLAIN NAME
============================================================ */

function normalizeRendererPlainName(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return removeRendererNameNumber(
        String(value)
            .replace(/\s+/g, " ")
            .trim()
    );

}


/* ============================================================
   ESCAPE HTML
============================================================ */

function escapeKhataRendererHTML(
    value
) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   CREATE SHIKSHANUPAKARAN ROW
============================================================ */

/* ============================================================
   CREATE SHIKSHANUPAKARAN KHATA ROW
============================================================ */

function createKhataShikshanupakaranRow(
    khataNumber,
    name
) {

    if (
        typeof window.createShikshanupakaranRow !==
        "function"
    ) {

        console.error(
            "Original createShikshanupakaranRow() is not available."
        );

        return null;

    }


    /* ========================================================
       NORMALIZE IMPORTED DATA
    ======================================================== */

    const finalKhataNumber =
        normalizeRendererKhataNumber(
            khataNumber
        );


    const finalName =
        normalizeRendererKhataName(
            name
        );


    /* ========================================================
       CREATE ROW THROUGH THE ORIGINAL
       SHIKSHANUPAKARAN ROW CREATOR
       
       IMPORTANT:
       Do NOT create another row structure here.
       
       This guarantees imported rows use exactly the same:
       - HTML
       - event listeners
       - calculations
       - date picker
       - auto-column logic
       - add/delete buttons
       - future row behavior
    ======================================================== */

    const row =
        window.createShikshanupakaranRow({
    
            A:
                finalKhataNumber,
    
            B:
                finalName
    
        });
    
    
    if (!row) {
    
        console.error(
            "Shikshanupakaran row creation failed."
        );
    
        return null;
    
    }
    
    
    /* ========================================================
       REGISTER ROW WITH CURRENT IMPORT TRANSACTION
    
       This allows cancellation to remove only rows created
       by this Khata import.
    ======================================================== */
    
    if (
        typeof window.registerKhataImportedRow ===
        "function"
    ) {
    
        window.registerKhataImportedRow(
            row
        );
    
    }
    
    
    /* ========================================================
       VERIFY IMPORTED VALUES
    ======================================================== */

  
    const numberInput =
        row.querySelector(
            '[data-column="A"]'
        );


    const nameInput =
        row.querySelector(
            '[data-column="B"]'
        );


    if (
        numberInput
    ) {

        numberInput.value =
            finalKhataNumber;

    }


    if (
        nameInput
    ) {

        nameInput.value =
            finalName;

    }


    /* ========================================================
       DEBUG
    ======================================================== */

    window.khataImportDebugCounter++;


    return row;

}


/* ============================================================
   CLEAR KHATA EDITOR ROWS
============================================================ */

function clearKhataEditorRows(
    editorType
) {

    const body =
        getKhataEditorBody(
            editorType
        );


    if (!body) {

        console.warn(
            "Khata editor body not found."
        );

        return false;

    }


    body.innerHTML = "";


    return true;

}


/* ============================================================
   FIND FIRST VALID KHATA NUMBER
============================================================ */

function findFirstImportedKhataNumber(
    khatas
) {

    for (
        let i = 0;
        i < khatas.length;
        i++
    ) {

        const number =
            normalizeRendererKhataNumber(
                khatas[i].khataNumber
            );


        if (
            /^\d+$/.test(number)
        ) {

            return Number(number);

        }

    }


    return null;

}


/* ============================================================
   GET FIRST HOLDER NAME
============================================================ */

/* ============================================================
   GET EXACT PARSER NAME

   IMPORTANT:
   ------------------------------------------------------------
   The parser has already selected the FIRST holder name.

   Renderer must NOT:
   - search names[]
   - search holderNames[]
   - search holders[]
   - choose another holder
   - search a "pile" of names

   Renderer simply displays:

       khata.name

   EXACTLY as supplied by the parser.
============================================================ */

function getFirstRendererKhataName(khata) {

    if (!khata) {
        return "";
    }

    /*
       ONLY use the parser's final name.
    */

    return normalizeRendererKhataName(
        khata.name
    );

}


/* ============================================================
   BUILD IMPORTED KHATA SEQUENCE
============================================================ */

function buildImportedKhataSequence(
    khatas
) {

    if (
        !Array.isArray(khatas) ||
        khatas.length === 0
    ) {

        return [];

    }


    const firstNumber =
        findFirstImportedKhataNumber(
            khatas
        );


    if (
        firstNumber === null
    ) {

        return [];

    }


    const recordsByNumber =
        new Map();


    khatas.forEach(
        function(khata) {

            if (!khata) {

                return;

            }


            const number =
                normalizeRendererKhataNumber(
                    khata.khataNumber
                );


            if (
                !/^\d+$/.test(number)
            ) {

                return;

            }


            const numeric =
                Number(number);


            const name =
                getFirstRendererKhataName(
                    khata
                );


            const existing =
                  recordsByNumber.get(
                      numeric
                  );
              
              
              if (!existing) {
              
                  /*
                     FIRST parser record for this Khata wins.
              
                     The renderer does NOT try to find another
                     holder name later.
                  */
              
                  recordsByNumber.set(
                      numeric,
                      {
              
                          khataNumber:
                              String(numeric),
              
                          name:
                              name,
              
                          isPlaceholder:
                              false,
              
                          source:
                              khata
              
                      }
                  );
              
              }

        }
    );


    let highestNumber =
        firstNumber;


    recordsByNumber.forEach(
        function(record, numeric) {

            if (
                numeric > highestNumber
            ) {

                highestNumber =
                    numeric;

            }

        }
    );


    const sequence = [];


    for (
        let number = firstNumber;
        number <= highestNumber;
        number++
    ) {

        const record =
            recordsByNumber.get(
                number
            );


       if (record) {

            sequence.push({
        
                khataNumber:
                    String(number),
        
                /*
                   IMPORTANT:
                   This is the exact name belonging to
                   THIS Khata number.
                */
        
                name:
                    record.name || "",
        
                isPlaceholder:
                    false,
        
                source:
                    record.source
        
            });
        
        }
        else {

            sequence.push({

                khataNumber:
                    String(number),

                name:
                    "",

                isPlaceholder:
                    true,

                source:
                    null

            });

        }

    }


    console.log(
        "Khata sequence built:",
        sequence.length,
        "rows"
    );


    return sequence;

}


/* ============================================================
   MAP KHATA TO EXISTING ROW
============================================================ */

function mapKhataToRow(
    row,
    khata,
    editorType
) {

    if (
        !row ||
        !khata
    ) {

        return false;

    }


    const khataNumber =
        normalizeRendererKhataNumber(
            khata.khataNumber
        );


    const name =
        getFirstRendererKhataName(
            khata
        );


    if (
        editorType === "talapatrak"
    ) {

        const numberInput =
            row.querySelector(
                ".columnA"
            );


        const nameInput =
            row.querySelector(
                ".columnB"
            );


        if (numberInput) {

            numberInput.value =
                khataNumber;

        }


        if (nameInput) {

            nameInput.value =
                name;

        }


        return true;

    }


    if (
        editorType === "shikshanupakaran"
    ) {

        const numberInput =
            row.querySelector(
                '[data-column="A"]'
            );


        const nameInput =
            row.querySelector(
                '[data-column="B"]'
            );


        if (numberInput) {

            numberInput.value =
                khataNumber;

        }


        if (nameInput) {

            nameInput.value =
                name;

        }


        return true;

    }


    return false;

}


/* ============================================================
   SHOW KHATA SCAN PREVIEW
============================================================ */

function showKhataScanPreview(
    parsedResult
) {

    const editorType =
        getActiveKhataEditor();


    if (!editorType) {

        return false;

    }


    const editor =
        document.getElementById(
            editorType === "talapatrak"
                ? "talapatrakEditorView"
                : "shikshanupakaranEditorView"
        );


    if (!editor) {

        return false;

    }


    const oldPreview =
        document.getElementById(
            "khataScanPreview"
        );


    if (oldPreview) {

        oldPreview.remove();

    }


    const preview =
        document.createElement(
            "div"
        );


    preview.id =
        "khataScanPreview";


    preview.style.cssText = `
        margin:15px 0;
        padding:15px;
        border:1px solid #ccc;
        background:#fafafa;
        max-height:350px;
        overflow-y:auto;
        font-family:sans-serif;
    `;


    const title =
        document.createElement(
            "h3"
        );


    title.textContent =
        "Khata Import Preview";


    preview.appendChild(
        title
    );


    const summary =
        document.createElement(
            "div"
        );


    summary.textContent =
        `Scanned records: ${
            Array.isArray(parsedResult)
                ? parsedResult.length
                : 0
        }`;


    preview.appendChild(
        summary
    );


    if (
        Array.isArray(parsedResult)
    ) {

        parsedResult.forEach(
            function(khata, index) {

                const row =
                    document.createElement(
                        "div"
                    );


                row.style.cssText = `
                    padding:8px;
                    border-bottom:1px solid #ddd;
                `;


                row.textContent =
                    `${index + 1}. Khata ${
                        khata &&
                        khata.khataNumber
                            ? khata.khataNumber
                            : "(no number)"
                    } → ${
                        khata
                            ? getFirstRendererKhataName(
                                khata
                            )
                            : ""
                    }`;


                preview.appendChild(
                    row
                );

            }
        );

    }


    editor.insertBefore(
        preview,
        editor.firstChild
    );


    return true;

}


window.showKhataScanPreview =
    showKhataScanPreview;


/* ============================================================
   STANDARD MAPPING
============================================================ */

async function mapKhataRecordsToEditor(
    parsedResult
) {

    if (
        !Array.isArray(parsedResult)
    ) {

        return false;

    }


    const editorType =
        getActiveKhataEditor();


    if (!editorType) {

        alert(
            "Please open Talapatrak or Shikshanupakaran editor first."
        );

        return false;

    }


    const khatas =
        parsedResult.filter(
            function(khata) {

                return (
                    khata &&
                    khata.khataNumber
                );

            }
        );


    if (!khatas.length) {

        return false;

    }


    const importedKhatas =
        buildImportedKhataSequence(
            khatas
        );


    if (!importedKhatas.length) {

        return false;

    }


    /*
       SAVE STATE BEFORE TOUCHING EDITOR.
    */

    saveKhataEditorSnapshot(
        editorType
    );


    clearKhataEditorRows(
        editorType
    );


    for (
        let i = 0;
        i < importedKhatas.length;
        i++
    ) {

        const khata =
            importedKhatas[i];


        if (
            editorType === "talapatrak"
        ) {

            createKhataTalapatrakRow(
                khata.khataNumber,
                khata.name
            );

        }
        else {

            createKhataShikshanupakaranRow(
                khata.khataNumber,
                khata.name
            );

        }

    }


    clearKhataEditorSnapshot();


    return true;

}


/* ============================================================
   CONVENIENCE FUNCTION
============================================================ */

async function mapParsedKhataToEditor(
    parsedResult
) {

    return await mapKhataRecordsToEditor(
        parsedResult
    );

}


/* ============================================================
   TEST
============================================================ */

function testKhataEditorMapping(
    parsedResult
) {

    return mapKhataRecordsToEditor(
        parsedResult
    );

}


/* ============================================================
   DEBUG
============================================================ */

function debugKhataEditorDOM(
    editorType
) {

    const body =
        getKhataEditorBody(
            editorType
        );


    console.log(
        "================================="
    );

    console.log(
        "KHATA EDITOR DOM DEBUG"
    );

    console.log(
        "Editor:",
        editorType
    );

    console.log(
        "Body:",
        body
    );


    if (body) {

        console.log(
            "Rows:",
            body.children.length
        );

        console.log(
            "HTML length:",
            body.innerHTML.length
        );

    }


    console.log(
        "================================="
    );

}


/* ============================================================
   PROGRESSIVE IMPORT
============================================================ */

async function mapParsedKhataToEditorProgressive(
    parsedResult
) {

    console.log(
        "================================="
    );

    console.log(
        "PROGRESSIVE KHATA IMPORT STARTED"
    );

    console.log(
        "================================="
    );


    // window.khataImportInProgress =
    //     true;

    // window.khataImportCancelled =
    //     false;

    // window.khataScanCancelled =
    //     false;

    // window.khataImportDebugCounter =
    //     0;

    window.khataImportDebugCounter =
          0;


    /* ========================================================
       VALIDATE
    ======================================================== */

    if (
        !Array.isArray(parsedResult)
    ) {

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       ACTIVE EDITOR
    ======================================================== */

    const editorType =
        getActiveKhataEditor();


    if (!editorType) {

        alert(
            "Please open Talapatrak or Shikshanupakaran editor first."
        );

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       CANCELLATION BEFORE START
    ======================================================== */

    if (
        window.khataImportCancelled ||
        window.khataScanCancelled
    ) {

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       FILTER RECORDS
    ======================================================== */

    const khatas =
        parsedResult.filter(
            function(khata) {

                return (
                    khata &&
                    khata.khataNumber
                );

            }
        );


    if (!khatas.length) {

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       BUILD SEQUENCE
    ======================================================== */

    const importedKhatas =
        buildImportedKhataSequence(
            khatas
        );


    if (!importedKhatas.length) {

        window.khataImportInProgress =
            false;

        return false;

    }


    const totalRows =
        importedKhatas.length;


    /* ========================================================
       SAVE EXACT PRE-IMPORT STATE
       
       THIS MUST HAPPEN BEFORE CLEARING.
    ======================================================== */

    const snapshotSaved =
        saveKhataEditorSnapshot(
            editorType
        );


    if (!snapshotSaved) {

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       CANCEL CHECK BEFORE CLEAR
    ======================================================== */

    if (
        window.khataImportCancelled ||
        window.khataScanCancelled
    ) {

        restoreKhataEditorSnapshot();

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       CLEAR EDITOR
    ======================================================== */

    const cleared =
        clearKhataEditorRows(
            editorType
        );
    
    
    if (!cleared) {
    
        window.khataImportInProgress =
            false;
    
        return false;
    
    }
    
    
    /* ========================================================
       SHIKSHANUPAKARAN IMPORT MEMORY
    
       The Shikshanupakaran editor uses
       window.shikshanupakaranAllRows as its
       master data source.
    
       Start a fresh imported memory set.
    
       TALAPATRAK IS NOT TOUCHED.
    ======================================================== */
    
    if (
        editorType ===
        "shikshanupakaran"
    ) {
    
        window.shikshanupakaranAllRows =
            [];
    
    }


    if (!cleared) {

        window.khataImportInProgress =
            false;

        return false;

    }


    /* ========================================================
       IMPORT
    ======================================================== */

    let createdRows =
        0;


    const BATCH_SIZE =
        10;


    for (
        let index = 0;
        index < totalRows;
        index++
    ) {

        /* ====================================================
           CANCEL CHECK
        ==================================================== */

        if (
            window.khataImportCancelled ||
            window.khataScanCancelled
        ) {

            console.warn(
                "KHATA IMPORT CANCELLED AT:",
                index,
                "/",
                totalRows
            );


            /*
               RESTORE EXACT OLD EDITOR.
            */

            restoreKhataEditorSnapshot();


            window.khataImportInProgress =
                false;


            window.khataImportDebugCounter =
                0;


            if (
                typeof updateKhataImportProgress ===
                "function"
            ) {

                updateKhataImportProgress(
                    0,
                    "Khata import cancelled.",
                    "Editor restored to previous state."
                );

            }


            return false;

        }


        /* ====================================================
           CURRENT RECORD
        ==================================================== */

        const khata =
            importedKhatas[index];


        let row =
            null;


        if (
            editorType === "talapatrak"
        ) {

            row =
                createKhataTalapatrakRow(
                    khata.khataNumber,
                    khata.name
                );

        }
        else if (
            editorType === "shikshanupakaran"
        ) {
        
            row =
                createKhataShikshanupakaranRow(
                    khata.khataNumber,
                    khata.name
                );
        
        
            /* ====================================================
               SAVE IMPORTED KHATA INTO SHIKSHANUPAKARAN MEMORY
        
               DOM alone is NOT enough.
        
               Shikshanupakaran uses:
                   shikshanupakaranAllRows
                       ↓
                   editor
                       ↓
                   autosave
        
               Therefore every imported Khata must also
               enter the master memory array.
            ==================================================== */
        
            if (row) {
        
                window.shikshanupakaranAllRows.push({
        
                    A:
                        normalizeRendererKhataNumber(
                            khata.khataNumber
                        ),
        
                    B:
                        normalizeRendererKhataName(
                            khata.name
                        )
        
                });
        
            }
        
        }


        if (row) {

            createdRows++;

        }


        /* ====================================================
           PROGRESS
        ==================================================== */

        const percent =
            Math.floor(
                ((index + 1) / totalRows) * 100
            );


        if (
            typeof updateKhataImportProgress ===
            "function"
        ) {

            updateKhataImportProgress(
                percent,
                "Writing Khata records into editor...",
                `Record ${index + 1} of ${totalRows}`
            );

        }


        /* ====================================================
           GIVE BROWSER CONTROL
        ==================================================== */

        if (
            (index + 1) % BATCH_SIZE === 0 ||
            index === totalRows - 1
        ) {

            await new Promise(
                function(resolve) {

                    requestAnimationFrame(
                        resolve
                    );

                }
            );

        }

    }


    /* ========================================================
       FINAL CANCEL CHECK
    ======================================================== */

    if (
        window.khataImportCancelled ||
        window.khataScanCancelled
    ) {

        console.warn(
            "KHATA IMPORT CANCELLED AT COMPLETION."
        );


        restoreKhataEditorSnapshot();


        window.khataImportInProgress =
            false;


        window.khataImportDebugCounter =
            0;


        if (
            typeof updateKhataImportProgress ===
            "function"
        ) {

            updateKhataImportProgress(
                0,
                "Khata import cancelled.",
                "Editor restored to previous state."
            );

        }


        return false;

    }


    /* ========================================================
       SUCCESS
       
       Import finished successfully.
       
       NOW the old snapshot is no longer needed.
    ======================================================== */

    window.khataImportInProgress =
        false;


    clearKhataEditorSnapshot();


    console.log(
        "================================="
    );

    console.log(
        "PROGRESSIVE KHATA IMPORT COMPLETE"
    );

    console.log(
        "Editor:",
        editorType
    );

    console.log(
        "Rows created:",
        createdRows
    );

    console.log(
        "================================="
    );


    debugKhataEditorDOM(
        editorType
    );


    if (
        typeof updateKhataImportProgress ===
        "function"
    ) {

        updateKhataImportProgress(
            100,
            "Khata import completed successfully.",
            `${createdRows} records imported`
        );

    }


    return true;

}


/* ============================================================
   CREATE TALAPATRAK KHATA ROW
============================================================ */

function createKhataTalapatrakRow(
    khataNumber,
    name
) {

    if (
        typeof window.createTalapatrakRow !==
        "function"
    ) {

        console.error(
            "Original createTalapatrakRow() is not available."
        );

        return null;

    }


    const finalKhataNumber =
        normalizeRendererKhataNumber(
            khataNumber
        );


    const finalName =
        normalizeRendererKhataName(
            name
        );


    const row =
        window.createTalapatrakRow({
    
            A:
                finalKhataNumber,
    
            B:
                finalName
    
        });
    
    
    if (!row) {
    
        return null;
    
    }
    
    
    /* ========================================================
       REGISTER ROW WITH CURRENT IMPORT TRANSACTION
    
       This allows cancellation to remove only rows created
       by this Khata import.
    ======================================================== */
    
    if (
        typeof window.registerKhataImportedRow ===
        "function"
    ) {
    
        window.registerKhataImportedRow(
            row
        );
    
    }
    
    
    const numberInput =
        row.querySelector(
            ".columnA"
        );


    if (numberInput) {

        numberInput.value =
            finalKhataNumber;

    }


    const nameInput =
        row.querySelector(
            ".columnB"
        );


    if (nameInput) {

        nameInput.value =
            finalName;

    }


    window.khataImportDebugCounter++;


    return row;

}


/* ============================================================
   EXPORT FUNCTIONS
============================================================ */

window.mapKhataRecordsToEditor =
    mapKhataRecordsToEditor;


window.mapParsedKhataToEditor =
    mapParsedKhataToEditor;


window.testKhataEditorMapping =
    testKhataEditorMapping;


window.mapParsedKhataToEditorProgressive =
    mapParsedKhataToEditorProgressive;


window.cancelKhataImport =
    cancelKhataImport;


/* ============================================================
   READY
============================================================ */

console.log(
    "Khata Renderer ready."
);

console.log(
    "Cancel function available:",
    typeof window.cancelKhataImport === "function"
);


function getKhataImportedMasterRowCount(){

    const editorType =
        typeof getActiveKhataEditor ===
        "function"
            ? getActiveKhataEditor()
            : null;


    if(
        editorType ===
        "shikshanupakaran"
    ){

        return Array.isArray(
            window.shikshanupakaranAllRows
        )
            ? window.shikshanupakaranAllRows.length
            : 0;

    }


    if(
        editorType ===
        "talapatrak"
    ){

        return Array.isArray(
            window.talapatrakAllRows
        )
            ? window.talapatrakAllRows.length
            : 0;

    }


    return 0;

}

const importedCount =
    getKhataImportedMasterRowCount();


console.log(
    "KHATA MASTER DATA VERIFICATION:",
    {
        editor:
            getActiveKhataEditor(),

        masterRows:
            importedCount,

        visibleRows:
            document.querySelectorAll(
                ".shikshanupakaranRow"
            ).length
    }
);