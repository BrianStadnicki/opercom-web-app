import type {HttpVerb} from "@tauri-apps/api/http";
import {Body, fetch, Response, ResponseType} from "@tauri-apps/api/http";
import type {DataChannel, DataSideTeam} from "./Types";

enum Domain {
    TEAMS_MICROSOFT_COM,
    REGION_NG_MSG_TEAMS_MICROSOFT_COM,
    REGION_ASYNCGW_TEAMS_MICROSOFT_COM
}

export class NetworkManager {
    skypeToken: string;
    authToken: string;
    email: string;
    reauth: () => void;

    networkUp:boolean = true;
    waitingForNetworkCallbacks:(() => Promise<void>)[] = [];

    constructor(skypeToken: string, authToken: string, email: string, reauth: () => void) {
        this.skypeToken = skypeToken;
        this.authToken = authToken;
        this.email = email;
        this.reauth = reauth;
    }

    private async fetchWrapper(url, fetchOptions): Promise<Response<any>> {
        console.log("fetching")
        console.log(url);
        console.log(fetchOptions)
        let promiseFunction = (resolve, reject) => {
            if (this.networkUp) {
                fetch(url, fetchOptions)
                    .then((response: Response<any>) => {
                        console.log(response);
                        if (response.status === 401) {
                            this.reauth();
                            throw Error("Unauthorized");
                        }
                        resolve(response);
                    })
                    .catch((error) => {
                        console.log(error, url, fetchOptions);
                        if (this.networkUp) {
                            this.networkUp = false;

                            this.waitingForNetworkCallbacks.push(async function () {
                                promiseFunction(resolve, reject);
                            });

                            let waitForInternet = function (_resolve, _reject) {
                                fetch('https://teams.microsoft.com', { method: "GET" })
                                    .then(() => {
                                        _resolve();
                                    })
                                    .catch(() => {
                                        new Promise(res => setTimeout(res, 3000))
                                            .then(() => waitForInternet(_resolve, _reject));
                                    });
                            };

                            new Promise<void>(waitForInternet)
                                .then(async () => {
                                    this.networkUp = true;

                                    this.waitingForNetworkCallbacks.forEach(callback => {
                                        callback();
                                    });

                                    this.waitingForNetworkCallbacks = [];
                                });
                        } else {
                            this.waitingForNetworkCallbacks.push(async function () {
                                promiseFunction(resolve, reject);
                            });
                        }
                    })
            }
        };

        return new Promise(promiseFunction);
    }

    private fetchGenerate(domain: Domain, path: string, method: HttpVerb = "GET", body: string = "", responseType: ResponseType = ResponseType.JSON) {
        switch (domain) {
            case Domain.TEAMS_MICROSOFT_COM:
                switch (responseType) {
                    case ResponseType.JSON:
                        return this.fetchWrapper(`https://teams.microsoft.com${path}`, {
                            "headers": {
                                "origin": "https://teams.microsoft.com",
                                "host": "https://teams.microsoft.com",
                                "referer": "https://teams.microsoft.com/_",
                                "authority": "teams.microsoft.com",
                                "authorization": this.authToken,
                                "x-skypetoken": this.skypeToken,
                                "x-anchormailbox": this.email,
                                "cookie": `skypetoken_asm=${this.skypeToken}; authtoken=${this.authToken.replace("Bearer ", "Bearer%3D")}&Origin=https://teams.microsoft.com`,
                            },
                            "method": method,
                            "body": Body.text(body),
                            "responseType": responseType
                        })
                    case ResponseType.Binary:
                        return this.fetchWrapper(`https://teams.microsoft.com${path}`, {
                            "headers": {
                                "referer": "https://teams.microsoft.com/_",
                                "authority": "teams.microsoft.com",
                                "cookie": `skypetoken_asm=${this.skypeToken}; authtoken=${this.authToken.replace("Bearer ", "Bearer%3D")}&Origin=https://teams.microsoft.com`,
                            },
                            "method": method,
                            "responseType": responseType
                        })
                }
                break;
            case Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM:
                return this.fetchWrapper(`https://uk.ng.msg.teams.microsoft.com${path}`, {
                    "headers": {
                        "authentication": `skypetoken=${this.skypeToken}`
                    },
                    "method": method,
                    "body": Body.text(body),
                    "responseType": responseType
                })
            case Domain.REGION_ASYNCGW_TEAMS_MICROSOFT_COM:
                return this.fetchWrapper(`https://uk-prod.asyncgw.teams.microsoft.com${path}`, {
                    "headers": {
                        "authorization": `skype_token ${localStorage.getItem("skype-token")}`
                    },
                    "method": method,
                    "body": Body.text(body),
                    "responseType": responseType
                })
        }
    }

    async getUserProperties(email: string) {
        return this.fetchGenerate(Domain.TEAMS_MICROSOFT_COM, `/api/mt/emea/beta/users/${encodeURIComponent(email)}/?throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`)
            .then(res => res.data);
    }

    async getTeamsList(): Promise<DataSideTeam[]> {
        return this.fetchGenerate(Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM, "/v1/users/ME/conversations")
        .then(res => res.data)
        .then(json => {
            let res: DataSideTeam[] = [];

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

                    res.push(
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

    async getConversation(thread, messages, startTime, syncState?): Promise<DataChannel> {
        return this.fetchGenerate(Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM, `/v1/users/ME/conversations/${
            encodeURIComponent(thread)}/messages?pageSize=${messages}&startTime=${startTime}${
            syncState === undefined ? '' : `&syncState=${syncState}`}`)

            .then(res => res.data);
    }

    async getUserProfilePicture(user, size) {
        let cached = this.checkImageCache(`user-profile-picture-${user}-${size}`);
        if (cached) {
            return cached;
        }

        return await this.fetchGenerate(Domain.TEAMS_MICROSOFT_COM, `/api/mt/emea/beta/users/${user}/profilepicturev2?size=${size}`, "GET", "", ResponseType.Binary)
            // @ts-ignore
            .then(res => btoa(res.data.map(byte => String.fromCharCode(byte)).join("")))
            .then(b64 => {
                this.addToImageCache(`user-profile-picture-${user}-${size}`, b64);
                return b64;
            })
    }

    async getImgo(object) {
        let cached = this.checkImageCache(`imgo-${object}`);
        if (cached) {
            return cached;
        }

        return await this.fetchGenerate(Domain.REGION_ASYNCGW_TEAMS_MICROSOFT_COM, `/v1/objects/${object}/views/imgo?v=1`, "GET", "", ResponseType.Binary)
            // @ts-ignore
            .then(res => btoa(res.data.map(byte => String.fromCharCode(byte)).join("")))
            .then(b64 => {
                this.addToImageCache(`imgo-${object}`, b64);
                return b64;
            });
    }

    private checkImageCache(image) {
        if (localStorage.getItem(`cache-image-${image}`) !== undefined) {
            return localStorage.getItem(`cache-image-${image}`);
        }
        return false;
    }

    private addToImageCache(image, b64) {
        localStorage.setItem(`cache-image-${image}`, b64);
    }
}
