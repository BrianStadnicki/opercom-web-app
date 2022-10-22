import type {HttpVerb} from "@tauri-apps/api/http";
import {Body, fetch, Response, ResponseType} from "@tauri-apps/api/http";
import type {DataApp, DataChannel, DataSideTeam, DataSideTeamChannel} from "./Types";
import {invoke} from "@tauri-apps/api/tauri";

enum Domain {
    TEAMS_MICROSOFT_COM,
    REGION_NG_MSG_TEAMS_MICROSOFT_COM,
    REGION_ASYNCGW_TEAMS_MICROSOFT_COM
}

export class NetworkManager {
    skypeToken: string;
    authToken: string;
    chatSpacesToken: string;
    email: string;
    reauth: () => void;

    networkUp:boolean = true;
    waitingForNetworkCallbacks:(() => Promise<void>)[] = [];

    constructor(skypeToken: string, authToken: string, email: string, chatSpacesToken: string, reauth: () => void) {
        this.skypeToken = skypeToken;
        this.authToken = authToken;
        this.chatSpacesToken = chatSpacesToken;
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
        return this.fetchWrapper(`https://teams.microsoft.com/api/csa/uk/api/v1/teams/users/me?isPrefetch=false&enableMembershipSummary=true`, {
            "headers": {
                "host": "teams.microsoft.com",
                "authorization": `Bearer ${this.chatSpacesToken}`,
                "x-skypetoken": this.skypeToken,
            },
            "method": "GET"
        })
            .then(res => res.data)
            .then(json => {
                return json["teams"].map(team => <DataSideTeam>{
                    channels: team["channels"].map(channel => <DataSideTeamChannel>{
                        id: channel["id"],
                        name: channel["displayName"],
                        isGeneral: channel["isGeneral"],
                        isFavorite: channel["isFavorite"],
                        isDeleted: channel["isDeleted"],
                        isArchived: channel["isArchived"],
                        isPinned: channel["isPinned"]
                    }),
                    id: team["id"],
                    isArchived: team["isArchived"],
                    isCollapsed: team["isCollapsed"],
                    isDeleted: team["isDeleted"],
                    isFavorite: team["isFavorite"],
                    name: team["displayName"],
                    pictureETag: team["pictureETag"]
                });
            });
    }

    async getConversation(thread, messages, startTime, syncState?): Promise<DataChannel> {
        return this.fetchGenerate(Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM, `/v1/users/ME/conversations/${
            encodeURIComponent(thread)}/messages?pageSize=${messages}&startTime=${startTime}${
            syncState === undefined ? '' : `&syncState=${syncState}`}`)

            .then(res => res.data);
    }

    async getApps(): Promise<DataApp[]> {
        return this.fetchGenerate(Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM, '/v1/users/ME/properties')
            .then(res => JSON.parse(res.data["userPinnedApps"])["pinnedAndCoreApps"])
            .then(apps => apps.map(app => <DataApp>{
                id: app["id"],
                name: app["name"],
                smallImageUrl: app["smallImageUrl"],
                largeImageUrl: app["largeImageUrl"]
            }))
    }

    async getUserProfilePicture(user, name, size) {
        let cached = this.checkImageCache(`user-profile-picture-${user}-${size}`);
        if (cached) {
            return cached;
        }

        return await this.fetchGenerate(Domain.TEAMS_MICROSOFT_COM, `/api/mt/emea/beta/users/${user}/profilepicturev2?displayname=${encodeURIComponent(name)}&size=${size}`, "GET", "", ResponseType.Binary)
            // @ts-ignore
            .then(res => btoa(res.data.map(byte => String.fromCharCode(byte)).join("")))
            .then(b64 => {
                this.addToImageCache(`user-profile-picture-${user}-${size}`, b64);
                return b64;
            })
    }

    async getAppImage(name) {
        let cached = this.checkImageCache(`app-image-${name}`);
        if (cached) {
            return cached;
        }

        // FIXME: should be in proper store
        return await this.fetchWrapper((<DataApp>JSON.parse(localStorage.getItem("apps")).filter((app: DataApp) => app.name === name)[0]).largeImageUrl, {
            "method": "GET",
            "responseType": ResponseType.Binary
        })
            // @ts-ignore
            .then(res => btoa(res.data.map(byte => String.fromCharCode(byte)).join("")))
            .then(b64 => {
                this.addToImageCache(`app-image-${name}`, b64);
                return b64;
            });
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

    async getSocket() {
        await this.fetchWrapper("https://go-eu.trouter.teams.microsoft.com/v4/a/", {
            "headers": {
                "x-skypetoken": this.skypeToken,
                "Origin": "https://teams.microsoft.com",
                "Content-Length": "0"
            },
            "method": "POST",
            "responseType": ResponseType.JSON
        })
            .then(res => res.data)
            .then(config => {
                let params = new URLSearchParams('');
                for (let key of Object.keys(config['connectparams'])) {
                    params.append(key, config['connectparams'][key]);
                }

                let paramsStr = params.toString() +
                    '&v=v4' +
                    '&tc=%7B%22cv%22:%222022.30.01.1%22,%22ua%22:%22TeamsCDL%22,%22hr%22:%22%22,%22v%22:%221.0.0.2022080828%22%7D' +
                    '&timeout=40' +
                    '&auth=true' +
                    '&epid=1' +
                    '&ccid=1' +
                    '&cor_id=1' +
                    '&con_num=1' +
                    '&t=1';

                this.fetchWrapper(config["socketio"] + "socket.io/1/?" + paramsStr, {
                    "headers": {
                        "origin": "https://teams.microsoft.com"
                    },
                    "responseType": ResponseType.Text
                })
                    .then(res => res.data)
                    .then(res => {
                        let socket = res.substring(0, res.indexOf(":"));
                        invoke('create_websocket', {
                            "url": config["socketio"].replace("https://", "wss://") + "socket.io/1/websocket/" + socket + "?" + paramsStr,
                            "cookie": `MC1=GUID=5495f266525a428fa27083b312d72964&HASH=5495&LV=202210&V=4&LU=1665695832235; MS0=453b85d208f64b6b93ad139fe9d1b5e1; platformid_asm=1415; skypetoken_asm=${this.skypeToken}; authtoken=${encodeURIComponent(this.authToken)}%26Origin%3Dhttps%3A%2F%2Fteams.microsoft.com; clienttype=web; tenantId=e3bb77cd-3d74-4e71-9426-ac95c2e62e65`
                        });
                    });
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
