import type {DataChannel} from "./Types";
import type {Writable} from "svelte/store";
import {get, writable} from "svelte/store";
import type {NetworkManager} from "./NetworkManager";

export class DataManager {

    private networkManager: NetworkManager;

    private channels: Map<string, Writable<DataChannel>>;

    constructor(networkManager: NetworkManager) {
        this.networkManager = networkManager;
        this.channels = new Map<string, Writable<DataChannel>>();
    }

    async getChannel(id: string): Promise<Writable<DataChannel>> {
        if (this.channels.has(id)) {
            return this.channels.get(id);

        } else {
            let rawChannelData: string = localStorage.getItem(`channel-${id}`);
            let channelData: DataChannel;

            if (rawChannelData !== null) {
                channelData = JSON.parse(rawChannelData);
            } else {
                channelData = await this.networkManager.getConversation(id, 20, 0);
            }

            let channel = writable(channelData);
            channel.subscribe(data => {
                localStorage.setItem(`channel-${id}`, JSON.stringify(data));
            })
            this.channels.set(id, channel);

            return channel;
        }
    }

    async fetchMoreMessages(id: string): Promise<boolean> {
        return this.getChannel(id).then(channelStore => {
            let channelData = get(channelStore);
            let params = new URL(channelData._metadata.backwardLink).searchParams;
            return this.networkManager.getConversation(id, 20, params.get("startTime"), params.get("syncState"))
                .then(data => {
                    data.messages = data.messages.filter(message => !channelData.messages.some(message2 => message2.id === message.id))
                    channelData._metadata = data._metadata;
                    channelData.messages = [...channelData.messages, ...data.messages];
                    channelStore.update(data => channelData);
                    return data.messages.length !== 0;
                });
        })
    }

}
