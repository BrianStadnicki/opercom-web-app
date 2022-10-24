<script lang="ts">
    import {DataManager} from "./DataManager";
    import {NetworkManager} from "./NetworkManager";
    import TeamsScreen from "./screens/TeamsScreen/TeamsScreen.svelte";

    export let dataManager: DataManager;
    export let networkManager: NetworkManager;

    let activeApp = "Teams";
</script>

<div class="whole">
    <div class="top">

    </div>
    <div class="side">
        <i class="bi bi-people"></i>
        <span>Teams</span>
    </div>
    <div class="main">
        {#if activeApp === "Teams"}
            <TeamsScreen dataManager={dataManager} networkManager={networkManager}></TeamsScreen>
        {/if}
    </div>
</div>

<style lang="scss">
  .whole {
    display: grid;
    grid-template-columns: 50px 1fr;
    grid-template-rows: 50px 1fr;
    grid-template-areas:
    "top top"
    "side main";

    height: 100vh;
    background-color: darkblue;

    .top {
      grid-area: top;
    }

    .side {
      grid-area: side;
      i {
        color: white;
        text-align: center;
        font-size: 45px;
      }

      span {
        color: white;
      }
    }

    .main {
      grid-area: main;
      height: calc(100vh - 50px);
    }
  }
</style>
