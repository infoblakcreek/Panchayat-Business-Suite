/* ============================================================
   KHATA SCANNER

   Responsible for:

   - Reading uploaded PDF/image data
   - Extracting PDF text
   - Detecting bad/garbled PDF text
   - Falling back to Gujarati OCR
   - Returning raw page-level text
   - Reporting cancellation progress

   NOT responsible for:

   - Finding Khata numbers
   - Selecting names
   - Generating sequences
   - Filling editor fields

   IMPORTANT CANCELLATION RULE:

   When the user presses Cancel:

       1. Stop starting new work
       2. Abort active PDF/OCR work where possible
       3. Do not return partial scan data
       4. Do not allow cancelled data to continue
       5. Keep the progress UI visible while stopping
       6. Tell the user that cancellation is happening

   ============================================================ */

console.log(
    "Khata Scanner module loaded"
);


/* ============================================================
   ACTIVE KHATA SCANNER RESOURCES

   These references allow cancellation to actively clean up
   currently running PDF/OCR operations.
============================================================ */

window.khataActivePDFLoadingTask =
    null;

window.khataActivePDF =
    null;

window.khataOCRWorkerActive =
    false;


/* ============================================================
   KHATA SCAN PROGRESS UI
============================================================ */

function updateKhataScanProgress(
    percent,
    status = "",
    pageText = ""
) {

    const overlay =
        document.getElementById(
            "khataScanProgressOverlay"
        );

    const fill =
        document.getElementById(
            "khataScanProgressFill"
        );

    const percentText =
        document.getElementById(
            "khataScanProgressPercent"
        );

    const statusText =
        document.getElementById(
            "khataScanProgressStatus"
        );

    const pageElement =
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


    if (fill) {

        fill.style.width =
            safePercent + "%";

    }


    if (percentText) {

        percentText.textContent =
            safePercent + "%";

    }


    if (statusText) {

        statusText.textContent =
            status;

    }


    /*
       IMPORTANT:

       Your current HTML contains the page/detail area
       around the Cancel button.

       Setting pageElement.textContent directly can destroy
       the Cancel button if the button is inside that element.

       Therefore we only update the text when the element
       does NOT contain a button.
    */

    if (pageElement) {

        const containsButton =
            pageElement.querySelector(
                "button"
            );


        if (!containsButton) {

            pageElement.textContent =
                pageText;

        }

    }

}


/* ============================================================
   SHOW SCANNER
============================================================ */

function showKhataScanProgress() {

    updateKhataScanProgress(
        0,
        "Preparing file...",
        ""
    );

}


/* ============================================================
   SHOW CANCELLING STATUS
============================================================ */

function showKhataCancellingProgress(
    detail = "Stopping current operation..."
) {

    const overlay =
        document.getElementById(
            "khataScanProgressOverlay"
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


    if (overlay) {

        overlay.style.display =
            "flex";

    }


    if (statusText) {

        statusText.textContent =
            "Cancelling Khata import...";

    }


    if (fill) {

        /*
           Keep the current visual progress.
           Do NOT jump back to 0 because that can make
           the user think the application restarted.
        */

        if (
            fill.style.width === ""
        ) {

            fill.style.width =
                "0%";

        }

    }


    if (percentText) {

        /*
           Keep the current percentage.
        */

    }


    /*
       Update the detail text safely without destroying
       the Cancel button.
    */

    const pageElement =
        document.getElementById(
            "khataScanProgressPage"
        );


    if (pageElement) {

        const containsButton =
            pageElement.querySelector(
                "button"
            );


        if (!containsButton) {

            pageElement.textContent =
                detail;

        }

    }

}


/* ============================================================
   HIDE SCANNER
============================================================ */

function hideKhataScanProgress() {

    const overlay =
        document.getElementById(
            "khataScanProgressOverlay"
        );


    if (overlay) {

        overlay.style.display =
            "none";

    }

}


/* ============================================================
   PDF.JS WORKER CONFIGURATION
============================================================ */

if (
    typeof pdfjsLib !== "undefined"
) {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

}


/* ============================================================
   OCR CONFIGURATION
============================================================ */

const KHATA_OCR_SCRIPT =
    "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";

const KHATA_OCR_LANG_PATH =
    "https://tessdata.projectnaptha.com/4.0.0/";


let khataOCRWorker =
    null;


let khataOCRLoading =
    null;


/* ============================================================
   CHECK CANCELLATION
============================================================ */

function khataScannerIsCancelled(
    abortSignal = null
) {

    return (

        window.khataScanCancelled === true

        ||

        window.khataImportCancelled === true

        ||

        (
            abortSignal &&
            abortSignal.aborted
        )

    );

}


/* ============================================================
   THROW CANCELLATION ERROR
============================================================ */

function throwIfKhataScannerCancelled(
    abortSignal = null
) {

    if (
        khataScannerIsCancelled(
            abortSignal
        )
    ) {

        throw new Error(
            "KHATA_IMPORT_CANCELLED"
        );

    }

}


/* ============================================================
   SMALL ASYNC YIELD

   Gives the browser a chance to process:

   - Cancel button clicks
   - UI updates
   - repaint
   - AbortController
============================================================ */

function khataScannerYield() {

    return new Promise(
        function(resolve) {

            setTimeout(
                resolve,
                0
            );

        }
    );

}


/* ============================================================
   LOAD TESSERACT.JS
============================================================ */

async function loadKhataOCRLibrary() {

    if (
        typeof Tesseract !== "undefined"
    ) {

        return Tesseract;

    }


    if (khataOCRLoading) {

        return await khataOCRLoading;

    }


    khataOCRLoading =
        new Promise(function(resolve, reject) {

            console.log(
                "Loading Gujarati OCR library..."
            );


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                KHATA_OCR_SCRIPT;


            script.async =
                true;


            script.onload =
                function() {

                    console.log(
                        "Gujarati OCR library loaded."
                    );


                    resolve(
                        window.Tesseract
                    );

                };


            script.onerror =
                function(error) {

                    console.error(
                        "Gujarati OCR library failed to load.",
                        error
                    );


                    reject(
                        new Error(
                            "Gujarati OCR library could not be loaded."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        });


    return await khataOCRLoading;

}


/* ============================================================
   CREATE GUJARATI OCR WORKER
============================================================ */

async function getKhataOCRWorker(
    abortSignal = null
) {

    throwIfKhataScannerCancelled(
        abortSignal
    );


    if (
        khataOCRWorker
    ) {

        khataOCRWorkerActive =
            true;


        return khataOCRWorker;

    }


    const Tesseract =
        await loadKhataOCRLibrary();


    throwIfKhataScannerCancelled(
        abortSignal
    );


    if (
        !Tesseract
    ) {

        throw new Error(
            "Tesseract.js is unavailable."
        );

    }


    console.log(
        "Creating Gujarati OCR worker..."
    );


    khataOCRWorker =
        await Tesseract.createWorker(
            "guj",
            1,
            {

                langPath:
                    KHATA_OCR_LANG_PATH,

                logger:
                    function(message) {

                        if (
                            message &&
                            message.status
                        ) {

                            console.log(
                                "Gujarati OCR:",
                                message.status,
                                message.progress
                                    ? Math.round(
                                        message.progress * 100
                                    ) + "%"
                                    : ""
                            );

                        }


                        /*
                           Cancellation is checked during
                           OCR progress reporting.
                        */

                        if (
                            khataScannerIsCancelled(
                                abortSignal
                            )
                        ) {

                            console.warn(
                                "Gujarati OCR cancellation detected."
                            );

                        }

                    }

            }
        );


    khataOCRWorkerActive =
        true;


    throwIfKhataScannerCancelled(
        abortSignal
    );


    console.log(
        "Gujarati OCR worker ready."
    );


    return khataOCRWorker;

}


/* ============================================================
   TERMINATE OCR WORKER
============================================================ */

async function terminateKhataOCRWorker() {

    const worker =
        khataOCRWorker;


    /*
       Clear the global reference immediately.

       This prevents another operation from accidentally
       reusing the cancelled worker.
    */

    khataOCRWorker =
        null;


    khataOCRWorkerActive =
        false;


    if (!worker) {

        return;

    }


    console.warn(
        "Terminating Gujarati OCR worker..."
    );


    try {

        if (
            typeof worker.terminate ===
            "function"
        ) {

            await worker.terminate();

        }

    }
    catch (error) {

        console.warn(
            "Gujarati OCR worker termination failed:",
            error
        );

    }


    console.log(
        "Gujarati OCR worker terminated."
    );

}


/* ============================================================
   DETECT BAD / GARBLED PDF TEXT
============================================================ */

function isKhataTextGarbled(text) {

    if (
        !text ||
        !text.trim()
    ) {

        return true;

    }


    const cleaned =
        text.trim();


    const gujaratiCount =
        (
            cleaned.match(
                /[\u0A80-\u0AFF]/g
            ) || []
        ).length;


    const replacementCount =
        (
            cleaned.match(
                /�/g
            ) || []
        ).length;


    const suspiciousCount =
        (
            cleaned.match(
                /[ƞƟƑƒƗƘƨƩƪƫƬƭƮƏƐƢƣƤƥƦƧ˲Ȣɀ²]/g
            ) || []
        ).length;


    const controlCount =
        (
            cleaned.match(
                /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g
            ) || []
        ).length;


    const latinCount =
        (
            cleaned.match(
                /[A-Za-z]/g
            ) || []
        ).length;


    /*
       Completely empty / non-Gujarati text.
    */

    if (
        gujaratiCount === 0
    ) {

        return true;

    }


    /*
       Replacement characters mean broken encoding.
    */

    if (
        replacementCount > 0
    ) {

        return true;

    }


    /*
       Suspicious encoded characters.
    */

    if (
        suspiciousCount >= 2
    ) {

        return true;

    }


    /*
       Control characters indicate broken extraction.
    */

    if (
        controlCount > 0
    ) {

        return true;

    }


    /*
       If a page contains a large amount of Latin/encoded
       garbage compared with Gujarati, consider it bad.
    */

    if (
        latinCount > gujaratiCount
    ) {

        return true;

    }


    return false;

}


/* ============================================================
   RENDER PDF PAGE TO CANVAS
============================================================ */

async function renderKhataPDFPage(
    page,
    scale = 2.0,
    abortSignal = null
) {

    throwIfKhataScannerCancelled(
        abortSignal
    );


    const viewport =
        page.getViewport({
            scale: scale
        });


    const canvas =
        document.createElement(
            "canvas"
        );


    const context =
        canvas.getContext(
            "2d"
        );


    canvas.width =
        Math.ceil(
            viewport.width
        );


    canvas.height =
        Math.ceil(
            viewport.height
        );


    try {

        throwIfKhataScannerCancelled(
            abortSignal
        );


        await page.render({

            canvasContext:
                context,

            viewport:
                viewport

        }).promise;


        throwIfKhataScannerCancelled(
            abortSignal
        );


        return canvas;

    }
    catch (error) {

        if (
            khataScannerIsCancelled(
                abortSignal
            )
        ) {

            throw new Error(
                "KHATA_IMPORT_CANCELLED"
            );

        }


        throw error;

    }

}


/* ============================================================
   OCR ONE PDF PAGE
============================================================ */

async function ocrKhataPDFPage(
    page,
    pageNumber,
    abortSignal = null
) {

    console.log(
        "Starting Gujarati OCR for page:",
        pageNumber
    );


    throwIfKhataScannerCancelled(
        abortSignal
    );


    const worker =
        await getKhataOCRWorker(
            abortSignal
        );


    let canvas =
        null;


    try {

        throwIfKhataScannerCancelled(
            abortSignal
        );


        updateKhataScanProgress(
            Math.max(
                0,
                Math.min(
                    99,
                    Number(
                        document
                            .getElementById(
                                "khataScanProgressPercent"
                            )?.textContent
                            ?.replace(
                                "%",
                                ""
                            ) || 0
                    )
                )
            ),
            "Gujarati OCR is reading this page...",
            `Reading page ${pageNumber}`
        );


        canvas =
            await renderKhataPDFPage(
                page,
                2.0,
                abortSignal
            );


        console.log(
            "Canvas rendered for OCR:",
            pageNumber,
            canvas.width,
            "x",
            canvas.height
        );


        throwIfKhataScannerCancelled(
            abortSignal
        );


        const result =
            await worker.recognize(
                canvas
            );


        /*
           Tesseract may not stop immediately when the
           AbortController is triggered.

           Therefore cancellation is checked immediately
           after recognize() returns.
        */

        throwIfKhataScannerCancelled(
            abortSignal
        );


        const text =
            result &&
            result.data &&
            result.data.text
                ? result.data.text.trim()
                : "";


        console.log(
            "Gujarati OCR completed:",
            pageNumber,
            "Characters:",
            text.length
        );


        return text;

    }
    finally {

        /*
           Release canvas immediately.
        */

        if (canvas) {

            canvas.width =
                1;


            canvas.height =
                1;


            if (
                canvas.parentNode
            ) {

                canvas.parentNode.removeChild(
                    canvas
                );

            }

        }


        canvas =
            null;


        await khataScannerYield();


        console.log(
            "OCR canvas released:",
            pageNumber
        );

    }

}


/* ============================================================
   CANCEL KHATA SCAN
============================================================ */

async function cancelKhataScan() {

    console.warn(
        "================================="
    );

    console.warn(
        "KHATA SCAN CANCELLATION REQUESTED"
    );

    console.warn(
        "================================="
    );


    /*
       SET FLAGS FIRST.

       This is the most important step.

       Every active scanner operation checks these flags.
    */

    window.khataScanCancelled =
        true;


    window.khataImportCancelled =
        true;


    /*
       Tell the user immediately that cancellation is
       actually happening.

       The overlay remains visible.
    */

    showKhataCancellingProgress(
        "Stopping scanner and OCR..."
    );


    /*
       Disable the Cancel button immediately.

       This prevents repeated clicks while the first
       cancellation request is being processed.
    */

    const cancelButtons =
        document.querySelectorAll(
            "#khataScanCancelButton"
        );


    cancelButtons.forEach(
        function(button) {

            button.disabled =
                true;


            button.innerHTML = `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Cancelling...
            `;

        }
    );


    /*
       AbortController belongs to the COMPLETE
       Khata import pipeline.
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
                "Unable to abort Khata controller:",
                error
            );

        }

    }


    /*
       Destroy active PDF loading task.

       This is useful if cancellation happens while
       pdfjsLib.getDocument() is still loading.
    */

    const loadingTask =
        window.khataActivePDFLoadingTask;


    if (
        loadingTask
    ) {

        try {

            console.warn(
                "Destroying active PDF loading task..."
            );


            if (
                typeof loadingTask.destroy ===
                "function"
            ) {

                await loadingTask.destroy();

            }

        }
        catch (error) {

            console.warn(
                "Active PDF loading task destroy failed:",
                error
            );

        }


        window.khataActivePDFLoadingTask =
            null;

    }


    /*
       Destroy active PDF document if available.
    */

    const activePDF =
        window.khataActivePDF;


    if (
        activePDF
    ) {

        try {

            console.warn(
                "Destroying active Khata PDF..."
            );


            if (
                typeof activePDF.destroy ===
                "function"
            ) {

                await activePDF.destroy();

            }

        }
        catch (error) {

            console.warn(
                "Active PDF destroy failed:",
                error
            );

        }


        window.khataActivePDF =
            null;

    }


    /*
       Terminate OCR worker.

       This is important because Tesseract recognition can
       continue working internally even after AbortController
       has been signalled.
    */

    if (
        khataOCRWorker
    ) {

        showKhataCancellingProgress(
            "Stopping Gujarati OCR..."
        );


        await terminateKhataOCRWorker();

    }


    /*
       Final scanner cancellation state.
    */

    showKhataCancellingProgress(
        "Khata import is stopping..."
    );


    console.warn(
        "Khata scanner cancellation cleanup requested."
    );


    console.warn(
        "================================="
    );

    console.warn(
        "KHATA SCAN CANCELLATION SIGNAL SENT"
    );

    console.warn(
        "================================="
    );

}


/* ============================================================
   EXPORT CANCEL SCANNER
============================================================ */

window.cancelKhataScan =
    cancelKhataScan;


/* ============================================================
   CHECK KHATA SCAN CANCELLATION
============================================================ */

function isKhataScanCancelled() {

    return (

        window.khataScanCancelled === true

        ||

        window.khataImportCancelled === true

        ||

        (
            window.khataImportAbortController &&
            window.khataImportAbortController.signal &&
            window.khataImportAbortController.signal.aborted
        )

    );

}


window.isKhataScanCancelled =
    isKhataScanCancelled;


/* ============================================================
   SCAN KHATA FILE
============================================================ */

async function scanKhataFile(
    file,
    abortSignal = null
) {

    if (!file) {

        throw new Error(
            "No Khata file was provided."
        );

    }


    /*
       If caller did not provide a signal,
       use the global import controller.
    */

    if (
        !abortSignal &&
        window.khataImportAbortController
    ) {

        abortSignal =
            window.khataImportAbortController.signal;

    }


    throwIfKhataScannerCancelled(
        abortSignal
    );


    console.log(
        "KHATA SCANNER STARTED"
    );


    console.log(
        "File:",
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


    /*
       PDF
    */

    if (
        file.type ===
        "application/pdf"
    ) {

        return await scanKhataPDF(
            file,
            abortSignal
        );

    }


    /*
       IMAGE
    */

    if (
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "image/webp"
    ) {

        return await scanKhataImage(
            file,
            abortSignal
        );

    }


    throw new Error(
        "Unsupported Khata file type."
    );

}


/* ============================================================
   SCAN PDF
============================================================ */

async function scanKhataPDF(
    file,
    abortSignal = null
) {

    if (
        typeof pdfjsLib === "undefined"
    ) {

        throw new Error(
            "PDF.js is not loaded."
        );

    }


    throwIfKhataScannerCancelled(
        abortSignal
    );


    console.log(
        "Reading Khata PDF..."
    );


    const arrayBuffer =
        await readKhataFileAsArrayBuffer(
            file
        );


    throwIfKhataScannerCancelled(
        abortSignal
    );


    /*
       Create PDF loading task separately.

       The task is stored globally so Cancel can destroy
       it while the PDF is still loading.
    */

    const loadingTask =
        pdfjsLib.getDocument({
            data: arrayBuffer
        });


    window.khataActivePDFLoadingTask =
        loadingTask;


    let pdf =
        null;


    try {

        throwIfKhataScannerCancelled(
            abortSignal
        );


        pdf =
            await loadingTask.promise;


        window.khataActivePDF =
            pdf;


        window.khataActivePDFLoadingTask =
            null;


        throwIfKhataScannerCancelled(
            abortSignal
        );


        console.log(
            "Khata PDF pages:",
            pdf.numPages
        );


        const pages =
            [];


        showKhataScanProgress();


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            /*
               BEFORE PAGE
            */

            throwIfKhataScannerCancelled(
                abortSignal
            );


            const progress =
                (
                    (pageNumber - 1) /
                    pdf.numPages
                ) * 100;


            updateKhataScanProgress(
                progress,
                "Scanning Khata pages...",
                `Page ${pageNumber} of ${pdf.numPages}`
            );


            /*
               Give browser time to process Cancel.
            */

            await khataScannerYield();


            throwIfKhataScannerCancelled(
                abortSignal
            );


            const page =
                await pdf.getPage(
                    pageNumber
                );


            try {

                /*
                   CHECK AFTER getPage()
                */

                throwIfKhataScannerCancelled(
                    abortSignal
                );


                const textContent =
                      await page.getTextContent();


              
                  
                  /*
                     CHECK AFTER TEXT EXTRACTION
                  */
                  
                  throwIfKhataScannerCancelled(
                      abortSignal
                  );
                  
                  
                  /* ========================================================
                     PRESERVE PDF TEXT POSITION
                  
                     IMPORTANT:
                  
                     DO NOT flatten PDF.js text items into one string only.
                  
                     Each item contains:
                     - str
                     - transform
                     - width
                     - height
                  
                     transform[4] = X position
                     transform[5] = Y position
                  
                     We preserve these so the parser can determine:
                  
                     - Khata number column
                     - Khatedar name column
                     - right-side columns
                     - footer
                  ======================================================== */
                  
                  const positionedItems =
                      textContent.items
                          .filter(
                              function(item) {
                  
                                  return (
                                      item &&
                                      typeof item.str === "string" &&
                                      item.str.trim().length > 0 &&
                                      Array.isArray(item.transform)
                                  );
                  
                              }
                          )
                          .map(
                              function(item) {
                  
                                  return {
                  
                                      text:
                                          item.str.trim(),
                  
                                      x:
                                          Number(
                                              item.transform[4]
                                          ) || 0,
                  
                                      y:
                                          Number(
                                              item.transform[5]
                                          ) || 0,
                  
                                      width:
                                          Number(
                                              item.width
                                          ) || 0,
                  
                                      height:
                                          Number(
                                              item.height
                                          ) || 0,
                  
                                      transform:
                                          item.transform.slice()
                  
                                  };
                  
                              }
                          );
                  



                  console.log(
                      "========== PDF POSITION DEBUG =========="
                  );
                  
                  console.table(
                      positionedItems.slice(
                          0,
                          100
                      )
                  );
                  
                  console.log(
                      "========== PDF POSITION DEBUG END =========="
                  );

              

              
                  /* ========================================================
                     KEEP THE OLD FLATTENED TEXT TOO
                  
                     This preserves your existing scanner/parser behavior
                     while giving the NEW parser the physical coordinates.
                  ======================================================== */
                  
                  const extractedText =
                      positionedItems
                          .map(
                              function(item) {
                  
                                  return item.text;
                  
                              }
                          )
                          .join(" ");


               const needsOCR =
                    isKhataTextGarbled(
                        extractedText
                    );
                
                
                console.log(
                    "PAGE TEXT QUALITY:",
                    pageNumber,
                    needsOCR
                        ? "GARBLED → OCR"
                        : "HEALTHY PDF TEXT"
                );
                    
                    
                    let finalText =
                        extractedText;
                    
                    let usedOCR =
                        false;
                    
                    let textSource =
                        "pdf";
                    
                    let ocrText =
                        "";


                /*
                   OCR FALLBACK
                */

                if (
                    needsOCR
                ) {

                    throwIfKhataScannerCancelled(
                        abortSignal
                    );


                    updateKhataScanProgress(
                        progress,
                        "Gujarati OCR is reading this page...",
                        `Page ${pageNumber} of ${pdf.numPages}`
                    );


                    try {

                        const ocrText =
                            await ocrKhataPDFPage(
                                page,
                                pageNumber,
                                abortSignal
                            );


                        throwIfKhataScannerCancelled(
                            abortSignal
                        );


                        if (
                              ocrText &&
                              ocrText.trim()
                          ) {
                          
                              finalText =
                                  ocrText.trim();
                          
                              usedOCR =
                                  true;
                          
                              textSource =
                                  "ocr";
                          
                          }

                    }
                    catch (ocrError) {

                        /*
                           IMPORTANT:

                           Never fall back to PDF text if the
                           reason for the OCR error was CANCEL.
                        */

                        if (
                            khataScannerIsCancelled(
                                abortSignal
                            ) ||
                            (
                                ocrError &&
                                ocrError.message ===
                                    "KHATA_IMPORT_CANCELLED"
                            )
                        ) {

                            console.warn(
                                "Khata OCR cancelled."
                            );


                            throw new Error(
                                "KHATA_IMPORT_CANCELLED"
                            );

                        }


                        console.error(
                            "Gujarati OCR failed:",
                            pageNumber,
                            ocrError
                        );


                        /*
                           Preserve your existing behavior:

                           If OCR genuinely fails for a
                           non-cancellation reason, keep
                           the original PDF.js text.
                        */

                        finalText =
                            extractedText;

                    }

                }


                /*
                   FINAL CHECK BEFORE SAVING PAGE
                */

                throwIfKhataScannerCancelled(
                    abortSignal
                );


                /*
                   SAVE PAGE ONLY AFTER ALL CHECKS PASS
                */

                pages.push({

                      pageNumber:
                          pageNumber,
                  
                      text:
                          finalText,
                  
                      /*
                         TRUE when this page was read using Gujarati OCR.
                      */
                      usedOCR:
                          usedOCR,
                  
                      /*
                         "pdf" = healthy PDF text
                         "ocr" = Gujarati OCR result
                      */
                      textSource:
                          textSource,
                  
                      /*
                         Original PDF.js positioned items.
                  
                         These are still preserved even when OCR was used,
                         but the parser will NOT trust them for name
                         extraction when usedOCR === true.
                      */
                      items:
                          positionedItems
                  
                  });


                updateKhataScanProgress(
                    (
                        pageNumber /
                        pdf.numPages
                    ) * 100,

                    needsOCR
                        ? "Reading page with Gujarati OCR..."
                        : "Reading Khata pages...",

                    `Page ${pageNumber} of ${pdf.numPages}`
                );


            }
            finally {

                if (
                    page &&
                    typeof page.cleanup ===
                    "function"
                ) {

                    try {

                        page.cleanup();

                    }
                    catch (error) {

                        console.warn(
                            "PDF page cleanup failed:",
                            error
                        );

                    }

                }

            }


            /*
               Give browser control before next page.
            */

            await khataScannerYield();


            throwIfKhataScannerCancelled(
                abortSignal
            );

        }


        /*
           FINAL CANCELLATION CHECK
        */

        throwIfKhataScannerCancelled(
            abortSignal
        );


        console.log(
            "KHATA PDF TEXT EXTRACTION COMPLETE"
        );


        updateKhataScanProgress(
            100,
            "Khata scanning completed!",
            `${pdf.numPages} pages processed`
        );


        return {

            type:
                "pdf",

            fileName:
                file.name,

            pageCount:
                pdf.numPages,

            pages:
                pages

        };

    }
    catch (error) {

        /*
           Cancellation must NEVER become a normal scanner
           error.
        */

        if (
            khataScannerIsCancelled(
                abortSignal
            ) ||
            (
                error &&
                error.message ===
                    "KHATA_IMPORT_CANCELLED"
            )
        ) {

            console.warn(
                "Khata PDF scan cancelled."
            );


            showKhataCancellingProgress(
                "Khata scanning stopped."
            );


            return null;

        }


        throw error;

    }
    finally {

        /*
           Clear active PDF loading reference.
        */

        if (
            window.khataActivePDFLoadingTask ===
            loadingTask
        ) {

            window.khataActivePDFLoadingTask =
                null;

        }


        /*
           PDF cleanup
        */

        if (
            pdf &&
            typeof pdf.cleanup ===
            "function"
        ) {

            try {

                await pdf.cleanup();

            }
            catch (error) {

                console.warn(
                    "PDF cleanup failed:",
                    error
                );

            }

        }


        /*
           PDF destroy
        */

        if (
            pdf &&
            typeof pdf.destroy ===
            "function"
        ) {

            try {

                await pdf.destroy();

            }
            catch (error) {

                console.warn(
                    "PDF destroy failed:",
                    error
                );

            }

        }


        if (
            window.khataActivePDF ===
            pdf
        ) {

            window.khataActivePDF =
                null;

        }

    }

}


/* ============================================================
   SCAN IMAGE
============================================================ */

async function scanKhataImage(
    file,
    abortSignal = null
) {

    console.log(
        "Khata image received."
    );


    throwIfKhataScannerCancelled(
        abortSignal
    );


    try {

        const worker =
            await getKhataOCRWorker(
                abortSignal
            );


        throwIfKhataScannerCancelled(
            abortSignal
        );


        updateKhataScanProgress(
            50,
            "Gujarati OCR is reading the image...",
            "Processing image"
        );


        await khataScannerYield();


        throwIfKhataScannerCancelled(
            abortSignal
        );


        const result =
            await worker.recognize(
                file
            );


        /*
           Check immediately after OCR.
        */

        throwIfKhataScannerCancelled(
            abortSignal
        );


        const text =
            result &&
            result.data &&
            result.data.text
                ? result.data.text.trim()
                : "";


        console.log(
            "Gujarati image OCR completed."
        );


        return {

            type:
                "image",

            fileName:
                file.name,

            pageCount:
                1,

            pages: [

                {

                    pageNumber:
                        1,

                    text:
                        text

                }

            ]

        };

    }
    catch (error) {

        if (
            khataScannerIsCancelled(
                abortSignal
            ) ||
            (
                error &&
                error.message ===
                    "KHATA_IMPORT_CANCELLED"
            )
        ) {

            console.warn(
                "Khata image OCR cancelled."
            );


            showKhataCancellingProgress(
                "Image scanning stopped."
            );


            return null;

        }


        console.error(
            "Gujarati image OCR failed:",
            error
        );


        throw error;

    }

}


/* ============================================================
   EXPORT SCANNER
============================================================ */

window.scanKhataFile =
    scanKhataFile;


/* ============================================================
   EXPORT PROGRESS FUNCTIONS
============================================================ */

window.updateKhataScanProgress =
    updateKhataScanProgress;


window.showKhataScanProgress =
    showKhataScanProgress;


window.showKhataCancellingProgress =
    showKhataCancellingProgress;


window.hideKhataScanProgress =
    hideKhataScanProgress;


/* ============================================================
   SCANNER READY
============================================================ */

console.log(
    "Khata Scanner ready."
);