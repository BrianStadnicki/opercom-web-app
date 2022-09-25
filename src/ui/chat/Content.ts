import {networkGetImgo} from "../../network";

export function createContentElement(content: string): HTMLDivElement {
    let contentElement = document.createElement('div');
    contentElement.classList.add("post-text-content");
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

        networkGetImgo(object).then(b64 => {
            let url = `data:image/jpeg;base64,${b64}`;
            (<HTMLImageElement>img).src = url;

            img.addEventListener('click', function () {
                (<HTMLImageElement>document.getElementById('enlarged-image')).src = url;
                document.getElementById('enlarged-image-modal').style.display = "flex";
            });
        })
    });

    // style mentions
    contentElement.querySelectorAll('span[itemtype="http://schema.skype.com/Mention"]').forEach(tag => {
        tag.textContent = "@" + tag.textContent;
        tag.classList.add("post-text-content-mention");
    });

    return contentElement;
}
