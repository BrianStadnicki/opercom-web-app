<script lang="ts">
    import loadingGIF from "../../assets/loading.gif";
    import type {DataMessage} from "../Types";
    import Comment from "./Comment.svelte";
    import Content from "./Content.svelte";
    import moment from "moment";

    export let id: string;
    export let senderName: string;
    export let senderPhoto: Promise<string>;
    export let dateFromNow: string;
    export let dateSent: string;
    export let title: string;
    export let subject: string;
    export let files: object[];
    export let comments: DataMessage[];
    export let networkManager;
</script>

<div class="post">
    {#await senderPhoto}
        <img src={loadingGIF} width="64" height="64" class="profile-image">
    {:then photo}
        <img src={photo} width="64" height="64" class="profile-image">
    {/await}

    <div class="main">

        <div class="header">
            <p class="name">{senderName}</p>
            <div class="dates">
                <p class="from-now">{dateFromNow}</p>
                <p class="sent">{dateSent}</p>
            </div>
        </div>

        <div class="content">
            {#if title !== undefined}
                <h3 class="title">{title}</h3>
            {/if}
            {#if subject !== undefined}
                <h6 class="subject">{subject}</h6>
            {/if}

            <slot></slot>
        </div>

        {#if files !== undefined}
            <div class="files">

            </div>
        {/if}

        {#if comments.length !== 0}
            <div class="comments">
                {#each comments
                    .sort((a, b) => moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
                        as comment (comment.id)}

                    <Comment message={comment} networkManager={networkManager}>
                        <Content content={comment.content} networkManager={networkManager}></Content>
                    </Comment>
                {/each}
            </div>
        {/if}
    </div>
</div>

<style lang="scss">
  .post {
    display: grid;
    grid-template-columns: 64px auto;
    column-gap: 5px;
    padding: 2px;
    margin-left: 10px;
    margin-right: 10px;
    word-break: break-all;

    .profile-image {
      grid-column: 1;
      grid-row: 1;
      pointer-events: none;
    }

    .main {
      grid-column: 2;
      grid-row: 1;
      border: red 5px solid;

      .header {

        display: flex;
        flex-direction: row;
        border-bottom: red 2px solid;
        padding: 5px;

        .name {
          margin-top: 0;
          margin-bottom: 0;
          vertical-align: super;
          font-size: larger;
          font-weight: bold;
        }

        .dates {
          margin-left: auto;
          text-align: right;
          vertical-align: super;

          .from-now {
            margin-top: 0;
            margin-bottom: 0;
            font-size: medium;
          }

          .sent {
            margin-top: 0;
            margin-bottom: 0;
            font-size: small;
          }
        }

      }

      .content {
        margin: 5px;

        .title {
          font-size: x-large;
          margin-block: 10px;
        }

        .subject {
          font-size: large;
          margin-block: 10px;
        }
      }

      .files {
        margin-top: 20px;
        margin-bottom: 5px;
        padding: 5px;

        .file {
          border: blue 2px dashed;
          padding: 5px;
          text-decoration: none;
        }
      }

      .comments {
        grid-column: 2;
        grid-row: 2;

        padding: 10px;
        border-top: red solid;
      }

    }
  }
</style>
