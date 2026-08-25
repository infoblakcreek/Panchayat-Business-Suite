/* ============================================================
   KHATA PARSER

   Responsible for:

   - Reading raw page-level text from Khata Scanner
   - Finding ALL Khata numbers
   - Normalizing extracted Khata numbers
   - Extracting FIRST Khata holder name
   - Returning structured Khata records

   FIXES INCLUDED:

   - Isolates individual Khata section before name extraction
   - Prevents footer extraction
   - Prevents right-column header extraction
   - Always selects first valid holder name
   - Keeps cancellation support
============================================================ */


console.log(
    "Khata Parser module loaded"
);



/* ============================================================
   KHATA CANCELLATION HELPER
============================================================ */

function throwIfKhataParserCancelled(){

    if(
        typeof isKhataImportCancelled ===
        "function"
    ){

        if(
            isKhataImportCancelled()
        ){

            throw new Error(
                "KHATA_IMPORT_CANCELLED"
            );

        }

    }


    if(
        window.khataImportCancelled === true ||
        window.khataScanCancelled === true
    ){

        throw new Error(
            "KHATA_IMPORT_CANCELLED"
        );

    }


    if(
        window.khataImportAbortController &&
        window.khataImportAbortController.signal &&
        window.khataImportAbortController.signal.aborted
    ){

        throw new Error(
            "KHATA_IMPORT_CANCELLED"
        );

    }

}




/* ============================================================
   BROWSER YIELD
============================================================ */

function waitForKhataParserYield(){

    return new Promise(
        function(resolve){

            if(
                typeof requestAnimationFrame ===
                "function"
            ){

                requestAnimationFrame(
                    function(){

                        resolve();

                    }
                );

            }
            else{

                setTimeout(
                    resolve,
                    0
                );

            }

        }
    );

}




/* ============================================================
   MAIN PARSER
============================================================ */

async function parseKhataResult(result){


    throwIfKhataParserCancelled();



    if(
        !result ||
        !Array.isArray(result.pages)
    ){

        throw new Error(
            "Invalid Khata scanner result."
        );

    }



    console.log(
        "KHATA PARSER STARTED"
    );


    console.log(
        "Pages received:",
        result.pages.length
    );



    const records = [];



    for(
        let pageIndex = 0;
        pageIndex < result.pages.length;
        pageIndex++
    ){


        throwIfKhataParserCancelled();


        await waitForKhataParserYield();


        throwIfKhataParserCancelled();



        const page =
            result.pages[pageIndex];

       

        if(!page){

            continue;

        }



       const text =
            page.text || "";
        
        
        const khataNumbers =
            extractKhataNumbers(
                text
            );



        for(
            let khataIndex = 0;
            khataIndex < khataNumbers.length;
            khataIndex++
        ){


            throwIfKhataParserCancelled();



            const khataNumber =
                khataNumbers[
                    khataIndex
                ];



            /*
               IMPORTANT FIX

               Previously:

               whole page → name extractor

               Now:

               only this Khata block → name extractor

            */


            let name = "";

            let khataSection = "";

            
            
            /* ========================================================
                   NAME EXTRACTION
                
                   IMPORTANT:
                   Use physical PDF positions first.
                
                   This prevents the FIRST Khata on a page from
                   accidentally taking text that appears above it
                   in the raw PDF text order.
                ======================================================== */
                
                if (
                      page.usedOCR === true ||
                      page.textSource === "ocr"
                  ) {
                  
                      /*
                         OCR text is authoritative for this page.
                  
                         Do NOT use the original PDF positional items
                         because they were detected as garbled.
                      */
                  
                      khataSection =
                          extractIndividualKhataSection(
                              text,
                              khataNumber
                          );
                  
                      name =
                          extractKhataName(
                              khataSection,
                              khataNumber
                          );
      
                        }
                        else if (
                            Array.isArray(page.items) &&
                            page.items.length > 0
                        ) {
                        
                            /*
                               PDF text is healthy.
                               Positional extraction is safest.
                            */
                        
                            name =
                                extractKhataNameFromPositionedItems(
                                    page.items,
                                    khataNumber
                                );
                        
                        }
                        
                        
                        if (!name) {
                        
                            /*
                               Final fallback.
                            */
                        
                            khataSection =
                                extractIndividualKhataSection(
                                    text,
                                    khataNumber
                                );
                        
                            name =
                                extractKhataName(
                                    khataSection,
                                    khataNumber
                                );
                        
                        }



            records.push({

                pageNumber:
                    page.pageNumber,

                khataNumber:
                    khataNumber,

                name:
                    name,

                rawText:
                    khataSection || text,

                isPlaceholder:
                    false

            });



            console.log(
                "Khata:",
                khataNumber,
                "→ Name:",
                name || "(empty)"
            );


        }



        console.log(
            "Page",
            page.pageNumber,
            "→",
            khataNumbers.length,
            "Khata numbers"
        );



    }




    /* ========================================================
       CREATE MISSING KHATA NUMBERS
    ======================================================== */


    throwIfKhataParserCancelled();



    const existingNumbers =
        new Set();



    records.forEach(
        function(record){


            const numeric =
                gujaratiToEnglishNumber(
                    record.khataNumber
                );



            if(
                numeric !== null
            ){

                existingNumbers.add(
                    numeric
                );

            }


        }
    );



    if(
        existingNumbers.size >= 2
    ){


        const sorted =
            Array.from(
                existingNumbers
            )
            .sort(
                (a,b)=>a-b
            );



        const first =
            sorted[0];


        const last =
            sorted[
                sorted.length-1
            ];



        for(
            let number = first;
            number <= last;
            number++
        ){


            if(
                number % 25 === 0
            ){

                await waitForKhataParserYield();

                throwIfKhataParserCancelled();

            }



            if(
                existingNumbers.has(
                    number
                )
            ){

                continue;

            }



            records.push({

                pageNumber:
                    null,

                khataNumber:
                    englishToGujaratiNumber(
                        number
                    ),

                name:
                    "",

                rawText:
                    "",

                isPlaceholder:
                    true

            });


        }


    }



    records.sort(
        function(a,b){

            return (
                gujaratiToEnglishNumber(
                    a.khataNumber
                )
                -
                gujaratiToEnglishNumber(
                    b.khataNumber
                )
            );

        }
    );



    console.log(
        "KHATA PARSER COMPLETE"
    );


    console.log(
        "Total Khata:",
        records.length
    );



    return records;

}



/* ============================================================
   KHATA NUMBER EXTRACTION
============================================================ */

function extractKhataNumbers(text){

    if(
        !text
    ){

        return [];

    }


    const regex =
        /ખાતા\s*નંબર\s*[:：]?\s*([૦-૯0-9Xx]+)/gi;


    const matches =
        text.matchAll(
            regex
        );


    const numbers = [];


    for(
        const match of matches
    ){

        if(
            !match[1]
        ){

            continue;

        }


        let number =
            match[1]
                .trim();


        number =
            number.replace(
                /[Xx]/g,
                "૫"
            );


        number =
            number.replace(
                /[^૦-૯0-9]/g,
                ""
            );


        if(
            number
        ){

            numbers.push(
                number
            );

        }

    }


    return [
        ...new Set(numbers)
    ];

}




/* ============================================================
   ISOLATE ONE KHATA BLOCK

   IMPORTANT FIX

   Prevents:
   - next Khata name mixing
   - footer mixing
   - column mixing

============================================================ */


/* ============================================================
   ISOLATE ONE KHATA BLOCK

   STRICT RULE:

   A Khata section MUST start at:

       ખાતા નંબર XXXXX

   NOTHING BEFORE THAT HEADER is allowed.

   The section ends immediately before the next:

       ખાતા નંબર XXXXX

============================================================ */

function extractIndividualKhataSection(
    text,
    khataNumber
){

    if(
        !text ||
        !khataNumber
    ){

        return "";

    }


    /* ========================================================
       NORMALIZE TARGET NUMBER
    ======================================================== */

    const normalizedKhataNumber =
        String(khataNumber)
            .replace(
                /[Xx]/g,
                "૫"
            )
            .trim();


    /* ========================================================
       FIND EXACT KHATA HEADER

       IMPORTANT:

       We require the WORD "ખાતા" + "નંબર"

       We do NOT search for the number by itself.
    ======================================================== */

    const startRegex =
        new RegExp(
            "ખાતા\\s*નંબર\\s*[:：]?\\s*" +
            normalizedKhataNumber +
            "(?=\\s|$)",
            "i"
        );


    const startMatch =
        text.match(
            startRegex
        );


    if(
        !startMatch
    ){

        console.warn(
            "KHATA SECTION START NOT FOUND:",
            khataNumber
        );

        return "";

    }


    /* ========================================================
       START EXACTLY AFTER KHATA HEADER
    ======================================================== */

    const startIndex =
        startMatch.index +
        startMatch[0].length;


    let section =
        text.substring(
            startIndex
        );


    /* ========================================================
       FIND NEXT KHATA HEADER

       IMPORTANT:

       We again require:

           ખાતા નંબર

       We do NOT stop at a random number.
    ======================================================== */

    const nextKhataRegex =
        /ખાતા\s*નંબર\s*[:：]?\s*[૦-૯0-9Xx]+/i;


    const nextMatch =
        section.match(
            nextKhataRegex
        );


    if(
        nextMatch
    ){

        section =
            section.substring(
                0,
                nextMatch.index
            );

    }


    /* ========================================================
       DEBUG

       This lets us verify exactly what belongs to
       this Khata.
    ======================================================== */

    console.log(
        "================================================"
    );

    console.log(
        "KHATA SECTION:",
        khataNumber
    );

    console.log(
        "SECTION START INDEX:",
        startIndex
    );

    console.log(
        "NEXT KHATA FOUND:",
        !!nextMatch
    );

    console.log(
        "SECTION TEXT:",
        section
    );

    console.log(
        "================================================"
    );


    return section.trim();

}





/* ============================================================
   SHARED KHATA BLOCKED-WORD CHECK
============================================================ */

const KHATA_BLOCKED_WORDS = [

    "ખાતા",
    "ખાતેદાર",
    "નામ",
    "સરવે",
    "સર્વે",
    "જમીન",
    "વિગત",
    "ક્ષેત્રફળ",
    "ગામ",
    "તાલુકો",
    "જીલ્લો",
    "જિલ્લો",
    "હિસ્સો",
    "પૈકી",

    "માંગણું",
    "માંગણી",
    "છૂટની",
    "રકમ",
    "ચોખ્ખું",
    "લેવા પાત્ર",
    "ગત સાલનું",
    "જાદેવસૂલાત",
    "ખરેખર",
    "વસૂલ",
    "બિન હુકમી",
    "બાકી",
    "શેરો",
    "કુલ",
    "એકંદર",

    "સરકારી",
    "ખેતી",
    "સિવાય",
    "કાયમનું",
    "લોકલ",
    "ફંડ",
    "ફરતી",

    "પાવતી",
    "તારીખ",
    "મુજબ",

    "સૌજન્ય",
    "રાષ્ટ્રીય",
    "સૂચના",
    "વિજ્ઞાન",
    "કેન્દ્ર",
    "ગુજરાત રાજ્ય",

    "પાના",
    "પાના નં",

    "પ્રિન્ટ",
    "પ્રિન્ટ કરનાર",
    "પ્રિન્ટ કરવાનો હેતુ"

];


function isKhataBlockedWord(
    value
) {

    if (!value) {

        return false;

    }


    const text =
        String(value);


    for (
        let i = 0;
        i < KHATA_BLOCKED_WORDS.length;
        i++
    ) {

        if (
            text.includes(
                KHATA_BLOCKED_WORDS[i]
            )
        ) {

            return true;

        }

    }


    return false;

}
/* ============================================================
   EXTRACT FIRST KHATA HOLDER NAME

   FINAL RULE:

   A holder row MUST START WITH A NUMBER.

   Examples:

       1. રમેશભાઈ પટેલ
       3. મહેશભાઈ પટેલ
       6. રમિલાબેન પટેલ
       7. કમલેશભાઈ પટેલ
       12. હસમુખભાઈ પટેલ

   The number does NOT matter.

   We take ONLY the FIRST numbered holder row.

   IMPORTANT:

   Lines without a leading number are NEVER accepted
   as a holder name.

   Therefore:

       some header
       another text
       6. રમેશભાઈ પટેલ
       7. મહેશભાઈ પટેલ

   becomes:

       રમેશભાઈ પટેલ
============================================================ */

function extractKhataName(
    section,
    khataNumber
){

    if(!section){
        return "";
    }


    const lines =
        section
            .split(/\r?\n/)
            .map(function(line){

                return line
                    .replace(/\s+/g, " ")
                    .trim();

            })
            .filter(Boolean);


    function isOnlyNumber(value){

        const cleaned =
            String(value)
                .replace(/\s+/g, "")
                .replace(/[()]/g, "");

        return /^[૦-૯0-9./,:;\-]+$/.test(
            cleaned
        );

    }


    function isNumberedHolderLine(value){

        return /^[૦-૯0-9]+\s*[.)-]\s*\S+/.test(
            value
        );

    }


    function cleanHolderName(value){

        let name =
            String(value)
                .replace(/\s+/g, " ")
                .trim();


        /*
           Remove holder serial number.

           ૧. નામ
           2. નામ
           12. નામ
        */

        name =
            name.replace(
                /^[૦-૯0-9]+\s*[.)-]\s*/,
                ""
            )
            .trim();


        /*
           IMPORTANT:

           Stop at the holder reference.

           Example:

           જશીબહેન શંકરભાઈ પટેલ (૫૪૦૪)
           →
           જશીબહેન શંકરભાઈ પટેલ
        */

        name =
            name.split(
                /\s*\([^)]*\)/
            )[0]
            .trim();


        /*
           Stop when land/survey data begins.

           Example:

           ઠક્કર બીનાબેન ... યોગેશભાઇ
           ૨૩૮/ પૈકી...

           becomes:

           ઠક્કર બીનાબેન ... યોગેશભાઇ
        */

        name =
            name.split(
                /\s+[૦-૯0-9]+\s*(?:[/.-]|(?=\s)|$)/
            )[0]
            .trim();


        /*
           Remove trailing separators.
        */

        name =
            name
                .replace(
                    /[|,:;.\-]+$/,
                    ""
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        return name;

    }


    function isValidHolderName(name){

        if(!name){
            return false;
        }


        if(name.length < 3){
            return false;
        }


        if(name.length > 150){
            return false;
        }


        if(isOnlyNumber(name)){
            return false;
        }


        /*
           Check blocked words ONLY AFTER
           land/reference data has been removed.
        */

        if(
            isKhataBlockedWord(name)
        ){
            return false;
        }


        if(
            !/[અ-હળ-ૐA-Za-z]/.test(name)
        ){
            return false;
        }


        return true;

    }


    /*
       FIRST numbered holder wins.
    */

    for(
        let i = 0;
        i < lines.length;
        i++
    ){

        throwIfKhataParserCancelled();


        const line =
            lines[i];


        console.log(
            "KHATA SECTION LINE:",
            khataNumber,
            "→",
            line
        );


        /*
           Do NOT run isKhataBlockedWord()
           against the complete row.

           A legitimate row can contain:

               પૈકી
               સરવે data
               કુલ
               etc.

           Those are not part of the person's name.
        */

        if(
            !isNumberedHolderLine(line)
        ){

            continue;

        }


        const candidate =
            cleanHolderName(
                line
            );


        console.log(
            "CLEANED HOLDER CANDIDATE:",
            khataNumber,
            "→",
            candidate
        );


        if(
            !isValidHolderName(candidate)
        ){

            continue;

        }


        console.log(
            "FIRST HOLDER FOUND:",
            khataNumber,
            "→",
            candidate
        );


        return candidate;

    }


    console.warn(
        "NO NUMBERED HOLDER FOUND:",
        khataNumber
    );


    return "";

}




/* ============================================================
   POSITIONAL KHATA NAME EXTRACTION

   NAME RULES
   ------------------------------------------------------------

   1. Find the Khata number.

   2. Look ONLY BELOW that Khata number.

   3. The holder names are listed below the Khata number.

   4. There can be ANY number of holders:
        1. Name A
        2. Name B
        6. Name C
        7. Name D

   5. The number in front of the name does NOT matter.

      Examples:
        1. રameshbhai
        3. મહેશભાઈ
        6. રમિલાબેન
        7. કમલેશભાઈ

      ALL are valid.

   6. Take ONLY THE FIRST HOLDER NAME.

   7. Remove the number in front of that first name.

      Example:
        "6. રમેશભાઈ પટેલ"
        becomes:
        "રમેશભાઈ પટેલ"

   8. Remove numbers appearing AFTER the name.

      Example:
        "રમેશભાઈ પટેલ (૫૩૩૧) ૩૮૩ ૦-૯૫-૧૩ ૩.૧૨"
        becomes:
        "રમેશભાઈ પટેલ"

   9. Do NOT take:
        - page header
        - table header
        - footer
        - financial columns
        - next Khata
        - second/third holder
        - numbers by themselves

   10. The FIRST valid holder line BELOW the Khata number
       wins.

============================================================ */

/* ============================================================
   POSITIONAL KHATA NAME EXTRACTION — FIXED

   PURPOSE
   ------------------------------------------------------------
   Finds the FIRST HOLDER NAME belonging to THIS Khata only.

   IMPORTANT RULES:

   1. Find the physical position of the Khata number.

   2. Find the next Khata number on the page.

   3. Create a physical region between those two Khatas.

   4. Search ONLY inside that region.

   5. Do NOT require the holder name to start with 1., 2., 3.

   6. The first valid Gujarati/name-like line is selected.

   7. Do not steal names from another Khata.

   8. Do not search an arbitrary 300px area.

============================================================ */

function extractKhataNameFromPositionedItems(
    items,
    khataNumber
) {

    if (
        !Array.isArray(items) ||
        items.length === 0 ||
        !khataNumber
    ) {
        return "";
    }


    /* ========================================================
       TARGET KHATA NUMBER
    ======================================================== */

    const targetEnglish =
        gujaratiToEnglishNumber(
            String(khataNumber)
                .replace(/[Xx]/g, "૫")
                .trim()
        );


    if (
        targetEnglish === null
    ) {
        return "";
    }


    /* ========================================================
       CLEAN PDF ITEMS
    ======================================================== */

    const cleanItems =
        items
            .filter(function(item) {

                return (
                    item &&
                    typeof item.text === "string" &&
                    item.text.trim() &&
                    Number.isFinite(item.x) &&
                    Number.isFinite(item.y)
                );

            })
            .map(function(item) {

                return {

                    text:
                        item.text
                            .replace(/\s+/g, " ")
                            .trim(),

                    x:
                        Number(item.x),

                    y:
                        Number(item.y),

                    width:
                        Number(item.width) || 0,

                    height:
                        Number(item.height) || 0

                };

            });


    if (
        cleanItems.length === 0
    ) {
        return "";
    }


    /* ========================================================
       NUMBER NORMALIZER
    ======================================================== */

    function normalizeDigits(text) {

        return String(text)
            .replace(
                /[૦-૯]/g,
                function(digit) {

                    return gujaratiToEnglishNumber(
                        digit
                    );

                }
            );

    }


    /* ========================================================
       FIND KHATA NUMBER ITEMS

       We search for actual Khata-number text.

       IMPORTANT:
       Do NOT confuse random numbers in the document
       with Khata numbers.
    ======================================================== */

    const khataPositions = [];


    for (
        let i = 0;
        i < cleanItems.length;
        i++
    ) {

        const item =
            cleanItems[i];


        const normalized =
            normalizeDigits(
                item.text
            );


        /* ----------------------------------------------------
           CASE 1

           "ખાતા નંબર ૧૦૦૫"
        ---------------------------------------------------- */

        const combinedMatch =
            normalized.match(
                /ખાતા\s*નંબર\s*[:：]?\s*(\d+)/i
            );


        if (
            combinedMatch
        ) {

            khataPositions.push({

                item:
                    item,

                number:
                    Number(
                        combinedMatch[1]
                    )

            });

            continue;

        }


        /* ----------------------------------------------------
           CASE 2

           "ખાતા નંબર"

           and

           "૧૦૦૫"

           are separate PDF items.
        ---------------------------------------------------- */

        if (
            /ખાતા\s*નંબર/i.test(
                normalized
            )
        ) {

            for (
                let j = 0;
                j < cleanItems.length;
                j++
            ) {

                const candidate =
                    cleanItems[j];


                const candidateNormalized =
                    normalizeDigits(
                        candidate.text
                    ).trim();


                if (
                    !/^\d+$/.test(
                        candidateNormalized
                    )
                ) {
                    continue;
                }


                if (
                    Number(candidateNormalized) !==
                    targetEnglish
                ) {

                    /*
                       Don't need this one for the target,
                       but it may be another Khata.
                    */

                    continue;

                }


                const sameLine =
                    Math.abs(
                        candidate.y -
                        item.y
                    ) <= 12;


                const nearby =
                    Math.abs(
                        candidate.x -
                        item.x
                    ) <= 250;


                if (
                    sameLine &&
                    nearby
                ) {

                    khataPositions.push({

                        item:
                            candidate,

                        number:
                            targetEnglish

                    });

                    break;

                }

            }

        }

    }


    /* ========================================================
       IF WE DIDN'T FIND THE TARGET THROUGH THE ABOVE METHOD,
       FALL BACK TO EXACT NUMERIC ITEM SEARCH.

       This is ONLY a fallback.
    ======================================================== */

    let khataItem = null;


    for (
        let i = 0;
        i < khataPositions.length;
        i++
    ) {

        if (
            khataPositions[i].number ===
            targetEnglish
        ) {

            khataItem =
                khataPositions[i].item;

            break;

        }

    }


    if (
        !khataItem
    ) {

        /*
           Fallback: exact numeric PDF item.
        */

        for (
            let i = 0;
            i < cleanItems.length;
            i++
        ) {

            const normalized =
                normalizeDigits(
                    cleanItems[i].text
                ).trim();


            if (
                /^\d+$/.test(normalized) &&
                Number(normalized) ===
                    targetEnglish
            ) {

                khataItem =
                    cleanItems[i];

                break;

            }

        }

    }


    if (
        !khataItem
    ) {

        console.warn(
            "KHATA POSITION NOT FOUND:",
            khataNumber
        );

        return "";

    }


    console.log(
        "=========================================="
    );

    console.log(
        "KHATA POSITION FOUND:",
        khataNumber
    );

    console.log(
        "X:",
        khataItem.x,
        "Y:",
        khataItem.y
    );

    console.log(
        "TEXT:",
        khataItem.text
    );

    console.log(
        "=========================================="
    );


    /* ========================================================
       FIND ALL KHATA POSITIONS ON THIS PAGE

       This is CRITICAL.

       We need to know where THIS Khata ends.

       We must NOT use a fixed 300px search distance.
    ======================================================== */

    const allKhataPositions = [];


    for (
        let i = 0;
        i < cleanItems.length;
        i++
    ) {

        const item =
            cleanItems[i];


        const normalized =
            normalizeDigits(
                item.text
            ).trim();


        /*
           Combined:

               ખાતા નંબર ૧૦૦૫
        */

        const combined =
            normalized.match(
                /ખાતા\s*નંબર\s*[:：]?\s*(\d+)/i
            );


        if (
            combined
        ) {

            allKhataPositions.push({

                number:
                    Number(
                        combined[1]
                    ),

                item:
                    item

            });

        }

    }


    /*
       Sort visually from top to bottom.

       PDF.js:
       Higher Y = visually higher.
    */

    allKhataPositions.sort(
        function(a, b) {

            return b.item.y - a.item.y;

        }
    );


    /* ========================================================
       FIND NEXT KHATA BELOW CURRENT KHATA

       IMPORTANT:

       We use physical position, NOT Khata number.

       This means even if Khata numbers are weird,
       the physical document structure remains correct.
    ======================================================== */

    let nextKhataItem = null;


    for (
        let i = 0;
        i < allKhataPositions.length;
        i++
    ) {

        const candidate =
            allKhataPositions[i].item;


        /*
           Candidate must be visually below current Khata.
        */

        if (
            candidate.y <
            khataItem.y - 2
        ) {

            /*
               Prefer the closest next Khata.
            */

            if (
                !nextKhataItem ||
                candidate.y >
                nextKhataItem.y
            ) {

                nextKhataItem =
                    candidate;

            }

        }

    }


    console.log(
        "CURRENT KHATA:",
        khataNumber,
        "| Y:",
        khataItem.y
    );


    console.log(
        "NEXT KHATA:",
        nextKhataItem
            ? nextKhataItem.text
            : "(none)"
    );


    console.log(
        "NEXT KHATA Y:",
        nextKhataItem
            ? nextKhataItem.y
            : "(end of page)"
    );


    /* ========================================================
       CREATE PHYSICAL KHATA REGION

       Current:

           Y = 600

       Next:

           Y = 550

       Therefore the current Khata owns:

           600 → 550

       The next Khata's content is NOT included.
    ======================================================== */

    const currentY =
        khataItem.y;


    const nextY =
        nextKhataItem
            ? nextKhataItem.y
            : -Infinity;


    const regionItems =
        cleanItems
            .filter(function(item) {

                /*
                   Must be visually below current Khata.
                */

                if (
                    item.y >=
                    currentY - 2
                ) {

                    return false;

                }


                /*
                   Must remain ABOVE the next Khata.

                   If there is no next Khata,
                   everything below current Khata
                   is allowed until page end.
                */

                if (
                    nextKhataItem &&
                    item.y <=
                    nextY + 2
                ) {

                    return false;

                }


                return true;

            });


    console.log(
        "KHATA REGION ITEMS:",
        khataNumber,
        regionItems.length
    );


    /* ========================================================
       HOLDER NAME COLUMN

       The holder name normally appears to the RIGHT
       of the Khata number.

       We therefore avoid unrelated text far away
       on the left/right side.
    ======================================================== */

    const khataX =
        khataItem.x;


    /*
       Do not make this too narrow.

       PDF layouts vary.

       We allow text reasonably to the right
       of the Khata number.
    */

    const minNameX =
        khataX - 10;


    const maxNameX =
        khataX + 450;


    const candidateItems =
        regionItems
            .filter(function(item) {

                return (
                    item.x >= minNameX &&
                    item.x <= maxNameX
                );

            });


    /* ========================================================
       GROUP INTO PHYSICAL LINES
    ======================================================== */

    const lines = [];


    for (
        let i = 0;
        i < candidateItems.length;
        i++
    ) {

        const item =
            candidateItems[i];


        let line =
            null;


        for (
            let j = 0;
            j < lines.length;
            j++
        ) {

            if (
                Math.abs(
                    lines[j].y -
                    item.y
                ) <= 4
            ) {

                line =
                    lines[j];

                break;

            }

        }


        if (
            !line
        ) {

            line = {

                y:
                    item.y,

                items:
                    []

            };


            lines.push(
                line
            );

        }


        line.items.push(
            item
        );

    }


    /*
       Top → bottom.
    */

    lines.sort(
        function(a, b) {

            return b.y - a.y;

        }
    );



    /* ========================================================
       NUMBER ONLY
    ======================================================== */

    function isOnlyNumber(text) {

        const cleaned =
            text
                .replace(/\s+/g, "")
                .replace(/[()]/g, "");


        return /^[૦-૯0-9./,:;\-]+$/.test(
            cleaned
        );

    }


    /* ========================================================
       REMOVE LEADING SERIAL NUMBER

       IMPORTANT:

       Serial number is OPTIONAL.

       These are both valid:

           1. રમેશભાઈ પટેલ

       and:

           રમેશભાઈ પટેલ
    ======================================================== */

    function removeLeadingNumber(text) {

        return text

            .replace(
                /^\s*[૦-૯0-9]+\s*[.)-]\s*/,
                ""
            )

            .replace(
                /^\s*[૦-૯0-9]+\s+/,
                ""
            )

            .trim();

    }


    /* ========================================================
       REMOVE TRAILING DATA
    ======================================================== */

    function removeTrailingData(text) {

        let result =
            text;


        /*
           Parenthesized reference.

           Example:

               બાબુલાલ મણીલાલ ઠક્કર (૫૩૮૪)
        */

        result =
            result.replace(
                /\s*\([^)]*[0-9૦-૯][^)]*\)\s*.*$/u,
                ""
            );


        /*
           Gujarati page/reference marker.
        */

        result =
            result.replace(
                /\s*\(પ[૦-૯0-9]+\).*$/u,
                ""
            );


        /*
           Numeric data after the name.

           Example:

               નામ ૫૫૭/૫૪ ૦-૦૨-૩૮ ૦.૨૫

           becomes:

               નામ
        */

        result =
            result.replace(
                /\s+[૦-૯0-9][૦-૯0-9\s./,:;\-]*$/u,
                ""
            );


        /*
           Remove trailing separators.
        */

        result =
            result
                .replace(
                    /[|,:;]+$/,
                    ""
                )
                .trim();


        return result;

    }


    /* ========================================================
       CLEAN NAME
    ======================================================== */

    function cleanName(text) {

        let name =
            text
                .replace(/\s+/g, " ")
                .trim();


        name =
            removeLeadingNumber(
                name
            );


        name =
            removeTrailingData(
                name
            );


        name =
            name
                .replace(
                    /^[|,:;]+/,
                    ""
                )
                .replace(
                    /[|,:;]+$/,
                    ""
                )
                .replace(
                    /\s+/g,
                    " "
                )
                .trim();


        return name;

    }


    /* ========================================================
       NAME VALIDATION

       IMPORTANT:

       Serial number is NOT required.

       We only require actual Gujarati/Latin letters.
    ======================================================== */

    function looksLikeHolderName(
    text
) {

    if (
        !text
    ) {

        return false;

    }


    /* ----------------------------------------------------
       HOLDER MUST START WITH SERIAL NUMBER

       Examples:

           2. Name
           5. Name
           45. Name
           102. Name

       Serial number may be Gujarati or English.
    ---------------------------------------------------- */

    if (
        !/^[૦-૯0-9]+\s*[.)-]\s*\S+/.test(
            text
        )
    ) {

        return false;

    }


    if (
        isKhataBlockedWord(
            text
        )
    ) {

        return false;

    }


    if (
        isOnlyNumber(
            text
        )
    ) {

        return false;

    }


    /*
       Must contain Gujarati or Latin letters.
    */

    if (
        !/[અ-હળ-ૐA-Za-z]/.test(
            text
        )
    ) {

        return false;

    }


    if (
        text.length < 3
    ) {

        return false;

    }


    if (
        text.length > 150
    ) {

        return false;

    }


    return true;

}

    /* ========================================================
       SCAN PHYSICAL LINES

       FIRST VALID LINE = FIRST HOLDER
    ======================================================== */

    for (
        let i = 0;
        i < lines.length;
        i++
    ) {

        const line =
            lines[i];


        line.items.sort(
            function(a, b) {

                return a.x - b.x;

            }
        );


        const lineText =
            line.items
                .map(function(item) {

                    return item.text;

                })
                .join(" ")
                .replace(/\s+/g, " ")
                .trim();


        if (
            !lineText
        ) {

            continue;

        }


        console.log(
            "KHATA CANDIDATE LINE:",
            khataNumber,
            "→",
            lineText
        );


        if (
            isKhataBlockedWord(
                lineText
            )
        ) {

            continue;

        }


        if (
            isOnlyNumber(
                lineText
            )
        ) {

            continue;

        }


        const name =
            cleanName(
                lineText
            );


        if (
            !looksLikeHolderName(
                name
            )
        ) {

            continue;

        }


        console.log(
            "FIRST KHATA HOLDER FOUND:",
            khataNumber,
            "→",
            name
        );


        return name;

    }


    console.warn(
        "NO KHATA HOLDER FOUND:",
        khataNumber
    );


    return "";

}



/* ============================================================
   EXTRACT FIRST NUMBER FROM TEXT
============================================================ */

function extractNumberFromText(
    text
) {

    if (
        !text
    ) {

        return null;

    }


    const normalized =
        String(text)
            .replace(
                /[Xx]/g,
                "૫"
            );


    const match =
        normalized.match(
            /[૦-૯0-9]+/
        );


    if (
        !match
    ) {

        return null;

    }


    return gujaratiToEnglishNumber(
        match[0]
    );

}


/* ============================================================
   GUJARATI NUMBER HELPERS
============================================================ */


function gujaratiToEnglishNumber(value){


    if(
        value === null ||
        value === undefined
    ){

        return null;

    }



    const map = {

        "૦":"0",
        "૧":"1",
        "૨":"2",
        "૩":"3",
        "૪":"4",
        "૫":"5",
        "૬":"6",
        "૭":"7",
        "૮":"8",
        "૯":"9"

    };



    const result =
        String(value)
        .replace(
            /[૦-૯]/g,
            function(d){

                return map[d];

            }
        );



    if(
        !/^\d+$/.test(result)
    ){

        return null;

    }



    return Number(result);

}




function englishToGujaratiNumber(value){


    const map = [

        "૦",
        "૧",
        "૨",
        "૩",
        "૪",
        "૫",
        "૬",
        "૭",
        "૮",
        "૯"

    ];



    return String(value)
    .replace(
        /\d/g,
        function(d){

            return map[
                Number(d)
            ];

        }
    );

}





/* ============================================================
   DEBUG HELPERS
============================================================ */


function getValidKhatas(parsedResult){


    if(
        !Array.isArray(parsedResult)
    ){

        return [];

    }



    return parsedResult.filter(
        function(item){

            return (
                item &&
                item.khataNumber
            );

        }
    );

}





function logKhataSummary(parsedResult){


    console.log(
        "========== KHATA SUMMARY =========="
    );


    getValidKhatas(
        parsedResult
    )
    .forEach(
        function(k){

            console.log(
                "Page:",
                k.pageNumber,
                "| Khata:",
                k.khataNumber,
                "| Name:",
                k.name,
                "| Placeholder:",
                k.isPlaceholder
            );

        }
    );


    console.log(
        "========== KHATA SUMMARY END =========="
    );


}






/* ============================================================
   OCR TEST (PRESERVED)
============================================================ */


async function testGujaratiOCR(
    canvas,
    abortSignal=null
){

    throwIfKhataParserCancelled();



    if(
        typeof Tesseract === "undefined"
    ){

        return "";

    }



    try{


        const result =
            await Tesseract.recognize(
                canvas,
                "guj"
            );



        throwIfKhataParserCancelled();



        return result.data.text
              .replace(
                  /\r\n/g,
                  "\n"
              )
              .replace(
                  /\r/g,
                  "\n"
              )
              .split("\n")
              .map(function(line){
          
                  return line
                      .replace(
                          /[ \t]+/g,
                          " "
                      )
                      .trim();
          
              })
              .filter(function(line){
          
                  return line.length > 0;
          
              })
              .join("\n")
              .trim();


    }
    catch(error){


        if(
            error.message ===
            "KHATA_IMPORT_CANCELLED"
        ){

            throw error;

        }


        return "";

    }

}







/* ============================================================
   EXPORTS
============================================================ */


window.parseKhataResult =
    parseKhataResult;


window.extractKhataNumbers =
    extractKhataNumbers;


window.getValidKhatas =
    getValidKhatas;


window.logKhataSummary =
    logKhataSummary;


window.throwIfKhataParserCancelled =
    throwIfKhataParserCancelled;


window.waitForKhataParserYield =
    waitForKhataParserYield;



console.log(
    "Khata Parser module ready."
);