import {networkGetUserProfilePicture} from "../../../../network";
// @ts-ignore
import moment = require("moment");
import {Post} from "../../Post";
import {createContentElement} from "../../Content";

export class HTML extends Post {
    render(info: object, comments?: HTMLElement): HTMLElement {
        return this.populate(
            `post-${info['conversationLink']}`,
            info['imdisplayname'],
            networkGetUserProfilePicture(info['from'].substring(info['from'].indexOf("/contacts/") + "/contacts/".length),
                "HR64x64").then(b64 => `data:image/jpeg;base64,${b64}`),
            moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow(),
            moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a"),
            info['properties']['title'] !== undefined ? `<h3 class="title"><b>${info['properties']['title']}</b></h3>` : '',
            info['properties']['subject'] !== undefined ? `<h6 class="subject"><b>${info['properties']['subject']}</b></h6>` : '',
            createContentElement(info["content"]),
            info["properties"]["files"] === undefined ? undefined : JSON.parse(info["properties"]["files"]),
            comments
        );
    }
}
