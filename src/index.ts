import {auth} from "./auth";
import {init} from "./init";
import {hydrate} from "./main";

window.addEventListener("load", async function () {
    console.log("Beginning auth...");
    auth().then(() => {
        console.log("Done");
        console.log("Initialising application data...");
        init().then(() => {
            console.log("Done")
            console.log("Hydrating the DOM...")
            hydrate().then(() => {
                console.log("Done")
            });
        });
    });
});
