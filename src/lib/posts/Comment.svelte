<script lang="ts">
    import type {DataMessage} from "../Types";
    import moment from "moment";

    export let message: DataMessage;
    export let networkManager;

</script>

<div class="comment">

    {#await networkManager.getUserProfilePicture(message.from.substring(message.from.indexOf("/contacts/") + "/contacts/".length), message.imdisplayname,
        "HR64x64").then(blob => URL.createObjectURL(blob)) then photo}
        <img src={photo} width="32" height="32" class="profile-image">
    {/await}

    <div class="main">
        <div class="header">
            <p class="name">{message.imdisplayname}</p>
            <div class="dates">
                <p class="sent">{moment(message.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).format("dddd, Do MMMM YYYY, h:mm:ss a")}</p>
            </div>
        </div>

        <div class="content">
            <slot></slot>
        </div>
    </div>

</div>

<style lang="scss">
    .comment {
      display: grid;
      grid-template-columns: 36px auto;
      border-bottom: lightgrey solid;
      padding: 5px;

      .profile-image {
        grid-column: 1;
        grid-row: 1;
        pointer-events: none;
        border-radius: 5px;
      }

      .main {
        grid-column: 2;
        grid-row: 1;

        .header {
          display: flex;
          flex-direction: row;

          .name {
            font-size: large;
            font-weight: bold;
            margin-top: 0;
            margin-bottom: 0;
          }

          .dates {
            margin-left: auto;
            text-align: right;
            vertical-align: super;

            .sent {
              margin-top: 0;
              margin-bottom: 0;
              font-size: small;
            }
          }
        }

        .content {
          margin-left: 0;
        }
      }
    }

    .comment:last-child {
      border-bottom: none;
    }
</style>
