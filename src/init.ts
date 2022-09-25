import {networkGetTeamsList, networkGetSocket, networkGetUserProperties} from "./network";

export async function init() {
    await getUserProperties(true);
    await getTeams(true);
    // setupSync().then(() => {});
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
                localStorage.setItem("user-id", res["value"]["mri"]);
                localStorage.setItem("user-name", res["value"]["displayName"])
                localStorage.setItem("is-private-chat-enabled", res["value"]["featureSettings"]["isPrivateChatEnabled"])

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

async function setupSync() {
    return new Promise<void>(resolve => {
        networkGetSocket()
            .then(res => {

                resolve();
            });
    });
}
