<script lang="ts">
    import {DataManager} from "../../DataManager";
    import {NetworkManager} from "../../NetworkManager";
    import Activities from "./sidebar/Activities.svelte";
    import ChatBox from "../TeamsScreen/ChatBox.svelte";
    import {writable} from "svelte/store";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;

    let activeActivity = new writable<{channel: string, message: string}>({
        channel: undefined,
        message: undefined,
    });

    activeActivity.subscribe(active => {
        dataManager.getActiveChannel().set(active.channel);
    })
</script>

<div>
    <Activities activeActivity={activeActivity} networkManager={networkManager} dataManager={dataManager}></Activities>
    <ChatBox networkManager={networkManager} dataManager={dataManager}></ChatBox>
</div>

<style lang="scss">
  div {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: 100%;
  }
</style>
