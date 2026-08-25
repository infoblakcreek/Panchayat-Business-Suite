/* ============================================================
   KHATA UPLOAD
   ============================================================

   Handles:

       File selection
       ↓
       Scanner
       ↓
       Parser
       ↓
       Renderer
       ↓
       Editor

   Cancellation lifecycle:

       Cancel
          ↓
       signal cancellation
          ↓
       stop scanner/parser/renderer
          ↓
       rollback current import
          ↓
       discard temporary data
          ↓
       reset state
          ↓
       allow NEXT import

   IMPORTANT:

   A cancelled import must be completely cleaned up before
   another import is allowed to start.
============================================================ */


/* ============================================================
   MODULE LOADED
============================================================ */

console.log(
    "Khata Upload module loaded."
);


/* ============================================================
   KHATA IMPORT STATE
============================================================ */

window.khataImportInProgress =
    false;

window.khataImportCancelled =
    false;

window.khataScanCancelled =
    false;

window.khataImportTimer =
    null;

window.khataImportAbortController =
    null;


/* ============================================================
   TRANSACTION STATE
============================================================ */

window.khataImportTransaction =
    null;


/* ============================================================
   CANCELLATION STATE
============================================================ */

window.khataImportCancellationRequested =
    false;

window.khataImportCancellationCompleted =
    false;


/* ============================================================
   CLEANUP / LIFECYCLE STATE
============================================================ */

window.khataImportCleanupInProgress =
    false;

window.khataImportGeneration =
    0;


/* ============================================================
   SUPPORTED FILE TYPES
============================================================ */

const KHATA_SUPPORTED_FILE_TYPES = [

    "application/pdf",

    "image/jpeg",

    "image/png",

    "image/webp"

];


/* ============================================================
   FILE SIZE SAFETY LIMIT
============================================================ */

const KHATA_MIN_FILE_SIZE =
    1;


/* ============================================================
   OPEN KHATA FILE PICKER
============================================================ */

function openKhataFilePicker(
    onFileSelected
){

    const fileInput =
        document.createElement("input");


    fileInput.type =
        "file";


    fileInput.accept =
        [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
        ].join(",");


    fileInput.style.display =
        "none";


    /*
       IMPORTANT:

       The input is temporary.

       This guarantees that the same PDF can
       be selected again after cancellation.
    */

    document.body.appendChild(
        fileInput
    );


    let handled =
        false;


    fileInput.addEventListener(
        "change",
        async function(){

            if(handled){
                return;
            }


            handled = true;


            const file =
                fileInput.files &&
                fileInput.files[0];


            if(!file){

                fileInput.remove();

                return;

            }


            if(
                !KHATA_SUPPORTED_FILE_TYPES.includes(
                    file.type
                )
            ){

                console.error(
                    "Unsupported Khata file type:",
                    file.type
                );


                alert(
                    "Please select a PDF, JPG, PNG or WEBP file."
                );


                fileInput.value = "";

                fileInput.remove();

                return;

            }


            console.log(
                "================================"
            );


            console.log(
                "KHATA FILE SELECTED"
            );


            console.log(
                "Name:",
                file.name
            );


            console.log(
                "Type:",
                file.type
            );


            console.log(
                "Size:",
                file.size
            );


            console.log(
                "================================"
            );


            try{

                if(
                    typeof onFileSelected ===
                    "function"
                ){

                    await onFileSelected(
                        file
                    );

                }

            }
            finally{

                /*
                   Reset BEFORE removing.

                   This makes same-file retry reliable.
                */

                try{

                    fileInput.value =
                        "";

                }
                catch(error){

                    console.warn(
                        "Khata file input reset warning:",
                        error
                    );

                }


                fileInput.remove();

            }

        }
    );


    /*
       Also handle user opening the picker
       and pressing Cancel without selecting.
    */

    fileInput.addEventListener(
        "cancel",
        function(){

            console.log(
                "KHATA FILE PICKER CANCELLED"
            );


            fileInput.value =
                "";


            fileInput.remove();

        }
    );


    fileInput.click();

}


/* ============================================================
   CHECK WHETHER IMPORT HAS BEEN CANCELLED
============================================================ */

function isKhataImportCancelled() {

    return (

        window.khataImportCancelled ===
        true

        ||

        window.khataScanCancelled ===
        true

        ||

        window.khataImportCancellationRequested ===
        true

        ||

        (
            window.khataImportAbortController &&
            window.khataImportAbortController.signal &&
            window.khataImportAbortController.signal.aborted
        )

    );

}


window.isKhataImportCancelled =
    isKhataImportCancelled;


/* ============================================================
   THROW CANCELLATION ERROR
============================================================ */

function throwIfKhataImportCancelled() {

    if (
        isKhataImportCancelled()
    ) {

        throw new Error(
            "KHATA_IMPORT_CANCELLED"
        );

    }

}


/* ============================================================
   CREATE IMPORT TRANSACTION
============================================================ */

function createKhataImportTransaction() {

    const editorType =
        typeof getActiveKhataEditor ===
        "function"

            ? getActiveKhataEditor()

            : null;


    const generation =
        ++window.khataImportGeneration;


    window.khataImportTransaction = {

        id:
            "khata-import-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .slice(2),

        generation:
            generation,

        editorType:
            editorType,

        startedAt:
            Date.now(),

        committed:
            false,

        cancelled:
            false,

        rendererStarted:
            false,

        rendererCompleted:
            false,

        importedRows:
            [],

        temporaryRecords:
            [],

        scannedResult:
            null,

        parsedResult:
            null

    };


    console.log(
        "Khata import transaction created:",
        window.khataImportTransaction.id
    );


    return window.khataImportTransaction;

}


window.createKhataImportTransaction =
    createKhataImportTransaction;


/* ============================================================
   GET CURRENT IMPORT TRANSACTION
============================================================ */

function getKhataImportTransaction() {

    return (
        window.khataImportTransaction ||
        null
    );

}


window.getKhataImportTransaction =
    getKhataImportTransaction;


/* ============================================================
   REGISTER IMPORTED ROW
============================================================ */

function registerKhataImportedRow(
    row
) {

    const transaction =
        getKhataImportTransaction();


    if (
        !transaction ||
        !row
    ) {

        return;

    }


    if (
        transaction.importedRows.indexOf(row) ===
        -1
    ) {

        transaction.importedRows.push(
            row
        );

    }

}


window.registerKhataImportedRow =
    registerKhataImportedRow;


/* ============================================================
   REMOVE CURRENT IMPORT ROWS
============================================================ */

function removeCurrentKhataImportRows() {

    const transaction =
        getKhataImportTransaction();


    if (!transaction) {

        console.warn(
            "No Khata import transaction exists."
        );

        return;

    }


    console.warn(
        "Removing only current Khata import rows:",
        transaction.importedRows.length
    );


    transaction.importedRows.forEach(
        function(row) {

            try {

                if (
                    row &&
                    row.parentNode
                ) {

                    row.parentNode.removeChild(
                        row
                    );

                }

            }
            catch (error) {

                console.warn(
                    "Unable to remove imported Khata row:",
                    error
                );

            }

        }
    );


    transaction.importedRows =
        [];

}


window.removeCurrentKhataImportRows =
    removeCurrentKhataImportRows;


/* ============================================================
   CLEAR PARTIAL KHATA IMPORT
============================================================ */

function clearPartialKhataImport() {

    console.warn(
        "Clearing partial Khata import..."
    );


    removeCurrentKhataImportRows();


    console.warn(
        "Partial Khata import cleared."
    );

}


window.clearPartialKhataImport =
    clearPartialKhataImport;


/* ============================================================
   SHOW CANCELLING STATE
============================================================ */

function showKhataCancellingState(
    detail = "Stopping import..."
) {

    const cancelButton =
        document.getElementById(
            "khataScanCancelButton"
        );


    if (cancelButton) {

        cancelButton.disabled =
            true;


        cancelButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Cancelling...
        `;

    }


    updateKhataImportProgress(
        0,
        "Cancelling Khata import...",
        detail
    );

}


/* ============================================================
   SHOW CANCELLATION COMPLETE
============================================================ */

function showKhataCancellationComplete() {

    const cancelButton =
        document.getElementById(
            "khataScanCancelButton"
        );


    if (cancelButton) {

        cancelButton.disabled =
            true;


        cancelButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Cancelled
        `;

    }


    updateKhataImportProgress(
        0,
        "Khata import cancelled.",
        "No imported data was saved."
    );

}


/* ============================================================
   CANCEL KHATA IMPORT
============================================================ */

function cancelKhataImport() {

    console.warn(
        "================================="
    );

    console.warn(
        "KHATA IMPORT CANCELLATION REQUESTED"
    );

    console.warn(
        "================================="
    );


    if (
        !window.khataImportInProgress
    ) {

        console.warn(
            "No Khata import is currently running."
        );

        return false;

    }


    if (
        window.khataImportCancellationRequested
    ) {

        console.warn(
            "Khata cancellation already requested."
        );

        return false;

    }


    window.khataImportCancellationRequested =
        true;


    window.khataImportCancellationCompleted =
        false;


    const transaction =
        getKhataImportTransaction();


    if (transaction) {

        transaction.cancelled =
            true;

    }


    window.khataImportCancelled =
        true;


    window.khataScanCancelled =
        true;


    showKhataCancellingState(
        "Stopping the current Khata process..."
    );


    /*
       Abort the scanner immediately.

       Scanner must still periodically check the
       cancellation flags.
    */

    if (
        window.khataImportAbortController
    ) {

        try {

            window.khataImportAbortController.abort();

            console.warn(
                "Khata AbortController aborted."
            );

        }
        catch (error) {

            console.warn(
                "Unable to abort Khata import:",
                error
            );

        }

    }


    /*
       Cancel any pending UI timer.
    */

    if (
        window.khataImportTimer
    ) {

        clearTimeout(
            window.khataImportTimer
        );

        window.khataImportTimer =
            null;

    }


    console.warn(
        "Khata cancellation signal sent."
    );

    console.warn(
        "Waiting for current process to stop..."
    );


    return true;

}


window.cancelKhataImport =
    cancelKhataImport;


/* ============================================================
   READ FILE AS ARRAY BUFFER
============================================================ */

function readKhataFileAsArrayBuffer(
    file
) {

    return new Promise(
        function(resolve, reject) {

            if (
                !file
            ) {

                reject(
                    new Error(
                        "Unable to read Khata file."
                    )
                );

                return;

            }


            if (
                !Number.isFinite(file.size) ||
                file.size <= 0
            ) {

                reject(
                    new Error(
                        "KHATA_FILE_EMPTY"
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            let settled =
                false;


            function resolveOnce(
                value
            ) {

                if (settled) {

                    return;

                }

                settled =
                    true;

                resolve(
                    value
                );

            }


            function rejectOnce(
                error
            ) {

                if (settled) {

                    return;

                }

                settled =
                    true;

                reject(
                    error
                );

            }


            reader.onload =
                function() {

                    if (
                        window.khataImportCancelled ||
                        window.khataScanCancelled
                    ) {

                        rejectOnce(
                            new Error(
                                "KHATA_IMPORT_CANCELLED"
                            )
                        );

                        return;

                    }


                    if (
                        !reader.result ||
                        reader.result.byteLength ===
                            0
                    ) {

                        rejectOnce(
                            new Error(
                                "KHATA_FILE_EMPTY"
                            )
                        );

                        return;

                    }


                    resolveOnce(
                        reader.result
                    );

                };


            reader.onerror =
                function() {

                    rejectOnce(
                        new Error(
                            "Unable to read Khata file."
                        )
                    );

                };


            reader.onabort =
                function() {

                    rejectOnce(
                        new Error(
                            "KHATA_IMPORT_CANCELLED"
                        )
                    );

                };


            try {

                reader.readAsArrayBuffer(
                    file
                );

            }
            catch (error) {

                rejectOnce(
                    error
                );

            }

        }
    );

}


/* ============================================================
   READ FILE AS DATA URL
============================================================ */

function readKhataFileAsDataURL(
    file
) {

    return new Promise(
        function(resolve, reject) {

            if (
                !file ||
                !Number.isFinite(file.size) ||
                file.size <= 0
            ) {

                reject(
                    new Error(
                        "KHATA_FILE_EMPTY"
                    )
                );

                return;

            }


            const reader =
                new FileReader();


            let settled =
                false;


            function resolveOnce(
                value
            ) {

                if (settled) {

                    return;

                }

                settled =
                    true;

                resolve(
                    value
                );

            }


            function rejectOnce(
                error
            ) {

                if (settled) {

                    return;

                }

                settled =
                    true;

                reject(
                    error
                );

            }


            reader.onload =
                function() {

                    if (
                        isKhataImportCancelled()
                    ) {

                        rejectOnce(
                            new Error(
                                "KHATA_IMPORT_CANCELLED"
                            )
                        );

                        return;

                    }


                    resolveOnce(
                        reader.result
                    );

                };


            reader.onerror =
                function() {

                    rejectOnce(
                        new Error(
                            "Unable to read Khata image."
                        )
                    );

                };


            reader.onabort =
                function() {

                    rejectOnce(
                        new Error(
                            "KHATA_IMPORT_CANCELLED"
                        )
                    );

                };


            try {

                reader.readAsDataURL(
                    file
                );

            }
            catch (error) {

                rejectOnce(
                    error
                );

            }

        }
    );

}


/* ============================================================
   UPDATE KHATA IMPORT PROGRESS
============================================================ */

function updateKhataImportProgress(
    percent,
    status = "",
    detail = ""
) {

    const overlay =
        document.getElementById(
            "khataScanProgressOverlay"
        );


    const title =
        document.getElementById(
            "khataScanProgressTitle"
        );


    const statusText =
        document.getElementById(
            "khataScanProgressStatus"
        );


    const fill =
        document.getElementById(
            "khataScanProgressFill"
        );


    const percentText =
        document.getElementById(
            "khataScanProgressPercent"
        );


    const pageText =
        document.getElementById(
            "khataScanProgressPage"
        );


    if (!overlay) {

        return;

    }


    overlay.style.display =
        "flex";


    const safePercent =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(percent)
            )
        );


    if (title) {

        title.textContent =
            window.khataImportCancellationRequested
                ? "Cancelling Khata Import"
                : "Importing Khata Data";

    }


    if (statusText) {

        statusText.textContent =
            status;

    }


    if (fill) {

        fill.style.width =
            safePercent + "%";

    }


    if (percentText) {

        percentText.textContent =
            safePercent + "%";

    }


    if (pageText) {

        pageText.textContent =
            detail;

    }

}


window.updateKhataImportProgress =
    updateKhataImportProgress;


/* ============================================================
   WAIT FOR ANIMATION FRAME
============================================================ */

function waitKhataAnimationFrame() {

    return new Promise(
        function(resolve) {

            requestAnimationFrame(
                function() {

                    resolve();

                }
            );

        }
    );

}


/* ============================================================
   MAIN KHATA UPLOAD HANDLER
============================================================ */

async function handleKhataUploadForEditor() {

    console.log(
        "================================="
    );

    console.log(
        "KHATA EDITOR UPLOAD STARTED"
    );

    console.log(
        "================================="
    );


    /* ========================================================
       NEVER START WHILE ANOTHER IMPORT IS ACTIVE
    ======================================================== */

    if (
        window.khataImportInProgress
    ) {

        console.warn(
            "Khata import already in progress."
        );

        return false;

    }


    /*
       Do not start while previous cancellation cleanup
       is still running.
    */

    if (
        window.khataImportCleanupInProgress
    ) {

        console.warn(
            "Previous Khata import is still cleaning up."
        );

        return false;

    }


    openKhataFilePicker(
        async function(file) {

            /* =================================================
               SECOND SAFETY CHECK
            ================================================= */

            if (
                window.khataImportInProgress
            ) {

                console.warn(
                    "Khata import already in progress."
                );

                return;

            }


            if (
                window.khataImportCleanupInProgress
            ) {

                console.warn(
                    "Previous Khata import cleanup still active."
                );

                return;

            }


            /* =================================================
               VALIDATE FILE AGAIN
            ================================================= */

            if (
                !file ||
                !Number.isFinite(file.size) ||
                file.size <= 0
            ) {

                console.error(
                    "Selected Khata file is empty:",
                    file
                );


                alert(
                    "The selected Khata file is empty or could not be read. Please select the PDF again."
                );


                return;

            }


            console.log(
                "================================="
            );

            console.log(
                "VALID KHATA FILE RECEIVED"
            );

            console.log(
                "Name:",
                file.name
            );

            console.log(
                "Type:",
                file.type
            );

            console.log(
                "Size:",
                file.size,
                "bytes"
            );

            console.log(
                "================================="
            );


            /* =================================================
               START CLEAN NEW IMPORT
            ================================================= */

            window.khataImportCancelled =
                false;


            window.khataScanCancelled =
                false;


            window.khataImportCancellationRequested =
                false;


            window.khataImportCancellationCompleted =
                false;


            window.khataImportInProgress =
                true;


            window.khataImportCleanupInProgress =
                false;


            /* =================================================
               CREATE TRANSACTION
            ================================================= */

            const transaction =
                createKhataImportTransaction();


          /* =================================================
             SAVE PRE-IMPORT EDITOR STATE
          
             IMPORTANT:
             Save BEFORE OCR/SCAN begins so cancellation
             can restore the editor even if the user cancels
             during OCR.
          ================================================= */
          
          const editorType =
              getActiveKhataEditor();
          
          
          if (!editorType) {
          
              console.error(
                  "No active Khata editor found."
              );
          
              window.khataImportInProgress =
                  false;
          
              return false;
          
          }
          
          
          const snapshotSaved =
              saveKhataEditorSnapshot(
                  editorType
              );
          
          
          if (!snapshotSaved) {
          
              console.error(
                  "Unable to save pre-import editor snapshot."
              );
          
              window.khataImportInProgress =
                  false;
          
              return false;
          
          }

          
            /* =================================================
               CREATE ABORT CONTROLLER
            ================================================= */

            window.khataImportAbortController =
                new AbortController();


            const abortSignal =
                window
                    .khataImportAbortController
                    .signal;


            try {

                /* =================================================
                   STEP 1 — SCAN
                ================================================= */

                throwIfKhataImportCancelled();


                updateKhataImportProgress(
                    5,
                    "Scanning Khata file...",
                    "Reading document"
                );


                console.log(
                    "STEP 1 → KHATA SCANNER"
                );


                console.log(
                    "Scanner input file:",
                    file.name,
                    file.size,
                    "bytes"
                );


                const scannedResult =
                    await scanKhataFile(
                        file,
                        abortSignal
                    );


                throwIfKhataImportCancelled();


                if (
                    !scannedResult
                ) {

                    throw new Error(
                        "Khata scanner returned no result."
                    );

                }


                transaction.scannedResult =
                    scannedResult;


                console.log(
                    "Khata scanner completed."
                );


                console.log(
                    "Pages scanned:",
                    scannedResult.pageCount
                );


                /* =================================================
                   STEP 2 — PARSE
                ================================================= */

                throwIfKhataImportCancelled();


                updateKhataImportProgress(
                    15,
                    "Reading scanned Khata data...",
                    "Preparing imported records"
                );


                await waitKhataAnimationFrame();


                throwIfKhataImportCancelled();


                console.log(
                    "STEP 2 → KHATA PARSER"
                );


                const parsedResult =
                    await parseKhataResult(
                        scannedResult
                    );


                throwIfKhataImportCancelled();


                if (
                    !Array.isArray(
                        parsedResult
                    )
                ) {

                    throw new Error(
                        "Khata parser did not return an array."
                    );

                }


                transaction.parsedResult =
                    parsedResult;


                transaction.temporaryRecords =
                    parsedResult;


                console.log(
                    "Parsed Khata records:",
                    parsedResult.length
                );


                /* =================================================
                   PARSER SUMMARY
                ================================================= */

                if (
                    typeof logKhataSummary ===
                    "function"
                ) {

                    throwIfKhataImportCancelled();


                    logKhataSummary(
                        parsedResult
                    );

                }


                /* =================================================
                   STEP 3 — RENDER
                ================================================= */

                throwIfKhataImportCancelled();


                transaction.rendererStarted =
                    true;


                updateKhataImportProgress(
                    20,
                    "Writing Khata data into editor...",
                    `Preparing ${parsedResult.length} records`
                );


                await waitKhataAnimationFrame();


                throwIfKhataImportCancelled();


                console.log(
                    "STEP 3 → KHATA RENDERER"
                );


                const mapped =
                    await mapParsedKhataToEditorProgressive(
                        parsedResult
                    );


                throwIfKhataImportCancelled();


                if (
                    !mapped
                ) {

                    throw new Error(
                        "KHATA_IMPORT_CANCELLED"
                    );

                }


                transaction.rendererCompleted =
                    true;


                /* =================================================
                   DOM VERIFICATION
                ================================================= */

                throwIfKhataImportCancelled();


                const editorType =
                    getActiveKhataEditor();


                let actualRows =
                    0;


                if (
                    editorType ===
                    "talapatrak"
                ) {

                    const body =
                        document.getElementById(
                            "talapatrakBody"
                        );


                    actualRows =
                        body
                            ? body.querySelectorAll(
                                "tr.talapatrakRow"
                              ).length
                            : 0;

                }


                else if (
                    editorType ===
                    "shikshanupakaran"
                ) {

                    const body =
                        document.getElementById(
                            "shikshanupakaranBody"
                        );


                    actualRows =
                        body
                            ? body.querySelectorAll(
                                "tr"
                              ).length
                            : 0;

                }


                console.log(
                    "KHATA IMPORT DOM VERIFICATION:",
                    {
                        editor:
                            editorType,

                        rows:
                            actualRows
                    }
                );


                throwIfKhataImportCancelled();


                /* =================================================
                   SUCCESS
                ================================================= */

                updateKhataImportProgress(
                    100,
                    "Khata data imported successfully!",
                    `${actualRows} records written into editor`
                );


                console.log(
                    "================================="
                );

                console.log(
                    "KHATA EDITOR UPLOAD COMPLETE"
                );

                console.log(
                    "Records physically in DOM:",
                    actualRows
                );

                console.log(
                    "================================="
                );


                /*
                   Give the user a short success display.

                   Cancellation can still interrupt this timer.
                */

                await new Promise(
                    function(resolve) {

                        window.khataImportTimer =
                            setTimeout(
                                function() {

                                    window.khataImportTimer =
                                        null;

                                    resolve();

                                },
                                800
                            );

                    }
                );


                throwIfKhataImportCancelled();


                /* =================================================
                   COMMIT
                ================================================= */

                transaction.committed =
                    true;


                transaction.temporaryRecords =
                    [];

                transaction.scannedResult =
                    null;

                transaction.parsedResult =
                    null;


                return true;

            }
            catch (error) {

                /* =================================================
                   CANCELLATION
                ================================================= */

                if (
                    isKhataImportCancelled() ||
                    (
                        error &&
                        error.message ===
                        "KHATA_IMPORT_CANCELLED"
                    )
                ) {

                    console.warn(
                        "================================="
                    );

                    console.warn(
                        "KHATA IMPORT STOPPED BY USER"
                    );

                    console.warn(
                        "================================="
                    );


                    return false;

                }


                /* =================================================
                   EMPTY FILE
                ================================================= */

                if (
                    error &&
                    error.message ===
                    "KHATA_FILE_EMPTY"
                ) {

                    console.error(
                        "Khata file is empty."
                    );


                    updateKhataImportProgress(
                        0,
                        "Khata file could not be read.",
                        "The selected file contains 0 bytes."
                    );


                    alert(
                        "The selected Khata file appears to be empty. Please select the PDF again."
                    );


                    return false;

                }


                /* =================================================
                   REAL ERROR
                ================================================= */

                console.error(
                    "KHATA EDITOR UPLOAD FAILED:",
                    error
                );


                updateKhataImportProgress(
                    0,
                    "Khata import failed.",
                    "Please check the console."
                );


                alert(
                    "Khata data could not be imported. Please check the console."
                );


                return false;

            }
            finally {

                /*
                   IMPORTANT:

                   From this point until the cleanup is complete,
                   another import must NOT be allowed to begin.
                */

                window.khataImportCleanupInProgress =
                    true;


                /* =================================================
                   DETERMINE CANCELLATION
                ================================================= */

                const wasCancelled =
                    window.khataImportCancellationRequested ||
                    window.khataImportCancelled ||
                    window.khataScanCancelled ||
                    (
                        transaction &&
                        transaction.cancelled
                    );


                /* =================================================
                   CANCELLED IMPORT → ROLLBACK
                ================================================= */

                if (
                    wasCancelled &&
                    transaction &&
                    !transaction.committed
                ) {
                
                    console.warn(
                        "================================="
                    );
                
                    console.warn(
                        "ROLLING BACK KHATA IMPORT"
                    );
                
                    console.warn(
                        "================================="
                    );
                
                
                    showKhataCancellingState(
                        "Discarding imported data..."
                    );
                
                
                    clearPartialKhataImport();
                
                
                    /* =============================================
                       RESTORE PRE-IMPORT EDITOR
                    ============================================= */
                
                    restoreKhataEditorSnapshot();
                
                
                    transaction.temporaryRecords =
                        [];
                
                    transaction.scannedResult =
                        null;
                
                    transaction.parsedResult =
                        null;
                
                
                    window.khataImportCancellationCompleted =
                        true;
                
                
                    showKhataCancellationComplete();
                
                
                    console.warn(
                        "Khata import rollback completed."
                    );
                
                }


                /* =================================================
                   STOP TIMER
                ================================================= */

                if (
                    window.khataImportTimer
                ) {

                    clearTimeout(
                        window.khataImportTimer
                    );

                    window.khataImportTimer =
                        null;

                }


                /* =================================================
                   RELEASE ABORT CONTROLLER
                ================================================= */

                window.khataImportAbortController =
                    null;


                /* =================================================
                   RESTORE CANCEL BUTTON
                ================================================= */

                const cancelButton =
                    document.getElementById(
                        "khataScanCancelButton"
                    );


                if (cancelButton) {

                    cancelButton.disabled =
                        false;


                    cancelButton.innerHTML = `
                        <i class="fa-solid fa-xmark"></i>
                        Cancel Import
                    `;

                }


                /* =================================================
                   FILE INPUT RESET
                ================================================= */

                const fileInput =
                    document.getElementById(
                        "khataFileInput"
                    );


                if (fileInput) {

                    try {

                        fileInput.value =
                            "";

                    }
                    catch (error) {

                        console.warn(
                            "Unable to reset Khata file input:",
                            error
                        );

                    }

                }


                /* =================================================
                   HIDE PROGRESS
                ================================================= */

                if (
                    typeof hideKhataScanProgress ===
                    "function"
                ) {

                    if (
                        wasCancelled
                    ) {

                        /*
                           Show cancellation message briefly,
                           then hide.
                        */

                        await new Promise(
                            function(resolve) {

                                window.khataImportTimer =
                                    setTimeout(
                                        function() {

                                            window.khataImportTimer =
                                                null;

                                            resolve();

                                        },
                                        900
                                    );

                            }
                        );


                        hideKhataScanProgress();

                    }
                    else {

                        hideKhataScanProgress();

                    }

                }


                /* =================================================
                   MARK IMPORT AS FINISHED
                ================================================= */

                window.khataImportInProgress =
                    false;


                /* =================================================
                   CLEAR TRANSACTION
                ================================================= */

                if (
                    window.khataImportTransaction ===
                    transaction
                ) {

                    window.khataImportTransaction =
                        null;

                }


                /* =================================================
                   RESET FLAGS LAST
                   
                   THIS IS VERY IMPORTANT.

                   Nothing should start a new import until all
                   previous cleanup above has completed.
                ================================================= */

                window.khataImportCancelled =
                    false;

                window.khataScanCancelled =
                    false;

                window.khataImportCancellationRequested =
                    false;

                window.khataImportCancellationCompleted =
                    false;


                /* =================================================
                   CLEANUP FINISHED
                ================================================= */

                window.khataImportCleanupInProgress =
                    false;


                console.log(
                    "================================="
                );

                console.log(
                    "KHATA IMPORT STATE CLEANED UP"
                );

                console.log(
                    "Ready for next Khata import."
                );

                console.log(
                    "================================="
                );

            }

        }
    );

}


/* ============================================================
   CONNECT KHATA UPLOAD BUTTONS
============================================================ */

function initializeKhataEditorUploadButtons() {

    console.log(
        "Initializing Khata editor upload buttons..."
    );


    /* ========================================================
       TALAPATRAK
    ======================================================== */

    const talapatrakButton =
        document.getElementById(
            "talapatrakKhataUploadButton"
        );


    if (
        talapatrakButton &&
        talapatrakButton.dataset.khataUploadConnected !==
            "true"
    ) {

        talapatrakButton.dataset.khataUploadConnected =
            "true";


        talapatrakButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();


                console.log(
                    "Talapatrak Khata Upload clicked."
                );


                handleKhataUploadForEditor();

            }
        );


        console.log(
            "Talapatrak Khata Upload connected."
        );

    }


    /* ========================================================
       SHIKSHANUPAKARAN
    ======================================================== */

    const shikshanupakaranButton =
        document.getElementById(
            "shikshanupakaranKhataUploadButton"
        );


    if (
        shikshanupakaranButton &&
        shikshanupakaranButton.dataset.khataUploadConnected !==
            "true"
    ) {

        shikshanupakaranButton.dataset.khataUploadConnected =
            "true";


        shikshanupakaranButton.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();


                console.log(
                    "Shikshanupakaran Khata Upload clicked."
                );


                handleKhataUploadForEditor();

            }
        );


        console.log(
            "Shikshanupakaran Khata Upload connected."
        );

    }


    /* ========================================================
       CONNECTION STATUS
    ======================================================== */

    console.log(
        "Khata upload button initialization complete.",
        {
            talapatrak:
                !!talapatrakButton,

            shikshanupakaran:
                !!shikshanupakaranButton
        }
    );

}


/* ============================================================
   EXPORT INITIALIZER
============================================================ */

window.initializeKhataEditorUploadButtons =
    initializeKhataEditorUploadButtons;


/* ============================================================
   SAFE INITIALIZATION
============================================================ */

function safelyInitializeKhataUploadButtons() {

    console.log(
        "Checking Khata upload buttons..."
    );


    const talapatrakButton =
        document.getElementById(
            "talapatrakKhataUploadButton"
        );


    const shikshanupakaranButton =
        document.getElementById(
            "shikshanupakaranKhataUploadButton"
        );


    console.log(
        "Talapatrak Khata button:",
        talapatrakButton
    );


    console.log(
        "Shikshanupakaran Khata button:",
        shikshanupakaranButton
    );


    initializeKhataEditorUploadButtons();

}


window.safelyInitializeKhataUploadButtons =
    safelyInitializeKhataUploadButtons;


/* ============================================================
   CONNECT CANCEL BUTTON
============================================================ */

function setupKhataCancelButton() {

    const cancelButton =
        document.getElementById(
            "khataScanCancelButton"
        );


    if (!cancelButton) {

        console.warn(
            "Khata Scan Cancel button not found."
        );

        return false;

    }


    if (
        cancelButton.dataset.cancelConnected ===
        "true"
    ) {

        return true;

    }


    cancelButton.dataset.cancelConnected =
        "true";


    cancelButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();

            event.stopPropagation();


            console.log(
                "================================="
            );

            console.log(
                "KHATA IMPORT CANCEL BUTTON CLICKED"
            );

            console.log(
                "================================="
            );


            cancelKhataImport();

        }
    );


    console.log(
        "Khata Cancel button connected."
    );


    return true;

}


/* ============================================================
   INITIALIZATION
============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function() {

            initializeKhataEditorUploadButtons();

            setupKhataCancelButton();

        }
    );

}
else {

    initializeKhataEditorUploadButtons();

    setupKhataCancelButton();

}


/* ============================================================
   MODULE READY
============================================================ */

console.log(
    "Khata Upload module loaded successfully."
);

console.log(
    "Cancel function available:",
    typeof window.cancelKhataImport ===
        "function"
);

console.log(
    "File picker available:",
    typeof openKhataFilePicker ===
        "function"
);