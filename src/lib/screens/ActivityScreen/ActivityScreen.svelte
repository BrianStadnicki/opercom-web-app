<script lang="ts">
    import {DataManager} from "../../DataManager";
    import {NetworkManager} from "../../NetworkManager";
    import Activities from "./sidebar/Activities.svelte";
    import ChatBox from "../TeamsScreen/ChatBox.svelte";
    import {writable} from "svelte/store";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;

    let activeChannel = new writable("");
    let activeMessage = new writable("");
</script>

<div>
    <Activities networkManager={networkManager} dataManager={dataManager} activeChannel={activeChannel} activeMessage={activeMessage}></Activities>
    <ChatBox networkManager={networkManager} dataManager={dataManager} activeChannel={activeChannel} activeMessage={activeMessage}></ChatBox>
</div>

<style lang="scss">
  div {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: 100%;
  }
</style>
