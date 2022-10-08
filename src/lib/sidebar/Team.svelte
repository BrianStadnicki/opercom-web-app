<script lang="ts">
    import Channel from "./Channel.svelte";
    import type {DataSideTeam} from "../Types";

    export let team: DataSideTeam;
    export let activeChannel: string;

</script>

<details class="team">
    <summary>{team.name}</summary>
    {#each team.channels.sort((a, b) => a.id === team.id ? -1 : a.name.localeCompare(b.name))
            as channel}
        <Channel channel={channel} on:message active={activeChannel === channel.id}></Channel>
    {/each}
</details>

<style lang="scss">
    .team {
      margin-bottom: 5px;

      summary {
        color: $colour-1;
        background-color: $colour-5;
        display: block;
        text-decoration: none;
        font-size: large;
        cursor: pointer;
      }

      a:hover {
        background-color: $colour-4;
      }
    }
</style>
