console.log("Talapatrak loader loaded");

const talapatrakCSS =
    document.createElement("link");

talapatrakCSS.rel = "stylesheet";
talapatrakCSS.href = "talapatrak/talapatrak.css";

document.head.appendChild(talapatrakCSS);


fetch("talapatrak/talapatrak.html")

.then(response => response.text())

.then(html => {

    document
        .getElementById("talapatrakContainer")
        .insertAdjacentHTML(
            "beforeend",
            html
        );

    console.log(
          "Talapatrak HTML loaded"
      );

      if (
        typeof window.safelyInitializeKhataUploadButtons ===
        "function"
    ) {
    
        window.safelyInitializeKhataUploadButtons();
    
    }
      
     

    const script =
        document.createElement("script");

    script.src =
        "talapatrak/talapatrak.js";

    script.onload = function () {

        console.log(
            "Talapatrak JS loaded successfully"
        );

    };

    script.onerror = function () {

        console.error(
            "Talapatrak JS failed to load"
        );

    };

    document.body.appendChild(script);

})

.catch(error => {

    console.error(
        "Talapatrak loading error:",
        error
    );

});