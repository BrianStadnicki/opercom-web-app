import {delay} from "./utils";
import {Body, fetch, Response, ResponseType} from '@tauri-apps/api/http';
import {getCredentials} from "./auth";

let networkUp = true;
let waitingForNetworkCallbacks = [];

function checkImageCache(image) {
    if (localStorage.getItem(`cache-image-${image}`) !== undefined) {
        return localStorage.getItem(`cache-image-${image}`);
    }
    return false;
}

function addToImageCache(image, b64) {
    localStorage.setItem(`cache-image-${image}`, b64);
}

async function fetchFromProxy(url, fetchOptions): Promise<Response<any>> {
    console.log("fetching")
    console.log(url);
    console.log(fetchOptions)
    let promiseFunction = function (resolve, reject) {
        if (networkUp) {
            fetch(url, fetchOptions)
                .then((response: Response<any>) => {
                    console.log(response);
                    if (response.status === 401) {
                        getCredentials().then(() => location.reload());
                    }
                    resolve(response);
                })
                .catch((error) => {
                    console.log(error, url, fetchOptions);
                    if (networkUp) {
                        networkUp = false;

                        waitingForNetworkCallbacks.push(async function () {
                            promiseFunction(resolve, reject);
                        });

                        let waitForInternet = function (_resolve, _reject) {
                            fetch('https://teams.microsoft.com', { method: "GET" })
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
        "body": Body.text("skypetoken=" + localStorage.getItem("skype-token")),
        "headers": {
            "origin": "https://teams.microsoft.com",
            "authorization": `skypetoken=${localStorage.getItem("skype-token")}`,
            "cookie": `skypetoken_asm=${localStorage.getItem("skype-token")}; platformid=1415`
        }
    })
        .then(async (res) => {
            if (res.status === 204 || res.status === 200) {
                return await fetchFromProxy("https://uk-prod.asyncgw.teams.microsoft.com/v1/skypetokenauth", {
                    "method": "POST",
                    "body": Body.text("skypetoken=" + localStorage.getItem("skype-token")),
                    "headers": {
                        "Authorization": `skypetoken=${localStorage.getItem("skype-token")}`,
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
    return await fetchFromProxy(`https://teams.microsoft.com/api/mt/emea/beta/users/${encodeURIComponent(email)}/?throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`, {
            "headers": {
                "origin": "https://teams.microsoft.com",
                "host": "https://teams.microsoft.com",
                "referer": "https://teams.microsoft.com/_",
                "authority": "teams.microsoft.com",
                "authorization": localStorage.getItem("auth-token"),
                "x-skypetoken": localStorage.getItem("skype-token"),
                "x-anchormailbox": localStorage.getItem("email")
            },
            "method": "GET"
    })
        .then(res => res.data);
}

/**
 * Gets a user's profile picture
 * @param user user's id
 * @param size profile picture size
 * @return base64-encoded image
 */
export async function networkGetUserProfilePicture(user, size) {
    let cached = checkImageCache(`user-profile-picture-${user}-${size}`);
    if (cached) {
        return cached;
    }

    return await fetchFromProxy(`https://teams.microsoft.com/api/mt/emea/beta/users/${user}/profilepicturev2?size=${size}`, {
        "headers": {
            "cookie": `skypetoken_asm=${localStorage.getItem("skype-token")}; authtoken=${localStorage.getItem("auth-token").replace("Bearer ", "Bearer%3D")}&Origin=https://teams.microsoft.com`,
            "authority": "teams.microsoft.com",
            "referer": "https://teams.microsoft.com/_"
        },
        "method": "GET",
        "responseType": ResponseType.Binary
    })
        .then(res => btoa(res.data.map(byte => String.fromCharCode(byte)).join("")))
        .then(b64 => {
            addToImageCache(`user-profile-picture-${user}-${size}`, b64);
            return b64;
        })
}

/**
 * Gets the user's teams and channels
 */
export async function networkGetTeamsList() {
    return await fetchFromProxy("https://uk.ng.msg.teams.microsoft.com/v1/users/ME/conversations", {
        "headers": {
            "authentication": `skypetoken=${localStorage.getItem("skype-token")}`
        },
        "method": "GET"
    })
        .then(res => {
            console.log(res);
            return res;
        })
        .then(res => res.data)
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
 * @param syncState sync state
 */
export async function networkGetConversation(thread, messages, startTime, syncState?) {
    return await fetchFromProxy(`https://uk.ng.msg.teams.microsoft.com/v1/users/ME/conversations/${
        encodeURIComponent(thread)}/messages?pageSize=${messages}&startTime=${startTime}${
        syncState === undefined ? '' : `&syncState=${syncState}`}`, {
        "headers": {
            "authentication": `skypetoken=${localStorage.getItem("skype-token")}`
        },
        "method": "GET"
    })
        .then(res => res.data);
}

/**
 * Gets an image object
 * @param object image object id
 */
export async function networkGetImgo(object) {
    let cached = checkImageCache(`imgo-${object}`);
    if (cached) {
        return cached;
    }

    return await fetchFromProxy(`https://uk-prod.asyncgw.teams.microsoft.com/v1/objects/${object}/views/imgo?v=1`, {
        "headers": {
            "authorization": `skype_token ${localStorage.getItem("skype-token")}`
        },
        "method": "GET",
        "responseType": ResponseType.Binary
    })
        .then(res => btoa(res.data.map(byte => String.fromCharCode(byte)).join("")))
        .then(b64 => {
            addToImageCache(`imgo-${object}`, b64);
            return b64;
        });
}

/**
 * Gets the socket url
 */
export async function networkGetSocket() {
    return await fetchFromProxy("https://go-eu.trouter.teams.microsoft.com/v4/a/", {
        "headers": {
            "x-skypetoken": localStorage.getItem("skype-token"),
        },
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
                "headers": {}
            })
                .then(res => res.data)
                .then(res => {
                    let id = res.split(":")[0];
                    // TODO: implement passing region as url parameter
                    return new WebSocket(`https://trouter.teams.microsoft.com/socket.io/1/websocket/${id}?${paramsStr}`.replace("http://", "wss://"));
                });
        });
}
