<script lang="ts">
    import Post from "./Post.svelte";
    import type {DataMessage} from "../Types";
    import moment from "moment";
    import {NetworkManager} from "../NetworkManager";
    import {Action, AdaptiveCard, OpenUrlAction} from "adaptivecards";
    import {onMount} from "svelte";
    import {open} from "@tauri-apps/api/shell";

    export let post: DataMessage[];
    export let networkManager: NetworkManager;

    let parent = post[post.length - 1];

    let contentDiv;

    onMount(() => {
        let postContent = JSON.parse(atob(new DOMParser().parseFromString(parent.content, 'text/html')
            .getElementsByTagName("swift").item(0).getAttribute('b64')));
        postContent['attachments'].forEach(attachment => {
            let adaptiveCard = new AdaptiveCard();
            adaptiveCard.parse(attachment.content);
            adaptiveCard.onExecuteAction = (action: Action) => {
                if (action instanceof OpenUrlAction) {
                    open(action.url);
                }
            }
            contentDiv.appendChild(adaptiveCard.render());
        });
    })
</script>

<Post
        id={parent.id}
        senderName={parent.imdisplayname}
        senderPhoto={networkManager.getAppImage(parent.imdisplayname)
            .then(b64 => `data:image/jpeg;base64,${b64}`)}
        dateFromNow={moment(parent.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}
        dateSent={moment(parent.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}
        title={undefined}
        subject={undefined}
        files={undefined}
        comments={post.length > 1 ? post.slice(0, post.length - 1).reverse() : []}
        networkManager={networkManager}
>
    <div bind:this={contentDiv}></div>
</Post>
