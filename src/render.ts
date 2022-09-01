import {cssValidID, groupByKey} from "./utils";
import {networkGetImgo, networkGetUserProfilePicture} from "./network";
// @ts-ignore
import moment = require("moment");

export function renderChat(chat) {
    document.getElementById('chat-messages').style.display = 'block';
    document.getElementById('no-posts-exist').style.display = 'none';

    let postsExist = false;
    let chatMsgsBox = document.getElementById('chat-messages');
    Object.values(groupByKey(JSON.parse(localStorage.getItem(chat))['messages'], 'conversationLink'))
        .reverse()
        .forEach(post => {
            let rendered = renderPost(post);
            if (rendered !== undefined) {
                postsExist = true;
                chatMsgsBox.appendChild(rendered)
            }
        });

    if (!postsExist) {
        document.getElementById('chat-messages').style.display = 'none';
        document.getElementById('no-posts-exist').style.display = 'block';
    }

    // auto-scroll div to bottom
    chatMsgsBox.scrollTop = chatMsgsBox.scrollHeight;
}

function renderPost(post) {
    let parent = post["length"] > 1 ? post[post["length"] - 1] : post[0];
    if (parent['messagetype'].startsWith('ThreadActivity/')) {
        return undefined;
    } else if (parent['messagetype'] === 'RichText/Media_Card') {
        let postElement = document.createElement('div');
        postElement.id = `post-${post[0]['conversationLink']}`;
        postElement.classList.add('post');
        postElement.style.width = 'auto';
        postElement.style.wordBreak = "break-all";
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-name">${parent['imdisplayname']}</div>
                <div class="post-date">
                    <h4>${moment(parent['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}</h4>
                    <p>${moment(parent['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}</p>
                </div>
            </div>
            <hr>
            ${parent['properties']['title'] !== undefined ? `<h3><b>${parent['properties']['title']}</b></h3>` : ''}
            ${parent['properties']['subject'] !== undefined ? `<h6><b>${parent['properties']['subject']}</b></h6>` : ''}
        `;

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 32;
        userFromProfilePicture.height = 32;
        userFromProfilePicture.classList.add("post-profile-image", "assignment");
        userFromProfilePicture.src = new URL("./assets/clipboard-data-fill.svg", import.meta.url).href;
        postElement.children.item(0).insertBefore(userFromProfilePicture, postElement.children.item(0).children.item(0));

        let cardInfo = JSON.parse(atob(new DOMParser().parseFromString(parent['content'], 'text/html')
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

        if (post["length"] > 1) {
            let comments = renderComments(post.slice(0, post.length - 1).reverse());
            postElement.appendChild(comments);
        }

        return postElement;
    } else {
        let content = createContentElement(parent['content']);

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 32;
        userFromProfilePicture.height = 32;
        userFromProfilePicture.classList.add("post-profile-image");
        networkGetUserProfilePicture(parent['from'].match(/(?<=\/contacts\/)(.*)/g).pop(), "HR64x64").then(blob => {
            userFromProfilePicture.src = URL.createObjectURL(blob);
        });

        let postElement = document.createElement('div');
        postElement.id = `post-${post[0]['conversationLink']}`;
        postElement.classList.add('post');
        postElement.style.width = 'auto';
        postElement.style.wordBreak = "break-all";
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-name">${parent['imdisplayname']}</div>
                <div class="post-date">
                    <h4>${moment(parent['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}</h4>
                    <p>${moment(parent['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}</p>
                </div>
            </div>
            <hr>
            ${parent['properties']['title'] !== undefined ? `<h3><b>${parent['properties']['title']}</b></h3>` : ''}
            ${parent['properties']['subject'] !== undefined ? `<h6><b>${parent['properties']['subject']}</b></h6>` : ''}
        `;

        postElement.children.item(0).insertBefore(userFromProfilePicture, postElement.children.item(0).children.item(0));
        postElement.appendChild(content);

        if (parent['properties'].hasOwnProperty('files')) {
            let files = JSON.parse(parent['properties']['files']);

            let filesElement = document.createElement('div');
            filesElement.classList.add('post-files');
            filesElement.innerHTML = `${
                files.map(file => `
                    <a href="${file['objectUrl']}" target="_blank">${file['title']}</a>
                `).join('')
            }`;

            postElement.appendChild(filesElement);
        }

        if (post["length"] > 1) {
            let comments = renderComments(post.slice(0, post.length - 1).reverse());
            postElement.appendChild(comments);
        }

        return postElement;
    }
}

function renderComments(comments) {
    let commentsElement = document.createElement('div');
    commentsElement.innerHTML = `
        <a href="#comments-${cssValidID(comments[0]['conversationLink'])}" class="comments-dropdown" role="button" aria-expanded="false">
            Expand ${comments.length} comments
        </a>
    `;

    // setup toggles
    commentsElement.children.item(0).addEventListener('click', function (e) {
        this.classList.toggle('active');
        let collapsed = this.nextElementSibling;
        if (collapsed.style.display === "block") {
            collapsed.style.display = "none";
        } else {
            collapsed.style.display = "block";
        }
        e.preventDefault();
    });

    let list = document.createElement('div');
    list.classList.add('collapse');
    list.id = `comments-${cssValidID(comments[0]['conversationLink'])}`;
    list.style.display = "none";

    comments.forEach(comment => {
        let commentElement = document.createElement('div');
        commentElement.classList.add('comment');

        commentElement.innerHTML = `
            <div class="comment-name">${comment['imdisplayname']}</div>
            <div class="comment-date">
                <p>${moment(comment['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}</p>
                <h4>${moment(comment['composetime'], moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}</h4>
            </div>
            <hr>
        `;

        let contentElement = createContentElement(comment['content']);
        commentElement.appendChild(contentElement);

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 24;
        userFromProfilePicture.height = 24;
        userFromProfilePicture.classList.add("comment-profile-picture");
        networkGetUserProfilePicture(comment['from'].match(/(?<=\/contacts\/)(.*)/g).pop(), "HR64x64").then(blob => {
            userFromProfilePicture.src = URL.createObjectURL(blob);
        });
        commentElement.insertBefore(userFromProfilePicture, commentElement.children.item(0));

        list.appendChild(commentElement);
    });

    commentsElement.appendChild(list);
    return commentsElement;
}

function createContentElement(content) {
    let contentElement = document.createElement('div');
    contentElement.classList.add("post-text-content");
    contentElement.innerHTML = content;

    // remove redundant <div> from post content
    if (contentElement.childNodes.length === 1) {
        let current = contentElement.childNodes.item(0);
        while (current.childNodes !== undefined && current.childNodes.length === 1 && current.childNodes.item(0)["tagName"] === "DIV") {
            current = current.childNodes.item(0);
        }
        if (current["innerHTML"] !== undefined) {
            contentElement.innerHTML = current["innerHTML"];
        } else {
            contentElement.innerHTML = current.nodeValue;
        }
    }

    // setup images
    contentElement.querySelectorAll('img[itemtype="http://schema.skype.com/AMSImage"]').forEach(img => {
        let object = (<HTMLImageElement>img).src.match(/(?<=\/objects\/)(.*)(?=\/views\/)/g).pop();
        (<HTMLImageElement>img).src = "";
        (<HTMLImageElement>img).style.maxWidth = "80%";
        (<HTMLImageElement>img).style.maxHeight = "25vh";
        (<HTMLImageElement>img).style.objectFit = "scale-down";
        (<HTMLImageElement>img).style.width = "";
        (<HTMLImageElement>img).style.height = "";
        (<HTMLImageElement>img).removeAttribute('height');
        (<HTMLImageElement>img).removeAttribute('width');

        networkGetImgo(object).then(blob => {
            let url = URL.createObjectURL(blob);
            (<HTMLImageElement>img).src = url;

            img.addEventListener('click', function () {
                (<HTMLImageElement>document.getElementById('enlarged-image')).src = url;
                document.getElementById('enlarged-image-modal').style.display = "flex";
            });
        })
    });

    // style mentions
    contentElement.querySelectorAll('span[itemtype="http://schema.skype.com/Mention"]').forEach(tag => {
        tag.textContent = "@" + tag.textContent;
        tag.classList.add("post-text-content-mention");
    });

    return contentElement;
}
