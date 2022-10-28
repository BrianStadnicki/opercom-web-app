<script lang="ts">
    import {DataManager} from "../../../DataManager";
    import {NetworkManager} from "../../../NetworkManager";
    import type {Unsubscriber, Writable} from "svelte/store";
    import {onDestroy} from "svelte";
    import Activity from "./Activity.svelte";
    import type {DataMessage} from "../../../Types";
    import moment from "moment/moment";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;
    export let activeChannel: Writable<string>;
    export let activeMessage: Writable<string>;

    let subscription: Unsubscriber;
    let activities: DataMessage[];

    dataManager.getChannel("48:notifications").then(writable => {
        subscription = writable.subscribe(dataChannel => {
            activities = dataChannel.messages
                .sort((a, b) => moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)
                    .diff(moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)));
            console.log(activities)
        });
    });

    onDestroy(() => {
        if (subscription !== undefined) {
            subscription();
        }
    });
</script>

<div>
    {#if activities !== undefined}
        {#each activities as activity (activity.id)}
            <Activity networkManager={networkManager} activity={activity} activeChannel={activeChannel} activeMessage={activeMessage}></Activity>
        {/each}
    {/if}
</div>

<style lang="scss">
    div {
      background-color: #dcdcdc;
      overflow-y: auto;
    }
</style>
