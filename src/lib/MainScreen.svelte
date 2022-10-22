<script lang="ts">
    import TeamsSidebar from "./sidebar/TeamsSidebar.svelte";
    import ChatBox from "./chat/ChatBox.svelte";
    import {NetworkManager} from "./NetworkManager";
    import {DataManager} from "./DataManager";
    import {onMount} from "svelte";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;

    onMount(() => {
        networkManager.getSocket();
    });
</script>

<div>
    <TeamsSidebar dataManager={dataManager}></TeamsSidebar>
    <ChatBox dataManager={dataManager} networkManager={networkManager}></ChatBox>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        column-gap: 10px;
        height: 100vh;
    }
</style>
