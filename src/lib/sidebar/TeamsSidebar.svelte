<script lang="ts">
    import Team from "./Team.svelte";
    import {createEventDispatcher} from "svelte";
    import type {DataSideTeam} from "../Types";

    let teams: DataSideTeam[] = JSON.parse(localStorage.getItem("teams"));
    let activeChannel = "";

    let dispatch = createEventDispatcher();

    function handleEvent(event) {
        activeChannel = event.detail.channel;

        dispatch('message', event.detail);
    }

</script>

<div>
    {#each teams as team}
        <Team team={team} activeChannel={activeChannel} on:message={handleEvent}></Team>
    {/each}
</div>

<style lang="scss">
  div {
    grid-column: 1 / 2;
    overflow-y: auto;
    background-color: $colour-1;
    scroll-behavior: smooth;
  }
</style>
