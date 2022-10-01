<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import type {DataSideTeamChannel} from "../Types";

    export let channel: DataSideTeamChannel;

    export let active: boolean;

    let dispatch = createEventDispatcher();

    let selected = false;

    function clicked() {
        selected = true;
        dispatch('message', {
            channel: channel.id
        })
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
