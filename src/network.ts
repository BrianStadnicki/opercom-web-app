import {delay} from "./utils";

let networkUp = true;
let waitingForNetworkCallbacks = [];

async function fetchFromProxy(url, fetchOptions): Promise<Response> {
    let promiseFunction = function (resolve, reject) {
        if (networkUp) {
            fetch(url, fetchOptions)
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
                            fetch('https://teams.microsoft.com')
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
    return await fetchFromProxy("https://asm.skype.com/v1/skypetokenauth", {
        "method": "POST",
        "credentials": "include",
        "body": "skypetoken=" + localStorage.getItem("skype-token"),
        "headers": {
            "Authorization": `skypetoken=${localStorage.getItem("skype-token")}`,
            "region": "uk-api"
        }
    })
        .then(async (res) => {
            if (res.status === 204 || res.status === 200) {
                return await fetchFromProxy("https://asyncgw.teams.microsoft.com/v1/skypetokenauth", {
                    "method": "POST",
                    "credentials": "include",
                    "body": "skypetoken=" + localStorage.getItem("skype-token"),
                    "headers": {
                        "Authorization": `skypetoken=${localStorage.getItem("skype-token")}`,
                        "region": "uk-prod"
                    }
                })
                    .then((res) => res.status);

            } else {
                return res.status;
            }
        });
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
    return await fetchFromProxy(`https://teams.microsoft.com/api/mt/emea/beta/users/${encodeURIComponent(email)}?throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`, {
            "headers": {
                "bearer-token": localStorage.getItem("auth-token"),
                "skype-token": localStorage.getItem("skype-token"),
                "email": localStorage.getItem("email")
            },
            "method": "GET",
            "credentials": "same-origin"
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
    return await fetchFromProxy(`https://teams.microsoft.com/api/mt/emea/beta/users/${user}/profilepicturev2?size=${size}`, {
        "credentials": "include",
        "method": "GET"
    })
        .then(res => res.blob());
}

/**
 * Gets the user's teams and channels
 */
export async function networkGetTeamsList() {
    return await fetchFromProxy("https://ng.msg.teams.microsoft.com/v1/users/ME/conversations", {
        "headers": {
            "skype-token": localStorage.getItem("skype-token"),
            "region": "uk"
        },
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => res.json())
        .then(json => {
            let res = {
                "teams": []
            };

            json['conversations'].forEach(conversation => {
                if (conversation['threadProperties']['threadType'] === 'space' &&
                    !conversation['threadProperties']['isdeleted']) {
                    let channels = [
                        {
                            "id": conversation['id'],
                            "name": "General"
                        }
                    ];

                    if (conversation['threadProperties']['topics']) {
                        JSON.parse(conversation['threadProperties']['topics']).forEach(topic => {
                            if (!topic['isdeleted']) {
                                channels.push({
                                    "id": topic['id'],
                                    "name": topic['name']
                                })
                            }
                        })
                    }

                    res['teams'].push(
                        {
                            "id": conversation["id"],
                            "name": conversation['threadProperties']['spaceThreadTopic'],
                            "channels": channels
                        }
                    );
                }
            })

            return res;
        });
}

/**
 * Gets a conversation
 * @param thread thread
 * @param messages number of messages to fetch
 * @param startTime start time
 */
export async function networkGetConversation(thread, messages, startTime) {
    return await fetchFromProxy(`https://ng.msg.teams.microsoft.com/v1/users/ME/conversations/${encodeURIComponent(thread)}/messages?pageSize=${messages}&startTime=${startTime}`, {
        "headers": {
            "skype-token": localStorage.getItem("skype-token"),
            "region": "uk"
        },
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets an image object
 * @param object image object id
 */
export async function networkGetImgo(object) {
    return await fetchFromProxy(`https://asyncgw.teams.microsoft.com/v1/objects/${object}/views/imgo?v=1`, {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => res.blob());
}

/**
 * Gets the socket url
 */
export async function networkGetSocket() {
    return await fetchFromProxy("https://trouter.teams.microsoft.com/v4/a/", {
        "headers": {
            "x-skypetoken": localStorage.getItem("skype-token"),
            "region": "go-eu"
        },
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => res.text())
        .then(async text => {
            let config = JSON.parse(text.replace('\u0000', ''));

            let region = config['socketio'].split(".")[0].substring(7);
            let params = new URLSearchParams('');
            for (let key of Object.keys(config['connectparams'])) {
                params.append(key, config['connectparams'][key]);
            }

            params.append("region", region);
            // params.append("skype-token", localStorage.getItem("skype-token"));
            // params.append("bearer-token", localStorage.getItem("auth-token"));
            // params.append("tenant-id", localStorage.getItem("tenant-id")); // FIXME: add fetching this from tenants

            let paramsStr = params.toString() + '&v=v4&tc=%7B%22cv%22:%222022.30.01.1%22,%22ua%22:%22TeamsCDL%22,%22hr%22:%22%22,%22v%22:%221.0.0.2022080828%22%7D&timeout=40&auth=true&epid=1&ccid=1&cor_id=1&con_num=1&t=1';

            return await fetchFromProxy("https://trouter.teams.microsoft.com/socket.io/1/?" + paramsStr, {
                "headers": {
                    "region": region
                }
            })
                .then(res => res.text())
                .then(res => {
                    let id = res.split(":")[0];
                    // TODO: implement passing region as url parameter
                    return new WebSocket(`https://trouter.teams.microsoft.com/socket.io/1/websocket/${id}?${paramsStr}`.replace("http://", "wss://"));
                });
        });
}
