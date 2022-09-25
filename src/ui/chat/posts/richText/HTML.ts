import {networkGetUserProfilePicture} from "../../../../network";
// @ts-ignore
import moment = require("moment");
import {Post} from "../../Post";
import {createContentElement} from "../../Content";

export class HTML extends Post {
    render(info: object, comments?: HTMLElement): HTMLElement {
        let content = createContentElement(info['content']);

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 32;
        userFromProfilePicture.height = 32;
        userFromProfilePicture.classList.add("post-profile-image");
        networkGetUserProfilePicture(info['from'].substring(info['from'].indexOf("/contacts/") + "/contacts/".length), "HR64x64").then(b64 => {
            userFromProfilePicture.src = `data:image/jpeg;base64,${b64}`;
        });

        let postElement = document.createElement('div');
        postElement.id = `post-${info['conversationLink']}`;
        postElement.classList.add('post');
        postElement.style.width = 'auto';
        postElement.style.wordBreak = "break-all";
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-name">${info['imdisplayname']}</div>
                <div class="post-date">
                    <h4>${moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}</h4>
                    <p>${moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}</p>
                </div>
            </div>
            <hr>
            ${info['properties']['title'] !== undefined ? `<h3><b>${info['properties']['title']}</b></h3>` : ''}
            ${info['properties']['subject'] !== undefined ? `<h6><b>${info['properties']['subject']}</b></h6>` : ''}
        `;

        postElement.children.item(0).insertBefore(userFromProfilePicture, postElement.children.item(0).children.item(0));
        postElement.appendChild(content);

        if (info['properties'].hasOwnProperty('files')) {
            let files = JSON.parse(info['properties']['files']);

            let filesElement = document.createElement('div');
            filesElement.classList.add('post-files');
            filesElement.innerHTML = `${
                files.map(file => `
                    <a href="${file['objectUrl']}" target="_blank">${file['title']}</a>
                `).join('')
            }`;

            postElement.appendChild(filesElement);
        }

        if (comments !== undefined) postElement.appendChild(comments);

        return postElement;
    }
}
