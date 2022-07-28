/**
 * Gets a cookie
 * @param name cookie name
 */
export function getCookie(name) {
    let cname = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
        }
    }
    return "";
}

/**
 * Checks if a cookie exists
 * @param name cookie name
 */
export function hasCookie(name) {
    return getCookie(name) !== "";
}

/**
 * Sets a cookie
 * @param name cookie name
 * @param value cookie value
 */
export function setCookie(name, value) {
    document.cookie = `${name}=${value}`;
}

/**
 * Modifies the url to either be for debug or production depending on the current mode
 * @param url url to modify
 */
export function urlMode(url) {
    let baseURL = localStorage.getItem("base-url");
    return baseURL === null ? url : baseURL + url;
}

/**
 * Modifies an ID to be valid css
 * @param id id
 */
export function cssValidID(id) {
    return id.replaceAll(':', '-').replaceAll('@', '-').replaceAll('.', '-').replaceAll(';', '-').replaceAll('=', '-').replaceAll('/', '-');
}

/**
 * Groups a list by a key in each object
 * @param list list to group
 * @param key key to group by
 */
export function groupByKey(list, key) {
    return list.reduce((hash, obj) => ({...hash, [obj[key]]:( hash[obj[key]] || [] ).concat(obj)}), {})
}

export const delay = ms => new Promise(res => setTimeout(res, ms));
