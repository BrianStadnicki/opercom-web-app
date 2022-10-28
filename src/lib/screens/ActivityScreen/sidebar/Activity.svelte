<script lang="ts">
    import type {DataMessage} from "../../../Types";
    import {NetworkManager} from "../../../NetworkManager";
    import moment from "moment";
    import type {Writable} from "svelte/store";

    export let networkManager: NetworkManager;
    export let activity: DataMessage;
    export let activeChannel: Writable<string>;
    export let activeMessage: Writable<string>;

    let active = false;

    activeMessage.subscribe(current => {
        active = current === activity.properties.activity.sourceMessageId;
    });

    function clicked() {
        activeChannel.set(activity.properties.activity.sourceThreadId);
        activeMessage.set(activity.properties.activity.sourceMessageId);
    }
</script>

<div class="activity" on:click={clicked} class:active>
    {#await networkManager.getUserProfilePicture(activity.properties.activity.sourceUserId, activity.properties.activity.sourceUserImDisplayName,
        "HR64x64").then(blob => URL.createObjectURL(blob)) then src}
        <img class="image" src={src} width=40 height=40>
    {/await}
    <span class="title">{activity.properties.activity.sourceUserImDisplayName}</span>
    <span class="date">
        {moment(activity.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).fromNow()} :
        {moment(activity.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("DD/MM")}
    </span>
    <span class="content">{activity.properties.activity.messagePreview}</span>
    <span class="location">{activity.properties.activity.sourceThreadTopic}</span>
</div>

<style lang="scss">
  .activity {
    display: grid;
    grid-template-columns: 40px 1fr 1fr;
    grid-template-rows: 40px 3em 1em;
    grid-column-gap: 5px;
    grid-auto-flow: row;
    grid-template-areas:
    "image title date"
    ". content content"
    ". location location";
    padding-top: 10px;
    padding-bottom: 10px;
    border-bottom: grey solid;
  }

  .activity.active {
    background-color: white;
  }

  .image {
    grid-area: image;
    border-radius: 5px;
  }

  .date {
    grid-area: date;
    text-align: right;
    font-size: small;
  }

  .title {
    grid-area: title;
    font-size: medium;
  }

  .content {
    grid-area: content;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    color: #525252;
  }

  .location {
    grid-area: location;
  }
</style>
