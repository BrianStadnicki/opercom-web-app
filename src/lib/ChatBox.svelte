<script lang="ts">
    export let channel: string;
</script>

<div>
    {channel}
</div>

<style>
    div {
        grid-column: 2 / 3;
        overflow-y: scroll;
        max-height: 95vh;
        padding-bottom: 10px;
    }
</style>
