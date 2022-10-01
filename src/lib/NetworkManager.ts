import {Body, fetch} from "@tauri-apps/api/http";
import type {HttpVerb} from "@tauri-apps/api/http";
import type {DataSideTeam} from "./Types";

enum Domain {
    TEAMS_MICROSOFT_COM,
    REGION_NG_MSG_TEAMS_MICROSOFT_COM
}

export class NetworkManager {
    skypeToken: string;
    authToken: string;
    email: string;

    constructor(skypeToken: string, authToken: string, email: string) {
        this.skypeToken = skypeToken;
        this.authToken = authToken;
        this.email = email;
    }

    fetchGenerate(domain: Domain, path: string, method: HttpVerb = "GET", body: string = "") {
        switch (domain) {
            case Domain.TEAMS_MICROSOFT_COM:
                return fetch(`https://teams.microsoft.com${path}`, {
                    "headers": {
                        "origin": "https://teams.microsoft.com",
                        "host": "https://teams.microsoft.com",
                        "referer": "https://teams.microsoft.com/_",
                        "authority": "teams.microsoft.com",
                        "authorization": this.authToken,
                        "x-skypetoken": this.skypeToken,
                        "x-anchormailbox": this.email
                    },
                    "method": method,
                    "body": Body.text(body)
                })

            case Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM:
                return fetch(`https://uk.ng.msg.teams.microsoft.com${path}`, {
                    "headers": {
                        "authentication": `skypetoken=${this.skypeToken}`
                    },
                    "method": method,
                    "body": Body.text(body)
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

    async getConversation(thread, messages, startTime, syncState?) {
        return this.fetchGenerate(Domain.REGION_NG_MSG_TEAMS_MICROSOFT_COM, `/v1/users/ME/conversations/${
            encodeURIComponent(thread)}/messages?pageSize=${messages}&startTime=${startTime}${
            syncState === undefined ? '' : `&syncState=${syncState}`}`)

            .then(res => res.data);
    }
}
