import {cssValidID, groupByKey} from "./utils";
import {networkGetConversation} from "./network";

export async function hydrate() {
    // show main window
    document.getElementById('main-window').style.display = "block";

    // set self profile picture
    const selfProfilePicture = <HTMLImageElement>document.getElementById('profile-picture-self');
    selfProfilePicture.src = "data:image/jpg;base64," + localStorage.getItem("profile-picture");
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

window["switchChatView"] = switchChatView;
function switchChatView(chat, putInHistory) {
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
    chatViewBox.innerHTML = `
        ${
            Object.values(groupByKey(JSON.parse(localStorage.getItem(chat))['messages'], 'conversationLink'))
                .reverse()
                .map(post => {
                    let parent = post["length"] > 1 ? post[post["length"] - 1] : post[0];
                    if (parent['messagetype'].startsWith('ThreadActivity/')) {
                        return ``
                    } else {
                        return `
                        <div id="post-${post[0]['conversationLink']}">
                            <p>${parent['imdisplayname']} : ${parent['composetime']}</p>
                            <p>${parent['content']}</p>
                        </div>
                        `
                    }
                })
                .join('')
        }
    `;
    // auto-scroll div to bottom
    chatViewBox.scrollTop = chatViewBox.scrollHeight;
}
