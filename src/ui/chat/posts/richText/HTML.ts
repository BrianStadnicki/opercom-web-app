import {networkGetUserProfilePicture} from "../../../../network";
// @ts-ignore
import moment = require("moment");
import {Post} from "../../Post";
import {createContentElement} from "../../Content";

export class HTML extends Post {
    render(info: object, comments?: HTMLElement): HTMLElement {
        let contentElement = createContentElement(info['content']);
        let dateFromNow = moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow();
        let dateSent = moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a");
        let title = info['properties']['title'] !== undefined ? `<h3 class="title"><b>${info['properties']['title']}</b></h3>` : '';
        let subject = info['properties']['subject'] !== undefined ? `<h6 class="subject"><b>${info['properties']['subject']}</b></h6>` : '';
        let senderName = info['imdisplayname'];

        let postElement = document.createElement('div');
        postElement.id = `post-${info['conversationLink']}`;
        postElement.classList.add('post');
        postElement.style.wordBreak = "break-all";
        postElement.innerHTML = `
            <img src="" width="64" height="64" class="profile-image" alt="${senderName}">
            
            <div class="main">
            
                <div class="header">
                    <p class="name">${senderName}</p>
                    <div class="dates">
                        <p class="from-now">${dateFromNow}</p>
                        <p class="sent">${dateSent}</p>
                    </div>
                </div>
                
                <div class="content">
                    ${title}
                    ${subject}
                    <div class="main-content-placeholder">Placeholder</div>
                </div>
                
                ${info['properties'].hasOwnProperty('files') === false ? '' :`
                    <div class="files">
                        ${
                            JSON.parse(info['properties']['files']).map(file => `
                                <a class="file" href="${file['objectUrl']}" target="_blank">${file['title']}</a>
                            `).join('')
                        }
                    </div>
                `}
                
            </div>
            
            <div class="comments"></div>
        `;

        postElement.getElementsByClassName("content").item(0).replaceChild(contentElement,
            postElement.getElementsByClassName("main-content-placeholder").item(0));

        networkGetUserProfilePicture(info['from'].substring(info['from'].indexOf("/contacts/") + "/contacts/".length), "HR64x64").then(b64 => {
            (<HTMLImageElement>postElement.getElementsByClassName("profile-image").item(0)).src = `data:image/jpeg;base64,${b64}`;
        });

        if (comments !== undefined) {
            postElement.replaceChild(comments, postElement.getElementsByClassName("comments").item(0));
        } else {
            postElement.removeChild(postElement.getElementsByClassName("comments").item(0));
        }

        return postElement;
    }
}
