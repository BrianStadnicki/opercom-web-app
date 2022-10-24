<script lang="ts">
    import Post from "./Post.svelte";
    import type {DataMessage} from "../Types";
    import moment from "moment";
    import {NetworkManager} from "../NetworkManager";
    import Content from "./Content.svelte";

    export let post: DataMessage[];
    export let networkManager: NetworkManager;

    let parent = post[post.length - 1];
</script>

<Post
    id={parent.id}
    senderName={parent.imdisplayname}
    senderPhoto={networkManager.getUserProfilePicture(parent.from.substring(parent.from.indexOf("/contacts/") + "/contacts/".length), parent.imdisplayname,
                "HR64x64").then(blob => URL.createObjectURL(blob))}
    dateFromNow={moment(parent.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}
    dateSent={moment(parent.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}
    title={parent.properties.title}
    subject={parent.properties.subject}
    files={parent.properties.files === undefined ? undefined : JSON.parse(parent.properties.files)}
    comments={post.length > 1 ? post.slice(0, post.length - 1).reverse() : []}
    networkManager={networkManager}
>
    <Content content={parent.content} networkManager={networkManager}></Content>
</Post>
