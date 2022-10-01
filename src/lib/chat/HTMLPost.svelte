<script lang="ts">
    import Post from "./Post.svelte";
    import type {DataMessage} from "../Types";
    import moment from "moment";

    export let post: DataMessage[];

    let parent = post[post.length - 1];
</script>

<Post
    id={parent.id}
    senderName={parent.imdisplayname}
    senderPhoto={"data:image/jpeg;base64,AAAA"}
    dateFromNow={moment(parent.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()}
    dateSent={moment(parent.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}
    title={parent.properties.title},
    subject={parent.properties.subject},
    files={parent.properties.files === undefined ? undefined : JSON.parse(parent.properties.files)}
    comments={post.length > 1 ? post.slice(0, post.length - 1) : []}
>
    {@html parent.content}
</Post>

<style lang="scss">

</style>