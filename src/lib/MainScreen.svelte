<script lang="ts">
import TeamsSidebar from "./TeamsSidebar.svelte";

</script>

<div>
    <TeamsSidebar></TeamsSidebar>
</div>

<style lang="scss">
    div {
        display: grid;
        grid-template-columns: 200px 1fr;
        column-gap: 10px;
        height: 95vh;
    }
</style>
