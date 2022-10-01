<script lang="ts">
    import Team from "./sidebar/Team.svelte";
    import {createEventDispatcher} from "svelte";

    let teams: [object] = JSON.parse(localStorage.getItem("teams"))["teams"];
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
    overflow-y: scroll;
    max-height: 95vh;
    background-color: $colour-1;
  }
</style>
