import {Post} from "../Post";
// @ts-ignore
import moment = require("moment");
import {HTML} from "./richText/HTML";

export class Text extends Post {
    render(info: object, comments?: HTMLElement): HTMLElement {
        return new HTML().render(info, comments);
    }
}
