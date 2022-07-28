import {cssValidID, groupByKey} from "./utils";
import {networkGetConversation, networkGetImgo, networkGetUserProfilePicture} from "./network";

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
    res.classList.add("list-group-item");
    const id = cssValidID(team['id']);
    res.id = `teams-list-${id}`;
    res.innerHTML = `
        <a data-bs-toggle="collapse" href="#teams-list-${id}-channels"
            role="button" class="fs-6 fw-bold text-decoration-none text-body" style="display: block">${team['name']}</a>
            
        <div id="teams-list-${id}-channels" class="collapse">
            ${
                team['channels'].map(channel => {
                    return `<div style="font-size: medium" class="list-group-item-action" id="list-group-item-action-${cssValidID(channel['id'])}" onclick="switchChatView('${channel['id']}', true)">${channel['name']}</div>`
                }).join('')
             }
        </div>
    `;
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
    if (channelListBtn.getAttribute('aria-expanded') === 'false' || channelListBtn.getAttribute('aria-expanded') === null) {
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
    } else {
        let content = createContentElement(parent['content']);

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 32;
        userFromProfilePicture.height = 32;
        userFromProfilePicture.classList.add("d-inline");
        networkGetUserProfilePicture(parent['from'].match(/(?<=\/contacts\/)(.*)/g).pop(), "HR64x64").then(blob => {
            userFromProfilePicture.src = URL.createObjectURL(blob);
        });

        let postElement = document.createElement('div');
        postElement.id = `post-${post[0]['conversationLink']}`;
        postElement.classList.add('border', 'border-dark', 'm-2', 'p-2');
        postElement.style.width = 'auto';
        postElement.style.wordBreak = "break-all";
        postElement.innerHTML = `
            <div class="d-inline">${parent['imdisplayname']} : ${new Date(Date.parse(parent['composetime'])).toLocaleString()}</div>
            <hr>
            ${parent['properties']['title'] !== undefined ? `<h3><b>${parent['properties']['title']}</b></h3>` : ''}
            ${parent['properties']['subject'] !== undefined ? `<h6><b>${parent['properties']['subject']}</b></h6>` : ''}
        `;

        postElement.insertBefore(userFromProfilePicture, postElement.children.item(0));
        postElement.appendChild(content);

        if (post["length"] > 1) {
            let comments = renderComments(post.slice(0, post.length - 1));
            postElement.appendChild(comments);
        }

        return postElement;
    }
}

function renderComments(comments) {
    let commentsElement = document.createElement('div');
    commentsElement.innerHTML = `
        <hr style="margin-top: 0.5rem; margin-bottom: 0.2rem">
        <a data-bs-toggle="collapse" href="#comments-${cssValidID(comments[0]['conversationLink'])}" class="text-decoration-none text-body"
            style="font-size: small; display: block" role="button" aria-expanded="false" aria-controls="collapseExample">
            Expand ${comments.length} comments
        </a>
    `;

    let list = document.createElement('div');
    list.classList.add('collapse');
    list.id = `comments-${cssValidID(comments[0]['conversationLink'])}`;

    comments.forEach(comment => {
        let commentElement = document.createElement('div');
        commentElement.classList.add('border', 'border-dark', 'm-1', 'p-1');

        commentElement.innerHTML = `
            <div class="d-inline">${comment['imdisplayname']} : ${new Date(Date.parse(comment['composetime'])).toLocaleString()}</div>
            <hr style="margin-top: 0.2rem; margin-bottom: 0.2rem">
        `;

        let contentElement = createContentElement(comment['content']);
        commentElement.appendChild(contentElement);

        let userFromProfilePicture = document.createElement('img');
        userFromProfilePicture.width = 24;
        userFromProfilePicture.height = 24;
        userFromProfilePicture.classList.add("d-inline");
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
    contentElement.innerHTML = content;
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
    contentElement.querySelectorAll('span[itemtype="http://schema.skype.com/Mention"]').forEach(tag => {
        tag.textContent = "@" + tag.textContent;
        tag.classList.add("text-bg-primary", "badge");
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
