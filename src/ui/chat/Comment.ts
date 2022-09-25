import {createContentElement} from "./Content";
import {networkGetUserProfilePicture} from "../../network";
// @ts-ignore
import moment = require("moment");

export class Comment {
    render(info: object): HTMLElement {
        let commentElement = document.createElement('div');
        commentElement.classList.add('comment');

        commentElement.innerHTML = `
            <div class="comment-name">${info['imdisplayname']}</div>
            <div class="comment-date">
                <p>${moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}</p>
                <h4>${moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}</h4>
            </div>
            <hr>
        `;

        let contentElement = createContentElement(info['content']);
        commentElement.appendChild(contentElement);

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 24;
        userFromProfilePicture.height = 24;
        userFromProfilePicture.classList.add("comment-profile-picture");
        networkGetUserProfilePicture(info['from'].substring(info['from'].indexOf("/contacts/") + "/contacts/".length), "HR64x64").then(b64 => {
            userFromProfilePicture.src = `data:image/jpeg;base64,${b64}`;
        });
        commentElement.insertBefore(userFromProfilePicture, commentElement.children.item(0));

        return commentElement;
    }
}
