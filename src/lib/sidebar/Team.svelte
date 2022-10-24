<script lang="ts">
    import Channel from "./Channel.svelte";
    import type {DataSideTeam} from "../Types";
    import type {Writable} from "svelte/store";

    export let team: DataSideTeam;
    export let activeChannel: Writable<string>;

</script>

<details class="team">
    <summary>{team.name}</summary>
    {#each team.channels.sort((a, b) => a.isGeneral ? -1 : a.name.localeCompare(b.name))
            as channel}
        <Channel channel={channel} activeChannel={activeChannel}></Channel>
    {/each}
</details>

<style lang="scss">
    .team {
      margin-bottom: 5px;

      summary {
        color: #262626;
        background-color: white;
        border-radius: 5px;
        display: block;
        text-decoration: none;
        font-size: large;
        user-select: none;
      }

      summary:hover {
        background-color: #939393;
      }
    }
</style>
