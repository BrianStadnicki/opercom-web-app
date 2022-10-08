<script lang="ts">
    import TeamsSidebar from "./sidebar/TeamsSidebar.svelte";
    import ChatBox from "./chat/ChatBox.svelte";
    import {NetworkManager} from "./NetworkManager";

    export let networkManager: NetworkManager;

    let channel = "";

    function handleEvent(event) {
        channel = event.detail.channel;
    }

</script>

<div>
    <TeamsSidebar on:message={handleEvent}></TeamsSidebar>
    <ChatBox channel={channel} networkManager={networkManager}></ChatBox>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        column-gap: 10px;
        height: 98vh;
    }
</style>
