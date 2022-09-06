import {delay, urlMode} from "./utils";

let networkUp = true;
let waitingForNetworkCallbacks = [];

async function fetchFromProxy(url, fetchOptions): Promise<Response> {
    let promiseFunction = function (resolve, reject) {
        if (networkUp) {
            fetch(urlMode(url), fetchOptions)
                .then((response) => {
                    resolve(response);
                })
                .catch(() => {
                    if (networkUp) {
                        networkUp = false;

                        waitingForNetworkCallbacks.push(async function () {
                            promiseFunction(resolve, reject);
                        });

                        let waitForInternet = function (_resolve, _reject) {
                            fetch(urlMode('/up.php'))
                                .then(() => {
                                    _resolve();
                                })
                                .catch(() => {
                                    delay(3000)
                                        .then(() => waitForInternet(_resolve, _reject));
                                });
                        };

                        new Promise<void>(waitForInternet)
                            .then(async () => {
                                networkUp = true;

                                waitingForNetworkCallbacks.forEach(callback => {
                                    callback();
                                });

                                waitingForNetworkCallbacks = [];
                            });
                    } else {
                        waitingForNetworkCallbacks.push(async function () {
                            promiseFunction(resolve, reject);
                        });
                    }
                })
        }
    };

    return new Promise(promiseFunction);
}

/**
 * Checks if the skype token is valid
 */
export async function networkAuthSkypeToken() {
    return await fetchFromProxy('/auth/skypetoken.php', {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        }
    })
        .then((res) => res.status);
}

/**
 * Gets a user's properties
 * @param email user's email
 * @return {
 *     "user-id": string,
 *     "user-name": string,
 *     "is-private-chat-enabled": boolean
 * }
 */
export async function networkGetUserProperties(email) {
    return await fetchFromProxy(`/users/info.php?user=${encodeURIComponent(email)}&throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`, {
            "headers": {
                "bearer-token": localStorage.getItem("auth-token"),
                "skype-token": localStorage.getItem("skype-token"),
                "email": localStorage.getItem("email")
            },
            "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets a user's profile picture
 * @param user user's id
 * @param size profile picture size
 * @return base64-encoded image
 */
export async function networkGetUserProfilePicture(user, size) {
    return await fetchFromProxy(`/users/profilepicture.php?user=${user}&size=${size}`, {
        "headers": {
            "bearer-token": localStorage.getItem("auth-token"),
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.blob());
}

/**
 * Gets the user's teams and channels
 */
export async function networkGetTeamsList() {
    return await fetchFromProxy('/teams/list.php', {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets a conversation
 * @param thread thread
 * @param messages number of messages to fetch
 * @param startTime start time
 */
export async function networkGetConversation(thread, messages, startTime) {
    return await fetchFromProxy(`/teams/conversation.php?thread=${encodeURIComponent(thread)}&pageSize=${messages}&startTime=${startTime}`, {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets an image object
 * @param object image object id
 */
export async function networkGetImgo(object) {
    return await fetchFromProxy(`/assets/imgo.php?id=${object}&v=1`, {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.blob());
}
