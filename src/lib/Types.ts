export interface DataSideTeam {
    id: string,
    name: string,
    pictureETag: string,
    isFavorite: boolean,
    isCollapsed: boolean,
    isDeleted: boolean,
    isArchived: boolean
    channels: DataSideTeamChannel[]
}

export interface DataSideTeamChannel {
    id: string,
    name: string,
    isGeneral: boolean,
    isFavorite: boolean,
    isDeleted: boolean,
    isPinned: boolean,
    isArchived: boolean
}

export interface DataChannel {
    _metadata: {
        syncState: string,
        lastCompleteSegmentStartTime: number,
        lastCompleteSegmentEndTime: number,
        backwardLink: string
    },
    messages: DataMessage[],
    tenantId: string
}

export interface DataMessage {
    clientmessageid?: string,
    composetime: string,
    content: string,
    contenttype?: string,
    conversationLink: string,
    conversationid: string,
    draftDetails: object,
    from: string,
    fromTenantId: string,
    id: string,
    imdisplayname?: string,
    messagetype: string,
    originalarrivaltime: string,
    properties: {
        cards?: string,
        subject?: string,
        title?: string,
        files?: string,
        deletetime?: number,
        activity?: {
            activityType: string,
            sourceThreadId: string,
            sourceMessageId: string,
            sourceUserId: string,
            sourceUserImDisplayName: string,
            messagePreview: string,
            sourceThreadTopic: string
        }
    }
    sequenceId: number,
    type: string,
    version: string,
}

export interface DataFile {
    "@type": string,
    baseUrl: string,
    botFileProperties: object,
    fileChicletState: {
        serviceName: string,
        state: string
    },
    fileInfo: {
        fileUrl: string,
        serverRelativeUrl: string,
        siteUrl: string,
    },
    fileName: string,
    filePreview: object,
    fileType: string,
    id: string,
    itemid: string,
    objectUrl: string,
    providerData: string,
    sourceOfFile: number,
    state: string,
    title: string,
    type: string
}

export interface DataApp {
    id: string,
    name: string,
    smallImageUrl: string,
    largeImageUrl: string
}
