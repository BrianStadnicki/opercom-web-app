import {createContentElement} from "./Content";
import {networkGetUserProfilePicture} from "../../network";
// @ts-ignore
import moment = require("moment");

export class Comment {
    render(info: object): HTMLElement {
        let senderName = info['imdisplayname'];
        let dateSent = moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a");

        let commentElement = document.createElement('div');
        commentElement.classList.add('comment');

        commentElement.innerHTML = `
            <img class="profile-image" width="32" height="32" src="" alt="${senderName}">
            
            <div class="main">
                <div class="header">
                    <p class="name">${senderName}</p>
                    <div class="dates">
                        <p class="sent">${dateSent}</p>
                    </div>
                </div>
                
                <div class="content"></div>
            </div>
        `;

        let contentElement = createContentElement(info['content']);
        commentElement.getElementsByClassName("content").item(0).appendChild(contentElement);

        networkGetUserProfilePicture(info['from'].substring(info['from'].indexOf("/contacts/") + "/contacts/".length), "HR64x64").then(b64 => {
            (<HTMLImageElement>commentElement.getElementsByClassName("profile-image").item(0)).src = `data:image/jpeg;base64,${b64}`;
        });

        return commentElement;
    }
}
