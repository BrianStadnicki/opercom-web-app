<script lang="ts">
    import {onMount} from "svelte";
    import {NetworkManager} from "../NetworkManager";

    export let content: string;
    export let networkManager: NetworkManager;

    let contentElement;

    onMount(() => {
        contentElement.innerHTML = content;

        // remove redundant <div> from post content
        if (contentElement.childNodes.length === 1) {
            let current = contentElement.childNodes.item(0);
            while (current.childNodes !== undefined && current.childNodes.length === 1 && current.childNodes.item(0)["tagName"] === "DIV") {
                current = current.childNodes.item(0);
            }
            if (current["innerHTML"] !== undefined) {
                contentElement.innerHTML = current["innerHTML"];
            } else {
                contentElement.innerHTML = current.nodeValue;
            }
        }

        // setup images
        contentElement.querySelectorAll('img[itemtype="http://schema.skype.com/AMSImage"]').forEach(img => {
            let object = (<HTMLImageElement>img).src.substring((<HTMLImageElement>img).src.indexOf("/objects/") + "/object /".length, (<HTMLImageElement>img).src.indexOf("/views/"));
            (<HTMLImageElement>img).src = "";
            (<HTMLImageElement>img).style.maxWidth = "80%";
            (<HTMLImageElement>img).style.maxHeight = "25vh";
            (<HTMLImageElement>img).style.objectFit = "scale-down";
            (<HTMLImageElement>img).removeAttribute('height');
            (<HTMLImageElement>img).removeAttribute('width');

            networkManager.getImgo(object).then(b64 => {
                let url = `data:image/jpeg;base64,${b64}`;
                (<HTMLImageElement>img).src = url;
                // TODO: add enlarging images
                /*
                img.addEventListener('click', function () {
                    (<HTMLImageElement>document.getElementById('enlarged-image')).src = url;
                    document.getElementById('enlarged-image-modal').style.display = "flex";
                });

                 */
            })
        });

        // style mentions
        contentElement.querySelectorAll('span[itemtype="http://schema.skype.com/Mention"]').forEach(tag => {
            tag.textContent = "@" + tag.textContent;
            tag.classList.add("post-text-content-mention");
        });

        return contentElement;
    });

</script>

<div class="content" bind:this={contentElement}>

</div>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    word-break: break-word;
    box-sizing: border-box;

    div {
      margin-top: 0;
      margin-bottom: 0;
      padding-top: 0;
      padding-bottom: 0;
    }

    p {
      margin-block: 0;
    }

    .post-text-content-mention {
      display: contents;
      width: fit-content;
      color: $colour-3;
      background-color: $colour-2;
      border-radius: 5px;
      font-weight: bolder;
    }

    ul {
      padding-top: 0;
      padding-bottom: 0;
      list-style-type: disc;
    }

    li {
      display: list-item;
      padding-top: 0;
      padding-bottom: 0;
      vertical-align: top;
      word-break: initial;
      white-space: initial;

      ul {
        margin-top: 1.5em;
        margin-bottom: 0;
      }
    }
  }
</style>
