<script lang="ts">
    import Channel from "./Channel.svelte";
    import type {DataSideTeam} from "../Types";

    export let team: DataSideTeam;
    export let activeChannel: string;

    let teamChannelsVisibility = false;

    function toggleChannelList() {
        teamChannelsVisibility = !teamChannelsVisibility;
    }

</script>

<div class="team">
    <a type="button" on:click={toggleChannelList}>{team.name}</a>
    <div class:teamChannelsVisibility>
        {#each team.channels as channel}
            <Channel channel={channel} on:message active={activeChannel === channel.id}></Channel>
        {/each}
    </div>
</div>

<style lang="scss">
    .team {
      margin-bottom: 5px;

      a {
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

      div {
        display: none;
      }

      div.teamChannelsVisibility {
        display: block;
      }
    }
</style>
