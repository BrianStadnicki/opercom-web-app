// @ts-ignore
import moment = require("moment");
import {Post} from "../../Post";

export class MediaCard extends Post {
    render(info: object, comments: HTMLElement): HTMLElement {
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

        // TODO: implement proper media cards, not just assume them being assignments

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 32;
        userFromProfilePicture.height = 32;
        userFromProfilePicture.classList.add("post-profile-image", "assignment");
        userFromProfilePicture.src = new URL("../../../../assets/clipboard-data-fill.svg", import.meta.url).href;
        postElement.children.item(0).insertBefore(userFromProfilePicture, postElement.children.item(0).children.item(0));

        let cardInfo = JSON.parse(atob(new DOMParser().parseFromString(info['content'], 'text/html')
            .getElementsByTagName("swift").item(0).getAttribute('b64')));

        let content = document.createElement('div');

        if (cardInfo['type'] === 'message/card') {
            cardInfo['attachments'].forEach(attachment => {
                attachment['content']['body'].forEach(row => {
                    let rowDiv = document.createElement('div');
                    switch (row['type']) {
                        case 'Container': {
                            row['items'].forEach(item => {
                                switch (item['type']) {
                                    case 'TextBlock': {
                                        if (item['text'] !== undefined) {
                                            let text;
                                            if (item['size'] === 'large') {
                                                text = document.createElement('h6');
                                            } else {
                                                text = document.createElement('p');
                                            }
                                            text.textContent = item['text'];
                                            rowDiv.appendChild(text);
                                        }
                                        break;
                                    }
                                    case 'ColumnSet': {
                                        item['columns'].forEach(column => {
                                            column['items'].forEach(innerItem => {
                                                switch (innerItem['type']) {
                                                    case 'TextBlock': {
                                                        if (innerItem['text'] !== undefined) {
                                                            let text;
                                                            if (innerItem['size'] === 'large') {
                                                                text = document.createElement('h6');
                                                            } else {
                                                                text = document.createElement('p');
                                                            }
                                                            text.textContent = innerItem['text'];
                                                            rowDiv.appendChild(text);
                                                        }
                                                        break;
                                                    }
                                                }
                                            })
                                        })
                                        break;
                                    }
                                }
                            });
                            break;
                        }
                    }

                    content.appendChild(rowDiv);
                });
                attachment['content']['actions'].forEach(action => {
                    let actionBtn = document.createElement('a');
                    actionBtn.href = action['url'];
                    actionBtn.text = action['title'];
                    actionBtn.target = "_blank";

                    content.appendChild(actionBtn);
                })
            });
        }

        postElement.appendChild(content);

        if (comments !== undefined) postElement.appendChild(comments);

        return postElement;
    }
}
