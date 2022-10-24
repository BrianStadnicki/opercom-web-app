<script lang="ts">
  import AuthScreen from "./lib/screens/AuthScreen.svelte";
  import MainScreen from "./lib/screens/TeamsScreen/MainScreen.svelte";
  import {NetworkManager} from "./lib/NetworkManager";
  import {AdaptiveCard} from "adaptivecards";
  import MarkdownIt from "markdown-it";
  import {DataManager} from "./lib/DataManager";

  let dataManager: DataManager;
  let networkManager: NetworkManager;

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
            async () => {
              needAuth = true;
              await setTimeout(() => {}, 5000000);
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

    if (localStorage.getItem("apps") === null) {
      await networkManager.getApps()
              .then(res => {
                localStorage.setItem("apps", JSON.stringify(res));
              })
    }

    dataManager = new DataManager(networkManager);

    return;
  }

  AdaptiveCard.onProcessMarkdown = function (text, result) {
    result.outputHtml = MarkdownIt().render(text);
    result.didProcess = true;
  };
</script>

<main>
  {#if needAuth}
    <AuthScreen></AuthScreen>
  {:else}
    {#await initialise() then _}
      <MainScreen dataManager={dataManager} networkManager={networkManager}></MainScreen>
    {/await}
  {/if}
</main>

<style lang="scss">

</style>
