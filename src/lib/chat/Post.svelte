<script lang="ts">
    import type {DataFile, DataMessage} from "../Types";
    import Comment from "./Comment.svelte";
    import Content from "./Content.svelte";
    import moment from "moment";
    import {onMount} from "svelte";

    export let id: string;
    export let senderName: string;
    export let senderPhoto: Promise<string>;
    export let dateFromNow: string;
    export let dateSent: string;
    export let title: string;
    export let subject: string;
    export let files: DataFile[];
    export let comments: DataMessage[];
    export let networkManager;

    let content: HTMLDivElement;
    let showMoreBtn: boolean;
    let showAll: boolean;

    onMount(() => {
        showMoreBtn = content.offsetHeight < content.scrollHeight;
    });

    function toggle() {
        showAll = !showAll;
    }
</script>

<div class="post">
    {#await senderPhoto then photo}
        <img src={photo} width="48" height="48" class="profile-image" alt={senderName}>
    {/await}

    <div class="main">

        <div class="header">
            <p class="name">{senderName}</p>
            <div class="dates">
                <p class="from-now">{dateFromNow}</p>
                <p class="sent">{dateSent}</p>
            </div>
        </div>

        <div class="content" bind:this={content} class:showAll>
            {#if title !== undefined}
                <h3 class="title">{title}</h3>
            {/if}
            {#if subject !== undefined}
                <h6 class="subject">{subject}</h6>
            {/if}

            <slot></slot>
        </div>

        {#if showMoreBtn}
            <button class="showMoreBtn" on:click={toggle}>
                {#if !showAll}
                    Expand
                {:else}
                    Hide
                {/if}
            </button>
        {/if}

        {#if files !== undefined}
            <div class="files">
                {#each files as file}
                    <a class="file" href={file.fileInfo.fileUrl} target="_blank">{file.fileName}</a>
                {/each}
            </div>
        {/if}

        {#if comments.length !== 0}
            <details class="comments">
                <summary>
                    {#if comments.length === 1}
                        1 reply
                    {:else}
                        {comments.length} replies
                    {/if}
                </summary>
                {#each comments
                    .sort((a, b) => moment(a.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS).diff(moment(b.composetime, moment.HTML5_FMT.DATETIME_LOCAL_MS)))
                        as comment (comment.id)}

                    <Comment message={comment} networkManager={networkManager}>
                        <Content content={comment.content} networkManager={networkManager}></Content>
                    </Comment>
                {/each}
            </details>
        {/if}
    </div>
</div>

<style lang="scss">
  .post {
    display: grid;
    grid-template-columns: 48px auto;
    column-gap: 5px;
    padding: 2px;
    margin-left: 10px;
    margin-right: 10px;
    word-break: break-all;
    margin-bottom: 5px;

    .profile-image {
      grid-column: 1;
      grid-row: 1;
      pointer-events: none;
      border-radius: 5px;
    }

    .main {
      grid-column: 2;
      grid-row: 1;
      padding: 5px;
      background-color: white;
      border-radius: 5px;

      .header {

        display: flex;
        flex-direction: row;
        border-bottom: black 2px solid;
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
        max-height: 20vh;
        overflow: hidden;

        .title {
          font-size: x-large;
          margin-block: 10px;
        }

        .subject {
          font-size: large;
          margin-block: 10px;
        }
      }

      .content.showAll {
        max-height: none;
      }

      .showMoreBtn {
        display: block;
        width: 100%;
      }

      .files {
        margin-top: 20px;
        margin-bottom: 5px;
        padding: 5px;
        width: fit-content;

        .file {
          border: blue 2px dashed;
          padding: 5px;
          text-decoration: none;
        }
      }

      .comments {
        grid-column: 2;
        grid-row: 2;

        padding: 5px;
        border-top: black solid;
      }

    }
  }
</style>
