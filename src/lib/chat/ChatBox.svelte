<script lang="ts">
    import {NetworkManager} from "../NetworkManager";
    import type {DataChannel} from "../Types";
    import HTMLPost from "./HTMLPost.svelte";
    import moment from "moment";

    export let networkManager: NetworkManager;
    export let channel: string = "";

    let channelData: DataChannel;

    $: (async () => { if (channel !== "") {
        channelData = null;
        if (localStorage.getItem(`channel-${channel}`) === null) {
            await networkManager.getConversation(channel, 20, 0)
                .then(data => {
                    channelData = <DataChannel>data;
                    localStorage.setItem(`channel-${channel}`, JSON.stringify(channelData));
                })
        } else {
            channelData = JSON.parse(localStorage.getItem(`channel-${channel}`));
        }
    }})();

    function groupByKey(list, key) {
        return list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
    }
</script>

<div>
    {#if channelData !== null && channelData !== undefined}
        {#each Object.values(groupByKey(
            channelData.messages
                .filter(message => message.properties["deletetime"] === undefined)
            , 'conversationLink'))
            .sort((a, b) => moment(b[b.length-1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a[a.length-1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
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
