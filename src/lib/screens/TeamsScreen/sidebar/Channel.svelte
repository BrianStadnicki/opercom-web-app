<script lang="ts">
    import type {DataSideTeamChannel} from "../../../Types";
    import type {Writable} from "svelte/store";

    export let channel: DataSideTeamChannel;
    export let activeChannel: Writable<string>;

    let active = false;
    activeChannel.subscribe(value => {
        active = value === channel.id;
    })

    function clicked() {
        activeChannel.set(channel.id);
    }
</script>

<a on:click={clicked} class:active>{channel.name}</a>

<style lang="scss">
  a {
    display: block;
    background-color: #f1f1f1;
    color: black;
    margin: 5px;
    border-radius: 5px;
    font-size: large;
    user-select: none;
  }

  a.active  {
    background-color: grey;
  }

  a:hover {
    background-color: grey;
  }
</style>
