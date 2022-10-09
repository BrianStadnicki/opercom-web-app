<script lang="ts">
    import {NetworkManager} from "../NetworkManager";
    import type {DataChannel} from "../Types";
    import HTMLPost from "./HTMLPost.svelte";
    import moment from "moment";

    export let networkManager: NetworkManager;
    export let channel: string = "";

    let channelData: DataChannel;

    async function init(channel) {
        if (channel !== "") {
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
    }

    $: init(channel);

    let scrollDiv: HTMLDivElement;
    let scrolledToBottom = false;
    let atEnd = false;
    function handleScroll() {
        if (!scrolledToBottom && !atEnd && channelData._metadata.backwardLink != undefined && scrollDiv.scrollTop === scrollDiv.scrollHeight - scrollDiv.offsetHeight) {
            scrolledToBottom = true;
            console.log(channelData);
            let params = new URL(channelData._metadata.backwardLink).searchParams;
            networkManager.getConversation(channel, 20, params.get("startTime"), params.get("syncState"))
                .then(data => {
                    data.messages = data.messages.filter(message => !channelData.messages.some(message2 => message2.id === message.id));
                    if (data.messages.length !== 0) {
                        channelData.messages = [...channelData.messages, ...data.messages];
                        localStorage.setItem(`channel-${channel}`, JSON.stringify(channelData));
                    } else {
                        atEnd = true;
                    }
                    scrolledToBottom = false;
                });
        }
    }

    function groupByKey(list, key) {
        return list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
    }
</script>

<div bind:this={scrollDiv} on:scroll={handleScroll}>
    {#if channelData !== null && channelData !== undefined}
        {#each Object.values(groupByKey(
                channelData.messages
                .filter(message => message.properties["deletetime"] === undefined)
                .sort((a, b) => moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
                , 'conversationLink'))
                as post (post[post.length-1].id)}
            {#if post[post.length - 1].messagetype === "RichText/Html"}
                <HTMLPost post={post} networkManager={networkManager}></HTMLPost>
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
