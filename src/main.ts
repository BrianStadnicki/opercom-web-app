import {cssValidID, groupByKey} from "./utils";
import {networkGetConversation, networkGetImgo, networkGetUserProfilePicture} from "./network";
// @ts-ignore
import moment = require("moment");

let mainActive = false;

export async function hydrate() {
    // show main window
    document.getElementById('main-window').style.display = "block";
    mainActive = true;

    // set self profile picture
    const selfProfilePicture = <HTMLImageElement>document.getElementById('profile-picture-self');
    networkGetUserProfilePicture(localStorage.getItem("user-id"), "HR64x64").then(blob => {
        selfProfilePicture.src = URL.createObjectURL(blob);
    })
    selfProfilePicture.title = localStorage.getItem("user-name");

    // fill list of teams and channels
    JSON.parse(localStorage.getItem('teams'))['teams'].forEach(team => {
        document.getElementById('teams-and-channels-box').appendChild(createTeamsListItem(team));
    });

    // listen for going back in history
    addEventListener('popstate', (event) => {
        switchChatView(event.state['thread'], false);
    });

    // render chat based on url
    let thread = new URL(window.location.href).searchParams.get('thread');
    if (thread !== null) {
        switchChatView(thread, false);
    }
}

function createTeamsListItem(team) {
    let res = document.createElement('div');
    res.classList.add("teams-list-item");
    const id = cssValidID(team['id']);
    res.id = `teams-list-${id}`;
    res.innerHTML = `
        <a class="teams-list-team-name collapsible-teams-list-btn" type="button" active=false style="display: block">${team['name']}</a>
            
        <div class="collapsed">
            ${
                team['channels'].map(channel => {
                    return `<div class="list-group-item-action" id="list-group-item-action-${cssValidID(channel['id'])}" onclick="switchChatView('${channel['id']}', true)">${channel['name']}</div>`
                }).join('')
             }
        </div>
    `;

    // setup toggles
    res.children.item(0).addEventListener('click', function (e) {
        this.classList.toggle('active');
        let collapsed = this.nextElementSibling;
        if (collapsed.style.display === "block") {
            collapsed.style.display = "none";
        } else {
            collapsed.style.display = "block";
        }
        e.preventDefault();
    });

    return res;
}

let currentActiveChat = "";
window["switchChatView"] = switchChatView;

function switchChatView(chat, putInHistory) {
    document.getElementById('chat-view-box').innerHTML = "";

    let channelInList = document.getElementById(`list-group-item-action-${cssValidID(chat)}`);
    channelInList.classList.add('text-bg-primary');
    if (currentActiveChat !== "") {
        document.getElementById(`list-group-item-action-${cssValidID(currentActiveChat)}`).classList.remove('text-bg-primary');
    }
    currentActiveChat = chat;

    let channelListBtn = channelInList.parentElement.previousElementSibling;
    if (!channelListBtn.classList.contains("active")) {
        let activeButtons = document.getElementsByClassName("active");
        for (let i = 0; i < activeButtons.length; i++) {
            (<HTMLElement>activeButtons.item(i)).click();
        }

        (<HTMLElement>channelListBtn).click();
        channelListBtn.scrollIntoView();
    }

    if (putInHistory) {
        let url = new URL(window.location.href);
        url.searchParams.set('thread', chat);
        window.history.pushState({
            'thread': chat
        }, '', url);
    }

    if (localStorage.getItem(chat) === null) {
        networkGetConversation(chat, 20, 1)
            .then(conversations => {
                localStorage.setItem(chat, JSON.stringify(conversations));
                renderChat(chat);
            });
    } else {
        renderChat(chat);
    }
}

function renderChat(chat) {
    let chatViewBox = document.getElementById('chat-view-box');
    Object.values(groupByKey(JSON.parse(localStorage.getItem(chat))['messages'], 'conversationLink'))
        .reverse()
        .forEach(post => chatViewBox.appendChild(renderPost(post)));
    // auto-scroll div to bottom
    chatViewBox.scrollTop = chatViewBox.scrollHeight;
}

function renderPost(post) {
    let parent = post["length"] > 1 ? post[post["length"] - 1] : post[0];
    if (parent['messagetype'].startsWith('ThreadActivity/')) {
        return document.createElement('div');
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
        postElement.insertBefore(userFromProfilePicture, postElement.children.item(0));

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
    contentElement.classList.add("post-text-content")
    contentElement.innerHTML = content;

    // remove redundant <div> from post content
    if (contentElement.children.length === 1) {
        let current = contentElement.children.item(0);
        while (current.children !== undefined && current.children.length === 1 && current.children.item(0).tagName === "DIV") {
            current = current.children.item(0);
        }
        contentElement.innerHTML = current.innerHTML;
        // contentElement.innerHTML = current.innerHTML;
    }

    // setup images
    contentElement.querySelectorAll('img[itemtype="http://schema.skype.com/AMSImage"]').forEach(img => {
        let object = (<HTMLImageElement>img).src.match(/(?<=\/objects\/)(.*)(?=\/views\/)/g).pop();
        (<HTMLImageElement>img).src = "";
        (<HTMLImageElement>img).style.maxWidth = "80%";
        (<HTMLImageElement>img).style.objectFit = "scale-down";
        (<HTMLImageElement>img).style.width = "";
        (<HTMLImageElement>img).style.height = "";
        (<HTMLImageElement>img).removeAttribute('height');
        (<HTMLImageElement>img).removeAttribute('width');

        networkGetImgo(object).then(blob => {
            (<HTMLImageElement>img).src = URL.createObjectURL(blob);
        })
    });

    // style mentions
    contentElement.querySelectorAll('span[itemtype="http://schema.skype.com/Mention"]').forEach(tag => {
        tag.textContent = "@" + tag.textContent;
        tag.classList.add("post-text-content-mention");
    });

    return contentElement;
}

export function showNetworkStatus(status) {
    console.log("network is " + status);
    if (!status) {
        if (mainActive) {
            document.getElementById('navbar-network-failure').style.display = 'inline';
        } else {
            document.getElementById('window-network-failure').style.display = 'block';
        }
    } else {
        if (mainActive) {
            document.getElementById('navbar-network-failure').style.display = 'none';
        } else {
            document.getElementById('window-network-failure').style.display = 'none';
        }
    }

}
