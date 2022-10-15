<script lang="ts">
    import type {DataSideTeamChannel} from "../Types";
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
  a:not(:first-child) {
    border-top-color: $colour-2;
    border-top-style: dashed;
  }

  a {
    display: block;
    background-color: $colour-4;
    color: $colour-1;
    font-size: large;
  }

  a.active  {
    background-color: $colour-2;
  }

  a:hover {
    background-color: $colour-5;
  }
</style>
