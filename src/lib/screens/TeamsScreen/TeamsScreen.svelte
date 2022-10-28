<script lang="ts">
    import TeamsSidebar from "./sidebar/TeamsSidebar.svelte";
    import ChatBox from "./ChatBox.svelte";
    import {NetworkManager} from "../../NetworkManager";
    import {DataManager} from "../../DataManager";
    import {onMount} from "svelte";
    import {writable} from "svelte/store";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;
    let activeChannel = writable("");

    onMount(() => {
        networkManager.getSocket();
    });
</script>

<div>
    <TeamsSidebar dataManager={dataManager} activeChannel={activeChannel}></TeamsSidebar>
    <ChatBox dataManager={dataManager} networkManager={networkManager} activeChannel={activeChannel}></ChatBox>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        height: 100%;
    }
</style>
