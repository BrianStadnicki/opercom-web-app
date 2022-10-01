<script lang="ts">
    import TeamsSidebar from "./TeamsSidebar.svelte";
    import ChatBox from "./ChatBox.svelte";

    let channel = "";

    function handleEvent(event) {
        channel = event.detail.channel;
    }

</script>

<div>
    <TeamsSidebar on:message={handleEvent}></TeamsSidebar>
    <ChatBox channel={channel}></ChatBox>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        column-gap: 10px;
        height: 95vh;
    }
</style>
