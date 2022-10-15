<script lang="ts">
    import {NetworkManager} from "../NetworkManager";
    import type {DataChannel, DataMessage} from "../Types";
    import moment from "moment";
    import RegularPost from "./RegularPost.svelte";
    import type {Writable} from "svelte/store";

    export let networkManager: NetworkManager;
    export let activeChannel: Writable<string>;

    let currentChannel: string = "";
    let channelData: DataChannel;

    activeChannel.subscribe(async channel => {
        if (channel !== "") {
            currentChannel = channel;
            channelData = null;
            if (localStorage.getItem(`channel-${channel}`) === null) {
                await networkManager.getConversation(channel, 20, 0)
                    .then(data => {
                        channelData = data;
                        localStorage.setItem(`channel-${channel}`, JSON.stringify(channelData));
                    })
            } else {
                channelData = JSON.parse(localStorage.getItem(`channel-${channel}`));
            }
            scrolledToBottom = false;
            atEnd = false;
        }
    })

    let posts: DataMessage[][];
    let postsEnd: number;

    $: renderPosts(channelData);

    function renderPosts(data: DataChannel) {
        if (data !== undefined && data !== null) {
            posts = <DataMessage[][]>Object.values(groupByKey(
                data.messages
                    .filter(message => message.properties["deletetime"] === undefined)
                    .sort((a, b) => moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
                , 'conversationLink'))
                    .sort((a, b) => moment(b[b.length-1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a[a.length-1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)));
            postsEnd = posts.length > 20 ? 20 : posts.length;
        }
    }

    let scrollDiv: HTMLDivElement;
    let scrolledToBottom = false;
    let atEnd = false;
    function handleScroll() {
        if (!scrolledToBottom && scrollDiv.scrollTop === scrollDiv.scrollHeight - scrollDiv.offsetHeight) {
            if (postsEnd < posts.length - 1) {
                postsEnd += posts.length - postsEnd < 20 ? posts.length - postsEnd - 1 : 20;
            } else if (!atEnd && channelData._metadata.backwardLink !== undefined) {
                scrolledToBottom = true;
                let params = new URL(channelData._metadata.backwardLink).searchParams;
                networkManager.getConversation(currentChannel, 20, params.get("startTime"), params.get("syncState"))
                    .then(data => {
                        data.messages = data.messages.filter(message => !channelData.messages.some(message2 => message2.id === message.id));
                        channelData._metadata = data._metadata;
                        if (data.messages.length !== 0) {
                            channelData.messages = [...channelData.messages, ...data.messages];
                            localStorage.setItem(`channel-${currentChannel}`, JSON.stringify(channelData));
                        } else {
                            atEnd = true;
                        }
                        scrolledToBottom = false;
                    });
            }
        }
    }

    function groupByKey(list, key) {
        return list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
    }
</script>

<div bind:this={scrollDiv} on:scroll={handleScroll}>
    {#if posts !== undefined}
        {#each posts.slice(0, postsEnd) as post (post[post.length-1].id)}
            {#if post[post.length - 1].messagetype === "RichText/Html" || post[post.length - 1].messagetype === "Text"}
                <RegularPost post={post} networkManager={networkManager}></RegularPost>
            {/if}
        {/each}
    {/if}
</div>

<style lang="scss">
    div {
        grid-column: 2 / 3;
        overflow-y: auto;
        padding-bottom: 10px;
        scroll-behavior: smooth;
    }
</style>
