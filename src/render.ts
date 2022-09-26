import {cssValidID, groupByKey} from "./utils";
// @ts-ignore
import moment = require("moment");
import {MediaCard} from "./ui/chat/posts/richText/MediaCard";
import {HTML} from "./ui/chat/posts/richText/HTML";
import {Text} from "./ui/chat/posts/Text";
import {Comment} from "./ui/chat/Comment";

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
                chatMsgsBox.appendChild(rendered);
                rendered.scrollIntoView(false);
            }
        });

    if (!postsExist) {
        document.getElementById('chat-messages').style.display = 'none';
        document.getElementById('no-posts-exist').style.display = 'block';
    }
}

function renderPost(post) {
    let parent = post["length"] > 1 ? post[post["length"] - 1] : post[0];
    let comments = post.length > 1 ? renderComments(post.slice(0, post.length - 1).reverse()) : undefined;

    if (parent['messagetype'].startsWith('ThreadActivity/')) {
        return undefined;
    } else if (parent['messagetype'] === 'RichText/Media_Card') {
        return new MediaCard().render(parent, comments);
    } else if (parent['messagetype'] === 'RichText/Html'){
        return new HTML().render(parent, comments);
    } else if (parent['messagetype'] === 'Text') {
        return new Text().render(parent, comments);
    }
}

function renderComments(comments) {
    let commentsElement = document.createElement('div');
    commentsElement.classList.add("comments-div")
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
        list.appendChild(new Comment().render(comment));
    });

    commentsElement.appendChild(list);
    return commentsElement;
}
