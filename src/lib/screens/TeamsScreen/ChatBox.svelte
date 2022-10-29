<script lang="ts">
    import {NetworkManager} from "../../NetworkManager";
    import type {DataChannel, DataMessage} from "../../Types";
    import moment from "moment";
    import RegularPost from "../../posts/RegularPost.svelte";
    import type {Unsubscriber, Writable} from "svelte/store";
    import AdaptiveCardPost from "../../posts/AdaptiveCardPost.svelte";
    import {DataManager} from "../../DataManager";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;
    export let activeChannel: Writable<string>;
    export let activeMessage: Writable<string>

    let currentChannel: string = "";
    let channelData: DataChannel;

    let channelSubscription: Unsubscriber;

    activeChannel.subscribe(async channel => {
        if (channel !== "") {
            currentChannel = channel;
            scrolledToBottom = false;
            atEnd = false;

            if (channelSubscription !== undefined) {
                channelSubscription();
            }

            channelSubscription = (await dataManager.getChannel(channel)).subscribe(dataChannel => {
                channelData = dataChannel;
                renderPosts(dataChannel);
            });
        }
    })

    let posts: DataMessage[][];
    let postsEnd: number;

    function renderPosts(data: DataChannel) {
        if (data !== undefined && data !== null) {
            posts = <DataMessage[][]>Object.values(groupByKey(
                data.messages
                    .filter(message => message.properties["deletetime"] === undefined)
                    .sort((a, b) => moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
                , 'conversationLink'))
                    .sort((a, b) => moment(b[b.length-1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(a[a.length-1].composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)));
            postsEnd = posts.length > 20 ? 20 : posts.length;

            setTimeout(function () {
                if (scrollDiv.offsetHeight === scrollDiv.scrollHeight) {
                    if (postsEnd < posts.length - 1) {
                        postsEnd += posts.length - postsEnd < 20 ? posts.length - postsEnd - 1 : 20;
                    } else if (!atEnd && channelData._metadata.backwardLink !== undefined) {
                        dataManager.fetchMoreMessages(currentChannel).then(more => {
                            atEnd = !more;
                        })
                    }
                }
            }, 100);
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
                dataManager.fetchMoreMessages(currentChannel).then(newMessages => {
                    if (!newMessages) {
                        atEnd = true;
                    }
                    scrolledToBottom = false;
                })
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
                <RegularPost post={post} networkManager={networkManager} activeMessage={activeMessage}></RegularPost>
            {:else if post[post.length - 1].messagetype === "RichText/Media_Card"}
                <AdaptiveCardPost post={post} networkManager={networkManager} activeMessage={activeMessage}></AdaptiveCardPost>
            {/if}
        {/each}
    {/if}
</div>

<style lang="scss">
    div {
        grid-column: 2 / 3;
        display: flex;
        flex-direction: column-reverse;
        overflow-y: auto;
        padding-bottom: 10px;
        background-color: #ececec;
    }
</style>
