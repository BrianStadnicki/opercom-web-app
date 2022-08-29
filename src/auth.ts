import {networkAuthSkypeToken} from "./network";

export async function auth() {
    await ensureHaveCredentials();
}

/**
 * Ensures that the user has given the proper credentials
 */
async function ensureHaveCredentials() {
    if (!localStorage.getItem("skype-token") ||
        !localStorage.getItem("auth-token") ||
        !localStorage.getItem("email")) {

        await getCredentials();
        return ensureHaveCredentials();
    } else {
        await ensureCredentialsValid();
        return true;
    }
}

async function ensureCredentialsValid() {
    return new Promise<void>(async resolve => {
        if ((await networkAuthSkypeToken()) !== 204) {
            await getCredentials();
            await ensureCredentialsValid();
        }
        resolve();
    });
}

async function getCredentials() {
    document.getElementById("enter-credentials").style.display = "block";

    return new Promise<void>(resolve => {
        let form = <HTMLFormElement>document.getElementById("enter-credentials-form");
        form.onsubmit = function (e) {
            e.preventDefault();
            let tokens = JSON.parse(form.elements["tokens"].value);
            localStorage.setItem("skype-token", tokens['skype']);
            localStorage.setItem("auth-token", tokens['token']);
            localStorage.setItem("email", tokens['email']);

            document.getElementById("enter-credentials").style.display = "none";

            resolve();
        }
    });
}
