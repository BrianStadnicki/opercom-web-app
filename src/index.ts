import {auth} from "./auth";
import {init} from "./init";
import {hydrate} from "./main";
import {invoke} from '@tauri-apps/api/tauri';

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


    /*
    let res = await invoke('fetch_cors', {
        uri: "https://opercom.co.uk",
        method: "GET",
        headers: new Map([
        ]),
        body: ""
    });

    console.log(res);

     */
});
