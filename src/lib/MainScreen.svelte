<script lang="ts">
    import TeamsSidebar from "./sidebar/TeamsSidebar.svelte";
    import ChatBox from "./chat/ChatBox.svelte";
    import {NetworkManager} from "./NetworkManager";
    import {writable} from "svelte/store";

    export let networkManager: NetworkManager;

    const activeChannel = writable("");
</script>

<div>
    <TeamsSidebar activeChannel={activeChannel}></TeamsSidebar>
    <ChatBox activeChannel={activeChannel} networkManager={networkManager}></ChatBox>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        column-gap: 10px;
        height: 100vh;
    }
</style>
