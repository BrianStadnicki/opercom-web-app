<script lang="ts">
    import TeamsSidebar from "./sidebar/TeamsSidebar.svelte";
    import ChatBox from "./chat/ChatBox.svelte";
    import {NetworkManager} from "./NetworkManager";
    import {writable} from "svelte/store";
    import {DataManager} from "./DataManager";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;

    const activeChannel = writable("");
</script>

<div>
    <TeamsSidebar dataManager={dataManager} activeChannel={activeChannel}></TeamsSidebar>
    <ChatBox dataManager={dataManager} activeChannel={activeChannel} networkManager={networkManager}></ChatBox>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        column-gap: 10px;
        height: 100vh;
    }
</style>
