import {delay} from "./utils";
import {invoke} from "@tauri-apps/api/tauri";

async function passFetch(uri, options) {
    console.log(options);
    return invoke('fetch_cors', {
        uri: uri,
        method: options["method"] === undefined ? "GET" : options["method"],
        headers: new Map(options["headers"] === undefined ? [] : options["headers"]),
        body: options["body"] === undefined ? "" : options["body"]
    });
}

let networkUp = true;
let waitingForNetworkCallbacks = [];

async function fetchFromProxy(url, fetchOptions): Promise<[number, string]> {
    let promiseFunction = function (resolve, reject) {
        if (networkUp) {
            passFetch(url, fetchOptions)
                .then((response) => {
                    console.log(response);
                    if (response.status === 401) {
                        getCredentials().then(() => location.reload());
                    }
                    resolve(response);
                })
                .catch((error) => {
                    console.log(error);
                    if (networkUp) {
                        networkUp = false;

                        waitingForNetworkCallbacks.push(async function () {
                            promiseFunction(resolve, reject);
                        });

                        let waitForInternet = function (_resolve, _reject) {
                            passFetch('https://teams.microsoft.com', {})
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
    return await fetchFromProxy("https://uk-api.asm.skype.com/v1/skypetokenauth", {
        "method": "POST",
        "body": "skypetoken=" + localStorage.getItem("skype-token"),
        "headers": [
            ["origin", "https://teams.microsoft.com"],
            ["authorization", `skypetoken=${localStorage.getItem("skype-token")}`],
            ["cookie", `skypetoken_asm=${localStorage.getItem("skype-token")}; platformid=1415`]
        ]
    })
        .then(async (res) => {
            console.log(res)
            if (res[0] === 204 || res[0] === 200) {
                return await fetchFromProxy("https://uk-prod.asyncgw.teams.microsoft.com/v1/skypetokenauth", {
                    "method": "POST",
                    "credentials": "include",
                    "body": "skypetoken=" + localStorage.getItem("skype-token"),
                    "headers": [
                        ["Authorization", `skypetoken=${localStorage.getItem("skype-token")}`],
                    ]
                })
                    .then((res) => res[0]);

            } else {
                return res[0];
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
    return await fetchFromProxy(`https://teams.microsoft.com/api/mt/emea/beta/users/${encodeURIComponent(email)}/?throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`, {
            "headers": [
                ["origin", "https://teams.microsoft.com/"],
                ["host", "https://teams.microsoft.com/"],
                ["authority", "https://teams.microsoft.com/"],
                ["referer", "https://teams.microsoft.com/_"],
                ["authorization", localStorage.getItem("auth-token")],
                ["cookie", `skypetoken_asm=${localStorage.getItem("skype-token")}; authtoken=${localStorage.getItem("auth-token").replace("Bearer ", "Bearer%3D")}%26Origin%3Dhttps%3A%2F%2Fteams.microsoft.com`],
                ["x-skypetoken", localStorage.getItem("skype-token")],
                ["x-anchormailbox", localStorage.getItem("email")]
            ],
            "method": "GET"
    })
        .then(res => JSON.parse(res[1]));
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
        // @ts-ignore
        .then(res => new Blob(new TextEncoder().encode(res[1]).buffer));
}

/**
 * Gets the user's teams and channels
 */
export async function networkGetTeamsList() {
    return await fetchFromProxy("https://uk.ng.msg.teams.microsoft.com/v1/users/ME/conversations", {
        "headers": [
            ["skype-token", localStorage.getItem("skype-token")]
        ],
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => JSON.parse(res[1]))
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
    return await fetchFromProxy(`https://uk.ng.msg.teams.microsoft.com/v1/users/ME/conversations/${encodeURIComponent(thread)}/messages?pageSize=${messages}&startTime=${startTime}`, {
        "headers": [
            ["skype-token", localStorage.getItem("skype-token")],
        ],
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => JSON.parse(res[1]));
}

/**
 * Gets an image object
 * @param object image object id
 */
export async function networkGetImgo(object) {
    return await fetchFromProxy(`https://asyncgw.teams.microsoft.com/v1/objects/${object}/views/imgo?v=1`, {
        "headers": [
            ["skype-token", localStorage.getItem("skype-token")]
        ],
        "credentials": "same-origin",
        "method": "GET"
    })
        // @ts-ignore
        .then(res => new Blob(new TextEncoder().encode(res[1]).buffer));}

/**
 * Gets the socket url
 */
export async function networkGetSocket() {
    return await fetchFromProxy("https://go-eu.trouter.teams.microsoft.com/v4/a/", {
        "headers": [
            ["x-skypetoken", localStorage.getItem("skype-token")],
        ],
        "credentials": "same-origin",
        "method": "GET"
    })
        .then(res => res[1])
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

            return await fetchFromProxy(`https://${region}.trouter.teams.microsoft.com/socket.io/1/?` + paramsStr, {
                "headers": [
                ]
            })
                .then(res => res[1])
                .then(res => {
                    let id = res.split(":")[0];
                    // TODO: implement passing region as url parameter
                    return new WebSocket(`https://trouter.teams.microsoft.com/socket.io/1/websocket/${id}?${paramsStr}`.replace("http://", "wss://"));
                });
        });
}
