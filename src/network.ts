import {urlMode} from "./utils";

/**
 * Checks if the skype token is valid
 */
export async function networkAuthSkypeToken() {
    return await fetch(urlMode('/auth/skypetoken.php'), {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        }
    })
        .then((res) => res.status);
}

/**
 * Gets a user's properties
 * @param email user's email
 * @return {
 *     "user-id": string,
 *     "user-name": string,
 *     "is-private-chat-enabled": boolean
 * }
 */
export async function networkGetUserProperties(email) {
    return await fetch(urlMode(`/users/info.php?user=${encodeURIComponent(email)}&throwIfNotFound=false&isMailAddress=false&enableGuest=true&includeIBBarredUsers=true&skypeTeamsInfo=true`), {
            "headers": {
                "bearer-token": localStorage.getItem("auth-token"),
                "skype-token": localStorage.getItem("skype-token"),
                "email": localStorage.getItem("email")
            },
            "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets a user's profile picture
 * @param user user's id
 * @param size profile picture size
 * @return base64-encoded image
 */
export async function networkGetUserProfilePicture(user, size) {
    return await fetch(urlMode(`/users/profilepicture.php?user=${user}&size=${size}`), {
        "headers": {
            "bearer-token": localStorage.getItem("auth-token"),
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.blob());
}

/**
 * Gets the user's teams and channels
 */
export async function networkGetTeamsList() {
    return await fetch(urlMode('/teams/list.php'), {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets a conversation
 * @param thread thread
 * @param messages number of messages to fetch
 * @param startTime start time
 */
export async function networkGetConversation(thread, messages, startTime) {
    return await fetch(urlMode(`/teams/conversation.php?thread=${encodeURIComponent(thread)}&pageSize=${messages}&startTime=${startTime}`), {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.json());
}

/**
 * Gets a image object
 * @param object image object id
 */
export async function networkGetImgo(object) {
    return await fetch(urlMode(`/assets/imgo.php?id=${object}&v=1`), {
        "headers": {
            "skype-token": localStorage.getItem("skype-token")
        },
        "method": "GET"
    })
        .then(res => res.blob());
}
