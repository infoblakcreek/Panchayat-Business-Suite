
console.log("Shikshanupakaran loader loaded");

// ============================================================
// LOAD SHIKSHANUPAKARAN CSS
// ============================================================

const css = document.createElement("link");

css.rel = "stylesheet";
css.href = "shikshanupakaran/shikshanupakaran.css";

document.head.appendChild(css);

console.log("Shikshanupakaran CSS loaded");


fetch("shikshanupakaran/shikshanupakaran.html")

.then(response => response.text())
.then(html => {

    document.getElementById("mainContent").insertAdjacentHTML(
        "beforeend",
        html
    );

    console.log("Shikshanupakaran HTML loaded");

    const script = document.createElement("script");

script.src = "shikshanupakaran/shikshanupakaran.js";

script.onload = function () {

    console.log(
        "Shikshanupakaran JS loaded successfully"
    );

    document.querySelectorAll("script[src*='shikshanupakaran']")

};


script.onerror = function () {

    console.error(
        "Shikshanupakaran JS failed to load"
    );

};


document.body.appendChild(script);

})
.catch(error => {

    console.error(
        "Shikshanupakaran loading error:",
        error
    );

});