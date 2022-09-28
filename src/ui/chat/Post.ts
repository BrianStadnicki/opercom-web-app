export class Post {
    populate(id: string,
             senderName: string,
             senderPhoto: Promise<string>,
             dateFromNow: string,
             dateSent: string,
             title: string,
             subject: string,
             contentElement: HTMLElement,
             files?: object[],
             comments?: HTMLElement): HTMLElement {

        let postElement = document.createElement('div');
        postElement.id = id;
        postElement.classList.add('post');
        postElement.style.wordBreak = "break-all";
        postElement.innerHTML = `
            <img src="" width="64" height="64" class="profile-image" alt="${senderName}">
            
            <div class="main">
            
                <div class="header">
                    <p class="name">${senderName}</p>
                    <div class="dates">
                        <p class="from-now">${dateFromNow}</p>
                        <p class="sent">${dateSent}</p>
                    </div>
                </div>
                
                <div class="content">
                    ${title}
                    ${subject}
                    <div class="main-content-placeholder">Placeholder</div>
                </div>
                
                ${files === undefined ? '' :`
                    <div class="files">
                        ${
                            files.map(file => `
                                <a class="file" href="${file['objectUrl']}" target="_blank">${file['title']}</a>
                            `).join('')
                        }
                    </div>
                `}
                
            </div>
            
            <div class="comments"></div>
        `;

        postElement.getElementsByClassName("content").item(0).replaceChild(contentElement,
            postElement.getElementsByClassName("main-content-placeholder").item(0));

        senderPhoto.then(photo => {
            (<HTMLImageElement>postElement.getElementsByClassName("profile-image").item(0)).src = photo;
        })

        if (comments !== undefined) {
            postElement.replaceChild(comments, postElement.getElementsByClassName("comments").item(0));
        } else {
            postElement.removeChild(postElement.getElementsByClassName("comments").item(0));
        }

        return postElement;
    }
}
