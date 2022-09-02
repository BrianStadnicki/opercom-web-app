import {auth} from "./auth";
import {init} from "./init";
import {hydrate} from "./main";

window.addEventListener("load", function () {
    console.log("Initial hydration");
    let initalHydration = hydrate();
    console.log("Beginning auth...");
    auth().then(() => {
        console.log("Done");
        console.log("Initialising application data...");
        init().then(() => {
            console.log("Done")
            initalHydration.then(() => {
                console.log("Hydrating the DOM...")
                hydrate().then(() => {
                    console.log("Done")
                });
            });
        });
    });
});
