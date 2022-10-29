<script lang="ts">
  import AuthScreen from "./lib/screens/AuthScreen.svelte";
  import {NetworkManager} from "./lib/NetworkManager";
  import {AdaptiveCard} from "adaptivecards";
  import MarkdownIt from "markdown-it";
  import {DataManager} from "./lib/DataManager";
  import ParentScreen from "./lib/ParentScreen.svelte";

  let dataManager: DataManager;
  let networkManager: NetworkManager;

  let data = {
    "user-id": "AAA",
    "chatspaces-token": "AAA",
    "apps": "[{\"id\":\"14d6962d-6eeb-4f48-8890-de55454bb136\",\"name\":\"Activity\",\"smallImageUrl\":\"svg/icons-bell.html\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/activity_largeimage.png\"},{\"id\":\"20c3440d-c67e-4420-9f80-0e50c39693df\",\"name\":\"Calling\",\"smallImageUrl\":\"svg/icons-call.html\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/calls_largeimage.png\"},{\"id\":\"2a84919f-59d8-4441-a975-2a8c2643b741\",\"name\":\"Teams\",\"smallImageUrl\":\"svg/icons-teams-medium.html\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/teams_largeimage.png\"},{\"id\":\"34b01851-c13d-4604-bb3b-5de1ecbf0288\",\"name\":\"Saved\",\"smallImageUrl\":\"svg/icons-bookmark.html\",\"largeImageUrl\":\"svg/icons-bookmark.html\"},{\"id\":\"5af6a76b-40fc-4ba1-af29-8f49b08e44fd\",\"name\":\"Files\",\"smallImageUrl\":\"svg/icons-document.html\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/files_largeimage.png\"},{\"id\":\"86fcd49b-61a2-4701-b771-54728cd291fb\",\"name\":\"Chat\",\"smallImageUrl\":\"svg/icons-chat-medium.html\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/chat_largeimage.png\"},{\"id\":\"a2da8768-95d5-419e-9441-3b539865b118\",\"name\":\"Search\",\"smallImageUrl\":\"svg/icons-search.html\",\"largeImageUrl\":\"svg/icons-search.html\"},{\"id\":\"ef56c0de-36fc-4ef8-b417-3d82ba9d073c\",\"name\":\"Calendar\",\"smallImageUrl\":\"svg/icons-calendar-medium.html\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/meetings_largeimage.png\"},{\"id\":\"14072831-8a2a-4f76-9294-057bf0b42a68\",\"name\":\"Developer Portal\",\"smallImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/14072831-8a2a-4f76-9294-057bf0b42a68_smallImage.png?v=1.0.3\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/14072831-8a2a-4f76-9294-057bf0b42a68_largeImage.png?v=1.0.3\"},{\"id\":\"42f6c1da-a241-483a-a3cc-4f5be9185951\",\"name\":\"Shifts\",\"smallImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/shifts_smallimage.png?v=1.0.0\",\"largeImageUrl\":\"https://statics.teams.cdn.office.net/evergreen-assets/apps/shifts_largeimage.png?v=1.0.0\"}]",
    "teams": JSON.stringify([
      {
        "channels": [
          {
            "id": "19:1c47f6964d7d474ea8fbd6c321e17945@thread.tacv2",
            "name": "Research and Development",
            "isGeneral": false,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          },
          {
            "id": "19:d0c11a7050404a71ad669c8009a6d9e3@thread.tacv2",
            "name": "Design",
            "isGeneral": false,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          },
          {
            "id": "19:b59a434445674f2b8542960d35a34ad6@thread.tacv2",
            "name": "Digital Assets Web",
            "isGeneral": false,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          },
          {
            "id": "19:9f394983ab7347448a652748005d3c9a@thread.tacv2",
            "name": "General",
            "isGeneral": true,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          }
        ],
        "id": "19:9f394983ab7347448a652748005d3c9a@thread.tacv2",
        "isArchived": false,
        "isCollapsed": false,
        "isDeleted": false,
        "isFavorite": true,
        "name": "Mark 8 Project Team",
        "pictureETag": "\"883025A7\""
      },
      {
        "channels": [
          {
            "id": "19:5b842b3761f245f4a6932ee4b22658ad@thread.tacv2",
            "name": "Monthly Reports",
            "isGeneral": false,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          },
          {
            "id": "19:dc66f3a944354f9286624026c12d356f@thread.tacv2",
            "name": "General",
            "isGeneral": true,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          }
        ],
        "id": "19:dc66f3a944354f9286624026c12d356f@thread.tacv2",
        "isArchived": false,
        "isCollapsed": false,
        "isDeleted": false,
        "isFavorite": true,
        "name": "Sales and Marketing",
        "pictureETag": "\"45FD142C\""
      },
      {
        "channels": [
          {
            "id": "19:8243f029bad7418db6f3128f8d33dafe@thread.tacv2",
            "name": "General",
            "isGeneral": true,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          }
        ],
        "id": "19:8243f029bad7418db6f3128f8d33dafe@thread.tacv2",
        "isArchived": false,
        "isCollapsed": false,
        "isDeleted": false,
        "isFavorite": true,
        "name": "Retail",
        "pictureETag": "\"DF736BE8\""
      },

      {
        "channels": [
          {
            "id": "19:fab6c71ae0e14334ad085d24e236593a@thread.tacv2",
            "name": "General",
            "isGeneral": true,
            "isFavorite": true,
            "isDeleted": false,
            "isArchived": false,
            "isPinned": false
          }
        ],
        "id": "19:fab6c71ae0e14334ad085d24e236593a@thread.tacv2",
        "isArchived": false,
        "isCollapsed": false,
        "isDeleted": false,
        "isFavorite": true,
        "name": "Digital Initiative Public Relations",
        "pictureETag": "\"2807B076\""
      }
    ]),
    "is-private-chat-enabled": "true",
    "user-name": "Alex Wilber",
    "email": "AlexW@1hjgkkyf.onmicrosoft.com",
    "auth-token": "Bearer AAAAAAA",
    "skype-token": "AAAAAAA"
  };

  for (let dataKey in data) {
    localStorage.setItem(dataKey, data[dataKey]);
  }

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
      <ParentScreen dataManager={dataManager} networkManager={networkManager}></ParentScreen>
    {/await}
  {/if}
</main>

<style lang="scss">

</style>
