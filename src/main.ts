import {cssValidID, groupByKey} from "./utils";
import {networkGetConversation, networkGetUserProfilePicture} from "./network";
import {renderPost, switchToChat} from "./ui/chat/ChatView";

let mainActive = false;

export async function hydrate() {
    // show main window
    document.getElementById('main-window').style.display = "block";
    mainActive = true;

    // set self profile picture
    const selfProfilePicture = <HTMLImageElement>document.getElementById('profile-picture-self');
    networkGetUserProfilePicture(localStorage.getItem("user-id"), "HR64x64").then(b64 => {
        selfProfilePicture.src = `data:image/jpeg;base64,${b64}`;
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

    // setup image enlarge modal
    document.getElementById('enlarged-image-modal').onclick = () => {
        document.getElementById('enlarged-image-modal').style.display = "none";
    }
    document.getElementById('enlarged-image').onclick = (e) => {
        e.stopPropagation();
    }

    document.getElementById('chat-view-box').addEventListener('scroll', function(e) {
        if (!fetchingMessages && (<HTMLDivElement>e.target).scrollTop < 400) {
            fetchingMessages = true;
            let currentJSON = JSON.parse(localStorage.getItem(currentActiveChat));
            let backwardLink = currentJSON["_metadata"]["backwardLink"];
            let params = new URLSearchParams(backwardLink.substring(backwardLink.indexOf("?") + 1));
            networkGetConversation(currentActiveChat, params.get("pageSize"), params.get("startTime"), params.get("syncState"))
                .then(conversation => {
                    currentJSON["_metadata"] = conversation["_metadata"];
                    currentJSON["messages"] = conversation["messages"].concat(currentJSON["messages"]);
                    localStorage.setItem(currentActiveChat, JSON.stringify(currentJSON));

                    Object.values(groupByKey(conversation["messages"], 'conversationLink'))
                        .reverse()
                        .forEach(post => {
                            let rendered = renderPost(post);
                            if (rendered !== undefined) {
                                document.getElementById('chat-messages').prepend(rendered);
                            }
                        });

                    fetchingMessages = false;
                });
        }
    });

}

let fetchingMessages = false;

function createTeamsListItem(team) {
    let res = document.createElement('div');
    res.classList.add("teams-list-item");
    const id = cssValidID(team['id']);
    res.id = `teams-list-${id}`;
    res.innerHTML = `
        <a class="teams-list-team-name collapsible-teams-list-btn" type="button" style="display: block">${team['name']}</a>
            
        <div class="collapsed">
            ${
                team['channels'].map(channel => {
                    return `<div class="teams-list-channel" id="list-group-item-action-${cssValidID(channel['id'])}" onclick="switchChatView('${channel['id']}', true)">${channel['name']}</div>`
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
    document.getElementById('chat-messages').innerHTML = "";

    let channelInList = document.getElementById(`list-group-item-action-${cssValidID(chat)}`);
    if (currentActiveChat !== "") {
        document.getElementById(`list-group-item-action-${cssValidID(currentActiveChat)}`).classList.toggle('active');
    }
    channelInList.classList.toggle('active');

    currentActiveChat = chat;

    let channelListBtn = channelInList.parentElement.previousElementSibling;
    if (!channelListBtn.classList.contains("active")) {
        let activeButtons = document.querySelectorAll('.teams-list-team-name.active');
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
                switchToChat(chat);
            });
    } else {
        switchToChat(chat);
    }
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
