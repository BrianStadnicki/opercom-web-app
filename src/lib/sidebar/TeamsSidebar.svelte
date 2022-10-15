<script lang="ts">
    import Team from "./Team.svelte";
    import type {DataSideTeam} from "../Types";
    import type {Writable} from "svelte/store";

    let teams: DataSideTeam[] = JSON.parse(localStorage.getItem("teams"));
    export let activeChannel: Writable<string>;
</script>

<div>
    {#each teams.filter(team => team.isFavorite) as team}
        <Team team={team} activeChannel={activeChannel}></Team>
    {/each}
    <details>
        <summary>Hidden</summary>
        {#each teams.filter(team => !team.isFavorite && !team.isArchived) as team}
            <Team team={team} activeChannel={activeChannel}></Team>
        {/each}
    </details>

</div>

<style lang="scss">
  div {
    grid-column: 1 / 2;
    overflow-y: auto;
    background-color: $colour-1;
    scroll-behavior: smooth;
  }

  summary {
    background-color: orange;
  }
</style>
