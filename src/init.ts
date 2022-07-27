import {networkGetTeamsList, networkGetUserProfilePicture, networkGetUserProperties} from "./network";

export async function init() {
    await getUserProperties(true);
    await getProfilePicture(true);
    await getTeams(true);
}

async function getUserProperties(checkExists) {
    if (checkExists &&
        localStorage.getItem("user-id") !== null &&
        localStorage.getItem("user-name") !== null &&
        localStorage.getItem("is-private-chat-enabled") !== null) {

        return;
    }

    return new Promise<void>(resolve => {
        networkGetUserProperties(localStorage.getItem("email"))
            .then(res => {
                localStorage.setItem("user-id", res["user-id"]);
                localStorage.setItem("user-name", res["user-name"])
                localStorage.setItem("is-private-chat-enabled", res["is-private-chat-enabled"])

                resolve();
            });
    });
}

async function getProfilePicture(checkExists) {
    if (checkExists &&
        localStorage.getItem("profile-picture") !== null) {

        return;
    }

    return new Promise<void>(resolve => {
        networkGetUserProfilePicture(localStorage.getItem("user-id"), "HR64x64")
            .then(res => {
                localStorage.setItem("profile-picture", res);

                resolve();
            });
    });
}

async function getTeams(checkExists) {
    if (checkExists &&
        localStorage.getItem("teams") !== null) {

        return;
    }

    return new Promise<void>(resolve => {
        networkGetTeamsList()
            .then(res => {
                localStorage.setItem("teams", JSON.stringify(res));
                console.log(res);
                resolve();
            });
    });
}
