// @ts-ignore
import moment = require("moment");
import {Post} from "../../Post";

export class MediaCard extends Post {
    render(info: object, comments: HTMLElement): HTMLElement {
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

        let photo = new URL("../../../../assets/robot.svg", import.meta.url);

        return this.populate(
            `post-${info['conversationLink']}`,
            info['imdisplayname'],
            new Promise(resolve => resolve(photo.href)),
            moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow(),
            moment(info['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a"),
            info['properties']['title'] !== undefined ? `<h3 class="title"><b>${info['properties']['title']}</b></h3>` : '',
            info['properties']['subject'] !== undefined ? `<h6 class="subject"><b>${info['properties']['subject']}</b></h6>` : '',
            content,
            info["properties"]["files"] === undefined ? undefined : JSON.parse(info["properties"]["files"]),
            comments
        );
    }
}
