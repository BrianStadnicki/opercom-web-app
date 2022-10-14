<script lang="ts">
  import AuthScreen from "./lib/AuthScreen.svelte";
  import MainScreen from "./lib/MainScreen.svelte";
  import {NetworkManager} from "./lib/NetworkManager";

  let networkManager;

  let needAuth = !localStorage.getItem("skype-token") ||
    !localStorage.getItem("auth-token") ||
    !localStorage.getItem("email") ||
    !localStorage.getItem("chatspaces-token");

  async function initialise() {
    networkManager = new NetworkManager(
            localStorage.getItem("skype-token"),
            localStorage.getItem("auth-token"),
            localStorage.getItem("email"),
            localStorage.getItem("chatspaces-token"),
            () => {
              needAuth = true;
            }
    );

    if (localStorage.getItem("user-id") === null ||
        localStorage.getItem("user-name") === null ||
        localStorage.getItem("is-private-chat-enabled") === null) {

      await networkManager.getUserProperties(localStorage.getItem("email"))
        .then(res => {
          localStorage.setItem("user-id", res["value"]["mri"]);
          localStorage.setItem("user-name", res["value"]["displayName"])
          localStorage.setItem("is-private-chat-enabled", res["value"]["featureSettings"]["isPrivateChatEnabled"])
        });
    }

    if (localStorage.getItem("teams") === null) {
      await networkManager.getTeamsList()
        .then(res => {
          localStorage.setItem("teams", JSON.stringify(res));
        });
    }
    return;
  }
</script>

<main>
  {#if needAuth}
    <AuthScreen></AuthScreen>
  {:else}
    {#await initialise() then _}
      <MainScreen networkManager={networkManager}></MainScreen>
    {/await}
  {/if}
</main>

<style lang="scss">

</style>
