<script lang="ts">
    import Team from "./Team.svelte";
    import {DataManager} from "../DataManager";
    import type {DataSideTeam} from "../Types";

    export let dataManager: DataManager;

    let teams: DataSideTeam[];

    dataManager.getChannels().then(channelsStore => {
        channelsStore.subscribe(data => {
            teams = data;
        })
    })
</script>

<div>
    {#if teams !== undefined}
        {#each teams.filter(team => team.isFavorite) as team}
            <Team team={team} activeChannel={dataManager.getActiveChannel()}></Team>
        {/each}
        <details>
            <summary>Hidden</summary>
            {#each teams.filter(team => !team.isFavorite && !team.isArchived) as team}
                <Team team={team} activeChannel={dataManager.getActiveChannel()}></Team>
            {/each}
        </details>
    {/if}
</div>

<style lang="scss">
  div {
    grid-column: 1 / 2;
    overflow-y: auto;
    background-color: #dcdcdc;
    scroll-behavior: smooth;
  }

  summary {
    background-color: white;
    margin: 5px;
  }
</style>
