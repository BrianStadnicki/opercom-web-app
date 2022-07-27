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
            localStorage.setItem("skype-token", form.elements["skype-token"].value);
            localStorage.setItem("auth-token", form.elements["auth-token"].value);
            localStorage.setItem("email", form.elements["email"].value);

            document.getElementById("enter-credentials").style.display = "none";

            resolve();
        }
    });
}
