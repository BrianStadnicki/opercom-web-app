import type {DataApp, DataChannel, DataSideTeam, DataSideTeamChannel} from "./Types";

enum Domain {
    TEAMS_MICROSOFT_COM,
    REGION_NG_MSG_TEAMS_MICROSOFT_COM,
    REGION_ASYNCGW_TEAMS_MICROSOFT_COM
}

enum ResponseType {
    JSON,
    Text,
    Binary
}

export class NetworkManager {
    skypeToken: string;
    authToken: string;
    chatSpacesToken: string;
    email: string;
    reauth: () => Promise<void>;

    networkUp: boolean = true;
    waitingForNetworkCallbacks:(() => Promise<void>)[] = [];

    constructor(skypeToken: string, authToken: string, email: string, chatSpacesToken: string, reauth: () => Promise<void>) {
        this.skypeToken = skypeToken;
        this.authToken = authToken;
        this.chatSpacesToken = chatSpacesToken;
        this.email = email;
        this.reauth = reauth;
    }

    private async fetchWrapper(hostname: string, path: string, fetchOptions: object): Promise<Response> {
        console.log("fetching")
        console.log(hostname, path);
        console.log(fetchOptions)

        if (fetchOptions["headers"] === undefined) {
            fetchOptions["headers"] = {}
        }
        fetchOptions["credentials"] = "omit";
        fetchOptions["headers"]["opercom-hostname"] = hostname;
        // fetchOptions["headers"]["opercom-path"] = decodeURI(path);
        if (fetchOptions["body"] === "") {
            fetchOptions["body"] = undefined;
        }

        let promiseFunction = (resolve, reject) => {
            if (this.networkUp) {
                fetch(`http://localhost:8084/proxy${path}`, fetchOptions)
                    .then((response: Response) => {
                        console.log(response);
                        if (response.status === 401) {
                            this.networkUp = false;
                            this.reauth().then(() => {
                                throw Error("Unauthorized");
                            });
                        }
                        resolve(response);
                    })
                    .catch((error) => {
                        console.log(error, "http://localhost:8084/proxy", hostname, path, fetchOptions);
                        if (this.networkUp) {
                            this.networkUp = false;

                            this.waitingForNetworkCallbacks.push(async function () {
                                promiseFunction(resolve, reject);
                            });

                            let waitForInternet = function (_resolve, _reject) {
                                fetch('http://localhost:8084/up', { method: "GET", mode: "no-cors" })
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

    private fetchGenerate(domain: Domain, path: string, method: string = "GET", body: string = "", responseType: ResponseType = ResponseType.JSON) {
        switch (domain) {
            case Domain.TEAMS_MICROSOFT_COM:
                switch (responseType) {
                    case ResponseType.JSON:
                        return this.fetchWrapper("teams.microsoft.com:443", path, {
                            "headers": {
                                "opercom-origin": "https://teams.microsoft.com",
                                "opercom-host": "teams.microsoft.com",
                                "opercom-referer": "teams.microsoft.com/_",
                                "authority": "teams.microsoft.com",
                                "authorization": this.authToken,
                                "x-skypetoken": this.skypeToken,
                                "x-anchormailbox": this.email,
                                "opercom-cookie": `skypetoken_asm=${this.skypeToken}; authtoken=${this.authToken.replace("Bearer ", "Bearer%3D")}&Origin=teams.microsoft.com`,
                            },
                            "method": method,
                            "body": body
                        })
                    case ResponseType.Binary:
                        return this.fetchWrapper("teams.microsoft.com:443", path, {
                            "headers": {
                                "opercom-host": "teams.microsoft.com",
                                "opercom-referer": "teams.microsoft.com/_",
                                "authority": "teams.microsoft.com",
                                "opercom-cookie": `skypetoken_asm=${this.skypeToken}; authtoken=${this.authToken.replace("Bearer ", "Bearer%3D")}&Origin=teams.microsoft.com`,
                            },
                            "method": method
                        })
                }
                break;
            case Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM:
                return this.fetchWrapper("uk.ng.msg.teams.microsoft.com:443", path, {
                    "headers": {
                        "opercom-origin": "https://teams.microsoft.com",
                        "opercom-host": "uk.ng.msg.teams.microsoft.com",
                        "authentication": `skypetoken=${this.skypeToken}`
                    },
                    "method": method,
                    "body": body
                })
            case Domain.REGION_ASYNCGW_TEAMS_MICROSOFT_COM:
                return this.fetchWrapper("uk-prod.asyncgw.teams.microsoft.com:443", path, {
                    "headers": {
                        "opercom-origin": "teams.microsoft.com",
                        "opercom-host": "teams.microsoft.com",
                        "authorization": `skype_token ${localStorage.getItem("skype-token")}`
                    },
                    "method": method,
                    "body": body
                })
        }
    }

    async getUserProperties(email: string) {
        return this.fetchGenerate(Domain.TEAMS_MICROSOFT_COM, `/api/mt/emea/beta/users/${encodeURIComponent(email)}/?throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`)
            .then(res => res.json());
    }

    async getTeamsList(): Promise<DataSideTeam[]> {
        return this.fetchWrapper("teams.microsoft.com:443", "/api/csa/uk/api/v1/teams/users/me?isPrefetch=false&enableMembershipSummary=true", {
            "headers": {
                "opercom-host": "teams.microsoft.com",
                "authorization": `Bearer ${this.chatSpacesToken}`,
                "x-skypetoken": this.skypeToken,
            },
            "method": "GET"
        })
            .then(res => res.json())
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
            encodeURIComponent(thread)}/messages?view=msnp24Equivalent|supportsMessageProperties&pageSize=${messages}&startTime=${startTime}${
            syncState === undefined ? '' : `&syncState=${syncState}`}`)

            .then(res => res.json());
    }

    async getApps(): Promise<DataApp[]> {
        return this.fetchGenerate(Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM, '/v1/users/ME/properties')
            .then(res => res.json())
            .then(res => JSON.parse(res["userPinnedApps"])["pinnedAndCoreApps"])
            .then(apps => apps.map(app => <DataApp>{
                id: app["id"],
                name: app["name"],
                smallImageUrl: app["smallImageUrl"],
                largeImageUrl: app["largeImageUrl"]
            }))
    }

    async getUserProfilePicture(user, name, size): Promise<Blob> {
        return await this.fetchGenerate(Domain.TEAMS_MICROSOFT_COM, `/api/mt/emea/beta/users/${decodeURIComponent(user)}/profilepicturev2?displayname=${encodeURIComponent(name)}&size=${size}`, "GET", "", ResponseType.Binary)
            // @ts-ignore
            .then(res => res.blob())
    }

    async getAppImage(name): Promise<Blob> {
        return fetch((<DataApp>JSON.parse(localStorage.getItem("apps")).filter((app: DataApp) => app.name === name)[0]).largeImageUrl)
            .then(res => res.blob())
    }

    async getImgo(object): Promise<Blob> {
        return await this.fetchGenerate(Domain.REGION_ASYNCGW_TEAMS_MICROSOFT_COM, `/v1/objects/${object}/views/imgo?v=1`, "GET", "", ResponseType.Binary)
            .then(res => res.blob())
    }

    async getSocket() {
        /*
        await this.fetchWrapper("go-eu.trouter.teams.microsoft.com:443", "/v4/a/", {
            "headers": {
                "x-skypetoken": this.skypeToken,
                "opercom-origin": "teams.microsoft.com",
                "Content-Length": "0"
            },
            "method": "POST"
        })
            .then(res => res.json())
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
                        "opercom-origin": "teams.microsoft.com"
                    }
                })
                    .then(res => res.text())
                    .then(res => {
                        let socket = res.substring(0, res.indexOf(":"));
                        /*
                        invoke('create_websocket', {
                            "url": config["socketio"].replace("", "wss://") + "socket.io/1/websocket/" + socket + "?" + paramsStr,
                            "opercom-cookie": `MC1=GUID=5495f266525a428fa27083b312d72964&HASH=5495&LV=202210&V=4&LU=1665695832235; MS0=453b85d208f64b6b93ad139fe9d1b5e1; platformid_asm=1415; skypetoken_asm=${this.skypeToken}; authtoken=${encodeURIComponent(this.authToken)}%26Origin%3Dhttps%3A%2F%2Fteams.microsoft.com; clienttype=web; tenantId=e3bb77cd-3d74-4e71-9426-ac95c2e62e65`
                        });


                    });
            });
        */
    }
}
